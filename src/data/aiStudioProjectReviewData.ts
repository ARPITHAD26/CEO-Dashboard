import { AIStudioProjectReview } from '../types';

export const defaultAIStudioProjectReview: AIStudioProjectReview = {
  projectTitle: 'Google AI Studio & Samanvay Enterprise Suite',
  oneLineDescription: 'Next-generation AI-native web applet builder and enterprise multi-role operations intelligence platform.',
  stage: 'scaling',
  reportingPeriod: 'Jan - Sep 2026 (Q1-Q3 FY26)',
  lastUpdated: 'September 2026',
  author: 'Chief Business Analyst & AI Operations PMO',
  overallHealth: 'AMBER',
  headlineSummary: [
    'Adoption is scaling at +214% YoY with 48.2k Monthly Active Applet Builders and $1.42M ARR.',
    'AI Model latency (P95 at 1.82s) and reliability (99.88% uptime) exceed SLA targets, while token cost per 1k requests dropped by 38%.',
    'Amber Status Flag: Compute infrastructure budget is trending 18% above plan due to multi-modal code generation surge; requires caching & tiering sign-off.'
  ],
  top3DecisionsToMake: [
    'Approval for $180K Compute Optimization & Tiered Caching Gateway to bring cloud margin from 68% to 82%.',
    'Greenlight the Q4 Enterprise White-Label & Private VPC Tier to unblock 6 pending enterprise contracts ($420K ACV).',
    'Sign-off on hiring 2 Principal AI Systems Engineers to resolve context-window compilation bottlenecks.'
  ],
  kpis: [
    {
      id: 'kpi-1',
      label: 'Monthly Active Users (MAU)',
      value: '48,250',
      subValue: '18,400 DAU',
      trend: 'up',
      change: '+22.4% MoM',
      status: 'GREEN',
      benchmark: 'Target: 40k by Q3',
      category: 'adoption'
    },
    {
      id: 'kpi-2',
      label: 'Annualized Run Rate (ARR)',
      value: '$1,420,000',
      subValue: '$118.3K / mo',
      trend: 'up',
      change: '+31.8% QoQ',
      status: 'GREEN',
      benchmark: 'Target: $1.2M',
      category: 'financial'
    },
    {
      id: 'kpi-3',
      label: 'Model Accuracy / Code Pass@1',
      value: '91.4%',
      subValue: '0.42% Hallucination Rate',
      trend: 'up',
      change: '+4.6% vs Q2',
      status: 'GREEN',
      benchmark: 'Target: >90%',
      category: 'ai_quality'
    },
    {
      id: 'kpi-4',
      label: 'Monthly Compute Burn Rate',
      value: '$84,200',
      subValue: 'Runway: 16.4 mos',
      trend: 'down',
      change: '+18.2% vs Budget',
      status: 'AMBER',
      benchmark: 'Budget cap: $72k/mo',
      category: 'financial',
      anomalyFlag: true,
      anomalyNote: 'Compute burn exceeded budget due to unoptimized prompt retries and heavy full-file multi-edit generation.'
    },
    {
      id: 'kpi-5',
      label: 'P95 Response Latency',
      value: '1.82s',
      subValue: 'P50: 640ms',
      trend: 'up',
      change: '-280ms improvement',
      status: 'GREEN',
      benchmark: 'SLA: <2.5s',
      category: 'ai_quality'
    },
    {
      id: 'kpi-6',
      label: 'Delivery Velocity & Milestones',
      value: '84.6%',
      subValue: '22 / 26 Milestones on time',
      trend: 'neutral',
      change: '2 Slipped by 14 days',
      status: 'AMBER',
      benchmark: 'Target: >90%',
      category: 'delivery'
    }
  ],
  overallProgressPct: 84.6,
  milestones: [
    {
      id: 'm-1',
      name: 'Gemini 2.5/Flash Real-time Code Engine & Live Preview',
      plannedQuarter: 'Q1 2026',
      deadline: '2026-03-31',
      status: 'Completed',
      percentComplete: 100,
      owner: 'Platform Core Team',
      impact: 'Reduced app compile time by 64% and supported hot execution in dev sandbox.'
    },
    {
      id: 'm-2',
      name: 'Multi-Role Enterprise RBAC & OpsVision Telemetry Integration',
      plannedQuarter: 'Q2 2026',
      deadline: '2026-06-30',
      status: 'Completed',
      percentComplete: 100,
      owner: 'Enterprise Solutions Group',
      impact: 'Delivered complete CEO operations command suite, live site inspections, and SLA tracking.'
    },
    {
      id: 'm-3',
      name: 'Smart Document OCR & AI Auto-Extraction Pipeline',
      plannedQuarter: 'Q2 2026',
      deadline: '2026-07-15',
      status: 'Completed',
      percentComplete: 100,
      owner: 'AI Applied Research',
      impact: 'Automated invoice & tender parsing with 94.8% field extraction accuracy.'
    },
    {
      id: 'm-4',
      name: 'Semantic Code Diff & Multi-File Incremental Patching',
      plannedQuarter: 'Q3 2026',
      deadline: '2026-08-31',
      status: 'Delayed',
      percentComplete: 78,
      owner: 'DevEx & Tooling',
      slippageDays: 18,
      slippageCause: 'Edge cases in merge conflict resolution on concurrent async subagent tasks.',
      impact: 'Requires manual fallback during complex multi-component refactors.'
    },
    {
      id: 'm-5',
      name: 'Enterprise Private VPC & SOC2 Type II Audit Readiness',
      plannedQuarter: 'Q3 2026',
      deadline: '2026-09-30',
      status: 'In Progress',
      percentComplete: 85,
      owner: 'SecOps & Compliance',
      impact: 'Unblocks enterprise sales pipeline for regulated banking and healthcare clients.'
    },
    {
      id: 'm-6',
      name: 'One-Click CloudSQL / Firebase Auto-Provisioning & Production Deployment',
      plannedQuarter: 'Q4 2026',
      deadline: '2026-11-15',
      status: 'Planned',
      percentComplete: 30,
      owner: 'Cloud Infrastructure',
      impact: 'Enables users to ship to production databases in under 12 seconds.'
    }
  ],
  productAdoption: {
    monthlyActiveUsers: 48250,
    mauGrowthPct: 214.5,
    dailyActiveUsers: 18400,
    d1RetentionPct: 68.4,
    d30RetentionPct: 44.2,
    featureAdoption: [
      {
        feature: 'Interactive AI Applet Builder',
        adoptionRate: 92.4,
        status: 'High',
        userSentiment: '94% satisfaction: "10x faster than traditional frontend scaffolding."'
      },
      {
        feature: 'CEO Operations & Drill-down Center',
        adoptionRate: 78.6,
        status: 'High',
        userSentiment: 'Execs praised site-level shortage alerts and live SLA visibility.'
      },
      {
        feature: 'AI Document OCR Parser',
        adoptionRate: 64.1,
        status: 'Medium',
        userSentiment: 'High demand in finance/procurement, users requested bulk PDF upload.'
      },
      {
        feature: 'Real-time WebSocket Multi-user Collab',
        adoptionRate: 38.5,
        status: 'Low',
        userSentiment: 'Feature discoverability is low; needs onboarding walkthrough.'
      },
      {
        feature: 'Custom Theme & Admin Role Studio',
        adoptionRate: 81.0,
        status: 'High',
        userSentiment: 'Security admins frequently configure sub-role permissions.'
      }
    ],
    userFeedbackThemes: [
      {
        theme: 'Rapid Applet Prototyping Speed',
        type: 'Positive',
        frequencyPct: 42,
        quoteOrSample: '"We built an entire operations dashboard prototype in 45 minutes instead of 3 weeks."',
        actionTaken: 'Expanded pre-built templates for facility management, sales, and supply chain.'
      },
      {
        theme: 'Token / Compute Cost Transparency',
        type: 'Pain Point',
        frequencyPct: 24,
        quoteOrSample: '"Need clearer visibility into which prompts consume excessive compute tokens."',
        actionTaken: 'Building token usage breakdown and prompt optimization hints in v2.4.'
      },
      {
        theme: 'Offline Mode & Local Sandbox Caching',
        type: 'Feature Request',
        frequencyPct: 19,
        quoteOrSample: '"Field inspectors need offline ticket capture when at remote underground facilities."',
        actionTaken: 'Implemented PWA IndexedDB local queue with auto-sync on reconnect.'
      }
    ],
    monthlyTrend: [
      { month: 'Jan 26', mau: 15400, dau: 5200, appletsCreated: 4100 },
      { month: 'Feb 26', mau: 19800, dau: 7100, appletsCreated: 6300 },
      { month: 'Mar 26', mau: 24500, dau: 9400, appletsCreated: 8900 },
      { month: 'Apr 26', mau: 29800, dau: 11200, appletsCreated: 11400 },
      { month: 'May 26', mau: 34200, dau: 13100, appletsCreated: 14200 },
      { month: 'Jun 26', mau: 38900, dau: 14900, appletsCreated: 17800 },
      { month: 'Jul 26', mau: 42600, dau: 16200, appletsCreated: 21100 },
      { month: 'Aug 26', mau: 45800, dau: 17400, appletsCreated: 24600 },
      { month: 'Sep 26', mau: 48250, dau: 18400, appletsCreated: 28400 }
    ]
  },
  aiPerformance: {
    overallAccuracyPct: 91.4,
    p95LatencySec: 1.82,
    uptimePct: 99.88,
    errorRatePct: 0.38,
    hallucinationRatePct: 0.42,
    safetyIncidentsCount: 0,
    costPer1kRequestsUSD: 0.29,
    costPerUserUSD: 1.74,
    modelMix: [
      { model: 'Gemini 2.5 Flash (Default Code Engine)', sharePct: 74, avgLatencyMs: 580, costSharePct: 42 },
      { model: 'Gemini 2.5 Pro (Deep Architecture & Refactor)', sharePct: 18, avgLatencyMs: 2400, costSharePct: 46 },
      { model: 'Imagen 3 / Specialized Asset Vision', sharePct: 8, avgLatencyMs: 3100, costSharePct: 12 }
    ],
    monthlyLatencyTrend: [
      { month: 'Jan 26', p50: 980, p95: 2850, errorRate: 0.94 },
      { month: 'Feb 26', p50: 910, p95: 2640, errorRate: 0.81 },
      { month: 'Mar 26', p50: 840, p95: 2420, errorRate: 0.65 },
      { month: 'Apr 26', p50: 780, p95: 2210, errorRate: 0.58 },
      { month: 'May 26', p50: 720, p95: 2050, errorRate: 0.49 },
      { month: 'Jun 26', p50: 690, p95: 1980, errorRate: 0.44 },
      { month: 'Jul 26', p50: 660, p95: 1910, errorRate: 0.41 },
      { month: 'Aug 26', p50: 645, p95: 1860, errorRate: 0.39 },
      { month: 'Sep 26', p50: 640, p95: 1820, errorRate: 0.38 }
    ]
  },
  financials: {
    totalBudgetUSD: 1250000,
    actualSpendYTDUSD: 986400,
    burnRateMonthlyUSD: 84200,
    runwayMonths: 16.4,
    computeApiCostYTDUSD: 362400,
    annualizedRunRateRevenueUSD: 1420000,
    projectedROI: '3.4x over 24 months',
    costVariancePct: 11.2,
    spendBreakdown: [
      { category: 'Engineering & Product Talent', budgeted: 620000, actual: 584000, variancePct: -5.8 },
      { category: 'Compute & AI Inference (GCP/Gemini)', budgeted: 290000, actual: 362400, variancePct: 24.9 },
      { category: 'Cloud Infrastructure & DB Storage', budgeted: 120000, actual: 104000, variancePct: -13.3 },
      { category: 'Security, Audits & Compliance', budgeted: 110000, actual: 95000, variancePct: -13.6 },
      { category: 'Marketing & Developer Relations', budgeted: 110000, actual: 89000, variancePct: -19.1 }
    ],
    monthlyBurnTrend: [
      { month: 'Jan 26', budget: 95000, actual: 88000, computeApi: 28000 },
      { month: 'Feb 26', budget: 95000, actual: 92000, computeApi: 32000 },
      { month: 'Mar 26', budget: 105000, actual: 99000, computeApi: 36000 },
      { month: 'Apr 26', budget: 105000, actual: 104000, computeApi: 39000 },
      { month: 'May 26', budget: 110000, actual: 114000, computeApi: 43000 },
      { month: 'Jun 26', budget: 110000, actual: 119000, computeApi: 46000 },
      { month: 'Jul 26', budget: 115000, actual: 122000, computeApi: 48000 },
      { month: 'Aug 26', budget: 115000, actual: 124000, computeApi: 49400 },
      { month: 'Sep 26', budget: 115000, actual: 124400, computeApi: 51000 }
    ]
  },
  teamDelivery: {
    headcount: 24,
    totalCapacityStoryPoints: 480,
    avgVelocityPoints: 412,
    velocityTrend: [
      { sprint: 'Sprint 20', committed: 95, completed: 88, velocityScore: 92.6 },
      { sprint: 'Sprint 21', committed: 100, completed: 96, velocityScore: 96.0 },
      { sprint: 'Sprint 22', committed: 105, completed: 92, velocityScore: 87.6 },
      { sprint: 'Sprint 23', committed: 110, completed: 104, velocityScore: 94.5 },
      { sprint: 'Sprint 24', committed: 110, completed: 98, velocityScore: 89.1 },
      { sprint: 'Sprint 25', committed: 115, completed: 110, velocityScore: 95.6 }
    ],
    keyHiresAndGaps: [
      { role: 'Staff LLM Compiler Engineer', status: 'Critical Gap', impact: 'Slows down syntax recovery & multi-agent merge trees.', targetDate: '2026-10-15' },
      { role: 'Senior Cloud Security Architect', status: 'Offer Stage', impact: 'Required for SOC2 Type II final closure.', targetDate: '2026-10-01' },
      { role: 'Lead Frontend Performance Engineer', status: 'Filled', impact: 'Optimized virtualized DOM tables and chart rendering.', targetDate: '2026-08-15' },
      { role: 'Customer Success Solutions Lead', status: 'Sourcing', impact: 'Needed to scale client onboarding from 40 to 150 enterprise accounts.', targetDate: '2026-11-01' }
    ],
    criticalBlockers: [
      {
        id: 'blk-1',
        title: 'Multi-region Firestore Latency Spikes during Peak Batch Sync',
        severity: 'High',
        owner: 'Infrastructure Core',
        unblockStrategy: 'Migrate high-volume writes to batched distributed counters and write-behind cache.'
      },
      {
        id: 'blk-2',
        title: 'External OAuth Consent Verification Backlog with 3P APIs',
        severity: 'Medium',
        owner: 'Product Security',
        unblockStrategy: 'Expedited partner verification program initiated with Google Cloud Partner Network.'
      }
    ]
  },
  risks: [
    {
      id: 'risk-1',
      title: 'Inference Compute Cost Surge at Scale',
      category: 'Technical / Compute',
      likelihood: 4,
      impact: 4,
      score: 16,
      owner: 'VP Engineering',
      mitigation: 'Implement prompt compression, semantic response caching, and model routing to Flash tier for boilerplate queries.',
      status: 'Active'
    },
    {
      id: 'risk-2',
      title: 'Data Privacy & PII Leakage in Generated Applets',
      category: 'Data Privacy / Security',
      likelihood: 2,
      impact: 5,
      score: 10,
      owner: 'Chief Information Security Officer',
      mitigation: 'Automated DLP filtering on client-side state, isolated sandboxes, and zero-data-retention compliance policies.',
      status: 'Mitigated'
    },
    {
      id: 'risk-3',
      title: 'Competitor Native Studio Bundling (e.g. Cursor, v0, Lovable)',
      category: 'Adoption',
      likelihood: 4,
      impact: 3,
      score: 12,
      owner: 'Product Strategy Lead',
      mitigation: 'Double down on full-stack enterprise workflows (RBAC, ERP, OpsVision telemetry, biometric attendance integration) where generic code builders cannot compete.',
      status: 'Active'
    },
    {
      id: 'risk-4',
      title: 'Staff LLM Compiler Engineering Shortage',
      category: 'Talent',
      likelihood: 3,
      impact: 3,
      score: 9,
      owner: 'Head of Talent',
      mitigation: 'Engaged specialized technical search agency and offering competitive equity packages.',
      status: 'Active'
    },
    {
      id: 'risk-5',
      title: 'EU AI Act & Global Regulatory Compliance Certification',
      category: 'Regulatory / Ethics',
      likelihood: 2,
      impact: 4,
      score: 8,
      owner: 'Legal & Compliance Counsel',
      mitigation: 'Maintained audit trails, model cards, deterministic guardrails, and explainable AI provenance logs.',
      status: 'Monitoring'
    }
  ],
  competitiveSnapshot: [
    {
      competitor: 'v0 / Vercel Enterprise',
      recentMove: 'Launched generative UI component builder with Next.js export capabilities.',
      threatLevel: 'Medium',
      ourAdvantageOrResponse: 'Our platform delivers full-stack multi-role ERP portals, real-time database state sync, and operational hardware/field telemetry integration out of the box.'
    },
    {
      competitor: 'Cursor / Anysphere',
      recentMove: 'Expanded background composer subagent capabilities for local desktop developers.',
      threatLevel: 'Medium',
      ourAdvantageOrResponse: 'AI Studio is cloud-native, zero-setup, collaborative for non-technical executives and field operations leaders, not just IDE coders.'
    },
    {
      competitor: 'Lovable.dev & Bolt.new',
      recentMove: 'Aggressive marketing towards consumer vibe-coding and rapid MVP builders.',
      threatLevel: 'Low',
      ourAdvantageOrResponse: 'We own the enterprise operations moat: deep tender lifecycle, biometric attendance, SLA breach alerts, and role-based data governance.'
    }
  ],
  decisionsAndAsks: [
    {
      id: 'ask-1',
      rank: 1,
      decisionTitle: 'Approve $180,000 for Compute Optimization & Semantic Tiered Caching Gateway',
      needOrAsk: '$180k CapEx allocation for Q4 2026 infrastructure re-architecture.',
      approvalRequired: 'CEO & CFO Formal Sign-off',
      recommendedAction: 'Approve immediate deployment of semantic vector caching and Flash-tier smart routing.',
      tradeOffs: 'Alternative is continuing unoptimized token burn, which will erode gross margins by 14% at 100k MAU.',
      roiImpact: 'Projected $340k annual recurring cloud savings; reduces P95 latency from 1.82s to 1.10s.',
      urgency: 'Immediate (7 Days)'
    },
    {
      id: 'ask-2',
      rank: 2,
      decisionTitle: 'Greenlight Enterprise Dedicated VPC & White-Label Packaging',
      needOrAsk: 'Dedicated 4-engineer allocation for 6 weeks and compliance certification spend ($45k).',
      approvalRequired: 'CEO Sign-off',
      recommendedAction: 'Prioritize enterprise VPC build-out to convert 6 Fortune 500 pilots currently in procurement.',
      tradeOffs: 'Will defer consumer template gallery feature by 3 weeks.',
      roiImpact: 'Unlocks $420,000 in committed Annual Contract Value (ACV) within Q4 2026.',
      urgency: 'Next 30 Days'
    },
    {
      id: 'ask-3',
      rank: 3,
      decisionTitle: 'Authorization for 2 Accelerated Principal AI Compiler Hires',
      needOrAsk: 'Sign-off on out-of-band compensation band for 2 Principal ML Systems Engineers.',
      approvalRequired: 'CEO & HR Head Sign-off',
      recommendedAction: 'Close candidate offers by Oct 15 to eliminate multi-file merge bottlenecks.',
      tradeOffs: 'Higher initial payroll burn offset by eliminating external contractor retainers.',
      roiImpact: 'Increases sprint story completion velocity by +25% and shortens product delivery cycles.',
      urgency: 'Next 30 Days'
    }
  ],
  timeline306090: [
    {
      horizon: 'Next 30 Days',
      priorities: [
        'Deploy Semantic Prompt & Response Cache on Gemini Flash to reduce inference cost by 25%.',
        'Close offer for Senior Cloud Security Architect & finish SOC2 Type II control remediation.',
        'Resolve multi-file incremental patching merge conflicts in DevEx engine.'
      ],
      expectedOutcomes: [
        'Monthly compute spend stabilized below $75,000.',
        'Zero blocker items for enterprise security audit review.',
        'Patch error rate drops from 0.38% to <0.15%.'
      ],
      targetMilestone: 'Milestone 4 (Incremental Patching Engine v2.1)',
      successMetric: 'P95 Latency < 1.4s, Compute Cost < $0.22/1k req'
    },
    {
      horizon: 'Next 60 Days',
      priorities: [
        'Roll out Private VPC isolation and customer-managed encryption keys (CMEK).',
        'Launch Onboarding & Guided Interactive Tour for Multi-user Real-time Collab.',
        'Finalize enterprise contracts with first 6 pilot customers.'
      ],
      expectedOutcomes: [
        '$420k in signed new ACV booked into ARR.',
        'Collab feature adoption jumps from 38% to >60%.',
        'Live enterprise multi-tenant cluster operational.'
      ],
      targetMilestone: 'Milestone 5 (Enterprise Private VPC & SOC2)',
      successMetric: 'MAU crosses 60,000, ARR reaches $1.75M'
    },
    {
      horizon: 'Next 90 Days',
      priorities: [
        'Complete One-Click CloudSQL / Firebase automated production deployment pipeline.',
        'Publish AI Studio Developer Ecosystem & Partner Template Marketplace.',
        'Execute Q1 2027 Strategy Planning for Autonomous Multi-Agent Workflows.'
      ],
      expectedOutcomes: [
        'Applet time-to-production cut to <15 seconds.',
        '50+ verified community templates published.',
        'Fully profitable unit economics on core tier.'
      ],
      targetMilestone: 'Milestone 6 (One-Click Prod Deployment)',
      successMetric: 'D30 Retention > 50%, Net Margin > 78%'
    }
  ],
  anomaliesAndFlags: [
    {
      item: 'Compute / Inference Cost vs Budget (+24.9% Variance)',
      observation: 'Actual YTD spend of $362.4k exceeded the $290k budget allocation by $72.4k. Primary driver was rapid user adoption combined with uncompressed multi-agent prompts.',
      severity: 'Amber',
      suggestedAudit: 'Execute prompt token audit, enforce response caching, and implement query routing by October 15.'
    },
    {
      item: 'Semantic Code Diff Milestone Slippage (+18 Days)',
      observation: 'Engineers hit race conditions during concurrent file modifications on large 50+ file repositories.',
      severity: 'Amber',
      suggestedAudit: 'Refactor lock manager and introduce subagent turn coordination before release.'
    },
    {
      item: 'Disparity between DAU/MAU Ratio (38.1%) vs D30 Retention (44.2%)',
      observation: 'Users return in high volume for bi-weekly sprint planning and monthly reviews rather than daily code edits.',
      severity: 'Yellow',
      suggestedAudit: 'Introduce daily digest email and automated OpsVision telemetry alerts to drive daily engagement.'
    }
  ],
  assumptions: [
    'User growth continues at an average of ~12% MoM through Q4 2026.',
    'Gemini API token pricing remains stable with anticipated 10-15% enterprise volume discount.',
    'Enterprise pilot conversion rate holds at minimum 65% based on signed letters of intent (LOIs).'
  ],
  missingDataNotes: [
    'Direct competitor API cost structures are estimated via industry benchmarks; vendor proprietary margins are confidential.',
    'Customer Acquisition Cost (CAC) by granular paid marketing channel is pending Google Ads attribution pipeline rollout (marked as "Data needed: Channel CAC").'
  ]
};
