import React, { useState } from 'react';
import { CRMClientVisit, CRMMeeting, AppState } from '../../types';
import {
  Plus, Search, Calendar, MapPin, Users, Building2,
  Video, Phone, CheckCircle2, Clock, FileText, ChevronRight,
  X, Compass, ShieldAlert, Award, ExternalLink, Send, Copy, Mail, MessageSquare
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
    meeting_type: 'Virtual Video',
    participants: '',
    agenda: '',
    discussion_points: '',
    commercial_discussion: '',
    outcome: 'Positive',
    next_action: '',
    next_meeting_date: '',
    conducted_by: 'Vikram Singh',
    meeting_platform: 'Google Meet',
    meeting_link: 'https://meet.google.com/' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6)
  });

  const [selectedSendLinkMeeting, setSelectedSendLinkMeeting] = useState<CRMMeeting | null>(null);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState<string | null>(null);

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
      conducted_by: newMeeting.conducted_by || 'Vikram Singh',
      meeting_link: newMeeting.meeting_link || 'https://meet.google.com/' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6),
      meeting_platform: newMeeting.meeting_platform || 'Google Meet'
    };

    onAddMeeting(created);
    setIsAddMeetingModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Client Visits &amp; Formal Meeting Records</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold border border-sky-300">
              {visits.length} Visits • {meetings.length} Meetings
            </span>
          </h3>

        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddVisitModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-400/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Log Field Visit</span>
          </button>
          <button
            onClick={() => setIsAddMeetingModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Video className="w-4 h-4 text-sky-600" />
            <span>Record Meeting</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sky-200 gap-4">
        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-3 font-mono text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === 'visits' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Compass className="w-4 h-4" />
          <span>Client Field Visits ({visits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`pb-3 font-mono text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === 'meetings' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Video className="w-4 h-4" />
          <span>Corporate Meetings ({meetings.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Company, Contact, Purpose, Agenda..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* VISITS TAB */}
      {activeTab === 'visits' && (
        <div className="space-y-3">
          {filteredVisits.map(v => (
            <div key={v.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 rounded-2xl space-y-3 transition shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full font-bold">
                      VISIT DATE: {v.visit_date}
                    </span>
                    <span className="text-slate-500">Visited by: <strong className="text-slate-800">{v.visited_by}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{v.company_name}</h4>
                  <span className="text-[11px] text-slate-500">
                    Contact: {v.contact_person} ({v.designation})
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold w-fit border ${v.outcome === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    v.outcome === 'Positive' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                      'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                  {v.outcome}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-sky-50/60 rounded-xl space-y-1 border border-sky-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Purpose &amp; Scope</span>
                  <p className="text-slate-800 font-medium">{v.purpose}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Discussed: {v.requirement_discussed}</p>
                </div>

                <div className="p-3 bg-sky-50/60 rounded-xl space-y-1 border border-sky-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Current Vendor &amp; Opportunity</span>
                  <p className="text-slate-700">Existing: <strong className="text-slate-900">{v.current_vendor || 'None'}</strong></p>
                  <div className="text-[11px] text-slate-600">
                    Manpower Potential: <strong className="text-sky-700 font-mono">{v.potential_manpower} Pax</strong> (Current: {v.existing_manpower})
                  </div>
                  {v.competitor_info && (
                    <p className="text-[10px] text-amber-700 mt-1 font-mono">Comp: {v.competitor_info}</p>
                  )}
                </div>

                <div className="p-3 bg-amber-50/80 rounded-xl space-y-1 border border-amber-200">
                  <span className="text-[10px] font-mono text-amber-800 uppercase font-bold block">Next Mandatory Action</span>
                  <p className="text-amber-900 font-medium">{v.next_action}</p>
                  <span className="text-[10px] text-amber-700 font-mono block mt-1">
                    Due Date: {v.next_followup_date}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredVisits.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-mono text-xs bg-white border border-sky-200 rounded-2xl shadow-sm">
              No client visit logs found.
            </div>
          )}
        </div>
      )}

      {/* MEETINGS TAB */}
      {activeTab === 'meetings' && (
        <div className="space-y-3">
          {filteredMeetings.map(m => (
            <div key={m.id} className="p-5 bg-white border border-sky-200 hover:border-blue-400 rounded-2xl space-y-3 transition shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full font-bold">
                      {m.meeting_date} ({m.meeting_time}) • {m.meeting_type}
                    </span>
                    <span className="text-slate-500">Conducted by: <strong className="text-slate-800">{m.conducted_by}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{m.company_name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Participants: {m.participants}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold w-fit bg-slate-100 text-slate-700 border border-slate-200">
                  {m.outcome}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-sky-50/60 rounded-xl space-y-1 border border-sky-100">
                  <h5 className="font-bold text-slate-800 text-xs">Agenda: {m.agenda}</h5>
                  <p className="text-slate-700 leading-relaxed">{m.discussion_points}</p>
                </div>

                {m.commercial_discussion && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                    <strong>Commercial Terms Discussed:</strong> {m.commercial_discussion}
                  </div>
                )}

                {m.meeting_link && (
                  <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Video className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono text-sky-700 font-bold block">{m.meeting_platform || 'Google Meet'} Link</span>
                        <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-sky-700 hover:underline truncate block">
                          {m.meeting_link}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={m.meeting_link} target="_blank" rel="noreferrer" className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition">
                        <ExternalLink className="w-3 h-3" />
                        <span>Join</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedSendLinkMeeting(m)}
                        className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition"
                      >
                        <Send className="w-3 h-3 text-sky-600" />
                        <span>Send Link</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-amber-800 uppercase font-bold block">Next Action:</span>
                    <p className="text-slate-800 font-medium">{m.next_action}</p>
                  </div>
                  {m.next_meeting_date && (
                    <span className="text-[10px] font-mono text-slate-500">Next Meeting: {m.next_meeting_date}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMeetings.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-mono text-xs bg-white border border-sky-200 rounded-2xl shadow-sm">
              No formal meeting records found.
            </div>
          )}
        </div>
      )}

      {/* ADD VISIT MODAL */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <h3 className="text-base font-bold text-slate-900">Log Field Site Visit</h3>
              <button onClick={() => setIsAddVisitModalOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisit.company_name}
                    onChange={e => setNewVisit({ ...newVisit, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Visit Date</label>
                  <input
                    type="date"
                    value={newVisit.visit_date}
                    onChange={e => setNewVisit({ ...newVisit, visit_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newVisit.contact_person}
                    onChange={e => setNewVisit({ ...newVisit, contact_person: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Designation</label>
                  <input
                    type="text"
                    value={newVisit.designation}
                    onChange={e => setNewVisit({ ...newVisit, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Purpose of Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Site technical survey & machine demonstration"
                    value={newVisit.purpose}
                    onChange={e => setNewVisit({ ...newVisit, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Current Competitor / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. ISS / G4S"
                    value={newVisit.current_vendor}
                    onChange={e => setNewVisit({ ...newVisit, current_vendor: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Potential Headcount (Pax)</label>
                  <input
                    type="number"
                    value={newVisit.potential_manpower}
                    onChange={e => setNewVisit({ ...newVisit, potential_manpower: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-800 block mb-1 font-bold">Mandatory Next Action *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Submit revised rate card with high-rise facade cleaning"
                    value={newVisit.next_action}
                    onChange={e => setNewVisit({ ...newVisit, next_action: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-amber-300 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Next Action Due Date</label>
                  <input
                    type="date"
                    value={newVisit.next_followup_date}
                    onChange={e => setNewVisit({ ...newVisit, next_followup_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Visit Outcome</label>
                  <select
                    value={newVisit.outcome}
                    onChange={e => setNewVisit({ ...newVisit, outcome: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
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

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button type="button" onClick={() => setIsAddVisitModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold rounded-xl shadow-md shadow-sky-400/20 transition active:scale-95 cursor-pointer">
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEETING MODAL */}
      {isAddMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <h3 className="text-base font-bold text-slate-900">Record Corporate Meeting</h3>
              <button onClick={() => setIsAddMeetingModalOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newMeeting.company_name}
                    onChange={e => setNewMeeting({ ...newMeeting, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Meeting Date</label>
                  <input
                    type="date"
                    value={newMeeting.meeting_date}
                    onChange={e => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Meeting Type</label>
                  <select
                    value={newMeeting.meeting_type}
                    onChange={e => setNewMeeting({ ...newMeeting, meeting_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Client Office">Client Office</option>
                    <option value="Virtual Video">Virtual Video</option>
                    <option value="Inhouse Conference">Inhouse Conference</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Meeting Agenda *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial SLA Review with CFO"
                    value={newMeeting.agenda}
                    onChange={e => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Participants List</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rao (Admin), Mr. Venkat (CFO), Vikram Singh (Spoorthy)"
                    value={newMeeting.participants}
                    onChange={e => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Discussion Points &amp; Minutes</label>
                  <textarea
                    rows={2}
                    value={newMeeting.discussion_points}
                    onChange={e => setNewMeeting({ ...newMeeting, discussion_points: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-amber-800 block mb-1 font-bold">Mandatory Next Action *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prepare master contract draft by Friday"
                    value={newMeeting.next_action}
                    onChange={e => setNewMeeting({ ...newMeeting, next_action: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-amber-300 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-sky-50 rounded-xl border border-sky-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-sky-800 font-bold flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-sky-600" />
                      <span>Video Meeting Link (Google Meet / Teams)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}`;
                        setNewMeeting({ ...newMeeting, meeting_link: `https://meet.google.com/${code}`, meeting_platform: 'Google Meet' });
                      }}
                      className="text-[10px] font-mono text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                    >
                      Regenerate Link
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newMeeting.meeting_link || ''}
                    onChange={e => setNewMeeting({ ...newMeeting, meeting_link: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-mono text-sky-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button type="button" onClick={() => setIsAddMeetingModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-white font-bold rounded-xl shadow-md shadow-sky-400/20 transition active:scale-95 cursor-pointer">
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND MEETING LINK MODAL */}
      {selectedSendLinkMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-sky-300 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send Meeting Link</h3>
                  <p className="text-xs text-slate-500">Dispatch invitation to participants &amp; executive calendar</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSendLinkMeeting(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedSendLinkMeeting.company_name}</div>
              <div className="text-slate-600">{selectedSendLinkMeeting.agenda}</div>
              <div className="text-[11px] font-mono text-sky-700">{selectedSendLinkMeeting.meeting_date} at {selectedSendLinkMeeting.meeting_time}</div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">Meeting URL:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedSendLinkMeeting.meeting_link || 'https://meet.google.com/sis-executive'}
                  className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSendLinkMeeting.meeting_link) {
                      navigator.clipboard.writeText(selectedSendLinkMeeting.meeting_link);
                      setCopiedLinkNotice('Link copied!');
                      setTimeout(() => setCopiedLinkNotice(null), 2000);
                    }
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  {copiedLinkNotice || 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Meeting link email sent for ${selectedSendLinkMeeting.company_name}!`);
                  setSelectedSendLinkMeeting(null);
                }}
                className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer"
              >
                <Mail className="w-5 h-5 text-sky-600" />
                <span>Send via Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = encodeURIComponent(
                    `*Spoorthy Integrated Solutions - Meeting Invite*\nClient: ${selectedSendLinkMeeting.company_name}\nAgenda: ${selectedSendLinkMeeting.agenda}\nDate: ${selectedSendLinkMeeting.meeting_date} at ${selectedSendLinkMeeting.meeting_time}\nJoin: ${selectedSendLinkMeeting.meeting_link || 'https://meet.google.com/sis-executive'}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  setSelectedSendLinkMeeting(null);
                }}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
