import { Role } from '../types';

export interface VerticalViewOption {
  id: string;
  name: string;
  description: string;
  iconName?: string;
}

export interface VerticalMetadata {
  role: Role;
  verticalName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  badgeClass: string;
  views: VerticalViewOption[];
}

export const VERTICAL_CONFIGS: Record<Role, VerticalMetadata> = {
  'Finance Head': {
    role: 'Finance Head',
    verticalName: 'Finance & Accounts',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    views: [
      { id: 'invoices', name: 'Client Invoices & Receivables', description: 'Raise and track client invoices, payments, and outstanding' },
      { id: 'expenses', name: 'Operational Expenses & Budget', description: 'Log expense heads, monthly budgets, and actual burn' },
      { id: 'tasks', name: 'Action Items & Compliance Tasks', description: 'Internal team action logs and deadline trackers' }
    ]
  },
  'Procurement Head': {
    role: 'Procurement Head',
    verticalName: 'Procurement & Vendor SLA',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    views: [
      { id: 'requests', name: 'Purchase Requests (PR & PO)', description: 'Create and authorize procurement orders and PO numbers' },
      { id: 'vendors', name: 'Vendor Directory & AMC Tracker', description: 'Manage vendor performance scores and annual contracts' },
      { id: 'tasks', name: 'Procurement Action Tasks', description: 'Vendor follow-ups, item deliveries, and material receipts' }
    ]
  },
  'HR Head': {
    role: 'HR Head',
    verticalName: 'Human Resources & Talent',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    views: [
      { id: 'employees', name: 'Employee Roster & Headcount', description: 'Staff directory, site deployments, and vacancy status' },
      { id: 'attendance', name: 'Daily Biometric & Punch Log', description: 'Attendance records, overtime tracking, and leave adjustments' },
      { id: 'leaves', name: 'Leave Application Approvals', description: 'Privilege leaves, sick leaves, and approvals' },
      { id: 'disciplinary', name: 'Disciplinary & Grievance Cases', description: 'Infraction logs, warnings, and resolutions' },
      { id: 'tasks', name: 'HR Action Tasks', description: 'Onboarding milestones and policy rollouts' }
    ]
  },
  'BD Head': {
    role: 'BD Head',
    verticalName: 'Business Development & Tenders',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    views: [
      { id: 'leads', name: 'Sales Pipeline & Corporate Leads', description: 'Corporate deals, proposal statuses, and win probability' },
      { id: 'clients', name: 'Enterprise Client Directory', description: 'Account masters and client contracts' },
      { id: 'tasks', name: 'BD Follow-ups & Tasks', description: 'Client meetings, pitch decks, and RFP filings' }
    ]
  },
  'Operations Head': {
    role: 'Operations Head',
    verticalName: 'Facility & Security Operations',
    color: 'sky',
    accentBg: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    views: [
      { id: 'sites', name: 'Facility Sites & Manpower Health', description: 'Site deployment strength, audit scores, and SLA health' },
      { id: 'complaints', name: 'Client Complaints & Feedback', description: 'Escalations, turnaround time, and corrective actions' },
      { id: 'incidents', name: 'Security & Safety Incident Desk', description: 'Breaches, fire safety triggers, and resolution logs' },
      { id: 'tasks', name: 'Site Ops Action Tasks', description: 'Site inspections, roster reallocations, and drills' }
    ]
  },
  'Training Head': {
    role: 'Training Head',
    verticalName: 'Training & Skill Development',
    color: 'fuchsia',
    accentBg: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/30',
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    views: [
      { id: 'programs', name: 'Training Programs & Scores', description: 'Fire drills, compliance scores, and certifications' },
      { id: 'tasks', name: 'Training Action Tasks', description: 'Schedule batch training sessions and materials' }
    ]
  },
  'IT Head': {
    role: 'IT Head',
    verticalName: 'IT & Infrastructure Health',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    views: [
      { id: 'applications', name: 'Application Health & Uptime', description: 'Web apps, biometric endpoints, and response latencies' },
      { id: 'servers', name: 'VPS Nodes & Database Clusters', description: 'Hostinger VPS nodes, CPU, RAM, and NVMe telemetry' },
      { id: 'tickets', name: 'IT Support & Helpdesk Tickets', description: 'Hardware repair, VPN access, and account requests' },
      { id: 'security', name: 'Security Checks & SSL Radar', description: 'SSL expiration, MongoDB backups, and firewall status' }
    ]
  },
  'CEO': {
    role: 'CEO',
    verticalName: 'Executive Cockpit',
    color: 'rose',
    accentBg: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    views: [
      { id: 'overview', name: 'Master Enterprise Metrics', description: 'Full revenue, headcount, SLA health, and pipeline radar' }
    ]
  },
  'Admin': {
    role: 'Admin',
    verticalName: 'System Administration',
    color: 'violet',
    accentBg: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    views: [
      { id: 'users', name: 'User Role Mappings', description: 'Assign access roles and emails' },
      { id: 'subroles', name: 'Custom Sub-Roles & Scopes', description: 'Create granular sub-roles per vertical' },
      { id: 'database', name: 'Database Maintenance', description: 'Database seeding and system controls' }
    ]
  }
};
