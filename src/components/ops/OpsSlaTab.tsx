import React, { useState } from 'react';
import { AppState, OpsSlaComplianceRecord } from '../../types';
import { ShieldCheck, AlertOctagon, CheckCircle, PlusCircle, QrCode, MapPin, Eye } from 'lucide-react';

interface OpsSlaTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsSlaTab({ state, onOpenSubmit }: OpsSlaTabProps) {
  const [selectedSla, setSelectedSla] = useState<OpsSlaComplianceRecord | null>(null);

  const slaRecords = state.opsSlaCompliances || [];

  const totalRecords = slaRecords.length;
  const compliantCount = slaRecords.filter(s => s.status === 'Compliant').length;
  const avgSla = totalRecords > 0 
    ? Math.round(slaRecords.reduce((sum, s) => sum + s.sla_achieved_pct, 0) / totalRecords * 10) / 10 
    : 96.8;
  const totalBreaches = slaRecords.reduce((sum, s) => sum + s.breach_count, 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-card to-card border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 5: SLA Compliance &amp; OpsVision Telemetry</h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold rounded-full">
              Full Telemetry Linkage
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Connects management SLA score to: <strong>Client → Site → Service → Area → Task → QR / GPS → Evidence</strong>.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit SLA Check</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">AVG SLA COMPLIANCE</span>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgSla}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Target: 95.0% Across Sites</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">COMPLIANT ZONES</span>
          <div className="text-xl font-mono font-bold text-foreground mt-1">
            {compliantCount} <span className="text-xs font-normal text-muted-foreground">/ {totalRecords}</span>
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Meeting Contract SLAs</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">TOTAL BREACHES</span>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{totalBreaches}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Penalty Risk Isolated</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">OPSVISION TASKS MONITORED</span>
          <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
            {slaRecords.reduce((sum, s) => sum + s.total_tasks_monitored, 0)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Real-time Checkpoints</div>
        </div>
      </div>

      {/* SLA Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Site Location &amp; Client</th>
                <th className="py-2.5 px-3">Monitored Area / Zone</th>
                <th className="py-2.5 px-3">Service Type</th>
                <th className="py-2.5 px-3 text-right">Target SLA</th>
                <th className="py-2.5 px-3 text-right">Achieved SLA</th>
                <th className="py-2.5 px-3 text-right">Tasks Passed</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">OpsVision Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slaRecords.map(s => (
                <tr 
                  key={s.id} 
                  className="hover:bg-muted/30 transition cursor-pointer"
                  onClick={() => setSelectedSla(s)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground">{s.site_name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.client_name}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{s.area_name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{s.service_type}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{s.sla_target_pct}%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      s.sla_achieved_pct >= s.sla_target_pct ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      s.sla_achieved_pct >= 90 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {s.sla_achieved_pct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    {s.tasks_passed} / {s.total_tasks_monitored}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      s.status === 'At Risk' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                      <QrCode className="w-3 h-3" />
                      {s.ops_vision_ref}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Detail Drawer */}
      {selectedSla && (
        <div className="p-4 bg-card border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>{selectedSla.area_name}</span>
                <span className="text-xs text-muted-foreground">({selectedSla.site_name})</span>
              </h4>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                OpsVision Telemetry Stream • Target {selectedSla.sla_target_pct}% vs Achieved {selectedSla.sla_achieved_pct}%
              </span>
            </div>
            <button 
              onClick={() => setSelectedSla(null)}
              className="px-2.5 py-1 text-xs bg-muted text-foreground rounded-lg hover:bg-muted/80 font-bold"
            >
              Close Details
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Underlying Tasks &amp; Digital Checkpoints ({selectedSla.underlying_tasks?.length || 0})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedSla.underlying_tasks?.map((t, idx) => (
                <div key={idx} className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{t.task_name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold">
                      PASSED
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{t.qr_code_location}</span>
                    <span>•</span>
                    <span>{t.scan_time}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">Officer: {t.officer_name}</div>
                  <div className="text-[10px] text-foreground font-medium pt-0.5">{t.checklist_summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
