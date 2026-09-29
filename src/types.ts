export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type UserRole = 'KOLEKTOR' | 'ANALYST';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId: string;
  roleTitle: string;
  assignedArea: string;
  phone?: string;
  avatarUrl?: string;
}

export type CollateralType = 
  | 'NONE'
  | 'SERTIFIKAT_TANAH'
  | 'BPKB_MOTOR'
  | 'BPKB_MOBIL'
  | 'BARANG_LAINNYA';

export interface CollateralData {
  type: CollateralType;
  title: string; // e.g. "Sertifikat Hak Milik (SHM) No. 492", "BPKB Motor Honda Vario 160"
  ownerName: string; // Nama pemilik yang tertera di dokumen/surat
  documentNumber: string; // No. SHM / No. BPKB & Plat Nomor / No. Seri
  description: string; // Spesifikasi barang / luas tanah / tahun & warna kendaraan
  estimatedValue: number; // Taksiran nilai agunan (Rp)
  collateralPhotoUrl?: string; // Foto fisik barang / kendaraan / tanah
  collateralDocUrl?: string; // Foto bukti kepemilikan (BPKB / Sertifikat / Nota)
}

export interface LocationTagData {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  address: string;
  timestamp: string;
  source?: 'GPS_AUTO' | 'MANUAL_OVERRIDE';
}

export interface ApplicantData {
  fullName: string;
  nik: string; // 16 digits
  kkNumber: string; // 16 digits
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  phoneNumber: string;
  email: string;
  job: string;
  monthlyIncome: number;
  bankName: string;
  bankAccountNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Informasi Tanggungan & Kewajiban Finansial Lain
  familyMemberCount: number; // Jumlah orang / tanggungan keluarga
  otherLoansCount: number; // Jumlah tempat pinjaman lain yang masih berjalan
  otherLoansTotalAmount: number; // Total nominal pinjaman di tempat lain (Rp)
  otherLoansDetails?: string; // Rincian lembaga pinjaman lain (e.g. Bank BRI, Koperasi)
}

export interface WitnessData {
  fullName: string;
  nik: string; // 16 digits NIK Saksi
  relationship: string; // e.g. "Rekan Kerja", "Keluarga / Saudara", "Pasangan"
  phoneNumber: string;
  address?: string;
}

export interface LoanTerms {
  loanAmount: number; // e.g. Rp 500.000 s/d Rp 10.000.000
  tenorWeeks: number; // 4, 6, 8, 10, 12 minggu
  tenorMonths?: number; // fallback legacy
  interestRateAnnual: number; // e.g. 12%
  weeklyInstallment: number;
  monthlyInstallment?: number;
  adminFee: number;
  totalRepayment: number;
  purpose: string;
  originalLoanAmount?: number; // Nilai awal sebelum penyesuaian verifikator
  originalTenorWeeks?: number; // Tenor awal sebelum penyesuaian verifikator
  isModifiedByAdmin?: boolean; // Ditandai jika pinjaman disesuaikan/diubah oleh verifikator
  modifiedAt?: string;
  modificationReason?: string;
}

export interface BiometricVerification {
  isVerified: boolean;
  verifiedAt?: string;
  credentialId?: string;
  authType: 'WEBAUTHN_BIOMETRIC' | 'PIN_SIMULATED';
  deviceInfo?: string;
}

export interface StatusLogEntry {
  status: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
  previousStatus?: ApplicationStatus;
}

export interface LoanApplication {
  id: string; // e.g. "LOAN-2026-8921"
  contractNumber: string; // e.g. "SPP/PINJ/2026/IX/0042"
  createdAt: string;
  updatedAt: string;
  applicant: ApplicantData;
  witness?: WitnessData;
  loan: LoanTerms;
  collateral?: CollateralData;
  locationTag?: LocationTagData;
  documents: {
    ktpUrl: string;
    kkUrl: string;
    selfieUrl: string;
    signatureUrl: string;
    // Dokumen & Tanda Tangan Saksi
    witnessKtpUrl?: string;
    witnessSelfieUrl?: string;
    witnessSignatureUrl?: string;
    // Dokumen & Foto Agunan/Jaminan
    collateralPhotoUrl?: string;
    collateralDocUrl?: string;
  };
  biometric: BiometricVerification;
  status: ApplicationStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  statusLogs?: StatusLogEntry[];
}

export type DocumentType = 
  | 'ktp' 
  | 'kk' 
  | 'selfie' 
  | 'witness_ktp' 
  | 'witness_selfie'
  | 'collateral_doc'
  | 'collateral_photo';

export interface AdminFilters {
  searchQuery: string;
  status: 'ALL' | ApplicationStatus;
  collateralType?: 'ALL' | CollateralType;
  startDate: string;
  endDate: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export type SitaStatus = 'DRAFT' | 'DITERBITKAN' | 'TEREKSEKUSI' | 'BATAL_LUNAS';

export interface SuratSitaRecord {
  id: string;
  letterNumber: string; // e.g. "SP-SITA/PMSB/2026/IX/0012"
  contractNumber: string; // e.g. "SPP/PINJ/2026/IX/0042"
  applicationId?: string;
  createdAt: string;
  executionDate: string; // Tanggal rencana/eksekusi
  status: SitaStatus;
  
  // Data Debitur / Pihak yang Disita
  debtor: {
    fullName: string;
    nik: string;
    phoneNumber: string;
    address: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    ktpPhotoUrl?: string; // Foto KTP Peminjam
    borrowerPhotoUrl?: string; // Foto Diri / Pasfoto Peminjam
  };
  
  // Data Kewajiban / Tunggakan
  financials: {
    principalRemaining: number; // Pokok pinjaman tertunggak
    interestDue: number; // Bunga berjalan tertunggak
    penaltyFee: number; // Denda keterlambatan
    totalOverdueDebt: number; // Total tunggakan
    overdueDays: number; // Jumlah hari menunggak
    warningLettersIssued: string; // e.g. "SP 1, SP 2, dan SP 3 / Somasi Akhir"
  };

  // Data Barang Agunan / Objek Sita
  collateral: {
    type: CollateralType;
    title: string; // e.g. "Sepeda Motor Honda Vario 160cc"
    ownerName: string;
    documentNumber: string; // No. BPKB & Plat Nomor / No. SHM
    description: string; // Kondisi & kelengkapan (misal: STNK, Kunci Kontak)
    estimatedValue: number;
    collateralPhotoUrl?: string; // Foto Barang Sitaan (Fisik Agunan)
    collateralDocUrl?: string; // Foto Dokumen Kepemilikan (BPKB/SHM)
    seizureConditionNotes?: string; // Kondisi fisik saat ditarik/disita
    storageLocation: string; // e.g. "Gudang Penyimpanan Aset PM Mitra Sejahtera Bersama Cabang Jakarta Pusat"
  };

  // Petugas Pelaksana Eksekusi
  officer: {
    name: string;
    employeeId: string;
    roleTitle: string; // e.g. "Kepala Tim Remedial & Asset Recovery"
    signatureUrl?: string;
  };

  // Saksi Eksekusi Lapangan
  witness: {
    name: string;
    nik?: string;
    relationship: string; // e.g. "Ketua RT 04 / Tokoh Masyarakat / Penjamin"
    phone?: string;
    witnessPhotoUrl?: string; // Foto Saksi Lapangan
    signatureUrl?: string;
  };

  debtorSignatureUrl?: string; // TTD Peminjam

  // Fitur Materai Elektronik Asli Rp 10.000 (UU Bea Meterai No. 10 Tahun 2020)
  emeterai?: {
    hasEmeterai: boolean;
    serialNumber: string; // e.g. "2026-PMSB-EMET10K-9812401"
    stampedAt: string;
    peruriCode?: string;
    verified: boolean;
  };

  notes?: string;
  redemptionDeadlineDays?: number; // Hari batas waktu penebusan sebelum lelang (default: 14 hari)
}
