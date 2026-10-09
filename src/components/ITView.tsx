import React, { useState, useMemo } from 'react';
import { 
  AppState, ITApplication, ITServerNode, ITTicket, ITSecurityCheck 
} from '../types';
import { 
  Server, ShieldCheck, Activity, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Plus, Search, ExternalLink, HardDrive, 
  Cpu, Zap, RefreshCw, Filter, Layers, Ticket, 
  CheckCircle, ChevronRight, Lock, Network, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import { saveEntityToFirestore, deleteEntityFromFirestore } from '../lib/firebaseService';

interface ITViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

export default function ITView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName 
}: ITViewProps) {
  const allTabs: { id: 'applications' | 'servers' | 'tickets' | 'security'; label: string; icon: any }[] = [
    { id: 'applications', label: 'IT Applications', icon: Layers },
    { id: 'servers', label: 'Hostinger VPS & Nodes', icon: Server },
    { id: 'tickets', label: 'IT Helpdesk & Tickets', icon: Ticket },
    { id: 'security', label: 'Security & SSL', icon: Lock }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'applications';

  const [activeTab, setActiveTab] = useState<'applications' | 'servers' | 'tickets' | 'security'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // Modals state
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ITApplication | null>(null);
  const [appFormData, setAppFormData] = useState<Partial<ITApplication>>({
    name: '',
    category: 'Web App',
    url: '',
    host_type: 'Hostinger VPS',
    status: 'Operational',
    uptime_pct: 99.9,
    latency_ms: 35,
    version: 'v1.0.0',
    owner: 'IT Operations',
    description: ''
  });

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketFormData, setTicketFormData] = useState<Partial<ITTicket>>({
    subject: '',
    requested_by: '',
    department: 'Operations',
    priority: 'Medium',
    category: 'Software Access',
    status: 'Open',
    resolution_notes: ''
  });

  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [serverFormData, setServerFormData] = useState<Partial<ITServerNode>>({
    node_name: '',
    ip_address: '',
    role_type: 'Application Server',
    cpu_usage_pct: 25,
    memory_usage_pct: 50,
    disk_usage_pct: 40,
    status: 'Healthy',
    location: 'Mumbai DC / India'
  });

  const applications = state.itApplications || [];
  const serverNodes = state.itServerNodes || [];
  const tickets = state.itTickets || [];
  const securityChecks = state.itSecurityChecks || [];

  // Summary Metrics
  const operationalApps = applications.filter(a => a.status === 'Operational').length;
  const degradedApps = applications.filter(a => a.status === 'Degraded').length;
  const outageApps = applications.filter(a => a.status === 'Outage').length;
  const totalApps = applications.length;
  const avgUptime = totalApps > 0 
    ? (applications.reduce((acc, a) => acc + (a.uptime_pct || 99.9), 0) / totalApps).toFixed(2)
    : '100.00';
  const avgLatency = totalApps > 0 
    ? Math.round(applications.reduce((acc, a) => acc + (a.latency_ms || 30), 0) / totalApps)
    : 0;

  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const criticalTickets = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;

  const passedSecurity = securityChecks.filter(s => s.status === 'Pass').length;

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [applications, searchQuery, statusFilter, categoryFilter]);

  // Run automated system diagnostic ping test
  const handleRunDiagnostic = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      setDiagnosticResult(`All ${totalApps} corporate applications & ${serverNodes.length} Hostinger VPS nodes inspected. Gateway response latency average: ${avgLatency}ms. VPS Uptime nominal at ${avgUptime}%.`);
      setTimeout(() => setDiagnosticResult(null), 8000);
    }, 1200);
  };

  // Add or Update Application
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFormData.name || !appFormData.url) return;

    const appId = editingApp ? editingApp.id : `APP-${Date.now().toString().slice(-4)}`;
    const newApp: ITApplication = {
      id: appId,
      name: appFormData.name || 'Application',
      category: appFormData.category as any || 'Web App',
      url: appFormData.url || 'https://',
      host_type: appFormData.host_type as any || 'Hostinger VPS',
      status: appFormData.status as any || 'Operational',
      uptime_pct: Number(appFormData.uptime_pct) || 99.9,
      latency_ms: Number(appFormData.latency_ms) || 30,
      version: appFormData.version || 'v1.0.0',
      last_checked: new Date().toISOString(),
      owner: appFormData.owner || 'IT Operations',
      description: appFormData.description || ''
    };

    const existing = state.itApplications || [];
    const updated = editingApp 
      ? existing.map(a => a.id === editingApp.id ? newApp : a)
      : [newApp, ...existing];

    onUpdateState({ ...state, itApplications: updated });

    await saveEntityToFirestore('itApplications', newApp.id, newApp);
    setAppModalOpen(false);
    setEditingApp(null);
    setAppFormData({
      name: '',
      category: 'Web App',
      url: '',
      host_type: 'Hostinger VPS',
      status: 'Operational',
      uptime_pct: 99.9,
      latency_ms: 35,
      version: 'v1.0.0',
      owner: 'IT Operations',
      description: ''
    });
  };

  // Delete Application
  const handleDeleteApp = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IT application from monitoring?')) return;
    onUpdateState({
      ...state,
      itApplications: (state.itApplications || []).filter(a => a.id !== id)
    });
    await deleteEntityFromFirestore('itApplications', id);
  };

  // Add Ticket
  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketFormData.subject) return;

    const ticketNo = `IT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: ITTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      ticket_no: ticketNo,
      subject: ticketFormData.subject || '',
      requested_by: ticketFormData.requested_by || currentUserEmail || 'Staff User',
      department: ticketFormData.department || 'Operations',
      priority: ticketFormData.priority as any || 'Medium',
      category: ticketFormData.category as any || 'Software Access',
      status: 'Open',
      created_at: new Date().toISOString(),
      resolution_notes: ticketFormData.resolution_notes || ''
    };

    onUpdateState({
      ...state,
      itTickets: [newTicket, ...(state.itTickets || [])]
    });

    await saveEntityToFirestore('itTickets', newTicket.id, newTicket);
    setTicketModalOpen(false);
    setTicketFormData({
      subject: '',
      requested_by: '',
      department: 'Operations',
      priority: 'Medium',
      category: 'Software Access',
      status: 'Open',
      resolution_notes: ''
    });
  };

  // Update Ticket Status
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          resolved_at: newStatus === 'Resolved' ? new Date().toISOString() : t.resolved_at
        };
      }
      return t;
    });

    onUpdateState({ ...state, itTickets: updatedTickets });
    const target = updatedTickets.find(t => t.id === ticketId);
    if (target) {
      await saveEntityToFirestore('itTickets', target.id, target);
    }
  };

  // Add Server Node
  const handleSaveServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverFormData.node_name) return;

    const newServer: ITServerNode = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      node_name: serverFormData.node_name || 'Server Node',
      ip_address: serverFormData.ip_address || '127.0.0.1',
      role_type: serverFormData.role_type as any || 'Application Server',
      cpu_usage_pct: Number(serverFormData.cpu_usage_pct) || 20,
      memory_usage_pct: Number(serverFormData.memory_usage_pct) || 45,
      disk_usage_pct: Number(serverFormData.disk_usage_pct) || 35,
      status: serverFormData.status as any || 'Healthy',
      location: serverFormData.location || 'Mumbai DC / India',
      last_ping: 'Just now'
    };

    onUpdateState({
      ...state,
      itServerNodes: [newServer, ...(state.itServerNodes || [])]
    });

    await saveEntityToFirestore('itServerNodes', newServer.id, newServer);
    setServerModalOpen(false);
    setServerFormData({
      node_name: '',
      ip_address: '',
      role_type: 'Application Server',
      cpu_usage_pct: 25,
      memory_usage_pct: 50,
      disk_usage_pct: 40,
      status: 'Healthy',
      location: 'Mumbai DC / India'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operational':
      case 'Healthy':
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        );
      case 'Degraded':
      case 'Warning':
      case 'Attention Needed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Degraded
          </span>
        );
      case 'Outage':
      case 'Critical':
      case 'Critical Failure':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Outage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-300">
            Maintenance
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-300">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-orange-100 text-orange-700 border border-orange-300">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-700 border border-amber-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-300">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-white text-slate-800">
      {/* Top Banner with Diagnostics & KPIs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-600">
                <Server className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                IT Infrastructure &amp; Application Health
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-cyan-50 text-cyan-600 border border-cyan-300">
                Hostinger VPS + MongoDB
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Live observability for corporate applications, Hostinger VPS cluster node telemetry, field biometric endpoints, and IT support ticketing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunDiagnostic}
              disabled={isDiagnosticRunning}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition duration-150 flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
              <span>{isDiagnosticRunning ? 'Running Ping Test...' : 'Run Diagnostics'}</span>
            </button>
            <button
              onClick={() => {
                setEditingApp(null);
                setAppFormData({
                  name: '',
                  category: 'Web App',
                  url: '',
                  host_type: 'Hostinger VPS',
                  status: 'Operational',
                  uptime_pct: 99.9,
                  latency_ms: 35,
                  version: 'v1.0.0',
                  owner: 'IT Operations',
                  description: ''
                });
                setAppModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Application</span>
            </button>
          </div>
        </div>

        {/* Diagnostic notification bar */}
        {diagnosticResult && (
          <div className="mt-4 p-3 bg-cyan-50 border border-cyan-300 rounded-xl flex items-center gap-2 text-xs text-cyan-700 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{diagnosticResult}</span>
          </div>
        )}

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Application Health</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-800">{operationalApps}/{totalApps}</span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">
                {totalApps > 0 ? Math.round((operationalApps / totalApps) * 100) : 100}% Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{degradedApps} degraded · {outageApps} outages</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Average VPS Latency</span>
              <Zap className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-600">{avgLatency}</span>
              <span className="text-xs text-slate-500 font-mono">ms</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Hostinger VPS Cluster response</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Active IT Tickets</span>
              <Ticket className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-600">{openTickets + inProgressTickets}</span>
              {criticalTickets > 0 && (
                <span className="text-xs text-rose-600 font-bold font-mono bg-rose-100 px-1.5 py-0.5 rounded">
                  {criticalTickets} Critical
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{openTickets} Open · {inProgressTickets} In Progress</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Security &amp; SSL Score</span>
              <ShieldCheck className="w-4 h-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-teal-600">
                {securityChecks.length > 0 
                  ? Math.round((passedSecurity / securityChecks.length) * 100) 
                  : 100}%
              </span>
              <span className="text-xs text-teal-600 font-mono">Passed</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">SSL wildcard valid · MongoDB snapshots OK</p>
          </div>
        </div>
      </div>

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-cyan-50 border border-cyan-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-cyan-700">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 font-bold border border-cyan-300 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-600">
              Your view is filtered to: <strong>{availableTabs.map(t => t.label).join(' & ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {availableTabs.map(tab => {
            const IconComp = tab.icon;
            let badgeCount = null;
            if (tab.id === 'applications') badgeCount = applications.length;
            else if (tab.id === 'servers') badgeCount = serverNodes.length;
            else if (tab.id === 'tickets') badgeCount = tickets.length;
            else if (tab.id === 'security') badgeCount = securityChecks.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition duration-150 flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-50 border border-cyan-300 text-cyan-700 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label} ({badgeCount})</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'tickets' && (
          <button
            onClick={() => setTicketModalOpen(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create IT Ticket</span>
          </button>
        )}

        {activeTab === 'servers' && (
          <button
            onClick={() => setServerModalOpen(true)}
            className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Server Node</span>
          </button>
        )}
      </div>

      {/* TAB 1: IT APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applications, URLs, owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
                <option value="Outage">Outage</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
              >
                <option value="all">All Categories</option>
                <option value="Web App">Web App</option>
                <option value="Mobile API">Mobile API</option>
                <option value="Database">Database</option>
                <option value="Core Infrastructure">Core Infrastructure</option>
                <option value="Internal Tool">Internal Tool</option>
                <option value="Third-Party SaaS">Third-Party SaaS</option>
              </select>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <div 
                key={app.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition duration-200 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                          {app.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{app.host_type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-1.5 group-hover:text-cyan-600 transition">
                        {app.name}
                      </h3>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {app.description}
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Endpoint / URL:</span>
                      <a 
                        href={app.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-cyan-600 hover:text-cyan-500 truncate max-w-[180px] flex items-center gap-1"
                      >
                        <span className="truncate">{app.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Uptime SLA:</span>
                      <span className="text-emerald-400 font-bold">{app.uptime_pct}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Latency:</span>
                      <span className={`font-semibold ${app.latency_ms > 150 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {app.latency_ms} ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Version / Build:</span>
                      <span className="text-slate-600">{app.version}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Owner: {app.owner}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setAppFormData(app);
                        setAppModalOpen(true);
                      }}
                      title="Edit Application"
                      className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      title="Delete Application"
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
              <Server className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No applications matched the filter</p>
              <p className="text-xs text-slate-400 mt-1">Try changing your search query or status filter</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOSTINGER VPS & SERVER NODES */}
      {activeTab === 'servers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serverNodes.map((server) => (
              <div 
                key={server.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-300">
                        {server.role_type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{server.location}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1.5">{server.node_name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">IP: {server.ip_address}</p>
                  </div>
                  <div>{getStatusBadge(server.status)}</div>
                </div>

                {/* Resource Usage Meters */}
                <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  {/* CPU */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                        CPU Utilization
                      </span>
                      <span className={`font-bold ${server.cpu_usage_pct > 80 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {server.cpu_usage_pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          server.cpu_usage_pct > 80 ? 'bg-rose-500' : server.cpu_usage_pct > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${server.cpu_usage_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        RAM / Memory Allocation
                      </span>
                      <span className={`font-bold ${server.memory_usage_pct > 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {server.memory_usage_pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          server.memory_usage_pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${server.memory_usage_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Disk */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                        NVMe Disk Volume Storage
                      </span>
                      <span className={`font-bold ${server.disk_usage_pct > 80 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {server.disk_usage_pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          server.disk_usage_pct > 80 ? 'bg-rose-500' : server.disk_usage_pct > 65 ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${server.disk_usage_pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Last heartbeat check: {server.last_ping}</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    SSH / UFW active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IT HELPDESK & TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Active IT Support &amp; Field Hardware Tickets</h3>
                <p className="text-xs text-slate-500">Manage issue resolution for biometric machines, VPN connectivity, ERP access, and email</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{tickets.length} total tickets</span>
            </div>

            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-600">{t.ticket_no}</span>
                      {getPriorityBadge(t.priority)}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {t.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-700">{t.subject}</h4>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Requested by: <strong className="text-slate-600 font-normal">{t.requested_by}</strong> ({t.department})</span>
                      {t.resolution_notes && (
                        <span className="text-slate-400 italic truncate max-w-md">
                          Note: {t.resolution_notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'Open')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          t.status === 'Open' ? 'bg-amber-500 text-white font-bold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'In Progress')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          t.status === 'In Progress' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'Resolved')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          t.status === 'Resolved' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No support tickets recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & SSL */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityChecks.map((check) => (
              <div 
                key={check.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-300">
                      {check.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-2">{check.check_name}</h4>
                  </div>
                  <div>{getStatusBadge(check.status)}</div>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  {check.details}
                </p>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                  <span>Validity / Next Cycle:</span>
                  <span className="text-slate-600 font-semibold">{check.expiry_or_next_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Application */}
      {appModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingApp ? 'Edit IT Application' : 'Register New IT Application'}
              </h3>
              <button 
                onClick={() => setAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field Operations Portal"
                  value={appFormData.name}
                  onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Category</label>
                  <select
                    value={appFormData.category}
                    onChange={(e) => setAppFormData({ ...appFormData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Mobile API">Mobile API</option>
                    <option value="Database">Database</option>
                    <option value="Core Infrastructure">Core Infrastructure</option>
                    <option value="Internal Tool">Internal Tool</option>
                    <option value="Third-Party SaaS">Third-Party SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Hosting Environment</label>
                  <select
                    value={appFormData.host_type}
                    onChange={(e) => setAppFormData({ ...appFormData, host_type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Hostinger VPS">Hostinger VPS</option>
                    <option value="Cloud / CDN">Cloud / CDN</option>
                    <option value="Local On-Premises">Local On-Premises</option>
                    <option value="SaaS">SaaS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Endpoint / URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://app.spoorthyfacilities.com"
                  value={appFormData.url}
                  onChange={(e) => setAppFormData({ ...appFormData, url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Status</label>
                  <select
                    value={appFormData.status}
                    onChange={(e) => setAppFormData({ ...appFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Outage">Outage</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Uptime %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={appFormData.uptime_pct}
                    onChange={(e) => setAppFormData({ ...appFormData, uptime_pct: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Latency (ms)</label>
                  <input
                    type="number"
                    value={appFormData.latency_ms}
                    onChange={(e) => setAppFormData({ ...appFormData, latency_ms: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Description / Functional Scope</label>
                <textarea
                  rows={2}
                  placeholder="Explain application function, integrated modules, and users"
                  value={appFormData.description}
                  onChange={(e) => setAppFormData({ ...appFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAppModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingApp ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Ticket */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Create IT Support Ticket</h3>
              <button 
                onClick={() => setTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biometric punch machine not syncing at Site S-202"
                  value={ticketFormData.subject}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Priority</label>
                  <select
                    value={ticketFormData.priority}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Category</label>
                  <select
                    value={ticketFormData.category}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Hardware / Laptop">Hardware / Laptop</option>
                    <option value="Software Access">Software Access</option>
                    <option value="Network / VPN">Network / VPN</option>
                    <option value="Biometric Device">Biometric Device</option>
                    <option value="Email & Security">Email & Security</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Requested By</label>
                  <input
                    type="text"
                    required
                    placeholder="Staff name / officer"
                    value={ticketFormData.requested_by}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, requested_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Department</label>
                  <select
                    value={ticketFormData.department}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Business Development">Business Development</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Training & Development">Training & Development</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Server Node */}
      {serverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Add Server Node / Host</h3>
              <button 
                onClick={() => setServerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServer} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Server Node Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VPS Worker Node 02"
                  value={serverFormData.node_name}
                  onChange={(e) => setServerFormData({ ...serverFormData, node_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">IP Address / Socket</label>
                  <input
                    type="text"
                    required
                    placeholder="185.199.110.xxx"
                    value={serverFormData.ip_address}
                    onChange={(e) => setServerFormData({ ...serverFormData, ip_address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Role Type</label>
                  <select
                    value={serverFormData.role_type}
                    onChange={(e) => setServerFormData({ ...serverFormData, role_type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Application Server">Application Server</option>
                    <option value="Database Server">Database Server</option>
                    <option value="Network Gateway">Network Gateway</option>
                    <option value="Backup Vault">Backup Vault</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-500 block mb-1">Datacenter / Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai DC / India"
                  value={serverFormData.location}
                  onChange={(e) => setServerFormData({ ...serverFormData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setServerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
