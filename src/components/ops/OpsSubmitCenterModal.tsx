import { useState, FormEvent } from 'react';
import { 
  AppState, OpsAttendanceRecord, OpsOvertimeRecord, 
  OpsSiteInspectionRecord, OpsClientComplaintRecord, 
  OpsSlaComplianceRecord, OpsUniformAvailabilityRecord, 
  OpsIdCardComplianceRecord, OpsEquipmentRecord 
} from '../../types';
import { logAuditEntry } from '../../data/store';
import { 
  X, CheckCircle, Users, Clock, ShieldCheck, 
  AlertCircle, Wrench, Camera, QrCode, FileText, 
  Check, Sparkles, AlertTriangle
} from 'lucide-react';

export type OpsSubmitType = 
  | 'attendance'
  | 'overtime'
  | 'inspection'
  | 'complaint'
  | 'sla'
  | 'uniform'
  | 'equipment';

interface OpsSubmitCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: OpsSubmitType;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
}

export function OpsSubmitCenterModal({
  isOpen,
  onClose,
  initialType = 'attendance',
  state,
  onUpdateState,
  currentUserEmail
}: OpsSubmitCenterModalProps) {
  const [activeType, setActiveType] = useState<OpsSubmitType>(initialType);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form states for each submission stream
  const [attForm, setAttForm] = useState({
    client_name: 'Metro Real Estate Group',
    site_name: 'Metro Office Complex (S-201)',
    service_type: 'Security Guarding' as const,
    category: 'Security Guards' as const,
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning' as const,
    required_manpower: 24,
    present_count: 23,
    absent_count: 1,
    relievers_required: 1,
    relievers_available: 1,
    shortage_reason: 'Transit delay on Ring Road',
    action_taken: 'Roving reliever deployed from South Pool'
  });

  const [otForm, setOtForm] = useState({
    client_name: 'St. Jude Health System',
    site_name: 'City General Hospital (S-202)',
    service_type: 'Housekeeping & Soft FM',
    category: 'Janitors & HK Staff',
    period: 'September 2026',
    ot_hours: 48,
    prior_period_ot_hours: 40,
    ot_rate_per_hr: 180,
    absentee_count: 6,
    reliever_gap: 3,
    operational_story: 'Hospital ICU deep sanitization overtime due to ward orderly absence and reliever shortage.',
    approved_by: 'Manoj Kumar (Operations Head)'
  });

  const [inspForm, setInspForm] = useState({
    inspector_name: 'Vikram Singh (Operations Manager)',
    inspector_role: 'Operations Area Manager',
    client_name: 'OmniCorp Tech Campus',
    site_name: 'Valley Tech Hub (S-203)',
    service: 'Integrated FM & Security',
    score_pct: 92,
    findings_observations: 'Perimeter patrolling gate 3 logbook verified. Uniform grooming 100%. Machinery operational.',
    action_required: 'Replace backup battery on handheld metal detector by Friday.',
    responsible_person: 'Suresh Patil (Site In-charge)',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'Completed' as const,
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80',
    photo_caption: 'Gate 3 perimeter access audit & log muster inspection'
  });

  const [complForm, setComplForm] = useState({
    ticket_no: `OPS-CC-${Math.floor(100 + Math.random() * 900)}`,
    client_name: 'St. Jude Health System',
    site_name: 'City General Hospital (S-202)',
    service: 'Housekeeping',
    complaint_category: 'Service Quality' as const,
    description: 'Delayed response to urgent OT linen transport during night changeover.',
    complaint_owner: 'Pooja Hegde (Assistant Ops Manager)',
    action_plan: 'Dedicated orderly assigned exclusively to emergency floor during shift transit.',
    status: 'Open' as const,
    target_closure_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    source_system: 'OpsVision App' as const
  });

  const [slaForm, setSlaForm] = useState({
    period: 'September 2026',
    client_name: 'OmniCorp Tech Campus',
    site_name: 'Valley Tech Hub (S-203)',
    service_type: 'Security Services & Access Management',
    area_name: 'Tower B Main Lobby & Visitor Reception',
    sla_target_pct: 98,
    sla_achieved_pct: 96.5,
    status: 'Compliant' as const,
    breach_count: 0,
    total_tasks_monitored: 120,
    tasks_passed: 116,
    tasks_failed: 4,
    ops_vision_ref: `OPSV-TASK-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [equipForm, setEquipForm] = useState({
    equipment_code: `EQ-OPS-${Math.floor(100 + Math.random() * 900)}`,
    machine_name: 'Taski Swingo 1650 Ride-On Scrubber',
    category: 'Housekeeping Heavy Machine' as const,
    client_name: 'Metro Real Estate Group',
    site_name: 'Metro Office Complex (S-201)',
    status: 'Under Repair' as const,
    issue_description: 'Squeegee suction motor winding failure. Spare ordered with Taski AMC vendor.',
    service_partner_vendor: 'Apex Fleet Maintenance',
    action_required: 'Fit replacement rotor and commission for baseline floor sanitization.',
    expected_operational_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    amc_status: 'Active' as const,
    is_critical_for_sla: true
  });

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
      onClose();
    }, 1500);
  };

  // Submit Handlers
  const handleAttendanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    const totalReq = Number(attForm.required_manpower) || 1;
    const totalPres = Number(attForm.present_count) || 0;
    const totalAbs = Number(attForm.absent_count) || 0;
    const attnRate = Math.min(100, Math.round((totalPres / totalReq) * 1000) / 10);
    const absPct = Math.max(0, Math.round((totalAbs / totalReq) * 1000) / 10);
    const relReq = Number(attForm.relievers_required) || 0;
    const relAvail = Number(attForm.relievers_available) || 0;
    const relShortage = Math.max(0, relReq - relAvail);
    const netShortage = Math.max(0, totalReq - totalPres);

    const newRecord: OpsAttendanceRecord = {
      id: `OAR-${Date.now()}`,
      client_id: 'C-001',
      client_name: attForm.client_name,
      site_id: 'S-201',
      site_name: attForm.site_name,
      service_type: attForm.service_type,
      category: attForm.category,
      date: attForm.date,
      shift: attForm.shift,
      required_manpower: totalReq,
      present_count: totalPres,
      absent_count: totalAbs,
      attendance_pct: attnRate,
      absenteeism_pct: absPct,
      relievers_required: relReq,
      relievers_available: relAvail,
      reliever_shortage: relShortage,
      net_shortage: netShortage,
      status: netShortage > 2 ? 'Critical Shortage' : netShortage > 0 ? 'Shortage' : 'Normal',
      shortage_reason: attForm.shortage_reason,
      action_taken: attForm.action_taken
    };

    const nextList = [newRecord, ...(state.opsAttendanceRecords || [])];
    const nextState = { ...state, opsAttendanceRecords: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsAttendanceRecord', newRecord.id, 'Submitted site attendance & reliever report');
    onUpdateState(nextState);
    triggerSuccess('Site Attendance & Reliever log recorded successfully!');
  };

  const handleOvertimeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hours = Number(otForm.ot_hours) || 0;
    const rate = Number(otForm.ot_rate_per_hr) || 150;
    const totalCost = hours * rate;
    const costLakhs = Math.round((totalCost / 100000) * 100) / 100;
    const prior = Number(otForm.prior_period_ot_hours) || 0;
    const varHours = hours - prior;
    const varPct = prior > 0 ? Math.round(((hours - prior) / prior) * 100) : 0;

    const newRecord: OpsOvertimeRecord = {
      id: `OOT-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      client_id: 'C-002',
      client_name: otForm.client_name,
      site_id: 'S-202',
      site_name: otForm.site_name,
      service_type: otForm.service_type,
      category: otForm.category,
      period: otForm.period,
      ot_hours: hours,
      prior_period_ot_hours: prior,
      variance_hours: varHours,
      variance_pct: varPct,
      ot_rate_per_hr: rate,
      total_ot_cost: totalCost,
      total_ot_cost_lakhs: costLakhs,
      causal_chain: {
        absentee_count: Number(otForm.absentee_count) || 0,
        reliever_gap: Number(otForm.reliever_gap) || 0,
        driven_ot_hours: hours,
        ot_cost_incurred: totalCost
      },
      operational_story: otForm.operational_story,
      is_significant_exception: hours > 40,
      approved_by: otForm.approved_by
    };

    const nextList = [newRecord, ...(state.opsOvertimeRecords || [])];
    const nextState = { ...state, opsOvertimeRecords: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsOvertimeRecord', newRecord.id, 'Logged overtime & cost causality record');
    onUpdateState(nextState);
    triggerSuccess('Overtime & Cost causality record submitted!');
  };

  const handleInspectionSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newRecord: OpsSiteInspectionRecord = {
      id: `OIR-${Date.now()}`,
      inspection_code: `INSP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      planned_date: new Date().toISOString().split('T')[0],
      actual_inspection_date: new Date().toISOString().split('T')[0],
      inspector_name: inspForm.inspector_name,
      inspector_role: inspForm.inspector_role,
      client_id: 'C-003',
      client_name: inspForm.client_name,
      site_id: 'S-203',
      site_name: inspForm.site_name,
      service: inspForm.service,
      score_pct: Number(inspForm.score_pct) || 90,
      findings_observations: inspForm.findings_observations,
      action_required: inspForm.action_required,
      responsible_person: inspForm.responsible_person,
      due_date: inspForm.due_date,
      status: inspForm.status,
      qr_scan_verified: true,
      qr_timestamp: new Date().toLocaleTimeString(),
      evidence_photos: [
        {
          url: inspForm.photo_url,
          caption: inspForm.photo_caption,
          timestamp: new Date().toLocaleString(),
          is_before_after: false,
          tag: 'Post Guard'
        }
      ],
      checklist_items: [
        { item: 'Staff Uniform & ID Card In-Place', passed: true },
        { item: 'Attendance Muster Verified with Biometric Scan', passed: true },
        { item: 'Duty Post Alertness & Equipment Operability', passed: true }
      ]
    };

    const nextList = [newRecord, ...(state.opsSiteInspections || [])];
    const nextState = { ...state, opsSiteInspections: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsSiteInspectionRecord', newRecord.id, 'Submitted site audit inspection with photos');
    onUpdateState(nextState);
    triggerSuccess('Site Inspection audit recorded with evidence photos!');
  };

  const handleComplaintSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newRecord: OpsClientComplaintRecord = {
      id: `OCC-${Date.now()}`,
      ticket_no: complForm.ticket_no,
      date_received: new Date().toISOString().split('T')[0],
      client_id: 'C-002',
      client_name: complForm.client_name,
      site_id: 'S-202',
      site_name: complForm.site_name,
      service: complForm.service,
      complaint_category: complForm.complaint_category,
      description: complForm.description,
      complaint_owner: complForm.complaint_owner,
      action_plan: complForm.action_plan,
      status: complForm.status,
      target_closure_date: complForm.target_closure_date,
      source_system: complForm.source_system,
      is_overdue: false
    };

    const nextList = [newRecord, ...(state.opsClientComplaints || [])];
    const nextState = { ...state, opsClientComplaints: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsClientComplaintRecord', newRecord.id, 'Logged client grievance ticket in OpsVision center');
    onUpdateState(nextState);
    triggerSuccess('Client complaint logged and SLA owner assigned!');
  };

  const handleSlaSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = Number(slaForm.sla_target_pct) || 98;
    const achieved = Number(slaForm.sla_achieved_pct) || 95;
    const status = achieved >= target ? 'Compliant' : achieved >= 90 ? 'At Risk' : 'Breached';

    const newRecord: OpsSlaComplianceRecord = {
      id: `OSLA-${Date.now()}`,
      period: slaForm.period,
      client_id: 'C-003',
      client_name: slaForm.client_name,
      site_id: 'S-203',
      site_name: slaForm.site_name,
      service_type: slaForm.service_type,
      area_name: slaForm.area_name,
      sla_target_pct: target,
      sla_achieved_pct: achieved,
      status: status as any,
      is_critical_recurring: status === 'Breached',
      breach_count: Number(slaForm.breach_count) || 0,
      total_tasks_monitored: Number(slaForm.total_tasks_monitored) || 100,
      tasks_passed: Number(slaForm.tasks_passed) || 95,
      tasks_failed: Number(slaForm.tasks_failed) || 5,
      ops_vision_ref: slaForm.ops_vision_ref,
      underlying_tasks: [
        {
          task_id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
          task_name: 'Hourly Lobby Visitor & Baggage Scanner Check',
          qr_code_location: `${slaForm.area_name} - QR-01`,
          scan_time: new Date().toLocaleTimeString(),
          officer_name: 'Suresh Patil',
          passed: true,
          checklist_summary: 'All 8 checkpoint items passed'
        }
      ]
    };

    const nextList = [newRecord, ...(state.opsSlaCompliances || [])];
    const nextState = { ...state, opsSlaCompliances: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsSlaComplianceRecord', newRecord.id, 'Submitted SLA performance checklist');
    onUpdateState(nextState);
    triggerSuccess('SLA compliance record and OpsVision task verified!');
  };

  const handleEquipmentSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newRecord: OpsEquipmentRecord = {
      id: `OEQ-${Date.now()}`,
      equipment_code: equipForm.equipment_code,
      machine_name: equipForm.machine_name,
      category: equipForm.category,
      client_id: 'C-001',
      client_name: equipForm.client_name,
      site_id: 'S-201',
      site_name: equipForm.site_name,
      status: equipForm.status,
      issue_description: equipForm.issue_description,
      breakdown_date: new Date().toISOString().split('T')[0],
      service_partner_vendor: equipForm.service_partner_vendor,
      action_required: equipForm.action_required,
      expected_operational_date: equipForm.expected_operational_date,
      amc_status: equipForm.amc_status,
      is_critical_for_sla: equipForm.is_critical_for_sla
    };

    const nextList = [newRecord, ...(state.opsEquipmentRecords || [])];
    const nextState = { ...state, opsEquipmentRecords: nextList };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'OpsEquipmentRecord', newRecord.id, 'Logged equipment breakdown/maintenance status');
    onUpdateState(nextState);
    triggerSuccess('Machinery & Equipment status updated successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-card to-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Operations Submit Center</h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold rounded-full border border-rose-300 dark:border-rose-800">
                  Field to CEO Stream
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Direct entry point for field supervisors &amp; ops managers to feed the 5 practical blocks of the CEO Dashboard
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-muted/40 border-b border-border overflow-x-auto text-xs">
          {[
            { id: 'attendance', label: '1. Manpower & Attendance', icon: Users },
            { id: 'overtime', label: '2. OT & Cost Causality', icon: Clock },
            { id: 'inspection', label: '3. Site Inspection & Photos', icon: Camera },
            { id: 'complaint', label: '4. Client Complaint Ticket', icon: AlertCircle },
            { id: 'sla', label: '5. SLA & QR Checklist', icon: ShieldCheck },
            { id: 'equipment', label: '6. Machinery & Equipment', icon: Wrench },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id as OpsSubmitType)}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
                  active 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* 1. Manpower & Attendance Form */}
          {activeType === 'attendance' && (
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Block 1: Manpower &amp; Site Attendance Submission
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Captures workforce availability, absenteeism, and reliever gaps. Feeds the CEO Manpower KPI &amp; Shortage Spotter.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={attForm.client_name}
                    onChange={e => setAttForm({ ...attForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Location</label>
                  <input
                    type="text"
                    required
                    value={attForm.site_name}
                    onChange={e => setAttForm({ ...attForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Service Type</label>
                  <select
                    value={attForm.service_type}
                    onChange={e => setAttForm({ ...attForm, service_type: e.target.value as any })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="Security Guarding">Security Guarding</option>
                    <option value="Housekeeping & Soft FM">Housekeeping & Soft FM</option>
                    <option value="Technical / MEP">Technical / MEP</option>
                    <option value="Pest Control & Specialized">Pest Control & Specialized</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Staff Category</label>
                  <select
                    value={attForm.category}
                    onChange={e => setAttForm({ ...attForm, category: e.target.value as any })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="Security Guards">Security Guards</option>
                    <option value="Supervisors & Head Guards">Supervisors & Head Guards</option>
                    <option value="Janitors & HK Staff">Janitors & HK Staff</option>
                    <option value="Technicians & Operators">Technicians & Operators</option>
                    <option value="Armed Security">Armed Security</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Shift &amp; Date</label>
                  <input
                    type="date"
                    required
                    value={attForm.date}
                    onChange={e => setAttForm({ ...attForm, date: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Required Manpower</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={attForm.required_manpower}
                    onChange={e => setAttForm({ ...attForm, required_manpower: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Present Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={attForm.present_count}
                    onChange={e => setAttForm({ ...attForm, present_count: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Absent Count</label>
                  <input
                    type="number"
                    min="0"
                    value={attForm.absent_count}
                    onChange={e => setAttForm({ ...attForm, absent_count: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-rose-600 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Relievers Required</label>
                  <input
                    type="number"
                    min="0"
                    value={attForm.relievers_required}
                    onChange={e => setAttForm({ ...attForm, relievers_required: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Relievers Available</label>
                  <input
                    type="number"
                    min="0"
                    value={attForm.relievers_available}
                    onChange={e => setAttForm({ ...attForm, relievers_available: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Shortage Reason</label>
                  <input
                    type="text"
                    value={attForm.shortage_reason}
                    onChange={e => setAttForm({ ...attForm, shortage_reason: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground">Action Taken / Reliever Notes</label>
                  <input
                    type="text"
                    value={attForm.action_taken}
                    onChange={e => setAttForm({ ...attForm, action_taken: e.target.value })}
                    placeholder="e.g. Reliever mobilized from reserve pool"
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Attendance Record</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Overtime & Cost Form */}
          {activeType === 'overtime' && (
            <form onSubmit={handleOvertimeSubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Block 2: Overtime &amp; Cost Causality Entry
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Connects Absenteeism → Reliever Availability Gap → OT Hours → Financial Cost (₹ Lakhs).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={otForm.client_name}
                    onChange={e => setOtForm({ ...otForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Name</label>
                  <input
                    type="text"
                    required
                    value={otForm.site_name}
                    onChange={e => setOtForm({ ...otForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Billing Period</label>
                  <input
                    type="text"
                    value={otForm.period}
                    onChange={e => setOtForm({ ...otForm, period: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Total OT Hours Incurred</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={otForm.ot_hours}
                    onChange={e => setOtForm({ ...otForm, ot_hours: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Prior Period OT Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={otForm.prior_period_ot_hours}
                    onChange={e => setOtForm({ ...otForm, prior_period_ot_hours: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">OT Rate per Hour (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={otForm.ot_rate_per_hr}
                    onChange={e => setOtForm({ ...otForm, ot_rate_per_hr: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Absentee Shift Count</label>
                  <input
                    type="number"
                    min="0"
                    value={otForm.absentee_count}
                    onChange={e => setOtForm({ ...otForm, absentee_count: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Reliever Shortfall Gap</label>
                  <input
                    type="number"
                    min="0"
                    value={otForm.reliever_gap}
                    onChange={e => setOtForm({ ...otForm, reliever_gap: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Authorized Approver</label>
                  <input
                    type="text"
                    value={otForm.approved_by}
                    onChange={e => setOtForm({ ...otForm, approved_by: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Operational Causality Story</label>
                  <textarea
                    rows={2}
                    required
                    value={otForm.operational_story}
                    onChange={e => setOtForm({ ...otForm, operational_story: e.target.value })}
                    placeholder="Explain the causal chain: why did absence/gap lead to OT?"
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Overtime Entry</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. Site Inspection Form with Evidence Photos */}
          {activeType === 'inspection' && (
            <form onSubmit={handleInspectionSubmit} className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Block 3: Site Inspection Audit &amp; Evidence Submission
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Planned vs Completed model. Record officer observations, action plans, deadlines, and geotagged photographic proof.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Inspector Officer Name</label>
                  <input
                    type="text"
                    required
                    value={inspForm.inspector_name}
                    onChange={e => setInspForm({ ...inspForm, inspector_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={inspForm.client_name}
                    onChange={e => setInspForm({ ...inspForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Location</label>
                  <input
                    type="text"
                    required
                    value={inspForm.site_name}
                    onChange={e => setInspForm({ ...inspForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Audit Quality Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={inspForm.score_pct}
                    onChange={e => setInspForm({ ...inspForm, score_pct: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Responsible Person</label>
                  <input
                    type="text"
                    required
                    value={inspForm.responsible_person}
                    onChange={e => setInspForm({ ...inspForm, responsible_person: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Action Due Date</label>
                  <input
                    type="date"
                    required
                    value={inspForm.due_date}
                    onChange={e => setInspForm({ ...inspForm, due_date: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Findings &amp; Key Observations</label>
                  <textarea
                    rows={2}
                    required
                    value={inspForm.findings_observations}
                    onChange={e => setInspForm({ ...inspForm, findings_observations: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Action Required &amp; Corrective Plan</label>
                  <textarea
                    rows={2}
                    required
                    value={inspForm.action_required}
                    onChange={e => setInspForm({ ...inspForm, action_required: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground">Evidence Photo URL</label>
                  <input
                    type="url"
                    value={inspForm.photo_url}
                    onChange={e => setInspForm({ ...inspForm, photo_url: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Photo Caption</label>
                  <input
                    type="text"
                    value={inspForm.photo_caption}
                    onChange={e => setInspForm({ ...inspForm, photo_caption: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Inspection Audit</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. Client Complaint Ticket Form */}
          {activeType === 'complaint' && (
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Block 4: Client Complaint &amp; SLA Owner Assignment
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Synchronized with OpsVision ticket feed to maintain single source of truth and track closure ratio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Ticket No</label>
                  <input
                    type="text"
                    required
                    value={complForm.ticket_no}
                    onChange={e => setComplForm({ ...complForm, ticket_no: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={complForm.client_name}
                    onChange={e => setComplForm({ ...complForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Name</label>
                  <input
                    type="text"
                    required
                    value={complForm.site_name}
                    onChange={e => setComplForm({ ...complForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Complaint Category</label>
                  <select
                    value={complForm.complaint_category}
                    onChange={e => setComplForm({ ...complForm, complaint_category: e.target.value as any })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="Service Quality">Service Quality</option>
                    <option value="Manpower Shortage">Manpower Shortage</option>
                    <option value="Grooming / Uniform">Grooming / Uniform</option>
                    <option value="Behavior / Conduct">Behavior / Conduct</option>
                    <option value="Machine / Material">Machine / Material</option>
                    <option value="Night Patrolling">Night Patrolling</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Assigned Complaint Owner</label>
                  <input
                    type="text"
                    required
                    value={complForm.complaint_owner}
                    onChange={e => setComplForm({ ...complForm, complaint_owner: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Target Closure Date</label>
                  <input
                    type="date"
                    required
                    value={complForm.target_closure_date}
                    onChange={e => setComplForm({ ...complForm, target_closure_date: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Complaint Description</label>
                  <textarea
                    rows={2}
                    required
                    value={complForm.description}
                    onChange={e => setComplForm({ ...complForm, description: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Immediate Action Plan</label>
                  <textarea
                    rows={2}
                    required
                    value={complForm.action_plan}
                    onChange={e => setComplForm({ ...complForm, action_plan: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Complaint Ticket</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. SLA & QR Checklist Form */}
          {activeType === 'sla' && (
            <form onSubmit={handleSlaSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Block 5: SLA Compliance &amp; OpsVision Telemetry Entry
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Connects management SLA score with underlying task, QR scan geofence, and digital FM checklist verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={slaForm.client_name}
                    onChange={e => setSlaForm({ ...slaForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Location</label>
                  <input
                    type="text"
                    required
                    value={slaForm.site_name}
                    onChange={e => setSlaForm({ ...slaForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Monitored Zone / Area</label>
                  <input
                    type="text"
                    required
                    value={slaForm.area_name}
                    onChange={e => setSlaForm({ ...slaForm, area_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">SLA Target (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={slaForm.sla_target_pct}
                    onChange={e => setSlaForm({ ...slaForm, sla_target_pct: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">SLA Achieved (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={slaForm.sla_achieved_pct}
                    onChange={e => setSlaForm({ ...slaForm, sla_achieved_pct: Number(e.target.value) })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">OpsVision Task Ref ID</label>
                  <input
                    type="text"
                    value={slaForm.ops_vision_ref}
                    onChange={e => setSlaForm({ ...slaForm, ops_vision_ref: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit SLA Check</span>
                </button>
              </div>
            </form>
          )}

          {/* 6. Machinery & Equipment Breakdown Form */}
          {activeType === 'equipment' && (
            <form onSubmit={handleEquipmentSubmit} className="space-y-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1">
                <h4 className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  Block 6: Machinery Breakdown &amp; Maintenance Log
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Tracks heavy machinery uptime (Available, Under Repair, Required) to prevent operational bottlenecks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Machine / Asset Code</label>
                  <input
                    type="text"
                    required
                    value={equipForm.equipment_code}
                    onChange={e => setEquipForm({ ...equipForm, equipment_code: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Machine Name</label>
                  <input
                    type="text"
                    required
                    value={equipForm.machine_name}
                    onChange={e => setEquipForm({ ...equipForm, machine_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Current Status</label>
                  <select
                    value={equipForm.status}
                    onChange={e => setEquipForm({ ...equipForm, status: e.target.value as any })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-bold"
                  >
                    <option value="Available">Available &amp; Running</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Unavailable">Unavailable / Down</option>
                    <option value="Required">Required at Site</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={equipForm.client_name}
                    onChange={e => setEquipForm({ ...equipForm, client_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Site Location</label>
                  <input
                    type="text"
                    required
                    value={equipForm.site_name}
                    onChange={e => setEquipForm({ ...equipForm, site_name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Expected Ready Date</label>
                  <input
                    type="date"
                    value={equipForm.expected_operational_date}
                    onChange={e => setEquipForm({ ...equipForm, expected_operational_date: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Issue &amp; Breakdown Diagnosis</label>
                  <textarea
                    rows={2}
                    required
                    value={equipForm.issue_description}
                    onChange={e => setEquipForm({ ...equipForm, issue_description: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="font-bold text-muted-foreground">Action Required with AMC Vendor</label>
                  <textarea
                    rows={2}
                    required
                    value={equipForm.action_required}
                    onChange={e => setEquipForm({ ...equipForm, action_required: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Equipment Log</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
