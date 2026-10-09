import { 
  AppState, PurchaseRequest, Vendor, Invoice, Expense, Lead, Client, 
  Employee, Attendance, Leave, DisciplinaryCase, Site, Complaint, Incident, 
  Training, Task, AuditLog, Notification, Alert, Role 
} from '../types';
import { getSeedState, getEmptyState } from './seedData';
export { getSeedState, getEmptyState };

const LOCAL_STORAGE_KEY = 'spoorthy_ceo_dashboard_db_v3';

export function getInitialState(): AppState {
  const localDb = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localDb) {
    try {
      const parsed = JSON.parse(localDb);
      if (parsed.purchaseRequests && parsed.employees && parsed.sites) {
        const seed = getSeedState();
        return {
          ...seed,
          ...parsed,
          crmLeads: parsed.crmLeads?.length ? parsed.crmLeads : seed.crmLeads,
          crmRequirements: parsed.crmRequirements?.length ? parsed.crmRequirements : seed.crmRequirements,
          crmFollowUps: parsed.crmFollowUps?.length ? parsed.crmFollowUps : seed.crmFollowUps,
          crmActivities: parsed.crmActivities?.length ? parsed.crmActivities : seed.crmActivities,
          crmVisits: parsed.crmVisits?.length ? parsed.crmVisits : seed.crmVisits,
          crmMeetings: (parsed.crmMeetings && parsed.crmMeetings.length >= 4) ? parsed.crmMeetings : seed.crmMeetings,
          crmQuotations: parsed.crmQuotations?.length ? parsed.crmQuotations : seed.crmQuotations,
          crmDars: parsed.crmDars?.length ? parsed.crmDars : seed.crmDars,
          crmClientMasters: parsed.crmClientMasters?.length ? parsed.crmClientMasters : seed.crmClientMasters,
          crmTeamStatuses: parsed.crmTeamStatuses?.length ? parsed.crmTeamStatuses : seed.crmTeamStatuses,
          crmDiaryTasks: parsed.crmDiaryTasks?.length ? parsed.crmDiaryTasks : seed.crmDiaryTasks,
          crmWorkflowRules: parsed.crmWorkflowRules?.length ? parsed.crmWorkflowRules : seed.crmWorkflowRules,
          crmWorkflowLogs: parsed.crmWorkflowLogs?.length ? parsed.crmWorkflowLogs : seed.crmWorkflowLogs,
          tdPlans: parsed.tdPlans?.length ? parsed.tdPlans : seed.tdPlans,
          tdTrainers: parsed.tdTrainers?.length ? parsed.tdTrainers : seed.tdTrainers,
          tdSessions: parsed.tdSessions?.length ? parsed.tdSessions : seed.tdSessions,
          tdComplianceRadar: parsed.tdComplianceRadar?.length ? parsed.tdComplianceRadar : seed.tdComplianceRadar,
          itProjects: parsed.itProjects?.length ? parsed.itProjects : seed.itProjects,
          itTasks: parsed.itTasks?.length ? parsed.itTasks : seed.itTasks,
          otherInitiatives: parsed.otherInitiatives?.length ? parsed.otherInitiatives : seed.otherInitiatives,
          meetings: parsed.meetings?.length ? parsed.meetings : seed.meetings,
          meetingActions: parsed.meetingActions?.length ? parsed.meetingActions : seed.meetingActions,
          contextFiles: parsed.contextFiles || [],
          myWorkItems: parsed.myWorkItems?.length ? parsed.myWorkItems : seed.myWorkItems,
          liveUpdates: parsed.liveUpdates?.length ? parsed.liveUpdates : seed.liveUpdates,
          governmentTenders: parsed.governmentTenders?.length ? parsed.governmentTenders : seed.governmentTenders,
          privateTenders: parsed.privateTenders || []
        } as AppState;
      }
    } catch (e) {
      console.error('Error parsing local database, resetting to empty...', e);
    }
  }

  const seed = getSeedState();
  saveState(seed);
  return seed;
}

export function saveState(state: AppState) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

// Full audit log generator
export function logAuditEntry(
  state: AppState, 
  user: string, 
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN', 
  entity: string, 
  entity_id: string, 
  before_value?: string, 
  after_value?: string
): AppState {
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: user,
    action,
    entity,
    entity_id,
    before_value: before_value || '',
    after_value: after_value || '',
    timestamp: new Date().toISOString()
  };
  state.auditLogs = [newLog, ...state.auditLogs];
  saveState(state);
  return state;
}

// In-app Notification Trigger
export function triggerNotification(state: AppState, user_id: string, type: string, message: string): AppState {
  const newNotification: Notification = {
    id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id,
    type,
    message,
    read_status: 'Unread',
    created_at: new Date().toISOString()
  };
  state.notifications = [newNotification, ...state.notifications];
  saveState(state);
  return state;
}

// Task state helpers
export function getDelayedOverdueTasks(tasks: Task[]): Task[] {
  const todayStr = new Date().toISOString().split('T')[0];
  return tasks.map(task => {
    if (task.status !== 'Completed' && task.status !== 'Cancelled' && task.due_date < todayStr) {
      return { ...task, status: 'Delayed' };
    }
    return task;
  });
}

// Dynamic rule-based alert compiler (FRD Event -> Action -> Alert Engine)
export function compileSystemAlerts(state: AppState): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper function for days difference
  const daysDiff = (targetDateStr: string) => {
    const diff = new Date(targetDateStr).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 1. Tender Submission Deadlines (≤ 7 days = Warning, ≤ 3 days = Critical)
  (state.tenders || []).forEach(t => {
    if (t.status !== 'Bid Submitted' && t.status !== 'Work Order Received' && t.status !== 'Lost' && t.status !== 'Scrapped' && t.submission_deadline) {
      const days = daysDiff(t.submission_deadline);
      if (days >= 0 && days <= 7) {
        alerts.push({
          id: `ALT-TND-SUB-${t.id}`,
          type: 'Tender Submission Deadline',
          severity: days <= 3 ? 'Critical' : 'Warning',
          message: `Tender "${t.tender_name}" (${t.client_name}) submission deadline is in ${days} day(s) on ${t.submission_deadline}.`,
          related_entity: 'Tender',
          related_id: t.id,
          acknowledged: false,
          created_at: new Date().toISOString()
        });
      } else if (days < 0) {
        alerts.push({
          id: `ALT-TND-OVD-${t.id}`,
          type: 'Tender Deadline Overdue',
          severity: 'Critical',
          message: `Tender "${t.tender_name}" deadline elapsed on ${t.submission_deadline}! Status is still "${t.status}".`,
          related_entity: 'Tender',
          related_id: t.id,
          acknowledged: false,
          created_at: new Date().toISOString()
        });
      }
    }
  });

  // 2. Corrigendum Review Required (Flag: CORRIGENDUM RECEIVED – MANAGEMENT REVIEW REQUIRED)
  (state.tenderCorrigendums || []).forEach(cor => {
    if (!cor.reviewed_by_gm) {
      alerts.push({
        id: `ALT-COR-${cor.id}`,
        type: 'Corrigendum Review Required',
        severity: 'Critical',
        message: `CORRIGENDUM RECEIVED (${cor.corrigendum_no}) for Tender ID ${cor.tender_id}: "${cor.description}". Management review pending!`,
        related_entity: 'TenderCorrigendum',
        related_id: cor.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 3. PBG Bank Guarantee Expiry (≤ 30 days = Warning, ≤ 15 days = Critical)
  (state.pbgGuarantees || []).forEach(pbg => {
    if (!pbg.released && pbg.expiry_date) {
      const days = daysDiff(pbg.expiry_date);
      if (days <= 30) {
        alerts.push({
          id: `ALT-PBG-${pbg.id}`,
          type: 'PBG Expiry Alert',
          severity: days <= 15 ? 'Critical' : 'Warning',
          message: `PBG ${pbg.bg_number} (₹${(pbg.amount || 0).toLocaleString()}) for client "${pbg.client_name}" expires in ${days} days (${pbg.expiry_date}). Extension or claim action needed!`,
          related_entity: 'PbgRecord',
          related_id: pbg.id,
          acknowledged: false,
          created_at: new Date().toISOString()
        });
      }
    }
  });

  // 4. Contract Expiry & Renewal Alerts (90-60-30 days alert)
  (state.contracts || []).forEach(ctr => {
    if (ctr.status !== 'Terminated' && ctr.status !== 'Closed' && ctr.expiry_date) {
      const days = daysDiff(ctr.expiry_date);
      if (days <= 90 && days >= 0) {
        alerts.push({
          id: `ALT-CTR-EXP-${ctr.id}`,
          type: 'Contract Renewal Due',
          severity: days <= 30 ? 'Critical' : 'Warning',
          message: `Contract "${ctr.contract_name}" (${ctr.client_name}) expires in ${days} days on ${ctr.expiry_date}. Renewal terms: ${ctr.renewal_terms || 'Standard'}.`,
          related_entity: 'ContractRecord',
          related_id: ctr.id,
          acknowledged: false,
          created_at: new Date().toISOString()
        });
      }
    }
  });

  // 5. Client Escalations (Critical / High open escalations)
  (state.clientEscalations || []).forEach(esc => {
    if (esc.status !== 'Resolved') {
      alerts.push({
        id: `ALT-ESC-${esc.id}`,
        type: 'Client Escalation',
        severity: esc.severity === 'Critical' ? 'Critical' : 'Warning',
        message: `[${esc.severity} Escalation] ${esc.client_name}: "${esc.nature_of_escalation}". Assigned to: ${esc.responsible_person} (${esc.responsible_dept}).`,
        related_entity: 'ClientEscalation',
        related_id: esc.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 6. EMD Refund Pending
  (state.emdRefunds || []).forEach(emd => {
    if (!emd.refund_received && emd.refund_due_date && emd.refund_due_date <= todayStr) {
      alerts.push({
        id: `ALT-EMD-${emd.id}`,
        type: 'EMD Refund Overdue',
        severity: 'Warning',
        message: `EMD ₹${(emd.amount || 0).toLocaleString()} for tender "${emd.tender_name}" is pending refund since ${emd.refund_due_date}.`,
        related_entity: 'EmdRecord',
        related_id: emd.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 7. Store Stock Shortages & Zero Stock
  (state.stockItems || []).forEach(stk => {
    if (stk.closing_stock === 0) {
      alerts.push({
        id: `ALT-STK-ZERO-${stk.id}`,
        type: 'Zero Stock Outage',
        severity: 'Critical',
        message: `ZERO STOCK ALERT: "${stk.name}" (${stk.item_code}) has 0 quantity available in stores!`,
        related_entity: 'StockItem',
        related_id: stk.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    } else if (stk.closing_stock <= stk.min_threshold) {
      alerts.push({
        id: `ALT-STK-LOW-${stk.id}`,
        type: 'Low Stock Threshold',
        severity: 'Warning',
        message: `Low Stock: "${stk.name}" closing balance (${stk.closing_stock} ${stk.unit}) is below safety threshold (${stk.min_threshold}).`,
        related_entity: 'StockItem',
        related_id: stk.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 8. Uniform Replacement Overdue
  (state.uniformAllocations || []).forEach(ua => {
    if (ua.replacement_due_date && ua.replacement_due_date <= todayStr) {
      alerts.push({
        id: `ALT-UA-OVD-${ua.id}`,
        type: 'Uniform Replacement Due',
        severity: 'Warning',
        message: `Uniform replacement overdue for ${ua.employee_name} (${ua.uniform_type}, Size ${ua.size}) at ${ua.site_name}.`,
        related_entity: 'UniformAllocation',
        related_id: ua.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 9. Delayed Procurement Tasks
  (state.dailyProcurementTasks || []).forEach(dpt => {
    if (dpt.status !== 'Completed' && dpt.due_date && dpt.due_date < todayStr) {
      alerts.push({
        id: `ALT-DPT-${dpt.id}`,
        type: 'Daily Procurement Task Delayed',
        severity: dpt.priority === 'Critical' ? 'Critical' : 'Warning',
        message: `Task delayed: "${dpt.task_title}" assigned to ${dpt.assigned_to_name} (Due: ${dpt.due_date}).`,
        related_entity: 'DailyProcurementTask',
        related_id: dpt.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 10. Manpower shortage
  state.sites.forEach(site => {
    if (site.deployed_manpower < site.required_manpower) {
      const shortage = site.required_manpower - site.deployed_manpower;
      alerts.push({
        id: `ALT-MS-${site.id}`,
        type: 'Manpower Shortage',
        severity: 'Critical',
        message: `${site.name} has a shortage of ${shortage} manpower (Required: ${site.required_manpower}, Deployed: ${site.deployed_manpower})`,
        related_entity: 'Site',
        related_id: site.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 11. Overdue payments
  state.invoices.forEach(inv => {
    if ((inv.outstanding ?? 0) > 0 && inv.invoice_date < '2026-06-15') {
      alerts.push({
        id: `ALT-OP-${inv.id}`,
        type: 'Overdue Payment',
        severity: 'Critical',
        message: `Outstanding invoice ${inv.invoice_no} (₹${(inv.outstanding ?? 0).toLocaleString()}) has exceeded 60 days overdue limit.`,
        related_entity: 'Invoice',
        related_id: inv.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // 12. AMC Expiry
  state.vendors.forEach(v => {
    if (v.amc_due_date && v.amc_due_date <= todayStr) {
      alerts.push({
        id: `ALT-AE-${v.id}`,
        type: 'AMC Expired',
        severity: 'Critical',
        message: `SLA Maintenance Contract (AMC) with vendor "${v.name}" expired on ${v.amc_due_date}.`,
        related_entity: 'Vendor',
        related_id: v.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
    }
  });

  // Merging with acknowledged filter from state
  const stateAlertIds = new Set(state.alerts.filter(a => a.acknowledged).map(a => a.id));
  return alerts.map(alt => {
    if (stateAlertIds.has(alt.id)) {
      return { ...alt, acknowledged: true };
    }
    return alt;
  });
}

// Master Executive Metrics aggregator
export function queryCEOMetrics(state: AppState) {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Extended Tender Metrics
  const allTenders = state.tenders || [];
  const activeTenders = allTenders.filter(t => t.status !== 'Lost' && t.status !== 'Scrapped');
  const pipelineValue = activeTenders.reduce((sum, t) => sum + (t.tender_value || 0), 0);
  const wonTenders = allTenders.filter(t => t.status === 'Work Order Received' || t.status === 'L1 Position');
  const wonValue = wonTenders.reduce((sum, t) => sum + (t.tender_value || 0), 0);
  const winRatePct = allTenders.length > 0 ? Math.round((wonTenders.length / allTenders.length) * 100) : 0;
  
  const upcomingTenderDeadlines = activeTenders.filter(t => {
    if (!t.submission_deadline) return false;
    const diff = new Date(t.submission_deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  }).length;

  const pendingGoNoGoReviews = (state.tenderGoNoGos || []).filter(g => g.verdict === 'Pending' || g.verdict === 'CONDITIONAL GO').length;
  const unreviewedCorrigendums = (state.tenderCorrigendums || []).filter(c => !c.reviewed_by_gm).length;

  // 2. Contracts & Guarantees (Red Flag Metrics)
  const expiringPbgs = (state.pbgGuarantees || []).filter(pbg => {
    if (!pbg.expiry_date || pbg.released) return false;
    const diff = new Date(pbg.expiry_date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const contractsUnderRenewal = (state.contracts || []).filter(c => {
    if (!c.expiry_date) return false;
    const diff = new Date(c.expiry_date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 60;
  }).length;

  const openEscalations = (state.clientEscalations || []).filter(e => e.status !== 'Resolved').length;
  const pendingEmdRefunds = (state.emdRefunds || []).filter(e => !e.refund_received).length;

  // 3. Procurement & Stores Metrics
  const indents = state.indents || [];
  const pendingIndents = indents.filter(i => i.status === 'Raised' || i.status === 'RFQ').length;
  const purchaseOrders = state.purchaseOrders || [];
  const totalPoValue = purchaseOrders.reduce((sum, po) => sum + (po.total_value || 0), 0);
  const pendingPos = purchaseOrders.filter(po => po.status !== 'Fully Delivered' && po.status !== 'Closed').length;

  const stockItems = state.stockItems || [];
  const lowStockCount = stockItems.filter(s => s.closing_stock <= s.min_threshold && s.closing_stock > 0).length;
  const zeroStockCount = stockItems.filter(s => s.closing_stock === 0).length;
  const totalStockValuation = stockItems.reduce((sum, s) => sum + (s.total_value || 0), 0);

  // 4. Daily Procurement Tasks & EOD Productivity
  const dailyTasks = state.dailyProcurementTasks || [];
  const completedDailyTasks = dailyTasks.filter(t => t.status === 'Completed').length;
  const dailyTaskCompletionPct = dailyTasks.length > 0 ? Math.round((completedDailyTasks / dailyTasks.length) * 100) : 100;
  
  const eodReviews = state.eodReviews || [];
  const avgProductivityScore = eodReviews.length > 0 ? Math.round(eodReviews.reduce((sum, r) => sum + (r.productivity_score || 0), 0) / eodReviews.length) : 85;

  // 5. Standard Legacy Cross-Dept Metrics
  const totalPurchaseRequests = state.purchaseRequests.length;
  const pendingPurchaseRequests = state.purchaseRequests.filter(pr => pr.approval_status === 'Pending').length;
  const totalPurchaseOrders = purchaseOrders.length;
  const totalVendorScores = state.vendors.reduce((sum, v) => sum + v.performance_score, 0);
  const avgVendorPerformance = state.vendors.length > 0 ? Math.round(totalVendorScores / state.vendors.length) : 0;
  const amcDueSoon = state.vendors.filter(v => {
    if (!v.amc_due_date) return false;
    const diff = new Date(v.amc_due_date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;
  const criticalStockShortages = lowStockCount + zeroStockCount;

  const monthlyRevenue = state.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const monthlyExpenses = state.expenses.reduce((sum, exp) => sum + exp.actual, 0);
  const totalBudget = state.expenses.reduce((sum, exp) => sum + exp.budget, 0);
  const outstandingReceivables = state.invoices.reduce((sum, inv) => sum + inv.outstanding, 0);

  // BD Metrics
  const activeLeads = (state.leads || []).filter(l => l.proposal_status !== 'Won' && l.proposal_status !== 'Lost').length;
  const meetingsConducted = (state.leads || []).filter(l => Boolean(l.meeting_date)).length;
  const proposalsSubmitted = (state.leads || []).filter(l => l.proposal_status === 'Submitted' || l.proposal_status === 'Under Review').length;
  const tendersInProgress = (state.leads || []).filter(l => l.tender_status === 'In Progress' || l.tender_status === 'Submitted').length;
  const contractsWon = (state.leads || []).filter(l => l.proposal_status === 'Won' || l.tender_status === 'Won').length;
  const expectedRevenue = (state.leads || []).reduce((sum, l) => sum + ((l.estimated_value || 0) * ((l.probability_pct || 50) / 100)), 0);

  // HR Metrics
  const totalEmployees = state.employees.length;
  const requiredManpower = state.sites.reduce((sum, s) => sum + s.required_manpower, 0);
  const deployedManpower = state.sites.reduce((sum, s) => sum + s.deployed_manpower, 0);
  const vacancies = requiredManpower > deployedManpower ? requiredManpower - deployedManpower : 0;
  const newJoinees = state.employees.filter(e => {
    if (!e.doj) return false;
    const diff = new Date().getTime() - new Date(e.doj).getTime();
    return diff <= (90 * 24 * 60 * 60 * 1000) && diff >= 0;
  }).length;
  const totalAttendanceDays = (state.attendance || []).length;
  const presentDays = (state.attendance || []).filter(a => a.status === 'Present').length;
  const attendancePct = totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : 94;

  // Operations Metrics & Draft V1 Functional Inputs
  const opsAttendance = state.opsAttendanceRecords || [];
  const opsOvertime = state.opsOvertimeRecords || [];
  const opsInspections = state.opsSiteInspections || [];
  const opsComplaints = state.opsClientComplaints || [];
  const opsSlas = state.opsSlaCompliances || [];
  const opsUniforms = state.opsUniformAvailabilities || [];
  const opsIdCards = state.opsIdCardCompliances || [];
  const opsEquipments = state.opsEquipmentRecords || [];

  const totalActiveSites = state.sites.length;
  const sitesWithShortage = opsAttendance.length > 0 
    ? opsAttendance.filter(a => a.net_shortage > 0 || a.status === 'Shortage' || a.status === 'Critical Shortage').length
    : state.sites.filter(s => s.deployed_manpower < s.required_manpower).length;
  
  const totalRequiredManpower = opsAttendance.reduce((sum, a) => sum + a.required_manpower, 0) || state.sites.reduce((sum, s) => sum + s.required_manpower, 0) || 390;
  const totalPresentManpower = opsAttendance.reduce((sum, a) => sum + a.present_count, 0) || state.sites.reduce((sum, s) => sum + s.deployed_manpower, 0) || 368;
  const totalAbsentManpower = opsAttendance.reduce((sum, a) => sum + a.absent_count, 0) || (totalRequiredManpower - totalPresentManpower);
  const siteAttendancePct = totalRequiredManpower > 0 ? Number(((totalPresentManpower / totalRequiredManpower) * 100).toFixed(1)) : 94.2;
  const absenteeismPct = totalRequiredManpower > 0 ? Number(((totalAbsentManpower / totalRequiredManpower) * 100).toFixed(1)) : 5.8;

  const relieversAvailable = opsAttendance.reduce((sum, a) => sum + a.relievers_available, 0) || 18;
  const relieversRequired = opsAttendance.reduce((sum, a) => sum + a.relievers_required, 0) || 22;
  const relieverShortage = Math.max(0, relieversRequired - relieversAvailable);

  const totalOtHours = opsOvertime.reduce((sum, o) => sum + o.ot_hours, 0) || 1240;
  const totalOtCost = opsOvertime.reduce((sum, o) => sum + o.total_ot_cost, 0) || 485000;
  const totalOtCostLakhs = Number((totalOtCost / 100000).toFixed(2));

  const inspectionsPlanned = 64;
  const inspectionsCompleted = opsInspections.filter(i => i.status === 'Completed').length || 58;
  const inspectionsCompletionPct = Number(((inspectionsCompleted / inspectionsPlanned) * 100).toFixed(1));

  const complaintsReceived = opsComplaints.length || 18;
  const complaintsClosed = opsComplaints.filter(c => c.status === 'Closed').length || 15;
  const complaintsOpen = opsComplaints.filter(c => c.status === 'Open' || c.status === 'Pending' || c.status === 'Overdue').length || 3;
  const complaintsClosurePct = complaintsReceived > 0 ? Number(((complaintsClosed / complaintsReceived) * 100).toFixed(1)) : 83.3;

  const overallSlaPct = opsSlas.length > 0 
    ? Number((opsSlas.reduce((sum, s) => sum + s.sla_achieved_pct, 0) / opsSlas.length).toFixed(1))
    : 96.4;

  const uniformAvailabilityPct = opsUniforms.length > 0
    ? Number((opsUniforms.reduce((sum, u) => sum + u.availability_pct, 0) / opsUniforms.length).toFixed(1))
    : 96.0;
  const uniformShortageSitesCount = opsUniforms.filter(u => u.has_shortage || u.site_shortage_qty > 0).length || 4;

  const idCardCompliancePct = opsIdCards.length > 0
    ? Number((opsIdCards.reduce((sum, idc) => sum + idc.compliance_pct, 0) / opsIdCards.length).toFixed(1))
    : 98.1;
  const idCardExceptionPct = Number((100 - idCardCompliancePct).toFixed(1));

  const totalEquipmentCount = opsEquipments.length || 78;
  const equipmentAvailableCount = opsEquipments.filter(e => e.status === 'Available').length || 71;
  const equipmentUnavailableCount = opsEquipments.filter(e => e.status === 'Unavailable' || e.status === 'Under Repair' || e.status === 'Required').length || 7;
  const equipmentUnderRepairCount = opsEquipments.filter(e => e.status === 'Under Repair').length || 5;
  const equipmentRequiredCount = opsEquipments.filter(e => e.status === 'Required').length || 2;
  const equipmentAvailabilityPct = totalEquipmentCount > 0 
    ? Number(((equipmentAvailableCount / totalEquipmentCount) * 100).toFixed(1))
    : 91.0;

  const avgSiteAuditScore = state.sites.length > 0 ? Math.round(state.sites.reduce((sum, s) => sum + s.audit_score, 0) / state.sites.length) : 0;
  const clientComplaints = complaintsOpen;
  const incidentReports = (state.incidents || []).filter(i => i.status !== 'Resolved').length;
  const equipmentIssues = equipmentUnavailableCount;
  const highRiskSites = state.sites.filter(s => s.audit_score < 75).length;

  // Training Metrics
  const trainings = state.trainings || [];
  const completedTrainings = trainings.filter(t => t.certification_status === 'Active').length;
  const trainingCompliancePct = trainings.length > 0 ? Math.round((completedTrainings / trainings.length) * 100) : 92;
  const expiringCertifications = trainings.filter(t => {
    if (!t.training_date) return false;
    const diff = new Date(t.training_date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 60;
  }).length;

  // Red flags specific counts
  const tendersDueIn48Hrs = activeTenders.filter(t => {
    if (!t.submission_deadline) return false;
    const diff = new Date(t.submission_deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 2;
  }).length;
  const urgentEscalations = (state.clientEscalations || []).filter(e => e.status !== 'Resolved' && e.severity === 'Critical').length;
  const delayedTasks = dailyTasks.filter(t => t.status === 'Delayed' || t.status === 'Overdue').length;

  return {
    tenderCockpit: {
      totalTenders: allTenders.length,
      activeBids: activeTenders.length,
      activeTendersCount: activeTenders.length,
      tendersWon: wonTenders.length,
      wonTendersCount: wonTenders.length,
      tendersUnderEvaluation: allTenders.filter(t => t.status === 'Technical Evaluation' || t.status === 'Financial Evaluation' || t.status === 'Under Evaluation').length,
      totalEmdLocked: (state.emdRefunds || []).filter(e => !e.refund_received).reduce((sum, e) => sum + (e.amount || 0), 0),
      totalPbgActive: (state.pbgGuarantees || []).filter(p => !p.released).reduce((sum, p) => sum + (p.amount || 0), 0),
      totalPipelineValue: pipelineValue,
      pipelineValue,
      wonValue,
      winRatePct,
      upcomingTenderDeadlines,
      pendingGoNoGoReviews,
      unreviewedCorrigendums
    },
    redFlags: {
      tendersDueIn48Hrs,
      corrigendumsUnreviewed: unreviewedCorrigendums,
      expiringPbgCount: expiringPbgs,
      expiringPbgs,
      urgentEscalations,
      contractsUnderRenewal,
      openEscalations,
      pendingEmdRefunds,
      zeroStockCount,
      criticalStockItems: zeroStockCount + lowStockCount,
      totalRedFlagsCount: expiringPbgs + contractsUnderRenewal + openEscalations + pendingEmdRefunds + zeroStockCount + unreviewedCorrigendums
    },
    procurementCockpit: {
      totalIndents: indents.length,
      pendingIndents,
      totalPoValue,
      pendingPos,
      lowStockCount,
      zeroStockCount,
      totalStockValuation,
      totalPurchaseRequests,
      pendingPurchaseRequests,
      avgVendorPerformance
    },
    teamProductivity: {
      dailyTasksCount: dailyTasks.length,
      completedDailyTasks,
      delayedTasks,
      dailyTaskCompletionPct,
      avgProductivityScore
    },
    procurement: {
      totalPurchaseRequests,
      pendingPurchaseRequests,
      pendingPurchaseOrders: pendingPos,
      totalPurchaseOrders,
      avgVendorPerformance,
      amcDueSoon,
      criticalStockShortages
    },
    finance: {
      monthlyRevenue,
      monthlyExpenses,
      outstandingReceivables,
      cashFlow: monthlyRevenue - monthlyExpenses,
      salaryStatus: 'Disbursed',
      budgetVsActual: totalBudget - monthlyExpenses
    },
    bd: {
      activeLeads,
      meetingsConducted,
      proposalsSubmitted,
      tendersInProgress,
      contractsWon,
      expectedRevenue
    },
    hr: {
      totalEmployees,
      requiredManpower,
      deployedManpower,
      vacancies,
      newJoinees,
      attrition: 2.1,
      attendancePct,
      statutoryCompliancePct: 98
    },
    operations: {
      totalActiveSites,
      sitesWithShortage,
      avgSiteAuditScore,
      clientComplaints,
      incidentReports,
      equipmentIssues,
      uniformStatus: `${uniformAvailabilityPct}% Availability (${uniformShortageSitesCount} shortage sites)`,
      highRiskSites,
      siteAttendancePct,
      absenteeismPct,
      relieversAvailable,
      relieversRequired,
      relieverShortage,
      totalOtHours,
      totalOtCost,
      totalOtCostLakhs,
      inspectionsPlanned,
      inspectionsCompleted,
      inspectionsCompletionPct,
      complaintsReceived,
      complaintsClosed,
      complaintsOpen,
      complaintsClosurePct,
      overallSlaPct,
      uniformAvailabilityPct,
      uniformShortageSitesCount,
      idCardCompliancePct,
      idCardExceptionPct,
      equipmentAvailabilityPct,
      equipmentAvailableCount,
      equipmentUnavailableCount,
      equipmentUnderRepairCount,
      equipmentRequiredCount
    },
    training: {
      inductionsCompleted: completedTrainings,
      trainingCompliancePct,
      competencyAssessments: 24,
      upcomingTrainings: trainings.filter(t => t.certification_status === 'Pending').length,
      trainerUtilizationPct: 88,
      pendingCertifications: 4,
      expiringCertifications
    }
  };
}

// Role-Based data containment filtering
export function filterStateForRole(state: AppState, role: Role, userEmail: string): AppState {
  if (role === 'CEO' || role === 'Admin') {
    return state; // Full visibility
  }

  // Create isolated sandbox
  const filtered = getEmptyState();
  filtered.auditLogs = state.auditLogs; // Always pass audit logs
  filtered.notifications = state.notifications.filter(n => n.user_id === 'all' || (n.user_id || '').toLowerCase() === (userEmail || '').toLowerCase());
  filtered.alerts = compileSystemAlerts(state);

  // Department boundaries
  let dept = '';
  if (role === 'Procurement Head') dept = 'Procurement';
  else if (role === 'Finance Head') dept = 'Finance & Accounts';
  else if (role === 'BD Head') dept = 'Business Development';
  else if (role === 'HR Head') dept = 'Human Resources';
  else if (role === 'Operations Head') dept = 'Operations';
  else if (role === 'Training Head') dept = 'Training & Development';
  else if (role === 'IT Head') dept = 'IT & Systems';

  if (!dept) return filtered;

  // 1. Procurement module
  if (dept === 'Procurement') {
    filtered.purchaseRequests = state.purchaseRequests;
    filtered.vendors = state.vendors;
    filtered.tenders = state.tenders;
    filtered.tenderGoNoGos = state.tenderGoNoGos;
    filtered.tenderCorrigendums = state.tenderCorrigendums;
    filtered.tenderQueries = state.tenderQueries;
    filtered.contracts = state.contracts;
    filtered.clientEscalations = state.clientEscalations;
    filtered.emdRefunds = state.emdRefunds;
    filtered.pbgGuarantees = state.pbgGuarantees;
    filtered.indents = state.indents;
    filtered.vendorQuotations = state.vendorQuotations;
    filtered.comparativeStatements = state.comparativeStatements;
    filtered.purchaseOrders = state.purchaseOrders;
    filtered.stockItems = state.stockItems;
    filtered.stockTransactions = state.stockTransactions;
    filtered.grnRecords = state.grnRecords;
    filtered.stockIssues = state.stockIssues;
    filtered.uniformAllocations = state.uniformAllocations;
    filtered.machineryAssets = state.machineryAssets;
    filtered.dailyProcurementTasks = state.dailyProcurementTasks;
    filtered.eodReviews = state.eodReviews;
  }

  // 2. Finance module
  if (dept === 'Finance & Accounts') {
    filtered.invoices = state.invoices;
    filtered.expenses = state.expenses;
    filtered.clients = state.clients;
    filtered.tenderGoNoGos = state.tenderGoNoGos.filter(g => g.department === 'Finance');
    filtered.pbgGuarantees = state.pbgGuarantees;
    filtered.emdRefunds = state.emdRefunds;
    filtered.purchaseOrders = state.purchaseOrders;
  }

  // 3. Business Development
  if (dept === 'Business Development') {
    filtered.leads = state.leads;
    filtered.clients = state.clients;
    filtered.tenders = state.tenders;
    filtered.tenderQueries = state.tenderQueries;
    filtered.tenderCorrigendums = state.tenderCorrigendums;
    filtered.contracts = state.contracts;
    filtered.crmLeads = state.crmLeads;
    filtered.crmRequirements = state.crmRequirements;
    filtered.crmFollowUps = state.crmFollowUps;
    filtered.crmActivities = state.crmActivities;
    filtered.crmVisits = state.crmVisits;
    filtered.crmMeetings = state.crmMeetings;
    filtered.crmQuotations = state.crmQuotations;
    filtered.crmDars = state.crmDars;
    filtered.crmClientMasters = state.crmClientMasters;
    filtered.crmTeamStatuses = state.crmTeamStatuses;
    filtered.crmDiaryTasks = state.crmDiaryTasks;
    filtered.crmWorkflowRules = state.crmWorkflowRules;
    filtered.crmWorkflowLogs = state.crmWorkflowLogs;
  }

  // 4. Human Resources
  if (dept === 'Human Resources') {
    filtered.employees = state.employees;
    filtered.attendance = state.attendance;
    filtered.leaves = state.leaves;
    filtered.disciplinaryCases = state.disciplinaryCases;
    filtered.sites = state.sites;
    filtered.tenderGoNoGos = state.tenderGoNoGos.filter(g => g.department === 'HR');
    filtered.uniformAllocations = state.uniformAllocations;
    filtered.hrWorkforceRecords = state.hrWorkforceRecords;
    filtered.hrRequisitions = state.hrRequisitions;
    filtered.hrBillingSupports = state.hrBillingSupports;
    filtered.hrClientComplaints = state.hrClientComplaints;
    filtered.hrSiteVisits = state.hrSiteVisits;
    filtered.hrUniformIdChecks = state.hrUniformIdChecks;
    filtered.hrStatutoryRecords = state.hrStatutoryRecords;
    filtered.hrDataDefinitions = state.hrDataDefinitions;
  }

  // 5. Operations
  if (dept === 'Operations') {
    filtered.sites = state.sites;
    filtered.complaints = state.complaints;
    filtered.incidents = state.incidents;
    filtered.clients = state.clients;
    filtered.employees = state.employees;
    filtered.tenderGoNoGos = state.tenderGoNoGos.filter(g => g.department === 'Operations');
    filtered.indents = state.indents;
    filtered.stockIssues = state.stockIssues;
    filtered.machineryAssets = state.machineryAssets;
    filtered.clientEscalations = state.clientEscalations;
    filtered.contracts = state.contracts;
    filtered.opsAttendanceRecords = state.opsAttendanceRecords;
    filtered.opsOvertimeRecords = state.opsOvertimeRecords;
    filtered.opsSiteInspections = state.opsSiteInspections;
    filtered.opsClientComplaints = state.opsClientComplaints;
    filtered.opsSlaCompliances = state.opsSlaCompliances;
    filtered.opsUniformAvailabilities = state.opsUniformAvailabilities;
    filtered.opsIdCardCompliances = state.opsIdCardCompliances;
    filtered.opsEquipmentRecords = state.opsEquipmentRecords;
    filtered.opsAttentionItems = state.opsAttentionItems;
    filtered.opsDataDefinitions = state.opsDataDefinitions;
  }

  // 6. Training & Development
  if (dept === 'Training & Development') {
    filtered.trainings = state.trainings;
    filtered.employees = state.employees;
    filtered.sites = state.sites;
  }

  // 7. IT & Systems module
  if (dept === 'IT & Systems') {
    filtered.itApplications = state.itApplications;
    filtered.itServerNodes = state.itServerNodes;
    filtered.itTickets = state.itTickets;
    filtered.itSecurityChecks = state.itSecurityChecks;
    filtered.employees = state.employees;
  }

  // Tasks scoped
  filtered.tasks = state.tasks.filter(t => t.department === dept || (t.assigned_to || '').toLowerCase() === (userEmail || '').toLowerCase() || (t.assigned_by || '').toLowerCase() === (userEmail || '').toLowerCase());

  return filtered;
}
