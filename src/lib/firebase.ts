import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
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
  serverTimestamp
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

// Initialize Firestore with configured custom database ID
export const db = getFirestore(
  app, 
  firebaseConfigData.firestoreDatabaseId || '(default)'
);

export const LOAN_COLLECTION = 'loan_applications';
export const AUDIT_COLLECTION = 'audit_logs';

/**
 * Validate connection to Firestore as required by Firebase skill guidelines
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, falling back to cached persistence.');
      return false;
    }
    // Any other response (like doc not found) confirms the server is reachable
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
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save new loan application to Firestore
 */
export async function saveApplicationToFirestore(application: LoanApplication): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, application.id);
  await setDoc(docRef, {
    ...application,
    updatedAt: new Date().toISOString()
  });

  // Log audit trail
  await recordAuditLog({
    action: 'PENGAJUAN_BARU',
    operator: application.applicant.fullName,
    applicationId: application.id,
    notes: `Pengajuan pinjaman baru Rp ${application.loan.loanAmount.toLocaleString('id-ID')} dengan nomor ${application.contractNumber}`
  });
}

/**
 * Update application status in Firestore (e.g. APPROVED, REJECTED)
 */
export async function updateApplicationStatusInFirestore(
  id: string,
  newStatus: ApplicationStatus,
  notes?: string,
  verifierName?: string
): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, id);
  const now = new Date().toISOString();
  
  await updateDoc(docRef, {
    status: newStatus,
    verificationNotes: notes || '',
    verifiedBy: verifierName || 'Verifikator Berkas',
    verifiedAt: now,
    updatedAt: now
  });

  // Log audit trail
  await recordAuditLog({
    action: newStatus === 'APPROVED' ? 'PERSETUJUAN_PINJAMAN' : 'PENOLAKAN_PINJAMAN',
    operator: verifierName || 'Verifikator Berkas',
    applicationId: id,
    notes: `Status diubah menjadi ${newStatus}. Catatan: ${notes || '-'}`
  });
}

/**
 * Update application loan terms (plafon, tenor, angsuran) and status in Firestore
 */
export async function updateApplicationLoanInFirestore(
  id: string,
  updatedLoan: LoanTerms,
  newStatus?: ApplicationStatus,
  notes?: string,
  verifierName?: string
): Promise<void> {
  const docRef = doc(db, LOAN_COLLECTION, id);
  const now = new Date().toISOString();
  
  const updatePayload: Record<string, any> = {
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

  await updateDoc(docRef, updatePayload);

  // Log audit trail
  await recordAuditLog({
    action: newStatus === 'APPROVED' ? 'UBAH_DAN_SETUJUI_PINJAMAN' : 'UBAH_KETENTUAN_PINJAMAN',
    operator: verifierName || 'Verifikator Berkas',
    applicationId: id,
    notes: `Plafon pinjaman disesuaikan: Rp ${updatedLoan.loanAmount.toLocaleString('id-ID')}, Tenor ${updatedLoan.tenorWeeks} mgg, Angsuran Rp ${updatedLoan.weeklyInstallment.toLocaleString('id-ID')}/mgg.${newStatus ? ` Status: ${newStatus}.` : ''} Catatan: ${notes || '-'}`
  });
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
        await setDoc(doc(db, LOAN_COLLECTION, appItem.id), appItem);
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
