import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Banknote, Building2, CalendarDays, Check, CircleDollarSign,
  ClipboardList, FilePlus2, FileText, Handshake, Plus, Search, ShieldCheck, Users, X
} from 'lucide-react';
import { AppState, PrivateTender, PrivateTenderFollowUp, PrivateTenderNegotiation, PrivateTenderProposalVersion, PrivateTenderStage, Role } from '../types';
import { saveEntityToFirestore } from '../lib/firebaseService';

interface PrivateTenderViewProps {
  state: AppState;
  currentRole: Role;
  userEmail: string;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

type TenderTab = 'pipeline' | 'master' | 'negotiations' | 'proposals' | 'followups' | 'credit';

const STAGES: PrivateTenderStage[] = [
  'Enquiry Received', 'NDA', 'Requirement Understanding / Site Visit', 'Initial Screening',
  'HR / Finance / Operations Review', 'GO / NO-GO', 'Proposal Preparation', 'Clarifications / Queries',
  'Technical Presentation', 'Commercial Proposal Submission', 'Negotiation', 'Management Approval of Final Offer',
  'Final Offer Submitted', 'Client Decision', 'LOI / Work Order / PO', 'Security Deposit / PBG',
  'Service Agreement', 'Contract Execution', 'Renewal', 'Closure', 'Won', 'Lost'
];

const PRIVATE_REVIEW_CONSIDERATIONS = [
  { department: 'HR', items: [
    { id: 'hr_client_manpower', label: 'Confirm client-specific manpower requirements' },
    { id: 'hr_deployment_flexibility', label: 'Assess flexibility of deployment and ramp-up' }
  ] },
  { department: 'Finance', items: [
    { id: 'finance_client_credit_risk', label: 'Assess client credit risk' },
    { id: 'finance_payment_terms', label: 'Review payment terms and credit period' },
    { id: 'finance_minimum_margin', label: 'Confirm margin meets the minimum margin' },
    { id: 'finance_security_deposit', label: 'Review security deposit requirements' }
  ] },
  { department: 'Operations', items: [
    { id: 'ops_site_visit_findings', label: 'Review and record site visit findings' },
    { id: 'ops_sla_penalties', label: 'Review client SLA and service-level penalties' },
    { id: 'ops_scalability', label: 'Confirm delivery model can scale with client demand' }
  ] }
];

const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
const labelClass = 'block space-y-1 text-xs font-semibold text-slate-600';

const createBlankTender = (userEmail: string): Partial<PrivateTender> => ({
  client_category: 'Corporate', client_name: '', parent_company: '', enquiry_reference: '', enquiry_source: 'Direct',
  scope_of_work: '', location: '', estimated_contract_value: 0, contract_period: '', enquiry_date: new Date().toISOString().slice(0, 10),
  site_visit_date: '', proposal_due_date: '', presentation_date: '', expected_decision_date: '', expected_start_date: '',
  pricing_model: 'Fixed', proposed_margin: 0, minimum_margin: 0, payment_terms: '', credit_period_days: 0,
  security_deposit_requested: '', price_escalation_clause: '', competitors: '', decision_maker: '', client_spoc: '',
  relationship_status: 'New', previous_business_history: '', vendor_registration_status: 'Not Started', nda_status: 'Not Required',
  business_owner: userEmail, proposal_owner: userEmail, procurement_executive: '', operations_spoc: '', finance_spoc: '', hr_spoc: '',
  gm_approval: 'Pending', ceo_approval: 'Pending', stage: 'Enquiry Received', probability: 20, credit_standing: 'Not Reviewed',
  payment_history: '', finance_review: 'Pending', credit_notes: '', go_no_go: 'Pending', negotiations: [], proposal_versions: [], follow_ups: []
});

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export const PrivateTenderView: React.FC<PrivateTenderViewProps> = ({ state, currentRole, userEmail, onUpdateState }) => {
  const tenders = state.privateTenders || [];
  const [tab, setTab] = useState<TenderTab>('pipeline');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(tenders[0]?.id || '');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<Partial<PrivateTender>>(() => createBlankTender(userEmail));
  const [negotiationDraft, setNegotiationDraft] = useState({ date: new Date().toISOString().slice(0, 10), client_ask: '', our_offer: '', revised_rate: 0, revised_margin: 0, outcome: '' });
  const [proposalDraft, setProposalDraft] = useState({ version: '', date: new Date().toISOString().slice(0, 10), offer_value: 0, document_url: '', notes: '' });
  const [followUpDraft, setFollowUpDraft] = useState({ date: new Date().toISOString().slice(0, 10), type: 'Meeting' as PrivateTenderFollowUp['type'], summary: '', next_action: '', next_action_date: '' });

  const selected = tenders.find(tender => tender.id === selectedId) || tenders[0] || null;
  const filtered = useMemo(() => tenders.filter(tender => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [tender.id, tender.client_name, tender.parent_company, tender.enquiry_reference, tender.scope_of_work].some(value => value.toLowerCase().includes(query));
    return matchesSearch && (stageFilter === 'ALL' || tender.stage === stageFilter);
  }), [tenders, search, stageFilter]);
  const activeTenders = tenders.filter(tender => !['Won', 'Lost', 'Closure'].includes(tender.stage));
  const weightedValue = activeTenders.reduce((sum, tender) => sum + tender.estimated_contract_value * tender.probability / 100, 0);
  const marginAlerts = activeTenders.filter(tender => tender.proposed_margin < tender.minimum_margin && tender.minimum_margin > 0).length;
  const dueSoon = activeTenders.filter(tender => {
    if (!tender.proposal_due_date) return false;
    const days = (new Date(tender.proposal_due_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 14;
  }).length;

  const updateTender = (id: string, update: (tender: PrivateTender) => PrivateTender) => {
    onUpdateState(prev => {
      const updated = (prev.privateTenders || []).map(tender => tender.id === id ? update(tender) : tender);
      const changed = updated.find(tender => tender.id === id);
      if (changed) saveEntityToFirestore('privateTenders', changed.id, changed);
      return { ...prev, privateTenders: updated };
    });
  };

  const toggleReviewConsideration = (key: string) => {
    if (!selected) return;
    updateTender(selected.id, tender => ({
      ...tender,
      review_considerations: {
        ...(tender.review_considerations || {}),
        [key]: !tender.review_considerations?.[key]
      }
    }));
  };

  const createTender = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.client_name?.trim()) return;
    const year = new Date().getFullYear();
    const sequence = String(tenders.filter(tender => tender.id.startsWith(`PVT/${year}/`)).length + 1).padStart(3, '0');
    const created: PrivateTender = {
      ...createBlankTender(userEmail), ...draft, id: `PVT/${year}/${sequence}`, client_name: draft.client_name.trim(),
      created_at: new Date().toISOString(), negotiations: [], proposal_versions: [], follow_ups: []
    } as PrivateTender;
    onUpdateState(prev => ({ ...prev, privateTenders: [created, ...(prev.privateTenders || [])] }));
    saveEntityToFirestore('privateTenders', created.id, created);
    setSelectedId(created.id);
    setDraft(createBlankTender(userEmail));
    setShowCreate(false);
  };

  const addNegotiation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const record: PrivateTenderNegotiation = {
      id: `NEG-${Date.now()}`, round: selected.negotiations.length + 1, ...negotiationDraft, approval_taken: 'Pending'
    };
    updateTender(selected.id, tender => ({
      ...tender, negotiations: [...tender.negotiations, record], stage: 'Negotiation',
      gm_approval: record.revised_margin < tender.minimum_margin ? 'Pending' : tender.gm_approval
    }));
    setNegotiationDraft({ date: new Date().toISOString().slice(0, 10), client_ask: '', our_offer: '', revised_rate: 0, revised_margin: 0, outcome: '' });
  };

  const addProposalVersion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !proposalDraft.version.trim()) return;
    const version: PrivateTenderProposalVersion = { id: `PROP-${Date.now()}`, ...proposalDraft, approval: 'Pending' };
    updateTender(selected.id, tender => ({ ...tender, proposal_versions: [...tender.proposal_versions, version] }));
    setProposalDraft({ version: '', date: new Date().toISOString().slice(0, 10), offer_value: 0, document_url: '', notes: '' });
  };

  const addFollowUp = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !followUpDraft.summary.trim()) return;
    const followUp: PrivateTenderFollowUp = { id: `FOLLOW-${Date.now()}`, ...followUpDraft };
    updateTender(selected.id, tender => ({ ...tender, follow_ups: [...tender.follow_ups, followUp] }));
    setFollowUpDraft({ date: new Date().toISOString().slice(0, 10), type: 'Meeting', summary: '', next_action: '', next_action_date: '' });
  };

  const approveNegotiation = (record: PrivateTenderNegotiation, approval: PrivateTenderNegotiation['approval_taken']) => {
    if (!selected) return;
    updateTender(selected.id, tender => ({
      ...tender,
      negotiations: tender.negotiations.map(item => item.id === record.id ? { ...item, approval_taken: approval } : item),
      ...(record.revised_margin < tender.minimum_margin ? { gm_approval: approval === 'CEO Approved' ? 'Approved' : tender.gm_approval, ceo_approval: approval === 'CEO Approved' ? 'Approved' : tender.ceo_approval } : {})
    }));
  };

  const advanceStage = (tender: PrivateTender, nextStage: PrivateTenderStage) => {
    if (nextStage === 'Final Offer Submitted' && tender.proposed_margin < tender.minimum_margin && tender.minimum_margin > 0 && (tender.gm_approval !== 'Approved' || tender.ceo_approval !== 'Approved')) {
      window.alert('A below-minimum offer requires both GM and CEO approval before submission.');
      return;
    }
    updateTender(tender.id, current => ({ ...current, stage: nextStage }));
  };

  const tabItems: { id: TenderTab; label: string; icon: React.ElementType }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: ArrowRight }, { id: 'master', label: 'Tender master', icon: ClipboardList },
    { id: 'negotiations', label: 'Negotiations', icon: Handshake }, { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'followups', label: 'Client follow-ups', icon: CalendarDays }, { id: 'credit', label: 'Credit review', icon: ShieldCheck }
  ];

  const textField = (label: string, key: keyof PrivateTender, required = false) => (
    <label className={labelClass} key={key}>{label}
      <input className={inputClass} required={required} value={String(draft[key] ?? '')} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} />
    </label>
  );
  const numberField = (label: string, key: keyof PrivateTender) => (
    <label className={labelClass} key={key}>{label}
      <input className={inputClass} type="number" min="0" step="0.1" value={Number(draft[key] ?? 0)} onChange={event => setDraft(prev => ({ ...prev, [key]: Number(event.target.value) }))} />
    </label>
  );
  const selectField = (label: string, key: keyof PrivateTender, options: string[]) => (
    <label className={labelClass} key={key}>{label}
      <select className={inputClass} value={String(draft[key] ?? options[0])} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))}>
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  );

  return (
    <section className="space-y-5 text-slate-800" id="private-tender-dashboard">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700"><Building2 className="h-4 w-4" /> Private bids · PVT series</div>
          <h2 className="text-2xl font-bold text-slate-950">Private Tender Desk</h2>
          <p className="mt-1 text-sm text-slate-500">Corporate opportunities, commercial guardrails and client decisions in a separate register.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> New private enquiry</button>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={Building2} label="Active opportunities" value={String(activeTenders.length)} detail={`${tenders.length} private tenders`} />
        <Metric icon={CircleDollarSign} label="Weighted pipeline" value={money(weightedValue)} detail="Value × win probability" />
        <Metric icon={AlertTriangle} label="Margin guard" value={String(marginAlerts)} detail="Offers below minimum margin" alert={marginAlerts > 0} />
        <Metric icon={CalendarDays} label="Proposal deadlines" value={String(dueSoon)} detail="Due in the next 14 days" />
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Private tender sections">
        {tabItems.map(item => {
          const Icon = item.icon;
          return <button key={item.id} onClick={() => setTab(item.id)} className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold ${tab === item.id ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>;
        })}
      </nav>

      {tab !== 'credit' && tab !== 'pipeline' && tab !== 'master' && !selected && <EmptyState onCreate={() => setShowCreate(true)} />}

      {(tab === 'pipeline' || tab === 'master') && <div className="space-y-4">
        {tab === 'pipeline' && <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {['Enquiry Received', 'GO / NO-GO', 'Proposal Preparation', 'Negotiation', 'Final Offer Submitted', 'Client Decision', 'LOI / Work Order / PO'].map(stage => {
            const count = activeTenders.filter(tender => tender.stage === stage).length;
            return <button key={stage} onClick={() => { setStageFilter(stage); setTab('master'); }} className="flex min-w-[130px] flex-1 items-center justify-between gap-2 border-l-2 border-emerald-600 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 hover:bg-emerald-50"><span>{stage}</span><b className="text-slate-900">{count}</b></button>;
          })}
        </div>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className={`${inputClass} pl-9`} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search client, PVT ID, reference or scope" /></div>
          <select className={`${inputClass} sm:w-72`} value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="ALL">All lifecycle stages</option>{STAGES.map(stage => <option key={stage}>{stage}</option>)}</select>
        </div>
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Tender / client', 'Category · location', 'Value · margin', 'Proposal due', 'Stage', 'Probability'].map(label => <th className="px-3 py-3 font-bold" key={label}>{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map(tender => <tr key={tender.id} onClick={() => { setSelectedId(tender.id); if (tab === 'pipeline') setTab('master'); }} className="cursor-pointer hover:bg-emerald-50/50">
              <td className="px-3 py-3"><span className="font-mono text-[10px] text-emerald-800">{tender.id}</span><div className="font-semibold text-slate-900">{tender.client_name}</div><div className="text-xs text-slate-500">{tender.enquiry_reference || 'No RFP reference'}</div></td>
              <td className="px-3 py-3 text-xs text-slate-600">{tender.client_category}<div>{tender.location || 'Location pending'}</div></td>
              <td className="px-3 py-3 font-semibold">{money(tender.estimated_contract_value)}<div className={`text-xs ${tender.proposed_margin < tender.minimum_margin && tender.minimum_margin > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{tender.proposed_margin}% / {tender.minimum_margin}% min margin</div></td>
              <td className="px-3 py-3 text-xs text-slate-600">{tender.proposal_due_date || 'Not set'}</td><td className="px-3 py-3"><span className="inline-flex rounded-sm bg-slate-100 px-2 py-1 text-xs font-medium">{tender.stage}</span></td><td className="px-3 py-3 text-xs font-semibold">{tender.probability}%</td>
            </tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-12 text-center text-sm text-slate-500">No private tenders match these filters.</td></tr>}</tbody>
          </table>
        </div>
      </div>}

      {tab === 'master' && selected && <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div><div className="font-mono text-xs font-bold text-emerald-800">{selected.id} · {selected.enquiry_reference || 'No reference'}</div><h3 className="mt-1 text-xl font-bold">{selected.client_name}{selected.parent_company ? ` · ${selected.parent_company}` : ''}</h3><p className="mt-1 text-sm text-slate-500">{selected.client_category} · {selected.location || 'Location pending'} · {selected.enquiry_source}</p></div>
            <select className={`${inputClass} min-w-64`} aria-label="Tender lifecycle stage" value={selected.stage} onChange={event => advanceStage(selected, event.target.value as PrivateTenderStage)}>{STAGES.map(stage => <option key={stage}>{stage}</option>)}</select>
          </div>
          {selected.proposed_margin < selected.minimum_margin && selected.minimum_margin > 0 && <div className="flex items-start gap-2 border-l-4 border-rose-600 bg-rose-50 p-3 text-sm text-rose-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Margin guard:</b> Proposed margin ({selected.proposed_margin}%) is below the approved minimum ({selected.minimum_margin}%). GM / CEO approval is required before final offer submission.</span></div>}
          <div className="grid gap-x-6 gap-y-4 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-3">{[
            ['Scope of work', selected.scope_of_work || 'Not provided'], ['Contract period', selected.contract_period || 'Not set'], ['Enquiry date', selected.enquiry_date || 'Not set'],
            ['Site visit', selected.site_visit_date || 'Not scheduled'], ['Proposal due', selected.proposal_due_date || 'Not set'], ['Presentation', selected.presentation_date || 'Not required'],
            ['Expected decision', selected.expected_decision_date || 'Not set'], ['Expected start', selected.expected_start_date || 'Not set'], ['Pricing model', selected.pricing_model],
            ['Payment terms', `${selected.payment_terms || 'Not set'} · ${selected.credit_period_days} day credit`], ['Deposit / PBG', selected.security_deposit_requested || 'Not requested'],
            ['Escalation clause', selected.price_escalation_clause || 'Not specified'], ['Competitors', selected.competitors || 'Unknown'], ['Decision maker', selected.decision_maker || 'Not identified'],
            ['Client SPOC', selected.client_spoc || 'Not assigned'], ['Relationship', `${selected.relationship_status} · ${selected.previous_business_history || 'No history logged'}`],
            ['Vendor registration', selected.vendor_registration_status], ['NDA', selected.nda_status], ['Business owner', selected.business_owner],
            ['Proposal owner', selected.proposal_owner], ['Procurement executive', selected.procurement_executive || 'Unassigned'], ['Operations / Finance / HR', `${selected.operations_spoc || '—'} / ${selected.finance_spoc || '—'} / ${selected.hr_spoc || '—'}`]
          ].map(([label, value]) => <div key={label}><div className="text-[10px] font-bold uppercase text-slate-400">{label}</div><div className="mt-1 break-words text-sm text-slate-800">{value}</div></div>)}</div>
          <div className="flex flex-wrap gap-2 text-xs"><span className="border border-slate-200 px-2 py-1">GM · {selected.gm_approval}</span><span className="border border-slate-200 px-2 py-1">CEO · {selected.ceo_approval}</span><span className="border border-slate-200 px-2 py-1">GO / NO-GO · {selected.go_no_go}</span></div>
          <section className="space-y-4 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div><h4 className="text-sm font-bold">Departmental Considerations</h4><p className="mt-1 text-xs text-slate-500">Mark each client-specific HR, Finance, and Operations check when reviewed.</p></div>
              <span className="text-xs text-slate-500">{PRIVATE_REVIEW_CONSIDERATIONS.flatMap(group => group.items).filter(item => selected.review_considerations?.[item.id]).length} / {PRIVATE_REVIEW_CONSIDERATIONS.flatMap(group => group.items).length} reviewed</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {PRIVATE_REVIEW_CONSIDERATIONS.map(group => (
                <section key={group.department} className="space-y-2">
                  <h5 className="text-xs font-bold uppercase text-emerald-800">{group.department}</h5>
                  {group.items.map(item => (
                    <label key={item.id} className="flex cursor-pointer items-start gap-2 border border-slate-100 p-2.5 text-xs text-slate-700 hover:bg-slate-50">
                      <input type="checkbox" checked={!!selected.review_considerations?.[item.id]} onChange={() => toggleReviewConsideration(item.id)} className="mt-0.5 accent-emerald-700" />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </section>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-4 border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <h4 className="text-sm font-bold">Commercial guardrails</h4><div className="text-2xl font-bold">{money(selected.estimated_contract_value)}</div><div className="text-xs text-slate-500">{selected.pricing_model} · {selected.contract_period || 'Contract term pending'}</div>
          <label className={labelClass}>Proposed margin (%)<input className={inputClass} type="number" min="0" max="100" value={selected.proposed_margin} onChange={event => updateTender(selected.id, tender => ({ ...tender, proposed_margin: Number(event.target.value) }))} /></label>
          <label className={labelClass}>Minimum acceptable margin (%)<input className={inputClass} type="number" min="0" max="100" value={selected.minimum_margin} onChange={event => updateTender(selected.id, tender => ({ ...tender, minimum_margin: Number(event.target.value) }))} /></label>
          <label className={labelClass}>Win probability (%)<input className={inputClass} type="number" min="0" max="100" value={selected.probability} onChange={event => updateTender(selected.id, tender => ({ ...tender, probability: Number(event.target.value) }))} /></label>
          <label className={labelClass}>Go / no-go<select className={inputClass} value={selected.go_no_go} onChange={event => {
            const verdict = event.target.value as PrivateTender['go_no_go'];
            if (verdict === 'GO' && selected.finance_review !== 'Cleared') {
              window.alert('Finance must clear the client credit review before a GO decision.');
              return;
            }
            updateTender(selected.id, tender => ({ ...tender, go_no_go: verdict }));
          }}><option>Pending</option><option>GO</option><option>NO-GO</option></select></label>
          <div className="grid grid-cols-2 gap-2"><button onClick={() => updateTender(selected.id, tender => ({ ...tender, gm_approval: tender.gm_approval === 'Approved' ? 'Pending' : 'Approved' }))} className="border border-slate-200 px-2 py-2 text-xs font-semibold hover:bg-slate-50">GM {selected.gm_approval === 'Approved' ? 'approved' : 'approval'}</button><button onClick={() => updateTender(selected.id, tender => ({ ...tender, ceo_approval: tender.ceo_approval === 'Approved' ? 'Pending' : 'Approved' }))} className="border border-slate-200 px-2 py-2 text-xs font-semibold hover:bg-slate-50">CEO {selected.ceo_approval === 'Approved' ? 'approved' : 'approval'}</button></div>
        </aside>
      </div>}

      {tab === 'negotiations' && selected && <section className="space-y-4">
        <form onSubmit={addNegotiation} className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-2 lg:grid-cols-4"><Field label="Date"><input className={inputClass} type="date" value={negotiationDraft.date} onChange={event => setNegotiationDraft({ ...negotiationDraft, date: event.target.value })} /></Field><Field label="Client ask"><input required className={inputClass} value={negotiationDraft.client_ask} onChange={event => setNegotiationDraft({ ...negotiationDraft, client_ask: event.target.value })} /></Field><Field label="Our offer"><input className={inputClass} value={negotiationDraft.our_offer} onChange={event => setNegotiationDraft({ ...negotiationDraft, our_offer: event.target.value })} /></Field><Field label="Revised rate (INR)"><input className={inputClass} type="number" min="0" value={negotiationDraft.revised_rate} onChange={event => setNegotiationDraft({ ...negotiationDraft, revised_rate: Number(event.target.value) })} /></Field><Field label="Revised margin (%)"><input className={inputClass} type="number" min="0" max="100" value={negotiationDraft.revised_margin} onChange={event => setNegotiationDraft({ ...negotiationDraft, revised_margin: Number(event.target.value) })} /></Field><Field label="Outcome"><input className={inputClass} value={negotiationDraft.outcome} onChange={event => setNegotiationDraft({ ...negotiationDraft, outcome: event.target.value })} /></Field><div className="flex items-end"><button className="inline-flex w-full items-center justify-center gap-2 bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> Log negotiation</button></div></form>
        <div className="divide-y divide-slate-100">{selected.negotiations.map(record => <div key={record.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto]"><div><div className="text-xs font-bold uppercase text-emerald-800">Round {record.round} · {record.date} · {money(record.revised_rate)}</div><div className="mt-2 text-sm"><b>Client ask:</b> {record.client_ask}</div><div className="text-sm"><b>Our offer:</b> {record.our_offer}</div><div className="text-xs text-slate-500">Revised margin {record.revised_margin}% · {record.outcome || 'Outcome pending'} · Approval: {record.approval_taken}</div>{record.revised_margin < selected.minimum_margin && <div className="mt-1 text-xs font-bold text-rose-700">Below minimum margin: management approval required.</div>}</div>{record.approval_taken === 'Pending' && <div className="flex items-center gap-2"><button onClick={() => approveNegotiation(record, 'GM Approved')} className="border border-slate-200 px-2 py-1 text-xs font-semibold">Approve GM</button><button onClick={() => approveNegotiation(record, 'CEO Approved')} className="bg-slate-900 px-2 py-1 text-xs font-semibold text-white">Approve CEO</button></div>}</div>)}{!selected.negotiations.length && <p className="py-8 text-center text-sm text-slate-500">No negotiation rounds recorded for {selected.id}.</p>}</div>
      </section>}

      {tab === 'proposals' && selected && <section className="space-y-4"><form onSubmit={addProposalVersion} className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-2 lg:grid-cols-5"><Field label="Version"><input required className={inputClass} placeholder="v1" value={proposalDraft.version} onChange={event => setProposalDraft({ ...proposalDraft, version: event.target.value })} /></Field><Field label="Date"><input className={inputClass} type="date" value={proposalDraft.date} onChange={event => setProposalDraft({ ...proposalDraft, date: event.target.value })} /></Field><Field label="Offer value (INR)"><input className={inputClass} type="number" min="0" value={proposalDraft.offer_value} onChange={event => setProposalDraft({ ...proposalDraft, offer_value: Number(event.target.value) })} /></Field><Field label="Document URL"><input className={inputClass} type="url" value={proposalDraft.document_url} onChange={event => setProposalDraft({ ...proposalDraft, document_url: event.target.value })} /></Field><div className="flex items-end"><button className="w-full bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800">Add version</button></div><Field label="Version notes"><input className={inputClass} value={proposalDraft.notes} onChange={event => setProposalDraft({ ...proposalDraft, notes: event.target.value })} /></Field></form><div className="divide-y divide-slate-100">{selected.proposal_versions.map(version => <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><div className="font-bold">{version.version} · {version.date} · {money(version.offer_value)}</div><div className="text-xs text-slate-500">{version.notes || 'No notes'} · Approval: {version.approval}</div>{version.document_url && <a className="text-xs font-semibold text-emerald-800 underline" href={version.document_url} target="_blank" rel="noreferrer">Open proposal document</a>}</div>{version.approval === 'Pending' && <div className="flex gap-2">{(['GM Approved', 'CEO Approved'] as const).map(approval => <button key={approval} onClick={() => updateTender(selected.id, tender => ({ ...tender, proposal_versions: tender.proposal_versions.map(item => item.id === version.id ? { ...item, approval } : item) }))} className="border border-slate-200 px-2 py-1 text-xs font-semibold">{approval}</button>)}</div>}</div>)}{!selected.proposal_versions.length && <p className="py-8 text-center text-sm text-slate-500">Proposal versions and offer approvals will appear here.</p>}</div></section>}

      {tab === 'followups' && selected && <section className="space-y-4"><form onSubmit={addFollowUp} className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-2 lg:grid-cols-6"><Field label="Date"><input className={inputClass} type="date" value={followUpDraft.date} onChange={event => setFollowUpDraft({ ...followUpDraft, date: event.target.value })} /></Field><Field label="Contact type"><select className={inputClass} value={followUpDraft.type} onChange={event => setFollowUpDraft({ ...followUpDraft, type: event.target.value as PrivateTenderFollowUp['type'] })}>{['Meeting', 'Call', 'Presentation', 'Email'].map(type => <option key={type}>{type}</option>)}</select></Field><Field label="Summary"><input required className={inputClass} value={followUpDraft.summary} onChange={event => setFollowUpDraft({ ...followUpDraft, summary: event.target.value })} /></Field><Field label="Next action"><input className={inputClass} value={followUpDraft.next_action} onChange={event => setFollowUpDraft({ ...followUpDraft, next_action: event.target.value })} /></Field><Field label="Action date"><input className={inputClass} type="date" value={followUpDraft.next_action_date} onChange={event => setFollowUpDraft({ ...followUpDraft, next_action_date: event.target.value })} /></Field><div className="flex items-end"><button className="w-full bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800">Log contact</button></div></form><div className="divide-y divide-slate-100">{selected.follow_ups.map(item => <div key={item.id} className="grid gap-2 py-3 sm:grid-cols-[140px_130px_1fr_1fr]"><div className="text-xs font-bold text-emerald-800">{item.date} · {item.type}</div><div className="text-sm">{item.summary}</div><div className="text-sm text-slate-600">Next: {item.next_action || 'No action set'}</div><div className="text-xs text-slate-500">Due {item.next_action_date || 'Not dated'}</div></div>)}{!selected.follow_ups.length && <p className="py-8 text-center text-sm text-slate-500">No client contacts logged.</p>}</div></section>}

      {tab === 'credit' && <section className="space-y-5"><div className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-950"><Banknote className="mt-0.5 h-5 w-5 shrink-0" /><p>Finance credit standing and payment history must be reviewed before a private enquiry can receive a GO decision.</p></div><div className="overflow-x-auto border-y border-slate-200"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Client', 'Value / credit', 'Standing', 'Finance clearance', 'Payment history', 'Action'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{tenders.map(tender => <tr key={tender.id}><td className="px-3 py-3"><button onClick={() => setSelectedId(tender.id)} className="text-left font-semibold text-emerald-800 hover:underline">{tender.client_name}</button><div className="font-mono text-[10px] text-slate-500">{tender.id}</div></td><td className="px-3 py-3">{money(tender.estimated_contract_value)}<div className="text-xs text-slate-500">{tender.credit_period_days} days</div></td><td className="px-3 py-3"><select className="border border-slate-200 bg-white px-2 py-1 text-xs" value={tender.credit_standing} onChange={event => updateTender(tender.id, item => ({ ...item, credit_standing: event.target.value as PrivateTender['credit_standing'] }))}>{['Not Reviewed', 'Good', 'Watch', 'High Risk'].map(value => <option key={value}>{value}</option>)}</select></td><td className="px-3 py-3"><select className="border border-slate-200 bg-white px-2 py-1 text-xs" value={tender.finance_review} onChange={event => updateTender(tender.id, item => ({ ...item, finance_review: event.target.value as PrivateTender['finance_review'] }))}>{['Pending', 'Cleared', 'Hold'].map(value => <option key={value}>{value}</option>)}</select></td><td className="px-3 py-3"><input className="w-48 border border-slate-200 px-2 py-1 text-xs" value={tender.payment_history} placeholder="Add payment history" onChange={event => updateTender(tender.id, item => ({ ...item, payment_history: event.target.value }))} /></td><td className="px-3 py-3"><input className="w-48 border border-slate-200 px-2 py-1 text-xs" value={tender.credit_notes} placeholder="Finance notes" onChange={event => updateTender(tender.id, item => ({ ...item, credit_notes: event.target.value }))} /></td></tr>)}</tbody></table>{!tenders.length && <p className="py-8 text-center text-sm text-slate-500">Private enquiries will appear here for finance review.</p>}</div></section>}

      {showCreate && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowCreate(false); }}><section role="dialog" aria-modal="true" aria-labelledby="private-tender-form-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><div><div className="text-[10px] font-bold uppercase text-emerald-700">Private tender master</div><h3 id="private-tender-form-title" className="text-lg font-bold">Register an enquiry</h3></div><button onClick={() => setShowCreate(false)} className="p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div><form onSubmit={createTender} className="space-y-5 p-5">
        <FormSection title="Tender identification"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectField('Client category', 'client_category', ['Corporate', 'Industrial', 'Commercial', 'Institutional', 'Residential', 'Individual'])}{textField('Client name', 'client_name', true)}{textField('Group / parent company', 'parent_company')}{textField('Enquiry / RFP reference', 'enquiry_reference')}{selectField('Enquiry source', 'enquiry_source', ['Direct', 'Referral', 'Business development', 'Existing client', 'Portal'])}{textField('Location', 'location')}{numberField('Estimated contract value (INR)', 'estimated_contract_value')}{textField('Contract period', 'contract_period')}<label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>Scope of work<textarea className={inputClass} rows={2} value={String(draft.scope_of_work || '')} onChange={event => setDraft(prev => ({ ...prev, scope_of_work: event.target.value }))} /></label></div></FormSection>
        <FormSection title="Dates"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(['Enquiry date', 'Site visit date', 'Proposal due date', 'Presentation date', 'Expected decision date', 'Expected start date'] as const).map((label, index) => { const key = (['enquiry_date', 'site_visit_date', 'proposal_due_date', 'presentation_date', 'expected_decision_date', 'expected_start_date'] as const)[index]; return <label className={labelClass} key={key}>{label}<input className={inputClass} type="date" value={String(draft[key] || '')} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} /></label>; })}</div></FormSection>
        <FormSection title="Commercial and relationship"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectField('Pricing model', 'pricing_model', ['Fixed', 'Per head', 'Per unit', 'Cost-plus', 'Management fee'])}{numberField('Proposed margin (%)', 'proposed_margin')}{numberField('Minimum acceptable margin (%)', 'minimum_margin')}{textField('Payment terms', 'payment_terms')}{numberField('Credit period (days)', 'credit_period_days')}{textField('Security deposit requested', 'security_deposit_requested')}{textField('Price escalation / wage revision clause', 'price_escalation_clause')}{textField('Known competitors', 'competitors')}{textField('Client decision maker', 'decision_maker')}{textField('Client SPOC', 'client_spoc')}{selectField('Relationship status', 'relationship_status', ['New', 'Existing', 'Lapsed'])}{selectField('NDA status', 'nda_status', ['Required', 'Not Required', 'Pending', 'Signed'])}{textField('Previous business history', 'previous_business_history')}{textField('Empanelment / vendor registration', 'vendor_registration_status')}</div></FormSection>
        <FormSection title="Responsibility"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{textField('Business owner', 'business_owner')}{textField('Proposal owner', 'proposal_owner')}{textField('Procurement executive', 'procurement_executive')}{textField('Operations SPOC', 'operations_spoc')}{textField('Finance SPOC', 'finance_spoc')}{textField('HR SPOC', 'hr_spoc')}</div></FormSection>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={() => setShowCreate(false)} className="border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"><FilePlus2 className="h-4 w-4" /> Create PVT record</button></div>
      </form></section></div>}
      <footer className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-400"><span>Private Tender Management · {currentRole}</span><span>{tenders.length} PVT records</span></footer>
    </section>
  );
};

function Metric({ icon: Icon, label, value, detail, alert = false }: { icon: React.ElementType; label: string; value: string; detail: string; alert?: boolean }) {
  return <div className="border-y border-slate-200 px-3 py-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500"><Icon className={`h-4 w-4 ${alert ? 'text-rose-700' : 'text-emerald-700'}`} />{label}</div><div className={`mt-2 text-xl font-bold ${alert ? 'text-rose-800' : 'text-slate-950'}`}>{value}</div><div className="mt-0.5 text-[10px] text-slate-500">{detail}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={labelClass}>{label}{children}</label>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h4 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase text-slate-700">{title}</h4>{children}</section>;
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="border-y border-slate-200 py-12 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">Select or register a private enquiry to continue.</p><button onClick={onCreate} className="mt-3 text-sm font-bold text-emerald-800 hover:underline">Create private enquiry</button></div>;
}