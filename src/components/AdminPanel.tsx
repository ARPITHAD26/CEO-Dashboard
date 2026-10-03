import React, { useState, useEffect } from 'react';
import { Role, AppState, SubRoleDefinition } from '../types';
import { 
  fetchRoleMappings, 
  saveRoleMapping, 
  deleteRoleMapping, 
  saveWholeStateToFirestore, 
  RoleMapping,
  fetchSubRoles,
  saveSubRole,
  deleteSubRole
} from '../lib/firebaseService';
import { getSeedState, getEmptyState } from '../data/store';
import { VERTICAL_CONFIGS } from '../lib/verticalConfig';
import { 
  Users, UserPlus, Trash2, Key, RefreshCw, Check, AlertTriangle, 
  ShieldCheck, Mail, Shield, Plus, Layers, Filter, CheckCircle2, 
  Sliders, Eye, Sparkles, ChevronRight, Lock, UserCheck, HardDrive
} from 'lucide-react';

interface AdminPanelProps {
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
}

export default function AdminPanel({ onUpdateState, currentUserEmail }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'subroles' | 'database'>('users');
  const [mappings, setMappings] = useState<RoleMapping[]>([]);
  const [subRoles, setSubRoles] = useState<SubRoleDefinition[]>([]);
  
  // User mapping form state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<Role>('Finance Head');
  const [selectedSubRoleId, setSelectedSubRoleId] = useState<string>('full_access');

  // Sub-role creation form state
  const [subRoleVertical, setSubRoleVertical] = useState<Role>('Finance Head');
  const [subRoleName, setSubRoleName] = useState('');
  const [subRoleDesc, setSubRoleDesc] = useState('');
  const [subRoleAllowedViews, setSubRoleAllowedViews] = useState<string[]>([]);
  const [filterVertical, setFilterVertical] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'success';
  } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  // Update default allowed views when subRoleVertical changes
  useEffect(() => {
    const config = VERTICAL_CONFIGS[subRoleVertical];
    if (config && config.views.length > 0) {
      setSubRoleAllowedViews([config.views[0].id]);
    } else {
      setSubRoleAllowedViews([]);
    }
  }, [subRoleVertical]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [mapsData, subRolesData] = await Promise.all([
        fetchRoleMappings(),
        fetchSubRoles()
      ]);
      setMappings(mapsData);
      setSubRoles(subRolesData);
    } catch (err) {
      console.error('Error loading admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  // User Mapping Submissions
  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) {
      showMsg('error', 'All fields are required.');
      return;
    }

    try {
      setLoading(true);
      let subName: string | undefined = undefined;
      let allowedViews: string[] | undefined = undefined;

      if (selectedSubRoleId && selectedSubRoleId !== 'full_access') {
        const foundSub = subRoles.find(s => s.id === selectedSubRoleId);
        if (foundSub) {
          subName = foundSub.name;
          allowedViews = foundSub.allowedViews;
        }
      }

      await saveRoleMapping(
        emailInput, 
        nameInput, 
        roleInput, 
        selectedSubRoleId === 'full_access' ? undefined : selectedSubRoleId,
        subName,
        allowedViews
      );

      showMsg('success', `Access mapping successfully saved for ${emailInput}`);
      setEmailInput('');
      setNameInput('');
      setSelectedSubRoleId('full_access');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'Failed to save role mapping.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = (email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      showMsg('error', 'You cannot delete your own admin role mapping.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Revoke User Access',
      message: `Are you sure you want to permanently revoke dashboard access and delete the role mapping for ${email}?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          await deleteRoleMapping(email);
          showMsg('success', 'Mapping deleted successfully.');
          await loadAllData();
        } catch (err) {
          showMsg('error', 'Failed to delete role mapping.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Sub-Role Creations
  const handleCreateSubRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subRoleName.trim()) {
      showMsg('error', 'Please enter a sub-role designation name.');
      return;
    }
    if (subRoleAllowedViews.length === 0) {
      showMsg('error', 'Please select at least one permitted view tab for this sub-role.');
      return;
    }

    try {
      setLoading(true);
      const newSubRole: SubRoleDefinition = {
        id: `subrole-${Date.now()}`,
        name: subRoleName.trim(),
        parentRole: subRoleVertical,
        description: subRoleDesc.trim() || `Restricted scope for ${subRoleVertical}`,
        allowedViews: subRoleAllowedViews,
        createdBy: currentUserEmail,
        createdAt: new Date().toISOString()
      };

      await saveSubRole(newSubRole);
      showMsg('success', `Created sub-role "${newSubRole.name}" under ${subRoleVertical}`);
      setSubRoleName('');
      setSubRoleDesc('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'Failed to create sub-role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubRole = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Sub-Role Definition',
      message: `Are you sure you want to delete the sub-role "${name}"? Any users assigned to this sub-role will revert to full vertical access.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          await deleteSubRole(id);
          showMsg('success', `Sub-role "${name}" removed successfully.`);
          await loadAllData();
        } catch (err) {
          showMsg('error', 'Failed to delete sub-role.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const toggleAllowedView = (viewId: string) => {
    if (subRoleAllowedViews.includes(viewId)) {
      // Don't allow deselecting all
      if (subRoleAllowedViews.length === 1) {
        showMsg('error', 'A sub-role must have at least one allowed view tab.');
        return;
      }
      setSubRoleAllowedViews(subRoleAllowedViews.filter(v => v !== viewId));
    } else {
      setSubRoleAllowedViews([...subRoleAllowedViews, viewId]);
    }
  };

  const handleSeedMockData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Seed Demo Database',
      message: 'This will populate the database with fresh high-fidelity facility records, employee rosters, and server nodes. Proceed?',
      variant: 'success',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          const seed = getSeedState();
          await saveWholeStateToFirestore(seed);
          onUpdateState(seed);
          showMsg('success', 'Database populated with fresh demo seed data. Reloading page...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err) {
          showMsg('error', 'Failed to seed database.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearDatabase = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Factory Reset Database',
      message: 'WARNING: This will permanently wipe all facilities, employees, invoices, and server metrics from cloud storage. Are you absolutely sure?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setLoading(true);
          const emptyState = getEmptyState();
          await saveWholeStateToFirestore(emptyState);
          onUpdateState(emptyState);
          showMsg('success', 'Database cleared successfully. Starting clean slate. Reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err) {
          showMsg('error', 'Failed to clear database.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filter sub-roles for UI display
  const filteredSubRoles = subRoles.filter(sr => {
    if (filterVertical === 'all') return true;
    return sr.parentRole === filterVertical;
  });

  // Current sub-roles available for the chosen role in user mapping form
  const availableSubRolesForSelectedRole = subRoles.filter(sr => sr.parentRole === roleInput);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* High-Visibility Light Theme Header Banner */}
      <div className="p-6 lg:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>SECURITY &amp; ACCESS GOVERNANCE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Admin Center &amp; Dynamic Role Control
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Manage user authorizations, create dynamic sub-roles for department heads, and restrict view tabs across Finance, HR, Operations, BD, IT, and Procurement.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedMockData}
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Seed Demo Data</span>
            </button>
            
            <button
              onClick={handleClearDatabase}
              disabled={loading}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation in Light Theme */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Authorized Users &amp; Role Matrix</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'users' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {mappings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subroles')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'subroles'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Dynamic Sub-Roles &amp; Granular View Scopes</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'subroles' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {subRoles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage &amp; Cloud Maintenance</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium transition-all duration-300 shadow-sm ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ================= TAB 1: USERS & ROLE MATRIX ================= */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Mapping Form */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Authorize &amp; Map User</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Assign a corporate Google email to a vertical head role or specific sub-role.
              </p>
            </div>
            
            <form onSubmit={handleAddMapping} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Google Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="colleague@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 font-medium shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Primary Role / Vertical
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => {
                    setRoleInput(e.target.value as any);
                    setSelectedSubRoleId('full_access');
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="Finance Head">Finance Head (Invoices, Expenses &amp; Budgets)</option>
                  <option value="HR Head">HR Head (Roster, Biometrics, Leaves &amp; Cases)</option>
                  <option value="Operations Head">Operations Head (Sites, Audits &amp; Incidents)</option>
                  <option value="Procurement Head">Procurement Head (PRs, POs &amp; Vendors)</option>
                  <option value="BD Head">BD Head (Sales Pipeline, Leads &amp; Tenders)</option>
                  <option value="Training Head">Training Head (Programs &amp; Drills)</option>
                  <option value="IT Head">IT Head (Applications, VPS &amp; Tickets)</option>
                  <option value="CEO">CEO (Executive Cockpit &amp; Metrics)</option>
                  <option value="Admin">Master System Administrator</option>
                </select>
              </div>

              {/* Dynamic Sub-Role Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Sub-Role &amp; View Restriction</span>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold">
                    {availableSubRolesForSelectedRole.length} available
                  </span>
                </label>
                <select
                  value={selectedSubRoleId}
                  onChange={(e) => setSelectedSubRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-indigo-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="full_access">⚡ Full Vertical Access (All Tabs Visible)</option>
                  {availableSubRolesForSelectedRole.map(sr => (
                    <option key={sr.id} value={sr.id}>
                      🔒 Restricted: {sr.name} ({sr.allowedViews.length} tab{sr.allowedViews.length > 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
                {selectedSubRoleId !== 'full_access' && (
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Lock className="w-3.5 h-3.5" /> Scope Details:
                    </span>
                    <span className="text-slate-600 font-medium">
                      Permitted tabs: {subRoles.find(s => s.id === selectedSubRoleId)?.allowedViews.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Saving to Database...' : 'Save User Access Permission'}</span>
              </button>
            </form>
          </div>

          {/* Active User Mappings List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <span>Active Authorized Access Role Matrix</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verified staff users with authorized single sign-on access to executive facilitator cockpits.
                </p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-bold">
                {mappings.length} Users
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-[11px] uppercase font-mono tracking-wider">
                    <th className="py-3 px-4 font-bold">Employee Name</th>
                    <th className="py-3 px-4 font-bold">Google Email</th>
                    <th className="py-3 px-4 font-bold">Assigned Role &amp; Scope</th>
                    <th className="py-3 px-4 text-right font-bold">Revoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-sm italic">
                        No custom role mappings configured yet. Use the authorization form to add users.
                      </td>
                    </tr>
                  ) : (
                    mappings.map((mapping) => {
                      let badge = 'bg-slate-100 text-slate-800 border-slate-200';
                      if (mapping.role === 'Admin') badge = 'bg-violet-100 text-violet-800 border-violet-200 font-bold';
                      else if (mapping.role === 'CEO') badge = 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
                      else if (mapping.role === 'Finance Head') badge = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
                      else if (mapping.role === 'HR Head') badge = 'bg-amber-100 text-amber-900 border-amber-200 font-bold';
                      else if (mapping.role === 'Operations Head') badge = 'bg-sky-100 text-sky-800 border-sky-200 font-bold';
                      else if (mapping.role === 'IT Head') badge = 'bg-cyan-100 text-cyan-800 border-cyan-200 font-bold';
                      else if (mapping.role === 'BD Head') badge = 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold';
                      else if (mapping.role === 'Procurement Head') badge = 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
                      else if (mapping.role === 'Training Head') badge = 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 font-bold';

                      return (
                        <tr key={mapping.email} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 text-slate-900 font-bold text-sm">
                            {mapping.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-xs font-medium">
                            {mapping.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge}`}>
                                {mapping.role}
                              </span>
                              {mapping.subRoleName ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                                  <Lock className="w-3 h-3 text-indigo-600" /> Sub-Role: {mapping.subRoleName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono font-medium">
                                  Full Vertical Access
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteMapping(mapping.email)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition cursor-pointer"
                              title="Revoke Permissions"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: DYNAMIC SUB-ROLES BUILDER ================= */}
      {activeTab === 'subroles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sub-Role Creator Panel */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>DYNAMIC RBAC BUILDER</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>Create New Sub-Role</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Add specialized designations under any vertical (e.g. <i>Accounts Clerk</i> under Finance, <i>Site Supervisor</i> under Operations) and toggle allowed view tabs.
              </p>
            </div>

            <form onSubmit={handleCreateSubRole} className="space-y-4 pt-1">
              
              {/* Select Vertical */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Parent Department Vertical
                </label>
                <select
                  value={subRoleVertical}
                  onChange={(e) => setSubRoleVertical(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="Finance Head">Finance &amp; Accounts Vertical</option>
                  <option value="HR Head">Human Resources Vertical</option>
                  <option value="Operations Head">Operations &amp; Security Vertical</option>
                  <option value="Procurement Head">Procurement &amp; Vendor Vertical</option>
                  <option value="BD Head">Business Development Vertical</option>
                  <option value="Training Head">Training &amp; Drills Vertical</option>
                  <option value="IT Head">IT &amp; Application Health Vertical</option>
                </select>
              </div>

              {/* Sub-role name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Sub-Role Title / Designation
                </label>
                <input
                  type="text"
                  value={subRoleName}
                  onChange={(e) => setSubRoleName(e.target.value)}
                  placeholder="e.g. Accounts Executive (Invoices Only)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>

              {/* Sub-role description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={subRoleDesc}
                  onChange={(e) => setSubRoleDesc(e.target.value)}
                  placeholder="e.g. Handles client invoicing and collection follow-ups"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {/* View Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Permitted View Tabs</span>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {subRoleAllowedViews.length} selected
                  </span>
                </label>
                <p className="text-[11px] text-slate-600">
                  Users assigned this sub-role will ONLY be able to see and interact with these specific sub-views in the {subRoleVertical} cockpit.
                </p>

                <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
                  {VERTICAL_CONFIGS[subRoleVertical]?.views.map(view => {
                    const isChecked = subRoleAllowedViews.includes(view.id);
                    return (
                      <div
                        key={view.id}
                        onClick={() => toggleAllowedView(view.id)}
                        className={`p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-indigo-50/90 border-indigo-300 text-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-bold ${isChecked ? 'text-indigo-950' : 'text-slate-700'}`}>
                            {view.name}
                          </span>
                          <span className="text-[11px] text-slate-600 leading-tight">
                            {view.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Save Sub-Role Definition'}</span>
              </button>
            </form>
          </div>

          {/* Sub-Roles Directory Matrix */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Configured Department Sub-Roles</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Granular permission profiles available for user assignment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Filter:</span>
                <select
                  value={filterVertical}
                  onChange={(e) => setFilterVertical(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="all">All Verticals ({subRoles.length})</option>
                  <option value="Finance Head">Finance</option>
                  <option value="HR Head">HR</option>
                  <option value="Operations Head">Operations</option>
                  <option value="Procurement Head">Procurement</option>
                  <option value="BD Head">BD</option>
                  <option value="Training Head">Training</option>
                  <option value="IT Head">IT</option>
                </select>
              </div>
            </div>

            {filteredSubRoles.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
                <Sliders className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Sub-Roles Defined Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Create custom sub-roles using the form on the left to restrict access within Finance, HR, Operations, Procurement, BD, Training, or IT.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {filteredSubRoles.map((sr) => {
                  const parentConfig = VERTICAL_CONFIGS[sr.parentRole];
                  return (
                    <div 
                      key={sr.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${parentConfig?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {sr.parentRole}
                          </span>
                          <button
                            onClick={() => handleDeleteSubRole(sr.id, sr.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Sub-Role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-display">
                            {sr.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {sr.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                          Allowed View Tabs ({sr.allowedViews.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sr.allowedViews.map(viewId => {
                            const viewMeta = parentConfig?.views.find(v => v.id === viewId);
                            return (
                              <span 
                                key={viewId}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono flex items-center gap-1 font-semibold"
                              >
                                <Eye className="w-3 h-3 text-indigo-600" />
                                <span>{viewMeta?.name || viewId}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= TAB 3: DATABASE & SYSTEM CONTROLS ================= */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Populate Demo Seed Records</h3>
                <p className="text-xs text-slate-600">Re-inject baseline mock dataset across all enterprise modules.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resets facility sites, attendance logs, employee rosters, invoice ledgers, pipeline tenders, and IT VPS nodes to standard verified demonstration values.
            </p>
            <button
              onClick={handleSeedMockData}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Seed Mock Dataset</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Factory Clean Database</h3>
                <p className="text-xs text-slate-600">Empty all operational records for a clean slate.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Permanently purges all facilities, employee punches, invoices, disciplinary cases, and support tickets from cloud Firestore.
            </p>
            <button
              onClick={handleClearDatabase}
              disabled={loading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal in Light Theme */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="admin-confirm-modal">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              confirmModal.variant === 'danger' 
                ? 'bg-rose-500' 
                : confirmModal.variant === 'success'
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`} />
            
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                confirmModal.variant === 'danger' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : confirmModal.variant === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmModal.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
