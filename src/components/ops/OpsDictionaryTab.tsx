import React from 'react';
import { AppState } from '../../types';
import { BookOpen, CheckCircle, Database, Layers, Sparkles } from 'lucide-react';

interface OpsDictionaryTabProps {
  state: AppState;
}

export function OpsDictionaryTab({ state }: OpsDictionaryTabProps) {
  const definitions = state.opsDataDefinitions || [];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-card to-card border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">IT Data Dictionary &amp; OpsVision Telemetry Mapping</h3>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold rounded-full">
              Standard Operating Logic
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Clear technical definitions, calculation logic, upstream systems, and frequencies for all 8 operational streams.
          </p>
        </div>
      </div>

      {/* Dictionary Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Metric Name</th>
                <th className="py-2.5 px-3">Functional Block</th>
                <th className="py-2.5 px-3">Calculation Logic</th>
                <th className="py-2.5 px-3">Drill-Down Path</th>
                <th className="py-2.5 px-3">Source System</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {definitions.map(d => (
                <tr key={d.id} className="hover:bg-muted/30 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground">{d.metric_name}</div>
                    {d.target_benchmark && (
                      <div className="text-[10px] text-emerald-600 font-bold">Target: {d.target_benchmark}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">
                      {d.functional_group}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-xs font-mono text-[11px]">
                    {d.calculation_logic}
                  </td>
                  <td className="py-2.5 px-3 text-foreground font-mono text-[11px]">
                    {d.drill_down_path}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {d.source_system}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">
                    {d.frequency}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    {d.owner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
