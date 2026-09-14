import React from 'react';
import { FolderTree, FileCode, CheckCircle2, Layers, Cpu, Database, Palette } from 'lucide-react';

export const ProjectStructureView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Struktur Folder & Arsitektur Lengkap (Production Stack)
            </h2>
            <p className="text-xs text-slate-400">
              Arsitektur terorganisir untuk aplikasi PM Mitra Sejahtera Bersama enterprise mobile-first & PWA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* File Tree Directory */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            <div className="text-emerald-400 font-bold mb-2">📁 pm-mitra-sejahtera-bersama/</div>
            <div className="pl-4 space-y-1">
              <div>├── 📁 public/</div>
              <div className="pl-4 text-slate-400">├── 📄 manifest.json <span className="text-slate-500 font-sans text-[11px]">// Konfigurasi PWA Installable</span></div>
              <div className="pl-4 text-slate-400">├── 📄 icon.svg <span className="text-slate-500 font-sans text-[11px]">// Ikon maskable aplikasi</span></div>
              <div className="pl-4 text-slate-400">└── 📄 _redirects <span className="text-slate-500 font-sans text-[11px]">// SPA routing untuk Netlify/Vercel</span></div>
              
              <div className="pt-1">├── 📁 src/</div>
              <div className="pl-4 text-slate-400">├── 📁 components/</div>
              <div className="pl-8 text-sky-400">├── 📄 MobileLoanFlow.tsx <span className="text-slate-500 font-sans text-[11px]">// Wizard Pengajuan Nasabah HP</span></div>
              <div className="pl-8 text-sky-400">├── 📄 CameraCaptureModal.tsx <span className="text-slate-500 font-sans text-[11px]">// Kamera KTP/KK/Selfie + Overlay Guide</span></div>
              <div className="pl-8 text-sky-400">├── 📄 SignaturePad.tsx <span className="text-slate-500 font-sans text-[11px]">// Kanvas HTML5 Tanda Tangan Digital</span></div>
              <div className="pl-8 text-sky-400">├── 📄 AgreementViewerModal.tsx <span className="text-slate-500 font-sans text-[11px]">// Pratinjau Dokumen Kontrak & Download</span></div>
              <div className="pl-8 text-sky-400">├── 📄 AdminDashboard.tsx <span className="text-slate-500 font-sans text-[11px]">// Verifikasi Berkas Side-by-Side</span></div>
              <div className="pl-8 text-sky-400">├── 📄 DatabaseSchemaView.tsx <span className="text-slate-500 font-sans text-[11px]">// DDL PostgreSQL Supabase & RLS</span></div>
              <div className="pl-8 text-sky-400">├── 📄 DeploymentGuideView.tsx <span className="text-slate-500 font-sans text-[11px]">// Panduan Deploy Vercel/Supabase</span></div>
              <div className="pl-8 text-sky-400">├── 📄 ProjectStructureView.tsx <span className="text-slate-500 font-sans text-[11px]">// Dokumentasi struktur proyek</span></div>
              <div className="pl-8 text-sky-400">└── 📄 PWAInstallButton.tsx <span className="text-slate-500 font-sans text-[11px]">// Prompt instalasi PWA di HP</span></div>

              <div className="pl-4 text-slate-400">├── 📁 data/</div>
              <div className="pl-8 text-amber-400">└── 📄 initialData.ts <span className="text-slate-500 font-sans text-[11px]">// Sample data nasabah & berkas SVG</span></div>

              <div className="pl-4 text-slate-400">├── 📁 utils/</div>
              <div className="pl-8 text-emerald-400">├── 📄 pdfGenerator.ts <span className="text-slate-500 font-sans text-[11px]">// Generator PDF resmi jsPDF PM Mitra Sejahtera</span></div>
              <div className="pl-8 text-emerald-400">└── 📄 webauthn.ts <span className="text-slate-500 font-sans text-[11px]">// WebAuthn FIDO2 Biometric Browser API</span></div>

              <div className="pl-4 text-slate-400">├── 📄 types.ts <span className="text-slate-500 font-sans text-[11px]">// TypeScript models & interfaces</span></div>
              <div className="pl-4 text-slate-400">├── 📄 App.tsx <span className="text-slate-500 font-sans text-[11px]">// Shell navigasi utama & mode toggle</span></div>
              <div className="pl-4 text-slate-400">├── 📄 main.tsx <span className="text-slate-500 font-sans text-[11px]">// React DOM entry point</span></div>
              <div className="pl-4 text-slate-400">└── 📄 index.css <span className="text-slate-500 font-sans text-[11px]">// Tailwind CSS configuration</span></div>

              <div className="pt-1 text-slate-400">├── 📄 index.html <span className="text-slate-500 font-sans text-[11px]">// HTML entry point & PWA meta tags</span></div>
              <div className="text-slate-400">├── 📄 package.json <span className="text-slate-500 font-sans text-[11px]">// Dependensi React 19, Tailwind, jsPDF</span></div>
              <div className="text-slate-400">├── 📄 tsconfig.json <span className="text-slate-500 font-sans text-[11px]">// Konfigurasi TypeScript strict</span></div>
              <div className="text-slate-400">└── 📄 vite.config.ts <span className="text-slate-500 font-sans text-[11px]">// Bundler Vite & Tailwind Plugin</span></div>
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Palette className="w-4 h-4 text-blue-400" />
                Frontend Stack
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                React 19 + TypeScript + Vite + Tailwind CSS. Responsif mobile-first dengan transisi halus dan viewport framing.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Hardware & Browser APIs
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <code>navigator.mediaDevices.getUserMedia</code> untuk kamera langsung + overlay guides, WebAuthn FIDO2 Biometric API, dan HTML5 Canvas untuk tanda tangan jari/stylus.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <FileCode className="w-4 h-4 text-purple-400" />
                Legal Document Engine
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <code>jspdf</code> client-side generation yang menghasilkan Surat Perjanjian Pinjaman PM Mitra Sejahtera Bersama standar A4 beserta stempel tanda tangan dan lampiran foto dokumen.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Database className="w-4 h-4 text-sky-400" />
                Durable Backend (Supabase)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                PostgreSQL dengan RLS (Row Level Security) + S3 Compatible Storage Bucket untuk foto KTP, KK, Selfie, dan Signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
