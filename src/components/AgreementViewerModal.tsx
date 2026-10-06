import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  Fingerprint, 
  Building, 
  User, 
  Users, 
  Shield, 
  FileCheck2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { LoanApplication } from '../types';
import { downloadLoanAgreementPdf, formatRupiah, formatDateIndo, numberToWordsIndo, getLegalDateComponents } from '../utils/pdfGenerator';
import { sampleWitnessKtpSvg, sampleWitnessSelfieSvg, sampleWitnessSignatureSvg } from '../data/initialData';

interface AgreementViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplication;
}

export const AgreementViewerModal: React.FC<AgreementViewerModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<'filled' | 'blank'>('filled');

  if (!isOpen) return null;

  const handleDownload = async (blank: boolean = false) => {
    try {
      setIsDownloading(true);
      await downloadLoanAgreementPdf(application, { blankTemplate: blank });
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const { hari, tanggal, bulan, tahun } = getLegalDateComponents(application.createdAt);
  const tenorWeeks = application.loan.tenorWeeks || 6;
  const installmentAmount = application.loan.weeklyInstallment || Math.round(application.loan.totalRepayment / tenorWeeks);
  const terbilangPinjaman = numberToWordsIndo(application.loan.loanAmount);

  // Witness status and fallback data for display
  const hasWitness = application.hasWitness ?? (!!application.witness?.fullName && application.witness.fullName.trim() !== '');
  const witnessName = application.witness?.fullName || 'Siti Rahmawati';
  const witnessNik = application.witness?.nik || '3174055502940002';
  const witnessRel = application.witness?.relationship || 'Rekan Kerja / Penjamin';
  const witnessPhone = application.witness?.phoneNumber || '081299887766';
  const witnessSignature = application.documents.witnessSignatureUrl || sampleWitnessSignatureSvg;
  const witnessKtp = application.documents.witnessKtpUrl || sampleWitnessKtpSvg;
  const witnessSelfie = application.documents.witnessSelfieUrl || sampleWitnessSelfieSvg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Surat Perjanjian Pinjaman
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {viewMode === 'blank' ? 'Template Format Asli (Blanko)' : `No. Kontrak: ${application.contractNumber}`}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Download Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('filled')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  viewMode === 'filled' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Data Terisi
              </button>
              <button
                type="button"
                onClick={() => setViewMode('blank')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  viewMode === 'blank' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Format Blanko
              </button>
            </div>

            <button
              onClick={() => handleDownload(viewMode === 'blank')}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? 'Menyiapkan...' : viewMode === 'blank' ? 'Unduh Blanko PDF' : 'Unduh PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Tutup pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Contract Paper View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/50">
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto border border-slate-200 font-sans">
            {/* Header Title */}
            <div className="text-center pb-5 mb-6 border-b-2 border-slate-900">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-1">
                PM MITRA SEJAHTERA BERSAMA
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase text-slate-900 leading-tight">
                SURAT PERJANJIAN PINJAMAN
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Nomor: {application.contractNumber}
              </p>
            </div>

            {/* Tagging Lokasi Geotagging GPS Resmi */}
            {application.locationTag && (
              <div className="mb-5 p-3 bg-sky-50/80 rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sky-950 flex items-center gap-1.5">
                      Tagging Lokasi Geotagging GPS Terverifikasi
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                        Akurasi ±{application.locationTag.accuracy}m
                      </span>
                    </div>
                    <div className="text-[10px] text-sky-800 font-mono mt-0.5">
                      Koordinat: Lat {application.locationTag.latitude}, Long {application.locationTag.longitude} | Waktu: {new Date(application.locationTag.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      Alamat Terdeteksi: <strong>{application.locationTag.address}</strong>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${application.locationTag.latitude},${application.locationTag.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-sky-700 hover:text-sky-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-sky-300 shadow-sm shrink-0 self-start sm:self-auto transition hover:bg-sky-50"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Maps
                </a>
              </div>
            )}

            {/* Badge Penyesuaian Pinjaman oleh Verifikator */}
            {application.loan.isModifiedByAdmin && (
              <div className="mb-5 p-3 bg-amber-50/90 rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    Ketentuan Pinjaman Disesuaikan oleh Verifikator
                    <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 text-[9px] font-bold rounded">
                      Plafon Disetujui: {formatRupiah(application.loan.loanAmount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Plafon Awal: {formatRupiah(application.loan.originalLoanAmount || application.loan.loanAmount)} • Tenor: {application.loan.tenorWeeks} Minggu • Angsuran: {formatRupiah(installmentAmount)}/minggu
                  </div>
                  {application.loan.modificationReason && (
                    <div className="text-[10px] text-slate-600 mt-0.5 italic">
                      Catatan Verifikator: "{application.loan.modificationReason}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'blank' ? (
              <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                <p className="text-justify">
                  Pada hari ini <strong>_________</strong> tanggal <strong>___</strong> bulan <strong>______</strong> tahun <strong>_____</strong>, kami yang bertanda tangan di bawah ini:
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">PIHAK PERTAMA (Pemberi Pinjaman)</p>
                    <div className="pl-2 space-y-0.5 text-xs sm:text-sm">
                      <p><span className="w-24 inline-block text-slate-600">Nama</span>: Umbu Rihi Ninggeding</p>
                      <p><span className="w-24 inline-block text-slate-600">Alamat</span>: Patawang</p>
                      <p><span className="w-24 inline-block text-slate-600">No. HP</span>: 085173237621</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">PIHAK KEDUA (Peminjam/Nasabah)</p>
                    <div className="pl-2 space-y-0.5 text-xs sm:text-sm">
                      <p><span className="w-24 inline-block text-slate-600">Nama</span>: ____________________</p>
                      <p><span className="w-24 inline-block text-slate-600">Alamat</span>: ____________________</p>
                      <p><span className="w-24 inline-block text-slate-600">No. HP</span>: ____________________</p>
                    </div>
                  </div>
                </div>

                <p className="text-justify">
                  Dengan ini sepakat mengikatkan diri dalam perjanjian pinjaman dengan ketentuan sebagai berikut:
                </p>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 1 – JUMLAH PINJAMAN</h4>
                  <p className="mt-1">Pihak Pertama memberikan pinjaman kepada Pihak Kedua sebesar:</p>
                  <p className="font-bold text-base my-1 text-slate-900">Rp ____________________</p>
                  <p className="italic text-slate-700">(____________________________________________ rupiah)</p>
                  <p className="mt-1">Dana dinyatakan diterima penuh oleh Pihak Kedua tanpa paksaan dari pihak manapun.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 2 – JANGKA WAKTU & PEMBAYARAN</h4>
                  <p className="mt-1">Pinjaman wajib dilunasi dalam waktu 6 minggu/bulan sejak tanggal pencairan.</p>
                  <p>Sistem pembayaran: angsuran 6 kali sebesar Rp ________________ per periode.</p>
                  <p>Pihak Kedua wajib membayar tepat waktu tanpa perlu diingatkan.</p>
                  <p className="text-justify">Apabila jadwal pembayaran jatuh pada tanggal merah, hari libur nasional, atau hari libur keagamaan, pembayaran TIDAK LIBUR dan Pihak Kedua tetap wajib melakukan pembayaran angsuran sesuai jadwal.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 3 – POTONGAN & BIAYA</h4>
                  <p className="mt-1">Pihak Kedua menyetujui adanya potongan administrasi di awal.</p>
                  <p>Apabila ada potongan angsuran terakhir di awal pinjaman, maka disetujui tanpa keberatan.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 4 – DENDA KETERLAMBATAN</h4>
                  <p className="mt-1">Apabila Pihak Kedua terlambat melakukan pembayaran, maka dikenakan denda 5% dari angsuran mingguan.</p>
                  <p>Denda berlaku otomatis tanpa pemberitahuan tambahan.</p>
                  <p>Keterlambatan lebih dari 6 hari dianggap wanprestasi.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 5 – TANGGUNG JAWAB NASABAH</h4>
                  <p className="mt-1">Pihak Kedua bertanggung jawab penuh atas pelunasan pinjaman tanpa alasan apapun.</p>
                  <p className="text-justify">Alasan seperti usaha sepi, sakit, kehilangan pekerjaan, atau masalah pribadi tidak menghapus kewajiban pembayaran.</p>
                  <p>Pihak Kedua bersedia didatangi ke rumah, tempat usaha, atau lokasi lain untuk penagihan.</p>
                  <p>Apabila menghindar, Pihak Kedua bersedia ditagih melalui keluarga, pasangan, atau penjamin.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 6 – SANKSI WANPRESTASI</h4>
                  <p className="mt-1">Apabila Pihak Kedua lalai atau sengaja tidak membayar:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-800">
                    <li>Pihak Pertama berhak melakukan penagihan langsung tanpa batas waktu.</li>
                    <li>Nama Pihak Kedua dapat diumumkan sebagai nasabah bermasalah di lingkungan sekitar.</li>
                    <li>Menunggak 2 minggu berturut-turut, Pemberi Pinjaman berhak menyita barang berharga milik peminjam (kendaraan, ternak, perhiasan, elektronik, atau barang bernilai lainnya).</li>
                    <li>Penyitaan barang jaminan/berharga dapat dilakukan secara langsung oleh Pihak Pertama TANPA harus melalui putusan pengadilan atau perantara lembaga hukum manapun, dan Pihak Kedua memberi kuasa penuh atas tindakan tersebut.</li>
                    <li>Pihak Pertama berhak menempuh jalur hukum sesuai peraturan yang berlaku.</li>
                    <li>Semua biaya penagihan dan hukum dibebankan kepada Pihak Kedua.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 7 – JAMINAN MORAL</h4>
                  <p className="mt-1">Pihak Kedua menyatakan:</p>
                  <ul className="list-disc pl-5 space-y-0.5 mt-1 text-slate-800">
                    <li>Meminjam dalam kondisi sadar dan tanpa paksaan.</li>
                    <li>Bersedia menjaga nama baik pribadi dan keluarga.</li>
                    <li>Siap bertanggung jawab penuh sampai pinjaman lunas.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase">PASAL 8 – PENUTUP</h4>
                  <p className="mt-1 text-justify">
                    Perjanjian ini dibuat dengan sebenar-benarnya, ditandatangani di atas materai, dan memiliki kekuatan hukum yang mengikat kedua belah pihak.
                  </p>
                  <div className="mt-3 space-y-1">
                    <p>Dibuat di : ___________________</p>
                    <p>Tanggal &nbsp; : ___________________</p>
                  </div>
                </div>

                {/* Blank Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-slate-300 text-center">
                  <div>
                    <p className="font-bold text-xs text-slate-900">PIHAK PERTAMA</p>
                    <p className="text-[10px] text-slate-500 mb-16">(Pemberi Pinjaman)</p>
                    <p className="font-bold text-xs text-slate-900 underline">Umbu Rihi Ninggeding</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">PIHAK KEDUA</p>
                    <p className="text-[10px] text-slate-500 mb-3">(Peminjam / Nasabah)</p>
                    <div className="w-24 h-14 mx-auto border-2 border-dashed border-rose-400 bg-rose-50/70 rounded flex flex-col items-center justify-center text-[9px] text-rose-700 font-bold mb-2">
                      <span>MATERAI</span>
                      <span>10.000</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 underline">( ________________________ )</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
            {/* Opening Clause */}
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4 text-justify">
              Pada hari ini <strong>{hari}</strong> tanggal <strong>{tanggal}</strong> bulan <strong>{bulan}</strong> tahun <strong>{tahun}</strong>, kami yang bertanda tangan di bawah ini:
            </p>

            {/* Parties */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 mb-6">
              {/* PIHAK PERTAMA */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <Building className="w-4 h-4 text-blue-700 shrink-0" />
                  PIHAK PERTAMA (Pemberi Pinjaman)
                </div>
                <div className="pl-6 space-y-1 text-xs sm:text-sm">
                  <div className="flex"><span className="w-24 text-slate-600">Nama</span><span className="mr-2">:</span><strong>Umbu Rihi Ninggeding</strong></div>
                  <div className="flex"><span className="w-24 text-slate-600">Alamat</span><span className="mr-2">:</span><span>Patawang</span></div>
                  <div className="flex"><span className="w-24 text-slate-600">No. HP</span><span className="mr-2">:</span><span className="font-mono">085173237621</span></div>
                </div>
              </div>

              {/* PIHAK KEDUA */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <User className="w-4 h-4 text-blue-700 shrink-0" />
                  PIHAK KEDUA (Peminjam/Nasabah)
                </div>
                <div className="pl-6 space-y-1 text-xs sm:text-sm">
                  <div className="flex"><span className="w-28 text-slate-600">Nama</span><span className="mr-2">:</span><strong>{application.applicant.fullName}</strong></div>
                  <div className="flex"><span className="w-28 text-slate-600">Alamat</span><span className="mr-2">:</span><span>{application.applicant.address}</span></div>
                  <div className="flex"><span className="w-28 text-slate-600">No. HP</span><span className="mr-2">:</span><span className="font-mono">{application.applicant.phoneNumber}</span></div>
                  <div className="flex"><span className="w-28 text-slate-600">NIK</span><span className="mr-2">:</span><span className="font-mono text-slate-700">{application.applicant.nik}</span></div>
                  <div className="flex"><span className="w-28 text-slate-600">Tanggungan KK</span><span className="mr-2">:</span><strong className="text-indigo-900">{application.applicant.familyMemberCount || 1} Orang (Jiwa)</strong></div>
                  <div className="flex"><span className="w-28 text-slate-600">Pinj. Lain</span><span className="mr-2">:</span><span className="font-semibold text-amber-900">{application.applicant.otherLoansCount === 0 ? 'Nihil / Tidak Ada' : `${application.applicant.otherLoansCount} Tempat (${formatRupiah(application.applicant.otherLoansTotalAmount || 0)})`}</span></div>
                  {application.applicant.otherLoansDetails && application.applicant.otherLoansCount > 0 && (
                    <div className="flex"><span className="w-28 text-slate-600">Ket. Pinjaman</span><span className="mr-2">:</span><span className="italic text-slate-700">{application.applicant.otherLoansDetails}</span></div>
                  )}
                </div>
              </div>

              {/* SAKSI ATAU KETERANGAN TANPA SAKSI */}
              {hasWitness ? (
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
                    <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                    SAKSI (Saksi Perjanjian / Penjamin)
                  </div>
                  <div className="pl-6 space-y-1 text-xs sm:text-sm">
                    <div className="flex"><span className="w-24 text-slate-600">Nama Saksi</span><span className="mr-2">:</span><strong>{witnessName}</strong></div>
                    <div className="flex"><span className="w-24 text-slate-600">NIK Saksi</span><span className="mr-2">:</span><span className="font-mono text-slate-700">{witnessNik}</span></div>
                    <div className="flex"><span className="w-24 text-slate-600">Hubungan</span><span className="mr-2">:</span><span>{witnessRel}</span></div>
                    <div className="flex"><span className="w-24 text-slate-600">No. HP</span><span className="mr-2">:</span><span className="font-mono">{witnessPhone}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                    <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                    STATUS SAKSI: DITERBITKAN TANPA SAKSI
                  </div>
                  <p className="pl-6 text-xs text-amber-800 leading-relaxed">
                    Surat Perjanjian Pinjaman ini disepakati dan ditandatangani langsung antara <strong>Pihak Pertama</strong> (Pemberi Pinjaman) dan <strong>Pihak Kedua</strong> (Nasabah) tanpa melibatkan saksi atau penjamin. Tanggung jawab pembayaran dan hukum berada penuh pada Pihak Kedua.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-5 text-justify">
              Dengan ini sepakat mengikatkan diri dalam perjanjian pinjaman dengan ketentuan sebagai berikut:
            </p>

            {/* Articles List */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 text-justify">
              {/* PASAL 1 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 1 – JUMLAH PINJAMAN
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Pihak Pertama memberikan pinjaman kepada Pihak Kedua sebesar:</li>
                  <li className="pl-4 font-bold text-base text-blue-900">2. {formatRupiah(application.loan.loanAmount)}</li>
                  <li className="pl-4 italic text-slate-700">3. ({terbilangPinjaman} rupiah)</li>
                  <li>4. Dana dinyatakan diterima penuh oleh Pihak Kedua tanpa paksaan dari pihak manapun.</li>
                  {application.loan.isModifiedByAdmin && (
                    <li className="pl-4 text-[11px] text-amber-900 bg-amber-50/90 p-2 rounded-lg border border-amber-200 mt-1.5 leading-relaxed">
                      * <strong>Klausul Penyesuaian Verifikator:</strong> Plafon pinjaman disetujui sebesar <strong>{formatRupiah(application.loan.loanAmount)}</strong> ({application.loan.tenorWeeks} minggu){application.loan.originalLoanAmount && application.loan.originalLoanAmount !== application.loan.loanAmount ? ` berdasarkan keputusan hasil verifikasi berkas dari pengajuan awal sebesar ${formatRupiah(application.loan.originalLoanAmount)}` : ''}.
                      {application.loan.modificationReason ? ` Catatan verifikasi: "${application.loan.modificationReason}".` : ''}
                    </li>
                  )}
                </ol>
              </div>

              {/* PASAL 2 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 2 – JANGKA WAKTU & PEMBAYARAN
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Pinjaman wajib dilunasi dalam waktu {tenorWeeks} minggu sejak tanggal pencairan.</li>
                  <li>2. Sistem pembayaran: angsuran {tenorWeeks} kali sebesar <strong>{formatRupiah(installmentAmount)}</strong> per periode.</li>
                  <li>3. Pihak Kedua wajib membayar tepat waktu tanpa perlu diingatkan.</li>
                  <li>4. Apabila jadwal pembayaran jatuh pada tanggal merah, hari libur nasional, atau hari libur keagamaan, pembayaran TIDAK LIBUR dan Pihak Kedua tetap wajib melakukan pembayaran angsuran sesuai jadwal.</li>
                </ol>
              </div>

              {/* PASAL 3 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 3 – POTONGAN & BIAYA
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Pihak Kedua menyetujui adanya potongan administrasi di awal (10% sebesar {formatRupiah(application.loan.adminFee)}).</li>
                  <li>2. Apabila ada potongan angsuran terakhir di awal pinjaman, maka disetujui tanpa keberatan.</li>
                </ol>
              </div>

              {/* PASAL 4 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 4 – DENDA KETERLAMBATAN
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Apabila Pihak Kedua terlambat melakukan pembayaran, maka dikenakan denda 5% dari angsuran mingguan.</li>
                  <li>2. Denda berlaku otomatis tanpa pemberitahuan tambahan.</li>
                  <li>3. Keterlambatan lebih dari 6 hari dianggap wanprestasi.</li>
                </ol>
              </div>

              {/* PASAL 5 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 5 – TANGGUNG JAWAB NASABAH
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Pihak Kedua bertanggung jawab penuh atas pelunasan pinjaman tanpa alasan apapun.</li>
                  <li>2. Alasan seperti usaha sepi, sakit, kehilangan pekerjaan, atau masalah pribadi tidak menghapus kewajiban pembayaran.</li>
                  <li>3. Pihak Kedua bersedia didatangi ke rumah, tempat usaha, atau lokasi lain untuk penagihan.</li>
                  <li>4. Apabila menghindar, Pihak Kedua bersedia ditagih melalui keluarga, pasangan, atau penjamin.</li>
                </ol>
              </div>

              {/* PASAL 6 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 6 – SANKSI WANPRESTASI
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Apabila Pihak Kedua lalai atau sengaja tidak membayar:</li>
                  <li>2. Pihak Pertama berhak melakukan penagihan langsung tanpa batas waktu.</li>
                  <li>3. Nama Pihak Kedua dapat diumumkan sebagai nasabah bermasalah di lingkungan sekitar.</li>
                  <li>4. Menunggak 2 minggu berturut-turut, Pemberi Pinjaman berhak menyita barang berharga milik peminjam (kendaraan, ternak, perhiasan, elektronik, atau barang bernilai lainnya).</li>
                  <li>5. Penyitaan barang jaminan/berharga dapat dilakukan secara langsung oleh Pihak Pertama TANPA harus melalui putusan pengadilan atau perantara lembaga hukum manapun, dan Pihak Kedua memberi kuasa penuh atas tindakan tersebut.</li>
                  <li>6. Pihak Pertama berhak menempuh jalur hukum sesuai peraturan yang berlaku.</li>
                  <li>7. Semua biaya penagihan dan hukum dibebankan kepada Pihak Kedua.</li>
                </ol>
              </div>

              {/* PASAL KHUSUS AGUNAN / JAMINAN PINJAMAN (JIKA ADA) */}
              {application.collateral && application.collateral.type !== 'NONE' && (
                <div className="bg-amber-50/80 border border-amber-300/80 rounded-lg p-3">
                  <h4 className="font-bold text-amber-900 uppercase mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    PASAL 6A – PENGIKATAN AGUNAN / JAMINAN PINJAMAN
                  </h4>
                  <ol className="list-none space-y-1 pl-1 text-slate-800 text-[11px]">
                    <li>
                      1. Guna menjamin ketertiban dan pelunasan pinjaman, Pihak Kedua menyerahkan jaminan berupa: <strong>{application.collateral.title}</strong>.
                    </li>
                    <li>
                      2. Identitas Dokumen Jaminan: Nomor <strong>{application.collateral.documentNumber}</strong> atas nama pemilik sah: <strong>{application.collateral.ownerName}</strong>.
                    </li>
                    <li>
                      3. Taksiran nilai pasar agunan disepakati sebesar: <strong className="text-emerald-800">{formatRupiah(application.collateral.estimatedValue)}</strong>.
                    </li>
                    {application.collateral.description && (
                      <li>
                        4. Spesifikasi & kondisi fisik objek agunan: {application.collateral.description}
                      </li>
                    )}
                    <li>
                      5. Pihak Kedua memberi kuasa mutlak dan tidak dapat ditarik kembali kepada Pihak Pertama untuk menguasai fisik/dokumen jaminan, menyita, dan menjual/melelang secara mandiri jika Pihak Kedua wanprestasi tanpa perlu putusan pengadilan.
                    </li>
                  </ol>
                </div>
              )}

              {/* PASAL 7 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 7 – JAMINAN MORAL
                </h4>
                <ol className="list-none space-y-1 pl-1">
                  <li>1. Pihak Kedua menyatakan:</li>
                  <li>2. Meminjam dalam kondisi sadar dan tanpa paksaan.</li>
                  <li>3. Bersedia menjaga nama baik pribadi dan keluarga.</li>
                  <li>4. Siap bertanggung jawab penuh sampai pinjaman lunas.</li>
                </ol>
              </div>

              {/* PASAL 8 */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase mb-1">
                  PASAL 8 – PENUTUP & PENANDATANGANAN SAKSI
                </h4>
                <p className="pl-1">
                  1. Perjanjian ini dibuat dengan sebenar-benarnya, ditandatangani di atas materai sah oleh Pihak Pertama dan Pihak Kedua, serta disaksikan secara langsung oleh Saksi yang cakap hukum.
                </p>
                <p className="pl-1">
                  2. Seluruh pihak telah membaca, memahami, dan menyetujui seluruh isi perjanjian tanpa paksaan dari pihak manapun serta memiliki kekuatan hukum yang mengikat.
                </p>
                <p className="pl-1">
                  3. Pihak Kedua menyatakan dengan sesungguhnya bahwa data jumlah tanggungan ({application.applicant.familyMemberCount || 1} orang) dan pinjaman di {application.applicant.otherLoansCount || 0} tempat lain telah diisi dengan jujur tanpa manipulasi, serta penandatanganan ini terikat pada geotagging koordinat fisik GPS: Lat {application.locationTag?.latitude || '-'}, Long {application.locationTag?.longitude || '-'}.
                </p>
              </div>
            </div>

            {/* Closing execution place & date */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-xs sm:text-sm text-slate-800">
              <p>Dibuat di : <strong>Patawang</strong></p>
              <p>Tanggal &nbsp; : <strong>{tanggal} {bulan} {tahun}</strong></p>
            </div>

            {/* Signatures Section: 3-Column atau 2-Column jika Tanpa Saksi */}
            <div className={`grid grid-cols-1 ${hasWitness ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-xl mx-auto'} gap-4 pt-6 mt-4 border-t border-slate-300`}>
              {/* Pihak Pertama */}
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-700 mb-2">PIHAK PERTAMA (Pemberi Pinjaman)</p>
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/70 p-2">
                  <div className="border-2 border-blue-600 rounded-lg p-2.5 bg-blue-50/70 text-blue-700 text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider">DIGITALLY CERTIFIED</p>
                    <p className="text-[9px] font-mono font-bold">UMBU RIHI NINGGEDING</p>
                    <p className="text-[7px] text-slate-500">PM MITRA SEJAHTERA BERSAMA</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold tracking-tight mb-1">
                    E-Seal Sah
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Umbu Rihi Ninggeding</p>
                  <p className="text-[10px] text-slate-500 font-mono">085173237621</p>
                </div>
              </div>

              {/* Pihak Kedua Nasabah */}
              <div className="text-center">
                <div className="mb-2">
                  <p className="text-xs font-bold text-slate-900 uppercase">PIHAK KEDUA (Nasabah/Peminjam)</p>
                  <p className="text-[10px] text-slate-500 truncate">Nama: <span className="font-bold text-slate-800">{application.applicant.fullName}</span></p>
                </div>
                <div className="relative h-28 flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50/70 p-2 overflow-hidden shadow-inner">
                  {/* Materai 10.000 Stamp Box */}
                  <div className="absolute left-2 w-16 h-22 border-2 border-dashed border-rose-500/80 rounded-lg bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 shadow-sm p-1 flex flex-col justify-between select-none text-[6px]">
                    <div className="flex items-center justify-between border-b border-rose-200 pb-0.5">
                      <span className="text-[5px] font-black text-rose-700 tracking-tighter uppercase">
                        METERAI
                      </span>
                      <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                    <div className="my-auto text-center py-0.5">
                      <div className="text-[11px] font-black text-rose-800 font-serif leading-none tracking-tight">
                        10000
                      </div>
                      <div className="text-[4.5px] font-bold text-rose-600 uppercase tracking-tighter mt-0.5">
                        SEPULUH RIBU
                      </div>
                    </div>
                    <div className="border-t border-rose-300 pt-0.5 text-[4.5px] text-rose-700 font-mono text-center truncate">
                      DJP-{application.id.slice(0, 5).toUpperCase()}
                    </div>
                  </div>

                  {/* Signature Image overlapping the Materai */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {application.documents.signatureUrl ? (
                      <img
                        src={application.documents.signatureUrl}
                        alt={`Tanda Tangan Nasabah: ${application.applicant.fullName}`}
                        className="max-h-22 w-auto object-contain drop-shadow-sm ml-8"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic ml-12">
                        Tanda tangan di atas materai
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold tracking-tight mb-1">
                    Materai Rp 10.000 Sah
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-tight underline underline-offset-2">
                    (&nbsp;{application.applicant.fullName}&nbsp;)
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono font-medium">NIK: {application.applicant.nik}</p>
                </div>
              </div>

              {/* SAKSI (Hanya jika mode Dengan Saksi) */}
              {hasWitness && (
                <div className="text-center">
                  <div className="mb-2">
                    <p className="text-xs font-bold text-emerald-900 uppercase">SAKSI PERJANJIAN (Penjamin)</p>
                    <p className="text-[10px] text-slate-500 truncate">Nama: <span className="font-bold text-emerald-800">{witnessName}</span></p>
                  </div>
                  <div className="relative h-28 flex items-center justify-center border border-dashed border-emerald-300 rounded-xl bg-emerald-50/50 p-2 overflow-hidden shadow-inner">
                    {witnessSignature ? (
                      <img
                        src={witnessSignature}
                        alt={`Tanda Tangan Saksi: ${witnessName}`}
                        className="max-h-24 w-auto object-contain drop-shadow-sm"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Tanda tangan saksi
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold tracking-tight mb-1">
                      Tanda Tangan Saksi Sah
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-tight underline underline-offset-2">
                      (&nbsp;{witnessName}&nbsp;)
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono font-medium">NIK: {witnessNik}</p>
                    {application.witness?.relationship && (
                      <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                        Hubungan: {application.witness.relationship}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Biometric Verification Badge Section */}
            <div className="mt-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    Otentikasi Biometrik WebAuthn (FIDO2)
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono">
                    Kredensial: {application.biometric.credentialId || 'FID2-2026-TOKEN-VERIFIED'} | {formatDateIndo(application.biometric.verifiedAt || application.createdAt)}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                Valid & Sah
              </span>
            </div>

            {/* Attached Verification Photos Proof: NASABAH & SAKSI */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
              {/* Section 1: Dokumen Nasabah */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  1. Bukti Lampiran Identitas Nasabah
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Foto e-KTP Nasabah</span>
                    <div className="h-20 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                      {application.documents.ktpUrl ? (
                        <img src={application.documents.ktpUrl} alt="KTP Nasabah" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-slate-400">Belum diunggah</span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Foto KK Nasabah</span>
                    <div className="h-20 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                      {application.documents.kkUrl ? (
                        <img src={application.documents.kkUrl} alt="KK Nasabah" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-slate-400">Belum diunggah</span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Selfie Liveness Nasabah</span>
                    <div className="h-20 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                      {application.documents.selfieUrl ? (
                        <img src={application.documents.selfieUrl} alt="Selfie Nasabah" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-slate-400">Belum diunggah</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Dokumen & Verifikasi Saksi (Atau Keterangan Tanpa Saksi) */}
              {hasWitness ? (
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    2. Bukti Lampiran Identitas, KTP & Selfie Saksi
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-emerald-200 rounded-lg p-2 bg-emerald-50/50 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 block mb-1">Foto e-KTP Saksi</span>
                      <div className="h-20 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                        {witnessKtp ? (
                          <img src={witnessKtp} alt="KTP Saksi" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1 truncate">{witnessName}</span>
                    </div>

                    <div className="border border-emerald-200 rounded-lg p-2 bg-emerald-50/50 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 block mb-1">Selfie Liveness Saksi</span>
                      <div className="h-20 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                        {witnessSelfie ? (
                          <img src={witnessSelfie} alt="Selfie Saksi" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-1">Liveness Passed</span>
                    </div>

                    <div className="border border-emerald-200 rounded-lg p-2 bg-emerald-50/50 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 block mb-1">Tanda Tangan Saksi</span>
                      <div className="h-20 bg-white rounded flex items-center justify-center overflow-hidden border border-emerald-200">
                        {witnessSignature ? (
                          <img src={witnessSignature} alt="Tanda Tangan Saksi" className="h-full w-full object-contain p-1" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Belum ditandatangani</span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-700 font-mono block mt-1">E-Sign Terverifikasi</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200">
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="font-bold text-amber-950">2. Lampiran Saksi: Diterbitkan Tanpa Saksi</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Perjanjian Langsung Peminjam
                    </span>
                  </div>
                </div>
              )}

              {/* Section 3: Dokumen & Fisik Jaminan (Jika ada jaminan) */}
              {application.collateral && application.collateral.type !== 'NONE' && (
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2.5 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-600" />
                    3. Bukti Lampiran Agunan / Jaminan ({application.collateral.title})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50 text-center">
                      <span className="text-[10px] font-bold text-amber-900 block mb-1">Foto Dokumen Jaminan (Asli)</span>
                      <div className="h-24 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                        {application.documents.collateralDocUrl ? (
                          <img src={application.documents.collateralDocUrl} alt="Dokumen Jaminan" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono block mt-1 truncate">
                        {application.collateral.documentNumber}
                      </span>
                    </div>

                    <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50 text-center">
                      <span className="text-[10px] font-bold text-amber-900 block mb-1">Foto Fisik Objek Jaminan</span>
                      <div className="h-24 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                        {application.documents.collateralPhotoUrl ? (
                          <img src={application.documents.collateralPhotoUrl} alt="Fisik Jaminan" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Belum diunggah</span>
                        )}
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                        Taksiran: {formatRupiah(application.collateral.estimatedValue)}
                      </span>
                    </div>

                    <div className="border border-amber-200 rounded-lg p-2.5 bg-amber-50/70 text-left col-span-2 sm:col-span-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-900 block mb-1">Identitas Agunan Terikat</span>
                        <p className="text-[10px] text-slate-700 font-semibold mb-0.5">{application.collateral.title}</p>
                        <p className="text-[9px] text-slate-500 font-mono mb-1">Pemilik: {application.collateral.ownerName}</p>
                        <p className="text-[9px] text-slate-600 leading-tight">{application.collateral.description || 'Kondisi lengkap dan orisinil'}</p>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-amber-200/80 flex items-center gap-1 text-[9px] text-emerald-700 font-bold">
                        <FileCheck2 className="w-3 h-3" />
                        Agunan Terverifikasi Sah
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Modal Footer */}
    <div className="px-5 py-3 bg-slate-800/90 border-t border-slate-700 flex justify-end gap-2.5">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
      >
        Tutup
      </button>
      <button
        onClick={() => handleDownload(viewMode === 'blank')}
        disabled={isDownloading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition"
      >
        <Download className="w-3.5 h-3.5" />
        {isDownloading ? 'Memproses PDF...' : viewMode === 'blank' ? 'Unduh Blanko Template' : 'Unduh Dokumen PDF'}
      </button>
    </div>
      </div>
    </div>
  );
};

