import React, { useState } from 'react';
import { AppState, OpsOvertimeRecord } from '../../types';
import { Clock, DollarSign, TrendingUp, TrendingDown, AlertOctagon, PlusCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface OpsOvertimeTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsOvertimeTab({ state, onOpenSubmit }: OpsOvertimeTabProps) {
  const [selectedRecord, setSelectedRecord] = useState<OpsOvertimeRecord | null>(null);

  const records = state.opsOvertimeRecords || [];

  const totalOtHours = records.reduce((s, r) => s + r.ot_hours, 0);
  const totalOtCost = records.reduce((s, r) => s + r.total_ot_cost, 0);
  const totalOtCostLakhs = Math.round((totalOtCost / 100000) * 100) / 100;
  const exceptionCount = records.filter(r => r.is_significant_exception).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 2: Overtime &amp; Cost Causality Chain</h3>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold rounded-full">
              Financial Impact Analysis
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Demonstrates why OT occurs: <strong>Absenteeism → Reliever Availability Gap → OT Hours → Financial Cost</strong>.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log OT &amp; Cost Entry</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">TOTAL OT HOURS</span>
          <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">{totalOtHours.toLocaleString()} hrs</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Across All Client Sites</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">TOTAL OT COST</span>
          <div className="text-xl font-mono font-bold text-foreground mt-1">₹ {totalOtCostLakhs} Lakhs</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">₹ {totalOtCost.toLocaleString()} INR Total</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">SIGNIFICANT EXCEPTIONS</span>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{exceptionCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">&gt; 40 hrs / Unscheduled OT</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">AVG OT RATE / HR</span>
          <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">₹ 165</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Standard Direct Wage Multiple</div>
        </div>
      </div>

      {/* Causal Chain Spotlight Graphic */}
      <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
        <div className="text-xs font-bold text-foreground flex items-center justify-between">
          <span className="uppercase tracking-wider font-mono">Executive Causality Visualizer</span>
          <span className="text-[11px] text-muted-foreground">Why does Overtime cost exist?</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-card border border-rose-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">STEP 1: ABSENTEEISM</span>
            <div className="text-base font-bold text-foreground">Field Guard Absence</div>
            <p className="text-[11px] text-muted-foreground">Unplanned leaves, personal emergency, transit delays.</p>
          </div>
          <div className="p-3 bg-card border border-amber-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">STEP 2: RELIEVER GAP</span>
            <div className="text-base font-bold text-foreground">Reliever Shortfall</div>
            <p className="text-[11px] text-muted-foreground">Reserve reliever pool exhausted or distant from site post.</p>
          </div>
          <div className="p-3 bg-card border border-blue-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-500 uppercase">STEP 3: CONTINUOUS DUTY</span>
            <div className="text-base font-bold text-foreground">Double Shift (OT Hours)</div>
            <p className="text-[11px] text-muted-foreground">Off-going guard held back for continuous 16hr post coverage.</p>
          </div>
          <div className="p-3 bg-card border border-emerald-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">STEP 4: FINANCIAL RESULT</span>
            <div className="text-base font-bold text-foreground">OT Cost Incurred</div>
            <p className="text-[11px] text-muted-foreground">Billed or absorbed cost impacting site gross margins.</p>
          </div>
        </div>
      </div>

      {/* Table with Drill-down & Causality Stories */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Site Location &amp; Client</th>
                <th className="py-2.5 px-3">Service &amp; Category</th>
                <th className="py-2.5 px-3 text-right">OT Hours</th>
                <th className="py-2.5 px-3 text-right">Prior Period</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-right">Total Cost (₹)</th>
                <th className="py-2.5 px-3">Causal Chain &amp; Operational Story</th>
                <th className="py-2.5 px-3 text-right">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map(r => (
                <tr 
                  key={r.id} 
                  className={`hover:bg-muted/30 transition cursor-pointer ${
                    r.is_significant_exception ? 'bg-amber-500/5' : ''
                  }`}
                  onClick={() => setSelectedRecord(r)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      {r.site_name}
                      {r.is_significant_exception && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-[9px] font-bold">
                          EXCEPTION
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{r.client_name}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-foreground font-medium">{r.service_type}</div>
                    <div className="text-[10px] text-muted-foreground">{r.category}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                    {r.ot_hours} hrs
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {r.prior_period_ot_hours} hrs
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.variance_hours > 0 ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'
                    }`}>
                      {r.variance_hours > 0 ? `+${r.variance_hours}` : r.variance_hours} hrs ({r.variance_pct}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    ₹ {r.total_ot_cost_lakhs} L
                    <div className="text-[10px] text-muted-foreground font-normal">@ ₹{r.ot_rate_per_hr}/hr</div>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <div className="text-foreground text-[11px] line-clamp-2">{r.operational_story}</div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span>Absentees: {r.causal_chain.absentee_count}</span>
                      <span>•</span>
                      <span>Reliever Gap: {r.causal_chain.reliever_gap}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground font-medium">
                    {r.approved_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Record Modal / Detail Drawer */}
      {selectedRecord && (
        <div className="p-4 bg-card border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>{selectedRecord.site_name}</span>
                <span className="text-xs text-muted-foreground">({selectedRecord.client_name})</span>
              </h4>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                Detailed Overtime Causality Record • {selectedRecord.period}
              </span>
            </div>
            <button 
              onClick={() => setSelectedRecord(null)}
              className="px-2.5 py-1 text-xs bg-muted text-foreground rounded-lg hover:bg-muted/80 font-bold"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">ABSENTEE GUARDS</span>
              <div className="text-base font-mono font-bold text-rose-600 mt-0.5">{selectedRecord.causal_chain.absentee_count} Shifts</div>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">RELIEVER SHORTFALL</span>
              <div className="text-base font-mono font-bold text-amber-600 mt-0.5">{selectedRecord.causal_chain.reliever_gap} Guards</div>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">DRIVEN OT HOURS</span>
              <div className="text-base font-mono font-bold text-foreground mt-0.5">{selectedRecord.ot_hours} Hours</div>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">FINANCIAL IMPACT</span>
              <div className="text-base font-mono font-bold text-emerald-600 mt-0.5">₹ {selectedRecord.total_ot_cost.toLocaleString()} INR</div>
            </div>
          </div>

          <div className="p-3 bg-background border border-border rounded-xl text-xs space-y-1">
            <div className="font-bold text-foreground">Operational Root Cause Narrative:</div>
            <p className="text-muted-foreground leading-relaxed">{selectedRecord.operational_story}</p>
          </div>
        </div>
      )}
    </div>
  );
}
