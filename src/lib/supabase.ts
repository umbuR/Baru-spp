import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoanApplication, ApplicationStatus, LoanTerms, SuratSitaRecord, SitaStatus } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

const STORAGE_KEY_SUPABASE = 'pm_supabase_config';
const STORAGE_KEY_LOCAL_APPS = 'pm_supabase_cached_applications';
const STORAGE_KEY_LOCAL_SITA = 'pm_supabase_cached_surat_sita';

// Default Supabase project configuration (can be updated by user in UI or env vars)
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConfigured: parsed.isConfigured !== false && !parsed.url.includes('xyzcompany')
        };
      }
    }
  } catch (e) {
    console.warn('Gagal membaca konfigurasi Supabase dari localStorage:', e);
  }

  const hasEnv = (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return {
    url: defaultUrl,
    anonKey: defaultKey,
    isConfigured: !!hasEnv
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    const isReal = url.trim().length > 10 && anonKey.trim().length > 20 && !url.includes('xyzcompany');
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConfigured: isReal
    }));
    // Re-initialize client
    initSupabaseClient();
  } catch (e) {
    console.error('Gagal menyimpan konfigurasi Supabase:', e);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!clientInstance) {
    initSupabaseClient();
  }
  return clientInstance;
}

function initSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  try {
    if (config.url && config.anonKey) {
      clientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      return clientInstance;
    }
  } catch (e) {
    console.warn('Inisialisasi klien Supabase tertunda:', e);
  }
  clientInstance = null;
  return null;
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!client || !config.isConfigured) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi dengan URL & Anon Key aktif. Menggunakan mode penyimpanan lokal berkecepatan tinggi.'
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await client.from('loan_applications').select('id').limit(1);
    const latency = Date.now() - startTime;
    if (error) {
      // Table might not exist yet, or invalid key
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          ok: true,
          message: 'Terkoneksi ke Supabase! (Tabel loan_applications belum dibuat, gunakan tombol Buat Skema SQL di bawah)',
          latencyMs: latency
        };
      }
      return {
        ok: false,
        message: `Koneksi Supabase gagal: ${error.message}`
      };
    }
    return {
      ok: true,
      message: `Terhubung online ke Supabase PostgreSQL (${latency}ms)!`,
      latencyMs: latency
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Gagal menghubungi host Supabase: ${err?.message || err}`
    };
  }
}

/**
 * SQL Schema for Supabase PostgreSQL
 */
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- SKEMA DATABASE SUPABASE POSTGRESQL (PM MITRA SEJAHTERA BERSAMA)
-- Dijalankan pada Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ====================================================================

-- 1. TABEL PENGAJUAN & SURAT PERJANJIAN PINJAMAN
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id VARCHAR(64) PRIMARY KEY,
  contract_number VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  has_witness BOOLEAN DEFAULT TRUE,
  applicant JSONB NOT NULL,
  witness JSONB,
  loan JSONB NOT NULL,
  collateral JSONB,
  location_tag JSONB,
  documents JSONB NOT NULL,
  biometric JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  verified_by VARCHAR(128),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  status_logs JSONB DEFAULT '[]'::jsonb
);

-- Indeks pencarian cepat
CREATE INDEX IF NOT EXISTS idx_loan_contract ON public.loan_applications(contract_number);
CREATE INDEX IF NOT EXISTS idx_loan_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_created ON public.loan_applications(created_at DESC);

-- 2. TABEL SURAT PERINTAH & BERITA ACARA SITA BARANG
CREATE TABLE IF NOT EXISTS public.surat_sita (
  id VARCHAR(64) PRIMARY KEY,
  nomor_surat VARCHAR(128) UNIQUE NOT NULL,
  application_id VARCHAR(64) REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  contract_number VARCHAR(128) NOT NULL,
  nasabah_name VARCHAR(256) NOT NULL,
  nasabah_nik VARCHAR(32) NOT NULL,
  nasabah_phone VARCHAR(32),
  nasabah_address TEXT,
  collateral_type VARCHAR(64),
  collateral_title VARCHAR(256) NOT NULL,
  collateral_doc_number VARCHAR(128),
  collateral_estimated_value NUMERIC(15, 2) DEFAULT 0,
  tunggakan_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tunggakan_weeks INT NOT NULL DEFAULT 2,
  status VARCHAR(32) NOT NULL DEFAULT 'DITERBITKAN',
  petugas_eksekutor JSONB NOT NULL,
  saksi_aparat JSONB NOT NULL,
  barang_disita JSONB NOT NULL,
  lokasi_eksekusi JSONB NOT NULL,
  dokumen_eksekusi JSONB NOT NULL,
  catatan_kejadian TEXT,
  tanggal_terbit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sita_status ON public.surat_sita(status);

-- 3. TABEL AUDIT LOG & JEJAK AKTIVITAS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(64) NOT NULL,
  operator VARCHAR(128) NOT NULL,
  application_id VARCHAR(64),
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. KEBIJAKAN ROW LEVEL SECURITY (RLS) PUBLIK AGAR AMAN
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_sita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for loan_applications" ON public.loan_applications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-write for surat_sita" ON public.surat_sita
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-write for audit_logs" ON public.audit_logs
  FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Mapping between application types and Supabase DB rows
 */
function toSupabaseRow(app: LoanApplication) {
  return {
    id: app.id,
    contract_number: app.contractNumber,
    created_at: app.createdAt,
    updated_at: app.updatedAt || new Date().toISOString(),
    has_witness: app.hasWitness !== false,
    applicant: app.applicant,
    witness: app.hasWitness === false ? null : (app.witness || null),
    loan: app.loan,
    collateral: app.collateral || null,
    location_tag: app.locationTag || null,
    documents: app.documents,
    biometric: app.biometric,
    status: app.status,
    verified_by: app.verifiedBy || null,
    verified_at: app.verifiedAt || null,
    verification_notes: app.verificationNotes || null,
    status_logs: app.statusLogs || []
  };
}

function fromSupabaseRow(row: any): LoanApplication {
  return {
    id: row.id,
    contractNumber: row.contract_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasWitness: row.has_witness !== false,
    applicant: row.applicant,
    witness: row.witness || undefined,
    loan: row.loan,
    collateral: row.collateral || undefined,
    locationTag: row.location_tag || undefined,
    documents: row.documents,
    biometric: row.biometric,
    status: row.status as ApplicationStatus,
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at || undefined,
    verificationNotes: row.verification_notes || undefined,
    statusLogs: row.status_logs || []
  };
}

/**
 * Read cached applications from localStorage
 */
export function getLocalCachedApplications(): LoanApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_APPS) || localStorage.getItem('loan_applications_data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Gagal membaca cache lokal aplikasi:', e);
  }
  return [];
}

export function saveLocalCachedApplications(apps: LoanApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_APPS, JSON.stringify(apps));
    localStorage.setItem('loan_applications_data', JSON.stringify(apps));
  } catch (e) {
    console.warn('Gagal menyimpan cache aplikasi lokal:', e);
  }
}

/**
 * Save new or updated application to Supabase (with fallback to local storage)
 */
export async function saveApplicationToSupabase(application: LoanApplication): Promise<void> {
  // Update local cache immediately
  const localList = getLocalCachedApplications();
  const existingIdx = localList.findIndex(a => a.id === application.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = application;
  } else {
    localList.unshift(application);
  }
  saveLocalCachedApplications(localList);

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    const row = toSupabaseRow(application);
    const { error } = await client
      .from('loan_applications')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save tertunda:', err);
  }
}

/**
 * Update application status in Supabase
 */
export async function updateApplicationStatusInSupabase(
  id: string,
  newStatus: ApplicationStatus,
  notes?: string,
  verifierName?: string,
  statusLogs?: any[]
): Promise<void> {
  const localList = getLocalCachedApplications();
  const app = localList.find(a => a.id === id);
  const now = new Date().toISOString();

  if (app) {
    app.status = newStatus;
    app.verificationNotes = notes || '';
    app.verifiedBy = verifierName || 'Verifikator Berkas';
    app.verifiedAt = now;
    app.updatedAt = now;
    if (statusLogs) app.statusLogs = statusLogs;
    saveLocalCachedApplications(localList);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    const { error } = await client
      .from('loan_applications')
      .update({
        status: newStatus,
        verification_notes: notes || '',
        verified_by: verifierName || 'Verifikator Berkas',
        verified_at: now,
        updated_at: now,
        ...(statusLogs ? { status_logs: statusLogs } : {})
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase status update note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase update status tertunda:', err);
  }
}

/**
 * Update application loan terms in Supabase
 */
export async function updateApplicationLoanInSupabase(
  id: string,
  updatedLoan: LoanTerms,
  newStatus?: ApplicationStatus,
  notes?: string,
  verifierName?: string,
  statusLogs?: any[]
): Promise<void> {
  const localList = getLocalCachedApplications();
  const app = localList.find(a => a.id === id);
  const now = new Date().toISOString();

  if (app) {
    app.loan = updatedLoan;
    if (newStatus) app.status = newStatus;
    if (notes) app.verificationNotes = notes;
    if (verifierName) app.verifiedBy = verifierName;
    app.updatedAt = now;
    if (statusLogs) app.statusLogs = statusLogs;
    saveLocalCachedApplications(localList);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    const updatePayload: any = {
      loan: updatedLoan,
      updated_at: now
    };
    if (newStatus) updatePayload.status = newStatus;
    if (notes) updatePayload.verification_notes = notes;
    if (verifierName) updatePayload.verified_by = verifierName;
    if (statusLogs) updatePayload.status_logs = statusLogs;

    const { error } = await client
      .from('loan_applications')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.warn('Supabase loan update note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase update loan tertunda:', err);
  }
}

/**
 * Subscribe to loan applications from Supabase with Realtime updates
 */
export function subscribeToLoanApplicationsSupabase(
  callback: (apps: LoanApplication[]) => void
): () => void {
  // Always emit cached data first for immediate UI render
  const cached = getLocalCachedApplications();
  if (cached.length > 0) {
    callback(cached);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!client || !config.isConfigured) {
    return () => {};
  }

  let isSubscribed = true;

  // Initial fetch from Supabase
  client
    .from('loan_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (!isSubscribed) return;
      if (error) {
        console.warn('Supabase initial fetch note:', error.message);
        return;
      }
      if (data && data.length > 0) {
        const mapped = data.map(fromSupabaseRow);
        saveLocalCachedApplications(mapped);
        callback(mapped);
      }
    });

  // Realtime channel
  const channel = client
    .channel('public:loan_applications')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'loan_applications' },
      () => {
        // Refetch on changes
        client
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data && isSubscribed) {
              const mapped = data.map(fromSupabaseRow);
              saveLocalCachedApplications(mapped);
              callback(mapped);
            }
          });
      }
    )
    .subscribe();

  return () => {
    isSubscribed = false;
    client.removeChannel(channel);
  };
}

/**
 * Save surat sita to Supabase
 */
export async function saveSuratSitaToSupabase(record: SuratSitaRecord): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_SITA) || '[]';
    const list: SuratSitaRecord[] = JSON.parse(raw);
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    localStorage.setItem(STORAGE_KEY_LOCAL_SITA, JSON.stringify(list));
  } catch (e) {
    console.warn('Gagal simpan surat sita lokal:', e);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    await client.from('surat_sita').upsert({
      id: record.id,
      nomor_surat: record.letterNumber,
      application_id: record.applicationId || null,
      contract_number: record.contractNumber,
      nasabah_name: record.debtor.fullName,
      nasabah_nik: record.debtor.nik,
      nasabah_phone: record.debtor.phoneNumber,
      nasabah_address: record.debtor.address,
      collateral_type: record.collateral.type,
      collateral_title: record.collateral.title,
      collateral_doc_number: record.collateral.documentNumber,
      collateral_estimated_value: record.collateral.estimatedValue,
      tunggakan_amount: record.financials.totalOverdueDebt,
      tunggakan_weeks: Math.max(1, Math.round(record.financials.overdueDays / 7)),
      status: record.status,
      petugas_eksekutor: record.officer,
      saksi_aparat: record.witness,
      barang_disita: record.collateral,
      lokasi_eksekusi: { address: record.collateral.storageLocation || record.debtor.address },
      dokumen_eksekusi: {
        borrowerPhotoUrl: record.debtor.borrowerPhotoUrl || '',
        ktpPhotoUrl: record.debtor.ktpPhotoUrl || '',
        collateralPhotoUrl: record.collateral.collateralPhotoUrl || '',
        collateralDocUrl: record.collateral.collateralDocUrl || '',
        officerSignatureUrl: record.officer.signatureUrl || '',
        witnessSignatureUrl: record.witness.signatureUrl || ''
      },
      catatan_kejadian: record.collateral.seizureConditionNotes || '',
      tanggal_terbit: record.executionDate || record.createdAt,
      created_at: record.createdAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase sita save tertunda:', err);
  }
}

/**
 * Delete surat sita in Supabase
 */
export async function deleteSuratSitaFromSupabase(id: string): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_SITA) || '[]';
    const list: SuratSitaRecord[] = JSON.parse(raw);
    const updated = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY_LOCAL_SITA, JSON.stringify(updated));
  } catch (e) {
    console.warn('Gagal hapus surat sita lokal:', e);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    await client.from('surat_sita').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete sita tertunda:', err);
  }
}

/**
 * Update surat sita status in Supabase
 */
export async function updateSuratSitaStatusInSupabase(id: string, newStatus: SitaStatus): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_SITA) || '[]';
    const list: SuratSitaRecord[] = JSON.parse(raw);
    const item = list.find(r => r.id === id);
    if (item) {
      item.status = newStatus;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LOCAL_SITA, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Gagal update status sita lokal:', e);
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.isConfigured) return;

  try {
    await client.from('surat_sita').update({
      status: newStatus,
      updated_at: new Date().toISOString()
    }).eq('id', id);
  } catch (err) {
    console.warn('Supabase status sita update tertunda:', err);
  }
}

/**
 * Migrate existing data (from Firestore or memory) to Supabase
 */
export async function migrateFirestoreToSupabase(
  existingApps: LoanApplication[],
  existingSita: SuratSitaRecord[] = []
): Promise<{ success: boolean; migratedApps: number; migratedSita: number; message: string }> {
  // 1. First ensure all data is in local Supabase cache
  saveLocalCachedApplications(existingApps);
  if (existingSita.length > 0) {
    localStorage.setItem(STORAGE_KEY_LOCAL_SITA, JSON.stringify(existingSita));
  }

  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!client || !config.isConfigured) {
    return {
      success: true,
      migratedApps: existingApps.length,
      migratedSita: existingSita.length,
      message: `Berhasil mencadangkan ${existingApps.length} pengajuan & ${existingSita.length} surat sita ke penyimpanan relasional lokal. Silakan masukkan Project URL & Anon Key Supabase untuk sinkronisasi cloud.`
    };
  }

  let migratedApps = 0;
  let migratedSita = 0;
  const errors: string[] = [];

  // Upsert applications to Supabase
  for (const app of existingApps) {
    try {
      const row = toSupabaseRow(app);
      const { error } = await client.from('loan_applications').upsert(row, { onConflict: 'id' });
      if (error) {
        errors.push(`App ${app.id}: ${error.message}`);
      } else {
        migratedApps++;
      }
    } catch (err: any) {
      errors.push(`App ${app.id}: ${err?.message || err}`);
    }
  }

  // Upsert surat sita to Supabase
  for (const sita of existingSita) {
    try {
      const { error } = await client.from('surat_sita').upsert({
        id: sita.id,
        nomor_surat: sita.letterNumber,
        application_id: sita.applicationId || null,
        contract_number: sita.contractNumber,
        nasabah_name: sita.debtor.fullName,
        nasabah_nik: sita.debtor.nik,
        nasabah_phone: sita.debtor.phoneNumber,
        nasabah_address: sita.debtor.address,
        collateral_type: sita.collateral.type,
        collateral_title: sita.collateral.title,
        collateral_doc_number: sita.collateral.documentNumber,
        collateral_estimated_value: sita.collateral.estimatedValue,
        tunggakan_amount: sita.financials.totalOverdueDebt,
        tunggakan_weeks: Math.max(1, Math.round(sita.financials.overdueDays / 7)),
        status: sita.status,
        petugas_eksekutor: sita.officer,
        saksi_aparat: sita.witness,
        barang_disita: sita.collateral,
        lokasi_eksekusi: { address: sita.collateral.storageLocation || sita.debtor.address },
        dokumen_eksekusi: {
          borrowerPhotoUrl: sita.debtor.borrowerPhotoUrl || '',
          ktpPhotoUrl: sita.debtor.ktpPhotoUrl || '',
          collateralPhotoUrl: sita.collateral.collateralPhotoUrl || '',
          collateralDocUrl: sita.collateral.collateralDocUrl || '',
          officerSignatureUrl: sita.officer.signatureUrl || '',
          witnessSignatureUrl: sita.witness.signatureUrl || ''
        },
        catatan_kejadian: sita.collateral.seizureConditionNotes || '',
        tanggal_terbit: sita.executionDate || sita.createdAt,
        created_at: sita.createdAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) {
        errors.push(`Sita ${sita.id}: ${error.message}`);
      } else {
        migratedSita++;
      }
    } catch (err: any) {
      errors.push(`Sita ${sita.id}: ${err?.message || err}`);
    }
  }

  if (errors.length > 0 && migratedApps === 0 && migratedSita === 0) {
    return {
      success: false,
      migratedApps: 0,
      migratedSita: 0,
      message: `Migrasi Cloud belum berhasil: ${errors[0]}. Pastikan Anda telah menjalankan skrip SQL Skema di Supabase SQL Editor.`
    };
  }

  return {
    success: true,
    migratedApps,
    migratedSita,
    message: `Migrasi selesai! ${migratedApps} berkas pinjaman dan ${migratedSita} surat sita berhasil dipindahkan ke Supabase PostgreSQL.`
  };
}
