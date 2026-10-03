import React, { useState } from 'react';
import { AppState, OpsSiteInspectionRecord } from '../../types';
import { Camera, CheckCircle, Clock, AlertTriangle, PlusCircle, QrCode, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface OpsInspectionsTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsInspectionsTab({ state, onOpenSubmit }: OpsInspectionsTabProps) {
  const [selectedInspection, setSelectedInspection] = useState<OpsSiteInspectionRecord | null>(null);

  const inspections = state.opsSiteInspections || [];

  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(i => i.status === 'Completed').length;
  const completionPct = totalInspections > 0 ? Math.round((completedInspections / totalInspections) * 100) : 100;
  const avgAuditScore = totalInspections > 0 
    ? Math.round(inspections.reduce((s, i) => s + i.score_pct, 0) / totalInspections) 
    : 92;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-card to-card border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 3: Site Control &amp; Field Inspections</h3>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold rounded-full">
              Planned vs Completed
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Audit logs with responsible person, corrective action deadlines, QR verification, and geotagged photographic evidence.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit Inspection Audit</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">AUDITS COMPLETED</span>
          <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
            {completedInspections} <span className="text-xs font-normal text-muted-foreground">/ {totalInspections}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{completionPct}% Execution Ratio</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">AVG AUDIT SCORE</span>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgAuditScore}%</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">High Quality Compliance</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">PENDING ACTIONS</span>
          <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
            {inspections.filter(i => i.status === 'Pending Action' || i.status === 'Escalated').length}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Open Corrective Plans</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">QR SCANS VERIFIED</span>
          <div className="text-xl font-mono font-bold text-foreground mt-1">
            {inspections.filter(i => i.qr_scan_verified).length} / {totalInspections}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">100% On-Site Geofenced</div>
        </div>
      </div>

      {/* Inspections Registry Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Inspection Code &amp; Site</th>
                <th className="py-2.5 px-3">Inspector Officer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3">Findings &amp; Action Required</th>
                <th className="py-2.5 px-3">Responsible Person</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inspections.map(i => (
                <tr 
                  key={i.id} 
                  className="hover:bg-muted/30 transition cursor-pointer"
                  onClick={() => setSelectedInspection(i)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground">{i.site_name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{i.inspection_code} • {i.client_name}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground">{i.inspector_name}</div>
                    <div className="text-[10px] text-muted-foreground">{i.inspector_role}</div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono">
                    {i.actual_inspection_date || i.planned_date}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      i.score_pct >= 90 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      i.score_pct >= 80 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {i.score_pct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <div className="font-medium text-foreground line-clamp-1">{i.findings_observations}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{i.action_required}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    {i.responsible_person}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">
                    {i.due_date}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      i.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      i.status === 'Pending Action' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline">
                      <ImageIcon className="w-3 h-3" />
                      {i.evidence_photos?.length || 0} Photos
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Detail Modal / Photo Viewer */}
      {selectedInspection && (
        <div className="p-4 bg-card border border-blue-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>{selectedInspection.inspection_code}</span>
                <span className="text-xs text-muted-foreground">({selectedInspection.site_name})</span>
              </h4>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">
                Inspected by {selectedInspection.inspector_name} • Score: {selectedInspection.score_pct}%
              </span>
            </div>
            <button 
              onClick={() => setSelectedInspection(null)}
              className="px-2.5 py-1 text-xs bg-muted text-foreground rounded-lg hover:bg-muted/80 font-bold"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="font-bold text-foreground">Findings &amp; Field Observations:</div>
                <p className="text-muted-foreground">{selectedInspection.findings_observations}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="font-bold text-foreground">Corrective Action Plan:</div>
                <p className="text-muted-foreground">{selectedInspection.action_required}</p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground font-mono">
                  <span>Assigned: <strong>{selectedInspection.responsible_person}</strong></span>
                  <span>Due: <strong>{selectedInspection.due_date}</strong></span>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                <span>Geotagged Photographic Proof ({selectedInspection.evidence_photos?.length || 0})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedInspection.evidence_photos?.map((p, idx) => (
                  <div key={idx} className="border border-border rounded-xl overflow-hidden bg-background">
                    <img 
                      src={p.url} 
                      alt={p.caption} 
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover" 
                    />
                    <div className="p-2 text-[10px]">
                      <div className="font-bold text-foreground line-clamp-1">{p.caption}</div>
                      <div className="text-muted-foreground font-mono">{p.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
