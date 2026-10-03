import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Wrench,
  Camera,
  QrCode,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Eye,
  Check
} from 'lucide-react';
import {
  OpsAttendanceRecord,
  OpsOvertimeRecord,
  OpsSiteInspectionRecord,
  OpsClientComplaintRecord,
  OpsSlaComplianceRecord,
  OpsUniformAvailabilityRecord,
  OpsIdCardComplianceRecord,
  OpsEquipmentRecord,
  OpsAttentionItem,
  OpsDataDefinition
} from '../types';

export type OpsModalTab = 
  | 'attendance'
  | 'overtime'
  | 'inspections'
  | 'complaints'
  | 'sla'
  | 'uniform'
  | 'id_card'
  | 'equipment'
  | 'attention'
  | 'dictionary';

interface OpsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: OpsModalTab;
  opsAttendance?: OpsAttendanceRecord[];
  opsOvertime?: OpsOvertimeRecord[];
  opsInspections?: OpsSiteInspectionRecord[];
  opsComplaints?: OpsClientComplaintRecord[];
  opsSlas?: OpsSlaComplianceRecord[];
  opsUniforms?: OpsUniformAvailabilityRecord[];
  opsIdCards?: OpsIdCardComplianceRecord[];
  opsEquipments?: OpsEquipmentRecord[];
  opsAttention?: OpsAttentionItem[];
  opsDefinitions?: OpsDataDefinition[];
}

export const OpsDrillDownModal: React.FC<OpsDrillDownModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'attendance',
  opsAttendance = [],
  opsOvertime = [],
  opsInspections = [],
  opsComplaints = [],
  opsSlas = [],
  opsUniforms = [],
  opsIdCards = [],
  opsEquipments = [],
  opsAttention = [],
  opsDefinitions = []
}) => {
  const [activeTab, setActiveTab] = useState<OpsModalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string; tag?: string } | null>(null);

  // Sync initial tab when changed
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  Operations Intelligence &amp; Field Drill-Down
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  CEO Operational Layer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> OpsVision Linked
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comprehensive operational drill-downs, root cause causality chain, audit proofs &amp; attention radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-muted/20 border-b border-border overflow-x-auto text-xs font-semibold">
          {[
            { id: 'attention', label: '🚨 Attention Required', count: opsAttention.length },
            { id: 'attendance', label: '👥 1. Manpower & Attendance', count: opsAttendance.length },
            { id: 'overtime', label: '💰 2. OT & Cost Causality', count: opsOvertime.length },
            { id: 'inspections', label: '🔍 3. Site Inspections', count: opsInspections.length },
            { id: 'complaints', label: '🤝 4. Client Complaints', count: opsComplaints.length },
            { id: 'sla', label: '📊 5. SLA Compliance (OpsVision)', count: opsSlas.length },
            { id: 'uniform', label: '🎽 6. Uniform Availability', count: opsUniforms.length },
            { id: 'id_card', label: '🪪 7. ID Card Field Audit', count: opsIdCards.length },
            { id: 'equipment', label: '⚙️ 8. Machinery & Screening', count: opsEquipments.length },
            { id: 'dictionary', label: '📖 IT Data Dictionary', count: opsDefinitions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as OpsModalTab);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 py-2.5 border-b border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search in ${activeTab.replace('_', ' ')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-rose-500 text-foreground"
            />
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-3 w-full sm:w-auto justify-end font-mono">
            <span>Client → Site → Service → Date/Shift Drilldown</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB: ATTENTION REQUIRED */}
          {activeTab === 'attention' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Operations — Attention Required (Executive Dynamic Radar)
                    </h4>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
                      Surfaces critical site shortages, severe OT spikes, overdue client complaints, and broken equipment needing immediate CEO intervention.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white font-mono">
                  {opsAttention.length} Active Exceptions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {opsAttention
                  .filter(item => 
                    item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition space-y-2.5 ${
                        item.severity === 'Critical'
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.severity === 'Critical'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {item.severity}
                          </span>
                          <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.created_at}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-foreground">{item.headline}</h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-background/80 p-2.5 rounded-lg border border-border">
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Location / Site</span>
                          <strong className="text-foreground">{item.site_name}</strong>
                          <span className="text-[10px] text-muted-foreground block">{item.client_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Metric vs Threshold</span>
                          <strong className="text-rose-600 dark:text-rose-400">{item.metric_value}</strong>
                          <span className="text-[10px] text-muted-foreground block font-mono">Benchmark: {item.threshold_value}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-muted/40 rounded-lg text-[11px] border border-border/60">
                        <span className="text-[10px] font-bold text-foreground uppercase block mb-0.5">
                          ⚡ Action Plan &amp; Owner
                        </span>
                        <p className="text-muted-foreground">{item.action_needed}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span>Owner: <strong className="text-foreground">{item.owner}</strong></span>
                          <span className="px-2 py-0.2 bg-rose-500/10 text-rose-600 rounded font-semibold">Under Ops Escalation</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 1: MANPOWER & ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Site Attendance %</span>
                  <strong className="text-sm text-emerald-600">94.2%</strong> (368 / 390 Present)
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Absenteeism %</span>
                  <strong className="text-sm text-rose-600">5.8%</strong> (22 Absent Shifts)
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Reliever Availability</span>
                  <strong className="text-sm text-amber-600">18 Available / 22 Required</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Net Roster Shortage</span>
                  <strong className="text-sm text-rose-600">4 Net Shortage (2 Sites)</strong>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-mono text-[11px] border-b border-border">
                    <tr>
                      <th className="p-3">Client &amp; Site</th>
                      <th className="p-3">Service &amp; Category</th>
                      <th className="p-3">Shift / Date</th>
                      <th className="p-3 text-right">Required</th>
                      <th className="p-3 text-right">Present</th>
                      <th className="p-3 text-right">Absent</th>
                      <th className="p-3 text-right">Attn %</th>
                      <th className="p-3 text-center">Relievers</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {opsAttendance
                      .filter(rec => 
                        rec.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rec.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rec.service_type.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-muted/30 transition">
                          <td className="p-3">
                            <strong className="text-foreground block">{rec.site_name}</strong>
                            <span className="text-[11px] text-muted-foreground">{rec.client_name}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-foreground block">{rec.service_type}</span>
                            <span className="text-[11px] text-muted-foreground">{rec.category}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="px-2 py-0.5 bg-muted rounded font-bold">{rec.shift}</span>
                            <span className="text-muted-foreground block mt-0.5">{rec.date}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold">{rec.required_manpower}</td>
                          <td className="p-3 text-right font-mono text-emerald-600 font-bold">{rec.present_count}</td>
                          <td className="p-3 text-right font-mono text-rose-600 font-bold">{rec.absent_count}</td>
                          <td className="p-3 text-right font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded ${
                              rec.attendance_pct >= 95
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : rec.attendance_pct >= 90
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {rec.attendance_pct}%
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-[11px]">
                            {rec.relievers_available} / {rec.relievers_required}
                            {rec.reliever_shortage > 0 && (
                              <span className="text-rose-600 font-bold block text-[10px]">
                                -{rec.reliever_shortage} Short
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'Normal'
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : rec.status === 'Shortage'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs text-[11px] text-muted-foreground">
                            {rec.action_taken || 'Normal operations'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: OVERTIME & COST WITH CAUSALITY CHAIN */}
          {activeTab === 'overtime' && (
            <div className="space-y-4">
              {/* Executive Causality Chain Box */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-blue-500/10 border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                    Causality Chain: Absenteeism → Reliever Gap → OT Hours → OT Cost
                  </h4>
                  <span className="text-xs font-mono font-bold text-foreground">
                    Total OT: 1,240 hrs | ₹4.85 Lakhs Cost
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The dashboard directly connects unplanned absenteeism to reliever buffer deficits, showing the exact root cause of financial overtime escalation.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center font-mono">
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">1. Absent Shifts</span>
                    <strong className="text-sm text-rose-600">142 Shifts</strong>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">2. Reliever Gap</span>
                    <strong className="text-sm text-amber-600">42 Uncovered</strong>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">3. Driven OT Hours</span>
                    <strong className="text-sm text-blue-600">1,240 Hours</strong>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">4. Financial Cost</span>
                    <strong className="text-sm text-emerald-600">₹4,85,000</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {opsOvertime
                  .filter(o => 
                    o.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.operational_story.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((ot) => (
                    <div key={ot.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-foreground">{ot.site_name}</strong>
                            <span className="text-xs text-muted-foreground">• {ot.client_name}</span>
                            {ot.is_significant_exception && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                ⚠️ Significant Exception
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{ot.service_type} ({ot.category})</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <div className="text-right">
                            <span className="text-muted-foreground text-[10px] block">OT Hours</span>
                            <strong className="text-foreground text-sm">{ot.ot_hours} hrs</strong>
                            <span className={`text-[10px] block ${ot.variance_pct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {ot.variance_pct > 0 ? `+${ot.variance_pct}% vs Prior` : `${ot.variance_pct}% vs Prior`}
                            </span>
                          </div>
                          <div className="text-right pl-3 border-l border-border">
                            <span className="text-muted-foreground text-[10px] block">Total OT Cost</span>
                            <strong className="text-rose-600 text-sm">₹{ot.total_ot_cost_lakhs} Lakhs</strong>
                            <span className="text-[10px] text-muted-foreground block">₹{ot.ot_rate_per_hr}/hr base</span>
                          </div>
                        </div>
                      </div>

                      {/* Operational Story & Causality */}
                      <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border border-border/50">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground">Operational Story &amp; Context:</span>
                          <span className="text-muted-foreground font-mono">Approved by: {ot.approved_by}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {ot.operational_story}
                        </p>
                        {ot.causal_chain && (
                          <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-muted-foreground">
                            <span>Absent: <strong className="text-rose-600">{ot.causal_chain.absentee_count}</strong></span>
                            <span>→</span>
                            <span>Reliever Shortage: <strong className="text-amber-600">{ot.causal_chain.reliever_gap}</strong></span>
                            <span>→</span>
                            <span>Incurred OT: <strong className="text-foreground">{ot.causal_chain.driven_ot_hours} hrs</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: SITE INSPECTIONS (Planned vs Completed Model) */}
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Planned Inspections</span>
                  <strong className="text-sm text-foreground">64 Scheduled</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Completed Audits</span>
                  <strong className="text-sm text-emerald-600">58 Completed (90.6%)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Avg Quality Score</span>
                  <strong className="text-sm text-blue-600">88.5% Audit Score</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Escalated Violations</span>
                  <strong className="text-sm text-rose-600">2 Actions Overdue</strong>
                </div>
              </div>

              <div className="space-y-3">
                {opsInspections
                  .filter(insp =>
                    insp.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    insp.inspector_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    insp.findings_observations.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((insp) => (
                    <div key={insp.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-foreground">{insp.site_name}</strong>
                            <span className="text-xs text-muted-foreground">• {insp.client_name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">({insp.inspection_code})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>Officer: <strong className="text-foreground">{insp.inspector_name}</strong> ({insp.inspector_role})</span>
                            <span>•</span>
                            <span className="font-mono">{insp.actual_inspection_date}</span>
                            {insp.qr_scan_verified && (
                              <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-bold">
                                <QrCode className="w-3 h-3" /> GPS/QR Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <span className="text-muted-foreground text-[10px] block">Audit Score</span>
                            <strong className={`text-base font-bold ${
                              insp.score_pct >= 90 ? 'text-emerald-600' : insp.score_pct >= 80 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {insp.score_pct}%
                            </strong>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            insp.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : insp.status === 'Pending Action'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {insp.status}
                          </span>
                        </div>
                      </div>

                      {/* Findings & Action Required */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-muted/40 rounded-lg space-y-1 border border-border/50">
                          <span className="text-[10px] font-bold uppercase text-foreground">Findings &amp; Observations:</span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">{insp.findings_observations}</p>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg space-y-1 border border-border/50">
                          <span className="text-[10px] font-bold uppercase text-rose-600">Action Required &amp; Owner:</span>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">{insp.action_required}</p>
                          <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>Responsible: <strong className="text-foreground">{insp.responsible_person}</strong></span>
                            <span>Due: {insp.due_date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Checklist Items & Evidence Photos */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 pt-1 border-t border-border/60">
                        <div className="flex flex-wrap items-center gap-2">
                          {insp.checklist_items?.map((chk, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                                chk.passed
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {chk.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {chk.item}
                            </span>
                          ))}
                        </div>

                        {insp.evidence_photos && insp.evidence_photos.length > 0 && (
                          <div className="flex items-center gap-2">
                            {insp.evidence_photos.map((photo, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedPhoto(photo)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{photo.tag || 'Evidence Photo'}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT COMPLAINTS & CLOSURE */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Complaints Received</span>
                  <strong className="text-sm text-foreground">18 MTD Logged</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Closed Complaints</span>
                  <strong className="text-sm text-emerald-600">15 Closed (83.3%)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Open / In-Progress</span>
                  <strong className="text-sm text-amber-600">3 Pending Action</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Overdue Escalations</span>
                  <strong className="text-sm text-rose-600">1 Overdue SLA</strong>
                </div>
              </div>

              <div className="space-y-3">
                {opsComplaints
                  .filter(c => 
                    c.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.complaint_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((comp) => (
                    <div key={comp.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">{comp.ticket_no}</span>
                            <span className="text-xs text-muted-foreground">• {comp.site_name} ({comp.client_name})</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                              {comp.complaint_category}
                            </span>
                            {comp.is_overdue && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                Overdue
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{comp.service} • Logged via {comp.source_system} on {comp.date_received}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            comp.status === 'Closed'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : comp.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {comp.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-foreground">Complaint Description:</span>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{comp.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-muted/40 rounded-lg space-y-1 border border-border/50">
                          <span className="text-[10px] font-bold uppercase text-foreground">Action Plan &amp; Owner:</span>
                          <p className="text-muted-foreground text-[11px]">{comp.action_plan}</p>
                          <div className="pt-1 text-[10px] text-muted-foreground font-mono">
                            Owner: <strong className="text-foreground">{comp.complaint_owner}</strong> | Target: {comp.target_closure_date}
                          </div>
                        </div>

                        <div className="p-3 bg-muted/40 rounded-lg space-y-1 border border-border/50">
                          <span className="text-[10px] font-bold uppercase text-emerald-600">Closure Evidence &amp; Proof:</span>
                          {comp.closure_evidence_notes ? (
                            <p className="text-muted-foreground text-[11px]">{comp.closure_evidence_notes}</p>
                          ) : (
                            <p className="text-amber-600 text-[11px] italic">Awaiting resolution &amp; client sign-off proof...</p>
                          )}
                          {comp.actual_closure_date && (
                            <div className="pt-1 text-[10px] text-emerald-600 font-mono">
                              Closed on: {comp.actual_closure_date} {comp.satisfaction_rating && `• Rating: ${comp.satisfaction_rating}/5 ⭐`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: SLA COMPLIANCE (OPSVISION DIGITAL FM MODEL) */}
          {activeTab === 'sla' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      OpsVision Digital FM Telemetry &amp; SLA Compliance Engine
                    </h4>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-400">
                      Live sensor, QR scan and shift task pass rates feeding executive compliance scores.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold font-mono">
                  Overall SLA: 96.4%
                </span>
              </div>

              <div className="space-y-3">
                {opsSlas
                  .filter(s => 
                    s.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.area_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((sla) => (
                    <div key={sla.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-foreground">{sla.site_name}</strong>
                            <span className="text-xs text-muted-foreground">• {sla.client_name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">({sla.ops_vision_ref})</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{sla.service_type} — {sla.area_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <span className="text-muted-foreground text-[10px] block">Target vs Achieved</span>
                            <span className="text-xs text-muted-foreground">Target: {sla.sla_target_pct}% • </span>
                            <strong className={`text-sm ${sla.sla_achieved_pct >= sla.sla_target_pct ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {sla.sla_achieved_pct}%
                            </strong>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            sla.status === 'Compliant'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : sla.status === 'At Risk'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {sla.status}
                          </span>
                        </div>
                      </div>

                      {/* Underlying Tasks Stream */}
                      {sla.underlying_tasks && (
                        <div className="space-y-2 pt-2 border-t border-border/60">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground font-mono block">
                            OpsVision Underlying Task Checkpoints ({sla.tasks_passed}/{sla.total_tasks_monitored} Passed)
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sla.underlying_tasks.map((task) => (
                              <div key={task.task_id} className="p-2.5 bg-muted/30 rounded-lg text-xs space-y-1 border border-border/40">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-foreground text-[11px]">{task.task_name}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    task.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                  }`}>
                                    {task.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                                  <span>{task.qr_code_location}</span>
                                  <span>{task.scan_time} • {task.officer_name}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{task.checklist_summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: UNIFORM AVAILABILITY */}
          {activeTab === 'uniform' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Uniform Availability %</span>
                  <strong className="text-sm text-emerald-600">96.2% Overall</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Sites with Shortage</span>
                  <strong className="text-sm text-amber-600">4 Sites (22 Sets Short)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Dispatched Indents</span>
                  <strong className="text-sm text-blue-600">2 In Transit (DTDC)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Turnout Compliance</span>
                  <strong className="text-sm text-emerald-600">98.5% on Duty</strong>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-mono text-[11px] border-b border-border">
                    <tr>
                      <th className="p-3">Site &amp; Client</th>
                      <th className="p-3">Uniform Category</th>
                      <th className="p-3 text-right">Required Sets</th>
                      <th className="p-3 text-right">Available Sets</th>
                      <th className="p-3 text-right">Availability %</th>
                      <th className="p-3 text-center">Shortage Qty</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Indent / Action Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {opsUniforms
                      .filter(u => 
                        u.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.client_name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((uni) => (
                        <tr key={uni.id} className="hover:bg-muted/30 transition">
                          <td className="p-3">
                            <strong className="text-foreground block">{uni.site_name}</strong>
                            <span className="text-[11px] text-muted-foreground">{uni.client_name}</span>
                          </td>
                          <td className="p-3">{uni.service_category}</td>
                          <td className="p-3 text-right font-mono">{uni.required_sets_at_site}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">{uni.available_sets_at_site}</td>
                          <td className="p-3 text-right font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded ${
                              uni.availability_pct >= 98
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {uni.availability_pct}%
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            {uni.site_shortage_qty > 0 ? (
                              <span className="text-rose-600">-{uni.site_shortage_qty}</span>
                            ) : (
                              <span className="text-emerald-600">0</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              uni.status === 'Sufficient'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : uni.status === 'Indent Dispatched'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {uni.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-muted-foreground">
                            {uni.action_plan}
                            {uni.pending_indent_ref && (
                              <span className="block text-[10px] font-mono text-blue-600 mt-0.5">
                                Ref: {uni.pending_indent_ref} ({uni.responsible_supervisor})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ID CARD FIELD COMPLIANCE */}
          {activeTab === 'id_card' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Field Compliance %</span>
                  <strong className="text-sm text-emerald-600">98.1% Compliant</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Exception Rate</span>
                  <strong className="text-sm text-amber-600">1.9% Exceptions (7 Pax)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Active Temp Passes</span>
                  <strong className="text-sm text-blue-600">5 Temp Passes Issued</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Replacement Pipeline</span>
                  <strong className="text-sm text-emerald-600">48-Hr SLA Enforced</strong>
                </div>
              </div>

              <div className="space-y-3">
                {opsIdCards
                  .filter(idc => 
                    idc.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    idc.client_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((idc) => (
                    <div key={idc.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-sm text-foreground">{idc.site_name}</strong>
                          <span className="text-xs text-muted-foreground"> • {idc.client_name} ({idc.service_category})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span>{idc.compliant_id_count}/{idc.total_staff_on_duty} Checked</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                            {idc.compliance_pct}%
                          </span>
                        </div>
                      </div>

                      {idc.exceptions_list && idc.exceptions_list.length > 0 ? (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-muted/60 text-muted-foreground font-mono text-[10px]">
                              <tr>
                                <th className="p-2">Employee ID &amp; Name</th>
                                <th className="p-2">Role</th>
                                <th className="p-2">Turnout Issue</th>
                                <th className="p-2 text-center">Temp Pass</th>
                                <th className="p-2">Target Date</th>
                                <th className="p-2 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {idc.exceptions_list.map((ex, i) => (
                                <tr key={i} className="hover:bg-muted/30">
                                  <td className="p-2 font-mono font-bold text-foreground">
                                    {ex.employee_id} - {ex.employee_name}
                                  </td>
                                  <td className="p-2">{ex.role}</td>
                                  <td className="p-2 text-rose-600 font-medium">{ex.issue}</td>
                                  <td className="p-2 text-center">
                                    {ex.temp_pass_issued ? (
                                      <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold">YES</span>
                                    ) : (
                                      <span className="text-muted-foreground text-[10px]">NO</span>
                                    )}
                                  </td>
                                  <td className="p-2 font-mono text-muted-foreground">{ex.target_card_date}</td>
                                  <td className="p-2 text-right">
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[10px] font-bold">
                                      {ex.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-500/5 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>100% ID card and lanyard compliance verified at muster roll.</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 8: MACHINERY & SCREENING EQUIPMENT */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Equipment Availability</span>
                  <strong className="text-sm text-emerald-600">91.0% (71 / 78 Operational)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Under Repair / Breakdown</span>
                  <strong className="text-sm text-rose-600">5 Machines</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Contractual Indent Gap</span>
                  <strong className="text-sm text-amber-600">2 Indented Units</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">AMC Active Ratio</span>
                  <strong className="text-sm text-blue-600">96.0% Covered</strong>
                </div>
              </div>

              <div className="space-y-3">
                {opsEquipments
                  .filter(eq => 
                    eq.machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    eq.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    eq.equipment_code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((eq) => (
                    <div key={eq.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-foreground">{eq.machine_name}</strong>
                            <span className="font-mono text-[11px] text-muted-foreground">({eq.equipment_code})</span>
                            {eq.is_critical_for_sla && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                Critical for SLA
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{eq.site_name} ({eq.client_name}) • {eq.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            eq.status === 'Available'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : eq.status === 'Under Repair'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                            {eq.status}
                          </span>
                        </div>
                      </div>

                      {eq.issue_description && (
                        <div className="p-3 bg-rose-500/5 rounded-lg text-xs space-y-1 border border-rose-500/15">
                          <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">Breakdown Issue:</span>
                          <p className="text-muted-foreground text-[11px]">{eq.issue_description}</p>
                          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                            <span>Vendor: {eq.service_partner_vendor}</span>
                            <span>Action: {eq.action_required}</span>
                            <span>ETA Ready: <strong className="text-foreground">{eq.expected_operational_date}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 9: IT DATA DICTIONARY */}
          {activeTab === 'dictionary' && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Operations KPI Governance &amp; Data Definitions Dictionary
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    IT data dictionary defining mathematical formulas, source modules (OpsVision, Biometric Muster), and drill-down governance.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {opsDefinitions
                  .filter(d => 
                    d.metric_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.functional_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.calculation_logic.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((def) => (
                    <div key={def.id} className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-foreground">{def.metric_name}</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                            {def.functional_group}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-emerald-600 font-bold">{def.status}</span>
                      </div>

                      <div className="p-3 bg-muted/40 rounded-lg text-xs font-mono text-foreground space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Calculation Formula</span>
                        <p className="text-[11px] leading-relaxed">{def.calculation_logic}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                        <div>
                          <span className="text-[10px] uppercase block font-bold text-foreground">Source System</span>
                          <span>{def.source_system}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block font-bold text-foreground">Drill-Down Hierarchy</span>
                          <span>{def.drill_down_path}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block font-bold text-foreground">Target Benchmark</span>
                          <strong className="text-foreground font-mono">{def.target_benchmark}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OpsVision Real-Time Telemetry Stream Connected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-90 transition"
          >
            Close Drill-Down
          </button>
        </div>

      </div>

      {/* Embedded Photo Evidence Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-border p-4 rounded-2xl max-w-2xl w-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{selectedPhoto.tag || 'Inspection Proof'}</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};
