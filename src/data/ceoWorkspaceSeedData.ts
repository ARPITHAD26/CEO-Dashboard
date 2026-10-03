import { 
  TDPlan, TDSessionRecord, TDTrainer, TDComplianceRadarItem,
  ITProject, ITTask, OtherInitiative, MeetingRecord, MeetingActionPoint,
  ContextFile, MyWorkItem, LiveUpdateEvent
} from '../types';

export const INITIAL_TD_PLANS: TDPlan[] = [
  {
    id: 'TDP-2026-001',
    plan_name: 'Corporate Annual Mandatory Training Master Plan 2026',
    period_type: 'Annual',
    year: 2026,
    target_sessions: 140,
    target_participants: 2800,
    status: 'In Progress',
    created_by: 'Jyothy (T&D Head)',
    topics: ['Fire & Life Safety', 'Hospital Sanitation Protocols', 'Disaster & Evacuation Drills', 'POSH & Statutory Compliance', 'First Aid & CPR', 'Soft Skills & Customer Delight'],
    remarks: 'Comprehensive statutory compliance plan for all healthcare, tech parks, and commercial facility deployments.'
  },
  {
    id: 'TDP-2026-M07',
    plan_name: 'July 2026 Monthly Operational Excellence Drive',
    period_type: 'Monthly',
    year: 2026,
    month: 'July',
    target_sessions: 18,
    target_participants: 450,
    status: 'In Progress' as const,
    created_by: 'Jyothy (T&D Head)',
    topics: ['Hazardous Waste Isolation', 'Crowd Management Protocols', 'Security Guard Posture & Grooming', 'Emergency Power Breakdown Protocol'],
    remarks: 'Focus on high-risk sites and medical ward certifications.'
  },
  {
    id: 'TDP-2026-UNIT-01',
    plan_name: 'Vani Vilas Hospital Ward Protocol & Infection Control Plan',
    period_type: 'Unit/Client',
    year: 2026,
    unit_id: 'S-202',
    unit_name: 'City General Hospital (Vani Vilas Wing)',
    client_name: 'St. Jude Health System',
    target_sessions: 8,
    target_participants: 120,
    status: 'In Progress' as const,
    created_by: 'Narsu (Training Officer)',
    topics: ['Hospital Disinfection Protocols', 'Bio-Medical Waste Segregation', 'Patient Emergency Transport Assistance'],
    remarks: 'Specialized healthcare hygiene & patient escort security.'
  },
  {
    id: 'TDP-2026-UNIT-02',
    plan_name: 'Valley Tech Park Access Control & Fire Drill Schedule',
    period_type: 'Unit/Client',
    year: 2026,
    unit_id: 'S-203',
    unit_name: 'Valley Tech Park Hub',
    client_name: 'OmniCorp Global HQ',
    target_sessions: 6,
    target_participants: 180,
    status: 'Approved' as const,
    created_by: 'Meera Iyer (Senior Trainer)',
    topics: ['Fire Sprinkler & Hydrant Operations', 'Automated Visitor Access Gate Ops', 'Crisis Escalation Handling'],
    remarks: 'Mandatory quarterly drill requested by client facility director.'
  }
];

export const INITIAL_TD_TRAINERS: TDTrainer[] = [
  {
    id: 'TRN-001',
    name: 'Jyothy',
    email: 'jyothy@spoorthy.in',
    phone: '+91 98450 11220',
    specialization: ['Leadership Strategy', 'Quality Audits', 'ISO 9001/45001 Standards', 'Executive Governance'],
    assigned_units: ['All Branches', 'Corporate HQ'],
    total_sessions: 42,
    avg_attendance_pct: 98,
    avg_pass_pct: 96,
    rating: 4.9
  },
  {
    id: 'TRN-002',
    name: 'Narsu',
    email: 'narsu.training@spoorthy.in',
    phone: '+91 98452 44331',
    specialization: ['Hospital Protocols', 'Infection Control', 'Bio-Medical Waste', 'Emergency First Response'],
    assigned_units: ['Vani Vilas Hospital', 'City General Hospital', 'Apex Medical Center'],
    total_sessions: 38,
    avg_attendance_pct: 94,
    avg_pass_pct: 92,
    rating: 4.8
  },
  {
    id: 'TRN-003',
    name: 'Meera Iyer',
    email: 'meera.iyer@spoorthy.in',
    phone: '+91 98453 88992',
    specialization: ['Fire Safety & Drill Management', 'Access Control Systems', 'Industrial Safety', 'Crisis Drills'],
    assigned_units: ['Valley Tech Park', 'Metro Office Complex', 'Zenith IT Facility'],
    total_sessions: 45,
    avg_attendance_pct: 96,
    avg_pass_pct: 94,
    rating: 4.9
  },
  {
    id: 'TRN-004',
    name: 'Sunita Joshi',
    email: 'sunita.joshi@spoorthy.in',
    phone: '+91 98455 77119',
    specialization: ['Statutory Compliance', 'POSH Guidelines', 'Customer Experience', 'Grooming Standards'],
    assigned_units: ['Sunsand Beach Resort', 'Northside Freight Depot', 'City General Hospital'],
    total_sessions: 29,
    avg_attendance_pct: 91,
    avg_pass_pct: 89,
    rating: 4.7
  }
];

export const INITIAL_TD_SESSIONS: TDSessionRecord[] = [
  {
    id: 'TDS-2026-101',
    plan_id: 'TDP-2026-UNIT-01',
    unit_or_client: 'Vani Vilas Hospital (Ward B & C)',
    site_id: 'S-202',
    topic: 'Hospital Disinfection & Isolation Room Protocol',
    category: 'Hospital Protocol',
    planned_date: '2026-07-16',
    actual_date: '2026-07-16',
    trainer: 'Narsu',
    trainer_email: 'narsu.training@spoorthy.in',
    duration_hours: 3.5,
    target_participants: 25,
    attended_participants: 24,
    attendance_pct: 96,
    evaluation_required: true,
    evaluated_count: 24,
    passed_count: 23,
    failed_count: 1,
    pass_pct: 95.8,
    status: 'Completed',
    remarks: 'Conducted live in surgical wing. Practical hands-on chemical dilution test executed flawlessly.',
    follow_up_action: '1 guard (Raju K.) requires re-test on Color Coded Waste Disposal next Monday.',
    created_at: '2026-07-14T10:00:00Z',
    updated_at: '2026-07-16T14:30:00Z',
    evidence_files: [
      {
        id: 'EV-TD-001',
        file_name: 'VaniVilas_Training_Photo_1.jpg',
        file_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
        uploaded_by: 'Narsu (Training Officer)',
        uploaded_at: '2026-07-16T14:15:00Z',
        version: 'v1.0',
        context_type: 'Session',
        context_id: 'TDS-2026-101',
        caption: 'Live demonstration of disinfectant application in OT corridor'
      },
      {
        id: 'EV-TD-002',
        file_name: 'Attendance_Sheet_Signed_VaniVilas.pdf',
        file_type: 'pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_size: '1.4 MB',
        uploaded_by: 'Narsu (Training Officer)',
        uploaded_at: '2026-07-16T14:20:00Z',
        version: 'v1.0',
        context_type: 'Session',
        context_id: 'TDS-2026-101',
        caption: 'Signed attendance register verified by Hospital Facility Manager'
      }
    ]
  },
  {
    id: 'TDS-2026-102',
    plan_id: 'TDP-2026-UNIT-02',
    unit_or_client: 'Valley Tech Park Hub - Tower 3',
    site_id: 'S-203',
    topic: 'Automated Access Turnstiles & Emergency Fire Evacuation',
    category: 'Fire & Life Safety',
    planned_date: '2026-07-15',
    actual_date: '2026-07-15',
    trainer: 'Meera Iyer',
    trainer_email: 'meera.iyer@spoorthy.in',
    duration_hours: 4.0,
    target_participants: 30,
    attended_participants: 29,
    attendance_pct: 96.6,
    evaluation_required: true,
    evaluated_count: 29,
    passed_count: 28,
    failed_count: 1,
    pass_pct: 96.5,
    status: 'Completed',
    remarks: 'Full building fire alarm drill synchronized with BMS team.',
    follow_up_action: 'Replace 2 expired CO2 fire extinguishers on Floor 4.',
    created_at: '2026-07-12T09:00:00Z',
    updated_at: '2026-07-15T16:00:00Z',
    evidence_files: [
      {
        id: 'EV-TD-003',
        file_name: 'ValleyTech_Fire_Drill_Photo.jpg',
        file_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=80',
        uploaded_by: 'Meera Iyer',
        uploaded_at: '2026-07-15T15:45:00Z',
        version: 'v1.0',
        context_type: 'Session',
        context_id: 'TDS-2026-102',
        caption: 'Fire assembly point evacuation drill completed in 3m 42s'
      }
    ]
  },
  {
    id: 'TDS-2026-103',
    plan_id: 'TDP-2026-M07',
    unit_or_client: 'Metro Office Complex',
    site_id: 'S-201',
    topic: 'Customer Service & Professional Corporate Grooming',
    category: 'Soft Skills & Grooming',
    planned_date: '2026-07-18',
    trainer: 'Sunita Joshi',
    trainer_email: 'sunita.joshi@spoorthy.in',
    duration_hours: 2.5,
    target_participants: 20,
    evaluation_required: true,
    status: 'Planned',
    remarks: 'Scheduled for front desk security and lobby marshals.',
    created_at: '2026-07-10T11:00:00Z',
    updated_at: '2026-07-10T11:00:00Z',
    evidence_files: []
  },
  {
    id: 'TDS-2026-104',
    plan_id: 'TDP-2026-M07',
    unit_or_client: 'Northside Freight Depot',
    site_id: 'S-205',
    topic: 'Heavy Machinery Hazard Safety & Perimeter Patrolling',
    category: 'Mandatory Compliance',
    planned_date: '2026-07-12',
    actual_date: '2026-07-12',
    trainer: 'Meera Iyer',
    trainer_email: 'meera.iyer@spoorthy.in',
    duration_hours: 3.0,
    target_participants: 22,
    attended_participants: 20,
    attendance_pct: 90.9,
    evaluation_required: true,
    evaluated_count: 20,
    passed_count: 19,
    failed_count: 1,
    pass_pct: 95.0,
    status: 'Completed',
    remarks: 'Night vision perimeter checks and high-visibility vest compliance verified.',
    created_at: '2026-07-08T14:00:00Z',
    updated_at: '2026-07-12T17:00:00Z',
    evidence_files: []
  },
  {
    id: 'TDS-2026-105',
    plan_id: 'TDP-2026-M07',
    unit_or_client: 'Sunsand Beach Resort',
    site_id: 'S-204',
    topic: 'Beach Area Emergency Water Rescue & CPR First Aid',
    category: 'Emergency Evacuation',
    planned_date: '2026-07-14',
    trainer: 'Sunita Joshi',
    trainer_email: 'sunita.joshi@spoorthy.in',
    duration_hours: 4.0,
    target_participants: 15,
    evaluation_required: true,
    status: 'Postponed',
    remarks: 'Postponed to July 21 due to heavy cyclone alert warning at coastal site.',
    follow_up_action: 'Rescheduled for July 21 at 09:00 AM.',
    created_at: '2026-07-09T10:00:00Z',
    updated_at: '2026-07-13T16:00:00Z',
    evidence_files: []
  },
  {
    id: 'TDS-2026-106',
    plan_id: 'TDP-2026-001',
    unit_or_client: 'Zenith IT Facility',
    site_id: 'S-206',
    topic: 'Data Center Security, Access Logs & Cyber Physical Security',
    category: 'Security Tactics',
    planned_date: '2026-07-20',
    trainer: 'Meera Iyer',
    trainer_email: 'meera.iyer@spoorthy.in',
    duration_hours: 3.0,
    target_participants: 25,
    evaluation_required: true,
    status: 'Planned',
    remarks: 'Server room physical clearance protocol training.',
    created_at: '2026-07-11T12:00:00Z',
    updated_at: '2026-07-11T12:00:00Z',
    evidence_files: []
  }
];

export const INITIAL_TD_COMPLIANCE_RADAR: TDComplianceRadarItem[] = [
  {
    id: 'CR-001',
    standard_name: 'NABH / Hospital Ward Disinfection & PPE Standards',
    category: 'Hospital Protocol',
    target_sites: ['City General Hospital', 'Vani Vilas Hospital', 'Apex Medical Center'],
    required_frequency_days: 90,
    total_certified: 114,
    total_required: 120,
    compliance_pct: 95.0,
    expiring_in_30_days: 8,
    overdue_count: 6,
    risk_level: 'Low',
    last_audit_date: '2026-07-10'
  },
  {
    id: 'CR-002',
    standard_name: 'Statutory Fire Safety & Emergency Evacuation (NBC 2016)',
    category: 'Fire & Life Safety',
    target_sites: ['Metro Office Complex', 'Valley Tech Park Hub', 'Northside Freight Depot', 'Zenith IT Facility'],
    required_frequency_days: 180,
    total_certified: 248,
    total_required: 260,
    compliance_pct: 95.4,
    expiring_in_30_days: 14,
    overdue_count: 12,
    risk_level: 'Medium',
    last_audit_date: '2026-07-08'
  },
  {
    id: 'CR-003',
    standard_name: 'Hazardous Chemical Handling & Spillage Management',
    category: 'Chemical & Hazmat',
    target_sites: ['Valley Tech Park Hub', 'Northside Freight Depot'],
    required_frequency_days: 120,
    total_certified: 68,
    total_required: 80,
    compliance_pct: 85.0,
    expiring_in_30_days: 5,
    overdue_count: 12,
    risk_level: 'High',
    last_audit_date: '2026-06-25'
  },
  {
    id: 'CR-004',
    standard_name: 'POSH (Prevention of Sexual Harassment) Annual Certification',
    category: 'Mandatory Statutory',
    target_sites: ['All 6 Corporate Sites'],
    required_frequency_days: 365,
    total_certified: 310,
    total_required: 335,
    compliance_pct: 92.5,
    expiring_in_30_days: 18,
    overdue_count: 25,
    risk_level: 'Low',
    last_audit_date: '2026-07-01'
  },
  {
    id: 'CR-005',
    standard_name: 'ISO 45001 Occupational Health & Safety Guard Posture',
    category: 'ISO 9001/45001',
    target_sites: ['Metro Office Complex', 'Zenith IT Facility'],
    required_frequency_days: 180,
    total_certified: 98,
    total_required: 105,
    compliance_pct: 93.3,
    expiring_in_30_days: 4,
    overdue_count: 7,
    risk_level: 'Low',
    last_audit_date: '2026-07-05'
  },
  {
    id: 'CR-006',
    standard_name: 'Coastal Lifeguard First Response & Aquatic AED Protocol',
    category: 'Customer Specific',
    target_sites: ['Sunsand Beach Resort'],
    required_frequency_days: 90,
    total_certified: 31,
    total_required: 35,
    compliance_pct: 88.6,
    expiring_in_30_days: 3,
    overdue_count: 4,
    risk_level: 'Medium',
    last_audit_date: '2026-06-20'
  }
];

export const INITIAL_IT_PROJECTS: ITProject[] = [
  {
    id: 'ITP-001',
    code: 'OPS-VIS',
    name: 'OpsVision (Real-time Site Patrol & SLA Compliance Tracker)',
    description: 'Mobile GPS geotagged patrol check-in application with offline biometric sync and incident logging for site supervisors.',
    priority: 'Critical',
    status: 'In Progress',
    owner: 'Jyothy',
    start_date: '2026-04-01',
    target_date: '2026-08-15',
    progress_pct: 78,
    workstreams: ['GPS Geofence Module', 'Offline Sync Engine', 'Incident Escalation Hook', 'Site Supervisor Android App'],
    blockers_count: 1,
    evidence_files: [
      {
        id: 'EV-IT-001',
        file_name: 'OpsVision_Architecture_Spec_v2.pdf',
        file_type: 'pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_size: '2.8 MB',
        uploaded_by: 'Raghavendra',
        uploaded_at: '2026-07-10T11:00:00Z',
        version: 'v2.1',
        context_type: 'IT',
        context_id: 'ITP-001',
        caption: 'High level system diagram and offline SQLite caching layer architecture'
      }
    ]
  },
  {
    id: 'ITP-002',
    code: 'HRMS-CORE',
    name: 'HRMS Automated Biometric & Attendance Consolidation Engine',
    description: 'Real-time sync of biometric fingerprint & face scanners across 6 branch sites into central payroll calculator.',
    priority: 'High',
    status: 'In Progress',
    owner: 'Jyothy',
    start_date: '2026-05-15',
    target_date: '2026-08-30',
    progress_pct: 85,
    workstreams: ['Biometric API Connectors', 'Shift Allowance Engine', 'PF/ESIC Deduction Scripts', 'Employee Self Service Portal'],
    blockers_count: 0,
    evidence_files: []
  },
  {
    id: 'ITP-003',
    code: 'VAMS-PASS',
    name: 'VAMS (Visitor Access & Material Pass QR Management System)',
    description: 'QR-code pre-registered visitor invites, contractor badges, and vehicle material inward/outward gate tracking.',
    priority: 'High',
    status: 'In Progress',
    owner: 'Jyothy',
    start_date: '2026-06-01',
    target_date: '2026-09-10',
    progress_pct: 62,
    workstreams: ['WhatsApp Bot QR Invite', 'Gate Guard Tablet Interface', 'Material Returnable Slip Track', 'Audit Logs Export'],
    blockers_count: 0,
    evidence_files: []
  },
  {
    id: 'ITP-004',
    code: 'CEO-DASH',
    name: 'CEO Personal Management & Strategy Cockpit',
    description: 'Executive unified portfolio cockpit capturing point-of-execution work across T&D, IT, Initiatives, and Meetings.',
    priority: 'Critical',
    status: 'In Progress',
    owner: 'Jyothy',
    start_date: '2026-06-15',
    target_date: '2026-07-25',
    progress_pct: 92,
    workstreams: ['RBAC Engine', 'T&D Live Board', 'IT Portfolio Tracker', 'Meetings & MoM Suite', 'Print & Export Station'],
    blockers_count: 0,
    evidence_files: []
  },
  {
    id: 'ITP-005',
    code: 'BILL-TWR',
    name: 'Billing Tower & Automated SLA Penalty Shield',
    description: 'Automated invoice generator reconciling daily attendance logs, equipment uptime, and penalty deductions for corporate clients.',
    priority: 'Medium',
    status: 'Planned',
    owner: 'Jyothy',
    start_date: '2026-08-01',
    target_date: '2026-10-15',
    progress_pct: 20,
    workstreams: ['SLA Rule Parser', 'GST E-Invoice Integration', 'Client Approval Workflow'],
    blockers_count: 0,
    evidence_files: []
  }
];

export const INITIAL_IT_TASKS: ITTask[] = [
  {
    id: 'ITT-101',
    project_id: 'ITP-001',
    project_name: 'OpsVision',
    module_name: 'GPS Geofence Module',
    task_title: 'Implement 50m radius GPS geofence validation for S-203 guard checkpoints',
    description: 'Ensure guards cannot check in unless device GPS coordinate is verified within boundary radius.',
    owner: 'Raghavendra',
    planned_start: '2026-07-08',
    planned_end: '2026-07-16',
    actual_end: '2026-07-15',
    status: 'Completed',
    percent_completed: 100,
    priority: 'Critical',
    remarks: 'Tested on Samsung A14 device in basement; fallback to WiFi BSSID beacon working.',
    evidence_files: [
      {
        id: 'EV-ITT-001',
        file_name: 'Geofence_Test_Results_Pass.png',
        file_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        uploaded_by: 'Raghavendra',
        uploaded_at: '2026-07-15T16:20:00Z',
        context_type: 'Task',
        context_id: 'ITT-101',
        caption: '100% accuracy recorded during field validation at Valley Tech Park Gate 2'
      }
    ]
  },
  {
    id: 'ITT-102',
    project_id: 'ITP-001',
    project_name: 'OpsVision',
    module_name: 'Offline Sync Engine',
    task_title: 'Resolve background sync SQLite queue lock under weak 4G connection',
    description: 'Guards in basement car park experience sync timeouts when coming back online.',
    owner: 'Raghavendra',
    planned_start: '2026-07-14',
    planned_end: '2026-07-18',
    status: 'In Progress',
    percent_completed: 60,
    priority: 'High',
    blocker: 'Need test device batch from procurement with updated firmware.',
    remarks: 'Implemented exponential backoff retry mechanism; conducting stress test.',
    evidence_files: []
  },
  {
    id: 'ITT-103',
    project_id: 'ITP-002',
    project_name: 'HRMS-CORE',
    module_name: 'Biometric API Connectors',
    task_title: 'Build automated nightly cron to pull punch logs from ZKTeco biometric devices',
    description: 'Pull logs from 12 physical biometric terminals every night at 23:59 PM and populate attendance table.',
    owner: 'Arpitha',
    planned_start: '2026-07-10',
    planned_end: '2026-07-16',
    status: 'Completed',
    percent_completed: 100,
    priority: 'Critical',
    remarks: 'Cron tested successfully. 100% attendance sync verified with 0 dropped packets.',
    evidence_files: []
  },
  {
    id: 'ITT-104',
    project_id: 'ITP-003',
    project_name: 'VAMS-PASS',
    module_name: 'WhatsApp Bot QR Invite',
    task_title: 'Integrate WhatsApp Cloud API webhook for instant visitor pass delivery',
    description: 'Visitors receive automated QR code and gate location pin upon host meeting approval.',
    owner: 'Arpitha',
    planned_start: '2026-07-15',
    planned_end: '2026-07-22',
    status: 'In Progress',
    percent_completed: 45,
    priority: 'High',
    remarks: 'Meta Business verification submitted; sandbox QR generation working.',
    evidence_files: []
  },
  {
    id: 'ITT-105',
    project_id: 'ITP-004',
    project_name: 'CEO-DASH',
    module_name: 'RBAC Engine & T&D Board',
    task_title: 'Build interactive drilldown views for CEO, Jyothy, Raghavendra, Arpitha & Trainers',
    description: 'Multi-role permission matrix ensuring role-specific isolation and enterprise rollup.',
    owner: 'Jyothy',
    planned_start: '2026-07-12',
    planned_end: '2026-07-17',
    status: 'Completed',
    percent_completed: 100,
    priority: 'Critical',
    remarks: 'All 5 RBAC profiles mapped with live simulated view toggles.',
    evidence_files: []
  }
];

export const INITIAL_OTHER_INITIATIVES: OtherInitiative[] = [
  {
    id: 'INIT-001',
    name: 'ISO 27001 Information Security Management Audit & Certification',
    description: 'Upgrading corporate cyber policies, workstation encryption, and access control registers for global enterprise client audits.',
    category: 'ISO Certification',
    date_period: 'Q2 - Q3 2026',
    owner: 'Jyothy (IT & Governance)',
    priority: 'High',
    due_date: '2026-08-31',
    status: 'In Progress',
    outcome: 'Stage 1 preliminary readiness gap audit completed with 94% compliance.',
    remarks: 'External auditor (TÜV SÜD) scheduled for final inspection on August 24.',
    attachments: [
      {
        id: 'EV-IN-001',
        file_name: 'ISO_27001_Gap_Assessment_Summary.pdf',
        file_type: 'pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_size: '1.2 MB',
        uploaded_by: 'Jyothy',
        uploaded_at: '2026-07-11T10:30:00Z',
        context_type: 'Initiative',
        context_id: 'INIT-001',
        caption: 'Pre-assessment score sheet signed by lead certified auditor'
      }
    ]
  },
  {
    id: 'INIT-002',
    name: 'Spoorthy Green Earth CSR Campaign & Tree Plantation Drive',
    description: 'Corporate social responsibility initiative planting 1,000 saplings around industrial belt sites and school zones.',
    category: 'CSR',
    date_period: 'July 2026',
    owner: 'Sunita Joshi & Operations Team',
    priority: 'Medium',
    due_date: '2026-07-28',
    status: 'In Progress',
    outcome: '520 saplings planted at Peenya and Nelamangala belts with local municipal authorities.',
    remarks: 'Phase 2 scheduled for coming Saturday.',
    attachments: [
      {
        id: 'EV-IN-002',
        file_name: 'CSR_Plantation_Drive_Day1.jpg',
        file_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
        uploaded_by: 'Sunita Joshi',
        uploaded_at: '2026-07-12T15:00:00Z',
        context_type: 'Initiative',
        context_id: 'INIT-002',
        caption: 'Field supervisors and local community volunteers at Peenya Zone'
      }
    ]
  },
  {
    id: 'INIT-003',
    name: 'Monsoon Safety & High-Risk Site Preparedness Overhaul',
    description: 'Comprehensive inspection of site sump pumps, electrical DG earthing pits, and waterproof guard kits across all 6 client locations.',
    category: 'Safety Month',
    date_period: 'July 2026',
    owner: 'Vikram Singh (Operations)',
    priority: 'Critical',
    due_date: '2026-07-15',
    status: 'Completed',
    outcome: '100% sites equipped with industrial rain suits, torches, emergency submersible pumps, and sandbags.',
    remarks: 'Zero waterlogging incidents reported during recent torrential rain.',
    attachments: []
  },
  {
    id: 'INIT-004',
    name: 'Blue-Collar Uniform Redesign & Ergonomic Footwear Rollout',
    description: 'Rollout of moisture-wicking tactical shirts, reflective neon night piping, and reinforced steel-toe lightweight safety boots.',
    category: 'Branding & Uniforms',
    date_period: 'Q3 2026',
    owner: 'Procurement & HR Joint Committee',
    priority: 'Medium',
    due_date: '2026-08-20',
    status: 'In Progress',
    outcome: '200 trial sets deployed at Metro Office Complex and Sunsand Beach Resort with 98% guard comfort approval.',
    remarks: 'Bulk manufacturer PO placed for 600 sets.',
    attachments: []
  }
];

export const INITIAL_MEETING_ACTIONS: MeetingActionPoint[] = [
  {
    id: 'ACT-001',
    meeting_id: 'MTG-001',
    meeting_title: 'Executive Management Committee - July Operations & Tech Review',
    action_title: 'Expedite OpsVision GPS Geofencing rollout to Vani Vilas Hospital Ward',
    description: 'Deploy 5 supervisor tablets with geofenced patrol tags to hospital site to close audit remarks.',
    owner: 'Raghavendra',
    target_portfolio: 'IT',
    due_date: '2026-07-22',
    status: 'In Progress',
    progress_pct: 70,
    converted_to_task_id: 'ITT-101',
    evidence_files: []
  },
  {
    id: 'ACT-002',
    meeting_id: 'MTG-001',
    meeting_title: 'Executive Management Committee - July Operations & Tech Review',
    action_title: 'Schedule mandatory ISO 9001 refresher batch for Valley Tech Park crew',
    description: 'Low audit score of 74% at S-203 must be corrected with immediate weekend training.',
    owner: 'Narsu',
    target_portfolio: 'T&D',
    due_date: '2026-07-20',
    status: 'In Progress',
    progress_pct: 60,
    evidence_files: []
  },
  {
    id: 'ACT-003',
    meeting_id: 'MTG-002',
    meeting_title: 'IT Steering & Software Product Roadmap Sync',
    action_title: 'Finalize Meta WhatsApp Business API webhook verification',
    description: 'Enable instant QR visitor pass delivery for corporate reception desk.',
    owner: 'Arpitha',
    target_portfolio: 'IT',
    due_date: '2026-07-25',
    status: 'In Progress',
    progress_pct: 50,
    evidence_files: []
  },
  {
    id: 'ACT-004',
    meeting_id: 'MTG-003',
    meeting_title: 'T&D Monthly Curriculum & Evaluation Committee',
    action_title: 'Upload revised Bio-Medical Waste colour-coding flipcharts',
    description: 'Print laminated bilingual instruction charts (Kannada/English) for hospital sites.',
    owner: 'Sunita Joshi',
    target_portfolio: 'T&D',
    due_date: '2026-07-16',
    status: 'Completed',
    progress_pct: 100,
    evidence_files: []
  }
];

export const INITIAL_MEETINGS: MeetingRecord[] = [
  {
    id: 'MTG-001',
    title: 'Executive Management Committee - July Operations & Tech Review',
    meeting_type: 'Management Committee',
    is_recurring: true,
    date_time: '2026-07-15T10:00:00',
    venue_or_link: 'Boardroom A / Google Meet Hybrid',
    organizer: 'CEO Office (Jyothy Co-Chair)',
    portfolio: 'Enterprise',
    participants: ['CEO', 'Jyothy', 'Raghavendra', 'Arpitha', 'Narsu', 'Vikram Singh', 'Deepika Nair'],
    agenda: [
      '1. Review of Q2 Operational KPI dashboard and client SLA metrics',
      '2. T&D Monthly achievement report: Vani Vilas & Valley Tech compliance status',
      '3. IT roadmap progress: OpsVision, HRMS, and VAMS gate system',
      '4. Red flag mitigations: 10-guard shortage at General Hospital and site recovery',
      '5. ISO 27001 preparation and budgetary clearances'
    ],
    mom_text: 'CEO commended the T&D team on achieving 95%+ training pass rate across healthcare units. IT team instructed to prioritize OpsVision GPS accuracy for basement parking patrols. Approved budget for 500 new uniform sets. Mandated that all meeting action points be directly tracked in the CEO Personal Workspace.',
    decisions: [
      {
        id: 'DEC-001',
        decision_text: 'Approved immediate deployment of 5 dedicated backup guards to Vani Vilas Hospital from the reserve pool.',
        approved_by: 'CEO',
        date: '2026-07-15',
        impact_area: 'Operations & HR'
      },
      {
        id: 'DEC-002',
        decision_text: 'Allocated ₹1.8L for OpsVision offline hardware beacons and test mobile devices.',
        approved_by: 'CEO & Finance Head',
        date: '2026-07-15',
        impact_area: 'IT Technology'
      },
      {
        id: 'DEC-003',
        decision_text: 'Made monthly mandatory fire drill evaluation compulsory for contract renewal billing across all tech parks.',
        approved_by: 'Management Committee',
        date: '2026-07-15',
        impact_area: 'T&D Compliance'
      }
    ],
    action_points: [
      INITIAL_MEETING_ACTIONS[0],
      INITIAL_MEETING_ACTIONS[1]
    ],
    agenda_documents: [
      {
        id: 'EV-MTG-001',
        file_name: 'Management_Committee_Docket_July2026.pdf',
        file_type: 'pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_size: '3.4 MB',
        uploaded_by: 'CEO Office',
        uploaded_at: '2026-07-14T17:00:00Z',
        version: 'v1.0',
        context_type: 'Meeting',
        context_id: 'MTG-001',
        caption: 'Consolidated performance docket and strategic agenda notes'
      }
    ],
    status: 'Completed'
  },
  {
    id: 'MTG-002',
    title: 'IT Steering & Software Product Roadmap Sync',
    meeting_type: 'IT Steering',
    is_recurring: true,
    date_time: '2026-07-18T14:30:00',
    venue_or_link: 'Tech War Room / Google Meet',
    organizer: 'Jyothy',
    portfolio: 'IT',
    participants: ['Jyothy', 'Raghavendra', 'Arpitha', 'Lead QA'],
    agenda: [
      '1. OpsVision v2.1 beta release testing walkthrough',
      '2. HRMS biometric multi-site latency and cron optimizations',
      '3. VAMS QR code pass design & WhatsApp delivery integration'
    ],
    decisions: [],
    action_points: [
      INITIAL_MEETING_ACTIONS[2]
    ],
    agenda_documents: [],
    status: 'Scheduled'
  },
  {
    id: 'MTG-003',
    title: 'T&D Monthly Curriculum & Evaluation Review',
    meeting_type: 'T&D Review',
    is_recurring: true,
    date_time: '2026-07-14T11:00:00',
    venue_or_link: 'Training Center Studio',
    organizer: 'Jyothy',
    portfolio: 'T&D',
    participants: ['Jyothy', 'Narsu', 'Meera Iyer', 'Sunita Joshi'],
    agenda: [
      '1. Review of healthcare hygiene curriculum for Vani Vilas hospital',
      '2. Trainer utilization scorecard for July',
      '3. Evidence photo capture compliance across all field sessions'
    ],
    mom_text: 'Reviewed 4 training plans. Verified that photo evidence is now mandatory before closing any session record in the system. Narsu demonstrated 100% digital capture on mobile.',
    decisions: [
      {
        id: 'DEC-004',
        decision_text: 'Mandated photographic and signed attendance upload for 100% of training sessions.',
        approved_by: 'Jyothy',
        date: '2026-07-14',
        impact_area: 'T&D Operations'
      }
    ],
    action_points: [
      INITIAL_MEETING_ACTIONS[3]
    ],
    agenda_documents: [],
    status: 'Completed'
  }
];

export const INITIAL_MY_WORK_ITEMS: MyWorkItem[] = [
  {
    id: 'MW-001',
    title: 'Verify Vani Vilas Hospital training completion & evidence upload',
    type: 'T&D Session',
    portfolio: 'T&D',
    due_date: '2026-07-16',
    owner: 'Jyothy',
    status: 'Completed',
    priority: 'High',
    completion_pct: 100,
    outcome: 'Session TDS-2026-101 verified with 24 attendees and photographic proof.'
  },
  {
    id: 'MW-002',
    title: 'Review OpsVision GPS geofence test report with Raghavendra',
    type: 'IT Task',
    portfolio: 'IT',
    due_date: '2026-07-16',
    owner: 'Jyothy',
    status: 'Completed',
    priority: 'Critical',
    completion_pct: 100,
    outcome: 'Geofence accuracy confirmed at 50m radius with beacon fallback.'
  },
  {
    id: 'MW-003',
    title: 'Sign off on ISO 27001 Stage 1 preliminary gap assessment docket',
    type: 'Initiative',
    portfolio: 'Other Initiatives',
    due_date: '2026-07-17',
    owner: 'Jyothy',
    status: 'In Progress',
    priority: 'High',
    completion_pct: 80
  },
  {
    id: 'MW-004',
    title: 'Prepare Management Committee follow-up task conversion list',
    type: 'Meeting Action',
    portfolio: 'Management & Meetings',
    due_date: '2026-07-17',
    owner: 'Jyothy',
    status: 'In Progress',
    priority: 'High',
    completion_pct: 65
  },
  {
    id: 'MW-005',
    title: 'Executive decision: Approve budget for OpsVision offline hardware beacons',
    type: 'Decision Required',
    portfolio: 'IT',
    due_date: '2026-07-18',
    owner: 'CEO',
    status: 'In Progress',
    priority: 'Critical',
    completion_pct: 50
  },
  {
    id: 'MW-006',
    title: 'Conduct weekly field audit of S-203 Valley Tech fire extinguisher replacements',
    type: 'Follow-up',
    portfolio: 'T&D',
    due_date: '2026-07-19',
    owner: 'Meera Iyer',
    status: 'Planned',
    priority: 'Medium',
    completion_pct: 0
  }
];

export const INITIAL_LIVE_UPDATES: LiveUpdateEvent[] = [
  {
    id: 'UPD-001',
    timestamp: '2026-07-16T14:30:00Z',
    actor: 'Narsu',
    actor_role: 'Training Officer',
    event_type: 'COMPLETED_ACTIVITY',
    portfolio: 'T&D',
    summary: 'Training Conducted at Vani Vilas Hospital',
    detail: 'Completed "Hospital Disinfection & Isolation Room Protocol" with 24 attendees (95.8% pass rate). 2 evidence files uploaded.',
    related_id: 'TDS-2026-101',
    status_badge: '95.8% Pass'
  },
  {
    id: 'UPD-002',
    timestamp: '2026-07-15T16:30:00Z',
    actor: 'Raghavendra',
    actor_role: 'IT Engineer',
    event_type: 'COMPLETED_ACTIVITY',
    portfolio: 'IT',
    summary: 'OpsVision Geofence Checkpoint Passed',
    detail: 'Validated 50m radius GPS accuracy at Valley Tech Park Gate 2 with test evidence attached.',
    related_id: 'ITT-101',
    status_badge: '100% Done'
  },
  {
    id: 'UPD-003',
    timestamp: '2026-07-15T12:00:00Z',
    actor: 'CEO Office',
    actor_role: 'Executive',
    event_type: 'ACTION_COMPLETED',
    portfolio: 'Management & Meetings',
    summary: 'Management Committee MoM & 3 Decisions Recorded',
    detail: 'Recorded decisions on Vani Vilas relief manpower, OpsVision hardware allocation, and fire drill compliance.',
    related_id: 'MTG-001',
    status_badge: '3 Decisions'
  },
  {
    id: 'UPD-004',
    timestamp: '2026-07-14T15:00:00Z',
    actor: 'Jyothy',
    actor_role: 'Portfolio Head',
    event_type: 'NEW_SCHEDULE',
    portfolio: 'T&D',
    summary: 'Scheduled ISO 9001 Refresher Batch for S-203',
    detail: 'Locked weekend session with Meera Iyer for Valley Tech Park crew following low audit score alert.',
    related_id: 'TDS-2026-102',
    status_badge: 'Scheduled'
  },
  {
    id: 'UPD-005',
    timestamp: '2026-07-13T16:00:00Z',
    actor: 'Sunita Joshi',
    actor_role: 'Trainer',
    event_type: 'POSTPONED_CANCELLED',
    portfolio: 'T&D',
    summary: 'Postponed Sunsand Beach Resort Evacuation Drill',
    detail: 'Heavy cyclone alert issued for coastal belt. Rescheduled session to July 21st.',
    related_id: 'TDS-2026-105',
    status_badge: 'Postponed'
  }
];
