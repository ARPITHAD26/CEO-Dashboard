import React from 'react';
import { AppState } from '../../types';
import { 
  MapPin, Compass
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const CRMTeamMonitor: React.FC<Props> = ({ state }) => {
  const team = state.crmTeamStatuses || state.crmTeamStatus || [];
  const followUps = state.crmFollowUps || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Marketing Team Live Status &amp; Performance Monitor</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold border border-sky-200">
              {team.length} Active Executives
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time field movement tracking, daily KPI realization rates, and live operational status for Senior Leadership.
          </p>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {team.map(member => {
          const memberName = member.name || '';
          const pendingFollowUps = followUps.filter(f => (f.assigned_executive || '').includes(memberName) && f.status === 'Pending').length;
          const initials = memberName.split(' ').map((n: string) => n[0]).filter(Boolean).join('');
          const targetAchieved = member.target_achieved || 0;
          const monthlyTarget = member.monthly_target || 1;

          return (
            <div key={member.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 rounded-3xl space-y-4 transition shadow-sm">
              
              <div className="flex items-start justify-between gap-3 border-b border-sky-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center font-black font-mono text-sky-700 text-base">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{memberName || 'Unknown'}</h4>
                    <span className="text-xs text-sky-700 font-semibold">{member.designation || ''}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1.5 border ${
                    member.status === 'In Client Visit' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                    member.status === 'In Meeting' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    member.status === 'Available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {member.status || 'Unknown'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">
                    Last active {member.last_active || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Current Context */}
              <div className="p-3 bg-sky-50/70 rounded-2xl space-y-1.5 text-xs border border-sky-100">
                <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span><strong>Location:</strong> {member.current_location || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span><strong>Current Activity:</strong> {member.current_activity || 'N/A'}</span>
                </div>
              </div>

              {/* Monthly KPI realization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">Monthly Revenue Target:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{(targetAchieved / 100000).toFixed(1)}L / ₹{(monthlyTarget / 100000).toFixed(1)}L ({((targetAchieved / monthlyTarget) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (targetAchieved / monthlyTarget) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-sky-100">
                <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-mono text-slate-500 block">Today Visits</span>
                  <span className="font-mono font-bold text-sky-700 text-sm">{member.today_visits ?? 0}</span>
                </div>
                <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-mono text-slate-500 block">Today Calls</span>
                  <span className="font-mono font-bold text-sky-700 text-sm">{member.today_calls ?? 0}</span>
                </div>
                <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-mono text-slate-500 block">Pending Actions</span>
                  <span className="font-mono font-bold text-amber-600 text-sm">{pendingFollowUps}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
