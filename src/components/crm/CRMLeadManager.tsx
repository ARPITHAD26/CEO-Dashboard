import React, { useState } from 'react';
import {
  CRMLead, CRMLeadStage, CRMRequirement, CRMFollowUp, CRMActivity, CRMClientVisit,
  CRMMeeting, CRMQuotation, AppState
} from '../../types';
import {
  Plus, Search, Phone, Mail, MessageSquare,
  Clock, MapPin, Eye, Edit2, X, Trash2, Layers, CheckCircle2
} from 'lucide-react';

export const CRM_STAGES: { stage: CRMLeadStage; label: string; prob: number; desc: string }[] = [
  { stage: 'New Lead', label: 'New Lead', prob: 20, desc: 'Initial inquiry & lead discovery' },
  { stage: 'Contacted', label: 'Contacted', prob: 30, desc: 'Introductory outreach completed' },
  { stage: 'Requirement Received', label: 'Requirement Received', prob: 40, desc: 'Headcount requisition logged' },
  { stage: 'Meeting / Visit Scheduled', label: 'Meeting / Visit', prob: 50, desc: 'Site audit & meeting aligned' },
  { stage: 'Proposal Submitted', label: 'Proposal Submitted', prob: 60, desc: 'Solution proposal delivered' },
  { stage: 'Quotation Sent', label: 'Quotation Sent', prob: 70, desc: 'Commercial proposal dispatched' },
  { stage: 'Negotiation', label: 'Negotiation', prob: 80, desc: 'Pricing & SLA finalization' },
  { stage: 'Won / Converted', label: 'Won / Converted', prob: 100, desc: 'Contract finalized & LOI received' },
  { stage: 'Client Onboarding', label: 'Client Onboarding', prob: 100, desc: 'Signing & deployment handover' },
  { stage: 'Lost', label: 'Lost', prob: 0, desc: 'Opportunity dropped or closed' }
];

interface Props {
  state: AppState;
  onUpdateLead: (lead: CRMLead) => void;
  onAddLead: (lead: CRMLead) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLeadNextAction?: (leadId: string, nextAction: string, nextDate: string) => void;
  onAddActivityLog?: (leadId: string, activity: any) => void;
  selectedLeadFor360?: CRMLead | null;
  onClose360?: () => void;
  onSelectLeadFor360?: (lead: CRMLead) => void;
  onAddActivity?: (activity: CRMActivity) => void;
  onAddFollowUp?: (followUp: CRMFollowUp) => void;
}

export const CRMLeadManager: React.FC<Props> = ({
  state,
  onUpdateLead,
  onAddLead,
  onDeleteLead,
  onUpdateLeadNextAction,
  onAddActivityLog,
  selectedLeadFor360: externalSelected,
  onClose360: externalClose,
  onSelectLeadFor360: externalSelect,
  onAddActivity,
  onAddFollowUp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<CRMLead | null>(null);

  const handleDeleteLead = (lead: CRMLead) => {
    if (onDeleteLead) {
      onDeleteLead(lead.id);
    }
    setDeleteConfirmLead(null);
  };

  // Internal 360 state (used when no external handlers provided)
  const [internalSelected360, setInternalSelected360] = useState<CRMLead | null>(null);

  const selectedLeadFor360 = externalSelected !== undefined ? externalSelected : internalSelected360;
  const handleSelectLeadFor360 = (lead: CRMLead) => {
    if (externalSelect) externalSelect(lead);
    else setInternalSelected360(lead);
  };
  const handleClose360 = () => {
    if (externalClose) externalClose();
    else setInternalSelected360(null);
  };

  // Quick activity log state inside 360 modal
  const [activeTab360, setActiveTab360] = useState<'overview' | 'requirements' | 'activities' | 'followups' | 'visits' | 'quotations'>('overview');
  const [quickActivityType, setQuickActivityType] = useState<CRMActivity['activity_type']>('Call');
  const [quickDiscussion, setQuickDiscussion] = useState('');
  const [quickNextAction, setQuickNextAction] = useState('');
  const [quickNextDate, setQuickNextDate] = useState('');

  const leads = state.crmLeads || [];
  const requirements = state.crmRequirements || [];
  const followUps = state.crmFollowUps || [];
  const activities = state.crmActivities || [];
  const visits = state.crmVisits || [];
  const meetings = state.crmMeetings || [];
  const quotations = state.crmQuotations || [];

  // Form state for new lead
  const [newLead, setNewLead] = useState<Partial<CRMLead>>({
    company_name: '',
    company_type: 'Private Limited / MNC',
    industry: 'Information Technology & ITES',
    location: '',
    address: '',
    city: 'Bangalore',
    pincode: '',
    website: '',
    contact_person: '',
    designation: '',
    mobile: '',
    alt_mobile: '',
    email: '',
    whatsapp: '',
    service_required: 'Facility Management',
    requirement_type: '',
    lead_source: 'Direct Client Inquiry',
    assigned_to: 'Vikram Singh (Marketing Lead)',
    assigned_to_email: 'vikram.singh@spoorthy.in',
    stage: 'New Lead',
    priority: 'High',
    estimated_value: 1000000,
    probability_pct: 30,
    last_contact_date: new Date().toISOString().split('T')[0],
    next_followup_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    next_action: 'Initial discovery call with Facility/HR Head',
    initial_discussion: '',
    remarks: '',
    status: 'Active',
    created_date: new Date().toISOString().split('T')[0]
  });

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.lead_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || l.stage === stageFilter;
    const matchesPriority = priorityFilter === 'All' || l.priority === priorityFilter;
    const matchesService = serviceFilter === 'All' || l.service_required === serviceFilter;
    return matchesSearch && matchesStage && matchesPriority && matchesService;
  });

  const handleSaveNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.company_name || !newLead.contact_person || !newLead.mobile || !newLead.next_action) {
      alert('Please fill in required fields (Company, Contact Person, Mobile, and Mandatory Next Action).');
      return;
    }

    const leadNum = `SIS/LD/2026/${String(leads.length + 1).padStart(3, '0')}`;
    const created: CRMLead = {
      id: `LD-${Date.now()}`,
      lead_number: leadNum,
      company_name: newLead.company_name || '',
      company_type: newLead.company_type || 'Private Limited / MNC',
      industry: newLead.industry || 'General',
      location: newLead.location || '',
      address: newLead.address || '',
      city: newLead.city || 'Bangalore',
      pincode: newLead.pincode || '',
      website: newLead.website || '',
      contact_person: newLead.contact_person || '',
      designation: newLead.designation || '',
      mobile: newLead.mobile || '',
      alt_mobile: newLead.alt_mobile || '',
      email: newLead.email || '',
      whatsapp: newLead.whatsapp || newLead.mobile || '',
      service_required: newLead.service_required || 'Facility Management',
      requirement_type: newLead.requirement_type || '',
      lead_source: newLead.lead_source || 'Direct Client Inquiry',
      assigned_to: newLead.assigned_to || 'Vikram Singh (Marketing Lead)',
      assigned_to_email: newLead.assigned_to_email || 'vikram.singh@spoorthy.in',
      stage: newLead.stage || 'New Lead',
      priority: newLead.priority || 'High',
      estimated_value: Number(newLead.estimated_value) || 0,
      probability_pct: Number(newLead.probability_pct) || 20,
      last_contact_date: newLead.last_contact_date || new Date().toISOString().split('T')[0],
      next_followup_date: newLead.next_followup_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      next_action: newLead.next_action || '',
      initial_discussion: newLead.initial_discussion || '',
      remarks: newLead.remarks || '',
      status: 'Active',
      created_date: new Date().toISOString().split('T')[0]
    };

    onAddLead(created);
    setIsAddModalOpen(false);
  };

  const handleUpdateExistingLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    onUpdateLead(editingLead);
    setEditingLead(null);
  };

  const handleQuickLogActivity = (lead: CRMLead) => {
    if (!quickDiscussion || !quickNextAction || !quickNextDate) {
      alert('Please fill discussion details, mandatory next action, and next follow-up date.');
      return;
    }

    const newAct: CRMActivity = {
      id: `ACT-${Date.now()}`,
      lead_id: lead.id,
      company_name: lead.company_name,
      user_name: lead.assigned_to.split(' ')[0] || 'Marketing Executive',
      activity_type: quickActivityType,
      activity_date: new Date().toISOString().split('T')[0],
      contact_person: lead.contact_person,
      discussion: quickDiscussion,
      client_response: 'Logged from 360 view',
      next_action: quickNextAction,
      next_action_date: quickNextDate
    };

    if (onAddActivity) onAddActivity(newAct);
    if (onAddActivityLog) onAddActivityLog(lead.id, newAct);

    // Also update lead's next action & date
    const updatedLead: CRMLead = {
      ...lead,
      next_action: quickNextAction,
      next_followup_date: quickNextDate,
      last_contact_date: new Date().toISOString().split('T')[0]
    };
    onUpdateLead(updatedLead);
    if (onUpdateLeadNextAction) onUpdateLeadNextAction(lead.id, quickNextAction, quickNextDate);

    // Also auto-schedule follow-up entry
    const newFlw: CRMFollowUp = {
      id: `FLW-${Date.now()}`,
      lead_id: lead.id,
      company_name: lead.company_name,
      assigned_executive: lead.assigned_to,
      followup_date: quickNextDate,
      followup_time: '11:00',
      type: quickActivityType === 'Call' ? 'Phone Call' : quickActivityType === 'Meeting' ? 'Meeting' : 'Client Visit',
      status: 'Pending',
      discussion: `Follow up on: ${quickDiscussion}`,
      next_action: quickNextAction,
      next_followup_date: quickNextDate,
      priority: lead.priority,
      created_at: new Date().toISOString().split('T')[0]
    };
    if (onAddFollowUp) onAddFollowUp(newFlw);

    setQuickDiscussion('');
    setQuickNextAction('');
    setQuickNextDate('');
    alert('Activity logged and follow-up scheduled successfully!');
  };

  return (
    <div className="space-y-6">

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Enterprise Lead &amp; Pipeline Management</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-mono text-[10px] font-bold border border-sky-300">
              {leads.length} Total Records
            </span>
          </h3>

        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Lead</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Company, Contact, Location, Lead #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="All">All Stages ({leads.length})</option>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Requirement Received">Requirement Received</option>
            <option value="Meeting / Visit Scheduled">Meeting / Visit Scheduled</option>
            <option value="Proposal Submitted">Proposal Submitted</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won / Converted">Won / Converted</option>
            <option value="Client Onboarding">Client Onboarding</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="All">All Services</option>
            <option value="Facility Management">Facility Management</option>
            <option value="Security Services">Security Services</option>
            <option value="Blue Collar Manpower">Blue Collar Manpower</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Payroll Management">Payroll Management</option>
          </select>
        </div>
      </div>

      {/* Main Leads Data Grid */}
      <div className="bg-white border border-sky-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-50 border-b border-sky-200 text-sky-700 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Lead # &amp; Company</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Service &amp; Sector</th>
                <th className="py-3 px-4">Est. Pipeline Value</th>
                <th className="py-3 px-4">Stage &amp; Probability</th>
                <th className="py-3 px-4">Assigned Owner</th>
                <th className="py-3 px-4">Next Mandatory Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-sans">
              {filteredLeads.map(lead => {
                const isOverdue = lead.next_followup_date < new Date().toISOString().split('T')[0];
                return (
                  <tr key={lead.id} className="hover:bg-sky-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-sky-600">{lead.lead_number}</span>
                        {lead.priority === 'Critical' && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-600 border border-rose-300 rounded text-[9px] font-mono font-bold uppercase">
                            Critical
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-0.5">{lead.company_name}</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lead.location || lead.city}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{lead.contact_person}</div>
                      <div className="text-[11px] text-slate-500">{lead.designation}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${lead.mobile}`}
                          className="p-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-200 rounded transition"
                          title={`Call ${lead.mobile}`}
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-200 rounded transition"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-1 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-600 border border-sky-200 rounded transition"
                          title={`Email ${lead.email}`}
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold block w-fit">
                        {lead.service_required}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {lead.industry}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800 text-xs">
                        ₹{(lead.estimated_value / 100000).toFixed(2)} L
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Source: {lead.lead_source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${lead.stage === 'Won / Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          lead.stage === 'Proposal Submitted' || lead.stage === 'Quotation Sent' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                            lead.stage === 'Negotiation' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                              'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                        {lead.stage}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-14 bg-sky-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${lead.probability_pct >= 70 ? 'bg-emerald-500' : lead.probability_pct >= 40 ? 'bg-amber-500' : 'bg-sky-500'}`}
                            style={{ width: `${lead.probability_pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{lead.probability_pct}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-bold flex items-center justify-center font-mono text-[10px]">
                          {lead.assigned_to.split(' ')[0][0]}
                        </div>
                        <span className="text-slate-700 font-medium text-xs truncate max-w-[120px]">
                          {lead.assigned_to}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-700 font-medium line-clamp-1">
                        {lead.next_action}
                      </p>
                      <span className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                        <Clock className="w-3 h-3" />
                        Due: {lead.next_followup_date} {isOverdue && '(OVERDUE)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSelectLeadFor360(lead)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-700 border border-sky-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="View 360° Dossier"
                        >
                          <Eye className="w-3 h-3" />
                          <span>360°</span>
                        </button>
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-1.5 bg-white hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg border border-slate-200 hover:border-amber-300 transition"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmLead(lead)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 hover:border-rose-300 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                    No leads matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 360° LEAD DOSSIER MODAL / DRAWER                                          */}
      {/* ========================================================================= */}
      {selectedLeadFor360 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-sky-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* 360 Header */}
            <div className="bg-white p-5 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                    {selectedLeadFor360.lead_number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Stage: <strong className="text-slate-900">{selectedLeadFor360.stage}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Owner: <strong className="text-slate-800">{selectedLeadFor360.assigned_to}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedLeadFor360.company_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedLeadFor360.industry} • {selectedLeadFor360.location} • Value: ₹{(selectedLeadFor360.estimated_value / 100000).toFixed(2)} Lakhs ({selectedLeadFor360.probability_pct}%)
                </p>
              </div>

              <button
                onClick={handleClose360}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 360 Navigation Tabs */}
            <div className="flex border-b border-sky-200 bg-sky-50 px-5 gap-4 overflow-x-auto text-xs font-mono font-bold">
              {[
                { id: 'overview', label: '1. Overview & Contact' },
                { id: 'requirements', label: `2. Manpower Requisitions (${requirements.filter(r => r.lead_id === selectedLeadFor360.id).length})` },
                { id: 'activities', label: `3. Activity Log (${activities.filter(a => a.lead_id === selectedLeadFor360.id).length})` },
                { id: 'followups', label: `4. Follow-ups (${followUps.filter(f => f.lead_id === selectedLeadFor360.id).length})` },
                { id: 'visits', label: `5. Visits & Meetings (${visits.filter(v => v.lead_id === selectedLeadFor360.id).length + meetings.filter(m => m.lead_id === selectedLeadFor360.id).length})` },
                { id: 'quotations', label: `6. Quotations (${quotations.filter(q => q.lead_id === selectedLeadFor360.id).length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab360(tab.id as any)}
                  className={`py-3 border-b-2 transition cursor-pointer whitespace-nowrap ${activeTab360 === tab.id
                      ? 'border-sky-500 text-sky-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 360 Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white">

              {/* TAB 1: OVERVIEW & CONTACT */}
              {activeTab360 === 'overview' && (
                <div className="space-y-6">

                  {/* Quick Action Contact Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-sky-600 uppercase font-bold block">PRIMARY CONTACT</span>
                      <h4 className="text-sm font-bold text-slate-800">{selectedLeadFor360.contact_person}</h4>
                      <p className="text-[11px] text-slate-500">{selectedLeadFor360.designation}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={`tel:${selectedLeadFor360.mobile}`}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call: {selectedLeadFor360.mobile}</span>
                        </a>
                        <a
                          href={`https://wa.me/${selectedLeadFor360.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg transition"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-sky-600 uppercase font-bold block">COMPANY &amp; LOCATION</span>
                      <h4 className="text-xs font-bold text-slate-800">{selectedLeadFor360.company_name}</h4>
                      <p className="text-[11px] text-slate-500">{selectedLeadFor360.address || selectedLeadFor360.location}</p>
                      <div className="text-[11px] text-sky-600 font-mono">
                        {selectedLeadFor360.city} - {selectedLeadFor360.pincode}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-amber-600 uppercase font-bold block">NEXT MANDATORY ACTION</span>
                      <p className="text-xs font-bold text-amber-700">{selectedLeadFor360.next_action}</p>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Due Date: <strong className="text-slate-700">{selectedLeadFor360.next_followup_date}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Initial Discussion & Remarks */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-sky-600 uppercase font-bold block">INITIAL REQUIREMENT &amp; DISCUSSION NOTES</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedLeadFor360.initial_discussion || 'No initial discussion notes recorded yet.'}
                    </p>
                    {selectedLeadFor360.remarks && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <strong>Remarks:</strong> {selectedLeadFor360.remarks}
                      </div>
                    )}
                  </div>

                  {/* Stage Transition Bar */}
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">UPDATE PIPELINE STAGE</span>
                      <span className="text-[10px] font-mono text-slate-500">Current: <strong className="text-sky-700">{selectedLeadFor360.stage}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CRM_STAGES.map(s => (
                        <button
                          key={s.stage}
                          onClick={() => {
                            const updated = { ...selectedLeadFor360, stage: s.stage, probability_pct: s.prob };
                            onUpdateLead(updated);
                            handleSelectLeadFor360(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 ${selectedLeadFor360.stage === s.stage
                              ? 'bg-sky-600 text-white shadow-md'
                              : 'bg-white hover:bg-sky-50 text-slate-600 border border-sky-200 hover:border-sky-400'
                            }`}
                        >
                          <span>{s.label}</span>
                          <span className="text-[10px] opacity-75 font-normal">({s.prob}%)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Activity Logger */}
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sky-700 uppercase font-bold">QUICK ACTIVITY &amp; NEXT ACTION LOG</span>
                      <span className="text-[10px] font-mono text-slate-500">Enforces: No lead exits without next action</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Activity Type</label>
                        <select
                          value={quickActivityType}
                          onChange={e => setQuickActivityType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-sky-500"
                        >
                          <option value="Call">Phone Call</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Visit">Site Visit</option>
                          <option value="Email">Email</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Quotation">Quotation</option>
                          <option value="Negotiation">Negotiation</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Discussion Summary</label>
                        <input
                          type="text"
                          placeholder="What was discussed with the client?"
                          value={quickDiscussion}
                          onChange={e => setQuickDiscussion(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-mono text-amber-600 uppercase block mb-1 font-bold">Mandatory Next Action</label>
                        <input
                          type="text"
                          placeholder="e.g., Submit revised SLA proposal or attend F2F meeting"
                          value={quickNextAction}
                          onChange={e => setQuickNextAction(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Next Due Date</label>
                        <input
                          type="date"
                          value={quickNextDate}
                          onChange={e => setQuickNextDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleQuickLogActivity(selectedLeadFor360)}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer"
                      >
                        Log Activity &amp; Schedule Follow-up
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MANPOWER REQUIREMENTS */}
              {activeTab360 === 'requirements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">Linked Manpower &amp; Facility Requirements</h4>
                    <span className="text-xs font-mono text-sky-600">
                      Total Pax: {requirements.filter(r => r.lead_id === selectedLeadFor360.id).reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {requirements.filter(r => r.lead_id === selectedLeadFor360.id).map(req => (
                      <div key={req.id} className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-sky-600 font-bold">{req.requirement_number}</span>
                          <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-sky-200 text-[10px] font-mono">
                            {req.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-xs">{req.manpower_category} — {req.quantity} Personnel</h5>
                        <p className="text-[11px] text-slate-500"><strong>Skills:</strong> {req.skills_required}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-slate-600 border-t border-sky-200">
                          <div>Salary: ₹{req.salary_or_wages?.toLocaleString('en-IN')}</div>
                          <div>Billing: ₹{req.billing_rate?.toLocaleString('en-IN')}</div>
                          <div>Shift: {req.shift}</div>
                          <div>Target Joining: {req.joining_date}</div>
                        </div>
                      </div>
                    ))}

                    {requirements.filter(r => r.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-400 font-mono text-center py-6">
                        No manpower requirements logged for this lead yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVITY LOG */}
              {activeTab360 === 'activities' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Historical Interaction &amp; Engagement Log</h4>
                  <div className="space-y-3">
                    {activities.filter(a => a.lead_id === selectedLeadFor360.id).map(act => (
                      <div key={act.id} className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 border border-sky-200 rounded font-bold">
                            {act.activity_type} • {act.activity_date}
                          </span>
                          <span className="text-slate-500">By: {act.user_name}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{act.discussion}</p>
                        <div className="text-[11px] text-amber-600 font-medium">
                          Next Action: {act.next_action} (Due: {act.next_action_date})
                        </div>
                      </div>
                    ))}

                    {activities.filter(a => a.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-400 font-mono text-center py-6">
                        No activity records found. Use the quick logger in Overview tab to record an action.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: FOLLOW-UPS */}
              {activeTab360 === 'followups' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Scheduled Follow-ups &amp; Reminders</h4>
                  <div className="space-y-3">
                    {followUps.filter(f => f.lead_id === selectedLeadFor360.id).map(flw => (
                      <div key={flw.id} className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-amber-600">Due: {flw.followup_date} ({flw.followup_time || '10:00'}) • {flw.type}</span>
                          <span className={`px-2 py-0.5 rounded ${flw.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                            {flw.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{flw.next_action}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">Executive: {flw.assigned_executive}</span>
                      </div>
                    ))}

                    {followUps.filter(f => f.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-400 font-mono text-center py-6">
                        No scheduled follow-ups.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: VISITS & MEETINGS */}
              {activeTab360 === 'visits' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Site Visits &amp; Formal Meetings</h4>

                  {visits.filter(v => v.lead_id === selectedLeadFor360.id).map(v => (
                    <div key={v.id} className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-sky-700">SITE VISIT: {v.visit_date}</span>
                        <span className="text-slate-500">Visited by: {v.visited_by}</span>
                      </div>
                      <p className="text-xs text-slate-700"><strong>Purpose:</strong> {v.purpose}</p>
                      <p className="text-[11px] text-slate-500"><strong>Requirement Discussed:</strong> {v.requirement_discussed}</p>
                      {v.competitor_info && (
                        <p className="text-[11px] text-amber-600"><strong>Competitor Intelligence:</strong> {v.competitor_info}</p>
                      )}
                    </div>
                  ))}

                  {meetings.filter(m => m.lead_id === selectedLeadFor360.id).map(m => (
                    <div key={m.id} className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-indigo-700">MEETING: {m.meeting_date} ({m.meeting_time})</span>
                        <span className="text-slate-500">{m.meeting_type}</span>
                      </div>
                      <h5 className="font-bold text-slate-700 text-xs">Agenda: {m.agenda}</h5>
                      <p className="text-[11px] text-slate-500">{m.discussion_points}</p>
                    </div>
                  ))}

                  {visits.filter(v => v.lead_id === selectedLeadFor360.id).length === 0 && meetings.filter(m => m.lead_id === selectedLeadFor360.id).length === 0 && (
                    <p className="text-slate-400 font-mono text-center py-6">
                      No visits or formal meetings recorded yet.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 6: QUOTATIONS */}
              {activeTab360 === 'quotations' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800">Commercial Quotations Submitted</h4>
                  <div className="space-y-3">
                    {quotations.filter(q => q.lead_id === selectedLeadFor360.id).map(q => (
                      <div key={q.id} className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-sky-600 font-bold">{q.quotation_number}</span>
                          <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-sky-200 text-[10px] font-mono">
                            Status: {q.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-xs">{q.service} — {q.manpower_category}</h5>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-sky-200 font-mono">
                          <span className="text-emerald-600 font-bold">Value: ₹{q.commercial_value?.toLocaleString('en-IN')}</span>
                          <span className="text-slate-500">Valid Until: {q.validity_date}</span>
                        </div>
                      </div>
                    ))}

                    {quotations.filter(q => q.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-400 font-mono text-center py-6">
                        No quotations logged for this lead.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* 360 Footer */}
            <div className="p-4 bg-sky-50 border-t border-sky-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Spoorthy CRM 360° Lead Dossier
              </span>
              <button
                onClick={handleClose360}
                className="px-4 py-1.5 bg-white hover:bg-sky-50 text-slate-600 border border-sky-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW LEAD MODAL                                                        */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">NEW OPPORTUNITY</span>
                <h3 className="text-base font-black text-slate-900">Capture Enterprise Client Lead</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewLead} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs bg-white">

              {/* Section 1: Company Profile */}
              <div className="space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-200">
                <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">1. Company Profile</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prestige Tech Park SEZ"
                      value={newLead.company_name}
                      onChange={e => setNewLead({ ...newLead, company_name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Company Type</label>
                    <select
                      value={newLead.company_type}
                      onChange={e => setNewLead({ ...newLead, company_type: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Private Limited / MNC">Private Limited / MNC</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Government / PSU">Government / PSU</option>
                      <option value="Partnership / Proprietorship">Partnership / Proprietorship</option>
                      <option value="Hospital / Healthcare">Hospital / Healthcare</option>
                      <option value="Educational Institution">Educational Institution</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Industry Sector</label>
                    <select
                      value={newLead.industry}
                      onChange={e => setNewLead({ ...newLead, industry: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Information Technology & ITES">Information Technology & ITES</option>
                      <option value="Automotive & Heavy Manufacturing">Automotive & Heavy Manufacturing</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="Logistics, Warehousing & Supply Chain">Logistics, Warehousing & Supply Chain</option>
                      <option value="Hospitality, Hotels & Resorts">Hospitality, Hotels & Resorts</option>
                      <option value="Real Estate & Property Management">Real Estate & Property Management</option>
                      <option value="Pharma & Chemical">Pharma & Chemical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Location / Zone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electronic City Phase 1"
                      value={newLead.location}
                      onChange={e => setNewLead({ ...newLead, location: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">City &amp; Pincode</label>
                    <input
                      type="text"
                      placeholder="Bangalore - 560100"
                      value={newLead.city}
                      onChange={e => setNewLead({ ...newLead, city: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Key Contact Details */}
              <div className="space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-200">
                <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">2. Key Decision Maker &amp; Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Raghavan Iyer"
                      value={newLead.contact_person}
                      onChange={e => setNewLead({ ...newLead, contact_person: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. VP - Workplace & Admin"
                      value={newLead.designation}
                      onChange={e => setNewLead({ ...newLead, designation: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98450 12345"
                      value={newLead.mobile}
                      onChange={e => setNewLead({ ...newLead, mobile: e.target.value, whatsapp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="raghavan@company.com"
                      value={newLead.email}
                      onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="+91 98450 12345"
                      value={newLead.whatsapp}
                      onChange={e => setNewLead({ ...newLead, whatsapp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Lead Source</label>
                    <select
                      value={newLead.lead_source}
                      onChange={e => setNewLead({ ...newLead, lead_source: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Direct Client Inquiry">Direct Client Inquiry</option>
                      <option value="Cold Outreach">Cold Outreach</option>
                      <option value="Field Visit">Field Visit</option>
                      <option value="Referral">Referral</option>
                      <option value="Website / Inbound">Website / Inbound</option>
                      <option value="Tender / RFP Portal">Tender / RFP Portal</option>
                      <option value="LinkedIn / Social">LinkedIn / Social</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Commercial & Assignment */}
              <div className="space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-200">
                <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">3. Service &amp; Commercial Pipeline</span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Service Required</label>
                    <select
                      value={newLead.service_required}
                      onChange={e => setNewLead({ ...newLead, service_required: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Facility Management">Facility Management</option>
                      <option value="Security Services">Security Services</option>
                      <option value="Blue Collar Manpower">Blue Collar Manpower</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="White Collar Manpower">White Collar Manpower</option>
                      <option value="Payroll Management">Payroll Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Stages *</label>
                    <select
                      value={newLead.stage || 'New Lead'}
                      onChange={e => {
                        const stg = e.target.value as CRMLeadStage;
                        const match = CRM_STAGES.find(s => s.stage === stg);
                        setNewLead({
                          ...newLead,
                          stage: stg,
                          probability_pct: match ? match.prob : newLead.probability_pct
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 font-mono focus:outline-none focus:border-sky-500"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Requirement Received">Requirement Received</option>
                      <option value="Meeting / Visit Scheduled">Meeting / Visit Scheduled</option>
                      <option value="Proposal Submitted">Proposal Submitted</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won / Converted">Won / Converted</option>
                      <option value="Client Onboarding">Client Onboarding</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Est. Contract Value (₹)</label>
                    <input
                      type="number"
                      placeholder="3500000"
                      value={newLead.estimated_value}
                      onChange={e => setNewLead({ ...newLead, estimated_value: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Probability (%)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newLead.probability_pct}
                      onChange={e => setNewLead({ ...newLead, probability_pct: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Assigned Executive *</label>
                    <select
                      value={newLead.assigned_to}
                      onChange={e => setNewLead({ ...newLead, assigned_to: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Vikram Singh (Marketing Lead)">Vikram Singh (Marketing Lead)</option>
                      <option value="Arun Kulkarni (BD Exec)">Arun Kulkarni (BD Exec)</option>
                      <option value="Deepika Nair (Marketing Exec)">Deepika Nair (Marketing Exec)</option>
                      <option value="Priya Patel (Senior Manager)">Priya Patel (Senior Manager)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Mandatory Next Action */}
              <div className="space-y-3 bg-amber-50 p-4 rounded-xl border border-amber-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-600 uppercase font-bold">4. Mandatory Next Action (Core Principle 2)</span>
                  <span className="text-[10px] text-rose-500 font-mono font-bold">* No lead exists without next action</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-amber-600 block mb-1 font-bold">Immediate Next Action *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Schedule discovery visit with Head Admin on Wednesday"
                      value={newLead.next_action}
                      onChange={e => setNewLead({ ...newLead, next_action: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-amber-600 block mb-1 font-bold">Next Action Due Date *</label>
                    <input
                      type="date"
                      required
                      value={newLead.next_followup_date}
                      onChange={e => setNewLead({ ...newLead, next_followup_date: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Initial Discussion */}
              <div>
                <label className="text-[10px] font-mono text-slate-500 block mb-1">Initial Discussion &amp; Scope Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Details of client requirements, square footage, shifts, current vendor pain points..."
                  value={newLead.initial_discussion}
                  onChange={e => setNewLead({ ...newLead, initial_discussion: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-sky-50 text-slate-600 border border-sky-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Create &amp; Assign Lead
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT LEAD MODAL                                                           */}
      {/* ========================================================================= */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">EDIT OPPORTUNITY</span>
                <h3 className="text-base font-black text-slate-900">{editingLead.company_name} ({editingLead.lead_number})</h3>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExistingLead} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingLead.company_name}
                    onChange={e => setEditingLead({ ...editingLead, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingLead.contact_person}
                    onChange={e => setEditingLead({ ...editingLead, contact_person: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingLead.mobile}
                    onChange={e => setEditingLead({ ...editingLead, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Assigned Executive</label>
                  <input
                    type="text"
                    value={editingLead.assigned_to}
                    onChange={e => setEditingLead({ ...editingLead, assigned_to: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Pipeline Stage</label>
                  <select
                    value={editingLead.stage}
                    onChange={e => {
                      const stg = e.target.value as CRMLeadStage;
                      const match = CRM_STAGES.find(s => s.stage === stg);
                      setEditingLead({
                        ...editingLead,
                        stage: stg,
                        probability_pct: match ? match.prob : editingLead.probability_pct
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 font-mono font-bold focus:outline-none focus:border-sky-500"
                  >
                    {CRM_STAGES.map(s => (
                      <option key={s.stage} value={s.stage}>
                        {s.label} ({s.prob}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={editingLead.estimated_value}
                    onChange={e => setEditingLead({ ...editingLead, estimated_value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={editingLead.probability_pct}
                    onChange={e => setEditingLead({ ...editingLead, probability_pct: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-600 block mb-1 font-bold">Mandatory Next Action</label>
                  <input
                    type="text"
                    required
                    value={editingLead.next_action}
                    onChange={e => setEditingLead({ ...editingLead, next_action: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={editingLead.next_followup_date}
                    onChange={e => setEditingLead({ ...editingLead, next_followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Priority</label>
                  <select
                    value={editingLead.priority}
                    onChange={e => setEditingLead({ ...editingLead, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-white hover:bg-sky-50 text-slate-600 border border-sky-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-rose-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-100 font-bold block">Confirm Deletion</span>
                  <h3 className="text-sm font-black text-white">Delete Lead Record</h3>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmLead(null)}
                className="p-1.5 bg-white/20 text-white rounded-xl hover:bg-white/30 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <p className="text-[10px] font-mono text-rose-500 uppercase font-bold">Lead to be Deleted</p>
                <p className="text-sm font-bold text-slate-800">{deleteConfirmLead.company_name}</p>
                <p className="text-xs text-slate-500 font-mono">{deleteConfirmLead.lead_number} • {deleteConfirmLead.stage}</p>
                <p className="text-xs text-slate-500">Contact: {deleteConfirmLead.contact_person} — {deleteConfirmLead.mobile}</p>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-700 font-black text-[10px]">!</span>
                </div>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  This action is <strong>permanent and irreversible</strong>. All activities, follow-ups, and linked records associated with this lead will be removed.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setDeleteConfirmLead(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLead(deleteConfirmLead)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Delete Lead
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
