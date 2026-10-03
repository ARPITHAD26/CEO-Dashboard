import React, { useState } from 'react';
import { CRMClientVisit, CRMMeeting, AppState } from '../../types';
import { 
  Plus, Search, Calendar, MapPin, Users, Building2, 
  Video, Phone, CheckCircle2, Clock, FileText, ChevronRight, 
  X, Compass, ShieldAlert, Award, ExternalLink
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddVisit: (visit: CRMClientVisit) => void;
  onAddMeeting: (meeting: CRMMeeting) => void;
}

export const CRMVisitsAndMeetings: React.FC<Props> = ({
  state,
  onAddVisit,
  onAddMeeting
}) => {
  const [activeTab, setActiveTab] = useState<'visits' | 'meetings'>('visits');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);

  const visits = state.crmVisits || [];
  const meetings = state.crmMeetings || [];

  const [newVisit, setNewVisit] = useState<Partial<CRMClientVisit>>({
    company_name: '',
    visit_date: new Date().toISOString().split('T')[0],
    contact_person: '',
    designation: '',
    purpose: '',
    requirement_discussed: '',
    current_vendor: '',
    existing_manpower: '',
    potential_manpower: 30,
    client_feedback: '',
    competitor_info: '',
    outcome: 'Positive',
    next_action: '',
    next_followup_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    visited_by: 'Vikram Singh (Marketing Lead)'
  });

  const [newMeeting, setNewMeeting] = useState<Partial<CRMMeeting>>({
    company_name: '',
    meeting_date: new Date().toISOString().split('T')[0],
    meeting_time: '11:00 AM',
    meeting_type: 'Client Office',
    participants: '',
    agenda: '',
    discussion_points: '',
    commercial_discussion: '',
    outcome: 'Positive',
    next_action: '',
    next_meeting_date: '',
    conducted_by: 'Vikram Singh'
  });

  const filteredVisits = visits.filter(v => 
    v.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeetings = meetings.filter(m => 
    m.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.participants.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.company_name || !newVisit.contact_person || !newVisit.next_action) {
      alert('Please fill company name, contact person, and next action.');
      return;
    }

    const created: CRMClientVisit = {
      id: `VST-${Date.now()}`,
      lead_id: newVisit.lead_id || '',
      company_name: newVisit.company_name || '',
      visit_date: newVisit.visit_date || new Date().toISOString().split('T')[0],
      contact_person: newVisit.contact_person || '',
      designation: newVisit.designation || '',
      purpose: newVisit.purpose || '',
      requirement_discussed: newVisit.requirement_discussed || '',
      current_vendor: newVisit.current_vendor || '',
      existing_manpower: newVisit.existing_manpower || '',
      potential_manpower: Number(newVisit.potential_manpower) || 0,
      client_feedback: newVisit.client_feedback || '',
      competitor_info: newVisit.competitor_info || '',
      outcome: newVisit.outcome || 'Positive',
      next_action: newVisit.next_action || '',
      next_followup_date: newVisit.next_followup_date || '',
      visited_by: newVisit.visited_by || 'Vikram Singh'
    };

    onAddVisit(created);
    setIsAddVisitModalOpen(false);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.company_name || !newMeeting.agenda || !newMeeting.next_action) {
      alert('Please fill company name, meeting agenda, and next action.');
      return;
    }

    const created: CRMMeeting = {
      id: `MTG-${Date.now()}`,
      lead_id: newMeeting.lead_id || '',
      company_name: newMeeting.company_name || '',
      meeting_date: newMeeting.meeting_date || new Date().toISOString().split('T')[0],
      meeting_time: newMeeting.meeting_time || '11:00 AM',
      meeting_type: newMeeting.meeting_type || 'Client Office',
      participants: newMeeting.participants || '',
      agenda: newMeeting.agenda || '',
      discussion_points: newMeeting.discussion_points || '',
      requirement_client_expectations: newMeeting.requirement_client_expectations || '',
      commercial_discussion: newMeeting.commercial_discussion || '',
      outcome: newMeeting.outcome || 'Positive',
      next_action: newMeeting.next_action || '',
      next_meeting_date: newMeeting.next_meeting_date || '',
      conducted_by: newMeeting.conducted_by || 'Vikram Singh'
    };

    onAddMeeting(created);
    setIsAddMeetingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Client Visits &amp; Formal Meeting Records</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {visits.length} Visits • {meetings.length} Meetings
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Field intelligence, site survey observations, competitor pricing insights, and executive commercial negotiation minutes.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddVisitModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Log Field Visit</span>
          </button>
          <button
            onClick={() => setIsAddMeetingModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Record Meeting</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-3 font-mono text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'visits' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Client Field Visits ({visits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`pb-3 font-mono text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'meetings' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Corporate Meetings ({meetings.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Company, Contact, Purpose, Agenda..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* VISITS TAB */}
      {activeTab === 'visits' && (
        <div className="space-y-3">
          {filteredVisits.map(v => (
            <div key={v.id} className="p-5 bg-[#0e1320] border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-3 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded font-bold">
                      VISIT DATE: {v.visit_date}
                    </span>
                    <span className="text-slate-400">Visited by: <strong className="text-slate-200">{v.visited_by}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{v.company_name}</h4>
                  <span className="text-[11px] text-slate-400">
                    Contact: {v.contact_person} ({v.designation})
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold w-fit border ${
                  v.outcome === 'Converted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  v.outcome === 'Positive' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {v.outcome}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Purpose &amp; Scope</span>
                  <p className="text-slate-200 font-medium">{v.purpose}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Discussed: {v.requirement_discussed}</p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Vendor &amp; Opportunity</span>
                  <p className="text-slate-300">Existing: <strong className="text-slate-100">{v.current_vendor || 'None'}</strong></p>
                  <div className="text-[11px] text-slate-400">
                    Manpower Potential: <strong className="text-cyan-300 font-mono">{v.potential_manpower} Pax</strong> (Current: {v.existing_manpower})
                  </div>
                  {v.competitor_info && (
                    <p className="text-[10px] text-amber-300 mt-1 font-mono">Comp: {v.competitor_info}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Next Mandatory Action</span>
                  <p className="text-amber-300 font-medium">{v.next_action}</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Due Date: {v.next_followup_date}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredVisits.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#0e1320] border border-slate-800 rounded-2xl">
              No client visit logs found.
            </div>
          )}
        </div>
      )}

      {/* MEETINGS TAB */}
      {activeTab === 'meetings' && (
        <div className="space-y-3">
          {filteredMeetings.map(m => (
            <div key={m.id} className="p-5 bg-[#0e1320] border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded font-bold">
                      {m.meeting_date} ({m.meeting_time}) • {m.meeting_type}
                    </span>
                    <span className="text-slate-400">Conducted by: <strong className="text-slate-200">{m.conducted_by}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{m.company_name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Participants: {m.participants}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold w-fit bg-slate-800 text-slate-200 border border-slate-700">
                  {m.outcome}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-200 text-xs">Agenda: {m.agenda}</h5>
                  <p className="text-slate-300 leading-relaxed">{m.discussion_points}</p>
                </div>

                {m.commercial_discussion && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                    <strong>Commercial Terms Discussed:</strong> {m.commercial_discussion}
                  </div>
                )}

                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Next Action:</span>
                    <p className="text-slate-200 font-medium">{m.next_action}</p>
                  </div>
                  {m.next_meeting_date && (
                    <span className="text-[10px] font-mono text-slate-400">Next Meeting: {m.next_meeting_date}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMeetings.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#0e1320] border border-slate-800 rounded-2xl">
              No formal meeting records found.
            </div>
          )}
        </div>
      )}

      {/* ADD VISIT MODAL */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Log Field Site Visit</h3>
              <button onClick={() => setIsAddVisitModalOpen(false)} className="p-1.5 bg-slate-800 text-slate-300 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisit.company_name}
                    onChange={e => setNewVisit({ ...newVisit, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={newVisit.visit_date}
                    onChange={e => setNewVisit({ ...newVisit, visit_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newVisit.contact_person}
                    onChange={e => setNewVisit({ ...newVisit, contact_person: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={newVisit.designation}
                    onChange={e => setNewVisit({ ...newVisit, designation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Site technical survey & machine demonstration"
                    value={newVisit.purpose}
                    onChange={e => setNewVisit({ ...newVisit, purpose: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Current Competitor / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. ISS / G4S"
                    value={newVisit.current_vendor}
                    onChange={e => setNewVisit({ ...newVisit, current_vendor: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Potential Headcount (Pax)</label>
                  <input
                    type="number"
                    value={newVisit.potential_manpower}
                    onChange={e => setNewVisit({ ...newVisit, potential_manpower: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-300 block mb-1 font-bold">Mandatory Next Action *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Submit revised rate card with high-rise facade cleaning"
                    value={newVisit.next_action}
                    onChange={e => setNewVisit({ ...newVisit, next_action: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Next Action Due Date</label>
                  <input
                    type="date"
                    value={newVisit.next_followup_date}
                    onChange={e => setNewVisit({ ...newVisit, next_followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Visit Outcome</label>
                  <select
                    value={newVisit.outcome}
                    onChange={e => setNewVisit({ ...newVisit, outcome: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Quotation Required">Quotation Required</option>
                    <option value="Requirement Awaited">Requirement Awaited</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddVisitModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl">
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEETING MODAL */}
      {isAddMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-indigo-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 p-5 border-b border-indigo-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Record Corporate Meeting</h3>
              <button onClick={() => setIsAddMeetingModalOpen(false)} className="p-1.5 bg-slate-800 text-slate-300 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newMeeting.company_name}
                    onChange={e => setNewMeeting({ ...newMeeting, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Meeting Date</label>
                  <input
                    type="date"
                    value={newMeeting.meeting_date}
                    onChange={e => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Meeting Type</label>
                  <select
                    value={newMeeting.meeting_type}
                    onChange={e => setNewMeeting({ ...newMeeting, meeting_type: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Client Office">Client Office</option>
                    <option value="Virtual Video">Virtual Video</option>
                    <option value="Inhouse Conference">Inhouse Conference</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Meeting Agenda *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial SLA Review with CFO"
                    value={newMeeting.agenda}
                    onChange={e => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Participants List</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rao (Admin), Mr. Venkat (CFO), Vikram Singh (Spoorthy)"
                    value={newMeeting.participants}
                    onChange={e => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Discussion Points &amp; Minutes</label>
                  <textarea
                    rows={2}
                    value={newMeeting.discussion_points}
                    onChange={e => setNewMeeting({ ...newMeeting, discussion_points: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-300 block mb-1 font-bold">Mandatory Next Action *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prepare master contract draft by Friday"
                    value={newMeeting.next_action}
                    onChange={e => setNewMeeting({ ...newMeeting, next_action: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddMeetingModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-500 text-slate-950 font-bold rounded-xl">
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
