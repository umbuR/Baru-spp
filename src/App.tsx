import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldCheck, 
  Database,
  Maximize2, 
  Minimize2, 
  Wifi, 
  Battery, 
  Signal, 
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  FileCheck2,
  LogOut,
  Lock,
  UserCheck,
  FileWarning
} from 'lucide-react';
import { 
  LoanApplication, 
  ApplicationStatus, 
  LoanTerms, 
  AuthUser, 
  UserRole, 
  StatusLogEntry,
  SuratSitaRecord,
  SitaStatus
} from './types';
import { INITIAL_APPLICATIONS, INITIAL_SURAT_SITA } from './data/initialData';
import { 
  testFirestoreConnection, 
  subscribeToLoanApplications, 
  saveApplicationToFirestore, 
  updateApplicationStatusInFirestore,
  updateApplicationLoanInFirestore,
  seedInitialApplicationsIfEmpty 
} from './lib/firebase';
import { MobileLoanFlow } from './components/MobileLoanFlow';
import { AdminDashboard } from './components/AdminDashboard';
import { SuratSitaBarangView } from './components/SuratSitaBarangView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoginPage } from './components/LoginPage';

export default function App() {
  // Current authenticated user session (Kolektor or Analyst)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('pm_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal membaca sesi pengguna dari localStorage:', e);
    }
    return null;
  });

  // Navigation tabs
  type ActiveTab = 'mobile' | 'admin' | 'sita';
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    return currentUser?.role === 'ANALYST' ? 'admin' : 'mobile';
  });

  // Phone frame simulation toggle with localStorage persistence
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pm_phone_frame_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pm_phone_frame_enabled', JSON.stringify(phoneFrameEnabled));
    } catch (e) {
      console.warn(e);
    }
  }, [phoneFrameEnabled]);

  // Fullscreen monitor state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Gagal mengubah mode layar penuh:', err);
    }
  };

  // Firestore status
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // Applications state persisted to localStorage as offline cache + Firestore sync
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    try {
      const saved = localStorage.getItem('loan_applications_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_APPLICATIONS;
  });

  // Surat Sita Barang state persisted to localStorage
  const [suratSitaList, setSuratSitaList] = useState<SuratSitaRecord[]>(() => {
    try {
      const saved = localStorage.getItem('surat_sita_records_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_SURAT_SITA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('surat_sita_records_data', JSON.stringify(suratSitaList));
    } catch (e) {
      console.warn('Could not persist surat sita to localStorage:', e);
    }
  }, [suratSitaList]);

  const handleSaveSuratSita = (newOrUpdated: SuratSitaRecord) => {
    setSuratSitaList((prev) => {
      const exists = prev.some(item => item.id === newOrUpdated.id);
      if (exists) {
        return prev.map(item => item.id === newOrUpdated.id ? newOrUpdated : item);
      }
      return [newOrUpdated, ...prev];
    });
    showToast(`Surat Sita ${newOrUpdated.letterNumber} untuk ${newOrUpdated.debtor.fullName} berhasil disimpan & diterbitkan!`, 'success');
  };

  const handleDeleteSuratSita = (id: string) => {
    setSuratSitaList((prev) => prev.filter(item => item.id !== id));
    showToast('Surat Sita berhasil dihapus dari arsip.', 'info');
  };

  const handleUpdateSuratSitaStatus = (id: string, newStatus: SitaStatus) => {
    setSuratSitaList((prev) => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus
        };
      }
      return item;
    }));
    showToast(`Status surat sita berhasil diubah menjadi "${newStatus}".`, 'success');
  };

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize and synchronize with Firebase Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Start real-time synchronization from Firestore immediately
    try {
      unsubscribe = subscribeToLoanApplications(
        (liveApps) => {
          if (liveApps && liveApps.length > 0) {
            setApplications(liveApps);
            setIsFirestoreConnected(true);
          }
        },
        (err) => {
          console.info('Firestore subscription active with local offline cache:', err?.message || err);
        }
      );
    } catch (subErr) {
      console.warn('Subscription error:', subErr);
    }

    async function checkAndSeedFirestore() {
      try {
        const isOk = await testFirestoreConnection();
        setIsFirestoreConnected(isOk);

        // Seed initial mock applications if Firestore is completely empty and online
        if (isOk) {
          try {
            await seedInitialApplicationsIfEmpty(INITIAL_APPLICATIONS);
          } catch (seedErr) {
            console.warn('Initial seeding skipped:', seedErr);
          }
        }
      } catch (err) {
        console.warn('Firestore initialization status:', err);
      }
    }

    checkAndSeedFirestore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync to localStorage as offline backup cache
  useEffect(() => {
    try {
      localStorage.setItem('loan_applications_data', JSON.stringify(applications));
    } catch (e) {
      console.warn('Could not persist applications to localStorage:', e);
    }
  }, [applications]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle successful login with role routing
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pm_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist user to localStorage:', e);
    }
    if (user.role === 'KOLEKTOR') {
      setActiveTab('mobile');
      showToast(`Selamat datang, ${user.displayName}! Mode Kolektor Lapangan (Khusus Input Data Nasabah) aktif.`, 'success');
    } else {
      setActiveTab('admin');
      showToast(`Selamat datang, ${user.displayName}! Dashboard Verifikator Berkas aktif.`, 'success');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pm_auth_user');
    } catch (e) {
      console.warn('Could not remove user from localStorage:', e);
    }
    showToast('Sesi petugas telah ditutup. Silakan masuk kembali.', 'info');
  };

  // Add new application from mobile flow and persist to Firestore
  const handleAddNewApplication = async (newApp: LoanApplication) => {
    // Instant optimistic update
    setApplications((prev) => [newApp, ...prev]);
    showToast(`Pengajuan ${newApp.applicant.fullName} (${newApp.contractNumber}) berhasil disimpan ke Database Cloud!`, 'success');

    // Cloud Firestore persistence
    try {
      await saveApplicationToFirestore(newApp);
      setIsFirestoreConnected(true);
    } catch (err) {
      console.error('Gagal menyimpan ke Firestore, tersimpan di cache lokal:', err);
    }
  };

  // Update status from Admin Dashboard and persist to Firestore
  const handleUpdateStatus = async (
    id: string,
    newStatus: ApplicationStatus,
    notes?: string,
    verifierName?: string
  ) => {
    const now = new Date().toISOString();
    const effectiveVerifier = verifierName || currentUser?.displayName || 'Verifikator Berkas';
    let updatedLogs: StatusLogEntry[] = [];

    // Optimistic local state update
    setApplications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEntry: StatusLogEntry = {
            status: newStatus,
            changedBy: effectiveVerifier,
            changedAt: now,
            notes: notes || undefined,
            previousStatus: item.status
          };
          const existingLogs = item.statusLogs || [];
          updatedLogs = [newEntry, ...existingLogs];
          return {
            ...item,
            status: newStatus,
            verificationNotes: notes,
            verifiedBy: effectiveVerifier,
            verifiedAt: now,
            updatedAt: now,
            statusLogs: updatedLogs
          };
        }
        return item;
      })
    );

    showToast(
      newStatus === 'APPROVED'
        ? 'Pengajuan pinjaman DISETUJUI & tersimpan di database!'
        : 'Pengajuan pinjaman DITOLAK & status diperbarui di database.',
      newStatus === 'APPROVED' ? 'success' : 'info'
    );

    // Update in Firestore
    try {
      await updateApplicationStatusInFirestore(id, newStatus, notes, effectiveVerifier, updatedLogs);
      setIsFirestoreConnected(true);
    } catch (err) {
      console.error('Gagal memperbarui status di Firestore:', err);
    }
  };

  // Update loan terms (plafon, tenor, angsuran) & status from Verifikator menu
  const handleUpdateLoan = async (
    id: string,
    updatedLoan: LoanTerms,
    newStatus?: ApplicationStatus,
    notes?: string,
    verifierName?: string
  ) => {
    const now = new Date().toISOString();
    const effectiveVerifier = verifierName || currentUser?.displayName || 'Verifikator Berkas';
    let updatedLogs: StatusLogEntry[] = [];

    setApplications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const finalStatus = newStatus || item.status;
          const newEntry: StatusLogEntry = {
            status: finalStatus,
            changedBy: effectiveVerifier,
            changedAt: now,
            notes: notes || `Plafon pinjaman disesuaikan menjadi Rp ${updatedLoan.loanAmount.toLocaleString('id-ID')} (${updatedLoan.tenorWeeks} mgg)`,
            previousStatus: item.status
          };
          const existingLogs = item.statusLogs || [];
          updatedLogs = [newEntry, ...existingLogs];
          return {
            ...item,
            loan: updatedLoan,
            updatedAt: now,
            status: finalStatus,
            verificationNotes: notes !== undefined ? notes : item.verificationNotes,
            verifiedBy: effectiveVerifier,
            verifiedAt: now,
            statusLogs: updatedLogs
          };
        }
        return item;
      })
    );

    showToast(
      newStatus === 'APPROVED'
        ? `Plafon pinjaman disesuaikan menjadi Rp ${updatedLoan.loanAmount.toLocaleString('id-ID')} & BERHASIL DI-ACC! Surat perjanjian telah diperbarui.`
        : `Ketentuan pinjaman disesuaikan menjadi Rp ${updatedLoan.loanAmount.toLocaleString('id-ID')} (Tenor ${updatedLoan.tenorWeeks} mgg). Surat perjanjian otomatis diperbarui!`,
      'success'
    );

    // Update in Firestore
    try {
      await updateApplicationLoanInFirestore(id, updatedLoan, newStatus, notes, effectiveVerifier, updatedLogs);
      setIsFirestoreConnected(true);
    } catch (err) {
      console.error('Gagal memperbarui pinjaman di Firestore:', err);
    }
  };

  // Live clock for mobile phone status bar
  const [phoneTime, setPhoneTime] = useState('14:30');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // If not authenticated, show role-selection login page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
        <LoginPage onLogin={handleLogin} />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-blue-500/40 text-white shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-300">
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-900/40 border border-blue-400/30">
              PM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  PM Mitra Sejahtera Bersama
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Resmi & Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Sistem Surat Perjanjian Pinjaman PM Mitra Sejahtera Bersama, KTP/KK, Liveness Selfie & e-Signature
              </p>
            </div>
          </div>

          {/* Right Action: Active User Capsule, Fullscreen, DB status, and Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active User Capsule Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
              currentUser.role === 'KOLEKTOR'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
            }`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                currentUser.role === 'KOLEKTOR'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/50'
                  : 'bg-indigo-600 text-white shadow-sm shadow-indigo-700/50'
              }`}>
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-100 truncate max-w-[130px]">
                  {currentUser.displayName}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    currentUser.role === 'KOLEKTOR'
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-indigo-500/30 text-indigo-300'
                  }`}>
                    {currentUser.role === 'KOLEKTOR' ? 'Kolektor' : 'Analyst'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentUser.role === 'KOLEKTOR' ? '(Input Data)' : '(Verifikator)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout / Switch Role Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-700/60 border border-slate-700 text-slate-300 text-xs font-semibold transition shadow-sm"
              title="Keluar atau Ganti Akun Petugas"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Ganti Akun</span>
            </button>

            {/* Quick Fullscreen Button */}
            <button
              onClick={toggleBrowserFullscreen}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              title={isFullscreen ? 'Keluar dari Mode Layar Penuh (ESC)' : 'Buka Mode Layar Penuh'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Keluar Layar Penuh</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Layar Penuh</span>
                </>
              )}
            </button>

            {/* Firestore status pill */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition ${
                isFirestoreConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              title={isFirestoreConnected ? 'Database Firestore Online & Tersinkronisasi' : 'Menghubungkan ke Database...'}
            >
              <span className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {isFirestoreConnected ? 'Cloud Online' : 'Sinkronisasi'}
              </span>
            </div>

            <PWAInstallButton />
          </div>
        </div>

        {/* Navigation Tabs Bar with Role Enforcement */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs">
          {/* Tab 1: Mode Nasabah (Input Data) */}
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'mobile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {currentUser.role === 'KOLEKTOR' 
                ? 'Input Data Pinjaman Nasabah' 
                : 'Mode Nasabah (HP Mobile)'}
            </span>
            {currentUser.role === 'KOLEKTOR' && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Akses Kolektor
              </span>
            )}
          </button>

          {/* Tab 2: Dashboard Verifikator Berkas (Admin) */}
          {currentUser.role === 'KOLEKTOR' ? (
            <button
              onClick={() => {
                showToast('Akses Dibatasi: Akun Kolektor hanya memiliki hak akses untuk Input Data Nasabah. Masuk sebagai Credit Analyst untuk membuka Dashboard Verifikator Berkas.', 'info');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap text-slate-500 hover:text-slate-400 hover:bg-slate-900/60 transition cursor-not-allowed border border-dashed border-slate-800"
              title="Akses Dibatasi: Khusus Role Analyst"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Dashboard Verifikator Berkas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Khusus Analyst
              </span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dashboard Verifikator Berkas</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {applications.filter((a) => a.status === 'PENDING').length} antrean
              </span>
            </button>
          )}

          {/* Tab 3: Menu Surat Sita Barang Agunan */}
          <button
            onClick={() => setActiveTab('sita')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'sita'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileWarning className="w-4 h-4 text-rose-400" />
            <span>Surat Sita Barang</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              {suratSitaList.length}
            </span>
          </button>
        </div>
      </header>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-blue-500/40 text-white shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-300">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-start">
        {/* =========================================================
            TAB 1: MODE NASABAH (MOBILE HP SIMULATION / FULL)
        ========================================================= */}
        <div style={{ display: activeTab === 'mobile' ? 'block' : 'none' }}>
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            {/* Viewport Framing & Fullscreen Controller */}
            <div className={`flex flex-wrap items-center justify-between w-full ${phoneFrameEnabled ? 'max-w-md' : 'max-w-4xl'} px-2 gap-2 text-xs text-slate-400 transition-all`}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>{phoneFrameEnabled ? 'Mode Bingkai HP (Simulasi)' : 'Mode Layar Penuh (Lebar Penuh)'}</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tulisan & Isian Draf Tersimpan
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch between phone frame and full width */}
                <button
                  onClick={() => setPhoneFrameEnabled(!phoneFrameEnabled)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  title={phoneFrameEnabled ? 'Ubah ke Mode Layar Penuh Responsif' : 'Kembali ke Tampilan Bingkai HP'}
                >
                  {phoneFrameEnabled ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buka Layar Penuh</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Mode Bingkai HP</span>
                    </>
                  )}
                </button>

                {/* Browser Fullscreen API Toggle */}
                <button
                  onClick={toggleBrowserFullscreen}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
                  title="Aktifkan / nonaktifkan layar penuh monitor"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Keluar Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Layar Penuh Monitor</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Smartphone Shell or Frameless Full-Width */}
            {phoneFrameEnabled ? (
              <div className="relative w-full max-w-[420px] rounded-[48px] bg-slate-950 p-3.5 border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
                {/* Physical Phone Speaker Grill & Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 bg-black px-4 py-1.5 rounded-full border border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-500/70" />
                  </div>
                  <div className="w-12 h-1 rounded-full bg-slate-800" />
                </div>

                {/* Mobile Phone Status Bar */}
                <div className="pt-2 px-6 pb-2 flex justify-between items-center text-[11px] font-semibold text-slate-300 font-mono select-none">
                  <span>{phoneTime}</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Inner Screen Container */}
                <div className="rounded-[36px] overflow-hidden bg-slate-900 border border-slate-800">
                  <MobileLoanFlow
                    onSubmitApplication={handleAddNewApplication}
                    onSwitchToAdmin={() => {
                      if (currentUser.role === 'ANALYST') {
                        setActiveTab('admin');
                      } else {
                        showToast('Akses dibatasi: Role Kolektor hanya untuk input data nasabah.', 'info');
                      }
                    }}
                    isFullWidth={false}
                    userRole={currentUser.role}
                  />
                </div>

                {/* Home Indicator Pill */}
                <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <MobileLoanFlow
                  onSubmitApplication={handleAddNewApplication}
                  onSwitchToAdmin={() => {
                    if (currentUser.role === 'ANALYST') {
                      setActiveTab('admin');
                    } else {
                      showToast('Akses dibatasi: Role Kolektor hanya untuk input data nasabah.', 'info');
                    }
                  }}
                  isFullWidth={true}
                  userRole={currentUser.role}
                />
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            TAB 2: DASHBOARD VERIFIKATOR BERKAS (ADMIN)
        ========================================================= */}
        <div style={{ display: activeTab === 'admin' ? 'block' : 'none' }}>
          {currentUser.role === 'KOLEKTOR' ? (
            <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Akses Terbatas: Khusus Credit Analyst</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Akun Anda terdaftar sebagai <strong className="text-emerald-400">Kolektor Lapangan</strong>, yang hanya memiliki hak akses untuk mengisi dan mengumpulkan berkas formulir nasabah baru.
              </p>
              <button
                onClick={() => setActiveTab('mobile')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition"
              >
                Kembali ke Form Input Nasabah
              </button>
            </div>
          ) : (
            <AdminDashboard
              applications={applications}
              onUpdateStatus={handleUpdateStatus}
              onUpdateLoan={handleUpdateLoan}
              onSwitchToMobile={() => setActiveTab('mobile')}
              onNavigateToSita={() => setActiveTab('sita')}
              currentAnalystName={currentUser.displayName}
            />
          )}
        </div>

        {/* =========================================================
            TAB 3: MENU SURAT SITA BARANG AGUNAN (EKSEKUSI JAMINAN)
        ========================================================= */}
        <div style={{ display: activeTab === 'sita' ? 'block' : 'none' }}>
          <SuratSitaBarangView
            applications={applications}
            suratSitaList={suratSitaList}
            onSaveSuratSita={handleSaveSuratSita}
            onDeleteSuratSita={handleDeleteSuratSita}
            onUpdateSuratSitaStatus={handleUpdateSuratSitaStatus}
            currentUser={currentUser}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistem Surat Perjanjian Pinjaman © 2026 PM Mitra Sejahtera Bersama. Sah & Mengikat Hukum.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> FIDO2 WebAuthn
            </span>
            <span className="text-blue-400">PWA Ready</span>
            <span className="text-sky-400">HTML5 Canvas e-Sign</span>
          </div>
        </div>
      </footer>
      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
