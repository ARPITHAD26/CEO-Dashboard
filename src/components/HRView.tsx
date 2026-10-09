import { useState, FormEvent, useMemo } from 'react';
import { 
  AppState, Employee, Attendance, Leave, DisciplinaryCase, Task,
  HRWorkforcePositionRecord, HRRequisitionRecord, HRBillingSupportRecord,
  HRClientComplaintRecord, HRSiteVisitRecord, HRUniformIdComplianceRecord,
  HRStatutoryComplianceRecord, HRDataDefinition
} from '../types';
import { logAuditEntry } from '../data/store';
import { 
  Users, CheckCircle, Trash2, Edit2, PlusCircle, AlertTriangle,
  Search, Filter, ChevronRight, Download, FileText, Image as ImageIcon,
  Building2, Briefcase, Calendar, ShieldCheck, DollarSign, Clock,
  Check, X, Eye, Sparkles, ExternalLink, HelpCircle, ArrowUpRight,
  TrendingDown, TrendingUp, AlertCircle, Phone, MapPin, Star, UserCheck, Maximize2
} from 'lucide-react';

interface HRViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

type HRSubTab = 
  | 'ceo_functional'
  | 'workforce'
  | 'recruitment'
  | 'attendance_billing'
  | 'client_complaints'
  | 'site_visits'
  | 'compliance_statutory'
  | 'it_definitions'
  | 'employees'
  | 'leaves'
  | 'disciplinary'
  | 'tasks';

export default function HRView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName 
}: HRViewProps) {
  const allTabs: { id: HRSubTab; label: string; icon: any; badge?: string }[] = [
    { id: 'ceo_functional', label: 'CEO Dashboard – HR Inputs', icon: Briefcase, badge: 'Draft V1' },
    { id: 'workforce', label: 'Workforce Position', icon: Users, badge: '6,420 Active' },
    { id: 'recruitment', label: 'Recruitment & Cost', icon: Search, badge: '₹3.45L' },
    { id: 'attendance_billing', label: 'Attendance & Billing', icon: Calendar, badge: '92% Billed' },
    { id: 'client_complaints', label: 'Client Complaints', icon: AlertCircle, badge: '3 Open' },
    { id: 'site_visits', label: 'Field Site Visits', icon: MapPin, badge: '24 Visits' },
    { id: 'compliance_statutory', label: 'Uniform, ID & PF/ESI', icon: ShieldCheck, badge: '97% OK' },
    { id: 'it_definitions', label: 'IT Data Definitions', icon: FileText, badge: '12 Metrics' },
    { id: 'employees', label: 'Staff Roster Directory', icon: Users },
    { id: 'leaves', label: 'Leave Requests', icon: CheckCircle },
    { id: 'disciplinary', label: 'Disciplinary Cases', icon: AlertTriangle },
    { id: 'tasks', label: 'Assigned Tasks', icon: CheckCircle }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'ceo_functional';

  const [activeSubTab, setActiveSubTab] = useState<HRSubTab>(defaultTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('September 2026');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [generalSearch, setGeneralSearch] = useState<string>('');

  // Drilldown Modal State
  const [drilldownModal, setDrilldownModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    type: 'workforce' | 'joiners' | 'resignations' | 'terminations' | 'open_positions' | 'joining_pending' | 'billing' | 'complaints' | 'visits' | 'uniform' | 'pf_esi';
    data: any[];
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    type: 'workforce',
    data: []
  });

  // Modals for Data Entry
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<{ isOpen: boolean; title: string; url?: string; description?: string }>({
    isOpen: false,
    title: ''
  });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Forms
  const [empForm, setEmpForm] = useState<Partial<Employee>>({
    name: '', employee_id: '', department: 'Operations', site_id: 'S-201', doj: '', vacancy_status: 'Filled', exit_status: 'Active', remarks: ''
  });
  const [attForm, setAttForm] = useState<Partial<Attendance>>({
    employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present'
  });
  const [leaveForm, setLeaveForm] = useState<Partial<Leave>>({
    employee_id: '', type: 'Privilege Leave', start_date: '', end_date: '', status: 'Pending'
  });
  const [dcForm, setDcForm] = useState<Partial<DisciplinaryCase>>({
    employee_id: '', type: 'Attendance Negligence', status: 'Open', date: '', remarks: ''
  });

  // Site Visit Form
  const [siteVisitForm, setSiteVisitForm] = useState<Partial<HRSiteVisitRecord>>({
    date: new Date().toISOString().split('T')[0],
    hr_representative: 'Aarav Sharma (Senior HR Lead)',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital (Vani Vilas Wing)',
    purpose: 'Uniform & ID Audit',
    key_observation: '',
    action_required: '',
    action_owner: 'Aarav Sharma',
    status: 'Completed',
    employees_checked: 40,
    exceptions_found: 2,
    photograph_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    evidence_file_name: 'Audit_Inspection_Log.pdf'
  });

  // Requisition Form
  const [reqForm, setReqForm] = useState<Partial<HRRequisitionRecord>>({
    req_code: `REQ-BLR-${Date.now().toString().slice(-4)}`,
    client_name: 'St. Jude Health System',
    site_name: 'City General Hospital',
    position_title: 'Hospital Ward Attendants',
    category: 'Housekeeping',
    open_count: 5,
    closed_count: 0,
    joining_pending_count: 2,
    target_join_date: '2026-09-30',
    status: 'Open',
    recruitment_cost_inr: 25000,
    recruiter_name: 'Aarav Sharma',
    remarks: 'Immediate ward expansion'
  });

  // Complaint Form
  const [complaintForm, setComplaintForm] = useState<Partial<HRClientComplaintRecord>>({
    complaint_no: `CMP-HR-${Date.now().toString().slice(-4)}`,
    client_name: 'Apex Property Holdings',
    site_name: 'Metro Office Complex',
    category: 'Grooming & Uniform',
    complaint_text: '',
    date_logged: new Date().toISOString().split('T')[0],
    target_closure_date: '2026-09-25',
    owner: 'Ramesh Chawla',
    status: 'Open',
    severity: 'Medium',
    root_cause: '',
    corrective_action: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Collections from state
  const hrWorkforceRecords = state.hrWorkforceRecords || [];
  const hrRequisitions = state.hrRequisitions || [];
  const hrBillingSupports = state.hrBillingSupports || [];
  const hrClientComplaints = state.hrClientComplaints || [];
  const hrSiteVisits = state.hrSiteVisits || [];
  const hrUniformIdChecks = state.hrUniformIdChecks || [];
  const hrStatutoryRecords = state.hrStatutoryRecords || [];
  const hrDataDefinitions = state.hrDataDefinitions || [];

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // -------------------------------------------------------------
  // ROLLUP METRICS CALCULATION (FOR THE 5 PRACTICAL BLOCKS)
  // -------------------------------------------------------------
  const totalEmployeesCount = 6420; // Enterprise workforce active strength
  const totalNewJoiners = hrWorkforceRecords.reduce((sum, r) => sum + (r.new_joiners || 0), 0) || 148;
  const totalResignations = hrWorkforceRecords.reduce((sum, r) => sum + (r.resignations || 0), 0) || 32;
  const totalTerminations = hrWorkforceRecords.reduce((sum, r) => sum + (r.terminations || 0), 0) || 14;
  const avgAttritionPct = (Number(((totalResignations + totalTerminations) / totalEmployeesCount) * 100 * 12)).toFixed(1) || '4.8';

  const totalOpenPositions = hrRequisitions.filter(r => r.status === 'Open' || r.status === 'Critical SLA Overdue').reduce((sum, r) => sum + (r.open_count || 0), 0) || 64;
  const totalPositionsClosed = hrRequisitions.reduce((sum, r) => sum + (r.closed_count || 0), 0) || 112;
  const totalJoiningPending = hrRequisitions.reduce((sum, r) => sum + (r.joining_pending_count || 0), 0) || 18;
  const totalRecruitmentCost = hrRequisitions.reduce((sum, r) => sum + (r.recruitment_cost_inr || 0), 0) || 345000;

  const totalBillingSites = hrBillingSupports.length || 5;
  const submittedBillingSites = hrBillingSupports.filter(b => b.status === 'Input submitted' || b.status === 'Input cleared').length;
  const billingSubmittedPct = totalBillingSites > 0 ? Math.round((submittedBillingSites / totalBillingSites) * 100) : 92;
  const billingPendingPct = 100 - billingSubmittedPct;

  const totalComplaints = hrClientComplaints.length || 14;
  const closedComplaints = hrClientComplaints.filter(c => c.status === 'Closed').length || 11;
  const openComplaints = hrClientComplaints.filter(c => c.status === 'Open' || c.status === 'Pending / Overdue').length || 3;

  const totalSiteVisits = hrSiteVisits.length || 24;

  const uniformComplianceAvg = hrUniformIdChecks.length > 0 
    ? Math.round(hrUniformIdChecks.reduce((s, c) => s + c.uniform_compliance_pct, 0) / hrUniformIdChecks.length)
    : 96;
  const idComplianceAvg = hrUniformIdChecks.length > 0
    ? Math.round(hrUniformIdChecks.reduce((s, c) => s + c.id_compliance_pct, 0) / hrUniformIdChecks.length)
    : 97;
  const totalEmployeesChecked = hrUniformIdChecks.reduce((s, c) => s + c.employees_checked, 0) || 1240;
  const totalUniformExceptions = hrUniformIdChecks.reduce((s, c) => s + c.exceptions_count, 0) || 47;

  const totalPfExceptions = hrStatutoryRecords.reduce((s, r) => s + (r.pf_exception_count || 0), 0) || 3;
  const totalEsiExceptions = hrStatutoryRecords.reduce((s, r) => s + (r.esi_exception_count || 0), 0) || 5;

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSiteVisitSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newVisitId = `VISIT-${Date.now()}`;
    const newVisit: HRSiteVisitRecord = {
      id: newVisitId,
      visit_code: `HR-VIS-${new Date().getMonth() + 1}-${Math.floor(10 + Math.random() * 90)}`,
      date: siteVisitForm.date || new Date().toISOString().split('T')[0],
      hr_representative: siteVisitForm.hr_representative || 'Aarav Sharma',
      client_id: siteVisitForm.client_id || 'C-001',
      client_name: siteVisitForm.client_name || 'Apex Property Holdings',
      site_id: siteVisitForm.site_id || 'S-201',
      site_name: siteVisitForm.site_name || 'Metro Office Complex',
      purpose: siteVisitForm.purpose || 'Uniform & ID Audit',
      key_observation: siteVisitForm.key_observation || 'Inspected morning shift muster.',
      action_required: siteVisitForm.action_required || 'No major issues observed.',
      action_owner: siteVisitForm.action_owner || 'Site Supervisor',
      status: siteVisitForm.status || 'Completed',
      photograph_url: siteVisitForm.photograph_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      evidence_file_name: siteVisitForm.evidence_file_name || 'Inspection_Report.pdf',
      employees_checked: Number(siteVisitForm.employees_checked) || 30,
      exceptions_found: Number(siteVisitForm.exceptions_found) || 0
    };

    const nextState = {
      ...state,
      hrSiteVisits: [newVisit, ...(state.hrSiteVisits || [])]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'HRSiteVisit', newVisitId, `Logged HR field site visit at ${newVisit.site_name}`);
    onUpdateState(nextState);
    setIsSiteVisitModalOpen(false);
    triggerSuccess(`Site visit at ${newVisit.site_name} saved with evidence!`);
  };

  const handleRequisitionSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newReqId = `REQ-${Date.now()}`;
    const newReq: HRRequisitionRecord = {
      id: newReqId,
      req_code: reqForm.req_code || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: 'C-001',
      client_name: reqForm.client_name || 'Apex Property Holdings',
      site_id: 'S-201',
      site_name: reqForm.site_name || 'Metro Office Complex',
      position_title: reqForm.position_title || 'Security Guard',
      category: reqForm.category || 'Security',
      open_count: Number(reqForm.open_count) || 1,
      closed_count: Number(reqForm.closed_count) || 0,
      joining_pending_count: Number(reqForm.joining_pending_count) || 0,
      target_join_date: reqForm.target_join_date || new Date().toISOString().split('T')[0],
      status: reqForm.status || 'Open',
      recruitment_cost_inr: Number(reqForm.recruitment_cost_inr) || 15000,
      recruiter_name: reqForm.recruiter_name || 'Aarav Sharma',
      remarks: reqForm.remarks || ''
    };

    const nextState = {
      ...state,
      hrRequisitions: [newReq, ...(state.hrRequisitions || [])]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'HRRequisition', newReqId, `Created recruitment requisition ${newReq.req_code}`);
    onUpdateState(nextState);
    setIsRequisitionModalOpen(false);
    triggerSuccess(`Requisition "${newReq.position_title}" created!`);
  };

  const handleComplaintSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newCmpId = `CMP-${Date.now()}`;
    const newCmp: HRClientComplaintRecord = {
      id: newCmpId,
      complaint_no: complaintForm.complaint_no || `CMP-HR-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: 'C-001',
      client_name: complaintForm.client_name || 'Client Account',
      site_id: 'S-201',
      site_name: complaintForm.site_name || 'Unit Facility',
      category: complaintForm.category || 'Grooming & Uniform',
      complaint_text: complaintForm.complaint_text || 'Issue reported',
      date_logged: complaintForm.date_logged || new Date().toISOString().split('T')[0],
      target_closure_date: complaintForm.target_closure_date || '',
      owner: complaintForm.owner || 'Aarav Sharma',
      status: complaintForm.status || 'Open',
      severity: complaintForm.severity || 'Medium',
      root_cause: complaintForm.root_cause || '',
      corrective_action: complaintForm.corrective_action || ''
    };

    const nextState = {
      ...state,
      hrClientComplaints: [newCmp, ...(state.hrClientComplaints || [])]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'HRClientComplaint', newCmpId, `Logged HR client complaint: ${newCmp.complaint_no}`);
    onUpdateState(nextState);
    setIsComplaintModalOpen(false);
    triggerSuccess(`Client complaint "${newCmp.complaint_no}" logged!`);
  };

  // Open Interactive Drill-Down
  const openDrilldown = (type: typeof drilldownModal.type, title: string, subtitle: string, data: any[]) => {
    setDrilldownModal({
      isOpen: true,
      title,
      subtitle,
      type,
      data
    });
  };

  return (
    <div className="space-y-6 bg-slate-50/70 border border-slate-200/80 p-6 rounded-3xl shadow-xs text-slate-800 font-sans">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-wide">{successMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEADER & EXECUTIVE NAVIGATION BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl border border-sky-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* HR Head HD Photo Frame with Zoom & Crisp Resolution */}
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => setIsPhotoModalOpen(true)} 
              title="Click to view full HD portrait of HR Head"
            >
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 opacity-75 group-hover:opacity-100 blur-sm transition duration-300" />
              
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/90 shadow-xl bg-slate-900">
                <img 
                  src="/hr-head-profile.jpg" 
                  alt="HR Head" 
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
                <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-amber-300 border border-amber-400/40 flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>HD</span>
                </div>
              </div>

              {/* Online pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 bg-white/20 text-white border border-white/30 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-sky-200" />
                  CEO Dashboard – HR Functional Inputs (Draft V1)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Operational Oversight
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>HR Head</span>
                <span className="text-xs sm:text-sm font-semibold text-sky-100 font-sans tracking-normal bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                  Workforce Operations Control Tower
                </span>
              </h1>
              <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Centralized functional data governance across Workforce Strength, Recruitment Pipelines, Attendance, Billing Support Lifecycles, Client Complaints, Field Site Visits, Uniform/ID Checks, and PF/ESI Compliance.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSiteVisitModalOpen(true)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-sky-200" />
              <span>+ Record Site Visit</span>
            </button>
            <button
              onClick={() => setIsRequisitionModalOpen(true)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-sky-200" />
              <span>+ New Requisition</span>
            </button>
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>+ Log Complaint</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-sky-400/30 overflow-x-auto pb-1">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-sky-900 shadow-md font-bold'
                    : 'bg-white/10 text-sky-100 hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-700' : 'text-sky-200'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-sky-100 text-sky-800' : 'bg-sky-950/60 text-sky-100'
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
      {/* 1. CEO DASHBOARD – HR FUNCTIONAL INPUTS (THE 5 PRACTICAL BLOCKS)*/}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'ceo_functional' && (
        <div className="space-y-6">
          
          {/* TOP SUMMARY BANNER: THE PROPOSED CEO VIEW */}
          <div className="p-6 bg-white border border-sky-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-bold text-slate-900">CEO Executive Snapshot – September 2026</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any metric number below to open the complete underlying Client → Site → Role drill-down.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500 font-semibold">Reporting Period:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 font-bold text-sky-800 focus:outline-none"
                >
                  <option value="September 2026">September 2026 (Active MTD)</option>
                  <option value="August 2026">August 2026 (Closed)</option>
                  <option value="Q2 FY27">Q2 FY27 (Consolidated)</option>
                </select>
              </div>
            </div>

            {/* THE 5 PRACTICAL BLOCKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* BLOCK 1: WORKFORCE */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-600" />
                      👥 WORKFORCE
                    </span>
                  </div>
                  <div 
                    onClick={() => openDrilldown('workforce', 'Workforce Active Strength', 'Client → Site/Unit → Role Category', hrWorkforceRecords)}
                    className="text-2xl font-bold text-slate-900 tracking-tight mt-2 cursor-pointer hover:text-sky-600 flex items-baseline gap-1"
                  >
                    <span>6,420</span>
                    <span className="text-xs font-normal text-slate-500">Employees</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 pt-2 border-t border-sky-200/60">
                    <div className="flex justify-between">
                      <span>New Joiners:</span>
                      <strong 
                        onClick={() => openDrilldown('joiners', 'New Joiners (MTD)', 'Date → Site → Role', hrWorkforceRecords)}
                        className="text-emerald-700 font-mono hover:underline cursor-pointer"
                      >
                        +{totalNewJoiners}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Resignations:</span>
                      <strong 
                        onClick={() => openDrilldown('resignations', 'Resignations during period', 'Site → Role', hrWorkforceRecords)}
                        className="text-amber-700 font-mono hover:underline cursor-pointer"
                      >
                        {totalResignations}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminations:</span>
                      <strong 
                        onClick={() => openDrilldown('terminations', 'Terminations during period', 'Site → Role', hrWorkforceRecords)}
                        className="text-rose-700 font-mono hover:underline cursor-pointer"
                      >
                        {totalTerminations}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Monthly Attrition:</span>
                  <span className="font-mono font-bold text-sky-800">{avgAttritionPct}%</span>
                </div>
              </div>

              {/* BLOCK 2: RECRUITMENT */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-sky-600" />
                      🔎 RECRUITMENT
                    </span>
                  </div>
                  <div 
                    onClick={() => openDrilldown('open_positions', 'Open Positions & Requisitions', 'Client → Site → Position → Status', hrRequisitions)}
                    className="text-2xl font-bold text-slate-900 tracking-tight mt-2 cursor-pointer hover:text-sky-600 flex items-baseline gap-1"
                  >
                    <span>{totalOpenPositions}</span>
                    <span className="text-xs font-normal text-slate-500">Open Requisitions</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 pt-2 border-t border-sky-200/60">
                    <div className="flex justify-between">
                      <span>Positions Closed:</span>
                      <strong className="text-emerald-700 font-mono">{totalPositionsClosed}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Joining Pending:</span>
                      <strong 
                        onClick={() => openDrilldown('joining_pending', 'Joining Pending (Selected but not joined)', 'Site → Role → Candidate Status', hrRequisitions)}
                        className="text-amber-700 font-mono hover:underline cursor-pointer"
                      >
                        {totalJoiningPending}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Recruitment Cost:</span>
                      <strong className="text-slate-900 font-mono">₹{(totalRecruitmentCost / 100000).toFixed(2)}L</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">SLA Status:</span>
                  <span className="text-amber-700 font-bold text-[11px]">8 Critical SLA Overdue</span>
                </div>
              </div>

              {/* BLOCK 3: ATTENDANCE & BILLING */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      📋 ATTENDANCE &amp; BILLING
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 tracking-tight mt-2 flex items-baseline gap-1">
                    <span>94.6%</span>
                    <span className="text-xs font-normal text-slate-500">Overall Attendance</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 pt-2 border-t border-sky-200/60">
                    <div className="flex justify-between">
                      <span>Billing Inputs:</span>
                      <strong 
                        onClick={() => openDrilldown('billing', 'Billing Support Inputs Status', 'Client → Site → Billing Period → Submission Status', hrBillingSupports)}
                        className="text-sky-800 font-bold hover:underline cursor-pointer"
                      >
                        {billingSubmittedPct}% Submitted
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Inputs Pending:</span>
                      <strong className="text-amber-700 font-mono">{billingPendingPct}% (2 Sites)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Queries Raised:</span>
                      <strong className="text-rose-700 font-mono">1 Site Overtime</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Control Tower:</span>
                  <span className="text-emerald-700 font-bold text-[11px]">Active SLA Sync</span>
                </div>
              </div>

              {/* BLOCK 4: EMPLOYEE / CLIENT SUPPORT */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-sky-600" />
                      🤝 CLIENT SUPPORT
                    </span>
                  </div>
                  <div 
                    onClick={() => openDrilldown('complaints', 'HR Client Complaints', 'Client → Site → Complaint → Owner → Status → Action', hrClientComplaints)}
                    className="text-2xl font-bold text-slate-900 tracking-tight mt-2 cursor-pointer hover:text-sky-600 flex items-baseline gap-1"
                  >
                    <span>{totalComplaints}</span>
                    <span className="text-xs font-normal text-slate-500">Total Complaints</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 pt-2 border-t border-sky-200/60">
                    <div className="flex justify-between">
                      <span>Closed / Resolved:</span>
                      <strong className="text-emerald-700 font-mono">{closedComplaints}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Escalations:</span>
                      <strong className="text-amber-700 font-mono">{openComplaints}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Field Site Visits:</span>
                      <strong 
                        onClick={() => openDrilldown('visits', 'HR Field Site Visits & Evidence', 'Date → HR Rep → Site → Key Observation → Photo Evidence', hrSiteVisits)}
                        className="text-sky-800 font-bold hover:underline cursor-pointer"
                      >
                        {totalSiteVisits} in Sep
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Audit Evidence:</span>
                  <span className="text-emerald-700 font-bold text-[11px]">100% Photos Attached</span>
                </div>
              </div>

              {/* BLOCK 5: COMPLIANCE & COST */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 hover:border-sky-300 rounded-2xl space-y-3 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      ✅ COMPLIANCE &amp; COST
                    </span>
                  </div>
                  <div 
                    onClick={() => openDrilldown('uniform', 'Uniform & ID Card Compliance', 'Client → Site → Employee / Category → Exception', hrUniformIdChecks)}
                    className="text-2xl font-bold text-slate-900 tracking-tight mt-2 cursor-pointer hover:text-sky-600 flex items-baseline gap-1"
                  >
                    <span>{uniformComplianceAvg}%</span>
                    <span className="text-xs font-normal text-slate-500">Uniform Compliant</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2 pt-2 border-t border-sky-200/60">
                    <div className="flex justify-between">
                      <span>ID Card Compliance:</span>
                      <strong className="text-emerald-700 font-mono">{idComplianceAvg}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>PF Compliance:</span>
                      <strong 
                        onClick={() => openDrilldown('pf_esi', 'Statutory PF/ESI Compliance & Exceptions', 'Client/Site → Employee → Issue → Status → Pending Action', hrStatutoryRecords)}
                        className="text-amber-700 font-mono hover:underline cursor-pointer"
                      >
                        Compliant ({totalPfExceptions} Exceptions)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI Compliance:</span>
                      <strong className="text-amber-700 font-mono">Compliant ({totalEsiExceptions} Exceptions)</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Checked:</span>
                  <span className="font-mono text-slate-700">{totalEmployeesChecked} Guards</span>
                </div>
              </div>

            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* EXCEPTIONS / ATTENTION REQUIRED PANEL                         */}
          {/* ------------------------------------------------------------- */}
          <div className="p-6 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Exceptions &amp; Immediate Attention Required
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100/80 px-3 py-1 rounded-full border border-rose-300">
                5 High-Priority Action Items
              </span>
            </div>
            
            <p className="text-xs text-slate-600">
              Direct escalation surfacing items breaching SLA thresholds defined by HR Operations. Click any item to inspect the root cause.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              
              <div 
                onClick={() => openDrilldown('open_positions', 'Positions Pending Beyond SLA', 'Client → Site → Position Title → Requisition Status', hrRequisitions.filter(r => r.status === 'Critical SLA Overdue' || r.status === 'Open'))}
                className="p-4 bg-white/90 border border-rose-300 hover:border-rose-500 hover:shadow-md rounded-2xl space-y-1.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                  <span>🔴 8 Positions Overdue</span>
                </div>
                <p className="text-[11px] text-slate-600">City General Hospital NABH ward attendants pending &gt; 7 days.</p>
                <span className="text-[10px] text-rose-800 font-bold flex items-center gap-1 pt-1">
                  Inspect Requisitions <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div 
                onClick={() => openDrilldown('pf_esi', 'PF & ESI Statutory Exceptions', 'Client/Site → Employee → Issue Type → Status → Action Plan', hrStatutoryRecords)}
                className="p-4 bg-white/90 border border-rose-300 hover:border-rose-500 hover:shadow-md rounded-2xl space-y-1.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                  <span>🔴 3 PF/ESI Exceptions</span>
                </div>
                <p className="text-[11px] text-slate-600">UAN mismatch &amp; unlinked Aadhaar spelling joint declarations filed.</p>
                <span className="text-[10px] text-rose-800 font-bold flex items-center gap-1 pt-1">
                  Review EPFO Action <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div 
                onClick={() => openDrilldown('joining_pending', 'Joining Pending Verification', 'Site → Role → Candidate Status', hrRequisitions)}
                className="p-4 bg-white/90 border border-amber-300 hover:border-amber-500 hover:shadow-md rounded-2xl space-y-1.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>🟠 5 Joining Cases Pending</span>
                </div>
                <p className="text-[11px] text-slate-600">Selected candidates awaiting hepatitis vaccination records &amp; uniforms.</p>
                <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 pt-1">
                  View Candidate Funnel <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div 
                onClick={() => openDrilldown('complaints', 'Open Client Complaints', 'Client → Site → Complaint → Owner → Status → Action Plan', hrClientComplaints.filter(c => c.status === 'Open'))}
                className="p-4 bg-white/90 border border-amber-300 hover:border-amber-500 hover:shadow-md rounded-2xl space-y-1.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>🟠 4 Complaints Open</span>
                </div>
                <p className="text-[11px] text-slate-600">Freight depot uniform wear &amp; Metro tower concierge communication.</p>
                <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 pt-1">
                  Resolve Escalations <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div 
                onClick={() => openDrilldown('uniform', 'ID Card & Uniform Exceptions', 'Client → Site → Employee / Category → Exception', hrUniformIdChecks)}
                className="p-4 bg-white/90 border border-amber-300 hover:border-amber-500 hover:shadow-md rounded-2xl space-y-1.5 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>🟠 12 ID-Card Exceptions</span>
                </div>
                <p className="text-[11px] text-slate-600">Temporary badge replacements underway across 2 logistics branches.</p>
                <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1 pt-1">
                  Check Replacement Roster <ChevronRight className="w-3 h-3" />
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. WORKFORCE POSITION & DRILL-DOWN MATRIX                     */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'workforce' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Workforce Position &amp; Movement Matrix</h2>
              </div>
              <p className="text-xs text-slate-500">
                Client → Site/Unit → Role Category breakdown for Active Workforce, Joiners, Resignations, and Attrition.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Client:</span>
              <select
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
                className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-800"
              >
                <option value="All">All Client Accounts</option>
                <option value="Apex Property Holdings">Apex Property Holdings</option>
                <option value="St. Jude Health System">St. Jude Health System</option>
                <option value="OmniCorp Global HQ">OmniCorp Global HQ</option>
                <option value="Northside Freight Logistics">Northside Freight Logistics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrWorkforceRecords.map((rec) => (
              <div key={rec.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {rec.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{rec.period}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{rec.site_name}</h4>
                  <p className="text-xs text-slate-500">{rec.client_name} • <strong className="text-slate-800">{rec.role}</strong></p>
                </div>

                <div className="grid grid-cols-4 gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-2xl text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Strength</span>
                    <strong className="text-slate-900 text-sm">{rec.total_strength}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Joiners</span>
                    <strong className="text-emerald-700 text-sm">+{rec.new_joiners}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Resign</span>
                    <strong className="text-amber-700 text-sm">{rec.resignations}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Attrition</span>
                    <strong className="text-sky-700 text-sm">{rec.attrition_pct}%</strong>
                  </div>
                </div>

                {rec.details && rec.details.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Recent Staff Movements:</span>
                    <div className="space-y-1">
                      {rec.details.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-[11px] border border-slate-100">
                          <div>
                            <strong className="text-slate-800">{d.employee_name}</strong>
                            <span className="text-[10px] text-slate-500 block">{d.employee_id} • {d.action_date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            d.movement_type === 'Joiner' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            d.movement_type === 'Resignation' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            d.movement_type === 'Termination' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            'bg-sky-50 text-sky-700 border-sky-300'
                          }`}>
                            {d.movement_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. RECRUITMENT & COST BREAKDOWN                               */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'recruitment' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Talent Acquisition, Pipeline &amp; Activity Cost</h2>
              </div>
              <p className="text-xs text-slate-500">
                Requisitions pipeline tracking, candidate joining statuses, and transparent recruitment activity expenditures.
              </p>
            </div>
            <button
              onClick={() => setIsRequisitionModalOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Requisition</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrRequisitions.map((req) => (
              <div key={req.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                    {req.req_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    req.status === 'Critical SLA Overdue' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                    req.status === 'Open' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                    req.status === 'Joining Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{req.position_title}</h4>
                  <p className="text-xs text-slate-500">{req.client_name} • {req.site_name}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-2xl text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Open</span>
                    <strong className="text-slate-900 text-sm">{req.open_count} Pax</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Closed</span>
                    <strong className="text-emerald-700 text-sm">{req.closed_count} Pax</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Pending Join</span>
                    <strong className="text-amber-700 text-sm">{req.joining_pending_count} Pax</strong>
                  </div>
                </div>

                {req.cost_breakdown && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Total Recruitment Cost:</span>
                      <span className="font-mono font-bold text-sky-800">₹{req.recruitment_cost_inr.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-1 pt-1 border-t border-slate-200">
                      <div>Portals: ₹{req.cost_breakdown.job_portals}</div>
                      <div>Referral: ₹{req.cost_breakdown.referral_incentives}</div>
                      <div>Ads: ₹{req.cost_breakdown.advertisement}</div>
                      <div>Medical/BG: ₹{req.cost_breakdown.bg_medical_verification}</div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Recruiter: <strong className="text-slate-700">{req.recruiter_name}</strong></span>
                  <span className="font-mono">Target: {req.target_join_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ATTENDANCE & BILLING SUPPORT (5-STAGE LIFECYCLE)          */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'attendance_billing' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Attendance &amp; Billing Support Control Tower</h2>
              </div>
              <p className="text-xs text-slate-500">
                5-Stage operational status tracking: Required → Submitted → Pending → Query Raised → Cleared.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
                {billingSubmittedPct}% Inputs Cleared
              </span>
            </div>
          </div>

          <div className="bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-sky-100 bg-sky-50/50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Operational Billing Support Muster Submissions</h4>
              <span className="text-xs font-mono text-slate-500">{hrBillingSupports.length} Site Accounts</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-50/30 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Client &amp; Site</th>
                  <th className="p-3">Billing Period</th>
                  <th className="p-3">Manpower Manned</th>
                  <th className="p-3">Submission Status</th>
                  <th className="p-3">Action Owner</th>
                  <th className="p-3">Supporting File</th>
                  <th className="p-3">Remarks / Query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {hrBillingSupports.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition">
                    <td className="p-3">
                      <strong className="text-slate-900 block">{item.site_name}</strong>
                      <span className="text-[10px] text-slate-500">{item.client_name}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-sky-800">{item.billing_period}</td>
                    <td className="p-3 font-mono">
                      {item.billable_attendance_count} / {item.required_manpower} Pax
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.status === 'Input cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        item.status === 'Input submitted' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                        item.status === 'Input returned/query raised' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                        'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{item.action_owner}</td>
                    <td className="p-3">
                      {item.supporting_attendance_file ? (
                        <button
                          onClick={() => setIsEvidenceModalOpen({ isOpen: true, title: item.supporting_attendance_file!, description: `Signed muster roll for ${item.site_name}` })}
                          className="px-2 py-1 bg-sky-100 text-sky-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-sky-200 transition cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-sky-600" />
                          <span>Muster Attached</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No File</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] max-w-[240px]">
                      {item.query_details ? <strong className="text-rose-700 block">{item.query_details}</strong> : item.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. CLIENT COMPLAINTS (HR RELATED)                             */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'client_complaints' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">HR Client Complaints &amp; Service Redressal</h2>
              </div>
              <p className="text-xs text-slate-500">
                Capture client grievances on absenteeism, grooming, discipline, statutory and conduct with strict SLA resolution.
              </p>
            </div>
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Log Client Complaint</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrClientComplaints.map((c) => (
              <div key={c.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {c.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    c.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    c.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-rose-50 text-rose-700 border-rose-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{c.complaint_text}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{c.client_name} • {c.site_name}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div>
                    <span className="text-slate-500 text-[10px] font-semibold block uppercase">Root Cause:</span>
                    <span className="text-slate-800 font-medium">{c.root_cause || 'Under investigation'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-semibold block uppercase">Corrective Action:</span>
                    <span className="text-slate-800 font-medium">{c.corrective_action || 'Action assigned to site supervisor'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Owner: <strong className="text-slate-700">{c.owner}</strong></span>
                  <span className="font-mono">Logged: {c.date_logged}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. HR FIELD SITE VISITS & EVIDENCE                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'site_visits' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">HR Field Site Visits &amp; Photographic Evidence</h2>
              </div>
              <p className="text-xs text-slate-500">
                Functional visit records with date, HR representative, observations, action items and photographic evidence.
              </p>
            </div>
            <button
              onClick={() => setIsSiteVisitModalOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Field Site Visit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrSiteVisits.map((visit) => (
              <div key={visit.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {visit.purpose}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{visit.date}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{visit.site_name}</h4>
                    <p className="text-xs text-slate-500">{visit.client_name} • By <strong className="text-slate-700">{visit.hr_representative}</strong></p>
                  </div>

                  {visit.photograph_url && (
                    <div 
                      onClick={() => setIsEvidenceModalOpen({ isOpen: true, title: visit.site_name, url: visit.photograph_url, description: visit.key_observation })}
                      className="h-36 w-full rounded-2xl overflow-hidden border border-sky-200 relative group cursor-pointer"
                    >
                      <img 
                        src={visit.photograph_url} 
                        alt={visit.site_name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Click to View Inspection Photo</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs space-y-1">
                    <p className="text-slate-800 font-medium"><strong>Observation:</strong> {visit.key_observation}</p>
                    <p className="text-sky-900"><strong>Action Required:</strong> {visit.action_required}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Checked: <strong className="text-slate-700">{visit.employees_checked} Guards</strong></span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    visit.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {visit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. UNIFORM, ID & STATUTORY (PF/ESI) COMPLIANCE                */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'compliance_statutory' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Uniform, ID Card &amp; Statutory (PF / ESI) Cockpit</h2>
              </div>
              <p className="text-xs text-slate-500">
                Field audit compliance ratios, exception tracking, UAN/KYC linkage, and ECR challan filing validations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Uniform & ID Audits */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Uniform &amp; ID Card Field Checks
              </h3>
              {hrUniformIdChecks.map((chk) => (
                <div key={chk.id} className="p-5 bg-white border border-sky-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{chk.site_name}</h4>
                      <p className="text-xs text-slate-500">{chk.client_name}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-500">{chk.audit_date}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 rounded-xl text-center text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Checked</span>
                      <strong className="text-slate-900">{chk.employees_checked}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Uniform %</span>
                      <strong className="text-emerald-700">{chk.uniform_compliance_pct}%</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">ID Card %</span>
                      <strong className="text-sky-700">{chk.id_compliance_pct}%</strong>
                    </div>
                  </div>

                  {chk.exceptions_list && chk.exceptions_list.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Exceptions Flagged:</span>
                      {chk.exceptions_list.map((ex, i) => (
                        <div key={i} className="p-2 bg-rose-50/60 border border-rose-200 rounded-lg text-[11px] flex items-center justify-between">
                          <div>
                            <strong className="text-slate-800">{ex.employee_name}</strong> ({ex.employee_id})
                            <span className="text-[10px] text-rose-800 block">{ex.exception_type}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold border border-rose-300 text-rose-700">
                            {ex.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* PF & ESI Statutory Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                PF &amp; ESI Statutory Compliance &amp; Exceptions
              </h3>
              {hrStatutoryRecords.map((stat) => (
                <div key={stat.id} className="p-5 bg-white border border-sky-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{stat.site_name}</h4>
                      <p className="text-xs text-slate-500">{stat.client_name} • {stat.period}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        stat.pf_status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        PF: {stat.pf_status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        stat.esi_status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        ESI: {stat.esi_status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    Challan Filing: <strong>{stat.challan_filed_date}</strong> (ECR Generated: <strong className="text-emerald-700">{stat.ecr_generated ? 'Yes' : 'No'}</strong>)
                  </div>

                  {stat.exceptions_details && stat.exceptions_details.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Statutory Exception Details:</span>
                      {stat.exceptions_details.map((ex, idx) => (
                        <div key={idx} className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{ex.employee_name} ({ex.employee_id})</span>
                            <span className="text-rose-700">{ex.issue_type}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{ex.pending_action}</p>
                          <div className="text-[10px] text-slate-500 font-mono">Target Date: {ex.due_date} • Status: {ex.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. IT MASTER DATA DEFINITIONS DICTIONARY                      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'it_definitions' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">IT Master Data Definitions Dictionary</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              <strong>Rule for IT:</strong> Every HR input and KPI must have an immutable data definition detailing its source system, functional owner, refresh frequency, calculation logic, validation status, and drill-down path. This prevents the dashboard from becoming a collection of unverified manually entered numbers.
            </p>
          </div>

          <div className="bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-50/60 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3.5">Metric Name</th>
                  <th className="p-3.5">Group</th>
                  <th className="p-3.5">Source System</th>
                  <th className="p-3.5">Functional Owner</th>
                  <th className="p-3.5">Frequency</th>
                  <th className="p-3.5">Calculation Formula &amp; Logic</th>
                  <th className="p-3.5">Drill-Down Path</th>
                  <th className="p-3.5">Target Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {hrDataDefinitions.map((def) => (
                  <tr key={def.id} className="hover:bg-sky-50/40 transition">
                    <td className="p-3.5 font-bold text-slate-900">{def.metric_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        {def.functional_group}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{def.source_system}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{def.owner}</td>
                    <td className="p-3.5 font-mono text-slate-600">{def.frequency}</td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-[280px]">{def.calculation_logic}</td>
                    <td className="p-3.5 font-mono text-[11px] text-sky-800">{def.drill_down_path}</td>
                    <td className="p-3.5 text-emerald-700 font-bold text-[11px]">{def.target_benchmark || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. LEGACY SUBTABS (STAFF DIRECTORY, LEAVES, DISCIPLINARY, TASKS)*/}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add / Edit Employee File</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!empForm.name || !empForm.employee_id) return;
              let updated = [...state.employees];
              const isEdit = !!editingId;
              const empId = editingId || `EMP-${Date.now()}`;
              const newEmp: Employee = {
                id: empId,
                name: empForm.name,
                employee_id: empForm.employee_id,
                department: empForm.department || 'Operations',
                site_id: empForm.site_id || 'S-201',
                doj: empForm.doj || new Date().toISOString().split('T')[0],
                vacancy_status: empForm.vacancy_status as any || 'Filled',
                exit_status: empForm.exit_status as any || 'Active',
                remarks: empForm.remarks || ''
              };
              if (isEdit) {
                updated = updated.map(emp => emp.id === empId ? newEmp : emp);
                setEditingId(null);
              } else {
                updated.push(newEmp);
              }
              const nextState = { ...state, employees: updated };
              onUpdateState(nextState);
              setEmpForm({ name: '', employee_id: '', department: 'Operations', site_id: 'S-201', doj: '', vacancy_status: 'Filled', exit_status: 'Active', remarks: '' });
              triggerSuccess(`Staff profile saved!`);
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Employee Name</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Staff ID (Badge No.)</label>
                <input
                  type="text"
                  required
                  value={empForm.employee_id}
                  onChange={(e) => setEmpForm({ ...empForm, employee_id: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Department</label>
                <select
                  value={empForm.department}
                  onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounts">Finance &amp; Accounts</option>
                  <option value="Training & Development">Training &amp; Development</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Assigned Unit Site</label>
                <select
                  value={empForm.site_id}
                  onChange={(e) => setEmpForm({ ...empForm, site_id: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                >
                  {state.sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md">
                  <Check className="w-4 h-4" /> Save Employee File
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-sky-100 bg-sky-50/50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Active Staff Directory</h4>
              <span className="text-xs font-mono text-slate-500">{state.employees.length} Records</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-50/30 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Staff ID</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Site Unit</th>
                  <th className="p-3">DOJ</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {state.employees.map((emp) => {
                  const site = state.sites.find(s => s.id === emp.site_id);
                  return (
                    <tr key={emp.id} className="hover:bg-sky-50/40 transition">
                      <td className="p-3 font-bold text-slate-900">{emp.name}</td>
                      <td className="p-3 font-mono text-sky-800 font-bold">{emp.employee_id}</td>
                      <td className="p-3">{emp.department}</td>
                      <td className="p-3">{site ? site.name : emp.site_id}</td>
                      <td className="p-3 font-mono">{emp.doj}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          {emp.exit_status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const nextState = { ...state, employees: state.employees.filter(e => e.id !== emp.id) };
                            onUpdateState(nextState);
                            triggerSuccess('Record removed.');
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'leaves' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Pending Leave Requests</h3>
            <div className="space-y-3">
              {state.leaves.map((l) => {
                const emp = state.employees.find(e => e.id === l.employee_id);
                return (
                  <div key={l.id} className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <strong className="text-slate-900">{emp ? emp.name : l.employee_id}</strong>
                      <span className="text-xs text-slate-500 block">{l.type} • {l.start_date} to {l.end_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {l.status}
                      </span>
                      {l.status === 'Pending' && (
                        <button
                          onClick={() => {
                            const nextLeaves = state.leaves.map(item => item.id === l.id ? { ...item, status: 'Approved' as const } : item);
                            onUpdateState({ ...state, leaves: nextLeaves });
                            triggerSuccess('Leave approved!');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'disciplinary' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Compliance Incidents &amp; Disciplinary Cases</h3>
            <div className="space-y-3">
              {state.disciplinaryCases.map((dc) => {
                const emp = state.employees.find(e => e.id === dc.employee_id);
                return (
                  <div key={dc.id} className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <strong className="text-slate-900">{emp ? emp.name : dc.employee_id}</strong>
                      <span className="text-xs text-slate-600 block">{dc.type} • {dc.remarks}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Date: {dc.date}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      {dc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          {state.tasks.filter(t => t.department === 'Human Resources' || (t.assigned_to || '').toLowerCase().includes('hr')).map((task) => (
            <div key={task.id} className="p-5 bg-white border border-sky-200 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                  {task.priority} Priority
                </span>
                <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                <p className="text-xs text-slate-600">{task.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-sky-700">{task.percent_completed}%</span>
                <div className="text-[10px] text-slate-500">{task.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* INTERACTIVE DRILL-DOWN MODAL (CLICK ANY NUMBER)                */}
      {/* ============================================================= */}
      {drilldownModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-4xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-5 rounded-t-3xl flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-lg font-bold">{drilldownModal.title}</h3>
                <p className="text-xs text-sky-100 font-mono">Drill-Down Path: {drilldownModal.subtitle}</p>
              </div>
              <button 
                onClick={() => setDrilldownModal({ ...drilldownModal, isOpen: false })} 
                className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase">Underlying Hierarchical Records</span>
                <span className="text-xs font-mono text-sky-800 font-bold">{drilldownModal.data.length} Items Found</span>
              </div>

              <div className="space-y-3">
                {drilldownModal.data.map((item, idx) => (
                  <div key={idx} className="p-4 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-2 hover:bg-sky-50/80 transition">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-sm">{item.site_name || item.name || item.position_title || item.complaint_no}</strong>
                      <span className="text-xs font-mono text-sky-800 font-bold">{item.client_name || item.period}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.role || item.purpose || item.complaint_text || item.remarks || item.description}</p>
                    {item.details && item.details.length > 0 && (
                      <div className="pt-2 border-t border-sky-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Movement Logs:</span>
                        {item.details.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-[11px] p-1.5 bg-white rounded-lg border border-sky-100">
                            <span>{d.employee_name} ({d.employee_id})</span>
                            <span className="font-bold text-sky-700">{d.movement_type} • {d.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-sky-50/80 border-t border-sky-200 flex justify-end shrink-0">
              <button
                onClick={() => setDrilldownModal({ ...drilldownModal, isOpen: false })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Drill-Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: RECORD FIELD SITE VISIT                                */}
      {/* ============================================================= */}
      {isSiteVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-5 rounded-t-3xl flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-200" />
                <h3 className="text-lg font-bold">Record HR Field Site Visit &amp; Evidence</h3>
              </div>
              <button onClick={() => setIsSiteVisitModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSiteVisitSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Name *</label>
                  <select
                    value={siteVisitForm.client_name}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, client_name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Apex Property Holdings">Apex Property Holdings</option>
                    <option value="St. Jude Health System">St. Jude Health System</option>
                    <option value="OmniCorp Global HQ">OmniCorp Global HQ</option>
                    <option value="Northside Freight Logistics">Northside Freight Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Site / Unit Facility *</label>
                  <input
                    type="text"
                    required
                    value={siteVisitForm.site_name}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, site_name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">HR Representative</label>
                  <input
                    type="text"
                    required
                    value={siteVisitForm.hr_representative}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, hr_representative: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Visit Purpose</label>
                  <select
                    value={siteVisitForm.purpose}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, purpose: e.target.value as any })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Uniform & ID Audit">Uniform &amp; ID Audit</option>
                    <option value="Biometric Attendance Audit">Biometric Attendance Audit</option>
                    <option value="Grievance Redressal">Grievance Redressal</option>
                    <option value="Statutory PF/ESI Check">Statutory PF/ESI Check</option>
                    <option value="Induction & Drill">Induction &amp; Drill</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Observation *</label>
                <textarea
                  rows={2}
                  required
                  value={siteVisitForm.key_observation}
                  onChange={(e) => setSiteVisitForm({ ...siteVisitForm, key_observation: e.target.value })}
                  placeholder="Observed 40 guards in morning parade..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Action Required</label>
                <input
                  type="text"
                  value={siteVisitForm.action_required}
                  onChange={(e) => setSiteVisitForm({ ...siteVisitForm, action_required: e.target.value })}
                  placeholder="Issue 2 replacement belts..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employees Checked</label>
                  <input
                    type="number"
                    value={siteVisitForm.employees_checked}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, employees_checked: Number(e.target.value) })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Exceptions Found</label>
                  <input
                    type="number"
                    value={siteVisitForm.exceptions_found}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, exceptions_found: Number(e.target.value) })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsSiteVisitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Field Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE REQUISITION                                     */}
      {/* ============================================================= */}
      {isRequisitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-5 rounded-t-3xl flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-200" />
                <h3 className="text-lg font-bold">Create Talent Requisition &amp; Budget</h3>
              </div>
              <button onClick={() => setIsRequisitionModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequisitionSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Position Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CCTV Control Room Operator"
                    value={reqForm.position_title}
                    onChange={(e) => setReqForm({ ...reqForm, position_title: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Client / Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City General Hospital"
                    value={reqForm.site_name}
                    onChange={(e) => setReqForm({ ...reqForm, site_name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Open Count</label>
                  <input
                    type="number"
                    value={reqForm.open_count}
                    onChange={(e) => setReqForm({ ...reqForm, open_count: Number(e.target.value) })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Join Date</label>
                  <input
                    type="date"
                    value={reqForm.target_join_date}
                    onChange={(e) => setReqForm({ ...reqForm, target_join_date: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={reqForm.recruitment_cost_inr}
                    onChange={(e) => setReqForm({ ...reqForm, recruitment_cost_inr: Number(e.target.value) })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsRequisitionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: LOG CLIENT COMPLAINT                                   */}
      {/* ============================================================= */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-5 rounded-t-3xl flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-300" />
                <h3 className="text-lg font-bold">Log HR Client Complaint</h3>
              </div>
              <button onClick={() => setIsComplaintModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={complaintForm.client_name}
                    onChange={(e) => setComplaintForm({ ...complaintForm, client_name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Site / Unit Facility</label>
                  <input
                    type="text"
                    required
                    value={complaintForm.site_name}
                    onChange={(e) => setComplaintForm({ ...complaintForm, site_name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Complaint Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value as any })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="Absenteeism & Shortage">Absenteeism &amp; Shortage</option>
                  <option value="Grooming & Uniform">Grooming &amp; Uniform</option>
                  <option value="Behavior & Conduct">Behavior &amp; Conduct</option>
                  <option value="Statutory PF/ESI">Statutory PF/ESI</option>
                  <option value="Billing Dispute">Billing Dispute</option>
                  <option value="Replacement Delay">Replacement Delay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Complaint Description *</label>
                <textarea
                  rows={2}
                  required
                  value={complaintForm.complaint_text}
                  onChange={(e) => setComplaintForm({ ...complaintForm, complaint_text: e.target.value })}
                  placeholder="Client feedback details..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* EVIDENCE LIGHTBOX MODAL                                       */}
      {/* ============================================================= */}
      {isEvidenceModalOpen.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-sky-200 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">{isEvidenceModalOpen.title}</h3>
              </div>
              <button onClick={() => setIsEvidenceModalOpen({ isOpen: false, title: '' })} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEvidenceModalOpen.url ? (
              <div className="rounded-2xl overflow-hidden border border-sky-200 max-h-[400px] flex items-center justify-center bg-slate-100">
                <img 
                  src={isEvidenceModalOpen.url} 
                  alt={isEvidenceModalOpen.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] object-contain w-full"
                />
              </div>
            ) : (
              <div className="p-8 bg-sky-50 rounded-2xl border border-sky-200 text-center space-y-2">
                <FileText className="w-12 h-12 text-sky-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{isEvidenceModalOpen.title}</h4>
                <p className="text-xs text-slate-500">Verified Signed Attendance &amp; Field Audit Document</p>
              </div>
            )}

            {isEvidenceModalOpen.description && (
              <p className="text-xs text-slate-600 bg-sky-50 p-3 rounded-xl border border-sky-200">
                <strong>Details:</strong> {isEvidenceModalOpen.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* EXECUTIVE HD PORTRAIT MODAL                                   */}
      {/* ============================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-white relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>HR Head</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Human Resources Vertical
                    </span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Spoorthy Integrated Solutions • Executive HD Portrait</p>
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
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-black shadow-inner flex items-center justify-center min-h-[380px] max-h-[520px]">
              <img 
                src="/hr-head-profile.jpg" 
                alt="HR Head - Executive Portrait" 
                className="w-full max-h-[500px] object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/40 text-[9.5px] font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ORIGINAL HD • 1024 × 682</span>
              </div>
            </div>

            {/* Executive Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Designation</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">HR Head</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Department</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">Human Resources</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Workforce</div>
                <div className="font-bold text-amber-400 mt-0.5 truncate">{totalEmployeesCount.toLocaleString()} Active</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Compliance</div>
                <div className="font-bold text-emerald-400 mt-0.5 truncate">{uniformComplianceAvg}% OK</div>
              </div>
            </div>

            {/* Footer with Details & Download */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-slate-200 font-bold">Scope:</span> Workforce, Attendance, Statutory & Field Audits
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/hr-head-profile.jpg"
                  download="Spoorthy_HR_Head_Portrait_HD.jpg"
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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
