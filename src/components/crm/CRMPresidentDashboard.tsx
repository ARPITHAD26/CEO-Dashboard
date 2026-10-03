import React, { useState } from 'react';
import { 
  CRMLead, AppState 
} from '../../types';
import { 
  Building2, Users, Clock, TrendingUp, 
  DollarSign, Award, PlusCircle, Briefcase, FileText,
  ChevronRight, ArrowUpRight, ShieldAlert, Eye
} from 'lucide-react';

interface Props {
  state: AppState;
  onNavigateTab: (tabId: string) => void;
  onOpenNewLead: () => void;
  onOpenNewRequirement: () => void;
  onOpenNewFollowUp: () => void;
  onOpenNewDar: () => void;
  onSelectLead: (lead: CRMLead) => void;
}

export const CRMPresidentDashboard: React.FC<Props> = ({
  state,
  onNavigateTab,
  onOpenNewLead,
  onOpenNewRequirement,
  onOpenNewDar,
  onSelectLead
}) => {
  const [selectedExecutive, setSelectedExecutive] = useState<string>('all');

  const leads = state.crmLeads || [];
  const requirements = state.crmRequirements || [];
  const followUps = state.crmFollowUps || [];
  const dars = state.crmDars || [];
  const clients = state.crmClientMasters || [];

  const todayStr = new Date().toISOString().split('T')[0];

  // Pipeline calculations
  const activeLeads = leads.filter(l => l.status === 'Active');
  const wonLeads = leads.filter(l => l.status === 'Won' || l.stage === 'Won / Converted');
  const totalPipelineValue = activeLeads.reduce((acc, l) => acc + (l.estimated_value || 0), 0);
  const wonContractsValue = wonLeads.reduce((acc, l) => acc + (l.estimated_value || 0), 0);

  // Manpower calculations
  const totalManpowerRequired = requirements.reduce((acc, r) => acc + (r.quantity || 0), 0);
  const activeManpowerDeployed = clients.reduce((acc, c) => acc + (c.total_deployed_manpower || 0), 0);
  const totalMonthlyBilling = clients.reduce((acc, c) => acc + (c.monthly_billing_value || 0), 0);

  // Follow-ups calculations
  const overdueFollowUps = followUps.filter(f => f.status === 'Pending' && f.followup_date < todayStr);
  const todayFollowUps = followUps.filter(f => f.status === 'Pending' && f.followup_date === todayStr);
  const upcomingFollowUps = followUps.filter(f => f.status === 'Pending' && f.followup_date > todayStr);

  // Today's DAR metrics
  const todaysDars = dars.filter(d => d.report_date === todayStr || d.report_date === '2026-09-07');
  const totalCallsToday = todaysDars.reduce((acc, d) => acc + (d.calls_made_count || d.calls_made || 0), 0);
  const totalVisitsToday = todaysDars.reduce((acc, d) => acc + (d.client_visits_count || d.visits_done || 0), 0);
  const totalQuotesToday = todaysDars.reduce((acc, d) => acc + (d.quotations_sent_count || d.proposals_sent || 0), 0);

  // Executives list
  const executives = Array.from(new Set(leads.map(l => l.assigned_to).filter(Boolean)));

  // Filtered leads
  const filteredLeads = selectedExecutive === 'all' 
    ? activeLeads 
    : activeLeads.filter(l => l.assigned_to === selectedExecutive);

  // Stage distribution
  const stageCounts: Record<string, { count: number; value: number }> = {
    'New Lead': { count: 0, value: 0 },
    'Contacted': { count: 0, value: 0 },
    'Requirement Received': { count: 0, value: 0 },
    'Meeting / Visit Scheduled': { count: 0, value: 0 },
    'Proposal Submitted': { count: 0, value: 0 },
    'Quotation Sent': { count: 0, value: 0 },
    'Negotiation': { count: 0, value: 0 },
    'Won / Converted': { count: 0, value: 0 },
    'Client Onboarding': { count: 0, value: 0 }
  };

  leads.forEach(l => {
    if (stageCounts[l.stage]) {
      stageCounts[l.stage].count += 1;
      stageCounts[l.stage].value += l.estimated_value || 0;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Master Cockpit Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 border border-sky-400/30 p-6 rounded-3xl shadow-xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] uppercase font-bold tracking-wider border border-white/30">
                PRESIDENT &amp; CEO COMMAND COCKPIT
              </span>
              <span className="text-sky-100 text-xs font-mono">| Spoorthy Integrated CRM v2.6</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Marketing, Lead &amp; Daily Activity Intelligence</span>
            </h2>
            <p className="text-xs text-sky-100 mt-1 max-w-2xl leading-relaxed">
              Real-time executive oversight of enterprise marketing pipelines, client manpower requirements, statutory compliance, follow-ups, and daily field productivity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenNewLead}
              className="px-4 py-2 bg-white hover:bg-sky-50 text-sky-900 font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-sky-700" />
              <span>Capture New Lead</span>
            </button>
            <button
              onClick={onOpenNewRequirement}
              className="px-4 py-2 bg-sky-800/80 hover:bg-sky-800 text-sky-100 border border-sky-400/30 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-sky-300" />
              <span>Log Requirement</span>
            </button>
            <button
              onClick={onOpenNewDar}
              className="px-4 py-2 bg-sky-800/80 hover:bg-sky-800 text-sky-100 border border-sky-400/30 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              <span>Submit DAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. The 3 Core Management Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-sky-700 block">Principle 1: Ownership</span>
              <h4 className="text-xs font-bold text-slate-900">Every Lead Has An Assigned Owner</h4>
            </div>
          </div>
          <div className="text-[11px] text-slate-700 bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
            <strong>{activeLeads.length} active leads</strong> are currently owned across <strong>{executives.length} Marketing Executives</strong> with 100% assignment rate.
          </div>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-700 block">Principle 2: Next Action</span>
              <h4 className="text-xs font-bold text-slate-900">No Lead Exits Without Next Action</h4>
            </div>
          </div>
          <div className="text-[11px] text-slate-700 bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
            <strong>{todayFollowUps.length} follow-ups due today</strong>, <strong className="text-rose-600">{overdueFollowUps.length} overdue</strong> requiring immediate outreach.
          </div>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 block">Principle 3: Visibility</span>
              <h4 className="text-xs font-bold text-slate-900">Daily Activity Report (DAR) Review</h4>
            </div>
          </div>
          <div className="text-[11px] text-slate-700 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <strong>{todaysDars.length} DAR submissions</strong> logged today covering <strong>{totalCallsToday} calls</strong> and <strong>{totalVisitsToday} site visits</strong>.
          </div>
        </div>
      </div>

      {/* 3. Primary KPI Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-2 shadow-sm hover:border-sky-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">ACTIVE PIPELINE VALUE</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-sky-700">
            ₹{(totalPipelineValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>{activeLeads.length} Opportunities</span>
            <span className="text-emerald-700 font-bold font-mono">₹{(wonContractsValue / 100000).toFixed(1)}L Won</span>
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-2 shadow-sm hover:border-sky-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">MANPOWER IN DEMAND</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900">
            {totalManpowerRequired} <span className="text-xs font-normal text-slate-500">Pax</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>{requirements.length} Open Requisitions</span>
            <span className="text-sky-700 font-bold font-mono">{activeManpowerDeployed} Deployed</span>
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-2 shadow-sm hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">FOLLOW-UPS DUE TODAY</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-black text-amber-700">
            {todayFollowUps.length}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span className="text-rose-600 font-bold">{overdueFollowUps.length} Overdue</span>
            <span className="text-slate-500">{upcomingFollowUps.length} Upcoming</span>
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-2 shadow-sm hover:border-emerald-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">ACTIVE CLIENT BILLING</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-700">
            ₹{(totalMonthlyBilling / 100000).toFixed(2)} L/mo
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>{clients.length} Master Accounts</span>
            <span className="text-emerald-700 font-bold">100% Billing</span>
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-2 shadow-sm hover:border-sky-400 transition col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">TEAM PRODUCTIVITY</span>
            <Award className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900">
            {totalCallsToday + totalVisitsToday} <span className="text-xs font-normal text-slate-500">Engagements</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>{totalCallsToday} Calls • {totalVisitsToday} Visits</span>
            <span className="text-sky-700 font-bold">{totalQuotesToday} Quotes</span>
          </div>
        </div>
      </div>

      {/* 4. Overdue Alerts & Critical Attention Section (if any) */}
      {overdueFollowUps.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>OVERDUE FOLLOW-UP ALERTS ({overdueFollowUps.length}) — Executive Escalation Required</span>
            </div>
            <button
              onClick={() => onNavigateTab('followups')}
              className="text-[11px] text-rose-700 hover:text-rose-900 underline font-mono flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>View All in Follow-up Tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {overdueFollowUps.map(f => (
              <div key={f.id} className="p-3 bg-white border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-xs">
                <div>
                  <span className="text-[10px] font-mono text-rose-700 font-bold uppercase block">
                    Due Date: {f.followup_date} ({f.type})
                  </span>
                  <h5 className="font-bold text-slate-900 mt-0.5">{f.company_name}</h5>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{f.next_action}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">Assigned: {f.assigned_executive}</span>
                </div>
                <button
                  onClick={() => onNavigateTab('followups')}
                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer"
                >
                  Act Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 9-Stage Pipeline Funnel Overview */}
      <div className="bg-white border border-sky-200 p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider block">CONVERSION FUNNEL</span>
            <h3 className="text-sm font-bold text-slate-900">End-to-End Enterprise Opportunity Pipeline</h3>
          </div>
          <button
            onClick={() => onNavigateTab('kanban')}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Kanban Board</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {Object.entries(stageCounts).map(([stage, data], idx) => {
            const isWon = stage === 'Won / Converted';
            return (
              <div 
                key={stage}
                onClick={() => onNavigateTab('leads')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isWon 
                    ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-500' 
                    : 'bg-sky-50/60 border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>0{idx + 1}</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded-full ${isWon ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                      {data.count}
                    </span>
                  </div>
                  <h5 className="text-[11px] font-bold text-slate-800 mt-2 line-clamp-1" title={stage}>
                    {stage}
                  </h5>
                </div>
                <div className="mt-2 pt-2 border-t border-sky-200/80">
                  <span className="text-[10px] font-mono text-sky-700 font-bold block truncate">
                    ₹{(data.value / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Active Leads & Executive Responsibility */}
      <div className="bg-white border border-sky-200 p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider block">LEAD 360° RESPONSIBILITY GRID</span>
            <h3 className="text-sm font-bold text-slate-900">Active Opportunities by Executive Owner</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-medium">Filter Owner:</span>
            <select
              value={selectedExecutive}
              onChange={e => setSelectedExecutive(e.target.value)}
              className="px-2.5 py-1.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All Executives ({activeLeads.length})</option>
              {executives.map(exec => (
                <option key={exec} value={exec}>{exec}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sky-200 text-slate-600 font-bold uppercase text-[10px] bg-sky-50/50">
                <th className="py-2.5 px-3">Lead &amp; Company</th>
                <th className="py-2.5 px-3">Service &amp; Sector</th>
                <th className="py-2.5 px-3">Estimated Value</th>
                <th className="py-2.5 px-3">Stage &amp; Prob</th>
                <th className="py-2.5 px-3">Assigned Executive</th>
                <th className="py-2.5 px-3">Next Action &amp; Due</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-sans">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-sky-50/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{lead.company_name}</span>
                      {lead.priority === 'Critical' && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 border border-rose-300 rounded-full text-[9px] font-bold uppercase">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lead.contact_person} • {lead.mobile}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-semibold">
                      {lead.service_required}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 truncate max-w-[120px]">
                      {lead.industry}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{(lead.estimated_value / 100000).toFixed(2)} L
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium block w-fit">
                      {lead.stage}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-12 bg-sky-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${lead.probability_pct >= 70 ? 'bg-emerald-500' : lead.probability_pct >= 40 ? 'bg-amber-500' : 'bg-slate-400'}`} 
                          style={{ width: `${lead.probability_pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{lead.probability_pct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-sky-100 border border-sky-200 text-[10px] font-bold text-sky-800 flex items-center justify-center font-mono">
                        {lead.assigned_to.split(' ')[0][0]}
                      </div>
                      <span className="text-slate-800 text-xs font-medium truncate max-w-[110px]">
                        {lead.assigned_to}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-[11px] text-slate-800 line-clamp-1 font-medium">{lead.next_action}</p>
                    <span className={`text-[10px] font-mono mt-0.5 block font-bold ${
                      lead.next_followup_date < todayStr ? 'text-rose-600' : lead.next_followup_date === todayStr ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      Due: {lead.next_followup_date}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 rounded-lg text-xs font-bold border border-sky-200 transition cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
