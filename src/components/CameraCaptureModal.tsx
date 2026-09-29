import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera, Upload, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { DocumentType } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  docType: DocumentType;
  title: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  docType,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const isSelfieMode = docType === 'selfie' || docType === 'witness_selfie';
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    isSelfieMode ? 'user' : 'environment'
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    if (!isOpen) return;
    setIsStartingCamera(true);
    setCameraError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh browser Anda.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Camera access issue:', error.message);
      setCameraError(
        'Tidak dapat mengakses kamera secara langsung (mungkin dibatasi oleh izin browser atau mode iframe). Anda dapat menggunakan unggah file/galeri di bawah.'
      );
    } finally {
      setIsStartingCamera(false);
    }
  }, [isOpen, facingMode]);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setLivenessPassed(false);
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, startCamera]);

  // Simulate subtle liveness detection progression for selfie
  useEffect(() => {
    if (isSelfieMode && isOpen && !capturedImage && !cameraError) {
      const timer = setTimeout(() => {
        setLivenessPassed(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSelfieMode, isOpen, capturedImage, cameraError]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera selfie, mirror the capture for natural look
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLivenessPassed(false);
    startCamera();
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Tutup kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            /* Review Captured Image */
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={capturedImage}
                alt="Captured Document"
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg border border-slate-700"
              />
              <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Check className="w-3.5 h-3.5" />
                Foto Berhasil Diambil
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Error / Fallback View */
            <div className="p-6 text-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-white font-medium text-sm sm:text-base mb-2">Akses Kamera Langsung Terkendala</h4>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/30 transition"
              >
                <Upload className="w-4 h-4" />
                Pilih Foto dari Galeri / Dokumen
              </button>
            </div>
          ) : (
            /* Live Camera Feed with Overlay Frame */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* OVERLAY GUIDES */}
              {(docType === 'ktp' || docType === 'witness_ktp') && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* KTP Card Aspect Ratio Box (85.6 x 53.98) */}
                  <div className="relative w-[85%] max-w-[340px] aspect-[85.6/53.98] border-2 border-dashed border-blue-400/90 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-400/30">
                        {docType === 'witness_ktp' ? 'Posisikan e-KTP Saksi' : 'Posisikan e-KTP'}
                      </span>
                      <div className="w-8 h-8 rounded border border-blue-400/40 bg-blue-500/10 flex items-center justify-center">
                        <span className="text-[8px] text-blue-200">Foto</span>
                      </div>
                    </div>
                    {/* Corner Guides */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

                    <div className="border-t border-dashed border-blue-400/40 pt-1">
                      <span className="text-[9px] text-blue-200 font-mono">
                        {docType === 'witness_ktp' ? 'Area NIK Saksi Jelas' : 'Area NIK & Data Diri Jelas'}
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-xs font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Pastikan seluruh kartu berada di dalam bingkai tanpa pantulan cahaya
                  </p>
                </div>
              )}

              {docType === 'kk' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  {/* KK Landscape Document Box */}
                  <div className="relative w-[92%] max-w-[360px] aspect-[4/3] border-2 border-dashed border-sky-400/90 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col justify-between p-3">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-400/30">
                        KARTU KELUARGA (KK)
                      </span>
                    </div>
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400" />
                    <p className="text-[9px] text-sky-200 text-center">Pastikan tabel nama keluarga & stempel terbaca jelas</p>
                  </div>
                  <p className="text-white text-xs font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Letakkan lembar KK di bidang datar dengan cahaya merata
                  </p>
                </div>
              )}

              {(docType === 'selfie' || docType === 'witness_selfie') && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  {/* Selfie Face Oval Overlay */}
                  <div
                    className={`relative w-[210px] h-[280px] rounded-[50%] border-4 ${
                      livenessPassed ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'border-blue-400 animate-pulse'
                    } shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col items-center justify-center`}
                  >
                    {livenessPassed && (
                      <div className="absolute -top-4 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" /> Wajah {docType === 'witness_selfie' ? 'Saksi ' : ''}Terdeteksi Pas
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium mt-4 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm text-center">
                    {livenessPassed
                      ? 'Posisi wajah optimal, silakan tekan tombol Ambil Foto'
                      : `Posisikan wajah ${docType === 'witness_selfie' ? 'saksi ' : ''}di dalam oval & tatap kamera secara lurus`}
                  </p>
                </div>
              )}

              {docType === 'collateral_doc' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  {/* Collateral Document Overlay */}
                  <div className="relative w-[92%] max-w-[360px] aspect-[4/3] border-2 border-dashed border-amber-400/90 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col justify-between p-3">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-400/40 uppercase">
                        DOKUMEN JAMINAN (BPKB / SERTIFIKAT TANAH)
                      </span>
                    </div>
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
                    <p className="text-[9px] text-amber-200 text-center font-mono">Pastikan Nomor Surat / BPKB / Plat &amp; Nama Pemilik Jelas</p>
                  </div>
                  <p className="text-white text-xs font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Posisikan halaman utama dokumen sertifikat atau lembar BPKB di dalam bingkai
                  </p>
                </div>
              )}

              {docType === 'collateral_photo' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  {/* Collateral Physical Photo Overlay */}
                  <div className="relative w-[92%] max-w-[380px] aspect-[16/10] border-2 border-teal-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-400/40">
                        FOTO FISIK JAMINAN / AGUNAN
                      </span>
                      <span className="text-[9px] text-teal-200 font-mono">Tampak Utuh</span>
                    </div>
                    {/* Crosshair Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-teal-400/60" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-teal-400/60" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 w-3 bg-teal-400/60" />
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 h-0.5 w-3 bg-teal-400/60" />
                    </div>
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
                    <p className="text-[9px] text-teal-200 text-center">Foto fisik kendaraan / lokasi tanah / barang dengan pencahayaan terang</p>
                  </div>
                  <p className="text-white text-xs font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Pastikan seluruh bodi kendaraan / objek agunan terlihat jelas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Canvas & File Input */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={isSelfieMode ? 'user' : 'environment'}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Modal Footer Controls */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Ulangi Foto
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-900/30 transition"
              >
                <Check className="w-4 h-4" />
                Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Pilih foto dari galeri HP"
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Galeri HP</span>
              </button>

              {/* Big Shutter Button */}
              <button
                onClick={handleCapture}
                disabled={isStartingCamera || !!cameraError}
                className="w-14 h-14 rounded-full border-4 border-white/80 bg-blue-600 active:scale-95 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-white shadow-xl shadow-blue-900/50 transition"
                aria-label="Ambil foto sekarang"
              >
                <div className="w-10 h-10 rounded-full bg-white" />
              </button>

              <button
                onClick={handleSwitchCamera}
                disabled={!!cameraError}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Ganti kamera depan / belakang"
              >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">Putar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
