import React, { useState, useEffect } from 'react';
import { 
  Palette, Sparkles, Check, Sliders, Sun, Moon, 
  RotateCcw, Zap, Eye, Compass, Flame, Shield, X, Maximize2 
} from 'lucide-react';
import { 
  COLOR_PALETTES, 
  PALETTE_CATEGORIES, 
  PaletteCategory, 
  ThemePalette, 
  UserThemeConfig, 
  loadSavedThemeConfig, 
  saveThemeConfig, 
  applyThemeToDOM,
  AuraIntensity,
  SurfaceAtmosphere
} from '../lib/themeEngine';

interface ThemeColorStudioProps {
  onPaletteChange?: (palette: ThemePalette) => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
}

export default function ThemeColorStudio({
  onPaletteChange,
  themeMode = 'dark',
  onToggleThemeMode
}: ThemeColorStudioProps) {
  const [config, setConfig] = useState<UserThemeConfig>(() => loadSavedThemeConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PaletteCategory>('cool');
  const [customHexInput, setCustomHexInput] = useState<string>('#00f0ff');
  const [activePalette, setActivePalette] = useState<ThemePalette>(() => {
    const loaded = loadSavedThemeConfig();
    return applyThemeToDOM(loaded, themeMode === 'light');
  });

  // Apply theme to DOM whenever config or themeMode changes
  useEffect(() => {
    const pal = applyThemeToDOM(config, themeMode === 'light');
    setActivePalette(pal);
    saveThemeConfig(config);
    if (onPaletteChange) {
      onPaletteChange(pal);
    }
  }, [config, themeMode]);

  const handleSelectPalette = (paletteId: string) => {
    setConfig(prev => ({
      ...prev,
      paletteId,
      chromaFlow: paletteId === 'quantum' ? true : prev.chromaFlow
    }));
  };

  const handleApplyCustomColor = (hex: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex) && !/^#[0-9A-Fa-f]{3}$/.test(hex)) return;
    setConfig(prev => ({
      ...prev,
      paletteId: 'custom',
      customHex: hex
    }));
  };

  const handleAuraChange = (auraIntensity: AuraIntensity) => {
    setConfig(prev => ({ ...prev, auraIntensity }));
  };

  const handleSurfaceChange = (surfaceAtmosphere: SurfaceAtmosphere) => {
    setConfig(prev => ({ ...prev, surfaceAtmosphere }));
  };

  const handleToggleChroma = () => {
    setConfig(prev => ({ ...prev, chromaFlow: !prev.chromaFlow }));
  };

  const handleReset = () => {
    const defaultConfig: UserThemeConfig = {
      paletteId: 'cyan',
      auraIntensity: 'vivid',
      surfaceAtmosphere: 'obsidian',
      chromaFlow: false
    };
    setConfig(defaultConfig);
    setCustomHexInput('#00f0ff');
  };

  // Quick 6 trending palettes for instant header access
  const QUICK_PALETTES = ['cyan', 'rose', 'emerald', 'violet', 'amber', 'gold'];

  return (
    <div className="flex items-center gap-2 relative">
      {/* ── 1. Quick Swatches Strip (1-Click Instant Change) ─────────────── */}
      <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-inner">
        {QUICK_PALETTES.map(id => {
          const pal = COLOR_PALETTES.find(p => p.id === id);
          if (!pal) return null;
          const isSelected = config.paletteId === id;
          return (
            <button
              key={id}
              onClick={() => handleSelectPalette(id)}
              className="relative p-1 rounded-full group transition-all duration-200 hover:scale-125 focus:outline-none"
              title={`${pal.label} (${pal.category})`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full block transition-all duration-300 ${
                  isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})`,
                  boxShadow: isSelected ? `0 0 10px ${pal.glow}` : 'none'
                }}
              />
            </button>
          );
        })}
      </div>

      {/* ── 2. Master Theme Studio Button ───────────────────────────────── */}
      <button
        id="color-palette-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="px-3 py-1.5 rounded-xl bg-[#161B2A]/60 hover:bg-[#161B2A]/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all duration-200 flex items-center gap-2 group shadow-sm hover:shadow-md cursor-pointer"
        title="Open Theme Studio (Colors, Ambient Aura & Latest Features)"
      >
        <span
          className="w-3.5 h-3.5 rounded-full block shrink-0 animate-pulse transition-all duration-300"
          style={{
            backgroundColor: activePalette.primary,
            boxShadow: `0 0 10px ${activePalette.glow}`
          }}
        />
        <Palette className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" style={{ color: activePalette.primary }} />
        <span className="text-xs font-semibold font-mono hidden sm:inline">Color Studio</span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
          {activePalette.label}
        </span>
      </button>

      {/* ── 3. Theme Studio Modal / Studio Drawer ───────────────────────── */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Modal Container */}
          <div 
            id="color-studio-modal"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[94vw] max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0B0F19]/95 border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-6 text-slate-200 animate-fadeIn"
            style={{
              boxShadow: `0 20px 60px ${activePalette.glow}, 0 0 0 1px rgba(255,255,255,0.08)`
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${activePalette.primary}, ${activePalette.secondary})`,
                    boxShadow: `0 0 16px ${activePalette.glow}`
                  }}
                >
                  <Palette className="w-5 h-5 text-slate-950 font-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black font-display tracking-tight text-white">
                      EXECUTIVE COLOR STUDIO 2026
                    </h2>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${activePalette.primary}20`,
                        color: activePalette.primary,
                        borderColor: `${activePalette.primary}50`
                      }}
                    >
                      {activePalette.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any color to transform the entire application, aura lighting, charts, and metrics in real time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Preview Strip */}
            <div 
              className="mt-4 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: `${activePalette.primary}40`,
                boxShadow: `0 0 20px ${activePalette.ambient}`
              }}
            >
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: activePalette.glow }}
              />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-slate-950"
                    style={{ background: `linear-gradient(135deg, ${activePalette.primary}, ${activePalette.secondary})` }}
                  >
                    SIS
                  </div>
                  <div>
                    <span className="font-bold text-white block">Active Harmony Preview</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Primary: <strong style={{ color: activePalette.primary }}>{activePalette.primary}</strong> • Glow: <strong>Active</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    className="px-3 py-1.5 rounded-xl font-bold text-xs font-mono transition"
                    style={{
                      backgroundColor: `${activePalette.primary}25`,
                      color: activePalette.primary,
                      border: `1px solid ${activePalette.primary}60`
                    }}
                  >
                    Button State
                  </button>
                  <span 
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: activePalette.primary,
                      color: '#05070a'
                    }}
                  >
                    100% Synced
                  </span>
                </div>
              </div>
            </div>

            {/* ── Category Filter Tabs ──────────────────────────────────── */}
            <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
              {(Object.keys(PALETTE_CATEGORIES) as PaletteCategory[]).map(cat => {
                const isCatActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isCatActive 
                        ? 'bg-white/10 text-white border border-white/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={isCatActive ? { borderColor: activePalette.primary, color: activePalette.primary } : undefined}
                  >
                    <span>{PALETTE_CATEGORIES[cat].icon}</span>
                    <span>{PALETTE_CATEGORIES[cat].label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Palette Grid for Active Category ──────────────────────── */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COLOR_PALETTES.filter(p => p.category === selectedCategory).map(palette => {
                const isSelected = config.paletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    id={`palette-btn-${palette.id}`}
                    onClick={() => handleSelectPalette(palette.id)}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3 group relative cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white ring-1'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-white/5 hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isSelected ? palette.primary : undefined,
                      boxShadow: isSelected ? `0 0 15px ${palette.glow}` : 'none'
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-xl shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                        boxShadow: `0 0 10px ${palette.glow}`,
                        border: isSelected ? `2px solid #ffffff` : '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{palette.label}</span>
                        {isSelected && (
                          <span className="text-[11px] font-mono font-bold" style={{ color: palette.primary }}>
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{palette.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Custom Hex & Live Color Wheel Studio ──────────────────── */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                    <Sliders className="w-4 h-4" style={{ color: activePalette.primary }} />
                    CUSTOM STUDIO COLOR PICKER
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    Any Hex Code
                  </span>
                </div>
                {config.paletteId === 'custom' && (
                  <span className="text-xs font-mono font-bold" style={{ color: activePalette.primary }}>
                    Active Custom Color
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                {/* Native HTML5 Color Wheel Input */}
                <div className="relative">
                  <input
                    type="color"
                    value={config.customHex || activePalette.primary}
                    onChange={(e) => {
                      setCustomHexInput(e.target.value);
                      handleApplyCustomColor(e.target.value);
                    }}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-md"
                    title="Click to open color wheel"
                  />
                </div>

                {/* Text Hex input */}
                <div className="flex-1 min-w-[140px] flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700">
                  <span className="text-slate-500 font-mono text-xs">HEX</span>
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    placeholder="#00f0ff"
                    className="bg-transparent text-white font-mono text-xs focus:outline-none w-full"
                  />
                </div>

                <button
                  onClick={() => handleApplyCustomColor(customHexInput)}
                  className="px-4 py-2 rounded-xl text-xs font-bold font-mono transition shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: activePalette.primary,
                    color: '#05070a'
                  }}
                >
                  Apply Custom Color
                </button>
              </div>
            </div>

            {/* ── Latest Feature Controls: Ambient Aura & Chroma Flow ───── */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
              
              {/* Ambient Aura Lighting Intensity */}
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: activePalette.primary }} />
                    Ambient Aura Intensity
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {config.auraIntensity}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['off', 'subtle', 'vivid', 'neon'] as AuraIntensity[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => handleAuraChange(lvl)}
                      className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-xl transition ${
                        config.auraIntensity === lvl
                          ? 'bg-white/15 text-white ring-1'
                          : 'text-slate-500 hover:text-slate-300 bg-white/5'
                      }`}
                      style={config.auraIntensity === lvl ? { borderColor: activePalette.primary, color: activePalette.primary } : undefined}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Atmosphere / OLED Black Mode */}
              <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <Shield className="w-3.5 h-3.5" style={{ color: activePalette.primary }} />
                    Surface Canvas Atmosphere
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {config.surfaceAtmosphere}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['obsidian', 'oled', 'glass'] as SurfaceAtmosphere[]).map(surf => (
                    <button
                      key={surf}
                      onClick={() => handleSurfaceChange(surf)}
                      className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-xl transition ${
                        config.surfaceAtmosphere === surf
                          ? 'bg-white/15 text-white ring-1'
                          : 'text-slate-500 hover:text-slate-300 bg-white/5'
                      }`}
                      style={config.surfaceAtmosphere === surf ? { borderColor: activePalette.primary, color: activePalette.primary } : undefined}
                    >
                      {surf}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quantum Chroma Flow Toggle */}
            <div className="mt-4 p-3 bg-gradient-to-r from-cyan-950/30 via-purple-950/30 to-pink-950/30 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-2 rounded-xl text-white animate-spin" 
                  style={{ animationDuration: '8s', background: 'linear-gradient(135deg, #00f0ff, #8b5cf6, #ec4899)' }}
                >
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block font-mono">Quantum Chroma Flow Mode</span>
                  <span className="text-[10px] text-slate-400">Animated live chromatic rainbow cycle across the whole dashboard</span>
                </div>
              </div>
              <button
                onClick={handleToggleChroma}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  config.chromaFlow 
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {config.chromaFlow ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Studio Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Cyber Cyan</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl font-bold font-mono text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{
                  backgroundColor: activePalette.primary,
                  boxShadow: `0 0 16px ${activePalette.glow}`
                }}
              >
                Done / Save Studio
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
