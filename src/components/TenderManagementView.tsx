import React, { useState, useMemo } from 'react';
import { 
  Tender, TenderGoNoGo, TenderCorrigendum, TenderQuery, ContractRecord, 
  ClientEscalation, EmdRecord, PbgRecord, AppState, Role 
} from '../types';
import { 
  FileText, CheckCircle2, AlertTriangle, Clock, Plus, Search, Filter, 
  Layers, ShieldAlert, ArrowRight, Upload, ExternalLink, UserCheck, 
  FileSpreadsheet, MessageSquare, Briefcase, RefreshCw, X, Eye, 
  TrendingUp, Calendar, AlertOctagon, Check, Send, Sparkles
} from 'lucide-react';
import { saveEntityToFirestore } from '../lib/firebaseService';

interface TenderManagementViewProps {
  state: AppState;
  currentRole: Role;
  userEmail: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const TenderManagementView: React.FC<TenderManagementViewProps> = ({
  state,
  currentRole,
  userEmail,
  onUpdateState
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'gonogo' | 'corrigendums' | 'queries' | 'contracts' | 'escalations' | 'emdpbg'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  // Modals
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);
  const [showGoNoGoModal, setShowGoNoGoModal] = useState(false);
  const [showCorrigendumModal, setShowCorrigendumModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);

  // New Tender Form State
  const [newTender, setNewTender] = useState<Partial<Tender>>({
    tender_name: '',
    client_name: '',
    tender_ref_no: '',
    tendering_authority: '',
    tender_value: 0,
    emd_amount: 0,
    tender_fee: 0,
    tender_type: 'Open',
    location: 'Bengaluru',
    scope_of_work: '',
    publication_date: new Date().toISOString().split('T')[0],
    submission_deadline: '',
    bid_opening_date: '',
    status: 'Identified',
    tender_owner: userEmail || 'Procurement GM',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Vikram Singh',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma'
  });

  // New Go/No-Go Form State
  const [newGNG, setNewGNG] = useState<{
    tender_id: string;
    department: 'HR' | 'Finance' | 'Operations';
    verdict: 'GO' | 'NO-GO' | 'CONDITIONAL GO';
    remarks: string;
    checklistNotes: string;
  }>({
    tender_id: state.tenders?.[0]?.id || '',
    department: 'Operations',
    verdict: 'GO',
    remarks: '',
    checklistNotes: ''
  });

  // Filtered Tenders
  const filteredTenders = useMemo(() => {
    return (state.tenders || []).filter(t => {
      const matchesSearch = 
        t.tender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tender_ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.tenders, searchTerm, statusFilter]);

  // Handle Add Tender
  const handleSaveTender = () => {
    if (!newTender.tender_name || !newTender.client_name) {
      alert('Please fill in tender name and client name.');
      return;
    }

    const tenderId = `TND/${new Date().getFullYear()}/${String((state.tenders || []).length + 1).padStart(3, '0')}`;
    const created: Tender = {
      id: tenderId,
      tender_name: newTender.tender_name!,
      client_name: newTender.client_name!,
      tender_ref_no: newTender.tender_ref_no || `REF-${Date.now().toString().slice(-6)}`,
      tendering_authority: newTender.tendering_authority || 'Procurement Committee',
      tender_value: Number(newTender.tender_value) || 0,
      emd_amount: Number(newTender.emd_amount) || 0,
      tender_fee: Number(newTender.tender_fee) || 0,
      tender_type: newTender.tender_type || 'Open',
      location: newTender.location || 'Bengaluru',
      scope_of_work: newTender.scope_of_work || '',
      publication_date: newTender.publication_date || new Date().toISOString().split('T')[0],
      submission_deadline: newTender.submission_deadline || '',
      bid_opening_date: newTender.bid_opening_date || '',
      status: newTender.status || 'Identified',
      tender_owner: newTender.tender_owner || userEmail,
      procurement_exec: newTender.procurement_exec || 'Deepika Nair',
      operations_spoc: newTender.operations_spoc || 'Vikram Singh',
      finance_spoc: newTender.finance_spoc || 'Neha Gupta',
      hr_spoc: newTender.hr_spoc || 'Aarav Sharma',
      gm_approval: 'Pending',
      ceo_approval: 'Pending',
      created_at: new Date().toISOString(),
      documents: []
    };

    onUpdateState(prev => ({
      ...prev,
      tenders: [created, ...(prev.tenders || [])]
    }));

    saveEntityToFirestore('tenders', created.id, created);
    setShowAddTenderModal(false);
  };

  // Handle Status Change
  const handleUpdateTenderStatus = (tenderId: string, nextStatus: Tender['status']) => {
    onUpdateState(prev => {
      const updated = (prev.tenders || []).map(t => {
        if (t.id === tenderId) {
          const tUpdated = { ...t, status: nextStatus };
          saveEntityToFirestore('tenders', t.id, tUpdated);
          return tUpdated;
        }
        return t;
      });
      return { ...prev, tenders: updated };
    });
  };

  // Handle GM / CEO Approval
  const handleApproval = (tenderId: string, type: 'gm' | 'ceo') => {
    onUpdateState(prev => {
      const updated = (prev.tenders || []).map(t => {
        if (t.id === tenderId) {
          const tUpdated = { 
            ...t, 
            ...(type === 'gm' ? { gm_approval: 'Approved' as const } : { ceo_approval: 'Approved' as const })
          };
          saveEntityToFirestore('tenders', t.id, tUpdated);
          return tUpdated;
        }
        return t;
      });
      return { ...prev, tenders: updated };
    });
  };

  // Submit Go/No-Go Verdict
  const handleSaveGoNoGo = () => {
    if (!newGNG.tender_id || !newGNG.remarks) {
      alert('Please provide remarks for Go/No-Go clearance.');
      return;
    }

    const gngRecord: TenderGoNoGo = {
      id: `GNG-${Date.now().toString().slice(-6)}`,
      tender_id: newGNG.tender_id,
      department: newGNG.department,
      verdict: newGNG.verdict,
      evaluator_name: userEmail || `${newGNG.department} Lead`,
      evaluation_date: new Date().toISOString().split('T')[0],
      remarks: newGNG.remarks,
      checklist: {
        'Criteria Evaluated': true,
        'Specific Notes': newGNG.checklistNotes || 'Standard checklist cleared'
      },
      digital_approval_ref: `${newGNG.department}-DIGI-${Date.now().toString().slice(-4)}`
    };

    onUpdateState(prev => ({
      ...prev,
      tenderGoNoGos: [gngRecord, ...(prev.tenderGoNoGos || [])]
    }));

    saveEntityToFirestore('tenderGoNoGos', gngRecord.id, gngRecord);
    setShowGoNoGoModal(false);
  };

  return (
    <div id="tender-management-root" className="space-y-6 bg-sky-50/60 border border-sky-200/80 p-6 rounded-3xl shadow-sm">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white p-6 rounded-2xl shadow-lg border border-sky-400/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-200" /> Tender Lifecycle Cockpit
            </span>
            <span className="text-xs text-sky-100 font-mono">Total Bids: {(state.tenders || []).length}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tender &amp; Bid Management</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">
            End-to-end tracking from RFP opportunity identification, inter-departmental Go/No-Go clearances, corrigendum audits, pre-bid queries, to contract execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-tender"
            onClick={() => setShowAddTenderModal(true)}
            className="px-4 py-2 bg-white hover:bg-sky-50 text-sky-800 text-sm font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-700" /> Add New Tender
          </button>
          <button
            id="btn-add-gonogo"
            onClick={() => setShowGoNoGoModal(true)}
            className="px-3.5 py-2 bg-sky-800 hover:bg-sky-900 text-sky-100 text-sm font-medium rounded-xl border border-sky-400/40 transition flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-sky-300" /> Clear Go/No-Go
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'pipeline', label: 'Tender Pipeline & Bids', count: (state.tenders || []).length, icon: Layers },
          { id: 'gonogo', label: 'Go / No-Go Clearances', count: (state.tenderGoNoGos || []).length, icon: UserCheck },
          { id: 'corrigendums', label: 'Corrigendums', count: (state.tenderCorrigendums || []).length, icon: AlertTriangle },
          { id: 'queries', label: 'Pre-Bid Queries', count: (state.tenderQueries || []).length, icon: MessageSquare },
          { id: 'contracts', label: 'Contracts & Renewals', count: (state.contracts || []).length, icon: Briefcase },
          { id: 'escalations', label: 'Client Escalations', count: (state.clientEscalations || []).filter(e => e.status !== 'Resolved').length, icon: ShieldAlert },
          { id: 'emdpbg', label: 'EMD & PBG Guarantees', count: (state.pbgGuarantees || []).length + (state.emdRefunds || []).length, icon: FileSpreadsheet }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-tender-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                isActive 
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-200' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: TENDER PIPELINE */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-search-tenders"
                type="text"
                placeholder="Search tender name, client, authority, ref no..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Status:</span>
              <select
                id="select-tender-status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Stages ({state.tenders?.length || 0})</option>
                <option value="Identified">Identified</option>
                <option value="Go/No-Go Review">Go/No-Go Review</option>
                <option value="Management Approval">Management Approval</option>
                <option value="Technical Evaluation">Technical Evaluation</option>
                <option value="L1 Position">L1 Position</option>
                <option value="Work Order Received">Work Order Received</option>
                <option value="Under Execution">Under Execution</option>
              </select>
            </div>
          </div>

          {/* Tender Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTenders.map(t => {
              const isDueSoon = t.submission_deadline && (new Date(t.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3;
              const hasCorrigendum = (state.tenderCorrigendums || []).some(c => c.tender_id === t.id && !c.reviewed_by_gm);
              const gngRecords = (state.tenderGoNoGos || []).filter(g => g.tender_id === t.id);

              return (
                <div 
                  key={t.id} 
                  id={`tender-card-${t.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: ID, Status, Value */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{t.tender_type} Tender</span>
                          {hasCorrigendum && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-md animate-pulse">
                              Corrigendum Unreviewed!
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{t.tender_name}</h3>
                        <p className="text-xs text-slate-600 font-medium">{t.client_name} ({t.tendering_authority})</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Est. Value</span>
                        <span className="text-lg font-bold text-slate-900">
                          ₹{(t.tender_value / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                    </div>

                    {/* Scope & Details */}
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {t.scope_of_work || 'Scope of work details logged in tender requisition.'}
                    </p>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">EMD Required</span>
                        <span className="font-semibold text-slate-800">₹{(t.emd_amount / 100000).toFixed(2)} Lakh</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Submission Deadline</span>
                        <span className={`font-semibold flex items-center gap-1 ${isDueSoon ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                          <Clock className="w-3 h-3" /> {t.submission_deadline || 'TBD'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tender Owner</span>
                        <span className="font-semibold text-slate-800 truncate block">{t.tender_owner}</span>
                      </div>
                    </div>

                    {/* Department SPOCs & Approvals */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <span title="HR SPOC">👤 HR: <b>{t.hr_spoc.split(' ')[0]}</b></span>
                        <span title="Finance SPOC">💰 Fin: <b>{t.finance_spoc.split(' ')[0]}</b></span>
                        <span title="Ops SPOC">⚙️ Ops: <b>{t.operations_spoc.split(' ')[0]}</b></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.gm_approval === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          GM: {t.gm_approval}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.ceo_approval === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          CEO: {t.ceo_approval}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-900 text-cyan-100 border border-cyan-700/50">
                        {t.status}
                      </span>
                      {gngRecords.length > 0 && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> {gngRecords.length}/3 Go/No-Go cleared
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {t.gm_approval !== 'Approved' && (
                        <button
                          onClick={() => handleApproval(t.id, 'gm')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Approve GM
                        </button>
                      )}
                      {t.status === 'Management Approval' && (
                        <button
                          onClick={() => handleUpdateTenderStatus(t.id, 'Bid Submitted')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Mark Bid Submitted
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTender(t)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GO / NO-GO CLEARANCES */}
      {activeSubTab === 'gonogo' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Inter-Departmental Go / No-Go Clearances</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mandatory triple-clearance workflow required before finalizing any RFP bid calculation: HR (Manpower & Wages), Finance (EMD/PBG & EBITDA), Operations (Machinery & Mobilization).
              </p>
            </div>
            <button
              onClick={() => setShowGoNoGoModal(true)}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Department Clearance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(state.tenderGoNoGos || []).map(gng => {
              const tender = (state.tenders || []).find(t => t.id === gng.tender_id);
              return (
                <div key={gng.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {gng.department} Clearance
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      gng.verdict === 'GO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      gng.verdict === 'CONDITIONAL GO' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {gng.verdict}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block">{gng.tender_id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{tender?.tender_name || 'Tender Proposal'}</h4>
                    <p className="text-xs text-slate-500">{tender?.client_name}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-700">Evaluator Assessment:</div>
                    <p className="text-slate-600">{gng.remarks}</p>
                    {Object.entries(gng.checklist || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1">
                        <span>{key}:</span>
                        <span className="font-medium text-slate-700">{String(val)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Evaluated by: <b>{gng.evaluator_name}</b></span>
                    <span className="font-mono text-[10px] text-slate-400">{gng.digital_approval_ref}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CORRIGENDUMS */}
      {activeSubTab === 'corrigendums' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Corrigendum & Amendment Control</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated tracking for tender amendments, deadline extensions, and BOQ revisions. Ensures GM reviews any revised scope before bid dispatch.
            </p>
          </div>

          <div className="space-y-3">
            {(state.tenderCorrigendums || []).map(cor => {
              const tender = (state.tenders || []).find(t => t.id === cor.tender_id);
              return (
                <div key={cor.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                        {cor.corrigendum_no}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{cor.tender_id} - {tender?.tender_name}</span>
                      <span className="text-xs text-slate-400">• Issued: {cor.issue_date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{cor.description}</h4>
                    <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                      <b>Changes Impact:</b> {cor.changes_made}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                      {cor.revised_submission_date && <span>📅 Revised Due Date: <b>{cor.revised_submission_date}</b></span>}
                      {cor.revised_emd && <span>💰 Revised EMD: <b>₹{(cor.revised_emd / 100000).toFixed(2)}L</b></span>}
                      <span>👤 Action Owner: <b>{cor.responsible_person}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cor.reviewed_by_gm ? (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Reviewed by GM
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onUpdateState(prev => ({
                            ...prev,
                            tenderCorrigendums: (prev.tenderCorrigendums || []).map(c => 
                              c.id === cor.id ? { ...c, reviewed_by_gm: true } : c
                            )
                          }));
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        Sign GM Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRE-BID QUERIES */}
      {activeSubTab === 'queries' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Client Pre-Bid Queries & Communications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Logs all official clarification letters submitted to clients with mandatory response deadlines and attached PDF acknowledgments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.tenderQueries || []).map(q => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {q.communication_type}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    q.status === 'Responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{q.subject}</h4>
                  <p className="text-xs text-slate-500">{q.client_name} • Ref: {q.tender_id}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900 mb-1">Clarification Query:</span>
                  {q.query_text}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Assigned: <b>{q.responsible_employee}</b></span>
                  <span>Due: <b>{q.due_date}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CONTRACTS & RENEWALS */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Contract Execution & Renewal Register</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time monitoring of live work orders, agreement validity, 90/60/30-day renewal notices, PBG linkings, and price escalation clauses.
            </p>
          </div>

          <div className="space-y-3">
            {(state.contracts || []).map(ctr => {
              const daysLeft = ctr.expiry_date ? Math.ceil((new Date(ctr.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 999;
              return (
                <div key={ctr.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{ctr.id}</span>
                      <span className="text-xs text-slate-400">• WO No: {ctr.work_order_no}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        daysLeft <= 30 ? 'bg-rose-100 text-rose-800' :
                        daysLeft <= 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {daysLeft <= 0 ? 'Expired' : `Expires in ${daysLeft} days`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{ctr.contract_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">Client: {ctr.client_name} (SPOC: {ctr.client_spoc})</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Annual Value</span>
                        <span className="font-bold text-slate-900">₹{(ctr.contract_value / 10000000).toFixed(2)} Cr</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Commencement</span>
                        <span className="font-medium text-slate-700">{ctr.commencement_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Renewal Terms</span>
                        <span className="font-medium text-slate-700 truncate block">{ctr.renewal_terms}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">PBG Bank</span>
                        <span className="font-medium text-slate-700">{ctr.pbg_bank || 'SBI'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => {
                        alert(`Initiating renewal letter draft for ${ctr.contract_name}...`);
                      }}
                      className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Issue Renewal Letter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CLIENT ESCALATIONS */}
      {activeSubTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Client Escalations & Corrective Action Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks client-reported service disruptions, SLA warnings, root-cause corrective actions, and GM/CEO closure notes.
              </p>
            </div>
            <button
              onClick={() => setShowEscalationModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Log Client Escalation
            </button>
          </div>

          <div className="space-y-3">
            {(state.clientEscalations || []).map(esc => (
              <div key={esc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                      esc.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      esc.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {esc.severity} Escalation
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{esc.client_name}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    esc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {esc.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{esc.nature_of_escalation}</h4>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-700">
                  <span className="font-semibold block text-slate-900">Corrective Action Implemented:</span>
                  <p>{esc.corrective_action}</p>
                </div>

                {esc.ceo_gm_remarks && (
                  <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 text-xs text-rose-800">
                    <b>Management Directive:</b> {esc.ceo_gm_remarks}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Assigned: <b>{esc.responsible_person} ({esc.responsible_dept})</b></span>
                  <span>Target Closure: <b>{esc.target_closure_date}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: EMD & PBG GUARANTEES */}
      {activeSubTab === 'emdpbg' && (
        <div className="space-y-6">
          {/* PBG Section */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> Performance Bank Guarantees (PBG) Register
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(state.pbgGuarantees || []).map(pbg => (
                <div key={pbg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{pbg.bg_number}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      pbg.status === 'Expiring Soon' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pbg.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{pbg.client_name}</h4>
                    <p className="text-xs text-slate-500">Bank: {pbg.issuing_bank}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">BG Amount:</span>
                      <span className="font-bold text-slate-900">₹{(pbg.amount / 100000).toFixed(2)} Lakh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expiry Date:</span>
                      <span className="font-semibold text-rose-600">{pbg.expiry_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMD Section */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Earnest Money Deposit (EMD) Refunds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(state.emdRefunds || []).map(emd => (
                <div key={emd.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{emd.mode}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      emd.status === 'Refunded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {emd.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{emd.tender_name}</h4>
                    <p className="text-xs text-slate-500">{emd.client_name}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">EMD Value:</span>
                      <span className="font-bold text-slate-900">₹{(emd.amount / 100000).toFixed(2)} Lakh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Refund Due Date:</span>
                      <span className="font-semibold text-slate-800">{emd.refund_due_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW TENDER */}
      {showAddTenderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Tender Record</h3>
              <button onClick={() => setShowAddTenderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Tender Title / Name *</label>
                <input
                  type="text"
                  value={newTender.tender_name}
                  onChange={e => setNewTender({ ...newTender, tender_name: e.target.value })}
                  placeholder="e.g. Metro Rail Phase 2 Integrated Soft Services"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Name *</label>
                <input
                  type="text"
                  value={newTender.client_name}
                  onChange={e => setNewTender({ ...newTender, client_name: e.target.value })}
                  placeholder="e.g. Bangalore Metro Rail Corp"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tender Reference No.</label>
                <input
                  type="text"
                  value={newTender.tender_ref_no}
                  onChange={e => setNewTender({ ...newTender, tender_ref_no: e.target.value })}
                  placeholder="e.g. BMRCL/O&M/2026/099"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimated Tender Value (₹)</label>
                <input
                  type="number"
                  value={newTender.tender_value || ''}
                  onChange={e => setNewTender({ ...newTender, tender_value: Number(e.target.value) })}
                  placeholder="e.g. 45000000"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">EMD Amount (₹)</label>
                <input
                  type="number"
                  value={newTender.emd_amount || ''}
                  onChange={e => setNewTender({ ...newTender, emd_amount: Number(e.target.value) })}
                  placeholder="e.g. 900000"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={newTender.submission_deadline}
                  onChange={e => setNewTender({ ...newTender, submission_deadline: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tender Type</label>
                <select
                  value={newTender.tender_type}
                  onChange={e => setNewTender({ ...newTender, tender_type: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Limited">Limited</option>
                  <option value="Single">Single</option>
                  <option value="Global">Global</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Scope of Work Summary</label>
                <textarea
                  rows={2}
                  value={newTender.scope_of_work}
                  onChange={e => setNewTender({ ...newTender, scope_of_work: e.target.value })}
                  placeholder="Brief description of manpower, equipment, and SLA deliverables..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddTenderModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTender}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Create Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT GO/NO-GO CLEARANCE */}
      {showGoNoGoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Inter-Department Go / No-Go Clearance</h3>
              <button onClick={() => setShowGoNoGoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Tender</label>
                <select
                  value={newGNG.tender_id}
                  onChange={e => setNewGNG({ ...newGNG, tender_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  {(state.tenders || []).map(t => (
                    <option key={t.id} value={t.id}>{t.id} - {t.tender_name} ({t.client_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newGNG.department}
                    onChange={e => setNewGNG({ ...newGNG, department: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Verdict</label>
                  <select
                    value={newGNG.verdict}
                    onChange={e => setNewGNG({ ...newGNG, verdict: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="GO">GO (Cleared)</option>
                    <option value="CONDITIONAL GO">CONDITIONAL GO</option>
                    <option value="NO-GO">NO-GO (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clearance Remarks & Feasibility Notes</label>
                <textarea
                  rows={3}
                  value={newGNG.remarks}
                  onChange={e => setNewGNG({ ...newGNG, remarks: e.target.value })}
                  placeholder="Detail manpower availability, machinery requirements, EBITDA profitability or cash buffer..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowGoNoGoModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoNoGo}
                className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Clearance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
