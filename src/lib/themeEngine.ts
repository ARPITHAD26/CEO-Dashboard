// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTIVE DSS DYNAMIC THEME & COLOR STUDIO ENGINE (2026 EDITION)
// ═══════════════════════════════════════════════════════════════════════════════

export type PaletteCategory = 'cool' | 'warm' | 'neon' | 'luxury' | 'special';
export type AuraIntensity = 'off' | 'subtle' | 'vivid' | 'neon';
export type SurfaceAtmosphere = 'obsidian' | 'oled' | 'glass';

export interface ThemePalette {
  id: string;
  label: string;
  category: PaletteCategory;
  primary: string;
  secondary: string;
  glow: string;
  ambient: string;
  description: string;
  isSpecial?: boolean;
}

export interface UserThemeConfig {
  paletteId: string;
  customHex?: string;
  auraIntensity: AuraIntensity;
  surfaceAtmosphere: SurfaceAtmosphere;
  chromaFlow: boolean;
}

export const PALETTE_CATEGORIES: Record<PaletteCategory, { label: string; icon: string }> = {
  cool: { label: 'Cool Tones', icon: '❄️' },
  warm: { label: 'Warm Energy', icon: '🔥' },
  neon: { label: 'Electric & Neon', icon: '⚡' },
  luxury: { label: 'Luxury & Stealth', icon: '💎' },
  special: { label: 'Special Editions', icon: '✨' },
};

export const COLOR_PALETTES: ThemePalette[] = [
  // ── Cool Tones ──
  {
    id: 'cyan',
    label: 'Cyber Cyan',
    category: 'cool',
    primary: '#00f0ff',
    secondary: '#0ea5e9',
    glow: 'rgba(0, 240, 255, 0.45)',
    ambient: 'rgba(0, 240, 255, 0.16)',
    description: 'High-contrast cyberpunk cyan with arctic edge',
  },
  {
    id: 'sky',
    label: 'Arctic Sky',
    category: 'cool',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    glow: 'rgba(14, 165, 233, 0.4)',
    ambient: 'rgba(14, 165, 233, 0.15)',
    description: 'Crisp glacial blue with clean contrast',
  },
  {
    id: 'azure',
    label: 'Deep Azure',
    category: 'cool',
    primary: '#2563eb',
    secondary: '#60a5fa',
    glow: 'rgba(37, 99, 235, 0.4)',
    ambient: 'rgba(37, 99, 235, 0.15)',
    description: 'Executive corporate sapphire & cobalt',
  },
  {
    id: 'teal',
    label: 'Matrix Teal',
    category: 'cool',
    primary: '#14b8a6',
    secondary: '#2dd4bf',
    glow: 'rgba(20, 184, 166, 0.4)',
    ambient: 'rgba(20, 184, 166, 0.15)',
    description: 'Deep oceanic turquoise and bioluminescent teal',
  },
  {
    id: 'indigo',
    label: 'Deep Indigo',
    category: 'cool',
    primary: '#6366f1',
    secondary: '#818cf8',
    glow: 'rgba(99, 102, 241, 0.45)',
    ambient: 'rgba(99, 102, 241, 0.16)',
    description: 'Cosmic deep indigo and stellar violet',
  },

  // ── Warm Energy ──
  {
    id: 'rose',
    label: 'Crimson Rose',
    category: 'warm',
    primary: '#f43f5e',
    secondary: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.45)',
    ambient: 'rgba(244, 63, 94, 0.16)',
    description: 'Electric laser rose with razor sharpness',
  },
  {
    id: 'amber',
    label: 'Solar Amber',
    category: 'warm',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.45)',
    ambient: 'rgba(245, 158, 11, 0.16)',
    description: 'Warm solar flare gold & incandescent amber',
  },
  {
    id: 'sunset',
    label: 'Sunset Magma',
    category: 'warm',
    primary: '#f97316',
    secondary: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.45)',
    ambient: 'rgba(249, 115, 22, 0.16)',
    description: 'High-energy volcanic sunset orange',
  },
  {
    id: 'ruby',
    label: 'Phoenix Ruby',
    category: 'warm',
    primary: '#ef4444',
    secondary: '#f87171',
    glow: 'rgba(239, 68, 68, 0.45)',
    ambient: 'rgba(239, 68, 68, 0.16)',
    description: 'Intense tactical command red',
  },
  {
    id: 'pink',
    label: 'Coral Bloom',
    category: 'warm',
    primary: '#ec4899',
    secondary: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.45)',
    ambient: 'rgba(236, 72, 153, 0.16)',
    description: 'Luminous synthwave coral pink',
  },

  // ── Electric & Neon ──
  {
    id: 'emerald',
    label: 'Matrix Emerald',
    category: 'neon',
    primary: '#10b981',
    secondary: '#34d399',
    glow: 'rgba(16, 185, 129, 0.45)',
    ambient: 'rgba(16, 185, 129, 0.16)',
    description: 'Iconic cyber terminal matrix green',
  },
  {
    id: 'violet',
    label: 'Royal Violet',
    category: 'neon',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.45)',
    ambient: 'rgba(139, 92, 246, 0.16)',
    description: 'Futuristic ultraviolet neon & purple',
  },
  {
    id: 'fuchsia',
    label: 'Neon Fuchsia',
    category: 'neon',
    primary: '#d946ef',
    secondary: '#e879f9',
    glow: 'rgba(217, 70, 239, 0.45)',
    ambient: 'rgba(217, 70, 239, 0.16)',
    description: 'Hyper-vibrant vaporwave fuchsia pulse',
  },
  {
    id: 'lime',
    label: 'Electric Lime',
    category: 'neon',
    primary: '#84cc16',
    secondary: '#a3e635',
    glow: 'rgba(132, 204, 22, 0.45)',
    ambient: 'rgba(132, 204, 22, 0.16)',
    description: 'High-visibility bio-acid lime',
  },
  {
    id: 'amethyst',
    label: 'Ultra Amethyst',
    category: 'neon',
    primary: '#a855f7',
    secondary: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.45)',
    ambient: 'rgba(168, 85, 247, 0.16)',
    description: 'Electric laser purple with royal radiance',
  },

  // ── Luxury & Stealth ──
  {
    id: 'gold',
    label: 'Imperial Gold',
    category: 'luxury',
    primary: '#ca8a04',
    secondary: '#facc15',
    glow: 'rgba(202, 138, 4, 0.45)',
    ambient: 'rgba(202, 138, 4, 0.16)',
    description: 'Prestige 24-karat executive gold',
  },
  {
    id: 'champagne',
    label: 'Champagne Bronze',
    category: 'luxury',
    primary: '#d97706',
    secondary: '#fde047',
    glow: 'rgba(217, 119, 6, 0.4)',
    ambient: 'rgba(217, 119, 6, 0.15)',
    description: 'Warm aristocratic champagne and bronze',
  },
  {
    id: 'slate',
    label: 'Stealth Slate',
    category: 'luxury',
    primary: '#64748b',
    secondary: '#94a3b8',
    glow: 'rgba(100, 116, 139, 0.35)',
    ambient: 'rgba(100, 116, 139, 0.12)',
    description: 'Tactical monochrome titanium slate',
  },
  {
    id: 'zinc',
    label: 'Gunmetal Zinc',
    category: 'luxury',
    primary: '#71717a',
    secondary: '#a1a1aa',
    glow: 'rgba(113, 113, 122, 0.35)',
    ambient: 'rgba(113, 113, 122, 0.12)',
    description: 'Industrial aerospace gunmetal obsidian',
  },

  // ── Special Editions ──
  {
    id: 'quantum',
    label: 'Quantum Aurora',
    category: 'special',
    primary: '#00f0ff',
    secondary: '#d946ef',
    glow: 'rgba(0, 240, 255, 0.45)',
    ambient: 'rgba(217, 70, 239, 0.2)',
    description: 'Dynamic chromatic spectrum flow',
    isSpecial: true,
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk 2077',
    category: 'special',
    primary: '#eab308',
    secondary: '#00f0ff',
    glow: 'rgba(234, 179, 8, 0.45)',
    ambient: 'rgba(0, 240, 255, 0.18)',
    description: 'High-contrast electric cyberpunk yellow & neon cyan',
    isSpecial: true,
  },
  {
    id: 'synthwave',
    label: 'Synthwave Sunset',
    category: 'special',
    primary: '#f43f5e',
    secondary: '#8b5cf6',
    glow: 'rgba(244, 63, 94, 0.45)',
    ambient: 'rgba(139, 92, 246, 0.2)',
    description: 'Retrowave laser magenta & ultraviolet glow',
    isSpecial: true,
  },
  {
    id: 'aurora',
    label: 'Borealis Aurora',
    category: 'special',
    primary: '#10b981',
    secondary: '#a855f7',
    glow: 'rgba(16, 185, 129, 0.45)',
    ambient: 'rgba(168, 85, 247, 0.18)',
    description: 'Northern lights mystic emerald & royal violet',
    isSpecial: true,
  },
  {
    id: 'deepocean',
    label: 'Bioluminescent Abyss',
    category: 'cool',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    glow: 'rgba(6, 182, 212, 0.45)',
    ambient: 'rgba(59, 130, 246, 0.18)',
    description: 'Deep ocean aquatic aqua & twilight blue',
  },
  {
    id: 'rosegold',
    label: 'Rose Gold Royale',
    category: 'luxury',
    primary: '#fb7185',
    secondary: '#fbbf24',
    glow: 'rgba(251, 113, 133, 0.45)',
    ambient: 'rgba(251, 191, 36, 0.18)',
    description: 'Aristocratic rose gold with warm incandescent amber',
  },
];

// Helper: Hex to RGB string 'r, g, b'
export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return `${r}, ${g}, ${b}`;
  }
  return '6, 182, 212';
}

// Generate custom palette from any arbitrary hex
export function createCustomPalette(hex: string): ThemePalette {
  const rgb = hexToRgb(hex);
  // Shift lightness for secondary color
  return {
    id: 'custom',
    label: 'Custom Studio Color',
    category: 'special',
    primary: hex,
    secondary: adjustColorBrightness(hex, 25),
    glow: `rgba(${rgb}, 0.45)`,
    ambient: `rgba(${rgb}, 0.18)`,
    description: `User-defined custom studio color (${hex})`,
  };
}

// Helper: Adjust color brightness by percent
function adjustColorBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

const STORAGE_KEY = 'executive_command_theme_config_v2';

export function loadSavedThemeConfig(): UserThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse theme config, using default', e);
  }
  // Fallback to legacy key if present
  const legacyPalette = localStorage.getItem('executive_command_palette');
  return {
    paletteId: legacyPalette || 'cyan',
    auraIntensity: 'vivid',
    surfaceAtmosphere: 'obsidian',
    chromaFlow: false,
  };
}

export function saveThemeConfig(config: UserThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem('executive_command_palette', config.paletteId);
  } catch (e) {
    console.error('Failed to save theme config', e);
  }
}

/**
 * Injects/updates all global CSS variables and comprehensive class overrides.
 * This guarantees that clicking ANY color alters every single visual element across the entire application.
 */
export function applyThemeToDOM(config: UserThemeConfig, isLight: boolean = false): ThemePalette {
  let activePalette: ThemePalette;

  if (config.paletteId === 'custom' && config.customHex) {
    activePalette = createCustomPalette(config.customHex);
  } else {
    activePalette = COLOR_PALETTES.find(p => p.id === config.paletteId) || COLOR_PALETTES[0];
  }

  const p = activePalette.primary;
  const s = activePalette.secondary;
  const g = activePalette.glow;
  const amb = activePalette.ambient;
  const pr = hexToRgb(p);
  const sr = hexToRgb(s);

  // Set CSS Variables on root
  const root = document.documentElement;
  root.style.setProperty('--accent', p);
  root.style.setProperty('--accent-primary', p);
  root.style.setProperty('--accent-secondary', s);
  root.style.setProperty('--accent-glow', g);
  root.style.setProperty('--accent-ambient', amb);
  root.style.setProperty('--accent-rgb', pr);
  root.style.setProperty('--accent-secondary-rgb', sr);

  // Aura opacity calculation
  let auraAlpha = 0.2;
  if (config.auraIntensity === 'off') auraAlpha = 0;
  else if (config.auraIntensity === 'subtle') auraAlpha = 0.1;
  else if (config.auraIntensity === 'vivid') auraAlpha = 0.28;
  else if (config.auraIntensity === 'neon') auraAlpha = 0.5;

  root.style.setProperty('--aura-alpha', auraAlpha.toString());

  // Surface background adjustments
  let canvasBg = '#05070a';
  let cardBg = '#0b0f19';
  let cardSurface = '#161b2a';
  let borderAlpha = '0.15';

  if (config.surfaceAtmosphere === 'oled') {
    canvasBg = '#000000';
    cardBg = '#050505';
    cardSurface = '#0a0a0a';
    borderAlpha = '0.25';
  } else if (config.surfaceAtmosphere === 'glass') {
    canvasBg = '#060913';
    cardBg = 'rgba(11, 15, 25, 0.75)';
    cardSurface = 'rgba(22, 27, 42, 0.65)';
    borderAlpha = '0.35';
  }

  root.style.setProperty('--theme-canvas-bg', canvasBg);
  root.style.setProperty('--theme-card-bg', cardBg);
  root.style.setProperty('--theme-card-surface', cardSurface);

  // Dynamic style tag
  const STYLE_ID = 'dynamic-palette-overrides';
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const chromaAnimation = config.chromaFlow || activePalette.id === 'quantum' ? `
    @keyframes quantumChroma {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(180deg); }
      100% { filter: hue-rotate(360deg); }
    }
    .quantum-pulse {
      animation: quantumChroma 14s infinite linear !important;
    }
  ` : '';

  styleEl.textContent = `
    /* ═══════════════════════════════════════════════════════════════════════
       EXECUTIVE COMMAND THEME OVERRIDE ENGINE — 2026 EDITION
       Active Palette: ${activePalette.label} (${activePalette.id})
       Primary: ${p} | Secondary: ${s}
       ═══════════════════════════════════════════════════════════════════════ */

    ${chromaAnimation}

    /* ── Global smooth color transition on theme change ───────────────── */
    .theme-transition,
    aside,
    header,
    nav button,
    .kpi-card,
    .accent-icon {
      transition: background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease !important;
    }

    /* ── CSS Variable Utilities ────────────────────────────────────────── */
    :root {
      --primary: ${p};
      --ring: ${p};
      --tw-ring-color: ${p};
    }

    /* ── Canvas, Surfaces & Background Grid Overrides ─────────────────── */
    body,
    #root,
    .bg-\[\#05070A\] {
      background-color: ${canvasBg} !important;
    }
    .bg-\[\#0B0F19\] {
      background-color: ${cardBg} !important;
    }
    .bg-\[\#161B2A\] {
      background-color: ${cardSurface} !important;
    }
    .bg-\[linear-gradient\(to_right\,\#0B0F19_1px\,transparent_1px\)\,linear-gradient\(to_bottom\,\#0B0F19_1px\,transparent_1px\)\] {
      background-image: linear-gradient(to right, rgba(${pr}, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(${pr}, 0.08) 1px, transparent 1px) !important;
    }

    ::selection {
      background-color: ${p} !important;
      color: #05070a !important;
    }

    /* ── Text Color Overrides (Universal Primary & Secondary) ───────────── */
    .text-cyan-50, .text-cyan-100, .text-cyan-200, .text-cyan-300,
    .text-cyan-400, .text-cyan-500, .text-cyan-600, .text-cyan-700,
    .text-indigo-300, .text-indigo-400, .text-indigo-500,
    .text-sky-300, .text-sky-400, .text-sky-500,
    .text-teal-300, .text-teal-400, .text-teal-500,
    .text-blue-400, .text-blue-500, .text-blue-600,
    .dark .dark\:text-cyan-300, .dark .dark\:text-cyan-400, .dark .dark\:text-cyan-500,
    .dark .dark\:text-indigo-300, .dark .dark\:text-indigo-400, .dark .dark\:text-indigo-500,
    .dark .dark\:text-sky-300, .dark .dark\:text-sky-400, .dark .dark\:text-sky-500,
    .dark .dark\:text-blue-300, .dark .dark\:text-blue-400, .dark .dark\:text-blue-500,
    .accent-text {
      color: ${p} !important;
    }

    .text-cyan-200, .text-cyan-100, .text-sky-200, .text-indigo-200, .text-blue-300,
    .dark .dark\:text-cyan-200, .dark .dark\:text-sky-200, .dark .dark\:text-indigo-200 {
      color: ${s} !important;
    }

    /* ── Background Solid Overrides ────────────────────────────────────── */
    .bg-cyan-500, .bg-cyan-600, .bg-cyan-700,
    .bg-indigo-500, .bg-indigo-600, .bg-indigo-700,
    .bg-sky-500, .bg-teal-500,
    .bg-blue-500, .bg-blue-600, .bg-blue-700,
    .accent-bg {
      background-color: ${p} !important;
    }
    .bg-cyan-400, .bg-indigo-400, .bg-sky-400, .bg-teal-400, .bg-blue-400 {
      background-color: ${s} !important;
    }

    /* ── Background with Alpha / Tints ──────────────────────────────────── */
    .bg-cyan-50, .bg-indigo-50, .bg-sky-50, .bg-teal-50, .bg-blue-50 {
      background-color: rgba(${pr}, 0.06) !important;
    }
    .bg-cyan-100, .bg-indigo-100, .bg-sky-100, .bg-blue-100 {
      background-color: rgba(${pr}, 0.10) !important;
    }
    .bg-cyan-500\\/5, .bg-indigo-500\\/5, .bg-sky-500\\/5, .bg-blue-500\\/5 {
      background-color: rgba(${pr}, 0.05) !important;
    }
    .bg-cyan-500\\/10, .bg-cyan-500\\/15, .bg-cyan-500\\/20,
    .bg-indigo-500\\/10, .bg-indigo-500\\/15, .bg-indigo-500\\/20,
    .bg-sky-500\\/10, .bg-sky-500\\/15, .bg-sky-500\\/20,
    .bg-teal-500\\/10, .bg-teal-500\\/20,
    .bg-blue-500\\/10, .bg-blue-500\\/15, .bg-blue-500\\/20 {
      background-color: rgba(${pr}, 0.12) !important;
    }
    .bg-cyan-500\\/25, .bg-cyan-500\\/30, .bg-indigo-500\\/30, .bg-sky-500\\/30, .bg-blue-500\\/30 {
      background-color: rgba(${pr}, 0.25) !important;
    }
    .bg-cyan-600\\/20, .bg-cyan-600\\/10, .bg-blue-600\\/20, .bg-blue-600\\/10 {
      background-color: rgba(${pr}, 0.15) !important;
    }
    .bg-cyan-800, .bg-cyan-900, .bg-cyan-950,
    .bg-cyan-950\\/20, .bg-cyan-950\\/40, .bg-indigo-950\\/40, .bg-blue-950\\/40,
    .dark .dark\:bg-indigo-950\\/50, .dark .dark\:bg-indigo-950\\/60,
    .dark .dark\:bg-cyan-950\\/50, .dark .dark\:bg-cyan-950\\/60,
    .dark .dark\:bg-sky-950\\/50, .dark .dark\:bg-sky-950\\/60,
    .dark .dark\:bg-blue-950\\/50, .dark .dark\:bg-blue-950\\/60,
    .dark .dark\:hover\:bg-indigo-900\\/60:hover,
    .dark .dark\:hover\:bg-cyan-900\\/60:hover {
      background-color: rgba(${pr}, 0.15) !important;
    }

    /* ── Border Overrides ───────────────────────────────────────────────── */
    .border-cyan-300, .border-cyan-400, .border-cyan-500,
    .border-cyan-400\\/30, .border-cyan-500\\/20, .border-cyan-500\\/30, .border-cyan-500\\/40,
    .border-indigo-400\\/30, .border-indigo-500\\/20, .border-indigo-500\\/30, .border-indigo-500\\/40,
    .border-sky-400\\/30, .border-sky-400\\/40, .border-sky-500\\/30,
    .border-blue-400\\/30, .border-blue-500\\/20, .border-blue-500\\/30, .border-blue-500\\/40,
    .dark .dark\:border-indigo-800,
    .dark .dark\:border-cyan-800,
    .dark .dark\:border-sky-800,
    .dark .dark\:border-blue-800,
    .accent-border {
      border-color: rgba(${pr}, 0.35) !important;
    }
    .border-cyan-700\\/50, .border-cyan-500\\/50, .border-cyan-600, .border-blue-600 {
      border-color: rgba(${pr}, 0.55) !important;
    }

    /* ── Hover and Focus States ─────────────────────────────────────────── */
    .hover\\:border-cyan-500\\/30:hover,
    .hover\\:border-cyan-500\\/40:hover,
    .hover\\:border-cyan-500:hover,
    .hover\\:border-indigo-500\\/40:hover,
    .hover\\:border-sky-500\\/30:hover {
      border-color: rgba(${pr}, 0.6) !important;
    }

    .hover\\:bg-cyan-500\\/20:hover,
    .hover\\:bg-cyan-500\\/30:hover,
    .hover\\:bg-indigo-500\\/30:hover {
      background-color: rgba(${pr}, 0.25) !important;
    }

    .hover\\:text-cyan-300:hover,
    .hover\\:text-cyan-400:hover,
    .hover\\:text-cyan-500:hover,
    .hover\\:text-cyan-600:hover,
    .hover\\:text-indigo-400:hover,
    .hover\\:text-sky-400:hover,
    .group-hover\\:text-cyan-300,
    .group-hover\\:text-cyan-600 {
      color: ${p} !important;
    }

    .focus\\:border-cyan-500:focus,
    .focus\\:border-indigo-500:focus,
    .focus\\:border-sky-500:focus {
      border-color: ${p} !important;
      box-shadow: 0 0 0 2px rgba(${pr}, 0.25) !important;
    }

    /* ── Rings & Accents ───────────────────────────────────────────────── */
    .ring-cyan-500, .ring-indigo-500, .ring-sky-500 {
      --tw-ring-color: ${p} !important;
    }
    .ring-cyan-500\\/30, .ring-indigo-500\\/30 {
      --tw-ring-color: rgba(${pr}, 0.3) !important;
    }
    .accent-cyan-500, .accent-indigo-500 {
      accent-color: ${p} !important;
    }

    /* ── Gradients ──────────────────────────────────────────────────────── */
    .from-cyan-500, .from-cyan-400, .from-indigo-500, .from-sky-500, .from-blue-600, .from-blue-500 {
      --tw-gradient-from: ${p} !important;
    }
    .to-sky-500, .to-cyan-400, .to-cyan-500, .to-blue-600, .to-indigo-600 {
      --tw-gradient-to: ${s} !important;
    }
    .via-cyan-500, .via-indigo-500, .via-blue-500 {
      --tw-gradient-stops: var(--tw-gradient-from), ${p}, var(--tw-gradient-to) !important;
    }

    /* ── Glow / Box Shadow Overrides ────────────────────────────────────── */
    .shadow-\\[0_0_15px_rgba\\(6\\,182\\,212\\,0\\.15\\)\\],
    .shadow-\\[0_0_15px_rgba\\(99\\,102\\,241\\,0\\.15\\)\\],
    .shadow-\\[0_0_15px_rgba\\(56\\,189\\,248\\,0\\.2\\)\\],
    .shadow-\\[0_0_15px_rgba\\(14\\,165\\,233\\,0\\.15\\)\\] {
      box-shadow: 0 0 16px ${g} !important;
    }
    .accent-glow-sm {
      box-shadow: 0 0 12px ${g} !important;
    }
    .accent-glow-lg {
      box-shadow: 0 0 24px ${g} !important;
    }

    /* ── Recharts & SVG Overrides ───────────────────────────────────────── */
    .recharts-line .recharts-curve[stroke="#06b6d4"],
    .recharts-line .recharts-curve[stroke="#0ea5e9"],
    .recharts-line .recharts-curve[stroke="#6366f1"],
    .recharts-line .recharts-curve[stroke="#3B82F6"] {
      stroke: ${p} !important;
    }
    .recharts-bar-rectangle path[fill="#3B82F6"],
    .recharts-bar-rectangle path[fill="#06b6d4"] {
      fill: ${p} !important;
    }
    .recharts-area-area[fill="#10B981"],
    .recharts-area-area[fill="#06b6d4"] {
      fill: ${p} !important;
      fill-opacity: 0.18 !important;
    }
    .recharts-area-curve[stroke="#10B981"],
    .recharts-area-curve[stroke="#06b6d4"] {
      stroke: ${p} !important;
    }

    /* ── Animations ─────────────────────────────────────────────────────── */
    .animate-ping[class*="bg-cyan"], .animate-pulse[class*="bg-cyan"],
    .animate-ping[class*="bg-indigo"], .animate-pulse[class*="bg-indigo"] {
      background-color: ${p} !important;
    }

    /* ── Navigation Active Highlights (Dark & Light) ────────────────────── */
    .active-nav-item,
    .active-nav-ceo,
    .active-nav-procurement,
    .active-nav-bd,
    .active-nav-operations,
    .active-nav-hr,
    .active-nav-training,
    .active-nav-it {
      background-color: rgba(${pr}, 0.12) !important;
      border-color: rgba(${pr}, 0.45) !important;
      color: ${p} !important;
      box-shadow: 0 0 15px ${g} !important;
    }

    /* ── Light Mode Harmonization ──────────────────────────────────────── */
    .light .active-nav-ceo,
    .light .active-nav-procurement,
    .light .active-nav-bd,
    .light .active-nav-operations,
    .light .active-nav-hr,
    .light .active-nav-training,
    .light .active-nav-it,
    .light .active-nav-gm {
      background-color: rgba(${pr}, 0.10) !important;
      border-color: rgba(${pr}, 0.35) !important;
      color: ${p} !important;
    }

    .light .hover\\:border-cyan-500\\/30:hover,
    .light .hover\\:border-cyan-500\\/40:hover,
    .light .hover\\:border-indigo-500\\/40:hover {
      border-color: rgba(${pr}, 0.45) !important;
    }

    /* ── Ambient Backdrop Glow Orb ──────────────────────────────────────── */
    .ambient-aurora-orb-top {
      background: radial-gradient(circle, rgba(${pr}, ${auraAlpha}) 0%, transparent 70%) !important;
    }
    .ambient-aurora-orb-bottom {
      background: radial-gradient(circle, rgba(${sr}, ${auraAlpha * 0.75}) 0%, transparent 70%) !important;
    }
    .ambient-grid-lines {
      background-image: linear-gradient(to right, rgba(${pr}, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(${pr}, 0.08) 1px, transparent 1px) !important;
    }

    /* ── Custom Scrollbar ──────────────────────────────────────────────── */
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(${pr}, 0.45) !important;
    }
  `;

  return activePalette;
}
