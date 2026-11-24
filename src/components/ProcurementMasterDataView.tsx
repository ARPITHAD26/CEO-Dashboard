import { FormEvent, useMemo, useState } from 'react';
import { AppState, ProcurementMasterOption, ProcurementTeamMember, StockItem, Vendor } from '../types';
import { logAuditEntry } from '../data/store';
import { Boxes, Building2, ContactRound, ListPlus, Pencil, Plus, Trash2, Truck, X } from 'lucide-react';

interface ProcurementMasterDataViewProps {
  state: AppState;
  userEmail: string;
  onUpdateState: (newState: AppState) => void;
}

const BASE_CATEGORIES = [
  'Uniforms', 'Shoes', 'PPE', 'Machinery', 'Tools', 'Office Equipment', 'Computers',
  'Printers', 'Stationery', 'Consumables', 'Electrical Items', 'Housekeeping Materials',
  'Other Assets', 'Chemicals'
];
const BASE_UNITS = ['Nos', 'Pieces', 'Sets', 'Pairs', 'Boxes', 'Kg', 'Ltrs', 'Meters', 'Rolls', 'Packs'];

type MasterTab = 'vendors' | 'items' | 'categories' | 'units' | 'team';

const blankVendor = (): Partial<Vendor> => ({
  name: '', vendor_code: '', contact_person: '', phone: '', email: '', categories: [],
  performance_score: 90, amc_due_date: '', is_approved: false, msme_status: false
});

const blankItem = () => ({
  item_code: '', name: '', category: BASE_CATEGORIES[0], unit: BASE_UNITS[0],
  unit_rate: 0, location: 'Warehouse General'
});

const blankMember = (): Partial<ProcurementTeamMember> => ({
  name: '', title: '', email: '', phone: '', active: true
});

export function ProcurementMasterDataView({ state, userEmail, onUpdateState }: ProcurementMasterDataViewProps) {
  const [activeTab, setActiveTab] = useState<MasterTab>('vendors');
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>(blankVendor());
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(blankItem());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<ProcurementTeamMember>>(blankMember());
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [editingOption, setEditingOption] = useState<{ kind: 'category' | 'unit'; id: string; name: string } | null>(null);
  const [error, setError] = useState('');

  const categories = useMemo(() => [...new Set([
    ...BASE_CATEGORIES,
    ...(state.procurementMasterCategories || []).map(option => option.name),
    ...(state.stockItems || []).map(item => item.category)
  ])].sort((a, b) => a.localeCompare(b)), [state.procurementMasterCategories, state.stockItems]);
  const units = useMemo(() => [...new Set([
    ...BASE_UNITS,
    ...(state.procurementMasterUnits || []).map(option => option.name),
    ...(state.stockItems || []).map(item => item.unit)
  ])].sort((a, b) => a.localeCompare(b)), [state.procurementMasterUnits, state.stockItems]);

  const publish = (nextState: AppState, action: 'CREATE' | 'UPDATE' | 'DELETE', entity: string, id: string, detail: string) => {
    logAuditEntry(nextState, userEmail, action, entity, id, detail);
    onUpdateState(nextState);
    setError('');
  };

  const saveVendor = (event: FormEvent) => {
    event.preventDefault();
    const name = vendorForm.name?.trim();
    if (!name) return setError('Vendor name is required.');
    const duplicate = state.vendors.some(vendor =>
      vendor.id !== editingVendorId && vendor.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) return setError('A vendor with this name already exists.');

    const id = editingVendorId || `V-${Date.now()}`;
    const vendor: Vendor = {
      ...vendorForm,
      id,
      name,
      performance_score: Math.max(0, Math.min(100, Number(vendorForm.performance_score) || 0)),
      amc_due_date: vendorForm.amc_due_date || '',
      categories: vendorForm.categories || []
    };
    const vendors = editingVendorId
      ? state.vendors.map(existing => existing.id === id ? vendor : existing)
      : [...state.vendors, vendor];
    publish({ ...state, vendors }, editingVendorId ? 'UPDATE' : 'CREATE', 'Vendor', id, `Saved master data for ${name}`);
    setEditingVendorId(null);
    setVendorForm(blankVendor());
  };

  const saveItem = (event: FormEvent) => {
    event.preventDefault();
    const code = itemForm.item_code.trim();
    const name = itemForm.name.trim();
    if (!code || !name) return setError('Item code and material name are required.');
    if (state.stockItems.some(item => item.id !== editingItemId && item.item_code.toLowerCase() === code.toLowerCase())) {
      return setError('An item with this code already exists.');
    }

    const id = editingItemId || `ITM-${Date.now().toString().slice(-8)}`;
    const existing = state.stockItems.find(item => item.id === id);
    const rate = Math.max(0, Number(itemForm.unit_rate) || 0);
    const item: StockItem = existing
      ? { ...existing, item_code: code, name, category: itemForm.category, unit: itemForm.unit, unit_rate: rate, unit_cost: rate }
      : {
          id, item_code: code, name, category: itemForm.category, unit: itemForm.unit,
          opening_stock: 0, receipts: 0, issues: 0, adjustments: 0, closing_stock: 0,
          min_threshold: 0, unit_rate: rate, unit_cost: rate, total_value: 0,
          location: itemForm.location.trim() || 'Warehouse General', status: 'Zero Stock'
        };
    const stockItems = existing
      ? state.stockItems.map(current => current.id === id ? item : current)
      : [item, ...state.stockItems];
    publish({ ...state, stockItems }, editingItemId ? 'UPDATE' : 'CREATE', 'StockItem', id, `Saved item master data for ${name}`);
    setEditingItemId(null);
    setItemForm(blankItem());
  };

  const saveMember = (event: FormEvent) => {
    event.preventDefault();
    const name = memberForm.name?.trim();
    if (!name || !memberForm.title?.trim()) return setError('Team member name and title are required.');
    const id = editingMemberId || `PROC-TEAM-${Date.now()}`;
    const member: ProcurementTeamMember = {
      id, name, title: memberForm.title.trim(), email: memberForm.email?.trim() || '',
      phone: memberForm.phone?.trim() || '', active: memberForm.active !== false
    };
    const procurementTeamMembers = editingMemberId
      ? state.procurementTeamMembers.map(existing => existing.id === id ? member : existing)
      : [...state.procurementTeamMembers, member];
    publish({ ...state, procurementTeamMembers }, editingMemberId ? 'UPDATE' : 'CREATE', 'ProcurementTeamMember', id, `Saved procurement team member ${name}`);
    setEditingMemberId(null);
    setMemberForm(blankMember());
  };

  const saveOption = (kind: 'category' | 'unit', event: FormEvent) => {
    event.preventDefault();
    const name = (kind === 'category' ? categoryName : unitName).trim();
    if (!name) return setError(`${kind === 'category' ? 'Category' : 'Unit'} name is required.`);
    const list = kind === 'category' ? state.procurementMasterCategories : state.procurementMasterUnits;
    const duplicate = [
      ...(kind === 'category' ? BASE_CATEGORIES : BASE_UNITS),
      ...list.map(option => option.name)
    ].some(value => value.toLowerCase() === name.toLowerCase());
    if (duplicate) return setError('This master value already exists.');
    const option: ProcurementMasterOption = { id: `${kind}-${Date.now()}`, name };
    const key = kind === 'category' ? 'procurementMasterCategories' : 'procurementMasterUnits';
    publish({ ...state, [key]: [...list, option] }, 'CREATE', kind === 'category' ? 'ItemCategory' : 'ItemUnit', option.id, `Added ${name}`);
    if (kind === 'category') setCategoryName('');
    else setUnitName('');
  };

  const saveEditedOption = (event: FormEvent) => {
    event.preventDefault();
    if (!editingOption) return;
    const name = editingOption.name.trim();
    const kind = editingOption.kind;
    const list = kind === 'category' ? state.procurementMasterCategories : state.procurementMasterUnits;
    if (!name) return setError('Master value cannot be empty.');
    if ([
      ...(kind === 'category' ? BASE_CATEGORIES : BASE_UNITS),
      ...list.filter(option => option.id !== editingOption.id).map(option => option.name)
    ].some(value => value.toLowerCase() === name.toLowerCase())) {
      return setError('This master value already exists.');
    }
    const key = kind === 'category' ? 'procurementMasterCategories' : 'procurementMasterUnits';
    const updatedList = list.map(option => option.id === editingOption.id ? { ...option, name } : option);
    const stockItems = state.stockItems.map(item => kind === 'category' && item.category === list.find(option => option.id === editingOption.id)?.name
      ? { ...item, category: name }
      : kind === 'unit' && item.unit === list.find(option => option.id === editingOption.id)?.name
        ? { ...item, unit: name }
        : item);
    publish({ ...state, [key]: updatedList, stockItems }, 'UPDATE', kind === 'category' ? 'ItemCategory' : 'ItemUnit', editingOption.id, `Renamed to ${name}`);
    setEditingOption(null);
  };

  const removeOption = (kind: 'category' | 'unit', option: ProcurementMasterOption) => {
    const inUse = state.stockItems.some(item => kind === 'category' ? item.category === option.name : item.unit === option.name);
    if (inUse) return setError(`Cannot remove "${option.name}" while it is assigned to an inventory item.`);
    const key = kind === 'category' ? 'procurementMasterCategories' : 'procurementMasterUnits';
    publish({ ...state, [key]: state[key].filter(existing => existing.id !== option.id) }, 'DELETE',
      kind === 'category' ? 'ItemCategory' : 'ItemUnit', option.id, `Removed ${option.name}`);
  };

  const deleteVendor = (vendor: Vendor) => {
    const inUse = state.purchaseRequests.some(request => request.vendor_id === vendor.id) ||
      state.purchaseOrders.some(order => order.vendor_id === vendor.id);
    if (inUse) return setError(`Cannot remove "${vendor.name}" because purchase records reference it.`);
    publish({ ...state, vendors: state.vendors.filter(existing => existing.id !== vendor.id) },
      'DELETE', 'Vendor', vendor.id, `Removed ${vendor.name}`);
  };

  const deleteItem = (item: StockItem) => {
    const inUse = state.stockTransactions.some(transaction => transaction.item_id === item.id) ||
      state.stockIssues.some(issue => issue.item_id === item.id) ||
      state.purchaseRequests.some(request => request.item.toLowerCase() === item.name.toLowerCase()) ||
      state.purchaseOrders.some(order => order.items.some(orderItem =>
        orderItem.item_id === item.id || orderItem.item_name.toLowerCase() === item.name.toLowerCase()
      )) ||
      Number(item.closing_stock) > 0;
    if (inUse) return setError(`Cannot remove "${item.name}" while it has stock or transaction history.`);
    publish({ ...state, stockItems: state.stockItems.filter(existing => existing.id !== item.id) },
      'DELETE', 'StockItem', item.id, `Removed ${item.name}`);
  };

  const deleteMember = (member: ProcurementTeamMember) => {
    publish({ ...state, procurementTeamMembers: state.procurementTeamMembers.filter(existing => existing.id !== member.id) },
      'DELETE', 'ProcurementTeamMember', member.id, `Removed ${member.name}`);
  };

  const tabs = [
    { id: 'vendors' as const, label: 'Vendors', count: state.vendors.length, icon: Truck },
    { id: 'items' as const, label: 'Materials / Items', count: state.stockItems.length, icon: Boxes },
    { id: 'categories' as const, label: 'Categories', count: BASE_CATEGORIES.length + state.procurementMasterCategories.length, icon: ListPlus },
    { id: 'units' as const, label: 'Units of Measure', count: BASE_UNITS.length + state.procurementMasterUnits.length, icon: ListPlus },
    { id: 'team' as const, label: 'Assignees', count: state.procurementTeamMembers.length, icon: ContactRound }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Procurement Setup</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Master Data</h2>
            <p className="mt-1 text-xs text-slate-500">Maintain shared vendors, inventory items, categories, units, and task assignees.</p>
          </div>
          <Building2 className="h-7 w-7 text-sky-600" />
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === tab.id ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon className="h-4 w-4" /> {tab.label}
              <span className="rounded-full bg-black/10 px-2 py-0.5">{tab.count}</span>
            </button>
          );
        })}
      </nav>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}

      {activeTab === 'vendors' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Vendor Directory</h3>
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Vendor</th><th className="p-2">Contact</th><th className="p-2">Categories</th><th className="p-2">Score</th><th className="p-2">Actions</th></tr></thead>
              <tbody className="divide-y">
                {state.vendors.map(vendor => <tr key={vendor.id}>
                  <td className="p-2"><strong>{vendor.name}</strong><div className="text-slate-500">{vendor.vendor_code || vendor.id}</div></td>
                  <td className="p-2">{vendor.contact_person || '—'}<div className="text-slate-500">{vendor.email || vendor.phone || '—'}</div></td>
                  <td className="p-2">{vendor.categories?.join(', ') || '—'}</td>
                  <td className="p-2">{vendor.performance_score}%</td>
                  <td className="p-2"><div className="flex gap-1">
                    <button aria-label={`Edit ${vendor.name}`} onClick={() => { setVendorForm({ ...vendor }); setEditingVendorId(vendor.id); }} className="rounded-lg border p-2 text-sky-700"><Pencil className="h-3.5 w-3.5" /></button>
                    <button aria-label={`Delete ${vendor.name}`} onClick={() => deleteVendor(vendor)} className="rounded-lg border p-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </section>
          <form onSubmit={saveVendor} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">{editingVendorId ? 'Edit Vendor' : 'Add Vendor'}</h3>
            <input required placeholder="Vendor name *" value={vendorForm.name || ''} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Vendor code" value={vendorForm.vendor_code || ''} onChange={e => setVendorForm({ ...vendorForm, vendor_code: e.target.value })} className="min-w-0 rounded-xl border p-2.5 text-xs" />
              <input type="number" min="0" max="100" placeholder="Score" value={vendorForm.performance_score ?? ''} onChange={e => setVendorForm({ ...vendorForm, performance_score: Number(e.target.value) })} className="min-w-0 rounded-xl border p-2.5 text-xs" />
            </div>
            <input placeholder="Contact person" value={vendorForm.contact_person || ''} onChange={e => setVendorForm({ ...vendorForm, contact_person: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <input type="email" placeholder="Email" value={vendorForm.email || ''} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} className="min-w-0 rounded-xl border p-2.5 text-xs" />
              <input placeholder="Phone" value={vendorForm.phone || ''} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} className="min-w-0 rounded-xl border p-2.5 text-xs" />
            </div>
            <input placeholder="Categories (comma separated)" value={(vendorForm.categories || []).join(', ')} onChange={e => setVendorForm({ ...vendorForm, categories: e.target.value.split(',').map(value => value.trim()).filter(Boolean) })} className="w-full rounded-xl border p-2.5 text-xs" />
            <input type="date" aria-label="AMC expiry date" value={vendorForm.amc_due_date || ''} onChange={e => setVendorForm({ ...vendorForm, amc_due_date: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!vendorForm.is_approved} onChange={e => setVendorForm({ ...vendorForm, is_approved: e.target.checked })} /> Approved vendor</label>
            <div className="flex gap-2"><button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" />{editingVendorId ? 'Save Vendor' : 'Add Vendor'}</button>{editingVendorId && <button type="button" onClick={() => { setVendorForm(blankVendor()); setEditingVendorId(null); }} className="rounded-xl border px-3"><X className="h-4 w-4" /></button>}</div>
          </form>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Material / Item Catalog</h3>
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Code</th><th className="p-2">Item</th><th className="p-2">Category</th><th className="p-2">Unit</th><th className="p-2">Rate</th><th className="p-2">Actions</th></tr></thead>
              <tbody className="divide-y">{state.stockItems.map(item => <tr key={item.id}>
                <td className="p-2 font-mono">{item.item_code}</td><td className="p-2 font-semibold">{item.name}</td><td className="p-2">{item.category}</td><td className="p-2">{item.unit}</td><td className="p-2">₹{Number(item.unit_rate ?? item.unit_cost).toLocaleString()}</td>
                <td className="p-2"><div className="flex gap-1"><button aria-label={`Edit ${item.name}`} onClick={() => { setItemForm({ item_code: item.item_code, name: item.name, category: item.category, unit: item.unit, unit_rate: Number(item.unit_rate ?? item.unit_cost) || 0, location: item.location }); setEditingItemId(item.id); }} className="rounded-lg border p-2 text-sky-700"><Pencil className="h-3.5 w-3.5" /></button><button aria-label={`Delete ${item.name}`} onClick={() => deleteItem(item)} className="rounded-lg border p-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
              </tr>)}</tbody>
            </table>
          </section>
          <form onSubmit={saveItem} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">{editingItemId ? 'Edit Material / Item' : 'Add Material / Item'}</h3>
            <input required placeholder="Item code *" value={itemForm.item_code} onChange={e => setItemForm({ ...itemForm, item_code: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <input required placeholder="Material name *" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} className="min-w-0 rounded-xl border bg-white p-2.5 text-xs">{categories.map(category => <option key={category}>{category}</option>)}</select>
              <select value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} className="min-w-0 rounded-xl border bg-white p-2.5 text-xs">{units.map(unit => <option key={unit}>{unit}</option>)}</select>
            </div>
            <input type="number" min="0" step="0.01" placeholder="Default unit rate" value={itemForm.unit_rate || ''} onChange={e => setItemForm({ ...itemForm, unit_rate: Number(e.target.value) })} className="w-full rounded-xl border p-2.5 text-xs" />
            {!editingItemId && <input placeholder="Default storage location" value={itemForm.location} onChange={e => setItemForm({ ...itemForm, location: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />}
            <p className="text-[10px] text-slate-500">New items are added to the stock ledger with zero opening stock. Existing balances and transaction history are preserved when editing.</p>
            <div className="flex gap-2"><button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" />{editingItemId ? 'Save Item' : 'Add Item'}</button>{editingItemId && <button type="button" onClick={() => { setItemForm(blankItem()); setEditingItemId(null); }} className="rounded-xl border px-3"><X className="h-4 w-4" /></button>}</div>
          </form>
        </div>
      )}

      {(activeTab === 'categories' || activeTab === 'units') && (() => {
        const isCategory = activeTab === 'categories';
        const kind = isCategory ? 'category' : 'unit';
        const baseValues = isCategory ? BASE_CATEGORIES : BASE_UNITS;
        const customValues = isCategory ? state.procurementMasterCategories : state.procurementMasterUnits;
        const value = isCategory ? categoryName : unitName;
        const setValue = isCategory ? setCategoryName : setUnitName;
        return <section className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h3 className="text-sm font-bold">{isCategory ? 'Item Categories' : 'Units of Measure'}</h3><p className="mt-1 text-xs text-slate-500">{isCategory ? 'Categories are available in the material catalog and stock filters.' : 'Units are available when defining materials and inventory items.'}</p></div>
          <form onSubmit={event => saveOption(kind, event)} className="flex gap-2"><input value={value} onChange={e => setValue(e.target.value)} placeholder={isCategory ? 'New category name' : 'New unit name'} className="min-w-0 flex-1 rounded-xl border p-2.5 text-xs" /><button className="flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" />Add</button></form>
          <div className="grid gap-2 sm:grid-cols-2">{[...baseValues.map(name => ({ id: `base-${name}`, name, base: true })), ...customValues.map(option => ({ ...option, base: false }))].map(option => (
            <div key={option.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs">
              {editingOption?.id === option.id ? <form onSubmit={saveEditedOption} className="flex min-w-0 flex-1 gap-2"><input autoFocus value={editingOption.name} onChange={e => setEditingOption({ ...editingOption, name: e.target.value })} className="min-w-0 flex-1 rounded-lg border p-1.5" /><button className="font-bold text-sky-700">Save</button><button type="button" onClick={() => setEditingOption(null)} className="text-slate-500">Cancel</button></form> : <><span className="font-medium">{option.name}{option.base && <span className="ml-2 text-[10px] text-slate-400">Standard</span>}</span>{!option.base && <div className="flex gap-1"><button aria-label={`Rename ${option.name}`} onClick={() => setEditingOption({ kind, id: option.id, name: option.name })} className="rounded-lg border p-1.5 text-sky-700"><Pencil className="h-3.5 w-3.5" /></button><button aria-label={`Remove ${option.name}`} onClick={() => removeOption(kind, option)} className="rounded-lg border p-1.5 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div>}</>}
            </div>
          ))}</div>
        </section>;
      })()}

      {activeTab === 'team' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Assignee Master</h3>
            <table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-2">Assignee</th><th className="p-2">Email / Phone</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
              <tbody className="divide-y">{state.procurementTeamMembers.map(member => <tr key={member.id}>
                <td className="p-2"><strong>{member.name}</strong><div className="text-slate-500">{member.title}</div></td><td className="p-2">{member.email || '—'}<div className="text-slate-500">{member.phone || ''}</div></td><td className="p-2">{member.active ? 'Active' : 'Inactive'}</td>
                <td className="p-2"><div className="flex gap-1"><button aria-label={`Edit ${member.name}`} onClick={() => { setMemberForm({ ...member }); setEditingMemberId(member.id); }} className="rounded-lg border p-2 text-sky-700"><Pencil className="h-3.5 w-3.5" /></button><button aria-label={`Delete ${member.name}`} onClick={() => deleteMember(member)} className="rounded-lg border p-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
              </tr>)}</tbody>
            </table>
          </section>
          <form onSubmit={saveMember} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">{editingMemberId ? 'Edit Assignee' : 'Add Assignee'}</h3>
            <input required placeholder="Name *" value={memberForm.name || ''} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <input required placeholder="Title / Role *" value={memberForm.title || ''} onChange={e => setMemberForm({ ...memberForm, title: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <input type="email" placeholder="Email" value={memberForm.email || ''} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <input placeholder="Phone" value={memberForm.phone || ''} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} className="w-full rounded-xl border p-2.5 text-xs" />
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={memberForm.active !== false} onChange={e => setMemberForm({ ...memberForm, active: e.target.checked })} /> Active team member</label>
            <div className="flex gap-2"><button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" />{editingMemberId ? 'Save Member' : 'Add Member'}</button>{editingMemberId && <button type="button" onClick={() => { setMemberForm(blankMember()); setEditingMemberId(null); }} className="rounded-xl border px-3"><X className="h-4 w-4" /></button>}</div>
          </form>
        </div>
      )}
    </div>
  );
}
