import React, { useState, useMemo } from 'react';
import { 
  StockItem, GrnRecord, StockIssueRecord, UniformAllocation, MachineryAsset, 
  AppState, Role 
} from '../types';
import { 
  Package, Boxes, Plus, Search, AlertCircle, AlertOctagon, CheckCircle2, 
  Truck, ArrowDownRight, ArrowUpRight, Shirt, Wrench, Shield, RefreshCw, 
  FileText, Check, X, Filter, BarChart3, Download, Layers
} from 'lucide-react';
import { saveEntityToFirestore } from '../lib/firebaseService';

interface StoresAndInventoryViewProps {
  state: AppState;
  currentRole: Role;
  userEmail: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const StoresAndInventoryView: React.FC<StoresAndInventoryViewProps> = ({
  state,
  currentRole,
  userEmail,
  onUpdateState
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'grn' | 'issues' | 'uniforms' | 'machinery'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showCreateGrnModal, setShowCreateGrnModal] = useState(false);
  const [showIssueStockModal, setShowIssueStockModal] = useState(false);
  const [showUniformIssueModal, setShowUniformIssueModal] = useState(false);

  // New Stock Item State
  const [newItem, setNewItem] = useState<Partial<StockItem>>({
    item_code: '',
    name: '',
    category: 'Uniforms',
    unit: 'Pairs',
    unit_rate: 0,
    opening_stock: 0,
    closing_stock: 0,
    min_threshold: 10,
    location_bin: 'Rack A-1'
  });

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return (state.stockItems || []).filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ZERO' && item.closing_stock === 0) ||
        (statusFilter === 'LOW' && item.closing_stock > 0 && item.closing_stock <= item.min_threshold) ||
        (statusFilter === 'OK' && item.closing_stock > item.min_threshold);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [state.stockItems, searchTerm, categoryFilter, statusFilter]);

  // Handle Save Stock Item
  const handleSaveStockItem = () => {
    if (!newItem.name || !newItem.item_code) {
      alert('Please provide item name and item code.');
      return;
    }

    const created: StockItem = {
      id: `ITM-${Date.now().toString().slice(-6)}`,
      item_code: newItem.item_code!,
      name: newItem.name!,
      category: newItem.category || 'Uniforms',
      unit: newItem.unit || 'Nos',
      unit_rate: Number(newItem.unit_rate) || 0,
      opening_stock: Number(newItem.opening_stock) || 0,
      receipts: 0,
      issues: 0,
      adjustments: 0,
      closing_stock: Number(newItem.opening_stock) || 0,
      min_threshold: Number(newItem.min_threshold) || 10,
      total_value: (Number(newItem.opening_stock) || 0) * (Number(newItem.unit_rate) || 0),
      location: (newItem as any).location_bin || newItem.location || 'Warehouse General',
      status: (Number(newItem.opening_stock) || 0) > 0 ? 'In Stock' : 'Zero Stock',
      unit_cost: Number(newItem.unit_rate) || 0
    };

    onUpdateState(prev => ({
      ...prev,
      stockItems: [created, ...(prev.stockItems || [])]
    }));

    saveEntityToFirestore('stockItems', created.id, created);
    setShowAddStockModal(false);
  };

  // Summary Metrics
  const totalValuation = useMemo(() => {
    return (state.stockItems || []).reduce((sum, item) => sum + (item.total_value || 0), 0);
  }, [state.stockItems]);

  const zeroStockItems = useMemo(() => {
    return (state.stockItems || []).filter(item => item.closing_stock === 0);
  }, [state.stockItems]);

  const lowStockItems = useMemo(() => {
    return (state.stockItems || []).filter(item => item.closing_stock > 0 && item.closing_stock <= item.min_threshold);
  }, [state.stockItems]);

  return (
    <div id="stores-inventory-root" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-900 to-slate-850 text-white p-6 rounded-2xl shadow-lg border border-teal-600/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Boxes className="w-3 h-3" /> Central Stores & Inventory
            </span>
            <span className="text-xs text-teal-200/80">Total Items: {(state.stockItems || []).length}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Stores & Material Management</h1>
          <p className="text-teal-100/80 text-sm mt-1 max-w-2xl">
            Real-time stock ledger, Goods Receipt Notes (GRN) verification, site material issues, uniform replacement cycles, and machinery asset tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-stock-item"
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
          <button
            id="btn-issue-stock"
            onClick={() => setShowIssueStockModal(true)}
            className="px-3.5 py-2 bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-sm font-medium rounded-xl border border-teal-600/40 transition flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-300" /> Issue to Site
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total Stock Valuation</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            ₹{(totalValuation / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all categories</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          zeroStockItems.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium">Zero Stock Alert</span>
            {zeroStockItems.length > 0 && <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />}
          </div>
          <span className="text-2xl font-bold mt-1 block text-rose-600">
            {zeroStockItems.length} Items
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Immediate reorder required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Low Stock Threshold</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {lowStockItems.length} Items
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Below buffer safety limits</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Capital Machinery</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {(state.machineryAssets || []).length} Units
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">100% AMC Covered</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'stock', label: 'Stock Master & Ledger', icon: Boxes, count: (state.stockItems || []).length },
          { id: 'grn', label: 'Goods Receipt Notes (GRN)', icon: Truck, count: (state.grnRecords || []).length },
          { id: 'issues', label: 'Site Stock Issues', icon: ArrowUpRight, count: (state.stockIssues || []).length },
          { id: 'uniforms', label: 'Uniform Allocation & Cycles', icon: Shirt, count: (state.uniformAllocations || []).length },
          { id: 'machinery', label: 'Machinery & Capital Assets', icon: Wrench, count: (state.machineryAssets || []).length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-stores-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                isActive 
                  ? 'bg-teal-700 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STOCK MASTER */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-search-stock"
                type="text"
                placeholder="Search item code, material name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Uniforms">Uniforms</option>
                <option value="Shoes">Shoes</option>
                <option value="PPE">PPE</option>
                <option value="Machinery">Machinery</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Housekeeping Materials">Housekeeping</option>
                <option value="Tools">Tools</option>
                <option value="Consumables">Consumables</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="ZERO">Zero Stock Only</option>
                <option value="LOW">Low Stock (Threshold)</option>
                <option value="OK">Adequate Stock</option>
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Item Code & Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Unit Rate</th>
                    <th className="p-3.5 text-right">Opening</th>
                    <th className="p-3.5 text-right">Receipts</th>
                    <th className="p-3.5 text-right">Issues</th>
                    <th className="p-3.5 text-right font-bold">Closing Balance</th>
                    <th className="p-3.5 text-right">Min Threshold</th>
                    <th className="p-3.5 text-right">Valuation (₹)</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map(item => {
                    const isZero = item.closing_stock === 0;
                    const isLow = item.closing_stock > 0 && item.closing_stock <= item.min_threshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-medium text-slate-900">
                          <div>{item.name}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{item.item_code} • {item.location_bin}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-700">₹{item.unit_rate.toLocaleString()}</td>
                        <td className="p-3.5 text-right text-slate-600">{item.opening_stock} {item.unit}</td>
                        <td className="p-3.5 text-right text-emerald-600 font-semibold">+{item.receipts}</td>
                        <td className="p-3.5 text-right text-rose-600 font-semibold">-{item.issues}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900 text-sm">
                          {item.closing_stock} {item.unit}
                        </td>
                        <td className="p-3.5 text-right text-slate-500">{item.min_threshold} {item.unit}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900">
                          ₹{item.total_value.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          {isZero ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full border border-rose-300 animate-pulse">
                              Zero Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-300">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOODS RECEIPT NOTES (GRN) */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Goods Receipt Notes (GRN) Inspection & Inwarding</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifies vendor deliveries against Purchase Orders with physical quality inspection before updating store inventory ledger.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.grnRecords || []).map(grn => (
              <div key={grn.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-teal-900 text-teal-100 border border-teal-700/50 rounded-md">
                      {grn.id}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">PO: {grn.po_number}</span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    grn.inspection_status === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                    grn.inspection_status === 'Partially Rejected' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {grn.inspection_status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{grn.vendor_name}</h4>
                  <p className="text-xs text-slate-500">Challan / DC No: {grn.delivery_challan_no} • Date: {grn.grn_date}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="font-semibold text-slate-800">Inwarded Items:</div>
                  {(grn.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-600 border-t border-slate-200/50 pt-1 text-[11px]">
                      <span>{item.item_name} (PO: {item.quantity_ordered})</span>
                      <span className="font-bold text-emerald-700">Accepted: {item.quantity_accepted}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Inspector: <b>{grn.inspected_by}</b></span>
                  <span className="text-emerald-700 font-bold">Ledger Updated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SITE STOCK ISSUES */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Site Stock Issues & Delivery Requisitions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks material dispatches to client sites, custodial acknowledgments, and site consumption debiting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.stockIssues || []).map(issue => (
              <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {issue.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{issue.issue_date}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{issue.site_name}</h4>
                  <p className="text-xs text-slate-500">Requisition No: {issue.requisition_no}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">Dispatched Materials:</div>
                  {(issue.items || []).map((itm, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 text-[11px]">
                      <span>{itm.item_name}</span>
                      <span className="font-bold text-slate-900">{itm.quantity_issued} {itm.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Issued By: <b>{issue.issued_by}</b></span>
                  <span>Received By: <b>{issue.received_by_signature}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: UNIFORMS & 6-MONTH CYCLES */}
      {activeTab === 'uniforms' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Uniform Allocation & 6-Month Replacement Eligibility</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks mandatory security guard/housekeeping uniform issues, sizes, and automated triggers when 6 months elapse from last issue date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(state.uniformAllocations || []).map(ua => {
              const daysUntilDue = Math.ceil((new Date(ua.replacement_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntilDue <= 0;

              return (
                <div key={ua.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{ua.employee_id}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      isOverdue ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isOverdue ? 'Replacement Overdue!' : `${daysUntilDue}d to cycle`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ua.employee_name}</h4>
                    <p className="text-xs text-slate-500">{ua.site_name}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Uniform Type:</span>
                      <span className="font-semibold text-slate-800">{ua.uniform_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size & Set:</span>
                      <span className="font-semibold text-slate-800">{ua.size} (Qty: {ua.quantity})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Issued:</span>
                      <span className="text-slate-700">{ua.issue_date}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-semibold">Replacement Due:</span>
                      <span className="font-bold text-rose-600">{ua.replacement_due_date}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => alert(`Issuing fresh uniform replacement for ${ua.employee_name}...`)}
                      className="w-full py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Issue Replacement Set
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: MACHINERY & ASSETS */}
      {activeTab === 'machinery' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Capital Machinery & Cleaning Assets Tracker</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registers heavy scrubbing machines, vacuum cleaners, and high-pressure washers with AMC vendor links and preventive maintenance schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(state.machineryAssets || []).map(m => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 font-mono">{m.asset_code}</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    m.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{m.machine_name}</h4>
                  <p className="text-xs text-slate-500">Make: {m.make_model} (S/N: {m.serial_number})</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Site:</span>
                    <span className="font-semibold text-slate-800">{m.current_site}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AMC Vendor:</span>
                    <span className="text-slate-700">{m.amc_vendor}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-1">
                    <span className="text-slate-500">Next Maintenance:</span>
                    <span className="font-semibold text-emerald-700">{m.next_maintenance_due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD STOCK ITEM */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Stock SKU</h3>
              <button onClick={() => setShowAddStockModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Item Code / SKU *</label>
                <input
                  type="text"
                  value={newItem.item_code}
                  onChange={e => setNewItem({ ...newItem, item_code: e.target.value })}
                  placeholder="e.g. UNIF-SEC-L"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Material Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Security Guard Safari Suit - Navy Blue"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Uniforms">Uniforms</option>
                  <option value="Shoes">Shoes</option>
                  <option value="PPE">PPE</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Housekeeping Materials">Housekeeping</option>
                  <option value="Tools">Tools</option>
                  <option value="Consumables">Consumables</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="Pairs / Nos / Ltrs"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Unit Rate (₹)</label>
                <input
                  type="number"
                  value={newItem.unit_rate || ''}
                  onChange={e => setNewItem({ ...newItem, unit_rate: Number(e.target.value) })}
                  placeholder="e.g. 1250"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Opening Stock Qty</label>
                <input
                  type="number"
                  value={newItem.opening_stock || ''}
                  onChange={e => setNewItem({ ...newItem, opening_stock: Number(e.target.value) })}
                  placeholder="e.g. 100"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Safety Min Threshold Qty</label>
                <input
                  type="number"
                  value={newItem.min_threshold || ''}
                  onChange={e => setNewItem({ ...newItem, min_threshold: Number(e.target.value) })}
                  placeholder="e.g. 25"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddStockModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStockItem}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Save SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
