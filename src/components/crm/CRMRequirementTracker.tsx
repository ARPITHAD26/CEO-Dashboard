import React, { useState } from 'react';
import { CRMRequirement, CRMLead, AppState } from '../../types';
import { 
  Plus, Search, Filter, Users, Briefcase, DollarSign, 
  Calendar, Clock, CheckCircle2, AlertCircle, Edit2, 
  Shield, CheckCheck, TrendingUp, X, MapPin, Building2, UserCheck
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddRequirement: (req: CRMRequirement) => void;
  onUpdateRequirement: (req: CRMRequirement) => void;
}

export const CRMRequirementTracker: React.FC<Props> = ({
  state,
  onAddRequirement,
  onUpdateRequirement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<CRMRequirement | null>(null);

  const requirements = state.crmRequirements || [];
  const leads = state.crmLeads || [];

  const [newReq, setNewReq] = useState<Partial<CRMRequirement>>({
    lead_id: '',
    company_name: '',
    requirement_date: new Date().toISOString().split('T')[0],
    service_type: 'Facility Management',
    manpower_category: '',
    quantity: 25,
    male_count: 20,
    female_count: 5,
    qualification: 'SSLC / 10th Standard',
    experience_years: '1-2 Years',
    skills_required: '',
    location: 'Bangalore',
    shift: 'Rotational (24/7)',
    working_hours: '8 Hours / 6 Days',
    weekly_off: 'Rotational',
    salary_or_wages: 18000,
    billing_rate: 24000,
    benefits_food: true,
    benefits_accommodation: false,
    benefits_transportation: false,
    joining_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    contract_period_months: 12,
    replacement_requirement: 'Within 24 hours of notice',
    status: 'In Discussion',
    assigned_executive: 'Vikram Singh',
    remarks: ''
  });

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = 
      req.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.manpower_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requirement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesService = serviceFilter === 'All' || req.service_type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  // KPI calculations
  const totalPax = requirements.reduce((acc, r) => acc + (r.quantity || 0), 0);
  const totalMonthlyBilling = requirements.reduce((acc, r) => acc + ((r.billing_rate || 0) * (r.quantity || 0)), 0);
  const totalMonthlyWages = requirements.reduce((acc, r) => acc + ((r.salary_or_wages || 0) * (r.quantity || 0)), 0);
  const avgMargin = totalMonthlyBilling > 0 
    ? (((totalMonthlyBilling - totalMonthlyWages) / totalMonthlyBilling) * 100).toFixed(1)
    : '0';

  const handleSaveNewRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.company_name || !newReq.manpower_category || !newReq.quantity) {
      alert('Please fill company name, manpower category, and quantity.');
      return;
    }

    const reqNum = `SIS/REQ/2026/${String(requirements.length + 101).padStart(3, '0')}`;
    const created: CRMRequirement = {
      id: `REQ-${Date.now()}`,
      requirement_number: reqNum,
      lead_id: newReq.lead_id || '',
      company_name: newReq.company_name || '',
      requirement_date: newReq.requirement_date || new Date().toISOString().split('T')[0],
      service_type: newReq.service_type || 'Facility Management',
      manpower_category: newReq.manpower_category || '',
      quantity: Number(newReq.quantity) || 1,
      male_count: Number(newReq.male_count) || 0,
      female_count: Number(newReq.female_count) || 0,
      qualification: newReq.qualification || '',
      experience_years: newReq.experience_years || '',
      skills_required: newReq.skills_required || '',
      location: newReq.location || '',
      shift: newReq.shift || 'General Shift',
      working_hours: newReq.working_hours || '8 Hours',
      weekly_off: newReq.weekly_off || 'Sunday',
      salary_or_wages: Number(newReq.salary_or_wages) || 0,
      billing_rate: Number(newReq.billing_rate) || 0,
      benefits_food: !!newReq.benefits_food,
      benefits_accommodation: !!newReq.benefits_accommodation,
      benefits_transportation: !!newReq.benefits_transportation,
      joining_date: newReq.joining_date || '',
      contract_period_months: Number(newReq.contract_period_months) || 12,
      replacement_requirement: newReq.replacement_requirement || 'Within 24 hours',
      status: newReq.status || 'In Discussion',
      assigned_executive: newReq.assigned_executive || 'Vikram Singh',
      remarks: newReq.remarks || ''
    };

    onAddRequirement(created);
    setIsAddModalOpen(false);
  };

  const handleUpdateReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;
    onUpdateRequirement(editingReq);
    setEditingReq(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Manpower &amp; Facility Requisitions Tracker</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {requirements.length} Active Demands
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured tracking of blue-collar, security, housekeeping, and technical workforce demands with wage-to-billing gross margin analytics.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Manpower Demand</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>TOTAL MANPOWER DEMAND</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-mono font-black text-indigo-300">
            {totalPax} <span className="text-xs font-normal text-slate-400">Personnel</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Across {requirements.length} corporate client accounts
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>MONTHLY BILLING POTENTIAL</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-black text-cyan-400">
            ₹{(totalMonthlyBilling / 100000).toFixed(2)} L/mo
          </div>
          <div className="text-[10px] text-slate-400">
            Avg billing ₹{(totalMonthlyBilling / (totalPax || 1)).toFixed(0)}/head
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>GROSS PROFIT MARGIN</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-400">
            {avgMargin}% <span className="text-xs font-normal text-slate-400">Spread</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Wage to client billing spread
          </div>
        </div>

        <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl space-y-1.5 hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>APPROVED &amp; READY TO DEPLOY</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-mono font-black text-teal-300">
            {requirements.filter(r => r.status === 'Approved' || r.status === 'Deployment Pending').reduce((a, b) => a + b.quantity, 0)} <span className="text-xs font-normal text-slate-400">Pax</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Awaiting site induction badge
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1320] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Requisition #, Company, Category, Location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none font-mono"
          >
            <option value="All">All Statuses ({requirements.length})</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Profile/Proposal Submitted">Profile/Proposal Submitted</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Approved">Approved</option>
            <option value="Deployment Pending">Deployment Pending</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>

          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none font-mono"
          >
            <option value="All">All Service Lines</option>
            <option value="Facility Management">Facility Management</option>
            <option value="Blue Collar Manpower">Blue Collar Manpower</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Security Services">Security Services</option>
            <option value="White Collar Manpower">White Collar Manpower</option>
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Req # &amp; Company</th>
                <th className="py-3 px-4">Category &amp; Headcount</th>
                <th className="py-3 px-4">Skills &amp; Qualifications</th>
                <th className="py-3 px-4">Shift &amp; Location</th>
                <th className="py-3 px-4">Wages vs Billing</th>
                <th className="py-3 px-4">Margin %</th>
                <th className="py-3 px-4">Joining &amp; Terms</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRequirements.map(req => {
                const margin = req.billing_rate > 0 
                  ? (((req.billing_rate - req.salary_or_wages) / req.billing_rate) * 100).toFixed(1)
                  : '0';

                return (
                  <tr key={req.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">{req.requirement_number}</span>
                      <h4 className="font-bold text-slate-100 text-xs mt-0.5">{req.company_name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Date: {req.requirement_date}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-200 text-xs block">{req.manpower_category}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                          {req.quantity} Total Pax
                        </span>
                        <span className="text-[10px] text-slate-400">({req.male_count}M / {req.female_count}F)</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-300 line-clamp-1"><strong>Skills:</strong> {req.skills_required}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5"><strong>Qual:</strong> {req.qualification} ({req.experience_years})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono block w-fit">
                        {req.shift}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {req.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-400">Wage: ₹{req.salary_or_wages?.toLocaleString('en-IN')}</div>
                      <div className="text-emerald-400 font-bold">Bill: ₹{req.billing_rate?.toLocaleString('en-IN')}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        Number(margin) >= 25 ? 'bg-emerald-500/20 text-emerald-300' :
                        Number(margin) >= 15 ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        +{margin}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-bold text-slate-200">Joining: {req.joining_date}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.contract_period_months}M Contract • {req.replacement_requirement}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        req.status === 'Negotiation' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        req.status === 'Fulfilled' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">By: {req.assigned_executive?.split(' ')[0]}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingReq(req)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
                        title="Edit Requirement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRequirements.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                    No manpower requisitions matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD REQUIREMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">MANPOWER DEMAND CAPTURE</span>
                <h3 className="text-base font-black text-slate-100">Log New Client Requirement</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRequirement} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Infotech TechPark"
                    value={newReq.company_name}
                    onChange={e => setNewReq({ ...newReq, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Service Type</label>
                  <select
                    value={newReq.service_type}
                    onChange={e => setNewReq({ ...newReq, service_type: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Facility Management">Facility Management</option>
                    <option value="Blue Collar Manpower">Blue Collar Manpower</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Security Services">Security Services</option>
                    <option value="White Collar Manpower">White Collar Manpower</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Manpower Category / Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mechanized Housekeeping Attendants &amp; DG Technicians"
                    value={newReq.manpower_category}
                    onChange={e => setNewReq({ ...newReq, manpower_category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Total Quantity (Pax) *</label>
                  <input
                    type="number"
                    required
                    value={newReq.quantity}
                    onChange={e => setNewReq({ ...newReq, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Male Count</label>
                  <input
                    type="number"
                    value={newReq.male_count}
                    onChange={e => setNewReq({ ...newReq, male_count: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Female Count</label>
                  <input
                    type="number"
                    value={newReq.female_count}
                    onChange={e => setNewReq({ ...newReq, female_count: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Shift Schedule</label>
                  <select
                    value={newReq.shift}
                    onChange={e => setNewReq({ ...newReq, shift: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Rotational (24/7)">Rotational (24/7)</option>
                    <option value="Split Shift">Split Shift</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Skills &amp; Equipment Operating Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g. Single disc floor machine, ride-on scrubber operating, high-rise glass facade cleaning"
                    value={newReq.skills_required}
                    onChange={e => setNewReq({ ...newReq, skills_required: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Wages / Take-home (₹/mo)</label>
                  <input
                    type="number"
                    value={newReq.salary_or_wages}
                    onChange={e => setNewReq({ ...newReq, salary_or_wages: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-emerald-400 block mb-1 font-bold">Client Billing Rate (₹/mo)</label>
                  <input
                    type="number"
                    value={newReq.billing_rate}
                    onChange={e => setNewReq({ ...newReq, billing_rate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Joining Date</label>
                  <input
                    type="date"
                    value={newReq.joining_date}
                    onChange={e => setNewReq({ ...newReq, joining_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Deployment Location</label>
                  <input
                    type="text"
                    placeholder="Electronic City, Bangalore"
                    value={newReq.location}
                    onChange={e => setNewReq({ ...newReq, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Contract Period (Months)</label>
                  <input
                    type="number"
                    value={newReq.contract_period_months}
                    onChange={e => setNewReq({ ...newReq, contract_period_months: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Replacement SLA</label>
                  <input
                    type="text"
                    value={newReq.replacement_requirement}
                    onChange={e => setNewReq({ ...newReq, replacement_requirement: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  Save Manpower Demand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f1423] border border-cyan-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-5 border-b border-cyan-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-100">Update Requirement {editingReq.requirement_number}</h3>
              <button
                onClick={() => setEditingReq(null)}
                className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateReq} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingReq.company_name}
                    onChange={e => setEditingReq({ ...editingReq, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Headcount Quantity</label>
                  <input
                    type="number"
                    value={editingReq.quantity}
                    onChange={e => setEditingReq({ ...editingReq, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Status</label>
                  <select
                    value={editingReq.status}
                    onChange={e => setEditingReq({ ...editingReq, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="New">New</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Profile/Proposal Submitted">Profile/Proposal Submitted</option>
                    <option value="Client Interview">Client Interview</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Approved">Approved</option>
                    <option value="Deployment Pending">Deployment Pending</option>
                    <option value="Fulfilled">Fulfilled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Billing Rate (₹/mo)</label>
                  <input
                    type="number"
                    value={editingReq.billing_rate}
                    onChange={e => setEditingReq({ ...editingReq, billing_rate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
