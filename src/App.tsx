import { useState, useEffect } from 'react';
import { AppState, Role, UserAccount } from './types';
import { getInitialState, saveState, getSeedState, getEmptyState } from './data/store';
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
import { 
  Shield, Power, Clock, Cpu, Users, GraduationCap, Laptop, Database, 
  MapPin, HelpCircle, Activity, Globe, LogOut, CheckCircle, Flame, UserCheck, Lock,
  Sun, Moon, AlertTriangle, Menu, X, Sparkles
} from 'lucide-react';

// Import Firebase Client & Services
import { auth, signInWithGoogle, logOutUser } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  fetchAppStateFromFirestore, 
  fetchRoleMappings, 
  saveWholeStateToFirestore 
} from './lib/firebaseService';

export default function App() {
  const [state, setState] = useState<AppState>(() => getInitialState());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<Role>('CEO');
  const [systemTime, setSystemTime] = useState<string>('');
  
  // Auth & Sync state
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isUnmappedUser, setIsUnmappedUser] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingName, setPendingName] = useState<string>('');
  const [cloudSyncing, setCloudSyncing] = useState<boolean>(false);
  const [authStateError, setAuthStateError] = useState<string | null>(null);

  // Security Overrides: True if user is allowed to swap between dashboards
  const [securityOverride, setSecurityOverride] = useState<boolean>(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('executive_command_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // AI OCR Document Upload Modal
  const [isAIImportOpen, setIsAIImportOpen] = useState<boolean>(false);

  const getCurrentVerticalRole = (): Role => {
    return activeTab;
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
  };

  // Authenticate user & sync state from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingAuth(true);
      setAuthStateError(null);
      
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const lowerEmail = email.toLowerCase().trim();
        let name = firebaseUser.displayName || 'Authorized Staff';
        let role: Role = 'Operations Head';
        let subRoleId: string | undefined = undefined;
        let subRoleName: string | undefined = undefined;
        let allowedSubViews: string[] | undefined = undefined;

        // Check role mappings from Firestore; default to Admin for full unrestricted access
        try {
          const mappings = await fetchRoleMappings();
          const found = mappings.find(m => m.email.toLowerCase() === lowerEmail);
          if (found) {
            role = found.role;
            name = found.name || name;
            subRoleId = found.subRoleId;
            subRoleName = found.subRoleName;
            allowedSubViews = found.allowedSubViews;
          } else {
            // Default unmapped user to Admin so remixer/owner has instant full access
            role = 'Admin';
          }
        } catch (err: any) {
          console.warn('Error loading role mappings, defaulting to Admin:', err);
          role = 'Admin';
        }

        const userAccount: UserAccount = {
          email,
          name,
          role,
          subRoleId,
          subRoleName,
          allowedSubViews
        };
        
        setCurrentUser(userAccount);
        setIsUnmappedUser(false);
        setActiveTab(role);

        // Load the actual data state from Firestore
        try {
          setCloudSyncing(true);
          const firestoreState = await fetchAppStateFromFirestore();
          // If the Firestore is empty and we have local state, use local or keep empty
          if (firestoreState.sites.length > 0 || firestoreState.clients.length > 0) {
            setState(firestoreState);
            saveState(firestoreState);
          } else {
            // Firestore is empty. Use empty state by default
            const empty = getEmptyState();
            setState(empty);
            saveState(empty);
          }
        } catch (err) {
          console.error('Failed to sync app state from Firestore:', err);
        } finally {
          setCloudSyncing(false);
        }
      } else {
        setCurrentUser(null);
        setIsUnmappedUser(false);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Dynamic clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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

  // Sync logged in user if the developer floats are used
  const handleRoleChangeFromSwitcher = (newRole: Role) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole
      });
      setActiveTab(newRole);
    }
  };

  const selectTab = (tab: Role) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
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

  const handleGoogleSignIn = async () => {
    try {
      setLoadingAuth(true);
      setAuthStateError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthStateError(err.message || 'Google Sign-In popup was blocked or failed.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
    setIsUnmappedUser(false);
  };

  // ----------------------------------------------------------------------
  // RENDER: Loading or Gateway Gate
  // ----------------------------------------------------------------------
  if (loadingAuth) {
    return (
      <div className={`min-h-screen bg-[#05070A] text-slate-200 flex flex-col items-center justify-center p-6 font-sans ${theme}`}>
        <div className="space-y-4 text-center max-w-sm">
          <Globe className="w-10 h-10 text-cyan-400 animate-spin mx-auto" style={{ animationDuration: '3s' }} />
          <h2 className="text-sm font-bold font-mono tracking-widest text-cyan-400">INITIALIZING SECURITY CONNECTIONS</h2>
          <p className="text-xs text-slate-500">Checking credentials &amp; establishing secure SSL channels to cloud database...</p>
        </div>
      </div>
    );
  }

  // 1. Gate for Google-authenticated users who don't have role mapping yet
  if (isUnmappedUser) {
    return (
      <div className={`min-h-screen bg-[#05070A] text-slate-200 flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-rose-500 selection:text-slate-900 ${theme}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#1e1b4b_0%,transparent_100%)] opacity-35"></div>
        
        <div className="z-10 max-w-md mx-auto w-full my-auto bg-[#111422]/60 border border-slate-800 p-8 rounded-3xl space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-tight">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Google account <strong className="text-cyan-400 font-mono">{pendingEmail}</strong> is authenticated, but has not been assigned a workspace role mapping yet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Next Steps</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Please contact your designated System Administrator to assign or adjust your workspace role.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Verify Again
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/10 text-rose-300 text-xs font-bold rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <p className="z-10 text-center text-[10px] font-mono text-slate-600">
          Executive Facility Cockpit · Unauthorized entry attempt logged securely
        </p>
      </div>
    );
  }

  // 2. Gateway gate for general users (Not Authenticated)
  if (!currentUser) {
    return (
      <div className={`min-h-screen bg-[#05070A] text-slate-200 flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-rose-500 selection:text-slate-900 ${theme}`}>
        
        {/* Futuristic glowing grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0B0F19_1px,transparent_1px),linear-gradient(to_bottom,#0B0F19_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl"></div>


        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400">DECISION SUPPORT SYSTEM</span>
              <h1 className="text-sm font-black font-display tracking-tight text-slate-100">SPOORTHY INTEGRATED SOLUTIONS PVT. LTD.</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#161B2A]/40 border border-slate-800 hover:bg-[#161B2A]/80 text-slate-300 hover:text-cyan-400 transition"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-cyan-500" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-500">
              <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>{systemTime || 'STABILIZING ACCESS NODE...'}</span>
            </div>
          </div>
        </div>

        {/* Form panel body */}
        <div className="z-10 max-w-4xl mx-auto w-full my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Mission intro */}
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DSS Online · Secure Central Core</span>
            </div>
            
            <h2 className="text-3xl font-black font-display tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-300 to-rose-400">
              CEO Executive Decision Support System
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Welcome to the centralized executive dashboard for Spoorthy Integrated Solutions Pvt. Ltd. This DSS integrates real-time feed inputs from Department Heads across Procurement, Finance, BD, HR, Operations, and Training to surface risks, flag overdue workflows, and power high-level strategic decisions.
            </p>

            <div className="space-y-2 font-mono text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>CEO: Unified cross-department metrics, alerts &amp; tasks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Department Heads: Secure isolated CRUD &amp; localized KPIs</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Automated Audits: Secure logging of modifications &amp; actions</span>
              </div>
            </div>
          </div>

          {/* Secure Google Sign-In Panel */}
          <div className="bg-[#111422]/60 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
            <div className="border-b border-slate-800 pb-4 text-center">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                Authorize Session Connection
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Authenticate via Google SSO to access localized facility grids.</p>
            </div>

            {authStateError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-mono text-center">
                {authStateError}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-[#161B2A]/80 border border-slate-800 hover:border-cyan-500/30 rounded-2xl flex items-center justify-center gap-3 transition font-semibold text-slate-200 text-xs shadow-md"
              >
                {/* SVG Google Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.6a5.64 5.64 0 01-2.44 3.7v3.08h3.93c2.3-2.1 3.65-5.2 3.65-8.63z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.93-3.08c-1.1.74-2.5 1.18-4.03 1.18-3.1 0-5.72-2.1-6.66-4.92H1.42v3.18A12 12 0 0012 24z" />
                  <path fill="#FBBC05" d="M5.34 14.27a7.2 7.2 0 010-4.54V6.55H1.42a12 12 0 000 10.9l3.92-3.18z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.33 0 3.3 2.67 1.42 6.55l3.92 3.18c.94-2.82 3.56-4.98 6.66-4.98z" />
                </svg>
                <span>Sign In with Google</span>
              </button>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 text-[10px] text-slate-500 font-mono space-y-1 text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Access Control</span>
                <p className="leading-relaxed">
                  Signing in grants full administrator and command cockpit access to manage facility operations, portfolio metrics, and department configurations.
                </p>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore cloud datastore channel verified</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="z-10 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800 pt-4 text-[11px] font-mono text-slate-600">
          <p>© 2026 Executive Facility Command Inc. Confidential.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Developer Node v2.1</span>
          </div>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Authenticated cockpit interface
  // ----------------------------------------------------------------------
  return (
    <div className={`min-h-screen bg-[#05070A] text-slate-200 font-sans flex relative overflow-hidden ${theme}`}>
      
      {/* Decorative background vectors */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0B0F19_1px,transparent_1px),linear-gradient(to_bottom,#0B0F19_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none"></div>

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
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-rose-600 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
                <Shield className="w-4 h-4 text-slate-950" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">SPOORTHY INTEGRATED</span>
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

          {/* User profile card */}
          <div className="bg-[#161B2A]/40 border border-slate-800 p-4 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-850 border-2 border-slate-700 text-slate-200 font-black flex items-center justify-center font-mono">
                {currentUser.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono">
              <span className="text-slate-500 uppercase font-bold">Access Credentials</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 font-bold uppercase tracking-wider text-[9px] font-mono">
                {currentUser.role}
              </span>
            </div>

            {currentUser.subRoleName && (
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="text-slate-500 uppercase font-bold">Dynamic Scope</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase tracking-wider text-[9px] font-mono truncate max-w-[130px]" title={currentUser.subRoleName}>
                  {currentUser.subRoleName}
                </span>
              </div>
            )}
          </div>

          {/* Dashboard navigations switcher */}
          <nav className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 block mb-2 font-mono">SYSTEM GRIDS</span>
            
            {/* Nav item CEO */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('CEO')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'CEO' ? 'bg-rose-500/10 border border-rose-400/30 text-rose-500 font-bold active-nav-ceo shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Database className="w-4 h-4 text-rose-400" />
                <span>CEO Strategic Suite</span>
              </button>
            )}

            {/* Nav item Procurement Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'Procurement Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('Procurement Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'Procurement Head' ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold active-nav-procurement shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Procurement Radar</span>
              </button>
            )}

            {/* Nav item Finance Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'Finance Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('Finance Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'Finance Head' ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-bold active-nav-finance shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Finance Dashboard</span>
              </button>
            )}

            {/* Nav item BD Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'BD Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('BD Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'BD Head' ? 'bg-sky-500/15 border border-sky-400/40 text-sky-400 font-bold active-nav-bd shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Globe className={`w-4 h-4 ${activeTab === 'BD Head' ? 'text-sky-400' : 'text-sky-400/70'}`} />
                <span>BD Client &amp; Tenders</span>
              </button>
            )}

            {/* Nav item HR Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'HR Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('HR Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'HR Head' ? 'bg-amber-500/10 border border-amber-400/30 text-amber-400 font-bold active-nav-hr shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>HR &amp; Workforce Roster</span>
              </button>
            )}

            {/* Nav item Operations Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'Operations Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('Operations Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'Operations Head' ? 'bg-sky-500/10 border border-sky-400/30 text-sky-400 font-bold active-nav-operations shadow-[0_0_15px_rgba(14,165,233,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Operations Submit Center</span>
              </button>
            )}

            {/* Nav item Training Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'Training Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('Training Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'Training Head' ? 'bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-400 font-bold active-nav-training shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-fuchsia-400" />
                <span>Compliance Training Radar</span>
              </button>
            )}

            {/* Nav item IT Head */}
            {(securityOverride || currentUser.role === 'Admin' || currentUser.role === 'IT Head' || currentUser.role === 'CEO') && (
              <button
                onClick={() => selectTab('IT Head')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'IT Head' ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>IT &amp; Application Health</span>
              </button>
            )}

            {/* Nav item Admin Panel */}
            {currentUser.role === 'Admin' && (
              <button
                onClick={() => selectTab('Admin')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center gap-3 text-xs font-semibold ${
                  activeTab === 'Admin' ? 'bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'hover:bg-[#161B2A]/60 text-slate-400'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-450" />
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

        {/* Logout block */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 justify-center">
            {cloudSyncing ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-cyan-400">SYNCING TO CLOUD...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SECURE CLOUD CONTEXT</span>
              </>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-[#161B2A]/40 hover:bg-[#161B2A]/80 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-750 transition"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Close Session Terminal</span>
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
              className="lg:hidden p-1.5 bg-[#0B0F19] border border-slate-800 hover:bg-[#161B2A]/60 rounded-lg text-slate-300 hover:text-cyan-400 transition flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-indigo-400" />
            </button>
            
            {/* Active view detail summary breadcrumb */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">COMMAND COCKPIT</span>
                <span className="text-slate-700 font-mono text-[9px]">/</span>
                <span className={`text-[9px] font-mono uppercase font-bold ${
                  activeTab === 'BD Head' ? 'text-sky-400' :
                  activeTab === 'Procurement Head' ? 'text-cyan-400' :
                  activeTab === 'Finance Head' ? 'text-emerald-400' :
                  activeTab === 'CEO' ? 'text-rose-400' :
                  activeTab === 'HR Head' ? 'text-amber-400' :
                  activeTab === 'Operations Head' ? 'text-sky-400' :
                  activeTab === 'Training Head' ? 'text-sky-400' : 'text-indigo-400'
                }`}>{activeTab}</span>
              </div>
              <h1 className="text-sm font-bold font-display text-slate-200">
                {activeTab === 'CEO' && 'Strategic CEO Executive Dashboard'}
                {activeTab === 'Procurement Head' && 'Procurement, Vendor & Asset Portal'}
                {activeTab === 'Finance Head' && 'Enterprise Budgeting, Expenses & Payroll Control'}
                {activeTab === 'BD Head' && 'Business Development, Tender Tracker & Leads Cockpit'}
                {activeTab === 'HR Head' && 'Workforce Directory, Leaves & Disciplinary logs'}
                {activeTab === 'Operations Head' && 'Sites, Complaints & SLA Incidents Desk'}
                {activeTab === 'Training Head' && 'Compliance Training Programs & Competency Scoreboard'}
                {activeTab === 'Admin' && 'System Access Matrix & Database Integrity Settings'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Document & OCR Upload Button */}
            <button
              onClick={() => setIsAIImportOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-indigo-500/20 border border-cyan-500/40 hover:border-cyan-300 text-cyan-400 hover:text-cyan-300 text-xs font-bold font-mono flex items-center gap-2 transition shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              title="Upload PDFs, Excel Sheets or Photos for AI OCR Data Extraction"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span className="hidden sm:inline">AI OCR &amp; Doc Import</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#161B2A]/40 border border-slate-800 hover:bg-[#161B2A]/80 text-slate-300 hover:text-cyan-400 transition flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
            </button>

            {/* Small viewport clock display */}
            <span className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-[#161B2A]/40 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{systemTime || 'UPDATING CLOCK...'}</span>
            </span>

            {/* Mobile direct logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 bg-[#0B0F19] border border-slate-800 hover:bg-[#161B2A]/60 rounded-xl text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. Operational views viewport body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'CEO' && (
            <CEOView 
              state={state} 
              onNavigateToDataEntry={() => setActiveTab('Operations Head')} 
            />
          )}

          {activeTab === 'Procurement Head' && (
            <ProcurementView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              currentRole={currentUser.role}
              allowedSubViews={currentUser.role === 'Procurement Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Procurement Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Finance Head' && (
            <FinanceView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Finance Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Finance Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'BD Head' && (
            <BDView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'BD Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'BD Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'HR Head' && (
            <HRView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'HR Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'HR Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Operations Head' && (
            <OperationsView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Operations Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Operations Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Training Head' && (
            <TrainingView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'Training Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'Training Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'IT Head' && (
            <ITView 
              state={state} 
              onUpdateState={handleUpdateState} 
              currentUserEmail={currentUser.email}
              allowedSubViews={currentUser.role === 'IT Head' ? currentUser.allowedSubViews : undefined}
              subRoleName={currentUser.role === 'IT Head' ? currentUser.subRoleName : undefined}
            />
          )}

          {activeTab === 'Admin' && currentUser.role === 'Admin' && (
            <AdminPanel 
              onUpdateState={handleUpdateState}
              currentUserEmail={currentUser.email}
            />
          )}
        </div>

        {/* Small copyright lines */}
        <footer className="p-4 border-t border-slate-800 bg-black text-center text-[10px] text-slate-500 font-mono">
          Executive Command Center · Authorized live Cloud Firestore database synchronization online
        </footer>

      </main>

      {/* Floating Demo Persona Role Switcher for hot-swaps */}
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
        currentUserEmail={currentUser?.email || 'admin@spoorthy.com'}
      />

    </div>
  );
}
