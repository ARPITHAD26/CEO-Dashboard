import React, { useState } from 'react';
import { CRMQuotation, AppState } from '../../types';
import { 
  Plus, Search, DollarSign, Calendar, Clock, CheckCircle2, 
  AlertTriangle, FileText, Send, Check, X, Edit2, TrendingUp
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddQuotation: (quotation: CRMQuotation) => void;
  onUpdateQuotation: (quotation: CRMQuotation) => void;
}

export const CRMQuotationTracker: React.FC<Props> = ({
  state,
  onAddQuotation,
  onUpdateQuotation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CRMQuotation | null>(null);

  const quotations = state.crmQuotations || [];
  const leads = state.crmLeads || [];

  const [newQuote, setNewQuote] = useState<Partial<CRMQuotation>>({
    company_name: '',
    service: 'Integrated Facility Management',
    manpower_category: 'Housekeeping & Technicians',
    quantity: 50,
    commercial_value: 2500000,
    validity_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    prepared_by: 'Vikram Singh',
    sent_date: new Date().toISOString().split('T')[0],
    client_response: 'Under initial management review',
    followup_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'Sent',
    notes: ''
  });

  const totalQuoteValue = quotations.reduce((acc, q) => acc + (q.commercial_value || 0), 0);
  const acceptedQuotes = quotations.filter(q => q.status === 'Accepted');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + (q.commercial_value || 0), 0);

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = 
      q.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.company_name || !newQuote.commercial_value) {
      alert('Please fill company name and commercial value.');
      return;
    }

    const qNum = `SIS/QTN/2026/${String(quotations.length + 201).padStart(3, '0')}`;
    const created: CRMQuotation = {
      id: `QTN-${Date.now()}`,
      quotation_number: qNum,
      lead_id: newQuote.lead_id || '',
      company_name: newQuote.company_name || '',
      requirement_id: newQuote.requirement_id || '',
      quotation_date: new Date().toISOString().split('T')[0],
      service: newQuote.service || 'Facility Management',
      manpower_category: newQuote.manpower_category || '',
      quantity: Number(newQuote.quantity) || 1,
      commercial_value: Number(newQuote.commercial_value) || 0,
      validity_date: newQuote.validity_date || '',
      prepared_by: newQuote.prepared_by || 'Vikram Singh',
      sent_date: newQuote.sent_date || '',
      client_response: newQuote.client_response || '',
      followup_date: newQuote.followup_date || '',
      status: newQuote.status || 'Sent',
      notes: newQuote.notes || ''
    };

    onAddQuotation(created);
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;
    onUpdateQuotation(editingQuote);
    setEditingQuote(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Commercial Quotations &amp; Rate Proposals</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {quotations.length} Active Quotes
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal commercial proposals, statutory wage breakdowns, validity monitoring, and contract negotiations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>TOTAL QUOTED PIPELINE</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-black text-cyan-400">
            ₹{(totalQuoteValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-slate-400">
            Across {quotations.length} commercial bids
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>ACCEPTED / WON QUOTES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-400">
            ₹{(acceptedValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-slate-400">
            {acceptedQuotes.length} quotes converted to agreements
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>ACTIVE NEGOTIATIONS</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-amber-300">
            {quotations.filter(q => q.status === 'Negotiation' || q.status === 'Under Discussion').length} Quotes
          </div>
          <div className="text-[10px] text-slate-400">
            Under CFO &amp; Board review
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>AVG QUOTE CONVERSION</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-mono font-black text-indigo-300">
            {((acceptedQuotes.length / (quotations.length || 1)) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-400">
            Bid-to-contract strike rate
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Quote #, Company, Service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none font-mono"
        >
          <option value="All">All Statuses ({quotations.length})</option>
          <option value="Sent">Sent</option>
          <option value="Under Discussion">Under Discussion</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Main Quotations Table */}
      <div className="bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Quote # &amp; Company</th>
                <th className="py-3 px-4">Service &amp; Headcount</th>
                <th className="py-3 px-4">Commercial Value (₹)</th>
                <th className="py-3 px-4">Validity Date</th>
                <th className="py-3 px-4">Prepared By</th>
                <th className="py-3 px-4">Client Feedback &amp; Follow-up</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredQuotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{q.quotation_number}</span>
                    <h4 className="font-bold text-slate-100 text-xs mt-0.5">{q.company_name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Date: {q.quotation_date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-200 text-xs block">{q.service}</span>
                    <span className="text-[11px] text-slate-400">{q.manpower_category} ({q.quantity} Pax)</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100 text-xs">
                    ₹{(q.commercial_value / 100000).toFixed(2)} Lakhs
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {q.validity_date}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {q.prepared_by}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-[11px] text-slate-300 line-clamp-1">{q.client_response || 'Pending response'}</p>
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mt-0.5">
                      Follow-up: {q.followup_date}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      q.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      q.status === 'Negotiation' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      q.status === 'Sent' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {q.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setEditingQuote(q)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
                      title="Edit Quotation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No quotations matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Log Commercial Quotation</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 bg-slate-800 text-slate-300 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Infotech TechPark"
                    value={newQuote.company_name}
                    onChange={e => setNewQuote({ ...newQuote, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Service Type</label>
                  <select
                    value={newQuote.service}
                    onChange={e => setNewQuote({ ...newQuote, service: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Integrated Facility Management">Integrated Facility Management</option>
                    <option value="Security Services">Security Services</option>
                    <option value="Blue Collar Workforce">Blue Collar Workforce</option>
                    <option value="Housekeeping Services">Housekeeping Services</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Total Headcount (Pax)</label>
                  <input
                    type="number"
                    value={newQuote.quantity}
                    onChange={e => setNewQuote({ ...newQuote, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-emerald-400 block mb-1 font-bold">Total Commercial Value (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3850000"
                    value={newQuote.commercial_value}
                    onChange={e => setNewQuote({ ...newQuote, commercial_value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Validity Date</label>
                  <input
                    type="date"
                    value={newQuote.validity_date}
                    onChange={e => setNewQuote({ ...newQuote, validity_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Prepared By</label>
                  <input
                    type="text"
                    value={newQuote.prepared_by}
                    onChange={e => setNewQuote({ ...newQuote, prepared_by: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={newQuote.followup_date}
                    onChange={e => setNewQuote({ ...newQuote, followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Commercial Notes &amp; Scope Clauses</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Includes mechanised scrubbers, Diversey chemicals, 2 supervisors..."
                    value={newQuote.notes}
                    onChange={e => setNewQuote({ ...newQuote, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl">
                  Save Quotation Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Update Quotation {editingQuote.quotation_number}</h3>
              <button onClick={() => setEditingQuote(null)} className="p-1.5 bg-slate-800 text-slate-300 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company</label>
                  <input
                    type="text"
                    value={editingQuote.company_name}
                    onChange={e => setEditingQuote({ ...editingQuote, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Status</label>
                  <select
                    value={editingQuote.status}
                    onChange={e => setEditingQuote({ ...editingQuote, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Under Discussion">Under Discussion</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Commercial Value (₹)</label>
                  <input
                    type="number"
                    value={editingQuote.commercial_value}
                    onChange={e => setEditingQuote({ ...editingQuote, commercial_value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Client Feedback &amp; Negotiation Notes</label>
                  <input
                    type="text"
                    value={editingQuote.client_response}
                    onChange={e => setEditingQuote({ ...editingQuote, client_response: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingQuote(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl">
                  Update Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
