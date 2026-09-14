import React from 'react';
import { Rocket, Globe, Server, CheckCircle2, Terminal, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Petunjuk Deployment Online 100% GRATIS (Vercel / Netlify + Supabase)
            </h2>
            <p className="text-xs text-slate-400">
              Langkah lengkap menerbitkan aplikasi ini ke internet agar dapat diakses dari browser HP nasabah di seluruh Indonesia
            </p>
          </div>
        </div>

        {/* Step-by-step Guide */}
        <div className="mt-6 space-y-6">
          {/* LANGKAH 1 */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/60">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-white">
                Siapkan Backend & Database Gratis di Supabase
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Supabase menyediakan PostgreSQL gratis, otentikasi pengguna, dan Object Storage hingga 1 GB gratis tanpa perlu kartu kredit.
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-2 mb-3">
              <li>Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">supabase.com</a> dan masuk menggunakan akun GitHub atau Google Anda.</li>
              <li>Klik tombol <strong>"New Project"</strong>, beri nama misalnya <code>pm-mitra-sejahtera-db</code>, pilih region <strong>Singapore (ap-southeast-1)</strong> untuk latency tercepat ke Indonesia, dan tentukan Database Password yang aman.</li>
              <li>Buka menu <strong>SQL Editor</strong> di dashboard Supabase.</li>
              <li>Salin script SQL dari tab <strong>"Skema Database"</strong> di aplikasi ini, tempelkan ke SQL Editor, lalu klik <strong>"Run"</strong>.</li>
              <li>Buka menu <strong>Project Settings &gt; API</strong>, lalu catat:
                <ul className="list-disc list-inside pl-4 mt-1 text-slate-300 font-mono text-[11px]">
                  <li>Project URL (misal: <code>https://xyzcompany.supabase.co</code>)</li>
                  <li>anon / public API Key</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* LANGKAH 2 */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/60">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-white">
                Publish Source Code ke GitHub
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Push kode proyek ini ke repositori GitHub pribadi Anda:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-300 overflow-x-auto space-y-1">
              <div>git init</div>
              <div>git add .</div>
              <div>git commit -m &quot;feat: initial commit pm mitra sejahtera bersama pwa&quot;</div>
              <div>git branch -M main</div>
              <div>git remote add origin https://github.com/username/pm-mitra-sejahtera-pwa.git</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* LANGKAH 3 */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/60">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-white">
                Deploy Frontend ke Vercel (Rekomendasi Utama)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Vercel memberikan sertifikat SSL HTTPS otomatis secara cuma-cuma (<strong>wajib untuk WebAuthn & Kamera HP</strong>):
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-2 mb-3">
              <li>Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">vercel.com</a> dan login dengan GitHub.</li>
              <li>Klik <strong>"Add New..." &gt; "Project"</strong>, lalu impor repositori GitHub yang baru dibuat.</li>
              <li>Framework Preset: Pilih <strong>Vite</strong>.</li>
              <li>Build Command: <code>npm run build</code> (atau default).</li>
              <li>Output Directory: <code>dist</code>.</li>
              <li>Pada bagian <strong>Environment Variables</strong>, masukkan:
                <ul className="list-disc list-inside pl-4 mt-1 font-mono text-[11px] text-slate-300">
                  <li><code>VITE_SUPABASE_URL</code> = URL Project Supabase Anda</li>
                  <li><code>VITE_SUPABASE_ANON_KEY</code> = Public Anon Key Supabase Anda</li>
                </ul>
              </li>
              <li>Klik <strong>"Deploy"</strong>. Dalam 45 detik, aplikasi Anda sudah online dengan domain <code>https://nama-proyek.vercel.app</code>!</li>
            </ol>
          </div>

          {/* LANGKAH 4 */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/60">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-white">
                Opsi Alternatif: Deploy Menggunakan Netlify
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Jika lebih memilih Netlify:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
              <li>Buka <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">netlify.com</a> &gt; &quot;Import from Git&quot;.</li>
              <li>Pilih repositori, atur build command ke <code>npm run build</code> dan publish directory ke <code>dist</code>.</li>
              <li>Tambahkan redirect rule di <code>public/_redirects</code>: <code>/*  /index.html  200</code> agar route SPA tidak 404 saat di-refresh.</li>
              <li>Klik <strong>Deploy site</strong>.</li>
            </ul>
          </div>

          {/* LANGKAH 5 */}
          <div className="border border-emerald-500/30 rounded-2xl p-5 bg-emerald-950/10">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              Verifikasi di HP Nasabah (PWA & Biometrik)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Karena Vercel/Netlify menyajikan aplikasi melalui <strong>HTTPS aman</strong>, seluruh fitur hardware HP:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-emerald-200">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kamera Depan & Belakang aktif dengan overlay</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WebAuthn FIDO2 TouchID & FaceID terverifikasi asli</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kanvas e-Signature sentuhan jari super responsif</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tombol Install PWA langsung muncul di layar HP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
