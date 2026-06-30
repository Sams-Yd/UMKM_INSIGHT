'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  DollarSign,
  Receipt,
  Percent,
  Sparkles,
  Info
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 text-red-400 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error Memuat Dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, charts } = data;
  const isPremium = summary.isPremium;

  // Simple custom SVG Line Chart math
  const maxSales = Math.max(...charts.salesTrend.map(d => Math.max(d.sales, d.expense))) || 1000000;
  
  // Calculate coordinates for SVG Path (width=500, height=200)
  const linePoints = charts.salesTrend.map((d, index) => {
    const x = (index / (charts.salesTrend.length - 1)) * 500;
    const y = 200 - (d.sales / maxSales) * 160 - 20; // 20px padding bottom/top
    return `${x},${y}`;
  }).join(' ');

  const expensePoints = charts.salesTrend.map((d, index) => {
    const x = (index / (charts.salesTrend.length - 1)) * 500;
    const y = 200 - (d.expense / maxSales) * 160 - 20;
    return `${x},${y}`;
  }).join(' ');

  // Calculate coordinates for Category Split Bar Charts
  const totalCategoryVal = charts.categorySplit.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Visual Analytics</h1>
            <p className="text-gray-400 mt-1">Halo, {user?.username}. Berikut ikhtisar kondisi keuangan UMKM Anda.</p>
          </div>
          {!isPremium && (
            <Link 
              href="/subscription" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 transition-all shadow-md"
            >
              <Sparkles className="h-4 w-4" /> Upgrade Premium
            </Link>
          )}
        </div>

        {/* Premium Upgrade Promotion Callout */}
        {!isPremium && (
          <div className="glass-card p-6 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-purple-600/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex gap-4">
              <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Buka Analisis Keuangan Lanjutan & Laporan Lengkap</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Dapatkan akses ekspor data, filter laporan visual, pengelompokan UMKM, dan grafik performa cashflow yang mendalam hanya dengan <strong>Rp 10.000 / minggu</strong> melalui Midtrans.
                </p>
              </div>
            </div>
            <Link 
              href="/subscription"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Berlangganan Sekarang
            </Link>
          </div>
        )}

        {/* Financial Aggregation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Inflow Card */}
          <div className="glass-card p-5 relative overflow-visible">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Inflow (Omzet)</span>
                <div className="group relative z-20">
                  <Info className="h-3.5 w-3.5 text-gray-500 cursor-help hover:text-white transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1e293b] text-gray-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 text-center">
                    Total seluruh pendapatan kotor dari transaksi penjualan yang berhasil melalui sistem kasir dan marketplace.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                  </div>
                </div>
              </div>
              <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
            <p className="text-xl font-bold mt-4 text-white">{formatCurrency(summary.totalInflow)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Total arus kas masuk dari POS & PasarK</p>
          </div>

          {/* Outflow Card */}
          <div className="glass-card p-5 relative overflow-visible">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Outflow (Belanja)</span>
                <div className="group relative z-20">
                  <Info className="h-3.5 w-3.5 text-gray-500 cursor-help hover:text-white transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1e293b] text-gray-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 text-center">
                    Total biaya yang dikeluarkan UMKM untuk pembayaran ke supplier bahan baku atau inventaris.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                  </div>
                </div>
              </div>
              <span className="p-1.5 bg-red-500/10 rounded-lg text-red-400"><ArrowDownRight className="h-4 w-4" /></span>
            </div>
            <p className="text-xl font-bold mt-4 text-white">{formatCurrency(summary.totalOutflow)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Total pengeluaran ke SupplierHub</p>
          </div>

          {/* Platform Fees */}
          <div className="glass-card p-5 relative overflow-visible">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Biaya Layanan</span>
                <div className="group relative z-20">
                  <Info className="h-3.5 w-3.5 text-gray-500 cursor-help hover:text-white transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1e293b] text-gray-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 text-center">
                    Total potongan biaya (fee) dari platform Marketplace maupun POS untuk setiap transaksi sukses.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                  </div>
                </div>
              </div>
              <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400"><Receipt className="h-4 w-4" /></span>
            </div>
            <p className="text-xl font-bold mt-4 text-white">{formatCurrency(summary.totalFees)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Potongan fee transaksi Marketplace & POS</p>
          </div>

          {/* Taxes Card */}
          <div className="glass-card p-5 relative overflow-visible">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Estimasi Pajak</span>
                <div className="group relative z-20">
                  <Info className="h-3.5 w-3.5 text-gray-500 cursor-help hover:text-white transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1e293b] text-gray-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 text-center">
                    Total perkiraan pajak yang harus dibayarkan, dihitung secara otomatis (10%) dari setiap transaksi.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                  </div>
                </div>
              </div>
              <span className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400"><Percent className="h-4 w-4" /></span>
            </div>
            <p className="text-xl font-bold mt-4 text-white">{formatCurrency(summary.totalTaxes)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Dipotong 10% per transaksi sukses</p>
          </div>

          {/* Net Profit Card */}
          <div className="glass-card p-5 relative overflow-visible border-indigo-500/30 bg-indigo-950/10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-300 uppercase">Net Profit</span>
                <div className="group relative z-20">
                  <Info className="h-3.5 w-3.5 text-indigo-400 cursor-help hover:text-white transition-colors" />
                  <div className="absolute right-0 md:left-1/2 md:-translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1e293b] text-gray-200 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 text-center">
                    Keuntungan bersih (Net Profit) = Omzet - Belanja - Biaya Layanan - Estimasi Pajak.
                    <div className="absolute top-full right-4 md:left-1/2 md:-translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                  </div>
                </div>
              </div>
              <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400"><DollarSign className="h-4 w-4" /></span>
            </div>
            <p className="text-xl font-black mt-4 text-white">{formatCurrency(summary.netProfit)}</p>
            <p className="text-[10px] text-gray-300 mt-1 font-medium">Laba bersih UMKM dikurangi pajak & fee</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart (Line Chart via Custom SVG) */}
          <div className="glass-card p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Tren Keuangan Keuangan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Perkembangan omzet vs pengeluaran 7 hari terakhir</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-400"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Omzet</span>
                <span className="flex items-center gap-1.5 text-fuchsia-400"><span className="h-2 w-2 rounded-full bg-fuchsia-500"></span> Pengeluaran</span>
              </div>
            </div>

            <div className="relative h-64 w-full bg-[#0d1527]/30 rounded-xl border border-slate-800/40 p-4">
              {/* Responsive Custom SVG line chart */}
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Line Path for Sales */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={linePoints}
                  className="transition-all duration-500"
                />

                {/* Line Path for Expense */}
                <polyline
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={expensePoints}
                  className="transition-all duration-500"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] text-gray-500 font-semibold mt-2 px-1">
                {charts.salesTrend.map((d, index) => {
                  // Format Date to short string e.g. "04 Jun"
                  const dateParts = d.date.split('-');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  return (
                    <span key={index}>{`${dateParts[2]} ${monthNames[parseInt(dateParts[1]) - 1]}`}</span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Distribution (Horizontal Bar Chart via React) */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-lg">Distribusi Produk</h3>
              <p className="text-xs text-gray-400 mt-0.5">Analisis kontribusi penjualan per kategori bisnis</p>
            </div>

            <div className="space-y-4.5 pt-2">
              {charts.categorySplit.map((cat, index) => {
                const percentage = Math.round((cat.value / totalCategoryVal) * 100);
                const barColors = [
                  'bg-gradient-to-r from-indigo-500 to-indigo-400',
                  'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
                  'bg-gradient-to-r from-cyan-500 to-cyan-400',
                  'bg-gradient-to-r from-emerald-500 to-emerald-400'
                ];
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{cat.name}</span>
                      <span className="text-indigo-400 font-bold">{formatCurrency(cat.value)} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${barColors[index % barColors.length]}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
