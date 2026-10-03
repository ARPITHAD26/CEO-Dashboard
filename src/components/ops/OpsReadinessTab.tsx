import React, { useState } from 'react';
import { AppState, OpsUniformAvailabilityRecord, OpsIdCardComplianceRecord, OpsEquipmentRecord } from '../../types';
import { Wrench, ShieldCheck, UserCheck, AlertTriangle, PlusCircle, CheckCircle, Clock } from 'lucide-react';

interface OpsReadinessTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsReadinessTab({ state, onOpenSubmit }: OpsReadinessTabProps) {
  const [subSection, setSubSection] = useState<'uniform' | 'idcard' | 'equipment'>('uniform');

  const uniforms = state.opsUniformAvailabilities || [];
  const idCards = state.opsIdCardCompliances || [];
  const equipments = state.opsEquipmentRecords || [];

  const avgUniformAvail = uniforms.length > 0 
    ? Math.round(uniforms.reduce((sum, u) => sum + u.availability_pct, 0) / uniforms.length) 
    : 95;

  const avgIdComp = idCards.length > 0 
    ? Math.round(idCards.reduce((sum, i) => sum + i.compliance_pct, 0) / idCards.length) 
    : 96;

  const availableEquipCount = equipments.filter(e => e.status === 'Available').length;
  const underRepairEquipCount = equipments.filter(e => e.status === 'Under Repair' || e.status === 'Unavailable').length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-card to-card border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 6: Site Readiness (Uniforms, IDs &amp; Machinery)</h3>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold rounded-full">
              Field Asset &amp; Grooming Health
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitors <strong>Uniform Availability %</strong>, <strong>ID Card Compliance %</strong>, and <strong>Heavy Machinery Availability &amp; Breakdown logs</strong>.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit Readiness Log</span>
        </button>
      </div>

      {/* Sub-selector pills */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setSubSection('uniform')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            subSection === 'uniform' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Uniform Availability ({avgUniformAvail}%)</span>
        </button>
        <button
          onClick={() => setSubSection('idcard')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            subSection === 'idcard' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>ID Card Compliance ({avgIdComp}%)</span>
        </button>
        <button
          onClick={() => setSubSection('equipment')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            subSection === 'equipment' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Machinery &amp; Equipment ({availableEquipCount} Up / {underRepairEquipCount} Repair)</span>
        </button>
      </div>

      {/* 1. Uniforms Section */}
      {subSection === 'uniform' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Site Location &amp; Client</th>
                  <th className="py-2.5 px-3">Service Category</th>
                  <th className="py-2.5 px-3 text-right">Required Sets</th>
                  <th className="py-2.5 px-3 text-right">Available Sets</th>
                  <th className="py-2.5 px-3 text-right">Availability %</th>
                  <th className="py-2.5 px-3 text-right">Shortage</th>
                  <th className="py-2.5 px-3">Action Plan / Indent Ref</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {uniforms.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{u.site_name}</div>
                      <div className="text-[10px] text-muted-foreground">{u.client_name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{u.service_category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{u.required_sets_at_site}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{u.available_sets_at_site}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        u.availability_pct >= 95 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        u.availability_pct >= 85 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {u.availability_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {u.site_shortage_qty > 0 ? `-${u.site_shortage_qty}` : '0'}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="text-foreground text-[11px]">{u.action_plan}</div>
                      {u.pending_indent_ref && (
                        <div className="text-[10px] text-muted-foreground font-mono">Ref: {u.pending_indent_ref}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'Sufficient' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ID Cards Section */}
      {subSection === 'idcard' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Site Location &amp; Client</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Staff on Duty</th>
                  <th className="py-2.5 px-3 text-right">Compliant IDs</th>
                  <th className="py-2.5 px-3 text-right">Compliance %</th>
                  <th className="py-2.5 px-3 text-right">Exceptions</th>
                  <th className="py-2.5 px-3">Active Exceptions Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {idCards.map(i => (
                  <tr key={i.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{i.site_name}</div>
                      <div className="text-[10px] text-muted-foreground">{i.client_name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{i.service_category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{i.total_staff_on_duty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{i.compliant_id_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        i.compliance_pct >= 95 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {i.compliance_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {i.exceptions_count}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      {i.exceptions_list?.length > 0 ? (
                        i.exceptions_list.map((ex, idx) => (
                          <div key={idx} className="font-medium text-foreground">
                            • {ex.employee_name} ({ex.issue} - {ex.status})
                          </div>
                        ))
                      ) : (
                        <span className="text-emerald-600 font-bold">100% ID Compliant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Machinery Section */}
      {subSection === 'equipment' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Equipment Code &amp; Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Site Location &amp; Client</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Breakdown Issue &amp; Action</th>
                  <th className="py-2.5 px-3">Expected Ready</th>
                  <th className="py-2.5 px-3 text-right">AMC Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {equipments.map(e => (
                  <tr key={e.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{e.machine_name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{e.equipment_code}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{e.category}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{e.site_name}</div>
                      <div className="text-[10px] text-muted-foreground">{e.client_name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        e.status === 'Under Repair' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      {e.issue_description ? (
                        <div>
                          <div className="text-foreground text-[11px] font-medium">{e.issue_description}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{e.action_required}</div>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-bold">Operational &amp; Clean</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {e.expected_operational_date || 'In Service'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-muted-foreground">
                      <div>{e.service_partner_vendor || 'OEM'}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">{e.amc_status}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
