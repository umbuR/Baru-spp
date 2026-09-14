import { jsPDF } from 'jspdf';
import { LoanApplication } from '../types';

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
export async function generateLoanAgreementPdf(app: LoanApplication): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

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
  doc.text('Lembaga Pembiayaan & Kemitraan Mandiri | No. Kontrak: ' + app.contractNumber, margin + 6, y + 11);

  y += 20;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERJANJIAN PINJAMAN', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tagging Lokasi GPS Satelit (Jika Ada)
  if (app.locationTag) {
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
  const openingText = `Pada hari ini ${hari} tanggal ${tanggal} bulan ${bulan} tahun ${tahun}, kami yang bertanda tangan di bawah ini:`;
  doc.text(openingText, margin, y);
  y += 6;

  // PIHAK PERTAMA
  doc.setFont('helvetica', 'bold');
  doc.text('PIHAK PERTAMA (Pemberi Pinjaman)', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('Nama       : Umbu Rihi Ninggeding', margin + 4, y);
  y += 4;
  doc.text('Alamat     : Patawang', margin + 4, y);
  y += 4;
  doc.text('No. HP     : 085173237621', margin + 4, y);
  y += 6;

  // PIHAK KEDUA
  doc.setFont('helvetica', 'bold');
  doc.text('PIHAK KEDUA (Peminjam/Nasabah)', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama       : ${app.applicant.fullName}`, margin + 4, y);
  y += 4;
  doc.text(`Alamat     : ${app.applicant.address}`, margin + 4, y);
  y += 4;
  doc.text(`No. HP     : ${app.applicant.phoneNumber}`, margin + 4, y);
  y += 4;
  doc.text(`NIK        : ${app.applicant.nik} | Tanggungan: ${app.applicant.familyMemberCount || 1} Orang (KK)`, margin + 4, y);
  y += 4;
  const pinjLainDesc = app.applicant.otherLoansCount === 0 
    ? 'Nihil / Tidak Ada' 
    : `${app.applicant.otherLoansCount} Tempat (${formatRupiah(app.applicant.otherLoansTotalAmount || 0)})${app.applicant.otherLoansDetails ? ` - ${app.applicant.otherLoansDetails}` : ''}`;
  doc.text(`Pinj. Lain : ${pinjLainDesc}`, margin + 4, y);
  y += 6;

  // SAKSI PERJANJIAN
  const witnessName = app.witness?.fullName || 'Siti Rahmawati';
  const witnessNik = app.witness?.nik || '3174055502940002';
  const witnessRel = app.witness?.relationship || 'Rekan Kerja / Penjamin';
  const witnessPhone = app.witness?.phoneNumber || '081299887766';

  doc.setFont('helvetica', 'bold');
  doc.text('SAKSI (Saksi Perjanjian / Penjamin)', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Saksi : ${witnessName}`, margin + 4, y);
  y += 4;
  doc.text(`NIK Saksi  : ${witnessNik} (Hubungan: ${witnessRel})`, margin + 4, y);
  y += 4;
  doc.text(`No. HP     : ${witnessPhone}`, margin + 4, y);
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
  const pasal1Items = [
    '1. Pihak Pertama memberikan pinjaman kepada Pihak Kedua sebesar:',
    `2. ${formatRupiah(app.loan.loanAmount)}`,
    `3. (${terbilangPinjaman} rupiah)`,
    '4. Dana dinyatakan diterima penuh oleh Pihak Kedua tanpa paksaan dari pihak manapun.'
  ];
  if (app.loan.isModifiedByAdmin) {
    pasal1Items.push(
      `5. * Catatan Penyesuaian Verifikator: Plafon pinjaman disetujui sebesar ${formatRupiah(app.loan.loanAmount)}${app.loan.originalLoanAmount && app.loan.originalLoanAmount !== app.loan.loanAmount ? ` (disesuaikan dari pengajuan awal ${formatRupiah(app.loan.originalLoanAmount)})` : ''}. Alasan: ${app.loan.modificationReason || 'Penyesuaian kapasitas bayar hasil verifikasi'}.`
    );
  }
  renderArticle('PASAL 1 – JUMLAH PINJAMAN', pasal1Items);

  // PASAL 2 – JANGKA WAKTU & PEMBAYARAN
  renderArticle('PASAL 2 – JANGKA WAKTU & PEMBAYARAN', [
    `1. Pinjaman wajib dilunasi dalam waktu ${tenorWeeks} minggu sejak tanggal pencairan.`,
    `2. Sistem pembayaran: angsuran ${tenorWeeks} kali sebesar ${formatRupiah(installmentAmount)} per periode.`,
    '3. Pihak Kedua wajib membayar tepat waktu tanpa perlu diingatkan.',
    '4. Apabila jadwal pembayaran jatuh pada tanggal merah, hari libur nasional, atau hari libur keagamaan, pembayaran TIDAK LIBUR dan Pihak Kedua tetap wajib melakukan pembayaran angsuran sesuai jadwal.'
  ]);

  // PASAL 3 – POTONGAN & BIAYA
  renderArticle('PASAL 3 – POTONGAN & BIAYA', [
    `1. Pihak Kedua menyetujui adanya potongan administrasi di awal (10% sebesar ${formatRupiah(app.loan.adminFee)}).`,
    '2. Apabila ada potongan angsuran terakhir di awal pinjaman, maka disetujui tanpa keberatan.'
  ]);

  // PASAL 4 – DENDA KETERLAMBATAN
  renderArticle('PASAL 4 – DENDA KETERLAMBATAN', [
    '1. Apabila Pihak Kedua terlambat melakukan pembayaran, maka dikenakan denda 5% dari angsuran mingguan.',
    '2. Denda berlaku otomatis tanpa pemberitahuan tambahan.',
    '3. Keterlambatan lebih dari 6 hari dianggap wanprestasi.'
  ]);

  // PASAL 5 – TANGGUNG JAWAB NASABAH
  renderArticle('PASAL 5 – TANGGUNG JAWAB NASABAH', [
    '1. Pihak Kedua bertanggung jawab penuh atas pelunasan pinjaman tanpa alasan apapun.',
    '2. Alasan seperti usaha sepi, sakit, kehilangan pekerjaan, atau masalah pribadi tidak menghapus kewajiban pembayaran.',
    '3. Pihak Kedua bersedia didatangi ke rumah, tempat usaha, atau lokasi lain untuk penagihan.',
    '4. Apabila menghindar, Pihak Kedua bersedia ditagih melalui keluarga, pasangan, atau penjamin.'
  ]);

  // PASAL 6 – SANKSI WANPRESTASI
  renderArticle('PASAL 6 – SANKSI WANPRESTASI', [
    '1. Apabila Pihak Kedua lalai atau sengaja tidak membayar:',
    '2. Pihak Pertama berhak melakukan penagihan langsung tanpa batas waktu.',
    '3. Nama Pihak Kedua dapat diumumkan sebagai nasabah bermasalah di lingkungan sekitar.',
    '4. Menunggak 2 minggu berturut-turut, Pemberi Pinjaman berhak menyita barang berharga milik peminjam (kendaraan, ternak, perhiasan, elektronik, atau barang bernilai lainnya).',
    '5. Penyitaan barang jaminan/berharga dapat dilakukan secara langsung oleh Pihak Pertama TANPA harus melalui putusan pengadilan atau perantara lembaga hukum manapun, dan Pihak Kedua memberi kuasa penuh atas tindakan tersebut.',
    '6. Pihak Pertama berhak menempuh jalur hukum sesuai peraturan yang berlaku.',
    '7. Semua biaya penagihan dan hukum dibebankan kepada Pihak Kedua.'
  ]);

  // PASAL 6A – PENGIKATAN AGUNAN / JAMINAN (JIKA ADA)
  if (app.collateral && app.collateral.type !== 'NONE') {
    renderArticle('PASAL 6A – PENGIKATAN AGUNAN / JAMINAN PINJAMAN', [
      `1. Pihak Kedua menyerahkan jaminan berupa: ${app.collateral.title}.`,
      `2. Nomor Dokumen / Sertifikat / BPKB: ${app.collateral.documentNumber} atas nama pemilik sah: ${app.collateral.ownerName}.`,
      `3. Taksiran nilai pasar agunan yang disepakati bersama adalah sebesar ${formatRupiah(app.collateral.estimatedValue)}.`,
      `4. Deskripsi & kondisi jaminan: ${app.collateral.description || 'Kondisi lengkap dan orisinil'}.`,
      '5. Pihak Kedua memberi kuasa penuh dan mutlak kepada Pihak Pertama untuk menyita, menguasai, dan menjual/melelang jaminan tersebut tanpa proses pengadilan jika terjadi wanprestasi.'
    ]);
  }

  // PASAL 7 – JAMINAN MORAL
  renderArticle('PASAL 7 – JAMINAN MORAL', [
    '1. Pihak Kedua menyatakan:',
    '2. Meminjam dalam kondisi sadar dan tanpa paksaan.',
    '3. Bersedia menjaga nama baik pribadi dan keluarga.',
    '4. Siap bertanggung jawab penuh sampai pinjaman lunas.'
  ]);

  // PASAL 8 – PENUTUP & PENANDATANGANAN SAKSI
  renderArticle('PASAL 8 – PENUTUP & PENANDATANGANAN SAKSI', [
    '1. Perjanjian ini dibuat dengan sebenar-benarnya, ditandatangani di atas meterai sah oleh Pihak Pertama dan Pihak Kedua, serta disaksikan secara langsung oleh Saksi yang cakap hukum.',
    '2. Seluruh pihak telah membaca, memahami, dan menyetujui seluruh isi perjanjian tanpa paksaan dari pihak manapun serta memiliki kekuatan hukum yang mengikat.',
    `3. Pihak Kedua menyatakan dengan sesungguhnya bahwa data tanggungan (${app.applicant.familyMemberCount || 1} orang) dan pinjaman (${app.applicant.otherLoansCount || 0} tempat lain) diisi secara jujur tanpa manipulasi, serta penandatanganan ini terikat pada geotagging koordinat fisik GPS: Lat ${app.locationTag?.latitude || '-'}, Long ${app.locationTag?.longitude || '-'}.`
  ]);

  // Closing execution info
  checkPageBreak(50);
  doc.setFont('helvetica', 'normal');
  doc.text('Dibuat di : Patawang', margin, y);
  y += 4;
  doc.text(`Tanggal   : ${tanggal} ${bulan} ${tahun}`, margin, y);
  y += 7;

  // Signatures: 3 Columns
  const col1X = margin;
  const col2X = margin + 60;
  const col3X = margin + 120;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PIHAK PERTAMA', col1X, y);
  doc.text('PIHAK KEDUA', col2X, y);
  doc.text('SAKSI PERJANJIAN', col3X, y);
  y += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('(Pemberi Pinjaman)', col1X, y);
  doc.text('(Peminjam/Nasabah)', col2X, y);
  doc.text('(Saksi Sah / Penjamin)', col3X, y);
  y += 3;

  // Col 1: Pihak Pertama Digital Seal Box
  doc.setDrawColor(37, 99, 235);
  doc.rect(col1X, y + 1, 46, 16);
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITALLY CERTIFIED', col1X + 4, y + 6);
  doc.setFontSize(6);
  doc.text('UMBU RIHI NINGGEDING', col1X + 4, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('PM MITRA SEJAHTERA BERSAMA', col1X + 4, y + 14);

  // Col 2: Materai 10.000 Box
  const matX = col2X;
  const matY = y + 1;
  const matW = 20;
  const matH = 16;

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
  doc.setFontSize(4.5);
  doc.text('METERAI', matX + matW / 2, matY + 3, { align: 'center' });
  doc.setFontSize(8);
  doc.text('10000', matX + matW / 2, matY + 7.5, { align: 'center' });
  doc.setFontSize(3.8);
  doc.setFont('helvetica', 'normal');
  doc.text('SEPULUH RIBU', matX + matW / 2, matY + 10.5, { align: 'center' });
  doc.setFontSize(3.2);
  doc.text(`DJP-${app.contractNumber.slice(-6)}`, matX + matW / 2, matY + 14, { align: 'center' });

  // Debtor Signature
  try {
    if (app.documents.signatureUrl) {
      doc.addImage(app.documents.signatureUrl, 'PNG', matX + 10, y - 1, 38, 18);
    }
  } catch (err) {
    console.warn('Could not embed signature into pdf directly:', err);
  }

  // Col 3: Witness Signature Box
  const witX = col3X;
  const witY = y + 1;
  const witW = 46;
  const witH = 16;
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(240, 253, 244);
  doc.rect(witX, witY, witW, witH, 'FD');

  const witnessSig = app.documents.witnessSignatureUrl;
  let drewWitSig = false;
  try {
    if (witnessSig) {
      doc.addImage(witnessSig, 'PNG', witX + 2, witY + 1, 42, 14);
      drewWitSig = true;
    }
  } catch (err) {
    console.warn('Could not embed witness signature:', err);
  }
  if (!drewWitSig) {
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('DIGITALLY SIGNED', witX + 4, witY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(`Saksi: ${witnessName}`, witX + 4, witY + 10);
    doc.text(`NIK: ${witnessNik}`, witX + 4, witY + 14);
  }

  y += 20;
  // Names under signatures in formal Indonesian legal format
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('( Umbu Rihi Ninggeding )', col1X, y);
  doc.text(`( ${app.applicant.fullName} )`, col2X, y);
  doc.text(`( ${witnessName} )`, col3X, y);
  y += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Pemberi Pinjaman • HP: 085173237621', col1X, y);
  doc.text(`Nasabah/Peminjam • NIK: ${app.applicant.nik}`, col2X, y);
  doc.text(`Saksi Perjanjian • NIK: ${witnessNik}`, col3X, y);

  // Biometric Stamp Box
  y += 7;
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
export async function downloadLoanAgreementPdf(app: LoanApplication): Promise<void> {
  const doc = await generateLoanAgreementPdf(app);
  const cleanNik = app.applicant.nik || 'nasabah';
  doc.save(`Surat_Perjanjian_Pinjaman_${cleanNik}.pdf`);
}

