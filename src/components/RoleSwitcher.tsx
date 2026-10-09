import { Role } from '../types';
import { Shield, RefreshCw } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  onResetData: () => void;
}

const ROLES_INFO: Record<Role, { name: string; desc: string; color: string }> = {
  CEO: { name: 'CEO & Founder', desc: 'Financial, Portfolio & Strategy', color: 'from-rose-500 to-red-600' },
  Admin: { name: 'Master System Admin', desc: 'Full Security Control Access', color: 'from-indigo-500 to-purple-600' },
  'Government Tenders': { name: 'Government Tender Module', desc: 'Public Bids, Portals, Eligibility & Statutory Compliance', color: 'from-indigo-500 to-blue-600' },
  'Private Tenders': { name: 'Private Tender Module', desc: 'Corporate proposals, negotiation guardrails & client pipeline', color: 'from-emerald-500 to-teal-600' },
  'Procurement Head': { name: 'Procurement Head', desc: 'SLA Assets & Partner Vendors', color: 'from-cyan-500 to-blue-600' },
  'Finance Head': { name: 'Finance Head', desc: 'Invoices, Payroll & Budgets', color: 'from-emerald-500 to-teal-600' },
  'BD Head': { name: 'Business Development Head', desc: 'Corporate Leads & Active Tenders', color: 'from-sky-400 to-sky-600' },
  'HR Head': { name: 'Human Resources Head', desc: 'Roster, Attendance & Leaves', color: 'from-amber-500 to-orange-600' },
  'Operations Head': { name: 'Operations Head', desc: 'Sites, Complaints & Alerts', color: 'from-sky-500 to-sky-600' },
  'Training Head': { name: 'Training & Development Head', desc: 'Programs, Grades & Expiries', color: 'from-fuchsia-500 to-pink-600' },
  'IT Head': { name: 'Information Technology Head', desc: 'App Health, VPS Nodes, Tickets & Security', color: 'from-cyan-500 to-teal-500' }
};

export default function RoleSwitcher({ currentRole, onChangeRole, onResetData }: RoleSwitcherProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-[#0B0F19]/95 border border-slate-800 p-4 rounded-xl shadow-2xl max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">DEMO CONTROL CENTER</span>
          </div>
          <button 
            onClick={onResetData}
            title="Reset Database to Seed Data"
            className="text-slate-500 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition duration-150 flex items-center gap-1 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Active Persona View
          </label>
          <div className="relative">
            <select
              id="role-switcher-select"
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as Role)}
              className="w-full bg-[#161B2A] border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-cyan-500 cursor-pointer font-medium font-mono"
            >
              <option value="CEO">CEO (Strategic/Financial)</option>
              <option value="Admin">System Administrator</option>
              <option value="Government Tenders">🏛️ Government Tender Module (GOV Series)</option>
              <option value="Private Tenders">Private Tender Module (PVT Series)</option>
              <option value="Procurement Head">Procurement Head</option>
              <option value="Finance Head">Finance Head</option>
              <option value="BD Head">BD Head</option>
              <option value="HR Head">HR Head</option>
              <option value="Operations Head">Operations Head</option>
              <option value="Training Head">Training Head</option>
              <option value="IT Head">IT Head (App Status & VPS)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 items-start mt-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${ROLES_INFO[currentRole].color} shrink-0 mt-0.5 shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{ROLES_INFO[currentRole].name}</span>
            <span className="text-[11px] text-slate-400">{ROLES_INFO[currentRole].desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
