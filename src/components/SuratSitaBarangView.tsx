import React, { useState, useMemo } from 'react';
import { 
  FileWarning, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Car, 
  Building, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Eye, 
  X, 
  ShieldAlert, 
  MapPin, 
  Download,
  HelpCircle,
  FileCheck2,
  ExternalLink,
  Edit3,
  Loader2,
  Send,
  Camera,
  Stamp,
  PenTool,
  Upload,
  RefreshCw,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { 
  SuratSitaRecord, 
  SitaStatus, 
  LoanApplication, 
  AuthUser, 
  CollateralType 
} from '../types';
import { formatRupiah, formatDateIndo, downloadSuratSitaPdf } from '../utils/pdfGenerator';
import { 
  sampleSignatureSvg, 
  sampleWitnessSignatureSvg, 
  sampleBpkbMotorSvg, 
  sampleBpkbMobilSvg, 
  sampleSertifikatTanahSvg, 
  sampleBarangLainnyaSvg,
  sampleKtpSvg,
  sampleSelfieSvg,
  sampleWitnessSelfieSvg,
  generateEmeteraiSvg
} from '../data/initialData';
import { SignatureCanvasModal } from './SignatureCanvasModal';
import { PhotoUploadCard } from './PhotoUploadCard';
import { EmeteraiBadge } from './EmeteraiBadge';
import { EditSitaPhotosSignModal } from './EditSitaPhotosSignModal';

interface SuratSitaBarangViewProps {
  applications: LoanApplication[];
  suratSitaList: SuratSitaRecord[];
  onSaveSuratSita: (item: SuratSitaRecord) => void;
  onDeleteSuratSita: (id: string) => void;
  onUpdateSuratSitaStatus: (id: string, newStatus: SitaStatus) => void;
  currentUser: AuthUser;
}

export const SuratSitaBarangView: React.FC<SuratSitaBarangViewProps> = ({
  applications,
  suratSitaList,
  onSaveSuratSita,
  onDeleteSuratSita,
  onUpdateSuratSitaStatus,
  currentUser
}) => {
  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SitaStatus>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SuratSitaRecord | null>(null);
  const [viewMode, setViewMode] = useState<'filled' | 'blank'>('filled');

  // Modal for editing photos & signatures on existing record
  const [editingRecordForPhotosSign, setEditingRecordForPhotosSign] = useState<SuratSitaRecord | null>(null);

  // Lightbox Zoom modal for photos
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Interactive Signature Canvas modal for Create Form
  const [formSigModalConfig, setFormSigModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    roleSubtitle: string;
    withEmeterai: boolean;
    currentSignature: string;
    targetRole: 'officer' | 'witness' | 'debtor';
  }>({
    isOpen: false,
    title: '',
    roleSubtitle: '',
    withEmeterai: false,
    currentSignature: '',
    targetRole: 'debtor'
  });

  // Form State for Creating New Surat Sita
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [formData, setFormData] = useState<{
    letterNumber: string;
    contractNumber: string;
    executionDate: string;
    status: SitaStatus;
    // Debtor
    debtorName: string;
    debtorNik: string;
    debtorPhone: string;
    debtorAddress: string;
    emergencyContact: string;
    debtorKtpPhoto: string;
    debtorBorrowerPhoto: string;
    // Financials
    principalRemaining: number;
    interestDue: number;
    penaltyFee: number;
    overdueDays: number;
    warningLettersIssued: string;
    // Collateral
    collateralType: CollateralType;
    collateralTitle: string;
    collateralOwner: string;
    collateralDocNo: string;
    collateralDescription: string;
    collateralValue: number;
    collateralPhotoUrl: string;
    collateralDocUrl: string;
    seizureConditionNotes: string;
    storageLocation: string;
    // Officer & Witness
    officerName: string;
    officerId: string;
    officerTitle: string;
    officerSignature: string;
    witnessName: string;
    witnessNik: string;
    witnessRelation: string;
    witnessPhone: string;
    witnessPhoto: string;
    witnessSignature: string;
    // Debtor Signature & e-Meterai 10000
    debtorSignature: string;
    hasEmeterai: boolean;
    emeteraiSerial: string;
    notes: string;
    redemptionDeadlineDays: number;
  }>({
    letterNumber: `BA-SITA/PMSB/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`,
    contractNumber: '',
    executionDate: new Date().toISOString().split('T')[0],
    status: 'DITERBITKAN',
    debtorName: '',
    debtorNik: '',
    debtorPhone: '',
    debtorAddress: '',
    emergencyContact: '',
    debtorKtpPhoto: sampleKtpSvg,
    debtorBorrowerPhoto: sampleSelfieSvg,
    principalRemaining: 10000000,
    interestDue: 1500000,
    penaltyFee: 500000,
    overdueDays: 45,
    warningLettersIssued: 'SP 1, SP 2, dan SP 3 / Somasi Terakhir',
    collateralType: 'BPKB_MOTOR',
    collateralTitle: 'Sepeda Motor Honda Vario 160',
    collateralOwner: '',
    collateralDocNo: 'BPKB No. M-8891283 / Plat B 4821 TKQ',
    collateralDescription: 'Warna Hitam, No. Rangka & No. Mesin tertera di BPKB, STNK Asli, Kunci Kontak',
    collateralValue: 18000000,
    collateralPhotoUrl: sampleBpkbMotorSvg,
    collateralDocUrl: sampleBpkbMotorSvg,
    seizureConditionNotes: 'Unit kendaraan dalam kondisi hidup normal, bodi terawat, kelengkapan surat STNK & Kunci diserahkan.',
    storageLocation: 'Pool & Gudang Penyimpanan Aset Jaminan PM Mitra Sejahtera Bersama, Jl. Gatot Subroto Kav. 45 Jakarta',
    officerName: currentUser.displayName || 'Hendra Wijaya, S.H.',
    officerId: currentUser.employeeId || 'PMSB-REC-008',
    officerTitle: 'Tim Eksekusi Agunan & Remedial',
    officerSignature: sampleSignatureSvg,
    witnessName: 'Ketua Lingkungan Setempat',
    witnessNik: '3174051904850002',
    witnessRelation: 'Ketua RT / Saksi Wilayah',
    witnessPhone: '081299881122',
    witnessPhoto: sampleWitnessSelfieSvg,
    witnessSignature: sampleWitnessSignatureSvg,
    debtorSignature: sampleSignatureSvg,
    hasEmeterai: true,
    emeteraiSerial: `2026-PMSB-EMET10K-${Math.floor(1000000 + Math.random() * 9000000)}`,
    notes: 'Penyitaan jaminan dilakukan berdasarkan klausul wanprestasi pada Surat Perjanjian Pinjaman dan keterlambatan melampaui batas toleransi.',
    redemptionDeadlineDays: 14
  });

  // Handle choosing an existing loan application
  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    if (!appId) return;

    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const defaultCollateralPhoto = targetApp.documents.collateralPhotoUrl || 
      (targetApp.collateral?.type === 'BPKB_MOTOR' ? sampleBpkbMotorSvg :
       targetApp.collateral?.type === 'BPKB_MOBIL' ? sampleBpkbMobilSvg :
       targetApp.collateral?.type === 'SERTIFIKAT_TANAH' ? sampleSertifikatTanahSvg : sampleBarangLainnyaSvg);

    const defaultCollateralDoc = targetApp.documents.collateralDocUrl || defaultCollateralPhoto;

    setFormData(prev => ({
      ...prev,
      contractNumber: targetApp.contractNumber,
      debtorName: targetApp.applicant.fullName,
      debtorNik: targetApp.applicant.nik,
      debtorPhone: targetApp.applicant.phoneNumber,
      debtorAddress: targetApp.applicant.address,
      emergencyContact: `${targetApp.applicant.emergencyContactName || '-'} (${targetApp.applicant.emergencyContactPhone || '-'})`,
      principalRemaining: targetApp.loan.loanAmount,
      interestDue: targetApp.loan.totalInterest,
      penaltyFee: Math.round(targetApp.loan.loanAmount * 0.05),
      collateralType: targetApp.collateral?.type || 'BPKB_MOTOR',
      collateralTitle: targetApp.collateral?.title || (targetApp.collateral?.type === 'BPKB_MOTOR' ? 'Sepeda Motor' : 'Barang Agunan Nasabah'),
      collateralOwner: targetApp.collateral?.ownerName || targetApp.applicant.fullName,
      collateralDocNo: targetApp.collateral?.documentNumber || 'Terdaftar di Berkas Kantor',
      collateralDescription: targetApp.collateral?.description || 'Kondisi barang sesuai data verifikasi awal',
      collateralValue: targetApp.collateral?.estimatedValue || (targetApp.loan.loanAmount * 1.3),
      collateralPhotoUrl: defaultCollateralPhoto,
      collateralDocUrl: defaultCollateralDoc,
      debtorKtpPhoto: targetApp.documents.ktpUrl || sampleKtpSvg,
      debtorBorrowerPhoto: targetApp.documents.selfieUrl || sampleSelfieSvg,
      witnessName: targetApp.witness?.fullName || prev.witnessName,
      witnessNik: targetApp.witness?.nik || prev.witnessNik,
      witnessRelation: targetApp.witness?.relationship || prev.witnessRelation,
      witnessPhone: targetApp.witness?.phoneNumber || prev.witnessPhone,
      witnessPhoto: targetApp.documents.witnessSelfieUrl || targetApp.documents.witnessKtpUrl || sampleWitnessSelfieSvg,
      witnessSignature: targetApp.signatures.witnessSignatureUrl || sampleWitnessSignatureSvg,
      debtorSignature: targetApp.signatures.applicantSignatureUrl || sampleSignatureSvg,
      officerSignature: targetApp.signatures.analystSignatureUrl || sampleSignatureSvg,
      hasEmeterai: true
    }));
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return suratSitaList.filter(item => {
      const matchSearch = 
        item.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.debtor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collateral.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collateral.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [suratSitaList, searchQuery, statusFilter]);

  // Calculations for summary cards
  const stats = useMemo(() => {
    const totalCount = suratSitaList.length;
    const executedCount = suratSitaList.filter(s => s.status === 'TEREKSEKUSI').length;
    const issuedCount = suratSitaList.filter(s => s.status === 'DITERBITKAN').length;
    const totalCollateralValue = suratSitaList.reduce((acc, s) => acc + (s.collateral.estimatedValue || 0), 0);
    const totalDebt = suratSitaList.reduce((acc, s) => acc + (s.financials.totalOverdueDebt || 0), 0);

    return { totalCount, executedCount, issuedCount, totalCollateralValue, totalDebt };
  }, [suratSitaList]);

  // Submit new Surat Sita
  const handleSubmitNewSita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.debtorName || !formData.collateralTitle) {
      alert('Mohon lengkapi Nama Debitur dan Nama Barang Agunan!');
      return;
    }

    const totalOverdue = Number(formData.principalRemaining) + Number(formData.interestDue) + Number(formData.penaltyFee);

    const newRecord: SuratSitaRecord = {
      id: `sita-${Date.now()}`,
      letterNumber: formData.letterNumber,
      contractNumber: formData.contractNumber || `SPP/PINJ/${new Date().getFullYear()}/MN/${Math.floor(100 + Math.random() * 900)}`,
      applicationId: selectedAppId || undefined,
      createdAt: new Date().toISOString(),
      executionDate: formData.executionDate,
      status: formData.status,
      debtor: {
        fullName: formData.debtorName,
        nik: formData.debtorNik,
        phoneNumber: formData.debtorPhone,
        address: formData.debtorAddress,
        emergencyContactName: formData.emergencyContact,
        ktpPhotoUrl: formData.debtorKtpPhoto || undefined,
        borrowerPhotoUrl: formData.debtorBorrowerPhoto || undefined
      },
      financials: {
        principalRemaining: Number(formData.principalRemaining),
        interestDue: Number(formData.interestDue),
        penaltyFee: Number(formData.penaltyFee),
        totalOverdueDebt: totalOverdue,
        overdueDays: Number(formData.overdueDays),
        warningLettersIssued: formData.warningLettersIssued
      },
      collateral: {
        type: formData.collateralType,
        title: formData.collateralTitle,
        ownerName: formData.collateralOwner || formData.debtorName,
        documentNumber: formData.collateralDocNo,
        description: formData.collateralDescription,
        estimatedValue: Number(formData.collateralValue),
        collateralPhotoUrl: formData.collateralPhotoUrl,
        collateralDocUrl: formData.collateralDocUrl,
        seizureConditionNotes: formData.seizureConditionNotes,
        storageLocation: formData.storageLocation
      },
      officer: {
        name: formData.officerName,
        employeeId: formData.officerId,
        roleTitle: formData.officerTitle,
        signatureUrl: formData.officerSignature || sampleSignatureSvg
      },
      witness: {
        name: formData.witnessName,
        nik: formData.witnessNik,
        relationship: formData.witnessRelation,
        phone: formData.witnessPhone,
        witnessPhotoUrl: formData.witnessPhoto || undefined,
        signatureUrl: formData.witnessSignature || sampleWitnessSignatureSvg
      },
      debtorSignatureUrl: formData.debtorSignature || undefined,
      emeterai: formData.hasEmeterai ? {
        hasEmeterai: true,
        serialNumber: formData.emeteraiSerial,
        stampedAt: new Date().toISOString(),
        peruriCode: `PERURI-DJP-10000-${Math.floor(100000 + Math.random() * 900000)}`,
        verified: true
      } : undefined,
      notes: formData.notes,
      redemptionDeadlineDays: Number(formData.redemptionDeadlineDays)
    };

    onSaveSuratSita(newRecord);
    setIsCreateModalOpen(false);
    setSelectedRecord(newRecord);
    setViewMode('filled');
  };

  // State for exporting PDF
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExportPdf = async (record: SuratSitaRecord, isBlank = false) => {
    try {
      const idKey = record.id + (isBlank ? '_blank' : '');
      setExportingId(idKey);
      setIsExportingPdf(true);
      await downloadSuratSitaPdf(record, { blankTemplate: isBlank });
    } catch (error) {
      console.error('Gagal mengekspor dokumen PDF:', error);
      alert('Terjadi kendala saat mengekspor dokumen PDF. Anda juga dapat menggunakan opsi "Cetak" di pratinjau.');
    } finally {
      setIsExportingPdf(false);
      setExportingId(null);
    }
  };

  const handleShareWhatsApp = (record: SuratSitaRecord) => {
    const rawPhone = record.debtor.phoneNumber || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `*PEMBERITAHUAN RESMI - PM MITRA SEJAHTERA BERSAMA*\n\n` +
      `Kepada Yth. Sdr/i *${record.debtor.fullName}*,\n` +
      `No. Berkas: *${record.letterNumber}*\n` +
      `Ref Kontrak: *${record.contractNumber}*\n\n` +
      `Bersama ini disampaikan Surat Perintah & Berita Acara Penyitaan Jaminan atas objek:\n` +
      `• *${record.collateral.title}*\n` +
      `• No. Dokumen: *${record.collateral.documentNumber}*\n` +
      `• Total Kewajiban Menunggak: *${formatRupiah(record.financials.totalOverdueDebt)}*\n` +
      `• Batas Waktu Penebusan: *${record.redemptionDeadlineDays || 14} hari kalender*\n\n` +
      `Harap segera melakukan koordinasi penyelesaian dengan Bagian Remedial & Asset Recovery PM Mitra Sejahtera Bersama.`
    );
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-500/30 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-600/30 border border-rose-500/40 text-rose-300">
                <FileWarning className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Menu Berita Acara & Surat Sita Barang Agunan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Modul penerbitan resmi Surat Perintah & Berita Acara Penyitaan / Pengamanan Objek Jaminan atas nasabah yang mengalami cidera janji (wanprestasi / macet). Berlandaskan klausul hukum kontrak pinjaman PM Mitra Sejahtera Bersama, UU Jaminan Fidusia & KUHPerdata.
            </p>
          </div>

          {/* Action Buttons: Create New & Export Blanko */}
          <div className="flex flex-wrap items-center gap-2">
            {suratSitaList.length > 0 && (
              <button
                onClick={() => handleExportPdf(suratSitaList[0], true)}
                disabled={isExportingPdf && exportingId === suratSitaList[0].id + '_blank'}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition active:scale-95 whitespace-nowrap"
                title="Unduh Blanko Formulir Sita Kosong dalam Format PDF untuk Petugas Lapangan"
              >
                {isExportingPdf && exportingId === suratSitaList[0].id + '_blank' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <Download className="w-4 h-4 text-rose-400" />
                )}
                <span>Unduh Blanko (PDF)</span>
              </button>
            )}

            <button
              onClick={() => {
                // Generate fresh letter number
                setFormData(prev => ({
                  ...prev,
                  letterNumber: `BA-SITA/PMSB/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`
                }));
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-900/40 transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan Surat Sita Baru</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Berkas Sita</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Surat resmi terdata</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tereksekusi (Diamankan)</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{stats.executedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Barang di gudang kantor</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Dalam Proses Eksekusi</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">{stats.issuedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Surat tugas diterbitkan</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Nilai Agunan</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-400 mt-2 truncate">
            {formatRupiah(stats.totalCollateralValue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Taksiran nilai aset sitaan</p>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama debitur, no. surat sita, no. kontrak, atau objek agunan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['ALL', 'DITERBITKAN', 'TEREKSEKUSI', 'DRAFT', 'BATAL_LUNAS'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {status === 'ALL' && 'Semua'}
              {status === 'DITERBITKAN' && 'Diterbitkan'}
              {status === 'TEREKSEKUSI' && 'Tereksekusi'}
              {status === 'DRAFT' && 'Draft'}
              {status === 'BATAL_LUNAS' && 'Batal (Lunas)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Seizure Letters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Daftar Surat Perintah & Berita Acara Sita Agunan
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredRecords.length} berkas ditemukan
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <FileWarning className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Belum Ada Surat Sita Ditemukan</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Tidak ada data yang sesuai dengan pencarian atau filter status. Anda dapat membuat Surat Sita baru untuk debitur yang mengalami wanprestasi.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Terbitkan Surat Sita Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Surat & Kontrak</th>
                  <th className="py-3 px-4">Debitur / Nasabah</th>
                  <th className="py-3 px-4">Objek Barang Sitaan</th>
                  <th className="py-3 px-4">Total Tunggakan</th>
                  <th className="py-3 px-4">Tgl Eksekusi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-rose-300 text-xs">
                        {record.letterNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {record.contractNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{record.debtor.fullName}</span>
                        {(record.emeterai?.hasEmeterai ?? true) && (
                          <EmeteraiBadge serialNumber={record.emeterai?.serialNumber || '2026-PMSB-EMET10K-9812401'} size="sm" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">NIK: {record.debtor.nik}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{record.debtor.phoneNumber}</span>
                        {/* Photo count indicator */}
                        <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          Foto: {[record.debtor.ktpPhotoUrl, record.debtor.borrowerPhotoUrl, record.witness.witnessPhotoUrl, record.collateral.collateralPhotoUrl, record.collateral.collateralDocUrl].filter(Boolean).length}/5
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{record.collateral.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Doc: {record.collateral.documentNumber}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Taksiran: {formatRupiah(record.collateral.estimatedValue)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-rose-400">
                        {formatRupiah(record.financials.totalOverdueDebt)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Macet: {record.financials.overdueDays} hari
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {formatDateIndo(record.executionDate)}
                    </td>

                    <td className="py-3 px-4">
                      {record.status === 'TEREKSEKUSI' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Tereksekusi
                        </span>
                      )}
                      {record.status === 'DITERBITKAN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Diterbitkan
                        </span>
                      )}
                      {record.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
                          Draft
                        </span>
                      )}
                      {record.status === 'BATAL_LUNAS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Batal (Lunas)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Lihat Pratinjau Dokumen */}
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setViewMode('filled');
                          }}
                          className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition"
                          title="Lihat & Periksa Dokumen Berita Acara Sita"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Tombol Kelola Foto & TTD e-Meterai */}
                        <button
                          onClick={() => setEditingRecordForPhotosSign(record)}
                          className="p-1.5 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 transition"
                          title="Kelola Foto Dokumentasi & Tanda Tangan e-Meterai 10.000"
                        >
                          <Stamp className="w-4 h-4" />
                        </button>

                        {/* Tombol Ekspor PDF Langsung */}
                        <button
                          onClick={() => handleExportPdf(record, false)}
                          disabled={isExportingPdf && exportingId === record.id}
                          className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition disabled:opacity-50"
                          title="Ekspor ke Berkas Dokumen PDF Resmi (Dapat Langsung Dicetak atau Dikirim)"
                        >
                          {isExportingPdf && exportingId === record.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        {/* Quick toggle status */}
                        {record.status === 'DITERBITKAN' && (
                          <button
                            onClick={() => onUpdateSuratSitaStatus(record.id, 'TEREKSEKUSI')}
                            className="px-2 py-1 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 text-[10px] font-semibold transition"
                            title="Tandai Barang Sudah Disita / Diamankan ke Gudang"
                          >
                            Set Sita
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus arsip surat sita ${record.letterNumber}?`)) {
                              onDeleteSuratSita(record.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-900/40 hover:text-rose-300 border border-slate-700 transition"
                          title="Hapus Surat Sita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: FORM PEMBUATAN SURAT SITA BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-800/90 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600/30 text-rose-400">
                  <FileWarning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Terbitkan Surat Perintah & Berita Acara Sita Agunan
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Isi data kewajiban dan objek barang jaminan yang akan dieksekusi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form */}
            <form onSubmit={handleSubmitNewSita} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Option: Autofill from existing loan application */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <label className="block text-xs font-bold text-blue-300 mb-1">
                  Ambil Otomatis dari Daftar Nasabah Pinjaman (Opsional)
                </label>
                <p className="text-[11px] text-blue-200/70 mb-2">
                  Pilih nasabah untuk langsung memuat identitas, rincian BPKB/Sertifikat, foto fisik agunan, dan nomor kontrak secara otomatis.
                </p>
                <select
                  value={selectedAppId}
                  onChange={(e) => handleSelectApplication(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Nasabah Terdaftar --</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicant.fullName} - {app.contractNumber} (Agunan: {app.collateral?.title || 'Tanpa Nama Agunan'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Letter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Surat Sita</label>
                  <input
                    type="text"
                    required
                    value={formData.letterNumber}
                    onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ref. No. Kontrak Pinjaman</label>
                  <input
                    type="text"
                    required
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="SPP/PINJ/2026/..."
                    className="w-full py-1.5 px-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Rencana / Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={formData.executionDate}
                    onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Debtor Info */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Identitas Debitur / Termohon Sita
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Lengkap Debitur</label>
                    <input
                      type="text"
                      required
                      value={formData.debtorName}
                      onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">NIK (KTP)</label>
                    <input
                      type="text"
                      required
                      value={formData.debtorNik}
                      onChange={(e) => setFormData({ ...formData, debtorNik: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">No. Telepon / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={formData.debtorPhone}
                      onChange={(e) => setFormData({ ...formData, debtorPhone: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Alamat Debitur</label>
                  <input
                    type="text"
                    required
                    value={formData.debtorAddress}
                    onChange={(e) => setFormData({ ...formData, debtorAddress: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              {/* Financials & Debt */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" /> Rincian Tunggakan & Wanprestasi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Sisa Pokok (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formData.principalRemaining}
                      onChange={(e) => setFormData({ ...formData, principalRemaining: Number(e.target.value) })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tunggakan Bunga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formData.interestDue}
                      onChange={(e) => setFormData({ ...formData, interestDue: Number(e.target.value) })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Denda (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formData.penaltyFee}
                      onChange={(e) => setFormData({ ...formData, penaltyFee: Number(e.target.value) })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Hari Keterlambatan</label>
                    <input
                      type="number"
                      required
                      value={formData.overdueDays}
                      onChange={(e) => setFormData({ ...formData, overdueDays: Number(e.target.value) })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Riwayat Surat Peringatan (SP)</label>
                  <input
                    type="text"
                    value={formData.warningLettersIssued}
                    onChange={(e) => setFormData({ ...formData, warningLettersIssued: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              {/* Collateral Object Details */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" /> Objek Agunan / Barang yang Disita
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Jenis Agunan</label>
                    <select
                      value={formData.collateralType}
                      onChange={(e) => setFormData({ ...formData, collateralType: e.target.value as CollateralType })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    >
                      <option value="BPKB_MOTOR">BPKB Motor</option>
                      <option value="BPKB_MOBIL">BPKB Mobil</option>
                      <option value="SERTIFIKAT_TANAH">Sertifikat Tanah / SHM</option>
                      <option value="BARANG_LAINNYA">Barang Berharga Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama / Merk Barang</label>
                    <input
                      type="text"
                      required
                      value={formData.collateralTitle}
                      onChange={(e) => setFormData({ ...formData, collateralTitle: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">No. Dokumen / No. BPKB / Plat</label>
                    <input
                      type="text"
                      required
                      value={formData.collateralDocNo}
                      onChange={(e) => setFormData({ ...formData, collateralDocNo: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Spesifikasi & Kelengkapan yang Disita</label>
                    <input
                      type="text"
                      value={formData.collateralDescription}
                      onChange={(e) => setFormData({ ...formData, collateralDescription: e.target.value })}
                      placeholder="Warna, No Mesin/Rangka, STNK, Kunci Kontak..."
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kondisi Fisik Saat Sitaan</label>
                    <input
                      type="text"
                      value={formData.seizureConditionNotes}
                      onChange={(e) => setFormData({ ...formData, seizureConditionNotes: e.target.value })}
                      placeholder="Mulus, lecet pemakaian, mesin hidup lancar..."
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tempat Penyimpanan Aset / Gudang Penampungan</label>
                  <input
                    type="text"
                    required
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              {/* Execution Officers & Witness */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Petugas Pelaksana & Saksi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Petugas Eksekusi</label>
                    <input
                      type="text"
                      required
                      value={formData.officerName}
                      onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">NIP Petugas</label>
                    <input
                      type="text"
                      value={formData.officerId}
                      onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Status Dokumen</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as SitaStatus })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    >
                      <option value="DITERBITKAN">Diterbitkan (Surat Tugas Siap)</option>
                      <option value="TEREKSEKUSI">Tereksekusi (Barang Sudah Diamankan)</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Saksi Lapangan</label>
                    <input
                      type="text"
                      value={formData.witnessName}
                      onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Hubungan / Jabatan Saksi</label>
                    <input
                      type="text"
                      value={formData.witnessRelation}
                      onChange={(e) => setFormData({ ...formData, witnessRelation: e.target.value })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tenggang Penebusan (Hari)</label>
                    <input
                      type="number"
                      value={formData.redemptionDeadlineDays}
                      onChange={(e) => setFormData({ ...formData, redemptionDeadlineDays: Number(e.target.value) })}
                      className="w-full py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Foto Dokumentasi Bukti (5 Item) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" /> 
                    Dokumentasi Foto Bukti Sita (Upload dari Galeri / Kamera)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Sediakan foto KTP, nasabah, saksi, dan agunan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Foto KTP Peminjam */}
                  <PhotoUploadCard
                    label="1. Foto KTP Peminjam"
                    sublabel={`NIK: ${formData.debtorNik || 'Belum diisi'}`}
                    imageUrl={formData.debtorKtpPhoto}
                    badge="Identitas"
                    badgeColor="blue"
                    onUpload={(url) => setFormData(prev => ({ ...prev, debtorKtpPhoto: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, debtorKtpPhoto: '' }))}
                    onUseSample={() => setFormData(prev => ({ ...prev, debtorKtpPhoto: sampleKtpSvg }))}
                    onZoom={(url) => setZoomedImage({ url, title: 'Foto KTP Peminjam' })}
                  />

                  {/* 2. Foto Peminjam (Debitur) */}
                  <PhotoUploadCard
                    label="2. Foto Diri Peminjam"
                    sublabel={formData.debtorName ? `Peminjam: ${formData.debtorName}` : 'Pasfoto / selfie peminjam'}
                    imageUrl={formData.debtorBorrowerPhoto}
                    badge="Debitur"
                    badgeColor="emerald"
                    onUpload={(url) => setFormData(prev => ({ ...prev, debtorBorrowerPhoto: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, debtorBorrowerPhoto: '' }))}
                    onUseSample={() => setFormData(prev => ({ ...prev, debtorBorrowerPhoto: sampleSelfieSvg }))}
                    onZoom={(url) => setZoomedImage({ url, title: 'Foto Diri Peminjam (Debitur)' })}
                  />

                  {/* 3. Foto Saksi Lapangan */}
                  <PhotoUploadCard
                    label="3. Foto Saksi Lapangan"
                    sublabel={`${formData.witnessName || 'Saksi'} (${formData.witnessRelation || 'Aparat/Tokoh'})`}
                    imageUrl={formData.witnessPhoto}
                    badge="Saksi"
                    badgeColor="indigo"
                    onUpload={(url) => setFormData(prev => ({ ...prev, witnessPhoto: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, witnessPhoto: '' }))}
                    onUseSample={() => setFormData(prev => ({ ...prev, witnessPhoto: sampleWitnessSelfieSvg }))}
                    onZoom={(url) => setZoomedImage({ url, title: 'Foto Saksi Lapangan' })}
                  />

                  {/* 4. Foto Fisik Barang Sitaan */}
                  <PhotoUploadCard
                    label="4. Foto Fisik Barang Sitaan"
                    sublabel={formData.collateralTitle || 'Fisik kendaraan / agunan'}
                    imageUrl={formData.collateralPhotoUrl}
                    badge="Objek Sita"
                    badgeColor="amber"
                    onUpload={(url) => setFormData(prev => ({ ...prev, collateralPhotoUrl: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, collateralPhotoUrl: '' }))}
                    onZoom={(url) => setZoomedImage({ url, title: 'Foto Fisik Barang Sitaan' })}
                  />

                  {/* 5. Foto Dokumen Kepemilikan (BPKB/SHM) */}
                  <PhotoUploadCard
                    label="5. Dokumen Asli (BPKB/SHM)"
                    sublabel={formData.collateralDocNo || 'BPKB / Surat Kepemilikan'}
                    imageUrl={formData.collateralDocUrl}
                    badge="Dokumen"
                    badgeColor="rose"
                    onUpload={(url) => setFormData(prev => ({ ...prev, collateralDocUrl: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, collateralDocUrl: '' }))}
                    onZoom={(url) => setZoomedImage({ url, title: 'Foto Dokumen Kepemilikan Asli' })}
                  />
                </div>
              </div>

              {/* Tanda Tangan Tiga Pihak & e-Meterai Asli 10.000 */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-rose-400" /> 
                    Tanda Tangan Elektronik & Meterai Asli Rp 10.000 (UU No. 10 Th 2020)
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 py-1 px-2.5 rounded-lg border border-slate-700 text-[11px]">
                    <input
                      type="checkbox"
                      checked={formData.hasEmeterai}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasEmeterai: e.target.checked }))}
                      className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-800"
                    />
                    <span className="font-semibold text-rose-300">Wajib e-Meterai Asli 10.000</span>
                  </label>
                </div>

                {formData.hasEmeterai && (
                  <div className="space-y-2 pt-1 border-t border-slate-700/60">
                    <EmeteraiBadge serialNumber={formData.emeteraiSerial} size="md" />

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400">Nomor Seri e-Meterai:</span>
                      <input
                        type="text"
                        value={formData.emeteraiSerial}
                        onChange={(e) => setFormData(prev => ({ ...prev, emeteraiSerial: e.target.value }))}
                        className="py-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-rose-300 font-mono text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          emeteraiSerial: `2026-PMSB-EMET10K-${Math.floor(1000000 + Math.random() * 9000000)}`
                        }))}
                        className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px] font-semibold border border-slate-700 transition"
                      >
                        <RefreshCw className="w-3 h-3 text-rose-400" />
                        Acak No. Seri
                      </button>
                    </div>
                  </div>
                )}

                {/* 3 Columns Signatures: Petugas, Saksi, Peminjam */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* 1. Petugas Eksekutor */}
                  <div className="flex flex-col bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">1. Petugas Eksekutor</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Pihak I
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{formData.officerName}</p>

                    <div className="relative w-full h-24 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden">
                      {formData.officerSignature ? (
                        <img src={formData.officerSignature} alt="TTD Petugas" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Belum Ada TTD</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormSigModalConfig({
                        isOpen: true,
                        title: 'Tanda Tangan Petugas Eksekutor',
                        roleSubtitle: formData.officerName,
                        withEmeterai: false,
                        currentSignature: formData.officerSignature,
                        targetRole: 'officer'
                      })}
                      className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{formData.officerSignature ? 'Ganti TTD' : 'Tanda Tangan'}</span>
                    </button>
                  </div>

                  {/* 2. Saksi Lapangan */}
                  <div className="flex flex-col bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">2. Saksi Lapangan</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Saksi
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{formData.witnessName || 'Saksi Setempat'}</p>

                    <div className="relative w-full h-24 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden">
                      {formData.witnessSignature ? (
                        <img src={formData.witnessSignature} alt="TTD Saksi" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Belum Ada TTD</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormSigModalConfig({
                        isOpen: true,
                        title: 'Tanda Tangan Saksi Lapangan',
                        roleSubtitle: formData.witnessName || 'Saksi',
                        withEmeterai: false,
                        currentSignature: formData.witnessSignature,
                        targetRole: 'witness'
                      })}
                      className="w-full py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{formData.witnessSignature ? 'Ganti TTD' : 'Tanda Tangan'}</span>
                    </button>
                  </div>

                  {/* 3. Peminjam (Debitur) + e-Meterai 10000 */}
                  <div className="flex flex-col bg-slate-900/80 border border-rose-500/40 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 text-[11px]">3. Peminjam (Debitur)</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        + e-Meterai 10k
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{formData.debtorName || 'Debitur'}</p>

                    <div className="relative w-full h-24 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden">
                      {/* Authentic e-Meterai Background Stamp */}
                      {formData.hasEmeterai && (
                        <div className="absolute left-1 top-1 bottom-1 w-16 pointer-events-none opacity-85 flex items-center justify-center">
                          <img 
                            src={generateEmeteraiSvg(formData.emeteraiSerial)} 
                            alt="e-Meterai 10000" 
                            className="h-full object-contain"
                          />
                        </div>
                      )}
                      {formData.debtorSignature ? (
                        <img 
                          src={formData.debtorSignature} 
                          alt="TTD Debitur" 
                          className="w-full h-full object-contain relative z-10" 
                        />
                      ) : (
                        <span className="text-slate-400 text-[10px] italic relative z-10 bg-white/80 px-2 py-0.5 rounded">
                          Belum Ada TTD
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormSigModalConfig({
                        isOpen: true,
                        title: 'Tanda Tangan Peminjam (Debitur)',
                        roleSubtitle: formData.debtorName || 'Debitur',
                        withEmeterai: formData.hasEmeterai,
                        currentSignature: formData.debtorSignature,
                        targetRole: 'debtor'
                      })}
                      className="w-full py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-md shadow-rose-900/30 transition"
                    >
                      <Stamp className="w-3 h-3" />
                      <span>{formData.debtorSignature ? 'Ganti TTD di e-Meterai' : 'TTD di Atas e-Meterai'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-900/30"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Simpan & Terbitkan Surat Sita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU & CETAK BERITA ACARA SITA BARANG (RESMI) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
            
            {/* Header Control Bar (Hidden on Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-800/95 border-b border-slate-700 sticky top-0 z-20 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
                  <FileWarning className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Surat Perintah & Berita Acara Penyitaan Agunan
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedRecord.letterNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Mode Selector */}
                <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('filled')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      viewMode === 'filled' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Data Terisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('blank')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      viewMode === 'blank' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Format Blanko
                  </button>
                </div>

                {/* Tombol Kelola Foto & TTD Dokumen */}
                <button
                  type="button"
                  onClick={() => setEditingRecordForPhotosSign(selectedRecord)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-900/40 transition"
                  title="Kelola Foto Dokumentasi Bukti & Tanda Tangan e-Meterai"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Foto & TTD</span>
                </button>

                {/* Ekspor ke PDF Asli Button */}
                <button
                  type="button"
                  onClick={() => handleExportPdf(selectedRecord, viewMode === 'blank')}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition disabled:opacity-50"
                  title="Ekspor Dokumen ke Berkas PDF Resmi untuk Dicetak atau Dikirim Fisik"
                >
                  {isExportingPdf && (exportingId === selectedRecord.id || exportingId === selectedRecord.id + '_blank') ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{viewMode === 'blank' ? 'Ekspor Blanko PDF' : 'Ekspor PDF Dokumen'}</span>
                </button>

                {/* Kirim WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(selectedRecord)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition"
                  title="Kirim Pemberitahuan Surat Sita Resmi ke WhatsApp Debitur"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kirim WA</span>
                </button>

                {/* Print button */}
                <button
                  type="button"
                  onClick={printDocument}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition"
                  title="Cetak via Dialog Browser"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Sheet (Styled as Formal Indonesian Legal Document) */}
            <div className="overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 print:overflow-visible print:p-0">
              <div className="max-w-[780px] mx-auto space-y-4 print:space-y-3 font-sans text-xs sm:text-[13px] leading-relaxed">
                
                {/* Official Kop Surat */}
                <div className="border-b-4 border-double border-slate-900 pb-3 mb-4 text-center relative">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center">
                      PM
                    </div>
                    <div>
                      <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
                        PM MITRA SEJAHTERA BERSAMA
                      </h1>
                      <p className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase">
                        KOPERASI JASA KEUANGAN & PEMBIAYAAN MIKRO SYARIAH / KONVENSIONAL
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600">
                        Gedung Perkantoran Menara Sejahtera Lt. 5, Jl. Jend. Sudirman Kav. 21, Jakarta | Telp: (021) 555-9012 | Email: legal@mitrasejahtera.co.id
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1">
                  <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide text-slate-900">
                    SURAT PERINTAH & BERITA ACARA PENYERAHAN / PENYITAAN JAMINAN (AGUNAN)
                  </h2>
                  <p className="font-mono text-xs font-bold text-slate-800">
                    Nomor: {viewMode === 'blank' ? '................................................................' : selectedRecord.letterNumber}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Lampiran Berkas: Perjanjian Pinjaman Nomor {viewMode === 'blank' ? '....................................' : selectedRecord.contractNumber}
                  </p>
                </div>

                {/* Legal Preamble */}
                <p className="text-justify text-[11px] sm:text-xs text-slate-800">
                  Pada hari ini, tanggal <strong>{viewMode === 'blank' ? '..........................' : formatDateIndo(selectedRecord.executionDate)}</strong>, bertempat di alamat debitur yang sah, kami yang bertanda tangan di bawah ini:
                </p>

                {/* Part 1: First Party (Creditor / Seizure Officer) */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-bold text-slate-900">I. PIHAK PERTAMA (KREDITUR / PELAKSANA EKSEKUSI):</p>
                  <div className="grid grid-cols-4 gap-1 text-[11px]">
                    <span className="text-slate-600">Nama Petugas</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.officer.name}</span>
                    
                    <span className="text-slate-600">NIP / ID Petugas</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.officer.employeeId}</span>

                    <span className="text-slate-600">Jabatan</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.officer.roleTitle}</span>

                    <span className="text-slate-600">Instansi</span>
                    <span className="col-span-3 font-semibold text-slate-900">: PM MITRA SEJAHTERA BERSAMA</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    Bertindak untuk dan atas nama PM Mitra Sejahtera Bersama, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
                  </p>
                </div>

                {/* Part 2: Second Party (Debtor) */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-bold text-slate-900">II. PIHAK KEDUA (DEBITUR / PEMILIK JAMINAN):</p>
                  <div className="grid grid-cols-4 gap-1 text-[11px]">
                    <span className="text-slate-600">Nama Lengkap</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.debtor.fullName}</span>

                    <span className="text-slate-600">NIK (KTP)</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.debtor.nik}</span>

                    <span className="text-slate-600">No. Telepon / HP</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.debtor.phoneNumber}</span>

                    <span className="text-slate-600">Alamat Domisili</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {viewMode === 'blank' ? '...................................................................' : selectedRecord.debtor.address}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    Selaku Penerima Pinjaman / Pemberi Jaminan pada Surat Perjanjian Pinjaman No. <strong>{viewMode === 'blank' ? '......................' : selectedRecord.contractNumber}</strong>, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                  </p>
                </div>

                {/* Legal Statement & Default Details */}
                <div className="text-xs space-y-1.5 text-slate-800">
                  <p className="font-bold text-slate-900">MENYATAKAN SEBAGAI BERIKUT:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-justify text-[11px] sm:text-xs">
                    <li>
                      Bahwa PIHAK KEDUA telah mengikatkan diri dalam Surat Perjanjian Pinjaman dengan kewajiban angsuran teratur, namun hingga saat ini PIHAK KEDUA telah melakukan cidera janji (wanprestasi) dengan rincian tunggakan:
                      <div className="my-1.5 p-2 bg-rose-50 border border-rose-200 rounded font-mono text-[11px] text-rose-900 grid grid-cols-2 sm:grid-cols-4 gap-1">
                        <div>Pokok: <strong>{viewMode === 'blank' ? 'Rp ..................' : formatRupiah(selectedRecord.financials.principalRemaining)}</strong></div>
                        <div>Bunga: <strong>{viewMode === 'blank' ? 'Rp ..................' : formatRupiah(selectedRecord.financials.interestDue)}</strong></div>
                        <div>Denda: <strong>{viewMode === 'blank' ? 'Rp ..................' : formatRupiah(selectedRecord.financials.penaltyFee)}</strong></div>
                        <div>Total: <strong>{viewMode === 'blank' ? 'Rp ..................' : formatRupiah(selectedRecord.financials.totalOverdueDebt)}</strong></div>
                      </div>
                    </li>
                    <li>
                      Bahwa PIHAK PERTAMA telah menyampaikan Surat Peringatan (SP 1, SP 2, SP 3 / Somasi Akhir) secara patut menurut hukum, namun kewajiban pelunasan belum diselesaikan.
                    </li>
                    <li>
                      Bahwa berdasarkan klausul Eksekusi Agunan dalam Surat Perjanjian Pinjaman dan ketentuan perundang-undangan (Undang-Undang No. 42 Tahun 1999 tentang Jaminan Fidusia dan/atau Pasal 1152 KUHPerdata), PIHAK PERTAMA berhak penuh melakukan pengamanan fisik dan penyitaan terhadap objek barang agunan di bawah ini:
                    </li>
                  </ol>
                </div>

                {/* Table of Collateral Item */}
                <div className="border border-slate-300 rounded-lg overflow-hidden my-2">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">Nama & Objek Agunan</th>
                        <th className="p-2">No. Identitas / BPKB / Plat</th>
                        <th className="p-2">Kelengkapan & Kondisi Fisik</th>
                        <th className="p-2 text-right">Taksiran Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 text-center font-bold">1</td>
                        <td className="p-2 font-bold text-slate-900">
                          {viewMode === 'blank' ? '...................................................' : selectedRecord.collateral.title}
                        </td>
                        <td className="p-2 font-mono">
                          {viewMode === 'blank' ? '...................................................' : selectedRecord.collateral.documentNumber}
                        </td>
                        <td className="p-2 text-slate-700">
                          {viewMode === 'blank' ? '...................................................' : (selectedRecord.collateral.seizureConditionNotes || selectedRecord.collateral.description)}
                        </td>
                        <td className="p-2 text-right font-bold text-emerald-800">
                          {viewMode === 'blank' ? 'Rp .......................' : formatRupiah(selectedRecord.collateral.estimatedValue)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Photo Previews if Available (Only on filled mode) */}
                {viewMode === 'filled' && (selectedRecord.collateral.collateralPhotoUrl || selectedRecord.collateral.collateralDocUrl) && (
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-[10px] space-y-1">
                    <p className="font-bold text-slate-700 uppercase">LAMPIRAN FOTO DOKUMENTASI AGUNAN & BUKTI FISIK:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedRecord.collateral.collateralPhotoUrl && (
                        <div className="border border-slate-300 rounded overflow-hidden bg-white p-1 text-center">
                          <img 
                            src={selectedRecord.collateral.collateralPhotoUrl} 
                            alt="Fisik Agunan" 
                            className="w-full h-24 object-contain mx-auto" 
                          />
                          <span className="block text-[9px] text-slate-600 font-semibold mt-0.5">Foto Fisik Agunan</span>
                        </div>
                      )}
                      {selectedRecord.collateral.collateralDocUrl && (
                        <div className="border border-slate-300 rounded overflow-hidden bg-white p-1 text-center">
                          <img 
                            src={selectedRecord.collateral.collateralDocUrl} 
                            alt="Dokumen Agunan" 
                            className="w-full h-24 object-contain mx-auto" 
                          />
                          <span className="block text-[9px] text-slate-600 font-semibold mt-0.5">Dokumen Kepemilikan</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Storage & Redemption Clause */}
                <div className="text-[11px] sm:text-xs text-slate-800 space-y-1 text-justify">
                  <p>
                    <strong>TEMPAT PENYIMPANAN & KETENTUAN PENEBUSAN:</strong>
                  </p>
                  <p>
                    1. Barang jaminan tersebut di atas telah diserah-terimakan secara sukarela/resmi untuk diamankan di gudang penyimpanan aset kreditur bertempat di: <strong>{viewMode === 'blank' ? '................................................................................................................' : selectedRecord.collateral.storageLocation}</strong>.
                  </p>
                  <p>
                    2. PIHAK KEDUA diberikan tenggang waktu selama <strong>{viewMode === 'blank' ? '.......' : (selectedRecord.redemptionDeadlineDays || 14)} hari kalender</strong> terhitung sejak berita acara ini ditandatangani untuk melunasi seluruh kewajiban tertunggak.
                  </p>
                  <p>
                    3. Apabila hingga batas waktu tersebut PIHAK KEDUA tidak menyelesaikan kewajibannya, maka PIHAK PERTAMA berhak penuh melakukan penjualan / pelelangan atas barang jaminan tersebut guna pelunasan sisa pinjaman tanpa memerlukan persetujuan tambahan dari PIHAK KEDUA.
                  </p>
                </div>

                {/* Signatures Section (3 Parties: Officer, Debtor, Witness) */}
                <div className="pt-4 border-t border-slate-300 mt-6">
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    {/* First Party (Creditor) */}
                    <div className="flex flex-col justify-between h-36">
                      <p className="font-semibold text-slate-700">
                        PIHAK PERTAMA<br />
                        <span className="text-[10px] text-slate-500">Petugas Eksekutor PM Mitra Sejahtera</span>
                      </p>
                      <div className="my-1 flex items-center justify-center">
                        {viewMode === 'filled' && selectedRecord.officer.signatureUrl ? (
                          <img src={selectedRecord.officer.signatureUrl} alt="Signature Officer" className="h-14 object-contain" />
                        ) : (
                          <div className="h-14" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold underline text-slate-900">
                          {viewMode === 'blank' ? '( ...................................... )' : selectedRecord.officer.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {viewMode === 'blank' ? 'NIP: .............................' : `NIP: ${selectedRecord.officer.employeeId}`}
                        </p>
                      </div>
                    </div>

                    {/* Witness */}
                    <div className="flex flex-col justify-between h-36">
                      <p className="font-semibold text-slate-700">
                        SAKSI LAPANGAN<br />
                        <span className="text-[10px] text-slate-500">{viewMode === 'blank' ? '(RT / RW / Tokoh Setempat)' : selectedRecord.witness.relationship}</span>
                      </p>
                      <div className="my-1 flex items-center justify-center">
                        {viewMode === 'filled' && selectedRecord.witness.signatureUrl ? (
                          <img src={selectedRecord.witness.signatureUrl} alt="Signature Witness" className="h-14 object-contain" />
                        ) : (
                          <div className="h-14" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold underline text-slate-900">
                          {viewMode === 'blank' ? '( ...................................... )' : selectedRecord.witness.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {viewMode === 'blank' ? 'NIK / Jabatan: .............' : `NIK: ${selectedRecord.witness.nik || '-'}`}
                        </p>
                      </div>
                    </div>

                    {/* Second Party (Debtor) with e-Meterai 10.000 */}
                    <div className="flex flex-col justify-between h-40 relative">
                      <p className="font-semibold text-slate-700">
                        PIHAK KEDUA<br />
                        <span className="text-[10px] text-slate-500">Debitur / Yang Menyerahkan Agunan</span>
                      </p>

                      {/* e-Meterai 10000 + Signature Container */}
                      <div className="my-1 relative flex items-center justify-center h-20 w-full overflow-hidden">
                        {viewMode === 'filled' ? (
                          <>
                            {/* Authentic e-Meterai 10.000 Official Stamp Graphic */}
                            {(selectedRecord.emeterai?.hasEmeterai ?? true) && (
                              <div className="absolute left-1/2 -translate-x-12 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none opacity-90">
                                <img 
                                  src={generateEmeteraiSvg(selectedRecord.emeterai?.serialNumber || '2026-PMSB-EMET10K-9812401')} 
                                  alt="Meterai Elektronik Asli 10000" 
                                  className="h-full object-contain filter drop-shadow-sm" 
                                />
                              </div>
                            )}

                            {/* Debtor Signature Ink Overlaid Directly Over e-Meterai */}
                            {selectedRecord.debtorSignatureUrl ? (
                              <img 
                                src={selectedRecord.debtorSignatureUrl} 
                                alt="Signature Debtor" 
                                className="h-16 object-contain relative z-10" 
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic relative z-10 bg-white/80 px-2 py-0.5 rounded">
                                (Menunggu TTD di atas e-Meterai)
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="border border-dashed border-rose-500 rounded p-1 w-28 h-16 flex flex-col items-center justify-center text-[9px] text-slate-500 text-center bg-rose-50/50">
                            <span className="font-bold text-rose-700">e-METERAI 10.000</span>
                            <span className="text-[8px] text-rose-600">TTD Menimpa Meterai</span>
                          </div>
                        )}
                      </div>

                      <div>
                        {(selectedRecord.emeterai?.hasEmeterai ?? true) && viewMode === 'filled' && (
                          <div className="text-[8px] font-mono font-bold text-rose-700 mb-0.5">
                            SN: {selectedRecord.emeterai?.serialNumber || '2026-PMSB-EMET10K-9812401'}
                          </div>
                        )}
                        <p className="font-bold underline text-slate-900">
                          {viewMode === 'blank' ? '( ...................................... )' : selectedRecord.debtor.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {viewMode === 'blank' ? 'NIK: .............................' : `NIK: ${selectedRecord.debtor.nik}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer security notes */}
                <div className="text-[9px] text-slate-400 text-center pt-3 border-t border-slate-200 mt-3 font-mono">
                  Dokumen Berita Acara Penyitaan Jaminan Sah PM Mitra Sejahtera Bersama | Dicetak secara digital melalui Sistem Terintegrasi
                </div>

                {/* HALAMAN 2: LAMPIRAN FOTO DOKUMENTASI & BUKTI FISIK EKSEKUSI */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 print:break-before-page">
                  <div className="border-b-2 border-slate-900 pb-2 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 uppercase text-xs sm:text-sm flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600 inline" />
                        LAMPIRAN BERITA ACARA: DOKUMENTASI FOTO & BUKTI FISIK EKSEKUSI
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Nomor Berkas: {selectedRecord.letterNumber} | Tanggal: {formatDateIndo(selectedRecord.executionDate)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                      Halaman 2 dari 2
                    </span>
                  </div>

                  {/* E-Meterai 10000 Compliance Verification Banner */}
                  {(selectedRecord.emeterai?.hasEmeterai ?? true) && (
                    <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-300 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-12 bg-white rounded p-0.5 border border-rose-400 shrink-0 flex items-center justify-center">
                          <img 
                            src={generateEmeteraiSvg(selectedRecord.emeterai?.serialNumber)} 
                            alt="e-Meterai 10000" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-rose-900 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                            DOKUMEN INI TELAH DILEKATKAN METERAI ELEKTRONIK ASLI RP 10.000
                          </span>
                          <p className="text-[10px] text-rose-700 font-mono">
                            No. Seri: <strong>{selectedRecord.emeterai?.serialNumber || '2026-PMSB-EMET10K-9812401'}</strong> • Validasi DJP & Peruri Terverifikasi Sah
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[9px] uppercase px-2 py-1 rounded bg-emerald-600 text-white shrink-0">
                        Sah Secara Hukum
                      </span>
                    </div>
                  )}

                  {/* 5 Foto Grid: Identitas (KTP, Peminjam, Saksi) & Agunan (Fisik, Dokumen BPKB/SHM) */}
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide mb-2">
                        A. DOKUMENTASI IDENTITAS PARA PIHAK & SAKSI:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Foto KTP Peminjam */}
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center flex flex-col justify-between">
                          <div 
                            className="h-32 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-blue-400 transition"
                            onClick={() => selectedRecord.debtor.ktpPhotoUrl && setZoomedImage({ url: selectedRecord.debtor.ktpPhotoUrl, title: 'Foto KTP Peminjam' })}
                            title="Klik untuk memperbesar foto KTP"
                          >
                            {selectedRecord.debtor.ktpPhotoUrl ? (
                              <img src={selectedRecord.debtor.ktpPhotoUrl} alt="KTP Peminjam" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada Foto KTP</span>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className="font-bold text-slate-900 text-[10px]">1. KTP ASLI PEMINJAM</p>
                            <p className="text-[9px] text-slate-500 font-mono">{selectedRecord.debtor.nik}</p>
                          </div>
                        </div>

                        {/* 2. Foto Diri / Pasfoto Peminjam */}
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center flex flex-col justify-between">
                          <div 
                            className="h-32 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-emerald-400 transition"
                            onClick={() => selectedRecord.debtor.borrowerPhotoUrl && setZoomedImage({ url: selectedRecord.debtor.borrowerPhotoUrl, title: 'Foto Peminjam (Debitur)' })}
                            title="Klik untuk memperbesar foto peminjam"
                          >
                            {selectedRecord.debtor.borrowerPhotoUrl ? (
                              <img src={selectedRecord.debtor.borrowerPhotoUrl} alt="Foto Peminjam" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada Foto Peminjam</span>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className="font-bold text-slate-900 text-[10px]">2. DIRI / PASFOTO PEMINJAM</p>
                            <p className="text-[9px] text-slate-500">{selectedRecord.debtor.fullName}</p>
                          </div>
                        </div>

                        {/* 3. Foto Saksi Lapangan */}
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center flex flex-col justify-between">
                          <div 
                            className="h-32 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-indigo-400 transition"
                            onClick={() => selectedRecord.witness.witnessPhotoUrl && setZoomedImage({ url: selectedRecord.witness.witnessPhotoUrl, title: 'Foto Saksi Lapangan' })}
                            title="Klik untuk memperbesar foto saksi"
                          >
                            {selectedRecord.witness.witnessPhotoUrl ? (
                              <img src={selectedRecord.witness.witnessPhotoUrl} alt="Foto Saksi" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada Foto Saksi</span>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className="font-bold text-slate-900 text-[10px]">3. SAKSI LAPANGAN (APARAT/TOKOH)</p>
                            <p className="text-[9px] text-slate-500">{selectedRecord.witness.name} ({selectedRecord.witness.relationship})</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide mb-2">
                        B. DOKUMENTASI OBJEK BARANG SITAAN & DOKUMEN KEPEMILIKAN:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 4. Foto Fisik Barang Sitaan */}
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center flex flex-col justify-between">
                          <div 
                            className="h-40 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-amber-400 transition"
                            onClick={() => selectedRecord.collateral.collateralPhotoUrl && setZoomedImage({ url: selectedRecord.collateral.collateralPhotoUrl, title: 'Foto Fisik Barang Sitaan' })}
                            title="Klik untuk memperbesar foto barang sitaan"
                          >
                            {selectedRecord.collateral.collateralPhotoUrl ? (
                              <img src={selectedRecord.collateral.collateralPhotoUrl} alt="Fisik Barang Sitaan" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada Foto Fisik Barang</span>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className="font-bold text-slate-900 text-[10px]">4. FOTO FISIK BARANG SITAAN (AGUNAN)</p>
                            <p className="text-[9px] text-slate-600">{selectedRecord.collateral.title} - Kondisi: {selectedRecord.collateral.seizureConditionNotes || 'Sesuai pemeriksaan'}</p>
                          </div>
                        </div>

                        {/* 5. Foto Dokumen Kepemilikan (BPKB/SHM) */}
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center flex flex-col justify-between">
                          <div 
                            className="h-40 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-rose-400 transition"
                            onClick={() => selectedRecord.collateral.collateralDocUrl && setZoomedImage({ url: selectedRecord.collateral.collateralDocUrl, title: 'Foto Dokumen Kepemilikan (BPKB/SHM)' })}
                            title="Klik untuk memperbesar foto dokumen asli"
                          >
                            {selectedRecord.collateral.collateralDocUrl ? (
                              <img src={selectedRecord.collateral.collateralDocUrl} alt="Dokumen Kepemilikan" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada Foto Dokumen</span>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className="font-bold text-slate-900 text-[10px]">5. DOKUMEN KEPEMILIKAN ASLI (BPKB / SHM)</p>
                            <p className="text-[9px] text-slate-600 font-mono">{selectedRecord.collateral.documentNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Canvas Modal for Creation Form */}
      <SignatureCanvasModal
        isOpen={formSigModalConfig.isOpen}
        title={formSigModalConfig.title}
        roleSubtitle={formSigModalConfig.roleSubtitle}
        withEmeterai={formSigModalConfig.withEmeterai}
        emeteraiSerial={formData.emeteraiSerial}
        currentSignature={formSigModalConfig.currentSignature}
        onSave={(dataUrl) => {
          if (formSigModalConfig.targetRole === 'officer') {
            setFormData(prev => ({ ...prev, officerSignature: dataUrl }));
          } else if (formSigModalConfig.targetRole === 'witness') {
            setFormData(prev => ({ ...prev, witnessSignature: dataUrl }));
          } else {
            setFormData(prev => ({ ...prev, debtorSignature: dataUrl }));
          }
        }}
        onClose={() => setFormSigModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modal for Editing Photos & Signatures on an Existing Record */}
      {editingRecordForPhotosSign && (
        <EditSitaPhotosSignModal
          isOpen={true}
          record={editingRecordForPhotosSign}
          onSave={(updatedRecord) => {
            onSaveSuratSita(updatedRecord);
            if (selectedRecord && selectedRecord.id === updatedRecord.id) {
              setSelectedRecord(updatedRecord);
            }
            setEditingRecordForPhotosSign(null);
          }}
          onClose={() => setEditingRecordForPhotosSign(null)}
          onZoomImage={(url) => setZoomedImage({ url, title: 'Pratinjau Foto Bukti Sita' })}
        />
      )}

      {/* Lightbox Modal for Zooming Photos */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-4 overflow-hidden flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <span className="font-bold text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                {zoomedImage.title}
              </span>
              <button 
                onClick={() => setZoomedImage(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-950/60 rounded-xl my-2 w-full">
              <img 
                src={zoomedImage.url} 
                alt={zoomedImage.title} 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
