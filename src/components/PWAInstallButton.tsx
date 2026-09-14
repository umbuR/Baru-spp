import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Laptop, Share2, HelpCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'pc'>('android');

  useEffect(() => {
    // Detect standalone mode (app already launched as installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      setActiveGuideTab('ios');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Show guided instructions for the respective platform
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Terpasang (PWA)</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-600/40 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs'
        }`}
        title="Pasang aplikasi ini di layar utama HP atau desktop"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>{deferredPrompt ? 'Instal Aplikasi' : 'Pasang di HP / PC'}</span>
      </button>

      {/* Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pasang Aplikasi PM Mitra</h3>
                <p className="text-xs text-slate-400">Nikmati akses cepat tanpa download dari Play Store</p>
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="flex rounded-xl bg-slate-800/80 p-1 mb-4 border border-slate-700/60">
              <button
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeGuideTab === 'android' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeGuideTab === 'ios' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone/iPad</span>
              </button>
              <button
                onClick={() => setActiveGuideTab('pc')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeGuideTab === 'pc' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC / Laptop</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-5 text-xs leading-relaxed space-y-3">
              {activeGuideTab === 'android' && (
                <div>
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Panduan Browser Google Chrome / Android:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Buka aplikasi ini di browser <strong>Chrome</strong> HP Anda.</li>
                    <li>Ketuk ikon <strong>menu titik tiga (⋮)</strong> di pojok kanan atas browser.</li>
                    <li>Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
                    <li>Ketuk <strong>Instal</strong>. Ikon PM Mitra akan muncul di beranda HP Anda layaknya aplikasi asli!</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'ios' && (
                <div>
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Panduan Safari iPhone & iPad (iOS):
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Buka link aplikasi ini menggunakan browser bawaan <strong>Safari</strong>.</li>
                    <li>Ketuk tombol <strong>Bagikan / Share</strong> (ikon persegi dengan panah ke atas) di bilah bawah.</li>
                    <li>Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                    <li>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'pc' && (
                <div>
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4" /> Panduan Browser Desktop (Chrome, Edge):
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Lihat di sebelah kanan <strong>Address Bar (bilah URL)</strong> browser Anda.</li>
                    <li>Klik ikon <strong>Instal (gambar monitor dengan panah ke bawah)</strong>.</li>
                    <li>Klik tombol <strong>Instal</strong> pada jendela konfirmasi.</li>
                    <li>Aplikasi akan terbuka dalam jendela tersendiri tanpa bilah URL browser.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
