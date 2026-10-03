import React from 'react';
import { AppState, OpsAttentionItem } from '../../types';
import { AlertOctagon, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Users, Wrench } from 'lucide-react';

interface OpsAttentionTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsAttentionTab({ state, onOpenSubmit }: OpsAttentionTabProps) {
  const attentionItems = state.opsAttentionItems || [];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-card border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">OPERATIONS — ATTENTION REQUIRED RADAR</h3>
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold rounded-full animate-pulse">
              Live Threshold Scanner
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Dynamic exceptions exceeding operational thresholds (Attendance &lt; 90%, Reliever shortfalls, SLA deficits &lt; 95%, Overdue complaints, Broken machinery).
          </p>
        </div>
      </div>

      {/* Exception Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attentionItems.map(item => (
          <div 
            key={item.id}
            className={`p-4 rounded-2xl border bg-card transition shadow-sm space-y-3 ${
              item.severity === 'Critical' 
                ? 'border-rose-500/40 bg-rose-500/5' 
                : 'border-amber-500/40 bg-amber-500/5'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  item.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {item.severity}
                </span>
                <span className="text-xs font-bold text-muted-foreground font-mono">{item.category}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{item.created_at}</span>
            </div>

            <div>
              <h4 className="font-bold text-foreground text-sm">{item.headline}</h4>
              <div className="text-xs text-muted-foreground mt-0.5">
                Site: <strong>{item.site_name}</strong> • Client: {item.client_name}
              </div>
            </div>

            <div className="p-2.5 bg-background/80 border border-border rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Observed: <strong className="text-rose-600 dark:text-rose-400">{item.metric_value}</strong></span>
                <span className="text-muted-foreground">Threshold: <strong>{item.threshold_value}</strong></span>
              </div>
              <div className="text-foreground text-[11px] font-medium pt-1">
                <strong>Action Needed:</strong> {item.action_needed}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Owner: <strong>{item.owner}</strong></span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Active Exception
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
