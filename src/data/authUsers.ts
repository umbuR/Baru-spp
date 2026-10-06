import { AuthUser } from '../types';

export interface PresetAccount {
  user: AuthUser;
  password: string;
  badgeColor: string;
  description: string;
  scopeSummary: string;
  permissions: string[];
}

export const PRESET_ACCOUNTS: Record<'kolektor' | 'analyst', PresetAccount> = {
  kolektor: {
    user: {
      uid: 'user_kol_088',
      email: 'kolektor@mitrasejahtera.com',
      displayName: 'Budi Santoso',
      role: 'KOLEKTOR',
      employeeId: 'KOL-MSB-2026-088',
      roleTitle: 'Petugas Kolektor & Surveyor Lapangan',
      assignedArea: 'Wilayah Jakarta Barat & Sekitarnya',
      phone: '0812-8821-9901',
    },
    password: 'kolektor123',
    badgeColor: 'emerald',
    scopeSummary: 'Hanya untuk input data pengajuan pinjaman nasabah baru di lapangan',
    description: 'Role Kolektor ditugaskan khusus untuk input data formulir pinjaman nasabah langsung dari smartphone lapangan, pengambilan foto fisik e-KTP, KK, selfie liveness, jaminan, dan tanda tangan digital.',
    permissions: [
      'Input data profil pemohon & saksi',
      'Kamera foto e-KTP, KK, & selfie liveness',
      'Dokumentasi & foto objek agunan/jaminan',
      'Tanda tangan digital (e-Signature) & WebAuthn biometrik',
      'Tag koordinat GPS lokasi nasabah secara otomatis',
      'Unduh draft surat perjanjian pinjaman digital (PDF)',
      'Akses dibatasi (tidak dapat membuka dashboard verifikator)'
    ]
  },
  analyst: {
    user: {
      uid: 'user_anl_012',
      email: 'analyst@mitrasejahtera.com',
      displayName: 'Hendra Wijaya, S.E.',
      role: 'ANALYST',
      employeeId: 'ANL-MSB-2026-012',
      roleTitle: 'Senior Credit Analyst & Verifikator Berkas',
      assignedArea: 'Divisi Manajemen Risiko & Komite Kredit Pusat',
      phone: '0811-9231-4402',
    },
    password: 'analyst123',
    badgeColor: 'indigo',
    scopeSummary: 'Dashboard Verifikator Berkas & persetujuan perjanjian pinjaman',
    description: 'Role Analyst memiliki kewenangan penuh untuk meninjau berkas permohonan kredit, pencocokan data KTP vs selfie liveness, penilaian kelayakan agunan, penyesuaian plafon/tenor, serta persetujuan kontrak resmi.',
    permissions: [
      'Melihat seluruh berkas pengajuan masuk secara real-time',
      'Inspeksi foto KTP, KK, selfie liveness, dan agunan berdampingan',
      'Penyesuaian plafon pinjaman & tenor angsuran',
      'Persetujuan (Approve) & Penolakan (Reject) dengan catatan verifikasi',
      'Penerbitan surat perjanjian resmi bernomor kontrak PM Mitra Sejahtera',
      'Akses pemantauan data real-time Firestore & audit log'
    ]
  }
};
