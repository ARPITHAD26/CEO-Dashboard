import React, { useState } from 'react';
import { CRMDailyActivityReport, AppState } from '../../types';
import { 
  Plus, Calendar, CheckCircle2, 
  X, ShieldCheck
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddDAR: (dar: CRMDailyActivityReport) => void;
  onUpdateDAR: (dar: CRMDailyActivityReport) => void;
}

export const CRMDailyActivityReportView: React.FC<Props> = ({
  state,
  onAddDAR,
  onUpdateDAR
}) => {
  const dars = state.crmDars || state.crmDARs || [];
  const [selectedExecutive, setSelectedExecutive] = useState('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [newDAR, setNewDAR] = useState<Partial<CRMDailyActivityReport>>({
    executive_name: 'Vikram Singh',
    report_date: new Date().toISOString().split('T')[0],
    calls_made: 12,
    visits_done: 2,
    meetings_done: 1,
    proposals_sent: 1,
    new_leads_added: 2,
    key_achievements: '',
    major_challenges: '',
    tomorrow_plan: '',
    status: 'Submitted'
  });

  const filteredDars = dars.filter(d => {
    const matchesExec = selectedExecutive === 'All' || (d.executive_name || '').includes(selectedExecutive);
    return matchesExec;
  });

  const handleSaveDAR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDAR.executive_name || !newDAR.tomorrow_plan) {
      alert('Please fill executive name and tomorrow plan.');
      return;
    }

    const created: CRMDailyActivityReport = {
      id: `DAR-${Date.now()}`,
      executive_name: newDAR.executive_name || 'Vikram Singh',
      report_date: newDAR.report_date || new Date().toISOString().split('T')[0],
      calls_made: Number(newDAR.calls_made) || 0,
      visits_done: Number(newDAR.visits_done) || 0,
      meetings_done: Number(newDAR.meetings_done) || 0,
      proposals_sent: Number(newDAR.proposals_sent) || 0,
      new_leads_added: Number(newDAR.new_leads_added) || 0,
      activities: [],
      key_achievements: newDAR.key_achievements || '',
      major_challenges: newDAR.major_challenges || '',
      tomorrow_plan: newDAR.tomorrow_plan || '',
      status: 'Submitted',
      submitted_at: new Date().toISOString()
    };

    onAddDAR(created);
    setIsSubmitModalOpen(false);
  };

  const handleApproveDAR = (dar: CRMDailyActivityReport) => {
    onUpdateDAR({
      ...dar,
      status: 'Approved',
      approved_by: 'President / Sr Manager',
      remarks: 'Reviewed and approved. Follow up on pipeline tomorrow.'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Daily Activity Reports (DAR) &amp; Productivity Logs</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold border border-sky-200">
              {dars.length} Filed Reports
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-of-day accountability logs tracking calls, field visits, meetings, proposals sent, and tomorrow's commitment.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Today's DAR</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-sky-200 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Filter By Executive:</span>
          <select
            value={selectedExecutive}
            onChange={e => setSelectedExecutive(e.target.value)}
            className="px-2.5 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="All">All Marketing Executives</option>
            <option value="Vikram">Vikram Singh</option>
            <option value="Arun">Arun Kulkarni</option>
            <option value="Deepika">Deepika Nair</option>
            <option value="Priya">Priya Patel</option>
          </select>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing <strong>{filteredDars.length}</strong> submitted DAR records
        </div>
      </div>

      {/* DAR Cards Grid */}
      <div className="space-y-4">
        {filteredDars.map(dar => (
          <div key={dar.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 rounded-3xl space-y-4 transition shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center font-bold font-mono text-sky-700 text-sm">
                  {dar.executive_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{dar.executive_name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    Report Date: <strong className="text-slate-800">{dar.report_date}</strong>
                    • Filed at {dar.submitted_at ? new Date(dar.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'EOD'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  dar.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  'bg-sky-100 text-sky-800 border-sky-300'
                }`}>
                  {dar.status}
                </span>

                {dar.status !== 'Approved' && (
                  <button
                    onClick={() => handleApproveDAR(dar)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve DAR</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Calls Made</span>
                <div className="text-base font-mono font-bold text-sky-700 mt-0.5">{dar.calls_made}</div>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Field Visits</span>
                <div className="text-base font-mono font-bold text-sky-700 mt-0.5">{dar.visits_done}</div>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Meetings Done</span>
                <div className="text-base font-mono font-bold text-blue-700 mt-0.5">{dar.meetings_done}</div>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Proposals Sent</span>
                <div className="text-base font-mono font-bold text-amber-700 mt-0.5">{dar.proposals_sent}</div>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">New Leads</span>
                <div className="text-base font-mono font-bold text-emerald-700 mt-0.5">+{dar.new_leads_added}</div>
              </div>
            </div>

            {/* Qualitative Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">Key Achievements</span>
                <p className="text-slate-800">{dar.key_achievements || 'Routine pipeline progression completed.'}</p>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-800 font-bold block">Major Challenges &amp; Escalations</span>
                <p className="text-slate-800">{dar.major_challenges || 'No blockers encountered today.'}</p>
              </div>

              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-sky-800 font-bold block">Tomorrow's Planned Targets</span>
                <p className="text-slate-800">{dar.tomorrow_plan}</p>
              </div>
            </div>

            {dar.approved_by && (
              <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reviewed &amp; Approved by {dar.approved_by} • "{dar.remarks}"</span>
              </div>
            )}

          </div>
        ))}

        {filteredDars.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white border border-sky-200 rounded-3xl">
            No Daily Activity Reports found.
          </div>
        )}
      </div>

      {/* SUBMIT DAR MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 border-b border-sky-400/30 flex items-center justify-between text-white">
              <h3 className="text-base font-black">Submit Daily Activity Report (DAR)</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDAR} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Marketing Executive Name *</label>
                  <input
                    type="text"
                    required
                    value={newDAR.executive_name}
                    onChange={e => setNewDAR({ ...newDAR, executive_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Report Date</label>
                  <input
                    type="date"
                    value={newDAR.report_date}
                    onChange={e => setNewDAR({ ...newDAR, report_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Calls Made Today</label>
                  <input
                    type="number"
                    value={newDAR.calls_made}
                    onChange={e => setNewDAR({ ...newDAR, calls_made: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Field Visits Done</label>
                  <input
                    type="number"
                    value={newDAR.visits_done}
                    onChange={e => setNewDAR({ ...newDAR, visits_done: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Meetings Conducted</label>
                  <input
                    type="number"
                    value={newDAR.meetings_done}
                    onChange={e => setNewDAR({ ...newDAR, meetings_done: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Proposals Submitted</label>
                  <input
                    type="number"
                    value={newDAR.proposals_sent}
                    onChange={e => setNewDAR({ ...newDAR, proposals_sent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Key Achievements &amp; Breakthroughs</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Cleared technical scrutiny with Brigade Facilities team..."
                    value={newDAR.key_achievements}
                    onChange={e => setNewDAR({ ...newDAR, key_achievements: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Major Challenges / Escalations</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need revised GST statutory calculation from finance team..."
                    value={newDAR.major_challenges}
                    onChange={e => setNewDAR({ ...newDAR, major_challenges: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-sky-800 block mb-1 font-bold">Tomorrow's Planned Targets *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 15 phone follow-ups, site visit to Wipro SEZ, submit rate quote to Prestige..."
                    value={newDAR.tomorrow_plan}
                    onChange={e => setNewDAR({ ...newDAR, tomorrow_plan: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-200">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition">
                  Submit DAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
