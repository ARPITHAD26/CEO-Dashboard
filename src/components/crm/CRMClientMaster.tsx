import React, { useState } from 'react';
import { CRMClientMaster, AppState } from '../../types';
import { 
  Plus, Search, Building2, User, Phone, Mail, 
  MapPin, Calendar, DollarSign, Users, ShieldCheck, 
  Clock, AlertTriangle, CheckCircle2, Edit2, X, FileText, Check
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddClient: (client: CRMClientMaster) => void;
  onUpdateClient: (client: CRMClientMaster) => void;
}

export const CRMClientMasterView: React.FC<Props> = ({
  state,
  onAddClient,
  onUpdateClient
}) => {
  const clients = state.crmClients || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CRMClientMaster | null>(null);

  const [newClient, setNewClient] = useState<Partial<CRMClientMaster>>({
    company_name: '',
    industry: 'Information Technology',
    group_name: '',
    gstin: '',
    pan: '',
    billing_address: 'Bangalore, Karnataka',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    contract_start: new Date().toISOString().split('T')[0],
    contract_end: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    total_deployed_manpower: 50,
    monthly_billing_value: 1200000,
    payment_terms_days: 30,
    account_manager: 'Vikram Singh',
    status: 'Active'
  });

  const totalMonthlyBilling = clients.filter(c => c.status === 'Active').reduce((acc, c) => acc + (c.monthly_billing_value || 0), 0);
  const totalDeployedPax = clients.filter(c => c.status === 'Active').reduce((acc, c) => acc + (c.total_deployed_manpower || 0), 0);

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.company_name || !newClient.contact_person) {
      alert('Company Name and Contact Person are required.');
      return;
    }

    const clientCode = `SIS-CL-${String(clients.length + 1).padStart(3, '0')}`;
    const clientRecord: CRMClientMaster = {
      id: `CLM-${Date.now()}`,
      client_code: clientCode,
      company_name: newClient.company_name || '',
      industry: newClient.industry || 'General',
      group_name: newClient.group_name || '',
      gstin: newClient.gstin || '',
      pan: newClient.pan || '',
      billing_address: newClient.billing_address || '',
      contact_person: newClient.contact_person || '',
      contact_phone: newClient.contact_phone || '',
      contact_email: newClient.contact_email || '',
      contract_start: newClient.contract_start || new Date().toISOString().split('T')[0],
      contract_end: newClient.contract_end || '',
      total_deployed_manpower: Number(newClient.total_deployed_manpower) || 0,
      monthly_billing_value: Number(newClient.monthly_billing_value) || 0,
      payment_terms_days: Number(newClient.payment_terms_days) || 30,
      account_manager: newClient.account_manager || 'Operations Lead',
      status: (newClient.status as any) || 'Active'
    };

    onAddClient(clientRecord);
    setNewClient({
      company_name: '',
      industry: 'Information Technology',
      group_name: '',
      gstin: '',
      pan: '',
      billing_address: 'Bangalore, Karnataka',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      contract_start: new Date().toISOString().split('T')[0],
      contract_end: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      total_deployed_manpower: 50,
      monthly_billing_value: 1200000,
      payment_terms_days: 30,
      account_manager: 'Vikram Singh',
      status: 'Active'
    });
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    onUpdateClient(editingClient);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6 bg-sky-50/60 border border-sky-200/80 p-6 rounded-3xl shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-sky-950 flex items-center gap-2">
            <span>Client Master &amp; Key Account Repository</span>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-mono text-xs font-bold border border-sky-300">
              {clients.length} Master Accounts
            </span>
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Comprehensive account directory, deployed headcount records, monthly revenue billing, and contract validity terms.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Master</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>ACTIVE ACCOUNTS</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-mono font-black text-sky-950">
            {clients.filter(c => c.status === 'Active').length} <span className="text-xs font-normal text-slate-500">Clients</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {clients.filter(c => c.status === 'Under Renewal').length} under contract renewal
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>TOTAL DEPLOYED WORKFORCE</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-black text-blue-900">
            {totalDeployedPax} <span className="text-xs font-normal text-slate-500">Personnel</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Active on-site blue-collar &amp; staff
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>MONTHLY MRR BILLING</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-700">
            ₹{(totalMonthlyBilling / 100000).toFixed(2)} L/mo
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Recurring facility management revenue
          </div>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-2xl space-y-1.5 hover:border-sky-400 hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>AVG PAYMENT TERMS</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-700">
            30 Days <span className="text-xs font-normal text-slate-500">Credit</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Contractual invoice settlement cycle
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Client Code, Company, Contact, Industry..."
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
          <option value="All">All Accounts ({clients.length})</option>
          <option value="Active">Active ({clients.filter(c => c.status === 'Active').length})</option>
          <option value="Under Renewal">Under Renewal</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Client Master List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map(c => (
          <div key={c.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-2xl space-y-3 transition">
            <div className="flex items-start justify-between gap-2 border-b border-sky-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="font-bold text-sky-700">{c.client_code}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-semibold">{c.industry}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{c.company_name}</h4>
                {c.gstin && (
                  <span className="text-[10px] font-mono text-slate-500">GST: {c.gstin}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                  'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {c.status}
                </span>
                <button
                  onClick={() => setEditingClient(c)}
                  className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 cursor-pointer transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-sky-50/70 rounded-xl space-y-1 border border-sky-100">
                <span className="text-[10px] font-mono text-sky-800 uppercase font-bold block">Contact Person</span>
                <p className="text-slate-900 font-bold">{c.contact_person}</p>
                <div className="text-[10px] text-slate-600">{c.contact_phone} • {c.contact_email}</div>
              </div>

              <div className="p-3 bg-sky-50/70 rounded-xl space-y-1 border border-sky-100">
                <span className="text-[10px] font-mono text-sky-800 uppercase font-bold block">Account Manager</span>
                <p className="text-sky-900 font-bold">{c.account_manager}</p>
                <div className="text-[10px] text-slate-600">Credit: {c.payment_terms_days} Days</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-sky-50/40 rounded-xl border border-sky-100 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block">Deployed Manpower</span>
                <div className="font-mono font-bold text-slate-900 text-sm">{c.total_deployed_manpower} Pax</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">Monthly Billing</span>
                <div className="font-mono font-bold text-emerald-700 text-sm">₹{(c.monthly_billing_value / 100000).toFixed(2)} L/mo</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>Contract: {c.contract_start} → {c.contract_end}</span>
              <span>{c.billing_address}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CLIENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 flex items-center justify-between text-white">
              <h3 className="text-base font-bold">Add New Master Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.company_name}
                    onChange={e => setNewClient({ ...newClient, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={newClient.industry}
                    onChange={e => setNewClient({ ...newClient, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Group / Parent Company</label>
                  <input
                    type="text"
                    value={newClient.group_name}
                    onChange={e => setNewClient({ ...newClient, group_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newClient.gstin}
                    onChange={e => setNewClient({ ...newClient, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={newClient.pan}
                    onChange={e => setNewClient({ ...newClient, pan: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Billing &amp; Registered Address</label>
                  <input
                    type="text"
                    value={newClient.billing_address}
                    onChange={e => setNewClient({ ...newClient, billing_address: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Key Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newClient.contact_person}
                    onChange={e => setNewClient({ ...newClient, contact_person: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newClient.contact_phone}
                    onChange={e => setNewClient({ ...newClient, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newClient.contact_email}
                    onChange={e => setNewClient({ ...newClient, contact_email: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Account Manager</label>
                  <input
                    type="text"
                    value={newClient.account_manager}
                    onChange={e => setNewClient({ ...newClient, account_manager: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Total Deployed Manpower</label>
                  <input
                    type="number"
                    value={newClient.total_deployed_manpower}
                    onChange={e => setNewClient({ ...newClient, total_deployed_manpower: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Billing Value (₹)</label>
                  <input
                    type="number"
                    value={newClient.monthly_billing_value}
                    onChange={e => setNewClient({ ...newClient, monthly_billing_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Credit Terms (Days)</label>
                  <input
                    type="number"
                    value={newClient.payment_terms_days}
                    onChange={e => setNewClient({ ...newClient, payment_terms_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={newClient.status}
                    onChange={e => setNewClient({ ...newClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Renewal">Under Renewal</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-sky-300 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 flex items-center justify-between text-white">
              <h3 className="text-base font-bold">Edit Client: {editingClient.company_name}</h3>
              <button onClick={() => setEditingClient(null)} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.company_name}
                    onChange={e => setEditingClient({ ...editingClient, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingClient.contact_person}
                    onChange={e => setEditingClient({ ...editingClient, contact_person: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingClient.contact_phone}
                    onChange={e => setEditingClient({ ...editingClient, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Deployed Manpower</label>
                  <input
                    type="number"
                    value={editingClient.total_deployed_manpower}
                    onChange={e => setEditingClient({ ...editingClient, total_deployed_manpower: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Billing (₹)</label>
                  <input
                    type="number"
                    value={editingClient.monthly_billing_value}
                    onChange={e => setEditingClient({ ...editingClient, monthly_billing_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingClient.status}
                    onChange={e => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-sky-50/40 border border-sky-200 rounded-xl text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Renewal">Under Renewal</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
