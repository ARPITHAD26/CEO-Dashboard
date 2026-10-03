import React, { useState, FormEvent } from 'react';
import { AppState, Site, Complaint, Incident, Task } from '../types';
import { logAuditEntry } from '../data/store';
import { 
  ShieldAlert, CheckCircle, Trash2, Edit2, PlusCircle, AlertOctagon,
  Users, Clock, Camera, AlertCircle, ShieldCheck, Wrench, BookOpen,
  Sparkles, Layers, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { OpsSubmitCenterModal, OpsSubmitType } from './ops/OpsSubmitCenterModal';
import { OpsManpowerTab } from './ops/OpsManpowerTab';
import { OpsOvertimeTab } from './ops/OpsOvertimeTab';
import { OpsInspectionsTab } from './ops/OpsInspectionsTab';
import { OpsComplaintsTab } from './ops/OpsComplaintsTab';
import { OpsSlaTab } from './ops/OpsSlaTab';
import { OpsReadinessTab } from './ops/OpsReadinessTab';
import { OpsAttentionTab } from './ops/OpsAttentionTab';
import { OpsDictionaryTab } from './ops/OpsDictionaryTab';

interface OperationsViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

export default function OperationsView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName 
}: OperationsViewProps) {
  
  // Tab definitions covering the CEO Functional Inputs & Operation Submit Center
  const allTabs = [
    { id: 'manpower', label: '1. Manpower & Attendance', icon: Users },
    { id: 'overtime', label: '2. OT & Cost Causality', icon: Clock },
    { id: 'inspections', label: '3. Site Inspections (Audit)', icon: Camera },
    { id: 'client_complaints', label: '4. Client Complaints (OpsVision)', icon: AlertCircle },
    { id: 'sla_telemetry', label: '5. SLA & QR Telemetry', icon: ShieldCheck },
    { id: 'readiness', label: '6. Site Readiness (Uniform/ID/Machinery)', icon: Wrench },
    { id: 'attention', label: '7. Attention Required Radar', icon: AlertOctagon },
    { id: 'sites', label: '8. Security Sites Master', icon: Layers },
    { id: 'incidents', label: '9. Security Incident Logs', icon: ShieldAlert },
    { id: 'tasks', label: '10. Operations Tasks', icon: CheckCircle },
    { id: 'dictionary', label: '11. IT Data Dictionary', icon: BookOpen }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'manpower';

  const [activeSubTab, setActiveSubTab] = useState<string>(defaultTab);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitModalInitialType, setSubmitModalInitialType] = useState<OpsSubmitType>('attendance');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forms matching legacy Site, Complaint, and Incident types
  const [siteForm, setSiteForm] = useState<Partial<Site>>({
    name: '', region: 'South Region', client_id: '', required_manpower: 10, deployed_manpower: 10, supervisor_id: '', audit_score: 95
  });
  const [complForm, setComplForm] = useState<Partial<Complaint>>({
    site_id: '', category: 'Uniform Dress Code Infraction', status: 'Open'
  });
  const [incForm, setIncForm] = useState<Partial<Incident>>({
    site_id: '', type: 'Intruder Alert / Perimeter Breach', severity: 'High', status: 'Open'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Stats
  const totalSites = state.sites.length;
  const pendingComplaints = state.complaints.filter(c => c.status === 'Open').length;
  const activeIncidents = state.incidents.filter(i => i.status !== 'Resolved').length;
  const avgSlaScore = state.sites.length > 0
    ? Math.round(state.sites.reduce((sum, s) => sum + s.audit_score, 0) / state.sites.length)
    : 100;

  const openSubmitCenter = (type: OpsSubmitType) => {
    setSubmitModalInitialType(type);
    setIsSubmitModalOpen(true);
  };

  const handleSiteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!siteForm.name || !siteForm.region) return;

    let updatedSites = [...state.sites];
    const isEdit = !!editingId;
    const siteId = editingId || `S-${Date.now()}`;

    const score = Number(siteForm.audit_score) || 95;
    const health = score >= 85 ? 'Green' : score >= 75 ? 'Amber' : 'Red';

    const newSite: Site = {
      id: siteId,
      name: siteForm.name,
      region: siteForm.region,
      client_id: siteForm.client_id || 'C-001',
      required_manpower: Number(siteForm.required_manpower) || 10,
      deployed_manpower: Number(siteForm.deployed_manpower) || 10,
      supervisor_id: siteForm.supervisor_id || 'EMP-003',
      audit_score: score,
      site_health: health
    };

    if (isEdit) {
      updatedSites = updatedSites.map(s => s.id === siteId ? newSite : s);
      setEditingId(null);
    } else {
      updatedSites.push(newSite);
    }

    const nextState = { ...state, sites: updatedSites };
    logAuditEntry(nextState, currentUserEmail, isEdit ? 'UPDATE' : 'CREATE', 'Site', siteId, isEdit ? 'Updated site details' : 'Registered new operations site', JSON.stringify(newSite));
    onUpdateState(nextState);
    setSiteForm({ name: '', region: 'South Region', client_id: '', required_manpower: 10, deployed_manpower: 10, supervisor_id: '', audit_score: 95 });
    triggerSuccess(`Operations Site ${isEdit ? 'updated' : 'registered'} successfully!`);
  };

  const handleIncSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!incForm.site_id || !incForm.type) return;

    let updatedIncs = [...state.incidents];
    const isEdit = !!editingId;
    const incId = editingId || `INC-${Date.now()}`;

    const newInc: Incident = {
      id: incId,
      site_id: incForm.site_id,
      type: incForm.type,
      severity: (incForm.severity as any) || 'Medium',
      date: incForm.date || new Date().toISOString().split('T')[0],
      status: (incForm.status as any) || 'Open'
    };

    if (isEdit) {
      updatedIncs = updatedIncs.map(i => i.id === incId ? newInc : i);
      setEditingId(null);
    } else {
      updatedIncs.push(newInc);
    }

    const nextState = { ...state, incidents: updatedIncs };
    logAuditEntry(nextState, currentUserEmail, isEdit ? 'UPDATE' : 'CREATE', 'Incident', incId, isEdit ? 'Updated security incident' : 'Reported security incident');
    onUpdateState(nextState);
    setIncForm({ site_id: '', type: 'Intruder Alert / Perimeter Breach', severity: 'High', status: 'Open' });
    triggerSuccess(`Security incident ${isEdit ? 'updated' : 'reported'} successfully!`);
  };

  const deleteSite = (siteId: string) => {
    const nextSites = state.sites.filter(s => s.id !== siteId);
    const nextState = { ...state, sites: nextSites };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Site', siteId, 'Deleted site profile');
    onUpdateState(nextState);
    triggerSuccess('Site removed successfully.');
  };

  const deleteIncident = (incId: string) => {
    const nextIncs = state.incidents.filter(i => i.id !== incId);
    const nextState = { ...state, incidents: nextIncs };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Incident', incId, 'Deleted incident record');
    onUpdateState(nextState);
    triggerSuccess('Incident record deleted.');
  };

  const resolveIncident = (incId: string) => {
    const nextIncs = state.incidents.map(i => i.id === incId ? { ...i, status: 'Resolved' as const } : i);
    const nextState = { ...state, incidents: nextIncs };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'Incident', incId, 'Marked incident resolved');
    onUpdateState(nextState);
    triggerSuccess('Incident marked resolved.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filter tasks
  const myTasks = state.tasks.filter(t => t.department === 'Operations' || (t.assigned_to || '').toLowerCase().includes('operations'));

  return (
    <div className="space-y-6">
      
      {/* Operations Header & Fast Action Launch Bar */}
      <div className="p-5 bg-card border border-border rounded-2xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground font-mono">Operations Management Center</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold border border-rose-500/20">
              OpsVision Engine Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            End-to-end field telemetry, site audits, manpower muster, and overtime causality controls.
          </p>
        </div>

        {/* Action Center Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openSubmitCenter('attendance')}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Submit Attendance</span>
          </button>
          <button
            onClick={() => openSubmitCenter('overtime')}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log OT &amp; Cost</span>
          </button>
          <button
            onClick={() => openSubmitCenter('inspection')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Site Audit (Photos)</span>
          </button>
          <button
            onClick={() => openSubmitCenter('complaint')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Log Client Complaint</span>
          </button>
          <button
            onClick={() => openSubmitCenter('sla')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SLA Check</span>
          </button>
        </div>
      </div>

      {/* Operations Stats KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">SIS ACTIVE SITES</span>
          <div className="text-2xl font-mono font-bold mt-2 text-foreground">{totalSites}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Across 4 Operational Regions</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-amber-500 uppercase">PENDING COMPLAINTS</span>
          <div className="text-2xl font-mono font-bold mt-2 text-amber-500">{pendingComplaints}</div>
          <div className="text-[10px] text-amber-500/80 mt-1">Target 48h Resolution</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-rose-500 uppercase">ACTIVE INCIDENTS</span>
          <div className="text-2xl font-mono font-bold mt-2 text-rose-500">{activeIncidents}</div>
          <div className="text-[10px] text-rose-500/80 mt-1">Perimeter &amp; Security Alerts</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-emerald-500 uppercase font-bold">AVG SLA AUDIT SCORE</span>
          <div className="text-2xl font-mono font-bold mt-2 text-emerald-500">{avgSlaScore}%</div>
          <div className="text-[10px] text-emerald-500/80 mt-1">Target: &ge; 85% Benchmark</div>
        </div>
      </div>

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-300">
              Your view is filtered to your operational responsibilities.
            </span>
          </div>
        </div>
      )}

      {/* Selector SubTabs */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        {availableTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSubTab(tab.id); setEditingId(null); }}
              className={`px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive 
                  ? 'border-b-2 border-rose-500 text-rose-500 font-bold bg-rose-500/5 rounded-t-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-lg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-bold">
          {successMsg}
        </div>
      )}

      {/* Tab Panels */}
      <div>
        {activeSubTab === 'manpower' && (
          <OpsManpowerTab state={state} onOpenSubmit={() => openSubmitCenter('attendance')} />
        )}

        {activeSubTab === 'overtime' && (
          <OpsOvertimeTab state={state} onOpenSubmit={() => openSubmitCenter('overtime')} />
        )}

        {activeSubTab === 'inspections' && (
          <OpsInspectionsTab state={state} onOpenSubmit={() => openSubmitCenter('inspection')} />
        )}

        {activeSubTab === 'client_complaints' && (
          <OpsComplaintsTab 
            state={state} 
            onOpenSubmit={() => openSubmitCenter('complaint')} 
            onUpdateState={onUpdateState} 
            currentUserEmail={currentUserEmail} 
          />
        )}

        {activeSubTab === 'sla_telemetry' && (
          <OpsSlaTab state={state} onOpenSubmit={() => openSubmitCenter('sla')} />
        )}

        {activeSubTab === 'readiness' && (
          <OpsReadinessTab state={state} onOpenSubmit={() => openSubmitCenter('uniform')} />
        )}

        {activeSubTab === 'attention' && (
          <OpsAttentionTab state={state} onOpenSubmit={() => openSubmitCenter('attendance')} />
        )}

        {activeSubTab === 'dictionary' && (
          <OpsDictionaryTab state={state} />
        )}

        {/* 8. Security Sites Master */}
        {activeSubTab === 'sites' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">SIS Security Sites Roster</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">Site Name</th>
                      <th className="py-2">Region</th>
                      <th className="py-2">Deployed / Required</th>
                      <th className="py-2">SLA Score</th>
                      <th className="py-2">Health</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.sites.map(s => (
                      <tr key={s.id} className="hover:bg-muted/35">
                        <td className="py-3 text-foreground font-bold">{s.name}</td>
                        <td className="py-3 text-muted-foreground font-mono">{s.region}</td>
                        <td className="py-3 font-mono text-foreground font-semibold">{s.deployed_manpower} / {s.required_manpower} Staff</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            s.audit_score >= 85 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {s.audit_score}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            s.site_health === 'Green' ? 'bg-emerald-500/10 text-emerald-500' :
                            s.site_health === 'Amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {s.site_health}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingId(s.id);
                              setSiteForm(s);
                            }}
                            className="p-1 bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSite(s.id)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Site Add Form */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground font-mono">
                {editingId ? 'Edit Security Site' : 'Register New Site'}
              </h3>
              <form onSubmit={handleSiteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground">Site Name</label>
                  <input
                    type="text"
                    required
                    value={siteForm.name || ''}
                    onChange={e => setSiteForm({ ...siteForm, name: e.target.value })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">Region</label>
                  <select
                    value={siteForm.region || 'South Region'}
                    onChange={e => setSiteForm({ ...siteForm, region: e.target.value as any })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="South Region">South Region</option>
                    <option value="North Region">North Region</option>
                    <option value="East Region">East Region</option>
                    <option value="West Region">West Region</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-muted-foreground">Required Staff</label>
                    <input
                      type="number"
                      value={siteForm.required_manpower || 10}
                      onChange={e => setSiteForm({ ...siteForm, required_manpower: Number(e.target.value) })}
                      className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground">Deployed Staff</label>
                    <input
                      type="number"
                      value={siteForm.deployed_manpower || 10}
                      onChange={e => setSiteForm({ ...siteForm, deployed_manpower: Number(e.target.value) })}
                      className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">Audit Score (%)</label>
                  <input
                    type="number"
                    value={siteForm.audit_score || 95}
                    onChange={e => setSiteForm({ ...siteForm, audit_score: Number(e.target.value) })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition"
                >
                  {editingId ? 'Update Site' : 'Register Site'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 9. Security Incidents */}
        {activeSubTab === 'incidents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Active Security Incidents</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">Site Location</th>
                      <th className="py-2">Incident Type</th>
                      <th className="py-2">Severity</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.incidents.map(i => {
                      const siteName = state.sites.find(s => s.id === i.site_id)?.name || 'Central Site';
                      return (
                        <tr key={i.id} className="hover:bg-muted/35">
                          <td className="py-3 text-foreground font-bold">{siteName}</td>
                          <td className="py-3 text-foreground">{i.type}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              i.severity === 'Critical' ? 'bg-red-500/20 text-red-500' :
                              i.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {i.severity}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              i.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {i.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1">
                            {i.status !== 'Resolved' && (
                              <button
                                onClick={() => resolveIncident(i.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition"
                              >
                                Resolve
                              </button>
                            )}
                            <button
                              onClick={() => deleteIncident(i.id)}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex align-middle"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Incident Form */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground font-mono">Report Security Incident</h3>
              <form onSubmit={handleIncSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground">Site Location</label>
                  <select
                    required
                    value={incForm.site_id || ''}
                    onChange={e => setIncForm({ ...incForm, site_id: e.target.value })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Site...</option>
                    {state.sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.region})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">Incident Classification</label>
                  <input
                    type="text"
                    required
                    value={incForm.type || ''}
                    onChange={e => setIncForm({ ...incForm, type: e.target.value })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground">Severity Level</label>
                  <select
                    value={incForm.severity || 'High'}
                    onChange={e => setIncForm({ ...incForm, severity: e.target.value as any })}
                    className="w-full p-2 mt-1 bg-background border border-border rounded-lg text-foreground font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition"
                >
                  Report Incident
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 10. Operations Tasks */}
        {activeSubTab === 'tasks' && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Assigned Operations Action Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2">Task Title</th>
                    <th className="py-2">Assigned To</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Progress</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myTasks.map(t => (
                    <tr key={t.id} className="hover:bg-muted/35">
                      <td className="py-3 text-foreground font-bold">{t.title}</td>
                      <td className="py-3 text-muted-foreground">{t.assigned_to}</td>
                      <td className="py-3 font-mono text-muted-foreground">{t.due_date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-foreground font-bold">{t.percent_completed}%</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold text-foreground">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fast Operation Submit Center Modal */}
      <OpsSubmitCenterModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        initialType={submitModalInitialType}
        state={state}
        onUpdateState={onUpdateState}
        currentUserEmail={currentUserEmail}
      />

    </div>
  );
}
