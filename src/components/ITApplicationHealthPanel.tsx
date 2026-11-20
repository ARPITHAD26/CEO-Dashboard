import React, { useMemo } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock3, Cpu,
  HardDrive, LockKeyhole, Network, Server, ShieldCheck, Ticket, Zap
} from 'lucide-react';
import { AppState, ITApplication, ITSecurityCheck, ITServerNode, ITTicket } from '../types';

interface ITApplicationHealthPanelProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

type HealthTone = 'good' | 'warning' | 'critical' | 'neutral';

const closedTicketStatuses = new Set(['Resolved', 'Closed']);

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function isPastDue(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

function applicationTone(application: ITApplication): HealthTone {
  if (application.status === 'Outage') return 'critical';
  if (application.status === 'Degraded' || application.status === 'Maintenance') return 'warning';
  return 'good';
}

function serverTone(server: ITServerNode): HealthTone {
  if (server.status === 'Critical' || Math.max(server.cpu_usage_pct, server.memory_usage_pct, server.disk_usage_pct) >= 90) return 'critical';
  if (server.status === 'Warning' || Math.max(server.cpu_usage_pct, server.memory_usage_pct, server.disk_usage_pct) >= 75) return 'warning';
  return 'good';
}

function securityTone(check: ITSecurityCheck): HealthTone {
  if (check.status === 'Critical Failure') return 'critical';
  if (check.status === 'Attention Needed') return 'warning';
  return 'good';
}

function toneClasses(tone: HealthTone) {
  return {
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200'
  }[tone];
}

function dotClasses(tone: HealthTone) {
  return {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    neutral: 'bg-slate-400'
  }[tone];
}

function StatusPill({ label, tone }: { label: string; tone: HealthTone }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${toneClasses(tone)}`}><span className={`h-1.5 w-1.5 rounded-full ${dotClasses(tone)}`} />{label}</span>;
}

function MetricCard({ icon: Icon, label, value, caption, tone = 'neutral' }: { icon: React.ElementType; label: string; value: React.ReactNode; caption: string; tone?: HealthTone }) {
  const iconColor = tone === 'critical' ? 'text-rose-600' : tone === 'warning' ? 'text-amber-600' : tone === 'good' ? 'text-emerald-600' : 'text-cyan-600';
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-slate-500">{label}</span><Icon className={`h-4 w-4 ${iconColor}`} /></div><p className={`mt-2 font-mono text-2xl font-bold ${iconColor}`}>{value}</p><p className="mt-1 text-[11px] text-slate-500">{caption}</p></div>;
}

function ResourceBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const tone: HealthTone = value >= 90 ? 'critical' : value >= 75 ? 'warning' : 'good';
  const color = tone === 'critical' ? 'bg-rose-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-cyan-500';
  return <div><div className="mb-1 flex items-center justify-between text-[11px]"><span className="flex items-center gap-1.5 text-slate-500"><Icon className="h-3.5 w-3.5 text-slate-400" />{label}</span><span className={tone === 'critical' ? 'font-bold text-rose-600' : tone === 'warning' ? 'font-bold text-amber-600' : 'font-semibold text-slate-600'}>{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}

export default function ITApplicationHealthPanel({ state, onNavigate }: ITApplicationHealthPanelProps) {
  const health = useMemo(() => {
    const applications = state.itApplications || [];
    const servers = state.itServerNodes || [];
    const tickets = state.itTickets || [];
    const securityChecks = state.itSecurityChecks || [];
    const activeTickets = tickets.filter(ticket => !closedTicketStatuses.has(ticket.status));
    const unhealthyApps = applications.filter(app => applicationTone(app) !== 'good');
    const constrainedServers = servers.filter(server => serverTone(server) !== 'good');
    const failedChecks = securityChecks.filter(check => securityTone(check) !== 'good');
    const overdueTickets = activeTickets.filter(ticket => isPastDue(ticket.target_resolution_at));
    const criticalTickets = activeTickets.filter(ticket => ticket.priority === 'Critical');
    const averageUptime = applications.length
      ? applications.reduce((total, app) => total + app.uptime_pct, 0) / applications.length
      : 0;
    const averageLatency = applications.length
      ? Math.round(applications.reduce((total, app) => total + app.latency_ms, 0) / applications.length)
      : 0;
    const appRate = applications.length ? applications.filter(app => applicationTone(app) === 'good').length / applications.length : 1;
    const serverRate = servers.length ? servers.filter(server => serverTone(server) === 'good').length / servers.length : 1;
    const securityRate = securityChecks.length ? securityChecks.filter(check => securityTone(check) === 'good').length / securityChecks.length : 1;
    const supportRate = tickets.length ? 1 - ((criticalTickets.length + overdueTickets.length) / tickets.length) : 1;
    const healthScore = Math.round(Math.max(0, Math.min(100, (appRate * 45 + serverRate * 30 + securityRate * 15 + supportRate * 10) * 100)));
    const latestApplicationCheck = applications
      .map(app => app.last_checked)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const attention = [
      ...unhealthyApps.map(app => ({ id: `app-${app.id}`, title: app.name, detail: app.status === 'Outage' ? 'Application outage requires immediate restoration.' : `${app.status}: ${app.latency_ms} ms response time.`, tone: applicationTone(app), tab: 'applications' })),
      ...constrainedServers.map(server => ({ id: `server-${server.id}`, title: server.node_name, detail: `Capacity alert: CPU ${server.cpu_usage_pct}%, memory ${server.memory_usage_pct}%, disk ${server.disk_usage_pct}%.`, tone: serverTone(server), tab: 'servers' })),
      ...failedChecks.map(check => ({ id: `security-${check.id}`, title: check.check_name, detail: check.details, tone: securityTone(check), tab: 'security' })),
      ...criticalTickets.map(ticket => ({ id: `ticket-${ticket.id}`, title: ticket.subject, detail: `${ticket.ticket_no} is a critical unresolved support ticket.`, tone: 'critical' as HealthTone, tab: 'tickets' }))
    ].sort((left, right) => (left.tone === 'critical' ? -1 : 0) - (right.tone === 'critical' ? -1 : 0));

    return { applications, servers, tickets, securityChecks, activeTickets, unhealthyApps, constrainedServers, failedChecks, overdueTickets, criticalTickets, averageUptime, averageLatency, healthScore, latestApplicationCheck, attention };
  }, [state]);

  const overallTone: HealthTone = health.healthScore < 70 || health.unhealthyApps.some(app => app.status === 'Outage') ? 'critical' : health.healthScore < 90 || health.attention.length ? 'warning' : 'good';
  const overallLabel = overallTone === 'good' ? 'Healthy' : overallTone === 'warning' ? 'Attention needed' : 'Action required';

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-white p-5 shadow-sm lg:flex-row lg:items-center">
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-slate-800">IT &amp; Application Health</h2><StatusPill label={overallLabel} tone={overallTone} /></div><p className="mt-1 text-xs text-slate-500">A single operational view of services, infrastructure, support and security controls.</p></div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"><Activity className="h-5 w-5 text-cyan-600" /><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Operational health score</p><p className="font-mono text-lg font-bold text-slate-800">{health.healthScore}<span className="text-xs text-slate-400"> / 100</span></p></div></div>
    </div>

    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <MetricCard icon={Activity} label="Application availability" value={`${health.applications.filter(app => applicationTone(app) === 'good').length}/${health.applications.length}`} caption={`${health.unhealthyApps.length} requiring attention`} tone={health.unhealthyApps.some(app => app.status === 'Outage') ? 'critical' : health.unhealthyApps.length ? 'warning' : 'good'} />
      <MetricCard icon={Zap} label="Average uptime" value={health.applications.length ? `${health.averageUptime.toFixed(2)}%` : '—'} caption={health.applications.length ? `${health.averageLatency} ms average response` : 'No monitored applications'} tone={health.averageUptime < 99 ? 'warning' : 'good'} />
      <MetricCard icon={Server} label="Infrastructure" value={`${health.servers.length - health.constrainedServers.length}/${health.servers.length}`} caption={`${health.constrainedServers.length} node capacity alerts`} tone={health.constrainedServers.length ? 'warning' : 'good'} />
      <MetricCard icon={Ticket} label="Support queue" value={health.activeTickets.length} caption={`${health.criticalTickets.length} critical · ${health.overdueTickets.length} overdue`} tone={health.criticalTickets.length ? 'critical' : health.overdueTickets.length ? 'warning' : 'neutral'} />
    </div>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="text-sm font-bold text-slate-800">Application status</h3><p className="mt-1 text-xs text-slate-500">{health.latestApplicationCheck ? `Most recent monitoring record: ${formatDate(health.latestApplicationCheck)}` : 'No application monitoring time recorded yet.'}</p></div><button onClick={() => onNavigate('applications')} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-600">Open applications <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="mt-4 divide-y divide-slate-100">{health.applications.slice(0, 6).map(app => <div key={app.id} className="grid grid-cols-1 gap-2 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"><div className="min-w-0"><p className="truncate font-semibold text-slate-700">{app.name}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{app.owner} · {app.host_type}</p></div><StatusPill label={app.status} tone={applicationTone(app)} /><span className="font-mono text-slate-600">{app.uptime_pct.toFixed(2)}%</span><span className={app.latency_ms > 150 ? 'font-mono font-bold text-amber-600' : 'font-mono text-slate-600'}>{app.latency_ms} ms</span></div>)}{!health.applications.length && <EmptyPanel label="No applications are registered for monitoring." />}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-800">Management attention</h3><p className="mt-1 text-xs text-slate-500">Operational issues requiring follow-up.</p></div><AlertTriangle className="h-4 w-4 text-amber-500" /></div><div className="mt-4 space-y-3">{health.attention.slice(0, 4).map(item => <button key={item.id} onClick={() => onNavigate(item.tab)} className="block w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/30"><div className="flex items-start justify-between gap-2"><p className="line-clamp-1 text-xs font-bold text-slate-700">{item.title}</p><StatusPill label={item.tone === 'critical' ? 'Critical' : 'Review'} tone={item.tone} /></div><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{item.detail}</p></button>)}{!health.attention.length && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700"><CheckCircle2 className="mr-1 inline h-4 w-4" />No operational exceptions are currently recorded.</div>}</div></section>
    </div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-800">Infrastructure capacity</h3><p className="mt-1 text-xs text-slate-500">CPU, memory and disk utilisation by monitored node.</p></div><button onClick={() => onNavigate('servers')} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-600">Nodes <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="mt-4 space-y-4">{health.servers.slice(0, 3).map(server => <div key={server.id} className="rounded-xl border border-slate-100 p-3"><div className="mb-3 flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-700">{server.node_name}</p><p className="mt-0.5 text-[10px] text-slate-400">{server.role_type} · {server.last_ping}</p></div><StatusPill label={server.status} tone={serverTone(server)} /></div><div className="grid grid-cols-3 gap-3"><ResourceBar label="CPU" value={server.cpu_usage_pct} icon={Cpu} /><ResourceBar label="Memory" value={server.memory_usage_pct} icon={Zap} /><ResourceBar label="Disk" value={server.disk_usage_pct} icon={HardDrive} /></div></div>)}{!health.servers.length && <EmptyPanel label="No infrastructure nodes are registered." />}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-800">Support &amp; security posture</h3><p className="mt-1 text-xs text-slate-500">Unresolved support workload and control exceptions.</p></div><div className="flex gap-3"><button onClick={() => onNavigate('tickets')} className="text-xs font-bold text-cyan-700 hover:text-cyan-600">Support</button><button onClick={() => onNavigate('security')} className="text-xs font-bold text-cyan-700 hover:text-cyan-600">Security</button></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><Ticket className="h-3.5 w-3.5 text-amber-600" />Support tickets</p><p className="mt-2 font-mono text-xl font-bold text-slate-800">{health.activeTickets.length}</p><p className="mt-1 text-[10px] text-slate-500">{health.overdueTickets.length} overdue · {health.criticalTickets.length} critical</p></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />Security controls</p><p className="mt-2 font-mono text-xl font-bold text-slate-800">{health.securityChecks.filter(check => securityTone(check) === 'good').length}/{health.securityChecks.length}</p><p className="mt-1 text-[10px] text-slate-500">{health.failedChecks.length} need review</p></div></div><div className="mt-3 space-y-2">{health.failedChecks.slice(0, 2).map(check => <button key={check.id} onClick={() => onNavigate('security')} className="flex w-full items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-left"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><span className="block text-xs font-semibold text-amber-800">{check.check_name}</span><span className="mt-0.5 line-clamp-1 block text-[11px] text-amber-700">{check.details}</span></span></button>)}{!health.failedChecks.length && <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700"><ShieldCheck className="mr-1 inline h-4 w-4" />All recorded security checks are passing.</p>}</div></section>
    </div>

    <p className="flex items-center gap-1.5 text-[10px] text-slate-400"><Clock3 className="h-3.5 w-3.5" />Health reflects the latest saved monitoring records; connect telemetry sources to automate refreshes.</p>
  </div>;
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">{label}</div>;
}
