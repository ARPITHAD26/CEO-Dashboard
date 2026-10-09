import React, { useState, useMemo } from 'react';
import {
  GovernmentTender,
  GovTenderStage,
  GovTenderEligibilityCriterion,
  GovTenderDocument,
  GovTenderCertificate,
  GovTenderStatutoryCost,
  GovTenderEvaluationEntry,
  GovTenderCorrigendumEntry,
  AppState,
  Role
} from '../types';
import {
  Landmark, FileText, CheckCircle2, AlertTriangle, Clock, Plus, Search, Filter,
  Layers, ShieldAlert, ArrowRight, Upload, ExternalLink, UserCheck,
  FileSpreadsheet, MessageSquare, Briefcase, RefreshCw, X, Eye,
  TrendingUp, Calendar, AlertOctagon, Check, Send, Sparkles, Building2,
  Award, Scale, HelpCircle, DollarSign, Calculator, ChevronRight, CheckSquare,
  Shield, Tag, AlertCircle, Stamp, UserPlus, SlidersHorizontal, BookOpen,
  CheckCircle, ArrowUpRight, Percent, ShieldCheck, Download
} from 'lucide-react';
import { saveEntityToFirestore } from '../lib/firebaseService';

export const GOV_LIFECYCLE_STAGES: { id: GovTenderStage; label: string; group: string; color: string }[] = [
  { id: 'Tender Identified', label: 'Tender Identified (Portal / NIT)', group: '1. Identification', color: 'indigo' },
  { id: 'Documents Downloaded', label: 'Tender Documents Downloaded', group: '1. Identification', color: 'indigo' },
  { id: 'Initial Screening', label: 'Initial Screening (Eligibility Check)', group: '2. Screening', color: 'sky' },
  { id: 'HR/Finance/Ops Review', label: 'HR / Finance / Operations Review', group: '2. Screening', color: 'sky' },
  { id: 'Go/No-Go', label: 'GO / NO-GO Verdict', group: '2. Screening', color: 'amber' },
  { id: 'Tender Preparation', label: 'Tender Preparation (Docs, DSC, Annexures)', group: '3. Preparation', color: 'blue' },
  { id: 'Pre-Bid Meeting', label: 'Pre-Bid Meeting Attended', group: '3. Preparation', color: 'blue' },
  { id: 'Queries Raised', label: 'Queries Raised to Authority', group: '3. Preparation', color: 'purple' },
  { id: 'Corrigendum/Addendum', label: 'Corrigendum / Addendum Review', group: '3. Preparation', color: 'purple' },
  { id: 'Final Bid Preparation', label: 'Final Bid Preparation & Packaging', group: '3. Preparation', color: 'blue' },
  { id: 'Management Approval', label: 'Management Approval (GM / CEO)', group: '4. Approval', color: 'emerald' },
  { id: 'EMD/Tender Fee Payment', label: 'EMD / Tender Fee Payment', group: '5. Submission', color: 'teal' },
  { id: 'Online Submission', label: 'Online Submission on Portal', group: '5. Submission', color: 'teal' },
  { id: 'Technical Opening', label: 'Technical Opening & Evaluation', group: '6. Evaluation', color: 'amber' },
  { id: 'Technical Qualified', label: 'Technically Qualified', group: '6. Evaluation', color: 'emerald' },
  { id: 'Technical Disqualified', label: 'Technically Disqualified', group: '6. Evaluation', color: 'rose' },
  { id: 'Financial Bid Opening', label: 'Financial Bid Opening', group: '7. Financials', color: 'indigo' },
  { id: 'L1 Position', label: 'L1 Position (Lowest Bidder)', group: '7. Financials', color: 'emerald' },
  { id: 'L2 Position', label: 'L2 Position', group: '7. Financials', color: 'slate' },
  { id: 'L3 Position', label: 'L3 Position', group: '7. Financials', color: 'slate' },
  { id: 'E-Reverse Auction', label: 'E-Reverse Auction (e-RA)', group: '7. Financials', color: 'amber' },
  { id: 'L1 Negotiation', label: 'L1 Negotiation / Rate Matching', group: '8. Award', color: 'teal' },
  { id: 'LOI/LOA Received', label: 'LOI / LOA Issued by Authority', group: '8. Award', color: 'emerald' },
  { id: 'Work Order Received', label: 'Work Order Received', group: '8. Award', color: 'emerald' },
  { id: 'PBG Submitted', label: 'PBG Submission', group: '9. Contract', color: 'sky' },
  { id: 'Contract Agreement', label: 'Contract Agreement Signed', group: '9. Contract', color: 'sky' },
  { id: 'Contract Execution', label: 'Contract Execution & Operations', group: '10. Operations', color: 'emerald' },
  { id: 'Renewal/Extension', label: 'Renewal / Extension Review', group: '10. Operations', color: 'purple' },
  { id: 'Closed', label: 'Tender / Contract Closure', group: '11. Closure', color: 'slate' },
  { id: 'Won', label: 'Tender Won', group: 'Result', color: 'emerald' },
  { id: 'Lost', label: 'Tender Lost', group: 'Result', color: 'rose' },
  { id: 'Cancelled', label: 'Tender Cancelled by Authority', group: 'Result', color: 'slate' },
  { id: 'Re-Tendered', label: 'Re-Tendered / NIT Scrapped', group: 'Result', color: 'amber' }
];

const GOV_REVIEW_CONSIDERATIONS = [
  { department: 'HR', items: [
    { id: 'hr_statutory_compliance', label: 'Confirm statutory compliance requirements' },
    { id: 'hr_state_minimum_wages', label: 'Verify minimum wages applicable in the tender state' },
    { id: 'hr_manpower_mobilisation', label: 'Confirm manpower can be mobilised within the tender timeline' }
  ] },
  { department: 'Finance', items: [
    { id: 'finance_emd', label: 'Review EMD amount and exemption eligibility' },
    { id: 'finance_pbg', label: 'Review required PBG percentage' },
    { id: 'finance_bid_validity', label: 'Confirm bid validity period is acceptable' },
    { id: 'finance_department_payment_history', label: 'Assess the department payment-delay history' },
    { id: 'finance_working_capital', label: 'Confirm working capital covers the payment cycle' }
  ] },
  { department: 'Operations', items: [
    { id: 'ops_eligibility_match', label: 'Confirm operational eligibility match' },
    { id: 'ops_experience_certificates', label: 'Verify required experience certificates are available' },
    { id: 'ops_deployment_timeline', label: 'Confirm deployment timeline fixed by the tender' },
    { id: 'ops_penalty_clauses', label: 'Review operational penalty clauses' }
  ] }
];

interface GovernmentTenderViewProps {
  state: AppState;
  currentRole: Role;
  userEmail: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  initialSubTab?: 'master' | 'lifecycle' | 'eligibility' | 'documents' | 'portal' | 'corrigendums' | 'evaluation' | 'statutory';
}

export const GovernmentTenderView: React.FC<GovernmentTenderViewProps> = ({
  state,
  currentRole,
  userEmail,
  onUpdateState,
  initialSubTab = 'master'
}) => {
  const govTenders: GovernmentTender[] = state.governmentTenders || [];

  const [activeSubTab, setActiveSubTab] = useState<
    'master' | 'lifecycle' | 'eligibility' | 'documents' | 'portal' | 'corrigendums' | 'evaluation' | 'statutory'
  >(initialSubTab);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [portalFilter, setPortalFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(govTenders[0]?.id || '');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCorrigendumModal, setShowCorrigendumModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showStatusAdvanceModal, setShowStatusAdvanceModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddCriterionModal, setShowAddCriterionModal] = useState(false);
  const [showAddStatutoryCostModal, setShowAddStatutoryCostModal] = useState(false);

  // Selected tender object
  const activeTender = useMemo(() => {
    return govTenders.find(t => t.id === selectedTenderId) || govTenders[0] || null;
  }, [govTenders, selectedTenderId]);

  // Filtered Tenders list
  const filteredTenders = useMemo(() => {
    return govTenders.filter(t => {
      const matchesSearch =
        t.tender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nit_reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.portal_tender_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || t.government_category === categoryFilter;
      const matchesPortal = portalFilter === 'ALL' || t.portal_name === portalFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

      return matchesSearch && matchesCat && matchesPortal && matchesStatus;
    });
  }, [govTenders, searchTerm, categoryFilter, portalFilter, statusFilter]);

  // Metric aggregates
  const totalGovValue = useMemo(() => {
    return govTenders.reduce((sum, t) => sum + (t.estimated_tender_value || 0), 0);
  }, [govTenders]);

  const activeGovCount = useMemo(() => {
    return govTenders.filter(t => t.status !== 'Lost' && t.status !== 'Cancelled' && t.status !== 'Closed').length;
  }, [govTenders]);

  const pendingCorrigendumsCount = useMemo(() => {
    return govTenders.reduce((sum, t) => {
      const unreviewed = (t.corrigendums || []).filter(c => !c.management_reviewed).length;
      return sum + unreviewed;
    }, 0);
  }, [govTenders]);

  const wonGovValue = useMemo(() => {
    return govTenders
      .filter(t => t.status === 'Won' || t.status === 'Work Order Received' || t.status === 'Contract Execution')
      .reduce((sum, t) => sum + (t.estimated_tender_value || 0), 0);
  }, [govTenders]);

  const unvalidatedHrStatutoryCount = useMemo(() => {
    return govTenders.reduce((sum, t) => {
      const unvalidated = (t.statutory_costs || []).filter(s => s.applicable && !s.validated_by_hr).length;
      return sum + unvalidated;
    }, 0);
  }, [govTenders]);

  // -------------------------------------------------------------
  // FORM STATES
  // -------------------------------------------------------------
  const [newTender, setNewTender] = useState<Partial<GovernmentTender>>({
    government_category: 'Central',
    department: '',
    tendering_authority: '',
    client_name: '',
    tender_name: '',
    nit_reference_number: '',
    portal_name: 'GeM',
    portal_tender_id: '',
    tender_url: '',
    scope_of_work: '',
    location: 'Bengaluru',
    tender_type: 'Open',
    estimated_tender_value: 0,
    contract_period: '2 Years',
    publication_date: new Date().toISOString().split('T')[0],
    doc_download_start: new Date().toISOString().split('T')[0],
    doc_download_end: '',
    last_date_of_submission: '',
    bid_validity_period: '90 Days',
    emd_amount: 0,
    emd_mode: 'Online',
    emd_exemption_applicable: false,
    emd_exemption_type: 'MSME',
    emd_exemption_certificate_ref: '',
    tender_fee: 0,
    processing_fee: 0,
    estimated_pbg_percentage: 5,
    security_deposit_terms: '5% Performance Bank Guarantee',
    dsc_holder: 'Kunal Sen (BD Head)',
    dsc_expiry: '2027-06-30',
    integrity_pact_signed: true,
    blacklisting_declaration: 'Clear',
    tender_owner: userEmail || 'Kunal Sen (BD Head)',
    procurement_executive: 'Deepika Nair',
    supporting_team: ['Vikram Singh', 'Neha Gupta', 'Aarav Sharma'],
    operations_spoc: 'Vikram Singh',
    finance_spoc: 'Neha Gupta',
    hr_spoc: 'Aarav Sharma',
    gm_approval: 'Pending',
    ceo_approval: 'Pending',
    status: 'Tender Identified',
    portal_login_owner: 'Kunal Sen',
    dsc_availability: 'Available',
    upload_status: 'Not Started',
    eligibility_score: 85
  });

  const [newCorrigendum, setNewCorrigendum] = useState<GovTenderCorrigendumEntry>({
    corrigendum_no: `Corrigendum-${(activeTender?.corrigendums?.length || 0) + 1}`,
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    changes_summary: '',
    revised_submission_date: '',
    revised_boq: false,
    management_reviewed: false
  });

  const [newEvaluation, setNewEvaluation] = useState<GovTenderEvaluationEntry>({
    stage: 'Technical Result',
    date: new Date().toISOString().split('T')[0],
    description: '',
    our_position: 'Qualified',
    l1_rate: 0,
    our_rate: 0,
    rate_difference_pct: 0,
    remarks: ''
  });

  const [resultData, setResultData] = useState<{
    result: 'Won' | 'Lost' | 'Cancelled' | 'Re-Tendered';
    result_reason: string;
    competitor_l1_rate?: number;
    competitor_names?: string;
  }>({
    result: 'Won',
    result_reason: '',
    competitor_l1_rate: 0,
    competitor_names: ''
  });

  const [newDoc, setNewDoc] = useState<GovTenderDocument>({
    doc_name: '',
    doc_type: 'Annexure',
    mandatory: true,
    preparation_status: 'Not Started',
    responsible_person: 'Deepika Nair',
    remarks: ''
  });

  const [newCriterion, setNewCriterion] = useState<GovTenderEligibilityCriterion>({
    criterion: '',
    required_value: '',
    our_value: '',
    status: 'Under Review',
    remarks: ''
  });

  const [newStatCost, setNewStatCost] = useState<GovTenderStatutoryCost>({
    component: '',
    applicable: true,
    rate_or_amount: 0,
    basis: 'Per person/month',
    validated_by_hr: false,
    remarks: ''
  });

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSaveNewTender = () => {
    if (!newTender.tender_name || !newTender.client_name || !newTender.nit_reference_number) {
      alert('Please fill in Tender Name, Client Name, and NIT Reference Number.');
      return;
    }

    const nextIdNum = govTenders.length + 1;
    const govId = `GOV/${new Date().getFullYear()}/${String(nextIdNum).padStart(3, '0')}`;

    const defaultCriteria: GovTenderEligibilityCriterion[] = [
      { criterion: 'Annual Turnover (3 Year Avg)', required_value: '₹10 Cr', our_value: '₹32 Cr', status: 'Met' },
      { criterion: 'Similar Work Experience in Govt/PSU', required_value: '2 completed contracts', our_value: '3 contracts', status: 'Met' },
      { criterion: 'Registered Workforce Strength', required_value: '250+ employees', our_value: '1200+ employees', status: 'Met' },
      { criterion: 'ISO 9001:2015 Certification', required_value: 'Valid', our_value: 'Valid', status: 'Met' }
    ];

    const defaultCerts: GovTenderCertificate[] = [
      { cert_name: 'GST Registration', cert_number: '29AABCS1234F1Z5', validity_from: '2019-07-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PAN Card', cert_number: 'AABCS1234F', validity_from: '2015-01-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'PF Registration', cert_number: 'KN/BLR/12345', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'ESI Registration', cert_number: '52000123450001', validity_from: '2018-04-01', validity_to: '2099-12-31', status: 'Valid' },
      { cert_name: 'Labour Licence', cert_number: 'LL/KA/BLR/2025/789', validity_from: '2025-04-01', validity_to: '2026-03-31', status: 'Valid' },
      { cert_name: 'MSME / Udyam Certificate', cert_number: 'UDYAM-KA-01-0012345', validity_from: '2024-01-15', validity_to: '2029-01-14', status: 'Valid' }
    ];

    const defaultDocs: GovTenderDocument[] = [
      { doc_name: 'Technical Bid Document (Part-I)', doc_type: 'Technical', mandatory: true, preparation_status: 'In Progress', responsible_person: 'Deepika Nair' },
      { doc_name: 'Price Bid / BOQ (Part-II)', doc_type: 'Financial', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Neha Gupta' },
      { doc_name: 'EMD Guarantee / Declaration', doc_type: 'EMD', mandatory: true, preparation_status: 'Not Started', responsible_person: 'Neha Gupta' },
      { doc_name: 'Integrity Pact & Affidavits', doc_type: 'Undertaking', mandatory: true, preparation_status: 'Ready', responsible_person: 'Kunal Sen' },
      { doc_name: 'DSC Token Signatures Validation', doc_type: 'DSC', mandatory: true, preparation_status: 'Ready', responsible_person: 'Kunal Sen' }
    ];

    const defaultStatutory: GovTenderStatutoryCost[] = [
      { component: 'Minimum Wages (Govt Notified)', applicable: true, rate_or_amount: 15908, basis: 'Per person/month', validated_by_hr: false, remarks: 'Awaiting HR validation against latest Gazette' },
      { component: 'PF @ 13% (Basic + DA)', applicable: true, rate_or_amount: 13, basis: '% of Basic', validated_by_hr: false },
      { component: 'ESI @ 3.25% (Gross wage)', applicable: true, rate_or_amount: 3.25, basis: '% of Gross', validated_by_hr: false },
      { component: 'Bonus @ 8.33% (statutory cap)', applicable: true, rate_or_amount: 8.33, basis: '% of Basic', validated_by_hr: false },
      { component: 'Uniform & Safety Gear Provision', applicable: true, rate_or_amount: 350, basis: 'Per person/month', validated_by_hr: false },
      { component: 'Weekly Off / Reliever Wage Provision', applicable: true, rate_or_amount: 1800, basis: 'Per person/month', validated_by_hr: false }
    ];

    const created: GovernmentTender = {
      id: govId,
      government_category: newTender.government_category || 'Central',
      department: newTender.department || 'Central Public Works',
      tendering_authority: newTender.tendering_authority || 'Tender Committee',
      client_name: newTender.client_name!,
      tender_name: newTender.tender_name!,
      nit_reference_number: newTender.nit_reference_number!,
      portal_name: newTender.portal_name || 'GeM',
      portal_tender_id: newTender.portal_tender_id || `PORTAL-${Date.now().toString().slice(-6)}`,
      tender_url: newTender.tender_url || 'https://gem.gov.in',
      scope_of_work: newTender.scope_of_work || '',
      location: newTender.location || 'Bengaluru',
      tender_type: newTender.tender_type || 'Open',
      estimated_tender_value: Number(newTender.estimated_tender_value) || 0,
      contract_period: newTender.contract_period || '2 Years',
      publication_date: newTender.publication_date || new Date().toISOString().split('T')[0],
      doc_download_start: newTender.doc_download_start || new Date().toISOString().split('T')[0],
      doc_download_end: newTender.doc_download_end || '',
      last_date_of_submission: newTender.last_date_of_submission || '',
      bid_validity_period: newTender.bid_validity_period || '90 Days',
      emd_amount: Number(newTender.emd_amount) || 0,
      emd_mode: newTender.emd_mode || 'Online',
      emd_exemption_applicable: !!newTender.emd_exemption_applicable,
      emd_exemption_type: newTender.emd_exemption_type,
      emd_exemption_certificate_ref: newTender.emd_exemption_certificate_ref || '',
      tender_fee: Number(newTender.tender_fee) || 0,
      processing_fee: Number(newTender.processing_fee) || 0,
      estimated_pbg_percentage: Number(newTender.estimated_pbg_percentage) || 5,
      security_deposit_terms: newTender.security_deposit_terms || '5% PBG',
      eligibility_criteria: defaultCriteria,
      required_certificates: defaultCerts,
      dsc_holder: newTender.dsc_holder || 'Kunal Sen (BD Head)',
      dsc_expiry: newTender.dsc_expiry || '2027-06-30',
      integrity_pact_signed: true,
      blacklisting_declaration: 'Clear',
      document_checklist: defaultDocs,
      corrigendums: [],
      evaluation_entries: [],
      statutory_costs: defaultStatutory,
      tender_owner: newTender.tender_owner || userEmail,
      procurement_executive: newTender.procurement_executive || 'Deepika Nair',
      supporting_team: newTender.supporting_team || ['Vikram Singh', 'Neha Gupta', 'Aarav Sharma'],
      operations_spoc: newTender.operations_spoc || 'Vikram Singh',
      finance_spoc: newTender.finance_spoc || 'Neha Gupta',
      hr_spoc: newTender.hr_spoc || 'Aarav Sharma',
      gm_approval: 'Pending',
      ceo_approval: 'Pending',
      status: 'Tender Identified',
      portal_login_owner: newTender.portal_login_owner || 'Kunal Sen',
      dsc_availability: 'Available',
      upload_status: 'Not Started',
      eligibility_score: 85,
      created_at: new Date().toISOString()
    };

    onUpdateState(prev => ({
      ...prev,
      governmentTenders: [created, ...(prev.governmentTenders || [])]
    }));

    saveEntityToFirestore('governmentTenders', created.id, created);
    setSelectedTenderId(created.id);
    setShowAddModal(false);
  };

  const handleUpdateActiveTender = (updater: (prev: GovernmentTender) => GovernmentTender) => {
    if (!activeTender) return;
    const updated = updater(activeTender);

    onUpdateState(prev => ({
      ...prev,
      governmentTenders: (prev.governmentTenders || []).map(t => (t.id === updated.id ? updated : t))
    }));

    saveEntityToFirestore('governmentTenders', updated.id, updated);
  };

  const toggleReviewConsideration = (key: string) => {
    if (!activeTender) return;
    handleUpdateActiveTender(tender => ({
      ...tender,
      review_considerations: {
        ...(tender.review_considerations || {}),
        [key]: !tender.review_considerations?.[key]
      },
      updated_at: new Date().toISOString()
    }));
  };

  const handleAdvanceStage = (nextStage: GovTenderStage) => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => ({
      ...t,
      status: nextStage,
      updated_at: new Date().toISOString()
    }));
    setShowStatusAdvanceModal(false);
  };

  const handleAddCorrigendum = () => {
    if (!activeTender || !newCorrigendum.description) return;
    const entry: GovTenderCorrigendumEntry = {
      ...newCorrigendum,
      management_reviewed: false
    };

    handleUpdateActiveTender(t => ({
      ...t,
      corrigendums: [...(t.corrigendums || []), entry],
      updated_at: new Date().toISOString()
    }));

    setNewCorrigendum({
      corrigendum_no: `Corrigendum-${(activeTender.corrigendums?.length || 0) + 2}`,
      issue_date: new Date().toISOString().split('T')[0],
      description: '',
      changes_summary: '',
      revised_submission_date: '',
      revised_boq: false,
      management_reviewed: false
    });
    setShowCorrigendumModal(false);
  };

  const handleAcknowledgeCorrigendum = (index: number) => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => {
      const list = [...(t.corrigendums || [])];
      if (list[index]) {
        list[index] = {
          ...list[index],
          management_reviewed: true,
          reviewed_by: userEmail || 'GM Reviewer',
          review_date: new Date().toISOString().split('T')[0]
        };
      }
      return {
        ...t,
        corrigendums: list,
        updated_at: new Date().toISOString()
      };
    });
  };

  const handleAddEvaluation = () => {
    if (!activeTender || !newEvaluation.description) return;

    let diffPct = 0;
    if (newEvaluation.l1_rate && newEvaluation.our_rate && newEvaluation.l1_rate > 0) {
      diffPct = Number((((newEvaluation.our_rate - newEvaluation.l1_rate) / newEvaluation.l1_rate) * 100).toFixed(2));
    }

    const entry: GovTenderEvaluationEntry = {
      ...newEvaluation,
      rate_difference_pct: diffPct
    };

    handleUpdateActiveTender(t => ({
      ...t,
      evaluation_entries: [...(t.evaluation_entries || []), entry],
      updated_at: new Date().toISOString()
    }));

    setNewEvaluation({
      stage: 'Financial Opening',
      date: new Date().toISOString().split('T')[0],
      description: '',
      our_position: 'L1',
      l1_rate: 0,
      our_rate: 0,
      rate_difference_pct: 0,
      remarks: ''
    });
    setShowEvaluationModal(false);
  };

  const handleRecordResult = () => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => ({
      ...t,
      result: resultData.result,
      result_reason: resultData.result_reason,
      competitor_l1_rate: Number(resultData.competitor_l1_rate) || undefined,
      competitor_names: resultData.competitor_names || undefined,
      status: resultData.result === 'Won' ? 'Won' : resultData.result === 'Lost' ? 'Lost' : resultData.result === 'Cancelled' ? 'Cancelled' : 'Re-Tendered',
      updated_at: new Date().toISOString()
    }));
    setShowResultModal(false);
  };

  const handleToggleHRStatutoryValidation = (index: number) => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => {
      const costs = [...(t.statutory_costs || [])];
      if (costs[index]) {
        const currentVal = costs[index].validated_by_hr;
        costs[index] = {
          ...costs[index],
          validated_by_hr: !currentVal,
          validation_date: !currentVal ? new Date().toISOString().split('T')[0] : undefined,
          remarks: !currentVal ? `Validated by ${userEmail || 'HR Head'}` : costs[index].remarks
        };
      }
      return {
        ...t,
        statutory_costs: costs,
        updated_at: new Date().toISOString()
      };
    });
  };

  const handleUpdateDocStatus = (docIndex: number, newStatus: GovTenderDocument['preparation_status']) => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => {
      const docs = [...(t.document_checklist || [])];
      if (docs[docIndex]) {
        docs[docIndex] = { ...docs[docIndex], preparation_status: newStatus };
      }
      return { ...t, document_checklist: docs, updated_at: new Date().toISOString() };
    });
  };

  const handleUpdateCriterionStatus = (critIndex: number, newStatus: GovTenderEligibilityCriterion['status']) => {
    if (!activeTender) return;
    handleUpdateActiveTender(t => {
      const crits = [...(t.eligibility_criteria || [])];
      if (crits[critIndex]) {
        crits[critIndex] = { ...crits[critIndex], status: newStatus };
      }
      // Re-calculate eligibility readiness score
      const metCount = crits.filter(c => c.status === 'Met').length;
      const score = Math.round((metCount / crits.length) * 100);
      return { ...t, eligibility_criteria: crits, eligibility_score: score, updated_at: new Date().toISOString() };
    });
  };

  // Helper calculation for statutory total
  const statutoryTotalPerWorker = useMemo(() => {
    if (!activeTender?.statutory_costs) return 0;
    return activeTender.statutory_costs
      .filter(s => s.applicable && s.basis.toLowerCase().includes('per person'))
      .reduce((sum, s) => sum + (s.rate_or_amount || 0), 0);
  }, [activeTender]);

  // Document checklist completion %
  const docCompletionPct = useMemo(() => {
    if (!activeTender?.document_checklist || activeTender.document_checklist.length === 0) return 0;
    const completed = activeTender.document_checklist.filter(d => d.preparation_status === 'Ready' || d.preparation_status === 'Uploaded').length;
    return Math.round((completed / activeTender.document_checklist.length) * 100);
  }, [activeTender]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* TOP BANNER & STATS CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden text-slate-900">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Landmark className="w-3.5 h-3.5" /> GOVERNMENT TENDER MODULE (GOV)
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                Separated from Commercial Tenders
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Government Bids & Public Procurement Cockpit
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl">
              End-to-end statutory management for Central, State, PSU and Municipal tenders (GeM, CPPP, IREPS).
              Includes rigorous Go/No-Go eligibility scoring, mandatory document annexures, corrigendum management flags,
              HR statutory cost validation, and post-submission evaluation tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Government Tender (GOV)</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Active GOV Pipeline</span>
            <span className="text-lg font-black text-slate-900">₹{(totalGovValue / 10000000).toFixed(2)} Cr</span>
            <span className="text-[10px] text-indigo-700 block mt-0.5">{activeGovCount} active bids</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Won Contracts</span>
            <span className="text-lg font-black text-emerald-700">₹{(wonGovValue / 10000000).toFixed(2)} Cr</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Under execution/LOA</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Corrigendum Flags</span>
            <span className={`text-lg font-black ${pendingCorrigendumsCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              {pendingCorrigendumsCount} Pending
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Needs GM clearance</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">HR Statutory Checks</span>
            <span className={`text-lg font-black ${unvalidatedHrStatutoryCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {unvalidatedHrStatutoryCount} Pending
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Min wage / PF / ESI</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Active Selection</span>
            <span className="text-sm font-black text-indigo-700 block truncate" title={activeTender?.tender_name}>
              {activeTender?.id || 'None'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">{activeTender?.client_name || 'Select below'}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TENDER SELECTOR & SEARCH BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search GOV Tender, NIT, Portal, Client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-medium text-slate-700"
          >
            <option value="ALL">All Categories (Central/State/PSU/Municipal)</option>
            <option value="Central">Central Govt</option>
            <option value="State">State Govt</option>
            <option value="PSU">PSU / Public Sector</option>
            <option value="Municipal">Municipal / Urban Bodies</option>
            <option value="Other">Other Authorities</option>
          </select>

          <select
            value={portalFilter}
            onChange={e => setPortalFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-medium text-slate-700"
          >
            <option value="ALL">All Portals (GeM / CPPP / IREPS / State)</option>
            <option value="GeM">GeM Portal</option>
            <option value="CPPP">CPPP (Central eProcure)</option>
            <option value="IREPS">IREPS (Railways)</option>
            <option value="State Portal">State Portals</option>
            <option value="Other">Other Portals</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 font-medium text-slate-700"
          >
            <option value="ALL">All Stages</option>
            <option value="Tender Identified">Tender Identified</option>
            <option value="Go/No-Go">Go / No-Go</option>
            <option value="Final Bid Preparation">Final Bid Preparation</option>
            <option value="Online Submission">Online Submission</option>
            <option value="Technical Opening">Technical Opening</option>
            <option value="Financial Bid Opening">Financial Bid Opening</option>
            <option value="L1 Position">L1 Position</option>
            <option value="Work Order Received">Work Order Received</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Selected Tender Switcher Pill */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Focused Tender:</span>
          <select
            value={selectedTenderId}
            onChange={e => setSelectedTenderId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold border border-indigo-200 bg-indigo-50/50 text-indigo-900 rounded-xl max-w-[280px] truncate"
          >
            {govTenders.map(t => (
              <option key={t.id} value={t.id}>
                {t.id}: {t.tender_name} ({t.government_category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TENDER SUB-NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1">
        {[
          { id: 'master', label: '4.2 Tender Master Screen', icon: Landmark },
          { id: 'lifecycle', label: '4.1 Lifecycle Pipeline (28 Stages)', icon: Layers },
          { id: 'eligibility', label: '4.3 Eligibility Checker (Go/No-Go)', icon: CheckSquare },
          { id: 'documents', label: '4.3 Document & Annexure Checklist', icon: FileText },
          { id: 'portal', label: '4.3 Portal Tracking & DSC', icon: GlobeIcon },
          { id: 'corrigendums', label: '4.3 Corrigendum Register', icon: AlertOctagon, badge: pendingCorrigendumsCount },
          { id: 'evaluation', label: '4.3 Evaluation & Result Tracker', icon: Scale },
          { id: 'statutory', label: '4.3 Statutory Cost Check (HR Panel)', icon: Calculator, badge: unvalidatedHrStatutoryCount, badgeColor: 'bg-rose-500' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-white border-t-2 border-indigo-600 text-indigo-800 font-bold shadow-xs border-x border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold text-white rounded-full ${tab.badgeColor || 'bg-amber-500'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE TENDER HEADER BANNER & ACTION BAR */}
      {/* ------------------------------------------------------------- */}
      {activeTender && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                  {activeTender.id}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
                  {activeTender.government_category} Category
                </span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                  {activeTender.portal_name}: {activeTender.portal_tender_id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                  activeTender.status === 'Won' || activeTender.status === 'Work Order Received'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeTender.status === 'Lost'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Stage: {activeTender.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {activeTender.tender_name}
              </h3>
              <p className="text-xs text-slate-500">
                Authority: <strong className="text-slate-700">{activeTender.tendering_authority}</strong> ({activeTender.client_name}) •
                NIT: <strong className="text-slate-700 font-mono">{activeTender.nit_reference_number}</strong> •
                Value: <strong className="text-indigo-700">₹{(activeTender.estimated_tender_value / 10000000).toFixed(2)} Cr</strong> •
                Location: <strong className="text-slate-700">{activeTender.location}</strong>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowStatusAdvanceModal(true)}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Advance Stage
              </button>
              <button
                onClick={() => setShowCorrigendumModal(true)}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Corrigendum
              </button>
              <button
                onClick={() => setShowEvaluationModal(true)}
                className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" /> Record Evaluation
              </button>
              <button
                onClick={() => setShowResultModal(true)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> Won / Lost Result
              </button>
            </div>
          </div>

          {/* Alert Callouts if unreviewed Corrigendum exists */}
          {activeTender.corrigendums?.some(c => !c.management_reviewed) && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-400 rounded-2xl flex items-center justify-between text-xs text-rose-900 animate-pulse">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-black uppercase tracking-wider block text-rose-700">
                    ⚠️ CORRIGENDUM RECEIVED – MANAGEMENT REVIEW REQUIRED
                  </span>
                  <span>
                    New addendum/corrigendum issued on portal. Terms, submission date, or BOQ revised. Must be cleared by GM before bid freeze!
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('corrigendums')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow"
              >
                Review in Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 1: 4.2 GOVERNMENT TENDER MASTER SCREEN */}
      {/* ============================================================= */}
      {activeSubTab === 'master' && activeTender && (
        <div className="space-y-6">
          {/* Section Grid: Identification, Dates, Financials, Eligibility, Responsibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Block 1: Tender Identification & Scope */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600" /> Tender Identification & Authority
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400">MASTER REF: {activeTender.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Government Category</span>
                  <span className="font-bold text-slate-800">{activeTender.government_category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tender Type</span>
                  <span className="font-bold text-slate-800">{activeTender.tender_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Ministry / Department</span>
                  <span className="font-bold text-slate-800">{activeTender.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Client Name</span>
                  <span className="font-bold text-slate-800">{activeTender.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tendering Authority</span>
                  <span className="font-bold text-slate-800">{activeTender.tendering_authority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIT / Tender Ref Number</span>
                  <span className="font-mono font-bold text-indigo-700">{activeTender.nit_reference_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Portal & Portal Tender ID</span>
                  <span className="font-bold text-slate-800">{activeTender.portal_name} ({activeTender.portal_tender_id})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contract Period</span>
                  <span className="font-bold text-slate-800">{activeTender.contract_period}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Tender Portal URL</span>
                  <a
                    href={activeTender.tender_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline truncate block flex items-center gap-1 font-mono"
                  >
                    <span>{activeTender.tender_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="col-span-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-semibold mb-1">Scope of Work</span>
                  <p className="text-slate-700 leading-relaxed">{activeTender.scope_of_work}</p>
                </div>
              </div>
            </div>

            {/* Block 2: Crucial Dates & Deadlines */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" /> Milestone Dates & Submission Window
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400">Validity: {activeTender.bid_validity_period}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Publication Date</span>
                  <span className="font-bold text-slate-800">{activeTender.publication_date}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Download Window</span>
                  <span className="font-bold text-slate-800">{activeTender.doc_download_start} to {activeTender.doc_download_end || 'End of Bid'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Pre-Bid Meeting Date</span>
                  <span className="font-bold text-slate-800">{activeTender.pre_bid_meeting_date || 'Not Applicable'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Query Submission Last Date</span>
                  <span className="font-bold text-slate-800">{activeTender.query_submission_last_date || 'Not Specified'}</span>
                </div>
                <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200 col-span-2">
                  <span className="text-rose-700 block text-[11px] font-bold">Last Date & Time of Online Submission</span>
                  <span className="font-mono text-sm font-black text-rose-900">{activeTender.last_date_of_submission}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Technical Bid Opening</span>
                  <span className="font-bold text-slate-800">{activeTender.technical_bid_opening_date || 'TBD'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Financial Bid Opening</span>
                  <span className="font-bold text-slate-800">{activeTender.financial_bid_opening_date || 'TBD'}</span>
                </div>
              </div>
            </div>

            {/* Block 3: Financial & Security (EMD, PBG, Fees) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Financial & Security Requirements
                </h4>
                <span className="text-xs font-bold text-emerald-700">
                  Est. Value: ₹{(activeTender.estimated_tender_value / 100000).toFixed(2)} Lakh
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">EMD Amount</span>
                  <span className="text-base font-black text-emerald-900">
                    ₹{(activeTender.emd_amount / 100000).toFixed(2)} Lakh
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Mode: {activeTender.emd_mode}</span>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <span className="text-slate-500 block text-[11px]">EMD Exemption</span>
                  <span className={`text-xs font-bold block ${activeTender.emd_exemption_applicable ? 'text-blue-900' : 'text-slate-700'}`}>
                    {activeTender.emd_exemption_applicable ? `Exempt (${activeTender.emd_exemption_type})` : 'Not Applicable'}
                  </span>
                  {activeTender.emd_exemption_certificate_ref && (
                    <span className="text-[10px] font-mono text-slate-600 block truncate">
                      Ref: {activeTender.emd_exemption_certificate_ref}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Tender Fee</span>
                  <span className="font-bold text-slate-800">₹{activeTender.tender_fee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Portal Processing Fee</span>
                  <span className="font-bold text-slate-800">₹{activeTender.processing_fee.toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated PBG Percentage</span>
                  <span className="font-bold text-indigo-700">{activeTender.estimated_pbg_percentage}% of Contract Value</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Security Deposit Terms</span>
                  <span className="font-bold text-slate-800">{activeTender.security_deposit_terms}</span>
                </div>
              </div>
            </div>

            {/* Block 4: Responsibility & Governance Matrix */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" /> Internal Responsibility & Approval Hierarchy
                </h4>
                <span className="text-[10px] font-mono text-slate-400">CROSS-FUNCTIONAL MATRIX</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Tender Owner (BD Head)</span>
                  <span className="font-bold text-slate-800">{activeTender.tender_owner}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Procurement Executive</span>
                  <span className="font-bold text-slate-800">{activeTender.procurement_executive}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Operations SPOC</span>
                  <span className="font-bold text-slate-800">{activeTender.operations_spoc}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Finance SPOC</span>
                  <span className="font-bold text-slate-800">{activeTender.finance_spoc}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">HR SPOC (Statutory Validator)</span>
                  <span className="font-bold text-slate-800">{activeTender.hr_spoc}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Supporting Team</span>
                  <span className="text-slate-700 truncate block">{(activeTender.supporting_team || []).join(', ')}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">GM Approval</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    activeTender.gm_approval === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeTender.gm_approval}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">CEO Approval</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    activeTender.ceo_approval === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeTender.ceo_approval}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Master Table of all Government Tenders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> All Registered Government Tenders (GOV Series)
              </h4>
              <span className="text-xs text-slate-500">{filteredTenders.length} entries matching</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                    <th className="p-3">Tender ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Tender Name & Client</th>
                    <th className="p-3">Portal / NIT</th>
                    <th className="p-3 text-right">Value (INR)</th>
                    <th className="p-3">Submission Due</th>
                    <th className="p-3">Readiness</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenders.map(t => {
                    const isSelected = t.id === activeTender.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTenderId(t.id)}
                        className={`hover:bg-indigo-50/40 cursor-pointer transition ${isSelected ? 'bg-indigo-50/60 font-medium' : ''}`}
                      >
                        <td className="p-3 font-mono font-bold text-indigo-700">{t.id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                            {t.government_category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{t.tender_name}</div>
                          <div className="text-[11px] text-slate-500">{t.client_name} ({t.location})</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-700">{t.portal_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{t.nit_reference_number}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          ₹{(t.estimated_tender_value / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-3 font-mono text-slate-600">{t.last_date_of_submission}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  (t.eligibility_score || 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${t.eligibility_score || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-600">{t.eligibility_score || 0}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'Won' || t.status === 'Work Order Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'Lost'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTenderId(t.id);
                              setActiveSubTab('lifecycle');
                            }}
                            className="text-indigo-600 hover:text-indigo-900 font-bold text-xs"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Departmental Go / No-Go Considerations</h4>
                <p className="mt-1 text-xs text-slate-500">Record that each tender-specific HR, Finance, and Operations check has been reviewed.</p>
              </div>
              <span className="text-xs text-slate-500">
                {GOV_REVIEW_CONSIDERATIONS.flatMap(group => group.items).filter(item => activeTender.review_considerations?.[item.id]).length} / {GOV_REVIEW_CONSIDERATIONS.flatMap(group => group.items).length} reviewed
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {GOV_REVIEW_CONSIDERATIONS.map(group => (
                <section key={group.department} className="space-y-2">
                  <h5 className="text-xs font-bold uppercase text-indigo-800">{group.department}</h5>
                  {group.items.map(item => (
                    <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-100 p-2.5 text-xs text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={!!activeTender.review_considerations?.[item.id]}
                        onChange={() => toggleReviewConsideration(item.id)}
                        className="mt-0.5 accent-indigo-700"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 2: 4.1 LIFECYCLE PIPELINE (28 STAGES STEPPER) */}
      {/* ============================================================= */}
      {activeSubTab === 'lifecycle' && activeTender && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Complete 28-Stage Government Tender Lifecycle
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                From Portal Identification to Technical/Financial Opening, Reverse Auction, PBG submission and Contract Execution.
              </p>
            </div>
            <button
              onClick={() => setShowStatusAdvanceModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
            >
              <ArrowRight className="w-4 h-4" /> Advance Current Stage
            </button>
          </div>

          {/* Current Stage Indicator Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 block">CURRENT OFFICIAL STATUS</span>
              <span className="text-lg font-black text-indigo-950 flex items-center gap-2">
                <Stamp className="w-5 h-5 text-indigo-700" /> {activeTender.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-600">
                Tender ID: <strong className="text-slate-900 font-mono">{activeTender.id}</strong>
              </span>
              <span className="text-slate-600">
                Authority: <strong className="text-slate-900">{activeTender.client_name}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Visual Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {GOV_LIFECYCLE_STAGES.map((st, idx) => {
              const isCurrent = activeTender.status === st.id;
              const currentIndex = GOV_LIFECYCLE_STAGES.findIndex(s => s.id === activeTender.status);
              const isPassed = currentIndex > idx && currentIndex !== -1;

              return (
                <div
                  key={st.id}
                  onClick={() => handleAdvanceStage(st.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                      : isPassed
                      ? 'bg-emerald-50/70 text-slate-800 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                      STEP {idx + 1}
                    </span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[9px] font-bold">CURRENT</span>
                    ) : isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <h5 className="font-bold leading-snug">{st.label}</h5>
                  <span className={`text-[10px] block mt-1 ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Group: {st.group}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 3: 4.3 ELIGIBILITY CHECKER (GO / NO-GO READINESS) */}
      {/* ============================================================= */}
      {activeSubTab === 'eligibility' && activeTender && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" /> Pre-Qualification Eligibility Checker & Readiness Scoring
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-qualification checklist that scores readiness and flags gaps before Go/No-Go verdict.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Readiness Score</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {activeTender.eligibility_score || 0}%
                  </span>
                </div>
                <button
                  onClick={() => setShowAddCriterionModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" /> Add Criterion
                </button>
              </div>
            </div>

            {/* Criteria List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                    <th className="p-3">Pre-Qualification Criterion</th>
                    <th className="p-3">Required Authority Benchmark</th>
                    <th className="p-3">Our Organization Value</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Remarks / Gap Flag</th>
                    <th className="p-3 text-right">Toggle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTender.eligibility_criteria || []).map((crit, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-900">{crit.criterion}</td>
                      <td className="p-3 font-mono text-slate-700 bg-slate-50/50">{crit.required_value}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{crit.our_value}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          crit.status === 'Met'
                            ? 'bg-emerald-100 text-emerald-800'
                            : crit.status === 'Partially Met'
                            ? 'bg-amber-100 text-amber-800'
                            : crit.status === 'Not Met'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {crit.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{crit.remarks || 'No gaps identified'}</td>
                      <td className="p-3 text-right">
                        <select
                          value={crit.status}
                          onChange={e => handleUpdateCriterionStatus(idx, e.target.value as any)}
                          className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                        >
                          <option value="Met">Met</option>
                          <option value="Partially Met">Partially Met</option>
                          <option value="Not Met">Not Met</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Certificates & Undertakings Tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Mandatory Statutory Registrations & Certificates
              </h4>
              <span className="text-xs text-slate-500">GST, PAN, PF, ESI, Labour Licence, ISO, MSME</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(activeTender.required_certificates || []).map((cert, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{cert.cert_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cert.status === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">No: {cert.cert_number}</div>
                  <div className="text-[10px] text-slate-400">
                    Validity: {cert.validity_from} to <strong className="text-slate-700">{cert.validity_to}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 4: 4.3 MANDATORY DOCUMENT CHECKLIST */}
      {/* ============================================================= */}
      {activeSubTab === 'documents' && activeTender && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Mandatory Annexure & Format Tracker
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks preparation and upload status per required tender annexure, financial BOQ, and DSC undertakings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Documentation Progress</span>
                <span className="text-xl font-black text-indigo-600 font-mono">{docCompletionPct}%</span>
              </div>
              <button
                onClick={() => setShowAddDocModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Add Document Requirement
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                  <th className="p-3">Document Name / Annexure</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Mandatory</th>
                  <th className="p-3">Responsible Person</th>
                  <th className="p-3">Preparation Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTender.document_checklist || []).map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-bold text-slate-900">{doc.doc_name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                        {doc.doc_type}
                      </span>
                    </td>
                    <td className="p-3">
                      {doc.mandatory ? (
                        <span className="text-rose-600 font-bold">Mandatory</span>
                      ) : (
                        <span className="text-slate-400">Optional</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{doc.responsible_person}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.preparation_status === 'Uploaded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.preparation_status === 'Ready'
                          ? 'bg-blue-100 text-blue-800'
                          : doc.preparation_status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.preparation_status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={doc.preparation_status}
                        onChange={e => handleUpdateDocStatus(idx, e.target.value as any)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready">Ready</option>
                        <option value="Uploaded">Uploaded</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 5: 4.3 PORTAL TRACKING & DSC MANAGEMENT */}
      {/* ============================================================= */}
      {activeSubTab === 'portal' && activeTender && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-indigo-600" /> Portal Tracking & DSC Authentication Status
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Track portal login owner, Digital Signature Certificate (DSC Class 3) validity, online upload status and acknowledgement receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-slate-500 block text-[11px]">Portal Login Owner</span>
              <span className="font-bold text-slate-900 text-sm block">{activeTender.portal_login_owner}</span>
              <span className="text-[10px] text-slate-400">Portal: {activeTender.portal_name}</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-slate-500 block text-[11px]">DSC Token Availability</span>
              <span className="font-bold text-emerald-700 text-sm block flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {activeTender.dsc_availability}
              </span>
              <span className="text-[10px] text-slate-400">Holder: {activeTender.dsc_holder}</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-slate-500 block text-[11px]">DSC Expiry Date</span>
              <span className="font-bold text-slate-900 text-sm block font-mono">{activeTender.dsc_expiry}</span>
              <span className="text-[10px] text-emerald-600">Valid Class-3 Signing Token</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-slate-500 block text-[11px]">Portal Upload Status</span>
              <span className="font-bold text-indigo-700 text-sm block">{activeTender.upload_status}</span>
              <span className="text-[10px] text-slate-400">
                Receipt: {activeTender.acknowledgement_receipt || 'Pending final submit'}
              </span>
            </div>
          </div>

          {/* Quick updater for upload status */}
          <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
            <h5 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" /> Update Online Upload & Acknowledgement Receipt
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Upload Status</label>
                <select
                  value={activeTender.upload_status}
                  onChange={e => handleUpdateActiveTender(t => ({ ...t, upload_status: e.target.value as any }))}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Partial">Partial (Technical Uploaded)</option>
                  <option value="Complete">Complete (Ready for Submission)</option>
                  <option value="Acknowledged">Acknowledged (Submitted on Portal)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 block mb-1 font-semibold">Portal Acknowledgement Receipt / Token Ref</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. GEM-BID-ACK-2026-981245 or IREPS-ACK-8812"
                    value={activeTender.acknowledgement_receipt || ''}
                    onChange={e => handleUpdateActiveTender(t => ({ ...t, acknowledgement_receipt: e.target.value }))}
                    className="flex-1 p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
                  />
                  <button
                    onClick={() => alert('Acknowledgement receipt recorded successfully!')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 6: 4.3 CORRIGENDUM REGISTER */}
      {/* ============================================================= */}
      {activeSubTab === 'corrigendums' && activeTender && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-600" /> Corrigendum & Addendum Register
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every corrigendum is captured. Tender is flagged: "CORRIGENDUM RECEIVED – MANAGEMENT REVIEW REQUIRED" until cleared by GM.
              </p>
            </div>

            <button
              onClick={() => setShowCorrigendumModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> Add Corrigendum
            </button>
          </div>

          {(activeTender.corrigendums || []).length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-slate-700">No Corrigendums Issued</p>
              <p className="text-xs text-slate-400">Original tender terms and deadlines remain intact.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTender.corrigendums.map((cor, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    !cor.management_reviewed
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {cor.corrigendum_no}
                      </span>
                      <span className="text-slate-400 font-mono">Issued: {cor.issue_date}</span>
                    </div>

                    {!cor.management_reviewed ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px] animate-pulse">
                          REVIEW REQUIRED
                        </span>
                        <button
                          onClick={() => handleAcknowledgeCorrigendum(idx)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                        >
                          Approve & Clear Flag
                        </button>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Reviewed by {cor.reviewed_by} ({cor.review_date})
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{cor.description}</h5>
                    <p className="text-slate-700 mt-1">{cor.changes_summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 text-[11px]">
                    {cor.revised_submission_date && (
                      <div>
                        <span className="text-slate-400">Revised Submission Deadline: </span>
                        <strong className="text-rose-600 font-mono">{cor.revised_submission_date}</strong>
                      </div>
                    )}
                    {cor.revised_boq && (
                      <div>
                        <span className="text-slate-400">BOQ Revised: </span>
                        <strong className="text-amber-700">Yes (Requires Costing Recalculation)</strong>
                      </div>
                    )}
                    {cor.revised_emd && (
                      <div>
                        <span className="text-slate-400">Revised EMD: </span>
                        <strong className="text-slate-800">₹{cor.revised_emd.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 7: 4.3 EVALUATION TRACKER & RESULT RECORDING */}
      {/* ============================================================= */}
      {activeSubTab === 'evaluation' && activeTender && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" /> Evaluation Tracker & Opening Results
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks Technical Opening, authority clarification queries, Financial Opening, and L1/L2/L3 bid positions.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" /> Log Evaluation Stage
                </button>
                <button
                  onClick={() => setShowResultModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Award className="w-4 h-4" /> Record Final Result
                </button>
              </div>
            </div>

            {/* Final Recorded Result Banner if exists */}
            {activeTender.result && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                activeTender.result === 'Won'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : activeTender.result === 'Lost'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm uppercase tracking-wide">
                    🏆 OFFICIAL RESULT: {activeTender.result}
                  </span>
                  {activeTender.competitor_l1_rate && (
                    <span className="font-mono font-bold">
                      Competitor L1 Rate: ₹{activeTender.competitor_l1_rate.toLocaleString()}
                    </span>
                  )}
                </div>
                {activeTender.result_reason && (
                  <p className="text-slate-700">Reason / Debriefing: {activeTender.result_reason}</p>
                )}
                {activeTender.competitor_names && (
                  <p className="text-slate-600 text-[11px]">Competitors: {activeTender.competitor_names}</p>
                )}
              </div>
            )}

            {/* Evaluation Log Entries */}
            {(activeTender.evaluation_entries || []).length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                No evaluation entries recorded yet. Technical or financial bid opening pending.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="p-3">Date</th>
                      <th className="p-3">Evaluation Stage</th>
                      <th className="p-3">Our Position / Status</th>
                      <th className="p-3">Authority Remarks / Summary</th>
                      <th className="p-3 text-right">L1 Rate vs Our Rate</th>
                      <th className="p-3 text-right">Diff %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTender.evaluation_entries.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-mono text-slate-500">{ev.date}</td>
                        <td className="p-3 font-bold text-slate-900">{ev.stage}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold text-[10px]">
                            {ev.our_position || 'Recorded'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{ev.description}</td>
                        <td className="p-3 text-right font-mono text-slate-800">
                          {ev.l1_rate ? `L1: ₹${ev.l1_rate.toLocaleString()}` : '-'}
                          {ev.our_rate ? ` / Ours: ₹${ev.our_rate.toLocaleString()}` : ''}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {ev.rate_difference_pct !== undefined ? `${ev.rate_difference_pct}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 8: 4.3 STATUTORY COST CHECK (SEPARATE HR PANEL) */}
      {/* ============================================================= */}
      {activeSubTab === 'statutory' && activeTender && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-emerald-500/20 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  STATUTORY COMPLIANCE & HR AUDIT PANEL
                </span>
                <h3 className="text-xl font-black mt-2">
                  HR Review: Minimum Wage, PF, ESI, Bonus & Statutory Cost Validation
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  Government bids strictly require compliance with Central/State Minimum Wages Act, EPF, ESIC, and Payment of Bonus Act.
                  Tenders submitting below minimum notified wage will be summarily rejected or lead to labor department penal actions.
                </p>
              </div>

              <button
                onClick={() => setShowAddStatutoryCostModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Statutory Component
              </button>
            </div>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
              <div className="bg-slate-850/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Statutory Cost Per Worker</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ₹{statutoryTotalPerWorker.toLocaleString()}/mo
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Sum of monthly per-person heads</span>
              </div>

              <div className="bg-slate-850/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">HR Validation Status</span>
                <span className={`text-lg font-black ${
                  (activeTender.statutory_costs || []).every(s => !s.applicable || s.validated_by_hr)
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}>
                  {(activeTender.statutory_costs || []).filter(s => s.applicable && s.validated_by_hr).length} / {(activeTender.statutory_costs || []).filter(s => s.applicable).length} Verified
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">By HR SPOC ({activeTender.hr_spoc})</span>
              </div>

              <div className="bg-slate-850/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Tender Budget Feasibility</span>
                <span className="text-lg font-black text-indigo-300">
                  ₹{(activeTender.estimated_tender_value / 10000000).toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Safe margin above statutory floor</span>
              </div>
            </div>
          </div>

          {/* Statutory Breakdown Table with One-Click HR Verification Toggle */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" /> Itemized Statutory Component Breakdown
              </h4>
              <span className="text-xs text-slate-500">Click button to toggle HR validation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                    <th className="p-3">Statutory Component</th>
                    <th className="p-3">Rate / Amount</th>
                    <th className="p-3">Calculation Basis</th>
                    <th className="p-3">HR Validation Status</th>
                    <th className="p-3">Audit / Validation Notes</th>
                    <th className="p-3 text-right">HR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTender.statutory_costs || []).map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-900">{sc.component}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        {typeof sc.rate_or_amount === 'number' && sc.rate_or_amount > 100
                          ? `₹${sc.rate_or_amount.toLocaleString()}`
                          : `${sc.rate_or_amount}%`}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{sc.basis}</td>
                      <td className="p-3">
                        {sc.validated_by_hr ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" /> Validated ({sc.validation_date || 'HR Cleared'})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Pending HR Check
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{sc.remarks || 'Standard statutory parameter'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleHRStatutoryValidation(idx)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            sc.validated_by_hr
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow'
                          }`}
                        >
                          {sc.validated_by_hr ? 'Revoke Validation' : 'Approve as HR Head'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODALS */}
      {/* ============================================================= */}

      {/* MODAL 1: ADD NEW GOVERNMENT TENDER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-600">NEW GOV RECORD</span>
                <h3 className="text-lg font-bold text-slate-900">Register Government Tender</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Tender Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mechanized Cleaning & Facility Services for Metro Stations"
                  value={newTender.tender_name}
                  onChange={e => setNewTender({ ...newTender, tender_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Government Category *</label>
                <select
                  value={newTender.government_category}
                  onChange={e => setNewTender({ ...newTender, government_category: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Central">Central Govt</option>
                  <option value="State">State Govt</option>
                  <option value="PSU">PSU / Public Sector</option>
                  <option value="Municipal">Municipal / Urban Bodies</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client / Organization Name *</label>
                <input
                  type="text"
                  placeholder="e.g. South Western Railway, BMRCL, Karnataka PWD"
                  value={newTender.client_name}
                  onChange={e => setNewTender({ ...newTender, client_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ministry / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Railways, Urban Development"
                  value={newTender.department}
                  onChange={e => setNewTender({ ...newTender, department: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tendering Authority</label>
                <input
                  type="text"
                  placeholder="e.g. Sr. Divisional Commercial Manager"
                  value={newTender.tendering_authority}
                  onChange={e => setNewTender({ ...newTender, tendering_authority: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NIT / Tender Ref Number *</label>
                <input
                  type="text"
                  placeholder="e.g. NIT-2026-SWR-047"
                  value={newTender.nit_reference_number}
                  onChange={e => setNewTender({ ...newTender, nit_reference_number: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Portal Name</label>
                <select
                  value={newTender.portal_name}
                  onChange={e => setNewTender({ ...newTender, portal_name: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="GeM">GeM (Government e-Marketplace)</option>
                  <option value="CPPP">CPPP (Central Public Procurement)</option>
                  <option value="IREPS">IREPS (Indian Railways)</option>
                  <option value="State Portal">State Portal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Portal Tender ID</label>
                <input
                  type="text"
                  placeholder="e.g. GEM-2026-B-891234"
                  value={newTender.portal_tender_id}
                  onChange={e => setNewTender({ ...newTender, portal_tender_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimated Tender Value (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 50000000"
                  value={newTender.estimated_tender_value || ''}
                  onChange={e => setNewTender({ ...newTender, estimated_tender_value: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Last Date of Submission *</label>
                <input
                  type="date"
                  value={newTender.last_date_of_submission}
                  onChange={e => setNewTender({ ...newTender, last_date_of_submission: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">EMD Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000000"
                  value={newTender.emd_amount || ''}
                  onChange={e => setNewTender({ ...newTender, emd_amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">EMD Mode</label>
                <select
                  value={newTender.emd_mode}
                  onChange={e => setNewTender({ ...newTender, emd_mode: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Online">Online Payment / Portal</option>
                  <option value="DD">Demand Draft</option>
                  <option value="BG">Bank Guarantee</option>
                  <option value="Bid Security Declaration">Bid Security Declaration (MSME/Startup)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="emd_ex"
                  checked={newTender.emd_exemption_applicable}
                  onChange={e => setNewTender({ ...newTender, emd_exemption_applicable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="emd_ex" className="font-semibold text-slate-700">EMD Exemption Applicable (MSME / Startup)</label>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Scope of Work</label>
                <textarea
                  rows={2}
                  placeholder="Summary of services, manpower count, equipment specification..."
                  value={newTender.scope_of_work}
                  onChange={e => setNewTender({ ...newTender, scope_of_work: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTender}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Save & Initialize GOV Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG CORRIGENDUM */}
      {showCorrigendumModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Corrigendum Entry</h3>
              <button onClick={() => setShowCorrigendumModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corrigendum Reference No</label>
                <input
                  type="text"
                  value={newCorrigendum.corrigendum_no}
                  onChange={e => setNewCorrigendum({ ...newCorrigendum, corrigendum_no: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={newCorrigendum.issue_date}
                  onChange={e => setNewCorrigendum({ ...newCorrigendum, issue_date: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Headline Description</label>
                <input
                  type="text"
                  placeholder="e.g. Extension of Submission Date & BOQ Modification"
                  value={newCorrigendum.description}
                  onChange={e => setNewCorrigendum({ ...newCorrigendum, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Changes Summary</label>
                <textarea
                  rows={3}
                  placeholder="Detail changes in manpower clauses, equipment, revised dates..."
                  value={newCorrigendum.changes_summary}
                  onChange={e => setNewCorrigendum({ ...newCorrigendum, changes_summary: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Revised Submission Date</label>
                  <input
                    type="date"
                    value={newCorrigendum.revised_submission_date || ''}
                    onChange={e => setNewCorrigendum({ ...newCorrigendum, revised_submission_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="rev_boq"
                    checked={newCorrigendum.revised_boq}
                    onChange={e => setNewCorrigendum({ ...newCorrigendum, revised_boq: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="rev_boq" className="font-semibold text-slate-700">BOQ Quantities Revised</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCorrigendumModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCorrigendum}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Log Corrigendum & Flag Management
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD EVALUATION */}
      {showEvaluationModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Evaluation Update</h3>
              <button onClick={() => setShowEvaluationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evaluation Stage</label>
                <select
                  value={newEvaluation.stage}
                  onChange={e => setNewEvaluation({ ...newEvaluation, stage: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Technical Opening">Technical Opening</option>
                  <option value="Technical Result">Technical Result (Qualified / Disqualified)</option>
                  <option value="Clarification">Clarification Request from Authority</option>
                  <option value="Financial Opening">Financial Opening</option>
                  <option value="L-Position">L-Position (L1 / L2 / L3)</option>
                  <option value="E-Reverse Auction">E-Reverse Auction (e-RA)</option>
                  <option value="Negotiation">L1 Negotiation / Rate Matching</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={newEvaluation.date}
                  onChange={e => setNewEvaluation({ ...newEvaluation, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Our Position / Verdict</label>
                <input
                  type="text"
                  placeholder="e.g. Technically Qualified (12 of 14 bidders cleared) or L1 Bidder"
                  value={newEvaluation.our_position}
                  onChange={e => setNewEvaluation({ ...newEvaluation, our_position: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Our Quoted Rate (INR)</label>
                  <input
                    type="number"
                    value={newEvaluation.our_rate || ''}
                    onChange={e => setNewEvaluation({ ...newEvaluation, our_rate: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">L1 Quoted Rate (INR)</label>
                  <input
                    type="number"
                    value={newEvaluation.l1_rate || ''}
                    onChange={e => setNewEvaluation({ ...newEvaluation, l1_rate: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks & Details</label>
                <textarea
                  rows={2}
                  value={newEvaluation.description}
                  onChange={e => setNewEvaluation({ ...newEvaluation, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvaluation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD FINAL RESULT */}
      {showResultModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Tender Final Result</h3>
              <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Final Outcome</label>
                <select
                  value={resultData.result}
                  onChange={e => setResultData({ ...resultData, result: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  <option value="Won">Won (LOI / Work Order received)</option>
                  <option value="Lost">Lost (Competitor L1 awarded)</option>
                  <option value="Cancelled">Cancelled (Authority scrapped NIT)</option>
                  <option value="Re-Tendered">Re-Tendered</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Winning / Competitor L1 Rate (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 48500000"
                  value={resultData.competitor_l1_rate || ''}
                  onChange={e => setResultData({ ...resultData, competitor_l1_rate: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Competitor Name(s)</label>
                <input
                  type="text"
                  placeholder="e.g. SIS Ltd, Duster Cleantec, BVG India"
                  value={resultData.competitor_names || ''}
                  onChange={e => setResultData({ ...resultData, competitor_names: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Debriefing Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detailed factors: rate differential, technical marks, e-reverse auction margin..."
                  value={resultData.result_reason}
                  onChange={e => setResultData({ ...resultData, result_reason: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordResult}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Official Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADVANCE STAGE */}
      {showStatusAdvanceModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Advance Lifecycle Stage</h3>
              <button onClick={() => setShowStatusAdvanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Current stage: <strong className="text-indigo-700">{activeTender.status}</strong>
              </p>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Next Official Stage</label>
                <select
                  value={activeTender.status}
                  onChange={e => handleAdvanceStage(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  {GOV_LIFECYCLE_STAGES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.group})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowStatusAdvanceModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD DOCUMENT CHECKLIST ITEM */}
      {showAddDocModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Mandatory Document</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document / Annexure Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Annexure-VI: Power of Attorney"
                  value={newDoc.doc_name}
                  onChange={e => setNewDoc({ ...newDoc, doc_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Type</label>
                <select
                  value={newDoc.doc_type}
                  onChange={e => setNewDoc({ ...newDoc, doc_type: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Annexure">Annexure</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Undertaking">Undertaking / Affidavit</option>
                  <option value="Technical">Technical</option>
                  <option value="Financial">Financial / BOQ</option>
                  <option value="DSC">DSC Token Verification</option>
                  <option value="EMD">EMD Document</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Responsible Person</label>
                <input
                  type="text"
                  placeholder="e.g. Deepika Nair, Neha Gupta"
                  value={newDoc.responsible_person}
                  onChange={e => setNewDoc({ ...newDoc, responsible_person: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddDocModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newDoc.doc_name) return;
                  handleUpdateActiveTender(t => ({
                    ...t,
                    document_checklist: [...(t.document_checklist || []), newDoc]
                  }));
                  setNewDoc({
                    doc_name: '',
                    doc_type: 'Annexure',
                    mandatory: true,
                    preparation_status: 'Not Started',
                    responsible_person: 'Deepika Nair'
                  });
                  setShowAddDocModal(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Add Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD ELIGIBILITY CRITERION */}
      {showAddCriterionModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Eligibility Criterion</h3>
              <button onClick={() => setShowAddCriterionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pre-Qualification Criterion *</label>
                <input
                  type="text"
                  placeholder="e.g. Average Annual Turnover (Last 3 FY)"
                  value={newCriterion.criterion}
                  onChange={e => setNewCriterion({ ...newCriterion, criterion: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Benchmark</label>
                <input
                  type="text"
                  placeholder="e.g. ₹25 Cr minimum"
                  value={newCriterion.required_value}
                  onChange={e => setNewCriterion({ ...newCriterion, required_value: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Our Value</label>
                <input
                  type="text"
                  placeholder="e.g. ₹32 Cr audited"
                  value={newCriterion.our_value}
                  onChange={e => setNewCriterion({ ...newCriterion, our_value: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={newCriterion.status}
                  onChange={e => setNewCriterion({ ...newCriterion, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Met">Met</option>
                  <option value="Partially Met">Partially Met</option>
                  <option value="Not Met">Not Met</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddCriterionModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCriterion.criterion) return;
                  handleUpdateActiveTender(t => ({
                    ...t,
                    eligibility_criteria: [...(t.eligibility_criteria || []), newCriterion]
                  }));
                  setNewCriterion({
                    criterion: '',
                    required_value: '',
                    our_value: '',
                    status: 'Under Review'
                  });
                  setShowAddCriterionModal(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Add Criterion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ADD STATUTORY COST COMPONENT */}
      {showAddStatutoryCostModal && activeTender && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Statutory Cost Item</h3>
              <button onClick={() => setShowAddStatutoryCostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Component Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Minimum Wages (Skilled Supervisor)"
                  value={newStatCost.component}
                  onChange={e => setNewStatCost({ ...newStatCost, component: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rate or Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 18500 or 13"
                  value={newStatCost.rate_or_amount || ''}
                  onChange={e => setNewStatCost({ ...newStatCost, rate_or_amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Calculation Basis</label>
                <input
                  type="text"
                  placeholder="e.g. Per person/month or % of basic"
                  value={newStatCost.basis}
                  onChange={e => setNewStatCost({ ...newStatCost, basis: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks / Legal Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka Minimum Wages Notification 2026"
                  value={newStatCost.remarks || ''}
                  onChange={e => setNewStatCost({ ...newStatCost, remarks: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddStatutoryCostModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newStatCost.component) return;
                  handleUpdateActiveTender(t => ({
                    ...t,
                    statutory_costs: [...(t.statutory_costs || []), newStatCost]
                  }));
                  setNewStatCost({
                    component: '',
                    applicable: true,
                    rate_or_amount: 0,
                    basis: 'Per person/month',
                    validated_by_hr: false
                  });
                  setShowAddStatutoryCostModal(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple globe icon fallback
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
