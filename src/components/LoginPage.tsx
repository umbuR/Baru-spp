import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  Building2,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { PRESET_ACCOUNTS } from '../data/authUsers';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('KOLEKTOR');
  const [email, setEmail] = useState<string>(PRESET_ACCOUNTS.kolektor.user.email);
  const [password, setPassword] = useState<string>(PRESET_ACCOUNTS.kolektor.password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Switch role preset handler
  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'KOLEKTOR') {
      setEmail(PRESET_ACCOUNTS.kolektor.user.email);
      setPassword(PRESET_ACCOUNTS.kolektor.password);
    } else {
      setEmail(PRESET_ACCOUNTS.analyst.user.email);
      setPassword(PRESET_ACCOUNTS.analyst.password);
    }
  };

  // Direct fast login handler
  const handleFastLogin = (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedRole(role);
    
    setTimeout(() => {
      const account = role === 'KOLEKTOR' ? PRESET_ACCOUNTS.kolektor : PRESET_ACCOUNTS.analyst;
      if (rememberMe) {
        try {
          localStorage.setItem('pm_remember_role', role);
        } catch (e) {
          console.warn(e);
        }
      }
      setIsLoading(false);
      onLogin(account.user);
    }, 450);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate against presets or allow structured login
      const cleanEmail = email.trim().toLowerCase();
      
      if (selectedRole === 'KOLEKTOR') {
        if (cleanEmail === PRESET_ACCOUNTS.kolektor.user.email && password !== PRESET_ACCOUNTS.kolektor.password) {
          setIsLoading(false);
          setErrorMessage('Kata sandi kolektor tidak sesuai. Gunakan: kolektor123');
          return;
        }

        const user: AuthUser = {
          ...PRESET_ACCOUNTS.kolektor.user,
          email: cleanEmail,
          displayName: cleanEmail === PRESET_ACCOUNTS.kolektor.user.email ? PRESET_ACCOUNTS.kolektor.user.displayName : cleanEmail.split('@')[0],
        };
        setIsLoading(false);
        onLogin(user);
      } else {
        if (cleanEmail === PRESET_ACCOUNTS.analyst.user.email && password !== PRESET_ACCOUNTS.analyst.password) {
          setIsLoading(false);
          setErrorMessage('Kata sandi analyst tidak sesuai. Gunakan: analyst123');
          return;
        }

        const user: AuthUser = {
          ...PRESET_ACCOUNTS.analyst.user,
          email: cleanEmail,
          displayName: cleanEmail === PRESET_ACCOUNTS.analyst.user.email ? PRESET_ACCOUNTS.analyst.user.displayName : cleanEmail.split('@')[0],
        };
        setIsLoading(false);
        onLogin(user);
      }
    }, 500);
  };

  const currentPreset = selectedRole === 'KOLEKTOR' ? PRESET_ACCOUNTS.kolektor : PRESET_ACCOUNTS.analyst;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>PM MITRA SEJAHTERA BERSAMA</span>
            </div>
            <PWAInstallButton compact={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Otentikasi Petugas Pinjaman
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Sistem Manajemen Surat Perjanjian Pinjaman Digital dengan Pemisahan Hak Akses Sesuai SOP
          </p>
        </div>

        {/* 2-Column Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card Role 1: Kolektor */}
          <div 
            onClick={() => handleSelectRolePreset('KOLEKTOR')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'KOLEKTOR'
                ? 'bg-slate-900/90 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-950/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            {selectedRole === 'KOLEKTOR' && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition ${
                    selectedRole === 'KOLEKTOR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ROLE PERTAMA
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">Kolektor Lapangan</h2>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                  selectedRole === 'KOLEKTOR' ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-700'
                }`}>
                  {selectedRole === 'KOLEKTOR' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">Lingkup Tugas:</span> Khusus untuk <strong>input data nasabah</strong> baru di lapangan via smartphone (Formulir, KTP, KK, selfie liveness, dan tanda tangan).
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-emerald-300/90 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Input permohonan pinjaman & foto dokumen</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-300/80">
                  <span className="w-3 h-3 flex items-center justify-center font-bold text-rose-400 shrink-0">&times;</span>
                  <span>Tidak dapat melihat Dashboard Verifikator Berkas</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFastLogin('KOLEKTOR');
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Instan: Budi Santoso (Kolektor)</span>
            </button>
          </div>

          {/* Card Role 2: Analyst */}
          <div 
            onClick={() => handleSelectRolePreset('ANALYST')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'ANALYST'
                ? 'bg-slate-900/90 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-950/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            {selectedRole === 'ANALYST' && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition ${
                    selectedRole === 'ANALYST' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      ROLE KEDUA
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">Credit Analyst</h2>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                  selectedRole === 'ANALYST' ? 'border-indigo-400 bg-indigo-500 text-slate-950' : 'border-slate-700'
                }`}>
                  {selectedRole === 'ANALYST' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-xs text-slate-300">
                <span className="font-semibold text-indigo-400">Lingkup Tugas:</span> Khusus untuk <strong>Dashboard Verifikator Berkas</strong> (Pemeriksaan KTP/KK, analisis kelayakan, penyesuaian plafon/tenor, & persetujuan).
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-indigo-300/90 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Akses lengkap antrean berkas & verifikasi</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-300/90 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Kewenangan Persetujuan & Penyesuaian Pinjaman</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFastLogin('ANALYST');
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-950/50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Instan: Hendra Wijaya (Analyst)</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Kredensial Akses {selectedRole === 'KOLEKTOR' ? 'Kolektor Lapangan' : 'Credit Analyst'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Silakan masuk dengan akun resmi terdaftar atau gunakan tombol masuk cepat
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectRolePreset('KOLEKTOR')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  selectedRole === 'KOLEKTOR' 
                    ? 'bg-emerald-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kolektor
              </button>
              <button
                type="button"
                onClick={() => handleSelectRolePreset('ANALYST')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  selectedRole === 'ANALYST' 
                    ? 'bg-indigo-500 text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Analyst
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email Petugas ({selectedRole === 'KOLEKTOR' ? 'Kolektor' : 'Analyst'})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'KOLEKTOR' ? 'kolektor@mitrasejahtera.com' : 'analyst@mitrasejahtera.com'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Kata Sandi Petugas
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Default: <span className="text-slate-400">{selectedRole === 'KOLEKTOR' ? 'kolektor123' : 'analyst123'}</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                />
                <span className="text-xs text-slate-400">Ingat sesi login pada perangkat ini</span>
              </label>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Otorisasi Berbasis Peran (RBAC)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                selectedRole === 'KOLEKTOR'
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-950/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-950/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk sebagai {selectedRole === 'KOLEKTOR' ? 'Kolektor (Input Data Nasabah)' : 'Analyst (Verifikator Berkas)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Active Preset Information Box */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-200">{currentPreset.user.displayName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    ID: {currentPreset.user.employeeId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedRole === 'KOLEKTOR' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {currentPreset.user.roleTitle}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentPreset.scopeSummary} ({currentPreset.user.assignedArea})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-slate-500 px-2 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Terkoneksi Aman Cloud Firestore & Database SPP</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Enkripsi 256-Bit</span>
            <span>•</span>
            <span>PWA Siap Offline</span>
            <span>•</span>
            <span>PM Mitra Sejahtera v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
