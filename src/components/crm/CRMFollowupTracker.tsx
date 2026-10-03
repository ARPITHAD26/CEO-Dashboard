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
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Follow-up &amp; Action Reminder Command Hub</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
              {todayList.length} Due Today
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict enforcement of Core Principle 2: "No lead exists without an active owner, and no active lead exits without a next action."
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Action</span>
        </button>
      </div>

      {/* Time Segments Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {[
          { id: 'overdue', label: 'Overdue Alerts', count: overdueList.length, color: 'border-rose-500/40 text-rose-400 bg-rose-950/20' },
          { id: 'today', label: 'Due Today', count: todayList.length, color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
          { id: 'tomorrow', label: 'Due Tomorrow', count: tomorrowList.length, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20' },
          { id: 'upcoming', label: 'Upcoming', count: upcomingList.length, color: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/20' },
          { id: 'completed', label: 'Completed Log', count: completedList.length, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' },
          { id: 'all', label: 'All Actions', count: followUps.length, color: 'border-slate-700 text-slate-300 bg-slate-900/40' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTimeFilter(tab.id as any)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              timeFilter === tab.id 
                ? `${tab.color} ring-1 ring-cyan-400 font-bold shadow-md` 
                : 'bg-[#0e1320] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-mono uppercase block">{tab.label}</span>
            <div className="text-lg font-mono font-bold mt-1">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Follow-up by Company, Next Action, Executive..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={executiveFilter}
          onChange={e => setExecutiveFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none font-mono"
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
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isOverdue ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400' :
                isToday ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400' :
                'bg-[#0e1320] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    isOverdue ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    isToday ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {flw.type} • {flw.followup_date} ({flw.followup_time || '10:00 AM'})
                  </span>

                  <span className="text-slate-400">
                    Owner: <strong className="text-slate-200">{flw.assigned_executive}</strong>
                  </span>

                  {isOverdue && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500 text-slate-950 font-bold font-mono">
                      OVERDUE
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100">{flw.company_name}</h4>
                <p className="text-xs text-slate-300 font-medium">
                  <strong>Action:</strong> {flw.next_action}
                </p>
                {flw.discussion && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">
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
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
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
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
                      title="Reschedule"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {currentList.length === 0 && (
          <div className="bg-[#0e1320] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
            No follow-up items found in this category.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MARK DONE & ENFORCE NEXT ACTION MODAL                                     */}
      {/* ========================================================================= */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-emerald-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 p-5 border-b border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">CORE CRM RULE ENFORCEMENT</span>
                <h3 className="text-base font-black text-slate-100">Complete Follow-up for {completingFollowUp.company_name}</h3>
              </div>
              <button
                onClick={() => setCompletingFollowUp(null)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteFollowUp} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">What was the outcome / client response?</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Client CFO approved commercial rates; requested draft agreement copy by tomorrow..."
                  value={completionDiscussion}
                  onChange={e => setCompletionDiscussion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-300 uppercase font-bold">Mandatory Next Action (Core Principle 2)</span>
                  <span className="text-[10px] text-rose-400 font-mono font-bold">* Required</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">Immediate Next Action</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Email drafted agreement for legal vetting"
                    value={mandatoryNextAction}
                    onChange={e => setMandatoryNextAction(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">Next Action Due Date</label>
                  <input
                    type="date"
                    required
                    value={mandatoryNextDate}
                    onChange={e => setMandatoryNextDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompletingFollowUp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Schedule Follow-up Action</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company / Lead Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flipkart Fulfillment Hub"
                    value={newFollowUp.company_name}
                    onChange={e => setNewFollowUp({ ...newFollowUp, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Follow-up Type</label>
                  <select
                    value={newFollowUp.type}
                    onChange={e => setNewFollowUp({ ...newFollowUp, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
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
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={newFollowUp.followup_date}
                    onChange={e => setNewFollowUp({ ...newFollowUp, followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-300 block mb-1 font-bold">Planned Action Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call VP Ops to confirm commercial approval"
                    value={newFollowUp.next_action}
                    onChange={e => setNewFollowUp({ ...newFollowUp, next_action: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Assigned Executive</label>
                  <input
                    type="text"
                    value={newFollowUp.assigned_executive}
                    onChange={e => setNewFollowUp({ ...newFollowUp, assigned_executive: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newFollowUp.priority}
                    onChange={e => setNewFollowUp({ ...newFollowUp, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
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
