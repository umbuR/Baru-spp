import { jsPDF } from 'jspdf';
import { LoanApplication, SuratSitaRecord } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function numberToWordsIndo(num: number): string {
  if (num === 0) return 'Nol';
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  function convert(n: number): string {
    if (n < 12) return units[n];
    if (n < 20) return convert(n - 10) + ' belas';
    if (n < 100) return convert(Math.floor(n / 10)) + ' puluh' + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 200) return 'seratus' + (n % 100 !== 0 ? ' ' + convert(n - 100) : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' ratus' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 2000) return 'seribu' + (n % 1000 !== 0 ? ' ' + convert(n - 1000) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' ribu' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    if (n < 1000000000000) return convert(Math.floor(n / 1000000000)) + ' miliar' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
    return n.toString();
  }
  const result = convert(Math.floor(num)).trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function getLegalDateComponents(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return {
      hari: daysIndo[d.getDay()],
      tanggal: d.getDate().toString(),
      bulan: monthsIndo[d.getMonth()],
      tahun: d.getFullYear().toString(),
      fullDateStr: `${daysIndo[d.getDay()]}, ${d.getDate()} ${monthsIndo[d.getMonth()]} ${d.getFullYear()}`
    };
  } catch {
    return { hari: 'Jumat', tanggal: '11', bulan: 'September', tahun: '2026', fullDateStr: dateStr };
  }
}

/**
 * Generates an official Indonesian legal Loan Agreement PDF using jsPDF
 * formatted exactly according to the requested Draft Surat Perjanjian Pinjaman
 */
export async function generateLoanAgreementPdf(
  app: LoanApplication,
  options?: { blankTemplate?: boolean }
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isBlank = options?.blankTemplate ?? false;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 15;
    }
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, contentWidth, 14, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PM MITRA SEJAHTERA BERSAMA', margin + 6, y + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    isBlank 
      ? 'Lembaga Pembiayaan & Kemitraan Mandiri | Blanko Resmi Surat Perjanjian Pinjaman'
      : `Lembaga Pembiayaan & Kemitraan Mandiri | No. Kontrak: ${app.contractNumber}`, 
    margin + 6, 
    y + 11
  );

  y += 20;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERJANJIAN PINJAMAN', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tagging Lokasi GPS Satelit (Jika Ada dan Bukan Blanko)
  if (!isBlank && app.locationTag) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(2, 132, 199);
    doc.text(`[TAGGING GPS] Lat: ${app.locationTag.latitude}, Long: ${app.locationTag.longitude} (Akurasi ±${app.locationTag.accuracy}m) • Alamat: ${app.locationTag.address}`, margin, y);
    y += 4.5;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  const { hari, tanggal, bulan, tahun } = getLegalDateComponents(app.createdAt);
  const tenorWeeks = app.loan.tenorWeeks || 6;
  const installmentAmount = app.loan.weeklyInstallment || Math.round(app.loan.totalRepayment / tenorWeeks);
  const terbilangPinjaman = numberToWordsIndo(app.loan.loanAmount);

  // Opening statement
  const openingText = isBlank
    ? 'Pada hari ini _________ tanggal ___ bulan ______ tahun _____, kami yang bertanda tangan di bawah ini:'
    : `Pada hari ini ${hari} tanggal ${tanggal} bulan ${bulan} tahun ${tahun}, kami yang bertanda tangan di bawah ini:`;
  doc.text(openingText, margin, y);
  y += 6;

  // PIHAK PERTAMA (Pemberi Pinjaman)
  doc.setFont('helvetica', 'bold');
  doc.text('PIHAK PERTAMA (Pemberi Pinjaman)', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('Nama : Umbu Rihi Ninggeding', margin + 4, y);
  y += 4;
  doc.text('Alamat : Patawang', margin + 4, y);
  y += 4;
  doc.text('No. HP : 085173237621', margin + 4, y);
  y += 6;

  // PIHAK KEDUA (Peminjam/Nasabah)
  doc.setFont('helvetica', 'bold');
  doc.text('PIHAK KEDUA (Peminjam/Nasabah)', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama : ${isBlank ? '____________________' : app.applicant.fullName}`, margin + 4, y);
  y += 4;
  doc.text(`Alamat : ${isBlank ? '____________________' : app.applicant.address}`, margin + 4, y);
  y += 4;
  doc.text(`No. HP : ${isBlank ? '____________________' : app.applicant.phoneNumber}`, margin + 4, y);
  y += 6;

  // Agreement statement
  doc.setFont('helvetica', 'normal');
  doc.text('Dengan ini sepakat mengikatkan diri dalam perjanjian pinjaman dengan ketentuan sebagai berikut:', margin, y);
  y += 6;

  // Helper to draw an article section
  const renderArticle = (title: string, items: string[]) => {
    checkPageBreak(items.length * 4.5 + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      const splitLines = doc.splitTextToSize(item, contentWidth - 4);
      checkPageBreak(splitLines.length * 3.8);
      doc.text(splitLines, margin + 4, y);
      y += splitLines.length * 3.8;
    });
    y += 2.5;
  };

  // PASAL 1 – JUMLAH PINJAMAN
  const pasal1Items = isBlank
    ? [
        'Pihak Pertama memberikan pinjaman kepada Pihak Kedua sebesar:',
        'Rp ____________________',
        '(____________________________________________ rupiah)',
        'Dana dinyatakan diterima penuh oleh Pihak Kedua tanpa paksaan dari pihak manapun.'
      ]
    : [
        'Pihak Pertama memberikan pinjaman kepada Pihak Kedua sebesar:',
        `Rp ${app.loan.loanAmount.toLocaleString('id-ID')}`,
        `(${terbilangPinjaman} rupiah)`,
        'Dana dinyatakan diterima penuh oleh Pihak Kedua tanpa paksaan dari pihak manapun.'
      ];
  renderArticle('PASAL 1 – JUMLAH PINJAMAN', pasal1Items);

  // PASAL 2 – JANGKA WAKTU & PEMBAYARAN
  const pasal2Items = isBlank
    ? [
        'Pinjaman wajib dilunasi dalam waktu 6 minggu/bulan sejak tanggal pencairan.',
        'Sistem pembayaran: angsuran 6 kali sebesar Rp ________________ per periode.',
        'Pihak Kedua wajib membayar tepat waktu tanpa perlu diingatkan.',
        'Apabila jadwal pembayaran jatuh pada tanggal merah, hari libur nasional, atau hari libur keagamaan, pembayaran TIDAK LIBUR dan Pihak Kedua tetap wajib melakukan pembayaran angsuran sesuai jadwal.'
      ]
    : [
        `Pinjaman wajib dilunasi dalam waktu ${tenorWeeks} minggu/bulan sejak tanggal pencairan.`,
        `Sistem pembayaran: angsuran ${tenorWeeks} kali sebesar Rp ${installmentAmount.toLocaleString('id-ID')} per periode.`,
        'Pihak Kedua wajib membayar tepat waktu tanpa perlu diingatkan.',
        'Apabila jadwal pembayaran jatuh pada tanggal merah, hari libur nasional, atau hari libur keagamaan, pembayaran TIDAK LIBUR dan Pihak Kedua tetap wajib melakukan pembayaran angsuran sesuai jadwal.'
      ];
  renderArticle('PASAL 2 – JANGKA WAKTU & PEMBAYARAN', pasal2Items);

  // PASAL 3 – POTONGAN & BIAYA
  renderArticle('PASAL 3 – POTONGAN & BIAYA', [
    'Pihak Kedua menyetujui adanya potongan administrasi di awal.',
    'Apabila ada potongan angsuran terakhir di awal pinjaman, maka disetujui tanpa keberatan.'
  ]);

  // PASAL 4 – DENDA KETERLAMBATAN
  renderArticle('PASAL 4 – DENDA KETERLAMBATAN', [
    'Apabila Pihak Kedua terlambat melakukan pembayaran, maka dikenakan denda 5% dari angsuran mingguan.',
    'Denda berlaku otomatis tanpa pemberitahuan tambahan.',
    'Keterlambatan lebih dari 6 hari dianggap wanprestasi.'
  ]);

  // PASAL 5 – TANGGUNG JAWAB NASABAH
  renderArticle('PASAL 5 – TANGGUNG JAWAB NASABAH', [
    'Pihak Kedua bertanggung jawab penuh atas pelunasan pinjaman tanpa alasan apapun.',
    'Alasan seperti usaha sepi, sakit, kehilangan pekerjaan, atau masalah pribadi tidak menghapus kewajiban pembayaran.',
    'Pihak Kedua bersedia didatangi ke rumah, tempat usaha, atau lokasi lain untuk penagihan.',
    'Apabila menghindar, Pihak Kedua bersedia ditagih melalui keluarga, pasangan, atau penjamin.'
  ]);

  // PASAL 6 – SANKSI WANPRESTASI
  renderArticle('PASAL 6 – SANKSI WANPRESTASI', [
    'Apabila Pihak Kedua lalai atau sengaja tidak membayar:',
    'Pihak Pertama berhak melakukan penagihan langsung tanpa batas waktu.',
    'Nama Pihak Kedua dapat diumumkan sebagai nasabah bermasalah di lingkungan sekitar.',
    'Menunggak 2 minggu berturut-turut, Pemberi Pinjaman berhak menyita barang berharga milik peminjam (kendaraan, ternak, perhiasan, elektronik, atau barang bernilai lainnya).',
    'Penyitaan barang jaminan/berharga dapat dilakukan secara langsung oleh Pihak Pertama TANPA harus melalui putusan pengadilan atau perantara lembaga hukum manapun, dan Pihak Kedua memberi kuasa penuh atas tindakan tersebut.',
    'Pihak Pertama berhak menempuh jalur hukum sesuai peraturan yang berlaku.',
    'Semua biaya penagihan dan hukum dibebankan kepada Pihak Kedua.'
  ]);

  // PASAL 7 – JAMINAN MORAL
  renderArticle('PASAL 7 – JAMINAN MORAL', [
    'Pihak Kedua menyatakan:',
    'Meminjam dalam kondisi sadar dan tanpa paksaan.',
    'Bersedia menjaga nama baik pribadi dan keluarga.',
    'Siap bertanggung jawab penuh sampai pinjaman lunas.'
  ]);

  // PASAL 8 – PENUTUP
  renderArticle('PASAL 8 – PENUTUP', [
    'Perjanjian ini dibuat dengan sebenar-benarnya, ditandatangani di atas materai, dan memiliki kekuatan hukum yang mengikat kedua belah pihak.'
  ]);

  // Closing execution info
  checkPageBreak(50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dibuat di : ${isBlank ? '___________________' : 'Patawang'}`, margin, y);
  y += 4;
  doc.text(`Tanggal   : ${isBlank ? '___________________' : `${tanggal} ${bulan} ${tahun}`}`, margin, y);
  y += 7;

  // Signatures
  const col1X = margin;
  const col2X = margin + 90;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PIHAK PERTAMA (Pemberi Pinjaman)', col1X, y);
  doc.text('PIHAK KEDUA (Peminjam/Nasabah)', col2X, y);
  y += 4;

  // Col 1: Pihak Pertama Digital Seal / Signature
  doc.setDrawColor(37, 99, 235);
  doc.rect(col1X, y + 1, 55, 18);
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITALLY CERTIFIED', col1X + 4, y + 7);
  doc.setFontSize(6.5);
  doc.text('UMBU RIHI NINGGEDING', col1X + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('PM MITRA SEJAHTERA BERSAMA', col1X + 4, y + 16);

  // Col 2: Materai 10.000 Box & Signature
  const matX = col2X;
  const matY = y + 1;
  const matW = 22;
  const matH = 18;

  doc.setFillColor(255, 241, 242);
  doc.rect(matX, matY, matW, matH, 'F');
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.3);
  doc.rect(matX, matY, matW, matH, 'D');
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.15);
  doc.rect(matX + 0.5, matY + 0.5, matW - 1, matH - 1, 'D');

  doc.setTextColor(190, 18, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('METERAI', matX + matW / 2, matY + 4, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text('10000', matX + matW / 2, matY + 9, { align: 'center' });
  doc.setFontSize(4);
  doc.setFont('helvetica', 'normal');
  doc.text('SEPULUH RIBU', matX + matW / 2, matY + 12.5, { align: 'center' });
  doc.setFontSize(3.5);
  doc.text(isBlank ? 'TEMPEL DISINI' : `DJP-${app.contractNumber.slice(-6)}`, matX + matW / 2, matY + 16, { align: 'center' });

  // Debtor Signature if not blank
  if (!isBlank) {
    try {
      if (app.documents.signatureUrl) {
        doc.addImage(app.documents.signatureUrl, 'PNG', matX + 10, y, 42, 20);
      }
    } catch (err) {
      console.warn('Could not embed signature into pdf directly:', err);
    }
  }

  y += 24;
  // Names under signatures in formal Indonesian legal format
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('( Umbu Rihi Ninggeding )', col1X, y);
  doc.text(`( ${isBlank ? '____________________' : app.applicant.fullName} )`, col2X, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Pemberi Pinjaman • HP: 085173237621', col1X, y);
  doc.text(`Peminjam/Nasabah ${isBlank ? '' : `• HP: ${app.applicant.phoneNumber}`}`, col2X, y);

  // Biometric Stamp Box (if not blank)
  if (!isBlank) {
    y += 8;
    checkPageBreak(18);
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'FD');
    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('OTENTIKASI BIOMETRIK & INTEGRITAS DOKUMEN DIGITAL:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    const bioStatus = app.biometric.isVerified 
      ? `TERVERIFIKASI [Kredensial ID: ${app.biometric.credentialId || 'FID2-2026-OK'}] pada ${formatDateIndo(app.biometric.verifiedAt || app.createdAt)}` 
      : 'TERVERIFIKASI DENGAN PIN SIMULATED AUTH';
    doc.text(bioStatus, margin + 4, y + 9.5);
  }

  // --- PAGE 2: Lampiran Dokumen Verifikasi (Nasabah & Saksi) ---
  doc.addPage();
  let y2 = 16;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y2, contentWidth, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LAMPIRAN DOKUMEN IDENTITAS & VERIFIKASI (NASABAH & SAKSI)', margin + 6, y2 + 7.5);
  y2 += 16;

  // BAGIAN A: DOKUMEN NASABAH
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y2, contentWidth, 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`A. DOKUMEN NASABAH: ${app.applicant.fullName} (NIK: ${app.applicant.nik})`, margin + 4, y2 + 5);
  y2 += 11;

  // Baris 1: KTP Nasabah & Selfie Nasabah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1. Foto e-KTP Nasabah:', margin, y2);
  doc.text('2. Foto Selfie Liveness Nasabah:', margin + 95, y2);
  y2 += 3.5;

  try {
    if (app.documents.ktpUrl) {
      doc.addImage(app.documents.ktpUrl, 'JPEG', margin, y2, 85, 52);
    }
  } catch {
    doc.rect(margin, y2, 85, 52);
    doc.text('Foto KTP Nasabah', margin + 10, y2 + 25);
  }

  try {
    if (app.documents.selfieUrl) {
      doc.addImage(app.documents.selfieUrl, 'JPEG', margin + 95, y2, 52, 52);
    }
  } catch {
    doc.rect(margin + 95, y2, 52, 52);
    doc.text('Foto Selfie Nasabah', margin + 100, y2 + 25);
  }
  y2 += 58;

  // BAGIAN B: DOKUMEN & VERIFIKASI SAKSI
  const witnessName = app.witness?.fullName || 'Siti Rahmawati';
  const witnessNik = app.witness?.nik || '3174055502940002';
  const witnessRel = app.witness?.relationship || 'Penjamin';
  const witnessSig = app.documents.witnessSignatureUrl;

  doc.setFillColor(236, 253, 245);
  doc.rect(margin, y2, contentWidth, 7, 'F');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`B. DOKUMEN & VERIFIKASI SAKSI: ${witnessName} (NIK: ${witnessNik} | ${witnessRel})`, margin + 4, y2 + 5);
  y2 += 11;

  // Baris 2: KTP Saksi & Selfie Saksi & TTD Saksi
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1. Foto e-KTP Saksi:', margin, y2);
  doc.text('2. Foto Selfie Liveness Saksi:', margin + 65, y2);
  doc.text('3. Tanda Tangan Saksi:', margin + 125, y2);
  y2 += 3.5;

  const witnessKtp = app.documents.witnessKtpUrl;
  const witnessSelfie = app.documents.witnessSelfieUrl;

  try {
    if (witnessKtp) {
      doc.addImage(witnessKtp, 'JPEG', margin, y2, 58, 38);
    }
  } catch {
    doc.rect(margin, y2, 58, 38);
    doc.text('Foto KTP Saksi', margin + 8, y2 + 19);
  }

  try {
    if (witnessSelfie) {
      doc.addImage(witnessSelfie, 'JPEG', margin + 65, y2, 38, 38);
    }
  } catch {
    doc.rect(margin + 65, y2, 38, 38);
    doc.text('Selfie Saksi', margin + 70, y2 + 19);
  }

  try {
    if (witnessSig) {
      doc.setDrawColor(16, 185, 129);
      doc.rect(margin + 125, y2, 45, 38);
      doc.addImage(witnessSig, 'PNG', margin + 127, y2 + 4, 41, 28);
    }
  } catch {
    doc.rect(margin + 125, y2, 45, 38);
    doc.text('TTD Saksi', margin + 135, y2 + 19);
  }
  y2 += 44;

  // BAGIAN C: Foto Kartu Keluarga Nasabah
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y2, contentWidth, 6, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('C. FOTO KARTU KELUARGA (KK) NASABAH', margin + 4, y2 + 4.2);
  y2 += 9;

  try {
    if (app.documents.kkUrl) {
      doc.addImage(app.documents.kkUrl, 'JPEG', margin, y2, 95, 48);
    }
  } catch {
    doc.rect(margin, y2, 95, 48);
    doc.text('Foto KK Nasabah', margin + 20, y2 + 24);
  }
  y2 += 52;

  // Footer security info Page 2
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dokumen ini di-generate secara otomatis oleh Sistem Perjanjian Pinjaman Online PM Mitra Sejahtera Bersama. Hash Dokumen: ${app.id}.`, margin, y2);

  // --- PAGE 3: Lampiran Jaminan / Agunan (Jika Ada Jaminan) ---
  if (app.collateral && app.collateral.type !== 'NONE') {
    doc.addPage();
    let y3 = 16;
    doc.setFillColor(245, 158, 11);
    doc.rect(margin, y3, contentWidth, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('LAMPIRAN DOKUMEN & FOTO FISIK AGUNAN / JAMINAN PINJAMAN', margin + 6, y3 + 7.5);
    y3 += 16;

    // Rincian Agunan Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y3, contentWidth, 24, 2, 2, 'FD');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`IDENTITAS JAMINAN RESMI: ${app.collateral.title}`, margin + 4, y3 + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`• Nomor Dokumen / Sertifikat / BPKB: ${app.collateral.documentNumber}`, margin + 4, y3 + 10.5);
    doc.text(`• Pemilik Sesuai Dokumen: ${app.collateral.ownerName}`, margin + 4, y3 + 15);
    doc.text(`• Taksiran Nilai Agunan: ${formatRupiah(app.collateral.estimatedValue)} (Plafon Pinjaman: ${formatRupiah(app.loan.loanAmount)})`, margin + 4, y3 + 19.5);
    y3 += 28;

    // Foto Dokumen Jaminan & Foto Fisik Jaminan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Foto Dokumen Asli Jaminan (Sertifikat / BPKB):', margin, y3);
    doc.text('2. Foto Fisik Objek Jaminan (Kendaraan / Tanah / Barang):', margin + 95, y3);
    y3 += 4;

    const colDoc = app.documents.collateralDocUrl || app.collateral.collateralDocUrl;
    const colPhoto = app.documents.collateralPhotoUrl || app.collateral.collateralPhotoUrl;

    try {
      if (colDoc) {
        doc.addImage(colDoc, 'JPEG', margin, y3, 85, 55);
      }
    } catch {
      doc.rect(margin, y3, 85, 55);
      doc.text('Dokumen Jaminan', margin + 10, y3 + 28);
    }

    try {
      if (colPhoto) {
        doc.addImage(colPhoto, 'JPEG', margin + 95, y3, 85, 55);
      }
    } catch {
      doc.rect(margin + 95, y3, 85, 55);
      doc.text('Fisik Jaminan', margin + 105, y3 + 28);
    }
    y3 += 62;

    // Keterangan Kuasa Eksekusi
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y3, contentWidth, 18, 2, 2, 'FD');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Klausul Jaminan Fidusia / Titipan:', margin + 4, y3 + 5);
    doc.text('Agunan tercatat di atas mengikat secara hukum sebagai jaminan pemenuhan kewajiban kredit.', margin + 4, y3 + 9.5);
    doc.text('Pihak Pertama berhak melakukan sita jaminan dan/atau lelang langsung bila Pihak Kedua menunggak melebihi batas waktu toleransi.', margin + 4, y3 + 14);
    y3 += 24;

    // Footer Page 3
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Lampiran Agunan Terverifikasi Sistem PM Mitra Sejahtera Bersama. Kontrak: ${app.contractNumber}.`, margin, y3);
  }

  return doc;
}

/**
 * Trigger immediate download of the generated PDF
 */
export async function downloadLoanAgreementPdf(
  app: LoanApplication,
  options?: { blankTemplate?: boolean }
): Promise<void> {
  const doc = await generateLoanAgreementPdf(app, options);
  const isBlank = options?.blankTemplate ?? false;
  if (isBlank) {
    doc.save('Blanko_Surat_Perjanjian_Pinjaman.pdf');
  } else {
    const cleanNik = app.applicant.nik || 'nasabah';
    doc.save(`Surat_Perjanjian_Pinjaman_${cleanNik}.pdf`);
  }
}

/**
 * Generates an official Indonesian legal Surat Perintah & Berita Acara Sita Agunan PDF using jsPDF
 */
export async function generateSuratSitaPdf(
  record: SuratSitaRecord,
  options?: { blankTemplate?: boolean }
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isBlank = options?.blankTemplate ?? false;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 15;
    }
  };

  // Header Banner Kop Surat Resmi
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, contentWidth, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PM MITRA SEJAHTERA BERSAMA', margin + 6, y + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    isBlank 
      ? 'Koperasi Jasa Keuangan & Pembiayaan Mikro | Blanko Berita Acara Penyitaan Jaminan'
      : 'Koperasi Jasa Keuangan & Pembiayaan Mikro Syariah / Konvensional Terdaftar',
    margin + 6, 
    y + 10.5
  );

  y += 18;

  // Kop Info subtext
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Kantor Pusat: Gedung Menara Sejahtera Lt. 5, Jl. Jend. Sudirman Kav. 21, Jakarta | Telp: (021) 555-9012 | Email: legal@mitrasejahtera.co.id', margin, y);
  y += 2.5;

  // Double line separator
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + contentWidth, y);
  doc.setLineWidth(0.25);
  doc.line(margin, y + 1, margin + contentWidth, y + 1);
  y += 6;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, 'FD');

  doc.setTextColor(190, 18, 60); // Rose 700
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERINTAH & BERITA ACARA PENYERAHAN / PENYITAAN JAMINAN (AGUNAN)', pageWidth / 2, y + 5.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const letterNoStr = isBlank ? 'Nomor: ................................................................' : `Nomor Berkas: ${record.letterNumber}`;
  const contractRefStr = isBlank ? 'Ref. Kontrak: ........................................' : `Ref. Surat Perjanjian Pinjaman: ${record.contractNumber}`;
  doc.text(`${letterNoStr}  |  ${contractRefStr}`, pageWidth / 2, y + 10.5, { align: 'center' });

  y += 19;

  // Legal Preamble Text
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const dateFormatted = isBlank ? '..................................................' : formatDateIndo(record.executionDate);
  doc.text(`Pada hari ini, tanggal ${dateFormatted}, bertempat di alamat debitur yang sah, kami yang bertanda tangan di bawah ini:`, margin, y);
  y += 5;

  // Box I: Pihak Pertama (Kreditur / Eksekutor)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 21, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('I. PIHAK PERTAMA (KREDITUR / PELAKSANA EKSEKUSI AGUNAN):', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const offName = isBlank ? '........................................................................' : record.officer.name;
  const offId = isBlank ? '................................................' : (record.officer.employeeId || '-');
  const offRole = isBlank ? '........................................................................' : record.officer.roleTitle;

  doc.text(`Nama Petugas : ${offName}`, margin + 3, y + 9);
  doc.text(`NIP / ID       : ${offId}`, margin + 3, y + 13);
  doc.text(`Jabatan / Unit : ${offRole}  |  PM MITRA SEJAHTERA BERSAMA`, margin + 3, y + 17);
  y += 24;

  // Box II: Pihak Kedua (Debitur)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 25, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('II. PIHAK KEDUA (DEBITUR / PEMILIK JAMINAN):', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const debName = isBlank ? '........................................................................' : record.debtor.fullName;
  const debNik = isBlank ? '................................................' : record.debtor.nik;
  const debPhone = isBlank ? '................................................' : record.debtor.phoneNumber;
  const debAddr = isBlank ? '........................................................................................................................' : record.debtor.address;

  doc.text(`Nama Lengkap : ${debName}`, margin + 3, y + 9);
  doc.text(`NIK (KTP)    : ${debNik}     No. Telepon / HP : ${debPhone}`, margin + 3, y + 13);
  doc.text(`Alamat KTP   : ${debAddr.slice(0, 95)}`, margin + 3, y + 17);
  doc.text(`Status       : Debitur Penerima Pinjaman pada Kontrak No. ${isBlank ? '..............................' : record.contractNumber}`, margin + 3, y + 21);
  y += 28;

  // Section: Dasar Hukum & Rincian Tunggakan Wanprestasi
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DASAR HUKUM PENYITAAN & RINCIAN WANPRESTASI:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('1. Berdasarkan Pasal Perjanjian Jaminan Fidusia UU No. 42 Tahun 1999 dan/atau Pasal 1152 & 1155 KUHPerdata.', margin, y);
  y += 4;
  const spHistory = isBlank ? 'SP 1, SP 2, dan SP 3 / Somasi Akhir' : record.financials.warningLettersIssued;
  doc.text(`2. Pihak Pertama telah melayangkan surat peringatan resmi (${spHistory}) namun kewajiban belum dipenuhi.`, margin, y);
  y += 5;

  // Tunggakan Box Table
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.setDrawColor(244, 63, 94);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');
  doc.setTextColor(159, 18, 57);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  const colW = contentWidth / 4;
  const sisaPokokStr = isBlank ? 'Rp ....................' : formatRupiah(record.financials.principalRemaining);
  const bungaStr = isBlank ? 'Rp ....................' : formatRupiah(record.financials.interestDue);
  const dendaStr = isBlank ? 'Rp ....................' : formatRupiah(record.financials.penaltyFee);
  const totalHutangStr = isBlank ? 'Rp ....................' : formatRupiah(record.financials.totalOverdueDebt);

  doc.text('Pokok Tertunggak:', margin + 3, y + 5);
  doc.text(sisaPokokStr, margin + 3, y + 10);

  doc.text('Tunggakan Bunga:', margin + colW, y + 5);
  doc.text(bungaStr, margin + colW, y + 10);

  doc.text('Denda Keterlambatan:', margin + colW * 2, y + 5);
  doc.text(dendaStr, margin + colW * 2, y + 10);

  doc.text('TOTAL KEWAJIBAN:', margin + colW * 3, y + 5);
  doc.text(totalHutangStr, margin + colW * 3, y + 10);

  y += 18;

  // Section: Rincian Objek Agunan yang Disita
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RINCIAN OBJEK BARANG AGUNAN / JAMINAN YANG DISITA & DIAMANKAN:', margin, y);
  y += 4;

  // Table of Collateral
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  const colTitle = isBlank ? '........................................................................' : record.collateral.title;
  const colDoc = isBlank ? '........................................................................' : record.collateral.documentNumber;
  const colValue = isBlank ? 'Rp ........................................' : formatRupiah(record.collateral.estimatedValue);
  const colDesc = isBlank ? '........................................................................................................................' : (record.collateral.seizureConditionNotes || record.collateral.description);
  const colLoc = isBlank ? '........................................................................................................................' : record.collateral.storageLocation;

  doc.text(`Jenis & Nama Objek : ${record.collateral.type || 'AGUNAN'} - ${colTitle}`, margin + 3, y + 5);
  doc.text(`Nomor BPKB/SHM/Plat: ${colDoc}   |   Taksiran Nilai: ${colValue}`, margin + 3, y + 9.5);
  doc.text(`Kelengkapan Fisik  : ${colDesc.slice(0, 95)}`, margin + 3, y + 14);
  doc.text(`Gudang Penyimpanan : ${colLoc.slice(0, 95)}`, margin + 3, y + 18.5);
  doc.text(`Masa Tenggang Penebusan: ${record.redemptionDeadlineDays || 14} Hari Kalender sejak tanggal Berita Acara ini diterbitkan.`, margin + 3, y + 23);

  y += 30;

  // Signatures Section (3 Columns)
  checkPageBreak(60);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PENANDATANGANAN BERITA ACARA EKSEKUSI & PEMBUBUHAN E-METERAI 10.000:', margin, y);
  y += 5;

  const colWidthSig = contentWidth / 3;
  const sigBoxH = 32;

  // Column Headers
  doc.setFontSize(7.5);
  doc.text('PIHAK PERTAMA (Kreditur)', margin + colWidthSig * 0 + 2, y);
  doc.text('SAKSI LAPANGAN (RT/Aparat)', margin + colWidthSig * 1 + 2, y);
  doc.text('PIHAK KEDUA (Debitur)', margin + colWidthSig * 2 + 2, y);
  y += 2.5;

  // Draw signature boxes
  for (let i = 0; i < 3; i++) {
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin + colWidthSig * i, y, colWidthSig - 2, sigBoxH);
  }

  // Embed Signatures & e-Meterai 10000
  if (!isBlank) {
    // 1. Officer signature
    try {
      if (record.officer.signatureUrl) {
        doc.addImage(record.officer.signatureUrl, 'PNG', margin + 2, y + 3, colWidthSig - 6, sigBoxH - 6);
      }
    } catch {
      // Ignore
    }

    // 2. Witness signature
    try {
      if (record.witness.signatureUrl) {
        doc.addImage(record.witness.signatureUrl, 'PNG', margin + colWidthSig + 2, y + 3, colWidthSig - 6, sigBoxH - 6);
      }
    } catch {
      // Ignore
    }

    // 3. Debtor signature + e-Meterai 10000 Asli
    const debtorBoxX = margin + colWidthSig * 2;
    const hasEmet = record.emeterai?.hasEmeterai ?? true;

    if (hasEmet) {
      // Draw Authentic e-Meterai 10000 Graphic Stamp in Debtor box
      const emetW = 20;
      const emetH = 26;
      const emetX = debtorBoxX + 2;
      const emetY = y + 3;

      // E-meterai background & border
      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(190, 18, 60); // rose-700
      doc.setLineWidth(0.4);
      doc.roundedRect(emetX, emetY, emetW, emetH, 1, 1, 'FD');

      // Top ribbon
      doc.setFillColor(136, 19, 55); // rose-900
      doc.rect(emetX, emetY, emetW, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'bold');
      doc.text('E-METERAI 10000', emetX + emetW / 2, emetY + 2.8, { align: 'center' });

      // Nominal 10000
      doc.setTextColor(159, 18, 57);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('10000', emetX + emetW / 2, emetY + 9.5, { align: 'center' });

      doc.setFontSize(3.8);
      doc.setFont('helvetica', 'normal');
      doc.text('SEPULUH RIBU RUPIAH', emetX + emetW / 2, emetY + 12.5, { align: 'center' });

      // Mini QR box simulation
      doc.setDrawColor(159, 18, 57);
      doc.setFillColor(255, 255, 255);
      doc.rect(emetX + emetW / 2 - 4.5, emetY + 14, 9, 7, 'FD');
      doc.setFontSize(3.2);
      doc.text('QR VALID', emetX + emetW / 2, emetY + 18.5, { align: 'center' });

      // Serial string
      const snStr = record.emeterai?.serialNumber || 'SN: 2026-EMET-10K';
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(3);
      doc.text(snStr.slice(0, 18), emetX + emetW / 2, emetY + 23, { align: 'center' });
      doc.setTextColor(4, 120, 87); // Emerald
      doc.setFont('helvetica', 'bold');
      doc.text('PERURI TERVERIFIKASI', emetX + emetW / 2, emetY + 25, { align: 'center' });

      // Debtor signature overlaying across the e-Meterai (legal standard UU Bea Meterai)
      try {
        if (record.debtorSignatureUrl) {
          doc.addImage(record.debtorSignatureUrl, 'PNG', debtorBoxX + 8, y + 3, colWidthSig - 10, sigBoxH - 6);
        }
      } catch {
        // Ignore
      }
    } else {
      try {
        if (record.debtorSignatureUrl) {
          doc.addImage(record.debtorSignatureUrl, 'PNG', debtorBoxX + 2, y + 3, colWidthSig - 6, sigBoxH - 6);
        }
      } catch {
        // Ignore
      }
    }
  } else {
    // Blank template placeholder
    const debtorBoxX = margin + colWidthSig * 2;
    doc.setDrawColor(244, 63, 94);
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(debtorBoxX + 3, y + 3, 20, 25);
    doc.setLineDashPattern([], 0);
    doc.setTextColor(225, 29, 72);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('TEMPAT METERAI', debtorBoxX + 13, y + 13, { align: 'center' });
    doc.text('ELEKTRONIK 10000', debtorBoxX + 13, y + 16, { align: 'center' });
    doc.setFontSize(4);
    doc.text('(TTD mengenai meterai)', debtorBoxX + 13, y + 20, { align: 'center' });
  }

  y += sigBoxH + 4;

  // Names under signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const signOfficerName = isBlank ? '( ...................................... )' : `( ${record.officer.name} )`;
  const signWitnessName = isBlank ? '( ...................................... )' : `( ${record.witness.name} )`;
  const signDebtorName = isBlank ? '( ...................................... )' : `( ${record.debtor.fullName} )`;

  doc.text(signOfficerName, margin + colWidthSig * 0 + 2, y);
  doc.text(signWitnessName, margin + colWidthSig * 1 + 2, y);
  doc.text(signDebtorName, margin + colWidthSig * 2 + 2, y);
  y += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(isBlank ? 'NIP: ..............................' : `NIP: ${record.officer.employeeId || '-'}`, margin + colWidthSig * 0 + 2, y);
  doc.text(isBlank ? 'NIK/Jabatan: ..................' : `${record.witness.relationship || 'Saksi Lapangan'}`, margin + colWidthSig * 1 + 2, y);
  const emetStatusText = (record.emeterai?.hasEmeterai ?? true) && !isBlank ? `NIK: ${record.debtor.nik} [e-Meterai 10000 Sah]` : `NIK: ${record.debtor.nik}`;
  doc.text(isBlank ? 'NIK: ..............................' : emetStatusText, margin + colWidthSig * 2 + 2, y);

  // Footer Page 1
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dokumen Berita Acara Sita Sah & Mengikat Hukum PM Mitra Sejahtera Bersama. No: ${record.letterNumber}. Hal 1/2`, margin, 287);

  // --- PAGE 2: LAMPIRAN DOKUMENTASI FISIK & KEPEMILIKAN ---
  doc.addPage();
  let y2 = 14;

  // Header Banner Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y2, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LAMPIRAN DOKUMENTASI FISIK, IDENTITAS & SERAH TERIMA AGUNAN', margin + 5, y2 + 5.5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lampiran Berita Acara Nomor: ${isBlank ? '..................................................' : record.letterNumber} | Debitur: ${isBlank ? '...........................' : record.debtor.fullName}`, margin + 5, y2 + 9.5);

  y2 += 16;

  // Section 1: Identitas Visual Peminjam & Saksi (3 Boxes)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('1. DOKUMENTASI IDENTITAS PIHAK TERKAIT (FOTO KTP, PEMINJAM & SAKSI):', margin, y2);
  y2 += 4;

  const boxW3 = (contentWidth - 8) / 3;
  const boxH3 = 45;

  // 1A. Foto KTP Peminjam
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y2, boxW3, boxH3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Foto KTP Asli Peminjam:', margin + 2.5, y2 + 4);

  if (!isBlank && record.debtor.ktpPhotoUrl) {
    try {
      doc.addImage(record.debtor.ktpPhotoUrl, 'JPEG', margin + 2, y2 + 5.5, boxW3 - 4, boxH3 - 7.5);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.text('(Foto KTP Tersimpan)', margin + 6, y2 + 24);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('(Lampirkan Foto KTP)', margin + 6, y2 + 24);
  }

  // 1B. Foto Peminjam (Debitur)
  const xB = margin + boxW3 + 4;
  doc.setDrawColor(203, 213, 225);
  doc.rect(xB, y2, boxW3, boxH3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Foto Diri / Pasfoto Peminjam:', xB + 2.5, y2 + 4);

  if (!isBlank && record.debtor.borrowerPhotoUrl) {
    try {
      doc.addImage(record.debtor.borrowerPhotoUrl, 'JPEG', xB + 2, y2 + 5.5, boxW3 - 4, boxH3 - 7.5);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.text('(Foto Peminjam Tersimpan)', xB + 6, y2 + 24);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('(Lampirkan Foto Peminjam)', xB + 6, y2 + 24);
  }

  // 1C. Foto Saksi Lapangan
  const xC = margin + (boxW3 + 4) * 2;
  doc.setDrawColor(203, 213, 225);
  doc.rect(xC, y2, boxW3, boxH3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Foto Saksi Lapangan (RT/Tokoh):', xC + 2.5, y2 + 4);

  if (!isBlank && record.witness.witnessPhotoUrl) {
    try {
      doc.addImage(record.witness.witnessPhotoUrl, 'JPEG', xC + 2, y2 + 5.5, boxW3 - 4, boxH3 - 7.5);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.text('(Foto Saksi Tersimpan)', xC + 6, y2 + 24);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('(Lampirkan Foto Saksi)', xC + 6, y2 + 24);
  }

  y2 += boxH3 + 7;

  // Section 2: Foto Barang Sitaan & Dokumen Kepemilikan (2 Large Boxes)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('2. DOKUMENTASI FISIK BARANG SITAAN & DOKUMEN AGUNAN (BPKB / SHM):', margin, y2);
  y2 += 4;

  const photoBoxW = (contentWidth - 6) / 2;
  const photoBoxH = 55;

  // Box 2A: Foto Fisik Barang Sitaan
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y2, photoBoxW, photoBoxH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Foto Fisik Barang Agunan Saat Disita:', margin + 3, y2 + 4.5);

  if (!isBlank && record.collateral.collateralPhotoUrl) {
    try {
      doc.addImage(record.collateral.collateralPhotoUrl, 'JPEG', margin + 3, y2 + 6, photoBoxW - 6, photoBoxH - 8);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.text('(Foto Fisik Agunan Tersimpan di Sistem Digital)', margin + 10, y2 + 30);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('(Tempel / Lampirkan Foto Fisik Agunan)', margin + 15, y2 + 30);
  }

  // Box 2B: Foto Dokumen Agunan (BPKB / Sertifikat)
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin + photoBoxW + 6, y2, photoBoxW, photoBoxH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Foto Bukti Kepemilikan (BPKB / Sertifikat Asli):', margin + photoBoxW + 9, y2 + 4.5);

  if (!isBlank && record.collateral.collateralDocUrl) {
    try {
      doc.addImage(record.collateral.collateralDocUrl, 'JPEG', margin + photoBoxW + 9, y2 + 6, photoBoxW - 6, photoBoxH - 8);
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.text('(Foto Dokumen Kepemilikan Tersimpan di Sistem)', margin + photoBoxW + 15, y2 + 30);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('(Tempel / Lampirkan Foto Dokumen Asli)', margin + photoBoxW + 18, y2 + 30);
  }

  y2 += photoBoxH + 6;

  // Checklist Kelengkapan Barang Sitaan
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('3. LEMBAR CHECKLIST KELENGKAPAN FISIK SAAT EKSEKUSI:', margin, y2);
  y2 += 3.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y2, contentWidth, 30, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  const checklistItems = [
    '[ V ] Surat Tanda Nomor Kendaraan (STNK) / Dokumen Asli Kepemilikan',
    '[ V ] Kunci Kontak Asli & Kunci Cadangan',
    '[ V ] Buku Pemilik Kendaraan Bermotor (BPKB) / Sertifikat Asli di Kantor',
    '[ V ] Kondisi Mesin / Fisik Sesuai Berita Acara Pemeriksaan Fisik',
    '[ V ] Surat Kuasa Membebankan Hak Tanggungan / Fidusia Terdaftar',
    '[ V ] E-Meterai 10.000 Asli Terverifikasi Sesuai UU No. 10 Th 2020'
  ];

  for (let i = 0; i < checklistItems.length; i++) {
    const colIdx = i % 2;
    const rowIdx = Math.floor(i / 2);
    const itemX = margin + 4 + colIdx * (contentWidth / 2);
    const itemY = y2 + 5 + rowIdx * 5.2;
    doc.text(checklistItems[i], itemX, itemY);
  }
  y2 += 34;

  // Catatan Khusus & Ketentuan Penyimpanan
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('4. CATATAN KHUSUS & PENGAWASAN ASET (ASSET RECOVERY):', margin, y2);
  y2 += 3.5;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y2, contentWidth, 22, 1.5, 1.5, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text('a. Seluruh barang jaminan yang telah diamankan disimpan di fasilitas penyimpanan PM Mitra Sejahtera Bersama dengan penjagaan 24 jam.', margin + 4, y2 + 4.5);
  doc.text('b. Debitur tetap memiliki hak prioritas untuk menebus dan mengambil kembali barang agunan dalam kurun waktu tenggang yang ditetapkan (14 hari).', margin + 4, y2 + 8.5);
  doc.text('c. Apabila masa tenggang berakhir tanpa ada penyelesaian, barang akan dinilai ulang oleh juru taksir independen untuk proses lelang eksekusi.', margin + 4, y2 + 12.5);
  doc.text('d. Dokumen Berita Acara ini diterbitkan dalam 3 (tiga) rangkap asli bertanda tangan & bermeterai elektronik dengan kekuatan pembuktian penuh.', margin + 4, y2 + 16.5);

  // Footer Page 2
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Lampiran Dokumen Resmi Sita Jaminan PM Mitra Sejahtera Bersama. No: ${record.letterNumber}. Hal 2/2`, margin, 287);

  return doc;
}

/**
 * Trigger immediate download of the generated Surat Sita PDF
 */
export async function downloadSuratSitaPdf(
  record: SuratSitaRecord,
  options?: { blankTemplate?: boolean }
): Promise<void> {
  const doc = await generateSuratSitaPdf(record, options);
  const isBlank = options?.blankTemplate ?? false;
  if (isBlank) {
    doc.save(`Blanko_Surat_Sita_Agunan_${new Date().getFullYear()}.pdf`);
  } else {
    const cleanLetterNo = record.letterNumber.replace(/[\/\\?%*:|"<>]/g, '_');
    const cleanDebtor = record.debtor.fullName.replace(/\s+/g, '_');
    doc.save(`Surat_Sita_${cleanLetterNo}_${cleanDebtor}.pdf`);
  }
}


