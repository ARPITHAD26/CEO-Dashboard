import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { AppState, Role, SubRoleDefinition } from '../types';

// Simple mapping of AppState keys to Firestore collection names
const COLLECTIONS = {
  purchaseRequests: 'purchaseRequests',
  vendors: 'vendors',
  invoices: 'invoices',
  expenses: 'expenses',
  leads: 'leads',
  clients: 'clients',
  employees: 'employees',
  attendance: 'attendance',
  leaves: 'leaves',
  disciplinaryCases: 'disciplinaryCases',
  sites: 'sites',
  complaints: 'complaints',
  incidents: 'incidents',
  trainings: 'trainings',
  tasks: 'tasks',
  auditLogs: 'auditLogs',
  notifications: 'notifications',
  alerts: 'alerts',
  itApplications: 'itApplications',
  itServerNodes: 'itServerNodes',
  itTickets: 'itTickets',
  itSecurityChecks: 'itSecurityChecks',
  tenders: 'tenders',
  governmentTenders: 'governmentTenders',
  privateTenders: 'privateTenders',
  tenderGoNoGos: 'tenderGoNoGos',
  tenderCorrigendums: 'tenderCorrigendums',
  tenderQueries: 'tenderQueries',
  contracts: 'contracts',
  clientEscalations: 'clientEscalations',
  emdRefunds: 'emdRefunds',
  pbgGuarantees: 'pbgGuarantees',
  indents: 'indents',
  vendorQuotations: 'vendorQuotations',
  comparativeStatements: 'comparativeStatements',
  purchaseOrders: 'purchaseOrders',
  stockItems: 'stockItems',
  stockTransactions: 'stockTransactions',
  grnRecords: 'grnRecords',
  stockIssues: 'stockIssues',
  uniformAllocations: 'uniformAllocations',
  machineryAssets: 'machineryAssets',
  dailyProcurementTasks: 'dailyProcurementTasks',
  eodReviews: 'eodReviews',
  crmLeads: 'crmLeads',
  crmRequirements: 'crmRequirements',
  crmFollowUps: 'crmFollowUps',
  crmActivities: 'crmActivities',
  crmVisits: 'crmVisits',
  crmMeetings: 'crmMeetings',
  crmQuotations: 'crmQuotations',
  crmDars: 'crmDars',
  crmClientMasters: 'crmClientMasters',
  crmTeamStatuses: 'crmTeamStatuses',
  hrWorkforceRecords: 'hrWorkforceRecords',
  hrRequisitions: 'hrRequisitions',
  hrBillingSupports: 'hrBillingSupports',
  hrClientComplaints: 'hrClientComplaints',
  hrSiteVisits: 'hrSiteVisits',
  hrUniformIdChecks: 'hrUniformIdChecks',
  hrStatutoryRecords: 'hrStatutoryRecords',
  hrDataDefinitions: 'hrDataDefinitions',
  opsAttendanceRecords: 'opsAttendanceRecords',
  opsOvertimeRecords: 'opsOvertimeRecords',
  opsSiteInspections: 'opsSiteInspections',
  opsClientComplaints: 'opsClientComplaints',
  opsSlaCompliances: 'opsSlaCompliances',
  opsUniformAvailabilities: 'opsUniformAvailabilities',
  opsIdCardCompliances: 'opsIdCardCompliances',
  opsEquipmentRecords: 'opsEquipmentRecords',
  opsAttentionItems: 'opsAttentionItems',
  opsDataDefinitions: 'opsDataDefinitions'
};

// Check if MongoDB is connected via the server API
let isMongoAvailable: boolean | null = null;

export async function checkDatabaseEngine(): Promise<'MongoDB' | 'Firestore'> {
  if (isMongoAvailable !== null) {
    return isMongoAvailable ? 'MongoDB' : 'Firestore';
  }
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      const json = await res.json();
      isMongoAvailable = json.connected === true;
      if (isMongoAvailable) {
        console.log('[Data Storage] Using VPS MongoDB Database backend.');
        return 'MongoDB';
      }
    }
  } catch {
    isMongoAvailable = false;
  }
  isMongoAvailable = false;
  console.log('[Data Storage] Using Firebase Firestore Database backend.');
  return 'Firestore';
}

// Fetch entire application state (Dual support: MongoDB or Firestore)
export async function fetchAppStateFromFirestore(): Promise<AppState> {
  const engine = await checkDatabaseEngine();

  // If MongoDB is available on the VPS, load state from MongoDB!
  if (engine === 'MongoDB') {
    try {
      const res = await fetch('/api/db/state');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const st = json.data;
          return {
            purchaseRequests: st.purchaseRequests || [],
            vendors: st.vendors || [],
            invoices: st.invoices || [],
            expenses: st.expenses || [],
            leads: st.leads || [],
            clients: st.clients || [],
            employees: st.employees || [],
            attendance: st.attendance || [],
            leaves: st.leaves || [],
            disciplinaryCases: st.disciplinaryCases || [],
            sites: st.sites || [],
            complaints: st.complaints || [],
            incidents: st.incidents || [],
            trainings: st.trainings || [],
            tasks: st.tasks || [],
            auditLogs: st.auditLogs || [],
            notifications: st.notifications || [],
            alerts: st.alerts || [],
            itApplications: st.itApplications || [],
            itServerNodes: st.itServerNodes || [],
            itTickets: st.itTickets || [],
            itSecurityChecks: st.itSecurityChecks || [],
            tenders: st.tenders || [],
            privateTenders: st.privateTenders || [],
            tenderGoNoGos: st.tenderGoNoGos || [],
            tenderCorrigendums: st.tenderCorrigendums || [],
            tenderQueries: st.tenderQueries || [],
            contracts: st.contracts || [],
            clientEscalations: st.clientEscalations || [],
            emdRefunds: st.emdRefunds || [],
            pbgGuarantees: st.pbgGuarantees || [],
            indents: st.indents || [],
            vendorQuotations: st.vendorQuotations || [],
            comparativeStatements: st.comparativeStatements || [],
            purchaseOrders: st.purchaseOrders || [],
            stockItems: st.stockItems || [],
            stockTransactions: st.stockTransactions || [],
            grnRecords: st.grnRecords || [],
            stockIssues: st.stockIssues || [],
            uniformAllocations: st.uniformAllocations || [],
            machineryAssets: st.machineryAssets || [],
            dailyProcurementTasks: st.dailyProcurementTasks || [],
            eodReviews: st.eodReviews || [],
            crmLeads: st.crmLeads || [],
            crmRequirements: st.crmRequirements || [],
            crmFollowUps: st.crmFollowUps || [],
            crmActivities: st.crmActivities || [],
            crmVisits: st.crmVisits || [],
            crmMeetings: st.crmMeetings || [],
            crmQuotations: st.crmQuotations || [],
            crmDars: st.crmDars || [],
            crmClientMasters: st.crmClientMasters || [],
            crmTeamStatuses: st.crmTeamStatuses || []
          } as AppState;
        }
      }
    } catch (err) {
      console.warn('MongoDB fetch failed, falling back to Firestore/local:', err);
    }
  }

  // Firestore standard flow
  const state: Partial<AppState> = {};

  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data() });
      });
      state[key as keyof AppState] = items as any;
    } catch (error) {
      console.error(`Error fetching collection ${collectionName} from Firestore:`, error);
      state[key as keyof AppState] = [] as any;
    }
  }

  return {
    purchaseRequests: state.purchaseRequests || [],
    vendors: state.vendors || [],
    invoices: state.invoices || [],
    expenses: state.expenses || [],
    leads: state.leads || [],
    clients: state.clients || [],
    employees: state.employees || [],
    attendance: state.attendance || [],
    leaves: state.leaves || [],
    disciplinaryCases: state.disciplinaryCases || [],
    sites: state.sites || [],
    complaints: state.complaints || [],
    incidents: state.incidents || [],
    trainings: state.trainings || [],
    tasks: state.tasks || [],
    auditLogs: state.auditLogs || [],
    notifications: state.notifications || [],
    alerts: state.alerts || [],
    itApplications: state.itApplications || [],
    itServerNodes: state.itServerNodes || [],
    itTickets: state.itTickets || [],
    itSecurityChecks: state.itSecurityChecks || [],
    tenders: state.tenders || [],
    tenderGoNoGos: state.tenderGoNoGos || [],
    tenderCorrigendums: state.tenderCorrigendums || [],
    tenderQueries: state.tenderQueries || [],
    contracts: state.contracts || [],
    clientEscalations: state.clientEscalations || [],
    emdRefunds: state.emdRefunds || [],
    pbgGuarantees: state.pbgGuarantees || [],
    indents: state.indents || [],
    vendorQuotations: state.vendorQuotations || [],
    comparativeStatements: state.comparativeStatements || [],
    purchaseOrders: state.purchaseOrders || [],
    stockItems: state.stockItems || [],
    stockTransactions: state.stockTransactions || [],
    grnRecords: state.grnRecords || [],
    stockIssues: state.stockIssues || [],
    uniformAllocations: state.uniformAllocations || [],
    machineryAssets: state.machineryAssets || [],
    dailyProcurementTasks: state.dailyProcurementTasks || [],
    eodReviews: state.eodReviews || [],
    crmLeads: state.crmLeads || [],
    crmRequirements: state.crmRequirements || [],
    crmFollowUps: state.crmFollowUps || [],
    crmActivities: state.crmActivities || [],
    crmVisits: state.crmVisits || [],
    crmMeetings: state.crmMeetings || [],
    crmQuotations: state.crmQuotations || [],
    crmDars: state.crmDars || [],
    crmClientMasters: state.crmClientMasters || [],
    crmTeamStatuses: state.crmTeamStatuses || [],
    hrWorkforceRecords: state.hrWorkforceRecords || [],
    hrRequisitions: state.hrRequisitions || [],
    hrBillingSupports: state.hrBillingSupports || [],
    hrClientComplaints: state.hrClientComplaints || [],
    hrSiteVisits: state.hrSiteVisits || [],
    hrUniformIdChecks: state.hrUniformIdChecks || [],
    hrStatutoryRecords: state.hrStatutoryRecords || [],
    hrDataDefinitions: state.hrDataDefinitions || [],
    opsAttendanceRecords: state.opsAttendanceRecords || [],
    opsOvertimeRecords: state.opsOvertimeRecords || [],
    opsSiteInspections: state.opsSiteInspections || [],
    opsClientComplaints: state.opsClientComplaints || [],
    opsSlaCompliances: state.opsSlaCompliances || [],
    opsUniformAvailabilities: state.opsUniformAvailabilities || [],
    opsIdCardCompliances: state.opsIdCardCompliances || [],
    opsEquipmentRecords: state.opsEquipmentRecords || [],
    opsAttentionItems: state.opsAttentionItems || [],
    opsDataDefinitions: state.opsDataDefinitions || []
  } as AppState;
}

// Save a single record/entity (Dual support: MongoDB & Firestore)
export async function saveEntityToFirestore(collectionName: keyof typeof COLLECTIONS, id: string, data: any) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch(`/api/db/${collectionName}/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return;
    } catch (err) {
      console.warn('Failed saving entity to MongoDB:', err);
    }
  }

  try {
    const docRef = doc(db, COLLECTIONS[collectionName], id);
    await setDoc(docRef, data);
  } catch (error) {
    console.error(`Error saving entity to ${collectionName}:`, error);
  }
}

// Delete a single record/entity
export async function deleteEntityFromFirestore(collectionName: keyof typeof COLLECTIONS, id: string) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch(`/api/db/${collectionName}/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return;
    } catch (err) {
      console.warn('Failed deleting entity from MongoDB:', err);
    }
  }

  try {
    const docRef = doc(db, COLLECTIONS[collectionName], id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting entity from ${collectionName}:`, error);
  }
}

// Reset / Save entire state in Database
export async function saveWholeStateToFirestore(state: AppState) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch('/api/db/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      return;
    } catch (err) {
      console.warn('Failed saving whole state to MongoDB:', err);
    }
  }

  // Firestore batch commit
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    try {
      const items = (state[key as keyof AppState] || []) as any[];
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      const newItemsMap = new Map(items.map(item => {
        const id = item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return [id, { ...item, id }];
      }));

      let batch = writeBatch(db);
      let count = 0;
      
      for (const docSnap of snapshot.docs) {
        if (!newItemsMap.has(docSnap.id)) {
          batch.delete(docSnap.ref);
          count++;
          if (count === 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
      }
      
      for (const [docId, item] of newItemsMap.entries()) {
        const docRef = doc(db, collectionName, docId);
        batch.set(docRef, item);
        count++;
        if (count === 400) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error(`Error saving whole state collection ${collectionName}:`, error);
    }
  }
}

// Sub-Roles APIs
export async function fetchSubRoles(): Promise<SubRoleDefinition[]> {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      const res = await fetch('/api/db/sub_roles');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch sub-roles from MongoDB:', err);
    }
  }

  try {
    const colRef = collection(db, 'sub_roles');
    const snapshot = await getDocs(colRef);
    const subRoles: SubRoleDefinition[] = [];
    snapshot.forEach((docSnap) => {
      subRoles.push(docSnap.data() as SubRoleDefinition);
    });
    return subRoles;
  } catch (error) {
    console.error('Error fetching sub-roles:', error);
    return [];
  }
}

export async function saveSubRole(subRole: SubRoleDefinition) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch('/api/db/sub_roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subRole)
      });
      return;
    } catch (err) {
      console.warn('Failed to save sub-role in MongoDB:', err);
    }
  }

  try {
    const docRef = doc(db, 'sub_roles', subRole.id);
    await setDoc(docRef, subRole);
  } catch (error) {
    console.error(`Error saving sub-role ${subRole.id}:`, error);
  }
}

export async function deleteSubRole(id: string) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch(`/api/db/sub_roles/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return;
    } catch (err) {
      console.warn('Failed to delete sub-role from MongoDB:', err);
    }
  }

  try {
    const docRef = doc(db, 'sub_roles', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting sub-role ${id}:`, error);
  }
}

// Role Mappings APIs
export interface RoleMapping {
  email: string;
  name: string;
  role: Role | 'Admin';
  subRoleId?: string;
  subRoleName?: string;
  allowedSubViews?: string[];
}

export async function fetchRoleMappings(): Promise<RoleMapping[]> {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      const res = await fetch('/api/db/role_mappings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch role mappings from MongoDB:', err);
    }
  }

  try {
    const colRef = collection(db, 'role_mappings');
    const snapshot = await getDocs(colRef);
    const mappings: RoleMapping[] = [];
    snapshot.forEach((docSnap) => {
      mappings.push(docSnap.data() as RoleMapping);
    });
    return mappings;
  } catch (error) {
    console.error('Error fetching role mappings:', error);
    return [];
  }
}

export async function saveRoleMapping(
  email: string, 
  name: string, 
  role: Role | 'Admin',
  subRoleId?: string,
  subRoleName?: string,
  allowedSubViews?: string[]
) {
  const engine = await checkDatabaseEngine();

  const payload: RoleMapping = {
    email: email.toLowerCase().trim(),
    name,
    role,
    ...(subRoleId ? { subRoleId } : {}),
    ...(subRoleName ? { subRoleName } : {}),
    ...(allowedSubViews && allowedSubViews.length > 0 ? { allowedSubViews } : {})
  };

  if (engine === 'MongoDB') {
    try {
      await fetch('/api/db/role_mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return;
    } catch (err) {
      console.warn('Failed to save role mapping in MongoDB:', err);
    }
  }

  try {
    const docId = email.toLowerCase().trim();
    const docRef = doc(db, 'role_mappings', docId);
    await setDoc(docRef, payload);
  } catch (error) {
    console.error(`Error saving role mapping for ${email}:`, error);
  }
}

export async function deleteRoleMapping(email: string) {
  const engine = await checkDatabaseEngine();

  if (engine === 'MongoDB') {
    try {
      await fetch(`/api/db/role_mappings/${encodeURIComponent(email.toLowerCase().trim())}`, {
        method: 'DELETE'
      });
      return;
    } catch (err) {
      console.warn('Failed to delete role mapping from MongoDB:', err);
    }
  }

  try {
    const docId = email.toLowerCase().trim();
    const docRef = doc(db, 'role_mappings', docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting role mapping for ${email}:`, error);
  }
}
