import {
  INITIAL_TD_PLANS,
  INITIAL_TD_TRAINERS,
  INITIAL_TD_SESSIONS,
  INITIAL_TD_COMPLIANCE_RADAR,
  INITIAL_IT_PROJECTS,
  INITIAL_IT_TASKS,
  INITIAL_OTHER_INITIATIVES,
  INITIAL_MEETINGS,
  INITIAL_MEETING_ACTIONS,
  INITIAL_MY_WORK_ITEMS,
  INITIAL_LIVE_UPDATES
} from './ceoWorkspaceSeedData';
import {
  INITIAL_HR_WORKFORCE_RECORDS,
  INITIAL_HR_REQUISITIONS,
  INITIAL_HR_BILLING_SUPPORTS,
  INITIAL_HR_CLIENT_COMPLAINTS,
  INITIAL_HR_SITE_VISITS,
  INITIAL_HR_UNIFORM_ID_CHECKS,
  INITIAL_HR_STATUTORY_RECORDS,
  INITIAL_HR_DATA_DEFINITIONS
} from './hrFunctionalSeedData';
import {
  INITIAL_OPS_ATTENDANCE_RECORDS,
  INITIAL_OPS_OVERTIME_RECORDS,
  INITIAL_OPS_SITE_INSPECTIONS,
  INITIAL_OPS_CLIENT_COMPLAINTS,
  INITIAL_OPS_SLA_COMPLIANCES,
  INITIAL_OPS_UNIFORM_AVAILABILITY,
  INITIAL_OPS_ID_CARD_COMPLIANCE,
  INITIAL_OPS_EQUIPMENT_RECORDS,
  INITIAL_OPS_ATTENTION_ITEMS,
  INITIAL_OPS_DATA_DEFINITIONS
} from './opsFunctionalSeedData';
import { 
  PurchaseRequest, Invoice, Expense, Lead, Client, Vendor, Employee,
  Attendance, Leave, DisciplinaryCase, Site, Complaint, Incident, Training, 
  Task, AuditLog, Notification, Alert, ITApplication, ITServerNode, ITTicket, ITSecurityCheck, AppState,
  Tender, TenderGoNoGo, TenderCorrigendum, TenderQuery, ContractRecord, ClientEscalation,
  EmdRecord, PbgRecord, Indent, VendorQuotation, ComparativeStatement, PurchaseOrder,
  StockItem, StockTransaction, GrnRecord, StockIssue, UniformAllocation, MachineryAsset,
  DailyProcurementTask, EodReview,
  CRMLead, CRMRequirement, CRMFollowUp, CRMActivity, CRMClientVisit, CRMMeeting,
  CRMQuotation, CRMDailyActivityReport, CRMClientMaster, CRMTeamStatus,
  CRMDiaryTask, CRMWorkflowRule, CRMWorkflowExecutionLog,
  GovernmentTender
} from '../types';

export const INITIAL_CLIENTS: Client[] = [
  { id: 'C-001', name: 'Apex Property Holdings', region: 'South Region' },
  { id: 'C-002', name: 'St. Jude Health System', region: 'North Region' },
  { id: 'C-003', name: 'OmniCorp Global HQ', region: 'West Region' },
  { id: 'C-004', name: 'Sunsand Luxury Resorts', region: 'South Region' },
  { id: 'C-005', name: 'Northside Freight Logistics', region: 'East Region' },
  { id: 'C-006', name: 'Zenith Infotech Hub', region: 'West Region' }
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'V-101', name: 'Global Supplies Inc.', performance_score: 92, amc_due_date: '2026-08-15' },
  { id: 'V-102', name: 'Apex Fleet Maintenance', performance_score: 85, amc_due_date: '2026-07-20' }, // Expiring soon!
  { id: 'V-103', name: 'TechSolutions Corp', performance_score: 95, amc_due_date: '2026-11-05' },
  { id: 'V-104', name: 'Uniform Krafts & Co.', performance_score: 78, amc_due_date: '2026-05-12' }  // Expired!
];

export const INITIAL_SITES: Site[] = [
  { id: 'S-201', name: 'Metro Office Complex', client_id: 'C-001', required_manpower: 45, deployed_manpower: 42, supervisor_id: 'EMP-003', audit_score: 94, site_health: 'Green', region: 'South Region' },
  { id: 'S-202', name: 'City General Hospital', client_id: 'C-002', required_manpower: 80, deployed_manpower: 70, supervisor_id: 'EMP-004', audit_score: 88, site_health: 'Amber', region: 'North Region' }, // Manpower Shortage!
  { id: 'S-203', name: 'Valley Tech Park Hub', client_id: 'C-003', required_manpower: 120, deployed_manpower: 118, supervisor_id: 'EMP-005', audit_score: 74, site_health: 'Red', region: 'West Region' }, // Low Audit Score!
  { id: 'S-204', name: 'Sunsand Beach Resort', client_id: 'C-004', required_manpower: 35, deployed_manpower: 34, supervisor_id: 'EMP-006', audit_score: 91, site_health: 'Green', region: 'South Region' },
  { id: 'S-205', name: 'Northside Freight Depot', client_id: 'C-005', required_manpower: 50, deployed_manpower: 42, supervisor_id: 'EMP-007', audit_score: 82, site_health: 'Amber', region: 'East Region' }, // Manpower Shortage!
  { id: 'S-206', name: 'Zenith IT Facility', client_id: 'C-006', required_manpower: 60, deployed_manpower: 60, supervisor_id: 'EMP-008', audit_score: 96, site_health: 'Green', region: 'West Region' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Aarav Sharma', employee_id: 'SIS-2601', department: 'Human Resources', site_id: 'S-201', doj: '2024-03-15', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Senior HR Specialist' },
  { id: 'EMP-002', name: 'Neha Gupta', employee_id: 'SIS-2602', department: 'Finance & Accounts', site_id: 'S-201', doj: '2023-11-01', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Accounts Lead' },
  { id: 'EMP-003', name: 'Vikram Singh', employee_id: 'SIS-2603', department: 'Operations', site_id: 'S-201', doj: '2024-01-10', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Site Supervisor Metro' },
  { id: 'EMP-004', name: 'Priya Patel', employee_id: 'SIS-2604', department: 'Operations', site_id: 'S-202', doj: '2022-08-20', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Medical Ward Facility Supervisor' },
  { id: 'EMP-005', name: 'Rohan Das', employee_id: 'SIS-2605', department: 'Operations', site_id: 'S-203', doj: '2025-02-15', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Valley Tech Campus Manager' },
  { id: 'EMP-006', name: 'Ananya Rao', employee_id: 'SIS-2606', department: 'Operations', site_id: 'S-204', doj: '2024-05-22', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Resort Security Supervisor' },
  { id: 'EMP-007', name: 'Sanjay Kumar', employee_id: 'SIS-2607', department: 'Operations', site_id: 'S-205', doj: '2023-09-04', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Freight Depot Site Supervisor' },
  { id: 'EMP-008', name: 'Meera Iyer', employee_id: 'SIS-2608', department: 'Training & Development', site_id: 'S-206', doj: '2024-10-12', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Lead Technical Trainer' },
  { id: 'EMP-009', name: 'Kunal Sen', employee_id: 'SIS-2609', department: 'Business Development', site_id: 'S-203', doj: '2024-07-15', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'BD Executive' },
  { id: 'EMP-010', name: 'Deepika Nair', employee_id: 'SIS-2610', department: 'Procurement', site_id: 'S-201', doj: '2024-02-18', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Procurement Executive' },
  { id: 'EMP-011', name: 'Ramesh Chawla', employee_id: 'SIS-2611', department: 'Human Resources', site_id: 'S-202', doj: '2025-06-01', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'HR Coordinator' },
  { id: 'EMP-012', name: 'Sunita Joshi', employee_id: 'SIS-2612', department: 'Training & Development', site_id: 'S-202', doj: '2025-04-10', vacancy_status: 'Filled', exit_status: 'Active', remarks: 'Compliance Trainer' }
];

export const INITIAL_PURCHASE_REQUESTS: PurchaseRequest[] = [
  { id: 'PR-901', request_no: 'SIS-PR-001', date: '2026-07-01', department: 'Operations', item: 'Industrial Floor Scrubbers', quantity: 3, vendor_id: 'V-101', estimated_cost: 45000, approval_status: 'Approved', po_number: 'SIS-PO-401', delivery_date: '2026-07-20', amc_status: 'Active', remarks: 'Required for Valley Tech Park campus maintenance.' },
  { id: 'PR-902', request_no: 'SIS-PR-002', date: '2026-07-10', department: 'Human Resources', item: 'Recruitment Campaign Materials', quantity: 1, vendor_id: 'V-103', estimated_cost: 12000, approval_status: 'Pending', po_number: '', delivery_date: '', amc_status: 'None', remarks: 'Awaiting CEO final sign-off.' },
  { id: 'PR-903', request_no: 'SIS-PR-003', date: '2026-06-15', department: 'Operations', item: 'Custom Security Uniforms', quantity: 200, vendor_id: 'V-104', estimated_cost: 18000, approval_status: 'Approved', po_number: 'SIS-PO-403', delivery_date: '2026-07-02', amc_status: 'Expired', remarks: 'Delivered. AMC needs renewal.' },
  { id: 'PR-904', request_no: 'SIS-PR-004', date: '2026-07-14', department: 'Training & Development', item: 'Interactive Learning Projector', quantity: 2, vendor_id: 'V-103', estimated_cost: 8500, approval_status: 'Pending', po_number: '', delivery_date: '', amc_status: 'None', remarks: 'For the main classroom training.' }
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-801', client_id: 'C-001', invoice_no: 'SIS-26-801', invoice_date: '2026-06-01', amount: 150000, payment_received: 150000, outstanding: 0, remarks: 'Metro Office Complex June SLA billing' },
  { id: 'INV-802', client_id: 'C-002', invoice_no: 'SIS-26-802', invoice_date: '2026-06-15', amount: 320000, payment_received: 320000, outstanding: 0, remarks: 'City General Hospital Q2 Operational billing' },
  { id: 'INV-803', client_id: 'C-003', invoice_no: 'SIS-26-803', invoice_date: '2026-05-10', amount: 450000, payment_received: 150000, outstanding: 300000, remarks: 'Valley Tech Park Hub Project Phase 1 Payment Overdue' }, // Overdue Receivables!
  { id: 'INV-804', client_id: 'C-004', invoice_no: 'SIS-26-804', invoice_date: '2026-07-01', amount: 180000, payment_received: 0, outstanding: 180000, remarks: 'Sunsand Beach Resort July facility management fees' },
  { id: 'INV-805', client_id: 'C-005', invoice_no: 'SIS-26-805', invoice_date: '2026-05-20', amount: 95000, payment_received: 0, outstanding: 95000, remarks: 'Freight Depot security support - Payment Overdue' } // Overdue Receivables!
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-701', expense_head: 'Employee Salary Pool', budget: 850000, actual: 842000, date: '2026-07-01', remarks: 'Staff salary disbursements for June 2026' },
  { id: 'EXP-702', expense_head: 'Operational Equipment Leasing', budget: 120000, actual: 125000, date: '2026-07-05', remarks: 'Scrubbers and CCTV lease payment' },
  { id: 'EXP-703', expense_head: 'Fuel and Site Logistics', budget: 45000, actual: 41200, date: '2026-07-12', remarks: 'Supervisors petrol allowance and vehicle logistics' },
  { id: 'EXP-704', expense_head: 'Corporate Office Rents & Admin', budget: 80000, actual: 80000, date: '2026-07-01', remarks: 'Corporate office lease rent' }
];

export const INITIAL_LEADS: Lead[] = [
  { id: 'LD-601', lead_name: 'Airport Cargo Terminal Facility', client_id: 'C-005', contact_person: 'Mr. Arvind Gupta', meeting_date: '2026-07-02', proposal_status: 'Submitted', tender_status: 'In Progress', estimated_value: 1200000, probability_pct: 75, expected_closure: '2026-08-30', remarks: 'Excellent meeting with Cargo VP. RFP submitted.' },
  { id: 'LD-602', lead_name: 'Metro Line Smart Station Security', client_id: 'C-001', contact_person: 'Ms. Shalini Iyer', meeting_date: '2026-07-08', proposal_status: 'Submitted', tender_status: 'Submitted', estimated_value: 3500000, probability_pct: 60, expected_closure: '2026-09-15', remarks: 'Government tender proposal placed under South Region.' },
  { id: 'LD-603', lead_name: 'Greenfield Bio-Tech park services', client_id: 'C-003', contact_person: 'Dr. Ramesh Rao', meeting_date: '2026-06-20', proposal_status: 'In Progress', tender_status: 'Not Started', estimated_value: 950000, probability_pct: 40, expected_closure: '2026-10-10', remarks: 'Site inspection completed. Compiling technical proposal.' },
  { id: 'LD-604', lead_name: 'Luxury Tech Campus Integrated Services', client_id: 'C-006', contact_person: 'Karthik Nair', meeting_date: '2026-07-14', proposal_status: 'Won', tender_status: 'Won', estimated_value: 2400000, probability_pct: 100, expected_closure: '2026-07-15', remarks: 'Contract signed. Onboarding scheduled for Aug 1st.' }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'ATT-301', employee_id: 'EMP-003', date: '2026-07-15', status: 'Present' },
  { id: 'ATT-302', employee_id: 'EMP-004', date: '2026-07-15', status: 'Present' },
  { id: 'ATT-303', employee_id: 'EMP-005', date: '2026-07-15', status: 'Absent' }, // Absenteeism tracked
  { id: 'ATT-304', employee_id: 'EMP-006', date: '2026-07-15', status: 'Present' },
  { id: 'ATT-305', employee_id: 'EMP-007', date: '2026-07-15', status: 'On Leave' }
];

export const INITIAL_LEAVES: Leave[] = [
  { id: 'LV-401', employee_id: 'EMP-007', type: 'Privilege Leave', start_date: '2026-07-12', end_date: '2026-07-18', status: 'Approved' },
  { id: 'LV-402', employee_id: 'EMP-011', type: 'Sick Leave', start_date: '2026-07-15', end_date: '2026-07-16', status: 'Approved' },
  { id: 'LV-403', employee_id: 'EMP-009', type: 'Casual Leave', start_date: '2026-07-22', end_date: '2026-07-24', status: 'Pending' }
];

export const INITIAL_DISCIPLINARY_CASES: DisciplinaryCase[] = [
  { id: 'DC-501', employee_id: 'EMP-005', type: 'Attendance Negligence', status: 'Open', date: '2026-07-10', remarks: 'Habitual late arrival flagged by Area Executive' },
  { id: 'DC-502', employee_id: 'EMP-007', type: 'Uniform Policy Breach', status: 'Closed', date: '2026-06-25', remarks: 'Verbal warning issued. Resolved with compliance.' }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'CMP-601', site_id: 'S-203', date: '2026-07-09', category: 'Security Misbehavior', status: 'Open' }, // Open complaint!
  { id: 'CMP-602', site_id: 'S-202', date: '2026-07-12', category: 'Hygiene Standards', status: 'Open' },      // Open complaint!
  { id: 'CMP-603', site_id: 'S-201', date: '2026-06-28', category: 'Equipment Malfunction', status: 'Resolved' }
];

export const INITIAL_INCIDENTS: Incident[] = [
  { id: 'INC-701', site_id: 'S-203', date: '2026-07-11', type: 'Power Outage Back-up Failure', severity: 'High', status: 'In Progress' },
  { id: 'INC-702', site_id: 'S-202', date: '2026-07-14', type: 'Critical Patient Area Water Leakage', severity: 'Critical', status: 'Open' }, // Critical incident!
  { id: 'INC-703', site_id: 'S-205', date: '2026-06-12', type: 'Depot Perimeter Breach Attempts', severity: 'Medium', status: 'Resolved' }
];

export const INITIAL_TRAININGS: Training[] = [
  { id: 'TR-801', employee_id: 'EMP-003', site_id: 'S-201', training_name: 'Basic Fire Safety Induction', training_date: '2026-05-10', trainer: 'Meera Iyer', competency_score: 95, certification_status: 'Active', next_due_date: '2027-05-10', remarks: 'Excellent score in mock evacuation drill.' },
  { id: 'TR-802', employee_id: 'EMP-004', site_id: 'S-202', training_name: 'Hospital Isolation Room Disinfection', training_date: '2026-01-15', trainer: 'Sunita Joshi', competency_score: 88, certification_status: 'Active', next_due_date: '2027-01-15', remarks: 'Qualified for Critical Ward operations.' },
  { id: 'TR-803', employee_id: 'EMP-005', site_id: 'S-203', training_name: 'Advanced Crowd Control Protocols', training_date: '2025-07-10', trainer: 'Meera Iyer', competency_score: 72, certification_status: 'Expired', next_due_date: '2026-07-10', remarks: 'Training overdue! Refresher session required.' }, // Overdue Training!
  { id: 'TR-804', employee_id: 'EMP-006', site_id: 'S-204', training_name: 'Resort Emergency Evacuation Procedures', training_date: '2026-07-15', trainer: 'Meera Iyer', competency_score: 92, certification_status: 'Active', next_due_date: '2027-07-15', remarks: 'Annual compliance certificate issued.' }
];

export const INITIAL_TASKS: Task[] = [
  { id: 'TSK-001', title: 'Compile Corporate Budget vs Actual Q2', description: 'Consolidate accounts from north and south branches for Board review.', assigned_by: 'CEO Office', assigned_to: 'Finance Head', department: 'Finance & Accounts', priority: 'High', due_date: '2026-07-25', status: 'In Progress', percent_completed: 65, remarks: 'Ledger reconciliations underway' },
  { id: 'TSK-002', title: 'Deploy Relief Force to General Hospital S-202', description: 'Address the 10-person manpower deficit highlighted by the Hospital Admin.', assigned_by: 'CEO Office', assigned_to: 'Operations Head', department: 'Operations', priority: 'Critical', due_date: '2026-07-12', status: 'Delayed', percent_completed: 40, remarks: 'Recruitments delayed by regional office.' }, // Overdue and Delayed!
  { id: 'TSK-003', title: 'Renew Global Supplies AMC for scrubbers', description: 'Service contract for 3 industrial scrubbers is expiring shortly.', assigned_by: 'Procurement Head', assigned_to: 'Procurement Head', department: 'Procurement', priority: 'Medium', due_date: '2026-08-15', status: 'Pending', percent_completed: 0, remarks: 'Awaiting revised commercial quote.' },
  { id: 'TSK-004', title: 'Submit Smart City Proposals', description: 'Complete pricing structure and performance bonds for the metro tender.', assigned_by: 'CEO Office', assigned_to: 'BD Head', department: 'Business Development', priority: 'High', due_date: '2026-07-15', status: 'Completed', percent_completed: 100, evidence_url: 'smart_city_tender_signed.pdf', remarks: 'Performance bonds uploaded and submitted successfully.' },
  { id: 'TSK-005', title: 'Schedule ISO 9001 Refresher for S-203 Staff', description: 'Competency score at S-203 is low. Establish mandatory weekend class.', assigned_by: 'CEO Office', assigned_to: 'Training Head', department: 'Training & Development', priority: 'High', due_date: '2026-07-14', status: 'Delayed', percent_completed: 15, remarks: 'Room booking pending. Trainer not locked.' }, // Overdue and Delayed!
  { id: 'TSK-006', title: 'Filing Statutory Provident Fund Returns', description: 'Monthly PF and ESIC compliance return submission.', assigned_by: 'HR Head', assigned_to: 'HR Head', department: 'Human Resources', priority: 'Medium', due_date: '2026-07-20', status: 'In Progress', percent_completed: 80, remarks: 'Draft receipts downloaded for audit' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-001', user_id: 'admin@spoorthy.in', action: 'LOGIN', entity: 'User', entity_id: 'CEO', timestamp: '2026-07-16T08:10:00Z' },
  { id: 'LOG-002', user_id: 'admin@spoorthy.in', action: 'CREATE', entity: 'Lead', entity_id: 'LD-604', before_value: '', after_value: 'Greenfield Bio-Tech Lead with value 2.4M', timestamp: '2026-07-16T08:12:35Z' },
  { id: 'LOG-003', user_id: 'procurement.head@spoorthy.in', action: 'UPDATE', entity: 'PurchaseRequest', entity_id: 'PR-901', before_value: 'ApprovalStatus: Pending', after_value: 'ApprovalStatus: Approved', timestamp: '2026-07-16T08:14:12Z' }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'NTF-001', user_id: 'all', type: 'TASK_ASSIGNED', message: 'CEO assigned critical task "Deploy Relief Force to General Hospital S-202"', read_status: 'Unread', created_at: '2026-07-12T10:00:00Z' },
  { id: 'NTF-002', user_id: 'all', type: 'PAYMENT_OVERDUE', message: 'Invoice SIS-26-803 from OmniCorp is 60+ days overdue.', read_status: 'Unread', created_at: '2026-07-10T09:15:00Z' },
  { id: 'NTF-003', user_id: 'all', type: 'TRAINING_OVERDUE', message: 'Rohan Das crowd control certificate expired on 2026-07-10.', read_status: 'Unread', created_at: '2026-07-11T14:30:00Z' }
];

export const INITIAL_ALERTS: Alert[] = [
  { id: 'ALT-001', type: 'Manpower shortage', severity: 'Critical', message: 'City General Hospital (S-202) is short of 10 crew members (Required: 80, Deployed: 70)', related_entity: 'Site', related_id: 'S-202', acknowledged: false, created_at: '2026-07-15T08:00:00Z' },
  { id: 'ALT-002', type: 'Overdue payment', severity: 'Critical', message: 'Valley Tech Park Hub (C-003) Invoice SIS-26-803 ($300,000 outstanding) past 60 days overdue.', related_entity: 'Invoice', related_id: 'INV-803', acknowledged: false, created_at: '2026-07-15T08:05:00Z' },
  { id: 'ALT-003', type: 'Tender deadline', severity: 'Warning', message: 'Smart Station Security (LD-602) tender response due shortly on 2026-09-15.', related_entity: 'Lead', related_id: 'LD-602', acknowledged: false, created_at: '2026-07-15T08:10:00Z' },
  { id: 'ALT-004', type: 'Training overdue', severity: 'Warning', message: 'Employee Rohan Das (EMP-005) training "Advanced Crowd Control" expired on 2026-07-10.', related_entity: 'Training', related_id: 'TR-803', acknowledged: false, created_at: '2026-07-15T08:15:00Z' },
  { id: 'ALT-005', type: 'Client complaint', severity: 'Critical', message: 'Active "Security Misbehavior" unresolved complaint at S-203 site.', related_entity: 'Complaint', related_id: 'CMP-601', acknowledged: false, created_at: '2026-07-15T08:20:00Z' },
  { id: 'ALT-006', type: 'Audit score low', severity: 'Warning', message: 'Valley Tech Park Hub S-203 audit score is 74% (Dropped below the 80% security threshold).', related_entity: 'Site', related_id: 'S-203', acknowledged: false, created_at: '2026-07-15T08:25:00Z' },
  { id: 'ALT-007', type: 'AMC expiry', severity: 'Warning', message: 'Uniform Krafts & Co. (V-104) AMC has expired.', related_entity: 'Vendor', related_id: 'V-104', acknowledged: false, created_at: '2026-07-15T08:30:00Z' }
];

export const INITIAL_IT_APPLICATIONS: ITApplication[] = [
  {
    id: 'APP-001',
    name: 'Spoorthy Guard & Field Patrol Portal',
    category: 'Web App',
    url: 'https://ops.spoorthyfacilities.com',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 99.98,
    latency_ms: 38,
    version: 'v2.4.1',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'IT Operations',
    description: 'Field officer roster, geo-tagged QR patrol scans, guard daily shift submission'
  },
  {
    id: 'APP-002',
    name: 'Biometric Attendance & EPF Sync API',
    category: 'Mobile API',
    url: 'https://api-biometric.spoorthyfacilities.com/v1',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 99.92,
    latency_ms: 55,
    version: 'v1.8.0',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'IT Systems Team',
    description: 'Syncs biometric punch logs across 12 client locations with HRMS & wage generation'
  },
  {
    id: 'APP-003',
    name: 'Enterprise MongoDB Production Cluster',
    category: 'Database',
    url: 'mongodb://127.0.0.1:27017/spoorthy_dss',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 100.0,
    latency_ms: 4,
    version: 'v7.0.11',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'Lead Database Architect',
    description: 'Primary high-speed operational document database for sites, employees & billing'
  },
  {
    id: 'APP-004',
    name: 'Client SLA & Invoice Billing Engine',
    category: 'Internal Tool',
    url: 'https://finance.spoorthyfacilities.com',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 99.85,
    latency_ms: 62,
    version: 'v3.1.0',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'Finance IT Team',
    description: 'Automated invoice generation, tax calculations, PDF export, and payment reminders'
  },
  {
    id: 'APP-005',
    name: 'GPS Vehicle & Guard Live Tracker',
    category: 'Mobile API',
    url: 'https://gps-stream.spoorthyfacilities.com',
    host_type: 'Cloud / CDN',
    status: 'Degraded',
    uptime_pct: 97.40,
    latency_ms: 240,
    version: 'v1.2.4',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'Fleet IoT Admin',
    description: 'Patrol van telemetry & real-time route tracing for rapid-response security units'
  },
  {
    id: 'APP-006',
    name: 'Nginx Reverse Proxy & SSL Gateway',
    category: 'Core Infrastructure',
    url: 'https://gateway.spoorthyfacilities.com',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 99.99,
    latency_ms: 12,
    version: '1.24.0',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'DevOps & SecOps',
    description: 'Handles SSL termination, rate limiting, and HTTP-to-HTTPS security redirection'
  },
  {
    id: 'APP-007',
    name: 'Corporate Mail & Google Workspace',
    category: 'Third-Party SaaS',
    url: 'https://mail.google.com/a/spoorthyfacilities.com',
    host_type: 'SaaS',
    status: 'Operational',
    uptime_pct: 100.0,
    latency_ms: 22,
    version: 'Cloud SaaS',
    last_checked: '2026-07-15T09:00:00Z',
    owner: 'Corporate IT Admin',
    description: 'Company-wide email, calendar, and collaborative workspace accounts'
  }
];

export const INITIAL_IT_SERVER_NODES: ITServerNode[] = [
  {
    id: 'SRV-001',
    node_name: 'Hostinger Primary VPS (Ubuntu 22.04 LTS)',
    ip_address: '185.199.110.153',
    role_type: 'Application Server',
    cpu_usage_pct: 34,
    memory_usage_pct: 58,
    disk_usage_pct: 42,
    status: 'Healthy',
    location: 'Mumbai DC / India',
    last_ping: 'Just now'
  },
  {
    id: 'SRV-002',
    node_name: 'MongoDB Enterprise Database Node',
    ip_address: '127.0.0.1 (Loopback Socket)',
    role_type: 'Database Server',
    cpu_usage_pct: 22,
    memory_usage_pct: 64,
    disk_usage_pct: 38,
    status: 'Healthy',
    location: 'Internal VPS Memory',
    last_ping: 'Just now'
  },
  {
    id: 'SRV-003',
    node_name: 'HQ Central CCTV Video Gateway',
    ip_address: '192.168.1.100',
    role_type: 'Network Gateway',
    cpu_usage_pct: 78,
    memory_usage_pct: 82,
    disk_usage_pct: 85,
    status: 'Warning',
    location: 'Bengaluru HQ Control Room',
    last_ping: '1 min ago'
  },
  {
    id: 'SRV-004',
    node_name: 'Automated Daily Snapshot & Backup Vault',
    ip_address: '10.0.8.25',
    role_type: 'Backup Vault',
    cpu_usage_pct: 8,
    memory_usage_pct: 20,
    disk_usage_pct: 49,
    status: 'Healthy',
    location: 'Off-site Encrypted Cloud Storage',
    last_ping: '5 mins ago'
  }
];

export const INITIAL_IT_TICKETS: ITTicket[] = [
  {
    id: 'TCK-101',
    ticket_no: 'IT-2026-084',
    subject: 'Biometric Scanner offline at Valley Tech Park Site S-203',
    requested_by: 'Rohan Das (Campus Manager)',
    department: 'Operations',
    priority: 'High',
    category: 'Biometric Device',
    status: 'In Progress',
    created_at: '2026-07-15T07:45:00Z',
    resolution_notes: 'Technician dispatched with replacement ZKTeco biometric unit'
  },
  {
    id: 'TCK-102',
    ticket_no: 'IT-2026-083',
    subject: 'ERP Invoicing export timeout for large Q2 reports',
    requested_by: 'Neha Gupta (Finance Head)',
    department: 'Finance & Accounts',
    priority: 'Medium',
    category: 'Software Access',
    status: 'Open',
    created_at: '2026-07-14T14:30:00Z',
    resolution_notes: 'Optimizing MongoDB aggregation pipeline indexes'
  },
  {
    id: 'TCK-103',
    ticket_no: 'IT-2026-082',
    subject: 'Laptop replacement & VPN access for new BD Lead',
    requested_by: 'Kunal Sen',
    department: 'Business Development',
    priority: 'Low',
    category: 'Hardware / Laptop',
    status: 'Resolved',
    created_at: '2026-07-12T10:00:00Z',
    resolved_at: '2026-07-13T16:00:00Z',
    resolution_notes: 'Dell Latitude configured with WireGuard VPN and 2FA keys'
  },
  {
    id: 'TCK-104',
    ticket_no: 'IT-2026-081',
    subject: 'GPS telemetry packets dropping for South Region Patrol Vans',
    requested_by: 'Vikram Singh (Supervisor)',
    department: 'Operations',
    priority: 'Critical',
    category: 'Network / VPN',
    status: 'In Progress',
    created_at: '2026-07-15T06:15:00Z',
    resolution_notes: 'Investigating SIM card roaming provider connectivity'
  }
];

export const INITIAL_IT_SECURITY_CHECKS: ITSecurityCheck[] = [
  {
    id: 'SEC-001',
    check_name: 'SSL/TLS Let\'s Encrypt Auto-Renewal & Validity',
    category: 'Certificate',
    status: 'Pass',
    expiry_or_next_date: '2026-10-28',
    score: 100,
    details: 'Wildcard *.spoorthyfacilities.com SSL valid for 105 days'
  },
  {
    id: 'SEC-002',
    check_name: 'MongoDB Encrypted Automated Daily Backup',
    category: 'Backup',
    status: 'Pass',
    expiry_or_next_date: '2026-07-16 02:00 IST',
    score: 100,
    details: 'Last backup snapshot: 24.2 MB compressed & verified successfully'
  },
  {
    id: 'SEC-003',
    check_name: 'Two-Factor Authentication (2FA) & Role RBAC Audit',
    category: 'Access Control',
    status: 'Pass',
    expiry_or_next_date: '2026-08-01',
    score: 95,
    details: 'All privileged executive logins enforced with strict RBAC'
  },
  {
    id: 'SEC-004',
    check_name: 'Hostinger UFW Firewall & Port 3000 Ingress Rules',
    category: 'Network',
    status: 'Pass',
    expiry_or_next_date: 'Continuous',
    score: 100,
    details: 'Only Ports 80 (HTTP), 443 (HTTPS), 22 (SSH Key) exposed to public'
  },
  {
    id: 'SEC-005',
    check_name: 'CCTV Storage Disk Capacity (Above 80% threshold)',
    category: 'Compliance',
    status: 'Attention Needed',
    expiry_or_next_date: '2026-07-20',
    score: 75,
    details: 'HQ Video Gateway drive is at 85% utilization; scheduled video archiving required'
  }
];

export const INITIAL_TENDERS: Tender[] = [
  {
    id: 'TND/2026/001',
    tender_name: 'BMRCL Metro Phase-2 Station Facility & Housekeeping',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    tender_ref_no: 'BMRCL/O&M/HK/2026/089',
    tendering_authority: 'Chief General Manager (O&M)',
    tender_value: 42000000,
    emd_amount: 840000,
    tender_fee: 15000,
    tender_type: 'Open',
    location: 'Bengaluru Purple & Green Lines',
    scope_of_work: 'Integrated mechanized station cleaning, waste management, facade washing and pest control for 18 stations.',
    tender_url: 'https://eproc.karnataka.gov.in/bmrcl/089',
    publication_date: '2026-08-15',
    submission_deadline: '2026-09-10', // Due in 2 days! (Red alert)
    bid_opening_date: '2026-09-12',
    pre_bid_date: '2026-08-25',
    status: 'Management Approval',
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Vikram Singh',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Pending',
    created_at: '2026-08-16T10:00:00Z',
    documents: [
      { name: 'Tender_Document_BMRCL_089.pdf', type: 'RFP Document', date: '2026-08-15' },
      { name: 'Corrigendum_1_BOQ_Revised.pdf', type: 'Corrigendum', date: '2026-08-28' },
      { name: 'PreBid_Clarification_Minutes.pdf', type: 'Minutes', date: '2026-08-26' }
    ]
  },
  {
    id: 'TND/2026/002',
    tender_name: 'Infosys Electronics City Campus Soft Services',
    client_name: 'Infosys Limited',
    tender_ref_no: 'INFY/FAC/BLR/2026/04',
    tendering_authority: 'Global Infrastructure Services',
    tender_value: 75000000,
    emd_amount: 1500000,
    tender_fee: 25000,
    tender_type: 'Limited',
    location: 'Electronics City Campus, Bengaluru',
    scope_of_work: 'Comprehensive facility management across 5 tech buildings including deep scrubbing, pantry and rest area sanitization.',
    tender_url: 'https://vendor.infosys.com/tenders/04',
    publication_date: '2026-08-20',
    submission_deadline: '2026-09-28',
    bid_opening_date: '2026-10-02',
    pre_bid_date: '2026-09-02',
    status: 'Technical Evaluation',
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Rohan Das',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Approved',
    created_at: '2026-08-21T09:30:00Z',
    documents: [
      { name: 'Infosys_RFP_Tech_Commercial.pdf', type: 'RFP Document', date: '2026-08-20' },
      { name: 'Technical_Bid_Submitted_Spoorthy.pdf', type: 'Bid Submission', date: '2026-09-04' }
    ]
  },
  {
    id: 'TND/2026/003',
    tender_name: 'Kempegowda International Airport T2 Deep Sanitization',
    client_name: 'Bangalore International Airport Ltd (BIAL)',
    tender_ref_no: 'BIAL/T2/SAN/2026/112',
    tendering_authority: 'Terminal Operations Directorate',
    tender_value: 120000000,
    emd_amount: 2400000,
    tender_fee: 50000,
    tender_type: 'Global',
    location: 'Airport Terminal 2 & Transit Hub',
    scope_of_work: 'Round-the-clock 24/7 automated autonomous scrubbing, washroom hygiene, lounge stewardship.',
    tender_url: 'https://bengaluruairport.com/procurement/112',
    publication_date: '2026-09-01',
    submission_deadline: '2026-10-15',
    bid_opening_date: '2026-10-18',
    pre_bid_date: '2026-09-18',
    status: 'Go/No-Go Review',
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Priya Patel',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Pending',
    ceo_approval: 'Pending',
    created_at: '2026-09-02T11:00:00Z',
    documents: [
      { name: 'BIAL_Terminal2_Scope_Specification.pdf', type: 'RFP Document', date: '2026-09-01' }
    ]
  },
  {
    id: 'TND/2026/004',
    tender_name: 'Manipal Hospitals State-wide Healthcare Sanitation',
    client_name: 'Manipal Health Enterprises',
    tender_ref_no: 'MHE/SAN/KA/2026/77',
    tendering_authority: 'VP Procurement & Supply Chain',
    tender_value: 31000000,
    emd_amount: 620000,
    tender_fee: 10000,
    tender_type: 'Limited',
    location: '5 Hospital Units across Karnataka',
    scope_of_work: 'ICU sanitization, biomedical waste transfer, OT sterilisation assistance.',
    publication_date: '2026-07-10',
    submission_deadline: '2026-08-15',
    bid_opening_date: '2026-08-20',
    status: 'L1 Position',
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Priya Patel',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Approved',
    created_at: '2026-07-11T08:00:00Z',
    documents: [
      { name: 'L1_Evaluation_Sheet_Official.pdf', type: 'Comparative Statement', date: '2026-08-25' }
    ]
  },
  {
    id: 'TND/2026/005',
    tender_name: 'South Western Railway Hubli Station Mechanized Cleaning',
    client_name: 'Indian Railways (SWR)',
    tender_ref_no: 'SWR/UBL/MECH/2026/03',
    tendering_authority: 'Sr. Divisional Commercial Manager',
    tender_value: 58000000,
    emd_amount: 1160000,
    tender_fee: 20000,
    tender_type: 'Open',
    location: 'Hubballi Junction & Yard',
    scope_of_work: 'Platform washings, high pressure track cleanings, waiting hall maintenance.',
    publication_date: '2026-06-01',
    submission_deadline: '2026-07-15',
    bid_opening_date: '2026-07-20',
    status: 'Work Order Received',
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_exec: 'Deepika Nair',
    operations_spoc: 'Sanjay Kumar',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Approved',
    created_at: '2026-06-02T10:00:00Z',
    documents: [
      { name: 'SWR_Work_Order_Signed.pdf', type: 'Work Order', date: '2026-08-10' }
    ]
  }
];

// -------------------------------------------------------------
// GOVERNMENT TENDER MODULE - SEED DATA
// -------------------------------------------------------------
export const INITIAL_GOVERNMENT_TENDERS: GovernmentTender[] = [
  {
    id: 'GOV/2026/001',
    government_category: 'Central',
    department: 'Ministry of Railways',
    tendering_authority: 'Sr. Divisional Commercial Manager, SWR Bengaluru',
    client_name: 'South Western Railway (SWR)',
    tender_name: 'Mechanized Cleaning of Bengaluru City & Cantonment Stations',
    nit_reference_number: 'SWR/BNC/MC/2026/NIT-047',
    portal_name: 'IREPS',
    portal_tender_id: 'IREPS-2026-SWR-047',
    tender_url: 'https://ireps.gov.in/epsn/guestApp/tenderSWR047',
    scope_of_work: 'Comprehensive mechanized cleaning including platform washing, waiting hall maintenance, toilet sanitization, track cleaning with ride-on scrubbers across 2 A1 category stations. 24×7 operations, 3 shifts, ~120 manpower.',
    location: 'Bengaluru City Junction (SBC) & Cantonment (BNC)',
    tender_type: 'Open',
    estimated_tender_value: 68000000,
    contract_period: '3 Years (Extendable by 1+1)',
    publication_date: '2026-09-01',
    doc_download_start: '2026-09-01',
    doc_download_end: '2026-09-28',
    pre_bid_meeting_date: '2026-09-15',
    query_submission_last_date: '2026-09-18',
    last_date_of_submission: '2026-10-05',
    technical_bid_opening_date: '2026-10-06',
    financial_bid_opening_date: '2026-10-20',
    bid_validity_period: '120 Days',
    emd_amount: 1360000,
    emd_mode: 'Online',
    emd_exemption_applicable: true,
    emd_exemption_type: 'MSME',
    emd_exemption_certificate_ref: 'MSME/KA/2024/UE-189765',
    tender_fee: 11800,
    processing_fee: 5000,
    estimated_pbg_percentage: 5,
    security_deposit_terms: '5% of annual contract value as PBG valid till 6 months post contract.',
    eligibility_criteria: [
      { criterion: 'Annual Turnover (Last 3 FY)', required_value: '₹20 Cr', our_value: '₹32 Cr', status: 'Met' },
      { criterion: 'Similar Work Experience (Railways)', required_value: '3 similar contracts', our_value: '2 active + 1 completed', status: 'Met' },
      { criterion: 'Average Annual Revenue from Cleaning', required_value: '₹6.8 Cr (10% of TCV)', our_value: '₹8.5 Cr', status: 'Met' },
      { criterion: 'Manpower Strength', required_value: '500+ deployed workers', our_value: '1200+ on roll', status: 'Met' },
      { criterion: 'ISO 9001:2015 Certification', required_value: 'Valid', our_value: 'Valid till 2027-12', status: 'Met' },
      { criterion: 'No Blacklisting in Last 5 Years', required_value: 'Clear', our_value: 'Clear', status: 'Met' }
    ],
    required_certificates: [
      { cert_name: 'GST Registration', cert_number: '29AABCS1234F1Z5', validity_from: '2019-07-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PAN Card', cert_number: 'AABCS1234F', validity_from: '2015-01-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PF Registration', cert_number: 'KN/BLR/12345', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'ESI Registration', cert_number: '52000123450001', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'MSME/Udyam', cert_number: 'UDYAM-KA-01-0012345', validity_from: '2024-01-15', validity_to: '2029-01-14', status: 'Valid' },
      { cert_name: 'ISO 9001:2015', cert_number: 'QMS-2024-SIS-4567', validity_from: '2024-12-01', validity_to: '2027-11-30', status: 'Valid' },
      { cert_name: 'Labour Licence', cert_number: 'LL/KA/BLR/2025/789', validity_from: '2025-04-01', validity_to: '2026-03-31', status: 'Expiring Soon' }
    ],
    dsc_holder: 'Kunal Sen (BD Head)',
    dsc_expiry: '2027-06-30',
    integrity_pact_signed: true,
    blacklisting_declaration: 'Clear',
    document_checklist: [
      { doc_name: 'Technical Bid Cover Letter', doc_type: 'Technical', mandatory: true, preparation_status: 'Ready', responsible_person: 'Deepika Nair' },
      { doc_name: 'Company Profile & Experience Certificates', doc_type: 'Technical', mandatory: true, preparation_status: 'Ready', responsible_person: 'Deepika Nair' },
      { doc_name: 'Bid Security / EMD Declaration', doc_type: 'EMD', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Neha Gupta' },
      { doc_name: 'Financial Bid BOQ (Priced)', doc_type: 'Financial', mandatory: true, preparation_status: 'In Progress', responsible_person: 'Neha Gupta' },
      { doc_name: 'DSC Signed Undertakings', doc_type: 'DSC', mandatory: true, preparation_status: 'Ready', responsible_person: 'Kunal Sen' },
      { doc_name: 'Manpower Deployment Plan (Annexure-IV)', doc_type: 'Annexure', mandatory: true, preparation_status: 'In Progress', responsible_person: 'Vikram Singh' },
      { doc_name: 'Machinery & Equipment List', doc_type: 'Annexure', mandatory: true, preparation_status: 'Ready', responsible_person: 'Vikram Singh' },
      { doc_name: 'GST / PAN / PF / ESI Certificates', doc_type: 'Certificate', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Deepika Nair' },
      { doc_name: 'Integrity Pact (Annexure-VII)', doc_type: 'Undertaking', mandatory: true, preparation_status: 'Ready', responsible_person: 'Kunal Sen' },
      { doc_name: 'Affidavit – No Blacklisting', doc_type: 'Undertaking', mandatory: true, preparation_status: 'Ready', responsible_person: 'Kunal Sen' }
    ],
    corrigendums: [
      {
        corrigendum_no: 'Corrigendum-1',
        issue_date: '2026-09-20',
        description: 'Revision in BOQ quantities and extended submission deadline',
        changes_summary: 'Platform cleaning manpower revised from 40 to 48 per station. Submission deadline extended by 5 days to 10-Oct-2026.',
        revised_submission_date: '2026-10-10',
        revised_boq: true,
        management_reviewed: true,
        reviewed_by: 'Rajesh GM',
        review_date: '2026-09-22'
      }
    ],
    evaluation_entries: [
      { stage: 'Technical Opening', date: '2026-10-06', description: '14 bidders participated. Spoorthy bid accepted for technical evaluation.', our_position: 'Technically Eligible', remarks: 'All documents verified.' }
    ],
    statutory_costs: [
      { component: 'Minimum Wages (Skilled)', applicable: true, rate_or_amount: 15908, basis: 'Per person/month (Karnataka Central)', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'Minimum Wages (Unskilled)', applicable: true, rate_or_amount: 14192, basis: 'Per person/month (Karnataka Central)', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'PF @ 13%', applicable: true, rate_or_amount: 13, basis: '% of Basic + DA', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'ESI @ 3.25%', applicable: true, rate_or_amount: 3.25, basis: '% of Gross (if < ₹21,000)', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'Bonus @ 8.33%', applicable: true, rate_or_amount: 8.33, basis: '% of Basic', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'Leave Wages (Earned Leave)', applicable: true, rate_or_amount: 1250, basis: 'Per person/month provision', validated_by_hr: true, validation_date: '2026-09-10' },
      { component: 'Uniform & Safety Gear', applicable: true, rate_or_amount: 400, basis: 'Per person/month amortized', validated_by_hr: false, remarks: 'Awaiting Operations input on PPE spec' },
      { component: 'Relief/Reliever Wages', applicable: true, rate_or_amount: 1800, basis: 'Per person/month (weekly off cover)', validated_by_hr: true, validation_date: '2026-09-10' }
    ],
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_executive: 'Deepika Nair',
    supporting_team: ['Vikram Singh', 'Neha Gupta', 'Aarav Sharma'],
    operations_spoc: 'Vikram Singh',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Pending',
    status: 'Final Bid Preparation',
    portal_login_owner: 'Kunal Sen',
    dsc_availability: 'Available',
    upload_status: 'Partial',
    eligibility_score: 95,
    created_at: '2026-09-02T09:00:00Z',
    updated_at: '2026-09-25T14:00:00Z'
  },
  {
    id: 'GOV/2026/002',
    government_category: 'State',
    department: 'Public Works Department, Karnataka',
    tendering_authority: 'Executive Engineer, PWD Bengaluru Division',
    client_name: 'Karnataka PWD',
    tender_name: 'Vidhana Soudha & MS Building Complex Housekeeping Services',
    nit_reference_number: 'PWD/BLR/HK/2026/NIT-0234',
    portal_name: 'State Portal',
    portal_tender_id: 'KAR-EPRO-2026-0234',
    tender_url: 'https://eproc.karnataka.gov.in/eprocurement/tender/0234',
    scope_of_work: 'Daily housekeeping, floor maintenance, restroom sanitization, garden upkeep for Vidhana Soudha, MS Building and attached annexe blocks. ~80 manpower.',
    location: 'Vidhana Soudha Complex, Bengaluru',
    tender_type: 'Open',
    estimated_tender_value: 35000000,
    contract_period: '2 Years',
    publication_date: '2026-08-20',
    doc_download_start: '2026-08-20',
    doc_download_end: '2026-09-15',
    pre_bid_meeting_date: '2026-09-01',
    query_submission_last_date: '2026-09-05',
    last_date_of_submission: '2026-09-20',
    technical_bid_opening_date: '2026-09-22',
    financial_bid_opening_date: '2026-10-05',
    bid_validity_period: '90 Days',
    emd_amount: 700000,
    emd_mode: 'BG',
    emd_exemption_applicable: false,
    tender_fee: 5000,
    processing_fee: 2000,
    estimated_pbg_percentage: 10,
    security_deposit_terms: '10% of contract value as PBG valid till contract end + 6 months.',
    eligibility_criteria: [
      { criterion: 'Annual Turnover (Last 3 FY)', required_value: '₹10 Cr', our_value: '₹32 Cr', status: 'Met' },
      { criterion: 'Similar Government Work Experience', required_value: '2 government contracts', our_value: '4 contracts', status: 'Met' },
      { criterion: 'Labour Licence (State)', required_value: 'Valid', our_value: 'Valid till Mar 2027', status: 'Met' },
      { criterion: 'Registration with PWD', required_value: 'Class A', our_value: 'Not Registered', status: 'Not Met', remarks: 'Application submitted on 2026-08-22' }
    ],
    required_certificates: [
      { cert_name: 'GST Registration', cert_number: '29AABCS1234F1Z5', validity_from: '2019-07-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PAN Card', cert_number: 'AABCS1234F', validity_from: '2015-01-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PF Registration', cert_number: 'KN/BLR/12345', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'ESI Registration', cert_number: '52000123450001', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'Labour Licence (Karnataka)', cert_number: 'LL/KA/BLR/2025/789', validity_from: '2025-04-01', validity_to: '2026-03-31', status: 'Expiring Soon' }
    ],
    dsc_holder: 'Kunal Sen (BD Head)',
    dsc_expiry: '2027-06-30',
    integrity_pact_signed: true,
    blacklisting_declaration: 'Clear',
    document_checklist: [
      { doc_name: 'Technical Bid Cover Letter', doc_type: 'Technical', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Deepika Nair' },
      { doc_name: 'EMD (Bank Guarantee)', doc_type: 'EMD', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Neha Gupta' },
      { doc_name: 'Financial Bid BOQ', doc_type: 'Financial', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Neha Gupta' },
      { doc_name: 'Experience Certificates (3 similar)', doc_type: 'Certificate', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Deepika Nair' },
      { doc_name: 'Affidavit – No Relation/Litigation', doc_type: 'Undertaking', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Kunal Sen' }
    ],
    corrigendums: [],
    evaluation_entries: [
      { stage: 'Technical Opening', date: '2026-09-22', description: '8 bidders participated. Spoorthy technically qualified.', our_position: 'Qualified', remarks: 'All criteria met.' },
      { stage: 'Technical Result', date: '2026-09-30', description: '6 bidders technically qualified. 2 disqualified.', our_position: 'Qualified' },
      { stage: 'Financial Opening', date: '2026-10-05', description: 'Financial bids opened. Spoorthy quoted L2.', our_position: 'L2', l1_rate: 32500000, our_rate: 34200000, rate_difference_pct: 5.23, remarks: 'L1 is Cleantech Solutions at ₹3.25 Cr/year' }
    ],
    statutory_costs: [
      { component: 'Minimum Wages (Skilled)', applicable: true, rate_or_amount: 15908, basis: 'Per person/month (Karnataka State)', validated_by_hr: true, validation_date: '2026-08-25' },
      { component: 'Minimum Wages (Unskilled)', applicable: true, rate_or_amount: 14192, basis: 'Per person/month', validated_by_hr: true, validation_date: '2026-08-25' },
      { component: 'PF @ 13%', applicable: true, rate_or_amount: 13, basis: '% of Basic + DA', validated_by_hr: true, validation_date: '2026-08-25' },
      { component: 'ESI @ 3.25%', applicable: true, rate_or_amount: 3.25, basis: '% of Gross', validated_by_hr: true, validation_date: '2026-08-25' },
      { component: 'Bonus @ 8.33%', applicable: true, rate_or_amount: 8.33, basis: '% of Basic', validated_by_hr: true, validation_date: '2026-08-25' }
    ],
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_executive: 'Deepika Nair',
    supporting_team: ['Vikram Singh', 'Neha Gupta'],
    operations_spoc: 'Vikram Singh',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Approved',
    status: 'L2 Position',
    result: 'Lost',
    result_reason: 'L2 position – rate was 5.23% above L1. L1 bidder (Cleantech Solutions) had lower overhead structure.',
    competitor_l1_rate: 32500000,
    competitor_names: 'Cleantech Solutions Pvt Ltd',
    portal_login_owner: 'Kunal Sen',
    dsc_availability: 'Available',
    upload_status: 'Complete',
    acknowledgement_receipt: 'ACK-KAR-0234-2026',
    eligibility_score: 85,
    created_at: '2026-08-21T10:00:00Z',
    updated_at: '2026-10-05T16:30:00Z'
  },
  {
    id: 'GOV/2026/003',
    government_category: 'PSU',
    department: 'BHEL - Bharat Heavy Electricals Limited',
    tendering_authority: 'General Manager (HR & Admin), BHEL Bengaluru',
    client_name: 'BHEL Electronics Division',
    tender_name: 'Annual Maintenance & Housekeeping – BHEL Mysore Road Complex',
    nit_reference_number: 'BHEL/BLR/AMC/HK/2026/RFP-12',
    portal_name: 'GeM',
    portal_tender_id: 'GEM/2026/B/4567890',
    tender_url: 'https://gem.gov.in/bid/4567890',
    scope_of_work: 'Comprehensive housekeeping of office blocks, factory floors, guest house, canteen area, landscaping. ~60 manpower. Includes pest control and deep cleaning quarterly.',
    location: 'BHEL Complex, Mysore Road, Bengaluru',
    tender_type: 'Rate Contract',
    estimated_tender_value: 28000000,
    contract_period: '2 Years',
    publication_date: '2026-09-10',
    doc_download_start: '2026-09-10',
    doc_download_end: '2026-10-01',
    pre_bid_meeting_date: '2026-09-20',
    query_submission_last_date: '2026-09-22',
    last_date_of_submission: '2026-10-05',
    technical_bid_opening_date: '2026-10-07',
    bid_validity_period: '90 Days',
    emd_amount: 560000,
    emd_mode: 'Online',
    emd_exemption_applicable: true,
    emd_exemption_type: 'MSME',
    emd_exemption_certificate_ref: 'MSME/KA/2024/UE-189765',
    tender_fee: 0,
    processing_fee: 0,
    estimated_pbg_percentage: 3,
    security_deposit_terms: '3% of annual value as PBG + 2.5% Security Deposit.',
    eligibility_criteria: [
      { criterion: 'GeM Seller Registration', required_value: 'Active', our_value: 'Active', status: 'Met' },
      { criterion: 'Annual Turnover', required_value: '₹8 Cr', our_value: '₹32 Cr', status: 'Met' },
      { criterion: 'Similar PSU Experience', required_value: '1 contract', our_value: '3 contracts', status: 'Met' },
      { criterion: 'ISO 14001 (Environment)', required_value: 'Preferred', our_value: 'Not Available', status: 'Partially Met', remarks: 'ISO 14001 application in progress' }
    ],
    required_certificates: [
      { cert_name: 'GST Registration', cert_number: '29AABCS1234F1Z5', validity_from: '2019-07-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PAN Card', cert_number: 'AABCS1234F', validity_from: '2015-01-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'MSME/Udyam', cert_number: 'UDYAM-KA-01-0012345', validity_from: '2024-01-15', validity_to: '2029-01-14', status: 'Valid' },
      { cert_name: 'GeM Seller Profile', cert_number: 'GEM-SELL-29-SIS-2024', validity_from: '2024-06-01', validity_to: '2027-05-31', status: 'Valid' }
    ],
    dsc_holder: 'Kunal Sen (BD Head)',
    dsc_expiry: '2027-06-30',
    integrity_pact_signed: false,
    blacklisting_declaration: 'Clear',
    document_checklist: [
      { doc_name: 'GeM Bid Technical Specification', doc_type: 'Technical', mandatory: true, preparation_status: 'Ready', responsible_person: 'Deepika Nair' },
      { doc_name: 'Manpower Rate Card (GeM Format)', doc_type: 'Financial', mandatory: true, preparation_status: 'In Progress', responsible_person: 'Neha Gupta' },
      { doc_name: 'Past Performance Certificates', doc_type: 'Certificate', mandatory: true, preparation_status: 'Ready', responsible_person: 'Deepika Nair' },
      { doc_name: 'MSME Certificate Upload', doc_type: 'Certificate', mandatory: true, preparation_status: 'Uploaded', responsible_person: 'Deepika Nair' }
    ],
    corrigendums: [
      {
        corrigendum_no: 'Corrigendum-1',
        issue_date: '2026-09-25',
        description: 'Additional scope of canteen area cleaning added',
        changes_summary: 'Canteen deep cleaning added to scope. Manpower revised from 55 to 60. BOQ updated.',
        revised_boq: true,
        management_reviewed: false
      }
    ],
    evaluation_entries: [],
    statutory_costs: [
      { component: 'Minimum Wages (Skilled)', applicable: true, rate_or_amount: 15908, basis: 'Per person/month', validated_by_hr: true, validation_date: '2026-09-15' },
      { component: 'Minimum Wages (Unskilled)', applicable: true, rate_or_amount: 14192, basis: 'Per person/month', validated_by_hr: true, validation_date: '2026-09-15' },
      { component: 'PF @ 13%', applicable: true, rate_or_amount: 13, basis: '% of Basic', validated_by_hr: true, validation_date: '2026-09-15' },
      { component: 'ESI @ 3.25%', applicable: true, rate_or_amount: 3.25, basis: '% of Gross', validated_by_hr: true, validation_date: '2026-09-15' },
      { component: 'Bonus @ 8.33%', applicable: true, rate_or_amount: 8.33, basis: '% of Basic', validated_by_hr: true, validation_date: '2026-09-15' },
      { component: 'Uniform Allowance', applicable: true, rate_or_amount: 500, basis: 'Per person/month amortized', validated_by_hr: true, validation_date: '2026-09-15' }
    ],
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_executive: 'Deepika Nair',
    supporting_team: ['Neha Gupta', 'Vikram Singh'],
    operations_spoc: 'Priya Patel',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Approved',
    ceo_approval: 'Not Required',
    status: 'Corrigendum/Addendum',
    portal_login_owner: 'Kunal Sen',
    dsc_availability: 'Available',
    upload_status: 'Partial',
    eligibility_score: 88,
    created_at: '2026-09-11T08:30:00Z',
    updated_at: '2026-09-26T11:00:00Z'
  },
  {
    id: 'GOV/2026/004',
    government_category: 'Municipal',
    department: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    tendering_authority: 'Chief Engineer (SWM), BBMP',
    client_name: 'BBMP',
    tender_name: 'Solid Waste Management – Zone 5 (Mahadevapura) Door-to-Door Collection',
    nit_reference_number: 'BBMP/SWM/Z5/2026/NIT-089',
    portal_name: 'State Portal',
    portal_tender_id: 'KAR-BBMP-SWM-089',
    tender_url: 'https://eproc.karnataka.gov.in/bbmp/swm/089',
    scope_of_work: 'Door-to-door waste collection, segregation, transportation to processing unit for Mahadevapura zone covering ~80,000 households. 200+ sanitation workers, 40 compactor vehicles.',
    location: 'Mahadevapura Zone, Bengaluru',
    tender_type: 'Open',
    estimated_tender_value: 180000000,
    contract_period: '5 Years',
    publication_date: '2026-07-15',
    doc_download_start: '2026-07-15',
    doc_download_end: '2026-08-10',
    pre_bid_meeting_date: '2026-07-28',
    query_submission_last_date: '2026-07-30',
    last_date_of_submission: '2026-08-15',
    technical_bid_opening_date: '2026-08-18',
    financial_bid_opening_date: '2026-09-05',
    bid_validity_period: '180 Days',
    emd_amount: 3600000,
    emd_mode: 'BG',
    emd_exemption_applicable: false,
    tender_fee: 25000,
    processing_fee: 10000,
    estimated_pbg_percentage: 5,
    security_deposit_terms: '5% of annual contract value. Performance-linked deductions for SLA violations.',
    eligibility_criteria: [
      { criterion: 'Annual Turnover (Last 3 FY)', required_value: '₹50 Cr', our_value: '₹32 Cr', status: 'Not Met', remarks: 'JV/Consortium route being explored' },
      { criterion: 'SWM Experience (Municipal)', required_value: '2 municipal contracts', our_value: '1 contract (sub-contract)', status: 'Partially Met' },
      { criterion: 'Fleet Availability (40 vehicles)', required_value: 'Own/Lease', our_value: 'Can arrange via lease', status: 'Under Review' },
      { criterion: 'Labour Licence (500+ workers)', required_value: 'Valid', our_value: 'Valid for 1200+', status: 'Met' }
    ],
    required_certificates: [
      { cert_name: 'GST Registration', cert_number: '29AABCS1234F1Z5', validity_from: '2019-07-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PAN Card', cert_number: 'AABCS1234F', validity_from: '2015-01-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'Labour Licence', cert_number: 'LL/KA/BLR/2025/789', validity_from: '2025-04-01', validity_to: '2026-03-31', status: 'Expiring Soon' },
      { cert_name: 'Pollution Control Board NOC', cert_number: 'PCB/KA/NOC/2025/456', validity_from: '2025-06-01', validity_to: '2026-05-31', status: 'Valid' }
    ],
    dsc_holder: 'Kunal Sen (BD Head)',
    dsc_expiry: '2027-06-30',
    integrity_pact_signed: true,
    blacklisting_declaration: 'Clear',
    document_checklist: [
      { doc_name: 'Technical Bid (Bound Volume)', doc_type: 'Technical', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Deepika Nair', remarks: 'Pending Go/No-Go decision' },
      { doc_name: 'EMD Bank Guarantee', doc_type: 'EMD', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Neha Gupta' },
      { doc_name: 'Vehicle Fleet Plan', doc_type: 'Annexure', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Vikram Singh' },
      { doc_name: 'Financial Bid BOQ', doc_type: 'Financial', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Neha Gupta' }
    ],
    corrigendums: [],
    evaluation_entries: [],
    statutory_costs: [
      { component: 'Minimum Wages (Safai Karmachari)', applicable: true, rate_or_amount: 16500, basis: 'Per person/month (BBMP notified rate)', validated_by_hr: false, remarks: 'BBMP has separate notified rates – HR to verify' },
      { component: 'PF @ 13%', applicable: true, rate_or_amount: 13, basis: '% of Basic', validated_by_hr: false },
      { component: 'ESI @ 3.25%', applicable: true, rate_or_amount: 3.25, basis: '% of Gross', validated_by_hr: false },
      { component: 'Bonus @ 8.33%', applicable: true, rate_or_amount: 8.33, basis: '% of Basic', validated_by_hr: false },
      { component: 'Vehicle Running Cost', applicable: true, rate_or_amount: 45000, basis: 'Per vehicle/month (diesel + maintenance)', validated_by_hr: false, remarks: 'Operations to provide actuals' }
    ],
    tender_owner: 'Kunal Sen (BD Head)',
    procurement_executive: 'Deepika Nair',
    supporting_team: ['Vikram Singh', 'Neha Gupta', 'Aarav Sharma', 'Rohan Das'],
    operations_spoc: 'Rohan Das',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Pending',
    ceo_approval: 'Pending',
    status: 'Go/No-Go',
    portal_login_owner: 'Kunal Sen',
    dsc_availability: 'Available',
    upload_status: 'Not Started',
    eligibility_score: 52,
    created_at: '2026-07-16T09:00:00Z',
    updated_at: '2026-08-01T10:00:00Z'
  }
];

export const INITIAL_TENDER_GO_NO_GOS: TenderGoNoGo[] = [
  {
    id: 'GNG-001',
    tender_id: 'TND/2026/003',
    department: 'HR',
    verdict: 'GO',
    evaluator_name: 'Aarav Sharma (HR Head)',
    evaluation_date: '2026-09-04',
    remarks: 'Manpower pool of 120 airport trained housekeeping staff can be mobilized via internal transfer and campus drive.',
    checklist: {
      'Manpower availability': true,
      'Wage implications checked': true,
      'Statutory PF/ESIC compliance verified': true,
      'Recruitment lead time': '15 days',
      'HR risk rating': 'Low'
    },
    digital_approval_ref: 'HR-DIGI-2026-9081'
  },
  {
    id: 'GNG-002',
    tender_id: 'TND/2026/003',
    department: 'Finance',
    verdict: 'GO',
    evaluator_name: 'Neha Gupta (Finance Head)',
    evaluation_date: '2026-09-04',
    remarks: 'Tender is highly profitable at 16.4% projected EBITDA. EMD ₹24L bank guarantee sanctioned by Axis Bank credit line.',
    checklist: {
      'Tender profitability': '16.4% EBITDA',
      'EMD requirement': '₹24,00,000 sanctioned',
      'PBG requirement': '₹1.20 Cr (10%) available',
      'Working capital requirement': '60 days buffer available',
      'Payment terms': '30 Days Net from client'
    },
    digital_approval_ref: 'FIN-DIGI-2026-4412'
  },
  {
    id: 'GNG-003',
    tender_id: 'TND/2026/003',
    department: 'Operations',
    verdict: 'CONDITIONAL GO',
    evaluator_name: 'Vikram Singh (Operations Head)',
    evaluation_date: '2026-09-05',
    remarks: 'Feasible provided procurement sources 4 heavy-duty ride-on scrubbing machines and 2 steam cleaners within 20 days.',
    checklist: {
      'Operational feasibility': true,
      'Machinery availability': false,
      'Deployment timeline': '30 Days',
      'Geographical feasibility': true,
      'Condition': 'Need advance capital allocation for 4 scrubber machines'
    },
    digital_approval_ref: 'OPS-DIGI-2026-7733'
  }
];

export const INITIAL_TENDER_CORRIGENDUMS: TenderCorrigendum[] = [
  {
    id: 'COR-001',
    tender_id: 'TND/2026/001',
    corrigendum_no: 'Corrigendum-01',
    issue_date: '2026-08-28',
    description: 'Revision in BOQ and submission deadline extension by 5 working days',
    changes_made: 'Added 2 interchange stations to scope; revised EMD from ₹8.0L to ₹8.4L.',
    revised_submission_date: '2026-09-10',
    revised_emd: 840000,
    revised_boq: 'BOQ Clause 4.2 revised for high-speed buffing machines.',
    action_required: 'Recalculate total bid price with revised machine specs.',
    responsible_person: 'Deepika Nair & Neha Gupta',
    reviewed_by_gm: true
  }
];

export const INITIAL_TENDER_QUERIES: TenderQuery[] = [
  {
    id: 'QRY-001',
    tender_id: 'TND/2026/001',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    date: '2026-08-22',
    communication_type: 'Pre-Bid Query',
    subject: 'Clarification regarding GST and statutory wage escalation indexation',
    query_text: 'Whether annual minimum wage hikes by Govt of Karnataka will be reimbursed 100% on actuals?',
    response_required: 'Confirm escalation clause formula under Section 12.',
    responsible_employee: 'Kunal Sen',
    due_date: '2026-08-25',
    response_sent_date: '2026-08-24',
    status: 'Responded',
    attachment_name: 'BMRCL_Clarification_Letter_Signed.pdf'
  },
  {
    id: 'QRY-002',
    tender_id: 'TND/2026/003',
    client_name: 'Bangalore International Airport Ltd (BIAL)',
    date: '2026-09-03',
    communication_type: 'Technical Clarification',
    subject: 'Autonomous robot scrubber battery charging point infrastructure',
    query_text: 'Will 3-phase charging pods be provided in Terminal 2 basement by BIAL?',
    response_required: 'BIAL engineering confirmation on dedicated power distribution.',
    responsible_employee: 'Deepika Nair',
    due_date: '2026-09-10',
    status: 'Open'
  }
];

export const INITIAL_CONTRACTS: ContractRecord[] = [
  {
    id: 'CTR-2026-01',
    tender_id: 'TND/2026/001',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    contract_name: 'BMRCL Reach-1 Station Facility Management',
    work_order_no: 'BMRCL/WO/2025/441',
    work_order_date: '2025-08-20',
    loi_date: '2025-08-05',
    loa_date: '2025-08-12',
    contract_agreement_date: '2025-08-25',
    contract_value: 38000000,
    commencement_date: '2025-09-01',
    expiry_date: '2026-10-15', // Due for renewal in ~37 days! (30-day alert active)
    extension_option: '1 Year upon satisfactory audit (>90%)',
    renewal_terms: '5% price escalation on service component',
    pbg_amount: 3800000,
    pbg_number: 'PBG-SBI-991204',
    pbg_bank: 'State Bank of India (SBI)',
    pbg_expiry: '2026-09-20', // PBG expires in 12 days! (Critical Red Flag)
    emd_status: 'Adjusted into PBG',
    client_spoc: 'Mr. Arvind Swamy (Dy. CE BMRCL)',
    internal_owner: 'Vikram Singh (Operations)',
    status: 'Under Renewal'
  },
  {
    id: 'CTR-2026-02',
    client_name: 'OmniCorp Global HQ',
    contract_name: 'OmniCorp Campus Integrated Facility Management',
    work_order_no: 'OMNI/WO/2025/119',
    work_order_date: '2025-11-15',
    loi_date: '2025-11-01',
    loa_date: '2025-11-10',
    contract_agreement_date: '2025-11-20',
    contract_value: 54000000,
    commencement_date: '2025-12-01',
    expiry_date: '2026-12-15', // Due in 98 days (90-day alert)
    extension_option: '2 Years bilateral',
    renewal_terms: 'CPI indexed',
    pbg_amount: 5400000,
    pbg_number: 'PBG-HDFC-88210',
    pbg_bank: 'HDFC Bank',
    pbg_expiry: '2027-01-15',
    emd_status: 'Refund Received',
    client_spoc: 'Ms. Shalini Raman (Facilities Director)',
    internal_owner: 'Rohan Das',
    status: 'Active'
  },
  {
    id: 'CTR-2026-03',
    client_name: 'St. Jude Health System',
    contract_name: 'St. Jude Medical Sanitization & Infection Control',
    work_order_no: 'STJ/WO/2024/902',
    work_order_date: '2024-09-10',
    loi_date: '2024-08-28',
    loa_date: '2024-09-02',
    contract_agreement_date: '2024-09-15',
    contract_value: 22000000,
    commencement_date: '2024-10-01',
    expiry_date: '2026-09-30', // Due in 22 days! (Critical Renewal Alert)
    extension_option: '1 Year renewal',
    renewal_terms: 'Subject to quarterly audit clearance',
    pbg_amount: 2200000,
    pbg_number: 'PBG-ICICI-44120',
    pbg_bank: 'ICICI Bank',
    pbg_expiry: '2026-10-31',
    emd_status: 'Refund Received',
    client_spoc: 'Dr. Ramesh Rao (Medical Superintendent)',
    internal_owner: 'Priya Patel',
    status: 'Under Renewal'
  }
];

export const INITIAL_CLIENT_ESCALATIONS: ClientEscalation[] = [
  {
    id: 'ESC-001',
    client_name: 'St. Jude Health System',
    contract_id: 'CTR-2026-03',
    date: '2026-09-06',
    nature_of_escalation: 'Delayed deployment of replacement ICU sanitization supervisor',
    severity: 'Critical',
    responsible_dept: 'Operations',
    responsible_person: 'Priya Patel',
    corrective_action: 'Relief Supervisor Priya relocated with 2 senior attendants within 6 hours.',
    target_closure_date: '2026-09-08',
    status: 'In Progress',
    ceo_gm_remarks: 'Immediate GM review mandated. Ensure no infection audit penalties.'
  },
  {
    id: 'ESC-002',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    contract_id: 'CTR-2026-01',
    date: '2026-09-02',
    nature_of_escalation: 'Delay in delivery of branded safety jackets for station night shift crew',
    severity: 'High',
    responsible_dept: 'Procurement',
    responsible_person: 'Deepika Nair',
    corrective_action: 'Expedited consignment dispatched from Uniform Krafts; 60 sets delivered.',
    target_closure_date: '2026-09-07',
    actual_closure_date: '2026-09-07',
    status: 'Resolved',
    ceo_gm_remarks: 'Vendor warned regarding delivery SLA compliance.'
  },
  {
    id: 'ESC-003',
    client_name: 'OmniCorp Global HQ',
    contract_id: 'CTR-2026-02',
    date: '2026-09-05',
    nature_of_escalation: 'Scrubber machine breakdown in cafeteria basement',
    severity: 'Medium',
    responsible_dept: 'Stores',
    responsible_person: 'Rohan Das',
    corrective_action: 'Standby scrubber machine dispatched from Central Warehouse.',
    target_closure_date: '2026-09-09',
    status: 'In Progress',
    ceo_gm_remarks: 'Stores manager to perform preventive AMC check on all backup assets.'
  }
];

export const INITIAL_EMD_REFUNDS: EmdRecord[] = [
  {
    id: 'EMD-001',
    tender_id: 'TND/2026/001',
    tender_name: 'BMRCL Metro Phase-2 Station Facility',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    amount: 840000,
    mode: 'Bank Guarantee',
    submission_date: '2026-08-20',
    validity_date: '2026-11-20',
    refund_due_date: '2026-10-30',
    refund_requested: false,
    refund_received: false,
    status: 'Valid'
  },
  {
    id: 'EMD-002',
    tender_id: 'TND/2026/004',
    tender_name: 'Manipal Hospitals Healthcare Sanitation',
    client_name: 'Manipal Health Enterprises',
    amount: 620000,
    mode: 'Online / RTGS',
    submission_date: '2026-07-15',
    validity_date: '2026-09-15', // Expiring in 7 days!
    refund_due_date: '2026-09-10',
    refund_requested: true,
    refund_received: false,
    status: 'Expiring Soon'
  },
  {
    id: 'EMD-003',
    tender_id: 'TND/2026/005',
    tender_name: 'South Western Railway Hubli Station',
    client_name: 'Indian Railways (SWR)',
    amount: 1160000,
    mode: 'Demand Draft',
    submission_date: '2026-06-10',
    validity_date: '2026-09-10',
    refund_due_date: '2026-08-20',
    refund_requested: true,
    refund_received: true,
    refund_amount_received: 1160000,
    refund_date: '2026-08-28',
    status: 'Refunded'
  }
];

export const INITIAL_PBG_GUARANTEES: PbgRecord[] = [
  {
    id: 'PBG-001',
    contract_id: 'CTR-2026-01',
    client_name: 'Bangalore Metro Rail Corp (BMRCL)',
    bg_number: 'PBG-SBI-991204',
    issuing_bank: 'State Bank of India (SBI)',
    amount: 3800000,
    issue_date: '2025-08-25',
    expiry_date: '2026-09-20', // Critical: Expiring in 12 days!
    claim_period_date: '2026-10-20',
    extension_required: true,
    released: false,
    status: 'Expiring Soon'
  },
  {
    id: 'PBG-002',
    contract_id: 'CTR-2026-02',
    client_name: 'OmniCorp Global HQ',
    bg_number: 'PBG-HDFC-88210',
    issuing_bank: 'HDFC Bank',
    amount: 5400000,
    issue_date: '2025-11-20',
    expiry_date: '2027-01-15',
    claim_period_date: '2027-02-15',
    extension_required: false,
    released: false,
    status: 'Valid'
  },
  {
    id: 'PBG-003',
    contract_id: 'CTR-2026-03',
    client_name: 'St. Jude Health System',
    bg_number: 'PBG-ICICI-44120',
    issuing_bank: 'ICICI Bank',
    amount: 2200000,
    issue_date: '2024-09-15',
    expiry_date: '2026-10-31',
    claim_period_date: '2026-11-30',
    extension_required: true,
    released: false,
    status: 'Valid'
  }
];

export const INITIAL_INDENTS: Indent[] = [
  {
    id: 'IND-101',
    indent_no: 'IND/2026/088',
    department: 'Operations',
    project_site: 'Metro Office Complex (S-201)',
    item_name: 'Custom Security Uniforms with High-Vis Reflective Strips',
    specification: 'Navy blue polyester-cotton blend with embroidered logo and reflective arm badges',
    quantity: 200,
    unit: 'Sets',
    required_by_date: '2026-09-25',
    requesting_employee: 'Vikram Singh',
    approving_authority: 'General Manager - Procurement',
    budget: 180000,
    priority: 'High',
    status: 'RFQ',
    rfq_id: 'RFQ-2026-44',
    created_at: '2026-09-01T08:30:00Z'
  },
  {
    id: 'IND-102',
    indent_no: 'IND/2026/089',
    department: 'Operations',
    project_site: 'Valley Tech Park Hub (S-203)',
    item_name: 'Heavy Duty Ride-on Floor Scrubber Dryer',
    specification: 'Battery operated, 75L recovery tank, 650mm scrubbing width, squeegee assembly',
    quantity: 2,
    unit: 'Units',
    required_by_date: '2026-09-20',
    requesting_employee: 'Rohan Das',
    approving_authority: 'CEO Office',
    budget: 650000,
    priority: 'Critical',
    status: 'Approved',
    created_at: '2026-09-03T11:00:00Z'
  },
  {
    id: 'IND-103',
    indent_no: 'IND/2026/090',
    department: 'Operations',
    project_site: 'City General Hospital (S-202)',
    item_name: 'Hospital-Grade Chemical Disinfectant Concentrate (Taski R2 & R6)',
    specification: '5 Litre can pack, antibacterial quaternary ammonium formulation',
    quantity: 50,
    unit: 'Cans (5L)',
    required_by_date: '2026-09-12',
    requesting_employee: 'Priya Patel',
    approving_authority: 'General Manager - Procurement',
    budget: 45000,
    priority: 'Critical',
    status: 'PO Issued',
    po_id: 'PO-2026-104',
    created_at: '2026-09-02T14:15:00Z'
  }
];

export const INITIAL_VENDOR_QUOTATIONS: VendorQuotation[] = [
  {
    id: 'VQ-001',
    rfq_no: 'RFQ-2026-44',
    vendor_id: 'V-104',
    vendor_name: 'Uniform Krafts & Co.',
    vendor_category: 'Uniforms & Apparel',
    rfq_sent_date: '2026-09-01',
    quotation_date: '2026-09-03',
    item_name: 'Custom Security Uniforms',
    quantity: 200,
    unit_price: 850,
    gst_pct: 12,
    freight_charges: 2000,
    discount: 5000,
    total_price: 187400,
    delivery_period_days: 10,
    payment_terms: '30 Days Credit',
    warranty: '6 Months Color Fastness',
    quotation_validity_date: '2026-10-03',
    rank: 'L1'
  },
  {
    id: 'VQ-002',
    rfq_no: 'RFQ-2026-44',
    vendor_id: 'V-101',
    vendor_name: 'Global Supplies Inc.',
    vendor_category: 'Industrial Supplies',
    rfq_sent_date: '2026-09-01',
    quotation_date: '2026-09-04',
    item_name: 'Custom Security Uniforms',
    quantity: 200,
    unit_price: 920,
    gst_pct: 12,
    freight_charges: 3500,
    discount: 2000,
    total_price: 207580,
    delivery_period_days: 14,
    payment_terms: '15 Days Credit',
    warranty: '6 Months Stitching Guarantee',
    quotation_validity_date: '2026-10-04',
    rank: 'L2'
  },
  {
    id: 'VQ-003',
    rfq_no: 'RFQ-2026-44',
    vendor_id: 'V-103',
    vendor_name: 'TechSolutions Corp',
    vendor_category: 'Apparel & Safety',
    rfq_sent_date: '2026-09-01',
    quotation_date: '2026-09-05',
    item_name: 'Custom Security Uniforms',
    quantity: 200,
    unit_price: 980,
    gst_pct: 12,
    freight_charges: 4000,
    discount: 0,
    total_price: 223520,
    delivery_period_days: 7,
    payment_terms: 'Advance 50%',
    warranty: '1 Year Full Guarantee',
    quotation_validity_date: '2026-10-05',
    rank: 'L3'
  }
];

export const INITIAL_COMPARATIVE_STATEMENTS: ComparativeStatement[] = [
  {
    id: 'CSQ-001',
    csq_number: 'CSQ/2026/044',
    rfq_no: 'RFQ-2026-44',
    item_name: 'Custom Security Uniforms (200 Sets)',
    quantity: 200,
    created_date: '2026-09-05',
    quotes: [
      {
        vendor_id: 'V-104',
        vendor_name: 'Uniform Krafts & Co.',
        basic_price: 170000,
        gst: 20400,
        freight: 2000,
        total: 187400,
        delivery: '10 Days',
        payment_terms: '30 Days Credit',
        warranty: '6 Months',
        rank: 'L1'
      },
      {
        vendor_id: 'V-101',
        vendor_name: 'Global Supplies Inc.',
        basic_price: 184000,
        gst: 22080,
        freight: 3500,
        total: 207580,
        delivery: '14 Days',
        payment_terms: '15 Days Credit',
        warranty: '6 Months',
        rank: 'L2'
      },
      {
        vendor_id: 'V-103',
        vendor_name: 'TechSolutions Corp',
        basic_price: 196000,
        gst: 23520,
        freight: 4000,
        total: 223520,
        delivery: '7 Days',
        payment_terms: 'Advance 50%',
        warranty: '1 Year',
        rank: 'L3'
      }
    ],
    selected_vendor_id: 'V-104',
    justification: 'Vendor V-104 is verified L1 with competitive 30 days credit terms and proven sample quality.',
    approval_status: 'Approved by GM'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-401',
    po_number: 'SIS-PO-2026-401',
    vendor_id: 'V-101',
    vendor_name: 'Global Supplies Inc.',
    po_date: '2026-08-10',
    items: [
      { item_name: 'Industrial Floor Scrubbers', category: 'Machinery', quantity: 3, rate: 15000, tax_pct: 18, amount: 53100 }
    ],
    subtotal: 45000,
    taxes: 8100,
    total_value: 53100,
    delivery_location: 'Central Stores Warehouse, Bengaluru',
    expected_delivery_date: '2026-08-20',
    payment_terms: '30 Days Net',
    warranty: '1 Year AMC',
    status: 'Fully Delivered',
    payment_status: 'Approved',
    approved_by: 'GM Procurement'
  },
  {
    id: 'PO-402',
    po_number: 'SIS-PO-2026-402',
    vendor_id: 'V-104',
    vendor_name: 'Uniform Krafts & Co.',
    po_date: '2026-09-06',
    items: [
      { item_name: 'Custom Security Uniforms', category: 'Uniforms', quantity: 200, rate: 850, tax_pct: 12, amount: 190400 }
    ],
    subtotal: 170000,
    taxes: 20400,
    total_value: 190400,
    delivery_location: 'Metro Office Complex (S-201)',
    expected_delivery_date: '2026-09-16',
    payment_terms: '30 Days Net',
    warranty: '6 Months',
    status: 'Released',
    payment_status: 'Under Verification',
    approved_by: 'GM Procurement'
  },
  {
    id: 'PO-403',
    po_number: 'SIS-PO-2026-403',
    vendor_id: 'V-102',
    vendor_name: 'Apex Fleet Maintenance',
    po_date: '2026-09-04',
    items: [
      { item_name: 'Heavy Duty Scrubbing Brush Sets', category: 'Tools', quantity: 10, rate: 2500, tax_pct: 18, amount: 29500 }
    ],
    subtotal: 25000,
    taxes: 4500,
    total_value: 29500,
    delivery_location: 'Valley Tech Hub (S-203)',
    expected_delivery_date: '2026-09-10',
    payment_terms: '15 Days Net',
    warranty: '3 Months',
    status: 'Acknowledged',
    payment_status: 'Invoice Received',
    approved_by: 'GM Procurement'
  }
];

export const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'STK-001',
    item_code: 'UNI-SEC-L',
    name: 'Security Guard Formal Uniform (Size L)',
    category: 'Uniforms',
    unit: 'Sets',
    opening_stock: 45,
    receipts: 100,
    issues: 80,
    adjustments: 0,
    closing_stock: 65,
    min_threshold: 20,
    unit_cost: 850,
    total_value: 55250,
    location: 'Aisle A-1, Central Stores',
    status: 'In Stock'
  },
  {
    id: 'STK-002',
    item_code: 'UNI-SEC-M',
    name: 'Security Guard Formal Uniform (Size M)',
    category: 'Uniforms',
    unit: 'Sets',
    opening_stock: 12,
    receipts: 40,
    issues: 46,
    adjustments: 0,
    closing_stock: 6, // Low stock!
    min_threshold: 15,
    unit_cost: 850,
    total_value: 5100,
    location: 'Aisle A-1, Central Stores',
    status: 'Low Stock'
  },
  {
    id: 'STK-003',
    item_code: 'PPE-SHOE-09',
    name: 'Safety Steel Toe Work Shoes (Size 9)',
    category: 'Shoes',
    unit: 'Pairs',
    opening_stock: 30,
    receipts: 50,
    issues: 45,
    adjustments: 0,
    closing_stock: 35,
    min_threshold: 15,
    unit_cost: 1200,
    total_value: 42000,
    location: 'Aisle B-2, Safety Rack',
    status: 'In Stock'
  },
  {
    id: 'STK-004',
    item_code: 'PPE-NIT-GLV',
    name: 'Medical Nitrile Gloves (Box of 100)',
    category: 'PPE',
    unit: 'Boxes',
    opening_stock: 5,
    receipts: 0,
    issues: 5,
    adjustments: 0,
    closing_stock: 0, // Zero stock!
    min_threshold: 10,
    unit_cost: 450,
    total_value: 0,
    location: 'Aisle B-3, PPE Bay',
    status: 'Zero Stock'
  },
  {
    id: 'STK-005',
    item_code: 'MCH-SCR-AUTO',
    name: 'Automatic Ride-on Scrubber Dryer Machine',
    category: 'Machinery',
    unit: 'Units',
    opening_stock: 2,
    receipts: 3,
    issues: 2,
    adjustments: 0,
    closing_stock: 3,
    min_threshold: 1,
    unit_cost: 215000,
    total_value: 645000,
    location: 'Machinery Depot Bay 1',
    status: 'In Stock'
  },
  {
    id: 'STK-006',
    item_code: 'HK-CHEM-TASKI2',
    name: 'Taski R2 All-Purpose Floor Cleaner Concentrate',
    category: 'Housekeeping Materials',
    unit: '5L Cans',
    opening_stock: 80,
    receipts: 120,
    issues: 140,
    adjustments: 0,
    closing_stock: 60,
    min_threshold: 25,
    unit_cost: 950,
    total_value: 57000,
    location: 'Chemical Storage Vault C-1',
    status: 'In Stock'
  }
];

export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'TXN-001',
    transaction_type: 'Purchase',
    item_id: 'STK-001',
    item_name: 'Security Guard Formal Uniform (Size L)',
    quantity: 100,
    date: '2026-08-22',
    reference_no: 'GRN/2026/088',
    department_or_vendor: 'Uniform Krafts & Co.',
    authorized_by: 'Stores In-charge',
    remarks: 'Received against PO-402 in pristine condition.'
  },
  {
    id: 'TXN-002',
    transaction_type: 'Issue',
    item_id: 'STK-001',
    item_name: 'Security Guard Formal Uniform (Size L)',
    quantity: 80,
    date: '2026-08-25',
    reference_no: 'ISS/2026/104',
    department_or_vendor: 'Metro Office Complex (S-201)',
    authorized_by: 'Vikram Singh',
    remarks: 'Issued to newly deployed guard platoon.'
  },
  {
    id: 'TXN-003',
    transaction_type: 'Consumption',
    item_id: 'STK-006',
    item_name: 'Taski R2 All-Purpose Floor Cleaner',
    quantity: 40,
    date: '2026-09-01',
    reference_no: 'ISS/2026/112',
    department_or_vendor: 'City General Hospital (S-202)',
    authorized_by: 'Priya Patel',
    remarks: 'Dispatched for weekly hospital ward deep disinfection.'
  }
];

export const INITIAL_GRN_RECORDS: GrnRecord[] = [
  {
    id: 'GRN-001',
    grn_number: 'GRN/2026/088',
    po_number: 'SIS-PO-2026-401',
    vendor_name: 'Global Supplies Inc.',
    dc_number: 'DC-GS-4412',
    dc_date: '2026-08-19',
    receipt_date: '2026-08-20',
    item_name: 'Industrial Floor Scrubbers',
    quantity_ordered: 3,
    quantity_received: 3,
    quantity_accepted: 3,
    quantity_rejected: 0,
    quantity_short: 0,
    quantity_damaged: 0,
    inspection_status: 'Passed',
    inspector_name: 'Stores Quality Inspector (Mahesh V.)',
    stores_entered: true
  },
  {
    id: 'GRN-002',
    grn_number: 'GRN/2026/089',
    po_number: 'SIS-PO-2026-403',
    vendor_name: 'Apex Fleet Maintenance',
    dc_number: 'DC-AFM-991',
    dc_date: '2026-09-07',
    receipt_date: '2026-09-08',
    item_name: 'Heavy Duty Scrubbing Brush Sets',
    quantity_ordered: 10,
    quantity_received: 10,
    quantity_accepted: 10,
    quantity_rejected: 0,
    quantity_short: 0,
    quantity_damaged: 0,
    inspection_status: 'Passed',
    inspector_name: 'Stores Quality Inspector (Mahesh V.)',
    stores_entered: true
  }
];

export const INITIAL_STOCK_ISSUES: StockIssue[] = [
  {
    id: 'ISS-001',
    issue_number: 'ISS/2026/104',
    date: '2026-08-25',
    employee_id: 'EMP-003',
    employee_name: 'Vikram Singh (Supervisor)',
    department: 'Operations',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    item_id: 'STK-001',
    item_name: 'Security Guard Formal Uniform (Size L)',
    quantity: 80,
    authorised_by: 'GM Procurement',
    receiver_signature: 'Vikram Singh (Verified on Site)',
    status: 'Issued'
  }
];

export const INITIAL_UNIFORM_ALLOCATIONS: UniformAllocation[] = [
  {
    id: 'UA-001',
    employee_id: 'EMP-003',
    employee_name: 'Vikram Singh',
    department: 'Operations',
    site_name: 'Metro Office Complex (S-201)',
    uniform_type: 'Supervisor Blazer',
    size: '42',
    quantity_issued: 2,
    issue_date: '2026-01-10',
    replacement_eligibility_months: 6,
    replacement_due_date: '2026-07-10', // Overdue for replacement!
    status: 'Overdue Replacement'
  },
  {
    id: 'UA-002',
    employee_id: 'EMP-005',
    employee_name: 'Rohan Das',
    department: 'Operations',
    site_name: 'Valley Tech Park Hub (S-203)',
    uniform_type: 'Security Guard Formal',
    size: 'L',
    quantity_issued: 2,
    issue_date: '2026-03-15',
    replacement_eligibility_months: 6,
    replacement_due_date: '2026-09-15', // Due in 7 days!
    status: 'Replacement Due'
  },
  {
    id: 'UA-003',
    employee_id: 'EMP-006',
    employee_name: 'Ananya Rao',
    department: 'Operations',
    site_name: 'Sunsand Beach Resort (S-204)',
    uniform_type: 'Safety Jacket',
    size: 'M',
    quantity_issued: 2,
    issue_date: '2026-05-22',
    replacement_eligibility_months: 6,
    replacement_due_date: '2026-11-22',
    status: 'Active'
  }
];

export const INITIAL_MACHINERY_ASSETS: MachineryAsset[] = [
  {
    id: 'AST-001',
    asset_id: 'EQP-SCRUB-001',
    serial_number: 'SN-TASKI-99201',
    equipment_name: 'Taski Swingo 1650 Ride-on Scrubber Dryer',
    make: 'Diversey Taski',
    model: 'Swingo 1650 B Power',
    vendor_name: 'Global Supplies Inc.',
    purchase_date: '2025-06-15',
    purchase_value: 385000,
    warranty_expiry: '2026-06-15',
    amc_status: 'Active',
    amc_vendor: 'Apex Fleet Maintenance',
    current_location: 'Metro Office Complex (S-201)',
    custodian_name: 'Vikram Singh (Supervisor)',
    condition: 'Operational',
    last_maintenance_date: '2026-08-10',
    next_maintenance_due: '2026-11-10'
  },
  {
    id: 'AST-002',
    asset_id: 'EQP-JET-002',
    serial_number: 'SN-KARCHER-5512',
    equipment_name: 'Karcher HD 7/18-4 M High Pressure Cleaner',
    make: 'Karcher',
    model: 'HD 7/18-4 M Plus',
    vendor_name: 'TechSolutions Corp',
    purchase_date: '2025-08-20',
    purchase_value: 125000,
    warranty_expiry: '2026-08-20',
    amc_status: 'Expiring',
    amc_vendor: 'Apex Fleet Maintenance',
    current_location: 'Valley Tech Park (S-203)',
    custodian_name: 'Rohan Das',
    condition: 'Under Maintenance',
    last_maintenance_date: '2026-07-15',
    next_maintenance_due: '2026-09-15'
  }
];

export const INITIAL_DAILY_PROCUREMENT_TASKS: DailyProcurementTask[] = [
  {
    id: 'DPT-001',
    task_code: 'TSK-PROC-01',
    assigned_to_name: 'Deepika Nair',
    assigned_to_email: 'deepika.nair@spoorthy.in',
    task_title: 'Finalize BMRCL Tender Technical BOQ with Operations SPOC',
    priority: 'Critical',
    reference_type: 'Tender',
    reference_no: 'TND/2026/001',
    start_date: '2026-09-08',
    due_date: '2026-09-09',
    expected_output: 'Uploaded finalized BOQ for GM digital signoff.',
    status: 'In Progress'
  },
  {
    id: 'DPT-002',
    task_code: 'TSK-PROC-02',
    assigned_to_name: 'Deepika Nair',
    assigned_to_email: 'deepika.nair@spoorthy.in',
    task_title: 'Issue PO for Hospital Chemical Disinfectant Indent IND-103',
    priority: 'High',
    reference_type: 'Procurement',
    reference_no: 'IND-103',
    start_date: '2026-09-08',
    due_date: '2026-09-08',
    expected_output: 'Generated PO-2026-104 and emailed vendor acknowledgment.',
    status: 'Completed',
    completion_date: '2026-09-08'
  },
  {
    id: 'DPT-003',
    task_code: 'TSK-PROC-03',
    assigned_to_name: 'Ramesh Chawla',
    assigned_to_email: 'ramesh.chawla@spoorthy.in',
    task_title: 'Follow up BMRCL Reach-1 PBG Bank Guarantee Renewal with SBI',
    priority: 'Critical',
    reference_type: 'Contract',
    reference_no: 'CTR-2026-01',
    start_date: '2026-09-07',
    due_date: '2026-09-08',
    expected_output: 'Obtained SBI extension confirmation letter.',
    status: 'In Progress'
  },
  {
    id: 'DPT-004',
    task_code: 'TSK-PROC-04',
    assigned_to_name: 'Deepika Nair',
    assigned_to_email: 'deepika.nair@spoorthy.in',
    task_title: 'Stores physical audit reconciliation for PPE nitrile glove stock-out',
    priority: 'High',
    reference_type: 'Stores',
    reference_no: 'STK-004',
    start_date: '2026-09-08',
    due_date: '2026-09-09',
    expected_output: 'Emergency stock indent raised and dispatched.',
    status: 'Assigned'
  }
];

export const INITIAL_EOD_REVIEWS: EodReview[] = [
  {
    id: 'EOD-001',
    employee_name: 'Deepika Nair (Procurement Exec)',
    employee_email: 'deepika.nair@spoorthy.in',
    review_date: '2026-09-07',
    completed_tasks_count: 5,
    partial_tasks_count: 1,
    delayed_tasks_count: 0,
    delay_reason: 'None',
    delay_explanation: 'All priority vendor RFQ comparisons completed on schedule.',
    tomorrow_plan: 'Submit BMRCL bid pack to GM; follow up Uniform Krafts sample shipment.',
    assistance_required: 'None',
    productivity_score: 92
  },
  {
    id: 'EOD-002',
    employee_name: 'Ramesh Chawla (Procurement Exec)',
    employee_email: 'ramesh.chawla@spoorthy.in',
    review_date: '2026-09-07',
    completed_tasks_count: 3,
    partial_tasks_count: 1,
    delayed_tasks_count: 1,
    delay_reason: 'Vendor',
    delay_explanation: 'SBI commercial branch server was down for PBG extension endorsement.',
    tomorrow_plan: 'Visit SBI zonal office in person at 10:00 AM.',
    assistance_required: 'Letter signed by Finance Head authorizing extension fee.',
    productivity_score: 75
  }
];

export const INITIAL_CRM_LEADS: CRMLead[] = [
  {
    id: 'LD-2026-001',
    lead_number: 'SIS/LD/2026/001',
    company_name: 'Zenith Infotech TechPark SEZ',
    company_type: 'Private Limited / MNC',
    industry: 'Information Technology & ITES',
    location: 'Electronic City Phase 1, Bangalore',
    address: 'Plot 45/A, Keonics Hub, Electronic City',
    city: 'Bangalore',
    pincode: '560100',
    website: 'https://zenithinfotech.com',
    contact_person: 'Raghavan Iyer',
    designation: 'Head - Workplace Resources & Administration',
    mobile: '+91 98450 12890',
    alt_mobile: '+91 80 4123 9000',
    email: 'raghavan.iyer@zenithinfotech.com',
    whatsapp: '+91 98450 12890',
    service_required: 'Facility Management',
    requirement_type: 'Full Integrated Facility & Security Management',
    lead_source: 'Direct Client Inquiry',
    assigned_to: 'Vikram Singh (Marketing Lead)',
    assigned_to_email: 'vikram.singh@spoorthy.in',
    stage: 'Proposal Submitted',
    priority: 'Critical',
    estimated_value: 3850000,
    probability_pct: 75,
    last_contact_date: '2026-09-06',
    next_followup_date: '2026-09-09',
    next_action: 'Present revised commercial SLA proposal to VP Global Ops',
    initial_discussion: 'Client seeking single vendor partner for 350,000 sq ft campus covering security, mechanised housekeeping, and electro-mechanical maintenance.',
    remarks: 'Very positive initial meeting. Current vendor contract expires in 45 days.',
    status: 'Active',
    created_date: '2026-08-20',
    documents: [
      { name: 'Zenith_RFP_Scope_Document.pdf', type: 'Scope Doc', date: '2026-08-22' },
      { name: 'Spoorthy_Commercial_Proposal_v2.pdf', type: 'Proposal', date: '2026-09-04' }
    ]
  },
  {
    id: 'LD-2026-002',
    lead_number: 'SIS/LD/2026/002',
    company_name: 'Kirloskar Precision Forgings Ltd',
    company_type: 'Public Limited',
    industry: 'Automotive & Heavy Manufacturing',
    location: 'Peenya Industrial Area 4th Phase, Bangalore',
    address: 'Survey 88, 4th Phase Peenya',
    city: 'Bangalore',
    pincode: '560058',
    website: 'https://kirloskarforgings.in',
    contact_person: 'Suresh Kumar Patil',
    designation: 'General Manager - HR & IR',
    mobile: '+91 97312 44589',
    email: 'skpatil@kirloskarforgings.in',
    whatsapp: '+91 97312 44589',
    service_required: 'Blue Collar Manpower',
    requirement_type: 'Skilled CNC Operators & Assembly Technicians',
    lead_source: 'Cold Outreach',
    assigned_to: 'Arun Kulkarni (BD Exec)',
    assigned_to_email: 'arun.k@spoorthy.in',
    stage: 'Requirement Received',
    priority: 'High',
    estimated_value: 2400000,
    probability_pct: 60,
    last_contact_date: '2026-09-05',
    next_followup_date: '2026-09-08',
    next_action: 'Submit compliance wage rate sheet & sample worker dossier',
    initial_discussion: 'Factory expanding 2 new production lines; requires 60 machine operators with ITI qualification on rotational 3 shifts.',
    remarks: 'Strict statutory compliance inspection will be audited before onboarding.',
    status: 'Active',
    created_date: '2026-08-28'
  },
  {
    id: 'LD-2026-003',
    lead_number: 'SIS/LD/2026/003',
    company_name: 'Apollo Super Specialty Hospital',
    company_type: 'Corporate Healthcare',
    industry: 'Healthcare & Life Sciences',
    location: 'Bannerghatta Road, Bangalore',
    address: '154/11, Bannerghatta Main Rd',
    city: 'Bangalore',
    pincode: '560076',
    website: 'https://apollohospitals.com',
    contact_person: 'Dr. Manjula Rao',
    designation: 'Director - Hospital Administration',
    mobile: '+91 99001 87654',
    email: 'manjula_rao@apollo.in',
    whatsapp: '+91 99001 87654',
    service_required: 'Housekeeping',
    requirement_type: 'NABH Compliant Hospital Ward Housekeeping & Patient Care Attendants',
    lead_source: 'Referral',
    assigned_to: 'Vikram Singh (Marketing Lead)',
    assigned_to_email: 'vikram.singh@spoorthy.in',
    stage: 'Quotation Sent',
    priority: 'Critical',
    estimated_value: 4200000,
    probability_pct: 80,
    last_contact_date: '2026-09-07',
    next_followup_date: '2026-09-08',
    next_action: 'Final commercial negotiation with CFO and Medical Superintendent',
    initial_discussion: 'Hospital requires 110 housekeeping attendants with hospital-grade sanitization certification and bio-medical waste training.',
    remarks: 'Spoorthy Healthcare Division credentials appreciated.',
    status: 'Active',
    created_date: '2026-08-15'
  },
  {
    id: 'LD-2026-004',
    lead_number: 'SIS/LD/2026/004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    company_type: 'E-commerce Logistics',
    industry: 'Logistics, Warehousing & Supply Chain',
    location: 'Hosakote Industrial Corridor',
    address: 'Warehouse Zone 4, Hosakote Ring Rd',
    city: 'Bangalore Rural',
    pincode: '562114',
    website: 'https://flipkart.com',
    contact_person: 'Manish Chawla',
    designation: 'Regional Operations Manager - South Hub',
    mobile: '+91 98800 33211',
    email: 'm.chawla@flipkart.com',
    whatsapp: '+91 98800 33211',
    service_required: 'Blue Collar Manpower',
    requirement_type: 'Festive Season Sorter / Loader / Material Handlers (Peak Load)',
    lead_source: 'Website / Inbound',
    assigned_to: 'Deepika Nair (Marketing Exec)',
    assigned_to_email: 'deepika.n@spoorthy.in',
    stage: 'Negotiation',
    priority: 'High',
    estimated_value: 5800000,
    probability_pct: 85,
    last_contact_date: '2026-09-07',
    next_followup_date: '2026-09-09',
    next_action: 'Sign service agreement and issue letter of intent for 220 manpower deployment',
    initial_discussion: 'Mega festive rush deployment required starting Oct 1st.',
    remarks: 'Rapid mobilization capability will win this account.',
    status: 'Active',
    created_date: '2026-08-10'
  },
  {
    id: 'LD-2026-005',
    lead_number: 'SIS/LD/2026/005',
    company_name: 'Taj Gateway Resort & Convention Center',
    company_type: 'Hospitality',
    industry: 'Hospitality, Hotels & Resorts',
    location: 'Yelahanka, Bangalore',
    address: 'International Airport Road',
    city: 'Bangalore',
    pincode: '560064',
    website: 'https://tajhotels.com',
    contact_person: 'Ashwin Merchant',
    designation: 'Chief Security Officer',
    mobile: '+91 99455 67890',
    email: 'ashwin.m@tajhotels.com',
    whatsapp: '+91 99455 67890',
    service_required: 'Security Services',
    requirement_type: 'Trained Ex-Servicemen Security & Female Frisking Officers',
    lead_source: 'Field Visit',
    assigned_to: 'Vikram Singh (Marketing Lead)',
    assigned_to_email: 'vikram.singh@spoorthy.in',
    stage: 'Won / Converted',
    priority: 'Critical',
    estimated_value: 3100000,
    probability_pct: 100,
    last_contact_date: '2026-09-04',
    next_followup_date: '2026-09-12',
    next_action: 'Site takeover & night shift briefing on Sept 15',
    initial_discussion: 'Closed 2-year contract for 45 security guards and 4 supervisors.',
    remarks: 'Contract signed. Work order #TG-2026-882 received.',
    status: 'Won',
    created_date: '2026-07-25'
  },
  {
    id: 'LD-2026-006',
    lead_number: 'SIS/LD/2026/006',
    company_name: 'Adani Logistics Multimodal Hub',
    company_type: 'Infrastructure & Port Logistics',
    industry: 'Logistics, Warehousing & Supply Chain',
    location: 'Nelamangala Highway, Bangalore',
    address: 'NH 48 KM Post 34',
    city: 'Bangalore',
    pincode: '562123',
    website: 'https://adaniports.com',
    contact_person: 'Gautam Deshmukh',
    designation: 'Procurement Specialist - Facility Services',
    mobile: '+91 96112 55901',
    email: 'gautam.deshmukh@adani.com',
    whatsapp: '+91 96112 55901',
    service_required: 'Security Services',
    requirement_type: '24/7 Gatehouse Security & Yard Patrolling Officers',
    lead_source: 'Tender / RFP Portal',
    assigned_to: 'Arun Kulkarni (BD Exec)',
    assigned_to_email: 'arun.k@spoorthy.in',
    stage: 'Meeting / Visit Scheduled',
    priority: 'High',
    estimated_value: 1950000,
    probability_pct: 50,
    last_contact_date: '2026-09-05',
    next_followup_date: '2026-09-10',
    next_action: 'Joint site survey with Adani Safety Officer',
    initial_discussion: 'Inquiry received for perimeter security across 50-acre container depot.',
    remarks: 'Requires 2 patrol vehicles and handheld RFID checkpoint wands.',
    status: 'Active',
    created_date: '2026-09-01'
  }
];

export const INITIAL_CRM_REQUIREMENTS: CRMRequirement[] = [
  {
    id: 'REQ-2026-101',
    requirement_number: 'SIS/REQ/2026/101',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    requirement_date: '2026-08-25',
    service_type: 'Facility Management',
    manpower_category: 'Mechanised Housekeeping & Technicians',
    quantity: 65,
    male_count: 45,
    female_count: 20,
    qualification: 'SSLC / ITI for Technicians',
    experience_years: '1-3 Years in Grade-A IT Park',
    skills_required: 'Ride-on scrubber operating, high-rise glass cleaning, DG set operation',
    location: 'Electronic City, Bangalore',
    shift: 'Rotational (24/7)',
    working_hours: '8 Hours / 6 Days',
    weekly_off: 'Rotational Sunday / Weekday',
    salary_or_wages: 18500,
    billing_rate: 24500,
    benefits_food: true,
    benefits_accommodation: false,
    benefits_transportation: true,
    joining_date: '2026-10-01',
    contract_period_months: 24,
    replacement_requirement: 'Within 24 hours of absenteeism notification',
    status: 'Profile/Proposal Submitted',
    assigned_executive: 'Vikram Singh',
    remarks: 'Client visited model site at Metro Complex and approved grooming standards.'
  },
  {
    id: 'REQ-2026-102',
    requirement_number: 'SIS/REQ/2026/102',
    lead_id: 'LD-2026-002',
    company_name: 'Kirloskar Precision Forgings Ltd',
    requirement_date: '2026-09-01',
    service_type: 'Blue Collar Manpower',
    manpower_category: 'CNC Machine Operators & Material Handlers',
    quantity: 60,
    male_count: 55,
    female_count: 5,
    qualification: 'ITI Machinist / Turner / Fitter',
    experience_years: '2+ Years in Automotive Forge/Machine Shop',
    skills_required: 'Fanuc CNC control, Vernier calliper precision measurement, safety protocols',
    location: 'Peenya 4th Phase, Bangalore',
    shift: 'Rotational (24/7)',
    working_hours: '8 Hours / 3 Shifts',
    weekly_off: 'Sunday',
    salary_or_wages: 19800,
    billing_rate: 26200,
    benefits_food: true,
    benefits_accommodation: true,
    benefits_transportation: false,
    joining_date: '2026-09-25',
    contract_period_months: 12,
    replacement_requirement: 'Within 48 hours for skill mismatch',
    status: 'In Discussion',
    assigned_executive: 'Arun Kulkarni',
    remarks: 'PF / ESI / Bonus statutory breakdown accepted by client GM-HR.'
  },
  {
    id: 'REQ-2026-103',
    requirement_number: 'SIS/REQ/2026/103',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    requirement_date: '2026-08-20',
    service_type: 'Housekeeping',
    manpower_category: 'Hospital Sanitization & Patient Ward Attendants',
    quantity: 110,
    male_count: 50,
    female_count: 60,
    qualification: '10th Standard passed + Hospital Training',
    experience_years: '1+ Year in NABH Hospital',
    skills_required: 'Colour-coded mops, ICU sterile zone disinfection, bio-hazard waste management',
    location: 'Bannerghatta Road, Bangalore',
    shift: 'Rotational (24/7)',
    working_hours: '8 Hours / 3 Shifts',
    weekly_off: 'Rotational',
    salary_or_wages: 17200,
    billing_rate: 23400,
    benefits_food: true,
    benefits_accommodation: false,
    benefits_transportation: false,
    joining_date: '2026-10-01',
    contract_period_months: 36,
    replacement_requirement: 'Immediate standby buffer of 10% kept at site',
    status: 'Negotiation',
    assigned_executive: 'Vikram Singh',
    remarks: 'Medical test and Hep-B vaccination mandatory before badge issue.'
  },
  {
    id: 'REQ-2026-104',
    requirement_number: 'SIS/REQ/2026/104',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    requirement_date: '2026-08-22',
    service_type: 'Blue Collar Manpower',
    manpower_category: 'Warehouse Sorters, Scanners & Pick-Pack Crew',
    quantity: 220,
    male_count: 180,
    female_count: 40,
    qualification: '10th / 12th Standard',
    experience_years: 'Freshers / 6 Months in Logistics',
    skills_required: 'Barcode scanner handling, inventory pallet stacking, fast pace',
    location: 'Hosakote Hub, Bangalore Rural',
    shift: 'Day Shift',
    working_hours: '9 Hours (with 1 hr break)',
    weekly_off: 'Rotational',
    salary_or_wages: 16500,
    billing_rate: 21800,
    benefits_food: true,
    benefits_accommodation: true,
    benefits_transportation: true,
    joining_date: '2026-09-28',
    contract_period_months: 6,
    replacement_requirement: 'Same day replacement from reserve pool',
    status: 'Approved',
    assigned_executive: 'Deepika Nair',
    remarks: 'Special festive incentive of Rs 1,500/mo tied to 100% attendance.'
  }
];

export const INITIAL_CRM_FOLLOW_UPS: CRMFollowUp[] = [
  {
    id: 'FLW-1001',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    assigned_executive: 'Vikram Singh',
    followup_date: '2026-09-08', // Due Today!
    followup_time: '11:00',
    type: 'Meeting',
    status: 'Pending',
    discussion: 'Final commercial review on bio-medical sanitization pricing with CFO and Medical Director.',
    client_response: 'CFO requested minor adjustment in supervisor billing margin.',
    next_action: 'Close contract sign-off at 11:30 AM',
    next_followup_date: '2026-09-09',
    priority: 'Critical',
    created_at: '2026-09-06'
  },
  {
    id: 'FLW-1002',
    lead_id: 'LD-2026-002',
    company_name: 'Kirloskar Precision Forgings Ltd',
    assigned_executive: 'Arun Kulkarni',
    followup_date: '2026-09-08', // Due Today!
    followup_time: '14:30',
    type: 'Phone Call',
    status: 'Pending',
    discussion: 'Verify if GM-HR has reviewed the minimum wage breakdown and statutory compliance certificate.',
    client_response: 'HR desk requested copy of latest ESI/PF inspection clearance.',
    next_action: 'Email certified compliance audit report',
    next_followup_date: '2026-09-10',
    priority: 'High',
    created_at: '2026-09-05'
  },
  {
    id: 'FLW-1003',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    assigned_executive: 'Vikram Singh',
    followup_date: '2026-09-09', // Due Tomorrow
    followup_time: '10:00',
    type: 'Client Visit',
    status: 'Pending',
    discussion: 'Campus walkthrough with Head Admin Raghavan Iyer to finalize equipment placement list.',
    client_response: 'Agreed for on-site machinery demo.',
    next_action: 'Bring equipment inventory catalog and chemical safety sheets',
    next_followup_date: '2026-09-12',
    priority: 'Critical',
    created_at: '2026-09-04'
  },
  {
    id: 'FLW-1004',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    assigned_executive: 'Deepika Nair',
    followup_date: '2026-09-07', // Overdue!
    followup_time: '16:00',
    type: 'Email',
    status: 'Pending',
    discussion: 'Send final contract master draft for legal team vetting before PO issuance.',
    client_response: 'Waiting for client legal team feedback.',
    next_action: 'Call Regional Ops Manager Manish Chawla for expedite',
    next_followup_date: '2026-09-08',
    priority: 'Critical',
    created_at: '2026-09-05'
  },
  {
    id: 'FLW-1005',
    lead_id: 'LD-2026-006',
    company_name: 'Adani Logistics Multimodal Hub',
    assigned_executive: 'Arun Kulkarni',
    followup_date: '2026-09-10', // Upcoming
    followup_time: '11:00',
    type: 'Client Visit',
    status: 'Pending',
    discussion: 'Pre-tender site inspection of 50-acre yard and discussion on perimeter lighting.',
    client_response: 'Site entry pass arranged.',
    next_action: 'Prepare safety PPE for inspection team',
    next_followup_date: '2026-09-12',
    priority: 'High',
    created_at: '2026-09-03'
  }
];

export const INITIAL_CRM_ACTIVITIES: CRMActivity[] = [
  {
    id: 'ACT-3001',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    user_name: 'Vikram Singh',
    activity_type: 'Meeting',
    activity_date: '2026-09-06',
    contact_person: 'Raghavan Iyer',
    discussion: 'Discussed scope of 350,000 sq ft facility maintenance and presented past credentials from Metro Complex.',
    client_response: 'Extremely impressed with digitized SLA tracking portal.',
    next_action: 'Deliver hardbound commercial proposal with equipment SLA guarantee',
    next_action_date: '2026-09-09'
  },
  {
    id: 'ACT-3002',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    user_name: 'Vikram Singh',
    activity_type: 'Proposal',
    activity_date: '2026-09-05',
    contact_person: 'Dr. Manjula Rao',
    discussion: 'Submitted customized hospital hygiene staffing quote for 110 personnel.',
    client_response: 'Reviewed by Procurement Committee.',
    next_action: 'F2F meeting with CFO and Medical Director',
    next_action_date: '2026-09-08'
  },
  {
    id: 'ACT-3003',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    user_name: 'Deepika Nair',
    activity_type: 'Negotiation',
    activity_date: '2026-09-04',
    contact_person: 'Manish Chawla',
    discussion: 'Commercial negotiation on overtime rates and dormitory accommodation cost sharing.',
    client_response: 'Agreed to provide on-site cafeteria subsidized meals.',
    next_action: 'Dispatch contract copy for digital e-sign',
    next_action_date: '2026-09-07'
  },
  {
    id: 'ACT-3004',
    lead_id: 'LD-2026-002',
    company_name: 'Kirloskar Precision Forgings Ltd',
    user_name: 'Arun Kulkarni',
    activity_type: 'Call',
    activity_date: '2026-09-05',
    contact_person: 'Suresh Kumar Patil',
    discussion: 'Clarified ITI certification requirement and shift timing allowances.',
    client_response: 'Requested wage calculation sheet with bonus and gratuity.',
    next_action: 'Email revised rate card',
    next_action_date: '2026-09-08'
  }
];

export const INITIAL_CRM_VISITS: CRMClientVisit[] = [
  {
    id: 'VST-501',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    visit_date: '2026-09-04',
    contact_person: 'Raghavan Iyer',
    designation: 'Head - Workplace Resources',
    purpose: 'Campus technical assessment and machine footprint evaluation',
    requirement_discussed: '65 facility staff + 12 ride-on scrubbers and scrub-sweepers',
    current_vendor: 'ISS Integrated Services (Contract expiring in 45 days)',
    existing_manpower: '52 staff (Client reported high absenteeism with existing vendor)',
    potential_manpower: 65,
    client_feedback: 'Looking for a technology-driven vendor with transparent daily attendance app.',
    competitor_info: 'Quoted Rs 41 Lakhs/mo. Our quotation of Rs 38.5 Lakhs is competitive with better tech integration.',
    outcome: 'Positive',
    next_action: 'Submit revised SLA matrix with 99.5% uptime guarantee for elevators & chillers',
    next_followup_date: '2026-09-09',
    visited_by: 'Vikram Singh (Marketing Lead) & Operations Manager',
    attachment_name: 'Zenith_Facility_Assessment_Report.pdf'
  },
  {
    id: 'VST-502',
    lead_id: 'LD-2026-005',
    company_name: 'Taj Gateway Resort & Convention Center',
    visit_date: '2026-08-30',
    contact_person: 'Ashwin Merchant',
    designation: 'Chief Security Officer',
    purpose: 'Final contract signing and security control room handover inspection',
    requirement_discussed: '45 security guards including 8 female frisking staff',
    current_vendor: 'G4S Security',
    existing_manpower: '40 guards',
    potential_manpower: 45,
    client_feedback: 'Loved our strict ex-servicemen supervisor background check process.',
    outcome: 'Converted',
    next_action: 'Conduct uniform fitting session for 45 guards on Sept 10',
    next_followup_date: '2026-09-10',
    visited_by: 'Vikram Singh & Security Operations Head'
  }
];

export const INITIAL_CRM_MEETINGS: CRMMeeting[] = [
  {
    id: 'MTG-801',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    meeting_date: '2026-10-08',
    meeting_time: '11:00 AM',
    meeting_type: 'Client Office',
    participants: 'Dr. Manjula Rao (Admin Director), Mr. Venkat (CFO), Vikram Singh (BD Lead), President / CEO',
    agenda: 'Final Commercial Review & Service Level Agreement Sign-off',
    discussion_points: '1. Fixed billing rate per bed/ward. 2. 100% bio-medical waste compliance. 3. Zero vacancy guarantee.',
    requirement_client_expectations: 'Client wants dedicated 24/7 site manager with nursing administration background.',
    commercial_discussion: 'Negotiated package at Rs 42 Lakhs/month inclusive of chemical consumables.',
    outcome: 'Positive',
    next_action: 'Issue formal work order draft & execute contract',
    next_meeting_date: '2026-10-12',
    conducted_by: 'Vikram Singh & President',
    meeting_link: 'https://meet.google.com/xyz-aplo-med',
    meeting_platform: 'Google Meet',
    meeting_link_sent: true,
    meeting_link_sent_at: '2026-10-07 16:30',
    attendee_emails: 'admin.director@apollohospitals.com, cfo@apollohospitals.com, president@spoorthy.com, vikram@spoorthy.com',
    attendee_role: 'Joint Executive',
    status: 'Scheduled',
    reminder_minutes: 60,
    reminder_sent: true,
    location: 'Apollo Super Specialty Boardroom 4B, Bengaluru'
  },
  {
    id: 'MTG-802',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    meeting_date: '2026-10-08',
    meeting_time: '03:30 PM',
    meeting_type: 'Virtual Video',
    participants: 'Manish Chawla (Ops Head Flipkart), Deepika Nair (Spoorthy), Rajesh Sharma (HR Ops)',
    agenda: 'Seasonal 220 Workforce Mobilization Timeline & Dormitory Plan',
    discussion_points: 'Recruitment drives in Hubli, Belgaum & Tumkur. Medical fitness certificates & police verification turnaround.',
    requirement_client_expectations: 'Deployment in two batches: Batch 1 (100 pax) by Oct 15, Batch 2 (120 pax) by Oct 20.',
    commercial_discussion: 'Agreed on Rs 21,800/head inclusive of statutory PF, ESIC and uniform kit.',
    outcome: 'Quotation to be Sent',
    next_action: 'Submit revised mobilization SLA with penal provisions',
    next_meeting_date: '2026-10-11',
    conducted_by: 'Deepika Nair',
    meeting_link: 'https://meet.google.com/fk-wh-ops220',
    meeting_platform: 'Google Meet',
    meeting_link_sent: true,
    meeting_link_sent_at: '2026-10-08 09:15',
    attendee_emails: 'manish.chawla@flipkart.com, deepika@spoorthy.com',
    attendee_role: 'BD Team',
    status: 'Scheduled',
    reminder_minutes: 30,
    reminder_sent: true,
    location: 'Google Meet Virtual Conference'
  },
  {
    id: 'MTG-803',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    meeting_date: '2026-10-09',
    meeting_time: '10:30 AM',
    meeting_type: 'Virtual Video',
    participants: 'Harish Kalyan (Facilities Director), President / CEO, Vikram Singh (BD Lead)',
    agenda: 'Executive Presentation on AI Robotic Scrubbers & Smart Sensor Cleaning',
    discussion_points: 'Live demo video of automated floor sweepers, IoT consumables tracking and green chemical protocol.',
    requirement_client_expectations: 'Proof of concept trial for Tower C (4 floors) before estate-wide tender award.',
    commercial_discussion: 'Proposal submitted at Rs 38.5 Lakhs/month. Potential discount 3% on annual upfront prepayment.',
    outcome: 'Follow-up Needed',
    next_action: 'Send trial pilot agreement and safety compliance docket',
    next_meeting_date: '2026-10-14',
    conducted_by: 'President / CEO & Vikram Singh',
    meeting_link: 'https://teams.microsoft.com/l/meetup-join/zenith-sis-techpark',
    meeting_platform: 'Microsoft Teams',
    meeting_link_sent: true,
    meeting_link_sent_at: '2026-10-08 14:00',
    attendee_emails: 'facilities.director@zenithinfotech.com, president@spoorthy.com',
    attendee_role: 'President',
    status: 'Scheduled',
    reminder_minutes: 1440,
    reminder_sent: true,
    location: 'Microsoft Teams Room'
  },
  {
    id: 'MTG-804',
    lead_id: 'LD-2026-002',
    company_name: 'Schneider Electric R&D Hub',
    meeting_date: '2026-10-10',
    meeting_time: '02:00 PM',
    meeting_type: 'Inhouse Conference',
    participants: 'Priya Sundaram (Procurement VP), BD Head, Security Ops Head',
    agenda: 'High-Tech Security & Access Control Manpower Vendor Finalist Round',
    discussion_points: 'Ex-servicemen quota, biometrics turnstile management, crisis quick response team (QRT).',
    requirement_client_expectations: 'ISO 27001 certified security personnel vetting protocol.',
    commercial_discussion: 'Competitive bid evaluated; Spoorthy shortlisted among top 2 contenders.',
    outcome: 'Positive',
    next_action: 'President courtesy call followed by revised security roster submission',
    next_meeting_date: '2026-10-15',
    conducted_by: 'Vikram Singh',
    meeting_link: 'https://meet.google.com/schneider-spoorthy-rnd',
    meeting_platform: 'Google Meet',
    meeting_link_sent: false,
    attendee_emails: 'priya.sundaram@se.com, bd.head@spoorthy.com',
    attendee_role: 'BD Team',
    status: 'Scheduled',
    reminder_minutes: 60,
    reminder_sent: false,
    location: 'Spoorthy Integrated HQ - Executive Boardroom'
  },
  {
    id: 'MTG-805',
    lead_id: 'LD-2026-005',
    company_name: 'Tata Electronics Precision Park',
    meeting_date: '2026-10-12',
    meeting_time: '11:30 AM',
    meeting_type: 'Virtual Video',
    participants: 'K. Ramanathan (Plant Head), Vikram Singh (BD Lead), President / CEO',
    agenda: 'Cleanroom Class 1000 Specialized Janitorial Services Contract Discussion',
    discussion_points: 'ESD protective uniforms, lint-free microfiber equipment, HEPA filtration vacuums.',
    requirement_client_expectations: 'Stringent zero-particle audit clearance certificate from third party.',
    commercial_discussion: 'High-margin niche requirement; estimated deal size Rs 55 Lakhs/month.',
    outcome: 'Quotation to be Sent',
    next_action: 'Dispatch customized cleanroom proposal with equipment certification',
    conducted_by: 'President & Vikram Singh',
    meeting_link: 'https://meet.google.com/tata-elec-cleanroom',
    meeting_platform: 'Google Meet',
    meeting_link_sent: false,
    attendee_emails: 'ramanathan@tataelectronics.com, president@spoorthy.com, vikram@spoorthy.com',
    attendee_role: 'President',
    status: 'Scheduled',
    reminder_minutes: 120,
    reminder_sent: false,
    location: 'Google Meet Virtual Boardroom'
  }
];

export const INITIAL_CRM_DIARY_TASKS: CRMDiaryTask[] = [
  {
    id: 'TSK-901',
    title: 'Pre-Meeting Executive Briefing: Apollo Hospital Board SLA',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    target_role: 'President',
    assigned_to: 'President / CEO',
    due_date: '2026-10-08',
    due_time: '10:15 AM',
    priority: 'Critical',
    status: 'Pending',
    category: 'President Reminder',
    description: 'Review final draft of Apollo work order & ensure zero vacancy clause has buffer staffing model.',
    reminder_minutes_before: 45,
    reminder_status: 'Scheduled',
    created_at: '2026-10-07 18:00',
    linked_meeting_id: 'MTG-801',
    automated_by_rule: 'RULE-02'
  },
  {
    id: 'TSK-902',
    title: 'Send Google Meet Link & Calendar Invite to Flipkart Ops Team',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    target_role: 'BD Team',
    assigned_to: 'Deepika Nair',
    due_date: '2026-10-08',
    due_time: '01:00 PM',
    priority: 'High',
    status: 'Completed',
    category: 'Meeting Follow-up',
    description: 'Meeting link generated and confirmed with Manish Chawla via Email & WhatsApp.',
    reminder_minutes_before: 60,
    reminder_status: 'Sent',
    created_at: '2026-10-07 15:00',
    completed_at: '2026-10-08 09:20',
    linked_meeting_id: 'MTG-802',
    automated_by_rule: 'RULE-01'
  },
  {
    id: 'TSK-903',
    title: 'Prepare AI Smart Cleaning Deck for Zenith Infotech SEZ',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    target_role: 'BD Team',
    assigned_to: 'Vikram Singh (BD Lead)',
    due_date: '2026-10-08',
    due_time: '05:00 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Meeting Follow-up',
    description: 'Assemble 6-slide executive deck highlighting robotic scrubber pilot metrics for President review.',
    reminder_minutes_before: 120,
    reminder_status: 'Scheduled',
    created_at: '2026-10-08 09:30',
    linked_meeting_id: 'MTG-803',
    automated_by_rule: 'RULE-03'
  },
  {
    id: 'TSK-904',
    title: 'President Strategic Review: Zenith SEZ Proposal Terms',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    target_role: 'President',
    assigned_to: 'President / CEO',
    due_date: '2026-10-09',
    due_time: '09:30 AM',
    priority: 'Critical',
    status: 'Pending',
    category: 'President Reminder',
    description: '30-minute pre-call review with Vikram before high-value client session.',
    reminder_minutes_before: 60,
    reminder_status: 'Scheduled',
    created_at: '2026-10-08 10:00',
    linked_meeting_id: 'MTG-803',
    automated_by_rule: 'RULE-02'
  },
  {
    id: 'TSK-905',
    title: 'Dispatch Cleanroom Technical Dossier to Tata Electronics',
    lead_id: 'LD-2026-005',
    company_name: 'Tata Electronics Precision Park',
    target_role: 'BD Team',
    assigned_to: 'Vikram Singh',
    due_date: '2026-10-10',
    due_time: '12:00 PM',
    priority: 'Medium',
    status: 'Pending',
    category: 'Proposal Dispatch',
    description: 'Compile ISO Class 1000 technical specifications and PPE equipment schedule.',
    reminder_minutes_before: 180,
    reminder_status: 'Scheduled',
    created_at: '2026-10-08 11:00',
    linked_meeting_id: 'MTG-805'
  },
  {
    id: 'TSK-906',
    title: 'Weekly BD Team DAR & Pipeline Audit with President',
    target_role: 'Both',
    assigned_to: 'President & BD Head',
    due_date: '2026-10-10',
    due_time: '04:30 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Team Action',
    description: 'Review weekly lead conversions, client feedback, and overdue actions across all 5 active regions.',
    reminder_minutes_before: 60,
    reminder_status: 'Scheduled',
    created_at: '2026-10-08 11:30'
  }
];

export const INITIAL_CRM_WORKFLOW_RULES: CRMWorkflowRule[] = [
  {
    id: 'RULE-01',
    name: 'Auto-Generate & Attach Secure Meeting Link',
    description: 'When any Virtual Video or Client Office meeting is scheduled in CRM, automatically provision a secure Google Meet / Teams link.',
    trigger: 'on_meeting_scheduled',
    action: 'send_meeting_link',
    is_active: true,
    target_audience: 'Both',
    auto_generate_link: true
  },
  {
    id: 'RULE-02',
    name: 'President VIP Meeting Briefing Reminder',
    description: 'Automatically creates a high-priority calendar briefing task for the President 24h & 1h prior to executive C-level meetings.',
    trigger: 'on_meeting_scheduled',
    action: 'create_president_task',
    is_active: true,
    target_audience: 'President'
  },
  {
    id: 'RULE-03',
    name: 'Post-Meeting Next Action Pipeline Dispatch',
    description: 'When meeting outcome is marked "Follow-up Needed" or "Quotation to be Sent", auto-create a 24h deadline task reminder for BD Team.',
    trigger: 'on_outcome_followup',
    action: 'create_bd_task',
    is_active: true,
    target_audience: 'BD Team'
  },
  {
    id: 'RULE-04',
    name: 'Instant Meeting Invite & Link Multi-Channel Dispatch',
    description: 'Dispatches calendar invite with Google Meet link directly to client contact & team members via Email & WhatsApp webhook.',
    trigger: 'on_meeting_scheduled',
    action: 'send_whatsapp_alert',
    is_active: true,
    target_audience: 'Both'
  },
  {
    id: 'RULE-05',
    name: 'Auto-Sync Completed Diary Events to DAR',
    description: 'Automatically logs completed meetings and finished diary tasks into the Daily Activity Report (DAR) and Lead history.',
    trigger: 'on_meeting_completed',
    action: 'sync_dar',
    is_active: true,
    target_audience: 'BD Team'
  },
  {
    id: 'RULE-06',
    name: 'Meeting Rescheduled Real-Time Participant Alert',
    description: 'Instantly dispatches updated calendar ICS and WhatsApp notification to client and executive calendar when meeting time shifts.',
    trigger: 'on_meeting_rescheduled',
    action: 'send_whatsapp_alert',
    is_active: true,
    target_audience: 'Both'
  }
];

export const INITIAL_CRM_WORKFLOW_LOGS: CRMWorkflowExecutionLog[] = [
  {
    id: 'LOG-301',
    rule_id: 'RULE-01',
    rule_name: 'Auto-Generate & Attach Secure Meeting Link',
    triggered_at: '2026-10-08 09:15',
    trigger_event: 'Meeting Scheduled: Flipkart Logistics',
    entity_id: 'MTG-802',
    entity_name: 'Flipkart Logistics Fulfillment Center',
    details: 'Provisioned Google Meet link https://meet.google.com/fk-wh-ops220 and attached to diary.',
    status: 'Success',
    recipient: 'Manish Chawla (Flipkart Ops Head)'
  },
  {
    id: 'LOG-302',
    rule_id: 'RULE-02',
    rule_name: 'President VIP Meeting Briefing Reminder',
    triggered_at: '2026-10-08 10:00',
    trigger_event: 'Meeting Scheduled: Zenith Infotech SEZ',
    entity_id: 'MTG-803',
    entity_name: 'Zenith Infotech TechPark SEZ',
    details: 'Auto-generated calendar briefing reminder TSK-904 for President / CEO.',
    status: 'Success',
    recipient: 'President / CEO'
  },
  {
    id: 'LOG-303',
    rule_id: 'RULE-04',
    rule_name: 'Instant Meeting Invite Multi-Channel Dispatch',
    triggered_at: '2026-10-08 10:05',
    trigger_event: 'Calendar Link Dispatch',
    entity_id: 'MTG-803',
    entity_name: 'Zenith Infotech TechPark SEZ',
    details: 'Calendar invite with Microsoft Teams link dispatched to facilities.director@zenithinfotech.com.',
    status: 'Alert Sent',
    recipient: 'Harish Kalyan & President'
  },
  {
    id: 'LOG-304',
    rule_id: 'RULE-05',
    rule_name: 'Auto-Sync Completed Diary Events to DAR',
    triggered_at: '2026-10-08 09:20',
    trigger_event: 'Task Completed: Send Google Meet Link',
    entity_id: 'TSK-902',
    entity_name: 'Flipkart Logistics Fulfillment Center',
    details: 'Synced task completion into Deepika Nair DAR and logged lead timeline activity.',
    status: 'Success',
    recipient: 'DAR System & Audit Trail'
  }
];

export const INITIAL_CRM_QUOTATIONS: CRMQuotation[] = [
  {
    id: 'QTN-2026-201',
    quotation_number: 'SIS/QTN/2026/201',
    lead_id: 'LD-2026-001',
    company_name: 'Zenith Infotech TechPark SEZ',
    requirement_id: 'REQ-2026-101',
    quotation_date: '2026-09-02',
    service: 'Integrated Facility Management',
    manpower_category: '65 Housekeeping, Technical & Supervisory Staff',
    quantity: 65,
    commercial_value: 3850000,
    validity_date: '2026-10-02',
    prepared_by: 'Vikram Singh',
    sent_date: '2026-09-02',
    client_response: 'Under final management review.',
    followup_date: '2026-09-09',
    status: 'Under Discussion',
    notes: 'Includes mechanized scrubbers, Diversey cleaning chemicals, and compliance warranty.',
    document_name: 'Zenith_TechPark_Commercial_Quotation_v2.pdf',
    document_type: 'pdf',
    document_size: '1.8 MB'
  },
  {
    id: 'QTN-2026-202',
    quotation_number: 'SIS/QTN/2026/202',
    lead_id: 'LD-2026-003',
    company_name: 'Apollo Super Specialty Hospital',
    requirement_id: 'REQ-2026-103',
    quotation_date: '2026-09-03',
    service: 'NABH Hospital Sanitization Manpower',
    manpower_category: '110 Hospital Ward Attendants & Cleaners',
    quantity: 110,
    commercial_value: 4200000,
    validity_date: '2026-09-30',
    prepared_by: 'Vikram Singh',
    sent_date: '2026-09-03',
    client_response: 'CFO cleared proposal; final negotiation today.',
    followup_date: '2026-09-08',
    status: 'Negotiation',
    notes: 'Hospital grade chemical consumables cost factored as pass-through.',
    document_name: 'Apollo_NABH_Commercial_Rate_Breakup.xlsx',
    document_type: 'excel',
    document_size: '420 KB'
  },
  {
    id: 'QTN-2026-203',
    quotation_number: 'SIS/QTN/2026/203',
    lead_id: 'LD-2026-004',
    company_name: 'Flipkart Logistics Fulfillment Center',
    requirement_id: 'REQ-2026-104',
    quotation_date: '2026-08-28',
    service: 'Blue Collar Logistics Workforce',
    manpower_category: '220 Warehouse Sorters & Handlers',
    quantity: 220,
    commercial_value: 5800000,
    validity_date: '2026-09-25',
    prepared_by: 'Deepika Nair',
    sent_date: '2026-08-28',
    client_response: 'Commercial terms approved in principle.',
    followup_date: '2026-09-07',
    status: 'Accepted',
    notes: 'Seasonal 6-month contract with incentive clauses.',
    document_name: 'Flipkart_Warehouse_Staffing_Agreement_Draft.docx',
    document_type: 'word',
    document_size: '850 KB'
  }
];

export const INITIAL_CRM_DARS: CRMDailyActivityReport[] = [
  {
    id: 'DAR-2026-09-07-01',
    employee_id: 'EMP-001',
    employee_name: 'Vikram Singh (Senior Marketing Manager)',
    report_date: '2026-09-07',
    new_leads_count: 2,
    calls_made_count: 8,
    emails_sent_count: 6,
    whatsapp_followups_count: 12,
    client_visits_count: 2,
    virtual_meetings_count: 1,
    inhouse_meetings_count: 1,
    requirements_received_count: 1,
    quotations_sent_count: 1,
    followups_completed_count: 5,
    activities_details: '1. Conducted commercial clarification call with Apollo Hospital CFO. 2. Visited Zenith TechPark site with equipment vendor. 3. Sent revised quote for Taj Gateway uniform allocation.',
    todays_achievements: 'Apollo Hospital CFO agreed to commercial pricing of Rs 42 Lakhs/month with zero deduction.',
    challenges_issues: 'Flipkart contract legal draft delayed by 24 hours on client end.',
    pending_activities: 'Apollo hospital final contract drafting; Kirloskar ESI/PF certificates submission.',
    tomorrow_plan: '1. F2F meeting at Apollo Hospital at 11:00 AM. 2. Walkthrough at Zenith TechPark. 3. Team pipeline review.',
    management_support_required: 'President approval on 3% equipment advance payment for Zenith TechPark.',
    status: 'Submitted',
    manager_remarks: 'Excellent progress on Apollo and Zenith deals. Ensure statutory paperwork is water-tight.',
    reviewed_by: 'President / CEO'
  },
  {
    id: 'DAR-2026-09-07-02',
    employee_id: 'EMP-002',
    employee_name: 'Arun Kulkarni (BD Executive)',
    report_date: '2026-09-07',
    new_leads_count: 3,
    calls_made_count: 15,
    emails_sent_count: 9,
    whatsapp_followups_count: 8,
    client_visits_count: 1,
    virtual_meetings_count: 0,
    inhouse_meetings_count: 1,
    requirements_received_count: 1,
    quotations_sent_count: 0,
    followups_completed_count: 7,
    activities_details: '1. Cold outreach calls to 15 manufacturing units in Peenya. 2. Followed up with Kirloskar GM-HR. 3. Sourced 3 new leads in Dabaspet industrial area.',
    todays_achievements: 'Secured site survey appointment at Adani Logistics Hub for Sept 10.',
    challenges_issues: 'Need updated statutory compliance master kit in PDF format for prospective clients.',
    pending_activities: 'Kirloskar wage breakdown dispatch.',
    tomorrow_plan: '1. Email Kirloskar wage sheet. 2. Call 12 prospective clients in Bommasandra. 3. Prepare Adani site visit checklist.',
    management_support_required: 'None',
    status: 'Approved',
    manager_remarks: 'Good cold outreach numbers. Keep pushing for manufacturing conversions.',
    reviewed_by: 'Vikram Singh'
  }
];

export const INITIAL_CRM_CLIENT_MASTERS: CRMClientMaster[] = [
  {
    id: 'CLM-001',
    client_code: 'SIS/CL/001',
    company_name: 'Apex Property Holdings (Metro Complex)',
    industry: 'Commercial Real Estate & Tech Parks',
    address: 'Survey 12, Outer Ring Road, Bellandur',
    city: 'Bangalore',
    location: 'South Region',
    gst_number: '29AAACA1234F1Z8',
    contact_persons: [
      {
        name: 'Sunil Nair',
        designation: 'VP - Facility Infrastructure',
        mobile: '+91 98450 11223',
        email: 'sunil.nair@apexproperties.com',
        whatsapp: '+91 98450 11223'
      },
      {
        name: 'Pooja Hegde',
        designation: 'Admin Manager',
        mobile: '+91 98450 99887',
        email: 'pooja.h@apexproperties.com'
      }
    ],
    services_active: ['Integrated Facility Management', 'Security Services', 'Technical Maintenance'],
    contract_start_date: '2025-10-01',
    contract_end_date: '2026-09-30', // Expiring in 23 days! Early Renewal Alert Triggered!
    current_manpower_deployed: 45,
    monthly_billing_inr: 1850000,
    payment_terms: '30 Days from Invoice',
    account_manager: 'Vikram Singh',
    client_status: 'Contract Expiring',
    remarks: 'Annual contract renewal proposal submitted with 7% escalation.'
  },
  {
    id: 'CLM-002',
    client_code: 'SIS/CL/002',
    company_name: 'St. Jude Health System (City General Hospital)',
    industry: 'Healthcare & Hospitals',
    address: '88, Hospital Road, Shivajinagar',
    city: 'Bangalore',
    location: 'North Region',
    gst_number: '29BBBCB5678G2Z1',
    contact_persons: [
      {
        name: 'Dr. Robert D’Souza',
        designation: 'Medical Superintendent',
        mobile: '+91 94480 33445',
        email: 'dr.robert@stjudehealth.org',
        whatsapp: '+91 94480 33445'
      }
    ],
    services_active: ['Housekeeping', 'Security Services', 'Patient Attendants'],
    contract_start_date: '2025-04-01',
    contract_end_date: '2027-03-31',
    current_manpower_deployed: 80,
    monthly_billing_inr: 2950000,
    payment_terms: '45 Days',
    account_manager: 'Priya Patel',
    client_status: 'Active',
    remarks: 'Audit score 88%; NABH re-inspection scheduled for November.'
  },
  {
    id: 'CLM-003',
    client_code: 'SIS/CL/003',
    company_name: 'OmniCorp Global HQ Tech Campus',
    industry: 'Information Technology',
    address: 'Whitefield Main Road, EPIP Zone',
    city: 'Bangalore',
    location: 'West Region',
    gst_number: '29CCCC8910H3Z4',
    contact_persons: [
      {
        name: 'Kavita Menon',
        designation: 'Global Real Estate Director',
        mobile: '+91 99800 66778',
        email: 'kavita.menon@omnicorp.com',
        whatsapp: '+91 99800 66778'
      }
    ],
    services_active: ['Facility Management', 'Electro-Mechanical Support', 'Security'],
    contract_start_date: '2024-06-01',
    contract_end_date: '2026-11-30', // Expiring in ~80 days!
    current_manpower_deployed: 120,
    monthly_billing_inr: 4600000,
    payment_terms: '30 Days',
    account_manager: 'Vikram Singh',
    client_status: 'Active',
    remarks: 'Client requested adding 15 night shift security guards.'
  },
  {
    id: 'CLM-004',
    client_code: 'SIS/CL/004',
    company_name: 'Taj Gateway Resort & Convention Center',
    industry: 'Hospitality & Luxury Resorts',
    address: 'International Airport Road, Yelahanka',
    city: 'Bangalore',
    location: 'South Region',
    gst_number: '29DDDDD4321J4Z5',
    contact_persons: [
      {
        name: 'Ashwin Merchant',
        designation: 'Chief Security Officer',
        mobile: '+91 99455 67890',
        email: 'ashwin.m@tajhotels.com',
        whatsapp: '+91 99455 67890'
      }
    ],
    services_active: ['Security Services'],
    contract_start_date: '2026-09-15',
    contract_end_date: '2028-09-14',
    current_manpower_deployed: 45,
    monthly_billing_inr: 3100000,
    payment_terms: '30 Days',
    account_manager: 'Vikram Singh',
    client_status: 'Active',
    remarks: 'Newly won client. Mobilization on track for Sept 15.'
  }
];

export const INITIAL_CRM_TEAM_STATUSES: CRMTeamStatus[] = [
  {
    id: 'TMS-001',
    employee_name: 'Vikram Singh',
    role_title: 'Senior Marketing Manager',
    email: 'vikram.singh@spoorthy.in',
    status: 'In Meeting',
    last_active: 'Just now',
    current_task: 'Final commercial negotiation meeting at Apollo Hospital'
  },
  {
    id: 'TMS-002',
    employee_name: 'Arun Kulkarni',
    role_title: 'Business Development Executive',
    email: 'arun.k@spoorthy.in',
    status: 'Online',
    last_active: '5 mins ago',
    current_task: 'Preparing wage breakdown for Kirloskar Forge'
  },
  {
    id: 'TMS-003',
    employee_name: 'Deepika Nair',
    role_title: 'Marketing Executive',
    email: 'deepika.n@spoorthy.in',
    status: 'On Client Visit',
    last_active: '15 mins ago',
    current_task: 'Conducting site assessment at Flipkart Hosakote Warehouse'
  },
  {
    id: 'TMS-004',
    employee_name: 'Rajesh Sharma',
    role_title: 'Tender & Compliance Officer',
    email: 'rajesh.s@spoorthy.in',
    status: 'Online',
    last_active: '2 mins ago',
    current_task: 'Drafting BMRCL Tender technical proposal response'
  }
];

export function getSeedState(): AppState {
  return {
    purchaseRequests: [...INITIAL_PURCHASE_REQUESTS],
    vendors: [...INITIAL_VENDORS],
    invoices: [...INITIAL_INVOICES],
    expenses: [...INITIAL_EXPENSES],
    leads: [...INITIAL_LEADS],
    clients: [...INITIAL_CLIENTS],
    employees: [...INITIAL_EMPLOYEES],
    attendance: [...INITIAL_ATTENDANCE],
    leaves: [...INITIAL_LEAVES],
    disciplinaryCases: [...INITIAL_DISCIPLINARY_CASES],
    sites: [...INITIAL_SITES],
    complaints: [...INITIAL_COMPLAINTS],
    incidents: [...INITIAL_INCIDENTS],
    trainings: [...INITIAL_TRAININGS],
    tasks: [...INITIAL_TASKS],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    notifications: [...INITIAL_NOTIFICATIONS],
    alerts: [...INITIAL_ALERTS],
    itApplications: [...INITIAL_IT_APPLICATIONS],
    itServerNodes: [...INITIAL_IT_SERVER_NODES],
    itTickets: [...INITIAL_IT_TICKETS],
    itSecurityChecks: [...INITIAL_IT_SECURITY_CHECKS],
    tenders: [...INITIAL_TENDERS],
    governmentTenders: [...INITIAL_GOVERNMENT_TENDERS],
    privateTenders: [],
    tenderGoNoGos: [...INITIAL_TENDER_GO_NO_GOS],
    tenderCorrigendums: [...INITIAL_TENDER_CORRIGENDUMS],
    tenderQueries: [...INITIAL_TENDER_QUERIES],
    contracts: [...INITIAL_CONTRACTS],
    clientEscalations: [...INITIAL_CLIENT_ESCALATIONS],
    emdRefunds: [...INITIAL_EMD_REFUNDS],
    pbgGuarantees: [...INITIAL_PBG_GUARANTEES],
    indents: [...INITIAL_INDENTS],
    vendorQuotations: [...INITIAL_VENDOR_QUOTATIONS],
    comparativeStatements: [...INITIAL_COMPARATIVE_STATEMENTS],
    purchaseOrders: [...INITIAL_PURCHASE_ORDERS],
    stockItems: [...INITIAL_STOCK_ITEMS],
    stockTransactions: [...INITIAL_STOCK_TRANSACTIONS],
    grnRecords: [...INITIAL_GRN_RECORDS],
    stockIssues: [...INITIAL_STOCK_ISSUES],
    uniformAllocations: [...INITIAL_UNIFORM_ALLOCATIONS],
    machineryAssets: [...INITIAL_MACHINERY_ASSETS],
    dailyProcurementTasks: [...INITIAL_DAILY_PROCUREMENT_TASKS],
    eodReviews: [...INITIAL_EOD_REVIEWS],
    crmLeads: [...INITIAL_CRM_LEADS],
    crmRequirements: [...INITIAL_CRM_REQUIREMENTS],
    crmFollowUps: [...INITIAL_CRM_FOLLOW_UPS],
    crmActivities: [...INITIAL_CRM_ACTIVITIES],
    crmVisits: [...INITIAL_CRM_VISITS],
    crmMeetings: [...INITIAL_CRM_MEETINGS],
    crmQuotations: [...INITIAL_CRM_QUOTATIONS],
    crmDars: [...INITIAL_CRM_DARS],
    crmClientMasters: [...INITIAL_CRM_CLIENT_MASTERS],
    crmTeamStatuses: [...INITIAL_CRM_TEAM_STATUSES],
    crmDiaryTasks: [...INITIAL_CRM_DIARY_TASKS],
    crmWorkflowRules: [...INITIAL_CRM_WORKFLOW_RULES],
    crmWorkflowLogs: [...INITIAL_CRM_WORKFLOW_LOGS],
    tdPlans: [...INITIAL_TD_PLANS],
    tdTrainers: [...INITIAL_TD_TRAINERS],
    tdSessions: [...INITIAL_TD_SESSIONS],
    tdComplianceRadar: [...INITIAL_TD_COMPLIANCE_RADAR],
    itProjects: [...INITIAL_IT_PROJECTS],
    itTasks: [...INITIAL_IT_TASKS],
    otherInitiatives: [...INITIAL_OTHER_INITIATIVES],
    meetings: [...INITIAL_MEETINGS],
    meetingActions: [...INITIAL_MEETING_ACTIONS],
    contextFiles: [],
    myWorkItems: [...INITIAL_MY_WORK_ITEMS],
    liveUpdates: [...INITIAL_LIVE_UPDATES],
    hrWorkforceRecords: [...INITIAL_HR_WORKFORCE_RECORDS],
    hrRequisitions: [...INITIAL_HR_REQUISITIONS],
    hrBillingSupports: [...INITIAL_HR_BILLING_SUPPORTS],
    hrClientComplaints: [...INITIAL_HR_CLIENT_COMPLAINTS],
    hrSiteVisits: [...INITIAL_HR_SITE_VISITS],
    hrUniformIdChecks: [...INITIAL_HR_UNIFORM_ID_CHECKS],
    hrStatutoryRecords: [...INITIAL_HR_STATUTORY_RECORDS],
    hrDataDefinitions: [...INITIAL_HR_DATA_DEFINITIONS],
    opsAttendanceRecords: [...INITIAL_OPS_ATTENDANCE_RECORDS],
    opsOvertimeRecords: [...INITIAL_OPS_OVERTIME_RECORDS],
    opsSiteInspections: [...INITIAL_OPS_SITE_INSPECTIONS],
    opsClientComplaints: [...INITIAL_OPS_CLIENT_COMPLAINTS],
    opsSlaCompliances: [...INITIAL_OPS_SLA_COMPLIANCES],
    opsUniformAvailabilities: [...INITIAL_OPS_UNIFORM_AVAILABILITY],
    opsIdCardCompliances: [...INITIAL_OPS_ID_CARD_COMPLIANCE],
    opsEquipmentRecords: [...INITIAL_OPS_EQUIPMENT_RECORDS],
    opsAttentionItems: [...INITIAL_OPS_ATTENTION_ITEMS],
    opsDataDefinitions: [...INITIAL_OPS_DATA_DEFINITIONS]
  };
}

export function getEmptyState(): AppState {
  return {
    purchaseRequests: [],
    vendors: [],
    invoices: [],
    expenses: [],
    leads: [],
    clients: [],
    employees: [],
    attendance: [],
    leaves: [],
    disciplinaryCases: [],
    sites: [],
    complaints: [],
    incidents: [],
    trainings: [],
    tasks: [],
    auditLogs: [],
    notifications: [],
    alerts: [],
    itApplications: [],
    itServerNodes: [],
    itTickets: [],
    itSecurityChecks: [],
    tenders: [],
    governmentTenders: [],
    privateTenders: [],
    tenderGoNoGos: [],
    tenderCorrigendums: [],
    tenderQueries: [],
    contracts: [],
    clientEscalations: [],
    emdRefunds: [],
    pbgGuarantees: [],
    indents: [],
    vendorQuotations: [],
    comparativeStatements: [],
    purchaseOrders: [],
    stockItems: [],
    stockTransactions: [],
    grnRecords: [],
    stockIssues: [],
    uniformAllocations: [],
    machineryAssets: [],
    dailyProcurementTasks: [],
    eodReviews: [],
    crmLeads: [],
    crmRequirements: [],
    crmFollowUps: [],
    crmActivities: [],
    crmVisits: [],
    crmMeetings: [],
    crmQuotations: [],
    crmDars: [],
    crmClientMasters: [],
    crmTeamStatuses: [],
    crmDiaryTasks: [],
    crmWorkflowRules: [],
    crmWorkflowLogs: [],
    tdPlans: [],
    tdTrainers: [],
    tdSessions: [],
    tdComplianceRadar: [],
    itProjects: [],
    itTasks: [],
    otherInitiatives: [],
    meetings: [],
    meetingActions: [],
    contextFiles: [],
    myWorkItems: [],
    liveUpdates: [],
    hrWorkforceRecords: [],
    hrRequisitions: [],
    hrBillingSupports: [],
    hrClientComplaints: [],
    hrSiteVisits: [],
    hrUniformIdChecks: [],
    hrStatutoryRecords: [],
    hrDataDefinitions: [],
    opsAttendanceRecords: [],
    opsOvertimeRecords: [],
    opsSiteInspections: [],
    opsClientComplaints: [],
    opsSlaCompliances: [],
    opsUniformAvailabilities: [],
    opsIdCardCompliances: [],
    opsEquipmentRecords: [],
    opsAttentionItems: [],
    opsDataDefinitions: []
  };
}
