import React, { useState, useMemo } from 'react';
import { 
  AppState, ITDailyWorkLog, ITWeeklyReport, ITMonthlyReport 
} from '../types';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, User, 
  FileText, Plus, Search, Filter, Download, Copy, Printer,
  Layers, HardDrive, ShieldCheck, Ticket, Activity, 
  ChevronRight, ArrowUpRight, TrendingUp, Cpu, Server, 
  X, Check, AlertCircle, Laptop, Wrench, Globe, Smartphone,
  Zap, Award, BarChart3, Database
} from 'lucide-react';
import { saveEntityToFirestore, deleteEntityFromFirestore } from '../lib/firebaseService';

interface ITWorkReportsViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
}

export default function ITWorkReportsView({
  state,
  onUpdateState,
  currentUserEmail
}: ITWorkReportsViewProps) {
  // Period tab: 'daily' | 'weekly' | 'monthly'
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Daily Filters
  const dailyLogs = state.itDailyWorkLogs || [];
  const weeklyReports = state.itWeeklyReports || [];
  const monthlyReports = state.itMonthlyReports || [];

  // Available dates sorted descending
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(dailyLogs.map(l => l.date)));
    dates.sort((a, b) => b.localeCompare(a));
    return dates.length > 0 ? dates : ['2026-10-12'];
  }, [dailyLogs]);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || '2026-10-12');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Weekly selection
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string>(
    weeklyReports[0]?.id || 'WR-2026-W41'
  );

  // Monthly selection
  const [selectedMonthlyId, setSelectedMonthlyId] = useState<string>(
    monthlyReports[0]?.id || 'MR-2026-M10'
  );

  // Modal: Log Daily Activity
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [dailyFormData, setDailyFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    engineer_name: 'Arun Verma',
    engineer_role: 'Head of IT & Cloud Systems',
    category: 'Infrastructure & Cloud' as ITDailyWorkLog['category'],
    task_title: '',
    summary: '',
    status: 'Completed' as ITDailyWorkLog['status'],
    hours_spent: 2,
    priority: 'Medium' as ITDailyWorkLog['priority'],
    impacted_system_or_site: 'Hostinger VPS 01',
    blocker_note: ''
  });

  // Copied toast indicator
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active weekly and monthly report objects
  const currentWeeklyReport = useMemo(() => {
    return weeklyReports.find(w => w.id === selectedWeeklyId) || weeklyReports[0];
  }, [weeklyReports, selectedWeeklyId]);

  const currentMonthlyReport = useMemo(() => {
    return monthlyReports.find(m => m.id === selectedMonthlyId) || monthlyReports[0];
  }, [monthlyReports, selectedMonthlyId]);

  // Filtered daily logs
  const dailyDateLogs = useMemo(() => {
    return dailyLogs.filter(l => l.date === selectedDate);
  }, [dailyLogs, selectedDate]);

  const filteredDailyLogs = useMemo(() => {
    return dailyDateLogs.filter(log => {
      const matchesEng = engineerFilter === 'all' || log.engineer_name === engineerFilter;
      const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;
      const matchesStat = statusFilter === 'all' || log.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        log.task_title.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        log.engineer_name.toLowerCase().includes(q) ||
        log.impacted_system_or_site.toLowerCase().includes(q);
      return matchesEng && matchesCat && matchesStat && matchesQuery;
    });
  }, [dailyDateLogs, engineerFilter, categoryFilter, statusFilter, searchQuery]);

  // Summary KPIs for current date
  const totalDailyHours = dailyDateLogs.reduce((acc, curr) => acc + (curr.hours_spent || 0), 0);
  const completedDailyTasks = dailyDateLogs.filter(l => l.status === 'Completed').length;
  const inProgressDailyTasks = dailyDateLogs.filter(l => l.status === 'In Progress').length;
  const activeEngineersCount = new Set(dailyDateLogs.map(l => l.engineer_name)).size;

  // Handle Log Save
  const handleSaveDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyFormData.task_title) return;

    const newLog: ITDailyWorkLog = {
      id: `ITLOG-${Date.now().toString().slice(-6)}`,
      date: dailyFormData.date,
      engineer_name: dailyFormData.engineer_name,
      engineer_role: dailyFormData.engineer_role,
      category: dailyFormData.category,
      task_title: dailyFormData.task_title,
      summary: dailyFormData.summary,
      status: dailyFormData.status,
      hours_spent: Number(dailyFormData.hours_spent) || 1,
      priority: dailyFormData.priority,
      impacted_system_or_site: dailyFormData.impacted_system_or_site,
      blocker_note: dailyFormData.blocker_note || undefined,
      created_at: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...(state.itDailyWorkLogs || [])];
    const newState = {
      ...state,
      itDailyWorkLogs: updatedLogs
    };
    onUpdateState(newState);
    saveEntityToFirestore('itDailyWorkLogs' as any, newLog.id, newLog);

    // If date is different from selected date, switch view to it
    if (dailyFormData.date !== selectedDate) {
      setSelectedDate(dailyFormData.date);
    }

    setDailyModalOpen(false);
    setDailyFormData({
      date: new Date().toISOString().split('T')[0],
      engineer_name: 'Arun Verma',
      engineer_role: 'Head of IT & Cloud Systems',
      category: 'Infrastructure & Cloud',
      task_title: '',
      summary: '',
      status: 'Completed',
      hours_spent: 2,
      priority: 'Medium',
      impacted_system_or_site: 'Hostinger VPS 01',
      blocker_note: ''
    });
  };

  // Quick Status Toggle for Daily Log
  const handleUpdateLogStatus = (logId: string, newStatus: ITDailyWorkLog['status']) => {
    const updated = (state.itDailyWorkLogs || []).map(l => {
      if (l.id === logId) {
        const item = { ...l, status: newStatus };
        saveEntityToFirestore('itDailyWorkLogs' as any, item.id, item);
        return item;
      }
      return l;
    });
    onUpdateState({
      ...state,
      itDailyWorkLogs: updated
    });
  };

  // Delete Log
  const handleDeleteDailyLog = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity log?')) return;
    const updated = (state.itDailyWorkLogs || []).filter(l => l.id !== logId);
    onUpdateState({
      ...state,
      itDailyWorkLogs: updated
    });
    deleteEntityFromFirestore('itDailyWorkLogs' as any, logId);
  };

  // Copy Executive Statement for WhatsApp / Slack
  const handleCopySummary = () => {
    if (!currentMonthlyReport) return;
    const text = `📊 *SPOORTHY IT EXECUTIVE DIGEST (${currentMonthlyReport.month_label})*\n` +
      `• Uptime: ${currentMonthlyReport.overall_uptime_pct}%\n` +
      `• SLA Resolution: ${currentMonthlyReport.sla_compliance_pct}% (${currentMonthlyReport.tickets_resolved_within_sla}/${currentMonthlyReport.total_tickets_handled})\n` +
      `• Cloud & VPS Spend: ₹${(currentMonthlyReport.cloud_cost_inr / 1000).toFixed(1)}k (Budget: ₹${(currentMonthlyReport.cloud_cost_budget_inr / 1000).toFixed(1)}k)\n` +
      `• Security Audit Score: ${currentMonthlyReport.security_score_pct}%\n` +
      `• Summary: ${currentMonthlyReport.executive_summary}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-300">
            <Clock className="w-3 h-3 text-cyan-600 animate-spin" />
            In Progress
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Category Icon & Color Helper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Infrastructure & Cloud':
        return {
          icon: Server,
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'Field Biometrics & IoT':
        return {
          icon: Smartphone,
          badge: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'ERP & Software':
        return {
          icon: Database,
          badge: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
      case 'Network & Security':
        return {
          icon: ShieldCheck,
          badge: 'bg-violet-50 text-violet-700 border-violet-200'
        };
      case 'User Support & Assets':
      default:
        return {
          icon: Laptop,
          badge: 'bg-amber-50 text-amber-700 border-amber-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden border border-slate-200">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                IT Team Work Reports &amp; Operational Cadence
              </h2>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                IT Head Cockpit
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Consolidated observability for IT team deliverables: track daily engineer activity logs across VPS and client sites, review weekly sprint uptime &amp; SLA compliance, and generate executive monthly reviews for CEO and board management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {reportPeriod === 'daily' && (
              <button
                onClick={() => setDailyModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Daily Activity</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Period Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setReportPeriod('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              reportPeriod === 'daily'
                ? 'bg-cyan-600 text-white shadow-sm font-extrabold border border-cyan-600'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Work Reports ({dailyLogs.length})</span>
          </button>

          <button
            onClick={() => setReportPeriod('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              reportPeriod === 'weekly'
                ? 'bg-cyan-600 text-white shadow-sm font-extrabold border border-cyan-600'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Sprint Reports ({weeklyReports.length})</span>
          </button>

          <button
            onClick={() => setReportPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              reportPeriod === 'monthly'
                ? 'bg-cyan-600 text-white shadow-sm font-extrabold border border-cyan-600'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monthly Executive Reviews ({monthlyReports.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERIOD 1: DAILY WORK REPORTS                                              */}
      {/* ========================================================================= */}
      {reportPeriod === 'daily' && (
        <div className="space-y-6">
          {/* Daily Date Selector & KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" />
                Active Engineers
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-900">{activeEngineersCount}</span>
                <span className="text-xs text-slate-500">/ 5 Team</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% on-duty</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Hours Logged
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-indigo-600">{totalDailyHours.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Avg {(totalDailyHours / (activeEngineersCount || 1)).toFixed(1)}h / engineer</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed Tasks
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-emerald-600">{completedDailyTasks}</span>
                <span className="text-xs text-slate-500">/ {dailyDateLogs.length}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{inProgressDailyTasks} in progress</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-600" />
                Hostinger VPS
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-cyan-600">100%</span>
                <span className="text-xs text-emerald-600 font-semibold">Live</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Latency 38ms nominal</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                Biometrics Sync
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-teal-600">31/32</span>
                <span className="text-xs text-teal-600 font-semibold">Units</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">99.4% punch sync rate</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Nightly S3 Backup
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-purple-600">Passed</span>
                <span className="text-xs text-emerald-600 font-bold">03:00</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">24.2MB encrypted cold test</p>
            </div>
          </div>

          {/* Daily Routine Verification Checklist Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Daily IT Operations Protocol &amp; Shift Verification for {selectedDate}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Updated automatically by automated health daemon</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">07:00 AM Morning Server Ping</p>
                  <p className="text-[11px] text-slate-500 font-mono">All VPS nodes CPU &lt; 40%, RAM OK</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">10:00 AM Biometrics Socket Audit</p>
                  <p className="text-[11px] text-slate-500 font-mono">24/24 client campuses syncing</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">14:00 PM Database Index Latency</p>
                  <p className="text-[11px] text-slate-500 font-mono">Avg query response 4ms</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">18:00 PM Off-site S3 Backup Vault</p>
                  <p className="text-[11px] text-slate-500 font-mono">Checksum verified &amp; signed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-mono text-slate-500">Date:</span>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer font-mono"
                >
                  {availableDates.map(d => (
                    <option key={d} value={d}>
                      {d} {d === '2026-10-12' ? '(Today)' : d === '2026-10-11' ? '(Yesterday)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks, systems, sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Engineer Filter */}
              <select
                value={engineerFilter}
                onChange={(e) => setEngineerFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Engineers (5)</option>
                <option value="Arun Verma">Arun Verma (Cloud/DevOps)</option>
                <option value="Rajesh Kumar">Rajesh Kumar (Field Biometrics)</option>
                <option value="Priya Sharma">Priya Sharma (ERP/Fullstack)</option>
                <option value="Karthik N">Karthik N (SecOps/Network)</option>
                <option value="Sneha Roy">Sneha Roy (Helpdesk/Assets)</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Infrastructure & Cloud">Infrastructure &amp; Cloud</option>
                <option value="Field Biometrics & IoT">Field Biometrics &amp; IoT</option>
                <option value="ERP & Software">ERP &amp; Software</option>
                <option value="Network & Security">Network &amp; Security</option>
                <option value="User Support & Assets">User Support &amp; Assets</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Daily Work Logs List */}
          <div className="space-y-3">
            {filteredDailyLogs.map((log) => {
              const catInfo = getCategoryBadge(log.category);
              const CatIcon = catInfo.icon;

              return (
                <div 
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${catInfo.badge}`}>
                        <CatIcon className="w-3 h-3" />
                        {log.category}
                      </span>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {log.impacted_system_or_site}
                      </span>

                      <span className="text-[11px] font-mono text-slate-500">
                        {log.hours_spent} hrs logged
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-mono">
                        <button
                          onClick={() => handleUpdateLogStatus(log.id, 'Completed')}
                          title="Mark Completed"
                          className={`px-2 py-0.5 rounded transition ${
                            log.status === 'Completed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Done
                        </button>
                        <button
                          onClick={() => handleUpdateLogStatus(log.id, 'In Progress')}
                          title="Mark In Progress"
                          className={`px-2 py-0.5 rounded transition ${
                            log.status === 'In Progress' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Working
                        </button>
                        <button
                          onClick={() => handleUpdateLogStatus(log.id, 'Blocked')}
                          title="Mark Blocked"
                          className={`px-2 py-0.5 rounded transition ${
                            log.status === 'Blocked' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Blocked
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteDailyLog(log.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 text-xs transition"
                        title="Delete log entry"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task Title & Summary */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{log.task_title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.summary}</p>
                  </div>

                  {/* Blocker alert if blocked */}
                  {log.blocker_note && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span><strong>Blocker:</strong> {log.blocker_note}</span>
                    </div>
                  )}

                  {/* Footer with Engineer Info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-[10px]">
                        {log.engineer_name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-700">{log.engineer_name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({log.engineer_role})</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Logged at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredDailyLogs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No daily logs matched the criteria</p>
                <p className="text-xs text-slate-500 mt-0.5">Try changing the date or search query</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERIOD 2: WEEKLY SPRINT REPORTS                                           */}
      {/* ========================================================================= */}
      {reportPeriod === 'weekly' && currentWeeklyReport && (
        <div className="space-y-6">
          {/* Week Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Weekly Performance &amp; Operations Review</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Period: {currentWeeklyReport.start_date} to {currentWeeklyReport.end_date} · Prepared by {currentWeeklyReport.prepared_by}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">Select Sprint:</span>
              <select
                value={selectedWeeklyId}
                onChange={(e) => setSelectedWeeklyId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer font-mono"
              >
                {weeklyReports.map(w => (
                  <option key={w.id} value={w.id}>{w.week_label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly 6 Core Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">SLA Compliance</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-emerald-600">{currentWeeklyReport.sla_compliance_pct}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Target: &gt;95.0%</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Mean Turnaround (MTTR)</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-cyan-600">{currentWeeklyReport.mttr_hours}</span>
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Avg resolution time</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Infrastructure Uptime</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-teal-600">{currentWeeklyReport.uptime_pct}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Hostinger VPS nominal</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Tickets Resolved</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-indigo-600">{currentWeeklyReport.tickets_resolved}</span>
                <span className="text-xs text-slate-500 font-mono">/ {currentWeeklyReport.tickets_total}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {Math.round((currentWeeklyReport.tickets_resolved / currentWeeklyReport.tickets_total) * 100)}% resolution rate
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Biometric Sync</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-emerald-600">{currentWeeklyReport.biometric_sync_rate}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">24 site campuses</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Engineering Hours</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-800">{currentWeeklyReport.total_hours_logged}</span>
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">5 engineers sprint total</p>
            </div>
          </div>

          {/* Key Achievements & Maintenance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Achievements */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Key Deliverables &amp; Achievements This Week</span>
              </div>

              <div className="space-y-2">
                {currentWeeklyReport.key_achievements.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Maintenance & Deployments */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <span>Scheduled Maintenance Completed</span>
              </div>

              <div className="space-y-2">
                {(currentWeeklyReport.maintenance_completed || []).map((m: any, idx: number) => {
                  const isObj = typeof m === 'object' && m !== null;
                  const itemText = isObj ? (m.item || m.title || String(m)) : m;
                  const itemDate = isObj ? m.date : null;
                  const itemResult = isObj ? m.result : 'Verified';
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-semibold text-slate-800">{itemText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {itemDate && <span className="font-mono text-[11px] text-slate-500">{itemDate}</span>}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
                          {itemResult}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Root Cause Analysis & Incidents Post-Mortem */}
          {(currentWeeklyReport.rca_incidents || []).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Root Cause Analysis &amp; Incident Post-Mortem (RCA)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(currentWeeklyReport.rca_incidents || []).map((rca, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800 text-sm">{rca.incident}</h4>
                      {rca.owner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-300">
                          Owner: {rca.owner}
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-600">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                        <strong className="text-slate-800 block text-[11px] mb-0.5">Root Cause:</strong>
                        <p>{rca.root_cause}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                        <strong className="text-slate-800 block text-[11px] mb-0.5">Resolution Taken:</strong>
                        <p>{rca.resolution}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                        <strong className="text-slate-800 block text-[11px] mb-0.5">Preventative Measure:</strong>
                        <p className="text-emerald-700">{rca.preventative_measure}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planned Next Week Priorities */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Prioritized Sprints &amp; Deployments Next Week</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(currentWeeklyReport.planned_next_week || []).map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 border border-indigo-200">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERIOD 3: MONTHLY EXECUTIVE REVIEWS                                       */}
      {/* ========================================================================= */}
      {reportPeriod === 'monthly' && currentMonthlyReport && (
        <div className="space-y-6">
          {/* Executive Briefing Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold text-[10px] uppercase font-mono">
                    Board &amp; CEO Briefing
                  </span>
                  <h3 className="text-base font-bold text-slate-800">
                    Monthly IT Infrastructure &amp; Operational Health Review
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Report Cycle: {currentMonthlyReport.month_label} · Prepared by {currentMonthlyReport.prepared_by}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMonthlyId}
                  onChange={(e) => setSelectedMonthlyId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer font-mono"
                >
                  {monthlyReports.map(m => (
                    <option key={m.id} value={m.id}>{m.month_label}</option>
                  ))}
                </select>

                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  title="Copy summary statement for email or WhatsApp briefing"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {/* Narrative Executive Summary Box */}
            <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-800 font-mono text-[11px] uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-cyan-600" />
                Executive Summary Note for Leadership:
              </div>
              <p className="text-slate-600">{currentMonthlyReport.executive_summary}</p>
            </div>

            {/* Top 6 Monthly KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Overall Uptime</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-emerald-600">{currentMonthlyReport.overall_uptime_pct}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">SLA Target &gt;99.9%</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Tickets Resolved</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-cyan-600">
                    {currentMonthlyReport.tickets_resolved_within_sla}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ {currentMonthlyReport.total_tickets_handled}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{currentMonthlyReport.sla_compliance_pct}% within SLA</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Cloud &amp; VPS Spend</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-slate-800">
                    ₹{(currentMonthlyReport.cloud_cost_inr / 1000).toFixed(1)}k
                  </span>
                </div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  ₹{((currentMonthlyReport.cloud_cost_budget_inr - currentMonthlyReport.cloud_cost_inr) / 1000).toFixed(1)}k under budget
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Security Audit Score</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-indigo-600">{currentMonthlyReport.security_score_pct}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Zero security breaches</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Backup Success Rate</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-purple-600">{currentMonthlyReport.backup_success_rate}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">30/30 days verified</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500">Biometric Fleet</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-teal-600">{currentMonthlyReport.biometric_devices_healthy}</span>
                  <span className="text-xs text-slate-500 font-mono">/ {currentMonthlyReport.biometric_devices_total}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Active across all sites</p>
              </div>
            </div>
          </div>

          {/* Major Milestones Completed */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <Award className="w-4 h-4 text-cyan-600" />
              <span>Major Strategic IT Milestones Delivered in This Cycle</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentMonthlyReport.major_milestones.map((m, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{m.title}</h4>
                    {getStatusBadge(m.status)}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.impact}</p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                    Completion Target: {m.completion_date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Contributor Recognition Scorecard */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <User className="w-4 h-4 text-indigo-600" />
                <span>IT Engineering Team Contribution &amp; Performance Scorecard</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Total 5 Core Engineers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Engineer Name</th>
                    <th className="py-2.5 px-3 font-semibold">Role Scope</th>
                    <th className="py-2.5 px-3 font-semibold">Tasks Completed</th>
                    <th className="py-2.5 px-3 font-semibold">Hours Logged</th>
                    <th className="py-2.5 px-3 font-semibold">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentMonthlyReport.team_contributors.map((member, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-bold text-[10px]">
                          {member.name.charAt(0)}
                        </div>
                        <span>{member.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{member.role}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{member.tasks_completed}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">{member.hours_logged} hrs</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
                          {member.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IT Risk Register & Next Month Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Register */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Monthly IT Risk Register &amp; Mitigations</span>
              </div>

              <div className="space-y-2.5">
                {currentMonthlyReport.risk_register.map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.risk}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        r.impact === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}>
                        {r.impact} Impact
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      <strong>Mitigation:</strong> {r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Roadmap for Next Month */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                <ChevronRight className="w-4 h-4 text-cyan-600" />
                <span>Strategic Roadmap for Next Month</span>
              </div>

              <div className="space-y-2">
                {currentMonthlyReport.strategic_initiatives_next_month.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-cyan-50/50 border border-cyan-200 rounded-lg text-xs text-slate-700 flex items-center gap-2.5 font-medium">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Log Daily Activity                                                 */}
      {/* ========================================================================= */}
      {dailyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-800">Log Daily IT Engineer Work Activity</h3>
              </div>
              <button 
                onClick={() => setDailyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDailyLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dailyFormData.date}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Engineer</label>
                  <select
                    value={dailyFormData.engineer_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      let role = 'IT Infrastructure Specialist';
                      if (name === 'Arun Verma') role = 'Head of IT & Cloud Systems';
                      else if (name === 'Rajesh Kumar') role = 'Senior Field IT & Biometrics Specialist';
                      else if (name === 'Priya Sharma') role = 'Fullstack & ERP Systems Developer';
                      else if (name === 'Karthik N') role = 'Network, SecOps & CCTV Systems Engineer';
                      else if (name === 'Sneha Roy') role = 'IT Support & Asset Coordinator';
                      setDailyFormData({ ...dailyFormData, engineer_name: name, engineer_role: role });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Arun Verma">Arun Verma (Cloud/DevOps)</option>
                    <option value="Rajesh Kumar">Rajesh Kumar (Field Biometrics)</option>
                    <option value="Priya Sharma">Priya Sharma (ERP/Developer)</option>
                    <option value="Karthik N">Karthik N (SecOps/Network)</option>
                    <option value="Sneha Roy">Sneha Roy (Helpdesk/Assets)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-600 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostinger VPS Kernel Patching & Nginx Hardening"
                  value={dailyFormData.task_title}
                  onChange={(e) => setDailyFormData({ ...dailyFormData, task_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Category</label>
                  <select
                    value={dailyFormData.category}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Infrastructure & Cloud">Infrastructure &amp; Cloud</option>
                    <option value="Field Biometrics & IoT">Field Biometrics &amp; IoT</option>
                    <option value="ERP & Software">ERP &amp; Software</option>
                    <option value="Network & Security">Network &amp; Security</option>
                    <option value="User Support & Assets">User Support &amp; Assets</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Impacted Site or System</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site S-203 or Hostinger VPS 01"
                    value={dailyFormData.impacted_system_or_site}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, impacted_system_or_site: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={dailyFormData.hours_spent}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, hours_spent: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Status</label>
                  <select
                    value={dailyFormData.status}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Priority</label>
                  <select
                    value={dailyFormData.priority}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-600 block mb-1">Detailed Work Summary &amp; Outcome</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain work performed, root cause found, or verification results"
                  value={dailyFormData.summary}
                  onChange={(e) => setDailyFormData({ ...dailyFormData, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {dailyFormData.status === 'Blocked' && (
                <div>
                  <label className="text-[11px] font-mono text-rose-600 block mb-1">Blocker Note / Pending Dependency</label>
                  <input
                    type="text"
                    placeholder="Specify why task is blocked and who is resolving it"
                    value={dailyFormData.blocker_note}
                    onChange={(e) => setDailyFormData({ ...dailyFormData, blocker_note: e.target.value })}
                    className="w-full bg-rose-50 border border-rose-300 rounded-xl px-3 py-2 text-xs text-rose-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDailyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
