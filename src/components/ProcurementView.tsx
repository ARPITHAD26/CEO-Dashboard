import { useState, FormEvent } from 'react';
import { AppState, PurchaseOrder, PurchaseRequest, Vendor, Task, Role } from '../types';
import { logAuditEntry, saveState } from '../data/store';
import { 
  ShoppingBag, Sliders, PlusCircle, CheckCircle, Trash2, 
  Edit2, Download, AlertTriangle, FileText, UserCheck, RefreshCw,
  Briefcase, Boxes, CheckSquare, Layers, Search, Maximize2, Sparkles, X
} from 'lucide-react';
import { StoresAndInventoryView } from './StoresAndInventoryView';
import { ProcurementTeamTaskView } from './ProcurementTeamTaskView';
import { ProcurementMasterDataView } from './ProcurementMasterDataView';

interface ProcurementViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
  currentRole?: Role;
}

export default function ProcurementView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName,
  currentRole = 'Procurement Head'
}: ProcurementViewProps) {
  const allTabs: { id: 'requests' | 'stores' | 'teamtasks' | 'vendors' | 'tasks' | 'master-data'; label: string; icon: any }[] = [
    { id: 'requests', label: 'Purchase Indents & 3-Way Match', icon: ShoppingBag },
    { id: 'stores', label: 'Stores & Material Ledger', icon: Boxes },
    { id: 'teamtasks', label: 'Team Daily Tasks & EOD', icon: CheckSquare },
    { id: 'vendors', label: 'Registered Vendors', icon: UserCheck },
    { id: 'tasks', label: 'Assigned System Tasks', icon: Layers },
    { id: 'master-data', label: 'Master Data', icon: Sliders }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'requests';

  const [prForm, setPrForm] = useState<Partial<PurchaseRequest>>({
    request_no: '', item: '', quantity: 1, estimated_cost: 0, vendor_id: '', amc_status: 'None', remarks: ''
  });
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({
    name: '', performance_score: 90, amc_due_date: ''
  });
  const [editingPrId, setEditingPrId] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'stores' | 'teamtasks' | 'vendors' | 'tasks' | 'master-data'>(defaultTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [purchaseOrderError, setPurchaseOrderError] = useState('');
  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    indentRequestId: '',
    poNumber: '',
    vendorId: '',
    poDate: new Date().toISOString().slice(0, 10),
    itemName: '',
    category: 'Consumables',
    quantity: 1,
    rate: 0,
    taxPct: 0,
    deliveryLocation: '',
    expectedDeliveryDate: '',
    paymentTerms: '',
    warranty: '',
    approvalStatus: 'Approval' as PurchaseOrder['status'],
    approvedBy: '',
    documentUrl: ''
  });

  // Stats
  const totalPRs = state.purchaseRequests.length;
  const pendingPRs = state.purchaseRequests.filter(pr => pr.approval_status === 'Pending').length;
  const avgPerformance = state.vendors.length > 0 
    ? Math.round(state.vendors.reduce((sum, v) => sum + v.performance_score, 0) / state.vendors.length) 
    : 100;

  // PR Form Submit
  const handlePrSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prForm.item || !prForm.estimated_cost) return;

    let updatedPRs = [...state.purchaseRequests];
    const isEdit = !!editingPrId;
    const prId = editingPrId || `PR-${Date.now()}`;

    const newPr: PurchaseRequest = {
      id: prId,
      request_no: prForm.request_no || `SIS-PR-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().split('T')[0],
      department: 'Procurement',
      item: prForm.item,
      quantity: Number(prForm.quantity) || 1,
      vendor_id: prForm.vendor_id || 'V-101',
      estimated_cost: Number(prForm.estimated_cost) || 0,
      approval_status: prForm.approval_status || 'Pending',
      po_number: prForm.po_number || '',
      delivery_date: prForm.delivery_date || '',
      amc_status: prForm.amc_status as any || 'None',
      remarks: prForm.remarks || ''
    };

    if (isEdit) {
      updatedPRs = updatedPRs.map(pr => pr.id === prId ? newPr : pr);
      setEditingPrId(null);
    } else {
      updatedPRs.push(newPr);
    }

    const nextState = { ...state, purchaseRequests: updatedPRs };
    logAuditEntry(
      nextState,
      currentUserEmail,
      isEdit ? 'UPDATE' : 'CREATE',
      'PurchaseRequest',
      prId,
      isEdit ? 'Modified item' : 'Raised new purchase request',
      JSON.stringify(newPr)
    );

    onUpdateState(nextState);
    setPrForm({ request_no: '', item: '', quantity: 1, estimated_cost: 0, vendor_id: '', amc_status: 'None', remarks: '' });
    triggerSuccess(`Purchase Request ${isEdit ? 'updated' : 'created'} successfully!`);
  };

  // Vendor Form Submit
  const handleVendorSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return;

    let updatedVendors = [...state.vendors];
    const isEdit = !!editingVendorId;
    const vId = editingVendorId || `V-${Date.now()}`;

    const newVendor: Vendor = {
      id: vId,
      name: vendorForm.name,
      performance_score: Number(vendorForm.performance_score) || 90,
      amc_due_date: vendorForm.amc_due_date || ''
    };

    if (isEdit) {
      updatedVendors = updatedVendors.map(v => v.id === vId ? newVendor : v);
      setEditingVendorId(null);
    } else {
      updatedVendors.push(newVendor);
    }

    const nextState = { ...state, vendors: updatedVendors };
    logAuditEntry(
      nextState,
      currentUserEmail,
      isEdit ? 'UPDATE' : 'CREATE',
      'Vendor',
      vId,
      isEdit ? 'Updated vendor' : 'Created vendor partner',
      JSON.stringify(newVendor)
    );

    onUpdateState(nextState);
    setVendorForm({ name: '', performance_score: 90, amc_due_date: '' });
    triggerSuccess(`Vendor partner ${isEdit ? 'updated' : 'registered'} successfully!`);
  };

  // Delete handlers
  const deletePr = (id: string) => {
    const nextState = { ...state, purchaseRequests: state.purchaseRequests.filter(pr => pr.id !== id) };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'PurchaseRequest', id, 'Deleted PR');
    onUpdateState(nextState);
    triggerSuccess('Purchase Request removed.');
  };

  const deleteVendor = (id: string) => {
    const nextState = { ...state, vendors: state.vendors.filter(v => v.id !== id) };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Vendor', id, 'Deleted Vendor');
    onUpdateState(nextState);
    triggerSuccess('Vendor partner deleted.');
  };

  // Approve PR Action (Simulates quick workflow action)
  const quickApprovePr = (pr: PurchaseRequest) => {
    const nextPRs = state.purchaseRequests.map(item => {
      if (item.id === pr.id) {
        return { 
          ...item, 
          approval_status: 'Approved' as const,
          po_number: item.po_number || `SIS-PO-${Math.floor(Math.random() * 9000 + 1000)}`
        };
      }
      return item;
    });
    const nextState = { ...state, purchaseRequests: nextPRs };
    logAuditEntry(nextState, currentUserEmail, 'UPDATE', 'PurchaseRequest', pr.id, 'Quick approved & issued PO');
    onUpdateState(nextState);
    triggerSuccess(`PR Approved and Purchase Order issued!`);
  };

  const handlePurchaseOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    const vendor = state.vendors.find(candidate => candidate.id === purchaseOrderForm.vendorId);
    const quantity = Number(purchaseOrderForm.quantity);
    const rate = Number(purchaseOrderForm.rate);
    const taxPct = Number(purchaseOrderForm.taxPct);
    if (!vendor || !purchaseOrderForm.itemName.trim() || !purchaseOrderForm.deliveryLocation.trim() ||
      !purchaseOrderForm.expectedDeliveryDate || !purchaseOrderForm.paymentTerms.trim() ||
      !Number.isFinite(quantity) || quantity <= 0 ||
      !Number.isFinite(rate) || rate < 0 ||
      !Number.isFinite(taxPct) || taxPct < 0) {
      setPurchaseOrderError('Complete the required vendor, item, quantity, delivery, and commercial fields.');
      return;
    }

    const subtotal = quantity * rate;
    const taxes = subtotal * taxPct / 100;
    const po: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      indent_request_id: purchaseOrderForm.indentRequestId || undefined,
      po_number: purchaseOrderForm.poNumber.trim() || `SIS-PO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      po_date: purchaseOrderForm.poDate,
      items: [{
        item_name: purchaseOrderForm.itemName.trim(),
        category: purchaseOrderForm.category,
        quantity,
        rate,
        tax_pct: taxPct,
        amount: subtotal + taxes
      }],
      subtotal,
      taxes,
      total_value: subtotal + taxes,
      delivery_location: purchaseOrderForm.deliveryLocation.trim(),
      expected_delivery_date: purchaseOrderForm.expectedDeliveryDate,
      payment_terms: purchaseOrderForm.paymentTerms.trim(),
      warranty: purchaseOrderForm.warranty.trim() || 'Not specified',
      status: purchaseOrderForm.approvalStatus,
      payment_status: 'Under Verification',
      approved_by: purchaseOrderForm.approvalStatus === 'Released'
        ? purchaseOrderForm.approvedBy.trim() || currentUserEmail
        : purchaseOrderForm.approvedBy.trim() || 'Pending',
      document_url: purchaseOrderForm.documentUrl.trim() || undefined
    };

    let purchaseRequests = state.purchaseRequests;
    if (po.indent_request_id) {
      purchaseRequests = purchaseRequests.map(request => request.id === po.indent_request_id
        ? { ...request, po_number: po.po_number, delivery_date: po.expected_delivery_date }
        : request);
    }
    const nextState = {
      ...state,
      purchaseRequests,
      purchaseOrders: [po, ...(state.purchaseOrders || [])]
    };
    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'PurchaseOrder', po.id, 'Created purchase order', JSON.stringify(po));
    onUpdateState(nextState);
    setPurchaseOrderForm({
      indentRequestId: '',
      poNumber: '',
      vendorId: '',
      poDate: new Date().toISOString().slice(0, 10),
      itemName: '',
      category: 'Consumables',
      quantity: 1,
      rate: 0,
      taxPct: 0,
      deliveryLocation: '',
      expectedDeliveryDate: '',
      paymentTerms: '',
      warranty: '',
      approvalStatus: 'Approval',
      approvedBy: '',
      documentUrl: ''
    });
    setPurchaseOrderError('');
    setIsPurchaseOrderModalOpen(false);
    triggerSuccess(`Purchase order ${po.po_number} created.`);
  };

  // Task updater
  const updateTaskProgress = (taskId: string, pct: number) => {
    const nextTasks = state.tasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          percent_completed: pct, 
          status: pct === 100 ? ('Completed' as const) : ('In Progress' as const) 
        };
      }
      return t;
    });
    const nextState = { ...state, tasks: nextTasks };
    onUpdateState(nextState);
    triggerSuccess('Task progress updated.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filter tasks
  const myTasks = state.tasks.filter(t => t.department === 'Procurement' || (t.assigned_to || '').toLowerCase().includes('procurement'));

  return (
    <div className="space-y-6">

      {/* Full-Screen HD Photo Modal */}
      {isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Executive Portrait</h3>
                  <p className="text-[10.5px] text-slate-400 font-mono">Official Corporate Leadership Photograph</p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High Definition Image Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-black shadow-inner flex items-center justify-center min-h-[380px] max-h-[520px]">
              <img 
                src="/procurement-head-profile.jpg?v=20261106"
                alt="Procurement Head - Executive Portrait" 
                className="w-full max-h-[500px] object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/40 text-[9.5px] font-mono text-cyan-300 font-bold flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ORIGINAL HD • 768 × 813</span>
              </div>
            </div>

            {/* Executive Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Designation</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">Procurement Head</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Department</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">Procurement & Supply</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Active Indents</div>
                <div className="font-bold text-cyan-400 mt-0.5 truncate">{totalPRs} Total ({pendingPRs} Pending)</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Vendor Rating</div>
                <div className="font-bold text-emerald-400 mt-0.5 truncate">{avgPerformance}% Avg</div>
              </div>
            </div>

            {/* Footer with Details & Download */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-slate-200 font-bold">Scope:</span> Indents, 3-Way Match, Vendor SLA & Material Ledger
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/procurement-head-profile.jpg?v=20261106"
                  download="Spoorthy_Procurement_Head_Portrait_HD.jpg"
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HD</span>
                </a>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Procurement Executive Header */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 text-slate-900 p-6 rounded-3xl shadow-xl border border-pink-200 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Procurement Head HD Photo Frame */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => setIsPhotoModalOpen(true)} 
            title="Click to view full HD portrait of Procurement Head"
          >
            {/* Outer decorative glowing ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 opacity-75 group-hover:opacity-100 blur-sm transition duration-300" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/90 shadow-xl bg-slate-900">
              <img 
                src="/procurement-head-profile.jpg?v=20261106"
                alt="Procurement Head" 
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                loading="eager"
              />
              
              {/* Hover overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-[2px]">
                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">View HD</span>
              </div>

              {/* HD Badge indicator */}
              <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-amber-300 border border-amber-400/40 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                <span>HD</span>
              </div>
            </div>

            {/* Online pulse indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/70 text-slate-800 border border-pink-200 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-pink-700" /> Procurement & Supply
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Purchase Requests: {totalPRs}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>Procurement Head</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 font-sans tracking-normal bg-white/60 px-2.5 py-1 rounded-lg border border-pink-200">
                Supply Chain Control Tower
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveSubTab('requests')}
            className="px-4 py-2 bg-white/70 hover:bg-white border border-pink-200 text-slate-800 text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-pink-700" /> New Indent / Request
          </button>
          <button
            onClick={() => setActiveSubTab('tenders')}
            className="px-3.5 py-2 bg-white/70 hover:bg-white text-slate-800 text-xs font-bold rounded-2xl border border-pink-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Briefcase className="w-4 h-4 text-pink-700" /> Tender Lifecycle
          </button>
        </div>
      </div>
      
      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-sky-200 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">TOTAL REQUESTS</span>
          <div className="text-2xl font-mono font-bold mt-2 text-slate-900">{totalPRs}</div>
        </div>
        <div className="p-4 bg-white border border-sky-200 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase font-bold text-amber-600">PENDING APPROVAL</span>
          <div className="text-2xl font-mono font-bold mt-2 text-amber-600">{pendingPRs}</div>
        </div>
        <div className="p-4 bg-white border border-sky-200 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">AVG VENDOR SCORE</span>
          <div className="text-2xl font-mono font-bold mt-2 text-emerald-600">{avgPerformance}%</div>
        </div>
        <div className="p-4 bg-white border border-sky-200 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase">ACTIVE AMC CONTRACTS</span>
          <div className="text-2xl font-mono font-bold mt-2 text-sky-700">
            {state.vendors.filter(v => v.amc_due_date && v.amc_due_date > new Date().toISOString().split('T')[0]).length}
          </div>
        </div>
      </div>

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold border border-sky-300 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-700">
              Your view is filtered to: <strong>{availableTabs.map(t => t.label).join(' & ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Selector SubTabs */}
      <div className="flex border-b border-sky-200 gap-1 overflow-x-auto pb-1">
        {availableTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? 'bg-white border-t-2 border-sky-600 text-sky-700 font-bold shadow-xs border-x border-sky-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.id === 'tasks' ? `${tab.label} (${myTasks.length})` : tab.label}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-bold">
          {successMsg}
        </div>
      )}

      {/* SubTab Views Rendering */}
      {activeSubTab === 'stores' && (
        <StoresAndInventoryView
          state={state}
          currentRole={currentRole}
          userEmail={currentUserEmail}
          onUpdateState={(updater) => onUpdateState(updater(state))}
        />
      )}

      {activeSubTab === 'teamtasks' && (
        <ProcurementTeamTaskView
          state={state}
          currentRole={currentRole}
          userEmail={currentUserEmail}
          onUpdateState={(updater) => onUpdateState(updater(state))}
        />
      )}

      {activeSubTab === 'master-data' && (
        <ProcurementMasterDataView
          state={state}
          userEmail={currentUserEmail}
          onUpdateState={onUpdateState}
        />
      )}

      {(activeSubTab === 'requests' || activeSubTab === 'vendors' || activeSubTab === 'tasks') && (
        /* Main Container */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SubTab Contents - Left Col */}
          <div className="lg:col-span-2 space-y-4">
            {activeSubTab === 'requests' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Purchase Requests log</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Indent approvals and three-way match purchase order tracking.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseOrderError('');
                    setIsPurchaseOrderModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-cyan-600"
                >
                  <PlusCircle className="h-4 w-4" /> Create Purchase Order
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">No</th>
                      <th className="py-2">Item</th>
                      <th className="py-2">Cost</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">PO Number</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.purchaseRequests.map(pr => (
                      <tr key={pr.id} className="hover:bg-muted/35">
                        <td className="py-3 font-mono font-semibold text-cyan-500">{pr.request_no}</td>
                        <td className="py-3 text-foreground font-medium">{pr.item} <span className="text-[10px] text-muted-foreground">(x{pr.quantity})</span></td>
                        <td className="py-3 font-mono text-foreground">${(pr.estimated_cost ?? 0).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pr.approval_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                            pr.approval_status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {pr.approval_status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-muted-foreground">{pr.po_number || 'N/A'}</td>
                        <td className="py-3 text-right space-x-1">
                          {pr.approval_status === 'Pending' && (
                            <button
                              onClick={() => quickApprovePr(pr)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingPrId(pr.id);
                              setPrForm(pr);
                            }}
                            className="p-1 bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePr(pr.id)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'requests' && (
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Purchase Order Management</h3>
                  <p className="mt-1 text-xs text-muted-foreground">PO details, delivery, commercial terms, approvals, and supporting documents.</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-700">
                  {(state.purchaseOrders || []).length} Purchase Orders
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1700px] text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      {['PO Number', 'Vendor', 'Date', 'Items', 'Quantity', 'Rate', 'Taxes', 'Total Value', 'Delivery Location', 'Delivery Date', 'Payment Terms', 'Warranty', 'Approvals', 'PO Document'].map(column => (
                        <th key={column} className="whitespace-nowrap px-3 py-3 font-semibold">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(state.purchaseOrders || []).map(po => (
                      <tr key={po.id} className="align-top hover:bg-muted/25">
                        <td className="whitespace-nowrap px-3 py-3 font-mono font-bold text-cyan-700">{po.po_number}</td>
                        <td className="px-3 py-3 font-semibold text-foreground">{po.vendor_name}</td>
                        <td className="whitespace-nowrap px-3 py-3">{po.po_date || '—'}</td>
                        <td className="min-w-[220px] px-3 py-3">
                          {(po.items || []).map((item, index) => (
                            <div key={`${po.id}-item-${index}`} className={index ? 'mt-2 border-t border-border pt-2' : ''}>
                              <div className="font-semibold text-foreground">{item.item_name}</div>
                              <div className="text-[10px] text-muted-foreground">{item.category}</div>
                            </div>
                          ))}
                        </td>
                        <td className="px-3 py-3">{(po.items || []).map((item, index) => <div key={index} className={index ? 'mt-2' : ''}>{item.quantity}</div>)}</td>
                        <td className="px-3 py-3">{(po.items || []).map((item, index) => <div key={index} className={index ? 'mt-2' : ''}>₹{Number(item.rate || 0).toLocaleString()}</div>)}</td>
                        <td className="whitespace-nowrap px-3 py-3">₹{Number(po.taxes || 0).toLocaleString()}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold text-foreground">₹{Number(po.total_value || 0).toLocaleString()}</td>
                        <td className="min-w-[180px] px-3 py-3">{po.delivery_location || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-3">{po.expected_delivery_date || '—'}</td>
                        <td className="min-w-[130px] px-3 py-3">{po.payment_terms || '—'}</td>
                        <td className="min-w-[120px] px-3 py-3">{po.warranty || '—'}</td>
                        <td className="min-w-[150px] px-3 py-3">
                          <span className="block font-semibold text-foreground">{po.status}</span>
                          <span className="mt-1 block text-[10px] text-muted-foreground">{po.approved_by || 'Pending approval'}</span>
                        </td>
                        <td className="px-3 py-3">
                          {po.document_url
                            ? <a href={po.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-cyan-700 hover:underline"><FileText className="h-3.5 w-3.5" /> Open document</a>
                            : <span className="text-muted-foreground">Not attached</span>}
                        </td>
                      </tr>
                    ))}
                    {(state.purchaseOrders || []).length === 0 && (
                      <tr>
                        <td colSpan={14} className="px-6 py-12 text-center">
                          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-3 font-semibold text-foreground">No purchase orders yet</p>
                          <p className="mt-1 text-xs text-muted-foreground">Create a PO to track vendor, tax, delivery, payment, warranty, and approvals.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSubTab === 'vendors' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Registered Vendor Partners</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">Partner Name</th>
                      <th className="py-2">Performance</th>
                      <th className="py-2">AMC Expiry</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.vendors.map(v => (
                      <tr key={v.id} className="hover:bg-muted/35">
                        <td className="py-3 text-foreground font-bold">{v.name}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${v.performance_score}%` }}></div>
                            </div>
                            <span className="font-mono font-semibold text-foreground">{v.performance_score}%</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-muted-foreground">{v.amc_due_date || 'N/A'}</td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingVendorId(v.id);
                              setVendorForm(v);
                            }}
                            className="p-1 bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteVendor(v.id)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'tasks' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Assigned Strategic Tasks</h3>
              <div className="space-y-3">
                {myTasks.map(task => (
                  <div key={task.id} className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          task.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-1.5">{task.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{task.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">Due: {task.due_date}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Progress:</span>
                        <span className="font-mono text-xs text-foreground font-bold">{task.percent_completed}%</span>
                        <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full" style={{ width: `${task.percent_completed}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateTaskProgress(task.id, 50)}
                          className="px-2 py-1 bg-background border border-border text-[10px] hover:text-cyan-500 rounded font-semibold transition"
                        >
                          Mark 50%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task.id, 100)}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] rounded font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6 font-mono">No tasks currently assigned to Procurement.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Forms panel - Right Col */}
        <div className="space-y-4">
          {activeSubTab === 'requests' && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider font-mono">
                {editingPrId ? 'Update Purchase Request' : 'Raise Purchase Request'}
              </h3>
              <form onSubmit={handlePrSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Requested Material/Item</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Heavy Duty Scrubber brushes"
                    value={prForm.item || ''}
                    onChange={e => setPrForm({...prForm, item: e.target.value})}
                    list="procurement-master-items"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  />
                  <datalist id="procurement-master-items">
                    {state.stockItems.map(item => <option key={item.id} value={item.name}>{item.item_code}</option>)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Quantity</label>
                    <input 
                      type="number" 
                      min={1}
                      value={prForm.quantity || 1}
                      onChange={e => setPrForm({...prForm, quantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Estimated Cost ($)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={prForm.estimated_cost || 0}
                      onChange={e => setPrForm({...prForm, estimated_cost: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Assign Partner Vendor</label>
                  <select 
                    value={prForm.vendor_id || ''}
                    onChange={e => setPrForm({...prForm, vendor_id: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  >
                    <option value="">Select Vendor...</option>
                    {state.vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">SLA Maintenance AMC Status</label>
                  <select 
                    value={prForm.amc_status || 'None'}
                    onChange={e => setPrForm({...prForm, amc_status: e.target.value as any})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  >
                    <option value="None">None</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Justification Remarks</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Critical stock shortage at Site S-203..."
                    value={prForm.remarks || ''}
                    onChange={e => setPrForm({...prForm, remarks: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingPrId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPrId(null);
                        setPrForm({ request_no: '', item: '', quantity: 1, estimated_cost: 0, vendor_id: '', amc_status: 'None', remarks: '' });
                      }}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition border border-border"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {editingPrId ? 'Update Request' : 'Submit PR Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'vendors' && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider font-mono">
                {editingVendorId ? 'Update Vendor' : 'Add Vendor Partner'}
              </h3>
              <form onSubmit={handleVendorSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Vendor Partner Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Apex Safety Logistics"
                    value={vendorForm.name || ''}
                    onChange={e => setVendorForm({...vendorForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Performance Score (0 - 100)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    max={100}
                    value={vendorForm.performance_score || 90}
                    onChange={e => setVendorForm({...vendorForm, performance_score: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">SLA Maintenance Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={vendorForm.amc_due_date || ''}
                    onChange={e => setVendorForm({...vendorForm, amc_due_date: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingVendorId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVendorId(null);
                        setVendorForm({ name: '', performance_score: 90, amc_due_date: '' });
                      }}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition border border-border"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {editingVendorId ? 'Update Partner' : 'Register Partner'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
      )}

      {activeSubTab === 'requests' && isPurchaseOrderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={handlePurchaseOrderSubmit} className="max-h-[90vh] w-full max-w-3xl space-y-5 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Procurement · 3-way match</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Create Purchase Order</h2>
                <p className="mt-1 text-sm text-slate-500">Record order lines, taxes, delivery terms, approvals, and the PO document.</p>
              </div>
              <button type="button" onClick={() => setIsPurchaseOrderModalOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close purchase order form">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                Link to purchase indent
                <select
                  value={purchaseOrderForm.indentRequestId}
                  onChange={event => {
                    const request = state.purchaseRequests.find(candidate => candidate.id === event.target.value);
                    setPurchaseOrderForm({
                      ...purchaseOrderForm,
                      indentRequestId: event.target.value,
                      itemName: request?.item || purchaseOrderForm.itemName,
                      quantity: request?.quantity || purchaseOrderForm.quantity,
                      rate: request ? Math.round(request.estimated_cost / Math.max(request.quantity, 1)) : purchaseOrderForm.rate,
                      vendorId: request?.vendor_id || purchaseOrderForm.vendorId,
                      expectedDeliveryDate: request?.delivery_date || purchaseOrderForm.expectedDeliveryDate
                    });
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
                >
                  <option value="">No indent linked</option>
                  {state.purchaseRequests.map(request => (
                    <option key={request.id} value={request.id}>{request.request_no} · {request.item}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                PO number
                <input value={purchaseOrderForm.poNumber} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, poNumber: event.target.value })} placeholder="Auto-generated if blank" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Vendor *
                <select required value={purchaseOrderForm.vendorId} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, vendorId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal">
                  <option value="">Select vendor</option>
                  {state.vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                PO date *
                <input required type="date" value={purchaseOrderForm.poDate} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, poDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Item / service *
                <input required value={purchaseOrderForm.itemName} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, itemName: event.target.value })} placeholder="Item or service description" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Item category
                <input value={purchaseOrderForm.category} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, category: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Quantity *
                <input required type="number" min="1" value={purchaseOrderForm.quantity} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, quantity: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Rate per unit (₹) *
                <input required type="number" min="0" step="0.01" value={purchaseOrderForm.rate} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, rate: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Tax rate (%) *
                <input required type="number" min="0" step="0.01" value={purchaseOrderForm.taxPct} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, taxPct: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Delivery location *
                <input required value={purchaseOrderForm.deliveryLocation} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, deliveryLocation: event.target.value })} placeholder="Site or warehouse address" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Delivery date *
                <input required type="date" value={purchaseOrderForm.expectedDeliveryDate} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, expectedDeliveryDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Payment terms *
                <input required value={purchaseOrderForm.paymentTerms} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, paymentTerms: event.target.value })} placeholder="e.g. 30 days net" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Warranty
                <input value={purchaseOrderForm.warranty} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, warranty: event.target.value })} placeholder="e.g. 1 year" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Approval status
                <select value={purchaseOrderForm.approvalStatus} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, approvalStatus: event.target.value as PurchaseOrder['status'] })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal">
                  <option value="Draft">Draft</option>
                  <option value="Approval">Pending Approval</option>
                  <option value="Released">Released</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Approved by
                <input value={purchaseOrderForm.approvedBy} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, approvedBy: event.target.value })} placeholder="Approver name" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                PO document URL
                <input type="url" value={purchaseOrderForm.documentUrl} onChange={event => setPurchaseOrderForm({ ...purchaseOrderForm, documentUrl: event.target.value })} placeholder="https://... (optional)" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{(purchaseOrderForm.quantity * purchaseOrderForm.rate).toLocaleString()}</span></div>
              <div className="mt-1 flex justify-between text-slate-600"><span>Taxes ({purchaseOrderForm.taxPct}%)</span><span>₹{(purchaseOrderForm.quantity * purchaseOrderForm.rate * purchaseOrderForm.taxPct / 100).toLocaleString()}</span></div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900"><span>Total value</span><span>₹{(purchaseOrderForm.quantity * purchaseOrderForm.rate * (1 + purchaseOrderForm.taxPct / 100)).toLocaleString()}</span></div>
            </div>
            {purchaseOrderError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{purchaseOrderError}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setIsPurchaseOrderModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-600">Save Purchase Order</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
