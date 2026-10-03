import { useState, FormEvent, useMemo } from 'react';
import { 
  AppState, Training, TDSessionRecord, TDPlan, TDTrainer, ContextFile, Site 
} from '../types';
import { logAuditEntry } from '../data/store';
import { 
  GraduationCap, CheckCircle, Trash2, Plus, Calendar, 
  ShieldAlert, Award, FileText, Image as ImageIcon, Users, 
  Search, Check, X, Bookmark, Building2, BookOpen, UserCheck,
  ExternalLink, Filter, Star, Sparkles, MapPin, Phone, Mail, ShieldCheck
} from 'lucide-react';

interface TrainingViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  currentUserEmail: string;
  allowedSubViews?: string[];
  subRoleName?: string;
}

type TDViewTab = 
  | 'radar' 
  | 'planning' 
  | 'calendar' 
  | 'trainers' 
  | 'employee_roster' 
  | 'tasks';

// Master Training Topic Schema
interface MasterTrainingTopic {
  id: string;
  topic_name: string;
  category: 'Hospital Protocol' | 'Mandatory Compliance' | 'Fire & Life Safety' | 'Security Tactics' | 'Chemical & Disinfection' | 'Soft Skills & Grooming';
  standard_duration_hours: number;
  passing_score_pct: number;
  practical_drill_required: boolean;
  frequency_days: number;
  target_audience: string;
  description: string;
  syllabus: string[];
}

const DEFAULT_MASTER_TOPICS: MasterTrainingTopic[] = [
  {
    id: 'TOPIC-01',
    topic_name: 'Hospital Disinfection & Isolation Room Protocol',
    category: 'Hospital Protocol',
    standard_duration_hours: 3.5,
    passing_score_pct: 90,
    practical_drill_required: true,
    frequency_days: 90,
    target_audience: 'Healthcare Ward Guards, Housekeeping & Janitorial Staff',
    description: 'NABH-compliant sanitization protocols, isolation ward entry/exit sterilization, PPE gowning and de-gowning.',
    syllabus: ['Isolation Zone Classification', 'PPE Donning & Doffing Sequence', 'Surface Contact Time with Disinfectants', 'Terminal Cleaning Verification']
  },
  {
    id: 'TOPIC-02',
    topic_name: 'Bio-Medical Waste (BMW) Segregation & Color Coding',
    category: 'Hospital Protocol',
    standard_duration_hours: 2.5,
    passing_score_pct: 95,
    practical_drill_required: true,
    frequency_days: 90,
    target_audience: 'Hospital Staff, Medical Facility Security & Waste Handlers',
    description: 'Statutory BMW Management Rules, Yellow/Red/Blue/White container segregation, spill kit handling.',
    syllabus: ['Color Coded Bag Identification', 'Sharp Injury Prevention & Needle Burners', 'Mercury & Chemical Spill Kits', 'BMW Logbook & Barcode Manifest']
  },
  {
    id: 'TOPIC-03',
    topic_name: 'Fire Safety, Extinguisher Operation & Evacuation Drill',
    category: 'Fire & Life Safety',
    standard_duration_hours: 4.0,
    passing_score_pct: 85,
    practical_drill_required: true,
    frequency_days: 180,
    target_audience: 'All Field Security Guards, Supervisors & Facility Marshals',
    description: 'PASS technique for ABC/CO2 extinguishers, hydrant line charging, smoke barrier management, building evacuation.',
    syllabus: ['Fire Triangle & Classes of Fire', 'PASS (Pull, Aim, Squeeze, Sweep) Hands-on', 'Riser & Hose Reel Deployment', 'Assembly Point Roll-call Protocol']
  },
  {
    id: 'TOPIC-04',
    topic_name: 'Chemical Handling & Hazmat MSDS Protocols',
    category: 'Chemical & Disinfection',
    standard_duration_hours: 3.0,
    passing_score_pct: 90,
    practical_drill_required: true,
    frequency_days: 180,
    target_audience: 'Industrial Security, Chemical Facility Janitors & Stores',
    description: 'Interpretation of Material Safety Data Sheets (MSDS), chemical dilution ratios, eye-wash station operation.',
    syllabus: ['Reading GHS Pictograms & MSDS', 'Safe Dilution Ratios & Spill Trays', 'Chemical Inhalation & Splash First Aid', 'Ventilation & PPE Compliance']
  },
  {
    id: 'TOPIC-05',
    topic_name: 'POSH & Workplace Anti-Harassment Compliance',
    category: 'Mandatory Compliance',
    standard_duration_hours: 2.0,
    passing_score_pct: 80,
    practical_drill_required: false,
    frequency_days: 365,
    target_audience: 'All Employees, Supervisors & Area Managers',
    description: 'Understanding the POSH Act 2013, Internal Committee (IC) filing procedures, respectful workplace conduct.',
    syllabus: ['Defining Harassment & Hostile Environment', 'Internal Committee (IC) Escalation Path', 'Confidentiality Mandates', 'Zero-Tolerance Policy Overview']
  },
  {
    id: 'TOPIC-06',
    topic_name: 'Access Control, Visitor Log & Metal Detector Frisking',
    category: 'Security Tactics',
    standard_duration_hours: 3.0,
    passing_score_pct: 85,
    practical_drill_required: true,
    frequency_days: 90,
    target_audience: 'Gate Guards, Reception Security & Patrolling Staff',
    description: 'HHMD/DFMD operations, vehicle undercarriage mirrors, material inward/outward gate passes and visitor frisking.',
    syllabus: ['DFMD & HHMD Calibration Checks', 'Material Inward RGP/NRGP Validation', 'Vehicle Trunk & Undercarriage Search', 'Escalation of Contraband & Hostile Visitors']
  },
  {
    id: 'TOPIC-07',
    topic_name: 'First Aid, CPR & Medical Emergency Response Drill',
    category: 'Mandatory Compliance',
    standard_duration_hours: 3.5,
    passing_score_pct: 90,
    practical_drill_required: true,
    frequency_days: 180,
    target_audience: 'Floor Wardens, Emergency Response Teams & Security Leads',
    description: 'Hands-on CPR chest compressions, AED usage, handling fainting/fractures, casualty evacuation stretchers.',
    syllabus: ['Primary Survey (DR ABC)', 'Adult CPR 30:2 Ratio Hands-on', 'Recovery Position & Stretcher Lift', 'Bleeding Control & Pressure Bandaging']
  },
  {
    id: 'TOPIC-08',
    topic_name: 'Customer Care, Polite Communication & Conflict De-escalation',
    category: 'Soft Skills & Grooming',
    standard_duration_hours: 2.0,
    passing_score_pct: 85,
    practical_drill_required: true,
    frequency_days: 180,
    target_audience: 'Front-desk Security, Corporate Hub Concierge & VIP Escorts',
    description: 'Professional body language, polite greeting standards, handling frustrated visitors and telephone etiquette.',
    syllabus: ['Greeting & Posture Benchmarks', 'Active Listening & Tone Control', 'De-escalating Agitated Visitors', 'Escalation to Duty Manager']
  }
];

export default function TrainingView({ 
  state, 
  onUpdateState, 
  currentUserEmail,
  allowedSubViews,
  subRoleName 
}: TrainingViewProps) {
  const [activeTab, setActiveTab] = useState<TDViewTab>('radar');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('All');

  // Popup Dialog States (1 by 1 popup buttons for Unit/Client Facility, Training Topic, Trainer)
  const [isUnitFacilityModalOpen, setIsUnitFacilityModalOpen] = useState(false);
  const [isTrainingTopicModalOpen, setIsTrainingTopicModalOpen] = useState(false);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);

  // Modals & Viewers
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [evidenceViewerFile, setEvidenceViewerFile] = useState<ContextFile | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Master topics list (with custom added ones)
  const [masterTopics, setMasterTopics] = useState<MasterTrainingTopic[]>(DEFAULT_MASTER_TOPICS);
  const [topicSearch, setTopicSearch] = useState('');
  const [topicCategoryFilter, setTopicCategoryFilter] = useState('All');
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState<Partial<MasterTrainingTopic>>({
    topic_name: '',
    category: 'Hospital Protocol',
    standard_duration_hours: 3.0,
    passing_score_pct: 85,
    practical_drill_required: true,
    frequency_days: 90,
    target_audience: 'Security & Facility Staff',
    description: '',
    syllabus: []
  });

  // Facility / Unit state & search
  const [facilitySearch, setFacilitySearch] = useState('');
  const [isAddingNewFacility, setIsAddingNewFacility] = useState(false);
  const [newFacilityForm, setNewFacilityForm] = useState({
    name: '',
    client_name: '',
    region: 'South Region',
    required_manpower: 40,
    deployed_manpower: 38,
    site_health: 'Green' as 'Green' | 'Amber' | 'Red'
  });

  // Trainer state & search
  const [trainerSearch, setTrainerSearch] = useState('');
  const [isAddingNewTrainer, setIsAddingNewTrainer] = useState(false);
  const [newTrainerForm, setNewTrainerForm] = useState<Partial<TDTrainer>>({
    name: '',
    email: '',
    phone: '',
    specialization: ['Hospital Protocol', 'Mandatory Compliance'],
    assigned_units: ['City General Hospital'],
    rating: 4.8
  });

  // Form State for Session Record
  const [sessionForm, setSessionForm] = useState<Partial<TDSessionRecord>>({
    topic: 'Hospital Disinfection & Isolation Room Protocol',
    unit_or_client: 'City General Hospital (Vani Vilas Wing)',
    category: 'Hospital Protocol',
    planned_date: new Date().toISOString().split('T')[0],
    actual_date: new Date().toISOString().split('T')[0],
    trainer: 'Narsu',
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
    remarks: 'Conducted live practical evaluation of bio-medical waste segregation.',
    follow_up_action: '1 guard (Raju K.) requires re-test on Color Coded Waste Disposal next Monday.'
  });

  // Legacy Employee Form State for Employee Roster
  const [trForm, setTrForm] = useState<Partial<Training>>({
    training_name: 'Fire Safety & Fire-Fighting Drills',
    employee_id: '',
    site_id: '',
    competency_score: 85,
    certification_status: 'Active',
    next_due_date: '',
    remarks: '',
    trainer: 'Meera Iyer',
    training_date: new Date().toISOString().split('T')[0]
  });
  const [editingTrId, setEditingTrId] = useState<string | null>(null);

  // Collections from state
  const tdSessions = state.tdSessions || [];
  const tdPlans = state.tdPlans || [];
  const tdTrainers = state.tdTrainers || [];
  const tdComplianceRadar = state.tdComplianceRadar || [];
  const trainings = state.trainings || [];
  const sites = state.sites || [];

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Metrics rollup
  const totalSessions = tdSessions.length;
  const completedSessions = tdSessions.filter(s => s.status === 'Completed').length;
  const achievementPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalTrained = tdSessions.reduce((sum, s) => sum + (s.attended_participants || 0), 0);
  const avgPassRate = tdSessions.filter(s => s.pass_pct).length > 0
    ? Math.round(tdSessions.reduce((sum, s) => sum + (s.pass_pct || 0), 0) / tdSessions.filter(s => s.pass_pct).length)
    : 95;

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return tdSessions.filter(s => {
      const matchSearch = s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.unit_or_client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.trainer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;
      const matchSite = selectedSiteFilter === 'All' || s.unit_or_client.includes(selectedSiteFilter);
      return matchSearch && matchCategory && matchSite;
    });
  }, [tdSessions, searchQuery, selectedCategoryFilter, selectedSiteFilter]);

  // Combined List of Units / Client Facilities
  const facilityUnitsList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      client_name: string;
      region: string;
      deployed_manpower: number;
      required_manpower: number;
      site_health: 'Green' | 'Amber' | 'Red';
      total_sessions: number;
    }> = [];

    // From sites
    sites.forEach(s => {
      const client = state.clients?.find(c => c.id === s.client_id);
      const sessCount = tdSessions.filter(ts => ts.unit_or_client.toLowerCase().includes(s.name.toLowerCase())).length;
      list.push({
        id: s.id,
        name: s.name,
        client_name: client ? client.name : 'Enterprise Client Account',
        region: s.region || 'South Region',
        deployed_manpower: s.deployed_manpower || 0,
        required_manpower: s.required_manpower || 0,
        site_health: s.site_health || 'Green',
        total_sessions: sessCount
      });
    });

    // Also include other distinct unit names from tdPlans / tdSessions if not already present
    tdPlans.forEach(p => {
      if (p.unit_name && !list.some(item => item.name.toLowerCase() === p.unit_name!.toLowerCase())) {
        list.push({
          id: `PLAN-UNIT-${p.id}`,
          name: p.unit_name,
          client_name: p.client_name || 'Hospital / Commercial Client',
          region: 'South Region',
          deployed_manpower: p.target_participants || 40,
          required_manpower: p.target_participants || 40,
          site_health: 'Green',
          total_sessions: tdSessions.filter(ts => ts.unit_or_client.toLowerCase().includes(p.unit_name!.toLowerCase())).length
        });
      }
    });

    return list;
  }, [sites, state.clients, tdSessions, tdPlans]);

  // Filtered Facilities
  const filteredFacilities = useMemo(() => {
    return facilityUnitsList.filter(f => 
      f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      f.client_name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      f.region.toLowerCase().includes(facilitySearch.toLowerCase())
    );
  }, [facilityUnitsList, facilitySearch]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return masterTopics.filter(t => {
      const matchesQuery = t.topic_name.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.target_audience.toLowerCase().includes(topicSearch.toLowerCase());
      const matchesCategory = topicCategoryFilter === 'All' || t.category === topicCategoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [masterTopics, topicSearch, topicCategoryFilter]);

  // Filtered Trainers
  const filteredTrainers = useMemo(() => {
    return tdTrainers.filter(t => 
      t.name.toLowerCase().includes(trainerSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(trainerSearch.toLowerCase()) ||
      (t.phone && t.phone.includes(trainerSearch)) ||
      t.specialization.some(s => s.toLowerCase().includes(trainerSearch.toLowerCase()))
    );
  }, [tdTrainers, trainerSearch]);

  // Handle Session Submit
  const handleSessionSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sessionId = editingSessionId || `TDS-${Date.now()}`;
    const targetPax = Number(sessionForm.target_participants) || 20;
    const attendedPax = Number(sessionForm.attended_participants) || targetPax;
    const passedPax = Number(sessionForm.passed_count) || attendedPax;
    const evaluatedPax = Number(sessionForm.evaluated_count) || attendedPax;
    const attendancePct = targetPax > 0 ? Math.min(100, Math.round((attendedPax / targetPax) * 100)) : 100;
    const passPct = evaluatedPax > 0 ? Math.min(100, Number(((passedPax / evaluatedPax) * 100).toFixed(1))) : 100;

    const newRecord: TDSessionRecord = {
      id: sessionId,
      topic: sessionForm.topic || 'Hospital Disinfection Protocol',
      unit_or_client: sessionForm.unit_or_client || 'City General Hospital',
      category: sessionForm.category || 'Hospital Protocol',
      planned_date: sessionForm.planned_date || new Date().toISOString().split('T')[0],
      actual_date: sessionForm.actual_date || new Date().toISOString().split('T')[0],
      trainer: sessionForm.trainer || 'Narsu',
      duration_hours: Number(sessionForm.duration_hours) || 3.0,
      target_participants: targetPax,
      attended_participants: attendedPax,
      attendance_pct: attendancePct,
      evaluation_required: sessionForm.evaluation_required !== false,
      evaluated_count: evaluatedPax,
      passed_count: passedPax,
      failed_count: Math.max(0, evaluatedPax - passedPax),
      pass_pct: passPct,
      status: sessionForm.status || 'Completed',
      evidence_files: sessionForm.evidence_files || [
        {
          id: `EV-${Date.now()}-1`,
          file_name: 'Attendance_Sheet_Signed.pdf',
          file_type: 'pdf',
          file_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
          uploaded_by: sessionForm.trainer || 'Trainer',
          uploaded_at: new Date().toISOString(),
          caption: 'Signed Attendance Register by Ward Supervisor'
        }
      ],
      remarks: sessionForm.remarks || 'Training session conducted successfully with hands-on demonstration.',
      follow_up_action: sessionForm.follow_up_action || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let updatedSessions = [...tdSessions];
    if (editingSessionId) {
      updatedSessions = updatedSessions.map(s => s.id === editingSessionId ? newRecord : s);
      setEditingSessionId(null);
    } else {
      updatedSessions = [newRecord, ...updatedSessions];
    }

    const nextState: AppState = {
      ...state,
      tdSessions: updatedSessions
    };

    logAuditEntry(
      nextState,
      currentUserEmail,
      editingSessionId ? 'UPDATE' : 'CREATE',
      'TrainingSession',
      sessionId,
      `${editingSessionId ? 'Updated' : 'Logged'} Training Session: ${newRecord.topic} at ${newRecord.unit_or_client}`
    );

    onUpdateState(nextState);
    setIsSessionModalOpen(false);
    triggerSuccess(`Training session "${newRecord.topic}" saved successfully!`);
  };

  // Add New Facility Unit
  const handleCreateFacility = (e: FormEvent) => {
    e.preventDefault();
    if (!newFacilityForm.name) return;

    const newSiteId = `S-${Date.now()}`;
    const newSite: Site = {
      id: newSiteId,
      name: newFacilityForm.name,
      client_id: state.clients?.[0]?.id || 'C-001',
      required_manpower: Number(newFacilityForm.required_manpower) || 40,
      deployed_manpower: Number(newFacilityForm.deployed_manpower) || 38,
      supervisor_id: 'EMP-003',
      audit_score: 95,
      site_health: newFacilityForm.site_health,
      region: newFacilityForm.region
    };

    const nextState = {
      ...state,
      sites: [newSite, ...state.sites]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'Site', newSiteId, `Registered new client facility unit: ${newFacilityForm.name}`);
    onUpdateState(nextState);
    setIsAddingNewFacility(false);
    setNewFacilityForm({
      name: '',
      client_name: '',
      region: 'South Region',
      required_manpower: 40,
      deployed_manpower: 38,
      site_health: 'Green'
    });
    triggerSuccess(`Client Facility "${newSite.name}" registered successfully!`);
  };

  // Add New Training Topic
  const handleCreateTopic = (e: FormEvent) => {
    e.preventDefault();
    if (!newTopicForm.topic_name) return;

    const createdTopic: MasterTrainingTopic = {
      id: `TOPIC-${Date.now()}`,
      topic_name: newTopicForm.topic_name || 'Custom Training Module',
      category: newTopicForm.category || 'Hospital Protocol',
      standard_duration_hours: Number(newTopicForm.standard_duration_hours) || 3.0,
      passing_score_pct: Number(newTopicForm.passing_score_pct) || 85,
      practical_drill_required: newTopicForm.practical_drill_required ?? true,
      frequency_days: Number(newTopicForm.frequency_days) || 90,
      target_audience: newTopicForm.target_audience || 'Facility Staff & Security Personnel',
      description: newTopicForm.description || 'Standard operating procedure compliance curriculum.',
      syllabus: newTopicForm.syllabus && newTopicForm.syllabus.length > 0 ? newTopicForm.syllabus : ['Module Introduction & Objectives', 'Practical Drill Demonstration', 'Written & Oral Assessment']
    };

    setMasterTopics([createdTopic, ...masterTopics]);
    setIsAddingNewTopic(false);
    setNewTopicForm({
      topic_name: '',
      category: 'Hospital Protocol',
      standard_duration_hours: 3.0,
      passing_score_pct: 85,
      practical_drill_required: true,
      frequency_days: 90,
      target_audience: 'Security & Facility Staff',
      description: '',
      syllabus: []
    });
    triggerSuccess(`Training Curriculum Topic "${createdTopic.topic_name}" added!`);
  };

  // Add New Certified Trainer
  const handleCreateTrainer = (e: FormEvent) => {
    e.preventDefault();
    if (!newTrainerForm.name) return;

    const newTrainerId = `TRN-${Date.now()}`;
    const newTrainer: TDTrainer = {
      id: newTrainerId,
      name: newTrainerForm.name || 'Certified Trainer',
      email: newTrainerForm.email || `${(newTrainerForm.name || 'trainer').toLowerCase().replace(/\s+/g, '.')}@spandana.org`,
      phone: newTrainerForm.phone || '+91 98450 11223',
      specialization: newTrainerForm.specialization && newTrainerForm.specialization.length > 0 ? newTrainerForm.specialization : ['Hospital Protocol', 'Mandatory Compliance'],
      assigned_units: newTrainerForm.assigned_units && newTrainerForm.assigned_units.length > 0 ? newTrainerForm.assigned_units : ['City General Hospital'],
      total_sessions: 0,
      avg_attendance_pct: 100,
      avg_pass_pct: 95,
      rating: Number(newTrainerForm.rating) || 4.8
    };

    const nextState = {
      ...state,
      tdTrainers: [newTrainer, ...state.tdTrainers]
    };

    logAuditEntry(nextState, currentUserEmail, 'CREATE', 'Trainer', newTrainerId, `Registered certified trainer: ${newTrainer.name}`);
    onUpdateState(nextState);
    setIsAddingNewTrainer(false);
    setNewTrainerForm({
      name: '',
      email: '',
      phone: '',
      specialization: ['Hospital Protocol', 'Mandatory Compliance'],
      assigned_units: ['City General Hospital'],
      rating: 4.8
    });
    triggerSuccess(`Certified Trainer "${newTrainer.name}" registered!`);
  };

  // Quick Select Helpers
  const selectFacilityForSession = (facilityName: string) => {
    setSessionForm(prev => ({ ...prev, unit_or_client: facilityName }));
    setSelectedSiteFilter(facilityName);
    setIsUnitFacilityModalOpen(false);
    triggerSuccess(`Selected Unit: "${facilityName}"`);
  };

  const selectTopicForSession = (topic: MasterTrainingTopic) => {
    setSessionForm(prev => ({
      ...prev,
      topic: topic.topic_name,
      category: topic.category,
      duration_hours: topic.standard_duration_hours
    }));
    setTrForm(prev => ({ ...prev, training_name: topic.topic_name }));
    setIsTrainingTopicModalOpen(false);
    triggerSuccess(`Selected Topic: "${topic.topic_name}"`);
  };

  const selectTrainerForSession = (trainerName: string, trainerEmail?: string) => {
    setSessionForm(prev => ({
      ...prev,
      trainer: trainerName,
      trainer_email: trainerEmail
    }));
    setTrForm(prev => ({ ...prev, trainer: trainerName }));
    setIsTrainerModalOpen(false);
    triggerSuccess(`Selected Trainer: "${trainerName}"`);
  };

  // Handle Employee Training Submit
  const handleEmployeeTrSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trForm.employee_id) return;

    let updated = [...trainings];
    const trId = editingTrId || `TR-${Date.now()}`;
    const emp = state.employees.find(e => e.id === trForm.employee_id);
    const resolvedSiteId = emp?.site_id || state.sites[0]?.id || 'SITE-01';

    const newTr: Training = {
      id: trId,
      training_name: trForm.training_name || 'Fire Safety & Drills',
      employee_id: trForm.employee_id,
      site_id: resolvedSiteId,
      certification_status: (trForm.certification_status as any) || 'Active',
      competency_score: Number(trForm.competency_score) || 85,
      next_due_date: trForm.next_due_date || '',
      remarks: trForm.remarks || '',
      trainer: trForm.trainer || 'Lead Compliance Officer',
      training_date: trForm.training_date || new Date().toISOString().split('T')[0]
    };

    if (editingTrId) {
      updated = updated.map(t => t.id === trId ? newTr : t);
      setEditingTrId(null);
    } else {
      updated = [newTr, ...updated];
    }

    const nextState = { ...state, trainings: updated };
    logAuditEntry(nextState, currentUserEmail, editingTrId ? 'UPDATE' : 'CREATE', 'Training', trId, `Updated employee certification`);
    onUpdateState(nextState);
    setTrForm({
      training_name: 'Fire Safety & Fire-Fighting Drills',
      employee_id: '',
      site_id: '',
      competency_score: 85,
      certification_status: 'Active',
      next_due_date: '',
      remarks: '',
      trainer: 'Meera Iyer',
      training_date: new Date().toISOString().split('T')[0]
    });
    triggerSuccess('Employee training certificate saved!');
  };

  const deleteEmployeeTr = (id: string) => {
    const nextState = { ...state, trainings: state.trainings.filter(t => t.id !== id) };
    logAuditEntry(nextState, currentUserEmail, 'DELETE', 'Training', id, 'Deleted training registration');
    onUpdateState(nextState);
    triggerSuccess('Training record removed.');
  };

  return (
    <div className="space-y-6 bg-sky-50/60 border border-sky-200/80 p-6 rounded-3xl shadow-sm text-slate-800 font-sans">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-wide">{successMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEADER & EXECUTIVE SUMMARY BAR                                */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white rounded-3xl p-6 shadow-xl border border-sky-400/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-white/20 text-white border border-white/30 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-200" />
                Compliance Training Programs &amp; Competency Scoreboard
              </span>
              <span className="text-xs text-sky-100 font-mono">Plan → Conduct → Attendance → Evaluation → Evidence</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Compliance Training Radar &amp; T&amp;D Cockpit
            </h1>
          
          </div>

          {/* Quick Action Buttons: Record Session + Master Popups */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditingSessionId(null);
                setSessionForm({
                  topic: masterTopics[0]?.topic_name || 'Hospital Disinfection & Isolation Room Protocol',
                  unit_or_client: facilityUnitsList[0]?.name || 'City General Hospital (Vani Vilas Wing)',
                  category: 'Hospital Protocol',
                  planned_date: new Date().toISOString().split('T')[0],
                  actual_date: new Date().toISOString().split('T')[0],
                  trainer: tdTrainers[0]?.name || 'Narsu',
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
                  remarks: 'Conducted live practical evaluation of bio-medical waste segregation.',
                  follow_up_action: ''
                });
                setIsSessionModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-900 text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-700" />
              <span>+ Record Conducted Session</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ONE-BY-ONE POPUP BUTTONS BAR (UNIT / TOPIC / TRAINER)          */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 pt-4 border-t border-sky-400/30 flex flex-wrap items-center gap-3">
          <div className="text-[11px] font-mono text-sky-100 uppercase tracking-wider font-bold flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Master Management Popups:</span>
          </div>

          {/* 1. Unit / Client Facility Popup Button */}
          <button
            id="btn-popup-unit-facility"
            onClick={() => setIsUnitFacilityModalOpen(true)}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <Building2 className="w-4 h-4 text-sky-200" />
            <span>Unit / Client Facility</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] border border-white/30 font-bold">
              {facilityUnitsList.length} Units
            </span>
          </button>

          {/* 2. Training Topic Popup Button */}
          <button
            id="btn-popup-training-topic"
            onClick={() => setIsTrainingTopicModalOpen(true)}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <BookOpen className="w-4 h-4 text-sky-200" />
            <span>Training Topic</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] border border-white/30 font-bold">
              {masterTopics.length} Topics
            </span>
          </button>

          {/* 3. Trainer Popup Button */}
          <button
            id="btn-popup-trainer"
            onClick={() => setIsTrainerModalOpen(true)}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <UserCheck className="w-4 h-4 text-sky-200" />
            <span>Trainer</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] border border-white/30 font-bold">
              {tdTrainers.length} Certified
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBTABS NAVIGATION                                            */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-sky-400/30 overflow-x-auto pb-1">
          {[
            { id: 'radar', label: 'Compliance Radar & Standards', icon: ShieldAlert, badge: `${tdComplianceRadar.length} Standards` },
            { id: 'calendar', label: 'Live Training Calendar & Board', icon: Calendar, badge: `${filteredSessions.length} Sessions` },
            { id: 'planning', label: 'Annual & Unit Plans', icon: Bookmark, badge: `${tdPlans.length} Plans` },
            { id: 'trainers', label: 'Trainer Utilization & Ratings', icon: Users, badge: `${tdTrainers.length} Trainers` },
            { id: 'employee_roster', label: 'Individual Employee Certifications', icon: Award, badge: `${trainings.length} Guards` },
            { id: 'tasks', label: 'Assigned T&D Tasks', icon: CheckCircle, badge: null }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TDViewTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-sky-900 shadow-md font-bold'
                    : 'bg-white/10 text-sky-100 hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-700' : 'text-sky-200'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-sky-100 text-sky-800' : 'bg-sky-900/60 text-sky-100'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. COMPLIANCE RADAR & STATUTORY EXPIRY WATCH                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Plan Achievement</span>
                <span className="text-xs font-mono font-bold text-sky-800">{achievementPct}%</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {completedSessions} <span className="text-xs text-slate-500 font-normal">/ {totalSessions} Conducted</span>
              </div>
              <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-sky-600 h-full rounded-full transition-all" style={{ width: `${achievementPct}%` }} />
              </div>
            </div>

            <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pax Certified</span>
                <span className="text-xs font-mono font-bold text-emerald-700">100% Verified</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {totalTrained} <span className="text-xs text-slate-500 font-normal">Guards Trained</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Across {facilityUnitsList.length} commercial &amp; hospital branches</p>
            </div>

            <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Evaluation Pass Rate</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{avgPassRate}% Avg</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {avgPassRate}% <span className="text-xs text-slate-500 font-normal">Pass Benchmark</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Written &amp; hands-on drill assessments</p>
            </div>

            <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Refresher Alert</span>
                <span className="text-xs font-mono font-bold text-amber-700">30-Day Window</span>
              </div>
              <div className="text-2xl font-bold text-amber-700 tracking-tight">
                52 <span className="text-xs text-slate-500 font-normal">Certificates Due Renewal</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Hospital &amp; Chemical drills priority</p>
            </div>
          </div>

          {/* Compliance Radar Matrix */}
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-sky-600" />
                  Statutory &amp; Healthcare Compliance Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status of mandatory safety certifications and inspection readiness.
                </p>
              </div>

              {/* Fast Launcher for Master Popups */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUnitFacilityModalOpen(true)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Facility Units ({facilityUnitsList.length})</span>
                </button>
                <button
                  onClick={() => setIsTrainingTopicModalOpen(true)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Topics ({masterTopics.length})</span>
                </button>
                <button
                  onClick={() => setIsTrainerModalOpen(true)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Trainers ({tdTrainers.length})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tdComplianceRadar.map((std) => (
                <div key={std.id} className="p-5 bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-50/90 rounded-2xl space-y-3 transition shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {std.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      std.risk_level === 'Low' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 
                      std.risk_level === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-300' : 
                      'text-rose-700 bg-rose-50 border-rose-300'
                    }`}>
                      {std.risk_level} Risk
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{std.standard_name}</h4>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>Compliance Score</span>
                      <span className="font-mono font-bold text-sky-800">{std.compliance_pct}%</span>
                    </div>
                    <div className="w-full bg-sky-200/70 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          std.compliance_pct >= 90 ? 'bg-emerald-500' : std.compliance_pct >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${std.compliance_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <div>Target Sites: <strong className="text-slate-800">{std.target_sites.join(', ')}</strong></div>
                    <div>Audit Frequency: Every {std.required_frequency_days} Days (Last Audit: {std.last_audit_date})</div>
                  </div>

                  <div className="pt-2 border-t border-sky-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-semibold">{std.total_certified} / {std.total_required} Certified</span>
                    <span className="text-amber-700 font-bold">{std.expiring_in_30_days} Expiring Soon</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LIVE TRAINING CALENDAR & SESSIONS BOARD                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-sky-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search topic, unit, client or trainer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 transition"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Hospital Protocol">Hospital Protocol</option>
                <option value="Mandatory Compliance">Mandatory Compliance</option>
                <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                <option value="Security Tactics">Security Tactics</option>
                <option value="Chemical & Disinfection">Chemical &amp; Disinfection</option>
                <option value="Soft Skills & Grooming">Soft Skills &amp; Grooming</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUnitFacilityModalOpen(true)}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Units Popup</span>
              </button>
              <button
                onClick={() => setIsTrainingTopicModalOpen(true)}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Topics Popup</span>
              </button>
              <button
                onClick={() => setIsTrainerModalOpen(true)}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Trainers Popup</span>
              </button>
              <button
                onClick={() => {
                  setEditingSessionId(null);
                  setIsSessionModalOpen(true);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Record Session</span>
              </button>
            </div>
          </div>

          {/* Session Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {session.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    session.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    session.status === 'Postponed' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-sky-50 text-sky-700 border-sky-300'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{session.topic}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{session.unit_or_client}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-sky-50/70 rounded-xl text-xs border border-sky-100">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Trainer</span>
                    <strong className="text-slate-800">{session.trainer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Date</span>
                    <strong className="text-slate-800 font-mono">{session.actual_date || session.planned_date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Attendance</span>
                    <strong className="text-emerald-700 font-bold">{session.attended_participants || 0} / {session.target_participants} Pax</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Evaluation Pass</span>
                    <strong className="text-sky-700 font-bold">{session.pass_pct || 100}%</strong>
                  </div>
                </div>

                {session.remarks && (
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    <strong>Remarks:</strong> {session.remarks}
                  </p>
                )}

                {/* Evidence Thumbnail Bar */}
                {session.evidence_files && session.evidence_files.length > 0 && (
                  <div className="pt-2 border-t border-sky-100 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-semibold">Evidence:</span>
                    {session.evidence_files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setEvidenceViewerFile(file)}
                        className="px-2.5 py-1 bg-sky-100/80 hover:bg-sky-200/80 text-sky-800 border border-sky-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        {file.file_type === 'image' ? <ImageIcon className="w-3 h-3 text-sky-600" /> : <FileText className="w-3 h-3 text-sky-600" />}
                        <span>{file.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. ANNUAL & UNIT PLANS                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'planning' && (
        <div className="space-y-6">
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Annual &amp; Unit/Client Master Plans</h2>
              </div>
              <p className="text-xs text-slate-500">
                Consolidated curriculum and schedule commitments across all clients and facilities.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUnitFacilityModalOpen(true)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Browse All Facilities</span>
              </button>
              <button
                onClick={() => setIsTrainingTopicModalOpen(true)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Browse Topics Catalog</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tdPlans.map((plan) => (
              <div key={plan.id} className="p-5 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-3 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {plan.period_type} Plan ({plan.year})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    {plan.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{plan.plan_name}</h4>
                {plan.unit_name && (
                  <p className="text-xs text-sky-700 font-semibold">Unit: {plan.unit_name} ({plan.client_name})</p>
                )}

                <div className="grid grid-cols-2 gap-2 p-3 bg-sky-50/70 rounded-xl text-xs border border-sky-100">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Target Sessions</span>
                    <strong className="text-slate-900">{plan.target_sessions} Sessions</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Target Pax</span>
                    <strong className="text-slate-900">{plan.target_participants} Pax</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600">Curriculum Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Created by: {plan.created_by}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TRAINER UTILIZATION & RATINGS                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'trainers' && (
        <div className="space-y-6">
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900">Certified Trainers Directory &amp; Utilization</h2>
              </div>
              <p className="text-xs text-slate-500">
                Track trainer ratings, competency scores, assigned client facilities, and monthly session output.
              </p>
            </div>
            <button
              onClick={() => setIsTrainerModalOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Open Trainer Manager Popup</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tdTrainers.map((trainer) => (
              <div key={trainer.id} className="p-6 bg-white border border-sky-200 hover:border-sky-400 hover:shadow-md rounded-3xl space-y-4 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{trainer.name}</h3>
                    <p className="text-xs text-slate-500">{trainer.email} • {trainer.phone}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-full text-xs font-bold">
                    ★ {trainer.rating} / 5.0
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-600 font-semibold">Specialization Areas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.specialization.map((spec, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-[10px] font-semibold">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-base font-bold text-slate-900">{trainer.total_sessions}</div>
                    <div className="text-[10px] text-slate-500">Sessions</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-emerald-700">{trainer.avg_attendance_pct}%</div>
                    <div className="text-[10px] text-slate-500">Avg Attendance</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-sky-700">{trainer.avg_pass_pct}%</div>
                    <div className="text-[10px] text-slate-500">Avg Pass Rate</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Assigned Units: <strong className="text-slate-800">{trainer.assigned_units.join(', ')}</strong></span>
                  <button
                    onClick={() => selectTrainerForSession(trainer.name, trainer.email)}
                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold border border-sky-200 transition cursor-pointer"
                  >
                    Select Trainer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. INDIVIDUAL EMPLOYEE CERTIFICATIONS                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'employee_roster' && (
        <div className="space-y-6">
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Enroll Employee in Training / Update Certificate</h3>
            
            <form onSubmit={handleEmployeeTrSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Select Employee</label>
                <select
                  required
                  value={trForm.employee_id}
                  onChange={(e) => setTrForm({ ...trForm, employee_id: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {state.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Training Course</label>
                  <button
                    type="button"
                    onClick={() => setIsTrainingTopicModalOpen(true)}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Browse Topics</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={trForm.training_name}
                  onChange={(e) => setTrForm({ ...trForm, training_name: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Competency Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={trForm.competency_score}
                  onChange={(e) => setTrForm({ ...trForm, competency_score: Number(e.target.value) })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Next Renewal Due</label>
                <input
                  type="date"
                  value={trForm.next_due_date}
                  onChange={(e) => setTrForm({ ...trForm, next_due_date: e.target.value })}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{editingTrId ? 'Update Certification' : 'Issue Certificate'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-sky-200 bg-sky-50/60 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Individual Employee Certificates</h4>
              <span className="text-xs font-mono text-slate-500">{trainings.length} Certified Records</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-50/30 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Training Course</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Training Date</th>
                  <th className="p-3">Renewal Due</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {trainings.map((tr) => {
                  const emp = state.employees.find(e => e.id === tr.employee_id);
                  return (
                    <tr key={tr.id} className="hover:bg-sky-50/40 transition">
                      <td className="p-3 font-semibold text-slate-900">
                        {emp ? emp.name : tr.employee_id}
                        <span className="text-[10px] text-slate-500 block">{emp?.employee_id} • {emp?.department}</span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium">{tr.training_name}</td>
                      <td className="p-3 font-mono font-bold text-sky-700">{tr.competency_score}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tr.certification_status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          tr.certification_status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          {tr.certification_status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{tr.training_date}</td>
                      <td className="p-3 font-mono text-slate-600">{tr.next_due_date || 'N/A'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteEmployeeTr(tr.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ASSIGNED T&D TASKS                                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {state.tasks.filter(t => t.department === 'Training & Development' || t.assigned_to === 'Training Head').map((task) => (
            <div key={task.id} className="p-5 bg-white border border-sky-200 hover:border-sky-300 rounded-3xl flex items-center justify-between gap-4 shadow-sm transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    task.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Due: {task.due_date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                <p className="text-xs text-slate-600">{task.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-sky-700">{task.percent_completed}%</span>
                <div className="text-[10px] text-slate-500">{task.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* POPUP 1: UNIT / CLIENT FACILITY MASTER DIALOG                 */}
      {/* ============================================================= */}
      {isUnitFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-4xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 rounded-t-3xl flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-sky-200" />
                <div>
                  <h3 className="text-lg font-bold">Unit / Client Facility Master &amp; Deployment Radar</h3>
                  <p className="text-xs text-sky-100">Browse operational client units, compliance health, manpower strength and training schedules.</p>
                </div>
              </div>
              <button onClick={() => setIsUnitFacilityModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="px-6 pt-2 pb-0 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search unit facility, client name or region..."
                  value={facilitySearch}
                  onChange={(e) => setFacilitySearch(e.target.value)}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingNewFacility(!isAddingNewFacility)}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewFacility ? 'Close Form' : '+ Register New Facility Unit'}</span>
                </button>
              </div>
            </div>

            {/* Add New Facility Form (Collapsible) */}
            {isAddingNewFacility && (
              <form onSubmit={handleCreateFacility} className="mx-6 p-4 bg-sky-50 border border-sky-300 rounded-2xl space-y-3 text-xs shrink-0">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Register New Facility / Unit Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Unit Facility Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Super Specialty Hospital"
                      value={newFacilityForm.name}
                      onChange={(e) => setNewFacilityForm({ ...newFacilityForm, name: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Region</label>
                    <select
                      value={newFacilityForm.region}
                      onChange={(e) => setNewFacilityForm({ ...newFacilityForm, region: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    >
                      <option value="South Region">South Region (Bengaluru / Mysuru)</option>
                      <option value="North Region">North Region (Delhi NCR / Chandigarh)</option>
                      <option value="West Region">West Region (Mumbai / Pune)</option>
                      <option value="East Region">East Region (Kolkata / Bhubaneswar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Required Manpower</label>
                    <input
                      type="number"
                      value={newFacilityForm.required_manpower}
                      onChange={(e) => setNewFacilityForm({ ...newFacilityForm, required_manpower: Number(e.target.value) })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewFacility(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Facility Unit</span>
                  </button>
                </div>
              </form>
            )}

            {/* Facility List Cards */}
            <div className="px-6 py-2 overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFacilities.map((facility) => (
                  <div key={facility.id} className="p-4 bg-sky-50/50 border border-sky-200 hover:border-sky-400 hover:bg-sky-50/90 rounded-2xl transition space-y-2.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-sky-700 uppercase font-bold block">{facility.region}</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{facility.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{facility.client_name}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        facility.site_health === 'Green' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        facility.site_health === 'Amber' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                        'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        {facility.site_health} Health
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-xl text-center text-xs border border-sky-100 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Deployed</span>
                        <strong className="text-slate-900">{facility.deployed_manpower} Pax</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Required</span>
                        <strong className="text-slate-900">{facility.required_manpower} Pax</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Sessions</span>
                        <strong className="text-sky-700">{facility.total_sessions} Logged</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-sky-100">
                      <button
                        onClick={() => selectFacilityForSession(facility.name)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select Facility for Training</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFacilities.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono bg-sky-50/40 rounded-2xl">
                  No facility units found matching "{facilitySearch}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sky-50/80 border-t border-sky-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-mono">
                Total <strong>{facilityUnitsList.length}</strong> Operational Facility Units
              </span>
              <button
                onClick={() => setIsUnitFacilityModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* POPUP 2: TRAINING TOPIC & CURRICULUM MASTER DIALOG            */}
      {/* ============================================================= */}
      {isTrainingTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-4xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 rounded-t-3xl flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-sky-200" />
                <div>
                  <h3 className="text-lg font-bold">Training Topic &amp; Curriculum Master Catalog</h3>
                  <p className="text-xs text-sky-100">Standard compliance syllabi, duration benchmarks, pass criteria, and hands-on drill requirements.</p>
                </div>
              </div>
              <button onClick={() => setIsTrainingTopicModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="px-6 pt-2 pb-0 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search topic name, syllabus or audience..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full bg-sky-50/60 border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <select
                  value={topicCategoryFilter}
                  onChange={(e) => setTopicCategoryFilter(e.target.value)}
                  className="bg-sky-50/60 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Hospital Protocol">Hospital Protocol</option>
                  <option value="Mandatory Compliance">Mandatory Compliance</option>
                  <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                  <option value="Security Tactics">Security Tactics</option>
                  <option value="Chemical & Disinfection">Chemical &amp; Disinfection</option>
                  <option value="Soft Skills & Grooming">Soft Skills &amp; Grooming</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddingNewTopic(!isAddingNewTopic)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNewTopic ? 'Close Form' : '+ Add New Training Topic'}</span>
              </button>
            </div>

            {/* Add New Topic Form (Collapsible) */}
            {isAddingNewTopic && (
              <form onSubmit={handleCreateTopic} className="mx-6 p-4 bg-sky-50 border border-sky-300 rounded-2xl space-y-3 text-xs shrink-0">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Create New Training Curriculum Topic</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Topic Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Critical Incident Response & Hostile Intruder Drill"
                      value={newTopicForm.topic_name}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, topic_name: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Category</label>
                    <select
                      value={newTopicForm.category}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, category: e.target.value as any })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    >
                      <option value="Hospital Protocol">Hospital Protocol</option>
                      <option value="Mandatory Compliance">Mandatory Compliance</option>
                      <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                      <option value="Security Tactics">Security Tactics</option>
                      <option value="Chemical & Disinfection">Chemical &amp; Disinfection</option>
                      <option value="Soft Skills & Grooming">Soft Skills &amp; Grooming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Standard Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newTopicForm.standard_duration_hours}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, standard_duration_hours: Number(e.target.value) })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Passing Benchmark (%)</label>
                    <input
                      type="number"
                      value={newTopicForm.passing_score_pct}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, passing_score_pct: Number(e.target.value) })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Practical Drill Required?</label>
                    <select
                      value={newTopicForm.practical_drill_required ? 'true' : 'false'}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, practical_drill_required: e.target.value === 'true' })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    >
                      <option value="true">Yes - Practical Hands-on Drill</option>
                      <option value="false">No - Theory / Classroom Only</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewTopic(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Topic</span>
                  </button>
                </div>
              </form>
            )}

            {/* Topics Cards List */}
            <div className="px-6 py-2 overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className="p-4 bg-sky-50/50 border border-sky-200 hover:border-sky-400 hover:bg-sky-50/90 rounded-2xl transition space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          {topic.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{topic.topic_name}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{topic.description}</p>
                      </div>
                      {topic.practical_drill_required && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-[9px] font-bold uppercase shrink-0">
                          Drill Req.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-xl text-center text-xs border border-sky-100 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Duration</span>
                        <strong className="text-slate-900">{topic.standard_duration_hours} Hrs</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Pass Score</span>
                        <strong className="text-emerald-700 font-bold">{topic.passing_score_pct}%</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Frequency</span>
                        <strong className="text-sky-700">{topic.frequency_days} Days</strong>
                      </div>
                    </div>

                    {topic.syllabus && topic.syllabus.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Core Syllabus Modules:</span>
                        <div className="flex flex-wrap gap-1">
                          {topic.syllabus.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-sky-100/70 text-sky-800 border border-sky-200/80 rounded-md text-[9px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-sky-100 text-xs">
                      <span className="text-[10px] text-slate-500 truncate max-w-[200px]">Audience: {topic.target_audience}</span>
                      <button
                        onClick={() => selectTopicForSession(topic)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select Topic</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono bg-sky-50/40 rounded-2xl">
                  No training curriculum topics found matching "{topicSearch}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sky-50/80 border-t border-sky-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-mono">
                Total <strong>{masterTopics.length}</strong> Standardized Curriculum Modules
              </span>
              <button
                onClick={() => setIsTrainingTopicModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* POPUP 3: CERTIFIED TRAINER DIRECTORY MASTER DIALOG            */}
      {/* ============================================================= */}
      {isTrainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-4xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 rounded-t-3xl flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-6 h-6 text-sky-200" />
                <div>
                  <h3 className="text-lg font-bold">Certified Trainer Directory &amp; Performance Profile</h3>
                  <p className="text-xs text-sky-100">Review trainer ratings, specializations, assigned hospital/commercial units and session records.</p>
                </div>
              </div>
              <button onClick={() => setIsTrainerModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="px-6 pt-2 pb-0 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search trainer by name, email, specialization or unit..."
                  value={trainerSearch}
                  onChange={(e) => setTrainerSearch(e.target.value)}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={() => setIsAddingNewTrainer(!isAddingNewTrainer)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNewTrainer ? 'Close Form' : '+ Register Certified Trainer'}</span>
              </button>
            </div>

            {/* Add New Trainer Form (Collapsible) */}
            {isAddingNewTrainer && (
              <form onSubmit={handleCreateTrainer} className="mx-6 p-4 bg-sky-50 border border-sky-300 rounded-2xl space-y-3 text-xs shrink-0">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <span>Register Certified T&amp;D Instructor</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Trainer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Sen"
                      value={newTrainerForm.name}
                      onChange={(e) => setNewTrainerForm({ ...newTrainerForm, name: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ananya.sen@spandana.org"
                      value={newTrainerForm.email}
                      onChange={(e) => setNewTrainerForm({ ...newTrainerForm, email: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Phone Contact</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98450 12345"
                      value={newTrainerForm.phone}
                      onChange={(e) => setNewTrainerForm({ ...newTrainerForm, phone: e.target.value })}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewTrainer(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Trainer</span>
                  </button>
                </div>
              </form>
            )}

            {/* Trainers Cards List */}
            <div className="px-6 py-2 overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTrainers.map((trainer) => (
                  <div key={trainer.id} className="p-4 bg-sky-50/50 border border-sky-200 hover:border-sky-400 hover:bg-sky-50/90 rounded-2xl transition space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold text-sm font-mono">
                          {trainer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{trainer.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{trainer.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-full text-xs font-bold shrink-0 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{trainer.rating} / 5.0</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Specialization Competencies:</span>
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialization.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-md text-[9px] font-semibold">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-xl text-center text-xs border border-sky-100 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Sessions</span>
                        <strong className="text-slate-900">{trainer.total_sessions}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Attendance</span>
                        <strong className="text-emerald-700 font-bold">{trainer.avg_attendance_pct}%</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Pass Rate</span>
                        <strong className="text-sky-700 font-bold">{trainer.avg_pass_pct}%</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-sky-100 text-xs">
                      <span className="text-[10px] text-slate-500 truncate max-w-[190px]">
                        Units: {trainer.assigned_units.join(', ')}
                      </span>
                      <button
                        onClick={() => selectTrainerForSession(trainer.name, trainer.email)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select Trainer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTrainers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono bg-sky-50/40 rounded-2xl">
                  No certified trainers found matching "{trainerSearch}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sky-50/80 border-t border-sky-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-mono">
                Total <strong>{tdTrainers.length}</strong> Certified Compliance Instructors
              </span>
              <button
                onClick={() => setIsTrainerModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SESSION COMPLETION FORM                                */}
      {/* ------------------------------------------------------------- */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 rounded-t-3xl flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-200" />
                <h3 className="text-lg font-bold">Record Training Session Execution</h3>
              </div>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSessionSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">Unit / Client Facility *</label>
                    <button
                      type="button"
                      onClick={() => setIsUnitFacilityModalOpen(true)}
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Browse Units</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={sessionForm.unit_or_client}
                    onChange={(e) => setSessionForm({ ...sessionForm, unit_or_client: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">Training Topic *</label>
                    <button
                      type="button"
                      onClick={() => setIsTrainingTopicModalOpen(true)}
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Browse Topics</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Category</label>
                  <select
                    value={sessionForm.category}
                    onChange={(e) => setSessionForm({ ...sessionForm, category: e.target.value as any })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                  >
                    <option value="Hospital Protocol">Hospital Protocol</option>
                    <option value="Mandatory Compliance">Mandatory Compliance</option>
                    <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                    <option value="Security Tactics">Security Tactics</option>
                    <option value="Chemical & Disinfection">Chemical &amp; Disinfection</option>
                    <option value="Soft Skills & Grooming">Soft Skills &amp; Grooming</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">Trainer *</label>
                    <button
                      type="button"
                      onClick={() => setIsTrainerModalOpen(true)}
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Select Trainer</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={sessionForm.trainer}
                    onChange={(e) => setSessionForm({ ...sessionForm, trainer: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Actual Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.actual_date}
                    onChange={(e) => setSessionForm({ ...sessionForm, actual_date: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-sky-50/70 rounded-2xl border border-sky-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Target Pax</label>
                  <input
                    type="number"
                    value={sessionForm.target_participants}
                    onChange={(e) => setSessionForm({ ...sessionForm, target_participants: Number(e.target.value) })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Attended Pax</label>
                  <input
                    type="number"
                    value={sessionForm.attended_participants}
                    onChange={(e) => setSessionForm({ ...sessionForm, attended_participants: Number(e.target.value) })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Passed Pax</label>
                  <input
                    type="number"
                    value={sessionForm.passed_count}
                    onChange={(e) => setSessionForm({ ...sessionForm, passed_count: Number(e.target.value) })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Execution Remarks</label>
                <textarea
                  rows={2}
                  value={sessionForm.remarks}
                  onChange={(e) => setSessionForm({ ...sessionForm, remarks: e.target.value })}
                  placeholder="Hands-on demonstration performed..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Follow-up Action</label>
                <input
                  type="text"
                  value={sessionForm.follow_up_action}
                  onChange={(e) => setSessionForm({ ...sessionForm, follow_up_action: e.target.value })}
                  placeholder="Re-test date or equipment replacement..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Session Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EVIDENCE VIEWER LIGHTBOX                                      */}
      {/* ------------------------------------------------------------- */}
      {evidenceViewerFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-sky-300 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-sky-200 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">{evidenceViewerFile.file_name}</h3>
              </div>
              <button onClick={() => setEvidenceViewerFile(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {evidenceViewerFile.file_type === 'image' ? (
              <div className="rounded-2xl overflow-hidden border border-sky-200 max-h-[400px] flex items-center justify-center bg-slate-100">
                <img 
                  src={evidenceViewerFile.file_url} 
                  alt={evidenceViewerFile.file_name}
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] object-contain w-full"
                />
              </div>
            ) : (
              <div className="p-8 bg-sky-50 rounded-2xl border border-sky-200 text-center space-y-2">
                <FileText className="w-12 h-12 text-sky-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{evidenceViewerFile.file_name}</h4>
                <p className="text-xs text-slate-500">Verified Signed Document</p>
                <a
                  href={evidenceViewerFile.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold mt-2"
                >
                  Download / View PDF
                </a>
              </div>
            )}

            {evidenceViewerFile.caption && (
              <p className="text-xs text-slate-600 bg-sky-50/70 p-3 rounded-xl border border-sky-200">
                <strong>Caption:</strong> {evidenceViewerFile.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
