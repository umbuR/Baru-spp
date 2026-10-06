import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  ExternalLink, 
  ArrowRightLeft, 
  ShieldCheck, 
  AlertCircle,
  FileCode,
  HardDrive
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  migrateFirestoreToSupabase,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';
import { LoanApplication, SuratSitaRecord } from '../types';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: LoanApplication[];
  suratSitaList: SuratSitaRecord[];
  onDataMigrated?: (updatedApps: LoanApplication[]) => void;
  onStatusChange?: (isConnected: boolean) => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  applications,
  suratSitaList,
  onDataMigrated,
  onStatusChange
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: false,
    ok: false,
    message: ''
  });
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setMigrationResult(null);
      // Test current connection
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setConnectionStatus({
      tested: true,
      ok: res.ok,
      message: res.message,
      latencyMs: res.latencyMs
    });
    if (onStatusChange) onStatusChange(res.ok);
    setIsTesting(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    await checkConnection();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleExecuteMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await migrateFirestoreToSupabase(applications, suratSitaList);
      setMigrationResult({
        success: res.success,
        message: res.message
      });
      if (res.success && onDataMigrated) {
        onDataMigrated(applications);
      }
      await checkConnection();
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: `Terjadi kendala saat migrasi: ${err?.message || err}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Konfigurasi & Migrasi Database Supabase
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-slate-400">Gantikan Cloud Firestore dengan database relasional Supabase / Turso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border transition ${
            connectionStatus.ok
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {connectionStatus.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <HardDrive className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {connectionStatus.ok ? 'Supabase Terhubung Online' : 'Penyimpanan Database Aktif (Hybrid Mode)'}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {connectionStatus.tested ? connectionStatus.message : 'Memeriksa status koneksi database...'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={checkConnection}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-[11px] flex items-center gap-1.5 shrink-0 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isTesting ? 'animate-spin' : ''}`} />
                Uji Koneksi
              </button>
            </div>
          </div>

          {/* Form Kredensial Supabase */}
          <form onSubmit={handleSaveConfig} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Kredensial Proyek Supabase
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Buka Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Project URL Supabase
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Simpan Kredensial
              </button>
            </div>
          </form>

          {/* Section Tombol Migrasi Data */}
          <div className="bg-gradient-to-br from-slate-950 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                  Migrasikan Data ke Supabase
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pindahkan seluruh berkas pengajuan kredit ({applications.length} berkas) dan surat sita ({suratSitaList.length} surat) ke database Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExecuteMigration}
                disabled={isMigrating}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memigrasikan...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Migrasikan Data Sekarang
                  </>
                )}
              </button>
            </div>

            {migrationResult && (
              <div className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                migrationResult.success
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}>
                {migrationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{migrationResult.message}</span>
              </div>
            )}
          </div>

          {/* Skema SQL Supabase */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                Skema Tabel PostgreSQL (SQL DDL)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    Salin Skema SQL
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jika tabel belum dibuat di proyek Supabase Anda, salin skrip SQL ini lalu jalankan di menu <strong>SQL Editor</strong> di dashboard Supabase.
            </p>
            <div className="relative max-h-36 overflow-y-auto rounded-xl bg-slate-900 p-3 border border-slate-800 font-mono text-[10px] text-slate-300">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-t border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
