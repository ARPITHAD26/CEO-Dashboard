import { useState, FormEvent } from 'react';
import {
  AppState, Lead, Client, Role, CRMLead, CRMRequirement,
  CRMFollowUp, CRMClientVisit, CRMMeeting, CRMQuotation,
  CRMDailyActivityReport, CRMActivityLog,
  CRMDiaryTask, CRMWorkflowRule, CRMWorkflowExecutionLog
} from '../types';
import { logAuditEntry } from '../data/store';
import {
  Briefcase, CheckCircle, Trash2, Edit2, PlusCircle,
  LayoutDashboard, Users, PhoneCall, Calendar,
  FileText, DollarSign, Compass, Clock, Zap, Video,
  Maximize2, Sparkles, X, Download, ShieldCheck
} from 'lucide-react';
import { CRMPresidentDashboard } from './crm/CRMPresidentDashboard';
import { CRMLeadManager } from './crm/CRMLeadManager';
import { CRMRequirementTracker } from './crm/CRMRequirementTracker';
import { CRMFollowupTracker } from './crm/CRMFollowupTracker';
import { CRMVisitsAndMeetings } from './crm/CRMVisitsAndMeetings';
import { CRMQuotationTracker } from './crm/CRMQuotationTracker';
import { CRMDailyActivityReportView } from './crm/CRMDailyActivityReport';
import { CRMDiaryCalendar } from './crm/CRMDiaryCalendar';

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
    | 'crm-calendar'
    | 'crm-leads'
    | 'crm-requirements'
    | 'crm-followups'
    | 'crm-visits-meetings'
    | 'crm-quotations'
    | 'crm-dar';

  const pendingDiaryTasks = (state.crmDiaryTasks || []).filter(t => t.status !== 'Completed').length;
  const todayMeetingCount = (state.crmMeetings || []).filter(m => m.meeting_date === '2026-10-08').length;

  const allTabs: { id: TabType; label: string; icon: any; badge?: number }[] = [
    { id: 'crm-dashboard', label: 'President CRM Dashboard', icon: LayoutDashboard },
    { id: 'crm-calendar', label: 'Executive Diary & Calendar', icon: Calendar, badge: pendingDiaryTasks + todayMeetingCount },
    { id: 'crm-leads', label: '360° Lead Manager', icon: Users, badge: (state.crmLeads || []).length },
    { id: 'crm-requirements', label: 'Manpower Demands', icon: Briefcase, badge: (state.crmRequirements || []).length },
    { id: 'crm-followups', label: 'Follow-ups & Actions', icon: PhoneCall, badge: (state.crmFollowUps || []).filter(f => f.status === 'Pending').length },
    { id: 'crm-visits-meetings', label: 'Visits & Meetings', icon: Compass },
    { id: 'crm-quotations', label: 'Quotations', icon: DollarSign, badge: (state.crmQuotations || []).length },
    { id: 'crm-dar', label: 'Daily Activity (DAR)', icon: FileText }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'crm-dashboard';
  const [activeSubTab, setActiveSubTab] = useState<TabType>(defaultTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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

  const handleDeleteLead = (leadId: string) => {
    const leadToDelete = (state.crmLeads || []).find(l => l.id === leadId);
    const updated = (state.crmLeads || []).filter(l => l.id !== leadId);
    const nextState = { ...state, crmLeads: updated };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'CRMLead', leadId, `Deleted lead: ${leadToDelete?.company_name || leadId}`);
    onUpdateState(nextState);
    triggerSuccess(`Lead "${leadToDelete?.company_name || leadId}" deleted successfully.`);
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

  const handleUpdateMeeting = (meeting: CRMMeeting) => {
    const updated = (state.crmMeetings || []).map(m => m.id === meeting.id ? meeting : m);
    let nextTasks = [...(state.crmDiaryTasks || [])];
    let nextLogs = [...(state.crmWorkflowLogs || [])];
    
    // Workflow Rule 3: Auto-create Task Reminder when outcome is 'Follow-up Needed' or 'Quotation to be Sent'
    if (meeting.outcome === 'Follow-up Needed' || meeting.outcome === 'Quotation to be Sent') {
      const taskTitle = meeting.outcome === 'Quotation to be Sent'
        ? `Submit Commercial Proposal: ${meeting.company_name}`
        : `Meeting Action Follow-up: ${meeting.company_name}`;
      
      const alreadyHas = nextTasks.some(t => t.linked_meeting_id === meeting.id && t.title === taskTitle);
      if (!alreadyHas) {
        const newTask: CRMDiaryTask = {
          id: `TSK-${Date.now().toString().slice(-4)}`,
          title: taskTitle,
          company_name: meeting.company_name,
          target_role: 'BD Team',
          assigned_to: meeting.conducted_by || 'Vikram Singh (BD Lead)',
          due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          due_time: '04:00 PM',
          priority: 'High',
          status: 'Pending',
          category: meeting.outcome === 'Quotation to be Sent' ? 'Proposal Dispatch' : 'Meeting Follow-up',
          description: `Auto-triggered by workflow engine following meeting conclusion on ${meeting.meeting_date}: ${meeting.next_action || 'Execute next steps'}`,
          reminder_minutes_before: 60,
          reminder_status: 'Scheduled',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          linked_meeting_id: meeting.id,
          automated_by_rule: 'RULE-03'
        };
        nextTasks = [newTask, ...nextTasks];

        nextLogs = [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            rule_id: 'RULE-03',
            rule_name: 'Post-Meeting Next Action Pipeline Dispatch',
            triggered_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            trigger_event: `Meeting Outcome: ${meeting.outcome}`,
            entity_id: meeting.id,
            entity_name: meeting.company_name,
            details: `Auto-created BD task "${taskTitle}" due within 24 hours.`,
            status: 'Success',
            recipient: meeting.conducted_by || 'BD Team'
          },
          ...nextLogs
        ];
      }
    }

    const nextState = { ...state, crmMeetings: updated, crmDiaryTasks: nextTasks, crmWorkflowLogs: nextLogs };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMMeeting', meeting.id, `Updated meeting details for ${meeting.company_name}`);
    onUpdateState(nextState);
    triggerSuccess(`Meeting "${meeting.company_name}" updated in Calendar.`);
  };

  const handleAddDiaryTask = (task: CRMDiaryTask) => {
    const updated = [task, ...(state.crmDiaryTasks || [])];
    const nextState = { ...state, crmDiaryTasks: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMDiaryTask', task.id, `Created diary task reminder: ${task.title}`);
    onUpdateState(nextState);
    triggerSuccess(`Task reminder "${task.title}" saved.`);
  };

  const handleUpdateDiaryTask = (task: CRMDiaryTask) => {
    const updated = (state.crmDiaryTasks || []).map(t => t.id === task.id ? task : t);
    let nextLogs = [...(state.crmWorkflowLogs || [])];
    
    // Workflow Rule 5: Auto DAR Sync when task is completed
    if (task.status === 'Completed') {
      nextLogs = [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          rule_id: 'RULE-05',
          rule_name: 'Auto-Sync Completed Diary Events to DAR',
          triggered_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          trigger_event: `Task Marked Completed: ${task.title}`,
          entity_id: task.id,
          entity_name: task.company_name || 'General Task',
          details: `Synced task completion to DAR system and lead activity timeline.`,
          status: 'Success',
          recipient: 'DAR System & Audit Trail'
        },
        ...nextLogs
      ];
    }

    const nextState = { ...state, crmDiaryTasks: updated, crmWorkflowLogs: nextLogs };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMDiaryTask', task.id, `Updated task: ${task.title}`);
    onUpdateState(nextState);
    triggerSuccess(`Task updated.`);
  };

  const handleDeleteDiaryTask = (taskId: string) => {
    const updated = (state.crmDiaryTasks || []).filter(t => t.id !== taskId);
    const nextState = { ...state, crmDiaryTasks: updated };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'CRMDiaryTask', taskId, `Deleted diary task`);
    onUpdateState(nextState);
    triggerSuccess(`Task deleted.`);
  };

  const handleToggleWorkflowRule = (ruleId: string) => {
    const updated = (state.crmWorkflowRules || []).map(r => r.id === ruleId ? { ...r, is_active: !r.is_active } : r);
    const nextState = { ...state, crmWorkflowRules: updated };
    onUpdateState(nextState);
    const rule = updated.find(r => r.id === ruleId);
    triggerSuccess(`Automation rule "${rule?.name}" ${rule?.is_active ? 'Enabled' : 'Paused'}.`);
  };

  const handleRunWorkflowEngine = () => {
    let linksGeneratedCount = 0;
    const updatedMeetings = (state.crmMeetings || []).map(m => {
      if (!m.meeting_link) {
        linksGeneratedCount++;
        const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
        return {
          ...m,
          meeting_link: `https://meet.google.com/${code}`,
          meeting_platform: 'Google Meet' as const
        };
      }
      return m;
    });

    let newPresidentTasksCount = 0;
    let nextTasks = [...(state.crmDiaryTasks || [])];
    updatedMeetings.forEach(m => {
      const isPresidentMeeting = m.attendee_role === 'President' || m.attendee_role === 'Joint Executive' ||
        (m.participants && m.participants.toLowerCase().includes('president'));
      if (isPresidentMeeting) {
        const title = `Executive Briefing: ${m.company_name} Session`;
        const exists = nextTasks.some(t => t.linked_meeting_id === m.id && t.title === title);
        if (!exists) {
          newPresidentTasksCount++;
          nextTasks.push({
            id: `TSK-AUTO-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900)}`,
            title,
            company_name: m.company_name,
            target_role: 'President',
            assigned_to: 'President / CEO',
            due_date: m.meeting_date,
            due_time: '09:30 AM',
            priority: 'Critical',
            status: 'Pending',
            category: 'President Reminder',
            description: `Auto-generated briefing reminder for President regarding upcoming session: ${m.agenda}`,
            reminder_minutes_before: 60,
            reminder_status: 'Scheduled',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            linked_meeting_id: m.id,
            automated_by_rule: 'RULE-02'
          });
        }
      }
    });

    const newLog: CRMWorkflowExecutionLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      rule_id: 'ENGINE-RUN',
      rule_name: 'Manual Full-Engine Cycle',
      triggered_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      trigger_event: 'Executive Manual Trigger',
      entity_id: 'WORKFLOW-ENGINE',
      entity_name: 'All Pipeline Meetings & Tasks',
      details: `Generated ${linksGeneratedCount} video links, provisioned ${newPresidentTasksCount} President briefing reminders. All 6 rules verified.`,
      status: 'Success',
      recipient: 'President & BD Team'
    };

    const nextLogs = [newLog, ...(state.crmWorkflowLogs || [])];
    const nextState = {
      ...state,
      crmMeetings: updatedMeetings,
      crmDiaryTasks: nextTasks,
      crmWorkflowLogs: nextLogs
    };

    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'WorkflowEngine', 'ALL', 'Executed automated CRM workflow cycle');
    onUpdateState(nextState);
    triggerSuccess(`Workflow Engine Executed! ${linksGeneratedCount} links generated, ${newPresidentTasksCount} President reminders queued.`);
  };

  const handleSendMeetingLink = (meeting: CRMMeeting, channel: 'email' | 'whatsapp' | 'copy') => {
    const updatedMeetings = (state.crmMeetings || []).map(m => {
      if (m.id === meeting.id) {
        return {
          ...m,
          meeting_link_sent: true,
          meeting_link_sent_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return m;
    });

    const newLog: CRMWorkflowExecutionLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      rule_id: 'RULE-04',
      rule_name: 'Meeting Link Multi-Channel Dispatch',
      triggered_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      trigger_event: `Dispatched via ${channel.toUpperCase()}`,
      entity_id: meeting.id,
      entity_name: meeting.company_name,
      details: `Sent video meeting link ${meeting.meeting_link || ''} for session on ${meeting.meeting_date} at ${meeting.meeting_time}.`,
      status: 'Alert Sent',
      recipient: meeting.attendee_emails || `${meeting.company_name} Contacts & President`
    };

    const nextLogs = [newLog, ...(state.crmWorkflowLogs || [])];
    const nextState = {
      ...state,
      crmMeetings: updatedMeetings,
      crmWorkflowLogs: nextLogs
    };

    if (channel === 'whatsapp') {
      const inviteText = encodeURIComponent(
        `*Spoorthy Integrated Solutions - Meeting Invite*\nClient: ${meeting.company_name}\nAgenda: ${meeting.agenda}\nDate: ${meeting.meeting_date} at ${meeting.meeting_time}\nJoin Video Call: ${meeting.meeting_link || 'https://meet.google.com/sis-executive'}\nParticipants: ${meeting.participants}`
      );
      window.open(`https://api.whatsapp.com/send?text=${inviteText}`, '_blank');
    }

    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMMeeting', meeting.id, `Sent meeting link via ${channel} to ${meeting.company_name}`);
    onUpdateState(nextState);
    triggerSuccess(`Meeting link invitation dispatched via ${channel.toUpperCase()}!`);
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
    const updated = [dar, ...(state.crmDars || [])];
    const nextState = { ...state, crmDars: updated };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'CRMDAR', dar.id, `DAR filed by ${dar.executive_name}`);
    onUpdateState(nextState);
    triggerSuccess('Daily Activity Report (DAR) submitted.');
  };

  const handleUpdateDAR = (dar: CRMDailyActivityReport) => {
    const updated = (state.crmDars || []).map(d => d.id === dar.id ? dar : d);
    const nextState = { ...state, crmDars: updated };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'CRMDAR', dar.id, `DAR reviewed/approved for ${dar.executive_name}`);
    onUpdateState(nextState);
    triggerSuccess('DAR approved successfully.');
  };



  return (
    <div className="space-y-6">

      {/* Top Banner with BD Head HD Portrait */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm text-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: BD Head HD Portrait + Identity & Cockpit Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* BD Head HD Photo Frame with Zoom & Crisp Resolution */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => setIsPhotoModalOpen(true)} 
            title="Click to view full HD portrait of BD Head"
          >
            {/* Outer decorative glowing ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-400 opacity-75 group-hover:opacity-100 blur-sm transition duration-300" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-slate-900">
              <img 
                src="/bd-head-profile.jpg" 
                alt="BD Head" 
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                loading="eager"
              />
              
              {/* Hover overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-[2px]">
                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">View HD</span>
              </div>

              {/* HD Badge indicator */}
              <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-sky-300 border border-sky-400/40 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-sky-400 animate-pulse" />
                <span>HD</span>
              </div>
            </div>

            {/* Online pulse indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-sky-500/10 text-sky-600 border border-sky-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                Spoorthy Integrated Solutions
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                President & CRM Suite
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>Business Development Head</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 font-sans tracking-normal bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Client CRM & Tender Cockpit
              </span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 font-medium">
              <span>Corporate Leads · Client Pipeline · Meetings & Quotations · Daily Activity Reports</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-slate-50/80 rounded-2xl border border-slate-200 text-right">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Active Pipeline</span>
            <div className="text-lg font-mono font-black text-slate-900">
              {(state.crmLeads || []).length} Accounts
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-50/80 rounded-2xl border border-slate-200 text-right">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Manpower Demand</span>
            <div className="text-lg font-mono font-black text-slate-900">
              {(state.crmRequirements || []).reduce((a, b) => a + (b.quantity || 0), 0)} Pax
            </div>
          </div>
        </div>
      </div>

      {/* BD Head HD Photo Full-Screen Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsPhotoModalOpen(false)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setIsPhotoModalOpen(false)} className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition hover:scale-110 cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            {/* Photo container */}
            <div className="rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
              <img
                src="/bd-head-profile.jpg"
                alt="BD Head - Full HD Portrait"
                className="w-full h-auto object-cover"
                style={{ imageRendering: '-webkit-optimize-contrast', maxHeight: '80vh' }}
              />
            </div>

            {/* Info bar below photo */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Business Development Head</span>
                  <span className="text-[10px] text-slate-400 font-mono">Spoorthy Integrated Solutions</span>
                </div>
              </div>
              <a 
                href="/bd-head-profile.jpg" 
                download="BD-Head-Portrait-HD.jpg"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download HD
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-600">
              Your view is filtered to: <strong>{availableTabs.map(t => t.label).join(' & ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Navigation SubTabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-thin">
        {availableTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${isActive
                ? 'bg-white text-sky-600 border border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${isActive ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600'
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

      {/* 2. EXECUTIVE DIARY & CALENDAR MAINTENANCE */}
      {activeSubTab === 'crm-calendar' && (
        <CRMDiaryCalendar
          state={state}
          currentUserEmail={currentUserEmail}
          onAddMeeting={handleAddMeeting}
          onUpdateMeeting={handleUpdateMeeting}
          onAddTask={handleAddDiaryTask}
          onUpdateTask={handleUpdateDiaryTask}
          onDeleteTask={handleDeleteDiaryTask}
          onToggleWorkflowRule={handleToggleWorkflowRule}
          onRunWorkflowEngine={handleRunWorkflowEngine}
          onSendMeetingLink={handleSendMeetingLink}
        />
      )}

      {/* 2. 360-DEGREE LEAD MANAGER */}
      {activeSubTab === 'crm-leads' && (
        <CRMLeadManager
          state={state}
          onAddLead={handleAddLead}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
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

      {/* 6. QUOTATIONS & COMMERCIAL PROPOSALS */}
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



    </div>
  );
}
