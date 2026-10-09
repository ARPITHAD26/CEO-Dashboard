import React, { useState, useRef } from 'react';
import { CRMQuotation, AppState } from '../../types';
import {
  Plus, Search, DollarSign, Calendar, Clock, CheckCircle2,
  AlertTriangle, FileText, Send, Check, X, Edit2, TrendingUp,
  UploadCloud, FileSpreadsheet, Download, Trash2, Eye, Paperclip,
  FileUp, ExternalLink
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddQuotation: (quotation: CRMQuotation) => void;
  onUpdateQuotation: (quotation: CRMQuotation) => void;
}

interface PreviewDocModalState {
  name: string;
  type: 'pdf' | 'word' | 'excel';
  size: string;
  data?: string;
  company: string;
  quoteNum: string;
  commercialValue?: number;
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
  const [previewingDoc, setPreviewingDoc] = useState<PreviewDocModalState | null>(null);

  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadQuoteId, setQuickUploadQuoteId] = useState<string | null>(null);

  const quotations = state.crmQuotations || [];
  const leads = state.crmLeads || [];

  const defaultNewQuote: Partial<CRMQuotation> = {
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
    notes: '',
    document_name: undefined,
    document_type: undefined,
    document_size: undefined,
    document_data: undefined
  };

  const [newQuote, setNewQuote] = useState<Partial<CRMQuotation>>(defaultNewQuote);

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

  const parseUploadedFile = (
    file: File,
    callback: (docInfo: { name: string; type: 'pdf' | 'word' | 'excel'; size: string; data: string }) => void
  ) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let docType: 'pdf' | 'word' | 'excel' = 'pdf';
    if (ext === 'doc' || ext === 'docx') {
      docType = 'word';
    } else if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
      docType = 'excel';
    } else if (ext === 'pdf') {
      docType = 'pdf';
    } else {
      alert('Unsupported file format. Please upload a PDF (.pdf), Word (.doc, .docx), or Excel (.xls, .xlsx) document.');
      return;
    }

    const formattedSize = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      callback({
        name: file.name,
        type: docType,
        size: formattedSize,
        data: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadDocument = (doc: { name?: string; type?: string; data?: string }) => {
    if (!doc.name) return;
    if (doc.data) {
      const a = document.createElement('a');
      a.href = doc.data;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content =
        `SPOORTHY INTEGRATED SERVICES PVT. LTD.\n` +
        `COMMERCIAL QUOTATION PROPOSAL\n` +
        `===================================\n` +
        `Document Name: ${doc.name}\n` +
        `Format: ${doc.type || 'Proposal'}\n` +
        `Date: ${new Date().toLocaleDateString()}\n\n` +
        `This quotation proposal docket is verified and stored in Spoorthy SIS CRM.\n`;
      const blob = new Blob([content], {
        type: doc.type === 'excel'
          ? 'application/vnd.ms-excel'
          : doc.type === 'word'
          ? 'application/msword'
          : 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const triggerQuickUpload = (quoteId: string) => {
    setQuickUploadQuoteId(quoteId);
    quickFileInputRef.current?.click();
  };

  const handleQuickFileSelected = (file: File) => {
    if (!quickUploadQuoteId) return;
    parseUploadedFile(file, (info) => {
      const target = quotations.find(q => q.id === quickUploadQuoteId);
      if (target) {
        onUpdateQuotation({
          ...target,
          document_name: info.name,
          document_type: info.type,
          document_size: info.size,
          document_data: info.data
        });
      }
      setQuickUploadQuoteId(null);
    });
  };

  const renderDocIcon = (type?: string, className = 'w-4 h-4') => {
    if (type === 'excel') return <FileSpreadsheet className={`${className} text-emerald-600`} />;
    if (type === 'word') return <FileText className={`${className} text-blue-600`} />;
    return <FileText className={`${className} text-rose-600`} />;
  };

  const getDocBadgeClass = (type?: string) => {
    if (type === 'excel') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (type === 'word') return 'bg-blue-50 text-blue-700 border-blue-300';
    return 'bg-rose-50 text-rose-700 border-rose-300';
  };

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
      notes: newQuote.notes || '',
      document_name: newQuote.document_name,
      document_type: newQuote.document_type,
      document_size: newQuote.document_size,
      document_data: newQuote.document_data
    };

    onAddQuotation(created);
    setNewQuote(defaultNewQuote);
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

      {/* Hidden Quick File Input for instant table row attachments */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleQuickFileSelected(file);
          }
          e.target.value = '';
        }}
        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Commercial Quotations &amp; Rate Proposals</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold border border-sky-300">
              {quotations.length} Active Quotes
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pricing proposals with attached PDF, Word (.docx), and Excel (.xlsx) commercial sheets.
          </p>
        </div>

        <button
          onClick={() => {
            setNewQuote(defaultNewQuote);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Commercial Quotation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 shadow-sm hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>TOTAL QUOTED PIPELINE</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-black text-sky-700">
            ₹{(totalQuoteValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Across {quotations.length} commercial quotations
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 shadow-sm hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>ACCEPTED / WON QUOTES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-700">
            ₹{(acceptedValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {acceptedQuotes.length} quotes converted to agreements
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 shadow-sm hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>ACTIVE NEGOTIATIONS</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-black text-amber-700">
            {quotations.filter(q => q.status === 'Negotiation' || q.status === 'Under Discussion').length} Quotes
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Under CFO &amp; Board review
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 shadow-sm hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>AVG QUOTE CONVERSION</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-mono font-black text-indigo-700">
            {((acceptedQuotes.length / (quotations.length || 1)) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Quote-to-contract strike rate
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Quote #, Company, Service, Document..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-xs text-slate-700 focus:outline-none font-mono font-semibold"
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
      <div className="bg-white border border-sky-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-50 border-b border-sky-200 text-slate-600 font-mono text-[10px] uppercase font-bold">
                <th className="py-3 px-4">Quote # &amp; Company</th>
                <th className="py-3 px-4">Service &amp; Headcount</th>
                <th className="py-3 px-4">Commercial Value (₹)</th>
                <th className="py-3 px-4">Proposal Document</th>
                <th className="py-3 px-4">Validity Date</th>
                <th className="py-3 px-4">Prepared By</th>
                <th className="py-3 px-4">Client Feedback &amp; Follow-up</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-sans">
              {filteredQuotes.map(q => (
                <tr key={q.id} className="hover:bg-sky-50/50 transition">
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono font-bold text-sky-700">{q.quotation_number}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-0.5">{q.company_name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Date: {q.quotation_date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 text-xs block">{q.service}</span>
                    <span className="text-[11px] text-slate-500">{q.manpower_category} ({q.quantity} Pax)</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                    ₹{(q.commercial_value / 100000).toFixed(2)} Lakhs
                  </td>

                  {/* Document Column with PDF / Word / Excel display */}
                  <td className="py-3.5 px-4">
                    {q.document_name ? (
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                          q.document_type === 'pdf' ? 'bg-rose-50 border-rose-200' :
                          q.document_type === 'word' ? 'bg-blue-50 border-blue-200' :
                          'bg-emerald-50 border-emerald-200'
                        }`}>
                          {renderDocIcon(q.document_type, 'w-3.5 h-3.5')}
                        </div>
                        <div className="min-w-0 max-w-[150px]">
                          <p className="text-xs font-bold text-slate-800 truncate" title={q.document_name}>
                            {q.document_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${getDocBadgeClass(q.document_type)}`}>
                              {q.document_type || 'DOC'}
                            </span>
                            {q.document_size && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {q.document_size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            onClick={() => setPreviewingDoc({
                              name: q.document_name || '',
                              type: q.document_type || 'pdf',
                              size: q.document_size || 'N/A',
                              data: q.document_data,
                              company: q.company_name,
                              quoteNum: q.quotation_number,
                              commercialValue: q.commercial_value
                            })}
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition cursor-pointer"
                            title="Preview proposal details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument({
                              name: q.document_name,
                              type: q.document_type,
                              data: q.document_data
                            })}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerQuickUpload(q.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 hover:border-sky-300 rounded-lg transition cursor-pointer"
                        title="Upload PDF, Word, or Excel proposal"
                      >
                        <Paperclip className="w-3 h-3 text-sky-600" />
                        <span>+ Attach File</span>
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {q.validity_date}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {q.prepared_by}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-[11px] text-slate-700 line-clamp-1">{q.client_response || 'Pending response'}</p>
                    <span className="text-[10px] font-mono text-amber-800 font-bold block mt-0.5">
                      Follow-up: {q.followup_date}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${q.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        q.status === 'Negotiation' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          q.status === 'Sent' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                      {q.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setEditingQuote(q)}
                      className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 transition cursor-pointer"
                      title="Edit Quotation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono">
                    No quotations matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL ("Log Commercial Quotation") */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 p-5 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Commercial Quotation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record quote terms and upload official PDF, Word, or Excel commercial proposals.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Infotech TechPark"
                    value={newQuote.company_name}
                    onChange={e => setNewQuote({ ...newQuote, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Service Type</label>
                  <select
                    value={newQuote.service}
                    onChange={e => setNewQuote({ ...newQuote, service: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Integrated Facility Management">Integrated Facility Management</option>
                    <option value="Security Services">Security Services</option>
                    <option value="Blue Collar Workforce">Blue Collar Workforce</option>
                    <option value="Housekeeping Services">Housekeeping Services</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Total Headcount (Pax)</label>
                  <input
                    type="number"
                    value={newQuote.quantity}
                    onChange={e => setNewQuote({ ...newQuote, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-emerald-700 block mb-1 font-bold">Total Commercial Value (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3850000"
                    value={newQuote.commercial_value}
                    onChange={e => setNewQuote({ ...newQuote, commercial_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-emerald-300 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Validity Date</label>
                  <input
                    type="date"
                    value={newQuote.validity_date}
                    onChange={e => setNewQuote({ ...newQuote, validity_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Prepared By</label>
                  <input
                    type="text"
                    value={newQuote.prepared_by}
                    onChange={e => setNewQuote({ ...newQuote, prepared_by: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={newQuote.followup_date}
                    onChange={e => setNewQuote({ ...newQuote, followup_date: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                {/* PDF, Word, Excel Upload Section */}
                <div className="sm:col-span-2 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-700 block font-bold uppercase tracking-wider">
                      Commercial Quotation Proposal Docket
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Supports PDF, Word &amp; Excel (Max 25 MB)</span>
                  </div>

                  {!newQuote.document_name ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingNew(true);
                      }}
                      onDragLeave={() => setIsDraggingNew(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingNew(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          parseUploadedFile(file, (info) => {
                            setNewQuote(prev => ({
                              ...prev,
                              document_name: info.name,
                              document_type: info.type,
                              document_size: info.size,
                              document_data: info.data
                            }));
                          });
                        }
                      }}
                      onClick={() => newFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDraggingNew
                          ? 'border-sky-500 bg-sky-50 scale-[1.01]'
                          : 'border-sky-200 hover:border-sky-400 bg-gradient-to-b from-sky-50/30 to-slate-50/40 hover:bg-sky-50/50'
                      }`}
                    >
                      <input
                        type="file"
                        ref={newFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            parseUploadedFile(file, (info) => {
                              setNewQuote(prev => ({
                                ...prev,
                                document_name: info.name,
                                document_type: info.type,
                                document_size: info.size,
                                document_data: info.data
                              }));
                            });
                          }
                          e.target.value = '';
                        }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="hidden"
                      />

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to upload or drag &amp; drop commercial quotation
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Upload final rate cards, technical-commercial bids, or signed proposals
                          </p>
                        </div>

                        {/* Badges for PDF, Word, Excel */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                            <span>PDF (.pdf)</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Word (.doc, .docx)</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Excel (.xls, .xlsx)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 border border-sky-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          newQuote.document_type === 'pdf' ? 'bg-rose-50 border-rose-200' :
                          newQuote.document_type === 'word' ? 'bg-blue-50 border-blue-200' :
                          'bg-emerald-50 border-emerald-200'
                        }`}>
                          {renderDocIcon(newQuote.document_type, 'w-5 h-5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[280px]" title={newQuote.document_name}>
                              {newQuote.document_name}
                            </p>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${getDocBadgeClass(newQuote.document_type)}`}>
                              {newQuote.document_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{newQuote.document_size}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready to attach
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {newQuote.document_data && (
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc({
                              name: newQuote.document_name || '',
                              type: newQuote.document_type || 'pdf',
                              size: newQuote.document_size || '',
                              data: newQuote.document_data,
                              company: newQuote.company_name || 'New Quotation',
                              quoteNum: 'Draft Quote'
                            })}
                            className="p-1.5 text-sky-700 hover:bg-sky-100 rounded-lg transition cursor-pointer"
                            title="Preview document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewQuote(prev => ({
                            ...prev,
                            document_name: undefined,
                            document_type: undefined,
                            document_size: undefined,
                            document_data: undefined
                          }))}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Commercial Notes &amp; Scope Clauses</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Includes mechanised scrubbers, Diversey chemicals, 2 supervisors..."
                    value={newQuote.notes}
                    onChange={e => setNewQuote({ ...newQuote, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 transition active:scale-95 cursor-pointer"
                >
                  Save Quotation Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL with PDF / Word / Excel upload capability */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-sky-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 p-5 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Quotation {editingQuote.quotation_number}</h3>
                <span className="text-xs text-slate-500">{editingQuote.company_name}</span>
              </div>
              <button
                onClick={() => setEditingQuote(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Company</label>
                  <input
                    type="text"
                    value={editingQuote.company_name}
                    onChange={e => setEditingQuote({ ...editingQuote, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Status</label>
                  <select
                    value={editingQuote.status}
                    onChange={e => setEditingQuote({ ...editingQuote, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-700 font-mono font-medium focus:outline-none focus:bg-white focus:border-sky-500"
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
                  <label className="text-[10px] font-mono text-emerald-700 block mb-1 font-bold">Commercial Value (₹)</label>
                  <input
                    type="number"
                    value={editingQuote.commercial_value}
                    onChange={e => setEditingQuote({ ...editingQuote, commercial_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-emerald-300 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-600 block mb-1 font-semibold">Client Feedback &amp; Negotiation Notes</label>
                  <input
                    type="text"
                    value={editingQuote.client_response}
                    onChange={e => setEditingQuote({ ...editingQuote, client_response: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                {/* Edit Quotation Document Section */}
                <div className="sm:col-span-2 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-700 block font-bold uppercase tracking-wider">
                      Commercial Proposal Document
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">PDF, Word &amp; Excel</span>
                  </div>

                  {!editingQuote.document_name ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingEdit(true);
                      }}
                      onDragLeave={() => setIsDraggingEdit(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingEdit(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          parseUploadedFile(file, (info) => {
                            setEditingQuote({
                              ...editingQuote,
                              document_name: info.name,
                              document_type: info.type,
                              document_size: info.size,
                              document_data: info.data
                            });
                          });
                        }
                      }}
                      onClick={() => editFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDraggingEdit
                          ? 'border-sky-500 bg-sky-50 scale-[1.01]'
                          : 'border-sky-200 hover:border-sky-400 bg-gradient-to-b from-sky-50/30 to-slate-50/40 hover:bg-sky-50/50'
                      }`}
                    >
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            parseUploadedFile(file, (info) => {
                              setEditingQuote({
                                ...editingQuote,
                                document_name: info.name,
                                document_type: info.type,
                                document_size: info.size,
                                document_data: info.data
                              });
                            });
                          }
                          e.target.value = '';
                        }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="hidden"
                      />

                      <div className="flex flex-col items-center gap-1.5">
                        <UploadCloud className="w-6 h-6 text-sky-500" />
                        <p className="text-xs font-bold text-slate-800">
                          Click to attach proposal document
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Upload PDF, Word (.docx), or Excel (.xlsx) file
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 border border-sky-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          editingQuote.document_type === 'pdf' ? 'bg-rose-50 border-rose-200' :
                          editingQuote.document_type === 'word' ? 'bg-blue-50 border-blue-200' :
                          'bg-emerald-50 border-emerald-200'
                        }`}>
                          {renderDocIcon(editingQuote.document_type, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]" title={editingQuote.document_name}>
                            {editingQuote.document_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${getDocBadgeClass(editingQuote.document_type)}`}>
                              {editingQuote.document_type}
                            </span>
                            {editingQuote.document_size && <span>{editingQuote.document_size}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument({
                            name: editingQuote.document_name,
                            type: editingQuote.document_type,
                            data: editingQuote.document_data
                          })}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingQuote({
                            ...editingQuote,
                            document_name: undefined,
                            document_type: undefined,
                            document_size: undefined,
                            document_data: undefined
                          })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 transition active:scale-95 cursor-pointer"
                >
                  Update Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-sky-50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${
                  previewingDoc.type === 'pdf' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                  previewingDoc.type === 'word' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                  'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  {renderDocIcon(previewingDoc.type, 'w-6 h-6')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-md">{previewingDoc.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-sky-700 font-semibold">{previewingDoc.quoteNum}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">{previewingDoc.company}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Document Meta Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Format</span>
                  <span className="text-xs font-bold text-slate-800 uppercase mt-0.5 block">{previewingDoc.type} Document</span>
                </div>
                <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">File Size</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">{previewingDoc.size}</span>
                </div>
                <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Proposal Value</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 mt-0.5 block">
                    {previewingDoc.commercialValue ? `₹${(previewingDoc.commercialValue / 100000).toFixed(2)} Lakhs` : 'Logged'}
                  </span>
                </div>
              </div>

              {/* PDF Preview Frame or Document Showcase Banner */}
              {previewingDoc.data && previewingDoc.type === 'pdf' ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner h-[380px]">
                  <iframe
                    src={previewingDoc.data}
                    title={previewingDoc.name}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-sky-200 bg-gradient-to-b from-sky-50/40 to-slate-50/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className={`p-4 rounded-2xl border ${
                    previewingDoc.type === 'pdf' ? 'bg-rose-50 border-rose-200' :
                    previewingDoc.type === 'word' ? 'bg-blue-50 border-blue-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}>
                    {renderDocIcon(previewingDoc.type, 'w-10 h-10')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{previewingDoc.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Official commercial proposal docket attached to quotation <strong>{previewingDoc.quoteNum}</strong> for <strong>{previewingDoc.company}</strong>.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Commercial Proposal Attachment</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Approved for client sharing &amp; executive review
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewingDoc(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadDocument({
                    name: previewingDoc.name,
                    type: previewingDoc.type,
                    data: previewingDoc.data
                  })}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
