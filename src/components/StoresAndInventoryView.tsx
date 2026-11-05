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
  const [issueError, setIssueError] = useState('');
  const [issueForm, setIssueForm] = useState({
    itemId: '',
    siteId: '',
    employeeName: '',
    department: '',
    quantity: 1,
    receiverSignature: ''
  });

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
    location: 'Rack A-1'
  });

  const stockItems = Array.isArray(state.stockItems)
    ? state.stockItems.filter(item => item && typeof item === 'object')
    : [];

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter(item => {
      const searchableText = [item.name, item.item_code, item.category]
        .map(value => String(value || '').toLowerCase())
        .join(' ');
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ZERO' && Number(item.closing_stock) === 0) ||
        (statusFilter === 'LOW' && Number(item.closing_stock) > 0 && Number(item.closing_stock) <= Number(item.min_threshold)) ||
        (statusFilter === 'OK' && Number(item.closing_stock) > Number(item.min_threshold));
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stockItems, searchTerm, categoryFilter, statusFilter]);

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
      location: newItem.location || 'Warehouse General',
      status: (Number(newItem.opening_stock) || 0) > 0 ? 'In Stock' : 'Zero Stock',
      unit_cost: Number(newItem.unit_rate) || 0
    };

    onUpdateState(prev => ({
      ...prev,
      stockItems: [created, ...(prev.stockItems || [])]
    }));

    setShowAddStockModal(false);
  };

  const handleIssueStock = () => {
    const item = stockItems.find(stockItem => stockItem.id === issueForm.itemId);
    const quantity = Number(issueForm.quantity);
    if (!item || !issueForm.siteId || !issueForm.employeeName.trim() || !issueForm.receiverSignature.trim() ||
      !Number.isFinite(quantity) || quantity <= 0 || quantity > Number(item.closing_stock)) {
      setIssueError('Select an item and site, enter recipient details, and use a quantity available in stock.');
      return;
    }

    const site = (state.sites || []).find(candidate => candidate.id === issueForm.siteId);
    const nextClosing = Number(item.closing_stock) - quantity;
    const unitRate = Number(item.unit_rate ?? item.unit_cost) || 0;
    const issue: StockIssueRecord = {
      id: `ISS-${Date.now()}`,
      issue_number: `ISS/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().slice(0, 10),
      employee_id: '',
      employee_name: issueForm.employeeName.trim(),
      department: issueForm.department.trim() || 'Operations',
      site_id: issueForm.siteId,
      site_name: site?.name || 'Selected site',
      item_id: item.id,
      item_name: item.name,
      quantity,
      authorised_by: userEmail || currentRole,
      receiver_signature: issueForm.receiverSignature.trim(),
      status: 'Issued'
    };

    onUpdateState(prev => ({
      ...prev,
      stockItems: (prev.stockItems || []).map(stockItem => stockItem.id === item.id
        ? {
            ...stockItem,
            closing_stock: nextClosing,
            issues: (Number(stockItem.issues) || 0) + quantity,
            total_value: nextClosing * unitRate,
            status: nextClosing === 0 ? 'Zero Stock' : nextClosing <= Number(stockItem.min_threshold) ? 'Low Stock' : 'In Stock'
          }
        : stockItem),
      stockIssues: [issue, ...(prev.stockIssues || [])]
    }));

    setIssueForm({ itemId: '', siteId: '', employeeName: '', department: '', quantity: 1, receiverSignature: '' });
    setIssueError('');
    setShowIssueStockModal(false);
  };

  // Summary Metrics
  const totalValuation = useMemo(() => {
    return stockItems.reduce((sum, item) => {
      const unitRate = Number(item.unit_rate ?? item.unit_cost) || 0;
      const quantity = Number(item.closing_stock) || 0;
      return sum + (Number(item.total_value) || quantity * unitRate);
    }, 0);
  }, [stockItems]);

  const zeroStockItems = useMemo(() => {
    return stockItems.filter(item => Number(item.closing_stock) === 0);
  }, [stockItems]);

  const lowStockItems = useMemo(() => {
    return stockItems.filter(item => Number(item.closing_stock) > 0 && Number(item.closing_stock) <= Number(item.min_threshold));
  }, [stockItems]);

  return (
    <div id="stores-inventory-root" className="space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-teal-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-10 -top-20 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-400/10 text-emerald-200 border border-emerald-300/20 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" /> CENTRAL STORES
            </span>
            <span className="text-xs text-cyan-100/70">{stockItems.length} inventory items</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stores & Material Ledger</h1>
          <p className="text-cyan-100/75 text-sm mt-2 max-w-2xl leading-relaxed">
            Real-time stock ledger, Goods Receipt Notes (GRN) verification, site material issues, uniform replacement cycles, and machinery asset tracking.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-stock-item"
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
          <button
            id="btn-issue-stock"
            onClick={() => {
              setIssueError('');
              setShowIssueStockModal(true);
            }}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl border border-white/15 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-300" /> Issue to Site
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">TOTAL STOCK VALUATION</span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            ₹{(totalValuation / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all categories</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          zeroStockItems.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium">Zero Stock Alert</span>
            {zeroStockItems.length > 0 && <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />}
          </div>
          <span className="text-2xl font-bold mt-2 block text-rose-600">
            {zeroStockItems.length} Items
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Immediate reorder required</span>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">LOW STOCK THRESHOLD</span>
          <span className="text-2xl font-bold text-amber-600 mt-2 block">
            {lowStockItems.length} Items
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Below buffer safety limits</span>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">CAPITAL MACHINERY</span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            {(state.machineryAssets || []).length} Units
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Tracked assets</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          { id: 'stock', label: 'Stock Ledger', icon: Boxes, count: stockItems.length },
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
              aria-pressed={isActive}
              className={`shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                isActive 
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-white/10 text-teal-100' : 'bg-slate-100 text-slate-500'
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="input-search-stock"
                type="text"
                placeholder="Search item code, material name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
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
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
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
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
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
                    const closingStock = Number(item.closing_stock) || 0;
                    const minThreshold = Number(item.min_threshold) || 0;
                    const unitRate = Number(item.unit_rate ?? item.unit_cost) || 0;
                    const totalValue = Number(item.total_value) || closingStock * unitRate;
                    const isZero = closingStock === 0;
                    const isLow = closingStock > 0 && closingStock <= minThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-medium text-slate-900">
                          <div>{item.name || 'Unnamed item'}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{item.item_code || 'No SKU'} • {item.location || item.location_bin || 'Location not set'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                            {item.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-700">₹{unitRate.toLocaleString()}</td>
                        <td className="p-3.5 text-right text-slate-600">{Number(item.opening_stock) || 0} {item.unit || ''}</td>
                        <td className="p-3.5 text-right text-emerald-600 font-semibold">+{Number(item.receipts) || 0}</td>
                        <td className="p-3.5 text-right text-rose-600 font-semibold">-{Number(item.issues) || 0}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900 text-sm">
                          {closingStock} {item.unit || ''}
                        </td>
                        <td className="p-3.5 text-right text-slate-500">{minThreshold} {item.unit || ''}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900">
                          ₹{totalValue.toLocaleString()}
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
                  {filteredStock.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-14 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Package className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No inventory items found</p>
                        <p className="mt-1 text-xs text-slate-500">Try changing your filters or add a new stock item.</p>
                      </td>
                    </tr>
                  )}
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
                      {grn.grn_number || grn.id}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">PO: {grn.po_number || '—'}</span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    grn.inspection_status === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                    grn.inspection_status === 'Passed with Deviation' || grn.inspection_status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {grn.inspection_status || 'Pending'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{grn.vendor_name || 'Vendor not specified'}</h4>
                  <p className="text-xs text-slate-500">
                    Challan / DC No: {grn.dc_number || '—'} • Received: {grn.receipt_date || '—'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="font-semibold text-slate-800">Inwarded Items:</div>
                  <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/50 pt-1 text-[11px]">
                    <span>{grn.item_name || 'Unspecified item'} (Ordered: {Number(grn.quantity_ordered) || 0})</span>
                    <span className="font-bold text-emerald-700">
                      Accepted: {Number(grn.quantity_accepted) || 0} / Received: {Number(grn.quantity_received) || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Inspector: <b>{grn.inspector_name || 'Not assigned'}</b></span>
                  <span className={`font-bold ${grn.stores_entered ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {grn.stores_entered ? 'Ledger Updated' : 'Pending Inwarding'}
                  </span>
                </div>
              </div>
            ))}
            {(state.grnRecords || []).length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <Truck className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No goods receipts recorded</p>
                <p className="mt-1 text-xs text-slate-500">Goods Receipt Notes will appear here when available.</p>
              </div>
            )}
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
                    {issue.issue_number || issue.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{issue.date || '—'}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{issue.site_name || 'Site not specified'}</h4>
                  <p className="text-xs text-slate-500">{issue.department || 'Department not specified'} • {issue.employee_name || 'Employee not specified'}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">Dispatched Materials:</div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>{issue.item_name || 'Unspecified item'}</span>
                    <span className="font-bold text-slate-900">{Number(issue.quantity) || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Authorized By: <b>{issue.authorised_by || '—'}</b></span>
                  <span>Received By: <b>{issue.receiver_signature || '—'}</b></span>
                </div>
              </div>
            ))}
            {(state.stockIssues || []).length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <ArrowUpRight className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No site stock issues recorded</p>
                <p className="mt-1 text-xs text-slate-500">Material dispatch records will appear here.</p>
              </div>
            )}
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
                      {ua.status === 'Returned' ? 'Returned' : isOverdue ? 'Replacement Overdue!' : `${daysUntilDue}d to cycle`}
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
                      <span className="font-semibold text-slate-800">{ua.size} (Qty: {Number(ua.quantity_issued) || 0})</span>
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
                      disabled={ua.status === 'Returned'}
                    >
                      {ua.status === 'Returned' ? 'Allocation Returned' : 'Issue Replacement Set'}
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
                  <span className="text-xs font-bold text-slate-500 font-mono">{m.asset_id || m.id}</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    m.condition === 'Operational' ? 'bg-emerald-100 text-emerald-800' :
                    m.condition === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {m.condition || 'Status unknown'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{m.equipment_name || 'Unnamed equipment'}</h4>
                  <p className="text-xs text-slate-500">
                    {m.make || 'Make unknown'} {m.model || ''} {m.serial_number ? `(S/N: ${m.serial_number})` : ''}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Site:</span>
                    <span className="font-semibold text-slate-800">{m.current_location || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AMC Vendor:</span>
                    <span className="text-slate-700">{m.amc_vendor || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-1">
                    <span className="text-slate-500">Next Maintenance:</span>
                    <span className="font-semibold text-emerald-700">{m.next_maintenance_due || 'Not scheduled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchase Value:</span>
                    <span className="font-semibold text-slate-800">₹{(Number(m.purchase_value) || 0).toLocaleString()}</span>
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

      {showIssueStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Inventory movement</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Issue materials to a site</h3>
                <p className="mt-1 text-sm text-slate-500">The issue record and stock balance update together.</p>
              </div>
              <button onClick={() => setShowIssueStockModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close issue form">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                Stock item
                <select
                  value={issueForm.itemId}
                  onChange={event => setIssueForm({ ...issueForm, itemId: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
                >
                  <option value="">Select an item</option>
                  {stockItems.filter(item => Number(item.closing_stock) > 0).map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.closing_stock} {item.unit})</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Destination site
                <select
                  value={issueForm.siteId}
                  onChange={event => setIssueForm({ ...issueForm, siteId: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
                >
                  <option value="">Select a site</option>
                  {(state.sites || []).map(site => (
                    <option key={site.id} value={site.id}>{site.name || site.id}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Recipient name
                <input
                  value={issueForm.employeeName}
                  onChange={event => setIssueForm({ ...issueForm, employeeName: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"
                  placeholder="Name of receiving employee"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Department
                <input
                  value={issueForm.department}
                  onChange={event => setIssueForm({ ...issueForm, department: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"
                  placeholder="Operations"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Quantity
                <input
                  type="number"
                  min="1"
                  value={issueForm.quantity}
                  onChange={event => setIssueForm({ ...issueForm, quantity: Number(event.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Receiver acknowledgment
                <input
                  value={issueForm.receiverSignature}
                  onChange={event => setIssueForm({ ...issueForm, receiverSignature: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"
                  placeholder="Name or acknowledgment"
                />
              </label>
            </div>

            {issueError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{issueError}</p>}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => setShowIssueStockModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleIssueStock} className="rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700">
                Confirm Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
