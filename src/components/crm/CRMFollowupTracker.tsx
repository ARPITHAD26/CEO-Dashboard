import React, { useState } from 'react';
import { CRMFollowUp, CRMLead, AppState } from '../../types';
import {
  Plus, Search, Filter, Phone, MessageSquare, Mail,
  Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  X, Check, RefreshCw, ShieldAlert, User, Building2, Flame
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddFollowUp: (followUp: CRMFollowUp) => void;
  onUpdateFollowUp: (followUp: CRMFollowUp) => void;
  onUpdateLeadNextAction: (leadId: string, nextAction: string, nextDate: string) => void;
}

export const CRMFollowupTracker: React.FC<Props> = ({
  state,
  onAddFollowUp,
  onUpdateFollowUp,
  onUpdateLeadNextAction
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'completed'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [executiveFilter, setExecutiveFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [completingFollowUp, setCompletingFollowUp] = useState<CRMFollowUp | null>(null);

  // Completion modal state
  const [completionDiscussion, setCompletionDiscussion] = useState('');
  const [mandatoryNextAction, setMandatoryNextAction] = useState('');
  const [mandatoryNextDate, setMandatoryNextDate] = useState('');

  const followUps = state.crmFollowUps || [];
  const leads = state.crmLeads || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const overdueList = followUps.filter(f => f.status === 'Pending' && f.followup_date < todayStr);
  const todayList = followUps.filter(f => f.status === 'Pending' && f.followup_date === todayStr);
  const tomorrowList = followUps.filter(f => f.status === 'Pending' && f.followup_date === tomorrowStr);
  const upcomingList = followUps.filter(f => f.status === 'Pending' && f.followup_date > tomorrowStr);
  const completedList = followUps.filter(f => f.status === 'Completed');

  const [newFollowUp, setNewFollowUp] = useState<Partial<CRMFollowUp>>({
    lead_id: '',
    company_name: '',
    assigned_executive: 'Vikram Singh',
    followup_date: todayStr,
    followup_time: '11:00',
    type: 'Phone Call',
    status: 'Pending',
    discussion: '',
    next_action: '',
    next_followup_date: tomorrowStr,
    priority: 'High'
  });

  const getFilteredList = () => {
    let list: CRMFollowUp[] = [];
    if (timeFilter === 'all') list = followUps;
    else if (timeFilter === 'overdue') list = overdueList;
    else if (timeFilter === 'today') list = todayList;
    else if (timeFilter === 'tomorrow') list = tomorrowList;
    else if (timeFilter === 'upcoming') list = upcomingList;
    else if (timeFilter === 'completed') list = completedList;

    return list.filter(f => {
      const matchesSearch =
        f.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.next_action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.assigned_executive.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExec = executiveFilter === 'All' || f.assigned_executive.includes(executiveFilter);
      return matchesSearch && matchesExec;
    });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.company_name || !newFollowUp.next_action || !newFollowUp.followup_date) {
      alert('Please fill company name, next action, and follow-up date.');
      return;
    }

    const created: CRMFollowUp = {
      id: `FLW-${Date.now()}`,
      lead_id: newFollowUp.lead_id || '',
      company_name: newFollowUp.company_name || '',
      assigned_executive: newFollowUp.assigned_executive || 'Vikram Singh',
      followup_date: newFollowUp.followup_date || todayStr,
      followup_time: newFollowUp.followup_time || '10:00',
      type: newFollowUp.type || 'Phone Call',
      status: 'Pending',
      discussion: newFollowUp.discussion || '',
      next_action: newFollowUp.next_action || '',
      next_followup_date: newFollowUp.next_followup_date || tomorrowStr,
      priority: newFollowUp.priority || 'High',
      created_at: todayStr
    };

    onAddFollowUp(created);
    if (newFollowUp.lead_id) {
      onUpdateLeadNextAction(newFollowUp.lead_id, newFollowUp.next_action, newFollowUp.followup_date);
    }
    setIsAddModalOpen(false);
  };

  const handleCompleteFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowUp) return;
    if (!mandatoryNextAction || !mandatoryNextDate) {
      alert('Core CRM Principle: No active lead exits without a mandatory next action and date.');
      return;
    }

    // 1. Update this follow-up to completed
    const updated: CRMFollowUp = {
      ...completingFollowUp,
      status: 'Completed',
      client_response: completionDiscussion || 'Follow-up executed successfully.'
    };
    onUpdateFollowUp(updated);

    // 2. Automatically spawn the NEXT follow-up to enforce the core rule!
    const nextFlw: CRMFollowUp = {
      id: `FLW-${Date.now()}`,
      lead_id: completingFollowUp.lead_id,
      company_name: completingFollowUp.company_name,
      assigned_executive: completingFollowUp.assigned_executive,
      followup_date: mandatoryNextDate,
      followup_time: '11:00',
      type: completingFollowUp.type,
      status: 'Pending',
      discussion: `Previous outcome: ${completionDiscussion}`,
      next_action: mandatoryNextAction,
      next_followup_date: mandatoryNextDate,
      priority: completingFollowUp.priority,
      created_at: todayStr
    };
    onAddFollowUp(nextFlw);

    // 3. Update lead
    if (completingFollowUp.lead_id) {
      onUpdateLeadNextAction(completingFollowUp.lead_id, mandatoryNextAction, mandatoryNextDate);
    }

    setCompletingFollowUp(null);
    setCompletionDiscussion('');
    setMandatoryNextAction('');
    setMandatoryNextDate('');
    alert('Follow-up completed and Next Action scheduled seamlessly!');
  };

  const currentList = getFilteredList();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Follow-up &amp; Action Reminder Command Hub</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold border border-amber-300">
              {todayList.length} Due Today
            </span>
          </h3>

        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-400/20 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Action</span>
        </button>
      </div>

      {/* Time Segments Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {[
          { id: 'overdue', label: 'Overdue Alerts', count: overdueList.length, activeStyle: 'border-rose-400 text-rose-800 bg-rose-50 ring-1 ring-rose-400' },
          { id: 'today', label: 'Due Today', count: todayList.length, activeStyle: 'border-amber-400 text-amber-800 bg-amber-50 ring-1 ring-amber-400' },
          { id: 'tomorrow', label: 'Due Tomorrow', count: tomorrowList.length, activeStyle: 'border-sky-400 text-sky-800 bg-sky-50 ring-1 ring-sky-400' },
          { id: 'upcoming', label: 'Upcoming', count: upcomingList.length, activeStyle: 'border-indigo-400 text-indigo-800 bg-indigo-50 ring-1 ring-indigo-400' },
          { id: 'completed', label: 'Completed Log', count: completedList.length, activeStyle: 'border-emerald-400 text-emerald-800 bg-emerald-50 ring-1 ring-emerald-400' },
          { id: 'all', label: 'All Actions', count: followUps.length, activeStyle: 'border-slate-400 text-slate-800 bg-slate-100 ring-1 ring-slate-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTimeFilter(tab.id as any)}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between shadow-xs ${timeFilter === tab.id
                ? `${tab.activeStyle} font-bold shadow-sm`
                : 'bg-white border-sky-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50/50'
              }`}
          >
            <span className="text-[10px] font-mono uppercase block">{tab.label}</span>
            <div className="text-lg font-mono font-bold mt-1">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Follow-up by Company, Next Action, Executive..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
          />
        </div>

        <select
          value={executiveFilter}
          onChange={e => setExecutiveFilter(e.target.value)}
          className="px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-slate-700 focus:outline-none font-mono font-semibold"
        >
          <option value="All">All Executives</option>
          <option value="Vikram">Vikram Singh</option>
          <option value="Arun">Arun Kulkarni</option>
          <option value="Deepika">Deepika Nair</option>
          <option value="Priya">Priya Patel</option>
        </select>
      </div>

      {/* Main Follow-ups List */}
      <div className="space-y-3">
        {currentList.map(flw => {
          const isOverdue = flw.status === 'Pending' && flw.followup_date < todayStr;
          const isToday = flw.status === 'Pending' && flw.followup_date === todayStr;

          return (
            <div
              key={flw.id}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${isOverdue ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400' :
                  isToday ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400' :
                    'bg-white border-sky-200 hover:border-sky-400'
                }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase border ${isOverdue ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      isToday ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-sky-100 text-sky-800 border-sky-200'
                    }`}>
                    {flw.type} • {flw.followup_date} ({flw.followup_time || '10:00 AM'})
                  </span>

                  <span className="text-slate-500">
                    Owner: <strong className="text-slate-800">{flw.assigned_executive}</strong>
                  </span>

                  {isOverdue && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold font-mono">
                      OVERDUE
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{flw.company_name}</h4>
                <p className="text-xs text-slate-700 font-medium">
                  <strong>Action:</strong> {flw.next_action}
                </p>
                {flw.discussion && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Context: {flw.discussion}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {flw.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => {
                        setCompletingFollowUp(flw);
                        setMandatoryNextDate(tomorrowStr);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Done &amp; Set Next</span>
                    </button>
                    <button
                      onClick={() => {
                        const newDate = prompt('Enter new follow-up date (YYYY-MM-DD):', flw.followup_date);
                        if (newDate) {
                          onUpdateFollowUp({ ...flw, followup_date: newDate });
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-xs rounded-xl border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                      title="Reschedule"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {currentList.length === 0 && (
          <div className="bg-white border border-sky-200 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs shadow-sm">
            No follow-up items found in this category.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MARK DONE & ENFORCE NEXT ACTION MODAL                                     */}
      {/* ========================================================================= */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-emerald-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-200 font-bold block">CORE CRM RULE ENFORCEMENT</span>
                <h3 className="text-base font-bold text-white">Complete Follow-up for {completingFollowUp.company_name}</h3>
              </div>
              <button
                onClick={() => setCompletingFollowUp(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteFollowUp} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">What was the outcome / client response?</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Client CFO approved commercial rates; requested draft agreement copy by tomorrow..."
                  value={completionDiscussion}
                  onChange={e => setCompletionDiscussion(e.target.value)}
                  className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-800 uppercase font-bold">Mandatory Next Action (Core Principle 2)</span>
                  <span className="text-[10px] text-rose-600 font-mono font-bold">* Required</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-700 block mb-1 font-bold">Immediate Next Action</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Email drafted agreement for legal vetting"
                    value={mandatoryNextAction}
                    onChange={e => setMandatoryNextAction(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-700 block mb-1 font-bold">Next Action Due Date</label>
                  <input
                    type="date"
                    required
                    value={mandatoryNextDate}
                    onChange={e => setMandatoryNextDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setCompletingFollowUp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
                >
                  Save &amp; Auto-Schedule Next Action
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD NEW SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <h3 className="text-base font-bold text-slate-900">Schedule Follow-up Action</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Company / Lead Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flipkart Fulfillment Hub"
                    value={newFollowUp.company_name}
                    onChange={e => setNewFollowUp({ ...newFollowUp, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Follow-up Type</label>
                  <select
                    value={newFollowUp.type}
                    onChange={e => setNewFollowUp({ ...newFollowUp, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Client Visit">Client Visit</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Quotation Follow-up">Quotation Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={newFollowUp.followup_date}
                    onChange={e => setNewFollowUp({ ...newFollowUp, followup_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-800 block mb-1 font-bold">Planned Action Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call VP Ops to confirm commercial approval"
                    value={newFollowUp.next_action}
                    onChange={e => setNewFollowUp({ ...newFollowUp, next_action: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-amber-300 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Assigned Executive</label>
                  <input
                    type="text"
                    value={newFollowUp.assigned_executive}
                    onChange={e => setNewFollowUp({ ...newFollowUp, assigned_executive: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Priority</label>
                  <select
                    value={newFollowUp.priority}
                    onChange={e => setNewFollowUp({ ...newFollowUp, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-400/20 transition active:scale-95 cursor-pointer"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
