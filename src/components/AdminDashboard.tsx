import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download, 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  RefreshCw,
  X,
  ExternalLink,
  DollarSign,
  Users,
  Shield,
  FileCheck2,
  MapPin,
  Sliders,
  Calculator,
  Edit3
} from 'lucide-react';
import { LoanApplication, ApplicationStatus, LoanTerms } from '../types';
import { formatRupiah, formatDateIndo, downloadLoanAgreementPdf } from '../utils/pdfGenerator';
import { AgreementViewerModal } from './AgreementViewerModal';
import { LoanAnalyticsChart } from './LoanAnalyticsChart';

interface AdminDashboardProps {
  applications: LoanApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, notes?: string, verifierName?: string) => void;
  onUpdateLoan?: (id: string, updatedLoan: LoanTerms, newStatus?: ApplicationStatus, notes?: string, verifierName?: string) => void;
  onRefreshData?: () => void;
  onSwitchToMobile?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  applications,
  onUpdateStatus,
  onUpdateLoan,
  onSwitchToMobile
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Selected application for side-by-side inspection modal
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);

  // Rejection/Approval modal state
  const [actionModalType, setActionModalType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionTargetApp, setActionTargetApp] = useState<LoanApplication | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [verifierName, setVerifierName] = useState('Verifikator Pusat (Senior Analyst)');

  // Modify loan modal state (Penyesuaian Plafon / Tenor)
  const [modifyLoanApp, setModifyLoanApp] = useState<LoanApplication | null>(null);
  const [editAmount, setEditAmount] = useState<number>(2000000);
  const [editTenor, setEditTenor] = useState<number>(6);
  const [editPurpose, setEditPurpose] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  // Contract viewer modal state
  const [viewContractModalOpen, setViewContractModalOpen] = useState(false);
  const [contractToView, setContractToView] = useState<LoanApplication | null>(null);

  // Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;
  const totalDisbursedAmount = applications
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.loan.loanAmount, 0);

  // Filter logic
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.nik.includes(searchQuery) ||
      app.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    const matchesDate = !dateFilter || app.createdAt.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate live loan breakdown for modification
  const calculateLoanDetails = (amount: number, tenor: number) => {
    const interestRatePercent = 20; // 20% flat per pinjaman
    const adminFeePercent = 10; // 10% biaya admin
    const adminFee = Math.round(amount * (adminFeePercent / 100));
    const totalInterest = Math.round(amount * (interestRatePercent / 100));
    const totalRepayment = amount + totalInterest;
    const weeklyInstallment = Math.round(totalRepayment / (tenor || 6));
    const tenorMonths = Math.max(1, Math.round((tenor || 6) / 4));
    const monthlyInstallment = Math.round(weeklyInstallment * 4);
    return {
      interestRatePercent,
      adminFeePercent,
      adminFee,
      totalInterest,
      totalRepayment,
      weeklyInstallment,
      tenorMonths,
      monthlyInstallment
    };
  };

  // Open action confirmation (Approve / Reject)
  const handleOpenAction = (type: 'APPROVE' | 'REJECT', target?: LoanApplication) => {
    const appToActOn = target || selectedApp;
    if (!appToActOn) return;
    setActionTargetApp(appToActOn);
    setActionModalType(type);
    if (type === 'APPROVE') {
      setActionNotes(
        appToActOn.loan.isModifiedByAdmin
          ? `Pinjaman disetujui (ACC) dengan penyesuaian plafon ${formatRupiah(appToActOn.loan.loanAmount)}. Berkas identitas, agunan, dan tanda tangan digital terverifikasi sah.`
          : 'Pinjaman disetujui (ACC). Seluruh berkas identitas (KTP, KK, Selfie Liveness) dan e-Signature dinyatakan valid.'
      );
    } else {
      setActionNotes('Pengajuan pinjaman ditolak karena terdapat ketidaksesuaian data identitas atau kapasitas bayar tidak mencukupi.');
    }
  };

  // Confirm approve / reject action
  const handleConfirmAction = () => {
    const target = actionTargetApp || selectedApp;
    if (!target || !actionModalType) return;
    onUpdateStatus(target.id, actionModalType, actionNotes, verifierName);

    // Update locally in selectedApp as well if it's the target
    if (selectedApp && selectedApp.id === target.id) {
      setSelectedApp({
        ...selectedApp,
        status: actionModalType,
        verificationNotes: actionNotes,
        verifiedBy: verifierName,
        verifiedAt: new Date().toISOString()
      });
    }

    setActionModalType(null);
    setActionTargetApp(null);
  };

  // Open loan modification modal
  const handleOpenModifyLoan = (app: LoanApplication) => {
    setModifyLoanApp(app);
    setEditAmount(app.loan.loanAmount);
    setEditTenor(app.loan.tenorWeeks || 6);
    setEditPurpose(app.loan.purpose || 'Modal Usaha / Kebutuhan Finansial');
    setEditReason(
      app.loan.modificationReason ||
      'Plafon pinjaman disesuaikan sesuai evaluasi kapasitas bayar nasabah dan verifikasi berkas'
    );
  };

  // Save modified loan terms (optionally ACC directly)
  const handleSaveLoanModification = (andApprove: boolean = false) => {
    if (!modifyLoanApp) return;

    const calc = calculateLoanDetails(editAmount, editTenor);
    const updatedLoanTerms: LoanTerms = {
      ...modifyLoanApp.loan,
      loanAmount: editAmount,
      tenorWeeks: editTenor,
      tenorMonths: calc.tenorMonths,
      weeklyInstallment: calc.weeklyInstallment,
      monthlyInstallment: calc.monthlyInstallment,
      adminFee: calc.adminFee,
      totalRepayment: calc.totalRepayment,
      purpose: editPurpose || modifyLoanApp.loan.purpose,
      originalLoanAmount: modifyLoanApp.loan.originalLoanAmount || modifyLoanApp.loan.loanAmount,
      originalTenorWeeks: modifyLoanApp.loan.originalTenorWeeks || modifyLoanApp.loan.tenorWeeks,
      isModifiedByAdmin: true,
      modifiedAt: new Date().toISOString(),
      modificationReason: editReason || 'Plafon pinjaman disesuaikan oleh analis verifikator'
    };

    const newStatus: ApplicationStatus | undefined = andApprove ? 'APPROVED' : undefined;
    const notesText = andApprove
      ? `Plafon pinjaman disesuaikan menjadi ${formatRupiah(editAmount)} (${editTenor} minggu) dan RESMI DISETUJUI (ACC). Alasan: ${editReason || '-'}`
      : `Plafon pinjaman disesuaikan menjadi ${formatRupiah(editAmount)} (${editTenor} minggu). Alasan: ${editReason || '-'}`;

    if (onUpdateLoan) {
      onUpdateLoan(modifyLoanApp.id, updatedLoanTerms, newStatus, notesText, verifierName);
    } else {
      onUpdateStatus(modifyLoanApp.id, newStatus || modifyLoanApp.status, notesText, verifierName);
    }

    // Update locally in selectedApp if it matches
    if (selectedApp && selectedApp.id === modifyLoanApp.id) {
      setSelectedApp({
        ...selectedApp,
        loan: updatedLoanTerms,
        ...(newStatus ? { status: newStatus } : {}),
        verificationNotes: notesText,
        verifiedBy: verifierName,
        verifiedAt: new Date().toISOString()
      });
    }

    // Update contractToView if active
    if (contractToView && contractToView.id === modifyLoanApp.id) {
      setContractToView({
        ...contractToView,
        loan: updatedLoanTerms,
        ...(newStatus ? { status: newStatus } : {}),
        verificationNotes: notesText
      });
    }

    setModifyLoanApp(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Fast Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Panel Verifikasi Berkas - PM Mitra Sejahtera Bersama
              </h1>
              <p className="text-xs text-slate-400">
                Pemeriksaan Berkas Nasabah PM Mitra Sejahtera Bersama (KTP, KK, Selfie Liveness, WebAuthn & e-Signature)
              </p>
            </div>
          </div>
        </div>

        {onSwitchToMobile && (
          <button
            onClick={onSwitchToMobile}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold border border-slate-700 shadow-md transition"
          >
            <span>📱 Buka Form Nasabah (HP View)</span>
          </button>
        )}
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-medium block mb-1">Total Pengajuan</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Berkas</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 bg-amber-950/10">
          <span className="text-[11px] text-amber-400 font-medium block mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Menunggu Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">{pendingCount}</span>
            <span className="text-[10px] text-amber-400/80 font-mono">Pending</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 bg-emerald-950/10">
          <span className="text-[11px] text-emerald-400 font-medium block mb-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Disetujui
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-300">{approvedCount}</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Approved</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 bg-rose-950/10">
          <span className="text-[11px] text-rose-400 font-medium block mb-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-300">{rejectedCount}</span>
            <span className="text-[10px] text-rose-400/80 font-mono">Rejected</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-900 border border-blue-500/30 rounded-2xl p-4 bg-blue-950/10">
          <span className="text-[11px] text-blue-400 font-medium block mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Plafon Disalurkan
          </span>
          <div className="text-lg font-bold text-blue-300 font-mono">
            {formatRupiah(totalDisbursedAmount)}
          </div>
        </div>
      </div>

      {/* Loan Analytics Visualization: Approved vs Rejected */}
      <LoanAnalyticsChart applications={applications} />

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nama Nasabah, NIK, No Kontrak..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Tabs / Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status === 'ALL'
                  ? 'Semua Berkas'
                  : status === 'PENDING'
                  ? '⏳ Pending'
                  : status === 'APPROVED'
                  ? '✓ Disetujui'
                  : '✕ Ditolak'}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="p-2 text-slate-400 hover:text-white"
                title="Hapus filter tanggal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Kontrak / ID</th>
                <th className="py-3.5 px-4">Nasabah</th>
                <th className="py-3.5 px-4">Plafon & Tenor</th>
                <th className="py-3.5 px-4">Otentikasi Biometrik</th>
                <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white">{app.contractNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{app.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{app.applicant.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIK: {app.applicant.nik}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold">
                          {app.applicant.familyMemberCount || 1} Jiwa
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${app.applicant.otherLoansCount === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {app.applicant.otherLoansCount === 0 ? '0 Pinj. Lain' : `${app.applicant.otherLoansCount} Pinj. Lain`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400 font-mono">
                        {formatRupiah(app.loan.loanAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tenor: {app.loan.tenorWeeks ? `${app.loan.tenorWeeks} Minggu` : `${app.loan.tenorMonths} Bulan`} ({formatRupiah(app.loan.weeklyInstallment || app.loan.monthlyInstallment || 0)}/{app.loan.tenorWeeks ? 'mgg' : 'bln'})
                      </div>
                      {app.loan.isModifiedByAdmin && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Plafon Disesuaikan
                          </span>
                          <span className="block text-[9px] text-slate-400">
                            Semula: {formatRupiah(app.loan.originalLoanAmount || 0)}
                          </span>
                        </div>
                      )}
                      {app.collateral && app.collateral.type !== 'NONE' ? (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[150px]">
                            <Shield className="w-2.5 h-2.5 shrink-0" />
                            {app.collateral.title}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-0.5">
                          <span className="text-[9px] text-slate-500">Tanpa Agunan</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.biometric.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          <ShieldCheck className="w-3 h-3" /> FIDO2 Biometrik
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                          Simulasi / Fallback
                        </span>
                      )}
                      {app.locationTag && (
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-sky-400 font-mono">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-sky-400" />
                          <span className="truncate max-w-[120px]" title={app.locationTag.address}>
                            GPS ±{app.locationTag.accuracy}m
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{formatDateIndo(app.createdAt)}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(app.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {app.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Menunggu Verifikasi
                        </span>
                      )}
                      {app.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> Disetujui (ACC)
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[220px]">
                        {/* ACC Option */}
                        <button
                          onClick={() => handleOpenAction('APPROVE', app)}
                          title="ACC / Setujui Pinjaman"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          ACC
                        </button>

                        {/* Tolak Option */}
                        <button
                          onClick={() => handleOpenAction('REJECT', app)}
                          title="Tolak Pengajuan"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Tolak
                        </button>

                        {/* Ubah Pinjaman Option */}
                        <button
                          onClick={() => handleOpenModifyLoan(app)}
                          title="Ubah Plafon / Tenor Pinjaman"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold transition shadow-sm"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Ubah
                        </button>

                        {/* Periksa Berkas Lengkap */}
                        <button
                          onClick={() => setSelectedApp(app)}
                          title="Periksa Seluruh Berkas Nasabah"
                          className="p-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Surat Perjanjian */}
                        <button
                          onClick={() => {
                            setContractToView(app);
                            setViewContractModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shadow-sm"
                          title="Lihat Surat Perjanjian Pinjaman"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                    Tidak ada berkas pengajuan yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          DETAIL PEMERIKSAAN BERKAS MODAL (SIDE-BY-SIDE INSPECTION)
      ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pemeriksaan Berkas: {selectedApp.applicant.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    NIK: {selectedApp.applicant.nik} | No Kontrak: {selectedApp.contractNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SIDE-BY-SIDE DOKUMEN PREVIEW (KTP, KK, SELFIE) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Pratinjau Berkas Dokumen Bersisian (Side-by-Side Comparison)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Foto KTP */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">1. Foto e-KTP Asli</span>
                      <span className="text-[10px] text-blue-400 font-mono">Identitas Utama</span>
                    </div>
                    <div className="h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      {selectedApp.documents.ktpUrl ? (
                        <img
                          src={selectedApp.documents.ktpUrl}
                          alt="KTP Nasabah"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Tidak ada foto KTP</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      <div>Nama: <strong className="text-slate-200">{selectedApp.applicant.fullName}</strong></div>
                      <div>NIK: <strong className="text-slate-200 font-mono">{selectedApp.applicant.nik}</strong></div>
                    </div>
                  </div>

                  {/* Foto Selfie Liveness */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">2. Selfie / Liveness</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Pencocokan Wajah</span>
                    </div>
                    <div className="h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      {selectedApp.documents.selfieUrl ? (
                        <img
                          src={selectedApp.documents.selfieUrl}
                          alt="Selfie Nasabah"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Tidak ada foto selfie</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      <div>Status: <span className="text-emerald-400 font-semibold">Liveness Passed</span></div>
                      <div>Kesesuaian dengan KTP: <span className="text-blue-400 font-semibold">98.4% Matched</span></div>
                    </div>
                  </div>

                  {/* Foto KK */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">3. Kartu Keluarga (KK)</span>
                      <span className="text-[10px] text-sky-400 font-mono">No: {selectedApp.applicant.kkNumber}</span>
                    </div>
                    <div className="h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      {selectedApp.documents.kkUrl ? (
                        <img
                          src={selectedApp.documents.kkUrl}
                          alt="KK Nasabah"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Tidak ada foto KK</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      <div>Alamat: <span className="text-slate-200">{selectedApp.applicant.address}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATA & DOKUMEN SAKSI / PENJAMIN */}
              {selectedApp.witness && (
                <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 bg-teal-950/10">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-400" />
                      Data & Verifikasi Dokumen Saksi / Penjamin
                    </h4>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-semibold">
                      Saksi Terdaftar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Ringkasan Data Saksi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                        Profil Saksi
                      </span>
                      <div>
                        <span className="text-slate-400 text-[10px]">Nama Lengkap:</span>
                        <div className="font-bold text-white text-xs">{selectedApp.witness.fullName}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">NIK:</span>
                        <div className="font-mono text-slate-300 text-xs">{selectedApp.witness.nik}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Hubungan:</span>
                        <div className="text-slate-200 text-xs">{selectedApp.witness.relationship}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">No. Telepon / WA:</span>
                        <div className="text-slate-200 text-xs">{selectedApp.witness.phoneNumber}</div>
                      </div>
                    </div>

                    {/* Foto KTP Saksi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-200">Foto KTP Saksi</span>
                        <span className="text-[9px] text-teal-400">e-KTP Asli</span>
                      </div>
                      <div className="h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                        {selectedApp.documents.witnessKtpUrl ? (
                          <img
                            src={selectedApp.documents.witnessKtpUrl}
                            alt="KTP Saksi"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-500">Tidak ada foto KTP</span>
                        )}
                      </div>
                    </div>

                    {/* Foto Selfie Liveness Saksi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-200">Selfie Liveness Saksi</span>
                        <span className="text-[9px] text-emerald-400">Verified</span>
                      </div>
                      <div className="h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                        {selectedApp.documents.witnessSelfieUrl ? (
                          <img
                            src={selectedApp.documents.witnessSelfieUrl}
                            alt="Selfie Saksi"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-500">Tidak ada foto selfie</span>
                        )}
                      </div>
                    </div>

                    {/* Tanda Tangan Saksi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-teal-300">Tanda Tangan Saksi</span>
                          <span className="text-[9px] text-blue-400 font-mono">E-Sign</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-1.5 truncate">
                          Saksi: <strong className="text-white">{selectedApp.witness.fullName}</strong>
                        </p>
                        <div className="h-28 bg-white rounded-lg p-2 flex items-center justify-center border border-slate-300">
                          {selectedApp.documents.witnessSignatureUrl ? (
                            <img
                              src={selectedApp.documents.witnessSignatureUrl}
                              alt={`Tanda Tangan Saksi: ${selectedApp.witness.fullName}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum ada</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-800 text-center">
                        <span className="text-[11px] font-bold text-slate-200 block">
                          (&nbsp;{selectedApp.witness.fullName}&nbsp;)
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          NIK: {selectedApp.witness.nik}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DATA & VERIFIKASI AGUNAN / JAMINAN PINJAMAN */}
              {selectedApp.collateral && selectedApp.collateral.type !== 'NONE' ? (
                <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 bg-amber-950/10">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Data Agunan & Bukti Jaminan Fisik
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Jaminan Resmi Terikat Perjanjian Kredit
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold border border-amber-500/40">
                        {selectedApp.collateral.type === 'SERTIFIKAT_TANAH'
                          ? 'Sertifikat Tanah (SHM/AJB)'
                          : selectedApp.collateral.type === 'BPKB_MOTOR'
                          ? 'BPKB Sepeda Motor'
                          : selectedApp.collateral.type === 'BPKB_MOBIL'
                          ? 'BPKB Mobil'
                          : 'Barang Berharga Lainnya'}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-500/30">
                        Taksiran: {formatRupiah(selectedApp.collateral.estimatedValue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Kolom 1: Profil Agunan */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                          Rincian Agunan
                        </span>
                        <div>
                          <span className="text-slate-400 text-[10px]">Nama/Objek Jaminan:</span>
                          <div className="font-bold text-white text-xs">{selectedApp.collateral.title}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">No. Dokumen / Sertifikat / BPKB:</span>
                          <div className="font-mono text-amber-300 text-xs">{selectedApp.collateral.documentNumber}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">Atas Nama Pemilik:</span>
                          <div className="text-slate-200 text-xs font-semibold">{selectedApp.collateral.ownerName}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">Kondisi & Deskripsi:</span>
                          <div className="text-slate-300 text-[11px] leading-relaxed">
                            {selectedApp.collateral.description || 'Kondisi fisik lengkap & terawat'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Coverage Agunan:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {selectedApp.loan.loanAmount > 0
                              ? `${Math.round((selectedApp.collateral.estimatedValue / selectedApp.loan.loanAmount) * 100)}% Plafon`
                              : '100%'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kolom 2: Foto Dokumen Jaminan */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-200">1. Dokumen Jaminan Asli</span>
                        <span className="text-[9px] text-amber-400 font-medium">BPKB / Sertifikat</span>
                      </div>
                      <div className="h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                        {selectedApp.documents.collateralDocUrl ? (
                          <img
                            src={selectedApp.documents.collateralDocUrl}
                            alt="Dokumen Jaminan"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-500">Belum ada foto dokumen</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1.5 truncate text-center">
                        No: {selectedApp.collateral.documentNumber}
                      </span>
                    </div>

                    {/* Kolom 3: Foto Fisik Objek Jaminan */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-200">2. Foto Fisik Objek</span>
                        <span className="text-[9px] text-emerald-400 font-medium">Fisik Asli</span>
                      </div>
                      <div className="h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                        {selectedApp.documents.collateralPhotoUrl ? (
                          <img
                            src={selectedApp.documents.collateralPhotoUrl}
                            alt="Fisik Jaminan"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-500">Belum ada foto fisik</span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1.5 text-center">
                        Taksiran: {formatRupiah(selectedApp.collateral.estimatedValue)}
                      </span>
                    </div>

                    {/* Kolom 4: Klausul Pengikatan & Sita */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-amber-300">Hak Eksekusi Agunan</span>
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3" /> Kuasa Penuh
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300 space-y-1">
                          <p>• Pihak Pertama memiliki hak eksekusi & sita langsung tanpa putusan pengadilan jika wanprestasi.</p>
                          <p>• Agunan tersimpan sebagai jaminan kredit sampai seluruh kewajiban lunas.</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Status Agunan:</span>
                        <span className="text-xs font-bold text-emerald-400">Terikat Perjanjian Sah</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span>Status Agunan: <strong>Pengajuan Tanpa Jaminan (Kredit Murni / Jaminan Moral)</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Hanya Mengikat Saksi & Tanggung Jawab Pribadi</span>
                </div>
              )}

              {/* DATA TANGGUNGAN KELUARGA, PINJAMAN TEMPAT LAIN & GEOTAGGING GPS */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Analisis Tanggungan Keluarga, Pinjaman Lain & Geotagging GPS
                  </h4>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md font-semibold border border-sky-500/30">
                    Verifikasi Resiko & Geolokasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tanggungan Keluarga */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                      Tanggungan Keluarga (KK)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        {selectedApp.applicant.familyMemberCount || 1}
                      </span>
                      <span className="text-slate-400 text-xs">Orang / Jiwa</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tercantum dalam Kartu Keluarga No. <span className="font-mono text-slate-300">{selectedApp.applicant.kkNumber}</span>
                    </p>
                  </div>

                  {/* Pinjaman di Tempat Lain */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Kewajiban di Tempat Lain
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-400">
                        {selectedApp.applicant.otherLoansCount}
                      </span>
                      <span className="text-slate-400 text-xs">Lembaga / Tempat</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Total Nominal: <strong className="text-white">{formatRupiah(selectedApp.applicant.otherLoansTotalAmount || 0)}</strong>
                    </div>
                    {selectedApp.applicant.otherLoansDetails && (
                      <p className="text-[10px] text-slate-400 italic bg-slate-950 p-1.5 rounded border border-slate-800">
                        Rincian: {selectedApp.applicant.otherLoansDetails}
                      </p>
                    )}
                  </div>

                  {/* Tagging Lokasi Geotagging GPS */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                        Geotagging Lokasi GPS
                      </span>
                      {selectedApp.locationTag ? (
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            GPS Satelit Terkunci (±{selectedApp.locationTag.accuracy}m)
                          </div>
                          <div className="font-mono text-[10px] text-sky-300">
                            Lat: {selectedApp.locationTag.latitude}, Long: {selectedApp.locationTag.longitude}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={selectedApp.locationTag.address}>
                            {selectedApp.locationTag.address}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Tidak ada data koordinat GPS saat pengajuan.
                        </div>
                      )}
                    </div>

                    {selectedApp.locationTag && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedApp.locationTag.latitude},${selectedApp.locationTag.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[10px] text-sky-400 hover:text-white bg-sky-950/60 hover:bg-sky-900 border border-sky-700/50 py-1.5 px-3 rounded-lg transition font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Buka Titik Peta Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* TANDA TANGAN & BIOMETRIK SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* E-Signature Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-xs font-bold text-white">Tanda Tangan Digital Nasabah</h5>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> UU ITE Valid
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 truncate">
                      Peminjam: <strong className="text-white">{selectedApp.applicant.fullName}</strong>
                    </p>
                    <div className="h-28 bg-white rounded-xl p-2 flex items-center justify-center border border-slate-300">
                      {selectedApp.documents.signatureUrl ? (
                        <img
                          src={selectedApp.documents.signatureUrl}
                          alt={`Tanda Tangan: ${selectedApp.applicant.fullName}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum ada tanda tangan</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-200 block">
                      (&nbsp;{selectedApp.applicant.fullName}&nbsp;)
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      NIK: {selectedApp.applicant.nik}
                    </span>
                  </div>
                </div>

                {/* Biometric FIDO2 Token Info */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white mb-1">Status Kredensial Biometrik</h5>
                    <p className="text-xs text-slate-400 mb-3">
                      Hasil verifikasi FIDO2 / WebAuthn browser pemohon sebelum dokumen disahkan:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status Autentikasi:</span>
                        <span className="text-emerald-400 font-bold">
                          {selectedApp.biometric.isVerified ? '✓ Valid (Hardware Passkey)' : 'Simulated Verification'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kredensial ID:</span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {selectedApp.biometric.credentialId || 'FID2-PREV-2026'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Waktu Verifikasi:</span>
                        <span className="text-slate-300 text-[11px]">
                          {formatDateIndo(selectedApp.biometric.verifiedAt || selectedApp.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => {
                        setContractToView(selectedApp);
                        setViewContractModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Buka Dokumen Kontrak Lengkap
                    </button>
                    <button
                      onClick={() => downloadLoanAgreementPdf(selectedApp)}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* DETAIL PINJAMAN & DATA REKENING */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                    Ringkasan Finansial & Rekening Pencairan
                  </h5>
                  <button
                    onClick={() => handleOpenModifyLoan(selectedApp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Ubah Pinjaman
                  </button>
                </div>

                {selectedApp.loan.isModifiedByAdmin && (
                  <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
                    <Sliders className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="font-bold text-amber-200 block">Plafon Pinjaman Disesuaikan Verifikator:</span>
                      <span className="text-[11px] text-slate-300">
                        Pengajuan awal nasabah: <strong>{formatRupiah(selectedApp.loan.originalLoanAmount || selectedApp.loan.loanAmount)}</strong> ({selectedApp.loan.originalTenorWeeks || selectedApp.loan.tenorWeeks} Mgg).
                        {selectedApp.loan.modificationReason && ` Catatan: "${selectedApp.loan.modificationReason}"`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Plafon Pokok:</span>
                    <strong className="text-white text-sm font-mono">{formatRupiah(selectedApp.loan.loanAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tenor & Angsuran:</span>
                    <strong className="text-emerald-400">
                      {selectedApp.loan.tenorWeeks ? `${selectedApp.loan.tenorWeeks} Minggu` : `${selectedApp.loan.tenorMonths} Bulan`} ({formatRupiah(selectedApp.loan.weeklyInstallment || selectedApp.loan.monthlyInstallment || 0)}/{selectedApp.loan.tenorWeeks ? 'mgg' : 'bln'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rekening Bank:</span>
                    <strong className="text-white">{selectedApp.applicant.bankName}</strong>
                    <span className="block font-mono text-[11px] text-slate-300">{selectedApp.applicant.bankAccountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kontak Darurat:</span>
                    <span className="text-white">{selectedApp.applicant.emergencyContactName}</span>
                    <span className="block text-[11px] text-slate-400">{selectedApp.applicant.emergencyContactPhone}</span>
                  </div>
                </div>
              </div>

              {/* CURRENT VERIFICATION STATUS & NOTES */}
              {selectedApp.verificationNotes && (
                <div className={`p-4 rounded-2xl border ${
                  selectedApp.status === 'APPROVED'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}>
                  <span className="text-xs font-bold block mb-1">
                    Catatan Verifikator ({selectedApp.verifiedBy || 'Tim Analis'} - {formatDateIndo(selectedApp.verifiedAt || '')}):
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedApp.verificationNotes}</p>
                </div>
              )}
            </div>

            {/* Footer Decision Controls (Approve / Reject / Ubah) */}
            <div className="px-6 py-4 bg-slate-800/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status Dokumen:</span>
                {selectedApp.status === 'PENDING' && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                    Menunggu Keputusan Verifikator
                  </span>
                )}
                {selectedApp.status === 'APPROVED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    Berkas Disetujui (ACC)
                  </span>
                )}
                {selectedApp.status === 'REJECTED' && (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                    Berkas Ditolak
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenAction('REJECT', selectedApp)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Berkas
                </button>
                <button
                  onClick={() => handleOpenModifyLoan(selectedApp)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
                >
                  <Sliders className="w-4 h-4" />
                  Ubah Pinjaman
                </button>
                <button
                  onClick={() => handleOpenAction('APPROVE', selectedApp)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  ACC Pinjaman (Setujui)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL CONFIRM DECISION (ACC / TOLAK)
      ======================================================== */}
      {actionModalType && (actionTargetApp || selectedApp) && (() => {
        const target = actionTargetApp || selectedApp!;
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  actionModalType === 'APPROVE'
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'bg-rose-600/20 text-rose-400'
                }`}>
                  {actionModalType === 'APPROVE' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {actionModalType === 'APPROVE' ? 'Konfirmasi ACC / Persetujuan Pinjaman' : 'Konfirmasi Penolakan Berkas'}
                  </h4>
                  <p className="text-xs text-slate-400">{target.applicant.fullName} ({target.contractNumber})</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nama Petugas Verifikator:
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Catatan / Alasan {actionModalType === 'APPROVE' ? 'Persetujuan' : 'Penolakan Berkas'}:
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Tuliskan catatan verifikasi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setActionModalType(null);
                    setActionTargetApp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition ${
                    actionModalType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                  }`}
                >
                  {actionModalType === 'APPROVE' ? 'ACC Sekarang' : 'Tolak Berkas Ini'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL UBAH PINJAMAN (PENYESUAIAN PLAFON & TENOR VERIFIKATOR)
      ======================================================== */}
      {modifyLoanApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    Ubah Ketentuan Pinjaman
                  </h4>
                  <p className="text-xs text-slate-400">
                    Nasabah: <strong className="text-slate-200">{modifyLoanApp.applicant.fullName}</strong> • {modifyLoanApp.contractNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModifyLoanApp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Request Info */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Pengajuan Awal Nasabah:</span>
                <strong className="text-slate-200 text-sm font-mono">
                  {formatRupiah(modifyLoanApp.loan.originalLoanAmount || modifyLoanApp.loan.loanAmount)}
                </strong>
                <span className="text-slate-400 ml-2">({modifyLoanApp.loan.originalTenorWeeks || modifyLoanApp.loan.tenorWeeks} Minggu)</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Angsuran Awal:</span>
                <span className="font-mono text-slate-300">
                  {formatRupiah(modifyLoanApp.loan.weeklyInstallment)}/mgg
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Input Plafon Pinjaman */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Plafon Pinjaman Baru (Rp):
                  </label>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {formatRupiah(editAmount)}
                  </span>
                </div>
                
                {/* Number input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Rp</span>
                  <input
                    type="number"
                    step={100000}
                    min={500000}
                    max={20000000}
                    value={editAmount}
                    onChange={(e) => setEditAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                {/* Preset Plafon Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[500000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        editAmount === amt
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenor Minggu Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jangka Waktu / Tenor Pinjaman:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[4, 6, 8, 10, 12].map((weeks) => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => setEditTenor(weeks)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                        editTenor === weeks
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div>{weeks} Mgg</div>
                      <div className="text-[9px] opacity-75 font-normal">{Math.round(weeks / 4)} Bln</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Keperluan Pinjaman */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Keperluan Pinjaman:
                </label>
                <input
                  type="text"
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  placeholder="Contoh: Tambahan Modal Usaha / Kebutuhan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Catatan / Alasan Penyesuaian Verifikator */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Catatan / Alasan Verifikator Mengubah Pinjaman:
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Contoh: Plafon disesuaikan dengan kapasitas pendapatan bersih dan evaluasi tanggungan nasabah..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* LIVE SIMULATION BOX */}
              {(() => {
                const calc = calculateLoanDetails(editAmount, editTenor);
                return (
                  <div className="p-3.5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold pb-2 border-b border-slate-800">
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        Kalkulasi Baru yang Diterapkan:
                      </span>
                      <span className="text-emerald-400 font-mono text-sm">
                        {formatRupiah(editAmount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Bunga (20%):</span>
                        <span className="text-slate-200 font-mono">{formatRupiah(calc.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Biaya Admin (10%):</span>
                        <span className="text-slate-200 font-mono">{formatRupiah(calc.adminFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Pengembalian:</span>
                        <span className="text-slate-200 font-mono font-bold">{formatRupiah(calc.totalRepayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Diterima Bersih:</span>
                        <span className="text-emerald-300 font-mono font-bold">{formatRupiah(editAmount - calc.adminFee)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-300 font-bold">Angsuran Mingguan Baru:</span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {formatRupiah(calc.weeklyInstallment)} <span className="text-[10px] font-normal text-slate-400">/ minggu ({editTenor}x)</span>
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug pt-1">
                      Perubahan ini otomatis diperbarui pada <strong>Pasal 1, 2, dan 3</strong> Surat Perjanjian Pinjaman dan berkas PDF cetak.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModifyLoanApp(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={() => handleSaveLoanModification(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition shadow"
              >
                Simpan (Status Tetap)
              </button>

              <button
                type="button"
                onClick={() => handleSaveLoanModification(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition"
              >
                <CheckCircle className="w-4 h-4" />
                ACC Pinjaman Baru (Setujui)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {contractToView && (
        <AgreementViewerModal
          isOpen={viewContractModalOpen}
          onClose={() => {
            setViewContractModalOpen(false);
            setContractToView(null);
          }}
          application={contractToView}
        />
      )}
    </div>
  );
};
