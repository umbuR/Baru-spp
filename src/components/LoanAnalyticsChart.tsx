import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { CheckCircle, XCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { LoanApplication } from '../types';
import { formatRupiah } from '../utils/pdfGenerator';

interface LoanAnalyticsChartProps {
  applications: LoanApplication[];
}

export const LoanAnalyticsChart: React.FC<LoanAnalyticsChartProps> = ({ applications }) => {
  const approvedApps = applications.filter((app) => app.status === 'APPROVED');
  const rejectedApps = applications.filter((app) => app.status === 'REJECTED');
  const pendingApps = applications.filter((app) => app.status === 'PENDING');

  const approvedCount = approvedApps.length;
  const rejectedCount = rejectedApps.length;
  const pendingCount = pendingApps.length;
  const evaluatedCount = approvedCount + rejectedCount;

  const approvedAmount = approvedApps.reduce((acc, app) => acc + (app.loan?.loanAmount || 0), 0);
  const rejectedAmount = rejectedApps.reduce((acc, app) => acc + (app.loan?.loanAmount || 0), 0);
  const pendingAmount = pendingApps.reduce((acc, app) => acc + (app.loan?.loanAmount || 0), 0);

  const approvalRate = evaluatedCount > 0 ? Math.round((approvedCount / evaluatedCount) * 100) : 0;
  const rejectionRate = evaluatedCount > 0 ? Math.round((rejectedCount / evaluatedCount) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: 'Disetujui', value: approvedCount, amount: approvedAmount, color: '#10B981' },
    { name: 'Ditolak', value: rejectedCount, amount: rejectedAmount, color: '#F43F5E' },
    ...(pendingCount > 0 ? [{ name: 'Pending', value: pendingCount, amount: pendingAmount, color: '#F59E0B' }] : [])
  ];

  // Bar chart comparison data (Disetujui vs Ditolak)
  const barData = [
    {
      kategori: 'Disetujui',
      jumlah: approvedCount,
      nominalJuta: Number((approvedAmount / 1000000).toFixed(2)),
      nominalLabel: formatRupiah(approvedAmount),
      fill: '#10B981'
    },
    {
      kategori: 'Ditolak',
      jumlah: rejectedCount,
      nominalJuta: Number((rejectedAmount / 1000000).toFixed(2)),
      nominalLabel: formatRupiah(rejectedAmount),
      fill: '#F43F5E'
    }
  ];

  // Custom tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            Status: {data.name}
          </div>
          <div className="text-slate-300">
            Total Berkas: <span className="font-bold text-white">{data.value} Berkas</span>
          </div>
          <div className="text-slate-300">
            Total Nominal: <span className="font-bold text-emerald-400">{formatRupiah(data.amount)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            {data.kategori}
          </div>
          <div className="text-slate-300">
            Jumlah Berkas: <span className="font-bold text-white">{data.jumlah} Berkas</span>
          </div>
          <div className="text-slate-300">
            Nominal Total: <span className="font-bold text-emerald-400">{data.nominalLabel}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Visualisasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Visualisasi Analitik Pinjaman: Disetujui vs Ditolak
            </h2>
            <p className="text-[11px] text-slate-400">
              Monitoring rasio persetujuan kredit dan perbandingan nominal dana pengajuan
            </p>
          </div>
        </div>

        {/* Quick Rate Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Approval: {approvalRate}%
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Rejection: {rejectionRate}%
          </span>
        </div>
      </div>

      {/* Grid Charts: Donut Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Kolom 1: Donut Chart Distribusi Status (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-200">
              Proporsi Status Pengajuan
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total {applications.length} Berkas
            </span>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-[11px] text-slate-300 font-medium px-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
              <span className="text-xs text-slate-400 font-medium">Evaluasi</span>
              <span className="text-xl font-bold text-white font-mono">{evaluatedCount}</span>
            </div>
          </div>

          {/* Mini Legend Summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-emerald-400 font-semibold block">Disetujui</span>
              <span className="text-xs font-bold text-white font-mono">{approvedCount}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-[9px] text-rose-400 font-semibold block">Ditolak</span>
              <span className="text-xs font-bold text-white font-mono">{rejectedCount}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-[9px] text-amber-400 font-semibold block">Pending</span>
              <span className="text-xs font-bold text-white font-mono">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Kolom 2: Bar Chart Perbandingan Nominal & Berkas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <div>
              <span className="text-xs font-bold text-slate-200">
                Komparasi Total Disetujui vs Ditolak
              </span>
              <p className="text-[10px] text-slate-400">
                Nilai nominal dana (Juta Rupiah) dan kuantitas berkas
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500" /> Disetujui: {formatRupiah(approvedAmount)}
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded bg-rose-500" /> Ditolak: {formatRupiah(rejectedAmount)}
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="kategori"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${val}Jt`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="nominalJuta"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar Footer */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs">
              <span className="text-slate-300 text-[11px] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Rasio Disetujui:
              </span>
              <span className="font-bold text-emerald-300 font-mono">{approvalRate}% ({approvedCount} Berkas)</span>
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs">
              <span className="text-slate-300 text-[11px] flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-400" /> Rasio Ditolak:
              </span>
              <span className="font-bold text-rose-300 font-mono">{rejectionRate}% ({rejectedCount} Berkas)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
