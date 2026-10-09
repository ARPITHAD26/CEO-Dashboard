import React, { useState } from 'react';
import {
  Shield, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2,
  AlertTriangle, KeyRound, Sparkles, Database, Laptop, Users,
  GraduationCap, MapPin, Globe, Clock, Cpu, ShieldCheck
} from 'lucide-react';
import { STANDARD_USERS, authenticateUser, StandardUserCredentials } from '../data/authConfig';
import { UserAccount, Role } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!identifier.trim()) { setErrorMsg('Please enter your standard username or email address.'); return; }
    if (!password.trim()) { setErrorMsg('Please enter your account password.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      const user = authenticateUser(identifier, password);
      if (user) { setIsLoading(false); onLoginSuccess(user); }
      else { setIsLoading(false); setErrorMsg('Invalid credentials. Please verify standard username and password.'); }
    }, 350);
  };

  const handlePresetSelect = (preset: StandardUserCredentials) => {
    setIdentifier(preset.username);
    setPassword(preset.password);
    setSelectedPreset(preset.role);
    setErrorMsg(null);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'CEO': return Database;
      case 'Admin': return Shield;
      case 'Procurement Head': return Cpu;
      case 'Finance Head': return Clock;
      case 'BD Head': return Globe;
      case 'HR Head': return Users;
      case 'Operations Head': return MapPin;
      case 'Training Head': return GraduationCap;
      case 'IT Head': return Laptop;
      default: return ShieldCheck;
    }
  };

  const fullAccessUsers = STANDARD_USERS.filter(u => u.fullAccess);
  const restrictedUsers = STANDARD_USERS.filter(u => !u.fullAccess).sort((a, b) => a.role.localeCompare(b.role));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg,#f8faff 0%,#eef2ff 30%,#faf5ff 60%,#f0fdf4 100%)', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)', borderRadius: '50%' }} />
        <svg width="100%" height="100%" style={{ opacity: 0.35 }}>
          <defs><pattern id="lgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="0.3" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#lgrid)" />
        </svg>
      </div>

      <header style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 1px 20px rgba(99,102,241,0.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '14px', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>
            <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase' as const, fontFamily: 'monospace' }}>SPOORTHY SAMANVAYA</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em' }}>SPOORTHY SAMANVAYA</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '11px', fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
            RBAC ACCESS ENFORCED
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', background: 'rgba(243,244,246,0.8)', padding: '5px 12px', borderRadius: '999px', border: '1px solid #e5e7eb' }}>v2.4 Enterprise</div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px,400px) 1fr', gap: '28px', width: '100%', alignItems: 'start' }}>

          <div>
            {/* ── Standard Username / Password Card ────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 8px 40px rgba(99,102,241,0.12),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

              <div style={{ height: '4px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)' }} />
              <div style={{ padding: '30px' }}>
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <KeyRound style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#6366f1', textTransform: 'uppercase' as const, fontFamily: 'monospace' }}>Secure Session Portal</span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.03em', margin: 0 }}>Sign In to Dashboard</h2>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: 1.6, marginBottom: 0 }}>Authenticate using standard role credentials. Access privileges are strictly isolated per role.</p>
                </div>

                {errorMsg && (
                  <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '12px', color: '#dc2626', lineHeight: 1.5 }}>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#374151', marginBottom: '6px', fontFamily: 'monospace' }}>Standard Username or Email</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                        <User style={{ width: '14px', height: '14px' }} />
                      </div>
                      <input id="login-username" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="e.g. admin, ceo, finance, hr" autoComplete="username"
                        style={{ width: '100%', boxSizing: 'border-box' as const, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13px', color: '#111827', fontFamily: 'monospace', outline: 'none' }}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#ffffff'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#374151', marginBottom: '6px', fontFamily: 'monospace' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                        <Lock style={{ width: '14px', height: '14px' }} />
                      </div>
                      <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter standard password" autoComplete="current-password"
                        style={{ width: '100%', boxSizing: 'border-box' as const, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', paddingLeft: '38px', paddingRight: '42px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13px', color: '#111827', fontFamily: 'monospace', outline: 'none' }}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#ffffff'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
                      />
                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                        {showPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                      </button>
                    </div>
                  </div>

                  {selectedPreset && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#6366f1' }}>
                      <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                      <span>Selected preset: <strong>{selectedPreset}</strong></span>
                    </div>
                  )}

                  <button type="submit" id="login-submit-btn" disabled={isLoading}
                    style={{ marginTop: '4px', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(99,102,241,0.35)', transition: 'all 0.2s', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? (
                      <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'lspin 0.8s linear infinite' }} />Authenticating Credentials...</>
                    ) : (
                      <>Enter Executive Cockpit<ArrowRight style={{ width: '14px', height: '14px' }} /></>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ShieldCheck style={{ width: '13px', height: '13px', color: '#6366f1' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#374151', fontFamily: 'monospace' }}>Access Matrix Notice</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 6px' }}><strong>Admin &amp; CEO:</strong> Full unrestricted privileges to view all 9 operational pages and sub-modules.</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}><strong>Department Heads:</strong> Restricted to their designated operational dashboard only.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles style={{ width: '15px', height: '15px', color: '#6366f1' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Standard Role Credentials</h3>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Click any standard persona below to auto-fill the login form instantly.</p>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '5px 14px', borderRadius: '999px' }}>9 Standard Personas</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#059669', fontFamily: 'monospace' }}>Tier 1 · Full Unrestricted Access (All Pages &amp; Modules)</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(16,185,129,0.4),transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {fullAccessUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);
                  const isSel = selectedPreset === user.role;
                  return (
                    <div key={user.role} onClick={() => handlePresetSelect(user)}
                      style={{ padding: '16px', borderRadius: '16px', border: isSel ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb', background: isSel ? 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))' : 'rgba(255,255,255,0.9)', boxShadow: isSel ? '0 4px 20px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                      {isSel && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          {user.role === 'CEO' ? (
                            <img 
                              src="/ceo-profile.jpg" 
                              alt="CEO" 
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '10px', 
                                objectFit: 'cover', 
                                objectPosition: 'top', 
                                border: '1.5px solid #d97706', 
                                boxShadow: '0 2px 8px rgba(217,119,6,0.3)', 
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }} 
                            />
                          ) : (
                            <div style={{ padding: '8px', borderRadius: '11px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 3px 10px rgba(99,102,241,0.28)', flexShrink: 0 }}>
                              <Icon style={{ width: '13px', height: '13px', color: 'white' }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b' }}>{user.role}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user.name}</div>
                          </div>
                        </div>
                        <span style={{ padding: '3px 7px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' as const, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)', flexShrink: 0 }}>ALL PAGES</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user.description}</p>
                      <div style={{ paddingTop: '9px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace' }}>
                        <div style={{ color: '#6b7280' }}>
                          User: <strong style={{ color: '#374151' }}>{user.username}</strong>
                          <span style={{ margin: '0 5px', color: '#d1d5db' }}>•</span>
                          Pass: <strong style={{ color: '#374151' }}>{user.password}</strong>
                        </div>
                        <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '11px' }}>Select →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#d97706', fontFamily: 'monospace' }}>Tier 2 · Role-Restricted Access (Assigned Vertical Only)</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(245,158,11,0.4),transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px' }}>
                {restrictedUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);
                  const isSel = selectedPreset === user.role;
                  return (
                    <div key={user.role} onClick={() => handlePresetSelect(user)}
                      style={{ padding: '13px', borderRadius: '14px', border: isSel ? '1.5px solid #f59e0b' : '1.5px solid #e5e7eb', background: isSel ? 'linear-gradient(135deg,rgba(245,158,11,0.07),rgba(251,191,36,0.04))' : 'rgba(255,255,255,0.9)', boxShadow: isSel ? '0 4px 16px rgba(245,158,11,0.15)' : '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', minWidth: 0 }}>
                          {user.role === 'Training Head' ? (
                            <img
                              src="/training-head-profile.jpg"
                              alt="Training Head"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                border: '1.5px solid #d946ef',
                                boxShadow: '0 2px 8px rgba(217,70,239,0.3)',
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                            />
                          ) : user.role === 'Finance Head' ? (
                            <img
                              src="/finance-head-profile.jpg"
                              alt="Finance Head"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                border: '1.5px solid #10b981',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                            />
                          ) : user.role === 'HR Head' ? (
                            <img
                              src="/hr-head-profile.jpg"
                              alt="HR Head"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                border: '1.5px solid #f59e0b',
                                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                            />
                          ) : user.role === 'BD Head' ? (
                            <img
                              src="/bd-head-profile.jpg"
                              alt="BD Head"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                border: '1.5px solid #38bdf8',
                                boxShadow: '0 2px 8px rgba(56,189,248,0.3)',
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                            />
                          ) : user.role === 'Procurement Head' ? (
                            <img
                              src="/procurement-head-profile.jpg"
                              alt="Procurement Head"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                border: '1.5px solid #06b6d4',
                                boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
                                flexShrink: 0,
                                imageRendering: '-webkit-optimize-contrast'
                              }}
                            />
                          ) : (
                            <div style={{ padding: '7px', borderRadius: '10px', background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', flexShrink: 0 }}>
                              <Icon style={{ width: '12px', height: '12px', color: 'white' }} />
                            </div>
                          )}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user.role}</span>
                        </div>
                        <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' as const, background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '7px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          Restricted: {user.role.replace(' Head', '')} Only
                        </span>
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{user.description}</p>
                      </div>
                      <div style={{ paddingTop: '9px', marginTop: '9px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px', fontFamily: 'monospace' }}>
                        <span style={{ color: '#6b7280' }}><strong style={{ color: '#374151' }}>{user.username}</strong> / {user.password}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>Fill →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99,102,241,0.1)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af' }}>
        <div>Spoorthy Integrated Executive DSS · Strict Multi-Tenant RBAC Security System</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Enterprise Confidential</span>
          <span style={{ color: '#d1d5db' }}>•</span>
          <span>Security Protocol 800-53</span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes lspin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
