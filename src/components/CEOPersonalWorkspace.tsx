import { useState, useMemo, FormEvent } from 'react';
import { 
  AppState, TDPlan, TDSessionRecord, TDTrainer, TDComplianceRadarItem,
  ITProject, ITTask, OtherInitiative, MeetingRecord, MeetingActionPoint,
  ContextFile, MyWorkItem, LiveUpdateEvent, TDSessionStatus
} from '../types';
import { logAuditEntry } from '../data/store';
import { 
  GraduationCap, Laptop, Lightbulb, Users, Calendar, CheckCircle2, 
  AlertTriangle, Clock, Plus, Filter, Search, Download, Printer, 
  ArrowRight, Shield, RefreshCw, Sparkles, ChevronRight, Eye, 
  FileText, Check, X, Upload, MessageSquare, AlertCircle, 
  CheckCircle, HelpCircle, Activity, Briefcase, ChevronDown, 
  ExternalLink, Layers, PieChart as PieIcon, BarChart2, Bookmark,
  TrendingUp, Compass, Flame, ShieldAlert, Award, FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';

interface CEOPersonalWorkspaceProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
}

type WorkspaceTab = 
  | 'overview' 
  | 'my_work' 
  | 'td_portfolio' 
  | 'it_portfolio' 
  | 'initiatives' 
  | 'meetings' 
  | 'live_feed' 
  | 'reports';

type SimulatedRole = 'CEO' | 'Jyothy' | 'Raghavendra' | 'Arpitha' | 'Training Officer';

export default function CEOPersonalWorkspace({
  state,
  onUpdateState,
  currentUserEmail
}: CEOPersonalWorkspaceProps) {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [activeRole, setActiveRole] = useState<SimulatedRole>('CEO');
  const [drilldownUnit, setDrilldownUnit] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals & Drawers
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewInitiativeModalOpen, setIsNewInitiativeModalOpen] = useState(false);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [selectedMeetingForMoM, setSelectedMeetingForMoM] = useState<MeetingRecord | null>(null);
  const [evidenceViewerFile, setEvidenceViewerFile] = useState<ContextFile | null>(null);
  const [aiInsightPrompt, setAiInsightPrompt] = useState('');
  const [activeReportType, setActiveReportType] = useState<string>('td_monthly');

  // Quick Update Form State
  const [quickUpdateForm, setQuickUpdateForm] = useState({
    title: '',
    portfolio: 'T&D' as 'T&D' | 'IT' | 'Other Initiatives' | 'Management & Meetings',
    summary: '',
    outcome: '',
    status: 'Completed' as const,
    file_name: '',
    caption: ''
  });

  // Session Edit / Create Form
  const [sessionForm, setSessionForm] = useState<Partial<TDSessionRecord>>({
    topic: '',
    unit_or_client: 'City General Hospital (Vani Vilas Wing)',
    category: 'Hospital Protocol',
    planned_date: new Date().toISOString().split('T')[0],
    actual_date: new Date().toISOString().split('T')[0],
    trainer: 'Narsu',
    duration_hours: 3.0,
    target_participants: 20,
    attended_participants: 20,
    attendance_pct: 100,
    evaluation_required: true,
    evaluated_count: 20,
    passed_count: 19,
    failed_count: 1,
    pass_pct: 95,
    status: 'Completed',
    remarks: '',
    follow_up_action: ''
  });

  // Task Form State
  const [itTaskForm, setItTaskForm] = useState<Partial<ITTask>>({
    project_id: 'ITP-001',
    project_name: 'OpsVision',
    module_name: 'Field Execution',
    task_title: '',
    description: '',
    owner: 'Raghavendra',
    planned_start: new Date().toISOString().split('T')[0],
    planned_end: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'In Progress',
    percent_completed: 25,
    priority: 'High',
    remarks: ''
  });

  // Initiative Form State
  const [initForm, setInitForm] = useState<Partial<OtherInitiative>>({
    name: '',
    description: '',
    category: 'CSR',
    date_period: 'Q3 2026',
    owner: 'Jyothy',
    priority: 'High',
    due_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    status: 'In Progress',
    outcome: '',
    remarks: ''
  });

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState<Partial<MeetingRecord>>({
    title: '',
    meeting_type: 'Management Committee',
    is_recurring: false,
    date_time: new Date().toISOString().slice(0, 16),
    venue_or_link: 'Boardroom A / Google Meet Hybrid',
    organizer: 'CEO Office',
    portfolio: 'Enterprise',
    participants: ['CEO', 'Jyothy', 'Raghavendra', 'Arpitha', 'Narsu'],
    agenda: ['1. Operational KPI Review', '2. T&D Milestone Report', '3. Action Items']
  });

  // Data Fallbacks from State
  const tdPlans = state.tdPlans || [];
  const tdSessions = state.tdSessions || [];
  const tdTrainers = state.tdTrainers || [];
  const tdComplianceRadar = state.tdComplianceRadar || [];
  const itProjects = state.itProjects || [];
  const itTasks = state.itTasks || [];
  const otherInitiatives = state.otherInitiatives || [];
  const meetings = state.meetings || [];
  const meetingActions = state.meetingActions || [];
  const myWorkItems = state.myWorkItems || [];
  const liveUpdates = state.liveUpdates || [];

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // -------------------------------------------------------------
  // RBAC Role Filter Logic
  // -------------------------------------------------------------
  const filteredITTasks = useMemo(() => {
    if (activeRole === 'Raghavendra') {
      return itTasks.filter(t => t.owner.toLowerCase().includes('raghavendra'));
    }
    if (activeRole === 'Arpitha') {
      return itTasks.filter(t => t.owner.toLowerCase().includes('arpitha'));
    }
    return itTasks; // CEO, Jyothy, and Training Officer see all / general
  }, [itTasks, activeRole]);

  const filteredTDSessions = useMemo(() => {
    if (activeRole === 'Training Officer') {
      return tdSessions.filter(s => 
        s.trainer.toLowerCase().includes('narsu') || 
        s.trainer.toLowerCase().includes('meera') ||
        s.unit_or_client.toLowerCase().includes('hospital')
      );
    }
    if (drilldownUnit) {
      return tdSessions.filter(s => s.unit_or_client.toLowerCase().includes(drilldownUnit.toLowerCase()));
    }
    return tdSessions;
  }, [tdSessions, activeRole, drilldownUnit]);

  const filteredMyWork = useMemo(() => {
    if (activeRole === 'Raghavendra') {
      return myWorkItems.filter(i => i.owner.toLowerCase().includes('raghavendra') || i.portfolio === 'IT');
    }
    if (activeRole === 'Arpitha') {
      return myWorkItems.filter(i => i.owner.toLowerCase().includes('arpitha') || i.portfolio === 'IT');
    }
    if (activeRole === 'Training Officer') {
      return myWorkItems.filter(i => i.owner.toLowerCase().includes('narsu') || i.owner.toLowerCase().includes('meera') || i.portfolio === 'T&D');
    }
    if (activeRole === 'Jyothy') {
      return myWorkItems.filter(i => i.owner.toLowerCase().includes('jyothy') || i.owner.toLowerCase().includes('all'));
    }
    return myWorkItems; // CEO sees all items
  }, [myWorkItems, activeRole]);

  // -------------------------------------------------------------
  // Management Metrics Rollup
  // -------------------------------------------------------------
  const tdCompletedSessions = tdSessions.filter(s => s.status === 'Completed').length;
  const tdPlannedSessions = tdSessions.length;
  const tdAchievementPct = tdPlannedSessions > 0 ? Math.round((tdCompletedSessions / tdPlannedSessions) * 100) : 0;
  
  const totalPaxTrained = tdSessions.reduce((sum, s) => sum + (s.attended_participants || 0), 0);
  const avgAttendancePct = tdSessions.filter(s => s.attendance_pct).length > 0
    ? Math.round(tdSessions.reduce((sum, s) => sum + (s.attendance_pct || 0), 0) / tdSessions.filter(s => s.attendance_pct).length)
    : 95;

  const totalEvaluated = tdSessions.reduce((sum, s) => sum + (s.evaluated_count || 0), 0);
  const totalPassed = tdSessions.reduce((sum, s) => sum + (s.passed_count || 0), 0);
  const avgPassPct = totalEvaluated > 0 ? Math.round((totalPassed / totalEvaluated) * 100) : 96;

  const itTotalProjects = itProjects.length;
  const itAvgProgress = itProjects.length > 0 
    ? Math.round(itProjects.reduce((sum, p) => sum + p.progress_pct, 0) / itProjects.length) 
    : 0;
  const itActiveBlockers = itTasks.filter(t => t.blocker && t.status !== 'Completed').length;

  const activeInitiativesCount = otherInitiatives.filter(i => i.status === 'In Progress').length;
  const openMeetingActionsCount = meetingActions.filter(a => a.status === 'Open' || a.status === 'In Progress').length;

  // -------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------
  const handleQuickUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newEventId = `UPD-${Date.now()}`;
    const newUpdate: LiveUpdateEvent = {
      id: newEventId,
      timestamp: new Date().toISOString(),
      actor: activeRole,
      actor_role: activeRole === 'CEO' ? 'CEO' : activeRole === 'Jyothy' ? 'Portfolio Head' : 'Executor',
      event_type: 'COMPLETED_ACTIVITY',
      portfolio: quickUpdateForm.portfolio,
      summary: quickUpdateForm.title,
      detail: quickUpdateForm.summary + (quickUpdateForm.outcome ? ` | Outcome: ${quickUpdateForm.outcome}` : ''),
      related_id: newEventId,
      status_badge: 'Completed'
    };

    const newWorkItem: MyWorkItem = {
      id: `MW-${Date.now()}`,
      title: quickUpdateForm.title,
      type: quickUpdateForm.portfolio === 'T&D' ? 'T&D Session' : quickUpdateForm.portfolio === 'IT' ? 'IT Task' : 'Initiative',
      portfolio: quickUpdateForm.portfolio,
      due_date: new Date().toISOString().split('T')[0],
      owner: activeRole,
      status: 'Completed',
      priority: 'High',
      completion_pct: 100,
      outcome: quickUpdateForm.outcome || quickUpdateForm.summary
    };

    const nextState: AppState = {
      ...state,
      liveUpdates: [newUpdate, ...liveUpdates],
      myWorkItems: [newWorkItem, ...myWorkItems]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'QuickUpdate', newEventId, `Quick update recorded by ${activeRole}: ${quickUpdateForm.title}`);
    onUpdateState(nextState);
    setIsQuickUpdateOpen(false);
    setQuickUpdateForm({
      title: '',
      portfolio: 'T&D',
      summary: '',
      outcome: '',
      status: 'Completed',
      file_name: '',
      caption: ''
    });
    showToast('Activity recorded & live management feed updated instantly!');
  };

  const handleRecordSessionSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newSessionId = `TDS-${Date.now()}`;
    const targetPax = Number(sessionForm.target_participants) || 20;
    const attendedPax = Number(sessionForm.attended_participants) || targetPax;
    const attPct = Math.round((attendedPax / targetPax) * 100);
    const evalCount = Number(sessionForm.evaluated_count) || attendedPax;
    const passCount = Number(sessionForm.passed_count) || evalCount;
    const failCount = Math.max(0, evalCount - passCount);
    const passPct = evalCount > 0 ? Math.round((passCount / evalCount) * 100) : 100;

    const newSession: TDSessionRecord = {
      id: newSessionId,
      unit_or_client: sessionForm.unit_or_client || 'General Unit',
      topic: sessionForm.topic || 'Mandatory Safety & Compliance Training',
      category: (sessionForm.category as any) || 'Mandatory Compliance',
      planned_date: sessionForm.planned_date || new Date().toISOString().split('T')[0],
      actual_date: sessionForm.actual_date || new Date().toISOString().split('T')[0],
      trainer: sessionForm.trainer || activeRole,
      trainer_email: `${(sessionForm.trainer || 'trainer').toLowerCase().replace(/\s+/g, '.')}@spoorthy.in`,
      duration_hours: Number(sessionForm.duration_hours) || 3.0,
      target_participants: targetPax,
      attended_participants: attendedPax,
      attendance_pct: attPct,
      evaluation_required: sessionForm.evaluation_required ?? true,
      evaluated_count: evalCount,
      passed_count: passCount,
      failed_count: failCount,
      pass_pct: passPct,
      status: (sessionForm.status as any) || 'Completed',
      remarks: sessionForm.remarks || 'Conducted successfully on site with physical attendance verification.',
      follow_up_action: sessionForm.follow_up_action || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evidence_files: [
        {
          id: `EV-${Date.now()}`,
          file_name: `${(sessionForm.unit_or_client || 'Session').replace(/\s+/g, '_')}_Photo_1.jpg`,
          file_type: 'image',
          file_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
          uploaded_by: activeRole,
          uploaded_at: new Date().toISOString(),
          version: 'v1.0',
          context_type: 'Session',
          context_id: newSessionId,
          caption: 'Live training session conducted on site with verification sign-off'
        }
      ]
    };

    const newUpdate: LiveUpdateEvent = {
      id: `UPD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: activeRole,
      actor_role: 'Training Officer',
      event_type: 'COMPLETED_ACTIVITY',
      portfolio: 'T&D',
      summary: `Training Conducted: ${newSession.topic}`,
      detail: `At ${newSession.unit_or_client} by ${newSession.trainer}. ${attendedPax} Pax attended (${passPct}% pass rate). Photo evidence attached.`,
      related_id: newSessionId,
      status_badge: `${passPct}% Pass`
    };

    const nextState: AppState = {
      ...state,
      tdSessions: [newSession, ...tdSessions],
      liveUpdates: [newUpdate, ...liveUpdates]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'TDSession', newSessionId, `Session conducted at ${newSession.unit_or_client}`);
    onUpdateState(nextState);
    setIsSessionModalOpen(false);
    showToast(`Training record for ${newSession.unit_or_client} stored with evidence!`);
  };

  const handleConvertActionToTask = (action: MeetingActionPoint) => {
    const newTaskId = `ITT-${Date.now()}`;
    const newTask: ITTask = {
      id: newTaskId,
      project_id: 'ITP-001',
      project_name: action.target_portfolio === 'IT' ? 'OpsVision' : action.target_portfolio === 'T&D' ? 'T&D Operational Excellence' : 'Corporate Governance',
      module_name: 'Management Action Item',
      task_title: action.action_title,
      description: action.description,
      owner: action.owner || 'Raghavendra',
      planned_start: new Date().toISOString().split('T')[0],
      planned_end: action.due_date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      status: 'In Progress',
      percent_completed: 10,
      priority: 'High',
      remarks: `Converted from Meeting: ${action.meeting_title}`,
      evidence_files: []
    };

    const updatedActions = meetingActions.map(a => 
      a.id === action.id ? { ...a, converted_to_task_id: newTaskId, status: 'In Progress' as const } : a
    );

    const newUpdate: LiveUpdateEvent = {
      id: `UPD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: activeRole,
      actor_role: 'CEO Office',
      event_type: 'ACTION_COMPLETED',
      portfolio: 'Management & Meetings',
      summary: `Meeting Action Converted to Task: ${action.action_title}`,
      detail: `Assigned to ${action.owner} under ${action.target_portfolio} portfolio with deadline ${action.due_date}.`,
      related_id: newTaskId,
      status_badge: 'Task Created'
    };

    const nextState: AppState = {
      ...state,
      itTasks: [newTask, ...itTasks],
      meetingActions: updatedActions,
      liveUpdates: [newUpdate, ...liveUpdates]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'TaskFromAction', newTaskId, `Meeting action converted to portfolio task`);
    onUpdateState(nextState);
    showToast(`Meeting action point converted to live portfolio task for ${action.owner}!`);
  };

  const handleUpdateTaskProgress = (taskId: string, pct: number) => {
    const nextTasks = itTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          percent_completed: pct,
          status: pct === 100 ? ('Completed' as const) : pct > 0 ? ('In Progress' as const) : ('Planned' as const)
        };
      }
      return t;
    });

    const target = itTasks.find(t => t.id === taskId);
    const nextState: AppState = { ...state, itTasks: nextTasks };
    if (pct === 100 && target) {
      const newUpdate: LiveUpdateEvent = {
        id: `UPD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: activeRole,
        actor_role: 'IT Engineer',
        event_type: 'COMPLETED_ACTIVITY',
        portfolio: 'IT',
        summary: `IT Task Completed: ${target.task_title}`,
        detail: `Module ${target.module_name} marked 100% complete by ${activeRole}.`,
        related_id: taskId,
        status_badge: '100% Done'
      };
      nextState.liveUpdates = [newUpdate, ...liveUpdates];
    }

    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'ITTask', taskId, `Updated progress to ${pct}%`);
    onUpdateState(nextState);
    showToast(`Task progress updated to ${pct}%`);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-wide">{successToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EXECUTIVE HEADER & ROLE SIMULATION BAR                         */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-600/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                CEO Unified Portfolio Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">Capture Once • Live Dashboards • Multi-Portfolio</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Personal Management &amp; Strategy Cockpit
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Real-time management oversight across <span className="text-sky-300 font-medium">Training &amp; Development</span>, <span className="text-cyan-300 font-medium">IT Projects</span>, <span className="text-emerald-300 font-medium">Organizational Initiatives</span>, and <span className="text-indigo-300 font-medium">Executive Meetings</span>.
            </p>
          </div>

          {/* Role Switching & Quick Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#131f33] border border-sky-800/60 rounded-2xl p-1.5 flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">Simulate View:</span>
              {(['CEO', 'Jyothy', 'Raghavendra', 'Arpitha', 'Training Officer'] as SimulatedRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    showToast(`Switched view to: ${role}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeRole === role
                      ? 'bg-sky-500 text-white font-bold shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsQuickUpdateOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Quick Update / Log</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* WORKSPACE NAVIGATION TABS                                     */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-sky-900/30 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Executive Portfolio', icon: Compass, badge: null },
            { id: 'my_work', label: 'My Work & Execution', icon: Bookmark, badge: filteredMyWork.length },
            { id: 'td_portfolio', label: 'T&D Compliance Suite', icon: GraduationCap, badge: `${tdAchievementPct}%` },
            { id: 'it_portfolio', label: 'IT Projects (OpsVision, HRMS)', icon: Laptop, badge: `${itProjects.length}` },
            { id: 'initiatives', label: 'Other Initiatives (ISO/CSR)', icon: Lightbulb, badge: otherInitiatives.length },
            { id: 'meetings', label: 'Meetings & MoM Suite', icon: Calendar, badge: openMeetingActionsCount > 0 ? `${openMeetingActionsCount} Open` : null },
            { id: 'live_feed', label: 'Live Updates Stream', icon: Activity, badge: liveUpdates.length },
            { id: 'reports', label: 'Live Report & Print Station', icon: Printer, badge: '8 Reports' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE PORTFOLIO (PAST, CURRENT, FUTURE)                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Portfolio Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* T&D Card */}
            <div 
              onClick={() => setActiveTab('td_portfolio')}
              className="bg-[#0e1626] border border-sky-900/40 hover:border-sky-500/60 rounded-3xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800/40">
                  {tdAchievementPct}% Achieved
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {tdCompletedSessions} <span className="text-xs font-normal text-slate-400">/ {tdPlannedSessions} Sessions Conducted</span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">Training &amp; Development</p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{totalPaxTrained} Pax Trained</span>
                <span className="text-emerald-400 font-bold">{avgPassPct}% Pass Rate</span>
              </div>
            </div>

            {/* IT Projects Card */}
            <div 
              onClick={() => setActiveTab('it_portfolio')}
              className="bg-[#0e1626] border border-sky-900/40 hover:border-cyan-500/60 rounded-3xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition">
                  <Laptop className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                  {itAvgProgress}% Avg Progress
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {itTotalProjects} <span className="text-xs font-normal text-slate-400">Active Software Projects</span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">IT Portfolio (Jyothy / Raghavendra / Arpitha)</p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>OpsVision, HRMS, VAMS</span>
                <span className={itActiveBlockers > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {itActiveBlockers} Blocker
                </span>
              </div>
            </div>

            {/* Other Initiatives Card */}
            <div 
              onClick={() => setActiveTab('initiatives')}
              className="bg-[#0e1626] border border-sky-900/40 hover:border-emerald-500/60 rounded-3xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  {activeInitiativesCount} In Progress
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {otherInitiatives.length} <span className="text-xs font-normal text-slate-400">Organisational Drives</span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">Other Initiatives Register</p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>ISO 27001, CSR, Uniforms</span>
                <span className="text-emerald-400 font-semibold">1 Completed</span>
              </div>
            </div>

            {/* Management & Meetings Card */}
            <div 
              onClick={() => setActiveTab('meetings')}
              className="bg-[#0e1626] border border-sky-900/40 hover:border-indigo-500/60 rounded-3xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">
                  {openMeetingActionsCount} Open Actions
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {meetings.length} <span className="text-xs font-normal text-slate-400">Meetings Tracked</span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1">Management &amp; Meetings MoM</p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>100% Decisions Documented</span>
                <span className="text-sky-400 font-semibold">Convert to Tasks</span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PAST, CURRENT, AND FUTURE ROADMAP MATRIX                      */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  Past, Current &amp; Future Execution Horizon
                </h2>
                <p className="text-xs text-slate-400">
                  Captures work at the point of execution — What was planned, what happened, and what is coming next.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: PAST (What was Completed) */}
              <div className="bg-[#121c2e] border border-slate-800/80 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Past / What Happened
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Evidence Verified</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {tdSessions.filter(s => s.status === 'Completed').slice(0, 3).map((s) => (
                    <div key={s.id} className="p-3 bg-[#0a1120] border border-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800/50">
                          T&D Session
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.actual_date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{s.topic}</h4>
                      <p className="text-[11px] text-slate-400">{s.unit_or_client} • Trainer: {s.trainer}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                        <span>Attended: {s.attended_participants}/{s.target_participants}</span>
                        <span className="text-emerald-400 font-bold">{s.pass_pct}% Pass</span>
                      </div>
                      {s.evidence_files && s.evidence_files.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-sky-400">
                          <ImageIcon className="w-3 h-3" />
                          <span>{s.evidence_files.length} Photo / Doc Attached</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {itTasks.filter(t => t.status === 'Completed').slice(0, 2).map((t) => (
                    <div key={t.id} className="p-3 bg-[#0a1120] border border-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                          IT Task ({t.project_name})
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">100% Done</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{t.task_title}</h4>
                      <p className="text-[11px] text-slate-400">Owner: {t.owner} • Module: {t.module_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: CURRENT (In Progress & At Risk) */}
              <div className="bg-[#121c2e] border border-sky-900/50 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-sky-900/40 mb-3">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                    Current / Active Work
                  </span>
                  <span className="text-[11px] text-sky-400 font-mono">Real-Time</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {itProjects.map((p) => (
                    <div key={p.id} className="p-3 bg-[#0a1120] border border-sky-900/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">{p.progress_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all"
                          style={{ width: `${p.progress_pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Lead: {p.owner}</span>
                        <span className="text-slate-400 font-mono">Target: {p.target_date}</span>
                      </div>
                    </div>
                  ))}

                  {meetingActions.filter(a => a.status === 'In Progress').map((a) => (
                    <div key={a.id} className="p-3 bg-[#0a1120] border border-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                          Meeting Action ({a.target_portfolio})
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">Due {a.due_date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{a.action_title}</h4>
                      <p className="text-[11px] text-slate-400">Owner: {a.owner}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: FUTURE (Planned & Upcoming) */}
              <div className="bg-[#121c2e] border border-slate-800/80 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Future / What is Coming Next
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Schedules</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {tdSessions.filter(s => s.status === 'Planned' || s.status === 'Postponed').map((s) => (
                    <div key={s.id} className="p-3 bg-[#0a1120] border border-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Postponed' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' : 'bg-sky-950 text-sky-400 border border-sky-800/50'
                        }`}>
                          {s.status}: T&D
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.planned_date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{s.topic}</h4>
                      <p className="text-[11px] text-slate-400">{s.unit_or_client} • Trainer: {s.trainer}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                        <span>Target: {s.target_participants} Pax</span>
                        <button
                          onClick={() => {
                            setSessionForm({
                              ...s,
                              actual_date: new Date().toISOString().split('T')[0],
                              attended_participants: s.target_participants,
                              evaluated_count: s.target_participants,
                              passed_count: s.target_participants,
                              status: 'Completed'
                            });
                            setIsSessionModalOpen(true);
                          }}
                          className="px-2 py-0.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white rounded text-[10px] font-bold transition"
                        >
                          Record Completion
                        </button>
                      </div>
                    </div>
                  ))}

                  {meetings.filter(m => m.status === 'Scheduled').map((m) => (
                    <div key={m.id} className="p-3 bg-[#0a1120] border border-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                          {m.meeting_type}
                        </span>
                        <span className="text-[10px] text-indigo-300 font-mono">{m.date_time.slice(0, 10)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.venue_or_link}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* INTELLIGENCE LAYER & EXECUTIVE NATURAL LANGUAGE QUERIES       */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
              <h3 className="text-base font-bold text-white">Management Intelligence &amp; Exceptions</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Instant automated answers derived from live structured work records. No manual report recreation.
            </p>

            {/* Quick Query Pill Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'What changed since yesterday?',
                'Which T&D sessions are at risk or postponed?',
                'Which units are behind plan in compliance?',
                'What open actions remain from last 3 management meetings?'
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => setAiInsightPrompt(query)}
                  className="px-3.5 py-1.5 bg-[#142036] hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-sky-900/40 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  <span>{query}</span>
                </button>
              ))}
            </div>

            {/* Simulated Insight Display */}
            {aiInsightPrompt && (
              <div className="bg-[#090f1b] border border-sky-500/30 rounded-2xl p-4 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-sky-400 font-bold border-b border-sky-900/40 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Query: "{aiInsightPrompt}"
                  </span>
                  <button onClick={() => setAiInsightPrompt('')} className="text-slate-500 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {aiInsightPrompt.includes('changed since yesterday') && (
                  <div className="text-slate-300 space-y-1.5 pt-1">
                    <p>• <strong>T&D:</strong> Narsu conducted "Hospital Disinfection & Isolation Room Protocol" at Vani Vilas Hospital. 24 guards certified (95.8% pass). 2 evidence photos uploaded.</p>
                    <p>• <strong>IT:</strong> Raghavendra completed 50m GPS Geofence validation for OpsVision at Valley Tech Park Gate 2.</p>
                    <p>• <strong>Meetings:</strong> Management Committee approved ₹1.8L for OpsVision hardware beacons and relief guard deployment.</p>
                  </div>
                )}

                {aiInsightPrompt.includes('at risk or postponed') && (
                  <div className="text-slate-300 space-y-1.5 pt-1">
                    <p>• <strong>Postponed:</strong> "Beach Area Emergency Water Rescue & CPR First Aid" at Sunsand Beach Resort postponed to July 21 due to coastal cyclone alert.</p>
                    <p>• <strong>Refresher Due:</strong> Hazardous Chemical Handling at Northside Freight Depot has 12 overdue certifications.</p>
                  </div>
                )}

                {aiInsightPrompt.includes('behind plan') && (
                  <div className="text-slate-300 space-y-1.5 pt-1">
                    <p>• <strong>Valley Tech Park Hub (S-203):</strong> низ competency score (74%) triggered mandatory weekend ISO 9001 refresher batch.</p>
                    <p>• <strong>Northside Freight Depot (S-205):</strong> Chemical spillage compliance at 85% vs 95% threshold.</p>
                  </div>
                )}

                {aiInsightPrompt.includes('open actions') && (
                  <div className="text-slate-300 space-y-1.5 pt-1">
                    <p>• <strong>ACT-001 (IT / Raghavendra):</strong> Expedite OpsVision GPS Geofencing rollout to Vani Vilas Hospital Ward (Due July 22 - 70% complete).</p>
                    <p>• <strong>ACT-002 (T&D / Narsu):</strong> Schedule mandatory ISO 9001 refresher batch for Valley Tech Park crew (Due July 20 - 60% complete).</p>
                    <p>• <strong>ACT-003 (IT / Arpitha):</strong> Finalize Meta WhatsApp Business API webhook for VAMS visitor pass (Due July 25 - 50% complete).</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MY WORK & EXECUTION WORKSPACE ("MY WORK")                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'my_work' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800/40 uppercase tracking-wider">
                  Personal Task &amp; Execution Desk
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Active Worklist for: <span className="text-sky-400">{activeRole}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Low-friction capture of day-to-day work, follow-ups, and outcomes connected to live evidence.
                </p>
              </div>

              <button
                onClick={() => setIsQuickUpdateOpen(true)}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log Immediate Outcome</span>
              </button>
            </div>

            {/* Time Horizons: Today, This Week, This Month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today */}
              <div className="bg-[#121c2e] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Today</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {filteredMyWork.filter(w => w.status === 'Completed').length} / {filteredMyWork.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {filteredMyWork.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border transition ${
                        item.status === 'Completed' 
                          ? 'bg-[#09111e]/60 border-emerald-900/40 text-slate-300' 
                          : 'bg-[#0e1626] border-slate-800 hover:border-sky-500/50 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-300">
                          {item.portfolio}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          item.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className={`text-xs font-semibold ${item.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {item.title}
                      </h4>
                      {item.outcome && (
                        <p className="text-[11px] text-emerald-400/90 pt-1 font-mono">
                          ✓ {item.outcome}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
                        <span>Due: {item.due_date}</span>
                        <span>Owner: {item.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* This Week */}
              <div className="bg-[#121c2e] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">This Week's Focus</span>
                  <span className="text-[11px] text-slate-400 font-mono">Roadmap</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#0e1626] border border-slate-800 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400">
                      IT: OpsVision
                    </span>
                    <h4 className="text-xs font-bold text-white">Deploy offline SQLite queue sync hotfix to basement patrol devices</h4>
                    <p className="text-[11px] text-slate-400">Assigned: Raghavendra • Target: July 18</p>
                  </div>

                  <div className="p-3 bg-[#0e1626] border border-slate-800 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400">
                      T&D: Valley Tech
                    </span>
                    <h4 className="text-xs font-bold text-white">Execute mandatory ISO 9001 weekend refresher for 30 guards</h4>
                    <p className="text-[11px] text-slate-400">Assigned: Meera Iyer • Target: July 20</p>
                  </div>

                  <div className="p-3 bg-[#0e1626] border border-slate-800 rounded-xl space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">
                      Initiative: ISO 27001
                    </span>
                    <h4 className="text-xs font-bold text-white">Complete Stage 1 auditor gap closure register review</h4>
                    <p className="text-[11px] text-slate-400">Assigned: Jyothy • Target: July 21</p>
                  </div>
                </div>
              </div>

              {/* This Month / Major Outcomes */}
              <div className="bg-[#121c2e] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Month Achievements</span>
                  <span className="text-[11px] text-slate-400 font-mono">July 2026</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 bg-[#0e1626] border border-emerald-900/30 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold">✓ T&D Compliance Record:</span>
                    <p className="text-[11px] text-slate-300">140+ sessions scheduled across healthcare, IT tech parks, and commercial sites.</p>
                  </div>
                  <div className="p-3 bg-[#0e1626] border border-cyan-900/30 rounded-xl space-y-1">
                    <span className="text-cyan-400 font-bold">✓ IT OpsVision Geofence:</span>
                    <p className="text-[11px] text-slate-300">50m radius GPS geofence deployed at high-priority client hubs.</p>
                  </div>
                  <div className="p-3 bg-[#0e1626] border border-indigo-900/30 rounded-xl space-y-1">
                    <span className="text-indigo-400 font-bold">✓ Executive MoM Automation:</span>
                    <p className="text-[11px] text-slate-300">Direct action conversion from meetings into portfolio workstreams.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. T&D COMPLIANCE SUITE (PLANS, CALENDAR, SESSIONS, EVIDENCE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'td_portfolio' && (
        <div className="space-y-6">
          {/* T&D Functional Toolbar */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl font-bold text-white">T&amp;D Core Functional Architecture</h2>
              </div>
              <p className="text-xs text-slate-400">
                Annual/Monthly Plan → Unit/Client Plan → Scheduled Session → Conducted → Attendance → Evaluation → Evidence → Completion
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Record Session Completion</span>
              </button>
            </div>
          </div>

          {/* Unit / Client Drilldown Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold px-2">Filter Unit:</span>
            <button
              onClick={() => setDrilldownUnit(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                drilldownUnit === null 
                  ? 'bg-sky-500 text-white font-bold' 
                  : 'bg-[#10192a] text-slate-300 hover:text-white'
              }`}
            >
              All Units / Clients
            </button>
            {['Vani Vilas Hospital', 'Valley Tech Park', 'Metro Office Complex', 'Northside Freight Depot', 'Sunsand Beach Resort', 'Zenith IT Facility'].map((unit) => (
              <button
                key={unit}
                onClick={() => setDrilldownUnit(unit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  drilldownUnit === unit 
                    ? 'bg-sky-500 text-white font-bold' 
                    : 'bg-[#10192a] text-slate-300 hover:text-white'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Compliance Matrix */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-400" />
                  Compliance Training &amp; Mandatory Standards
                </h3>
                <p className="text-xs text-slate-400">
                  Live statutory compliance across healthcare, industrial, tech parks, and hospitality sites.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tdComplianceRadar.map((std) => (
                <div key={std.id} className="p-4 bg-[#121c2e] border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/40">
                      {std.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      std.risk_level === 'Low' ? 'text-emerald-400 bg-emerald-950/50' : std.risk_level === 'Medium' ? 'text-amber-400 bg-amber-950/50' : 'text-rose-400 bg-rose-950/50'
                    }`}>
                      {std.risk_level} Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{std.standard_name}</h4>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>Compliance Score</span>
                      <span className="font-mono font-bold text-sky-400">{std.compliance_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          std.compliance_pct >= 90 ? 'bg-emerald-400' : std.compliance_pct >= 80 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${std.compliance_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Certified: {std.total_certified}/{std.total_required}</span>
                    <span className="text-amber-400 font-semibold">{std.expiring_in_30_days} Expiring in 30d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Training Calendar / Sessions Record Table */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  Live Training Board &amp; Evidence Dossier ({filteredTDSessions.length} Sessions)
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time execution records with attendance logs, evaluation pass %, and photographic evidence.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sky-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Date / Status</th>
                    <th className="pb-3 px-3">Unit / Client</th>
                    <th className="pb-3 px-3">Topic / Category</th>
                    <th className="pb-3 px-3">Trainer</th>
                    <th className="pb-3 px-3">Attendance</th>
                    <th className="pb-3 px-3">Evaluation</th>
                    <th className="pb-3 px-3">Evidence</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTDSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-300 font-medium">
                          {session.actual_date || session.planned_date}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                          session.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                          session.status === 'Postponed' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                          'bg-sky-950 text-sky-400 border border-sky-800/40'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{session.unit_or_client}</div>
                        <div className="text-[11px] text-slate-400">{session.site_id || 'Campus'}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-200">{session.topic}</div>
                        <div className="text-[10px] text-sky-400">{session.category}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-300">{session.trainer}</div>
                        <div className="text-[10px] text-slate-500">{session.duration_hours} hrs</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-white">
                          {session.attended_participants || 0} / {session.target_participants}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          {session.attendance_pct || 0}% Attended
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {session.evaluation_required ? (
                          <div>
                            <div className="font-bold text-emerald-400">{session.pass_pct || 0}% Pass</div>
                            <div className="text-[10px] text-slate-400">
                              {session.passed_count || 0} Pass • {session.failed_count || 0} Fail
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Not Required</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {session.evidence_files && session.evidence_files.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {session.evidence_files.map((file) => (
                              <button
                                key={file.id}
                                onClick={() => setEvidenceViewerFile(file)}
                                className="p-1.5 bg-[#142036] hover:bg-sky-500/30 text-sky-400 border border-sky-800/50 rounded-lg text-xs transition"
                                title={file.file_name}
                              >
                                {file.file_type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                            <span className="text-[10px] text-slate-400">({session.evidence_files.length})</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No file</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {session.status !== 'Completed' ? (
                          <button
                            onClick={() => {
                              setSessionForm({
                                ...session,
                                actual_date: new Date().toISOString().split('T')[0],
                                attended_participants: session.target_participants,
                                evaluated_count: session.target_participants,
                                passed_count: session.target_participants,
                                status: 'Completed'
                              });
                              setIsSessionModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition"
                          >
                            Complete
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. IT PORTFOLIO (OPSVISION, HRMS, VAMS, CEO DASHBOARD)        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'it_portfolio' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">IT Portfolio &amp; Software Workstreams</h2>
              </div>
              <p className="text-xs text-slate-400">
                Technology projects under Jyothy’s management oversight with specialized engineer assignments (Raghavendra &amp; Arpitha).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add IT Task</span>
              </button>
            </div>
          </div>

          {/* Project Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itProjects.map((project) => (
              <div key={project.id} className="p-5 bg-[#0e1626] border border-sky-900/40 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono">
                    {project.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    project.priority === 'Critical' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {project.priority}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{project.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-mono font-bold text-cyan-400">{project.progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${project.progress_pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lead: <strong className="text-slate-200">{project.owner}</strong></span>
                  <span className="font-mono text-slate-400">Target: {project.target_date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* IT Tasks List with Owner Filtering */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Assigned IT Tasks ({filteredITTasks.length} Tasks)
                </h3>
                <p className="text-xs text-slate-400">
                  Showing tasks visible to current role: <span className="text-cyan-400 font-bold">{activeRole}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredITTasks.map((task) => (
                <div key={task.id} className="p-4 bg-[#121c2e] border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          {task.project_name}
                        </span>
                        <span className="text-xs text-slate-400">• {task.module_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          Owner: {task.owner}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{task.task_title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400">{task.percent_completed}%</span>
                        <div className="text-[10px] text-slate-400 font-mono">Due: {task.planned_end}</div>
                      </div>

                      {/* Slider to update completion */}
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={task.percent_completed}
                        onChange={(e) => handleUpdateTaskProgress(task.id, Number(e.target.value))}
                        className="w-24 accent-cyan-500 cursor-pointer"
                        title="Slide to update progress"
                      />
                    </div>
                  </div>

                  {task.blocker && (
                    <div className="p-2 bg-rose-950/40 border border-rose-800/50 rounded-xl text-[11px] text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span><strong>Blocker:</strong> {task.blocker}</span>
                    </div>
                  )}

                  {task.remarks && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <strong>Remarks:</strong> {task.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. OTHER INITIATIVES REGISTER                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'initiatives' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Other Organisational Initiatives Register</h2>
              </div>
              <p className="text-xs text-slate-400">
                Structured space for ISO certifications, CSR campaigns, process automations, facility upgrades, and safety drives.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNewInitiativeModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register New Initiative</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherInitiatives.map((init) => (
              <div key={init.id} className="p-5 bg-[#0e1626] border border-sky-900/40 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                    {init.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    init.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'
                  }`}>
                    {init.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{init.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{init.description}</p>
                </div>

                {init.outcome && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 font-mono">
                    <strong>Achieved Outcome:</strong> {init.outcome}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Owner: <strong className="text-slate-200">{init.owner}</strong></span>
                  <span>Period: {init.date_period} (Due: {init.due_date})</span>
                </div>

                {init.attachments && init.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-sky-400">
                    {init.attachments.map(att => (
                      <button 
                        key={att.id}
                        onClick={() => setEvidenceViewerFile(att)}
                        className="px-2.5 py-1 bg-[#142036] hover:bg-sky-500/20 border border-sky-800/40 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{att.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. MANAGEMENT & MEETINGS (CALENDAR, MOM, ACTION TRACKING)     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Management &amp; Meetings Suite</h2>
              </div>
              <p className="text-xs text-slate-400">
                Meeting Calendars, Agenda Dockets, Minutes of Meetings (MoM), Executive Decisions &amp; Action Point to Task Conversion.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNewMeetingModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Schedule Meeting</span>
              </button>
            </div>
          </div>

          {/* Action Point Tracker with "Convert to Portfolio Task" */}
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  Management Action Point Tracker ({meetingActions.length} Actions)
                </h3>
                <p className="text-xs text-slate-400">
                  Convert decision action points directly into live portfolio work items for T&amp;D, IT, or Operations.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {meetingActions.map((action) => (
                <div key={action.id} className="p-4 bg-[#121c2e] border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          {action.target_portfolio}
                        </span>
                        <span className="text-xs text-slate-400">• Meeting: {action.meeting_title}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{action.action_title}</h4>
                      <p className="text-xs text-slate-400">{action.description}</p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-indigo-300">Owner: {action.owner}</span>
                        <div className="text-[10px] text-slate-400 font-mono">Due: {action.due_date}</div>
                      </div>

                      {action.converted_to_task_id ? (
                        <span className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Task Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvertActionToTask(action)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Convert to Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Register & Decisions Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-5 bg-[#0e1626] border border-sky-900/40 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    {meeting.meeting_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{meeting.date_time.replace('T', ' ')}</span>
                </div>

                <h4 className="text-sm font-bold text-white">{meeting.title}</h4>
                <p className="text-xs text-slate-400">{meeting.venue_or_link}</p>

                {meeting.mom_text && (
                  <div className="p-3 bg-[#121c2e] border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                    <strong className="text-sky-300">Minutes of Meeting (MoM):</strong>
                    <p className="text-[11px] text-slate-400">{meeting.mom_text}</p>
                  </div>
                )}

                {meeting.decisions && meeting.decisions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Approved Decisions ({meeting.decisions.length})</span>
                    {meeting.decisions.map(dec => (
                      <div key={dec.id} className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-emerald-300">
                        • {dec.decision_text} <span className="text-[10px] text-slate-400">({dec.impact_area})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. LIVE UPDATES STREAM                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'live_feed' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-white">Live Execution Feed</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time audit stream of completed activities, scheduled sessions, blockers, and uploaded evidence.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {liveUpdates.map((event) => (
                <div key={event.id} className="p-4 bg-[#121c2e] border border-slate-800 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{event.summary}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300">
                          {event.portfolio}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{event.detail}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Logged by: <strong>{event.actor}</strong> ({event.actor_role})</span>
                      {event.status_badge && (
                        <span className="text-emerald-400 font-semibold font-mono">{event.status_badge}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. LIVE REPORT GENERATOR & PRINT STATION                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-[#0e1626] border border-sky-900/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Printer className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl font-bold text-white">Live Data Reports &amp; Print Station</h2>
              </div>
              <p className="text-xs text-slate-400">
                Reports are generated on demand from live system data. Filter and export to Print/PDF or CSV without manual compilation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Active Report</span>
              </button>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'td_monthly', label: 'T&D Monthly Plan vs Achievement' },
              { id: 'unit_trainer', label: 'Unit/Client & Trainer Performance' },
              { id: 'attendance_eval', label: 'Attendance & Evaluation Breakdown' },
              { id: 'session_evidence', label: 'Detailed Session & Evidence Dossier' },
              { id: 'personal_work', label: 'Personal Monthly Work Report' },
              { id: 'it_projects', label: 'IT Project & Milestone Report' },
              { id: 'initiatives_reg', label: 'Other Initiatives Register' },
              { id: 'meetings_mom', label: 'Management Committee MoM & Action Tracker' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setActiveReportType(r.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeReportType === r.id
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'bg-[#121c2e] text-slate-300 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Active Report Live Preview Sheet */}
          <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-300 space-y-6 font-sans">
            {/* Header Docket */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Spoorthy Integrated Solutions
                </h2>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Executive Management Information System • Official Live Report
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
                <div>Status: LIVE VERIFIED DATA</div>
              </div>
            </div>

            {/* Report Content based on selected type */}
            {activeReportType === 'td_monthly' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">T&amp;D Monthly Performance (July 2026)</h3>
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-100 rounded-xl text-center">
                  <div>
                    <div className="text-2xl font-black text-sky-700">{tdPlannedSessions}</div>
                    <div className="text-xs font-bold text-slate-600">Sessions Planned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-700">{tdCompletedSessions}</div>
                    <div className="text-xs font-bold text-slate-600">Sessions Conducted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-sky-700">{totalPaxTrained}</div>
                    <div className="text-xs font-bold text-slate-600">Guards Trained</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-700">{avgPassPct}%</div>
                    <div className="text-xs font-bold text-slate-600">Evaluation Pass Rate</div>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-2.5 border">Date</th>
                      <th className="p-2.5 border">Unit / Client</th>
                      <th className="p-2.5 border">Topic</th>
                      <th className="p-2.5 border">Trainer</th>
                      <th className="p-2.5 border">Pax</th>
                      <th className="p-2.5 border">Pass %</th>
                      <th className="p-2.5 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdSessions.map(s => (
                      <tr key={s.id} className="border">
                        <td className="p-2 border font-mono">{s.actual_date || s.planned_date}</td>
                        <td className="p-2 border font-bold">{s.unit_or_client}</td>
                        <td className="p-2 border">{s.topic}</td>
                        <td className="p-2 border">{s.trainer}</td>
                        <td className="p-2 border font-bold">{s.attended_participants || s.target_participants}</td>
                        <td className="p-2 border font-bold text-emerald-700">{s.pass_pct || 100}%</td>
                        <td className="p-2 border font-bold">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReportType === 'unit_trainer' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Trainer Utilization &amp; Unit Performance Matrix</h3>
                <div className="grid grid-cols-2 gap-4">
                  {tdTrainers.map(t => (
                    <div key={t.id} className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{t.name}</span>
                        <span className="text-sky-700">{t.rating} ★ Rating</span>
                      </div>
                      <p className="text-slate-600">Specialization: {t.specialization.join(', ')}</p>
                      <p className="text-slate-600">Assigned Units: {t.assigned_units.join(', ')}</p>
                      <div className="flex items-center justify-between pt-2 font-bold text-slate-800">
                        <span>{t.total_sessions} Sessions</span>
                        <span>{t.avg_pass_pct}% Avg Pass</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeReportType === 'meetings_mom' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Management Committee Action Points &amp; Decisions</h3>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-2.5 border">Action Item</th>
                      <th className="p-2.5 border">Portfolio</th>
                      <th className="p-2.5 border">Owner</th>
                      <th className="p-2.5 border">Due Date</th>
                      <th className="p-2.5 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetingActions.map(a => (
                      <tr key={a.id} className="border">
                        <td className="p-2 border font-bold">{a.action_title}</td>
                        <td className="p-2 border">{a.target_portfolio}</td>
                        <td className="p-2 border font-bold">{a.owner}</td>
                        <td className="p-2 border font-mono">{a.due_date}</td>
                        <td className="p-2 border font-bold text-sky-700">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Audit Stamp */}
            <div className="pt-4 border-t border-slate-400 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Digitally Signed by CEO Office • Spoorthy Integrated Solutions</span>
              <span>Confidential &amp; Proprietary Management Information</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUICK UPDATE / IMMEDIATE LOG                           */}
      {/* ------------------------------------------------------------- */}
      {isQuickUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1626] border border-sky-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold">Quick Update (Point-of-Execution)</h3>
              </div>
              <button onClick={() => setIsQuickUpdateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Portfolio Branch</label>
                <select
                  value={quickUpdateForm.portfolio}
                  onChange={(e) => setQuickUpdateForm({ ...quickUpdateForm, portfolio: e.target.value as any })}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="T&D">Training &amp; Development (T&D)</option>
                  <option value="IT">IT Projects (OpsVision, HRMS)</option>
                  <option value="Other Initiatives">Other Initiatives (ISO/CSR)</option>
                  <option value="Management & Meetings">Management &amp; Meetings</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Completed Vani Vilas emergency drill demonstration"
                  value={quickUpdateForm.title}
                  onChange={(e) => setQuickUpdateForm({ ...quickUpdateForm, title: e.target.value })}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Execution Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of what was conducted, participant count, or outcome..."
                  value={quickUpdateForm.summary}
                  onChange={(e) => setQuickUpdateForm({ ...quickUpdateForm, summary: e.target.value })}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Key Achieved Outcome (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 24 guards passed chemical dilution drill with zero errors"
                  value={quickUpdateForm.outcome}
                  onChange={(e) => setQuickUpdateForm({ ...quickUpdateForm, outcome: e.target.value })}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickUpdateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Check className="w-4 h-4" /> Save &amp; Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECORD SESSION COMPLETION                              */}
      {/* ------------------------------------------------------------- */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1626] border border-sky-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold">Session Completion &amp; Evidence Record</h3>
              </div>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSessionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unit / Client Facility</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.unit_or_client}
                    onChange={(e) => setSessionForm({ ...sessionForm, unit_or_client: e.target.value })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Training Topic</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={sessionForm.category}
                    onChange={(e) => setSessionForm({ ...sessionForm, category: e.target.value as any })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Hospital Protocol">Hospital Protocol</option>
                    <option value="Mandatory Compliance">Mandatory Compliance</option>
                    <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                    <option value="Security Tactics">Security Tactics</option>
                    <option value="Chemical & Disinfection">Chemical &amp; Disinfection</option>
                    <option value="Soft Skills & Grooming">Soft Skills &amp; Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Trainer</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.trainer}
                    onChange={(e) => setSessionForm({ ...sessionForm, trainer: e.target.value })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Actual Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.actual_date}
                    onChange={(e) => setSessionForm({ ...sessionForm, actual_date: e.target.value })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-[#121c2e] rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Target Pax</label>
                  <input
                    type="number"
                    value={sessionForm.target_participants}
                    onChange={(e) => setSessionForm({ ...sessionForm, target_participants: Number(e.target.value) })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Attended Pax</label>
                  <input
                    type="number"
                    value={sessionForm.attended_participants}
                    onChange={(e) => setSessionForm({ ...sessionForm, attended_participants: Number(e.target.value) })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Passed Pax</label>
                  <input
                    type="number"
                    value={sessionForm.passed_count}
                    onChange={(e) => setSessionForm({ ...sessionForm, passed_count: Number(e.target.value) })}
                    className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Execution Remarks</label>
                <textarea
                  rows={2}
                  value={sessionForm.remarks}
                  onChange={(e) => setSessionForm({ ...sessionForm, remarks: e.target.value })}
                  placeholder="Practical hands-on exercises conducted on site..."
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Follow-up Action</label>
                <input
                  type="text"
                  value={sessionForm.follow_up_action}
                  onChange={(e) => setSessionForm({ ...sessionForm, follow_up_action: e.target.value })}
                  placeholder="e.g. Schedule re-test for 1 guard on color-coded waste..."
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Check className="w-4 h-4" /> Save Session Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EVIDENCE VIEWER LIGHTBOX MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {evidenceViewerFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0e1626] border border-sky-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">{evidenceViewerFile.file_name}</h3>
              </div>
              <button onClick={() => setEvidenceViewerFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {evidenceViewerFile.file_type === 'image' ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[400px] flex items-center justify-center bg-black">
                <img 
                  src={evidenceViewerFile.file_url} 
                  alt={evidenceViewerFile.file_name}
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] object-contain w-full"
                />
              </div>
            ) : (
              <div className="p-8 bg-[#121c2e] rounded-2xl border border-slate-800 text-center space-y-2">
                <FileText className="w-12 h-12 text-sky-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">{evidenceViewerFile.file_name}</h4>
                <p className="text-xs text-slate-400">PDF Document Verified • Size: {evidenceViewerFile.file_size || '1.2 MB'}</p>
                <a
                  href={evidenceViewerFile.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold mt-2"
                >
                  Download / View PDF
                </a>
              </div>
            )}

            {evidenceViewerFile.caption && (
              <p className="text-xs text-slate-300 bg-[#121c2e] p-3 rounded-xl border border-slate-800">
                <strong>Caption:</strong> {evidenceViewerFile.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
              <span>Uploaded by: {evidenceViewerFile.uploaded_by}</span>
              <span>{new Date(evidenceViewerFile.uploaded_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
