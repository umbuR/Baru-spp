import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, PenTool, ShieldCheck, UserCheck, User } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  savedSignature?: string;
  applicantName?: string;
  personName?: string;
  personNik?: string;
  roleTitle?: string;
  roleBadge?: string;
  relationship?: string;
  withMaterai?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  savedSignature,
  applicantName,
  personName,
  personNik,
  roleTitle,
  roleBadge,
  relationship,
  withMaterai = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!savedSignature);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const nameToDisplay = personName || applicantName || 'Peminjam';
  const effectiveTitle = roleTitle || (withMaterai ? 'Tanda Tangan Digital Nasabah' : 'Tanda Tangan Digital Saksi');
  const effectiveBadge = roleBadge || (withMaterai ? 'Nasabah (Peminjam)' : 'Saksi Perjanjian');
  const effectiveRoleLabel = withMaterai ? 'Nasabah / Peminjam' : 'Saksi Sah';

  // Resize canvas according to device pixel ratio for super-crisp lines on high-DPI phone screens
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width, 280);
    const height = 185;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e3a8a'; // Deep blue signature ink
      ctx.lineWidth = 3.2;

      // If there's an existing saved signature, draw it
      if (savedSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          setIsEmpty(false);
        };
        img.src = savedSignature;
      }
    }
  }, [savedSignature]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasUnsavedChanges(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Export with transparent background or clean white
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    setHasUnsavedChanges(false);
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 shadow-xl border ${
        withMaterai
          ? 'bg-slate-900/90 border-slate-700/80'
          : 'bg-slate-900/90 border-teal-500/40 bg-gradient-to-b from-teal-950/20 to-slate-900/90'
      }`}
    >
      {/* Header Info & Role Badge */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              withMaterai
                ? 'bg-blue-600/20 text-blue-400'
                : 'bg-teal-500/20 text-teal-300'
            }`}
          >
            {withMaterai ? <PenTool className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
              {effectiveTitle}
            </h4>
            <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span>
                Nama Terang: <strong className="text-white font-bold">{nameToDisplay}</strong>
              </span>
              {personNik && (
                <span className="text-slate-400 font-mono text-[10px]">
                  (NIK: {personNik})
                </span>
              )}
              {relationship && (
                <span className="text-teal-400 text-[10px] font-semibold">
                  • {relationship}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              withMaterai
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}
          >
            {effectiveBadge}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            UU ITE Sah
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-2.5 flex items-center justify-between">
        <span>
          Bubuhkan tanda tangan <strong className="text-white">{nameToDisplay}</strong>{' '}
          {withMaterai ? 'di atas Meterai Rp 10.000:' : 'pada kolom verifikasi saksi:'}
        </span>
        {withMaterai ? (
          <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            e-Meterai 10.000
          </span>
        ) : (
          <span className="text-[10px] text-teal-300 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            Saksi Sah
          </span>
        )}
      </p>

      {/* Signature Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[185px] bg-white rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner select-none cursor-crosshair touch-none"
      >
        {withMaterai ? (
          /* Materai 10.000 Guide Badge on Canvas */
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-18 h-24 border border-dashed border-rose-400/80 rounded-lg bg-gradient-to-br from-rose-50 via-pink-50/80 to-rose-100/90 shadow-sm p-1.5 flex flex-col justify-between pointer-events-none select-none text-[7px] opacity-85 z-0">
            <div className="flex items-center justify-between border-b border-rose-200 pb-0.5">
              <span className="text-[6px] font-black text-rose-700 tracking-tight uppercase">
                METERAI ELEKTRONIK
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <div className="text-center py-0.5 my-auto">
              <div className="text-xs font-black text-rose-800 font-serif leading-none">
                10000
              </div>
              <div className="text-[5.5px] font-bold text-rose-600 uppercase tracking-tighter mt-0.5">
                SEPULUH RIBU RUPIAH
              </div>
            </div>
            <div className="border-t border-rose-300 pt-0.5 text-[5px] text-rose-700 font-mono text-center">
              DJP INDONESIA
            </div>
          </div>
        ) : (
          /* Witness Badge Guide on Canvas */
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-20 h-24 border border-dashed border-teal-500/80 rounded-lg bg-gradient-to-br from-teal-50 via-emerald-50/80 to-teal-100/90 shadow-sm p-1.5 flex flex-col justify-between pointer-events-none select-none text-[7px] opacity-85 z-0">
            <div className="flex items-center justify-between border-b border-teal-200 pb-0.5">
              <span className="text-[6px] font-black text-teal-800 tracking-tight uppercase">
                SAKSI PERJANJIAN
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            </div>
            <div className="text-center py-0.5 my-auto">
              <div className="text-[9px] font-black text-teal-900 font-sans leading-none uppercase">
                SAKSI SAH
              </div>
              <div className="text-[5px] font-bold text-teal-700 uppercase tracking-tighter mt-1">
                PM MITRA SEJAHTERA
              </div>
            </div>
            <div className="border-t border-teal-300 pt-0.5 text-[5px] text-teal-800 font-mono text-center">
              VERIFIED WITNESS
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block relative z-10"
        />

        {/* Guideline line on canvas with explicit name & role */}
        <div className="absolute bottom-4 left-6 right-6 pointer-events-none z-0">
          <div className="border-b border-slate-400/80 mb-1 flex justify-between">
            <span className="text-[9px] text-slate-400 font-mono">X</span>
            <span className="text-[9px] text-slate-400 font-mono">X</span>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-slate-800 font-sans leading-none">
              (&nbsp;{nameToDisplay}&nbsp;)
            </p>
            <p className="text-[8px] text-slate-500 font-medium tracking-wide mt-0.5">
              {effectiveRoleLabel} {personNik ? `• NIK: ${personNik}` : ''}
            </p>
          </div>
        </div>

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic pl-20 z-0">
            {withMaterai
              ? `Tanda tangan Nasabah (${nameToDisplay}) mengenai meterai`
              : `Tanda tangan Saksi (${nameToDisplay}) di sini`}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 mt-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={isEmpty}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Hapus
        </button>

        <div className="flex items-center gap-2">
          {savedSignature && !hasUnsavedChanges && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tanda Tangan {nameToDisplay} Tersimpan
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isEmpty}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md transition ${
              withMaterai
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Simpan Tanda Tangan
          </button>
        </div>
      </div>
    </div>
  );
};
