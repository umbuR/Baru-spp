import { LoanApplication, SuratSitaRecord } from '../types';

// Helper to generate SVG Data URLs for realistic placeholder documents
export function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const sampleKtpSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
  <defs>
    <linearGradient id="ktpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bfdbfe"/>
      <stop offset="50%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <rect width="856" height="540" rx="28" fill="url(#ktpBg)" stroke="#1d4ed8" stroke-width="4"/>
  <!-- Header -->
  <text x="428" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">PROVINSI DKI JAKARTA</text>
  <text x="428" y="75" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">KOTA JAKARTA SELATAN</text>
  
  <!-- NIK -->
  <text x="50" y="125" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="bold" fill="#0f172a">NIK</text>
  <text x="210" y="125" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="bold" fill="#1e3a8a" letter-spacing="3">: 3174051208920003</text>
  
  <!-- Form fields -->
  <text x="50" y="170" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Nama</text>
  <text x="210" y="170" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">: BUDI SANTOSO</text>
  
  <text x="50" y="205" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Tempat/Tgl Lahir</text>
  <text x="210" y="205" font-family="sans-serif" font-size="18" fill="#0f172a">: JAKARTA, 12-08-1992</text>
  
  <text x="50" y="240" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Jenis Kelamin</text>
  <text x="210" y="240" font-family="sans-serif" font-size="18" fill="#0f172a">: LAKI-LAKI        Gol. Darah: O</text>
  
  <text x="50" y="275" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Alamat</text>
  <text x="210" y="275" font-family="sans-serif" font-size="18" fill="#0f172a">: JL. TEBET BARAT DALAM NO. 45</text>
  
  <text x="70" y="310" font-family="sans-serif" font-size="16" fill="#1e293b">RT/RW</text>
  <text x="210" y="310" font-family="sans-serif" font-size="16" fill="#0f172a">: 004 / 008</text>
  
  <text x="70" y="340" font-family="sans-serif" font-size="16" fill="#1e293b">Kel/Desa</text>
  <text x="210" y="340" font-family="sans-serif" font-size="16" fill="#0f172a">: TEBET BARAT</text>
  
  <text x="70" y="370" font-family="sans-serif" font-size="16" fill="#1e293b">Kecamatan</text>
  <text x="210" y="370" font-family="sans-serif" font-size="16" fill="#0f172a">: TEBET</text>
  
  <text x="50" y="405" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Agama</text>
  <text x="210" y="405" font-family="sans-serif" font-size="18" fill="#0f172a">: ISLAM</text>
  
  <text x="50" y="440" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Status Perkawinan</text>
  <text x="210" y="440" font-family="sans-serif" font-size="18" fill="#0f172a">: KAWIN</text>
  
  <text x="50" y="475" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Pekerjaan</text>
  <text x="210" y="475" font-family="sans-serif" font-size="18" fill="#0f172a">: KARYAWAN SWASTA</text>
  
  <text x="50" y="510" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Berlaku Hingga</text>
  <text x="210" y="510" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">: SEUMUR HIDUP</text>

  <!-- Photo Box & Stamp -->
  <g transform="translate(630, 140)">
    <rect width="180" height="230" rx="8" fill="#dc2626" stroke="#b91c1c" stroke-width="2"/>
    <circle cx="90" cy="80" r="45" fill="#fecaca"/>
    <path d="M40 210 C40 150, 140 150, 140 210 Z" fill="#1e293b"/>
    <text x="90" y="225" font-size="12" fill="#ffffff" text-anchor="middle">PAS FOTO</text>
  </g>
  <!-- Security Hologram Seal -->
  <circle cx="720" cy="420" r="35" fill="none" stroke="#2563eb" stroke-dasharray="4,4" stroke-width="3"/>
  <text x="720" y="425" font-size="12" font-weight="bold" fill="#1d4ed8" text-anchor="middle">E-KTP ASLI</text>
</svg>
`);

export const sampleKkSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
  <rect width="900" height="600" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
  <!-- Garuda Watermark -->
  <text x="450" y="70" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="28" font-weight="800" fill="#0f172a" text-anchor="middle">KARTU KELUARGA</text>
  <text x="450" y="105" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="bold" fill="#0284c7" letter-spacing="4" text-anchor="middle">No. 3174051009140001</text>
  
  <!-- Info Header Grid -->
  <rect x="40" y="125" width="820" height="75" fill="#f1f5f9" rx="6"/>
  <text x="60" y="150" font-size="14" font-weight="bold" fill="#334155">Nama Kepala Keluarga: BUDI SANTOSO</text>
  <text x="60" y="180" font-size="14" fill="#334155">Alamat: Jl. Tebet Barat Dalam No. 45, RT 004 / RW 008</text>
  <text x="560" y="150" font-size="14" fill="#334155">Kecamatan: Tebet</text>
  <text x="560" y="180" font-size="14" fill="#334155">Kab/Kota: Kota Jakarta Selatan</text>

  <!-- Table Header -->
  <rect x="40" y="215" width="820" height="35" fill="#0284c7"/>
  <text x="55" y="238" font-size="13" font-weight="bold" fill="#ffffff">No</text>
  <text x="90" y="238" font-size="13" font-weight="bold" fill="#ffffff">Nama Lengkap</text>
  <text x="290" y="238" font-size="13" font-weight="bold" fill="#ffffff">NIK</text>
  <text x="480" y="238" font-size="13" font-weight="bold" fill="#ffffff">Jenis Kelamin</text>
  <text x="610" y="238" font-size="13" font-weight="bold" fill="#ffffff">Hub. Keluarga</text>
  <text x="740" y="238" font-size="13" font-weight="bold" fill="#ffffff">Pekerjaan</text>

  <!-- Row 1 -->
  <rect x="40" y="250" width="820" height="35" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="55" y="273" font-size="12" fill="#0f172a">1</text>
  <text x="90" y="273" font-size="12" font-weight="600" fill="#0f172a">BUDI SANTOSO</text>
  <text x="290" y="273" font-size="12" font-family="'JetBrains Mono', monospace" fill="#0f172a">3174051208920003</text>
  <text x="480" y="273" font-size="12" fill="#0f172a">Laki-laki</text>
  <text x="610" y="273" font-size="12" font-weight="600" fill="#0284c7">Kepala Keluarga</text>
  <text x="740" y="273" font-size="12" fill="#0f172a">Karyawan</text>

  <!-- Row 2 -->
  <rect x="40" y="285" width="820" height="35" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="55" y="308" font-size="12" fill="#0f172a">2</text>
  <text x="90" y="308" font-size="12" font-weight="600" fill="#0f172a">DEWI LESTARI</text>
  <text x="290" y="308" font-size="12" font-family="'JetBrains Mono', monospace" fill="#0f172a">3174054503950002</text>
  <text x="480" y="308" font-size="12" fill="#0f172a">Perempuan</text>
  <text x="610" y="308" font-size="12" font-weight="600" fill="#0284c7">Istri</text>
  <text x="740" y="308" font-size="12" fill="#0f172a">Ibu Rumah Tangga</text>

  <!-- Official Stamp & Signature -->
  <g transform="translate(620, 420)">
    <text x="100" y="20" font-size="13" fill="#334155" text-anchor="middle">Jakarta, 10 September 2021</text>
    <text x="100" y="40" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">KEPALA DINAS DUKCAPIL</text>
    <circle cx="80" cy="90" r="40" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
    <text x="80" y="95" font-size="11" font-weight="bold" fill="#2563eb" text-anchor="middle">DUKCAPIL</text>
    <text x="100" y="145" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">Drs. H. Mulyadi, M.Si</text>
    <line x1="20" y1="148" x2="180" y2="148" stroke="#0f172a" stroke-width="1"/>
  </g>
</svg>
`);

export const sampleSelfieSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#0f172a"/>
  <!-- Ambient background glow -->
  <circle cx="200" cy="200" r="160" fill="#1e293b"/>
  <!-- Person avatar selfie -->
  <path d="M120 340 C120 260, 280 260, 280 340 Z" fill="#3b82f6"/>
  <circle cx="200" cy="180" r="65" fill="#fde047"/>
  <!-- Eyes & Smile -->
  <ellipse cx="178" cy="170" rx="6" ry="8" fill="#1e293b"/>
  <ellipse cx="222" cy="170" rx="6" ry="8" fill="#1e293b"/>
  <path d="M185 200 Q200 220 215 200" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
  <!-- Hair -->
  <path d="M135 170 Q200 100 265 170 C265 140 240 120 200 120 C160 120 135 140 135 170 Z" fill="#1e293b"/>
  <!-- Liveness verification badge overlay -->
  <rect x="20" y="20" width="180" height="34" rx="17" fill="#059669" opacity="0.9"/>
  <circle cx="36" cy="37" r="8" fill="#ffffff"/>
  <path d="M33 37 L36 40 L41 34" stroke="#059669" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="52" y="42" font-size="13" font-weight="bold" fill="#ffffff" font-family="sans-serif">Liveness Passed</text>
  <!-- Oval bounding box indicator -->
  <ellipse cx="200" cy="190" rx="100" ry="130" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="8,6"/>
</svg>
`);

export const sampleSignatureSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect width="500" height="200" fill="#ffffff"/>
  <!-- Digital signature ink line -->
  <path d="M 60 120 Q 90 40 130 90 T 170 140 T 210 70 Q 240 150 280 110 T 340 100 Q 380 90 420 130" 
        fill="none" stroke="#1e3a8a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 80 150 L 390 145" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>
  <!-- Timestamp tag -->
  <text x="30" y="185" font-family="'JetBrains Mono', monospace" font-size="11" fill="#64748b">Verified E-Sign | SHA256: 8f3c49e... | 2026-09-11 15:42 WIB</text>
</svg>
`);

// Sample KTP for Witness
export const sampleWitnessKtpSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
  <defs>
    <linearGradient id="witnessKtpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ccfbf1"/>
      <stop offset="50%" stop-color="#99f6e4"/>
      <stop offset="100%" stop-color="#5eead4"/>
    </linearGradient>
  </defs>
  <rect width="856" height="540" rx="28" fill="url(#witnessKtpBg)" stroke="#0f766e" stroke-width="4"/>
  <text x="428" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">PROVINSI DKI JAKARTA</text>
  <text x="428" y="75" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">KOTA JAKARTA SELATAN</text>
  
  <text x="50" y="125" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="bold" fill="#0f172a">NIK SAKSI</text>
  <text x="230" y="125" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="bold" fill="#0f766e" letter-spacing="3">: 3174055502940002</text>
  
  <text x="50" y="170" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Nama Saksi</text>
  <text x="230" y="170" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">: SITI RAHMAWATI</text>
  
  <text x="50" y="205" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Tempat/Tgl Lahir</text>
  <text x="230" y="205" font-family="sans-serif" font-size="18" fill="#0f172a">: JAKARTA, 15-02-1994</text>
  
  <text x="50" y="240" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Jenis Kelamin</text>
  <text x="230" y="240" font-family="sans-serif" font-size="18" fill="#0f172a">: PEREMPUAN      Gol. Darah: B</text>
  
  <text x="50" y="275" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Alamat</text>
  <text x="230" y="275" font-family="sans-serif" font-size="18" fill="#0f172a">: JL. TEBET TIMUR DALAM NO. 14</text>
  
  <text x="70" y="310" font-family="sans-serif" font-size="16" fill="#1e293b">RT/RW</text>
  <text x="230" y="310" font-family="sans-serif" font-size="16" fill="#0f172a">: 003 / 006</text>
  
  <text x="70" y="340" font-family="sans-serif" font-size="16" fill="#1e293b">Kel/Kec</text>
  <text x="230" y="340" font-family="sans-serif" font-size="16" fill="#0f172a">: TEBET TIMUR / TEBET</text>
  
  <text x="50" y="380" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Pekerjaan</text>
  <text x="230" y="380" font-family="sans-serif" font-size="18" fill="#0f172a">: WIRASWASTA</text>
  
  <text x="50" y="420" font-family="sans-serif" font-size="18" font-weight="600" fill="#1e293b">Berlaku Hingga</text>
  <text x="230" y="420" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">: SEUMUR HIDUP</text>

  <!-- Photo Box -->
  <g transform="translate(630, 140)">
    <rect width="180" height="230" rx="8" fill="#0d9488" stroke="#0f766e" stroke-width="2"/>
    <circle cx="90" cy="80" r="45" fill="#ccfbf1"/>
    <path d="M40 210 C40 150, 140 150, 140 210 Z" fill="#134e4a"/>
    <text x="90" y="225" font-size="12" fill="#ffffff" text-anchor="middle">FOTO SAKSI</text>
  </g>
  <!-- Seal -->
  <circle cx="720" cy="420" r="35" fill="none" stroke="#0f766e" stroke-dasharray="4,4" stroke-width="3"/>
  <text x="720" y="425" font-size="11" font-weight="bold" fill="#0f766e" text-anchor="middle">SAKSI VALID</text>
</svg>
`);

// Sample Selfie for Witness
export const sampleWitnessSelfieSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#042f2e"/>
  <circle cx="200" cy="200" r="160" fill="#115e59"/>
  <!-- Hijab / Portrait Witness -->
  <path d="M120 340 C120 250, 280 250, 280 340 Z" fill="#0d9488"/>
  <circle cx="200" cy="180" r="60" fill="#fef08a"/>
  <!-- Eyes & Smile -->
  <ellipse cx="180" cy="170" rx="5" ry="7" fill="#0f172a"/>
  <ellipse cx="220" cy="170" rx="5" ry="7" fill="#0f172a"/>
  <path d="M188 198 Q200 212 212 198" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Head cover -->
  <path d="M130 175 Q200 95 270 175 C270 130 250 110 200 110 C150 110 130 130 130 175 Z" fill="#14b8a6"/>
  <!-- Badge -->
  <rect x="20" y="20" width="200" height="34" rx="17" fill="#0f766e" opacity="0.95"/>
  <circle cx="36" cy="37" r="8" fill="#ffffff"/>
  <path d="M33 37 L36 40 L41 34" stroke="#0f766e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="52" y="42" font-size="12" font-weight="bold" fill="#ffffff" font-family="sans-serif">Selfie Saksi Terverifikasi</text>
  <ellipse cx="200" cy="190" rx="95" ry="125" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-dasharray="8,6"/>
</svg>
`);

// Sample Signature for Witness
export const sampleWitnessSignatureSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <rect width="500" height="200" fill="#ffffff"/>
  <!-- Digital signature ink line for witness -->
  <path d="M 50 140 C 90 80, 120 160, 160 90 S 230 60, 270 130 Q 320 160 370 80 T 440 120" 
        fill="none" stroke="#0f766e" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 100 155 L 420 150" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round"/>
  <!-- Timestamp tag -->
  <text x="30" y="185" font-family="'JetBrains Mono', monospace" font-size="11" fill="#0f766e">Verified Witness E-Sign | SITI RAHMAWATI | 2026-09-11 15:43 WIB</text>
</svg>
`);

// Official Authentic E-Meterai Rp 10.000 (Peruri / Ditjen Pajak RI - UU Bea Meterai No. 10 Tahun 2020)
export function generateEmeteraiSvg(serialNumber = '2026-PMSB-EMET10K-9812401', dateStr = '2026-09-23'): string {
  return createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380" width="320" height="380">
  <defs>
    <linearGradient id="emetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="50%" stop-color="#ffe4e6"/>
      <stop offset="100%" stop-color="#fecdd3"/>
    </linearGradient>
    <radialGradient id="emetShield" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#be123c"/>
    </radialGradient>
    <pattern id="guilloche" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="7" fill="none" stroke="#be123c" stroke-width="0.5" opacity="0.3"/>
      <path d="M0 8 Q8 0 16 8 Q8 16 0 8" fill="none" stroke="#9f1239" stroke-width="0.4" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Outer Postage Stamp Perforations or Border -->
  <rect x="5" y="5" width="310" height="370" rx="10" fill="url(#emetGrad)" stroke="#be123c" stroke-width="3"/>
  <rect x="12" y="12" width="296" height="356" rx="6" fill="url(#guilloche)" stroke="#9f1239" stroke-width="1.2"/>
  <rect x="18" y="18" width="284" height="344" rx="4" fill="#ffffff" fill-opacity="0.88" stroke="#fda4af" stroke-width="1"/>

  <!-- Top Ribbon / Garuda Header -->
  <rect x="25" y="24" width="270" height="36" rx="5" fill="#881337"/>
  <text x="160" y="42" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10.5" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">REPUBLIK INDONESIA</text>
  <text x="160" y="54" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="8" font-weight="bold" fill="#fecdd3" text-anchor="middle" letter-spacing="1">METERAI ELEKTRONIK</text>

  <!-- Garuda Silhouette Center Emblem -->
  <g transform="translate(160, 95)">
    <circle cx="0" cy="0" r="26" fill="url(#emetShield)" stroke="#881337" stroke-width="1.5"/>
    <path d="M-18 -8 Q-10 -22 0 -14 Q10 -22 18 -8 Q12 12 0 20 Q-12 12 -18 -8 Z" fill="#ffffff"/>
    <path d="M-8 -6 L8 -6 L0 10 Z" fill="#be123c"/>
    <circle cx="0" cy="-2" r="3" fill="#fbbf24"/>
  </g>

  <!-- Nominal 10000 Big and Bold -->
  <text x="160" y="152" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#881337" text-anchor="middle" letter-spacing="2">10000</text>
  <text x="160" y="172" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="9" font-weight="800" fill="#9f1239" text-anchor="middle" letter-spacing="1.5">SEPULUH RIBU RUPIAH</text>
  <text x="160" y="186" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="7.5" font-weight="600" fill="#be123c" text-anchor="middle">PAJAK MEMBANGUN BANGSA</text>

  <!-- Guilloche Security Divider -->
  <line x1="32" y1="195" x2="288" y2="195" stroke="#be123c" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- QR Code & Verification Block -->
  <g transform="translate(32, 205)">
    <!-- QR Box -->
    <rect width="65" height="65" rx="4" fill="#ffffff" stroke="#881337" stroke-width="1.5"/>
    <!-- QR Finder patterns -->
    <rect x="6" y="6" width="18" height="18" fill="#881337"/>
    <rect x="9" y="9" width="12" height="12" fill="#ffffff"/>
    <rect x="11" y="11" width="8" height="8" fill="#881337"/>

    <rect x="41" y="6" width="18" height="18" fill="#881337"/>
    <rect x="44" y="9" width="12" height="12" fill="#ffffff"/>
    <rect x="46" y="11" width="8" height="8" fill="#881337"/>

    <rect x="6" y="41" width="18" height="18" fill="#881337"/>
    <rect x="9" y="44" width="12" height="12" fill="#ffffff"/>
    <rect x="11" y="46" width="8" height="8" fill="#881337"/>

    <!-- Data bits -->
    <rect x="28" y="10" width="8" height="4" fill="#881337"/>
    <rect x="28" y="20" width="8" height="8" fill="#881337"/>
    <rect x="42" y="32" width="6" height="6" fill="#881337"/>
    <rect x="30" y="45" width="16" height="6" fill="#881337"/>
    <rect x="52" y="48" width="6" height="6" fill="#881337"/>
  </g>

  <!-- Serial Info & Peruri Signature -->
  <g transform="translate(108, 214)">
    <text x="0" y="10" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="bold" fill="#0f172a">SN ELEKTRONIK:</text>
    <text x="0" y="24" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" fill="#881337">${serialNumber}</text>
    <text x="0" y="38" font-family="sans-serif" font-size="7" fill="#475569">TERVERIFIKASI: PERURI &amp; DJP</text>
    <text x="0" y="50" font-family="sans-serif" font-size="7" fill="#475569">Tgl: ${dateStr}</text>
    <text x="0" y="62" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#047857">STATUS: TERBUKTI SAH &amp; VALID</text>
  </g>

  <!-- Legal Footnote & Security Seal -->
  <rect x="22" y="280" width="276" height="45" rx="4" fill="#fff1f2" stroke="#fecdd3" stroke-width="1"/>
  <text x="160" y="295" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" fill="#881337" text-anchor="middle">DIBUBUHKAN SECARA ELEKTRONIK</text>
  <text x="160" y="307" font-family="sans-serif" font-size="6.5" fill="#475569" text-anchor="middle">Sesuai UU RI No. 10 Tahun 2020 tentang Bea Meterai</text>
  <text x="160" y="318" font-family="sans-serif" font-size="6.5" font-weight="600" fill="#9f1239" text-anchor="middle">PM MITRA SEJAHTERA BERSAMA - ASSET RECOVERY</text>

  <!-- Bottom microprint bar -->
  <rect x="22" y="332" width="276" height="18" rx="3" fill="#881337"/>
  <text x="160" y="344" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">AUTHENTIC DIGITAL STAMP 10000</text>
</svg>
`);
}

export const sampleEmeterai10000Svg = generateEmeteraiSvg('2026-PMSB-EMET10K-9812401', '2026-09-23');

// Sample Collateral Documents & Photos
export const sampleSertifikatTanahSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="shmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#shmBg)" stroke="#b45309" stroke-width="6"/>
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="8,4"/>
  
  <!-- Garuda / Header -->
  <circle cx="400" cy="90" r="32" fill="#d97706" opacity="0.2"/>
  <text x="400" y="98" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="28" font-weight="900" fill="#92400e" text-anchor="middle">GARUDA</text>
  <text x="400" y="145" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="20" font-weight="800" fill="#78350f" text-anchor="middle">KEMENTERIAN AGRARIA DAN TATA RUANG / BPN</text>
  <text x="400" y="172" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#92400e" text-anchor="middle">BADAN PERTANAHAN NASIONAL REPUBLIK INDONESIA</text>
  <text x="400" y="210" font-family="serif" font-size="26" font-weight="900" fill="#78350f" text-anchor="middle">SERTIFIKAT HAK MILIK (SHM)</text>
  <text x="400" y="235" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#b45309" text-anchor="middle">NO. 04812 / KEL. TEBET BARAT</text>

  <!-- Detail Box -->
  <rect x="70" y="260" width="660" height="220" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <text x="95" y="295" font-size="14" font-weight="bold" fill="#1e293b">NIB (Nomor Identifikasi Bidang) : 09.01.04.05.04812</text>
  <text x="95" y="325" font-size="14" fill="#334155">Letak Tanah        : Jl. Tebet Barat Dalam No. 45, RT 004/RW 08</text>
  <text x="95" y="355" font-size="14" fill="#334155">Luas Tanah         : 180 M² (Seratus Delapan Puluh Meter Persegi)</text>
  <text x="95" y="385" font-size="14" font-weight="bold" fill="#0f172a">Pemegang Hak       : BUDI SANTOSO</text>
  <text x="95" y="415" font-size="14" fill="#334155">Status Hak         : Hak Milik Tanpa Beban Hak Tanggungan</text>
  <text x="95" y="445" font-size="14" fill="#334155">Surat Ukur No.     : 00128/Tebet/2018 Tanggal 14-04-2018</text>

  <!-- Stamp BPN -->
  <g transform="translate(560, 370)">
    <circle cx="70" cy="70" r="50" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="4,4"/>
    <text x="70" y="65" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">KANTOR PERTANAHAN</text>
    <text x="70" y="80" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">JAKARTA SELATAN</text>
  </g>
  <text x="400" y="535" font-size="12" font-style="italic" fill="#78350f" text-anchor="middle">Dokumen Jaminan Asli Terdaftar & Terverifikasi Pada Sistem PM Mitra Sejahtera</text>
</svg>
`);

export const sampleBpkbMotorSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
  <defs>
    <linearGradient id="bpkbMotorBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="800" height="550" rx="16" fill="url(#bpkbMotorBg)" stroke="#172554" stroke-width="6"/>
  <rect x="25" y="25" width="750" height="500" rx="12" fill="#f8fafc"/>
  
  <!-- Header Kepolisian -->
  <rect x="25" y="25" width="750" height="85" rx="12" fill="#1e3a8a"/>
  <text x="400" y="55" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#93c5fd" text-anchor="middle">KEPOLISIAN NEGARA REPUBLIK INDONESIA</text>
  <text x="400" y="80" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">BUKU PEMILIK KENDARAAN BERMOTOR (BPKB) - SEPEDA MOTOR</text>
  
  <!-- Nomor BPKB -->
  <rect x="60" y="125" width="680" height="40" rx="6" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="80" y="150" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="#1e40af">NO. BPKB: M-08291482-B / 2022</text>
  <text x="500" y="150" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="#dc2626">NO. POL: B 4819 SKW</text>

  <!-- Data Grid -->
  <g transform="translate(60, 180)">
    <text x="20" y="25" font-size="13" font-weight="bold" fill="#475569">Nama Pemilik</text>
    <text x="200" y="25" font-size="14" font-weight="bold" fill="#0f172a">: BUDI SANTOSO</text>

    <text x="20" y="55" font-size="13" font-weight="bold" fill="#475569">Alamat Pemilik</text>
    <text x="200" y="55" font-size="13" fill="#0f172a">: JL. TEBET BARAT DALAM NO. 45, JAKARTA SELATAN</text>

    <text x="20" y="85" font-size="13" font-weight="bold" fill="#475569">Merek / Tipe</text>
    <text x="200" y="85" font-size="14" font-weight="bold" fill="#1e40af">: HONDA / VARIO 160 CBS SPORTY</text>

    <text x="20" y="115" font-size="13" font-weight="bold" fill="#475569">Tahun Pembuatan</text>
    <text x="200" y="115" font-size="13" fill="#0f172a">: 2022 / Silinder: 157 CC</text>

    <text x="20" y="145" font-size="13" font-weight="bold" fill="#475569">Nomor Rangka</text>
    <text x="200" y="145" font-family="'JetBrains Mono', monospace" font-size="13" fill="#0f172a">: MH1KF1118NK089211</text>

    <text x="20" y="175" font-size="13" font-weight="bold" fill="#475569">Nomor Mesin</text>
    <text x="200" y="175" font-family="'JetBrains Mono', monospace" font-size="13" fill="#0f172a">: KF11E-1089201</text>

    <text x="20" y="205" font-size="13" font-weight="bold" fill="#475569">Warna Kendaraan</text>
    <text x="200" y="205" font-size="13" fill="#0f172a">: HITAM DOFF / BAHAN BAKAR: BENSIN</text>
  </g>

  <!-- Police Hologram -->
  <g transform="translate(600, 360)">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="4,4"/>
    <text x="50" y="48" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">DITLANTAS POLRI</text>
    <text x="50" y="62" font-size="8" fill="#1e40af" text-anchor="middle">BPKB SAH</text>
  </g>
  <text x="400" y="500" font-size="11" font-weight="bold" fill="#059669" text-anchor="middle">Taksiran Nilai Agunan Terdaftar: Rp 18.000.000 (Coverage Rasio 360%)</text>
</svg>
`);

export const sampleBpkbMobilSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
  <defs>
    <linearGradient id="bpkbMobilBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="50%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="800" height="550" rx="16" fill="url(#bpkbMobilBg)" stroke="#064e3b" stroke-width="6"/>
  <rect x="25" y="25" width="750" height="500" rx="12" fill="#f8fafc"/>
  
  <rect x="25" y="25" width="750" height="85" rx="12" fill="#065f46"/>
  <text x="400" y="55" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#a7f3d0" text-anchor="middle">KEPOLISIAN NEGARA REPUBLIK INDONESIA</text>
  <text x="400" y="80" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">BUKU PEMILIK KENDARAAN BERMOTOR (BPKB) - MOBIL / RODA 4</text>
  
  <rect x="60" y="125" width="680" height="40" rx="6" fill="#ecfdf5" stroke="#a7f3d0"/>
  <text x="80" y="150" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="#047857">NO. BPKB: C-04918274-D / 2021</text>
  <text x="500" y="150" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="#b91c1c">NO. POL: D 1284 ABF</text>

  <g transform="translate(60, 180)">
    <text x="20" y="25" font-size="13" font-weight="bold" fill="#475569">Nama Pemilik</text>
    <text x="200" y="25" font-size="14" font-weight="bold" fill="#0f172a">: SITI RAHMAWATI</text>

    <text x="20" y="55" font-size="13" font-weight="bold" fill="#475569">Alamat Pemilik</text>
    <text x="200" y="55" font-size="13" fill="#0f172a">: JL. DAGO ASRI NO. 18, COBLONG, BANDUNG</text>

    <text x="20" y="85" font-size="13" font-weight="bold" fill="#475569">Merek / Tipe</text>
    <text x="200" y="85" font-size="14" font-weight="bold" fill="#047857">: TOYOTA / AVANZA 1.3 G M/T</text>

    <text x="20" y="115" font-size="13" font-weight="bold" fill="#475569">Tahun Pembuatan</text>
    <text x="200" y="115" font-size="13" fill="#0f172a">: 2021 / Silinder: 1329 CC</text>

    <text x="20" y="145" font-size="13" font-weight="bold" fill="#475569">Nomor Rangka</text>
    <text x="200" y="145" font-family="'JetBrains Mono', monospace" font-size="13" fill="#0f172a">: MHKM1BA3JMK018241</text>

    <text x="20" y="175" font-size="13" font-weight="bold" fill="#475569">Nomor Mesin</text>
    <text x="200" y="175" font-family="'JetBrains Mono', monospace" font-size="13" fill="#0f172a">: 1NR-F091823</text>

    <text x="20" y="205" font-size="13" font-weight="bold" fill="#475569">Warna Kendaraan</text>
    <text x="200" y="205" font-size="13" fill="#0f172a">: SILVER METALIK / BENSIN</text>
  </g>

  <g transform="translate(600, 360)">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#059669" stroke-width="3" stroke-dasharray="4,4"/>
    <text x="50" y="48" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">POLDA JABAR</text>
    <text x="50" y="62" font-size="8" fill="#065f46" text-anchor="middle">BPKB VALID</text>
  </g>
  <text x="400" y="500" font-size="11" font-weight="bold" fill="#059669" text-anchor="middle">Taksiran Nilai Agunan: Rp 140.000.000 (Agunan Mobil Utama)</text>
</svg>
`);

export const sampleBarangLainnyaSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <rect width="600" height="450" rx="16" fill="#1e293b" stroke="#334155" stroke-width="4"/>
  <rect x="20" y="20" width="560" height="410" rx="12" fill="#0f172a"/>
  
  <text x="300" y="55" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">TANDA BUKTI TITIP JAMINAN BARANG BERHARGA</text>
  <text x="300" y="80" font-family="'JetBrains Mono', monospace" font-size="12" fill="#94a3b8" text-anchor="middle">No. Reg: JMN-ELEK-2026/09/014</text>
  
  <rect x="40" y="100" width="520" height="230" rx="8" fill="#1e293b" stroke="#475569"/>
  <!-- Laptop icon drawing -->
  <g transform="translate(70, 125)">
    <rect x="0" y="0" width="140" height="95" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    <rect x="10" y="10" width="120" height="75" fill="#0f172a"/>
    <text x="70" y="52" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">MacBook Pro</text>
    <path d="M -15 100 L 155 100 L 145 112 L -5 112 Z" fill="#64748b"/>
  </g>

  <g transform="translate(240, 130)">
    <text x="0" y="20" font-size="13" font-weight="bold" fill="#ffffff">MacBook Pro 14 M2 Pro (2023)</text>
    <text x="0" y="45" font-size="11" fill="#94a3b8">Serial Number: C02G9018MD6R</text>
    <text x="0" y="70" font-size="11" fill="#94a3b8">Kondisi: 98% Mulus Lengkap Charger</text>
    <text x="0" y="95" font-size="11" fill="#94a3b8">Pemilik: Hendra Wijaya</text>
    <text x="0" y="125" font-size="13" font-weight="bold" fill="#34d399">Taksiran Nilai: Rp 22.000.000</text>
  </g>

  <g transform="translate(420, 275)">
    <rect width="120" height="34" rx="17" fill="#059669"/>
    <text x="60" y="22" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">TERVERIFIKASI</text>
  </g>

  <text x="300" y="380" font-size="11" fill="#94a3b8" text-anchor="middle">Diserahkan & Disimpan di Brankas Penyimpanan PM Mitra Sejahtera</text>
</svg>
`);

// Sample Physical Collateral Photo
export const sampleFisikMotorSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#0f172a"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
  
  <!-- Motorcycle silhouette representation -->
  <circle cx="160" cy="270" r="60" fill="none" stroke="#64748b" stroke-width="14"/>
  <circle cx="440" cy="270" r="60" fill="none" stroke="#64748b" stroke-width="14"/>
  <circle cx="160" cy="270" r="25" fill="#334155"/>
  <circle cx="440" cy="270" r="25" fill="#334155"/>
  <!-- Body Frame -->
  <path d="M 160 270 L 260 200 L 360 200 L 440 270 L 330 270 L 240 270 Z" fill="#2563eb"/>
  <path d="M 230 150 L 280 200 L 380 180 L 410 130" stroke="#93c5fd" stroke-width="12" stroke-linecap="round" fill="none"/>
  
  <!-- License Plate Tag -->
  <rect x="240" y="300" width="120" height="35" rx="4" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
  <text x="300" y="322" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">B 4819 SKW</text>

  <!-- Watermark info -->
  <rect x="35" y="35" width="220" height="32" rx="6" fill="#000000" opacity="0.8"/>
  <text x="45" y="55" font-family="'JetBrains Mono', monospace" font-size="10" fill="#38bdf8">FOTO AGUNAN MOTOR HONDA</text>
  
  <text x="540" y="55" font-family="'JetBrains Mono', monospace" font-size="10" fill="#10b981" text-anchor="end">TERVERIFIKASI FISIK</text>
</svg>
`);

export const sampleFisikTanahSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="600" height="400" fill="#0f172a"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  
  <!-- Land and house illustration -->
  <rect x="50" y="250" width="500" height="100" fill="#15803d"/>
  <polygon points="120,250 180,160 280,160 340,250" fill="#b45309"/>
  <rect x="150" y="200" width="160" height="90" fill="#fef3c7"/>
  <rect x="200" y="230" width="40" height="60" fill="#78350f"/>
  <rect x="160" y="215" width="30" height="30" fill="#60a5fa"/>
  <rect x="260" y="215" width="30" height="30" fill="#60a5fa"/>

  <!-- Boundary Marker Pegs -->
  <rect x="80" y="220" width="8" height="40" fill="#dc2626"/>
  <rect x="480" y="220" width="8" height="40" fill="#dc2626"/>
  <line x1="84" y1="230" x2="484" y2="230" stroke="#facc15" stroke-dasharray="6,4" stroke-width="2"/>

  <rect x="35" y="35" width="260" height="32" rx="6" fill="#000000" opacity="0.8"/>
  <text x="45" y="55" font-family="'JetBrains Mono', monospace" font-size="10" fill="#fde047">FOTO FISIK TANAH &amp; BANGUNAN SHM</text>
  <text x="540" y="55" font-family="'JetBrains Mono', monospace" font-size="10" fill="#10b981" text-anchor="end">PATOK BPN VALID</text>
</svg>
`);

export const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: 'LOAN-2026-0891',
    contractNumber: 'SPP/PM-MSB/2026/IX/0042',
    createdAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
    applicant: {
      fullName: 'Budi Santoso',
      nik: '3174051208920003',
      kkNumber: '3174051009140001',
      birthPlace: 'Jakarta',
      birthDate: '1992-08-12',
      gender: 'Laki-laki',
      address: 'Jl. Tebet Barat Dalam No. 45, RT 004 / RW 008, Kel. Tebet Barat, Kec. Tebet, Kota Jakarta Selatan',
      phoneNumber: '081234567890',
      email: 'budi.santoso@email.com',
      job: 'Karyawan Swasta',
      monthlyIncome: 12500000,
      bankName: 'Bank Central Asia (BCA)',
      bankAccountNumber: '8910293841',
      emergencyContactName: 'Dewi Lestari (Istri)',
      emergencyContactPhone: '081398765432',
      familyMemberCount: 3,
      otherLoansCount: 1,
      otherLoansTotalAmount: 2000000,
      otherLoansDetails: 'Koperasi Simpan Pinjam Sejahtera (Sisa Rp 2.000.000)'
    },
    hasWitness: true,
    witness: {
      fullName: 'Siti Rahmawati',
      nik: '3174055502940002',
      relationship: 'Rekan Kerja / Penjamin',
      phoneNumber: '081299887766',
      address: 'Jl. Tebet Timur Dalam No. 14, Jakarta Selatan'
    },
    locationTag: {
      latitude: -6.2297,
      longitude: 106.8559,
      accuracy: 8.5,
      address: 'Jl. Tebet Barat Dalam VII No. 12, RT 004/RW 002, Tebet, Jakarta Selatan',
      timestamp: '2026-09-10T14:27:00Z',
      source: 'GPS_AUTO'
    },
    loan: {
      loanAmount: 5000000,
      tenorWeeks: 8,
      tenorMonths: 2,
      interestRateAnnual: 20,
      weeklyInstallment: 750000,
      monthlyInstallment: 3000000,
      adminFee: 500000,
      totalRepayment: 6000000,
      purpose: 'Modal Usaha Warung & Logistik'
    },
    collateral: {
      type: 'BPKB_MOTOR',
      title: 'BPKB Motor Honda Vario 160cc (2022)',
      ownerName: 'Budi Santoso',
      documentNumber: 'M-08291482-B / Plat: B 4819 SKW',
      description: 'Honda Vario 160 CBS Sporty Hitam Doff, Tahun 2022, Mesin & Bodi terawat orisinil.',
      estimatedValue: 18000000,
      collateralDocUrl: sampleBpkbMotorSvg,
      collateralPhotoUrl: sampleFisikMotorSvg
    },
    documents: {
      ktpUrl: sampleKtpSvg,
      kkUrl: sampleKkSvg,
      selfieUrl: sampleSelfieSvg,
      signatureUrl: sampleSignatureSvg,
      witnessKtpUrl: sampleWitnessKtpSvg,
      witnessSelfieUrl: sampleWitnessSelfieSvg,
      witnessSignatureUrl: sampleWitnessSignatureSvg,
      collateralDocUrl: sampleBpkbMotorSvg,
      collateralPhotoUrl: sampleFisikMotorSvg
    },
    biometric: {
      isVerified: true,
      verifiedAt: '2026-09-10T14:28:15Z',
      credentialId: 'fido2_cred_9a2b8e4f1',
      authType: 'WEBAUTHN_BIOMETRIC',
      deviceInfo: 'Biometric Authenticator (TouchID / Android Biometrics)'
    },
    status: 'PENDING'
  },
  {
    id: 'LOAN-2026-0889',
    contractNumber: 'SPP/PM-MSB/2026/IX/0041',
    createdAt: '2026-09-09T10:15:00Z',
    updatedAt: '2026-09-09T16:20:00Z',
    applicant: {
      fullName: 'Siti Rahmawati',
      nik: '3273105504940002',
      kkNumber: '3273101201150004',
      birthPlace: 'Bandung',
      birthDate: '1994-04-15',
      gender: 'Perempuan',
      address: 'Jl. Dago Asri No. 18, RT 002 / RW 005, Dago, Coblong, Kota Bandung, Jawa Barat',
      phoneNumber: '085712349988',
      email: 'siti.rahma@domain.id',
      job: 'Staf Administrasi',
      monthlyIncome: 8500000,
      bankName: 'Bank Mandiri',
      bankAccountNumber: '131002994821',
      emergencyContactName: 'Agus Raharjo (Kakak)',
      emergencyContactPhone: '081298761122',
      familyMemberCount: 2,
      otherLoansCount: 0,
      otherLoansTotalAmount: 0,
      otherLoansDetails: 'Tidak ada pinjaman berjalan di tempat lain'
    },
    hasWitness: false,
    locationTag: {
      latitude: -6.8856,
      longitude: 107.6142,
      accuracy: 12.0,
      address: 'Jl. Dago Asri No. 18, RT 002 / RW 005, Dago, Coblong, Kota Bandung',
      timestamp: '2026-09-09T10:11:30Z',
      source: 'GPS_AUTO'
    },
    loan: {
      loanAmount: 8000000,
      tenorWeeks: 12,
      tenorMonths: 3,
      interestRateAnnual: 20,
      weeklyInstallment: 800000,
      monthlyInstallment: 3200000,
      adminFee: 800000,
      totalRepayment: 9600000,
      purpose: 'Biaya Pendidikan Semester Akhir'
    },
    collateral: {
      type: 'BPKB_MOBIL',
      title: 'BPKB Mobil Toyota Avanza 1.3 G M/T (2021)',
      ownerName: 'Siti Rahmawati',
      documentNumber: 'C-04918274-D / Plat: D 1284 ABF',
      description: 'Toyota Avanza 1.3 G M/T Silver Metalik, Tahun 2021, Pajak Hidup.',
      estimatedValue: 140000000,
      collateralDocUrl: sampleBpkbMobilSvg,
      collateralPhotoUrl: sampleBpkbMobilSvg
    },
    documents: {
      ktpUrl: sampleKtpSvg,
      kkUrl: sampleKkSvg,
      selfieUrl: sampleSelfieSvg,
      signatureUrl: sampleSignatureSvg,
      witnessKtpUrl: '',
      witnessSelfieUrl: '',
      witnessSignatureUrl: '',
      collateralDocUrl: sampleBpkbMobilSvg,
      collateralPhotoUrl: sampleBpkbMobilSvg
    },
    biometric: {
      isVerified: true,
      verifiedAt: '2026-09-09T10:12:40Z',
      credentialId: 'fido2_cred_7c1d3a9b',
      authType: 'WEBAUTHN_BIOMETRIC',
      deviceInfo: 'FaceID Apple iOS'
    },
    status: 'APPROVED',
    verificationNotes: 'Berkas lengkap, kesesuaian KTP dan KK valid, jaminan BPKB Mobil valid atas nama pemohon, skor kredit memadai.',
    verifiedBy: 'Irfan Hakim (Credit Analyst)',
    verifiedAt: '2026-09-09T16:20:00Z',
    statusLogs: [
      {
        status: 'APPROVED',
        changedBy: 'Irfan Hakim (Credit Analyst)',
        changedAt: '2026-09-09T16:20:00Z',
        notes: 'Berkas lengkap, kesesuaian KTP dan KK valid, jaminan BPKB Mobil valid atas nama pemohon, skor kredit memadai.'
      }
    ]
  },
  {
    id: 'LOAN-2026-0885',
    contractNumber: 'SPP/PM-MSB/2026/IX/0038',
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-08T11:45:00Z',
    applicant: {
      fullName: 'Hendra Wijaya',
      nik: '3578011906880005',
      kkNumber: '3578012002160002',
      birthPlace: 'Surabaya',
      birthDate: '1988-06-19',
      gender: 'Laki-laki',
      address: 'Jl. Rungkut Madya No. 88, Rungkut Kidul, Surabaya, Jawa Timur',
      phoneNumber: '082199887766',
      email: 'hendra.w@surabaya.org',
      job: 'Wiraswasta Logistik',
      monthlyIncome: 6000000,
      bankName: 'Bank Rakyat Indonesia (BRI)',
      bankAccountNumber: '020601004928503',
      emergencyContactName: 'Maya Indah (Istri)',
      emergencyContactPhone: '082155443322',
      familyMemberCount: 4,
      otherLoansCount: 2,
      otherLoansTotalAmount: 6500000,
      otherLoansDetails: 'BRI Mikro (Rp 4.500.000) & Kredivo (Rp 2.000.000)'
    },
    hasWitness: true,
    witness: {
      fullName: 'Maya Indah',
      nik: '3578016508900004',
      relationship: 'Pasangan (Istri)',
      phoneNumber: '082155443322',
      address: 'Jl. Rungkut Madya No. 88, Surabaya'
    },
    locationTag: {
      latitude: -7.3195,
      longitude: 112.7842,
      accuracy: 15.2,
      address: 'Jl. Rungkut Madya No. 88, Rungkut Kidul, Kota Surabaya, Jawa Timur',
      timestamp: '2026-09-08T08:58:00Z',
      source: 'GPS_AUTO'
    },
    loan: {
      loanAmount: 2000000,
      tenorWeeks: 4,
      tenorMonths: 1,
      interestRateAnnual: 20,
      weeklyInstallment: 600000,
      monthlyInstallment: 2400000,
      adminFee: 200000,
      totalRepayment: 2400000,
      purpose: 'Tambahan Modal Usaha & Servis Armada'
    },
    collateral: {
      type: 'BARANG_LAINNYA',
      title: 'Barang Elektronik: MacBook Pro 14 M2 Pro (2023)',
      ownerName: 'Hendra Wijaya',
      documentNumber: 'Serial: C02G9018MD6R',
      description: 'Apple MacBook Pro 14 Inch M2 Pro Space Gray, 16GB/512GB, kondisi mulus 98%.',
      estimatedValue: 22000000,
      collateralDocUrl: sampleBarangLainnyaSvg,
      collateralPhotoUrl: sampleBarangLainnyaSvg
    },
    documents: {
      ktpUrl: sampleKtpSvg,
      kkUrl: sampleKkSvg,
      selfieUrl: sampleSelfieSvg,
      signatureUrl: sampleSignatureSvg,
      witnessKtpUrl: sampleWitnessKtpSvg,
      witnessSelfieUrl: sampleWitnessSelfieSvg,
      witnessSignatureUrl: sampleWitnessSignatureSvg,
      collateralDocUrl: sampleBarangLainnyaSvg,
      collateralPhotoUrl: sampleBarangLainnyaSvg
    },
    biometric: {
      isVerified: false,
      authType: 'PIN_SIMULATED',
      deviceInfo: 'Simulated fallback'
    },
    status: 'REJECTED',
    verificationNotes: 'Foto KTP terlalu buram pada bagian NIK dan foto selfie tidak sesuai dengan fisik di KTP.',
    verifiedBy: 'Maya Putri (Verifikator Dokumen)',
    verifiedAt: '2026-09-08T11:45:00Z',
    statusLogs: [
      {
        status: 'REJECTED',
        changedBy: 'Maya Putri (Verifikator Dokumen)',
        changedAt: '2026-09-08T11:45:00Z',
        notes: 'Foto KTP terlalu buram pada bagian NIK dan foto selfie tidak sesuai dengan fisik di KTP.'
      }
    ]
  }
];

export const INITIAL_SURAT_SITA: SuratSitaRecord[] = [
  {
    id: 'sita-001',
    letterNumber: 'BA-SITA/PMSB/2026/09/0014',
    contractNumber: 'SPP/PINJ/2026/VIII/0028',
    applicationId: 'app-002',
    createdAt: '2026-09-18T10:30:00Z',
    executionDate: '2026-09-18',
    status: 'TEREKSEKUSI',
    debtor: {
      fullName: 'Dedy Iskandar',
      nik: '3174052309850004',
      phoneNumber: '081377889900',
      address: 'Jl. Rawamangun No. 18, RT 02/05, Pulo Gadung, Jakarta Timur',
      emergencyContactName: 'Hj. Aminah (Ibu Kandung)',
      emergencyContactPhone: '081311223344',
      ktpPhotoUrl: sampleKtpSvg,
      borrowerPhotoUrl: sampleSelfieSvg
    },
    financials: {
      principalRemaining: 15000000,
      interestDue: 2250000,
      penaltyFee: 750000,
      totalOverdueDebt: 18000000,
      overdueDays: 68,
      warningLettersIssued: 'SP 1 (15/07/2026), SP 2 (05/08/2026), SP 3 / Somasi Akhir (25/08/2026)'
    },
    collateral: {
      type: 'BPKB_MOTOR',
      title: 'Sepeda Motor Honda Vario 160 CBS',
      ownerName: 'Dedy Iskandar',
      documentNumber: 'BPKB No. M-8891283 / Plat B 4821 TKQ',
      description: 'Tahun 2023, Warna Hitam Doff, No. Rangka: MH1KF123K98765, No. Mesin: KF12E-18239, STNK Asli, Kunci Kontak 2 Buah',
      estimatedValue: 21000000,
      collateralPhotoUrl: sampleBpkbMotorSvg,
      collateralDocUrl: sampleBpkbMotorSvg,
      seizureConditionNotes: 'Unit motor dalam kondisi prima dan hidup normal, bodi terawat dengan lecet pemakaian wajar, speedometer 18.420 km, spion lengkap, ban depan/belakang tebal.',
      storageLocation: 'Pool & Gudang Penyimpanan Aset Jaminan PM Mitra Sejahtera Bersama, Jl. Gatot Subroto Kav. 45 Jakarta'
    },
    officer: {
      name: 'Hendra Wijaya, S.H.',
      employeeId: 'PMSB-REC-008',
      roleTitle: 'Koordinator Remedial & Eksekusi Agunan',
      signatureUrl: sampleSignatureSvg
    },
    witness: {
      name: 'Bambang Sujarwo',
      nik: '3175021406780001',
      relationship: 'Ketua RT 02 / Saksi Lingkungan Setempat',
      phone: '081288776655',
      witnessPhotoUrl: sampleWitnessSelfieSvg,
      signatureUrl: sampleWitnessSignatureSvg
    },
    debtorSignatureUrl: sampleSignatureSvg,
    emeterai: {
      hasEmeterai: true,
      serialNumber: '2026-PMSB-EMET10K-9812401',
      stampedAt: '2026-09-20T10:30:00Z',
      peruriCode: 'PERURI-DJP-10000-882199',
      verified: true
    },
    notes: 'Debitur menyepakati penyerahan agunan sukarela untuk diamankan di gudang kreditur selama 14 hari kalender guna penyelesaian kewajiban sebelum dilakukan proses pelelangan/likuidasi agunan.',
    redemptionDeadlineDays: 14
  },
  {
    id: 'sita-002',
    letterNumber: 'SP-SITA/PMSB/2026/09/0019',
    contractNumber: 'SPP/PINJ/2026/IX/0035',
    applicationId: 'app-001',
    createdAt: '2026-09-22T08:00:00Z',
    executionDate: '2026-09-25',
    status: 'DITERBITKAN',
    debtor: {
      fullName: 'Budi Santoso',
      nik: '3174051208920003',
      phoneNumber: '081234567890',
      address: 'Jl. Tebet Barat Dalam No. 45, RT 04/08, Kel. Tebet Barat, Jakarta Selatan',
      emergencyContactName: 'Siti Rahmawati (Istri)',
      emergencyContactPhone: '081299887766',
      ktpPhotoUrl: sampleKtpSvg,
      borrowerPhotoUrl: sampleSelfieSvg
    },
    financials: {
      principalRemaining: 25000000,
      interestDue: 3500000,
      penaltyFee: 1200000,
      totalOverdueDebt: 29700000,
      overdueDays: 45,
      warningLettersIssued: 'SP 1 (18/08/2026), SP 2 (01/09/2026), SP 3 / Somasi Akhir (15/09/2026)'
    },
    collateral: {
      type: 'BPKB_MOBIL',
      title: 'Mobil Daihatsu Gran Max Pick Up 1.5',
      ownerName: 'Budi Santoso',
      documentNumber: 'BPKB No. B-9982310 / Plat B 9210 SAC',
      description: 'Tahun 2022, Warna Putih, No. Rangka: MHKP32199887, No. Mesin: 3SZ-VE-88912, STNK Asli Berlaku, Kunci Kontak',
      estimatedValue: 85000000,
      collateralPhotoUrl: sampleBpkbMobilSvg,
      collateralDocUrl: sampleBpkbMobilSvg,
      seizureConditionNotes: 'Kendaraan operasional pick up, terdapat goresan pemakaian usaha pada bak muatan, mesin hidup lancar dan dokumen kelengkapan lengkap.',
      storageLocation: 'Pool & Gudang Penyimpanan Aset Jaminan PM Mitra Sejahtera Bersama, Jl. Gatot Subroto Kav. 45 Jakarta'
    },
    officer: {
      name: 'Hendra Wijaya, S.H.',
      employeeId: 'PMSB-REC-008',
      roleTitle: 'Koordinator Remedial & Eksekusi Agunan',
      signatureUrl: sampleSignatureSvg
    },
    witness: {
      name: 'Agus Pratama',
      nik: '3174051904850002',
      relationship: 'Tokoh Lingkungan / Saksi Warga',
      phone: '081399881122',
      witnessPhotoUrl: sampleWitnessSelfieSvg,
      signatureUrl: sampleWitnessSignatureSvg
    },
    debtorSignatureUrl: sampleSignatureSvg,
    emeterai: {
      hasEmeterai: true,
      serialNumber: '2026-PMSB-EMET10K-9812402',
      stampedAt: '2026-09-22T08:15:00Z',
      peruriCode: 'PERURI-DJP-10000-882200',
      verified: true
    },
    notes: 'Surat Tugas dan Berita Acara Penyitaan Agunan telah diterbitkan dan ditugaskan kepada Tim Eksekusi Lapangan.',
    redemptionDeadlineDays: 14
  }
];

