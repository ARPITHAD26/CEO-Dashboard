import React, { useState } from 'react';
import { 
  AIStudioProjectReview, 
  MilestoneItem, 
  ProjectRiskItem, 
  ExecutiveDecisionItem 
} from '../types';
import { defaultAIStudioProjectReview } from '../data/aiStudioProjectReviewData';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid, Legend, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';
import { 
  CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown, 
  Cpu, Users, DollarSign, ShieldAlert, Sparkles, Download, 
  FileText, ChevronDown, ChevronUp, Layers, Sliders, RefreshCw, 
  Check, ArrowRight, Eye, ShieldCheck, Target, Printer, Copy
} from 'lucide-react';

interface AIStudioExecutiveDashboardProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export default function AIStudioProjectExecutiveDashboard({ 
  onClose, 
  isEmbedded = false 
}: AIStudioExecutiveDashboardProps) {
  const [data, setData] = useState<AIStudioProjectReview>(defaultAIStudioProjectReview);
  const [viewMode, setViewMode] = useState<'interactive' | 'briefing_slide' | 'markdown' | 'data_editor'>('interactive');
  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'product' | 'ai_quality' | 'financials' | 'risks' | 'decisions'>('all');
  const [appendixExpanded, setAppendixExpanded] = useState<boolean>(false);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRiskItem | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [thresholdInfoOpen, setThresholdInfoOpen] = useState<boolean>(false);

  // Custom data editor state
  const [customDataJson, setCustomDataJson] = useState<string>(JSON.stringify(data, null, 2));
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport(data);
    navigator.clipboard.writeText(md);
    setCopiedNotification('Markdown report copied to clipboard!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApplyCustomJson = () => {
    try {
      const parsed = JSON.parse(customDataJson);
      setData(parsed);
      setJsonParseError(null);
      setViewMode('interactive');
      setCopiedNotification('Custom project data loaded successfully!');
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch (e: any) {
      setJsonParseError('Invalid JSON format: ' + e.message);
    }
  };

  const handleResetDefaultData = () => {
    setData(defaultAIStudioProjectReview);
    setCustomDataJson(JSON.stringify(defaultAIStudioProjectReview, null, 2));
    setJsonParseError(null);
  };

  const getStatusBadge = (status: 'GREEN' | 'AMBER' | 'RED') => {
    switch (status) {
      case 'GREEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            HEALTH: ON TRACK (GREEN)
          </span>
        );
      case 'AMBER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            HEALTH: ATTENTION NEEDED (AMBER)
          </span>
        );
      case 'RED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            HEALTH: CRITICAL RISK (RED)
          </span>
        );
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 15) return 'bg-red-600 text-white font-bold';
    if (score >= 10) return 'bg-amber-500 text-slate-900 font-bold';
    return 'bg-emerald-500 text-white font-medium';
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  return (
    <div className={`w-full bg-slate-900 text-slate-100 min-h-screen ${isEmbedded ? 'rounded-2xl border border-slate-800 shadow-2xl p-4 md:p-6' : 'p-4 md:p-8'}`}>
      
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          {copiedNotification}
        </div>
      )}

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Executive 2-Minute Review
            </span>
            <span className="text-xs text-slate-400">
              Stage: <strong className="text-slate-200 capitalize">{data.stage}</strong> | Period: <strong className="text-slate-200">{data.reportingPeriod}</strong>
            </span>
            {getStatusBadge(data.overallHealth)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {data.projectTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            {data.oneLineDescription}
          </p>
        </div>

        {/* View mode switcher & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'interactive' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              Interactive Dashboard
            </button>
            <button
              onClick={() => setViewMode('briefing_slide')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'briefing_slide' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              Slide / 1-Pager
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'markdown' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              Markdown Report
            </button>
            <button
              onClick={() => setViewMode('data_editor')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'data_editor' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <Sliders className="w-3 h-3 inline mr-1" />
              Data Config
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyMarkdown}
              title="Copy Markdown Report"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy MD</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print / Save PDF"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700"
              >
                Close View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RAG THRESHOLDS MODAL / BANNER (Collapsible) */}
      <div className="mt-3">
        <button
          onClick={() => setThresholdInfoOpen(!thresholdInfoOpen)}
          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Executive RAG Threshold Definitions {thresholdInfoOpen ? '▲' : '▼'}</span>
        </button>
        {thresholdInfoOpen && (
          <div className="mt-2 p-3 bg-slate-800/70 rounded-xl border border-slate-700 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in">
            <div className="border-l-2 border-emerald-500 pl-2">
              <strong className="text-emerald-400">Green:</strong> MAU Growth &gt;15% MoM, Latency P95 &lt;2.0s, Accuracy &gt;90%, Burn within &plusmn;10% of budget, 0 critical blockers.
            </div>
            <div className="border-l-2 border-amber-500 pl-2">
              <strong className="text-amber-400">Amber (Current):</strong> Burn variance &gt;15%, 1-2 milestone slips (&lt;20 days), or compute surge. No unmitigated safety/security events.
            </div>
            <div className="border-l-2 border-red-500 pl-2">
              <strong className="text-red-400">Red:</strong> Runway &lt;6 months, P95 latency &gt;3.5s, safety incidents &gt;0, or critical SOC2 compliance failure.
            </div>
          </div>
        )}
      </div>

      {/* VIEW: DATA EDITOR */}
      {viewMode === 'data_editor' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Custom Project Data Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  You can paste your raw project data (sprint velocity, budget sheet, metrics, risks, timeline) in JSON format below to dynamically refresh the CEO view.
                </p>
              </div>
              <button
                onClick={handleResetDefaultData}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>

            {jsonParseError && (
              <div className="mb-3 p-3 bg-red-950/80 border border-red-700 text-red-300 rounded-lg text-xs font-semibold">
                {jsonParseError}
              </div>
            )}

            <textarea
              value={customDataJson}
              onChange={(e) => setCustomDataJson(e.target.value)}
              rows={20}
              className="w-full font-mono text-xs bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setViewMode('interactive')}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomJson}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Check className="w-4 h-4" />
                Apply Project Data to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MARKDOWN EXPORT */}
      {viewMode === 'markdown' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold text-white">Markdown Executive Briefing Report</span>
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy to Clipboard
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-[70vh]">
            {generateMarkdownReport(data)}
          </pre>
        </div>
      )}

      {/* VIEW: BRIEFING SLIDE / 1-PAGER */}
      {viewMode === 'briefing_slide' && (
        <div className="mt-6 p-6 md:p-10 bg-slate-950 rounded-2xl border-2 border-indigo-500/40 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Executive Board Briefing | 2-Minute Scan</span>
              <h2 className="text-3xl font-black text-white mt-1">{data.projectTitle}</h2>
              <p className="text-sm text-slate-400">{data.oneLineDescription}</p>
            </div>
            <div className="text-right">
              {getStatusBadge(data.overallHealth)}
              <p className="text-xs text-slate-500 mt-1">{data.reportingPeriod}</p>
            </div>
          </div>

          {/* 3-Line Headline Summary */}
          <div className="bg-slate-900/90 p-5 rounded-xl border-l-4 border-indigo-500 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">1. Executive 3-Line Status</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {data.headlineSummary.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top 3 Asks / Decisions */}
          <div className="bg-amber-950/30 p-5 rounded-xl border border-amber-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Top 3 Immediate CEO Decisions & Asks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {data.decisionsAndAsks.slice(0, 3).map((d) => (
                <div key={d.id} className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-indigo-400">#{d.rank} Priority</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">{d.urgency}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{d.decisionTitle}</h4>
                  <p className="text-xs text-slate-300 mb-2">{d.recommendedAction}</p>
                  <div className="text-[11px] text-emerald-400 font-medium">ROI: {d.roiImpact}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Key Executive Metrics in Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.kpis.map((kpi) => (
              <div key={kpi.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 truncate">{kpi.label}</div>
                <div className="text-xl font-extrabold text-white mt-1">{kpi.value}</div>
                <div className="flex items-center gap-1 text-[11px] mt-1 font-semibold text-emerald-400">
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3 text-amber-400" />}
                  <span>{kpi.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 30/60/90 Roadmap Scan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.timeline306090.map((t, idx) => (
              <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-2">{t.horizon}</h4>
                <div className="text-xs text-slate-300 space-y-1.5 mb-3">
                  {t.priorities.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-500">›</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold border-t border-slate-800/80 pt-2">
                  Goal: {t.successMetric}
                </div>
              </div>
            ))}
          </div>

          {/* Top 3 Ranked Recommended Actions */}
          <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Ranked Recommended Actions for CEO</h4>
            <ol className="list-decimal list-inside text-xs text-slate-200 space-y-1.5">
              <li><strong className="text-white">Rank 1:</strong> Approve $180k vector caching gateway to curb compute burn (+24.9% variance) before Q4 user surge.</li>
              <li><strong className="text-white">Rank 2:</strong> Greenlight dedicated VPC enterprise tier to unlock $420k in pending ARR before fiscal year close.</li>
              <li><strong className="text-white">Rank 3:</strong> Close 2 Principal LLM Compiler hires to remediate 18-day slippage on incremental code patching.</li>
            </ol>
          </div>
        </div>
      )}

      {/* VIEW: MAIN INTERACTIVE DASHBOARD */}
      {viewMode === 'interactive' && (
        <div className="mt-6 space-y-8">
          
          {/* SECTION 1: EXECUTIVE SUMMARY & TOP 3 ASKS (HERO SECTION) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Overall Health & 3-Line Status */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 1</span>
                    <h2 className="text-lg font-bold text-white">Executive Status & Health Overview</h2>
                  </div>
                </div>
                {getStatusBadge(data.overallHealth)}
              </div>

              {/* 3-Line Headline */}
              <div className="space-y-3 mt-4">
                {data.headlineSummary.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-sm text-slate-200">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>

              {/* Quick Anomaly callout if any */}
              {data.anomaliesAndFlags.length > 0 && (
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Anomaly Alert:</strong> {data.anomaliesAndFlags[0].item}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    Action Required
                  </span>
                </div>
              )}
            </div>

            {/* Right: Top 3 Decisions Needed from CEO */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Top 3 Decisions for CEO</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Immediate approvals and strategic trade-offs required to protect timeline and gross margin.
                </p>

                <div className="space-y-3">
                  {data.top3DecisionsToMake.map((decision, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <p className="leading-tight">{decision}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Capital Requested:</span>
                <span className="font-extrabold text-white">$180,000 CapEx</span>
              </div>
            </div>
          </div>

          {/* TOP KPI CARDS BANNER */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Executive Pulse & Core Metrics (Jan - Sep 2026)
              </h3>
              <span className="text-[11px] text-slate-500">Real-time sync from Platform Telemetry & Firestore</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {data.kpis.map((kpi) => (
                <div 
                  key={kpi.id} 
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                    kpi.anomalyFlag 
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20' 
                      : 'bg-slate-900 border-slate-800 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate">{kpi.label}</span>
                    {kpi.anomalyFlag && (
                      <span title={kpi.anomalyNote} className="text-amber-400 cursor-help">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-black text-white mt-1.5 tracking-tight">
                    {kpi.value}
                  </div>

                  {kpi.subValue && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {kpi.subValue}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
                    <span className={`font-bold flex items-center gap-0.5 ${
                      kpi.status === 'GREEN' ? 'text-emerald-400' : kpi.status === 'AMBER' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                      {kpi.change}
                    </span>
                    <span className="text-slate-500 text-[10px] truncate">{kpi.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2 & 3: PROGRESS VS PLAN + PRODUCT & ADOPTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2. Progress vs Plan */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 2</span>
                    <h3 className="text-base font-bold text-white">Progress vs Plan & Milestones</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-400">{data.overallProgressPct}% Complete</span>
                  <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.overallProgressPct}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {data.milestones.map((m) => (
                  <div key={m.id} className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/60 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-white text-sm">{m.name}</span>
                        <div className="text-slate-400 mt-0.5">
                          Target: {m.deadline} ({m.plannedQuarter}) | Owner: <span className="text-slate-300">{m.owner}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        m.status === 'Delayed' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        m.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    {m.slippageDays && m.slippageDays > 0 && (
                      <div className="mt-2 p-2 bg-red-950/50 rounded-lg border border-red-800/50 text-[11px] text-red-300">
                        <strong>Slippage (+{m.slippageDays} days):</strong> {m.slippageCause}
                      </div>
                    )}

                    <div className="mt-2 text-[11px] text-slate-300 italic">
                      Impact: {m.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Product & Adoption */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 3</span>
                      <h3 className="text-base font-bold text-white">Product Adoption & Retention</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-bold">+{data.productAdoption.mauGrowthPct}% YoY Growth</span>
                    <div className="text-[10px] text-slate-400">D1: {data.productAdoption.d1RetentionPct}% | D30: {data.productAdoption.d30RetentionPct}%</div>
                  </div>
                </div>

                {/* MAU Growth Chart */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.productAdoption.monthlyTrend}>
                      <defs>
                        <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="mau" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#mauGrad)" name="MAU" />
                      <Area type="monotone" dataKey="dau" stroke="#34D399" strokeWidth={2} fillOpacity={0.2} fill="#34D399" name="DAU" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Feature Adoption Breakdown */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feature Adoption Rates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {data.productAdoption.featureAdoption.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-200 truncate">{f.feature}</span>
                          <span className="text-indigo-400 font-bold">{f.adoptionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${f.adoptionRate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Themes */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  <strong>Top User Sentiment:</strong> {data.productAdoption.userFeedbackThemes[0].quoteOrSample}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5: AI PERFORMANCE & QUALITY + FINANCIALS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 4. AI Performance & Quality */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 4</span>
                    <h3 className="text-base font-bold text-white">AI Quality, Latency & Reliability</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {data.aiPerformance.uptimePct}% SLA Uptime
                </span>
              </div>

              {/* Mini AI Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Model Accuracy</div>
                  <div className="text-base font-bold text-emerald-400">{data.aiPerformance.overallAccuracyPct}%</div>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">P95 Latency</div>
                  <div className="text-base font-bold text-indigo-400">{data.aiPerformance.p95LatencySec}s</div>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Hallucination Rate</div>
                  <div className="text-base font-bold text-emerald-400">{data.aiPerformance.hallucinationRatePct}%</div>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Cost / 1k Requests</div>
                  <div className="text-base font-bold text-amber-400">${data.aiPerformance.costPer1kRequestsUSD}</div>
                </div>
              </div>

              {/* Latency & Error Rate Trend */}
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.aiPerformance.monthlyLatencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}ms`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#EF4444" fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="p95" stroke="#F59E0B" strokeWidth={2} name="P95 Latency (ms)" />
                    <Line yAxisId="left" type="monotone" dataKey="p50" stroke="#3B82F6" strokeWidth={2} name="P50 Latency (ms)" />
                    <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" name="Error Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Model Mix */}
              <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                <span>Model Engine: <strong>Gemini 2.5 Flash (74%)</strong> + Gemini Pro (18%)</span>
                <span className="text-emerald-400 font-semibold">0 Safety Incidents</span>
              </div>
            </div>

            {/* 5. Financials */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 5</span>
                      <h3 className="text-base font-bold text-white">Financials, Burn & Compute Cost</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-bold">Runway: {data.financials.runwayMonths} Months</span>
                    <div className="text-[10px] text-emerald-400">ROI: {data.financials.projectedROI}</div>
                  </div>
                </div>

                {/* Budget vs Actual Breakdown */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400">Total YTD Spend</div>
                    <div className="text-base font-bold text-white">{formatCurrency(data.financials.actualSpendYTDUSD)}</div>
                    <div className="text-[10px] text-slate-500">Budget: {formatCurrency(data.financials.totalBudgetUSD)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400">Monthly Burn</div>
                    <div className="text-base font-bold text-amber-400">{formatCurrency(data.financials.burnRateMonthlyUSD)}/mo</div>
                    <div className="text-[10px] text-amber-400/80">+{data.financials.costVariancePct}% vs plan</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400">ARR Revenue</div>
                    <div className="text-base font-bold text-emerald-400">{formatCurrency(data.financials.annualizedRunRateRevenueUSD)}</div>
                    <div className="text-[10px] text-emerald-400">Profitable Growth</div>
                  </div>
                </div>

                {/* Monthly Burn vs Budget Chart */}
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.financials.monthlyBurnTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="budget" fill="#64748B" name="Budget Cap" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#F59E0B" name="Actual Spend" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="computeApi" fill="#818CF8" name="Compute/API portion" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50 flex items-center justify-between">
                <span>Inference compute variance is +24.9% due to rapid code compile usage.</span>
                <strong className="text-white">Optimization ROI: $340k/yr</strong>
              </div>
            </div>
          </div>

          {/* SECTION 6 & 7: TEAM DELIVERY + RISKS HEATMAP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 6. Team & Delivery */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 6</span>
                    <h3 className="text-base font-bold text-white">Team Capacity & Velocity</h3>
                  </div>
                </div>
                <span className="text-xs text-slate-300 font-bold">
                  {data.teamDelivery.headcount} Engineers | {data.teamDelivery.avgVelocityPoints} pts/sprint
                </span>
              </div>

              {/* Sprint Velocity Chart */}
              <div className="h-36 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.teamDelivery.velocityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sprint" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="committed" fill="#475569" name="Committed Pts" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#10B981" name="Completed Pts" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Key Talent Gaps & Blockers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiring Status & Critical Gaps</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.teamDelivery.keyHiresAndGaps.map((h, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200 truncate">{h.role}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'Critical Gap' ? 'bg-red-500/20 text-red-300' :
                          h.status === 'Offer Stage' ? 'bg-blue-500/20 text-blue-300' :
                          h.status === 'Filled' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{h.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Risks & Compliance (Heatmap & Matrix) */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 7</span>
                      <h3 className="text-base font-bold text-white">Top 5 Project Risks & Heatmap</h3>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Score = Likelihood × Impact (1-25)</span>
                </div>

                {/* Risk Items */}
                <div className="space-y-2.5">
                  {data.risks.map((risk) => (
                    <div 
                      key={risk.id}
                      onClick={() => setSelectedRisk(selectedRisk?.id === risk.id ? null : risk)}
                      className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70 hover:border-indigo-500/60 cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${getRiskColor(risk.score)}`}>
                            Score: {risk.score}
                          </span>
                          <span className="font-bold text-white truncate">{risk.title}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] flex-shrink-0">Owner: {risk.owner}</span>
                      </div>

                      <div className="mt-1.5 text-slate-300 text-[11px]">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>

                      {selectedRisk?.id === risk.id && (
                        <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-[11px] text-slate-400 animate-in fade-in">
                          <span>Category: <strong className="text-slate-200">{risk.category}</strong></span>
                          <span>Likelihood: <strong className="text-slate-200">{risk.likelihood}/5</strong> | Impact: <strong className="text-slate-200">{risk.impact}/5</strong></span>
                          <span>Status: <strong className="text-emerald-400">{risk.status}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                <span>SOC2 Type II Audit status: <strong>85% Ready</strong></span>
                <span className="text-emerald-400">Zero Critical Security Exposures</span>
              </div>
            </div>
          </div>

          {/* SECTION 8 & 9: COMPETITIVE SNAPSHOT + DECISIONS & ASKS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 8. Competitive / Market Snapshot */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 8</span>
                  <h3 className="text-base font-bold text-white">Competitive & Market Snapshot</h3>
                </div>
              </div>

              <div className="space-y-3">
                {data.competitiveSnapshot.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/60 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-sm">{c.competitor}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.threatLevel === 'High' ? 'bg-red-500/20 text-red-300' :
                        c.threatLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        Threat: {c.threatLevel}
                      </span>
                    </div>
                    <div className="text-slate-300 mb-2">
                      <strong>Recent Move:</strong> {c.recentMove}
                    </div>
                    <div className="p-2 bg-indigo-950/40 rounded-lg border border-indigo-900/50 text-[11px] text-indigo-300">
                      <strong>Our Moat / Strategic Response:</strong> {c.ourAdvantageOrResponse}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Decisions & Asks Matrix */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 9</span>
                    <h3 className="text-base font-bold text-white">Decisions, Asks & Trade-offs</h3>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold">Requires CEO Approval</span>
              </div>

              <div className="space-y-3">
                {data.decisionsAndAsks.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                          Rank #{item.rank}
                        </span>
                        <h4 className="font-bold text-white text-sm">{item.decisionTitle}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {item.urgency}
                      </span>
                    </div>

                    <div className="mt-1.5 text-slate-300">
                      <strong>Ask:</strong> {item.needOrAsk}
                    </div>

                    <div className="mt-1 text-slate-400 text-[11px]">
                      <strong>Recommended Action:</strong> {item.recommendedAction}
                    </div>

                    <div className="mt-1 text-amber-300/90 text-[11px]">
                      <strong>Trade-off:</strong> {item.tradeOffs}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-700/80 flex justify-between text-[11px]">
                      <span className="text-slate-400">Approval: <strong className="text-slate-200">{item.approvalRequired}</strong></span>
                      <span className="text-emerald-400 font-bold">ROI: {item.roiImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 10: NEXT 30 / 60 / 90 DAYS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section 10</span>
                  <h3 className="text-base font-bold text-white">Strategic Roadmap: Next 30 / 60 / 90 Days</h3>
                </div>
              </div>
              <span className="text-xs text-slate-400">Execution Cadence & Key Deliverables</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.timeline306090.map((horizon, idx) => (
                <div key={idx} className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                      <span className="font-extrabold text-sm text-indigo-400">{horizon.horizon}</span>
                      <span className="text-[10px] text-slate-400">{horizon.targetMilestone}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Priorities:</div>
                      {horizon.priorities.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-slate-200">
                          <span className="text-indigo-400 font-bold">›</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Expected Outcomes:</div>
                      {horizon.expectedOutcomes.map((o, oIdx) => (
                        <div key={oIdx} className="text-slate-300 text-[11px]">
                          • {o}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-700 text-emerald-400 font-semibold text-[11px]">
                    Success Metric: {horizon.successMetric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINAL 3 RECOMMENDED ACTIONS FOR CEO (RANKED BY IMPACT) */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 rounded-2xl border-2 border-indigo-500/50 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Senior Business Analyst Recommended Actions for CEO (Ranked by Impact)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-bold text-xs">Rank 1 • Cost & Margin</span>
                  <span className="text-emerald-400 font-bold text-xs">ROI: $340k/yr</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-2 mb-1">Deploy Semantic Vector Caching & Prompt Compression</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Immediately authorize $180k compute optimization to cap monthly inference spend under $75k, reducing token latency by 40% ahead of Q4 enterprise traffic surges.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-bold text-xs">Rank 2 • Revenue Expansion</span>
                  <span className="text-emerald-400 font-bold text-xs">+$420k ACV</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-2 mb-1">Greenlight Enterprise Dedicated VPC & SOC2 Finalization</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Approve 4-engineer dedicated sprint to deliver single-tenant isolation and complete SOC2 Type II audit, enabling closure of 6 Fortune 500 pilots.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-bold text-xs">Rank 3 • Delivery Speed</span>
                  <span className="text-emerald-400 font-bold text-xs">+25% Velocity</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-2 mb-1">Accelerate 2 Principal Compiler Engineer Hires</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Approve offer terms for 2 specialized systems engineers to resolve the 18-day slippage on incremental code patching and multi-agent merge coordination.
                </p>
              </div>
            </div>
          </div>

          {/* COLLAPSIBLE APPENDIX: ASSUMPTIONS, ANOMALIES & DATA NEEDED */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <button
              onClick={() => setAppendixExpanded(!appendixExpanded)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  Collapsible Appendix: Audit Flags, Explicit Assumptions & Missing Data Log
                </span>
                <span className="text-xs text-slate-400">({appendixExpanded ? 'Click to collapse' : 'Click to expand'})</span>
              </div>
              {appendixExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {appendixExpanded && (
              <div className="p-6 border-t border-slate-800 space-y-6 text-xs animate-in fade-in">
                {/* Anomalies Table */}
                <div>
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Flagged Anomalies & Metric Inconsistencies
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-800 text-slate-300">
                      <thead>
                        <tr className="bg-slate-800/80 text-slate-200">
                          <th className="p-2.5 text-left border border-slate-700">Metric / Item</th>
                          <th className="p-2.5 text-left border border-slate-700">Observation & Discrepancy</th>
                          <th className="p-2.5 text-left border border-slate-700">Severity</th>
                          <th className="p-2.5 text-left border border-slate-700">Suggested Action / Audit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.anomaliesAndFlags.map((a, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-semibold text-white border border-slate-800">{a.item}</td>
                            <td className="p-2.5 border border-slate-800">{a.observation}</td>
                            <td className="p-2.5 border border-slate-800">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                a.severity === 'Red' ? 'bg-red-500/20 text-red-300' :
                                a.severity === 'Amber' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {a.severity}
                              </span>
                            </td>
                            <td className="p-2.5 border border-slate-800 text-slate-300">{a.suggestedAudit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assumptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-800">
                  <div>
                    <h4 className="font-bold text-indigo-300 uppercase tracking-wider mb-2">Explicit Business Assumptions</h4>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                      {data.assumptions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Data & Needs Log ("Data needed")</h4>
                    <ul className="space-y-1.5 text-amber-300/90 list-disc list-inside">
                      {data.missingDataNotes.map((item, idx) => (
                        <li key={idx}><strong>[Data needed]</strong> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

/**
 * Generates an executive Markdown report for easy export or clipboard copy
 */
function generateMarkdownReport(data: AIStudioProjectReview): string {
  return `# EXECUTIVE PROJECT REVIEW: ${data.projectTitle.toUpperCase()}
**Reporting Period:** ${data.reportingPeriod}  
**Project Stage:** ${data.stage.toUpperCase()}  
**Overall Health:** ${data.overallHealth}  
**Last Updated:** ${data.lastUpdated} | **Author:** ${data.author}  

---

## 1. EXECUTIVE SUMMARY & HEADLINES
${data.headlineSummary.map((h, i) => `${i + 1}. ${h}`).join('\n')}

### Top 3 Decisions Needed from CEO:
${data.top3DecisionsToMake.map((d, i) => `- **Decision ${i + 1}:** ${d}`).join('\n')}

---

## 2. KEY PERFORMANCE INDICATORS (KPIs)
| KPI Metric | Current Value | Sub-Value | MoM / Period Change | Status | Benchmark Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
${data.kpis.map(k => `| ${k.label} | **${k.value}** | ${k.subValue || '-'} | ${k.change} | ${k.status} | ${k.benchmark || '-'} |`).join('\n')}

---

## 3. PROGRESS VS PLAN & MILESTONES (${data.overallProgressPct}% Complete)
${data.milestones.map(m => `- **${m.name}** [${m.status} - ${m.percentComplete}%]
  - Target: ${m.deadline} (${m.plannedQuarter}) | Owner: ${m.owner}
  - Impact: ${m.impact}${m.slippageDays ? `\n  - *Slippage:* +${m.slippageDays} days due to ${m.slippageCause}` : ''}`).join('\n')}

---

## 4. PRODUCT ADOPTION & USER RETENTION
- **Monthly Active Users (MAU):** ${data.productAdoption.monthlyActiveUsers.toLocaleString()} (+${data.productAdoption.mauGrowthPct}% YoY)
- **Daily Active Users (DAU):** ${data.productAdoption.dailyActiveUsers.toLocaleString()}
- **Retention:** D1: ${data.productAdoption.d1RetentionPct}% | D30: ${data.productAdoption.d30RetentionPct}%
- **Feature Adoption Highlights:**
${data.productAdoption.featureAdoption.map(f => `  - ${f.feature}: ${f.adoptionRate}% (${f.userSentiment})`).join('\n')}

---

## 5. AI PERFORMANCE & QUALITY
- **Overall Code Pass / Accuracy:** ${data.aiPerformance.overallAccuracyPct}%
- **P95 Latency:** ${data.aiPerformance.p95LatencySec}s (P50: 640ms)
- **Platform Uptime:** ${data.aiPerformance.uptimePct}%
- **Error Rate:** ${data.aiPerformance.errorRatePct}% | **Hallucination Rate:** ${data.aiPerformance.hallucinationRatePct}%
- **Cost per 1,000 Requests:** $${data.aiPerformance.costPer1kRequestsUSD} | **Cost per User:** $${data.aiPerformance.costPerUserUSD}

---

## 6. FINANCIALS & BURN RATE
- **Total Budget:** $${(data.financials.totalBudgetUSD / 1000).toFixed(0)}k | **Actual YTD Spend:** $${(data.financials.actualSpendYTDUSD / 1000).toFixed(0)}k
- **Monthly Burn:** $${(data.financials.burnRateMonthlyUSD / 1000).toFixed(1)}k/mo | **Runway:** ${data.financials.runwayMonths} Months
- **Annualized Run Rate Revenue (ARR):** $${(data.financials.annualizedRunRateRevenueUSD / 1000000).toFixed(2)}M
- **Projected ROI:** ${data.financials.projectedROI}

---

## 7. TOP 5 RISKS & MITIGATIONS
${data.risks.map(r => `- **${r.title}** (Score: ${r.score}/25 | ${r.category})
  - Owner: ${r.owner} | Status: ${r.status}
  - Mitigation: ${r.mitigation}`).join('\n')}

---

## 8. COMPETITIVE SNAPSHOT
${data.competitiveSnapshot.map(c => `- **${c.competitor}** (Threat: ${c.threatLevel})
  - Move: ${c.recentMove}
  - Our Moat: ${c.ourAdvantageOrResponse}`).join('\n')}

---

## 9. DECISIONS & ASKS MATRIX
${data.decisionsAndAsks.map(d => `### #${d.rank}: ${d.decisionTitle}
- **Ask:** ${d.needOrAsk}
- **Recommended Action:** ${d.recommendedAction}
- **Trade-offs:** ${d.tradeOffs}
- **ROI Impact:** ${d.roiImpact} | **Urgency:** ${d.urgency}`).join('\n')}

---

## 10. NEXT 30 / 60 / 90 DAYS ROADMAP
${data.timeline306090.map(t => `### ${t.horizon} (${t.targetMilestone})
- **Priorities:**
${t.priorities.map(p => `  - ${p}`).join('\n')}
- **Expected Outcomes:**
${t.expectedOutcomes.map(o => `  - ${o}`).join('\n')}
- **Success Metric:** ${t.successMetric}`).join('\n')}

---

## TOP 3 RECOMMENDED ACTIONS FOR CEO (Ranked by Impact)
1. **Rank 1 (Margin & Latency):** Deploy Semantic Vector Caching & Prompt Compression (Cap monthly compute <$75k, ROI: $340k/yr).
2. **Rank 2 (Revenue Growth):** Greenlight Enterprise Dedicated VPC & SOC2 Finalization (Unlock $420k pending ACV).
3. **Rank 3 (Delivery Acceleration):** Authorize 2 Principal Compiler Engineers (Eliminate 18-day patching merge delay).
`;
}
