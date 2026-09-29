import React, { useRef } from 'react';
import { Upload, Camera, Trash2, Eye, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadCardProps {
  label: string;
  sublabel: string;
  imageUrl?: string;
  badge?: string;
  badgeColor?: 'blue' | 'rose' | 'amber' | 'emerald' | 'indigo';
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
  onUseSample?: () => void;
  onZoom?: (url: string) => void;
}

export const PhotoUploadCard: React.FC<PhotoUploadCardProps> = ({
  label,
  sublabel,
  imageUrl,
  badge = 'Wajib',
  badgeColor = 'blue',
  onUpload,
  onRemove,
  onUseSample,
  onZoom
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpload(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const badgeColorClass = 
    badgeColor === 'rose' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
    badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
    badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
    badgeColor === 'indigo' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
    'bg-blue-500/20 text-blue-300 border-blue-500/30';

  return (
    <div className="flex flex-col bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 space-y-2 hover:border-slate-600 transition shadow-sm">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-xs truncate">{label}</span>
            {badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeColorClass}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{sublabel}</p>
        </div>
      </div>

      {/* Image Preview or Empty State Box */}
      <div className="relative w-full h-32 rounded-lg bg-slate-900/90 border border-slate-700/60 overflow-hidden flex items-center justify-center group">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={label} 
              className="w-full h-full object-contain p-1"
            />
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200">
              {onZoom && (
                <button
                  type="button"
                  onClick={() => onZoom(imageUrl)}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow"
                  title="Lihat ukuran penuh"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow"
                title="Hapus foto ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center space-y-1">
            <ImageIcon className="w-7 h-7 text-slate-600" />
            <span className="text-[10px] font-medium">Belum ada foto</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-1">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-sm transition"
          title="Buka galeri file perangkat untuk upload foto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Galeri / File</span>
        </button>

        {onUseSample && (
          <button
            type="button"
            onClick={onUseSample}
            className="py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1 transition"
            title="Gunakan contoh foto terverifikasi"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample</span>
          </button>
        )}

        {imageUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition"
            title="Hapus foto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
