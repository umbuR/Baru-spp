import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldCheck, 
  Database, 
  Rocket, 
  FolderTree, 
  Maximize2, 
  Minimize2, 
  Wifi, 
  Battery, 
  Signal, 
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  FileCheck2
} from 'lucide-react';
import { LoanApplication, ApplicationStatus, LoanTerms } from './types';
import { INITIAL_APPLICATIONS } from './data/initialData';
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
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { ProjectStructureView } from './components/ProjectStructureView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation tabs
  type ActiveTab = 'mobile' | 'admin' | 'database' | 'deployment' | 'structure';
  const [activeTab, setActiveTab] = useState<ActiveTab>('mobile');

  // Phone frame simulation toggle
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(true);

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

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize and synchronize with Firebase Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initFirestore() {
      try {
        const isOk = await testFirestoreConnection();
        setIsFirestoreConnected(isOk);

        // Seed initial mock applications if Firestore is completely empty
        await seedInitialApplicationsIfEmpty(INITIAL_APPLICATIONS);

        // Real-time synchronization from Firestore
        unsubscribe = subscribeToLoanApplications(
          (liveApps) => {
            if (liveApps && liveApps.length > 0) {
              setApplications(liveApps);
              setIsFirestoreConnected(true);
            }
          },
          (err) => {
            console.warn('Firestore subscription using offline cache:', err);
          }
        );
      } catch (err) {
        console.warn('Firestore initialization fallback:', err);
      }
    }

    initFirestore();

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
    // Optimistic local state update
    setApplications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            verificationNotes: notes,
            verifiedBy: verifierName || 'Verifikator Berkas',
            verifiedAt: new Date().toISOString()
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
      await updateApplicationStatusInFirestore(id, newStatus, notes, verifierName);
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
    setApplications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            loan: updatedLoan,
            updatedAt: now,
            ...(newStatus ? { status: newStatus } : {}),
            ...(notes !== undefined ? { verificationNotes: notes } : {}),
            ...(verifierName ? { verifiedBy: verifierName, verifiedAt: now } : {})
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
      await updateApplicationLoanInFirestore(id, updatedLoan, newStatus, notes, verifierName);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                  PWA Mobile-First
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Surat Perjanjian Pinjaman PM Mitra Sejahtera Bersama, KTP/KK, Liveness Selfie & e-Signature
              </p>
            </div>
          </div>

          {/* Right Action: Database Status & PWA Install Button */}
          <div className="flex items-center gap-2.5">
            <div 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition ${
                isFirestoreConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              title={isFirestoreConnected ? 'Database Firestore Online & Tersinkronisasi' : 'Menghubungkan ke Database...'}
            >
              <span className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isFirestoreConnected ? 'Database Cloud Aktif' : 'Database Sinkronisasi'}
              </span>
            </div>
            <PWAInstallButton />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'mobile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mode Nasabah (HP Mobile)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Dashboard Verifikator Berkas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
              {applications.filter((a) => a.status === 'PENDING').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Cloud Firestore & Skema</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'deployment'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Panduan Deployment Gratis</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'structure'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Struktur Folder Proyek</span>
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
        {activeTab === 'mobile' && (
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            {/* Viewport Framing Controller */}
            <div className="flex items-center justify-between w-full max-w-md px-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Simulasi Layar HP (Mobile-First / PWA)</span>
              </div>
              <button
                onClick={() => setPhoneFrameEnabled(!phoneFrameEnabled)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {phoneFrameEnabled ? (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>Mode Layar Penuh</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Bingkai HP</span>
                  </>
                )}
              </button>
            </div>

            {/* Smartphone Shell or Frameless */}
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
                    onSwitchToAdmin={() => setActiveTab('admin')}
                  />
                </div>

                {/* Home Indicator Pill */}
                <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
              </div>
            ) : (
              <div className="w-full max-w-md">
                <MobileLoanFlow
                  onSubmitApplication={handleAddNewApplication}
                  onSwitchToAdmin={() => setActiveTab('admin')}
                />
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: DASHBOARD VERIFIKATOR BERKAS (ADMIN)
        ========================================================= */}
        {activeTab === 'admin' && (
          <AdminDashboard
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onUpdateLoan={handleUpdateLoan}
            onSwitchToMobile={() => setActiveTab('mobile')}
          />
        )}

        {/* =========================================================
            TAB 3: SKEMA DATABASE SUPABASE & RLS
        ========================================================= */}
        {activeTab === 'database' && <DatabaseSchemaView />}

        {/* =========================================================
            TAB 4: PANDUAN DEPLOYMENT (VERCEL + SUPABASE)
        ========================================================= */}
        {activeTab === 'deployment' && <DeploymentGuideView />}

        {/* =========================================================
            TAB 5: STRUKTUR FOLDER PROYEK
        ========================================================= */}
        {activeTab === 'structure' && <ProjectStructureView />}
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
