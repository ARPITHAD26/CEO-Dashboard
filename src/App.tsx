import { useState, useEffect } from 'react';
import { AppState, Role, UserAccount } from './types';
import { getInitialState, saveState, getSeedState } from './data/store';
import {
  getSessionUser,
  setSessionUser,
  clearSessionUser,
  hasFullAccess,
  isTabAllowed
} from './data/authConfig';
import LoginPage from './components/LoginPage';
import RoleSwitcher from './components/RoleSwitcher';
import CEOView from './components/CEOView';
import ProcurementView from './components/ProcurementView';
import FinanceView from './components/FinanceView';
import BDView from './components/BDView';
import HRView from './components/HRView';
import OperationsView from './components/OperationsView';
import TrainingView from './components/TrainingView';
import ITView from './components/ITView';
import AdminPanel from './components/AdminPanel';
import { AIDocumentImportModal } from './components/AIDocumentImportModal';
import { GovernmentTenderView } from './components/GovernmentTenderView';
import { PrivateTenderView } from './components/PrivateTenderView';
import {
  Shield, Clock, Cpu, Users, GraduationCap, Laptop, Database,
  MapPin, Globe, Sun, Moon, AlertTriangle, Menu, X, Sparkles,
  RefreshCw, LogOut, ShieldCheck, Lock, Landmark, Briefcase
} from 'lucide-react';
import ThemeColorStudio from './components/ThemeColorStudio';
import {
  ThemePalette,
  COLOR_PALETTES,
  loadSavedThemeConfig,
  applyThemeToDOM,
  createCustomPalette
} from './lib/themeEngine';

// Import Firebase Client & Services
import {
  fetchAppStateFromFirestore,
  saveWholeStateToFirestore
} from './lib/firebaseService';

export default function App() {
  const [state, setState] = useState<AppState>(() => getInitialState());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getSessionUser());
  const [activeTab, setActiveTab] = useState<Role>(() => {
    const user = getSessionUser();
    if (!user) return 'CEO';
    if (user.role === 'Admin') return 'Admin';
    return hasFullAccess(user.role) ? 'CEO' : user.role;
  });
  const [cloudSyncing, setCloudSyncing] = useState<boolean>(false);

  // Security Overrides: True if Admin has role override enabled
  const [securityOverride, setSecurityOverride] = useState<boolean>(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('executive_command_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Active dynamic theme palette state synced with ThemeColorStudio & themeEngine
  const [currentPal, setCurrentPal] = useState<ThemePalette>(() => {
    const cfg = loadSavedThemeConfig();
    if (cfg.paletteId === 'custom' && cfg.customHex) {
      return createCustomPalette(cfg.customHex);
    }
    return COLOR_PALETTES.find(p => p.id === cfg.paletteId) || COLOR_PALETTES[0];
  });

  // AI OCR Document Upload Modal
  const [isAIImportOpen, setIsAIImportOpen] = useState<boolean>(false);

  // Strict RBAC Guard: If user is restricted, activeTab must strictly match currentUser.role
  useEffect(() => {
    if (currentUser) {
      if (!isTabAllowed(currentUser.role, activeTab)) {
        setActiveTab(currentUser.role);
      }
    }
  }, [currentUser, activeTab]);

  const getCurrentVerticalRole = (): Role => {
    return activeTab;
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setSessionUser(user);
    if (user.role === 'Admin') {
      setActiveTab('Admin');
    } else if (hasFullAccess(user.role)) {
      setActiveTab('CEO');
    } else {
      setActiveTab(user.role);
    }
  };

  const handleSignOut = () => {
    clearSessionUser();
    setCurrentUser(null);
    setSecurityOverride(false);
  };

  const handleDataImported = (entityType: string, newRecords: any[]) => {
    setState(prevState => {
      const existingList = (prevState[entityType as keyof AppState] || []) as any[];
      const mergedList = [...newRecords, ...existingList.filter(e => !newRecords.some(r => r.id === e.id))];
      const newState: AppState = {
        ...prevState,
        [entityType]: mergedList
      };
      saveState(newState);
      return newState;
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('executive_command_theme', nextTheme);
    const cfg = loadSavedThemeConfig();
    const applied = applyThemeToDOM(cfg, nextTheme === 'light');
    setCurrentPal(applied);
  };

  // Sync theme engine styling to DOM on initial mount & theme mode changes
  useEffect(() => {
    const cfg = loadSavedThemeConfig();
    const applied = applyThemeToDOM(cfg, theme === 'light');
    setCurrentPal(applied);
  }, [theme]);

  // Sync state from Firestore / local storage on mount
  useEffect(() => {
    let isMounted = true;
    const initAppData = async () => {
      try {
        setCloudSyncing(true);
        const firestoreState = await fetchAppStateFromFirestore();
        if (isMounted && firestoreState && (firestoreState.sites?.length > 0 || firestoreState.clients?.length > 0)) {
          setState(firestoreState);
          saveState(firestoreState);
        }
      } catch (err) {
        console.warn('Initial cloud sync fallback to local storage:', err);
      } finally {
        if (isMounted) setCloudSyncing(false);
      }
    };
    initAppData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state whenever it changes
  const handleUpdateState = (newState: AppState) => {
    setState(newState);
    saveState(newState);

    // Background push to Firestore
    setCloudSyncing(true);
    saveWholeStateToFirestore(newState)
      .catch((err) => console.error('Cloud synchronization error:', err))
      .finally(() => setCloudSyncing(false));
  };

  // Sync logged in user if developer switcher is used by Admin
  const handleRoleChangeFromSwitcher = (newRole: Role) => {
    if (currentUser && currentUser.role === 'Admin') {
      setCurrentUser({
        ...currentUser,
        role: newRole
      });
      setActiveTab(newRole);
    }
  };

  const selectTab = (tab: Role) => {
    // Only allow selecting tab if user is Admin, CEO, or if it matches their assigned role
    if (currentUser && isTabAllowed(currentUser.role, tab)) {
      setActiveTab(tab);
      setMobileMenuOpen(false);
    }
  };

  const handleResetData = () => {
    setConfirmResetOpen(true);
  };

  const executeResetData = async () => {
    setConfirmResetOpen(false);
    const freshState = getSeedState();
    setState(freshState);
    saveState(freshState);

    setCloudSyncing(true);
    await saveWholeStateToFirestore(freshState);
    setCloudSyncing(false);
    window.location.reload();
  };

  const handleReload = () => {
    window.location.reload();
  };

  // ----------------------------------------------------------------------
  // RENDER: If not logged in, render LoginPage
  // ----------------------------------------------------------------------
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isFullAccessUser = hasFullAccess(currentUser.role);

  // ----------------------------------------------------------------------
  // RENDER: Authenticated cockpit interface with RBAC isolation
  // ----------------------------------------------------------------------
  return (
    <div className={`min-h-screen bg-[#05070A] text-slate-200 font-sans flex relative overflow-hidden ${theme}`}>

      {/* Decorative background vectors */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0B0F19_1px,transparent_1px),linear-gradient(to_bottom,#0B0F19_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none" />

      {/* 1. Dashboard Left Sidebar */}
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 shrink-0 bg-[#0B0F19] border-r border-slate-800 p-5 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="space-y-6">
          {/* Brand block */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl shrink-0" style={{ background: `linear-gradient(to top right, ${currentPal.primary}, ${currentPal.secondary})`, boxShadow: `0 0 12px ${currentPal.glow}` }}>
                <Shield className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase block" style={{ color: currentPal.primary }}>SPOORTHY INTEGRATED</span>
                <span className="text-xs font-black font-display tracking-tight text-slate-200 block truncate">EXECUTIVE DASHBOARD</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 hover:bg-[#161B2A]/60 rounded-lg text-slate-400 hover:text-rose-400 transition"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User profile card with RBAC Badge */}
          <div className="bg-[#161B2A]/50 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              {currentUser.role === 'CEO' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/ceo-profile.jpg"
                    alt="CEO Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : currentUser.role === 'Training Head' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/training-head-profile.jpg"
                    alt="Training Head Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-fuchsia-400/70 shadow-[0_0_12px_rgba(217,70,239,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : currentUser.role === 'Finance Head' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/finance-head-profile.jpg"
                    alt="Finance Head Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : currentUser.role === 'HR Head' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/hr-head-profile.jpg"
                    alt="HR Head Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : currentUser.role === 'BD Head' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/bd-head-profile.jpg"
                    alt="BD Head Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : currentUser.role === 'Procurement Head' && activeTab !== 'Admin' ? (
                <div className="relative shrink-0">
                  <img
                    src="/procurement-head-profile.jpg"
                    alt="Procurement Head Profile"
                    className="w-11 h-11 rounded-xl object-cover object-top border-2 border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-850 border-2 border-slate-700 text-slate-200 font-black flex items-center justify-center font-mono">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {currentUser.username ? `@${currentUser.username} • ` : ''}{currentUser.email}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono">
              <span className="text-slate-500 uppercase font-bold">Assigned Role</span>
              <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] font-mono" style={{ backgroundColor: `${currentPal.primary}20`, color: currentPal.primary, border: `1px solid ${currentPal.primary}4D` }}>
                {currentUser.role}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono">
              <span className="text-slate-500 uppercase font-bold">Access Scope</span>
              {isFullAccessUser ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider text-[9px] font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Full Access</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider text-[9px] font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Restricted</span>
                </span>
              )}
            </div>

            {currentUser.subRoleName && (
              <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono">
                <span className="text-slate-500 uppercase font-bold">Dynamic Scope</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase tracking-wider text-[9px] font-mono truncate max-w-[130px]" title={currentUser.subRoleName}>
                  {currentUser.subRoleName}
                </span>
              </div>
            )}
          </div>

          {/* Dashboard navigations switcher: Strictly filtered by RBAC */}
          <nav className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                {isFullAccessUser ? 'SYSTEM GRIDS (ALL)' : 'ASSIGNED MODULE'}
              </span>
              {!isFullAccessUser && (
                <span className="text-[9px] font-mono text-amber-400 uppercase font-bold">
                  Restricted
                </span>
              )}
            </div>

            {/* Nav item CEO: Admin & CEO only */}
            {(isFullAccessUser) && (
              <button
                onClick={() => selectTab('CEO')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'CEO' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'CEO' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Database className="w-4 h-4" style={{ color: activeTab === 'CEO' ? currentPal.primary : undefined }} />
                <span>CEO Strategic Suite</span>
              </button>
            )}

            {/* Nav item Government Tender Module: Separate Dedicated Command Panel */}
            {(isFullAccessUser || currentUser.role === 'Procurement Head' || currentUser.role === 'BD Head') && (
              <button
                onClick={() => selectTab('Government Tenders')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Government Tenders' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Government Tenders' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Landmark className="w-4 h-4" style={{ color: activeTab === 'Government Tenders' ? currentPal.primary : undefined }} />
                <span className="flex items-center justify-between w-full">
                  <span>Govt Tenders</span>
                  <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] rounded font-mono font-bold">GOV</span>
                </span>
              </button>
            )}

            {/* Private tenders have a separate register and lifecycle from public bids */}
            {(isFullAccessUser || currentUser.role === 'Procurement Head' || currentUser.role === 'BD Head' || currentUser.role === 'Private Tenders') && (
              <button
                onClick={() => selectTab('Private Tenders')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Private Tenders' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Private Tenders' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Briefcase className="w-4 h-4" style={{ color: activeTab === 'Private Tenders' ? currentPal.primary : undefined }} />
                <span className="flex items-center justify-between w-full">
                  <span>Private Tenders</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] rounded font-mono font-bold">PVT</span>
                </span>
              </button>
            )}

            {/* Nav item Procurement Head */}
            {(isFullAccessUser || currentUser.role === 'Procurement Head') && (
              <button
                onClick={() => selectTab('Procurement Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Procurement Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Procurement Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Cpu className="w-4 h-4" style={{ color: activeTab === 'Procurement Head' ? currentPal.primary : undefined }} />
                <span>Procurement</span>
              </button>
            )}

            {/* Nav item Finance Head */}
            {(isFullAccessUser || currentUser.role === 'Finance Head') && (
              <button
                onClick={() => selectTab('Finance Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Finance Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Finance Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Clock className="w-4 h-4" style={{ color: activeTab === 'Finance Head' ? currentPal.primary : undefined }} />
                <span>Finance Dashboard</span>
              </button>
            )}

            {/* Nav item BD Head */}
            {(isFullAccessUser || currentUser.role === 'BD Head') && (
              <button
                onClick={() => selectTab('BD Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'BD Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'BD Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Globe className="w-4 h-4" style={{ color: activeTab === 'BD Head' ? currentPal.primary : `${currentPal.primary}B3` }} />
                <span>BD Client &amp; Tenders</span>
              </button>
            )}

            {/* Nav item HR Head */}
            {(isFullAccessUser || currentUser.role === 'HR Head') && (
              <button
                onClick={() => selectTab('HR Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'HR Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'HR Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Users className="w-4 h-4" style={{ color: activeTab === 'HR Head' ? currentPal.primary : undefined }} />
                <span>HR &amp; Workforce Roster</span>
              </button>
            )}

            {/* Nav item Operations Head */}
            {(isFullAccessUser || currentUser.role === 'Operations Head') && (
              <button
                onClick={() => selectTab('Operations Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Operations Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Operations Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <MapPin className="w-4 h-4" style={{ color: activeTab === 'Operations Head' ? currentPal.primary : undefined }} />
                <span>Operations Submit Center</span>
              </button>
            )}

            {/* Nav item Training Head */}
            {(isFullAccessUser || currentUser.role === 'Training Head') && (
              <button
                onClick={() => selectTab('Training Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Training Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Training Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <GraduationCap className="w-4 h-4" style={{ color: activeTab === 'Training Head' ? currentPal.primary : undefined }} />
                <span>Compliance Training</span>
              </button>
            )}

            {/* Nav item IT Head */}
            {(isFullAccessUser || currentUser.role === 'IT Head') && (
              <button
                onClick={() => selectTab('IT Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'IT Head' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'IT Head' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Laptop className="w-4 h-4" style={{ color: activeTab === 'IT Head' ? currentPal.primary : undefined }} />
                <span>IT &amp; Application Health</span>
              </button>
            )}

            {/* Nav item Admin Panel: Admin and CEO only */}
            {isFullAccessUser && (
              <button
                onClick={() => selectTab('Admin')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${activeTab === 'Admin' ? 'font-bold' : 'hover:bg-[#161B2A]/60 text-slate-400'
                  }`}
                style={activeTab === 'Admin' ? { backgroundColor: `${currentPal.primary}1A`, border: `1px solid ${currentPal.primary}4D`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` } : undefined}
              >
                <Shield className="w-4 h-4" style={{ color: activeTab === 'Admin' ? currentPal.primary : undefined }} />
                <span>Admin Settings Control</span>
              </button>
            )}
          </nav>

          {/* Bypass switch (Only visible for Admins) */}
          {currentUser.role === 'Admin' && (
            <div className="pt-2">
              <div className="bg-[#161B2A]/20 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-300 font-mono">ROLE OVERRIDE</span>
                  <span className="text-[9px] text-slate-500">Allow client-side testing</span>
                </div>
                <input
                  type="checkbox"
                  checked={securityOverride}
                  onChange={(e) => setSecurityOverride(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer & Sign Out block */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 justify-center">
            {cloudSyncing ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: currentPal.primary }}></span>
                <span style={{ color: currentPal.primary }}>SYNCING TO CLOUD...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SECURE SESSION ONLINE</span>
              </>
            )}
          </div>

          <button
            onClick={handleReload}
            className="w-full bg-[#161B2A]/40 hover:bg-[#161B2A]/80 text-slate-300 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-750 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ color: currentPal.primary }} />
            <span>Reload Application</span>
          </button>

          <button
            onClick={handleSignOut}
            id="sidebar-signout-btn"
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-500/50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out ({currentUser.role})</span>
          </button>
        </div>

      </aside>

      {/* 2. Main content canvas panel */}
      <main className="flex-1 min-w-0 flex flex-col justify-between max-h-screen overflow-y-auto">

        {/* Workspace Top Header bar */}
        <header className="bg-[#0B0F19]/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 bg-[#0B0F19] border border-slate-800 hover:bg-[#161B2A]/60 rounded-lg text-slate-300 transition flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" style={{ color: currentPal.primary }} />
            </button>

            {/* Active view detail summary breadcrumb */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">COMMAND COCKPIT</span>
                <span className="text-slate-700 font-mono text-[9px]">/</span>
                <span className="text-[9px] font-mono uppercase font-bold" style={{ color: currentPal.primary }}>{activeTab}</span>

                {!isFullAccessUser && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Restricted Scope
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold font-display text-slate-200">
                {activeTab === 'CEO' && 'Strategic CEO Executive Dashboard'}
                {activeTab === 'Government Tenders' && 'Government Tender Module (GOV Series & Lifecycle Cockpit)'}
                {activeTab === 'Private Tenders' && 'Private Tender Management (PVT Series & Commercial Pipeline)'}
                {activeTab === 'Procurement Head' && 'Procurement, Vendor & Asset Portal'}
                {activeTab === 'Finance Head' && 'Enterprise Budgeting, Expenses & Payroll Control'}
                {activeTab === 'BD Head' && 'Business Development, Tender Tracker & Leads Cockpit'}
                {activeTab === 'HR Head' && 'Workforce Directory, Leaves & Disciplinary logs'}
                {activeTab === 'Operations Head' && 'Sites, Complaints & SLA Incidents Desk'}
                {activeTab === 'Training Head' && 'Compliance Training · Unit / Client Facility Master & Deployment'}
                {activeTab === 'IT Head' && 'IT Infrastructure Health, VPS Nodes & Telemetry'}
                {activeTab === 'Admin' && 'System Access Matrix & Database Integrity Settings'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* AI Document & OCR Upload Button */}
            <button
              onClick={() => setIsAIImportOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(to right, ${currentPal.primary}33, ${currentPal.secondary}33)`, border: `1px solid ${currentPal.primary}66`, color: currentPal.primary, boxShadow: `0 0 15px ${currentPal.glow}` }}
              title="Upload PDFs, Excel Sheets or Photos for AI OCR Data Extraction"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: currentPal.primary }} />
              <span className="hidden sm:inline">AI OCR &amp; Doc Import</span>
            </button>

            {/* 2026 Executive Dynamic Theme Color Studio */}
            <ThemeColorStudio
              onPaletteChange={(pal) => setCurrentPal(pal)}
              themeMode={theme}
              onToggleThemeMode={toggleTheme}
            />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#161B2A]/40 border border-slate-800 hover:bg-[#161B2A]/80 text-slate-300 transition flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
            </button>

            {/* User chip & Sign Out */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              {currentUser.role === 'CEO' && activeTab !== 'Admin' && (
                <img
                  src="/ceo-profile.jpg"
                  alt="CEO"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-amber-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              {currentUser.role === 'Training Head' && activeTab !== 'Admin' && (
                <img
                  src="/training-head-profile.jpg"
                  alt="Training Head"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-fuchsia-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              {currentUser.role === 'Finance Head' && activeTab !== 'Admin' && (
                <img
                  src="/finance-head-profile.jpg"
                  alt="Finance Head"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-emerald-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              {currentUser.role === 'HR Head' && activeTab !== 'Admin' && (
                <img
                  src="/hr-head-profile.jpg"
                  alt="HR Head"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-amber-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              {currentUser.role === 'BD Head' && activeTab !== 'Admin' && (
                <img
                  src="/bd-head-profile.jpg"
                  alt="BD Head"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-sky-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              {currentUser.role === 'Procurement Head' && activeTab !== 'Admin' && (
                <img
                  src="/procurement-head-profile.jpg"
                  alt="Procurement Head"
                  className="w-8 h-8 rounded-lg object-cover object-top border border-cyan-400/50 shadow-xs"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]" title={currentUser.name}>
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase ${isFullAccessUser ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                  {isFullAccessUser ? 'Full Access' : currentUser.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                id="header-signout-btn"
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 transition flex items-center justify-center"
                title={`Sign Out (${currentUser.role})`}
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </header>

        {/* 3. Operational views viewport body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'CEO' && isFullAccessUser && (
            <CEOView
              state={state}
              onNavigateToDataEntry={() => selectTab('Operations Head')}
            />
          )}

          {activeTab === 'Government Tenders' && (isFullAccessUser || currentUser.role === 'Procurement Head' || currentUser.role === 'BD Head') && (
            <GovernmentTenderView
              state={state}
              currentRole={currentUser.role}
              userEmail={currentUser.email}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'Private Tenders' && (isFullAccessUser || currentUser.role === 'Procurement Head' || currentUser.role === 'BD Head' || currentUser.role === 'Private Tenders') && (
            <PrivateTenderView
              state={state}
              currentRole={currentUser.role}
              userEmail={currentUser.email}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'Procurement Head' && (isFullAccessUser || currentUser.role === 'Procurement Head') && (
            <ProcurementView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              currentRole={currentUser.role}
              allowedSubViews={currentUser.role === 'Procurement Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Procurement Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Finance Head' && (isFullAccessUser || currentUser.role === 'Finance Head') && (
            <FinanceView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Finance Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Finance Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'BD Head' && (isFullAccessUser || currentUser.role === 'BD Head') && (
            <BDView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'BD Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'BD Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'HR Head' && (isFullAccessUser || currentUser.role === 'HR Head') && (
            <HRView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'HR Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'HR Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Operations Head' && (isFullAccessUser || currentUser.role === 'Operations Head') && (
            <OperationsView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Operations Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Operations Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Training Head' && (isFullAccessUser || currentUser.role === 'Training Head') && (
            <TrainingView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Training Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Training Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'IT Head' && (isFullAccessUser || currentUser.role === 'IT Head') && (
            <ITView
              state={state}
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'IT Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'IT Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Admin' && isFullAccessUser && (
            <AdminPanel
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
            />
          )}
        </div>

        {/* Small copyright lines */}
        <footer className="p-4 border-t border-slate-800 bg-black text-center text-[10px] text-slate-500 font-mono">
          Spoorthy Integrated Executive Command Center · Multi-Role Strict RBAC Security Matrix Online
        </footer>

      </main>

      {/* Floating Demo Persona Role Switcher for hot-swaps (Admin Only) */}
      {currentUser.role === 'Admin' && securityOverride && (
        <RoleSwitcher
          currentRole={currentUser.role as Role}
          onChangeRole={handleRoleChangeFromSwitcher}
          onResetData={handleResetData}
        />
      )}

      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" id="reset-confirm-modal">
          <div className="bg-[#0D101C]/90 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">
                  Reset Database &amp; Seed State
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This will overwrite all active portfolio, employee, and asset collections with the official demo seed datasets in your cloud Firestore database. Continue?
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeResetData}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-bold rounded-xl transition font-mono"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI OCR & Document Upload Modal for all roles */}
      <AIDocumentImportModal
        isOpen={isAIImportOpen}
        onClose={() => setIsAIImportOpen(false)}
        currentRole={getCurrentVerticalRole()}
        state={state}
        onDataImported={handleDataImported}
        currentUserEmail={currentUser.email}
      />

    </div>
  );
}
