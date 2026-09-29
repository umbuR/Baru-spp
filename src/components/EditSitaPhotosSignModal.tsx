import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Stamp, 
  ShieldCheck, 
  PenTool, 
  RefreshCw,
  Camera,
  Upload
} from 'lucide-react';
import { SuratSitaRecord } from '../types';
import { PhotoUploadCard } from './PhotoUploadCard';
import { EmeteraiBadge } from './EmeteraiBadge';
import { SignatureCanvasModal } from './SignatureCanvasModal';
import { 
  sampleKtpSvg, 
  sampleSelfieSvg, 
  sampleWitnessSelfieSvg, 
  sampleSignatureSvg, 
  sampleWitnessSignatureSvg,
  generateEmeteraiSvg
} from '../data/initialData';

interface EditSitaPhotosSignModalProps {
  isOpen: boolean;
  record: SuratSitaRecord;
  onSave: (updatedRecord: SuratSitaRecord) => void;
  onClose: () => void;
  onZoomImage: (url: string) => void;
}

export const EditSitaPhotosSignModal: React.FC<EditSitaPhotosSignModalProps> = ({
  isOpen,
  record,
  onSave,
  onClose,
  onZoomImage
}) => {
  // Photos state
  const [ktpPhoto, setKtpPhoto] = useState<string>(record.debtor.ktpPhotoUrl || '');
  const [borrowerPhoto, setBorrowerPhoto] = useState<string>(record.debtor.borrowerPhotoUrl || '');
  const [witnessPhoto, setWitnessPhoto] = useState<string>(record.witness.witnessPhotoUrl || '');
  const [collateralPhoto, setCollateralPhoto] = useState<string>(record.collateral.collateralPhotoUrl || '');
  const [collateralDoc, setCollateralDoc] = useState<string>(record.collateral.collateralDocUrl || '');

  // Signatures state
  const [officerSign, setOfficerSign] = useState<string>(record.officer.signatureUrl || '');
  const [witnessSign, setWitnessSign] = useState<string>(record.witness.signatureUrl || '');
  const [debtorSign, setDebtorSign] = useState<string>(record.debtorSignatureUrl || '');

  // E-Meterai state
  const [hasEmeterai, setHasEmeterai] = useState<boolean>(record.emeterai?.hasEmeterai ?? true);
  const [emeteraiSerial, setEmeteraiSerial] = useState<string>(
    record.emeterai?.serialNumber || `2026-PMSB-EMET10K-${Math.floor(1000000 + Math.random() * 9000000)}`
  );

  // Signature Canvas Modal
  const [sigModalConfig, setSigModalConfig] = useState<{
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

  if (!isOpen) return null;

  const handleOpenSignature = (role: 'officer' | 'witness' | 'debtor') => {
    if (role === 'officer') {
      setSigModalConfig({
        isOpen: true,
        title: 'Tanda Tangan Petugas Eksekutor',
        roleSubtitle: `${record.officer.name} (${record.officer.roleTitle || 'Petugas'})`,
        withEmeterai: false,
        currentSignature: officerSign,
        targetRole: 'officer'
      });
    } else if (role === 'witness') {
      setSigModalConfig({
        isOpen: true,
        title: 'Tanda Tangan Saksi Lapangan',
        roleSubtitle: `${record.witness.name} (${record.witness.relationship || 'Saksi'})`,
        withEmeterai: false,
        currentSignature: witnessSign,
        targetRole: 'witness'
      });
    } else {
      setSigModalConfig({
        isOpen: true,
        title: 'Tanda Tangan Peminjam (Debitur)',
        roleSubtitle: `${record.debtor.fullName} (Pemilik Agunan)`,
        withEmeterai: hasEmeterai,
        currentSignature: debtorSign,
        targetRole: 'debtor'
      });
    }
  };

  const handleSaveSignatureFromCanvas = (dataUrl: string) => {
    if (sigModalConfig.targetRole === 'officer') {
      setOfficerSign(dataUrl);
    } else if (sigModalConfig.targetRole === 'witness') {
      setWitnessSign(dataUrl);
    } else {
      setDebtorSign(dataUrl);
    }
  };

  const handleRegenerateSerial = () => {
    setEmeteraiSerial(`2026-PMSB-EMET10K-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SuratSitaRecord = {
      ...record,
      debtor: {
        ...record.debtor,
        ktpPhotoUrl: ktpPhoto || undefined,
        borrowerPhotoUrl: borrowerPhoto || undefined
      },
      witness: {
        ...record.witness,
        witnessPhotoUrl: witnessPhoto || undefined,
        signatureUrl: witnessSign || record.witness.signatureUrl
      },
      collateral: {
        ...record.collateral,
        collateralPhotoUrl: collateralPhoto || undefined,
        collateralDocUrl: collateralDoc || undefined
      },
      officer: {
        ...record.officer,
        signatureUrl: officerSign || record.officer.signatureUrl
      },
      debtorSignatureUrl: debtorSign || undefined,
      emeterai: hasEmeterai ? {
        hasEmeterai: true,
        serialNumber: emeteraiSerial,
        stampedAt: record.emeterai?.stampedAt || new Date().toISOString(),
        peruriCode: record.emeterai?.peruriCode || `PERURI-DJP-10000-${Math.floor(100000 + Math.random() * 900000)}`,
        verified: true
      } : undefined
    };

    onSave(updated);
    onClose();
  };

  const emeteraiSvgUrl = generateEmeteraiSvg(emeteraiSerial);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
                <Stamp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Kelola Foto Dokumentasi & Tanda Tangan e-Meterai
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {record.letterNumber} • Debitur: {record.debtor.fullName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
            
            {/* Section 1: 5 Photo Upload Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-400" />
                  Foto Dokumentasi Bukti (Upload dari Galeri / Kamera)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Format gambar JPG, PNG, atau SVG
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Foto KTP Peminjam */}
                <PhotoUploadCard
                  label="1. Foto KTP Peminjam"
                  sublabel={`NIK: ${record.debtor.nik}`}
                  imageUrl={ktpPhoto}
                  badge="Identitas"
                  badgeColor="blue"
                  onUpload={(url) => setKtpPhoto(url)}
                  onRemove={() => setKtpPhoto('')}
                  onUseSample={() => setKtpPhoto(sampleKtpSvg)}
                  onZoom={onZoomImage}
                />

                {/* 2. Foto Diri / Pasfoto Peminjam */}
                <PhotoUploadCard
                  label="2. Foto Diri Peminjam"
                  sublabel="Wajah peminjam / saat penyerahan agunan"
                  imageUrl={borrowerPhoto}
                  badge="Debitur"
                  badgeColor="emerald"
                  onUpload={(url) => setBorrowerPhoto(url)}
                  onRemove={() => setBorrowerPhoto('')}
                  onUseSample={() => setBorrowerPhoto(sampleSelfieSvg)}
                  onZoom={onZoomImage}
                />

                {/* 3. Foto Saksi Lapangan */}
                <PhotoUploadCard
                  label="3. Foto Saksi Lapangan"
                  sublabel={`${record.witness.name} (${record.witness.relationship})`}
                  imageUrl={witnessPhoto}
                  badge="Saksi"
                  badgeColor="indigo"
                  onUpload={(url) => setWitnessPhoto(url)}
                  onRemove={() => setWitnessPhoto('')}
                  onUseSample={() => setWitnessPhoto(sampleWitnessSelfieSvg)}
                  onZoom={onZoomImage}
                />

                {/* 4. Foto Fisik Barang Sitaan */}
                <PhotoUploadCard
                  label="4. Foto Fisik Barang Sitaan"
                  sublabel={record.collateral.title}
                  imageUrl={collateralPhoto}
                  badge="Objek Sita"
                  badgeColor="amber"
                  onUpload={(url) => setCollateralPhoto(url)}
                  onRemove={() => setCollateralPhoto('')}
                  onZoom={onZoomImage}
                />

                {/* 5. Foto Dokumen Kepemilikan (BPKB/SHM) */}
                <PhotoUploadCard
                  label="5. Dokumen Asli (BPKB/SHM)"
                  sublabel={record.collateral.documentNumber}
                  imageUrl={collateralDoc}
                  badge="Dokumen"
                  badgeColor="rose"
                  onUpload={(url) => setCollateralDoc(url)}
                  onRemove={() => setCollateralDoc('')}
                  onZoom={onZoomImage}
                />
              </div>
            </div>

            {/* Section 2: E-Meterai 10.000 Config */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      Materai Elektronik Asli Rp 10.000
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        UU No. 10 Th 2020
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Wajib dibubuhkan pada dokumen Berita Acara Sita Agunan untuk keabsahan hukum pembuktian.
                    </p>
                  </div>
                </div>

                {/* Switch toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-900/90 py-1.5 px-3 rounded-lg border border-slate-700">
                  <input
                    type="checkbox"
                    checked={hasEmeterai}
                    onChange={(e) => setHasEmeterai(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-200">Gunakan e-Meterai 10.000</span>
                </label>
              </div>

              {hasEmeterai && (
                <div className="space-y-3 pt-2 border-t border-slate-700/60">
                  <EmeteraiBadge serialNumber={emeteraiSerial} size="md" />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400">Nomor Seri e-Meterai:</span>
                    <input
                      type="text"
                      value={emeteraiSerial}
                      onChange={(e) => setEmeteraiSerial(e.target.value)}
                      className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-rose-300 font-mono text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateSerial}
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px] font-semibold border border-slate-700 transition"
                      title="Buat nomor seri e-Meterai baru"
                    >
                      <RefreshCw className="w-3 h-3 text-rose-400" />
                      Acak No. Seri
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: 3 Tanda Tangan (Petugas, Saksi, Peminjam + e-Meterai) */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-emerald-400" />
                Tanda Tangan Tiga Pihak (Canvas Digital / Upload Galeri)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. TTD Petugas */}
                <div className="flex flex-col bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">1. Petugas Eksekutor</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Pihak I
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{record.officer.name}</p>

                  <div className="relative w-full h-28 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden">
                    {officerSign ? (
                      <img src={officerSign} alt="TTD Petugas" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Belum Ditandatangani</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenSignature('officer')}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{officerSign ? 'Ganti TTD' : 'Tanda Tangan'}</span>
                    </button>
                    {officerSign && (
                      <button
                        type="button"
                        onClick={() => setOfficerSign('')}
                        className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition"
                        title="Hapus tanda tangan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. TTD Saksi */}
                <div className="flex flex-col bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">2. Saksi Lapangan</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Saksi
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{record.witness.name} ({record.witness.relationship})</p>

                  <div className="relative w-full h-28 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden">
                    {witnessSign ? (
                      <img src={witnessSign} alt="TTD Saksi" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Belum Ditandatangani</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenSignature('witness')}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{witnessSign ? 'Ganti TTD' : 'Tanda Tangan'}</span>
                    </button>
                    {witnessSign && (
                      <button
                        type="button"
                        onClick={() => setWitnessSign('')}
                        className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition"
                        title="Hapus tanda tangan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. TTD Peminjam + E-Meterai 10000 */}
                <div className="flex flex-col bg-slate-800/80 border border-rose-500/40 rounded-xl p-3 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 text-xs">3. Peminjam (Debitur)</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      + e-Meterai 10k
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{record.debtor.fullName}</p>

                  <div className="relative w-full h-28 bg-white rounded-lg border border-slate-300 overflow-hidden flex items-center justify-center p-1">
                    {/* Background e-Meterai 10000 */}
                    {hasEmeterai && (
                      <div className="absolute left-1 top-1 bottom-1 w-20 pointer-events-none opacity-85 flex items-center justify-center">
                        <img 
                          src={emeteraiSvgUrl} 
                          alt="e-Meterai 10000" 
                          className="h-full object-contain"
                        />
                      </div>
                    )}
                    
                    {/* Debtor Signature ink */}
                    {debtorSign ? (
                      <img 
                        src={debtorSign} 
                        alt="TTD Debitur" 
                        className="w-full h-full object-contain relative z-10" 
                      />
                    ) : (
                      <span className="text-slate-400 text-[11px] italic relative z-10 bg-white/70 px-2 py-0.5 rounded">
                        Belum Ditandatangani
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenSignature('debtor')}
                      className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-md shadow-rose-900/30 transition"
                    >
                      <Stamp className="w-3 h-3" />
                      <span>{debtorSign ? 'Ganti TTD e-Meterai' : 'TTD di e-Meterai'}</span>
                    </button>
                    {debtorSign && (
                      <button
                        type="button"
                        onClick={() => setDebtorSign('')}
                        className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition"
                        title="Hapus tanda tangan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 transition"
              >
                <Check className="w-4 h-4" />
                Simpan Foto & Tanda Tangan Dokumen
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Signature Canvas Modal */}
      <SignatureCanvasModal
        isOpen={sigModalConfig.isOpen}
        title={sigModalConfig.title}
        roleSubtitle={sigModalConfig.roleSubtitle}
        withEmeterai={sigModalConfig.withEmeterai}
        emeteraiSerial={emeteraiSerial}
        currentSignature={sigModalConfig.currentSignature}
        onSave={handleSaveSignatureFromCanvas}
        onClose={() => setSigModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
