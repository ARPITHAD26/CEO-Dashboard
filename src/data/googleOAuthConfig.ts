/**
 * Google OAuth Configuration & Email-to-Department Mapping
 *
 * When a user signs in with Google, their Gmail address is matched against
 * the EMAIL_TO_ROLE_MAP below to determine their role/department access.
 *
 * HOW TO ADD A USER:
 *   Add their Gmail address and the role they should receive:
 *   'firstname.lastname@gmail.com': { role: 'HR Head', department: 'Human Resources & Talent' }
 */

import { Role, UserAccount } from '../types';

// ─── Google Client ID ─────────────────────────────────────────────────────────
// Set VITE_GOOGLE_CLIENT_ID in your .env file.
// Get it from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '';

// ─── Email → Role Mapping ─────────────────────────────────────────────────────
// Add every allowed Gmail/Google Workspace email here with their corresponding role.
// Keys are lowercase email addresses.
export interface GoogleRoleMapping {
  role: Role;
  name: string;
  department: string;
  fullAccess: boolean;
}

export const EMAIL_TO_ROLE_MAP: Record<string, GoogleRoleMapping> = {
  // ── Spoorthy company emails (Google Workspace) ──────────────────────────────
  'ceo@spoorthy.com':          { role: 'CEO',              name: 'Dr. Spoorthy V. (CEO)',              department: 'Executive Board',                  fullAccess: true  },
  'admin@spoorthy.com':        { role: 'Admin',            name: 'Master System Administrator',        department: 'Global Security & Operations',     fullAccess: true  },
  'procurement@spoorthy.com':  { role: 'Procurement Head', name: 'Rajesh Kumar (Procurement Head)',    department: 'Procurement & Supply Chain',        fullAccess: false },
  'finance@spoorthy.com':      { role: 'Finance Head',     name: 'Finance Head',                       department: 'Finance & Accounts Control',        fullAccess: false },
  'bd@spoorthy.com':           { role: 'BD Head',          name: 'Vikram Malhotra (BD Head)',          department: 'Business Development & Tenders',   fullAccess: false },
  'hr@spoorthy.com':           { role: 'HR Head',          name: 'Pooja Nair (HR Head)',               department: 'Human Resources & Talent',         fullAccess: false },
  'operations@spoorthy.com':   { role: 'Operations Head',  name: 'Col. S. Rathore (Operations Head)', department: 'Facility & Security Operations',    fullAccess: false },
  'ops@spoorthy.com':          { role: 'Operations Head',  name: 'Col. S. Rathore (Operations Head)', department: 'Facility & Security Operations',    fullAccess: false },
  'training@spoorthy.com':     { role: 'Training Head',    name: 'Training Head',                      department: 'Training & Skill Development',      fullAccess: false },
  'it@spoorthy.com':           { role: 'IT Head',          name: 'Arun Verma (IT Head)',               department: 'IT & Infrastructure Health',        fullAccess: false },

  // ── Add personal Gmail addresses below (replace with real Gmail IDs) ─────────
  // Example:
  // 'john.ceo@gmail.com':        { role: 'CEO',              name: 'John (CEO)',              department: 'Executive Board',          fullAccess: true  },
  // 'finance.head@gmail.com':    { role: 'Finance Head',     name: 'Finance Manager',         department: 'Finance & Accounts',       fullAccess: false },
};

// ─── Decode Google JWT (ID Token) ────────────────────────────────────────────
// Google GSI returns a base64-encoded JWT. We decode the payload to extract
// the user's email, name, and picture WITHOUT calling any backend.
export interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
  email_verified: boolean;
  given_name: string;
  family_name: string;
}

export function decodeGoogleJwt(credential: string): GoogleJwtPayload | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    // JWT payload is the second part, base64url encoded
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as GoogleJwtPayload;
  } catch {
    return null;
  }
}

// ─── Resolve Google User → UserAccount ───────────────────────────────────────
// Returns a UserAccount if the Gmail is in the mapping, or null if unauthorized.
export function resolveGoogleUser(credential: string): UserAccount | null {
  const payload = decodeGoogleJwt(credential);
  if (!payload) return null;
  if (!payload.email_verified) return null;

  const email = payload.email.toLowerCase().trim();
  const mapping = EMAIL_TO_ROLE_MAP[email];

  if (!mapping) {
    // Email not in the authorized list
    return null;
  }

  return {
    username: email.split('@')[0],
    email: payload.email,
    name: payload.name || mapping.name,
    role: mapping.role,
    department: mapping.department,
  };
}

// ─── Type augmentation for Google GSI global ─────────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
            }
          ) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, done: () => void) => void;
        };
      };
    };
  }
}
