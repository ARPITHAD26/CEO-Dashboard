import { Role, UserAccount } from '../types';

export interface StandardUserCredentials {
  username: string;
  aliases: string[];
  password: string;
  role: Role;
  name: string;
  department: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  fullAccess: boolean;
}

export const STANDARD_USERS: StandardUserCredentials[] = [
  {
    username: 'CEO',
    aliases: ['ceo'],
    password: 'Spoorthy@06',
    role: 'CEO',
    name: 'CEO',
    department: 'Executive Board',
    description: 'Strategic & Portfolio Command Cockpit (Full Unrestricted Access to All Pages & Modules)',
    color: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    fullAccess: true
  },
  {
    username: 'Admin',
    aliases: ['admin'],
    password: 'Admin@2026',
    role: 'Admin',
    name: 'Administrator',
    department: 'Global Security & Operations',
    description: 'Master System Administration & Access Control (Full Access to All Pages & Modules)',
    color: 'from-indigo-500 to-purple-600',
    badgeBg: 'bg-indigo-500/15',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    fullAccess: true
  },
  {
    username: 'BD',
    aliases: ['bd'],
    password: 'BD@2026',
    role: 'BD Head',
    name: 'Business Development Head',
    department: 'Business Development & Tenders',
    description: 'Sales Pipeline, Corporate Leads, Tenders & Client Masters',
    color: 'from-sky-400 to-sky-600',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
    fullAccess: false
  },
  {
    username: 'Finance',
    aliases: ['finance'],
    password: 'Finance@2026',
    role: 'Finance Head',
    name: 'Finance Head',
    department: 'Finance & Accounts Control',
    description: 'Client Invoices, Receivables, Operational Expenses & Monthly Budgets',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    fullAccess: false
  },
  {
    username: 'HR',
    aliases: ['hr'],
    password: 'HR@2026',
    role: 'HR Head',
    name: 'HR Head',
    department: 'Human Resources & Talent',
    description: 'Workforce Roster, Daily Biometrics, Leaves & Disciplinary Logs',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    fullAccess: false
  },
  {
    username: 'IT',
    aliases: ['it'],
    password: 'IT@2026',
    role: 'IT Head',
    name: 'IT Head',
    department: 'IT & Infrastructure Health',
    description: 'App Latencies, VPS Node Telemetry, Helpdesk Tickets & SSL Security',
    color: 'from-cyan-500 to-teal-500',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    fullAccess: false
  },
  {
    username: 'Operations',
    aliases: ['operations'],
    password: 'Ops@2026',
    role: 'Operations Head',
    name: 'Operations Head',
    department: 'Facility & Security Operations',
    description: 'Facility Sites, Guard Deployments, Client Complaints & Incident Desk',
    color: 'from-sky-500 to-sky-600',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
    fullAccess: false
  },
  {
    username: 'Procurement',
    aliases: ['procurement'],
    password: 'Procurement@26',
    role: 'Procurement Head',
    name: 'Procurement Head',
    department: 'Procurement & Supply Chain',
    description: 'Purchase Indents, 3-Way Match, Vendor Directory & Material Ledger',
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    fullAccess: false
  },
  {
    username: 'Training',
    aliases: ['training'],
    password: 'Train@2026',
    role: 'Training Head',
    name: 'Training Head',
    department: 'Training & Skill Development',
    description: 'Compliance Programs, Guard Certifications & Competency Scoreboard',
    color: 'from-fuchsia-500 to-pink-600',
    badgeBg: 'bg-fuchsia-500/15',
    badgeBorder: 'border-fuchsia-500/30',
    badgeText: 'text-fuchsia-400',
    fullAccess: false
  }
];

export const SESSION_STORAGE_KEY = 'spoorthy_executive_session_user';

export function authenticateUser(identifier: string, password: string): UserAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) return null;

  // 1. Check standard predefined accounts
  const standardMatch = STANDARD_USERS.find(user =>
    user.username.toLowerCase() === cleanId ||
    user.aliases.some(alias => alias.toLowerCase() === cleanId)
  );

  if (standardMatch) {
    const isPasswordValid =
      cleanPass === standardMatch.password ||
      (standardMatch.username === 'operations' && cleanPass === 'ops123');

    if (isPasswordValid) {
      return {
        username: standardMatch.username,
        email: standardMatch.aliases.find(a => a.includes('@')) || `${standardMatch.username}@spoorthy.com`,
        name: standardMatch.name,
        role: standardMatch.role,
        department: standardMatch.department
      };
    }
    return null;
  }

  // 2. Fallback check custom created users from localStorage
  try {
    const customUsersRaw = localStorage.getItem('executive_custom_users');
    if (customUsersRaw) {
      const customUsers = JSON.parse(customUsersRaw);
      const found = customUsers.find((cu: any) =>
        cu.username?.toLowerCase() === cleanId ||
        cu.email?.toLowerCase() === cleanId
      );
      if (found && found.password === cleanPass) {
        return {
          username: found.username,
          email: found.email,
          name: found.name,
          role: found.role,
          subRoleId: found.subRoleId,
          subRoleName: found.subRoleName,
          allowedSubViews: found.allowedSubViews,
          department: found.department
        };
      }
    }
  } catch (err) {
    console.error('Error verifying custom user credentials:', err);
  }

  return null;
}

export function hasFullAccess(role: Role): boolean {
  return role === 'Admin' || role === 'CEO';
}

export function isTabAllowed(userRole: Role, targetTab: Role): boolean {
  if (hasFullAccess(userRole)) {
    return true;
  }
  if (targetTab === 'Government Tenders' && (userRole === 'Procurement Head' || userRole === 'BD Head')) {
    return true;
  }
  if (targetTab === 'Private Tenders' && (userRole === 'Procurement Head' || userRole === 'BD Head')) {
    return true;
  }
  return userRole === targetTab;
}

export function getAllowedTabsForRole(role: Role): Role[] {
  if (hasFullAccess(role)) {
    return [
      'CEO',
      'Government Tenders',
      'Private Tenders',
      'Procurement Head',
      'Finance Head',
      'BD Head',
      'HR Head',
      'Operations Head',
      'Training Head',
      'IT Head',
      'Admin'
    ];
  }
  if (role === 'Procurement Head' || role === 'BD Head') {
    return [role, 'Government Tenders', 'Private Tenders'];
  }
  return [role];
}

export function getSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

export function setSessionUser(user: UserAccount): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save session user:', err);
  }
}

export function clearSessionUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session user:', err);
  }
}
