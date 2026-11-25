import React, { FormEvent, useMemo, useState } from 'react';
import {
  AppState, ITBottleneck, ITProject, ITProjectHealth, ITProjectStage,
  ITTask, ITVendorCommitment, ITWeeklyReport
} from '../types';
import {
  AlertTriangle, BadgeCheck, CalendarClock, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock3, Edit3, FileText, Flag, Layers3, Plus, ShieldAlert,
  Target, UsersRound, XCircle
} from 'lucide-react';
import { logAuditEntry } from '../data/store';

export type ITManagementSection = 'overview' | 'portfolio' | 'delivery' | 'bottlenecks' | 'vendors' | 'weekly';

interface Props {
  activeSection: ITManagementSection;
  state: AppState;
  onUpdateState: (state: AppState) => void;
  currentUserEmail: string;
}

type ProjectForm = {
  code: string; name: string; description: string; business_objective: string;
  project_category: 'Internal' | 'Commercial' | 'Client-specific'; owner: string;
  development_partner: string; priority: ITProject['priority']; start_date: string;
  actual_start_date: string; original_target_date: string; revised_target_date: string;
  current_stage: ITProjectStage; health_status: ITProjectHealth; progress_pct: number;
  next_milestone: string; dependencies_and_approvals: string;
};

type TaskForm = {
  project_id: string; module_name: string; task_title: string; description: string;
  owner: string; planned_start: string; planned_end: string; actual_start: string;
  actual_end: string; status: ITTask['status']; percent_completed: number;
  priority: ITTask['priority']; dependency: string; blocker: string; delay_reason: string;
  revised_target_date: string; remarks: string;
};

type BottleneckForm = {
  project_id: string; category: ITBottleneck['category']; description: string;
  responsible_person: string; support_required: string; expected_resolution_date: string;
  status: ITBottleneck['status']; escalation_level: ITBottleneck['escalation_level'];
  resolution_details: string;
};

type VendorForm = {
  vendor_name: string; project_id: string; application_name: string; agreed_scope: string;
  committed_date: string; deliverables_completed: string; deliverables_pending: string;
  status: ITVendorCommitment['status']; support_maintenance_status: ITVendorCommitment['support_maintenance_status'];
  issue_waiting_on_vendor: string; management_action_required: string; owner: string;
};

const stages: ITProjectStage[] = [
  'Initiation', 'Requirement Gathering', 'Business Approval', 'Development', 'Testing',
  'User Acceptance Testing (UAT)', 'Deployment', 'Post-deployment Review', 'Completed'
];

const bottleneckCategories: ITBottleneck['category'][] = [
  'Management approval pending', 'Business requirement clarification', 'Development/technical issue',
  'Vendor dependency', 'Data dependency', 'Resource constraint', 'Client approval',
  'Testing/UAT pending', 'Infrastructure or connectivity issue', 'Financial/budget approval'
];

const fieldClass = 'w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500';
const labelClass = 'text-[11px] font-mono text-slate-500 block mb-1';

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

function dateLabel(value?: string) {
  if (!value) return '—';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(value?: string) {
  if (!value) return false;
  const target = new Date(`${value.slice(0, 10)}T23:59:59`);
  return target.getTime() < Date.now();
}

function reportItems(value?: string[]) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

// Older operational reports used start_date/end_date and achievement fields.
// Keep them readable in the management review while new reports use the governance fields.
function normaliseWeeklyReport(report: ITWeeklyReport): ITWeeklyReport {
  return {
    ...report,
    week_start: report.week_start || report.start_date || '',
    week_end: report.week_end || report.end_date || '',
    prepared_by: report.prepared_by || 'IT Team',
    generated_at: report.generated_at || new Date().toISOString(),
    status: report.status || 'Draft',
    previous_week_plan: reportItems(report.previous_week_plan),
    work_completed: reportItems(report.work_completed).length ? reportItems(report.work_completed) : reportItems(report.key_achievements),
    work_remaining: reportItems(report.work_remaining),
    coming_week_plan: reportItems(report.coming_week_plan).length ? reportItems(report.coming_week_plan) : reportItems(report.planned_next_week),
    milestones_achieved: reportItems(report.milestones_achieved).length ? reportItems(report.milestones_achieved) : reportItems(report.key_achievements),
    delayed_deliverables: reportItems(report.delayed_deliverables),
    bottlenecks_and_dependencies: reportItems(report.bottlenecks_and_dependencies),
    decisions_required: reportItems(report.decisions_required)
  };
}

function isWithinWeek(value: string | undefined, start: string, end: string) {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= start && date <= end;
}

function mondayOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - day + 1);
  return now;
}

function isoDate(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function healthFor(project: ITProject): ITProjectHealth {
  if (project.health_status) return project.health_status;
  if (project.status === 'Completed') return 'Completed';
  if (project.status === 'On Hold') return 'On Hold';
  if (project.status === 'Blocked' || project.blockers_count > 0) return 'At Risk';
  if (isOverdue(project.revised_target_date || project.target_date) && project.progress_pct < 100) return 'Delayed';
  return 'On Track';
}

function stageFor(project: ITProject): ITProjectStage {
  if (project.current_stage) return project.current_stage;
  if (project.status === 'Completed') return 'Completed';
  return project.progress_pct < 15 ? 'Requirement Gathering' : project.progress_pct < 70 ? 'Development' : project.progress_pct < 85 ? 'Testing' : 'User Acceptance Testing (UAT)';
}

function healthBadge(health: ITProjectHealth) {
  const styles: Record<ITProjectHealth, string> = {
    'On Track': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'At Risk': 'bg-amber-100 text-amber-700 border-amber-300',
    'Delayed': 'bg-rose-100 text-rose-700 border-rose-300',
    'On Hold': 'bg-slate-100 text-slate-700 border-slate-300',
    'Completed': 'bg-cyan-100 text-cyan-700 border-cyan-300'
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[health]}`}>{health}</span>;
}

function statusBadge(status: string) {
  const classes = status === 'Resolved' || status === 'Closed' || status === 'Completed' || status === 'Finalised'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
    : status === 'Delayed' || status === 'Awaiting Decision' || status === 'At Risk'
      ? 'bg-rose-100 text-rose-700 border-rose-300'
      : 'bg-amber-100 text-amber-700 border-amber-300';
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${classes}`}>{status}</span>;
}

export default function ITPortfolioManagement({ activeSection, state, onUpdateState, currentUserEmail }: Props) {
  const projects = state.itProjects || [];
  const tasks = state.itTasks || [];
  const bottlenecks = state.itBottlenecks || [];
  const vendors = state.itVendorCommitments || [];
  const reports = (state.itWeeklyReports || []).map(normaliseWeeklyReport);

  const [modal, setModal] = useState<'project' | 'task' | 'bottleneck' | 'vendor' | null>(null);
  const [editingProject, setEditingProject] = useState<ITProject | null>(null);
  const [editingTask, setEditingTask] = useState<ITTask | null>(null);
  const [editingBottleneck, setEditingBottleneck] = useState<ITBottleneck | null>(null);
  const [editingVendor, setEditingVendor] = useState<ITVendorCommitment | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(() => emptyProjectForm());
  const [taskForm, setTaskForm] = useState<TaskForm>(() => emptyTaskForm(projects[0]?.id || ''));
  const [bottleneckForm, setBottleneckForm] = useState<BottleneckForm>(() => emptyBottleneckForm(projects[0]?.id || ''));
  const [vendorForm, setVendorForm] = useState<VendorForm>(() => emptyVendorForm(projects[0]?.id || ''));
  const [weeklyNotice, setWeeklyNotice] = useState<string | null>(null);

  const derived = useMemo(() => {
    const openBottlenecks = bottlenecks.filter(item => item.status !== 'Resolved' && item.status !== 'Closed');
    const activeTickets = state.itTickets.filter(ticket => !['Resolved', 'Closed'].includes(ticket.status));
    return {
      total: projects.length,
      onTrack: projects.filter(p => healthFor(p) === 'On Track').length,
      atRisk: projects.filter(p => healthFor(p) === 'At Risk').length,
      delayed: projects.filter(p => healthFor(p) === 'Delayed').length,
      completed: projects.filter(p => healthFor(p) === 'Completed').length,
      onHold: projects.filter(p => healthFor(p) === 'On Hold').length,
      openBottlenecks,
      overdueBottlenecks: openBottlenecks.filter(item => isOverdue(item.expected_resolution_date)),
      decisions: openBottlenecks.filter(item => item.escalation_level === 'Management' || item.escalation_level === 'CEO' || item.status === 'Awaiting Decision'),
      activeTickets,
      criticalTickets: activeTickets.filter(ticket => ticket.priority === 'Critical')
    };
  }, [projects, bottlenecks, state.itTickets]);

  function commit(next: AppState, action: 'CREATE' | 'UPDATE', entity: string, id: string, detail: string) {
    logAuditEntry(next, currentUserEmail, action, entity, id, '', detail);
    onUpdateState(next);
  }

  function openProject(project?: ITProject) {
    setEditingProject(project || null);
    setProjectForm(project ? {
      code: project.code, name: project.name, description: project.description, business_objective: project.business_objective || '',
      project_category: project.project_category || 'Internal', owner: project.owner, development_partner: project.development_partner || '',
      priority: project.priority, start_date: toDateInput(project.start_date), actual_start_date: toDateInput(project.actual_start_date),
      original_target_date: toDateInput(project.original_target_date || project.target_date), revised_target_date: toDateInput(project.revised_target_date),
      current_stage: stageFor(project), health_status: healthFor(project), progress_pct: project.progress_pct,
      next_milestone: project.next_milestone || '', dependencies_and_approvals: project.dependencies_and_approvals || ''
    } : emptyProjectForm());
    setModal('project');
  }

  function openTask(task?: ITTask) {
    setEditingTask(task || null);
    setTaskForm(task ? {
      project_id: task.project_id, module_name: task.module_name, task_title: task.task_title, description: task.description,
      owner: task.owner, planned_start: toDateInput(task.planned_start), planned_end: toDateInput(task.planned_end),
      actual_start: toDateInput(task.actual_start), actual_end: toDateInput(task.actual_end), status: task.status,
      percent_completed: task.percent_completed, priority: task.priority, dependency: task.dependency || '', blocker: task.blocker || '',
      delay_reason: task.delay_reason || '', revised_target_date: toDateInput(task.revised_target_date), remarks: task.remarks || ''
    } : emptyTaskForm(projects[0]?.id || ''));
    setModal('task');
  }

  function openBottleneck(item?: ITBottleneck) {
    setEditingBottleneck(item || null);
    setBottleneckForm(item ? {
      project_id: item.project_id, category: item.category, description: item.description, responsible_person: item.responsible_person,
      support_required: item.support_required, expected_resolution_date: toDateInput(item.expected_resolution_date), status: item.status,
      escalation_level: item.escalation_level, resolution_details: item.resolution_details || ''
    } : emptyBottleneckForm(projects[0]?.id || ''));
    setModal('bottleneck');
  }

  function openVendor(item?: ITVendorCommitment) {
    setEditingVendor(item || null);
    setVendorForm(item ? {
      vendor_name: item.vendor_name, project_id: item.project_id || '', application_name: item.application_name || '', agreed_scope: item.agreed_scope,
      committed_date: toDateInput(item.committed_date), deliverables_completed: item.deliverables_completed, deliverables_pending: item.deliverables_pending,
      status: item.status, support_maintenance_status: item.support_maintenance_status, issue_waiting_on_vendor: item.issue_waiting_on_vendor || '',
      management_action_required: item.management_action_required || '', owner: item.owner
    } : emptyVendorForm(projects[0]?.id || ''));
    setModal('vendor');
  }

  function saveProject(event: FormEvent) {
    event.preventDefault();
    const now = new Date().toISOString();
    const id = editingProject?.id || `ITP-${Date.now()}`;
    const project: ITProject = {
      id, code: projectForm.code.trim(), name: projectForm.name.trim(), description: projectForm.description.trim(),
      priority: projectForm.priority, status: projectForm.health_status === 'Completed' ? 'Completed' : projectForm.health_status === 'On Hold' ? 'On Hold' : 'In Progress',
      owner: projectForm.owner.trim(), start_date: projectForm.start_date, target_date: projectForm.original_target_date || projectForm.revised_target_date,
      progress_pct: Number(projectForm.progress_pct) || 0, workstreams: editingProject?.workstreams || [], blockers_count: editingProject?.blockers_count || 0,
      evidence_files: editingProject?.evidence_files || [], project_category: projectForm.project_category, business_objective: projectForm.business_objective.trim(),
      development_partner: projectForm.development_partner.trim(), actual_start_date: projectForm.actual_start_date, original_target_date: projectForm.original_target_date,
      revised_target_date: projectForm.revised_target_date, current_stage: projectForm.current_stage, health_status: projectForm.health_status,
      next_milestone: projectForm.next_milestone.trim(), dependencies_and_approvals: projectForm.dependencies_and_approvals.trim(), updated_by: currentUserEmail, updated_at: now
    };
    const next = { ...state, itProjects: editingProject ? projects.map(item => item.id === id ? project : item) : [project, ...projects] };
    commit(next, editingProject ? 'UPDATE' : 'CREATE', 'ITProject', id, `${editingProject ? 'Updated' : 'Registered'} IT project: ${project.name}`);
    setModal(null);
  }

  function saveTask(event: FormEvent) {
    event.preventDefault();
    const project = projects.find(item => item.id === taskForm.project_id);
    if (!project) return;
    const now = new Date().toISOString();
    const id = editingTask?.id || `ITT-${Date.now()}`;
    const percent = Math.min(100, Math.max(0, Number(taskForm.percent_completed) || 0));
    const task: ITTask = {
      id, project_id: project.id, project_name: project.name, module_name: taskForm.module_name.trim(), task_title: taskForm.task_title.trim(),
      description: taskForm.description.trim(), owner: taskForm.owner.trim(), planned_start: taskForm.planned_start, planned_end: taskForm.planned_end,
      actual_start: taskForm.actual_start, actual_end: taskForm.actual_end || (percent === 100 ? now : undefined),
      status: percent === 100 ? 'Completed' : taskForm.status, percent_completed: percent, priority: taskForm.priority,
      dependency: taskForm.dependency.trim(), blocker: taskForm.blocker.trim(), delay_reason: taskForm.delay_reason.trim(),
      revised_target_date: taskForm.revised_target_date, remarks: taskForm.remarks.trim(), evidence_files: editingTask?.evidence_files || [], updated_by: currentUserEmail, updated_at: now
    };
    const nextTasks = editingTask ? tasks.map(item => item.id === id ? task : item) : [task, ...tasks];
    const projectTasks = nextTasks.filter(item => item.project_id === project.id);
    const averageProgress = projectTasks.length ? Math.round(projectTasks.reduce((sum, item) => sum + item.percent_completed, 0) / projectTasks.length) : project.progress_pct;
    const nextProjects = projects.map(item => item.id === project.id ? { ...item, progress_pct: averageProgress, blockers_count: projectTasks.filter(t => t.blocker && t.status !== 'Completed').length, updated_by: currentUserEmail, updated_at: now } : item);
    const next = { ...state, itTasks: nextTasks, itProjects: nextProjects };
    commit(next, editingTask ? 'UPDATE' : 'CREATE', 'ITTask', id, `${editingTask ? 'Updated' : 'Added'} delivery task: ${task.task_title}`);
    setModal(null);
  }

  function saveBottleneck(event: FormEvent) {
    event.preventDefault();
    const project = projects.find(item => item.id === bottleneckForm.project_id);
    if (!project) return;
    const now = new Date().toISOString();
    const id = editingBottleneck?.id || `ITB-${Date.now()}`;
    const isClosed = bottleneckForm.status === 'Resolved' || bottleneckForm.status === 'Closed';
    const item: ITBottleneck = {
      id, project_id: project.id, project_name: project.name, category: bottleneckForm.category, description: bottleneckForm.description.trim(),
      reported_at: editingBottleneck?.reported_at || now, reported_by: editingBottleneck?.reported_by || currentUserEmail,
      responsible_person: bottleneckForm.responsible_person.trim(), support_required: bottleneckForm.support_required.trim(),
      expected_resolution_date: bottleneckForm.expected_resolution_date, status: bottleneckForm.status, escalation_level: bottleneckForm.escalation_level,
      resolution_details: bottleneckForm.resolution_details.trim(), closed_at: isClosed ? now : undefined, updated_at: now
    };
    const nextItems = editingBottleneck ? bottlenecks.map(existing => existing.id === id ? item : existing) : [item, ...bottlenecks];
    const nextProjects = projects.map(existing => existing.id === project.id ? { ...existing, blockers_count: nextItems.filter(b => b.project_id === project.id && !['Resolved', 'Closed'].includes(b.status)).length, updated_by: currentUserEmail, updated_at: now } : existing);
    const next = { ...state, itBottlenecks: nextItems, itProjects: nextProjects };
    commit(next, editingBottleneck ? 'UPDATE' : 'CREATE', 'ITBottleneck', id, `${editingBottleneck ? 'Updated' : 'Recorded'} bottleneck for ${project.name}`);
    setModal(null);
  }

  function saveVendor(event: FormEvent) {
    event.preventDefault();
    const project = projects.find(item => item.id === vendorForm.project_id);
    const id = editingVendor?.id || `ITV-${Date.now()}`;
    const item: ITVendorCommitment = {
      id, vendor_name: vendorForm.vendor_name.trim(), project_id: project?.id, project_name: project?.name || 'Shared IT Operations',
      application_name: vendorForm.application_name.trim(), agreed_scope: vendorForm.agreed_scope.trim(), committed_date: vendorForm.committed_date,
      deliverables_completed: vendorForm.deliverables_completed.trim(), deliverables_pending: vendorForm.deliverables_pending.trim(), status: vendorForm.status,
      support_maintenance_status: vendorForm.support_maintenance_status, issue_waiting_on_vendor: vendorForm.issue_waiting_on_vendor.trim(),
      management_action_required: vendorForm.management_action_required.trim(), owner: vendorForm.owner.trim(), updated_at: new Date().toISOString()
    };
    const next = { ...state, itVendorCommitments: editingVendor ? vendors.map(existing => existing.id === id ? item : existing) : [item, ...vendors] };
    commit(next, editingVendor ? 'UPDATE' : 'CREATE', 'ITVendorCommitment', id, `${editingVendor ? 'Updated' : 'Added'} vendor commitment: ${item.vendor_name}`);
    setModal(null);
  }

  function generateWeeklyReport() {
    const start = mondayOfCurrentWeek();
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const previousStart = new Date(start); previousStart.setDate(previousStart.getDate() - 7);
    const previousEnd = new Date(start); previousEnd.setDate(previousEnd.getDate() - 1);
    const nextStart = new Date(end); nextStart.setDate(nextStart.getDate() + 1);
    const nextEnd = new Date(nextStart); nextEnd.setDate(nextEnd.getDate() + 6);
    const weekStart = isoDate(start);
    const weekEnd = isoDate(end);
    const previousWeekStart = isoDate(previousStart);
    const previousWeekEnd = isoDate(previousEnd);
    const nextWeekStart = isoDate(nextStart);
    const nextWeekEnd = isoDate(nextEnd);
    const existingReport = reports.find(item => item.week_start === weekStart && item.week_end === weekEnd);

    if (existingReport?.status === 'Finalised') {
      setWeeklyNotice(`The report for ${dateLabel(weekStart)} is finalised and cannot be refreshed.`);
      return;
    }

    const reportStatus: ITWeeklyReport['status'] = existingReport?.status === 'Reviewed' ? 'Draft' : existingReport?.status || 'Draft';

    const activeBottlenecks = bottlenecks.filter(item => !['Resolved', 'Closed'].includes(item.status));
    const completed = tasks.filter(task => (task.status === 'Completed' || task.percent_completed === 100) && isWithinWeek(task.actual_end || task.updated_at, previousWeekStart, previousWeekEnd));
    const remaining = tasks.filter(task => task.status !== 'Completed' && task.percent_completed < 100);
    const delayed = remaining.filter(task => task.status === 'Blocked' || isOverdue(task.revised_target_date || task.planned_end));
    const plannedPrevious = tasks.filter(task => isWithinWeek(task.planned_end, previousWeekStart, previousWeekEnd));
    const plannedNext = remaining.filter(task => {
      const due = task.revised_target_date || task.planned_end;
      return isWithinWeek(due, nextWeekStart, nextWeekEnd);
    });
    const report: ITWeeklyReport = {
      id: existingReport?.id || `ITWR-${weekStart}-${Date.now()}`, week_start: weekStart, week_end: weekEnd, prepared_by: existingReport?.prepared_by || currentUserEmail,
      generated_at: new Date().toISOString(), status: reportStatus,
      previous_week_plan: plannedPrevious.map(task => `${task.project_name}: ${task.task_title}`).slice(0, 12),
      work_completed: completed.map(task => `${task.project_name}: ${task.task_title}`).slice(0, 12),
      work_remaining: remaining.map(task => `${task.project_name}: ${task.task_title} (${task.percent_completed}%)`).slice(0, 12),
      coming_week_plan: plannedNext.map(task => `${task.project_name}: ${task.task_title}`).slice(0, 12),
      milestones_achieved: completed.map(task => `${task.project_name} — ${task.module_name}`).slice(0, 12),
      delayed_deliverables: delayed.map(task => `${task.project_name}: ${task.task_title}`).slice(0, 12),
      bottlenecks_and_dependencies: activeBottlenecks.map(item => `${item.project_name}: ${item.description}`).slice(0, 12),
      decisions_required: activeBottlenecks.filter(item => item.status === 'Awaiting Decision' || ['Management', 'CEO'].includes(item.escalation_level)).map(item => `${item.project_name}: ${item.support_required}`).slice(0, 12),
      reviewed_by: reportStatus === 'Draft' ? undefined : existingReport?.reviewed_by,
      reviewed_at: reportStatus === 'Draft' ? undefined : existingReport?.reviewed_at
    };
    const nextReports = existingReport ? reports.map(item => item.id === report.id ? report : item) : [report, ...reports];
    const next = { ...state, itWeeklyReports: nextReports };
    commit(next, existingReport ? 'UPDATE' : 'CREATE', 'ITWeeklyReport', report.id, `${existingReport ? 'Refreshed' : 'Generated'} weekly report for ${report.week_start} to ${report.week_end}`);
    setWeeklyNotice(existingReport ? 'This week\'s draft report has been refreshed from the latest live records.' : 'This week\'s draft report has been created from the latest live records.');
  }

  function updateReportStatus(report: ITWeeklyReport, status: ITWeeklyReport['status']) {
    if (status === 'Finalised' && report.status !== 'Reviewed') {
      setWeeklyNotice('Mark the report as reviewed before finalising it for management circulation.');
      return;
    }
    const nextReport: ITWeeklyReport = { ...report, status, reviewed_by: currentUserEmail, reviewed_at: new Date().toISOString() };
    const next = { ...state, itWeeklyReports: reports.map(item => item.id === report.id ? nextReport : item) };
    commit(next, 'UPDATE', 'ITWeeklyReport', report.id, `${status} weekly report for ${report.week_start} to ${report.week_end}`);
    setWeeklyNotice(status === 'Reviewed' ? 'Weekly report marked as reviewed.' : 'Weekly report finalised for management circulation.');
  }

  if (activeSection === 'overview') return <Overview projects={projects} derived={derived} reports={reports} />;

  if (activeSection === 'portfolio') return <>
    <SectionHeader title="IT Project Portfolio" description="Planned versus actual delivery, ownership and governance across every IT initiative." action="Register Project" onAction={() => openProject()} />
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map(project => <ProjectCard key={project.id} project={project} bottlenecks={bottlenecks.filter(item => item.project_id === project.id)} onEdit={() => openProject(project)} />)}
    </div>
    {projects.length === 0 && <EmptyState label="No IT projects registered yet" />}
    {modal === 'project' && <ProjectModal form={projectForm} setForm={setProjectForm} editing={!!editingProject} onClose={() => setModal(null)} onSubmit={saveProject} />}
  </>;

  if (activeSection === 'delivery') return <>
    <SectionHeader title="Milestones & Task Delivery" description="Update module work once; project progress and the weekly report roll up automatically." action="Add Delivery Task" onAction={() => openTask()} />
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-200"><th className="p-3">Project / Module</th><th className="p-3">Deliverable</th><th className="p-3">Owner</th><th className="p-3">Planned vs. actual</th><th className="p-3">Progress</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead><tbody>
        {tasks.map(task => <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-3"><p className="font-bold text-slate-700">{task.project_name}</p><p className="text-slate-500">{task.module_name}</p></td><td className="p-3 max-w-xs"><p className="font-semibold text-slate-700">{task.task_title}</p>{task.blocker && <p className="mt-1 text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{task.blocker}</p>}</td><td className="p-3 text-slate-600">{task.owner}</td><td className="p-3 text-slate-600"><p>{dateLabel(task.planned_end)}</p><p className="text-[10px] text-slate-400">Actual: {dateLabel(task.actual_end)}</p></td><td className="p-3 min-w-28"><div className="flex justify-between font-mono text-slate-600 mb-1"><span>{task.percent_completed}%</span></div><div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${task.percent_completed}%` }} /></div></td><td className="p-3">{statusBadge(task.status)}</td><td className="p-3"><button onClick={() => openTask(task)} className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button></td></tr>)}
      </tbody></table></div>
      {!tasks.length && <EmptyState label="No delivery tasks recorded yet" />}
    </div>
    {modal === 'task' && <TaskModal projects={projects} form={taskForm} setForm={setTaskForm} editing={!!editingTask} onClose={() => setModal(null)} onSubmit={saveTask} />}
  </>;

  if (activeSection === 'bottlenecks') return <>
    <SectionHeader title="Bottlenecks, Escalations & Management Decisions" description="Keep unresolved dependencies visible until the responsible person closes them." action="Record Bottleneck" onAction={() => openBottleneck()} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {bottlenecks.map(item => <div key={item.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${isOverdue(item.expected_resolution_date) && !['Resolved', 'Closed'].includes(item.status) ? 'border-rose-300' : 'border-slate-200'}`}><div className="flex justify-between gap-3"><div><p className="text-[10px] font-mono text-cyan-700 uppercase">{item.project_name}</p><h3 className="text-sm font-bold text-slate-800 mt-1">{item.category}</h3></div><div className="flex items-start gap-2">{statusBadge(item.status)}<button onClick={() => openBottleneck(item)} className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"><Edit3 className="w-3.5 h-3.5" /></button></div></div><p className="text-xs text-slate-600 mt-3 leading-relaxed">{item.description}</p><div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs"><p><span className="text-slate-400">Owner:</span> <span className="text-slate-700">{item.responsible_person}</span></p><p><span className="text-slate-400">Support required:</span> <span className="text-slate-700">{item.support_required}</span></p><p className={isOverdue(item.expected_resolution_date) && !['Resolved', 'Closed'].includes(item.status) ? 'text-rose-600 font-bold' : 'text-slate-600'}><span className="text-slate-400">Target:</span> {dateLabel(item.expected_resolution_date)} · {item.escalation_level}</p></div>{item.resolution_details && <p className="mt-3 text-xs text-emerald-700">Resolution: {item.resolution_details}</p>}</div>)}
    </div>
    {!bottlenecks.length && <EmptyState label="No bottlenecks currently recorded" />}
    {modal === 'bottleneck' && <BottleneckModal projects={projects} form={bottleneckForm} setForm={setBottleneckForm} editing={!!editingBottleneck} onClose={() => setModal(null)} onSubmit={saveBottleneck} />}
  </>;

  if (activeSection === 'vendors') return <>
    <SectionHeader title="Technology Vendor Commitments" description="Track agreed scope, delivery dates, maintenance posture and management intervention." action="Add Vendor Commitment" onAction={() => openVendor()} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{vendors.map(item => <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex justify-between gap-3"><div><p className="text-[10px] text-cyan-700 font-mono uppercase">{item.project_name}</p><h3 className="text-sm font-bold text-slate-800 mt-1">{item.vendor_name}</h3></div><div className="flex items-start gap-2">{statusBadge(item.status)}<button onClick={() => openVendor(item)} className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"><Edit3 className="w-3.5 h-3.5" /></button></div></div><p className="text-xs text-slate-600 mt-3">{item.agreed_scope}</p><div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs"><div className="bg-slate-50 border border-slate-200 rounded-xl p-3"><p className="text-slate-400 mb-1">Completed</p><p className="text-slate-700">{item.deliverables_completed || '—'}</p></div><div className="bg-slate-50 border border-slate-200 rounded-xl p-3"><p className="text-slate-400 mb-1">Pending</p><p className="text-slate-700">{item.deliverables_pending || '—'}</p></div></div><div className="mt-3 text-xs flex flex-wrap gap-x-4 gap-y-1 text-slate-500"><span>Commitment: <strong className={isOverdue(item.committed_date) && item.status !== 'Completed' ? 'text-rose-600' : 'text-slate-700'}>{dateLabel(item.committed_date)}</strong></span><span>Support: <strong className="text-slate-700">{item.support_maintenance_status}</strong></span></div>{item.management_action_required && <p className="mt-3 text-xs text-rose-700">Management action: {item.management_action_required}</p>}</div>)}</div>
    {!vendors.length && <EmptyState label="No vendor commitments recorded" />}
    {modal === 'vendor' && <VendorModal projects={projects} form={vendorForm} setForm={setVendorForm} editing={!!editingVendor} onClose={() => setModal(null)} onSubmit={saveVendor} />}
  </>;

  return <>
    <SectionHeader title="Weekly IT Performance Review" description="Generate the report from live tasks and bottlenecks; IT Head reviews before management circulation." action="Generate / Refresh This Week" onAction={generateWeeklyReport} />
    {weeklyNotice && <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-800 flex items-center justify-between gap-3"><span>{weeklyNotice}</span><button onClick={() => setWeeklyNotice(null)} className="font-bold text-cyan-700 hover:text-cyan-900">Dismiss</button></div>}
    <div className="space-y-4">{reports.map(report => <WeeklyReportCard key={report.id} report={report} onReview={() => updateReportStatus(report, 'Reviewed')} onFinalise={() => updateReportStatus(report, 'Finalised')} />)}</div>
    {!reports.length && <EmptyState label="No weekly reports have been generated" />}
  </>;
}

function emptyProjectForm(): ProjectForm { return { code: '', name: '', description: '', business_objective: '', project_category: 'Internal', owner: '', development_partner: '', priority: 'High', start_date: '', actual_start_date: '', original_target_date: '', revised_target_date: '', current_stage: 'Initiation', health_status: 'On Track', progress_pct: 0, next_milestone: '', dependencies_and_approvals: '' }; }
function emptyTaskForm(projectId: string): TaskForm { return { project_id: projectId, module_name: '', task_title: '', description: '', owner: '', planned_start: '', planned_end: '', actual_start: '', actual_end: '', status: 'Planned', percent_completed: 0, priority: 'Medium', dependency: '', blocker: '', delay_reason: '', revised_target_date: '', remarks: '' }; }
function emptyBottleneckForm(projectId: string): BottleneckForm { return { project_id: projectId, category: 'Development/technical issue', description: '', responsible_person: '', support_required: '', expected_resolution_date: '', status: 'Open', escalation_level: 'Project Team', resolution_details: '' }; }
function emptyVendorForm(projectId: string): VendorForm { return { vendor_name: '', project_id: projectId, application_name: '', agreed_scope: '', committed_date: '', deliverables_completed: '', deliverables_pending: '', status: 'On Track', support_maintenance_status: 'Active', issue_waiting_on_vendor: '', management_action_required: '', owner: '' }; }

function SectionHeader({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) { return <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><h2 className="text-base font-bold text-slate-800">{title}</h2><p className="text-xs text-slate-500 mt-1">{description}</p></div><button onClick={onAction} className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" />{action}</button></div>; }
function EmptyState({ label }: { label: string }) { return <div className="py-12 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">{label}</div>; }

function Overview({ projects, derived, reports }: { projects: ITProject[]; derived: any; reports: ITWeeklyReport[] }) { const metrics = [{ label: 'Total projects', value: derived.total, icon: Layers3, accent: 'text-cyan-600' }, { label: 'On track', value: derived.onTrack, icon: CheckCircle2, accent: 'text-emerald-600' }, { label: 'At risk / delayed', value: derived.atRisk + derived.delayed, icon: AlertTriangle, accent: 'text-rose-600' }, { label: 'Open support tickets', value: derived.activeTickets.length, icon: ClipboardCheck, accent: 'text-amber-600' }]; return <div className="space-y-5"><div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{metrics.map(metric => { const Icon = metric.icon; return <div key={metric.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"><div className="flex justify-between text-xs text-slate-500"><span>{metric.label}</span><Icon className={`w-4 h-4 ${metric.accent}`} /></div><p className={`mt-2 text-2xl font-bold font-mono ${metric.accent}`}>{metric.value}</p></div>; })}</div><div className="grid grid-cols-1 xl:grid-cols-3 gap-4"><div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="font-bold text-sm text-slate-800">Portfolio health</h3><p className="text-xs text-slate-500 mt-1">Drill down through the Project Portfolio and Milestones tabs.</p></div><span className="text-xs font-mono text-slate-500">{derived.completed} completed</span></div><div className="mt-4 space-y-3">{projects.map(project => <div key={project.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center"><div><div className="flex gap-2 justify-between text-xs"><p className="font-semibold text-slate-700 truncate">{project.name}</p><span className="font-mono text-cyan-700">{project.progress_pct}%</span></div><div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${healthFor(project) === 'Delayed' ? 'bg-rose-500' : healthFor(project) === 'At Risk' ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${project.progress_pct}%` }} /></div><p className="mt-1 text-[10px] text-slate-400">{stageFor(project)} · Next: {project.next_milestone || 'Not set'}</p></div>{healthBadge(healthFor(project))}</div>)}</div></div><div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-600" /><h3 className="font-bold text-sm text-slate-800">Management attention</h3></div><div className="mt-3 space-y-3">{derived.decisions.slice(0, 4).map((item: ITBottleneck) => <div key={item.id} className="border-l-2 border-rose-400 pl-3"><p className="text-xs font-bold text-slate-700">{item.project_name}</p><p className="text-[11px] text-slate-500 mt-0.5">{item.support_required}</p></div>)}{!derived.decisions.length && <p className="text-xs text-emerald-700 flex gap-2"><BadgeCheck className="w-4 h-4" />No management decisions pending.</p>}<div className="pt-2 border-t border-slate-100 text-xs text-slate-500">{derived.overdueBottlenecks.length} overdue bottlenecks · {derived.criticalTickets.length} critical support incidents</div></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><OverviewCard icon={Flag} title="Escalations" value={derived.openBottlenecks.length} text={`${derived.overdueBottlenecks.length} overdue risks need follow-up`} /><OverviewCard icon={UsersRound} title="Vendor dependencies" value={derived.openBottlenecks.filter((item: ITBottleneck) => item.category === 'Vendor dependency').length} text="Visible separately from product delivery" /><OverviewCard icon={FileText} title="Weekly governance" value={reports.length} text={reports[0] ? `Latest: ${reports[0].status}` : 'Generate the first live report'} /></div></div>; }
function OverviewCard({ icon: Icon, title, value, text }: { icon: any; title: string; value: number; text: string }) { return <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4"><div className="flex items-center gap-2 text-slate-600"><Icon className="w-4 h-4 text-cyan-600" /><p className="text-xs font-bold">{title}</p></div><p className="mt-2 text-xl font-bold font-mono text-slate-800">{value}</p><p className="mt-1 text-[11px] text-slate-500">{text}</p></div>; }
function ProjectCard({ project, bottlenecks, onEdit }: { key?: React.Key; project: ITProject; bottlenecks: ITBottleneck[]; onEdit: () => void }) { const health = healthFor(project); const target = project.revised_target_date || project.original_target_date || project.target_date; return <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col"><div className="flex justify-between gap-2"><div><span className="text-[10px] font-mono text-cyan-700">{project.code}</span><h3 className="mt-1 font-bold text-sm text-slate-800">{project.name}</h3></div><div className="flex items-start gap-2">{healthBadge(health)}<button onClick={onEdit} className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"><Edit3 className="w-3.5 h-3.5" /></button></div></div><p className="mt-2 text-xs text-slate-500 line-clamp-2">{project.business_objective || project.description}</p><div className="mt-4"><div className="flex justify-between text-xs"><span className="text-slate-500">Delivery progress</span><span className="font-mono font-bold text-cyan-700">{project.progress_pct}%</span></div><div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{ width: `${project.progress_pct}%` }} /></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><Info label="Stage" value={stageFor(project)} /><Info label="Owner" value={project.owner} /><Info label="Target" value={dateLabel(target)} emphasis={isOverdue(target) && health !== 'Completed'} /><Info label="Next milestone" value={project.next_milestone || 'Not set'} /></div><div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between"><span>{project.project_category || 'Internal'} · {project.priority}</span><span className={bottlenecks.filter(item => !['Resolved', 'Closed'].includes(item.status)).length ? 'text-rose-600 font-bold' : ''}>{bottlenecks.filter(item => !['Resolved', 'Closed'].includes(item.status)).length} active blockers</span></div></div>; }
function Info({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) { return <div><p className="text-slate-400">{label}</p><p className={`mt-0.5 truncate ${emphasis ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{value}</p></div>; }
function WeeklyReportCard({ report, onReview, onFinalise }: { key?: React.Key; report: ITWeeklyReport; onReview: () => void; onFinalise: () => void }) { const sections = [['Completed', report.work_completed], ['Remaining', report.work_remaining], ['Coming week', report.coming_week_plan], ['Decisions required', report.decisions_required]] as const; return <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex flex-col sm:flex-row justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-bold text-sm text-slate-800">Week of {dateLabel(report.week_start)} – {dateLabel(report.week_end)}</h3>{statusBadge(report.status)}</div><p className="text-[11px] text-slate-500 mt-1">Generated from live records by {report.prepared_by} on {new Date(report.generated_at).toLocaleString('en-IN')}</p></div><div className="flex gap-2">{report.status === 'Draft' && <button onClick={onReview} className="px-3 py-1.5 rounded-lg border border-cyan-300 text-cyan-700 text-xs font-bold hover:bg-cyan-50">Mark reviewed</button>}{report.status === 'Reviewed' && <button onClick={onFinalise} className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500">Finalise</button>}</div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">{sections.map(([label, items]) => <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3"><p className="text-[10px] uppercase tracking-wide font-bold text-slate-500">{label}</p><ul className="mt-2 space-y-1.5">{items.slice(0, 4).map((item, index) => <li key={`${item}-${index}`} className="text-[11px] text-slate-600 flex gap-1.5"><ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-cyan-600" />{item}</li>)}{!items.length && <li className="text-[11px] text-slate-400">None</li>}</ul></div>)}</div></div>; }

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl"><div className="flex justify-between items-center pb-3 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-800">{title}</h3><button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><XCircle className="w-5 h-5" /></button></div>{children}</div></div>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: any) => void; options: readonly string[] }) { return <label><span className={labelClass}>{label}</span><select value={value} onChange={event => onChange(event.target.value)} className={fieldClass}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>; }
function InputField({ label, value, onChange, type = 'text', required = false, min, max }: { label: string; value: string | number; onChange: (value: any) => void; type?: string; required?: boolean; min?: number; max?: number }) { return <label><span className={labelClass}>{label}</span><input required={required} type={type} value={value} min={min} max={max} onChange={event => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} className={fieldClass} /></label>; }
function TextAreaField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block"><span className={labelClass}>{label}</span><textarea required={required} rows={2} value={value} onChange={event => onChange(event.target.value)} className={fieldClass} /></label>; }
function FormActions({ editing, onClose, label }: { editing: boolean; onClose: () => void; label: string }) { return <div className="flex justify-end gap-2 pt-4 border-t border-slate-200"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold">Cancel</button><button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold">{editing ? 'Save changes' : label}</button></div>; }

function ProjectModal({ form, setForm, editing, onClose, onSubmit }: { form: ProjectForm; setForm: React.Dispatch<React.SetStateAction<ProjectForm>>; editing: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) { return <ModalShell title={editing ? 'Update IT Project' : 'Register IT Project'} onClose={onClose}><form className="space-y-4 pt-4" onSubmit={onSubmit}><div className="grid sm:grid-cols-2 gap-3"><InputField label="Project ID / code" value={form.code} required onChange={value => setForm(f => ({ ...f, code: value }))} /><InputField label="Project name" value={form.name} required onChange={value => setForm(f => ({ ...f, name: value }))} /></div><TextAreaField label="Business objective / description" value={form.description} required onChange={value => setForm(f => ({ ...f, description: value }))} /><TextAreaField label="Business objective (management outcome)" value={form.business_objective} onChange={value => setForm(f => ({ ...f, business_objective: value }))} /><div className="grid sm:grid-cols-3 gap-3"><SelectField label="Category" value={form.project_category} options={['Internal', 'Commercial', 'Client-specific']} onChange={value => setForm(f => ({ ...f, project_category: value }))} /><InputField label="Project owner" value={form.owner} required onChange={value => setForm(f => ({ ...f, owner: value }))} /><InputField label="Development partner / vendor" value={form.development_partner} onChange={value => setForm(f => ({ ...f, development_partner: value }))} /></div><div className="grid sm:grid-cols-3 gap-3"><SelectField label="Priority" value={form.priority} options={['Critical', 'High', 'Medium', 'Low']} onChange={value => setForm(f => ({ ...f, priority: value }))} /><SelectField label="Delivery health" value={form.health_status} options={['On Track', 'At Risk', 'Delayed', 'On Hold', 'Completed']} onChange={value => setForm(f => ({ ...f, health_status: value }))} /><SelectField label="Current stage" value={form.current_stage} options={stages} onChange={value => setForm(f => ({ ...f, current_stage: value }))} /></div><div className="grid sm:grid-cols-4 gap-3"><InputField label="Planned start" type="date" value={form.start_date} onChange={value => setForm(f => ({ ...f, start_date: value }))} /><InputField label="Actual start" type="date" value={form.actual_start_date} onChange={value => setForm(f => ({ ...f, actual_start_date: value }))} /><InputField label="Original target" type="date" value={form.original_target_date} onChange={value => setForm(f => ({ ...f, original_target_date: value }))} /><InputField label="Revised target" type="date" value={form.revised_target_date} onChange={value => setForm(f => ({ ...f, revised_target_date: value }))} /></div><div className="grid sm:grid-cols-2 gap-3"><InputField label="Overall progress (%)" type="number" min={0} max={100} value={form.progress_pct} onChange={value => setForm(f => ({ ...f, progress_pct: value }))} /><InputField label="Next milestone" value={form.next_milestone} onChange={value => setForm(f => ({ ...f, next_milestone: value }))} /></div><TextAreaField label="Dependencies and approvals required" value={form.dependencies_and_approvals} onChange={value => setForm(f => ({ ...f, dependencies_and_approvals: value }))} /><FormActions editing={editing} onClose={onClose} label="Register project" /></form></ModalShell>; }
function TaskModal({ projects, form, setForm, editing, onClose, onSubmit }: { projects: ITProject[]; form: TaskForm; setForm: React.Dispatch<React.SetStateAction<TaskForm>>; editing: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) { return <ModalShell title={editing ? 'Update Delivery Task' : 'Add Delivery Task'} onClose={onClose}><form className="space-y-4 pt-4" onSubmit={onSubmit}><SelectField label="Project" value={form.project_id} options={projects.map(project => project.id)} onChange={value => setForm(f => ({ ...f, project_id: value }))} /><p className="-mt-3 text-[11px] text-slate-400">{projects.find(project => project.id === form.project_id)?.name}</p><div className="grid sm:grid-cols-2 gap-3"><InputField label="Module / milestone" value={form.module_name} required onChange={value => setForm(f => ({ ...f, module_name: value }))} /><InputField label="Task / deliverable" value={form.task_title} required onChange={value => setForm(f => ({ ...f, task_title: value }))} /></div><TextAreaField label="Expected deliverable / activity" value={form.description} required onChange={value => setForm(f => ({ ...f, description: value }))} /><div className="grid sm:grid-cols-3 gap-3"><InputField label="Assigned person" value={form.owner} required onChange={value => setForm(f => ({ ...f, owner: value }))} /><SelectField label="Priority" value={form.priority} options={['Critical', 'High', 'Medium', 'Low']} onChange={value => setForm(f => ({ ...f, priority: value }))} /><SelectField label="Status" value={form.status} options={['Planned', 'In Progress', 'Completed', 'On Hold', 'Blocked']} onChange={value => setForm(f => ({ ...f, status: value }))} /></div><div className="grid sm:grid-cols-4 gap-3"><InputField label="Planned start" type="date" value={form.planned_start} onChange={value => setForm(f => ({ ...f, planned_start: value }))} /><InputField label="Planned end" type="date" value={form.planned_end} onChange={value => setForm(f => ({ ...f, planned_end: value }))} /><InputField label="Actual start" type="date" value={form.actual_start} onChange={value => setForm(f => ({ ...f, actual_start: value }))} /><InputField label="Actual end" type="date" value={form.actual_end} onChange={value => setForm(f => ({ ...f, actual_end: value }))} /></div><div className="grid sm:grid-cols-2 gap-3"><InputField label="Completion (%)" type="number" min={0} max={100} value={form.percent_completed} onChange={value => setForm(f => ({ ...f, percent_completed: value }))} /><InputField label="Revised target (if delayed)" type="date" value={form.revised_target_date} onChange={value => setForm(f => ({ ...f, revised_target_date: value }))} /></div><TextAreaField label="Dependency" value={form.dependency} onChange={value => setForm(f => ({ ...f, dependency: value }))} /><TextAreaField label="Delay / blocker reason" value={form.blocker} onChange={value => setForm(f => ({ ...f, blocker: value }))} /><TextAreaField label="Delay reason and update remarks" value={`${form.delay_reason}${form.delay_reason && form.remarks ? '\n' : ''}${form.remarks}`} onChange={value => setForm(f => ({ ...f, remarks: value }))} /><FormActions editing={editing} onClose={onClose} label="Add delivery task" /></form></ModalShell>; }
function BottleneckModal({ projects, form, setForm, editing, onClose, onSubmit }: { projects: ITProject[]; form: BottleneckForm; setForm: React.Dispatch<React.SetStateAction<BottleneckForm>>; editing: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) { return <ModalShell title={editing ? 'Update Bottleneck' : 'Record Bottleneck'} onClose={onClose}><form className="space-y-4 pt-4" onSubmit={onSubmit}><SelectField label="Affected project" value={form.project_id} options={projects.map(project => project.id)} onChange={value => setForm(f => ({ ...f, project_id: value }))} /><SelectField label="Category" value={form.category} options={bottleneckCategories} onChange={value => setForm(f => ({ ...f, category: value }))} /><TextAreaField label="Issue description" value={form.description} required onChange={value => setForm(f => ({ ...f, description: value }))} /><div className="grid sm:grid-cols-3 gap-3"><InputField label="Responsible person" value={form.responsible_person} required onChange={value => setForm(f => ({ ...f, responsible_person: value }))} /><InputField label="Expected resolution" type="date" value={form.expected_resolution_date} onChange={value => setForm(f => ({ ...f, expected_resolution_date: value }))} /><SelectField label="Escalation level" value={form.escalation_level} options={['Project Team', 'IT Head', 'Management', 'CEO']} onChange={value => setForm(f => ({ ...f, escalation_level: value }))} /></div><SelectField label="Current status" value={form.status} options={['Open', 'In Progress', 'Awaiting Decision', 'Resolved', 'Closed']} onChange={value => setForm(f => ({ ...f, status: value }))} /><TextAreaField label="Dependency / support required" value={form.support_required} required onChange={value => setForm(f => ({ ...f, support_required: value }))} /><TextAreaField label="Resolution details" value={form.resolution_details} onChange={value => setForm(f => ({ ...f, resolution_details: value }))} /><FormActions editing={editing} onClose={onClose} label="Record bottleneck" /></form></ModalShell>; }
function VendorModal({ projects, form, setForm, editing, onClose, onSubmit }: { projects: ITProject[]; form: VendorForm; setForm: React.Dispatch<React.SetStateAction<VendorForm>>; editing: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) { return <ModalShell title={editing ? 'Update Vendor Commitment' : 'Add Vendor Commitment'} onClose={onClose}><form className="space-y-4 pt-4" onSubmit={onSubmit}><div className="grid sm:grid-cols-2 gap-3"><InputField label="Vendor name" value={form.vendor_name} required onChange={value => setForm(f => ({ ...f, vendor_name: value }))} /><SelectField label="Associated project" value={form.project_id} options={['', ...projects.map(project => project.id)]} onChange={value => setForm(f => ({ ...f, project_id: value }))} /></div><InputField label="Associated application (optional)" value={form.application_name} onChange={value => setForm(f => ({ ...f, application_name: value }))} /><TextAreaField label="Agreed scope and deliverables" value={form.agreed_scope} required onChange={value => setForm(f => ({ ...f, agreed_scope: value }))} /><div className="grid sm:grid-cols-3 gap-3"><InputField label="Committed date" type="date" value={form.committed_date} onChange={value => setForm(f => ({ ...f, committed_date: value }))} /><SelectField label="Delivery status" value={form.status} options={['On Track', 'At Risk', 'Delayed', 'Completed', 'On Hold']} onChange={value => setForm(f => ({ ...f, status: value }))} /><SelectField label="Support / maintenance" value={form.support_maintenance_status} options={['Active', 'Expiring', 'Expired', 'Not Applicable']} onChange={value => setForm(f => ({ ...f, support_maintenance_status: value }))} /></div><TextAreaField label="Deliverables completed" value={form.deliverables_completed} onChange={value => setForm(f => ({ ...f, deliverables_completed: value }))} /><TextAreaField label="Deliverables pending" value={form.deliverables_pending} onChange={value => setForm(f => ({ ...f, deliverables_pending: value }))} /><TextAreaField label="Issue waiting on vendor" value={form.issue_waiting_on_vendor} onChange={value => setForm(f => ({ ...f, issue_waiting_on_vendor: value }))} /><TextAreaField label="Management action required" value={form.management_action_required} onChange={value => setForm(f => ({ ...f, management_action_required: value }))} /><InputField label="Internal owner" value={form.owner} required onChange={value => setForm(f => ({ ...f, owner: value }))} /><FormActions editing={editing} onClose={onClose} label="Save vendor commitment" /></form></ModalShell>; }

