import React, { useState } from 'react';
import { 
  CRMLead, CRMRequirement, CRMFollowUp, CRMActivity, CRMClientVisit, 
  CRMMeeting, CRMQuotation, AppState 
} from '../../types';
import { 
  Plus, Search, Filter, Phone, Mail, MessageSquare, Calendar, 
  Clock, MapPin, Building2, User, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, Eye, Edit2, X, ExternalLink, 
  Briefcase, Send, ChevronRight, Tag, Share2, DollarSign
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateLead: (lead: CRMLead) => void;
  onAddLead: (lead: CRMLead) => void;
  selectedLeadFor360: CRMLead | null;
  onClose360: () => void;
  onSelectLeadFor360: (lead: CRMLead) => void;
  onAddActivity: (activity: CRMActivity) => void;
  onAddFollowUp: (followUp: CRMFollowUp) => void;
}

export const CRMLeadManager: React.FC<Props> = ({
  state,
  onUpdateLead,
  onAddLead,
  selectedLeadFor360,
  onClose360,
  onSelectLeadFor360,
  onAddActivity,
  onAddFollowUp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);

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

    onAddActivity(newAct);

    // Also update lead's next action & date
    const updatedLead: CRMLead = {
      ...lead,
      next_action: quickNextAction,
      next_followup_date: quickNextDate,
      last_contact_date: new Date().toISOString().split('T')[0]
    };
    onUpdateLead(updatedLead);

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
    onAddFollowUp(newFlw);

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
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Enterprise Lead &amp; Pipeline Management</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {leads.length} Total Records
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Capture prospective clients, assign executive ownership, track 9-stage progression, and maintain 100% active next actions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Lead</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Company, Contact, Location, Lead #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
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
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
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
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
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
      <div className="bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLeads.map(lead => {
                const isOverdue = lead.next_followup_date < new Date().toISOString().split('T')[0];
                return (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">{lead.lead_number}</span>
                        {lead.priority === 'Critical' && (
                          <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono font-bold uppercase">
                            Critical
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs mt-0.5">{lead.company_name}</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {lead.location || lead.city}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{lead.contact_person}</div>
                      <div className="text-[11px] text-slate-400">{lead.designation}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <a 
                          href={`tel:${lead.mobile}`} 
                          className="p-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded transition"
                          title={`Call ${lead.mobile}`}
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a 
                          href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded transition"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="p-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded transition"
                          title={`Email ${lead.email}`}
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold block w-fit">
                        {lead.service_required}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {lead.industry}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100 text-xs">
                        ₹{(lead.estimated_value / 100000).toFixed(2)} L
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source: {lead.lead_source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        lead.stage === 'Won / Converted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        lead.stage === 'Proposal Submitted' || lead.stage === 'Quotation Sent' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                        lead.stage === 'Negotiation' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {lead.stage}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${lead.probability_pct >= 70 ? 'bg-emerald-500' : lead.probability_pct >= 40 ? 'bg-amber-500' : 'bg-cyan-600'}`} 
                            style={{ width: `${lead.probability_pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{lead.probability_pct}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center font-mono text-[10px]">
                          {lead.assigned_to.split(' ')[0][0]}
                        </div>
                        <span className="text-slate-200 font-medium text-xs truncate max-w-[120px]">
                          {lead.assigned_to}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                        {lead.next_action}
                      </p>
                      <span className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 font-bold ${
                        isOverdue ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        Due: {lead.next_followup_date} {isOverdue && '(OVERDUE)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectLeadFor360(lead)}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>360°</span>
                        </button>
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* 360 Header */}
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30">
                    {selectedLeadFor360.lead_number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    Stage: <strong className="text-cyan-300">{selectedLeadFor360.stage}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    Owner: <strong className="text-teal-300">{selectedLeadFor360.assigned_to}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100 mt-1">
                  {selectedLeadFor360.company_name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedLeadFor360.industry} • {selectedLeadFor360.location} • Value: ₹{(selectedLeadFor360.estimated_value / 100000).toFixed(2)} Lakhs ({selectedLeadFor360.probability_pct}%)
                </p>
              </div>

              <button
                onClick={onClose360}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 360 Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 gap-4 overflow-x-auto text-xs font-mono font-bold">
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
                  className={`py-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab360 === tab.id 
                      ? 'border-cyan-400 text-cyan-300' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 360 Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* TAB 1: OVERVIEW & CONTACT */}
              {activeTab360 === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Quick Action Contact Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">PRIMARY CONTACT</span>
                      <h4 className="text-sm font-bold text-slate-100">{selectedLeadFor360.contact_person}</h4>
                      <p className="text-[11px] text-slate-400">{selectedLeadFor360.designation}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <a 
                          href={`tel:${selectedLeadFor360.mobile}`} 
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call: {selectedLeadFor360.mobile}</span>
                        </a>
                        <a 
                          href={`https://wa.me/${selectedLeadFor360.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">COMPANY &amp; LOCATION</span>
                      <h4 className="text-xs font-bold text-slate-200">{selectedLeadFor360.company_name}</h4>
                      <p className="text-[11px] text-slate-400">{selectedLeadFor360.address || selectedLeadFor360.location}</p>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        {selectedLeadFor360.city} - {selectedLeadFor360.pincode}
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">NEXT MANDATORY ACTION</span>
                      <p className="text-xs font-bold text-amber-300">{selectedLeadFor360.next_action}</p>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Due Date: <strong className="text-slate-200">{selectedLeadFor360.next_followup_date}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Initial Discussion & Remarks */}
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">INITIAL REQUIREMENT &amp; DISCUSSION NOTES</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedLeadFor360.initial_discussion || 'No initial discussion notes recorded yet.'}
                    </p>
                    {selectedLeadFor360.remarks && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <strong>Remarks:</strong> {selectedLeadFor360.remarks}
                      </div>
                    )}
                  </div>

                  {/* Stage Transition Bar */}
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-teal-400 uppercase font-bold block">UPDATE PIPELINE STAGE</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'New Lead', 'Contacted', 'Requirement Received', 'Meeting / Visit Scheduled',
                        'Proposal Submitted', 'Quotation Sent', 'Negotiation', 'Won / Converted', 'Client Onboarding'
                      ].map(stg => (
                        <button
                          key={stg}
                          onClick={() => {
                            const updated = { ...selectedLeadFor360, stage: stg as any };
                            onUpdateLead(updated);
                            onSelectLeadFor360(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                            selectedLeadFor360.stage === stg 
                              ? 'bg-cyan-500 text-slate-950 shadow-md' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {stg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Activity Logger */}
                  <div className="bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">QUICK ACTIVITY &amp; NEXT ACTION LOG</span>
                      <span className="text-[10px] font-mono text-slate-400">Enforces: No lead exits without next action</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Activity Type</label>
                        <select
                          value={quickActivityType}
                          onChange={e => setQuickActivityType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
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
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Discussion Summary</label>
                        <input
                          type="text"
                          placeholder="What was discussed with the client?"
                          value={quickDiscussion}
                          onChange={e => setQuickDiscussion(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-mono text-amber-400 uppercase block mb-1 font-bold">Mandatory Next Action</label>
                        <input
                          type="text"
                          placeholder="e.g., Submit revised SLA proposal or attend F2F meeting"
                          value={quickNextAction}
                          onChange={e => setQuickNextAction(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Next Due Date</label>
                        <input
                          type="date"
                          value={quickNextDate}
                          onChange={e => setQuickNextDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleQuickLogActivity(selectedLeadFor360)}
                        className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer"
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
                    <h4 className="font-bold text-slate-100">Linked Manpower &amp; Facility Requirements</h4>
                    <span className="text-xs font-mono text-cyan-400">
                      Total Pax: {requirements.filter(r => r.lead_id === selectedLeadFor360.id).reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {requirements.filter(r => r.lead_id === selectedLeadFor360.id).map(req => (
                      <div key={req.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{req.requirement_number}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {req.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-200 text-xs">{req.manpower_category} — {req.quantity} Personnel</h5>
                        <p className="text-[11px] text-slate-400"><strong>Skills:</strong> {req.skills_required}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-slate-300 border-t border-slate-800">
                          <div>Salary: ₹{req.salary_or_wages?.toLocaleString('en-IN')}</div>
                          <div>Billing: ₹{req.billing_rate?.toLocaleString('en-IN')}</div>
                          <div>Shift: {req.shift}</div>
                          <div>Target Joining: {req.joining_date}</div>
                        </div>
                      </div>
                    ))}

                    {requirements.filter(r => r.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-500 font-mono text-center py-6">
                        No manpower requirements logged for this lead yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVITY LOG */}
              {activeTab360 === 'activities' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-100">Historical Interaction &amp; Engagement Log</h4>
                  <div className="space-y-3">
                    {activities.filter(a => a.lead_id === selectedLeadFor360.id).map(act => (
                      <div key={act.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded font-bold">
                            {act.activity_type} • {act.activity_date}
                          </span>
                          <span className="text-slate-400">By: {act.user_name}</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium">{act.discussion}</p>
                        <div className="text-[11px] text-amber-400 font-medium">
                          Next Action: {act.next_action} (Due: {act.next_action_date})
                        </div>
                      </div>
                    ))}

                    {activities.filter(a => a.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-500 font-mono text-center py-6">
                        No activity records found. Use the quick logger in Overview tab to record an action.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: FOLLOW-UPS */}
              {activeTab360 === 'followups' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-100">Scheduled Follow-ups &amp; Reminders</h4>
                  <div className="space-y-3">
                    {followUps.filter(f => f.lead_id === selectedLeadFor360.id).map(flw => (
                      <div key={flw.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-amber-400">Due: {flw.followup_date} ({flw.followup_time || '10:00'}) • {flw.type}</span>
                          <span className={`px-2 py-0.5 rounded ${flw.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {flw.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium">{flw.next_action}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Executive: {flw.assigned_executive}</span>
                      </div>
                    ))}

                    {followUps.filter(f => f.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-500 font-mono text-center py-6">
                        No scheduled follow-ups.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: VISITS & MEETINGS */}
              {activeTab360 === 'visits' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-100">Site Visits &amp; Formal Meetings</h4>
                  
                  {visits.filter(v => v.lead_id === selectedLeadFor360.id).map(v => (
                    <div key={v.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-cyan-300">SITE VISIT: {v.visit_date}</span>
                        <span className="text-slate-400">Visited by: {v.visited_by}</span>
                      </div>
                      <p className="text-xs text-slate-200"><strong>Purpose:</strong> {v.purpose}</p>
                      <p className="text-[11px] text-slate-400"><strong>Requirement Discussed:</strong> {v.requirement_discussed}</p>
                      {v.competitor_info && (
                        <p className="text-[11px] text-amber-300"><strong>Competitor Intelligence:</strong> {v.competitor_info}</p>
                      )}
                    </div>
                  ))}

                  {meetings.filter(m => m.lead_id === selectedLeadFor360.id).map(m => (
                    <div key={m.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-indigo-300">MEETING: {m.meeting_date} ({m.meeting_time})</span>
                        <span className="text-slate-400">{m.meeting_type}</span>
                      </div>
                      <h5 className="font-bold text-slate-200 text-xs">Agenda: {m.agenda}</h5>
                      <p className="text-[11px] text-slate-400">{m.discussion_points}</p>
                    </div>
                  ))}

                  {visits.filter(v => v.lead_id === selectedLeadFor360.id).length === 0 && meetings.filter(m => m.lead_id === selectedLeadFor360.id).length === 0 && (
                    <p className="text-slate-500 font-mono text-center py-6">
                      No visits or formal meetings recorded yet.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 6: QUOTATIONS */}
              {activeTab360 === 'quotations' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-100">Commercial Quotations Submitted</h4>
                  <div className="space-y-3">
                    {quotations.filter(q => q.lead_id === selectedLeadFor360.id).map(q => (
                      <div key={q.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{q.quotation_number}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            Status: {q.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-200 text-xs">{q.service} — {q.manpower_category}</h5>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                          <span className="text-emerald-400 font-bold">Value: ₹{q.commercial_value?.toLocaleString('en-IN')}</span>
                          <span className="text-slate-400">Valid Until: {q.validity_date}</span>
                        </div>
                      </div>
                    ))}

                    {quotations.filter(q => q.lead_id === selectedLeadFor360.id).length === 0 && (
                      <p className="text-slate-500 font-mono text-center py-6">
                        No quotations logged for this lead.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* 360 Footer */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Spoorthy CRM 360° Lead Dossier
              </span>
              <button
                onClick={onClose360}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">NEW OPPORTUNITY</span>
                <h3 className="text-base font-black text-slate-100">Capture Enterprise Client Lead</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewLead} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Section 1: Company Profile */}
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">1. Company Profile</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prestige Tech Park SEZ"
                      value={newLead.company_name}
                      onChange={e => setNewLead({ ...newLead, company_name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Type</label>
                    <select
                      value={newLead.company_type}
                      onChange={e => setNewLead({ ...newLead, company_type: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Industry Sector</label>
                    <select
                      value={newLead.industry}
                      onChange={e => setNewLead({ ...newLead, industry: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Location / Zone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electronic City Phase 1"
                      value={newLead.location}
                      onChange={e => setNewLead({ ...newLead, location: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">City &amp; Pincode</label>
                    <input
                      type="text"
                      placeholder="Bangalore - 560100"
                      value={newLead.city}
                      onChange={e => setNewLead({ ...newLead, city: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Key Contact Details */}
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">2. Key Decision Maker &amp; Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Raghavan Iyer"
                      value={newLead.contact_person}
                      onChange={e => setNewLead({ ...newLead, contact_person: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. VP - Workplace & Admin"
                      value={newLead.designation}
                      onChange={e => setNewLead({ ...newLead, designation: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98450 12345"
                      value={newLead.mobile}
                      onChange={e => setNewLead({ ...newLead, mobile: e.target.value, whatsapp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="raghavan@company.com"
                      value={newLead.email}
                      onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="+91 98450 12345"
                      value={newLead.whatsapp}
                      onChange={e => setNewLead({ ...newLead, whatsapp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Lead Source</label>
                    <select
                      value={newLead.lead_source}
                      onChange={e => setNewLead({ ...newLead, lead_source: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">3. Service &amp; Commercial Pipeline</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Service Required</label>
                    <select
                      value={newLead.service_required}
                      onChange={e => setNewLead({ ...newLead, service_required: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Est. Contract Value (₹)</label>
                    <input
                      type="number"
                      placeholder="3500000"
                      value={newLead.estimated_value}
                      onChange={e => setNewLead({ ...newLead, estimated_value: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Probability (%)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newLead.probability_pct}
                      onChange={e => setNewLead({ ...newLead, probability_pct: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Assigned Executive *</label>
                    <select
                      value={newLead.assigned_to}
                      onChange={e => setNewLead({ ...newLead, assigned_to: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
              <div className="space-y-3 bg-amber-950/30 p-4 rounded-xl border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">4. Mandatory Next Action (Core Principle 2)</span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">* No lead exists without next action</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-amber-300 block mb-1 font-bold">Immediate Next Action *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Schedule discovery visit with Head Admin on Wednesday"
                      value={newLead.next_action}
                      onChange={e => setNewLead({ ...newLead, next_action: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-amber-300 block mb-1 font-bold">Next Action Due Date *</label>
                    <input
                      type="date"
                      required
                      value={newLead.next_followup_date}
                      onChange={e => setNewLead({ ...newLead, next_followup_date: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Initial Discussion */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Initial Discussion &amp; Scope Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Details of client requirements, square footage, shifts, current vendor pain points..."
                  value={newLead.initial_discussion}
                  onChange={e => setNewLead({ ...newLead, initial_discussion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">EDIT OPPORTUNITY</span>
                <h3 className="text-base font-black text-slate-100">{editingLead.company_name} ({editingLead.lead_number})</h3>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExistingLead} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingLead.company_name}
                    onChange={e => setEditingLead({ ...editingLead, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingLead.contact_person}
                    onChange={e => setEditingLead({ ...editingLead, contact_person: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingLead.mobile}
                    onChange={e => setEditingLead({ ...editingLead, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Assigned Executive</label>
                  <input
                    type="text"
                    value={editingLead.assigned_to}
                    onChange={e => setEditingLead({ ...editingLead, assigned_to: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Pipeline Stage</label>
                  <select
                    value={editingLead.stage}
                    onChange={e => setEditingLead({ ...editingLead, stage: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
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
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={editingLead.estimated_value}
                    onChange={e => setEditingLead({ ...editingLead, estimated_value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={editingLead.probability_pct}
                    onChange={e => setEditingLead({ ...editingLead, probability_pct: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-400 block mb-1 font-bold">Mandatory Next Action</label>
                  <input
                    type="text"
                    required
                    value={editingLead.next_action}
                    onChange={e => setEditingLead({ ...editingLead, next_action: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={editingLead.next_followup_date}
                    onChange={e => setEditingLead({ ...editingLead, next_followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Priority</label>
                  <select
                    value={editingLead.priority}
                    onChange={e => setEditingLead({ ...editingLead, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
