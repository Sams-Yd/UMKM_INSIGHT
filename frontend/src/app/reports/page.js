'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Lock, 
  Sparkles, 
  Info,
  Calendar,
  Building,
  RotateCcw,
  CheckCircle,
  Filter
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [category, setCategory] = useState('');
  const [sourceApp, setSourceApp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isPremiumUser = user?.is_premium || user?.role === 'lecturer' || user?.role === 'admin';

  const loadReportData = async () => {
    if (!isPremiumUser) return;

    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (category) filters.category = category;
      if (sourceApp) filters.sourceApp = sourceApp;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await api.getReports(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal menyusun laporan keuangan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadReportData();
  };

  const handleResetFilters = () => {
    setCategory('');
    setSourceApp('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      loadReportData();
    }, 0);
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (!data?.data || data.data.length === 0) return;

    const headers = ['ID Transaksi', 'Waktu', 'Pengirim', 'Penerima', 'Aplikasi', 'Jumlah (IDR)', 'Biaya Platform (IDR)', 'Pajak (IDR)', 'Kategori', 'Status'];
    const rows = data.data.map(tx => [
      tx.tx_id,
      tx.timestamp,
      tx.from_user,
      tx.to_user,
      tx.from_app,
      tx.amount,
      tx.fee || 0,
      tx.tax || 0,
      tx.metadata?.category || 'Lainnya',
      tx.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_umkm_insight_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Laporan Keuangan Lanjutan</h1>
            <p className="text-gray-400 mt-1">Halaman audit ledger terintegrasi untuk dosen penilai dan pembaca laporan.</p>
          </div>
          {isPremiumUser && data?.data && (
            <button
              onClick={exportToCSV}
              id="btn-export-csv"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-btn cursor-pointer shadow-lg"
            >
              <Download className="h-4 w-4" /> Ekspor ke CSV
            </button>
          )}
        </div>

        {/* If standard (Not Premium) -> Render Locked Screen */}
        {!isPremiumUser ? (
          <div className="relative">
            {/* Blurrable Mock Background Form & Table */}
            <div className="filter blur-md opacity-25 space-y-6 pointer-events-none select-none">
              <div className="glass-card p-5 grid grid-cols-4 gap-4">
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
              </div>
              <div className="glass-card p-6 h-64 bg-slate-800/10"></div>
            </div>

            {/* Lock Overlay Card */}
            <div className="absolute inset-0 flex items-center justify-center py-12 px-4">
              <div className="glass-card p-8 max-w-lg w-full text-center border-amber-500/20 bg-[#0d1527]/90 shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <div className="mx-auto h-12 w-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Fitur Laporan Keuangan Dikunci</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  Akses laporan terperinci, penyaringan visual per aplikasi, ekspor CSV, dan audit ledger terintegrasi dikunci untuk akun dasar.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/subscription"
                    className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 shadow-md transition-all uppercase tracking-wider"
                  >
                    Aktifkan Premium (Rp 10.000 / minggu)
                  </Link>
                  <p className="text-[10px] text-gray-400">
                    Sistem pembayaran aman Sandbox menggunakan simulasi Midtrans.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800 text-left">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Tips Untuk Dosen/Penilai:</span>
                  <div className="flex gap-2 text-[11px] text-gray-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Daftarkan akun baru dengan memilih peran <strong>"Dosen Penilai"</strong> di formulir pendaftaran untuk secara otomatis membuka halaman laporan tanpa bayar.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Subscribed view */
          <>
            {/* Success notification for lecturers */}
            {(user?.role === 'lecturer' || user?.role === 'admin') && (
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4.5 text-xs text-indigo-300 flex items-start gap-2.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-bold">Akses Evaluasi Dosen Aktif!</span> Akun Anda ({user?.username}) memiliki lisensi {user?.role} khusus yang secara otomatis membuka akses penuh ke seluruh analisis ledger.
                </div>
              </div>
            )}

            {/* Filter controls */}
            <form onSubmit={handleApplyFilters} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Makanan & Minuman">Makanan & Minuman</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Kerajinan">Kerajinan</option>
                  <option value="Kecantikan">Kecantikan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sumber Aplikasi</label>
                <select
                  value={sourceApp}
                  onChange={(e) => setSourceApp(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Semua Aplikasi</option>
                  <option value="Marketplace">Marketplace (PasarK)</option>
                  <option value="POS">POS (WarungPOS)</option>
                  <option value="SupplierHub">SupplierHub</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sejak Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white gradient-btn flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5" /> Saring
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl border border-slate-800 bg-[#131b2e] hover:bg-[#1b253d] text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </form>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 text-red-400 flex items-start gap-2">
                <Info className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              /* Report Table Grid */
              <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">Buku Audit Terkonsolidasi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Ditemukan {data?.totalRecordCount || 0} entri ledger yang cocok dengan penyaringan</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0f1c]/40">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-gray-300">
                    <thead className="bg-[#0d1527] text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="px-5 py-4">ID Transaksi</th>
                        <th className="px-5 py-4">Waktu Ledger</th>
                        <th className="px-5 py-4">Aplikasi Asal</th>
                        <th className="px-5 py-4">Pengirim</th>
                        <th className="px-5 py-4">Penerima</th>
                        <th className="px-5 py-4">Kategori</th>
                        <th className="px-5 py-4 text-right">Potongan Fee</th>
                        <th className="px-5 py-4 text-right">Potongan Pajak</th>
                        <th className="px-5 py-4 text-right">Nominal Kotor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {!data?.data || data.data.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-5 py-8 text-center text-gray-500">Tidak ada entri data transaksi.</td>
                        </tr>
                      ) : (
                        data.data.map((tx) => {
                          const isOutflow = tx.from_app === 'SupplierHub';
                          return (
                            <tr key={tx.tx_id} className="hover:bg-[#131b2e]/30 transition-colors">
                              <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold">{tx.tx_id}</td>
                              <td className="px-5 py-3.5 text-gray-400">{tx.timestamp}</td>
                              <td className="px-5 py-3.5 font-semibold text-white">{tx.from_app}</td>
                              <td className="px-5 py-3.5 text-gray-400">{tx.from_user}</td>
                              <td className="px-5 py-3.5 text-gray-400">{tx.to_user}</td>
                              <td className="px-5 py-3.5">
                                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                                  {tx.metadata?.category || 'Lainnya'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right text-purple-400 font-medium">
                                {tx.fee > 0 ? `-${formatCurrency(tx.fee)}` : 'Rp 0'}
                              </td>
                              <td className="px-5 py-3.5 text-right text-sky-400 font-medium">
                                {tx.tax > 0 ? `-${formatCurrency(tx.tax)}` : 'Rp 0'}
                              </td>
                              <td className={`px-5 py-3.5 text-right font-black ${isOutflow ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isOutflow ? '-' : '+'}{formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
