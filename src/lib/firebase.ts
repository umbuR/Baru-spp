import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  getDocFromServer, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  setLogLevel,
  type Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { LoanApplication, ApplicationStatus, LoanTerms } from '../types';

export const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Suppress excessive Firestore offline/poll warnings in dev/iframe environment
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// CRITICAL: Load database directly with firestoreDatabaseId as required by Firebase skill
export const db: Firestore = getFirestore(app, firebaseConfigData.firestoreDatabaseId);

export const LOAN_COLLECTION = 'loan_applications';
export const AUDIT_COLLECTION = 'audit_logs';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore as required by Firebase skill guidelines
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 3000)
    );
    // Use getDocs on test collection with timeout to avoid uncaught client offline errors
    await Promise.race([
      getDocs(collection(db, 'test')),
      timeoutPromise
    ]);
    return true;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCode = error?.code || '';
    if (
      errorMsg.includes('the client is offline') || 
      errorCode === 'unavailable' ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('timeout')
    ) {
      return false;
    }
    // Any other response confirms the server is reachable
    return true;
  }
}

/**
 * Real-time listener for loan applications in Firestore
 */
export function subscribeToLoanApplications(
  onData: (apps: LoanApplication[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, LOAN_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const items: LoanApplication[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as LoanApplication);
      });
      onData(items);
    },
    (err: any) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, LOAN_COLLECTION);
      } else {
        console.warn('Firestore subscription status:', err?.message || err);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Recursively remove `undefined` values from object or convert to null
 * because Firestore setDoc/updateDoc fails when any field is undefined.
 */
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefined(item)) as any;
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = cleanUndefined(value);
      }
    }
    return result as any;
  }
  return obj;
}

/**
 * Save new loan application to Firestore
 */
export async function saveApplicationToFirestore(application: LoanApplication): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, application.id);
  const cleanData = cleanUndefined({
    ...application,
    updatedAt: new Date().toISOString()
  });

  try {
    await setDoc(docRef, cleanData, { merge: true });
    // Log audit trail
    await recordAuditLog({
      action: 'PENGAJUAN_BARU',
      operator: application.applicant.fullName,
      applicationId: application.id,
      notes: `Pengajuan pinjaman baru Rp ${application.loan.loanAmount.toLocaleString('id-ID')} dengan nomor ${application.contractNumber}`
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, `${LOAN_COLLECTION}/${application.id}`);
    } else {
      console.warn('Simpan ke Firestore tertunda (offline/cache aktif):', err?.message || err);
    }
  }
}

/**
 * Update application status in Firestore (e.g. APPROVED, REJECTED)
 */
export async function updateApplicationStatusInFirestore(
  id: string,
  newStatus: ApplicationStatus,
  notes?: string,
  verifierName?: string,
  statusLogs?: any[]
): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, id);
  const now = new Date().toISOString();
  
  const payload = cleanUndefined({
    id,
    status: newStatus,
    verificationNotes: notes || '',
    verifiedBy: verifierName || 'Verifikator Berkas',
    verifiedAt: now,
    updatedAt: now,
    ...(statusLogs ? { statusLogs } : {})
  });

  try {
    await setDoc(docRef, payload, { merge: true });
    // Log audit trail
    await recordAuditLog({
      action: newStatus === 'APPROVED' ? 'PERSETUJUAN_PINJAMAN' : 'PENOLAKAN_PINJAMAN',
      operator: verifierName || 'Verifikator Berkas',
      applicationId: id,
      notes: `Status diubah menjadi ${newStatus}. Catatan: ${notes || '-'}`
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, `${LOAN_COLLECTION}/${id}`);
    } else {
      console.warn('Update status ke Firestore tertunda (offline/cache aktif):', err?.message || err);
    }
  }
}

/**
 * Update application loan terms (plafon, tenor, angsuran) and status in Firestore
 */
export async function updateApplicationLoanInFirestore(
  id: string,
  updatedLoan: LoanTerms,
  newStatus?: ApplicationStatus,
  notes?: string,
  verifierName?: string,
  statusLogs?: any[]
): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, id);
  const now = new Date().toISOString();
  
  const updatePayload: Record<string, any> = {
    id,
    loan: updatedLoan,
    updatedAt: now
  };

  if (newStatus) {
    updatePayload.status = newStatus;
  }
  if (notes !== undefined) {
    updatePayload.verificationNotes = notes;
  }
  if (verifierName) {
    updatePayload.verifiedBy = verifierName;
    updatePayload.verifiedAt = now;
  }
  if (statusLogs) {
    updatePayload.statusLogs = statusLogs;
  }

  try {
    await setDoc(docRef, cleanUndefined(updatePayload), { merge: true });
    // Log audit trail
    await recordAuditLog({
      action: newStatus === 'APPROVED' ? 'UBAH_DAN_SETUJUI_PINJAMAN' : 'UBAH_KETENTUAN_PINJAMAN',
      operator: verifierName || 'Verifikator Berkas',
      applicationId: id,
      notes: `Plafon pinjaman disesuaikan: Rp ${updatedLoan.loanAmount.toLocaleString('id-ID')}, Tenor ${updatedLoan.tenorWeeks} mgg, Angsuran Rp ${updatedLoan.weeklyInstallment.toLocaleString('id-ID')}/mgg.${newStatus ? ` Status: ${newStatus}.` : ''} Catatan: ${notes || '-'}`
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, `${LOAN_COLLECTION}/${id}`);
    } else {
      console.warn('Update plafon ke Firestore tertunda (offline/cache aktif):', err?.message || err);
    }
  }
}

/**
 * Seed initial sample applications to Firestore if collection is empty
 */
export async function seedInitialApplicationsIfEmpty(initialApps: LoanApplication[]): Promise<boolean> {
  try {
    const existingSnap = await getDocs(collection(db, LOAN_COLLECTION));
    if (existingSnap.empty) {
      console.log('Seeding initial loan applications to Firestore...');
      for (const appItem of initialApps) {
        await setDoc(doc(db, LOAN_COLLECTION, appItem.id), cleanUndefined(appItem), { merge: true });
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not seed initial applications:', err);
    return false;
  }
}

/**
 * Record an audit log entry in Firestore
 */
export async function recordAuditLog(log: {
  action: string;
  operator: string;
  applicationId?: string;
  notes?: string;
}): Promise<void> {
  try {
    const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logDoc = doc(db, AUDIT_COLLECTION, id);
    await setDoc(logDoc, {
      id,
      timestamp: new Date().toISOString(),
      ...log
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}
