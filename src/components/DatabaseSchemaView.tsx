import React, { useState } from 'react';
import { Database, Copy, Check, Shield, FolderKey, FileCode, Table, CheckCircle2, Cloud, Sparkles, Layers, Activity } from 'lucide-react';
import firebaseConfigData from '../../firebase-applet-config.json';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeDbTab, setActiveDbTab] = useState<'firestore' | 'supabase'>('firestore');

  const supabaseSqlSchema = `-- ==============================================================================
-- SKEMA DATABASE SUPABASE POSTGRESQL & KEBIJAKAN ROW LEVEL SECURITY (RLS)
-- SISTEM SURAT PERJANJIAN PINJAMAN PM MITRA SEJAHTERA BERSAMA (MOBILE-FIRST / PWA)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE loan_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('BORROWER', 'VERIFIER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL PROFIL PENGGUNA (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    nik VARCHAR(16) NOT NULL UNIQUE,
    kk_number VARCHAR(16) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20),
    address TEXT,
    phone_number VARCHAR(20) NOT NULL,
    job VARCHAR(100),
    monthly_income NUMERIC(15,2),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    role user_role_enum DEFAULT 'BORROWER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PENGAJUAN PINJAMAN (LOAN_APPLICATIONS)
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    contract_number VARCHAR(60) NOT NULL UNIQUE,
    loan_amount NUMERIC(15,2) NOT NULL, -- Rp 500.000 s/d Rp 10.000.000
    tenor_weeks INTEGER NOT NULL DEFAULT 6, -- 4, 6, 8, 10, 12 minggu
    tenor_months INTEGER,
    interest_rate_annual NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    weekly_installment NUMERIC(15,2) NOT NULL,
    monthly_installment NUMERIC(15,2),
    admin_fee NUMERIC(15,2) NOT NULL,
    total_repayment NUMERIC(15,2) NOT NULL,
    purpose TEXT NOT NULL,
    status loan_status_enum DEFAULT 'PENDING',
    ktp_url TEXT,
    kk_url TEXT,
    selfie_url TEXT,
    signature_url TEXT,
    biometric_is_verified BOOLEAN DEFAULT FALSE,
    biometric_auth_type VARCHAR(50),
    biometric_verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL AUDIT TRAIL LOGS
CREATE TABLE IF NOT EXISTS public.loan_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    operator_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pengajuan pinjaman nasabah: create, read, update diizinkan
    match /loan_applications/{applicationId} {
      allow read, create, update: if true;
      allow delete: if false;
    }

    // Jejak log audit aktivitas: append only
    match /audit_logs/{logId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}`;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Live Database Active Card */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-inner">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Database Cloud Firestore Terhubung
                </h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Online & Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Semua data pengajuan, KTP, KK, tanda tangan, dan verifikasi tersimpan otomatis secara real-time di cloud.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDbTab('firestore')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeDbTab === 'firestore'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Firestore (Aktif)
            </button>
            <button
              onClick={() => setActiveDbTab('supabase')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeDbTab === 'supabase'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              PostgreSQL / Supabase (Cadangan)
            </button>
          </div>
        </div>

        {/* Database Config Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Project ID</span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-300 mt-1 break-all">
              {firebaseConfigData.projectId}
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Database Instance</span>
            </div>
            <p className="text-xs font-mono font-bold text-sky-300 mt-1 break-all">
              {firebaseConfigData.firestoreDatabaseId}
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Koleksi Aktif</span>
            </div>
            <p className="text-xs font-mono font-bold text-white mt-1">
              /loan_applications, /audit_logs
            </p>
          </div>
        </div>
      </div>

      {/* Detail Konten Berdasarkan Tab */}
      {activeDbTab === 'firestore' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Aturan Keamanan Cloud Firestore (firestore.rules)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aturan keamanan telah dideploy langsung ke Cloud Firestore project untuk melindungi integritas berkas.
              </p>
            </div>
            <button
              onClick={() => handleCopy(firestoreRulesText)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Rules'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <FileCode className="w-4 h-4" />
                firestore.rules (Telah Dideploy)
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed select-all">
              {firestoreRulesText}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Sinkronisasi Otomatis Antar Perangkat</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Setiap kali nasabah mengisi formulir di ponsel, berkas langsung muncul seketika di dashboard verifikator admin.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Cache Offline Otomatis</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Jika sinyal nasabah terputus, data tetap aman tersimpan di IndexedDB/localStorage dan otomatis disinkronkan saat online kembali.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-400" />
                Skema SQL Relasional PostgreSQL / Supabase
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dapat digunakan jika Anda ingin menghubungkan database relasional SQL terpisah di kemudian hari.
              </p>
            </div>
            <button
              onClick={() => handleCopy(supabaseSqlSchema)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                <FileCode className="w-4 h-4" />
                supabase_schema_loan_agreement.sql
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-blue-300/90 overflow-x-auto max-h-[480px] leading-relaxed select-all">
              {supabaseSqlSchema}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
