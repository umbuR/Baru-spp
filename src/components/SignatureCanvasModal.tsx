import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload, PenTool, Stamp, ShieldCheck } from 'lucide-react';
import { sampleSignatureSvg, generateEmeteraiSvg } from '../data/initialData';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  title: string;
  roleSubtitle: string;
  currentSignature?: string;
  withEmeterai?: boolean;
  emeteraiSerial?: string;
  onSave: (signatureDataUrl: string) => void;
  onClose: () => void;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  title,
  roleSubtitle,
  currentSignature,
  withEmeterai = false,
  emeteraiSerial = '2026-PMSB-EMET10K-9812401',
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor] = useState('#0f172a');
  const [penWidth] = useState(3);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle retina displays
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);

      // Fill background white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw faint baseline for signing
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, rect.height - 35);
      ctx.lineTo(rect.width - 30, rect.height - 35);
      ctx.stroke();

      // If existing signature exists, load it
      if (currentSignature) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 20, 20, rect.width - 40, rect.height - 40);
          setHasDrawn(true);
        };
        img.src = currentSignature;
      } else {
        setHasDrawn(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, currentSignature]);

  if (!isOpen) return null;

  // Pointer position helper
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);

    const coords = getCanvasCoords(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Redraw baseline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, rect.height - 35);
    ctx.lineTo(rect.width - 30, rect.height - 35);
    ctx.stroke();

    setHasDrawn(false);
  };

  const handleUseSample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 20, 20, rect.width - 40, rect.height - 40);
      setHasDrawn(true);
    };
    img.src = sampleSignatureSvg;
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        // Center draw
        const scale = Math.min((rect.width - 40) / img.width, (rect.height - 40) / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (rect.width - w) / 2;
        const y = (rect.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        setHasDrawn(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const emeteraiSvgUrl = generateEmeteraiSvg(emeteraiSerial);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${withEmeterai ? 'bg-rose-600/20 text-rose-400' : 'bg-blue-600/20 text-blue-400'}`}>
              {withEmeterai ? <Stamp className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight flex items-center gap-2">
                {title}
                {withEmeterai && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    e-Meterai Rp 10.000
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">{roleSubtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* E-Meterai 10000 Compliance Notice */}
          {withEmeterai && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-300">
                  Kewajiban Materai Elektronik Asli Rp 10.000 (UU Bea Meterai No. 10 Tahun 2020)
                </p>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  Tanda tangan Peminjam wajib dibubuhkan langsung mengenai/menimpa sebagian meterai elektronik Rp 10.000 dengan nomor seri tercatat: <strong className="font-mono text-rose-300">{emeteraiSerial}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Canvas Signature Area */}
          <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-white overflow-hidden shadow-inner touch-none">
            
            {/* Visual e-Meterai 10000 Stamp Placement in Canvas if withEmeterai */}
            {withEmeterai && (
              <div className="absolute left-3 top-2 bottom-2 w-28 sm:w-36 pointer-events-none opacity-90 flex flex-col items-center justify-center p-1 rounded-lg border border-rose-600/50 bg-rose-50/70 shadow-sm z-0">
                <img 
                  src={emeteraiSvgUrl} 
                  alt="e-Meterai 10000 Asli" 
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm" 
                />
                <span className="text-[7.5px] font-bold text-rose-800 uppercase tracking-tighter mt-0.5">
                  Meterai Elektronik 10000
                </span>
              </div>
            )}

            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-48 sm:h-56 cursor-crosshair relative z-10 block"
              style={{ touchAction: 'none' }}
            />

            {/* Placeholder guide text */}
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <p className="text-slate-400 text-xs sm:text-sm font-medium bg-white/80 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {withEmeterai 
                    ? 'Goreskan tanda tangan menimpa sebagian area e-Meterai di kiri' 
                    : 'Gunakan jari, stylus, atau kursor mouse untuk tanda tangan di sini'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                title="Hapus goresan tanda tangan"
              >
                <Eraser className="w-3.5 h-3.5 text-amber-400" />
                <span>Bersihkan</span>
              </button>

              <button
                type="button"
                onClick={handleUseSample}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                title="Gunakan contoh tanda tangan instan"
              >
                <PenTool className="w-3.5 h-3.5 text-blue-400" />
                <span>Contoh TTD</span>
              </button>

              {/* Upload image from gallery */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleUploadFile} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                title="Unggah file tanda tangan dari galeri atau penyimpanan perangkat"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Galeri</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Status: {hasDrawn ? <span className="text-emerald-400 font-bold">Siap Disimpan</span> : <span className="text-slate-500">Menunggu TTD</span>}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-800/80 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveSignature}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition ${
              withEmeterai 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Tanda Tangan {withEmeterai && '+ e-Meterai'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
