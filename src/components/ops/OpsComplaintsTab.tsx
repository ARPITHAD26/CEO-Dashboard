import React, { useState } from 'react';
import { AppState, OpsClientComplaintRecord } from '../../types';
import { AlertCircle, CheckCircle, Clock, PlusCircle, AlertTriangle, UserCheck, Search, Filter } from 'lucide-react';

interface OpsComplaintsTabProps {
  state: AppState;
  onOpenSubmit: () => void;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
}

export function OpsComplaintsTab({ state, onOpenSubmit, onUpdateState, currentUserEmail }: OpsComplaintsTabProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<OpsClientComplaintRecord | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const complaints = state.opsClientComplaints || [];

  const totalReceived = complaints.length;
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;
  const overdueCount = complaints.filter(c => c.is_overdue || c.status === 'Overdue').length;
  const closurePct = totalReceived > 0 ? Math.round((closedCount / totalReceived) * 100) : 100;

  const handleResolve = (id: string) => {
    const nextList = complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Closed' as const,
          actual_closure_date: new Date().toISOString().split('T')[0],
          closure_evidence_notes: 'Resolution confirmed with site manager and client contact.'
        };
      }
      return c;
    });
    onUpdateState({ ...state, opsClientComplaints: nextList });
  };

  const filtered = complaints.filter(c => {
    const matchSearch = 
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.site_name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.ticket_no.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'ALL' || c.complaint_category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-card to-card border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 4: Client Complaints &amp; OpsVision Ticket Center</h3>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold rounded-full">
              Full Accountability Pipeline
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Drill-down: <strong>Client → Site → Service → Category → Owner → Root Cause → Action Taken → Closure Evidence</strong>.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Client Complaint</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">COMPLAINTS RECEIVED</span>
          <div className="text-xl font-mono font-bold text-foreground mt-1">{totalReceived}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Total Across Client Sites</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">CLOSURE RATIO</span>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{closurePct}%</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">{closedCount} Resolved / Closed</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">ACTIVE OPEN</span>
          <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">{openCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Under Active Resolution</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">OVERDUE TICKETS</span>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{overdueCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Breached Target SLA Date</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-card border border-border rounded-xl flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Ticket, Client, or Issue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground"
          >
            <option value="ALL">All Categories</option>
            <option value="Service Quality">Service Quality</option>
            <option value="Manpower Shortage">Manpower Shortage</option>
            <option value="Grooming / Uniform">Grooming / Uniform</option>
            <option value="Behavior / Conduct">Behavior / Conduct</option>
            <option value="Machine / Material">Machine / Material</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Ticket &amp; Site</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Complaint Details</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Target Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr 
                  key={c.id} 
                  className="hover:bg-muted/30 transition cursor-pointer"
                  onClick={() => setSelectedComplaint(c)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground font-mono">{c.ticket_no}</div>
                    <div className="text-[11px] text-foreground font-medium">{c.site_name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.client_name}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-muted font-bold text-[10px] text-foreground">
                      {c.complaint_category}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.service}</div>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <div className="text-foreground text-[11px] font-medium line-clamp-2">{c.description}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">Plan: {c.action_plan}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-purple-500" />
                      <span>{c.complaint_owner}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{c.source_system}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">
                    <div>{c.target_closure_date}</div>
                    {c.actual_closure_date && (
                      <div className="text-[10px] text-emerald-600 font-bold">Closed: {c.actual_closure_date}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      c.status === 'Open' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    {c.status !== 'Closed' && (
                      <button
                        onClick={() => handleResolve(c.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedComplaint && (
        <div className="p-4 bg-card border border-purple-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>{selectedComplaint.ticket_no}</span>
                <span className="text-xs text-muted-foreground">({selectedComplaint.site_name})</span>
              </h4>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">
                Category: {selectedComplaint.complaint_category} • Assigned Owner: {selectedComplaint.complaint_owner}
              </span>
            </div>
            <button 
              onClick={() => setSelectedComplaint(null)}
              className="px-2.5 py-1 text-xs bg-muted text-foreground rounded-lg hover:bg-muted/80 font-bold"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl space-y-1">
              <div className="font-bold text-foreground">Complaint Description:</div>
              <p className="text-muted-foreground">{selectedComplaint.description}</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-xl space-y-1">
              <div className="font-bold text-foreground">Immediate Action Plan &amp; Resolution:</div>
              <p className="text-muted-foreground">{selectedComplaint.action_plan}</p>
              {selectedComplaint.closure_evidence_notes && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                  Closure Proof: {selectedComplaint.closure_evidence_notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
