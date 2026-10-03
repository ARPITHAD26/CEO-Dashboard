import { useState, FormEvent } from 'react';
import { 
  AppState, Lead, Client, Task, Role, CRMLead, CRMRequirement, 
  CRMFollowUp, CRMClientVisit, CRMMeeting, CRMQuotation, 
  CRMDailyActivityReport, CRMClientMaster, CRMActivityLog
} from '../types';
import { logAuditEntry } from '../data/store';
import { 
  Briefcase, CheckCircle, Trash2, Edit2, PlusCircle, 
  LayoutDashboard, Users, UserCheck, PhoneCall, Calendar, 
  FileText, TrendingUp, DollarSign, Compass, Layers, Shield
} from 'lucide-react';
import { CRMPresidentDashboard } from './crm/CRMPresidentDashboard';
import { CRMLeadManager } from './crm/CRMLeadManager';
import { CRMRequirementTracker } from './crm/CRMRequirementTracker';
import { CRMFollowupTracker } from './crm/CRMFollowupTracker';
import { CRMVisitsAndMeetings } from './crm/CRMVisitsAndMeetings';
import { CRMQuotationTracker } from './crm/CRMQuotationTracker';
import { CRMDailyActivityReportView } from './crm/CRMDailyActivityReport';
import { CRMClientMasterView } from './crm/CRMClientMaster';
import { CRMTeamMonitor } from './crm/CRMTeamMonitor';
import { TenderManagementView } from './TenderManagementView';

interface BDViewProps {
  state: AppState;
  onUpdateState: (newState: AppState | ((prev: AppState) => AppState)) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

export default function BDView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName
}: BDViewProps) {
  
  type TabType = 
    | 'crm-dashboard' 
    | 'crm-leads' 
    | 'crm-requirements' 
    | 'crm-followups' 
    | 'crm-visits-meetings' 
    | 'crm-quotations' 
    | 'crm-dar' 
    | 'crm-clients' 
    | 'crm-team' 
    | 'tenders'
    | 'tasks';

  const allTabs: { id: TabType; label: string; icon: any; badge?: number }[] = [
    { id: 'crm-dashboard', label: 'President CRM Dashboard', icon: LayoutDashboard },
    { id: 'crm-leads', label: '360° Lead Manager', icon: Users, badge: (state.crmLeads || []).length },
    { id: 'crm-requirements', label: 'Manpower Demands', icon: Briefcase, badge: (state.crmRequirements || []).length },
    { id: 'crm-followups', label: 'Follow-ups & Actions', icon: PhoneCall, badge: (state.crmFollowUps || []).filter(f => f.status === 'Pending').length },
    { id: 'crm-visits-meetings', label: 'Visits & Meetings', icon: Compass },
    { id: 'crm-quotations', label: 'Quotations & Bids', icon: DollarSign, badge: (state.crmQuotations || []).length },
    { id: 'crm-dar', label: 'Daily Activity (DAR)', icon: FileText },
    { id: 'crm-clients', label: 'Client Master', icon: UserCheck, badge: (state.crmClients || []).length },
    { id: 'crm-team', label: 'Team Status Monitor', icon: TrendingUp },
    { id: 'tenders', label: 'Govt / Corporate Tenders', icon: Layers, badge: (state.tenders || []).length },
    { id: 'tasks', label: 'Assigned Tasks', icon: CheckCircle, badge: state.tasks.filter(t => t.department === 'Business Development' || (t.assigned_to || '').toLowerCase().includes('bd')).length }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'crm-dashboard';
  const [activeSubTab, setActiveSubTab] = useState<TabType>(defaultTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // -------------------------------------------------------------
  // CRM STATE MUTATION HANDLERS
  // -------------------------------------------------------------
  const handleAddLead = (lead: CRMLead) => {
    const updated = [lead, ...(state.crmLeads || [])];
    const nextState = { ...state, crmLeads: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMLead', lead.id, 'Logged new marketing lead', JSON.stringify(lead));
    onUpdateState(nextState);
    triggerSuccess(`Lead "${lead.company_name}" recorded successfully!`);
  };

  const handleUpdateLead = (lead: CRMLead) => {
    const updated = (state.crmLeads || []).map(l => l.id === lead.id ? lead : l);
    const nextState = { ...state, crmLeads: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMLead', lead.id, 'Updated marketing lead details', JSON.stringify(lead));
    onUpdateState(nextState);
    triggerSuccess(`Lead "${lead.company_name}" updated.`);
  };

  const handleUpdateLeadNextAction = (leadId: string, nextAction: string, nextDate: string) => {
    const updated = (state.crmLeads || []).map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          next_action: nextAction,
          next_action_date: nextDate,
          activities_count: (l.activities_count || 0) + 1
        };
      }
      return l;
    });
    const nextState = { ...state, crmLeads: updated };
    onUpdateState(nextState);
  };

  const handleAddActivityLog = (leadId: string, activity: CRMActivityLog) => {
    const nextActivities = [activity, ...(state.crmActivities || [])];
    const nextLeads = (state.crmLeads || []).map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          activities_count: (l.activities_count || 0) + 1,
          next_action: activity.next_action || l.next_action,
          next_action_date: activity.next_action_date || l.next_action_date
        };
      }
      return l;
    });
    const nextState = { ...state, crmActivities: nextActivities, crmLeads: nextLeads };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMActivity', activity.id, `Activity logged: ${activity.subject}`);
    onUpdateState(nextState);
    triggerSuccess('Activity log saved and lead metrics refreshed.');
  };

  const handleAddRequirement = (req: CRMRequirement) => {
    const updated = [req, ...(state.crmRequirements || [])];
    const nextState = { ...state, crmRequirements: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMRequirement', req.id, 'Logged manpower requirement', JSON.stringify(req));
    onUpdateState(nextState);
    triggerSuccess(`Requirement "${req.requirement_number}" recorded.`);
  };

  const handleUpdateRequirement = (req: CRMRequirement) => {
    const updated = (state.crmRequirements || []).map(r => r.id === req.id ? req : r);
    const nextState = { ...state, crmRequirements: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMRequirement', req.id, 'Updated manpower requirement', JSON.stringify(req));
    onUpdateState(nextState);
    triggerSuccess(`Requirement "${req.requirement_number}" updated.`);
  };

  const handleAddFollowUp = (flw: CRMFollowUp) => {
    const updated = [flw, ...(state.crmFollowUps || [])];
    const nextState = { ...state, crmFollowUps: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMFollowUp', flw.id, 'Scheduled follow-up action');
    onUpdateState(nextState);
    triggerSuccess('Follow-up scheduled.');
  };

  const handleUpdateFollowUp = (flw: CRMFollowUp) => {
    const updated = (state.crmFollowUps || []).map(f => f.id === flw.id ? flw : f);
    const nextState = { ...state, crmFollowUps: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMFollowUp', flw.id, 'Updated follow-up status');
    onUpdateState(nextState);
  };

  const handleAddVisit = (visit: CRMClientVisit) => {
    const updated = [visit, ...(state.crmVisits || [])];
    const nextState = { ...state, crmVisits: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMVisit', visit.id, 'Logged client field visit');
    onUpdateState(nextState);
    triggerSuccess('Field visit record logged.');
  };

  const handleAddMeeting = (meeting: CRMMeeting) => {
    const updated = [meeting, ...(state.crmMeetings || [])];
    const nextState = { ...state, crmMeetings: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMMeeting', meeting.id, 'Recorded corporate meeting');
    onUpdateState(nextState);
    triggerSuccess('Meeting minutes recorded.');
  };

  const handleAddQuotation = (q: CRMQuotation) => {
    const updated = [q, ...(state.crmQuotations || [])];
    const nextState = { ...state, crmQuotations: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMQuotation', q.id, 'Created commercial quotation', JSON.stringify(q));
    onUpdateState(nextState);
    triggerSuccess(`Quotation "${q.quotation_number}" generated.`);
  };

  const handleUpdateQuotation = (q: CRMQuotation) => {
    const updated = (state.crmQuotations || []).map(item => item.id === q.id ? q : item);
    const nextState = { ...state, crmQuotations: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMQuotation', q.id, 'Updated quotation', JSON.stringify(q));
    onUpdateState(nextState);
    triggerSuccess(`Quotation "${q.quotation_number}" updated.`);
  };

  const handleAddDAR = (dar: CRMDailyActivityReport) => {
    const updated = [dar, ...(state.crmDARs || [])];
    const nextState = { ...state, crmDARs: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMDAR', dar.id, `DAR filed by ${dar.executive_name}`);
    onUpdateState(nextState);
    triggerSuccess('Daily Activity Report (DAR) submitted.');
  };

  const handleUpdateDAR = (dar: CRMDailyActivityReport) => {
    const updated = (state.crmDARs || []).map(d => d.id === dar.id ? dar : d);
    const nextState = { ...state, crmDARs: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMDAR', dar.id, `DAR reviewed/approved for ${dar.executive_name}`);
    onUpdateState(nextState);
    triggerSuccess('DAR approved successfully.');
  };

  const handleAddClient = (client: CRMClientMaster) => {
    const updated = [client, ...(state.crmClients || [])];
    const nextState = { ...state, crmClients: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMClientMaster', client.id, 'Added client master account', JSON.stringify(client));
    onUpdateState(nextState);
    triggerSuccess(`Client "${client.company_name}" onboarded.`);
  };

  const handleUpdateClient = (client: CRMClientMaster) => {
    const updated = (state.crmClients || []).map(c => c.id === client.id ? client : c);
    const nextState = { ...state, crmClients: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMClientMaster', client.id, 'Updated client master account', JSON.stringify(client));
    onUpdateState(nextState);
    triggerSuccess(`Client "${client.company_name}" updated.`);
  };

  const updateTaskProgress = (taskId: string, pct: number) => {
    const nextTasks = state.tasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          percent_completed: pct, 
          status: pct === 100 ? ('Completed' as const) : ('In Progress' as const) 
        };
      }
      return t;
    });
    const nextState = { ...state, tasks: nextTasks };
    onUpdateState(nextState);
    triggerSuccess('Task progress updated.');
  };

  // Filter tasks
  const myTasks = state.tasks.filter(t => t.department === 'Business Development' || (t.assigned_to || '').toLowerCase().includes('bd'));

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Executive Aesthetic Gradient */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 p-6 rounded-3xl border border-sky-400/30 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 font-mono text-[10px] font-bold uppercase tracking-wider">
              Spoorthy Integrated Solutions
            </span>
            <span className="text-xs text-sky-100 font-mono">
              Marketing, Lead, Requirement, Follow-up &amp; Daily Activity CRM
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight">
            Business Development &amp; Client CRM Suite
          </h2>
          <p className="text-xs text-sky-100 mt-1 max-w-2xl font-sans">
            "No lead should exist without an owner and no active lead should exit without a next action." Centralizing marketing leads, client contacts, manpower requirements, follow-ups, client visits, meetings, quotations, daily activity reports and executive dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right">
            <span className="text-[10px] font-mono uppercase text-sky-200 font-bold block">Active Pipeline</span>
            <div className="text-lg font-mono font-black text-white">
              {(state.crmLeads || []).length} Accounts
            </div>
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right">
            <span className="text-[10px] font-mono uppercase text-sky-200 font-bold block">Manpower Demand</span>
            <div className="text-lg font-mono font-black text-sky-100">
              {(state.crmRequirements || []).reduce((a, b) => a + (b.quantity || 0), 0)} Pax
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-sky-100 border border-sky-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-950 font-bold border border-sky-300 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-700">
              Your view is filtered to: <strong>{availableTabs.map(t => t.label).join(' & ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Navigation SubTabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-sky-200 scrollbar-thin">
        {availableTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border border-sky-400 shadow-md shadow-sky-500/20' 
                  : 'bg-white text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-sky-200 hover:border-sky-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                  isActive ? 'bg-white text-sky-900' : 'bg-sky-100 text-sky-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE SUBTAB CONTENT VIEWPORT                                            */}
      {/* ========================================================================= */}

      {/* 1. PRESIDENT & EXECUTIVE CRM DASHBOARD */}
      {activeSubTab === 'crm-dashboard' && (
        <CRMPresidentDashboard
          state={state}
          onNavigate={(target) => setActiveSubTab(target as TabType)}
        />
      )}

      {/* 2. 360-DEGREE LEAD MANAGER */}
      {activeSubTab === 'crm-leads' && (
        <CRMLeadManager
          state={state}
          onAddLead={handleAddLead}
          onUpdateLead={handleUpdateLead}
          onUpdateLeadNextAction={handleUpdateLeadNextAction}
          onAddActivityLog={handleAddActivityLog}
        />
      )}

      {/* 3. MANPOWER REQUIREMENTS TRACKER */}
      {activeSubTab === 'crm-requirements' && (
        <CRMRequirementTracker
          state={state}
          onAddRequirement={handleAddRequirement}
          onUpdateRequirement={handleUpdateRequirement}
        />
      )}

      {/* 4. FOLLOW-UPS & REMINDER COMMAND */}
      {activeSubTab === 'crm-followups' && (
        <CRMFollowupTracker
          state={state}
          onAddFollowUp={handleAddFollowUp}
          onUpdateFollowUp={handleUpdateFollowUp}
          onUpdateLeadNextAction={handleUpdateLeadNextAction}
        />
      )}

      {/* 5. CLIENT VISITS & MEETINGS */}
      {activeSubTab === 'crm-visits-meetings' && (
        <CRMVisitsAndMeetings
          state={state}
          onAddVisit={handleAddVisit}
          onAddMeeting={handleAddMeeting}
        />
      )}

      {/* 6. QUOTATIONS & COMMERCIAL BIDS */}
      {activeSubTab === 'crm-quotations' && (
        <CRMQuotationTracker
          state={state}
          onAddQuotation={handleAddQuotation}
          onUpdateQuotation={handleUpdateQuotation}
        />
      )}

      {/* 7. DAILY ACTIVITY REPORTS (DAR) */}
      {activeSubTab === 'crm-dar' && (
        <CRMDailyActivityReportView
          state={state}
          onAddDAR={handleAddDAR}
          onUpdateDAR={handleUpdateDAR}
        />
      )}

      {/* 8. CLIENT MASTER REPOSITORY */}
      {activeSubTab === 'crm-clients' && (
        <CRMClientMasterView
          state={state}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {/* 9. MARKETING TEAM LIVE MONITOR */}
      {activeSubTab === 'crm-team' && (
        <CRMTeamMonitor
          state={state}
        />
      )}

      {/* 10. TENDERS & BID LIFECYCLE */}
      {activeSubTab === 'tenders' && (
        <TenderManagementView
          state={state}
          currentRole="Business Development"
          userEmail={currentUserEmail}
          onUpdateState={onUpdateState as any}
        />
      )}

      {/* 11. ASSIGNED TASKS */}
      {activeSubTab === 'tasks' && (
        <div className="bg-sky-50/60 border border-sky-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wider font-mono">
              Business Development Assigned Tasks ({myTasks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map(t => (
              <div key={t.id} className="p-4 bg-white border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 shadow-sm transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-sky-700 font-bold uppercase">{t.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{t.description}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Progress: {t.percent_completed}%</span>
                    <span>Deadline: {t.deadline}</span>
                  </div>
                  <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-600 h-full rounded-full transition-all" 
                      style={{ width: `${t.percent_completed}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-sky-100">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      onClick={() => updateTaskProgress(t.id, pct)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        t.percent_completed === pct ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {myTasks.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400 font-mono text-xs">
                No active Business Development tasks assigned.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
