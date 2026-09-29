import React from 'react';
import { ShieldCheck, QrCode } from 'lucide-react';
import { generateEmeteraiSvg } from '../data/initialData';

interface EmeteraiBadgeProps {
  serialNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const EmeteraiBadge: React.FC<EmeteraiBadgeProps> = ({
  serialNumber = '2026-PMSB-EMET10K-9812401',
  size = 'md',
  showDetails = true
}) => {
  const svgUrl = generateEmeteraiSvg(serialNumber);

  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="font-bold">e-Meterai 10.000</span>
        <span className="font-mono text-[9px] text-rose-300/80">({serialNumber.slice(-6)})</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-rose-950/50 via-rose-900/30 to-slate-900/60 border border-rose-500/30 shadow-sm">
      {/* Official Stamp Graphic */}
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 bg-white rounded-lg p-1 border border-rose-300/80 shadow-md flex items-center justify-center overflow-hidden">
        <img 
          src={svgUrl} 
          alt="e-Meterai Asli 10000" 
          className="w-full h-full object-contain filter drop-shadow"
        />
      </div>

      {/* Verification Data */}
      {showDetails && (
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              Meterai Elektronik Asli Rp 10.000
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TERVERIFIKASI SAH
            </span>
          </div>

          <p className="text-[10px] text-slate-300 font-mono flex items-center gap-1 truncate">
            <span>No. Seri:</span>
            <strong className="text-rose-300 font-bold">{serialNumber}</strong>
          </p>

          <p className="text-[10px] text-slate-400 leading-tight">
            Standar DJP & Peruri RI berdasarkan UU No. 10 Tahun 2020 tentang Bea Meterai.
          </p>

          <div className="flex items-center gap-2 pt-0.5 text-[9px] text-slate-400">
            <span className="flex items-center gap-0.5 text-rose-300">
              <QrCode className="w-3 h-3" /> QR Valid
            </span>
            <span>•</span>
            <span className="text-slate-400">Tanda tangan menimpa meterai</span>
          </div>
        </div>
      )}
    </div>
  );
};
