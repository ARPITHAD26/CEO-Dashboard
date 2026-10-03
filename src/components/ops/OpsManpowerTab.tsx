import React, { useState } from 'react';
import { AppState, OpsAttendanceRecord } from '../../types';
import { Users, AlertTriangle, CheckCircle, Search, Filter, PlusCircle, ArrowUpRight, TrendingDown } from 'lucide-react';

interface OpsManpowerTabProps {
  state: AppState;
  onOpenSubmit: () => void;
}

export function OpsManpowerTab({ state, onOpenSubmit }: OpsManpowerTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('ALL');
  const [filterShortage, setFilterShortage] = useState(false);

  const records = state.opsAttendanceRecords || [];

  const filtered = records.filter(r => {
    const matchSearch = 
      r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.service_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchService = filterService === 'ALL' || r.service_type === filterService;
    const matchShortage = !filterShortage || r.net_shortage > 0 || r.status !== 'Normal';
    return matchSearch && matchService && matchShortage;
  });

  const totalReq = records.reduce((s, r) => s + r.required_manpower, 0);
  const totalPres = records.reduce((s, r) => s + r.present_count, 0);
  const totalAbs = records.reduce((s, r) => s + r.absent_count, 0);
  const totalRelAvail = records.reduce((s, r) => s + r.relievers_available, 0);
  const totalRelReq = records.reduce((s, r) => s + r.relievers_required, 0);
  const avgAttnPct = totalReq > 0 ? Math.round((totalPres / totalReq) * 1000) / 10 : 94.2;
  const avgAbsPct = totalReq > 0 ? Math.round((totalAbs / totalReq) * 1000) / 10 : 5.8;

  return (
    <div className="space-y-4">
      {/* Top Banner & Executive Callout */}
      <div className="p-4 bg-gradient-to-r from-rose-500/10 via-card to-card border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Block 1: Manpower &amp; Attendance (CEO View)</h3>
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[10px] font-mono font-bold rounded-full">
              Live Field Muster
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Workforce availability by Client → Site → Service → Date with active reliever shortfall detection.
          </p>
        </div>
        <button
          onClick={onOpenSubmit}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit Site Attendance</span>
        </button>
      </div>

      {/* 4 Summary Micro-KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">SITE ATTENDANCE %</span>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgAttnPct}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{totalPres} / {totalReq} On Duty</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">ABSENTEEISM %</span>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{avgAbsPct}%</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">{totalAbs} Guards Absent</div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">RELIEVER BUFFER</span>
          <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
            {totalRelAvail} <span className="text-xs font-normal text-muted-foreground">/ {totalRelReq} req</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totalRelAvail >= totalRelReq ? 'Buffer Adequate' : 'Shortfall Detected'}
          </div>
        </div>
        <div className="p-3 bg-card border border-border rounded-xl">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">SHORTAGE SITES</span>
          <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
            {records.filter(r => r.net_shortage > 0 || r.status !== 'Normal').length}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Actionable Shortages</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-card border border-border rounded-xl flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Client, Site, or Category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground"
          >
            <option value="ALL">All Services</option>
            <option value="Security Guarding">Security Guarding</option>
            <option value="Housekeeping & Soft FM">Housekeeping & Soft FM</option>
            <option value="Technical / MEP">Technical / MEP</option>
          </select>
          <button
            onClick={() => setFilterShortage(!filterShortage)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterShortage 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Shortages Only</span>
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Client &amp; Site</th>
                <th className="py-2.5 px-3">Service &amp; Category</th>
                <th className="py-2.5 px-3">Shift &amp; Date</th>
                <th className="py-2.5 px-3 text-right">Required</th>
                <th className="py-2.5 px-3 text-right">Present</th>
                <th className="py-2.5 px-3 text-right">Attn %</th>
                <th className="py-2.5 px-3 text-right">Absent</th>
                <th className="py-2.5 px-3 text-center">Relievers</th>
                <th className="py-2.5 px-3">Shortage &amp; Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-foreground">{r.site_name}</div>
                    <div className="text-[10px] text-muted-foreground">{r.client_name}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground">{r.service_type}</div>
                    <div className="text-[10px] text-muted-foreground">{r.category}</div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono">
                    <div>{r.shift} Shift</div>
                    <div className="text-[10px]">{r.date}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{r.required_manpower}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{r.present_count}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      r.attendance_pct >= 95 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      r.attendance_pct >= 90 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {r.attendance_pct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {r.absent_count} ({r.absenteeism_pct}%)
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.relievers_available >= r.relievers_required 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {r.relievers_available} / {r.relievers_required}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {r.net_shortage > 0 ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Shortage: {r.net_shortage} Guards ({r.shortage_reason || 'Absence gap'})
                        </span>
                        {r.action_taken && (
                          <div className="text-[10px] text-muted-foreground">{r.action_taken}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Full Shift Covered
                      </span>
                    )}
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
