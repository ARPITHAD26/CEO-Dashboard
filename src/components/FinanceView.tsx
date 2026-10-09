import { useState, FormEvent } from 'react';
import { AppState, Invoice, Expense, Task } from '../types';
import { logAuditEntry } from '../data/store';
import { 
  DollarSign, CheckCircle, Trash2, Edit2, PlusCircle, AlertTriangle,
  Maximize2, Sparkles, X, Download, ShieldCheck
} from 'lucide-react';

interface FinanceViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

export default function FinanceView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName
}: FinanceViewProps) {
  // Determine available tabs based on sub-role restrictions
  const allTabs: { id: 'invoices' | 'expenses' | 'tasks'; label: string }[] = [
    { id: 'invoices', label: 'Company Invoices Directory' },
    { id: 'expenses', label: 'Corporate Expense Heads' },
    { id: 'tasks', label: 'Assigned Tasks' }
  ];

  const availableTabs = allowedSubViews && allowedSubViews.length > 0
    ? allTabs.filter(t => allowedSubViews.includes(t.id))
    : allTabs;

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'invoices';

  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    client_id: '', invoice_no: '', amount: 0, payment_received: 0, outstanding: 0, remarks: ''
  });
  const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({
    expense_head: '', budget: 0, actual: 0, date: '', remarks: ''
  });
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'expenses' | 'tasks'>(defaultTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Stats
  const revenueMTD = state.invoices.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
  const expensesMTD = state.expenses.reduce((sum, exp) => sum + (exp.actual ?? 0), 0);
  const totalReceivables = state.invoices.reduce((sum, inv) => sum + (inv.outstanding ?? 0), 0);
  const cashFlow = revenueMTD - expensesMTD;

  const handleInvoiceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.client_id || !invoiceForm.invoice_no || !invoiceForm.amount) return;

    let updatedInvoices = [...state.invoices];
    const isEdit = !!editingInvId;
    const invId = editingInvId || `INV-${Date.now()}`;

    const amt = Number(invoiceForm.amount) || 0;
    const rec = Number(invoiceForm.payment_received) || 0;
    const out = Math.max(0, amt - rec);

    const newInvoice: Invoice = {
      id: invId,
      client_id: invoiceForm.client_id,
      invoice_no: invoiceForm.invoice_no,
      invoice_date: invoiceForm.invoice_date || new Date().toISOString().split('T')[0],
      amount: amt,
      payment_received: rec,
      outstanding: out,
      remarks: invoiceForm.remarks || ''
    };

    if (isEdit) {
      updatedInvoices = updatedInvoices.map(inv => inv.id === invId ? newInvoice : inv);
      setEditingInvId(null);
    } else {
      updatedInvoices.push(newInvoice);
    }

    const nextState = { ...state, invoices: updatedInvoices };
    logAuditEntry(
      nextState,
      currentUserEmail,
      isEdit ? 'UPDATE' : 'CREATE',
      'Invoice',
      invId,
      isEdit ? 'Updated Invoice record' : 'Generated corporate Invoice',
      JSON.stringify(newInvoice)
    );

    onUpdateState(nextState);
    setInvoiceForm({ client_id: '', invoice_no: '', amount: 0, payment_received: 0, outstanding: 0, remarks: '' });
    triggerSuccess(`Invoice ${isEdit ? 'updated' : 'recorded'} successfully!`);
  };

  const handleExpenseSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!expenseForm.expense_head || !expenseForm.budget) return;

    let updatedExpenses = [...state.expenses];
    const isEdit = !!editingExpId;
    const expId = editingExpId || `EXP-${Date.now()}`;

    const newExpense: Expense = {
      id: expId,
      expense_head: expenseForm.expense_head,
      budget: Number(expenseForm.budget) || 0,
      actual: Number(expenseForm.actual) || 0,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      remarks: expenseForm.remarks || ''
    };

    if (isEdit) {
      updatedExpenses = updatedExpenses.map(exp => exp.id === expId ? newExpense : exp);
      setEditingExpId(null);
    } else {
      updatedExpenses.push(newExpense);
    }

    const nextState = { ...state, expenses: updatedExpenses };
    logAuditEntry(
      nextState,
      currentUserEmail,
      isEdit ? 'UPDATE' : 'CREATE',
      'Expense',
      expId,
      isEdit ? 'Modified expense disbursement' : 'Disbursed company expense',
      JSON.stringify(newExpense)
    );

    onUpdateState(nextState);
    setExpenseForm({ expense_head: '', budget: 0, actual: 0, date: '', remarks: '' });
    triggerSuccess(`Expense head ${isEdit ? 'updated' : 'disbursed'} successfully!`);
  };

  const deleteInvoice = (id: string) => {
    const nextState = { ...state, invoices: state.invoices.filter(inv => inv.id !== id) };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Invoice', id, 'Deleted Invoice');
    onUpdateState(nextState);
    triggerSuccess('Invoice record deleted.');
  };

  const deleteExpense = (id: string) => {
    const nextState = { ...state, expenses: state.expenses.filter(exp => exp.id !== id) };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Expense', id, 'Deleted Expense record');
    onUpdateState(nextState);
    triggerSuccess('Expense head deleted.');
  };

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
  const myTasks = state.tasks.filter(t => t.department === 'Finance & Accounts' || (t.assigned_to || '').toLowerCase().includes('finance'));

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-wide">{successMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EXECUTIVE HEADER: Finance Head HD Portrait & Fiscal Cockpit   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Finance Head HD Portrait + Identity & Cockpit Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Finance Head HD Photo Frame with Zoom & Crisp Resolution */}
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => setIsPhotoModalOpen(true)} 
              title="Click to view full HD portrait of Finance Head"
            >
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 opacity-75 group-hover:opacity-100 blur-sm transition duration-300" />
              
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl bg-slate-900">
                <img 
                  src="/finance-head-profile.jpg" 
                  alt="Finance Head" 
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
                <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-emerald-300 border border-emerald-400/40 flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>HD</span>
                </div>
              </div>

              {/* Online pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Finance &amp; Accounts Control Vertical
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-500" />
                  Statutory &amp; Fiscal Governance
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>Finance Head</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 font-sans tracking-normal bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  Corporate Fiscal &amp; Invoicing Cockpit
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 font-medium">
                <span>Enterprise Budgeting · Client Invoices (A/R) · Expense Disbursements &amp; Cash Flow Reconciliations</span>
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Invoice</span>
            </button>
            <button
              onClick={() => setActiveSubTab('expenses')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Disburse Expense</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Finance KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">MTD REVENUE</span>
          <div className="text-2xl font-mono font-bold mt-2 text-foreground">₹{(revenueMTD ?? 0).toLocaleString()}</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">MTD EXPENSES</span>
          <div className="text-2xl font-mono font-bold mt-2 text-rose-500">₹{(expensesMTD ?? 0).toLocaleString()}</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase font-bold text-red-500">RECEIVABLES (A/R)</span>
          <div className="text-2xl font-mono font-bold mt-2 text-red-500">₹{(totalReceivables ?? 0).toLocaleString()}</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">NET CASH FLOW</span>
          <div className="text-2xl font-mono font-bold mt-2 text-emerald-500">₹{(cashFlow ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Sub-Role Scope Banner (if restricted) */}
      {subRoleName && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 text-[10px] uppercase font-mono">
              Role Scope: {subRoleName}
            </span>
            <span className="text-slate-300">
              Your view is filtered to: <strong>{availableTabs.map(t => t.label).join(' & ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Selector SubTabs */}
      <div className="flex border-b border-border">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === tab.id 
                ? 'border-b-2 border-emerald-500 text-emerald-500 font-bold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.id === 'tasks' ? `${tab.label} (${myTasks.length})` : tab.label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-bold">
          {successMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side list view */}
        <div className="lg:col-span-2 space-y-4">
          {activeSubTab === 'invoices' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Corporate Invoices Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">Inv No</th>
                      <th className="py-2">Client</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Received</th>
                      <th className="py-2">Outstanding</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.invoices.map(inv => {
                      const clientName = state.clients.find(c => c.id === inv.client_id)?.name || 'Apex Client';
                      return (
                        <tr key={inv.id} className="hover:bg-muted/35">
                          <td className="py-3 font-mono font-semibold text-emerald-500">{inv.invoice_no}</td>
                          <td className="py-3 text-foreground font-medium">{clientName}</td>
                          <td className="py-3 font-mono text-foreground">₹{(inv.amount ?? 0).toLocaleString()}</td>
                          <td className="py-3 font-mono text-emerald-500">₹{(inv.payment_received ?? 0).toLocaleString()}</td>
                          <td className="py-3 font-mono text-rose-500 font-bold">₹{(inv.outstanding ?? 0).toLocaleString()}</td>
                          <td className="py-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingInvId(inv.id);
                                setInvoiceForm(inv);
                              }}
                              className="p-1 bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition inline-flex"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'expenses' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Corporate Expense Heads</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2">Expense Head</th>
                      <th className="py-2">Budget Allocation</th>
                      <th className="py-2">Actual Expensed</th>
                      <th className="py-2">Difference</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.expenses.map(exp => {
                      const diff = (exp.budget ?? 0) - (exp.actual ?? 0);
                      return (
                        <tr key={exp.id} className="hover:bg-muted/35">
                          <td className="py-3 text-foreground font-bold">{exp.expense_head}</td>
                          <td className="py-3 font-mono text-foreground">₹{(exp.budget ?? 0).toLocaleString()}</td>
                          <td className="py-3 font-mono text-foreground">₹{(exp.actual ?? 0).toLocaleString()}</td>
                          <td className={`py-3 font-mono font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ₹{(diff ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingExpId(exp.id);
                                setExpenseForm(exp);
                              }}
                              className="p-1 bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition inline-flex"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded text-rose-500 border border-rose-500/20 transition inline-flex"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
                          task.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
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
                          <div className="bg-emerald-500 h-full" style={{ width: `${task.percent_completed}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateTaskProgress(task.id, 50)}
                          className="px-2 py-1 bg-background border border-border text-[10px] hover:text-emerald-500 rounded font-semibold transition"
                        >
                          Mark 50%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(task.id, 100)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] rounded font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6 font-mono">No tasks currently assigned to Finance &amp; Accounts.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Forms panel */}
        <div className="space-y-4">
          {activeSubTab === 'invoices' && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider font-mono">
                {editingInvId ? 'Update Invoice' : 'Generate Invoice'}
              </h3>
              <form onSubmit={handleInvoiceSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Select Client</label>
                  <select 
                    value={invoiceForm.client_id || ''}
                    onChange={e => setInvoiceForm({...invoiceForm, client_id: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  >
                    <option value="">Select Corporate Client...</option>
                    {state.clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Invoice Serial Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. SIS-26-809"
                    value={invoiceForm.invoice_no || ''}
                    onChange={e => setInvoiceForm({...invoiceForm, invoice_no: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Billed Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={invoiceForm.amount || 0}
                      onChange={e => setInvoiceForm({...invoiceForm, amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Payment Received (₹)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={invoiceForm.payment_received || 0}
                      onChange={e => setInvoiceForm({...invoiceForm, payment_received: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Invoice Date</label>
                  <input 
                    type="date" 
                    required
                    value={invoiceForm.invoice_date || ''}
                    onChange={e => setInvoiceForm({...invoiceForm, invoice_date: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Remarks/Milestone Details</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Completed June SLA deliverables..."
                    value={invoiceForm.remarks || ''}
                    onChange={e => setInvoiceForm({...invoiceForm, remarks: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingInvId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInvId(null);
                        setInvoiceForm({ client_id: '', invoice_no: '', amount: 0, payment_received: 0, outstanding: 0, remarks: '' });
                      }}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition border border-border"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {editingInvId ? 'Update Invoice' : 'Submit Invoice'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'expenses' && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider font-mono">
                {editingExpId ? 'Update Expense' : 'Disburse Corporate Expense'}
              </h3>
              <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Expense Head Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Site supervisor fuel & logistics"
                    value={expenseForm.expense_head || ''}
                    onChange={e => setExpenseForm({...expenseForm, expense_head: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Budget Pool (₹)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={expenseForm.budget || 0}
                      onChange={e => setExpenseForm({...expenseForm, budget: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-medium block">Actual Expensed (₹)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={expenseForm.actual || 0}
                      onChange={e => setExpenseForm({...expenseForm, actual: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Disbursement Date</label>
                  <input 
                    type="date" 
                    required
                    value={expenseForm.date || ''}
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Justification Remarks</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Allocation for Metro office rents..."
                    value={expenseForm.remarks || ''}
                    onChange={e => setExpenseForm({...expenseForm, remarks: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingExpId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExpId(null);
                        setExpenseForm({ expense_head: '', budget: 0, actual: 0, date: '', remarks: '' });
                      }}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition border border-border"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {editingExpId ? 'Update Expense' : 'Disburse Expense'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* HD PORTRAIT LIGHTBOX MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            className="bg-[#0f172a] border border-emerald-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Finance Head</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Fiscal Executive
                    </span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Spoorthy Integrated Solutions · Executive HD Portrait</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High Definition Image Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-black shadow-inner flex items-center justify-center min-h-[380px] max-h-[520px]">
              <img 
                src="/finance-head-profile.jpg" 
                alt="Finance Head - Executive Portrait" 
                className="w-full max-h-[500px] object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/40 text-[9.5px] font-mono text-emerald-300 font-bold flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ORIGINAL HD · 1024 × 682</span>
              </div>
            </div>

            {/* Executive Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Designation</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">Finance Head</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Department</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">Finance &amp; Accounts</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Total Invoices</div>
                <div className="font-bold text-emerald-400 mt-0.5 truncate">{state.invoices.length} Registered</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Net Cash Flow</div>
                <div className="font-bold text-cyan-400 mt-0.5 truncate">₹{(cashFlow ?? 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Footer with Details & Download */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-slate-200 font-bold">Scope:</span> Fiscal Control, Payroll &amp; Invoicing
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/finance-head-profile.jpg"
                  download="Spoorthy_Finance_Head_Portrait_HD.jpg"
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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

    </div>
  );
}
