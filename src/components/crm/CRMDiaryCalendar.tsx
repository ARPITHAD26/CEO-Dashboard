import React, { useState, useMemo } from 'react';
import { 
  CRMMeeting, CRMDiaryTask, CRMWorkflowRule, CRMWorkflowExecutionLog, 
  AppState, CRMDiaryTargetRole, CRMDiaryTaskPriority 
} from '../../types';
import { 
  Calendar as CalendarIcon, Clock, Video, Users, CheckCircle2, 
  AlertCircle, Plus, Send, ExternalLink, Copy, Check, Filter, 
  ChevronLeft, ChevronRight, Zap, RefreshCw, Sparkles, Building2, 
  Phone, Mail, MessageSquare, Shield, Bell, CheckSquare, 
  ListFilter, CalendarDays, Eye, Edit3, Trash2, ArrowRight
} from 'lucide-react';

interface Props {
  state: AppState;
  currentUserEmail: string;
  onAddMeeting: (meeting: CRMMeeting) => void;
  onUpdateMeeting: (meeting: CRMMeeting) => void;
  onAddTask: (task: CRMDiaryTask) => void;
  onUpdateTask: (task: CRMDiaryTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleWorkflowRule: (ruleId: string) => void;
  onRunWorkflowEngine: () => void;
  onSendMeetingLink: (meeting: CRMMeeting, channel: 'email' | 'whatsapp' | 'copy') => void;
}

export const CRMDiaryCalendar: React.FC<Props> = ({
  state,
  currentUserEmail,
  onAddMeeting,
  onUpdateMeeting,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleWorkflowRule,
  onRunWorkflowEngine,
  onSendMeetingLink
}) => {
  // Navigation & Viewport Modes
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day' | 'agenda' | 'automations'>('month');
  const [roleFilter, setRoleFilter] = useState<'all' | 'President' | 'BD Team'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'meetings' | 'tasks'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected date reference (Default to 2026-10-08 or today's real date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-08');

  // Modals state
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [sendLinkModalMeeting, setSendLinkModalMeeting] = useState<CRMMeeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<CRMMeeting | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const meetings = state.crmMeetings || [];
  const tasks = state.crmDiaryTasks || [];
  const workflowRules = state.crmWorkflowRules || [];
  const workflowLogs = state.crmWorkflowLogs || [];

  // Parse current selected date into Year & Month
  const [currYear, currMonth] = useMemo(() => {
    const parts = selectedDate.split('-');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }, [selectedDate]);

  // Navigate dates
  const handlePrevMonth = () => {
    const date = new Date(currYear, currMonth - 2, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-01`);
  };

  const handleNextMonth = () => {
    const date = new Date(currYear, currMonth, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-01`);
  };

  const handleSetToday = () => {
    setSelectedDate('2026-10-08');
  };

  // Month Calendar Grid calculations
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(currYear, currMonth - 1, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currYear, currMonth, 0).getDate();
    const daysArray: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(currYear, currMonth - 1, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = String(currMonth - 1 === 0 ? 12 : currMonth - 1).padStart(2, '0');
      const prevY = currMonth - 1 === 0 ? currYear - 1 : currYear;
      daysArray.push({
        dateStr: `${prevY}-${prevM}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const mm = String(currMonth).padStart(2, '0');
      daysArray.push({
        dateStr: `${currYear}-${mm}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remaining = (7 - (daysArray.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = String(currMonth + 1 === 13 ? 1 : currMonth + 1).padStart(2, '0');
      const nextY = currMonth + 1 === 13 ? currYear + 1 : currYear;
      daysArray.push({
        dateStr: `${nextY}-${nextM}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return daysArray;
  }, [currYear, currMonth]);

  // Filtered Meetings and Tasks
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Role filter
      if (roleFilter === 'President') {
        const isPresident = m.attendee_role === 'President' || m.attendee_role === 'Joint Executive' ||
          (m.participants && m.participants.toLowerCase().includes('president'));
        if (!isPresident) return false;
      } else if (roleFilter === 'BD Team') {
        const isBD = m.attendee_role === 'BD Team' || m.attendee_role === 'Joint Executive' ||
          !m.attendee_role;
        if (!isBD) return false;
      }

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = m.company_name.toLowerCase().includes(term) ||
          m.agenda.toLowerCase().includes(term) ||
          (m.participants && m.participants.toLowerCase().includes(term)) ||
          (m.conducted_by && m.conducted_by.toLowerCase().includes(term));
        if (!match) return false;
      }

      return true;
    });
  }, [meetings, roleFilter, searchTerm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (roleFilter === 'President' && t.target_role === 'BD Team') return false;
      if (roleFilter === 'BD Team' && t.target_role === 'President') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = t.title.toLowerCase().includes(term) ||
          (t.company_name && t.company_name.toLowerCase().includes(term)) ||
          (t.assigned_to && t.assigned_to.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term));
        if (!match) return false;
      }

      return true;
    });
  }, [tasks, roleFilter, searchTerm]);

  // Quick statistics
  const todayStr = '2026-10-08';
  const todayMeetings = meetings.filter(m => m.meeting_date === todayStr);
  const presidentTasksToday = tasks.filter(t => t.due_date === todayStr && (t.target_role === 'President' || t.target_role === 'Both') && t.status !== 'Completed');
  const bdTasksToday = tasks.filter(t => t.due_date === todayStr && (t.target_role === 'BD Team' || t.target_role === 'Both') && t.status !== 'Completed');
  const meetingsWithLinks = meetings.filter(m => Boolean(m.meeting_link));

  // Map events by date for fast lookup in Month view
  const eventsByDate = useMemo(() => {
    const map = new Map<string, { meetings: CRMMeeting[]; tasks: CRMDiaryTask[] }>();
    
    filteredMeetings.forEach(m => {
      const cur = map.get(m.meeting_date) || { meetings: [], tasks: [] };
      cur.meetings.push(m);
      map.set(m.meeting_date, cur);
    });

    filteredTasks.forEach(t => {
      const cur = map.get(t.due_date) || { meetings: [], tasks: [] };
      cur.tasks.push(t);
      map.set(t.due_date, cur);
    });

    return map;
  }, [filteredMeetings, filteredTasks]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return {
      meetings: filteredMeetings.filter(m => m.meeting_date === selectedDate),
      tasks: filteredTasks.filter(t => t.due_date === selectedDate)
    };
  }, [filteredMeetings, filteredTasks, selectedDate]);

  // Form State for New Meeting
  const [newMeeting, setNewMeeting] = useState<Partial<CRMMeeting>>({
    company_name: '',
    meeting_date: selectedDate,
    meeting_time: '11:00 AM',
    meeting_type: 'Virtual Video',
    participants: 'President / CEO, Vikram Singh (BD Lead), Client Team',
    agenda: '',
    discussion_points: '',
    commercial_discussion: '',
    outcome: 'Positive',
    next_action: '',
    conducted_by: 'President / CEO & Vikram Singh',
    attendee_role: 'Joint Executive',
    meeting_platform: 'Google Meet',
    meeting_link: 'https://meet.google.com/' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6),
    reminder_minutes: 60,
    status: 'Scheduled'
  });

  // Form State for New Task Reminder
  const [newTask, setNewTask] = useState<Partial<CRMDiaryTask>>({
    title: '',
    company_name: '',
    target_role: 'Both',
    assigned_to: 'President / CEO & Vikram Singh',
    due_date: selectedDate,
    due_time: '10:00 AM',
    priority: 'High',
    category: 'President Reminder',
    description: '',
    reminder_minutes_before: 60,
    status: 'Pending'
  });

  // Helper to generate fresh Google Meet link
  const generateGoogleMeetLink = () => {
    const code = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    return `https://meet.google.com/${code}`;
  };

  const handleSaveNewMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.company_name || !newMeeting.agenda) {
      alert('Please specify the Client/Company and Meeting Agenda');
      return;
    }

    const created: CRMMeeting = {
      id: `MTG-${Date.now().toString().slice(-4)}`,
      lead_id: newMeeting.lead_id,
      company_name: newMeeting.company_name,
      meeting_date: newMeeting.meeting_date || selectedDate,
      meeting_time: newMeeting.meeting_time || '11:00 AM',
      meeting_type: newMeeting.meeting_type || 'Virtual Video',
      participants: newMeeting.participants || 'President / CEO, BD Team',
      agenda: newMeeting.agenda,
      discussion_points: newMeeting.discussion_points || 'Scheduled for detailed executive presentation',
      commercial_discussion: newMeeting.commercial_discussion || '',
      outcome: newMeeting.outcome || 'Positive',
      next_action: newMeeting.next_action || 'Follow up with executive minutes',
      conducted_by: newMeeting.conducted_by || 'Vikram Singh',
      meeting_link: newMeeting.meeting_link || generateGoogleMeetLink(),
      meeting_platform: newMeeting.meeting_platform || 'Google Meet',
      meeting_link_sent: false,
      attendee_role: newMeeting.attendee_role || 'Joint Executive',
      status: 'Scheduled',
      reminder_minutes: newMeeting.reminder_minutes || 60,
      reminder_sent: false,
      location: newMeeting.meeting_type === 'Virtual Video' ? 'Google Meet Video Call' : 'Executive Boardroom'
    };

    onAddMeeting(created);
    setIsScheduleMeetingModalOpen(false);
    showNotice(`Meeting scheduled with ${created.company_name}! Meeting link generated.`);
  };

  const handleSaveNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) {
      alert('Please provide a task title');
      return;
    }

    const created: CRMDiaryTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title: newTask.title,
      company_name: newTask.company_name || 'General Operations',
      target_role: newTask.target_role || 'Both',
      assigned_to: newTask.assigned_to || (newTask.target_role === 'President' ? 'President / CEO' : 'BD Team'),
      due_date: newTask.due_date || selectedDate,
      due_time: newTask.due_time || '10:00 AM',
      priority: newTask.priority || 'High',
      status: 'Pending',
      category: newTask.category || 'President Reminder',
      description: newTask.description || '',
      reminder_minutes_before: newTask.reminder_minutes_before || 60,
      reminder_status: 'Scheduled',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onAddTask(created);
    setIsAddTaskModalOpen(false);
    showNotice(`Task reminder added for ${created.target_role}.`);
  };

  const handleToggleTaskStatus = (task: CRMDiaryTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const updated: CRMDiaryTask = {
      ...task,
      status: nextStatus,
      completed_at: nextStatus === 'Completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined
    };
    onUpdateTask(updated);
    showNotice(nextStatus === 'Completed' ? `Task "${task.title}" marked completed & synced to DAR!` : `Task moved to pending.`);
  };

  const handleQuickReschedule = (meeting: CRMMeeting, newDate: string, newTime: string) => {
    const updated: CRMMeeting = {
      ...meeting,
      meeting_date: newDate,
      meeting_time: newTime,
      status: 'Rescheduled'
    };
    onUpdateMeeting(updated);
    showNotice(`Meeting with ${meeting.company_name} rescheduled to ${newDate} at ${newTime}. Automated notification queued.`);
  };

  const handleUpdateOutcome = (meeting: CRMMeeting, outcome: CRMMeeting['outcome']) => {
    const updated: CRMMeeting = {
      ...meeting,
      outcome,
      status: 'Completed'
    };
    onUpdateMeeting(updated);
    showNotice(`Meeting marked Completed with outcome: "${outcome}". Workflow pipeline triggered.`);
  };

  const handleCopyInvite = (meeting: CRMMeeting) => {
    const text = `SPOORTHY INTEGRATED SOLUTIONS - CORPORATE MEETING INVITE
Client / Partner: ${meeting.company_name}
Topic: ${meeting.agenda}
Date: ${meeting.meeting_date}
Time: ${meeting.meeting_time}
Platform: ${meeting.meeting_platform || 'Google Meet'}
Join Video Call: ${meeting.meeting_link || 'https://meet.google.com/sis-executive'}
Host & Participants: ${meeting.participants}
Host: Spoorthy Integrated Executive Management`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showNotice('Meeting link & complete invite copied to clipboard!');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-20 right-8 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-sky-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-300">Executive Diary System Notice</div>
            <div className="text-xs text-slate-200">{actionNotice}</div>
          </div>
        </div>
      )}

      {/* Top Banner / Hero Bar */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm text-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono text-[10px] uppercase font-bold tracking-wider border border-sky-200 flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 text-sky-600" />
              PRESIDENT &amp; BD DIARY MAINTENANCE SUITE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              Live Link Dispatch Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Executive Calendar, Meeting Updates &amp; Task Reminders
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Seamless Diary coordination for the President &amp; BD Team with instant video links, reminder alerts, and automated CRM workflows.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setNewMeeting(prev => ({ ...prev, meeting_date: selectedDate }));
              setIsScheduleMeetingModalOpen(true);
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>

          <button
            onClick={() => {
              setNewTask(prev => ({ ...prev, due_date: selectedDate }));
              setIsAddTaskModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-2xl shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>Add Task Reminder</span>
          </button>

          <button
            onClick={onRunWorkflowEngine}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
            title="Execute Workflow Rules Engine against current meetings and tasks"
          >
            <Zap className="w-4 h-4 text-purple-600" />
            <span>Run Automations</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">TODAY&apos;S SESSIONS</span>
            <CalendarIcon className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 mt-1">
            {todayMeetings.length} Meetings
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Date: {todayStr}</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">PRESIDENT AGENDA</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-black text-amber-800 mt-1">
            {presidentTasksToday.length} Pending
          </div>
          <div className="text-[10px] text-amber-700 mt-1">
            High priority briefings
          </div>
        </div>

        <div className="bg-white border border-sky-200 bg-sky-50/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-sky-700 uppercase">BD TEAM TASKS</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-sky-800 mt-1">
            {bdTasksToday.length} Reminders
          </div>
          <div className="text-[10px] text-sky-700 mt-1">
            Client follow-ups &amp; pitches
          </div>
        </div>

        <div className="bg-white border border-indigo-200 bg-indigo-50/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">MEETING LINKS ATTACHED</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-mono font-black text-indigo-800 mt-1">
            {meetingsWithLinks.length} Active Links
          </div>
          <div className="text-[10px] text-indigo-700 mt-1">
            Google Meet &amp; MS Teams
          </div>
        </div>

        <div className="bg-white border border-purple-200 bg-purple-50/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">AUTOMATION ENGINE</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-mono font-black text-purple-800 mt-1">
            {workflowRules.filter(r => r.is_active).length} Rules Active
          </div>
          <div className="text-[10px] text-purple-700 mt-1">
            {workflowLogs.length} automated events
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Audience Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveView('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'month'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Month View</span>
          </button>

          <button
            onClick={() => setActiveView('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'week'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Week View</span>
          </button>

          <button
            onClick={() => setActiveView('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'day'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Day Schedule</span>
          </button>

          <button
            onClick={() => setActiveView('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'agenda'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Agenda Stream</span>
          </button>

          <button
            onClick={() => setActiveView('automations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'automations'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automations ({workflowRules.length})</span>
          </button>
        </div>

        {/* Audience / Persona Filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold px-2">Role:</span>
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                roleFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('President')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                roleFilter === 'President' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              President Only
            </button>
            <button
              onClick={() => setRoleFilter('BD Team')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                roleFilter === 'BD Team' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              BD Team Only
            </button>
          </div>

          <input
            type="text"
            placeholder="Search meetings, tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-48"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MONTH VIEW CALENDAR GRID                                               */}
      {/* ========================================================================= */}
      {activeView === 'month' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {monthNames[currMonth - 1]} {currYear}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                | Selected: {selectedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleSetToday}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Today (Oct 8)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-500 py-1 border-b border-slate-100">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((item, idx) => {
              const events = eventsByDate.get(item.dateStr);
              const meetingCount = events ? events.meetings.length : 0;
              const taskCount = events ? events.tasks.length : 0;
              const isSelected = item.dateStr === selectedDate;
              const isToday = item.dateStr === todayStr;

              return (
                <div
                  key={`${item.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`min-h-[100px] p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/40 shadow-sm ring-2 ring-sky-500/20'
                      : isToday
                      ? 'border-amber-300 bg-amber-50/20'
                      : item.isCurrentMonth
                      ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      : 'border-slate-100 bg-slate-50/40 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold rounded-lg px-1.5 py-0.5 ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.dayNum}
                    </span>

                    {(meetingCount > 0 || taskCount > 0) && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {meetingCount + taskCount} items
                      </span>
                    )}
                  </div>

                  {/* Day Mini-Badges */}
                  <div className="space-y-1 my-1">
                    {events && events.meetings.slice(0, 2).map(m => (
                      <div
                        key={m.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                          m.attendee_role === 'President'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                        title={`${m.meeting_time} - ${m.company_name}`}
                      >
                        <Video className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{m.company_name}</span>
                      </div>
                    ))}

                    {events && events.tasks.slice(0, 1).map(t => (
                      <div
                        key={t.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 line-through'
                            : t.target_role === 'President'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        title={t.title}
                      >
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {events && (events.meetings.length + events.tasks.length > 3) && (
                      <div className="text-[9px] text-slate-500 font-mono text-right">
                        +{events.meetings.length + events.tasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Indicators bottom line */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                    {meetingCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Meetings"></span>
                    )}
                    {taskCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Tasks"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Focus Card */}
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">
                Focused Date: {selectedDate} {selectedDate === todayStr ? '(TODAY)' : ''}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedDateEvents.meetings.length} Scheduled Meetings &amp; {selectedDateEvents.tasks.length} Task Reminders
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('day')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>Open Full Day Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WEEK VIEW TIME-BLOCK SCHEDULE                                         */}
      {/* ========================================================================= */}
      {activeView === 'week' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                7-Day Executive Time-Block Calendar
              </h3>
              <p className="text-xs text-slate-500">
                Weekly visual layout of client pitches, President briefings, and team commitments.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-slate-600">
              Week of {selectedDate}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12'].map(dateStr => {
              const dayMeetings = filteredMeetings.filter(m => m.meeting_date === dateStr);
              const dayTasks = filteredTasks.filter(t => t.due_date === dateStr);
              const isToday = dateStr === todayStr;

              const dateObj = new Date(dateStr);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-2xl border flex flex-col space-y-3 ${
                    isToday
                      ? 'border-sky-500 bg-sky-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                      {dayName}
                    </span>
                    <span className={`text-sm font-black ${isToday ? 'text-sky-600' : 'text-slate-900'}`}>
                      {dateStr.slice(5)}
                    </span>
                  </div>

                  {/* Meetings Column */}
                  <div className="space-y-2 flex-1">
                    {dayMeetings.map(m => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5 hover:border-sky-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[9px] font-bold">
                            {m.meeting_time}
                          </span>
                          {m.attendee_role === 'President' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              President
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {m.company_name}
                        </div>

                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {m.agenda}
                        </div>

                        {m.meeting_link && (
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                            <a
                              href={m.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Video className="w-3 h-3" />
                              <span>Join Link</span>
                            </a>

                            <button
                              onClick={() => setSendLinkModalMeeting(m)}
                              className="text-[10px] text-slate-500 hover:text-sky-600 flex items-center gap-1 cursor-pointer"
                              title="Send meeting link"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Tasks in this day */}
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTaskStatus(t)}
                        className={`p-2 rounded-xl border text-[11px] cursor-pointer transition flex items-start gap-2 ${
                          t.status === 'Completed'
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : t.target_role === 'President'
                            ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                            : 'bg-amber-50/70 border-amber-200 text-amber-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={t.status === 'Completed'}
                          readOnly
                          className="mt-0.5 rounded text-sky-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="font-bold block">{t.title}</span>
                          <span className="text-[9px] opacity-80">{t.due_time}</span>
                        </div>
                      </div>
                    ))}

                    {dayMeetings.length === 0 && dayTasks.length === 0 && (
                      <div className="text-center py-6 text-slate-300 text-xs">
                        No events
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DAY SCHEDULE: HOURLY DETAILED AGENDA VIEW                             */}
      {/* ========================================================================= */}
      {activeView === 'day' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-sky-600 uppercase">
                  Daily Chronological Schedule
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Schedule for: {selectedDate} {selectedDate === todayStr ? '(TODAY)' : ''}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-white"
                />
                <button
                  onClick={handleSetToday}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Jump to Today
                </button>
              </div>
            </div>

            {/* Combined Day Schedule View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              
              {/* Left 2 Cols: Scheduled Meetings */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4 text-sky-600" />
                    <span>Scheduled Meetings ({selectedDateEvents.meetings.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setNewMeeting(prev => ({ ...prev, meeting_date: selectedDate }));
                      setIsScheduleMeetingModalOpen(true);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Meeting</span>
                  </button>
                </div>

                {selectedDateEvents.meetings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No meetings scheduled for {selectedDate}. Click &quot;Schedule Meeting&quot; above to book a new session.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.meetings.map(m => (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-sky-300 transition space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-xl bg-sky-100 text-sky-800 font-mono font-bold text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {m.meeting_time}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              {m.meeting_type}
                            </span>
                            {m.attendee_role && (
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                m.attendee_role === 'President'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}>
                                {m.attendee_role}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'Rescheduled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                              Status: {m.status || 'Scheduled'}
                            </span>
                          </div>
                        </div>

                        {/* Meeting Content */}
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <h4 className="text-base font-black text-slate-900">
                              {m.company_name}
                            </h4>
                          </div>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {m.agenda}
                          </p>
                          {m.discussion_points && (
                            <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {m.discussion_points}
                            </p>
                          )}
                        </div>

                        {/* Participants & Conducted By */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-800">Conducted By: </span>
                            {m.conducted_by}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Attendees: </span>
                            {m.participants}
                          </div>
                        </div>

                        {/* Meeting Link Section */}
                        {m.meeting_link && (
                          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Video className="w-4 h-4 text-sky-600 shrink-0" />
                              <div className="overflow-hidden">
                                <span className="text-[10px] font-mono uppercase text-sky-700 font-bold block">
                                  {m.meeting_platform || 'Google Meet'} Link
                                </span>
                                <a
                                  href={m.meeting_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-mono font-bold text-sky-700 hover:underline truncate block"
                                >
                                  {m.meeting_link}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={m.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Join Call</span>
                              </a>

                              <button
                                onClick={() => setSendLinkModalMeeting(m)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                              >
                                <Send className="w-3 h-3 text-sky-600" />
                                <span>Send Link</span>
                              </button>

                              <button
                                onClick={() => handleCopyInvite(m)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white cursor-pointer transition"
                                title="Copy Invite Text"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Meeting Outcome & Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Outcome:</span>
                            <div className="flex items-center gap-1">
                              {(['Positive', 'Follow-up Needed', 'Quotation to be Sent', 'Closed Won'] as const).map(out => (
                                <button
                                  key={out}
                                  onClick={() => handleUpdateOutcome(m, out)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                    m.outcome === out
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {out}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newTime = prompt('Enter new meeting time (e.g. 02:30 PM):', m.meeting_time);
                                if (newTime) handleQuickReschedule(m, m.meeting_date, newTime);
                              }}
                              className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Reschedule</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 1 Col: Task Reminders for this Day */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                    <span>Task Reminders ({selectedDateEvents.tasks.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setNewTask(prev => ({ ...prev, due_date: selectedDate }));
                      setIsAddTaskModalOpen(true);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {selectedDateEvents.tasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No task reminders due on {selectedDate}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.tasks.map(t => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-2xl border transition space-y-2.5 ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : t.target_role === 'President'
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={t.status === 'Completed'}
                              onChange={() => handleToggleTaskStatus(t)}
                              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                              <div className={`text-xs font-bold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {t.title}
                              </div>
                              {t.company_name && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Account: {t.company_name}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            t.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {t.description && (
                          <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-slate-100">
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                          <span>Target: {t.target_role}</span>
                          <span>Time: {t.due_time || 'All Day'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AGENDA / DIARY STREAM VIEW                                            */}
      {/* ========================================================================= */}
      {activeView === 'agenda' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Chronological Executive Diary &amp; Action Feed
              </h3>
              <p className="text-xs text-slate-500">
                Continuous timeline of upcoming meetings, follow-ups, and President briefings.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Group events by upcoming vs today vs past */}
            {['2026-10-08', '2026-10-09', '2026-10-10', '2026-10-12'].map(dateStr => {
              const dayMeetings = filteredMeetings.filter(m => m.meeting_date === dateStr);
              const dayTasks = filteredTasks.filter(t => t.due_date === dateStr);
              if (dayMeetings.length === 0 && dayTasks.length === 0) return null;

              const isToday = dateStr === todayStr;

              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-xl font-mono text-xs font-bold ${
                      isToday
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dateStr} {isToday ? '(TODAY)' : ''}
                    </span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayMeetings.map(m => (
                      <div
                        key={m.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-sky-300 transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                            {m.meeting_time}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.attendee_role === 'President' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.attendee_role || 'BD Team'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            {m.company_name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">
                            {m.agenda}
                          </p>
                        </div>

                        {m.meeting_link && (
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                            <a
                              href={m.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Google Meet</span>
                            </a>
                            <button
                              onClick={() => setSendLinkModalMeeting(m)}
                              className="text-slate-600 hover:text-sky-600 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Link</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        className="p-4 bg-purple-50/30 border border-purple-200 rounded-2xl shadow-xs space-y-2 flex items-start gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={t.status === 'Completed'}
                          onChange={() => handleToggleTaskStatus(t)}
                          className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{t.title}</span>
                            <span className="text-[10px] font-mono text-purple-700 font-bold">{t.target_role}</span>
                          </div>
                          {t.company_name && (
                            <div className="text-[10px] text-slate-500 mt-0.5">Account: {t.company_name}</div>
                          )}
                          {t.description && (
                            <div className="text-xs text-slate-600 mt-1">{t.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WORKFLOW AUTOMATION ENGINE HUB                                         */}
      {/* ========================================================================= */}
      {activeView === 'automations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                    INTELLIGENT CRM AUTOMATION ENGINE
                  </span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Polling
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  CRM Diary &amp; Meeting Workflow Automation Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Automate meeting link generation, President reminders, post-session follow-ups, and Daily Activity Report (DAR) synchronization.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onRunWorkflowEngine}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Automation Cycle Now</span>
                </button>
              </div>
            </div>

            {/* Rules Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                    rule.is_active
                      ? 'bg-white border-purple-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {rule.id}
                      </span>
                      <button
                        onClick={() => onToggleWorkflowRule(rule.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          rule.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rule.is_active ? 'ENABLED' : 'PAUSED'}
                      </button>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {rule.name}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Target: {rule.target_audience}</span>
                    <span className="text-purple-600 font-bold">Action: {rule.action}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Automation Execution Log */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Live Workflow Automation Execution History</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {workflowLogs.length} events logged
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Rule Name</th>
                      <th className="p-3">Trigger Event</th>
                      <th className="p-3">Entity / Account</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {workflowLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.triggered_at}</td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.rule_name}</td>
                        <td className="p-3 font-medium text-slate-600">{log.trigger_event}</td>
                        <td className="p-3 font-bold text-sky-700">{log.entity_name}</td>
                        <td className="p-3 text-slate-600">{log.details}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{log.recipient}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            log.status === 'Success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SEND MEETING LINK MODAL                                         */}
      {/* ========================================================================= */}
      {sendLinkModalMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Send Meeting Link
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dispatch video invitation to President, BD Team &amp; Client
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSendLinkModalMeeting(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Meeting summary card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>{sendLinkModalMeeting.company_name}</span>
                <span className="font-mono text-sky-600">{sendLinkModalMeeting.meeting_time} | {sendLinkModalMeeting.meeting_date}</span>
              </div>
              <p className="text-xs text-slate-600">{sendLinkModalMeeting.agenda}</p>
              <div className="text-[11px] text-slate-500 font-mono">
                Participants: {sendLinkModalMeeting.participants}
              </div>
            </div>

            {/* Meeting Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Active Meeting URL:</span>
                <button
                  type="button"
                  onClick={() => {
                    const newLink = generateGoogleMeetLink();
                    const updated = { ...sendLinkModalMeeting, meeting_link: newLink };
                    setSendLinkModalMeeting(updated);
                    onUpdateMeeting(updated);
                  }}
                  className="text-sky-600 hover:text-sky-700 text-xs font-bold cursor-pointer"
                >
                  Regenerate Link
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sendLinkModalMeeting.meeting_link || 'https://meet.google.com/sis-executive'}
                  className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-800"
                />
                <button
                  onClick={() => {
                    if (sendLinkModalMeeting.meeting_link) {
                      navigator.clipboard.writeText(sendLinkModalMeeting.meeting_link);
                      showNotice('Meeting link copied to clipboard!');
                    }
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Multi-channel dispatch options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onSendMeetingLink(sendLinkModalMeeting, 'email');
                  setSendLinkModalMeeting(null);
                  showNotice(`Meeting invite & link emailed to ${sendLinkModalMeeting.attendee_emails || 'all participants'}`);
                }}
                className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer"
              >
                <Mail className="w-5 h-5 text-sky-600" />
                <span>Send via Email</span>
                <span className="text-[10px] font-normal text-slate-500">Instant Calendar ICS</span>
              </button>

              <button
                onClick={() => {
                  onSendMeetingLink(sendLinkModalMeeting, 'whatsapp');
                  setSendLinkModalMeeting(null);
                  showNotice(`WhatsApp invitation link generated & logged.`);
                }}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Send via WhatsApp</span>
                <span className="text-[10px] font-normal text-slate-500">1-Click Dispatch</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleCopyInvite(sendLinkModalMeeting)}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Executive Invite Text</span>
              </button>

              <button
                onClick={() => setSendLinkModalMeeting(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SCHEDULE NEW MEETING                                            */}
      {/* ========================================================================= */}
      {isScheduleMeetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Schedule Corporate Meeting
                </h3>
                <p className="text-xs text-slate-500">
                  Adds to Diary, provisions Google Meet link, and enables reminder workflows
                </p>
              </div>
              <button
                onClick={() => setIsScheduleMeetingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMeeting} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Motors / Wipro Tech"
                    value={newMeeting.company_name || ''}
                    onChange={(e) => setNewMeeting({ ...newMeeting, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audience / Role Scope</label>
                  <select
                    value={newMeeting.attendee_role || 'Joint Executive'}
                    onChange={(e) => setNewMeeting({ ...newMeeting, attendee_role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Joint Executive">Joint Executive (President &amp; BD Team)</option>
                    <option value="President">President Only</option>
                    <option value="BD Team">BD Team Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Date *</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.meeting_date || selectedDate}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="11:00 AM"
                    value={newMeeting.meeting_time || '11:00 AM'}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meeting Format</label>
                  <select
                    value={newMeeting.meeting_type || 'Virtual Video'}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Virtual Video">Virtual Video</option>
                    <option value="Client Office">Client Office</option>
                    <option value="Inhouse Conference">Inhouse Conference</option>
                    <option value="Inhouse">Inhouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Agenda &amp; Objective *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLA Terms Discussion & Commercial Rate Sign-off"
                  value={newMeeting.agenda || ''}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Discussion Points / Background</label>
                <textarea
                  rows={2}
                  placeholder="Key items to discuss..."
                  value={newMeeting.discussion_points || ''}
                  onChange={(e) => setNewMeeting({ ...newMeeting, discussion_points: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attendees / Participants</label>
                  <input
                    type="text"
                    value={newMeeting.participants || ''}
                    onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                    placeholder="President, Vikram Singh, Client Contacts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Conducted By</label>
                  <input
                    type="text"
                    value={newMeeting.conducted_by || 'Vikram Singh'}
                    onChange={(e) => setNewMeeting({ ...newMeeting, conducted_by: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Video Link */}
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-sky-600" />
                    Auto-Provisioned Meeting Link:
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewMeeting({ ...newMeeting, meeting_link: generateGoogleMeetLink() })}
                    className="text-sky-700 hover:text-sky-800 font-bold text-[11px] cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={newMeeting.meeting_link || ''}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meeting_link: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-mono text-sky-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleMeetingModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Save &amp; Add to Diary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD TASK REMINDER                                               */}
      {/* ========================================================================= */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Create Task Reminder
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled alert for President or BD Team with deadline tracking
                </p>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Briefing with President before Apollo hospital sign-off"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Persona</label>
                  <select
                    value={newTask.target_role || 'Both'}
                    onChange={(e) => setNewTask({ ...newTask, target_role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="President">President Only</option>
                    <option value="BD Team">BD Team Only</option>
                    <option value="Both">Both (President &amp; BD Team)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTask.priority || 'High'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.due_date || selectedDate}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={newTask.due_time || '10:00 AM'}
                    onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account / Client Association</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospitals"
                    value={newTask.company_name || ''}
                    onChange={(e) => setNewTask({ ...newTask, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newTask.category || 'President Reminder'}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="President Reminder">President Reminder</option>
                    <option value="Meeting Follow-up">Meeting Follow-up</option>
                    <option value="Proposal Dispatch">Proposal Dispatch</option>
                    <option value="Client Review">Client Review</option>
                    <option value="Team Action">Team Action</option>
                    <option value="Contract Renewal">Contract Renewal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Briefing Notes</label>
                <textarea
                  rows={2}
                  placeholder="Context, files to review, or key points..."
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Save Task Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
