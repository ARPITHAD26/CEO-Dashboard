export type Role = 'CEO' | 'Admin' | 'Government Tenders' | 'Private Tenders' | 'Procurement Head' | 'Finance Head' | 'BD Head' | 'HR Head' | 'Operations Head' | 'Training Head' | 'IT Head';

export interface SubRoleDefinition {
  id: string;
  name: string;
  parentRole: Role;
  description: string;
  allowedViews: string[]; // List of sub-tab IDs allowed (e.g. ['invoices', 'tasks'] for Finance)
  createdBy?: string;
  createdAt: string;
}

export interface UserAccount {
  username?: string;
  email: string;
  name: string;
  role: Role;
  subRoleId?: string; // Optional sub-role ID
  subRoleName?: string;
  allowedSubViews?: string[]; // Specific allowed sub-tabs if assigned a sub-role
  department?: string;
  twoFactorEnabled?: boolean;
}

export interface PurchaseRequest {
  id: string;
  request_no: string;
  date: string; // YYYY-MM-DD
  department: string;
  item: string;
  quantity: number;
  vendor_id: string;
  estimated_cost: number;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  po_number: string;
  delivery_date: string; // YYYY-MM-DD
  amc_status: 'Active' | 'Expired' | 'None';
  remarks: string;
}

export interface Vendor {
  id: string;
  name: string;
  vendor_code?: string;
  performance_score: number; // 0 - 100
  amc_due_date: string; // YYYY-MM-DD
  gst_number?: string;
  pan_number?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  bank_details?: string;
  categories?: string[];
  is_approved?: boolean;
  msme_status?: boolean;
  rating_quality?: number;
  rating_pricing?: number;
  rating_delivery?: number;
  rating_responsiveness?: number;
}

// -------------------------------------------------------------
// TENDER MANAGEMENT & LIFECYCLE
// -------------------------------------------------------------
export type TenderStage = 
  | 'Identified' 
  | 'Under Evaluation' 
  | 'Go/No-Go Review' 
  | 'Approved for Participation' 
  | 'Bid Preparation' 
  | 'Pre-Bid Meeting' 
  | 'Queries Raised' 
  | 'Corrigendum Review' 
  | 'Management Approval' 
  | 'Submitted' 
  | 'Bid Submitted'
  | 'Technical Evaluation' 
  | 'Technical Qualified' 
  | 'Financial Evaluation' 
  | 'L1 Position' 
  | 'LOI/LOA Received' 
  | 'Work Order Received' 
  | 'PBG & Contract' 
  | 'Contract Executed' 
  | 'Won'
  | 'Lost' 
  | 'Cancelled'
  | 'Scrapped';

export interface Tender {
  id: string; // e.g. TND/2026/001
  tender_name: string;
  client_name: string;
  tender_ref_no: string;
  tendering_authority: string;
  tender_value: number; // in INR
  emd_amount: number; // in INR
  tender_fee: number;
  tender_type: 'Open' | 'Limited' | 'Global' | 'GeM' | 'Single Bid';
  location: string;
  scope_of_work: string;
  tender_url?: string;
  publication_date: string;
  submission_deadline: string;
  bid_opening_date: string;
  pre_bid_date?: string;
  status: TenderStage;
  tender_owner: string;
  procurement_exec: string;
  operations_spoc: string;
  finance_spoc: string;
  hr_spoc: string;
  gm_approval: 'Pending' | 'Approved' | 'Rejected';
  ceo_approval: 'Pending' | 'Approved' | 'Not Required' | 'Rejected';
  loss_reason?: string;
  created_at: string;
  documents?: { name: string; type: string; date: string }[];
}

export interface TenderGoNoGo {
  id: string;
  tender_id: string;
  department: 'HR' | 'Finance' | 'Operations';
  verdict: 'GO' | 'NO-GO' | 'CONDITIONAL GO' | 'Pending';
  evaluator_name: string;
  evaluation_date: string;
  remarks: string;
  checklist: Record<string, boolean | string>;
  digital_approval_ref?: string;
}

export interface TenderCorrigendum {
  id: string;
  tender_id: string;
  corrigendum_no: string;
  issue_date: string;
  description: string;
  changes_made: string;
  revised_submission_date?: string;
  revised_boq?: string;
  revised_emd?: number;
  revised_eligibility?: string;
  action_required: string;
  responsible_person: string;
  reviewed_by_gm: boolean;
}

export interface TenderQuery {
  id: string;
  tender_id: string;
  client_name: string;
  date: string;
  communication_type: 'Pre-Bid Query' | 'Technical Clarification' | 'Commercial Terms' | 'Corrigendum Query' | 'Post-Submission';
  subject: string;
  query_text: string;
  response_required: string;
  responsible_employee: string;
  due_date: string;
  response_sent_date?: string;
  status: 'Open' | 'In Progress' | 'Responded' | 'Closed' | 'Escalated';
  attachment_name?: string;
}

export interface ContractRecord {
  id: string;
  tender_id?: string;
  client_name: string;
  contract_name: string;
  work_order_no: string;
  work_order_date: string;
  loi_date: string;
  loa_date: string;
  contract_agreement_date: string;
  contract_value: number;
  commencement_date: string;
  expiry_date: string;
  extension_option: string;
  renewal_terms: string;
  pbg_amount: number;
  pbg_number: string;
  pbg_bank: string;
  pbg_expiry: string;
  emd_status: 'Submitted' | 'Refund Requested' | 'Refund Received' | 'Adjusted into PBG';
  client_spoc: string;
  internal_owner: string;
  status: 'Active' | 'Under Renewal' | 'Extended' | 'Expired' | 'Terminated' | 'Closed';
}

export interface ClientEscalation {
  id: string;
  client_name: string;
  contract_id?: string;
  date: string;
  nature_of_escalation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  responsible_dept: 'Procurement' | 'Operations' | 'Finance' | 'HR' | 'Stores';
  responsible_person: string;
  corrective_action: string;
  target_closure_date: string;
  actual_closure_date?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  ceo_gm_remarks: string;
}

export interface EmdRecord {
  id: string;
  tender_id: string;
  tender_name: string;
  client_name: string;
  amount: number;
  mode: 'Bank Guarantee' | 'Demand Draft' | 'Online / RTGS' | 'FDR';
  submission_date: string;
  validity_date: string;
  refund_due_date: string;
  refund_requested: boolean;
  refund_received: boolean;
  refund_amount_received?: number;
  refund_date?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Refunded' | 'Forfeited';
}

export interface PbgRecord {
  id: string;
  contract_id?: string;
  client_name: string;
  bg_number: string;
  issuing_bank: string;
  amount: number;
  issue_date: string;
  expiry_date: string;
  claim_period_date: string;
  extension_required: boolean;
  released: boolean;
  release_confirmation_no?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Released';
}

// -------------------------------------------------------------
// GOVERNMENT TENDER MODULE (Separate from Private Tenders)
// -------------------------------------------------------------
export type GovTenderStage =
  | 'Tender Identified'
  | 'Documents Downloaded'
  | 'Initial Screening'
  | 'HR/Finance/Ops Review'
  | 'Go/No-Go'
  | 'Tender Preparation'
  | 'Pre-Bid Meeting'
  | 'Queries Raised'
  | 'Corrigendum/Addendum'
  | 'Final Bid Preparation'
  | 'Management Approval'
  | 'EMD/Tender Fee Payment'
  | 'Online Submission'
  | 'Technical Opening'
  | 'Technical Qualified'
  | 'Technical Disqualified'
  | 'Financial Bid Opening'
  | 'L1 Position'
  | 'L2 Position'
  | 'L3 Position'
  | 'E-Reverse Auction'
  | 'L1 Negotiation'
  | 'LOI/LOA Received'
  | 'Work Order Received'
  | 'PBG Submitted'
  | 'Contract Agreement'
  | 'Contract Execution'
  | 'Renewal/Extension'
  | 'Closed'
  | 'Won'
  | 'Lost'
  | 'Cancelled'
  | 'Re-Tendered';

export interface GovTenderEligibilityCriterion {
  criterion: string;
  required_value: string;
  our_value: string;
  status: 'Met' | 'Not Met' | 'Partially Met' | 'Under Review';
  remarks?: string;
}

export interface GovTenderDocument {
  doc_name: string;
  doc_type: 'Annexure' | 'Certificate' | 'Undertaking' | 'Technical' | 'Financial' | 'DSC' | 'EMD' | 'Other';
  mandatory: boolean;
  preparation_status: 'Not Started' | 'In Progress' | 'Ready' | 'Uploaded' | 'Not Applicable';
  responsible_person: string;
  due_date?: string;
  remarks?: string;
}

export interface GovTenderCertificate {
  cert_name: string; // GST, PAN, PF, ESI, Labour Licence, ISO, MSME, etc.
  cert_number: string;
  validity_from: string;
  validity_to: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Renewal In Progress';
}

export interface GovTenderStatutoryCost {
  component: string; // Minimum Wage, PF, ESI, Bonus, Uniform, Leave Wages, etc.
  applicable: boolean;
  rate_or_amount: number;
  basis: string; // e.g. "Per person/month", "% of basic", etc.
  validated_by_hr: boolean;
  validation_date?: string;
  remarks?: string;
}

export interface GovTenderEvaluationEntry {
  stage: 'Technical Opening' | 'Technical Result' | 'Clarification' | 'Financial Opening' | 'L-Position' | 'E-Reverse Auction' | 'Negotiation';
  date: string;
  description: string;
  our_position?: string;
  l1_rate?: number;
  our_rate?: number;
  rate_difference_pct?: number;
  remarks?: string;
}

export interface GovTenderCorrigendumEntry {
  corrigendum_no: string;
  issue_date: string;
  description: string;
  changes_summary: string;
  revised_submission_date?: string;
  revised_emd?: number;
  revised_boq?: boolean;
  revised_eligibility?: string;
  management_reviewed: boolean;
  reviewed_by?: string;
  review_date?: string;
}

export interface GovernmentTender {
  id: string; // GOV/2026/001 series
  // Tender Identification
  government_category: 'Central' | 'State' | 'PSU' | 'Municipal' | 'Other';
  department: string;
  tendering_authority: string;
  client_name: string;
  tender_name: string;
  nit_reference_number: string;
  portal_name: 'GeM' | 'CPPP' | 'State Portal' | 'IREPS' | 'Other';
  portal_tender_id: string;
  tender_url: string;
  scope_of_work: string;
  location: string;
  tender_type: 'Open' | 'Limited' | 'Single' | 'Rate Contract' | 'EOI' | 'RFP';
  estimated_tender_value: number;
  contract_period: string;

  // Dates
  publication_date: string;
  doc_download_start: string;
  doc_download_end: string;
  pre_bid_meeting_date?: string;
  query_submission_last_date?: string;
  last_date_of_submission: string;
  technical_bid_opening_date?: string;
  financial_bid_opening_date?: string;
  bid_validity_period: string;

  // Financial and Security
  emd_amount: number;
  emd_mode: 'Online' | 'DD' | 'BG' | 'Bid Security Declaration';
  emd_exemption_applicable: boolean;
  emd_exemption_type?: 'MSME' | 'Startup' | 'Other';
  emd_exemption_certificate_ref?: string;
  tender_fee: number;
  processing_fee: number;
  estimated_pbg_percentage: number;
  security_deposit_terms: string;

  // Eligibility & Compliance
  eligibility_criteria: GovTenderEligibilityCriterion[];
  review_considerations?: Record<string, boolean>;
  required_certificates: GovTenderCertificate[];
  dsc_holder: string;
  dsc_expiry: string;
  integrity_pact_signed: boolean;
  blacklisting_declaration: 'Clear' | 'Pending' | 'Issue Found';

  // Document Checklist
  document_checklist: GovTenderDocument[];

  // Corrigendum Register
  corrigendums: GovTenderCorrigendumEntry[];

  // Evaluation Tracker
  evaluation_entries: GovTenderEvaluationEntry[];

  // Statutory Cost Check (HR Review)
  statutory_costs: GovTenderStatutoryCost[];

  // Responsibility
  tender_owner: string;
  procurement_executive: string;
  supporting_team: string[];
  operations_spoc: string;
  finance_spoc: string;
  hr_spoc: string;
  gm_approval: 'Pending' | 'Approved' | 'Rejected';
  ceo_approval: 'Pending' | 'Approved' | 'Not Required' | 'Rejected';

  // Status & Result
  status: GovTenderStage;
  result?: 'Won' | 'Lost' | 'Cancelled' | 'Re-Tendered';
  result_reason?: string;
  competitor_l1_rate?: number;
  competitor_names?: string;

  // Portal Tracking
  portal_login_owner: string;
  dsc_availability: 'Available' | 'Not Available' | 'Expired';
  upload_status: 'Not Started' | 'Partial' | 'Complete' | 'Acknowledged';
  acknowledgement_receipt?: string;

  // Eligibility Readiness Score
  eligibility_score?: number; // 0-100

  created_at: string;
  updated_at?: string;
}

// -------------------------------------------------------------
// PROCUREMENT, RFQ & CSQ
// -------------------------------------------------------------
export interface Indent {
  id: string;
  indent_no: string;
  department: string;
  project_site: string;
  item_name: string;
  specification: string;
  quantity: number;
  unit: string;
  required_by_date: string;
  requesting_employee: string;
  approving_authority: string;
  budget: number;
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  status: 'Raised' | 'Approved' | 'RFQ' | 'PO Issued' | 'Delivered' | 'Closed' | 'Rejected';
  rfq_id?: string;
  po_id?: string;
  created_at: string;
}

export interface VendorQuotation {
  id: string;
  rfq_no: string;
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  rfq_sent_date: string;
  quotation_date: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  gst_pct: number;
  freight_charges: number;
  discount: number;
  total_price: number;
  delivery_period_days: number;
  payment_terms: string;
  warranty: string;
  quotation_validity_date: string;
  rank?: 'L1' | 'L2' | 'L3' | 'Disqualified';
}

export interface ComparativeStatement {
  id: string;
  csq_number: string;
  rfq_no: string;
  item_name: string;
  quantity: number;
  created_date: string;
  quotes: {
    vendor_id: string;
    vendor_name: string;
    basic_price: number;
    gst: number;
    freight: number;
    total: number;
    delivery: string;
    payment_terms: string;
    warranty: string;
    rank: 'L1' | 'L2' | 'L3';
  }[];
  selected_vendor_id: string;
  justification: string;
  approval_status: 'Draft' | 'Submitted for Approval' | 'Approved by GM' | 'Approved by CEO' | 'Rejected';
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  po_date: string;
  items: {
    item_id?: string;
    item_name: string;
    category: string;
    quantity: number;
    rate: number;
    tax_pct: number;
    amount: number;
  }[];
  subtotal: number;
  taxes: number;
  total_value: number;
  delivery_location: string;
  expected_delivery_date: string;
  payment_terms: string;
  warranty: string;
  status: 'Draft' | 'Approval' | 'Released' | 'Acknowledged' | 'Partially Delivered' | 'Fully Delivered' | 'Closed' | 'Cancelled';
  payment_status: 'Invoice Received' | 'Under Verification' | 'Approved' | 'Payment Pending' | 'Payment Released' | 'Overdue';
  approved_by: string;
}

// -------------------------------------------------------------
// STORES, INVENTORY & ASSETS
// -------------------------------------------------------------
export type StoreCategory = 
  | 'Uniforms' 
  | 'Shoes' 
  | 'PPE' 
  | 'Machinery' 
  | 'Tools' 
  | 'Office Equipment' 
  | 'Computers' 
  | 'Printers' 
  | 'Stationery' 
  | 'Consumables' 
  | 'Electrical Items' 
  | 'Housekeeping Materials' 
  | 'Other Assets';

export interface StockItem {
  id: string;
  item_code: string;
  name: string;
  category: StoreCategory;
  unit: string;
  opening_stock: number;
  receipts: number;
  issues: number;
  adjustments: number;
  closing_stock: number;
  min_threshold: number;
  unit_cost: number;
  unit_rate?: number;
  total_value: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Zero Stock' | 'Obsolete';
}

export type StockIssueRecord = StockIssue;

export interface StockTransaction {
  id: string;
  transaction_type: 'Purchase' | 'Return' | 'Transfer In' | 'Adjustment In' | 'Issue' | 'Transfer Out' | 'Consumption' | 'Damage' | 'Return to Vendor';
  item_id: string;
  item_name: string;
  quantity: number;
  date: string;
  reference_no: string; // e.g. GRN-101, ISS-502
  department_or_vendor: string;
  authorized_by: string;
  remarks: string;
}

export interface GrnRecord {
  id: string;
  grn_number: string;
  po_number: string;
  vendor_name: string;
  dc_number: string;
  dc_date: string;
  receipt_date: string;
  item_name: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  quantity_short: number;
  quantity_damaged: number;
  inspection_status: 'Pending' | 'Passed' | 'Rejected' | 'Passed with Deviation';
  inspector_name: string;
  stores_entered: boolean;
}

export interface StockIssue {
  id: string;
  issue_number: string;
  date: string;
  employee_id: string;
  employee_name: string;
  department: string;
  site_id: string;
  site_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  authorised_by: string;
  receiver_signature: string;
  status: 'Issued' | 'Returned';
}

export interface UniformAllocation {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  site_name: string;
  uniform_type: 'Security Guard Formal' | 'Housekeeping Set' | 'Supervisor Blazer' | 'Safety Jacket' | 'Technical Coverall';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '38' | '40' | '42' | '44';
  quantity_issued: number;
  issue_date: string;
  replacement_eligibility_months: number;
  replacement_due_date: string;
  status: 'Active' | 'Replacement Due' | 'Overdue Replacement' | 'Returned';
}

export interface MachineryAsset {
  id: string;
  asset_id: string;
  serial_number: string;
  equipment_name: string;
  make: string;
  model: string;
  vendor_name: string;
  purchase_date: string;
  purchase_value: number;
  warranty_expiry: string;
  amc_status: 'Active' | 'Expiring' | 'Expired' | 'None';
  amc_vendor: string;
  current_location: string;
  custodian_name: string;
  condition: 'Operational' | 'Under Maintenance' | 'Breakdown' | 'Decommissioned';
  last_maintenance_date: string;
  next_maintenance_due: string;
}

// -------------------------------------------------------------
// DAILY TASK MANAGEMENT & EOD REVIEWS
// -------------------------------------------------------------
export interface DailyProcurementTask {
  id: string;
  task_code: string;
  assigned_to_name: string;
  assigned_to_email?: string;
  task_title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Normal' | 'Routine';
  related_to?: 'Tender' | 'Indent' | 'Contract' | 'Stores' | 'Vendor' | 'General';
  related_ref_id?: string;
  reference_type?: 'Tender' | 'Procurement' | 'Stores' | 'Vendor' | 'Contract' | 'General';
  reference_no?: string;
  date?: string;
  start_date?: string;
  due_date: string;
  expected_output: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Partially Completed' | 'Delayed' | 'Not Completed' | 'Overdue';
  completion_date?: string;
  delay_reason?: string;
  created_at?: string;
}

export interface EodReview {
  id: string;
  employee_name: string;
  employee_email?: string;
  date?: string;
  review_date?: string;
  tasks_assigned?: number;
  tasks_completed?: number;
  tasks_delayed?: number;
  completed_tasks_count?: number;
  partial_tasks_count?: number;
  delayed_tasks_count?: number;
  delay_reason?: string;
  delay_reason_category?: 'Vendor' | 'Client' | 'Internal' | 'Management' | 'Other';
  delay_explanation: string;
  tomorrow_plan: string;
  assistance_needed?: string;
  assistance_required?: string;
  productivity_score: number; // 0-100
  reviewed_by_gm?: boolean;
}

export type EodReviewRecord = EodReview;

export interface Invoice {
  id: string;
  client_id: string;
  invoice_no: string;
  invoice_date: string; // YYYY-MM-DD
  amount: number;
  payment_received: number;
  outstanding: number; // amount - payment_received
  remarks: string;
}

export interface Expense {
  id: string;
  expense_head: string;
  budget: number;
  actual: number;
  date: string; // YYYY-MM-DD
  remarks: string;
}

export interface Lead {
  id: string;
  lead_name: string;
  client_id: string;
  contact_person: string;
  meeting_date: string; // YYYY-MM-DD
  proposal_status: 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Won' | 'Lost';
  tender_status: 'Not Started' | 'In Progress' | 'Submitted' | 'Won' | 'Lost';
  estimated_value: number;
  probability_pct: number; // 0 - 100
  expected_closure: string; // YYYY-MM-DD
  remarks: string;
}

export interface Client {
  id: string;
  name: string;
  region: string;
}

export interface Employee {
  id: string;
  name: string;
  employee_id: string;
  department: string;
  site_id: string;
  doj: string; // YYYY-MM-DD
  vacancy_status: 'Filled' | 'Vacant';
  exit_status: 'Active' | 'Resigned' | 'Terminated';
  remarks: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'On Leave';
}

export interface Leave {
  id: string;
  employee_id: string;
  type: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DisciplinaryCase {
  id: string;
  employee_id: string;
  type: string;
  status: 'Open' | 'Closed';
  date: string; // YYYY-MM-DD
  remarks: string;
}

export interface Site {
  id: string;
  name: string;
  client_id: string;
  required_manpower: number;
  deployed_manpower: number;
  supervisor_id: string; // Employee ID
  audit_score: number; // 0-100
  site_health: 'Green' | 'Amber' | 'Red';
  region: string;
}

export interface Complaint {
  id: string;
  site_id: string;
  date: string; // YYYY-MM-DD
  category: string;
  status: 'Open' | 'Resolved';
}

export interface Incident {
  id: string;
  site_id: string;
  date: string; // YYYY-MM-DD
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface Training {
  id: string;
  employee_id: string;
  site_id: string;
  training_name: string;
  training_date: string; // YYYY-MM-DD
  trainer: string;
  competency_score: number; // 0-100
  certification_status: 'Active' | 'Expired' | 'Pending';
  next_due_date: string; // YYYY-MM-DD
  remarks: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_by: string; // email/name
  assigned_to: string; // email/name/department
  department: string; // target department
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  due_date: string; // YYYY-MM-DD
  deadline?: string; // alias for due_date
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  percent_completed: number; // 0-100
  evidence_url?: string;
  remarks: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: string;
  entity_id: string;
  before_value?: string;
  after_value?: string;
  timestamp: string; // ISO String
}

export interface Notification {
  id: string;
  user_id: string; // email or 'all'
  type: string;
  message: string;
  read_status: 'Read' | 'Unread';
  created_at: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  related_entity: string;
  related_id: string;
  acknowledged: boolean;
  created_at: string;
}

export interface ITApplication {
  id: string;
  name: string;
  category: 'Web App' | 'Mobile API' | 'Database' | 'Core Infrastructure' | 'Internal Tool' | 'Third-Party SaaS';
  url: string;
  host_type: 'Hostinger VPS' | 'Cloud / CDN' | 'Local On-Premises' | 'SaaS';
  status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  uptime_pct: number; // e.g. 99.98
  latency_ms: number; // e.g. 42
  version: string;
  last_checked: string; // ISO / datetime string
  owner: string;
  description: string;
}

export interface ITServerNode {
  id: string;
  node_name: string;
  ip_address: string;
  role_type: 'Application Server' | 'Database Server' | 'Network Gateway' | 'Backup Vault';
  cpu_usage_pct: number;
  memory_usage_pct: number;
  disk_usage_pct: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  location: string;
  last_ping: string;
}

export interface ITTicket {
  id: string;
  ticket_no: string;
  subject: string;
  requested_by: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Hardware / Laptop' | 'Software Access' | 'Network / VPN' | 'Biometric Device' | 'Email & Security';
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface ITSecurityCheck {
  id: string;
  check_name: string;
  category: 'Certificate' | 'Backup' | 'Access Control' | 'Network' | 'Compliance';
  status: 'Pass' | 'Attention Needed' | 'Critical Failure';
  expiry_or_next_date: string;
  score: number;
  details: string;
}

export type PrivateTenderStage =
  | 'Enquiry Received' | 'NDA' | 'Requirement Understanding / Site Visit' | 'Initial Screening'
  | 'HR / Finance / Operations Review' | 'GO / NO-GO' | 'Proposal Preparation' | 'Clarifications / Queries'
  | 'Technical Presentation' | 'Commercial Proposal Submission' | 'Negotiation' | 'Management Approval of Final Offer'
  | 'Final Offer Submitted' | 'Client Decision' | 'LOI / Work Order / PO' | 'Security Deposit / PBG'
  | 'Service Agreement' | 'Contract Execution' | 'Renewal' | 'Closure' | 'Won' | 'Lost';

export interface PrivateTenderNegotiation {
  id: string;
  round: number;
  date: string;
  client_ask: string;
  our_offer: string;
  revised_rate: number;
  revised_margin: number;
  approval_taken: 'Pending' | 'GM Approved' | 'CEO Approved';
  outcome: string;
}

export interface PrivateTenderProposalVersion {
  id: string;
  version: string;
  date: string;
  offer_value: number;
  document_url: string;
  approval: 'Pending' | 'GM Approved' | 'CEO Approved';
  notes: string;
}

export interface PrivateTenderFollowUp {
  id: string;
  date: string;
  type: 'Meeting' | 'Call' | 'Presentation' | 'Email';
  summary: string;
  next_action: string;
  next_action_date: string;
}

export interface PrivateTender {
  id: string;
  client_category: 'Corporate' | 'Industrial' | 'Commercial' | 'Institutional' | 'Residential' | 'Individual';
  client_name: string;
  parent_company: string;
  enquiry_reference: string;
  enquiry_source: 'Direct' | 'Referral' | 'Business development' | 'Existing client' | 'Portal';
  scope_of_work: string;
  location: string;
  estimated_contract_value: number;
  contract_period: string;
  enquiry_date: string;
  site_visit_date: string;
  proposal_due_date: string;
  presentation_date: string;
  expected_decision_date: string;
  expected_start_date: string;
  pricing_model: 'Fixed' | 'Per head' | 'Per unit' | 'Cost-plus' | 'Management fee';
  proposed_margin: number;
  minimum_margin: number;
  payment_terms: string;
  credit_period_days: number;
  security_deposit_requested: string;
  price_escalation_clause: string;
  competitors: string;
  decision_maker: string;
  client_spoc: string;
  relationship_status: 'New' | 'Existing' | 'Lapsed';
  previous_business_history: string;
  vendor_registration_status: string;
  nda_status: 'Required' | 'Not Required' | 'Pending' | 'Signed';
  business_owner: string;
  proposal_owner: string;
  procurement_executive: string;
  operations_spoc: string;
  finance_spoc: string;
  hr_spoc: string;
  gm_approval: 'Pending' | 'Approved' | 'Rejected';
  ceo_approval: 'Pending' | 'Approved' | 'Rejected' | 'Not Required';
  stage: PrivateTenderStage;
  probability: number;
  credit_standing: 'Not Reviewed' | 'Good' | 'Watch' | 'High Risk';
  payment_history: string;
  finance_review: 'Pending' | 'Cleared' | 'Hold';
  credit_notes: string;
  go_no_go: 'Pending' | 'GO' | 'NO-GO';
  review_considerations?: Record<string, boolean>;
  created_at: string;
  negotiations: PrivateTenderNegotiation[];
  proposal_versions: PrivateTenderProposalVersion[];
  follow_ups: PrivateTenderFollowUp[];
}

export interface AppState {
  purchaseRequests: PurchaseRequest[];
  vendors: Vendor[];
  invoices: Invoice[];
  expenses: Expense[];
  leads: Lead[];
  clients: Client[];
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  disciplinaryCases: DisciplinaryCase[];
  sites: Site[];
  complaints: Complaint[];
  incidents: Incident[];
  trainings: Training[];
  tasks: Task[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  alerts: Alert[];
  itApplications: ITApplication[];
  itServerNodes: ITServerNode[];
  itTickets: ITTicket[];
  itSecurityChecks: ITSecurityCheck[];
  // Extended Procurement & Tender Cockpit
  tenders: Tender[];
  tenderGoNoGos: TenderGoNoGo[];
  tenderCorrigendums: TenderCorrigendum[];
  tenderQueries: TenderQuery[];
  contracts: ContractRecord[];
  clientEscalations: ClientEscalation[];
  emdRefunds: EmdRecord[];
  pbgGuarantees: PbgRecord[];
  // Government Tender Module (Separate Panel)
  governmentTenders?: GovernmentTender[];
  privateTenders?: PrivateTender[];
  indents: Indent[];
  vendorQuotations: VendorQuotation[];
  comparativeStatements: ComparativeStatement[];
  purchaseOrders: PurchaseOrder[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  grnRecords: GrnRecord[];
  stockIssues: StockIssue[];
  uniformAllocations: UniformAllocation[];
  machineryAssets: MachineryAsset[];
  dailyProcurementTasks: DailyProcurementTask[];
  eodReviews: EodReview[];
  // -------------------------------------------------------------
  // CRM & MARKETING MANAGEMENT SYSTEM (SPOORTHY INTEGRATED)
  // -------------------------------------------------------------
  crmLeads: CRMLead[];
  crmRequirements: CRMRequirement[];
  crmFollowUps: CRMFollowUp[];
  crmActivities: CRMActivity[];
  crmVisits: CRMClientVisit[];
  crmMeetings: CRMMeeting[];
  crmQuotations: CRMQuotation[];
  crmDars: CRMDailyActivityReport[];
  crmDARs?: CRMDailyActivityReport[];
  crmClientMasters: CRMClientMaster[];
  crmClients?: CRMClientMaster[];
  crmTeamStatuses: CRMTeamStatus[];
  crmTeamStatus?: CRMTeamStatus[];
  crmDiaryTasks?: CRMDiaryTask[];
  crmWorkflowRules?: CRMWorkflowRule[];
  crmWorkflowLogs?: CRMWorkflowExecutionLog[];
  // -------------------------------------------------------------
  // CEO PERSONAL MANAGEMENT WORKSPACE & PORTFOLIOS (T&D, IT, INITIATIVES, MEETINGS)
  // -------------------------------------------------------------
  tdPlans?: TDPlan[];
  tdSessions?: TDSessionRecord[];
  tdTrainers?: TDTrainer[];
  tdComplianceRadar?: TDComplianceRadarItem[];
  itProjects?: ITProject[];
  itTasks?: ITTask[];
  otherInitiatives?: OtherInitiative[];
  meetings?: MeetingRecord[];
  meetingActions?: MeetingActionPoint[];
  contextFiles?: ContextFile[];
  myWorkItems?: MyWorkItem[];
  liveUpdates?: LiveUpdateEvent[];
  // -------------------------------------------------------------
  // CEO DASHBOARD - HR FUNCTIONAL INPUTS (DRAFT V1)
  // -------------------------------------------------------------
  hrWorkforceRecords?: HRWorkforcePositionRecord[];
  hrRequisitions?: HRRequisitionRecord[];
  hrBillingSupports?: HRBillingSupportRecord[];
  hrClientComplaints?: HRClientComplaintRecord[];
  hrSiteVisits?: HRSiteVisitRecord[];
  hrUniformIdChecks?: HRUniformIdComplianceRecord[];
  hrStatutoryRecords?: HRStatutoryComplianceRecord[];
  hrDataDefinitions?: HRDataDefinition[];
  // -------------------------------------------------------------
  // CEO DASHBOARD - OPERATIONS FUNCTIONAL INPUTS (DRAFT V1)
  // -------------------------------------------------------------
  opsAttendanceRecords?: OpsAttendanceRecord[];
  opsOvertimeRecords?: OpsOvertimeRecord[];
  opsSiteInspections?: OpsSiteInspectionRecord[];
  opsClientComplaints?: OpsClientComplaintRecord[];
  opsSlaCompliances?: OpsSlaComplianceRecord[];
  opsUniformAvailabilities?: OpsUniformAvailabilityRecord[];
  opsIdCardCompliances?: OpsIdCardComplianceRecord[];
  opsEquipmentRecords?: OpsEquipmentRecord[];
  opsAttentionItems?: OpsAttentionItem[];
  opsDataDefinitions?: OpsDataDefinition[];
}

// -------------------------------------------------------------
// CEO PERSONAL MANAGEMENT WORKSPACE DATA DEFINITIONS
// -------------------------------------------------------------
export interface ContextFile {
  id: string;
  file_name: string;
  file_type: 'image' | 'pdf' | 'excel' | 'doc' | 'certificate' | 'other';
  file_url: string;
  file_size?: string;
  uploaded_by: string;
  uploaded_at: string;
  version?: string;
  context_type: 'T&D' | 'IT' | 'Initiative' | 'Meeting' | 'Session' | 'Task';
  context_id: string;
  caption?: string;
}

export interface TDPlan {
  id: string;
  plan_name: string;
  period_type: 'Annual' | 'Monthly' | 'Unit/Client';
  year: number;
  month?: string;
  unit_id?: string;
  unit_name?: string;
  client_name?: string;
  target_sessions: number;
  target_participants: number;
  status: 'Draft' | 'Approved' | 'In Progress' | 'Completed';
  created_by: string;
  topics: string[];
  remarks?: string;
}

export type TDSessionStatus = 'Planned' | 'Completed' | 'Postponed' | 'Cancelled' | 'Missed';

export interface TDSessionRecord {
  id: string;
  plan_id?: string;
  unit_or_client: string;
  site_id?: string;
  topic: string;
  category: 'Mandatory Compliance' | 'Hospital Protocol' | 'Fire & Life Safety' | 'Security Tactics' | 'Chemical & Disinfection' | 'Soft Skills & Grooming' | 'Technical Operations' | 'Emergency Evacuation';
  planned_date: string;
  actual_date?: string;
  trainer: string;
  trainer_email?: string;
  duration_hours: number;
  target_participants: number;
  attended_participants?: number;
  attendance_pct?: number;
  evaluation_required: boolean;
  evaluated_count?: number;
  passed_count?: number;
  failed_count?: number;
  pass_pct?: number;
  status: TDSessionStatus;
  evidence_files: ContextFile[];
  remarks?: string;
  follow_up_action?: string;
  created_at: string;
  updated_at: string;
}

export interface TDTrainer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string[];
  assigned_units: string[];
  total_sessions: number;
  avg_attendance_pct: number;
  avg_pass_pct: number;
  rating: number;
}

export interface TDComplianceRadarItem {
  id: string;
  standard_name: string;
  category: 'Mandatory Statutory' | 'Hospital Protocol' | 'Industrial Safety' | 'Fire & Life Safety' | 'Chemical & Hazmat' | 'ISO 9001/45001' | 'Customer Specific';
  target_sites: string[];
  required_frequency_days: number;
  total_certified: number;
  total_required: number;
  compliance_pct: number;
  expiring_in_30_days: number;
  overdue_count: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  last_audit_date: string;
}

export interface ITProject {
  id: string;
  code: string;
  name: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Blocked';
  owner: string; // e.g. 'Jyothy', 'Raghavendra', 'Arpitha'
  start_date: string;
  target_date: string;
  actual_date?: string;
  progress_pct: number;
  workstreams: string[];
  blockers_count: number;
  evidence_files: ContextFile[];
}

export interface ITTask {
  id: string;
  project_id: string;
  project_name: string;
  module_name: string;
  task_title: string;
  description: string;
  owner: string; // 'Raghavendra' | 'Arpitha' | 'Jyothy'
  planned_start: string;
  planned_end: string;
  actual_end?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Blocked';
  percent_completed: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dependency?: string;
  blocker?: string;
  remarks?: string;
  evidence_files: ContextFile[];
}

export interface OtherInitiative {
  id: string;
  name: string;
  description: string;
  category: 'CSR' | 'ISO Certification' | 'Process Automation' | 'Facility Upgrade' | 'Safety Month' | 'Cost Optimization' | 'Branding & Uniforms' | 'Employee Welfare' | 'Strategic Expansion' | 'Other';
  date_period: string;
  owner: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  due_date: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  outcome?: string;
  remarks?: string;
  attachments: ContextFile[];
}

export interface MeetingDecision {
  id: string;
  decision_text: string;
  approved_by: string;
  date: string;
  impact_area: string;
}

export interface MeetingActionPoint {
  id: string;
  meeting_id: string;
  meeting_title: string;
  action_title: string;
  description: string;
  owner: string;
  target_portfolio: 'T&D' | 'IT' | 'Other Initiatives' | 'Operations' | 'Finance' | 'BD' | 'General';
  due_date: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  progress_pct: number;
  converted_to_task_id?: string;
  evidence_files: ContextFile[];
}

export interface MeetingRecord {
  id: string;
  title: string;
  meeting_type: 'Management Committee' | 'Portfolio Review' | 'T&D Review' | 'IT Steering' | 'Operations Sync' | 'Board Meeting';
  is_recurring: boolean;
  date_time: string;
  venue_or_link: string;
  organizer: string;
  portfolio: 'Enterprise' | 'T&D' | 'IT' | 'Other Initiatives' | 'Operations' | 'Finance' | 'BD';
  participants: string[];
  agenda: string[];
  agenda_documents: ContextFile[];
  mom_text?: string;
  decisions: MeetingDecision[];
  action_points: MeetingActionPoint[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface MyWorkItem {
  id: string;
  title: string;
  type: 'T&D Session' | 'IT Task' | 'Initiative' | 'Meeting Action' | 'Decision Required' | 'Follow-up';
  portfolio: 'T&D' | 'IT' | 'Other Initiatives' | 'Management & Meetings';
  due_date: string;
  owner: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Decision Needed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  completion_pct: number;
  outcome?: string;
  evidence_files?: ContextFile[];
}

export interface LiveUpdateEvent {
  id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  event_type: 'COMPLETED_ACTIVITY' | 'NEW_SCHEDULE' | 'POSTPONED_CANCELLED' | 'NEW_BLOCKER' | 'ACTION_COMPLETED' | 'FILE_UPLOADED' | 'EVALUATION_SUBMITTED';
  portfolio: 'T&D' | 'IT' | 'Other Initiatives' | 'Management & Meetings';
  summary: string;
  detail: string;
  related_id: string;
  status_badge?: string;
}
export type CRMServiceType = 
  | 'Blue Collar Manpower'
  | 'White Collar Manpower'
  | 'Security Services'
  | 'Housekeeping'
  | 'Facility Management'
  | 'Payroll Management'
  | 'Technical Manpower'
  | 'Other';

export type CRMLeadStage = 
  | 'New Lead'
  | 'Contacted'
  | 'Requirement Received'
  | 'Meeting / Visit Scheduled'
  | 'Proposal Submitted'
  | 'Quotation Sent'
  | 'Negotiation'
  | 'Won / Converted'
  | 'Lost'
  | 'Client Onboarding';

export type CRMRequirementStatus = 
  | 'New'
  | 'In Discussion'
  | 'Profile/Proposal Submitted'
  | 'Interview'
  | 'Client Interview'
  | 'Negotiation'
  | 'Approved'
  | 'Deployment Pending'
  | 'Fulfilled'
  | 'On Hold'
  | 'Cancelled';

export type CRMFollowUpType = 
  | 'Phone Call'
  | 'WhatsApp'
  | 'Email'
  | 'Client Visit'
  | 'Meeting'
  | 'Video Call'
  | 'Proposal Follow-up'
  | 'Quotation Follow-up'
  | 'Requirement Follow-up'
  | 'Payment Follow-up'
  | 'Contract Renewal';

export type CRMFollowUpStatus = 
  | 'Pending'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'No Response'
  | 'Not Interested'
  | 'Converted';

export type CRMVisitOutcome = 
  | 'Positive'
  | 'Follow-up Required'
  | 'Quotation Required'
  | 'Requirement Awaited'
  | 'Not Interested'
  | 'Converted';

export type CRMQuotationStatus = 
  | 'Draft'
  | 'Prepared'
  | 'Sent'
  | 'Under Discussion'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export type CRMDarStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Returned for Correction';

export interface CRMLead {
  id: string; // e.g. LD-2026-001
  lead_number: string;
  company_name: string;
  company_type?: string;
  industry: string;
  location: string;
  address?: string;
  city?: string;
  pincode?: string;
  website?: string;
  contact_person: string;
  designation?: string;
  mobile: string;
  alt_mobile?: string;
  email: string;
  whatsapp?: string;
  linkedin?: string;
  service_required: CRMServiceType;
  requirement_type?: string;
  lead_source: 'Direct Client Inquiry' | 'Cold Outreach' | 'Website / Inbound' | 'Referral' | 'Tender / RFP Portal' | 'Exhibition / Event' | 'Field Visit' | 'Other';
  assigned_to: string; // Executive Name
  assigned_to_email?: string;
  stage: CRMLeadStage;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Normal';
  estimated_value: number; // in INR
  probability_pct: number; // 0 - 100
  last_contact_date: string; // YYYY-MM-DD
  next_followup_date: string; // YYYY-MM-DD (Mandatory)
  next_action_date?: string;
  next_action: string; // Mandatory
  initial_discussion?: string;
  remarks?: string;
  status: 'Active' | 'Won' | 'Lost' | 'On Hold';
  created_date: string;
  activities_count?: number;
  documents?: { name: string; type: string; date: string }[];
}

export interface CRMRequirement {
  id: string; // e.g. REQ-2026-101
  requirement_number: string;
  lead_id?: string;
  client_id?: string;
  company_name: string;
  requirement_date: string;
  service_type: CRMServiceType;
  manpower_category: string; // e.g. Security Guards, Housekeeping Staff, Skilled Electricians
  quantity: number;
  male_count: number;
  female_count: number;
  qualification?: string;
  experience_years?: string;
  skills_required?: string;
  location: string;
  shift: 'General' | 'Day Shift' | 'Night Shift' | 'Rotational (24/7)' | 'Double Shift' | 'Split Shift';
  working_hours: string; // e.g. 8 hrs / 6 days
  weekly_off: string;
  salary_or_wages: number; // in INR
  billing_rate: number; // in INR
  benefits_food?: boolean;
  benefits_accommodation?: boolean;
  benefits_transportation?: boolean;
  joining_date: string;
  contract_period_months: number;
  replacement_requirement: string;
  status: CRMRequirementStatus;
  assigned_executive: string;
  remarks: string;
}

export interface CRMFollowUp {
  id: string; // e.g. FLW-1001
  lead_id?: string;
  client_id?: string;
  company_name: string;
  assigned_executive: string;
  followup_date: string; // YYYY-MM-DD
  followup_time?: string; // HH:mm
  type: CRMFollowUpType;
  status: CRMFollowUpStatus;
  discussion: string;
  client_response?: string;
  next_action: string;
  next_followup_date?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Normal' | 'Low';
  created_at: string;
}

export interface CRMActivity {
  id: string;
  lead_id?: string;
  client_id?: string;
  company_name: string;
  user_name: string;
  activity_type: 'Call' | 'Email' | 'WhatsApp' | 'Visit' | 'Meeting' | 'Video Meeting' | 'Proposal' | 'Quotation' | 'Requirement Discussion' | 'Negotiation';
  activity_date: string;
  contact_person: string;
  discussion: string;
  subject?: string;
  client_response?: string;
  next_action?: string;
  next_action_date?: string;
  remarks?: string;
}

export type CRMActivityLog = CRMActivity;

export interface CRMClientVisit {
  id: string; // e.g. VST-501
  lead_id?: string;
  client_id?: string;
  company_name: string;
  visit_date: string;
  contact_person: string;
  designation: string;
  purpose: string;
  requirement_discussed: string;
  current_vendor?: string;
  existing_manpower?: string;
  potential_manpower: number;
  client_feedback: string;
  competitor_info?: string;
  outcome: CRMVisitOutcome;
  next_action: string;
  next_followup_date: string;
  visited_by: string;
  attachment_name?: string;
}

export interface CRMMeeting {
  id: string;
  lead_id?: string;
  client_id?: string;
  company_name: string;
  meeting_date: string;
  meeting_time: string;
  meeting_type: 'Inhouse' | 'Inhouse Conference' | 'Virtual Video' | 'Client Office';
  participants: string;
  agenda: string;
  discussion_points: string;
  requirement_client_expectations?: string;
  commercial_discussion: string;
  outcome: 'Positive' | 'Follow-up Needed' | 'Quotation to be Sent' | 'Closed Won' | 'Closed Lost';
  next_action: string;
  next_meeting_date?: string;
  conducted_by: string;
  // Diary & Calendar Maintenance Extensions
  meeting_link?: string;
  meeting_platform?: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Custom';
  meeting_link_sent?: boolean;
  meeting_link_sent_at?: string;
  attendee_emails?: string;
  attendee_role?: 'President' | 'BD Team' | 'Joint Executive' | 'Client Executive';
  status?: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  reminder_minutes?: number;
  reminder_sent?: boolean;
  location?: string;
  notes?: string;
  workflow_triggered?: boolean;
}

export type CRMDiaryTaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type CRMDiaryTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Deferred';
export type CRMDiaryTargetRole = 'President' | 'BD Team' | 'Both';
export type CRMDiaryTaskCategory = 
  | 'Meeting Follow-up' 
  | 'Proposal Dispatch' 
  | 'Client Review' 
  | 'President Reminder' 
  | 'Team Action' 
  | 'Contract Renewal' 
  | 'Other';

export interface CRMDiaryTask {
  id: string;
  title: string;
  lead_id?: string;
  client_id?: string;
  company_name?: string;
  target_role: CRMDiaryTargetRole;
  assigned_to: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:mm
  priority: CRMDiaryTaskPriority;
  status: CRMDiaryTaskStatus;
  category: CRMDiaryTaskCategory;
  description?: string;
  reminder_minutes_before?: number;
  reminder_status?: 'Scheduled' | 'Sent' | 'Dismissed';
  created_at: string;
  completed_at?: string;
  linked_meeting_id?: string;
  automated_by_rule?: string;
}

export interface CRMWorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'on_meeting_scheduled' | 'on_meeting_completed' | 'on_meeting_rescheduled' | 'on_outcome_followup' | 'on_task_overdue';
  action: 'send_meeting_link' | 'create_president_task' | 'create_bd_task' | 'send_whatsapp_alert' | 'sync_dar';
  is_active: boolean;
  target_audience: 'President' | 'BD Team' | 'Both';
  auto_generate_link?: boolean;
}

export interface CRMWorkflowExecutionLog {
  id: string;
  rule_id: string;
  rule_name: string;
  triggered_at: string;
  trigger_event: string;
  entity_id: string;
  entity_name: string;
  details: string;
  status: 'Success' | 'Queued' | 'Alert Sent';
  recipient: string;
}

export interface CRMQuotation {
  id: string;
  quotation_number: string;
  lead_id?: string;
  client_id?: string;
  company_name: string;
  requirement_id?: string;
  quotation_date: string;
  service: string;
  manpower_category: string;
  quantity: number;
  commercial_value: number; // in INR
  validity_date: string;
  prepared_by: string;
  sent_date: string;
  client_response?: string;
  followup_date: string;
  status: CRMQuotationStatus;
  notes?: string;
  document_name?: string;
  document_type?: 'pdf' | 'word' | 'excel';
  document_size?: string;
  document_data?: string;
}

export interface CRMDailyActivityReport {
  id: string;
  employee_id?: string;
  employee_name?: string;
  executive_name?: string;
  report_date: string;
  new_leads_count?: number;
  calls_made_count?: number;
  emails_sent_count?: number;
  whatsapp_followups_count?: number;
  client_visits_count?: number;
  virtual_meetings_count?: number;
  inhouse_meetings_count?: number;
  requirements_received_count?: number;
  quotations_sent_count?: number;
  followups_completed_count?: number;
  calls_made?: number;
  visits_done?: number;
  meetings_done?: number;
  proposals_sent?: number;
  new_leads_added?: number;
  activities?: any[];
  activities_details?: string;
  todays_achievements?: string;
  key_achievements?: string;
  challenges_issues?: string;
  major_challenges?: string;
  pending_activities?: string;
  tomorrow_plan: string;
  management_support_required?: string;
  status: CRMDarStatus;
  manager_remarks?: string;
  reviewed_by?: string;
  approved_by?: string;
  remarks?: string;
  submitted_at?: string;
}

export interface CRMClientMaster {
  id: string;
  client_code: string;
  company_name: string;
  industry: string;
  group_name?: string;
  address?: string;
  registered_address?: string;
  billing_address?: string;
  city?: string;
  location?: string;
  gst_number?: string;
  gstin?: string;
  pan?: string;
  contact_person?: string;
  contact_designation?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_persons?: { name: string; designation: string; mobile: string; email: string; whatsapp?: string }[];
  services_active?: string[];
  contract_start_date?: string;
  contract_start?: string;
  contract_end_date?: string;
  contract_end?: string;
  current_manpower_deployed?: number;
  total_deployed_manpower?: number;
  monthly_billing_inr?: number;
  monthly_billing_value?: number;
  payment_terms?: string;
  payment_terms_days?: number;
  account_manager: string;
  client_status?: 'Active' | 'Inactive' | 'Under Renewal' | 'Contract Expiring' | 'On Hold' | 'Lost';
  status?: 'Active' | 'Inactive' | 'Under Renewal' | 'Contract Expiring' | 'On Hold' | 'Lost';
  remarks?: string;
}

export interface CRMTeamStatus {
  id: string;
  employee_name?: string;
  name?: string;
  role_title?: string;
  designation?: string;
  email?: string;
  status: 'Online' | 'Offline' | 'Away' | 'In Meeting' | 'On Break' | 'On Client Visit' | 'In Client Visit' | 'Available' | 'Quotation Prep' | 'Phone Follow-ups' | 'In Transit';
  last_active: string;
  current_task?: string;
  current_location?: string;
  current_activity?: string;
  monthly_target?: number;
  target_achieved?: number;
  today_visits?: number;
  today_calls?: number;
}

// -------------------------------------------------------------
// CEO DASHBOARD - HR FUNCTIONAL INPUTS (DRAFT V1) TYPES
// -------------------------------------------------------------

export interface HRWorkforcePositionRecord {
  id: string;
  period: string; // e.g. '2026-09' or 'September 2026'
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  category: 'Security' | 'Housekeeping' | 'Facility Operations' | 'Technical' | 'Supervisory' | 'Corporate Support';
  role: string;
  total_strength: number;
  new_joiners: number;
  resignations: number;
  terminations: number;
  attrition_pct: number;
  open_positions: number;
  positions_closed: number;
  joining_pending: number;
  date_recorded: string;
  details?: {
    employee_name?: string;
    employee_id?: string;
    action_date?: string;
    movement_type?: 'Joiner' | 'Resignation' | 'Termination' | 'Open Requisition' | 'Closed' | 'Joining Pending';
    reason?: string;
    status?: string;
  }[];
}

export interface HRRequisitionRecord {
  id: string;
  req_code: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  position_title: string;
  category: string;
  open_count: number;
  closed_count: number;
  joining_pending_count: number;
  target_join_date: string;
  status: 'Open' | 'Closed' | 'Joining Pending' | 'Critical SLA Overdue' | 'On Hold';
  recruitment_cost_inr: number;
  cost_breakdown?: {
    job_portals: number;
    referral_incentives: number;
    advertisement: number;
    bg_medical_verification: number;
    onboarding_kit: number;
  };
  recruiter_name: string;
  remarks: string;
}

export type HRBillingSupportStatus = 
  | 'Billing input required' 
  | 'Input submitted' 
  | 'Input pending' 
  | 'Input returned/query raised' 
  | 'Input cleared';

export interface HRBillingSupportRecord {
  id: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  billing_period: string; // e.g. 'August 2026' or 'September 2026'
  required_manpower: number;
  billable_attendance_count: number;
  status: HRBillingSupportStatus;
  submission_date?: string;
  days_pending: number;
  query_details?: string;
  action_owner: string;
  supporting_attendance_file?: string;
  remarks: string;
}

export interface HRClientComplaintRecord {
  id: string;
  complaint_no: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  category: 'Grooming & Uniform' | 'Absenteeism & Shortage' | 'Behavior & Conduct' | 'Statutory PF/ESI' | 'Billing Dispute' | 'Replacement Delay';
  complaint_text: string;
  date_logged: string;
  target_closure_date: string;
  owner: string;
  status: 'Open' | 'Closed' | 'Pending / Overdue' | 'Under Investigation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  root_cause?: string;
  corrective_action?: string;
  evidence_file?: string;
}

export interface HRSiteVisitRecord {
  id: string;
  visit_code: string;
  date: string;
  hr_representative: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  purpose: 'Grievance Redressal' | 'Uniform & ID Audit' | 'Biometric Attendance Audit' | 'Statutory PF/ESI Check' | 'Induction & Drill' | 'Client Coordination';
  key_observation: string;
  action_required: string;
  action_owner: string;
  status: 'Completed' | 'Pending Action' | 'Escalated to Ops' | 'Closed';
  photograph_url?: string;
  evidence_file_name?: string;
  employees_checked: number;
  exceptions_found: number;
}

export interface HRUniformIdComplianceRecord {
  id: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  audit_date: string;
  employees_checked: number;
  uniform_compliant_count: number;
  uniform_compliance_pct: number;
  id_compliant_count: number;
  id_compliance_pct: number;
  exceptions_count: number;
  auditor_name: string;
  exceptions_list: {
    employee_name: string;
    employee_id: string;
    category: string;
    exception_type: 'Missing Belt/Cap' | 'No ID Card' | 'Faded/Damaged Uniform' | 'Incorrect Shoes' | 'Lanyard Missing';
    action_taken: string;
    status: 'Pending Replacement' | 'Fine Issued' | 'Resolved';
  }[];
}

export interface HRStatutoryComplianceRecord {
  id: string;
  period: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  pf_status: 'Compliant' | 'Exceptions';
  esi_status: 'Compliant' | 'Exceptions';
  pf_exception_count: number;
  esi_exception_count: number;
  total_active_workforce: number;
  challan_filed_date?: string;
  ecr_generated: boolean;
  exceptions_details: {
    employee_name: string;
    employee_id: string;
    issue_type: 'UAN Mismatch' | 'KYC Pending' | 'Aadhaar Unlinked' | 'Date of Joining Discrepancy' | 'ESI IP Not Generated';
    status: 'Pending Documentation' | 'In Progress with EPFO' | 'Resolved';
    pending_action: string;
    due_date: string;
  }[];
}

export interface HRDataDefinition {
  id: string;
  metric_name: string;
  functional_group: 'Workforce' | 'Recruitment' | 'Attendance & Billing' | 'Employee / Client Support' | 'Compliance & Cost';
  source_system: string;
  owner: string;
  frequency: string;
  calculation_logic: string;
  status: 'Active & Verified' | 'HR Confirmed' | 'Under Validation';
  drill_down_path: string;
  target_benchmark?: string;
}

// -------------------------------------------------------------
// CEO DASHBOARD - OPERATIONS FUNCTIONAL INPUTS (DRAFT V1)
// -------------------------------------------------------------

export interface OpsAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service_type: 'Security Guarding' | 'Housekeeping & Soft FM' | 'Technical / MEP' | 'Pest Control & Specialized';
  category: 'Security Guards' | 'Supervisors & Head Guards' | 'Janitors & HK Staff' | 'Technicians & Operators' | 'Armed Security';
  shift: 'Morning' | 'Evening' | 'Night' | 'General';
  required_manpower: number;
  present_count: number;
  absent_count: number;
  attendance_pct: number; // (present_count / required_manpower) * 100
  absenteeism_pct: number; // (absent_count / required_manpower) * 100
  relievers_required: number;
  relievers_available: number;
  reliever_shortage: number; // max(0, relievers_required - relievers_available)
  net_shortage: number;
  status: 'Normal' | 'Shortage' | 'Critical Shortage';
  shortage_reason?: string;
  action_taken?: string;
}

export interface OpsOvertimeRecord {
  id: string;
  period: string; // e.g. "Sep 2026", "Week 37"
  date: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service_type: string;
  category: string;
  ot_hours: number;
  prior_period_ot_hours: number;
  variance_hours: number;
  variance_pct: number;
  ot_rate_per_hr: number;
  total_ot_cost: number; // in INR
  total_ot_cost_lakhs: number; // e.g. 0.45 Lakhs
  // Operational Causality Chain
  causal_chain: {
    absentee_count: number;
    reliever_gap: number;
    driven_ot_hours: number;
    ot_cost_incurred: number;
  };
  operational_story: string;
  is_significant_exception: boolean;
  approved_by: string;
}

export interface OpsSiteInspectionRecord {
  id: string;
  inspection_code: string; // e.g. "INSP-2026-089"
  planned_date: string;
  actual_inspection_date?: string;
  inspector_name: string; // Officer / Area Manager
  inspector_role: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service: string;
  score_pct: number;
  findings_observations: string;
  action_required: string;
  responsible_person: string;
  due_date: string;
  status: 'Planned' | 'Completed' | 'Pending Action' | 'Escalated' | 'Overdue';
  qr_scan_verified: boolean;
  qr_timestamp?: string;
  evidence_photos: {
    url: string;
    caption: string;
    timestamp: string;
    is_before_after?: boolean;
    tag: 'Post Guard' | 'Grooming' | 'Muster Roll' | 'Machinery' | 'Area Cleanliness';
  }[];
  checklist_items: {
    item: string;
    passed: boolean;
    remarks?: string;
  }[];
}

export interface OpsClientComplaintRecord {
  id: string;
  ticket_no: string; // e.g. "OPS-CC-401"
  date_received: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service: string;
  complaint_category: 'Service Quality' | 'Grooming / Uniform' | 'Manpower Shortage' | 'Behavior / Conduct' | 'Machine / Material' | 'Night Patrolling' | 'Billing / Muster';
  description: string;
  complaint_owner: string; // e.g., Operations Manager
  action_plan: string;
  status: 'Open' | 'Pending' | 'Closed' | 'Overdue';
  target_closure_date: string;
  actual_closure_date?: string;
  closure_evidence_notes?: string;
  closure_evidence_photos?: string[];
  source_system: 'OpsVision App' | 'Direct Client Call' | 'Email Escalation' | 'QR Code Portal' | 'Inspection Flag';
  is_overdue: boolean;
  satisfaction_rating?: number; // 1-5
}

export interface OpsSlaComplianceRecord {
  id: string;
  period: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service_type: string;
  area_name: string; // e.g. "Main Lobby & Security Gate", "ICU / OT Wing", "Basement Parking", "Data Center"
  sla_target_pct: number;
  sla_achieved_pct: number;
  status: 'Compliant' | 'At Risk' | 'Breached';
  is_critical_recurring: boolean;
  breach_count: number;
  total_tasks_monitored: number;
  tasks_passed: number;
  tasks_failed: number;
  ops_vision_ref: string;
  underlying_tasks: {
    task_id: string;
    task_name: string;
    qr_code_location: string;
    scan_time: string;
    officer_name: string;
    passed: boolean;
    before_photo_url?: string;
    after_photo_url?: string;
    checklist_summary: string;
  }[];
}

export interface OpsUniformAvailabilityRecord {
  id: string;
  audit_date: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service_category: string;
  required_sets_at_site: number;
  available_sets_at_site: number;
  availability_pct: number;
  site_shortage_qty: number;
  has_shortage: boolean;
  pending_indent_ref?: string;
  action_plan: string;
  responsible_supervisor: string;
  status: 'Sufficient' | 'Shortage Pending' | 'Indent Dispatched';
}

export interface OpsIdCardComplianceRecord {
  id: string;
  audit_date: string;
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  service_category: string;
  total_staff_on_duty: number;
  compliant_id_count: number;
  compliance_pct: number;
  exceptions_count: number;
  exceptions_list: {
    employee_id: string;
    employee_name: string;
    role: string;
    issue: 'Missing ID Card' | 'Expired Validity' | 'Damaged/Worn Card' | 'No Lanyard';
    temp_pass_issued: boolean;
    target_card_date: string;
    status: 'Pending Replacement' | 'Temp Pass Active' | 'Resolved';
  }[];
}

export interface OpsEquipmentRecord {
  id: string;
  equipment_code: string; // e.g. "EQ-SCRUB-012"
  machine_name: string;
  category: 'Housekeeping Heavy Machine' | 'Security Access & Screening' | 'MEP & Engineering' | 'Landscape / Specialized';
  client_id: string;
  client_name: string;
  site_id: string;
  site_name: string;
  status: 'Available' | 'Unavailable' | 'Under Repair' | 'Required';
  issue_description?: string;
  breakdown_date?: string;
  service_partner_vendor?: string;
  action_required?: string;
  expected_operational_date?: string;
  amc_status: 'Active' | 'Expired' | 'Under Warranty' | 'Ad-Hoc Service';
  is_critical_for_sla: boolean;
}

export interface OpsAttentionItem {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: 'Attendance' | 'Relievers' | 'SLA Breaches' | 'Complaints' | 'Equipment' | 'Uniform & ID';
  headline: string;
  description: string;
  client_name: string;
  site_name: string;
  metric_value: string;
  threshold_value: string;
  action_needed: string;
  owner: string;
  resolved: boolean;
  created_at: string;
}

export interface OpsDataDefinition {
  id: string;
  metric_name: string;
  functional_group: 'Manpower & Attendance' | 'OT & Cost' | 'Site Control' | 'Client Complaints' | 'Service Performance' | 'Site Readiness';
  source_system: string;
  owner: string;
  frequency: string;
  calculation_logic: string;
  status: 'Active & Verified' | 'Ops Confirmed' | 'Under Validation';
  drill_down_path: string;
  target_benchmark?: string;
}

// -------------------------------------------------------------
// AI STUDIO PROJECT EXECUTIVE REVIEW (CEO-LEVEL)
// -------------------------------------------------------------
export type ProjectHealthStatus = 'GREEN' | 'AMBER' | 'RED';

export interface ExecutiveKPICard {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  status: ProjectHealthStatus;
  benchmark?: string;
  category: 'adoption' | 'financial' | 'ai_quality' | 'delivery';
  anomalyFlag?: boolean;
  anomalyNote?: string;
}

export interface MilestoneItem {
  id: string;
  name: string;
  plannedQuarter: string;
  deadline: string;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Planned' | 'At Risk';
  percentComplete: number;
  owner: string;
  slippageDays?: number;
  slippageCause?: string;
  impact: string;
}

export interface ProductAdoptionData {
  monthlyActiveUsers: number;
  mauGrowthPct: number;
  dailyActiveUsers: number;
  d1RetentionPct: number;
  d30RetentionPct: number;
  featureAdoption: {
    feature: string;
    adoptionRate: number; // percentage
    status: 'High' | 'Medium' | 'Low';
    userSentiment: string;
  }[];
  userFeedbackThemes: {
    theme: string;
    type: 'Positive' | 'Pain Point' | 'Feature Request';
    frequencyPct: number;
    quoteOrSample: string;
    actionTaken: string;
  }[];
  monthlyTrend: {
    month: string;
    mau: number;
    dau: number;
    appletsCreated: number;
  }[];
}

export interface AIPerformanceData {
  overallAccuracyPct: number;
  p95LatencySec: number;
  uptimePct: number;
  errorRatePct: number;
  hallucinationRatePct: number;
  safetyIncidentsCount: number;
  costPer1kRequestsUSD: number;
  costPerUserUSD: number;
  modelMix: {
    model: string;
    sharePct: number;
    avgLatencyMs: number;
    costSharePct: number;
  }[];
  monthlyLatencyTrend: {
    month: string;
    p50: number;
    p95: number;
    errorRate: number;
  }[];
}

export interface ProjectFinancialsData {
  totalBudgetUSD: number;
  actualSpendYTDUSD: number;
  burnRateMonthlyUSD: number;
  runwayMonths: number;
  computeApiCostYTDUSD: number;
  annualizedRunRateRevenueUSD: number;
  projectedROI: string;
  costVariancePct: number;
  spendBreakdown: {
    category: string;
    budgeted: number;
    actual: number;
    variancePct: number;
  }[];
  monthlyBurnTrend: {
    month: string;
    budget: number;
    actual: number;
    computeApi: number;
  }[];
}

export interface TeamDeliveryData {
  headcount: number;
  totalCapacityStoryPoints: number;
  avgVelocityPoints: number;
  velocityTrend: {
    sprint: string;
    committed: number;
    completed: number;
    velocityScore: number;
  }[];
  keyHiresAndGaps: {
    role: string;
    status: 'Filled' | 'Sourcing' | 'Offer Stage' | 'Critical Gap';
    impact: string;
    targetDate: string;
  }[];
  criticalBlockers: {
    id: string;
    title: string;
    severity: 'High' | 'Medium';
    owner: string;
    unblockStrategy: string;
  }[];
}

export interface ProjectRiskItem {
  id: string;
  title: string;
  category: 'Regulatory / Ethics' | 'Data Privacy / Security' | 'Technical / Compute' | 'Adoption' | 'Talent';
  likelihood: number; // 1 - 5
  impact: number; // 1 - 5
  score: number; // likelihood * impact
  owner: string;
  mitigation: string;
  status: 'Active' | 'Mitigated' | 'Monitoring';
}

export interface CompetitorSnapshot {
  competitor: string;
  recentMove: string;
  threatLevel: 'High' | 'Medium' | 'Low';
  ourAdvantageOrResponse: string;
}

export interface ExecutiveDecisionItem {
  id: string;
  rank: number; // 1, 2, 3
  decisionTitle: string;
  needOrAsk: string;
  approvalRequired: string;
  recommendedAction: string;
  tradeOffs: string;
  roiImpact: string;
  urgency: 'Immediate (7 Days)' | 'Next 30 Days' | 'Next Quarter';
}

export interface ProjectActionTimeline {
  horizon: 'Next 30 Days' | 'Next 60 Days' | 'Next 90 Days';
  priorities: string[];
  expectedOutcomes: string[];
  targetMilestone: string;
  successMetric: string;
}

export interface AIStudioProjectReview {
  projectTitle: string;
  oneLineDescription: string;
  stage: 'idea' | 'MVP' | 'beta' | 'launched' | 'scaling';
  reportingPeriod: string;
  lastUpdated: string;
  author: string;
  overallHealth: ProjectHealthStatus;
  headlineSummary: string[];
  top3DecisionsToMake: string[];
  kpis: ExecutiveKPICard[];
  milestones: MilestoneItem[];
  overallProgressPct: number;
  productAdoption: ProductAdoptionData;
  aiPerformance: AIPerformanceData;
  financials: ProjectFinancialsData;
  teamDelivery: TeamDeliveryData;
  risks: ProjectRiskItem[];
  competitiveSnapshot: CompetitorSnapshot[];
  decisionsAndAsks: ExecutiveDecisionItem[];
  timeline306090: ProjectActionTimeline[];
  anomaliesAndFlags: {
    item: string;
    observation: string;
    severity: 'Red' | 'Amber' | 'Yellow';
    suggestedAudit: string;
  }[];
  assumptions: string[];
  missingDataNotes: string[];
}

