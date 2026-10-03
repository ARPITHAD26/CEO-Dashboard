import {
  OpsAttendanceRecord,
  OpsOvertimeRecord,
  OpsSiteInspectionRecord,
  OpsClientComplaintRecord,
  OpsSlaComplianceRecord,
  OpsUniformAvailabilityRecord,
  OpsIdCardComplianceRecord,
  OpsEquipmentRecord,
  OpsAttentionItem,
  OpsDataDefinition
} from '../types';

// ============================================================================
// 1. MANPOWER & ATTENDANCE SEED DATA
// ============================================================================
export const INITIAL_OPS_ATTENDANCE_RECORDS: OpsAttendanceRecord[] = [
  {
    id: 'OPS-ATT-001',
    date: '2026-09-17',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service_type: 'Security Guarding',
    category: 'Security Guards',
    shift: 'Morning',
    required_manpower: 45,
    present_count: 43,
    absent_count: 2,
    attendance_pct: 95.6,
    absenteeism_pct: 4.4,
    relievers_required: 2,
    relievers_available: 2,
    reliever_shortage: 0,
    net_shortage: 0,
    status: 'Normal',
    shortage_reason: 'Sick leave covered by reliever pool',
    action_taken: 'Deployed standby reliever from South Hub'
  },
  {
    id: 'OPS-ATT-002',
    date: '2026-09-17',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service_type: 'Housekeeping & Soft FM',
    category: 'Janitors & HK Staff',
    shift: 'Morning',
    required_manpower: 80,
    present_count: 71,
    absent_count: 9,
    attendance_pct: 88.8,
    absenteeism_pct: 11.2,
    relievers_required: 8,
    relievers_available: 6,
    reliever_shortage: 2,
    net_shortage: 2,
    status: 'Critical Shortage',
    shortage_reason: 'Sudden transport breakdown in North corridor; 2 ward posts short',
    action_taken: 'Authorized 4 hours OT for night shift janitors & dispatched roaming reliever'
  },
  {
    id: 'OPS-ATT-003',
    date: '2026-09-17',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service_type: 'Security Guarding',
    category: 'Security Guards',
    shift: 'General',
    required_manpower: 120,
    present_count: 116,
    absent_count: 4,
    attendance_pct: 96.7,
    absenteeism_pct: 3.3,
    relievers_required: 4,
    relievers_available: 3,
    reliever_shortage: 1,
    net_shortage: 1,
    status: 'Shortage',
    shortage_reason: '1 perimeter tower post unstaffed for 90 minutes',
    action_taken: 'Head Guard rotated roving patrol to cover tower post'
  },
  {
    id: 'OPS-ATT-004',
    date: '2026-09-17',
    client_id: 'C-004',
    client_name: 'Sunsand Luxury Resorts',
    site_id: 'S-204',
    site_name: 'Sunsand Beach Resort',
    service_type: 'Housekeeping & Soft FM',
    category: 'Janitors & HK Staff',
    shift: 'Morning',
    required_manpower: 35,
    present_count: 34,
    absent_count: 1,
    attendance_pct: 97.1,
    absenteeism_pct: 2.9,
    relievers_required: 1,
    relievers_available: 1,
    reliever_shortage: 0,
    net_shortage: 0,
    status: 'Normal',
    shortage_reason: 'Approved annual leave',
    action_taken: 'Reliever deployed on scheduled roster'
  },
  {
    id: 'OPS-ATT-005',
    date: '2026-09-17',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service_type: 'Security Guarding',
    category: 'Armed Security',
    shift: 'Night',
    required_manpower: 50,
    present_count: 42,
    absent_count: 8,
    attendance_pct: 84.0,
    absenteeism_pct: 16.0,
    relievers_required: 5,
    relievers_available: 4,
    reliever_shortage: 1,
    net_shortage: 4,
    status: 'Critical Shortage',
    shortage_reason: 'Monsoon waterlogging prevented night crew arrivals',
    action_taken: 'Overtime activated for evening shift armed personnel'
  },
  {
    id: 'OPS-ATT-006',
    date: '2026-09-17',
    client_id: 'C-006',
    client_name: 'Zenith Infotech Hub',
    site_id: 'S-206',
    site_name: 'Zenith IT Facility',
    service_type: 'Technical / MEP',
    category: 'Technicians & Operators',
    shift: 'Morning',
    required_manpower: 60,
    present_count: 59,
    absent_count: 1,
    attendance_pct: 98.3,
    absenteeism_pct: 1.7,
    relievers_required: 2,
    relievers_available: 2,
    reliever_shortage: 0,
    net_shortage: 0,
    status: 'Normal',
    shortage_reason: 'All critical MEP BMS consoles manned',
    action_taken: 'On-schedule standby roster functioning'
  }
];

// ============================================================================
// 2. OVERTIME & COST SEED DATA (With Causality Chain Connector)
// ============================================================================
export const INITIAL_OPS_OVERTIME_RECORDS: OpsOvertimeRecord[] = [
  {
    id: 'OPS-OT-001',
    period: 'Sep 2026 (MTD)',
    date: '2026-09-17',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service_type: 'Housekeeping & Soft FM',
    category: 'Sanitization & Infection Control',
    ot_hours: 480,
    prior_period_ot_hours: 390,
    variance_hours: 90,
    variance_pct: 23.1,
    ot_rate_per_hr: 390,
    total_ot_cost: 187200,
    total_ot_cost_lakhs: 1.87,
    causal_chain: {
      absentee_count: 42,
      reliever_gap: 14,
      driven_ot_hours: 480,
      ot_cost_incurred: 187200
    },
    operational_story: 'Hospital OT & ICU 24x7 sanitization protocol required 14 gap-cover shifts after localized transit strike, forcing 480 OT hours.',
    is_significant_exception: true,
    approved_by: 'Sudhir Patil (Operations Head)'
  },
  {
    id: 'OPS-OT-002',
    period: 'Sep 2026 (MTD)',
    date: '2026-09-17',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service_type: 'Security Guarding',
    category: 'Perimeter Armed Guards',
    ot_hours: 360,
    prior_period_ot_hours: 320,
    variance_hours: 40,
    variance_pct: 12.5,
    ot_rate_per_hr: 410,
    total_ot_cost: 147600,
    total_ot_cost_lakhs: 1.48,
    causal_chain: {
      absentee_count: 28,
      reliever_gap: 10,
      driven_ot_hours: 360,
      ot_cost_incurred: 147600
    },
    operational_story: 'High-value customs bond area required mandatory double armed manning during weekend night surges when relievers fell short.',
    is_significant_exception: true,
    approved_by: 'Vikram Singh (Field Manager)'
  },
  {
    id: 'OPS-OT-003',
    period: 'Sep 2026 (MTD)',
    date: '2026-09-17',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service_type: 'Security Guarding',
    category: 'Access Control & Visitors',
    ot_hours: 220,
    prior_period_ot_hours: 260,
    variance_hours: -40,
    variance_pct: -15.4,
    ot_rate_per_hr: 380,
    total_ot_cost: 83600,
    total_ot_cost_lakhs: 0.84,
    causal_chain: {
      absentee_count: 18,
      reliever_gap: 6,
      driven_ot_hours: 220,
      ot_cost_incurred: 83600
    },
    operational_story: 'Global Townhall VIP visit created 3 additional access control points for 48 hours.',
    is_significant_exception: false,
    approved_by: 'Rajesh Nair (Field Officer)'
  },
  {
    id: 'OPS-OT-004',
    period: 'Sep 2026 (MTD)',
    date: '2026-09-17',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service_type: 'Housekeeping & Soft FM',
    category: 'Deep Cleaning',
    ot_hours: 180,
    prior_period_ot_hours: 150,
    variance_hours: 30,
    variance_pct: 20.0,
    ot_rate_per_hr: 370,
    total_ot_cost: 66600,
    total_ot_cost_lakhs: 0.67,
    causal_chain: {
      absentee_count: 14,
      reliever_gap: 4,
      driven_ot_hours: 180,
      ot_cost_incurred: 66600
    },
    operational_story: 'Weekend floor buffing and high-rise glass facade cleaning roster outside standard tenancy hours.',
    is_significant_exception: false,
    approved_by: 'Kavita Rao (Quality Auditor)'
  }
];

// ============================================================================
// 3. SITE INSPECTIONS SEED DATA (Planned vs Completed Model)
// ============================================================================
export const INITIAL_OPS_SITE_INSPECTIONS: OpsSiteInspectionRecord[] = [
  {
    id: 'OPS-INSP-001',
    inspection_code: 'INSP-2026-089',
    planned_date: '2026-09-16',
    actual_inspection_date: '2026-09-16',
    inspector_name: 'Rajesh Nair',
    inspector_role: 'Senior Field Officer',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service: 'Security & Soft FM',
    score_pct: 94,
    findings_observations: 'Main visitor portal muster signed; CCTV control room logs verified. 1 guard turnout found without company cap.',
    action_required: 'Issue replacement cap from site inventory; conduct 10-min grooming refresher at change of shift.',
    responsible_person: 'Ramesh Verma (Site Supervisor)',
    due_date: '2026-09-18',
    status: 'Completed',
    qr_scan_verified: true,
    qr_timestamp: '2026-09-16 10:14:22',
    evidence_photos: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60',
        caption: 'Visitor post turnstile verification & logbook stamp',
        timestamp: '2026-09-16 10:18:00',
        is_before_after: false,
        tag: 'Post Guard'
      },
      {
        url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60',
        caption: 'Muster roll attendance audit and biometric match',
        timestamp: '2026-09-16 10:30:15',
        is_before_after: false,
        tag: 'Muster Roll'
      }
    ],
    checklist_items: [
      { item: 'Staff Uniform & Lanyard Grooming', passed: true },
      { item: 'Biometric Attendance vs Physical Roster Match', passed: true },
      { item: 'Perimeter Patrol Baton Scans Verified', passed: true },
      { item: 'First Aid Box & Fire Extinguisher Inspection Tags', passed: true }
    ]
  },
  {
    id: 'OPS-INSP-002',
    inspection_code: 'INSP-2026-090',
    planned_date: '2026-09-16',
    actual_inspection_date: '2026-09-16',
    inspector_name: 'Sudhir Patil',
    inspector_role: 'Operations Area Manager',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service: 'Hospital Infection Control HK',
    score_pct: 88,
    findings_observations: 'Bio-medical waste disposal color coding compliant in ICU. Basement trolley room chemical dilutions lacked measuring dispensers.',
    action_required: 'Procure 4 dosing pumps for Taski chemicals; train janitorial squad on dilution ratios.',
    responsible_person: 'Dr. Anita Desai & HK Spoc Anthony Raj',
    due_date: '2026-09-20',
    status: 'Pending Action',
    qr_scan_verified: true,
    qr_timestamp: '2026-09-16 14:05:40',
    evidence_photos: [
      {
        url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60',
        caption: 'ICU ward floor sanitization log & ATP swab test',
        timestamp: '2026-09-16 14:22:10',
        is_before_after: true,
        tag: 'Area Cleanliness'
      }
    ],
    checklist_items: [
      { item: 'Hospital Color Coded Mops Separation', passed: true },
      { item: 'Taski Chemical Safe Storage & MSDS Sheets', passed: false, remarks: 'Dispenser pump missing' },
      { item: 'PPE Kit (Gloves, Apron, Masks) Compliance', passed: true },
      { item: 'Washroom Deep Scrub Checklist Completed', passed: true }
    ]
  },
  {
    id: 'OPS-INSP-003',
    inspection_code: 'INSP-2026-091',
    planned_date: '2026-09-17',
    actual_inspection_date: '2026-09-17',
    inspector_name: 'Kavita Rao',
    inspector_role: 'Lead Quality Auditor',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service: 'Integrated FM & Security',
    score_pct: 74,
    findings_observations: 'Basement B2 emergency exit door held open with a wedge; ride-on auto scrubber parked in aisle with depleted battery.',
    action_required: 'Immediate removal of wedge, re-arm magnetic sensor; deploy backup single disc scrubber and check charger wiring.',
    responsible_person: 'Suresh Menon (Tech Park Manager)',
    due_date: '2026-09-17',
    status: 'Escalated',
    qr_scan_verified: true,
    qr_timestamp: '2026-09-17 09:45:00',
    evidence_photos: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
        caption: 'Basement B2 fire door wedge escalation (Violation rectified)',
        timestamp: '2026-09-17 09:50:33',
        is_before_after: true,
        tag: 'Machinery'
      }
    ],
    checklist_items: [
      { item: 'Fire Exit Clear & Sensor Armed', passed: false, remarks: 'Wedge violation logged' },
      { item: 'Floor Scrubbing Machine Status', passed: false, remarks: 'Battery charger failure' },
      { item: 'Security Boom Barrier Response Time', passed: true },
      { item: 'Visitor ID Badge Return Reconciliation', passed: true }
    ]
  },
  {
    id: 'OPS-INSP-004',
    inspection_code: 'INSP-2026-092',
    planned_date: '2026-09-17',
    actual_inspection_date: '2026-09-17',
    inspector_name: 'Vikram Singh',
    inspector_role: 'Field Manager',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service: 'Armed Security & Gate Control',
    score_pct: 82,
    findings_observations: 'Inbound container seal verification registers fully up to date. Perimeter fence illumination bulb fused near gate 4.',
    action_required: 'Procure 100W LED floodlight replacement from Stores; electrician task assigned.',
    responsible_person: 'Gopal Krishna (Depot Supervisor)',
    due_date: '2026-09-19',
    status: 'Pending Action',
    qr_scan_verified: true,
    qr_timestamp: '2026-09-17 11:30:12',
    evidence_photos: [
      {
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60',
        caption: 'Container dock barrier inspection & seal register',
        timestamp: '2026-09-17 11:38:00',
        is_before_after: false,
        tag: 'Post Guard'
      }
    ],
    checklist_items: [
      { item: 'Container Seal Verification Protocol', passed: true },
      { item: 'Perimeter Floodlighting Integrity', passed: false, remarks: 'Gate 4 bulb fused' },
      { item: 'Armed Guard Firearm License & Chamber Check', passed: true },
      { item: 'Breathalyzer Log on Drivers & Guards', passed: true }
    ]
  }
];

// ============================================================================
// 4. CLIENT COMPLAINTS & CLOSURE SEED DATA (OpsVision Integrated)
// ============================================================================
export const INITIAL_OPS_CLIENT_COMPLAINTS: OpsClientComplaintRecord[] = [
  {
    id: 'OPS-CC-401',
    ticket_no: 'OPS-CC-401',
    date_received: '2026-09-14',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service: 'Soft FM - Housekeeping',
    complaint_category: 'Service Quality',
    description: 'Executive 8th-floor boardroom coffee stain on plush wool rug not extracted before VIP meeting.',
    complaint_owner: 'Ramesh Verma (Site Supervisor)',
    action_plan: 'Deployed industrial spot extraction machine with specialized dry-foam chemical; completed within 90 minutes.',
    status: 'Closed',
    target_closure_date: '2026-09-15',
    actual_closure_date: '2026-09-14',
    closure_evidence_notes: 'Spot extraction verified by Client Admin Ms. Shalini; signed satisfaction chit uploaded.',
    closure_evidence_photos: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60'
    ],
    source_system: 'OpsVision App',
    is_overdue: false,
    satisfaction_rating: 5
  },
  {
    id: 'OPS-CC-402',
    ticket_no: 'OPS-CC-402',
    date_received: '2026-09-15',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service: 'Security Guarding',
    complaint_category: 'Grooming / Uniform',
    description: 'Tower B turnstile guard reported wearing faded mismatch trouser and unpolished footwear during morning peak.',
    complaint_owner: 'Suresh Menon (Tech Park Manager)',
    action_plan: 'Issued 2 fresh uniform sets immediately from buffer stores; guard counseled on corporate client grooming code.',
    status: 'Closed',
    target_closure_date: '2026-09-16',
    actual_closure_date: '2026-09-15',
    closure_evidence_notes: 'New uniform kit issued, audited by Lead Auditor Kavita Rao.',
    closure_evidence_photos: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60'
    ],
    source_system: 'Direct Client Call',
    is_overdue: false,
    satisfaction_rating: 4
  },
  {
    id: 'OPS-CC-403',
    ticket_no: 'OPS-CC-403',
    date_received: '2026-09-15',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service: 'Security - Patrolling',
    complaint_category: 'Night Patrolling',
    description: 'Client CCTV review showed 45-minute delay in 02:00 AM perimeter patrol round at eastern boundary wall.',
    complaint_owner: 'Vikram Singh (Field Manager)',
    action_plan: 'Reviewing QR patrol baton logs; issuing written warning to night guard; installing electronic checkpoint buzzer.',
    status: 'Open',
    target_closure_date: '2026-09-18',
    source_system: 'Email Escalation',
    is_overdue: false
  },
  {
    id: 'OPS-CC-404',
    ticket_no: 'OPS-CC-404',
    date_received: '2026-09-12',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service: 'Housekeeping - Sanitization',
    complaint_category: 'Manpower Shortage',
    description: 'Post-op recovery ward delay in linen replenishment due to missing morning shift orderly.',
    complaint_owner: 'Sudhir Patil (Operations Head)',
    action_plan: 'Deploy permanent buffer orderly from 07:00 AM; revised handover checklist with Head Nurse.',
    status: 'Pending',
    target_closure_date: '2026-09-16',
    source_system: 'OpsVision App',
    is_overdue: true
  },
  {
    id: 'OPS-CC-405',
    ticket_no: 'OPS-CC-405',
    date_received: '2026-09-16',
    client_id: 'C-006',
    client_name: 'Zenith Infotech Hub',
    site_id: 'S-206',
    site_name: 'Zenith IT Facility',
    service: 'Technical / MEP',
    complaint_category: 'Machine / Material',
    description: 'Server room secondary UPS cooling sensor alarm flagged delayed maintenance ticket update.',
    complaint_owner: 'Rajesh Nair (Field Officer)',
    action_plan: 'Calibrated Honeywell digital temperature sensor; replaced lithium coin backup battery; closed ticket on OpsVision portal.',
    status: 'Closed',
    target_closure_date: '2026-09-16',
    actual_closure_date: '2026-09-16',
    closure_evidence_notes: 'BMS telemetry graph showing steady 19.5°C attached to ticket.',
    source_system: 'OpsVision App',
    is_overdue: false,
    satisfaction_rating: 5
  },
  {
    id: 'OPS-CC-406',
    ticket_no: 'OPS-CC-406',
    date_received: '2026-09-13',
    client_id: 'C-004',
    client_name: 'Sunsand Luxury Resorts',
    site_id: 'S-204',
    site_name: 'Sunsand Beach Resort',
    service: 'Soft FM - Public Areas',
    complaint_category: 'Service Quality',
    description: 'Poolside cabana sand accumulation reported by guest concierge at 11:30 AM.',
    complaint_owner: 'Anthony Raj (HK Lead)',
    action_plan: 'Established hourly quick-sweep protocol with lightweight cordless vacuum unit.',
    status: 'Closed',
    target_closure_date: '2026-09-14',
    actual_closure_date: '2026-09-13',
    closure_evidence_notes: 'Hourly sign-off board installed behind cabana bar.',
    source_system: 'QR Code Portal',
    is_overdue: false,
    satisfaction_rating: 5
  }
];

// ============================================================================
// 5. SLA COMPLIANCE SEED DATA (OpsVision Digital FM Model)
// ============================================================================
export const INITIAL_OPS_SLA_COMPLIANCES: OpsSlaComplianceRecord[] = [
  {
    id: 'OPS-SLA-001',
    period: 'Sep 2026',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service_type: 'Integrated Security & Housekeeping',
    area_name: 'Main Lobby, Atrium & Turnstiles',
    sla_target_pct: 98.0,
    sla_achieved_pct: 98.4,
    status: 'Compliant',
    is_critical_recurring: false,
    breach_count: 0,
    total_tasks_monitored: 340,
    tasks_passed: 335,
    tasks_failed: 5,
    ops_vision_ref: 'OPSVIS-LOBBY-01',
    underlying_tasks: [
      {
        task_id: 'TSK-QR-101',
        task_name: 'Hourly Lobby Floor Dust Mop & Glass Polish',
        qr_code_location: 'QR-LOBBY-POST-01',
        scan_time: '2026-09-17 08:15:22',
        officer_name: 'Santosh Kumar',
        passed: true,
        before_photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=60',
        after_photo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60',
        checklist_summary: 'Floor shiny; glass entrance smudges removed; fragrance diffuser verified.'
      },
      {
        task_id: 'TSK-QR-102',
        task_name: 'Visitor Access Register & Metal Detector Calibration',
        qr_code_location: 'QR-GATE-DFMD-02',
        scan_time: '2026-09-17 08:30:10',
        officer_name: 'Ramesh Verma',
        passed: true,
        checklist_summary: 'Test piece passed with audible buzzer; visitor photo logs active.'
      }
    ]
  },
  {
    id: 'OPS-SLA-002',
    period: 'Sep 2026',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service_type: 'Hospital Infection Control',
    area_name: 'ICU, Operation Theatres & Emergency Wing',
    sla_target_pct: 99.0,
    sla_achieved_pct: 97.2,
    status: 'At Risk',
    is_critical_recurring: true,
    breach_count: 2,
    total_tasks_monitored: 520,
    tasks_passed: 505,
    tasks_failed: 15,
    ops_vision_ref: 'OPSVIS-HOSP-ICU',
    underlying_tasks: [
      {
        task_id: 'TSK-QR-201',
        task_name: 'Terminal Cleaning Between Surgical Cases',
        qr_code_location: 'QR-OT-WING-04',
        scan_time: '2026-09-17 10:45:00',
        officer_name: 'Maria Fernandes',
        passed: true,
        before_photo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60',
        after_photo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60',
        checklist_summary: 'Fogging executed; bactericidal mop heads swapped; swab score 0 RLU.'
      },
      {
        task_id: 'TSK-QR-202',
        task_name: 'Bio-Hazard Waste Bin 2-Hourly Evacuation',
        qr_code_location: 'QR-EMERG-BMW-02',
        scan_time: '2026-09-17 12:40:15',
        officer_name: 'Anthony Raj',
        passed: false,
        checklist_summary: 'Bin exceeded 75% fill mark prior to collection due to emergency ward influx.'
      }
    ]
  },
  {
    id: 'OPS-SLA-003',
    period: 'Sep 2026',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service_type: 'Integrated FM & Security',
    area_name: 'Tower A & B Multi-Tier Parking & Basements',
    sla_target_pct: 95.0,
    sla_achieved_pct: 91.5,
    status: 'Breached',
    is_critical_recurring: true,
    breach_count: 4,
    total_tasks_monitored: 290,
    tasks_passed: 265,
    tasks_failed: 25,
    ops_vision_ref: 'OPSVIS-PARK-B2',
    underlying_tasks: [
      {
        task_id: 'TSK-QR-301',
        task_name: 'Basement Sump Pump Level & Exhaust Fan Log',
        qr_code_location: 'QR-B2-PUMP-01',
        scan_time: '2026-09-17 07:20:00',
        officer_name: 'Suresh Menon',
        passed: false,
        checklist_summary: 'Sump pump auto float switch jammed; manual pump switch was activated.'
      }
    ]
  },
  {
    id: 'OPS-SLA-004',
    period: 'Sep 2026',
    client_id: 'C-006',
    client_name: 'Zenith Infotech Hub',
    site_id: 'S-206',
    site_name: 'Zenith IT Facility',
    service_type: 'Critical Technical / MEP',
    area_name: 'Tier-3 Data Center & Precision Cooling',
    sla_target_pct: 99.5,
    sla_achieved_pct: 99.8,
    status: 'Compliant',
    is_critical_recurring: false,
    breach_count: 0,
    total_tasks_monitored: 410,
    tasks_passed: 409,
    tasks_failed: 1,
    ops_vision_ref: 'OPSVIS-DC-TIER3',
    underlying_tasks: [
      {
        task_id: 'TSK-QR-401',
        task_name: 'PAC Unit Temperature & Humidity Continuous Roster',
        qr_code_location: 'QR-DC-PAC-03',
        scan_time: '2026-09-17 09:00:00',
        officer_name: 'Vikram Singh',
        passed: true,
        checklist_summary: 'Temperature 20.1°C; Relative Humidity 48%; dual compressors operational.'
      }
    ]
  }
];

// ============================================================================
// 6. UNIFORM AVAILABILITY SEED DATA (Operations Site Readiness View)
// ============================================================================
export const INITIAL_OPS_UNIFORM_AVAILABILITY: OpsUniformAvailabilityRecord[] = [
  {
    id: 'OPS-UNI-001',
    audit_date: '2026-09-16',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service_category: 'Corporate Security & Concierge',
    required_sets_at_site: 90, // 45 pax * 2 sets
    available_sets_at_site: 88,
    availability_pct: 97.8,
    site_shortage_qty: 2,
    has_shortage: true,
    pending_indent_ref: 'IND-2026-042',
    action_plan: '2 blazers on express dry cleaning cycle; will return to site closet by 18:00.',
    responsible_supervisor: 'Ramesh Verma',
    status: 'Shortage Pending'
  },
  {
    id: 'OPS-UNI-002',
    audit_date: '2026-09-16',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service_category: 'Hospital Sanitization Scrubs',
    required_sets_at_site: 160,
    available_sets_at_site: 154,
    availability_pct: 96.2,
    site_shortage_qty: 6,
    has_shortage: true,
    pending_indent_ref: 'IND-2026-048',
    action_plan: 'Central Stores dispatched 6 medium scrub sets via courier tracking DTDC-88419.',
    responsible_supervisor: 'Anthony Raj',
    status: 'Indent Dispatched'
  },
  {
    id: 'OPS-UNI-003',
    audit_date: '2026-09-17',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service_category: 'Security Safari & HK Overalls',
    required_sets_at_site: 240,
    available_sets_at_site: 232,
    availability_pct: 96.7,
    site_shortage_qty: 8,
    has_shortage: true,
    pending_indent_ref: 'IND-2026-051',
    action_plan: 'Buffer store replacement indent raised for 8 sets of safety boots and trousers.',
    responsible_supervisor: 'Suresh Menon',
    status: 'Shortage Pending'
  },
  {
    id: 'OPS-UNI-004',
    audit_date: '2026-09-17',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service_category: 'High-Vis Industrial Safety Wear',
    required_sets_at_site: 100,
    available_sets_at_site: 94,
    availability_pct: 94.0,
    site_shortage_qty: 6,
    has_shortage: true,
    pending_indent_ref: 'IND-2026-055',
    action_plan: '6 reflective safety vests worn out from rain exposure; emergency supply drawn from East Regional hub.',
    responsible_supervisor: 'Gopal Krishna',
    status: 'Indent Dispatched'
  },
  {
    id: 'OPS-UNI-005',
    audit_date: '2026-09-17',
    client_id: 'C-006',
    client_name: 'Zenith Infotech Hub',
    site_id: 'S-206',
    site_name: 'Zenith IT Facility',
    service_category: 'Tech MEP Static-Dissipative Uniforms',
    required_sets_at_site: 120,
    available_sets_at_site: 120,
    availability_pct: 100.0,
    site_shortage_qty: 0,
    has_shortage: false,
    action_plan: '100% compliant and verified in locker room inspection.',
    responsible_supervisor: 'Vikram Singh',
    status: 'Sufficient'
  }
];

// ============================================================================
// 7. ID CARD COMPLIANCE SEED DATA (Operations Field Verification)
// ============================================================================
export const INITIAL_OPS_ID_CARD_COMPLIANCE: OpsIdCardComplianceRecord[] = [
  {
    id: 'OPS-IDC-001',
    audit_date: '2026-09-16',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    service_category: 'Security & Soft FM',
    total_staff_on_duty: 45,
    compliant_id_count: 44,
    compliance_pct: 97.8,
    exceptions_count: 1,
    exceptions_list: [
      {
        employee_id: 'EMP-SEC-104',
        employee_name: 'Sunil Jadhav',
        role: 'Security Guard',
        issue: 'Missing ID Card',
        temp_pass_issued: true,
        target_card_date: '2026-09-18',
        status: 'Temp Pass Active'
      }
    ]
  },
  {
    id: 'OPS-IDC-002',
    audit_date: '2026-09-16',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    service_category: 'Hospital HK & Orderlies',
    total_staff_on_duty: 80,
    compliant_id_count: 77,
    compliance_pct: 96.3,
    exceptions_count: 3,
    exceptions_list: [
      {
        employee_id: 'EMP-HK-218',
        employee_name: 'Geeta Shinde',
        role: 'Ward Janitor',
        issue: 'Damaged/Worn Card',
        temp_pass_issued: true,
        target_card_date: '2026-09-19',
        status: 'Pending Replacement'
      },
      {
        employee_id: 'EMP-HK-219',
        employee_name: 'Kiran Kamble',
        role: 'Linen Orderly',
        issue: 'No Lanyard',
        temp_pass_issued: false,
        target_card_date: '2026-09-16',
        status: 'Resolved'
      }
    ]
  },
  {
    id: 'OPS-IDC-003',
    audit_date: '2026-09-17',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    service_category: 'Integrated FM & Security',
    total_staff_on_duty: 120,
    compliant_id_count: 118,
    compliance_pct: 98.3,
    exceptions_count: 2,
    exceptions_list: [
      {
        employee_id: 'EMP-SEC-305',
        employee_name: 'Amitabh Sen',
        role: 'Perimeter Guard',
        issue: 'Expired Validity',
        temp_pass_issued: true,
        target_card_date: '2026-09-19',
        status: 'Temp Pass Active'
      }
    ]
  },
  {
    id: 'OPS-IDC-004',
    audit_date: '2026-09-17',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    service_category: 'Armed Guards & Gate Staff',
    total_staff_on_duty: 50,
    compliant_id_count: 49,
    compliance_pct: 98.0,
    exceptions_count: 1,
    exceptions_list: [
      {
        employee_id: 'EMP-ARM-012',
        employee_name: 'Baldev Singh',
        role: 'Armed Security Officer',
        issue: 'No Lanyard',
        temp_pass_issued: false,
        target_card_date: '2026-09-17',
        status: 'Resolved'
      }
    ]
  },
  {
    id: 'OPS-IDC-005',
    audit_date: '2026-09-17',
    client_id: 'C-006',
    client_name: 'Zenith Infotech Hub',
    site_id: 'S-206',
    site_name: 'Zenith IT Facility',
    service_category: 'MEP Engineers & Shift Techs',
    total_staff_on_duty: 60,
    compliant_id_count: 60,
    compliance_pct: 100.0,
    exceptions_count: 0,
    exceptions_list: []
  }
];

// ============================================================================
// 8. EQUIPMENT / MACHINE AVAILABILITY SEED DATA
// ============================================================================
export const INITIAL_OPS_EQUIPMENT_RECORDS: OpsEquipmentRecord[] = [
  {
    id: 'OPS-EQ-001',
    equipment_code: 'EQ-SCRUB-012',
    machine_name: 'Taski Swingo 1650 Ride-On Auto Scrubber',
    category: 'Housekeeping Heavy Machine',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    status: 'Under Repair',
    issue_description: 'Squeegee vacuum motor burnt out; battery terminal corrosion',
    breakdown_date: '2026-09-14',
    service_partner_vendor: 'Apex Fleet & Tool Maintenance (V-102)',
    action_required: 'OEM technician on site replacing vacuum motor under warranty',
    expected_operational_date: '2026-09-18',
    amc_status: 'Under Warranty',
    is_critical_for_sla: true
  },
  {
    id: 'OPS-EQ-002',
    equipment_code: 'EQ-WASH-004',
    machine_name: 'Karcher HD 6/15 High-Pressure Jet Washer',
    category: 'Housekeeping Heavy Machine',
    client_id: 'C-005',
    client_name: 'Northside Freight Logistics',
    site_id: 'S-205',
    site_name: 'Northside Freight Depot',
    status: 'Unavailable',
    issue_description: 'High-pressure brass cylinder head cracked from freeze/heat stress',
    breakdown_date: '2026-09-15',
    service_partner_vendor: 'Global Supplies Inc. (V-101)',
    action_required: 'Replacement head on order from OEM; standby single nozzle unit deployed',
    expected_operational_date: '2026-09-20',
    amc_status: 'Active',
    is_critical_for_sla: true
  },
  {
    id: 'OPS-EQ-003',
    equipment_code: 'EQ-HHMD-033',
    machine_name: 'Garrett Super Scanner V Handheld Metal Detectors (Set of 4)',
    category: 'Security Access & Screening',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    status: 'Under Repair',
    issue_description: '2 units sensitivity potentiometer loose; intermittent audio chirp',
    breakdown_date: '2026-09-16',
    service_partner_vendor: 'TechSolutions Corp (V-103)',
    action_required: 'Dispatched to TechSolutions service lab; 2 backup Garrett units issued',
    expected_operational_date: '2026-09-19',
    amc_status: 'Active',
    is_critical_for_sla: false
  },
  {
    id: 'OPS-EQ-004',
    equipment_code: 'EQ-DFMD-008',
    machine_name: 'Garrett 6-Zone Walk-Through Door Frame Metal Detector',
    category: 'Security Access & Screening',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    status: 'Available',
    amc_status: 'Active',
    is_critical_for_sla: true
  },
  {
    id: 'OPS-EQ-005',
    equipment_code: 'EQ-BUFF-019',
    machine_name: 'Taski Ergodisc 400 High-Speed Floor Burnisher',
    category: 'Housekeeping Heavy Machine',
    client_id: 'C-001',
    client_name: 'Apex Property Holdings',
    site_id: 'S-201',
    site_name: 'Metro Office Complex',
    status: 'Available',
    amc_status: 'Active',
    is_critical_for_sla: false
  },
  {
    id: 'OPS-EQ-006',
    equipment_code: 'EQ-FOG-005',
    machine_name: 'ULV Cold Fogger Sanitization Generator (Hospital Grade)',
    category: 'Housekeeping Heavy Machine',
    client_id: 'C-002',
    client_name: 'St. Jude Health System',
    site_id: 'S-202',
    site_name: 'City General Hospital',
    status: 'Available',
    amc_status: 'Active',
    is_critical_for_sla: true
  },
  {
    id: 'OPS-EQ-007',
    equipment_code: 'EQ-SWEEP-002',
    machine_name: 'Roots Multi-Clean Industrial Battery Sweeper',
    category: 'Housekeeping Heavy Machine',
    client_id: 'C-003',
    client_name: 'OmniCorp Global HQ',
    site_id: 'S-203',
    site_name: 'Valley Tech Park Hub',
    status: 'Required',
    issue_description: 'Client expanded South Parking Phase 3; 1 additional ride-on sweeper requested in contract addendum',
    action_required: 'Procurement Indent IND-2026-059 raised for CAPEX procurement',
    amc_status: 'Ad-Hoc Service',
    is_critical_for_sla: false
  }
];

// ============================================================================
// 9. DYNAMIC "OPERATIONS — ATTENTION REQUIRED" RADAR SEED DATA
// ============================================================================
export const INITIAL_OPS_ATTENTION_ITEMS: OpsAttentionItem[] = [
  {
    id: 'ATTN-OPS-001',
    severity: 'Critical',
    category: 'Attendance',
    headline: 'Site Attendance Below Defined Threshold (<90%)',
    description: 'Northside Freight Depot logged 84.0% attendance (42/50 deployed) due to regional monsoon flooding.',
    client_name: 'Northside Freight Logistics',
    site_name: 'Northside Freight Depot',
    metric_value: '84.0%',
    threshold_value: '90.0%',
    action_needed: 'Deploy 4 roving armed relievers from East Hub & approve double-shift OT to maintain container gate security.',
    owner: 'Gopal Krishna & Vikram Singh',
    resolved: false,
    created_at: '2026-09-17 07:30:00'
  },
  {
    id: 'ATTN-OPS-002',
    severity: 'Critical',
    category: 'Relievers',
    headline: 'Reliever Shortage at 3 Sites (Net Gap of 4 Pax)',
    description: 'Available relievers (18) fell short of required (22) across St. Jude Hospital (2 gap), Valley Tech Park (1 gap), and Northside Depot (1 gap).',
    client_name: 'Cross-Site Hubs',
    site_name: 'City Hospital, Valley Tech, Northside',
    metric_value: '18 Available / 22 Required',
    threshold_value: '100% Reliever Cover',
    action_needed: 'Activate backup standbys from Central Roster & coordinate with HR for immediate joining clearances.',
    owner: 'Sudhir Patil (Operations Head)',
    resolved: false,
    created_at: '2026-09-17 08:00:00'
  },
  {
    id: 'ATTN-OPS-003',
    severity: 'Critical',
    category: 'SLA Breaches',
    headline: 'SLA Compliance Below Threshold at 2 Sites',
    description: 'Valley Tech Park Hub Basement B2 scored 91.5% (target 95%) and City General Hospital ICU logged 97.2% (target 99%).',
    client_name: 'OmniCorp HQ & St. Jude',
    site_name: 'Valley Tech Park Hub & City General Hospital',
    metric_value: '91.5% & 97.2%',
    threshold_value: '≥ 95% SLA Target',
    action_needed: 'Audit OpsVision task streams; fix jammed pump switch at Tech Park & enforce 2-hourly bio-waste QR scans.',
    owner: 'Kavita Rao & Suresh Menon',
    resolved: false,
    created_at: '2026-09-17 09:15:00'
  },
  {
    id: 'ATTN-OPS-004',
    severity: 'Warning',
    category: 'Complaints',
    headline: '4 Client Complaints Pending Closure (1 Overdue)',
    description: 'Hospital orderly linen replenishment overdue (OPS-CC-404); Night perimeter patrolling delay inquiry open (OPS-CC-403).',
    client_name: 'St. Jude & Northside Logistics',
    site_name: 'City General Hospital & Northside Depot',
    metric_value: '4 Pending (1 Overdue)',
    threshold_value: 'Zero Overdue Complaints',
    action_needed: 'Conduct physical closure sign-offs with Head Nurse & Depot Manager; upload OpsVision closure proof.',
    owner: 'Sudhir Patil & Vikram Singh',
    resolved: false,
    created_at: '2026-09-17 10:00:00'
  },
  {
    id: 'ATTN-OPS-005',
    severity: 'Warning',
    category: 'Equipment',
    headline: '5 Heavy Machines & Screening Units Unavailable/Repair',
    description: 'Taski Ride-On Scrubber (Valley Tech) & Karcher High-Pressure Washer (Depot) out of commission; 2 HHMD units in lab.',
    client_name: 'Valley Tech, Northside Depot, Metro Office',
    site_name: '3 Client Sites',
    metric_value: '7 Unavailable (91% Availability)',
    threshold_value: '≥ 95% Availability',
    action_needed: 'Expedite OEM parts delivery with Vendor V-102 & deploy backup single-disc burnishers.',
    owner: 'Stores Spoc & Rajesh Nair',
    resolved: false,
    created_at: '2026-09-17 10:45:00'
  }
];

// ============================================================================
// 10. IT DATA DEFINITIONS DICTIONARY (Operations Governance Mandate)
// ============================================================================
export const INITIAL_OPS_DATA_DEFINITIONS: OpsDataDefinition[] = [
  {
    id: 'OPS-DEF-001',
    metric_name: 'Site Attendance %',
    functional_group: 'Manpower & Attendance',
    source_system: 'Biometric & QR Muster Sync (OpsVision)',
    owner: 'Operations Head (Sudhir Patil)',
    frequency: 'Daily 08:30 AM & 20:30 PM',
    calculation_logic: '(Total Physical/Biometric Present Guards & Janitors ÷ Total Contractually Required Deployed Manpower) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Service → Date/Shift → Role Category',
    target_benchmark: '≥ 95.0% Across All Live Contracts'
  },
  {
    id: 'OPS-DEF-002',
    metric_name: 'Absenteeism % & Reliever Gap',
    functional_group: 'Manpower & Attendance',
    source_system: 'Daily Roster Management Portal',
    owner: 'Field Operations Managers',
    frequency: 'Daily Real-Time at Shift Handover',
    calculation_logic: 'Absenteeism % = (Unplanned Absent Staff ÷ Required Manpower) × 100; Reliever Gap = max(0, Relievers Required - Relievers Available)',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Category → Reliever Pool',
    target_benchmark: 'Absenteeism ≤ 5.0%; Zero Net Reliever Gap'
  },
  {
    id: 'OPS-DEF-003',
    metric_name: 'Total Overtime (OT) Hours & Cost',
    functional_group: 'OT & Cost',
    source_system: 'Ops OT Authorization Logs & Biometric Overstay',
    owner: 'Area Operations Managers & Finance Billing',
    frequency: 'Weekly MTD & Monthly Consolidation',
    calculation_logic: 'OT Hours = Sum of all approved extra shift hours; OT Cost = OT Hours × Agreed Standard/Statutory OT Rate (1.5x / 2.0x)',
    status: 'Active & Verified',
    drill_down_path: 'Site → Service → Absenteeism Link → Approved OT Hours → ₹ Lakhs Cost',
    target_benchmark: 'OT Cost ≤ 2.5% of Total Billed Revenue'
  },
  {
    id: 'OPS-DEF-004',
    metric_name: 'Site Inspections Completion %',
    functional_group: 'Site Control',
    source_system: 'OpsVision Field Audit & GPS Geotag Module',
    owner: 'Lead Quality Auditor (Kavita Rao)',
    frequency: 'Weekly & Monthly Audit Cycle',
    calculation_logic: '(Completed Field Inspections with QR Verification & Photos ÷ Planned Scheduled Audits) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Officer → Client → Site → Date → Findings → Corrective Action → Evidence Photos',
    target_benchmark: '100% of Planned Monthly Audits'
  },
  {
    id: 'OPS-DEF-005',
    metric_name: 'Client Complaints Closure %',
    functional_group: 'Client Complaints',
    source_system: 'OpsVision Ticket Escalation Engine',
    owner: 'Operations Customer Success Lead',
    frequency: 'Real-Time / Daily Standup',
    calculation_logic: '(Complaints Successfully Resolved & Signed-Off ÷ Total Complaints Received / Required for Closure) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Service → Complaint Ticket → Owner → Action Plan → Closure Evidence',
    target_benchmark: '≥ 90.0% Closure Within Agreed SLA (24-48 hrs)'
  },
  {
    id: 'OPS-DEF-006',
    metric_name: 'SLA Compliance & QR Task Index',
    functional_group: 'Service Performance',
    source_system: 'OpsVision Digital FM Engine (QR Patrol & Checklist)',
    owner: 'Digital FM Lead & Operations Head',
    frequency: 'Continuous Real-Time QR Telemetry',
    calculation_logic: '(Total QR Checkpoints & Task Items Scanned and Passed on Schedule ÷ Total Mandatory SLA Tasks Scheduled) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Service Area → SLA Breach Status → Underlying QR Task → Before/After Photos',
    target_benchmark: '≥ 98.0% SLA Delivery Across All Facilities'
  },
  {
    id: 'OPS-DEF-007',
    metric_name: 'Site Uniform Availability %',
    functional_group: 'Site Readiness',
    source_system: 'Site Buffer Inventory & Field Verification',
    owner: 'Site Supervisors & Field Officers',
    frequency: 'Weekly Physical Audit',
    calculation_logic: '(Available Clean Uniform Sets Present at Site Ready for Use ÷ Required Manning Sets) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Service Category → Shortage Quantity → Buffer Indent Ref',
    target_benchmark: '≥ 98.0% Site Uniform Availability'
  },
  {
    id: 'OPS-DEF-008',
    metric_name: 'ID Card Field Compliance %',
    functional_group: 'Site Readiness',
    source_system: 'Ops Turnout Muster & HRMS Cross-Check',
    owner: 'Field Officers & Security Supervisors',
    frequency: 'Weekly Field Turnout Check',
    calculation_logic: '(Staff on Duty Wearing Valid Company ID Card & Lanyard ÷ Total Staff on Duty) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Employee ID → Exception Issue → Temporary Pass Status',
    target_benchmark: '≥ 99.0% ID Card Compliance'
  },
  {
    id: 'OPS-DEF-009',
    metric_name: 'Equipment & Machine Availability %',
    functional_group: 'Site Readiness',
    source_system: 'Asset Management & Preventive Maintenance Module',
    owner: 'Stores & Maintenance Spoc (Anthony Raj)',
    frequency: 'Daily Equipment Log',
    calculation_logic: '(Operational Heavy & Screening Machines Available for Work ÷ Total Required Contractual Machinery Roster) × 100',
    status: 'Active & Verified',
    drill_down_path: 'Client → Site → Machine Code → Operational Status → Breakdown Reason → Action Plan',
    target_benchmark: '≥ 95.0% Operational Machine Availability'
  }
];
