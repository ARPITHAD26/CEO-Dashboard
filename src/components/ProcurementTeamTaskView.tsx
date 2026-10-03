import React, { useState, useMemo } from 'react';
import { DailyProcurementTask, EodReviewRecord, AppState, Role } from '../types';
import { 
  CheckSquare, Clock, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  User, Calendar, TrendingUp, Sparkles, X, Check, Award, ArrowRight, 
  Layers, MessageSquare, BarChart2
} from 'lucide-react';
import { saveEntityToFirestore } from '../lib/firebaseService';

interface ProcurementTeamTaskViewProps {
  state: AppState;
  currentRole: Role;
  userEmail: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const ProcurementTeamTaskView: React.FC<ProcurementTeamTaskViewProps> = ({
  state,
  currentRole,
  userEmail,
  onUpdateState
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'eod' | 'team'>('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEodModal, setShowEodModal] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState<Partial<DailyProcurementTask>>({
    task_title: '',
    assigned_to_name: 'Deepika Nair',
    assigned_to_email: 'deepika.nair@spoorthy.com',
    priority: 'High',
    related_to: 'Tender',
    related_ref_id: '',
    due_date: new Date().toISOString().split('T')[0],
    expected_output: '',
    status: 'Pending'
  });

  // New EOD Review State
  const [newEod, setNewEod] = useState<Partial<EodReviewRecord>>({
    employee_name: 'Deepika Nair',
    date: new Date().toISOString().split('T')[0],
    tasks_assigned: 4,
    tasks_completed: 3,
    tasks_delayed: 1,
    delay_reason_category: 'Vendor',
    delay_explanation: '',
    tomorrow_plan: '',
    assistance_needed: '',
    productivity_score: 85
  });

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return (state.dailyProcurementTasks || []).filter(task => {
      const matchesSearch = 
        task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.related_ref_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || task.assigned_to_name === assigneeFilter;
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [state.dailyProcurementTasks, searchTerm, statusFilter, assigneeFilter]);

  // Unique Assignees
  const assignees = useMemo(() => {
    const set = new Set((state.dailyProcurementTasks || []).map(t => t.assigned_to_name));
    return Array.from(set);
  }, [state.dailyProcurementTasks]);

  // Save Task
  const handleSaveTask = () => {
    if (!newTask.task_title) {
      alert('Please provide task title.');
      return;
    }

    const taskCode = `TSK-${new Date().toISOString().slice(5, 10).replace('-', '')}-${String((state.dailyProcurementTasks || []).length + 1).padStart(3, '0')}`;
    const created: DailyProcurementTask = {
      id: `DPT-${Date.now().toString().slice(-6)}`,
      task_code: taskCode,
      date: new Date().toISOString().split('T')[0],
      assigned_to_name: newTask.assigned_to_name || 'Deepika Nair',
      assigned_to_email: newTask.assigned_to_email || 'deepika.nair@spoorthy.com',
      task_title: newTask.task_title!,
      priority: newTask.priority || 'High',
      related_to: newTask.related_to || 'Tender',
      related_ref_id: newTask.related_ref_id || 'GENERAL',
      due_date: newTask.due_date || new Date().toISOString().split('T')[0],
      expected_output: newTask.expected_output || 'Task output delivered on schedule',
      status: newTask.status || 'Pending',
      created_at: new Date().toISOString()
    };

    onUpdateState(prev => ({
      ...prev,
      dailyProcurementTasks: [created, ...(prev.dailyProcurementTasks || [])]
    }));

    saveEntityToFirestore('dailyProcurementTasks', created.id, created);
    setShowAddTaskModal(false);
  };

  // Toggle Task Status
  const handleToggleTaskStatus = (taskId: string, currentStatus: DailyProcurementTask['status']) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    onUpdateState(prev => {
      const updated = (prev.dailyProcurementTasks || []).map(t => {
        if (t.id === taskId) {
          const tUpdated = { ...t, status: nextStatus };
          saveEntityToFirestore('dailyProcurementTasks', t.id, tUpdated);
          return tUpdated;
        }
        return t;
      });
      return { ...prev, dailyProcurementTasks: updated };
    });
  };

  // Save EOD Review
  const handleSaveEod = () => {
    const created: EodReviewRecord = {
      id: `EOD-${Date.now().toString().slice(-6)}`,
      employee_name: newEod.employee_name || 'Deepika Nair',
      date: newEod.date || new Date().toISOString().split('T')[0],
      tasks_assigned: Number(newEod.tasks_assigned) || 3,
      tasks_completed: Number(newEod.tasks_completed) || 3,
      tasks_delayed: Number(newEod.tasks_delayed) || 0,
      delay_reason_category: newEod.delay_reason_category || 'Internal',
      delay_explanation: newEod.delay_explanation || 'No delays logged.',
      tomorrow_plan: newEod.tomorrow_plan || 'Execute scheduled RFQs and GRN audits.',
      assistance_needed: newEod.assistance_needed || 'None',
      productivity_score: Number(newEod.productivity_score) || 90,
      reviewed_by_gm: true
    };

    onUpdateState(prev => ({
      ...prev,
      eodReviews: [created, ...(prev.eodReviews || [])]
    }));

    saveEntityToFirestore('eodReviews', created.id, created);
    setShowEodModal(false);
  };

  // Metrics
  const totalTasks = state.dailyProcurementTasks?.length || 0;
  const completedCount = (state.dailyProcurementTasks || []).filter(t => t.status === 'Completed').length;
  const delayedCount = (state.dailyProcurementTasks || []).filter(t => t.status === 'Delayed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 100;

  return (
    <div id="procurement-tasks-root" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-900 to-slate-850 text-white p-6 rounded-2xl shadow-lg border border-teal-600/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckSquare className="w-3 h-3" /> Team Task & Productivity Engine
            </span>
            <span className="text-xs text-teal-200/80">Total Tasks: {totalTasks}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Procurement Team Task & EOD Monitoring</h1>
          <p className="text-teal-100/80 text-sm mt-1 max-w-2xl">
            Daily task allocation, critical milestones tracking, end-of-day (EOD) productivity reviews, and delay accountability register.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-task"
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Allocate Daily Task
          </button>
          <button
            id="btn-add-eod"
            onClick={() => setShowEodModal(true)}
            className="px-3.5 py-2 bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-sm font-medium rounded-xl border border-teal-600/40 transition flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-cyan-300" /> Submit EOD Review
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Task Completion Rate</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {completionRate}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{completedCount} of {totalTasks} completed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Active / Pending</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalTasks - completedCount} Tasks
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">In flight across team</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          delayedCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium">Delayed Tasks</span>
            {delayedCount > 0 && <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />}
          </div>
          <span className="text-2xl font-bold mt-1 block text-rose-600">
            {delayedCount} Tasks
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Exceeded target deadline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Avg Team Productivity</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            88 / 100
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">High Operational Velocity</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'tasks', label: 'Daily Task Board', icon: CheckSquare, count: (state.dailyProcurementTasks || []).length },
          { id: 'eod', label: 'EOD Productivity Reports', icon: Award, count: (state.eodReviews || []).length },
          { id: 'team', label: 'Team Velocity & Roster', icon: User, count: assignees.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-proctask-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                isActive 
                  ? 'bg-cyan-700 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-200' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-cyan-800 text-cyan-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: DAILY TASK BOARD */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-search-tasks"
                type="text"
                placeholder="Search task title, code, assignee..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>

              <select
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Assignees</option>
                {assignees.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const isCompleted = task.status === 'Completed';
              const isDelayed = task.status === 'Delayed';

              return (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 
                    isDelayed ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center transition ${
                        isCompleted ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 hover:border-emerald-600'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{task.task_code}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          task.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          task.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                          {task.related_to}: {task.related_ref_id}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.task_title}
                      </h4>

                      <p className="text-xs text-slate-500">
                        <b>Expected Output:</b> {task.expected_output}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end text-xs border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Assigned to</span>
                      <span className="font-semibold text-slate-800">{task.assigned_to_name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Due Date</span>
                      <span className={`font-semibold ${isDelayed ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {task.due_date}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isDelayed ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EOD PRODUCTIVITY REVIEWS */}
      {activeTab === 'eod' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">End of Day (EOD) Performance & Review Register</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates daily productivity scores, vendor/client impediment categories, and tomorrow's mobilization plans.
              </p>
            </div>
            <button
              onClick={() => setShowEodModal(true)}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Submit EOD Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.eodReviews || []).map(eod => (
              <div key={eod.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                      {eod.date}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{eod.employee_name}</span>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    eod.productivity_score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                    eod.productivity_score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    Score: {eod.productivity_score}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Assigned</span>
                    <span className="font-bold text-slate-800">{eod.tasks_assigned}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Completed</span>
                    <span className="font-bold text-emerald-600">{eod.tasks_completed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delayed</span>
                    <span className="font-bold text-rose-600">{eod.tasks_delayed}</span>
                  </div>
                </div>

                {eod.tasks_delayed > 0 && (
                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100 text-xs text-rose-900">
                    <span className="font-semibold block">Delay Impediment ({eod.delay_reason_category}):</span>
                    {eod.delay_explanation}
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-800 block">Tomorrow's Priority Plan:</span>
                  <p className="text-slate-600">{eod.tomorrow_plan}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Assistance Required: <b>{eod.assistance_needed || 'None'}</b></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GM Reviewed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TEAM VELOCITY */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Procurement & Stores Team Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active executives managing tenders, vendor quotations, inventory inwarding, and site dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Deepika Nair', role: 'Senior Procurement Executive', focus: 'Tenders & RFQs', tasks: 12, velocity: '94%' },
              { name: 'Suresh Menon', role: 'Stores & Inventory Manager', focus: 'GRN, Issues & Stock Ledger', tasks: 8, velocity: '91%' },
              { name: 'Kavita Joshi', role: 'Vendor Billing & Accounts SPOC', focus: 'Comparative Statements & Invoices', tasks: 9, velocity: '88%' }
            ].map(m => (
              <div key={m.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-cyan-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Domain Focus:</span>
                    <span className="font-semibold text-slate-800">{m.focus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Tasks Cleared:</span>
                    <span className="font-semibold text-slate-800">{m.tasks}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-1">
                    <span className="text-slate-500 font-semibold">Productivity Velocity:</span>
                    <span className="font-bold text-emerald-600">{m.velocity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATE NEW TASK */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Allocate Daily Procurement Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  value={newTask.task_title}
                  onChange={e => setNewTask({ ...newTask, task_title: e.target.value })}
                  placeholder="e.g. Obtain 3 quotations for high-pressure scrubbers"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assignee</label>
                  <select
                    value={newTask.assigned_to_name}
                    onChange={e => setNewTask({ ...newTask, assigned_to_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Deepika Nair">Deepika Nair</option>
                    <option value="Suresh Menon">Suresh Menon</option>
                    <option value="Kavita Joshi">Kavita Joshi</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Related Domain</label>
                  <select
                    value={newTask.related_to}
                    onChange={e => setNewTask({ ...newTask, related_to: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Tender">Tender</option>
                    <option value="Indent">Indent</option>
                    <option value="Contract">Contract</option>
                    <option value="Stores">Stores</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Output / Deliverable</label>
                <textarea
                  rows={2}
                  value={newTask.expected_output}
                  onChange={e => setNewTask({ ...newTask, expected_output: e.target.value })}
                  placeholder="e.g. Comparative statement approved by GM before 4 PM"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT EOD REPORT */}
      {showEodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Daily End of Day (EOD) Review</h3>
              <button onClick={() => setShowEodModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Employee</label>
                  <select
                    value={newEod.employee_name}
                    onChange={e => setNewEod({ ...newEod, employee_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Deepika Nair">Deepika Nair</option>
                    <option value="Suresh Menon">Suresh Menon</option>
                    <option value="Kavita Joshi">Kavita Joshi</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newEod.date}
                    onChange={e => setNewEod({ ...newEod, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned</label>
                  <input
                    type="number"
                    value={newEod.tasks_assigned || ''}
                    onChange={e => setNewEod({ ...newEod, tasks_assigned: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Completed</label>
                  <input
                    type="number"
                    value={newEod.tasks_completed || ''}
                    onChange={e => setNewEod({ ...newEod, tasks_completed: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Delayed</label>
                  <input
                    type="number"
                    value={newEod.tasks_delayed || ''}
                    onChange={e => setNewEod({ ...newEod, tasks_delayed: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delay Reason Category (If any)</label>
                <select
                  value={newEod.delay_reason_category}
                  onChange={e => setNewEod({ ...newEod, delay_reason_category: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Vendor">Vendor Response Pending</option>
                  <option value="Client">Client Clarification Pending</option>
                  <option value="Internal">Internal Review Lag</option>
                  <option value="Management">Management Decision Pending</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delay Explanation / Notes</label>
                <textarea
                  rows={2}
                  value={newEod.delay_explanation}
                  onChange={e => setNewEod({ ...newEod, delay_explanation: e.target.value })}
                  placeholder="Specify blockers or vendor follow-up status..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tomorrow's Priority Plan</label>
                <textarea
                  rows={2}
                  value={newEod.tomorrow_plan}
                  onChange={e => setNewEod({ ...newEod, tomorrow_plan: e.target.value })}
                  placeholder="Key milestones targeted for tomorrow..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEodModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEod}
                className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit EOD Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
