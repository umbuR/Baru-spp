export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
