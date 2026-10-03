// Programmatic Document and Spreadsheet Parser
// Zero external API keys needed - 100% offline & local execution on VPS

export interface ExtractedEntityResult {
  entityType: string;
  summary: string;
  confidence: 'High' | 'Medium' | 'Low';
  extractedCount: number;
  records: any[];
}

/**
 * Fuzzy matches a string against candidates
 */
function matchHeader(header: string, candidates: string[]): boolean {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  return candidates.some(c => {
    const cleanCand = c.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === cleanCand || clean.includes(cleanCand) || cleanCand.includes(clean);
  });
}

/**
 * Parses raw tabular rows (from CSV or Excel) and maps to system entities
 */
export function parseTabularDataProgrammatically(
  rows: Record<string, any>[],
  targetRole: string,
  targetEntity?: string
): ExtractedEntityResult {
  if (!rows || rows.length === 0) {
    return {
      entityType: targetEntity || 'sites',
      summary: 'No data rows found in document.',
      confidence: 'Low',
      extractedCount: 0,
      records: []
    };
  }

  const sampleRow = rows[0];
  const headers = Object.keys(sampleRow);

  // Determine Entity Type if not specified
  let detectedType = targetEntity && targetEntity !== 'auto' ? targetEntity : detectEntityType(headers, targetRole);

  const records: any[] = [];

  rows.forEach((row, index) => {
    // Skip empty rows
    const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    if (values.length === 0) return;

    let mappedRecord: any = null;

    switch (detectedType) {
      case 'sites':
        mappedRecord = mapToSite(row, index);
        break;
      case 'employees':
        mappedRecord = mapToEmployee(row, index);
        break;
      case 'invoices':
        mappedRecord = mapToInvoice(row, index);
        break;
      case 'expenses':
        mappedRecord = mapToExpense(row, index);
        break;
      case 'leads':
        mappedRecord = mapToLead(row, index);
      case 'clients':
        mappedRecord = mapToClient(row, index);
        break;
      case 'purchaseRequests':
        mappedRecord = mapToPurchaseRequest(row, index);
        break;
      case 'vendors':
        mappedRecord = mapToVendor(row, index);
        break;
      case 'trainings':
        mappedRecord = mapToTraining(row, index);
        break;
      case 'complaints':
        mappedRecord = mapToComplaint(row, index);
        break;
      case 'incidents':
        mappedRecord = mapToIncident(row, index);
        break;
      default:
        mappedRecord = mapToGeneric(row, index, detectedType);
    }

    if (mappedRecord) {
      records.push(mappedRecord);
    }
  });

  return {
    entityType: detectedType,
    summary: `Programmatically parsed ${records.length} records using local schema rules.`,
    confidence: records.length > 0 ? 'High' : 'Low',
    extractedCount: records.length,
    records
  };
}

function detectEntityType(headers: string[], role: string): string {
  // Check header patterns
  if (headers.some(h => matchHeader(h, ['invoice', 'inv_no', 'billing', 'receivable', 'paid_amt']))) return 'invoices';
  if (headers.some(h => matchHeader(h, ['expense', 'budget', 'actual_cost', 'expense_head']))) return 'expenses';
  if (headers.some(h => matchHeader(h, ['guard', 'employee', 'designation', 'salary', 'epf', 'esic', 'roster']))) return 'employees';
  if (headers.some(h => matchHeader(h, ['deployed', 'required_guards', 'site_name', 'audit_score', 'manned_guarding']))) return 'sites';
  if (headers.some(h => matchHeader(h, ['pr_no', 'purchase', 'uniform', 'procurement', 'delivery_status', 'qty']))) return 'purchaseRequests';
  if (headers.some(h => matchHeader(h, ['tender', 'lead', 'prospect', 'probability', 'bid_value']))) return 'leads';
  if (headers.some(h => matchHeader(h, ['training', 'drill', 'competency', 'trainer', 'induction']))) return 'trainings';
  if (headers.some(h => matchHeader(h, ['incident', 'theft', 'breach', 'severity', 'misconduct']))) return 'incidents';
  if (headers.some(h => matchHeader(h, ['complaint', 'sla_breach', 'resolution']))) return 'complaints';

  // Fallback to role defaults
  if (role.includes('HR')) return 'employees';
  if (role.includes('Finance')) return 'invoices';
  if (role.includes('Procurement')) return 'purchaseRequests';
  if (role.includes('BD')) return 'leads';
  if (role.includes('Training')) return 'trainings';
  return 'sites';
}

function findValue(row: Record<string, any>, candidates: string[]): any {
  for (const [key, val] of Object.entries(row)) {
    if (matchHeader(key, candidates)) {
      return val;
    }
  }
  return undefined;
}

function parseNumber(val: any, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  const num = Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? fallback : num;
}

function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  const str = String(val).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return str || new Date().toISOString().split('T')[0];
}

// Entity Mappers
function mapToSite(row: Record<string, any>, index: number) {
  const siteName = findValue(row, ['site_name', 'site', 'facility', 'location_name', 'client_site']) || `Facility Site #${index + 1}`;
  const reqManpower = parseNumber(findValue(row, ['required_manpower', 'req_guards', 'sanctioned_strength', 'required']), 12);
  const depManpower = parseNumber(findValue(row, ['deployed_manpower', 'actual_guards', 'deployed', 'present']), reqManpower);
  const auditScore = parseNumber(findValue(row, ['audit_score', 'audit', 'rating', 'score']), 88);
  
  let health: 'Green' | 'Amber' | 'Red' = 'Green';
  if (auditScore < 75 || depManpower < reqManpower * 0.8) health = 'Red';
  else if (auditScore < 85 || depManpower < reqManpower) health = 'Amber';

  return {
    id: String(findValue(row, ['id', 'site_id']) || `SITE-${Date.now()}-${index + 1}`),
    site_name: String(siteName),
    location_region: String(findValue(row, ['region', 'location', 'zone', 'area']) || 'Central Facility Hub'),
    client_name: String(findValue(row, ['client_name', 'client', 'company']) || 'Corporate Client'),
    required_manpower: reqManpower,
    deployed_manpower: depManpower,
    supervisor_name: String(findValue(row, ['supervisor', 'officer', 'incharge']) || 'Site Supervisor'),
    supervisor_contact: String(findValue(row, ['contact', 'phone', 'mobile']) || '+91 98765 43210'),
    audit_score: auditScore,
    site_health: health
  };
}

function mapToEmployee(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'emp_id', 'badge_no']) || `EMP-${Date.now()}-${index + 1}`),
    name: String(findValue(row, ['name', 'employee_name', 'guard_name', 'staff_name']) || `Staff Member #${index + 1}`),
    designation: String(findValue(row, ['designation', 'role', 'position']) || 'Security Guard'),
    department: String(findValue(row, ['department', 'vertical', 'dept']) || 'Operations'),
    site_assigned: String(findValue(row, ['site', 'assigned_site', 'location']) || 'Site Alpha'),
    contact: String(findValue(row, ['contact', 'phone', 'mobile']) || '+91 98000 00000'),
    epf_esic_status: String(findValue(row, ['epf', 'esic', 'compliance']) || 'Active').toLowerCase().includes('active') ? 'Active' : 'Pending',
    police_verification: String(findValue(row, ['police', 'verification', 'pv']) || 'Verified').toLowerCase().includes('verified') ? 'Verified' : 'Pending',
    uniform_issued: true,
    join_date: formatDate(findValue(row, ['join_date', 'date_of_joining', 'doj'])),
    status: 'Active',
    basic_salary: parseNumber(findValue(row, ['salary', 'basic', 'pay', 'gross']), 18500)
  };
}

function mapToInvoice(row: Record<string, any>, index: number) {
  const amount = parseNumber(findValue(row, ['amount', 'total', 'bill_amount', 'gross_value']), 125000);
  const paid = parseNumber(findValue(row, ['payment_received', 'paid', 'collection', 'received']), 0);
  const outstanding = amount - paid;

  let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
  if (outstanding <= 0) status = 'Paid';
  else if (String(findValue(row, ['status'])).toLowerCase().includes('overdue')) status = 'Overdue';

  return {
    id: String(findValue(row, ['id', 'inv_id']) || `INV-${Date.now()}-${index + 1}`),
    invoice_no: String(findValue(row, ['invoice_no', 'inv_no', 'bill_no']) || `INV-2026-${100 + index}`),
    client_id: 'CLT-001',
    client_name: String(findValue(row, ['client_name', 'client', 'company']) || 'Corporate Client'),
    amount,
    payment_received: paid,
    outstanding,
    invoice_date: formatDate(findValue(row, ['invoice_date', 'date', 'bill_date'])),
    due_date: formatDate(findValue(row, ['due_date', 'payment_due'])),
    status
  };
}

function mapToExpense(row: Record<string, any>, index: number) {
  const budget = parseNumber(findValue(row, ['budget', 'allocated', 'target']), 100000);
  const actual = parseNumber(findValue(row, ['actual', 'spent', 'expense_cost']), 95000);

  return {
    id: String(findValue(row, ['id', 'exp_id']) || `EXP-${Date.now()}-${index + 1}`),
    expense_head: String(findValue(row, ['expense_head', 'head', 'category', 'item']) || `Operational Head #${index + 1}`),
    month: String(findValue(row, ['month', 'period']) || new Date().toISOString().slice(0, 7)),
    budget,
    actual,
    status: actual > budget ? 'Over Budget' : 'On Track'
  };
}

function mapToPurchaseRequest(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'pr_id']) || `PR-${Date.now()}-${index + 1}`),
    request_no: String(findValue(row, ['request_no', 'pr_no']) || `PR-2026-${200 + index}`),
    item: String(findValue(row, ['item', 'item_name', 'product', 'equipment']) || 'Security Uniform Kits'),
    category: String(findValue(row, ['category', 'type']) || 'Uniforms & Badges'),
    quantity: parseNumber(findValue(row, ['quantity', 'qty', 'units']), 10),
    estimated_cost: parseNumber(findValue(row, ['cost', 'estimated_cost', 'amount', 'total']), 15000),
    requested_by: String(findValue(row, ['requested_by', 'user', 'officer']) || 'Operations Supervisor'),
    date: formatDate(findValue(row, ['date', 'request_date'])),
    approval_status: 'Pending',
    delivery_status: 'Pending',
    remarks: String(findValue(row, ['remarks', 'notes', 'justification']) || 'Standard deployment replenishment')
  };
}

function mapToLead(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'lead_id']) || `LEAD-${Date.now()}-${index + 1}`),
    lead_name: String(findValue(row, ['lead_name', 'tender', 'project', 'company']) || `Tender Bid #${index + 1}`),
    contact_person: String(findValue(row, ['contact_person', 'person', 'manager']) || 'Procurement Officer'),
    contact_email: String(findValue(row, ['email', 'contact_email']) || 'contact@client.com'),
    phone: String(findValue(row, ['phone', 'contact', 'mobile']) || '+91 99999 88888'),
    estimated_value: parseNumber(findValue(row, ['value', 'estimated_value', 'contract_value']), 500000),
    probability_pct: parseNumber(findValue(row, ['probability', 'prob_pct', 'chance']), 60),
    stage: 'Proposal',
    expected_closure: formatDate(findValue(row, ['closure', 'expected_closure', 'date'])),
    proposal_status: 'Submitted'
  };
}

function mapToClient(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'client_id']) || `CLT-${Date.now()}-${index + 1}`),
    company_name: String(findValue(row, ['company_name', 'client', 'name']) || `Corporate Client #${index + 1}`),
    industry: String(findValue(row, ['industry', 'sector']) || 'Commercial'),
    contract_start: formatDate(findValue(row, ['contract_start', 'start_date'])),
    contract_end: formatDate(findValue(row, ['contract_end', 'end_date'])),
    sites_count: parseNumber(findValue(row, ['sites_count', 'sites']), 2),
    monthly_billing: parseNumber(findValue(row, ['monthly_billing', 'billing', 'mrr']), 250000),
    sla_status: 'Compliant',
    contact_person: String(findValue(row, ['contact_person', 'contact']) || 'Facility Manager'),
    email: String(findValue(row, ['email']) || 'facility@client.com')
  };
}

function mapToVendor(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'vendor_id']) || `VND-${Date.now()}-${index + 1}`),
    vendor_name: String(findValue(row, ['vendor_name', 'vendor', 'supplier']) || `Supplier #${index + 1}`),
    category: String(findValue(row, ['category', 'supply_type']) || 'Uniforms & Equipment'),
    contact_person: String(findValue(row, ['contact_person', 'person']) || 'Sales Representative'),
    phone: String(findValue(row, ['phone', 'contact']) || '+91 98765 00000'),
    rating: parseNumber(findValue(row, ['rating', 'stars']), 4),
    payment_terms: String(findValue(row, ['payment_terms', 'terms']) || 'Net 30')
  };
}

function mapToTraining(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'training_id']) || `TRN-${Date.now()}-${index + 1}`),
    training_name: String(findValue(row, ['training_name', 'title', 'course']) || 'Security & Fire Safety Drill'),
    category: 'Fire & Safety Drills',
    target_role: 'Security Guards',
    date_conducted: formatDate(findValue(row, ['date', 'date_conducted'])),
    participants_count: parseNumber(findValue(row, ['participants', 'count', 'guards_trained']), 25),
    trainer_name: String(findValue(row, ['trainer', 'trainer_name', 'instructor']) || 'Chief Training Officer'),
    competency_score: parseNumber(findValue(row, ['competency_score', 'score', 'average']), 85),
    status: 'Completed'
  };
}

function mapToComplaint(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'cmp_id']) || `CMP-${Date.now()}-${index + 1}`),
    site_id: 'SITE-001',
    client_name: String(findValue(row, ['client_name', 'client', 'site']) || 'Corporate Site'),
    complaint_text: String(findValue(row, ['complaint', 'issue', 'description']) || 'Guard Uniform Infraction'),
    date: formatDate(findValue(row, ['date'])),
    category: 'Uniform',
    status: 'Open',
    resolution_notes: '',
    raised_by: String(findValue(row, ['raised_by', 'client_contact']) || 'Site Incharge')
  };
}

function mapToIncident(row: Record<string, any>, index: number) {
  return {
    id: String(findValue(row, ['id', 'inc_id']) || `INC-${Date.now()}-${index + 1}`),
    site_id: 'SITE-001',
    site_name: String(findValue(row, ['site_name', 'site']) || 'Facility Site'),
    incident_type: 'Security Breach',
    severity: 'Medium',
    description: String(findValue(row, ['description', 'incident', 'details']) || 'Unauthorized entry attempt prevented'),
    date_time: `${formatDate(findValue(row, ['date']))} 14:00`,
    reported_by: String(findValue(row, ['reported_by', 'guard']) || 'Duty Officer'),
    status: 'Under Investigation',
    action_taken: 'Log entry recorded and supervisor notified'
  };
}

function mapToGeneric(row: Record<string, any>, index: number, type: string) {
  return {
    id: `${type.slice(0, 3).toUpperCase()}-${Date.now()}-${index + 1}`,
    ...row
  };
}
