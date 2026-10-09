import { 
  AppState, PurchaseRequest, Vendor, Invoice, Expense, Lead, Client, 
  Employee, Attendance, Site, Complaint, Incident, Training, Task, Alert 
} from '../types';
import { queryCEOMetrics, compileSystemAlerts } from '../data/store';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Award, AlertTriangle, 
  ArrowRight, Download, FileSpreadsheet, Calendar, ShieldCheck, 
  ShoppingBag, Briefcase, MapPin, MessageSquare, GraduationCap, CheckCircle, HelpCircle, Eye, Check,
  QrCode, AlertCircle, Wrench, Layers, BookOpen, Clock, Camera, ChevronRight, Sparkles, Maximize2, X
} from 'lucide-react';
import { useState } from 'react';
import { OpsDrillDownModal, OpsModalTab } from './OpsDrillDownModal';

interface CEOViewProps {
  state: AppState;
  onNavigateToDataEntry: () => void;
}

const FINANCE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const CATEGORY_COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function CEOView({ state, onNavigateToDataEntry }: CEOViewProps) {
  const metrics = queryCEOMetrics(state);
  const [activeChartTab, setActiveChartTab] = useState<'finance' | 'hr' | 'ops'>('finance');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [metricSearch, setMetricSearch] = useState('');
  const [isOpsModalOpen, setIsOpsModalOpen] = useState(false);
  const [opsModalTab, setOpsModalTab] = useState<OpsModalTab>('attendance');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const openOpsDrillDown = (tab: OpsModalTab) => {
    setOpsModalTab(tab);
    setIsOpsModalOpen(true);
  };

  // Fetch compiled alerts
  const allAlerts = compileSystemAlerts(state);
  const activeAlerts = allAlerts.filter(a => !acknowledgedAlerts.has(a.id));

  const handleAcknowledgeAlert = (id: string) => {
    setAcknowledgedAlerts(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // --- 9 REQUIRED CHARTS DATA PREPARATION ---

  // 1. Revenue Trend (Line/Area)
  const revenueTrendData = [
    { name: 'Feb 26', Revenue: 340000, Expenses: 290000 },
    { name: 'Mar 26', Revenue: 480000, Expenses: 390000 },
    { name: 'Apr 26', Revenue: 510000, Expenses: 410000 },
    { name: 'May 26', Revenue: 590000, Expenses: 450000 },
    { name: 'Jun 26', Revenue: 620000, Expenses: 480000 },
    { name: 'Jul 26', Revenue: metrics.finance.monthlyRevenue, Expenses: metrics.finance.monthlyExpenses }
  ];

  // 2. Employee Strength (Line chart)
  const employeeStrengthData = [
    { name: 'Feb 26', Headcount: 240 },
    { name: 'Mar 26', Headcount: 280 },
    { name: 'Apr 26', Headcount: 310 },
    { name: 'May 26', Headcount: 320 },
    { name: 'Jun 26', Headcount: 335 },
    { name: 'Jul 26', Headcount: state.employees.length }
  ];

  // 3. Recruitment Progress (Bar chart representing recruitment pipeline stages)
  const recruitmentProgressData = [
    { stage: 'Sourced', Count: 140 },
    { stage: 'Screened', Count: 95 },
    { stage: 'Technical Test', Count: 60 },
    { stage: 'Interviewed', Count: 35 },
    { stage: 'Offered', Count: 18 },
    { stage: 'Onboarded', Count: metrics.hr.newJoinees || 12 }
  ];

  // 4. Training Compliance (Radial/Donut chart)
  const trainingComplianceData = [
    { name: 'Compliant', value: metrics.training.trainingCompliancePct, fill: '#10B981' },
    { name: 'Pending/Gap', value: 100 - metrics.training.trainingCompliancePct, fill: '#64748B' }
  ];

  // 5. Attrition Trend (Line chart)
  const attritionTrendData = [
    { name: 'Feb 26', Rate: 2.1 },
    { name: 'Mar 26', Rate: 1.8 },
    { name: 'Apr 26', Rate: 3.2 },
    { name: 'May 26', Rate: 2.5 },
    { name: 'Jun 26', Rate: 1.5 },
    { name: 'Jul 26', Rate: Math.max(metrics.hr.attrition, 2.3) }
  ];

  // 6. Client Growth (Bar/Line chart)
  const clientGrowthData = [
    { name: 'Feb 26', Clients: 4, ExpansionVal: 120 },
    { name: 'Mar 26', Clients: 5, ExpansionVal: 180 },
    { name: 'Apr 26', Clients: 5, ExpansionVal: 180 },
    { name: 'May 26', Clients: 6, ExpansionVal: 240 },
    { name: 'Jun 26', Clients: 6, ExpansionVal: 240 },
    { name: 'Jul 26', Clients: state.clients.length, ExpansionVal: 320 }
  ];

  // 7. Site Performance (Audit Scores ranking)
  const sitePerformanceData = state.sites.map(s => ({
    name: s.name.substring(0, 15),
    Score: s.audit_score,
    fill: s.audit_score >= 90 ? '#10B981' : s.audit_score >= 80 ? '#F59E0B' : '#EF4444'
  })).sort((a, b) => b.Score - a.Score);

  // 8. Complaint Analysis (Breakdown by Category)
  const complaintsMap = state.complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const complaintAnalysisData = Object.entries(complaintsMap).map(([key, val]) => ({
    name: key,
    Complaints: val
  }));

  // 9. Financial Summary (Budget vs Actual)
  const financialSummaryData = state.expenses.map(exp => ({
    name: exp.expense_head.substring(0, 15),
    Budget: exp.budget,
    Actual: exp.actual
  }));

  // Export functions
  const handleExportCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllKPIs = () => {
    const headers = ['Department', 'KPI Name', 'Value'];
    const rows = [
      ['Procurement', 'Total Purchase Requests', metrics.procurement.totalPurchaseRequests],
      ['Procurement', 'Pending Purchase Requests', metrics.procurement.pendingPurchaseRequests],
      ['Procurement', 'Pending Purchase Orders', metrics.procurement.pendingPurchaseOrders],
      ['Procurement', 'Vendor Performance', metrics.procurement.avgVendorPerformance],
      ['Procurement', 'AMC Due Soon', metrics.procurement.amcDueSoon],
      ['Procurement', 'Critical Stock Shortage', metrics.procurement.criticalStockShortages],
      ['Finance & Accounts', 'Monthly Revenue', metrics.finance.monthlyRevenue],
      ['Finance & Accounts', 'Monthly Expenses', metrics.finance.monthlyExpenses],
      ['Finance & Accounts', 'Outstanding Receivables', metrics.finance.outstandingReceivables],
      ['Finance & Accounts', 'Cash Flow', metrics.finance.cashFlow],
      ['Finance & Accounts', 'Salary Status', metrics.finance.salaryStatus],
      ['Finance & Accounts', 'Budget vs Actual Diff', metrics.finance.budgetVsActual],
      ['Business Development', 'Active Leads', metrics.bd.activeLeads],
      ['Business Development', 'Meetings Conducted', metrics.bd.meetingsConducted],
      ['Business Development', 'Proposals Submitted', metrics.bd.proposalsSubmitted],
      ['Business Development', 'Tenders in Progress', metrics.bd.tendersInProgress],
      ['Business Development', 'Contracts Won', metrics.bd.contractsWon],
      ['Business Development', 'Expected Revenue', metrics.bd.expectedRevenue],
      ['Human Resources', 'Total Employees', metrics.hr.totalEmployees],
      ['Human Resources', 'Required Manpower', metrics.hr.requiredManpower],
      ['Human Resources', 'Deployed Manpower', metrics.hr.deployedManpower],
      ['Human Resources', 'Vacancies', metrics.hr.vacancies],
      ['Human Resources', 'New Joinees', metrics.hr.newJoinees],
      ['Human Resources', 'Attrition Count', metrics.hr.attrition],
      ['Human Resources', 'Attendance %', metrics.hr.attendancePct],
      ['Human Resources', 'Statutory Compliance %', metrics.hr.statutoryCompliancePct],
      ['Operations', 'Total Active Sites', metrics.operations.totalActiveSites],
      ['Operations', 'Sites with Shortage', metrics.operations.sitesWithShortage],
      ['Operations', 'Client Complaints', metrics.operations.clientComplaints],
      ['Operations', 'Incident Reports', metrics.operations.incidentReports],
      ['Operations', 'Equipment Issues', metrics.operations.equipmentIssues],
      ['Operations', 'Uniform Status', metrics.operations.uniformStatus],
      ['Operations', 'Site Audit Score', metrics.operations.avgSiteAuditScore],
      ['Operations', 'High Risk Sites', metrics.operations.highRiskSites],
      ['Training & Development', 'Inductions Completed', metrics.training.inductionsCompleted],
      ['Training & Development', 'Training Compliance %', metrics.training.trainingCompliancePct],
      ['Training & Development', 'Competency Assessments', metrics.training.competencyAssessments],
      ['Training & Development', 'Upcoming Trainings', metrics.training.upcomingTrainings],
      ['Training & Development', 'Trainer Utilization %', metrics.training.trainerUtilizationPct],
      ['Training & Development', 'Pending Certifications', metrics.training.pendingCertifications],
      ['Training & Development', 'Expiring Certifications', metrics.training.expiringCertifications]
    ];
    handleExportCSV('SIS_CEO_Corporate_KPIs', headers, rows);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Executive Leadership Header Banner & CEO HD Profile */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card to-cyan-950/20 border border-border shadow-md p-6 lg:p-7">
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: CEO HD Portrait + Identity & Cockpit Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* CEO HD Photo Frame with Zoom & Crisp Resolution */}
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => setIsPhotoModalOpen(true)} 
              title="Click to view full HD portrait"
            >
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 opacity-70 group-hover:opacity-100 blur-sm transition duration-300" />
              
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/80 dark:border-slate-800 shadow-xl bg-slate-900">
                <img 
                  src="/ceo-profile.jpg" 
                  alt="CEO - Spoorthy Integrated Solutions" 
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
                <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-amber-300 border border-amber-400/40 flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>HD</span>
                </div>
              </div>

              {/* Online pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            {/* CEO Identity & Mission Text */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                  EXECUTIVE BOARD COMMAND
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  CHIEF EXECUTIVE OFFICER
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-display">
                  CEO Strategic Operations Cockpit
                </h2>
              </div>

              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Centralized executive command for <strong className="text-foreground font-semibold">Spoorthy Integrated Solutions Pvt. Ltd.</strong> Real-time cross-departmental telemetry, predictive indicators, statutory compliance &amp; strategic oversight.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-foreground font-medium">Session: Active Live</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Tier 1 Full RBAC Scope</span>
                <span>•</span>
                <button 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enlarge HD Portrait</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
            <button
              onClick={exportAllKPIs}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Export Corporate KPIs (CSV)</span>
            </button>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-500" />
              <span>Auto-refresh synced</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. RED FLAG CENTRE & DSS Actionable Alert Engine */}
      <div className="bg-card border-2 border-red-500/30 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground tracking-tight">EXECUTIVE RED FLAG CENTRE</h3>
                <span className="text-[10px] font-mono bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-bounce">
                  CRITICAL REAL-TIME
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Immediate CEO intervention & deadline compliance oversight</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              {metrics.redFlags?.urgentEscalations || 0} Escalations
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
              {metrics.redFlags?.tendersDueIn48Hrs || 0} Tenders &lt; 48h
            </span>
          </div>
        </div>

        {/* Highlighted Red Flag Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Tenders Due (&lt;48h)</span>
            <span className={`text-xl font-bold ${(metrics.redFlags?.tendersDueIn48Hrs || 0) > 0 ? 'text-rose-600' : 'text-foreground'}`}>
              {metrics.redFlags?.tendersDueIn48Hrs || 0}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Corrigendums Unreviewed</span>
            <span className={`text-xl font-bold ${(metrics.redFlags?.corrigendumsUnreviewed || 0) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
              {metrics.redFlags?.corrigendumsUnreviewed || 0}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">EMD/PBG at Risk</span>
            <span className={`text-xl font-bold ${(metrics.redFlags?.expiringPbgCount || 0) > 0 ? 'text-rose-600' : 'text-foreground'}`}>
              {metrics.redFlags?.expiringPbgCount || 0}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Client Escalations</span>
            <span className={`text-xl font-bold ${(metrics.redFlags?.urgentEscalations || 0) > 0 ? 'text-rose-600' : 'text-foreground'}`}>
              {metrics.redFlags?.urgentEscalations || 0}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Zero/Critical Stock Items</span>
            <span className={`text-xl font-bold ${(metrics.redFlags?.criticalStockItems || 0) > 0 ? 'text-rose-600' : 'text-foreground'}`}>
              {metrics.redFlags?.criticalStockItems || 0}
            </span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Delayed Daily Tasks</span>
            <span className={`text-xl font-bold ${(metrics.teamProductivity?.delayedTasks || 0) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
              {metrics.teamProductivity?.delayedTasks || 0}
            </span>
          </div>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-1" />
            <p className="text-xs font-semibold text-muted-foreground">All operational and tender compliance benchmarks satisfied.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                  alert.severity === 'Critical' 
                    ? 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-300' 
                    : alert.severity === 'Warning'
                    ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-300'
                    : 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/30 text-blue-900 dark:text-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-black/10 dark:bg-black/40 px-2 py-0.5 rounded">
                      {alert.type}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground font-medium mb-3">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px] text-muted-foreground">
                  <span className="font-mono">REF: {alert.related_id}</span>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 bg-black/10 dark:bg-black/30 hover:bg-black/20 dark:hover:bg-black/50 border border-black/10 dark:border-white/10 text-foreground rounded font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2.1 TENDER MANAGEMENT STRATEGIC COCKPIT */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Tender Pipeline & Bidding Cockpit</h3>
              <p className="text-xs text-muted-foreground">Opportunity tracking, Corrigendum reviews, Go/No-Go status and contract values</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-lg">
            Active Pipeline: ₹{((metrics.tenderCockpit?.totalPipelineValue || 0) / 10000000).toFixed(2)} Cr
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KPICard 
            label="Total Tenders" 
            val={metrics.tenderCockpit?.totalTenders || 0} 
            change="All Portals" 
            s="Green" 
          />
          <KPICard 
            label="Live Active Bids" 
            val={metrics.tenderCockpit?.activeBids || 0} 
            change="In Progress" 
            s={(metrics.tenderCockpit?.activeBids || 0) > 0 ? 'Green' : 'Amber'} 
          />
          <KPICard 
            label="Tenders Won" 
            val={metrics.tenderCockpit?.tendersWon || 0} 
            change={`${metrics.tenderCockpit?.winRatePct || 0}% Win Rate`} 
            s="Green" 
          />
          <KPICard 
            label="Under Evaluation" 
            val={metrics.tenderCockpit?.tendersUnderEvaluation || 0} 
            change="Client Review" 
            s="Green" 
          />
          <KPICard 
            label="EMD Outstanding" 
            val={`₹${((metrics.tenderCockpit?.totalEmdLocked || 0) / 100000).toFixed(2)}L`} 
            change="Bank Guarantee/FDR" 
            s="Amber" 
          />
          <KPICard 
            label="Active PBGs" 
            val={`₹${((metrics.tenderCockpit?.totalPbgActive || 0) / 100000).toFixed(2)}L`} 
            change="Performance Security" 
            s="Green" 
          />
        </div>
      </div>

      {/* 3. The 6-Department Enterprise Grid Panels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-foreground uppercase font-mono">Departmental Core KPI Matrix</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Search KPIs:</span>
            <input 
              type="text" 
              placeholder="Filter cards..."
              value={metricSearch}
              onChange={e => setMetricSearch(e.target.value)}
              className="px-3 py-1 bg-background border border-border rounded-lg text-xs w-48 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 1. Procurement Section */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ShoppingBag className="w-5 h-5 text-cyan-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">1. Procurement Operations</h4>
              <p className="text-[10px] text-muted-foreground">Logistics, material orders, vendor compliance rates</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Total PRs', val: metrics.procurement.totalPurchaseRequests, change: 'Lifetime Logs', s: 'Green' },
              { label: 'Pending PRs', val: metrics.procurement.pendingPurchaseRequests, change: 'Needs Approval', s: metrics.procurement.pendingPurchaseRequests > 0 ? 'Amber' : 'Green' },
              { label: 'Pending POs', val: metrics.procurement.pendingPurchaseOrders, change: 'With Vendors', s: 'Green' },
              { label: 'Vendor Score', val: `${metrics.procurement.avgVendorPerformance}%`, change: 'Average Rating', s: metrics.procurement.avgVendorPerformance >= 85 ? 'Green' : 'Amber' },
              { label: 'AMC Due', val: metrics.procurement.amcDueSoon, change: 'Next 30 Days', s: metrics.procurement.amcDueSoon > 0 ? 'Amber' : 'Green' },
              { label: 'Stock Shortages', val: metrics.procurement.criticalStockShortages, change: 'Action Required', s: metrics.procurement.criticalStockShortages > 0 ? 'Red' : 'Green' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <KPICard key={i} label={card.label} val={card.val} change={card.change} s={card.s} />
            ))}
          </div>
        </div>

        {/* 2. Finance Section */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">2. Finance &amp; Accounts</h4>
              <p className="text-[10px] text-muted-foreground">Invoiced revenue targets, accounts receivable &amp; payroll</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Monthly Revenue', val: `$${(metrics.finance.monthlyRevenue ?? 0).toLocaleString()}`, change: 'Current Month', s: 'Green' },
              { label: 'Monthly Expenses', val: `$${(metrics.finance.monthlyExpenses ?? 0).toLocaleString()}`, change: 'Paid Out', s: 'Green' },
              { label: 'Outstanding Receivables', val: `$${(metrics.finance.outstandingReceivables ?? 0).toLocaleString()}`, change: 'Aging Collection', s: (metrics.finance.outstandingReceivables ?? 0) > 150000 ? 'Red' : 'Amber' },
              { label: 'Cash Flow (MTD)', val: `$${(metrics.finance.cashFlow ?? 0).toLocaleString()}`, change: 'Net Available', s: (metrics.finance.cashFlow ?? 0) >= 0 ? 'Green' : 'Red' },
              { label: 'Salary Status', val: metrics.finance.salaryStatus || 'Pending', change: 'Disbursements', s: 'Green' },
              { label: 'Budget vs Actual Diff', val: `$${(metrics.finance.budgetVsActual ?? 0).toLocaleString()}`, change: 'Variability Gap', s: (metrics.finance.budgetVsActual ?? 0) >= 0 ? 'Green' : 'Amber' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <KPICard key={i} label={card.label} val={card.val} change={card.change} s={card.s} />
            ))}
          </div>
        </div>

        {/* 3. Business Development Section */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">3. Business Development</h4>
              <p className="text-[10px] text-muted-foreground">Tender proposals, client leads pipeline &amp; expected closure conversions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Active Leads', val: metrics.bd.activeLeads, change: 'Prospect Pipeline', s: 'Green' },
              { label: 'Meetings Held', val: metrics.bd.meetingsConducted, change: 'Corporate Pitch', s: 'Green' },
              { label: 'Proposals Sent', val: metrics.bd.proposalsSubmitted, change: 'Quotations Active', s: 'Green' },
              { label: 'Tenders In Progress', val: metrics.bd.tendersInProgress, change: 'RFP Bidding', s: 'Green' },
              { label: 'Contracts Won', val: metrics.bd.contractsWon, change: 'Conversion Rate', s: 'Green' },
              { label: 'Expected Revenue', val: `$${(metrics.bd.expectedRevenue ?? 0).toLocaleString()}`, change: 'Weighted Value', s: 'Green' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <KPICard key={i} label={card.label} val={card.val} change={card.change} s={card.s} />
            ))}
          </div>
        </div>

        {/* 4. Human Resources Section - Enhanced with Draft V1 CEO Inputs */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">4. Human Resources &amp; Workforce Position</h4>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full border border-sky-300">
                    Draft V1 CEO Inputs
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Workforce strength, recruitment funnel, attendance, billing support &amp; statutory compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200">
                Workforce: 6,420 | Joiners: +148 | Resign: 32 | Open: 64
              </span>
            </div>
          </div>

          {/* Quick 5-Block Functional Preview for CEO */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 rounded-xl text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">👥 Workforce</span>
              <div className="font-bold text-sm text-foreground">6,420 Active</div>
              <div className="text-[10px] text-muted-foreground">Attrition: <strong className="text-sky-700">4.8%</strong></div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">🔎 Recruitment</span>
              <div className="font-bold text-sm text-foreground">64 Open Reqs</div>
              <div className="text-[10px] text-muted-foreground">Pending Join: <strong className="text-amber-600">18 Pax</strong></div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">📋 Billing Support</span>
              <div className="font-bold text-sm text-emerald-600">92% Submitted</div>
              <div className="text-[10px] text-muted-foreground">2 Sites Pending Input</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">🤝 Client Support</span>
              <div className="font-bold text-sm text-foreground">14 Complaints</div>
              <div className="text-[10px] text-muted-foreground">11 Closed • <strong className="text-amber-600">3 Open</strong></div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">✅ Compliance &amp; Cost</span>
              <div className="font-bold text-sm text-emerald-600">96.2% Uniform</div>
              <div className="text-[10px] text-muted-foreground">Recruitment Cost: <strong className="text-foreground font-mono">₹3.45L</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {[
              { label: 'Total Strength', val: '6,420', change: 'Current Manning', s: 'Green' },
              { label: 'New Joiners', val: '+148', change: 'MTD Onboarded', s: 'Green' },
              { label: 'Resignations', val: '32', change: 'Exit Relieved', s: 'Amber' },
              { label: 'Terminations', val: '14', change: 'Disciplinary', s: 'Green' },
              { label: 'Open Positions', val: '64', change: 'Active Reqs', s: 'Amber' },
              { label: 'Joining Pending', val: '18', change: 'Medical/Kit Clear', s: 'Amber' },
              { label: 'Attendance %', val: '94.6%', change: 'Rolling Ratio', s: 'Green' },
              { label: 'Uniform & ID %', val: '96.8%', change: 'Field Audited', s: 'Green' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <KPICard key={i} label={card.label} val={card.val} change={card.change} s={card.s} />
            ))}
          </div>
        </div>

        {/* 5. Operations Management & Field Control Matrix - Enhanced with Draft V1 CEO Inputs */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">5. Operations Management &amp; Field Control Matrix</h4>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold rounded-full border border-rose-300 dark:border-rose-800">
                    Draft V1 CEO Inputs
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-semibold rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> OpsVision Linked
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Management intelligence layer connected to OpsVision execution system — attendance shortages, OT cost causality, site control &amp; SLA compliance
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                Site Attn: {metrics.operations.siteAttendancePct || 94.2}% | Relievers: {metrics.operations.relieversAvailable || 18}/{metrics.operations.relieversRequired || 22} | OT: {metrics.operations.totalOtHours || 1240} hrs (₹{metrics.operations.totalOtCostLakhs || 4.85}L)
              </span>
              <button
                onClick={() => openOpsDrillDown('dictionary')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border flex items-center gap-1 transition"
                title="View IT Data Definitions & Source Dictionary"
              >
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>IT Data Dictionary</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC ATTENTION REQUIRED PANEL FOR OPERATIONS */}
          <div className="p-3.5 bg-gradient-to-r from-rose-50 via-amber-50/50 to-rose-50/30 dark:from-rose-950/40 dark:via-amber-950/20 dark:to-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  OPERATIONS — ATTENTION REQUIRED
                </h5>
              </div>
              <button
                onClick={() => openOpsDrillDown('attention')}
                className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:text-rose-800 flex items-center gap-1 bg-rose-100/80 dark:bg-rose-900/50 px-2.5 py-0.5 rounded-lg transition"
              >
                <span>View Full Exceptions (5)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              <div 
                onClick={() => openOpsDrillDown('attendance')}
                className="p-2.5 bg-background/90 rounded-lg border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">🔴 Site Attendance Shortage</span>
                  <span className="font-mono font-bold text-rose-600 text-[11px]">84.0%</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  Northside Depot waterlogging drop; 4 roving relievers mobilized.
                </p>
              </div>

              <div 
                onClick={() => openOpsDrillDown('attendance')}
                className="p-2.5 bg-background/90 rounded-lg border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">🔴 Reliever Buffer Gap</span>
                  <span className="font-mono font-bold text-rose-600 text-[11px]">4 Short</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  3 sites affected (St. Jude, Tech Park, Freight Depot).
                </p>
              </div>

              <div 
                onClick={() => openOpsDrillDown('sla')}
                className="p-2.5 bg-background/90 rounded-lg border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">🔴 SLA Below Threshold</span>
                  <span className="font-mono font-bold text-rose-600 text-[11px]">2 Sites</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  Valley Tech B2 (91.5%) &amp; City Hospital ICU (97.2%) flagged.
                </p>
              </div>

              <div 
                onClick={() => openOpsDrillDown('complaints')}
                className="p-2.5 bg-background/90 rounded-lg border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">🟠 Client Complaints</span>
                  <span className="font-mono font-bold text-amber-600 text-[11px]">3 Open (1 Overdue)</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  Hospital linen orderly overdue; dock patrolling delay open.
                </p>
              </div>

              <div 
                onClick={() => openOpsDrillDown('equipment')}
                className="p-2.5 bg-background/90 rounded-lg border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">🟠 Machinery Breakdown</span>
                  <span className="font-mono font-bold text-amber-600 text-[11px]">7 Unavailable</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  Taski ride-on scrubber motor &amp; jet washer under repair.
                </p>
              </div>
            </div>
          </div>

          {/* THE 5 PRACTICAL BLOCKS OF OPERATIONS (DRAFT V1) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
            
            {/* Block 1: Manpower & Attendance */}
            <div 
              onClick={() => openOpsDrillDown('attendance')}
              className="p-3.5 bg-card border border-border rounded-xl space-y-2 hover:border-rose-400 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1">
                  👥 1. Manpower &amp; Attendance
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-base text-foreground font-mono">
                  Site Attn: {metrics.operations.siteAttendancePct || 94.2}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Absenteeism: <strong className="text-rose-600">{metrics.operations.absenteeismPct || 5.8}%</strong>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Relievers: <strong className="text-amber-600">{metrics.operations.relieversAvailable || 18} available / {metrics.operations.relieversRequired || 22} req</strong>
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Shortage Spotter</span>
                <span className="text-rose-600 font-bold">2 Sites Short</span>
              </div>
            </div>

            {/* Block 2: Overtime & Cost (Causal Chain) */}
            <div 
              onClick={() => openOpsDrillDown('overtime')}
              className="p-3.5 bg-card border border-border rounded-xl space-y-2 hover:border-rose-400 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1">
                  💰 2. OT &amp; Cost Causality
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-base text-foreground font-mono">
                  OT: {metrics.operations.totalOtHours || 1240} hrs
                </div>
                <div className="text-[11px] text-rose-600 font-bold font-mono">
                  ₹{metrics.operations.totalOtCostLakhs || 4.85} Lakhs Incurred
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chain: Absent → Reliever Gap → OT
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Top Outlier</span>
                <span className="text-foreground font-bold">City Hospital (480h)</span>
              </div>
            </div>

            {/* Block 3: Site Control (Planned vs Completed) */}
            <div 
              onClick={() => openOpsDrillDown('inspections')}
              className="p-3.5 bg-card border border-border rounded-xl space-y-2 hover:border-rose-400 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1">
                  🔍 3. Site Control &amp; Audits
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-base text-emerald-600 font-mono">
                  {metrics.operations.inspectionsCompleted || 58} / {metrics.operations.inspectionsPlanned || 64} Audits
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Completion: <strong className="text-emerald-600">{metrics.operations.inspectionsCompletionPct || 90.6}%</strong>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Avg Quality: <strong className="text-blue-600 font-mono">88.5% Score</strong>
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>GPS / QR Scans</span>
                <span className="text-emerald-600 font-bold">100% Geotagged</span>
              </div>
            </div>

            {/* Block 4: Client Complaints */}
            <div 
              onClick={() => openOpsDrillDown('complaints')}
              className="p-3.5 bg-card border border-border rounded-xl space-y-2 hover:border-rose-400 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1">
                  🤝 4. Client Complaints
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-base text-foreground font-mono">
                  {metrics.operations.complaintsClosed || 15} Closed / {metrics.operations.complaintsReceived || 18}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Closure Ratio: <strong className="text-emerald-600 font-mono">{metrics.operations.complaintsClosurePct || 83.3}%</strong>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Pending: <strong className="text-amber-600">{metrics.operations.complaintsOpen || 3} Open</strong>
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>OpsVision Ticket Sync</span>
                <span className="text-amber-600 font-bold">1 Overdue</span>
              </div>
            </div>

            {/* Block 5: Service Performance & Site Readiness */}
            <div 
              onClick={() => openOpsDrillDown('sla')}
              className="p-3.5 bg-card border border-border rounded-xl space-y-2 hover:border-rose-400 cursor-pointer transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1">
                  📊 5. SLA &amp; Site Readiness
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-base text-emerald-600 font-mono">
                  Overall SLA: {metrics.operations.overallSlaPct || 96.4}%
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>🎽 Uniforms: <strong className="text-foreground">{metrics.operations.uniformAvailabilityPct || 96.2}%</strong></span>
                  <span>🪪 ID: <strong className="text-foreground">{metrics.operations.idCardCompliancePct || 98.1}%</strong></span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ⚙️ Machines: <strong className="text-foreground">{metrics.operations.equipmentAvailabilityPct || 91.0}%</strong> ({metrics.operations.equipmentUnavailableCount || 7} down)
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>OpsVision Task Stream</span>
                <span className="text-blue-600 font-bold">Live Telemetry</span>
              </div>
            </div>

          </div>

          {/* KPI Stat Cards Row (Clickable for Drilldown) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {[
              { label: 'Site Attendance', val: `${metrics.operations.siteAttendancePct || 94.2}%`, change: 'Rolling Ratio', s: 'Green', tab: 'attendance' },
              { label: 'Reliever Cover', val: `${metrics.operations.relieversAvailable || 18}/${metrics.operations.relieversRequired || 22}`, change: '-4 Shortage', s: 'Amber', tab: 'attendance' },
              { label: 'OT Hours', val: `${metrics.operations.totalOtHours || 1240}h`, change: `₹${metrics.operations.totalOtCostLakhs || 4.85}L Cost`, s: 'Amber', tab: 'overtime' },
              { label: 'Inspections Done', val: `${metrics.operations.inspectionsCompleted || 58}/${metrics.operations.inspectionsPlanned || 64}`, change: `${metrics.operations.inspectionsCompletionPct || 90.6}% Done`, s: 'Green', tab: 'inspections' },
              { label: 'Complaints Closed', val: `${metrics.operations.complaintsClosed || 15}/${metrics.operations.complaintsReceived || 18}`, change: `${metrics.operations.complaintsClosurePct || 83.3}% Closed`, s: 'Green', tab: 'complaints' },
              { label: 'SLA Delivery', val: `${metrics.operations.overallSlaPct || 96.4}%`, change: 'OpsVision Verified', s: 'Green', tab: 'sla' },
              { label: 'Uniform Ready', val: `${metrics.operations.uniformAvailabilityPct || 96.2}%`, change: '4 Shortage Sites', s: 'Amber', tab: 'uniform' },
              { label: 'Machines Up', val: `${metrics.operations.equipmentAvailabilityPct || 91.0}%`, change: `${metrics.operations.equipmentUnavailableCount || 7} Down/Repair`, s: 'Amber', tab: 'equipment' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <div key={i} onClick={() => openOpsDrillDown(card.tab as OpsModalTab)} className="cursor-pointer">
                <KPICard label={card.label} val={card.val} change={card.change} s={card.s} />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Training & Development Section */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <GraduationCap className="w-5 h-5 text-violet-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">6. Training &amp; Development</h4>
              <p className="text-[10px] text-muted-foreground">Crew competency assessments, induction logs &amp; cert expiries</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {[
              { label: 'Inductions Done', val: metrics.training.inductionsCompleted, change: 'SIS Onboarded', s: 'Green' },
              { label: 'Training Compliance', val: `${metrics.training.trainingCompliancePct}%`, change: 'Certification Ratio', s: metrics.training.trainingCompliancePct >= 90 ? 'Green' : 'Amber' },
              { label: 'Assessments', val: metrics.training.competencyAssessments, change: 'Graded Staff', s: 'Green' },
              { label: 'Upcoming Class', val: metrics.training.upcomingTrainings, change: 'Locked Sessions', s: 'Green' },
              { label: 'Trainer Load', val: `${metrics.training.trainerUtilizationPct}%`, change: 'Core Utilization', s: 'Green' },
              { label: 'Pending Certs', val: metrics.training.pendingCertifications, change: 'Paperwork Pending', s: 'Green' },
              { label: 'Expiring Certs', val: metrics.training.expiringCertifications, change: 'Within 60 Days', s: metrics.training.expiringCertifications > 0 ? 'Amber' : 'Green' }
            ].filter(card => card.label.toLowerCase().includes(metricSearch.toLowerCase())).map((card, i) => (
              <KPICard key={i} label={card.label} val={card.val} change={card.change} s={card.s} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Interactive Graphical Analytics Block (9 Charts in tabs) */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">DSS Analytical Charts</h3>
            <p className="text-xs text-muted-foreground">Interactive graphs showing organizational dynamics and performance</p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setActiveChartTab('finance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeChartTab === 'finance' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Finance &amp; Client Growth
            </button>
            <button
              onClick={() => setActiveChartTab('hr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeChartTab === 'hr' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              HR &amp; Compliance Trends
            </button>
            <button
              onClick={() => setActiveChartTab('ops')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeChartTab === 'ops' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Operations &amp; Site Audits
            </button>
          </div>
        </div>

        {/* Finance and Sales Analytics Grid */}
        {activeChartTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Revenue & Expenses (Budget Summary) */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">1. Revenue vs Expense Trend</h4>
              <p className="text-[11px] text-muted-foreground">Monthly cash disbursements against invoiced values</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="Expenses" stroke="#EF4444" fill="#EF4444" fillOpacity={0.05} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Client Growth & Expansion */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">2. Client Expansion Timeline</h4>
              <p className="text-[11px] text-muted-foreground">Active corporate accounts and cumulative expansion value ($k)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Clients" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ExpansionVal" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 9: Financial Summary Breakdown */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">3. Accounts Budget vs Actual</h4>
              <p className="text-[11px] text-muted-foreground">Department core spending limits vs real billing logs</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialSummaryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" fontSize={10} stroke="#64748B" />
                    <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748B" width={80} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Budget" fill="#64748B" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Actual" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* HR and Employee Strength / Compliance */}
        {activeChartTab === 'hr' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 2: Employee Strength Trend */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">4. Employee Strength Growth</h4>
              <p className="text-[11px] text-muted-foreground">SIS workforce total deployed active count trend</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employeeStrengthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="Headcount" stroke="#8B5CF6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Recruitment Progress Funnel */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">5. Recruitment Pipeline Funnel</h4>
              <p className="text-[11px] text-muted-foreground">Stages from sourcing down to active roster onboarding</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recruitmentProgressData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" fontSize={10} stroke="#64748B" />
                    <YAxis dataKey="stage" type="category" fontSize={10} stroke="#64748B" width={80} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Count" fill="#EC4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Attrition Trend */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">6. Workforce Attrition Rate (%)</h4>
              <p className="text-[11px] text-muted-foreground">Monthly percentage index of employee exits</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attritionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="Rate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.08} strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Operations and Quality Audits */}
        {activeChartTab === 'ops' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 7: Site Quality Audit Scores */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">7. Site Quality Audit Score</h4>
              <p className="text-[11px] text-muted-foreground">Scores compared against SIS 80% security threshold</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sitePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" domain={[0, 100]} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                      {sitePerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 8: Complaint Analysis */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">8. Complaints Category Analysis</h4>
              <p className="text-[11px] text-muted-foreground">Volume breakdown of client issues by facility department</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complaintAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} stroke="#64748B" />
                    <YAxis fontSize={10} stroke="#64748B" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="Complaints" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Training Compliance Donut */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">9. Crew Training Compliance</h4>
              <p className="text-[11px] text-muted-foreground">Percentage of crew holding valid active certifications</p>
              <div className="h-56 flex flex-col justify-center items-center relative">
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-mono font-black text-emerald-500">{metrics.training.trainingCompliancePct}%</span>
                  <span className="text-[9px] text-muted-foreground font-bold">COMPLIANCE</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trainingComplianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#64748B" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Operations Intelligence & Field Control Drill-Down Modal */}
      <OpsDrillDownModal
        isOpen={isOpsModalOpen}
        onClose={() => setIsOpsModalOpen(false)}
        initialTab={opsModalTab}
        opsAttendance={state.opsAttendanceRecords || []}
        opsOvertime={state.opsOvertimeRecords || []}
        opsInspections={state.opsSiteInspections || []}
        opsComplaints={state.opsClientComplaints || []}
        opsSlas={state.opsSlaCompliances || []}
        opsUniforms={state.opsUniformAvailabilities || []}
        opsIdCards={state.opsIdCardCompliances || []}
        opsEquipments={state.opsEquipmentRecords || []}
        opsAttention={state.opsAttentionItems || []}
        opsDefinitions={state.opsDataDefinitions || []}
      />

      {/* CEO HD Portrait Full Lightbox Modal */}
      {isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Chief Executive Officer</h4>
                  <p className="text-[10px] font-mono text-slate-400">Spoorthy Integrated Solutions · Executive HD Portrait</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High Definition Image Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-black shadow-inner flex items-center justify-center">
              <img 
                src="/ceo-profile.jpg" 
                alt="Chief Executive Officer - Spoorthy Integrated Solutions" 
                className="w-full max-h-[500px] object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/40 text-[9.5px] font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ORIGINAL HD · 954 × 1024</span>
              </div>
            </div>

            {/* Footer with Details & Download */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-slate-200 font-bold">Scope:</span> Executive Board / CEO
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/ceo-profile.jpg"
                  download="Spoorthy_CEO_Portrait_HD.jpg"
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HD</span>
                </a>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// KPI Stat Card Subcomponent
function KPICard({ label, val, change, s }: { label: string; val: any; change: string; s: string; key?: any }) {
  const statusColor = s === 'Red' ? 'border-l-4 border-l-red-500' : s === 'Amber' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500';
  const dotColor = s === 'Red' ? 'bg-red-500' : s === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className={`p-3 bg-background border border-border rounded-xl shadow-sm hover:shadow transition relative flex flex-col justify-between ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground font-semibold uppercase tracking-tight truncate max-w-[100px]">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
      </div>
      <div>
        <div className="text-base font-mono font-black tracking-tight text-foreground truncate">{val}</div>
        <p className="text-[9px] text-muted-foreground mt-1 truncate">{change}</p>
      </div>
    </div>
  );
}
