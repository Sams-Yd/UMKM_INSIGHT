'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { 
  Search, 
  Filter, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Building,
  ArrowUpRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function SalesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [category, setCategory] = useState('');
  const [umkmId, setUmkmId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (category) filters.category = category;
      if (umkmId) filters.umkmId = umkmId;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await api.getSales(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat analisis penjualan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadSalesData();
  };

  const handleResetFilters = () => {
    setCategory('');
    setUmkmId('');
    setStartDate('');
    setEndDate('');
    // Trigger reloading with empty filters
    setTimeout(() => {
      loadSalesData();
    }, 0);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const summary = data?.summary || { totalSales: 0, salesCount: 0, averageBasket: 0 };
  const byUmkm = data?.byUmkm || [];
  const byCategory = data?.byCategory || [];
  const transactions = data?.transactions || [];

  const maxUmkmSales = Math.max(...byUmkm.map(u => u.total)) || 1;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Analisis Penjualan</h1>
          <p className="text-gray-400 mt-1">Aggregasi data omzet penjualan UMKM terdaftar berdasarkan ledger SmartBank.</p>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleApplyFilters} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Bisnis</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Search className="h-4 w-4" /></span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Semua Kategori</option>
                <option value="Makanan & Minuman">Makanan & Minuman</option>
                <option value="Pakaian">Pakaian</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kecantikan">Kecantikan</option>
              </select>
            </div>
          </div>

          {/* UMKM Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">UMKM</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Building className="h-4 w-4" /></span>
              <select
                value={umkmId}
                onChange={(e) => setUmkmId(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Semua UMKM</option>
                <option value="umkm_01">Warung Berkah F&B</option>
                <option value="umkm_02">Zahra Boutique</option>
                <option value="umkm_03">Sentosa Rattan</option>
                <option value="umkm_04">Glow Up Cosmetics</option>
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tanggal Mulai</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Calendar className="h-4 w-4" /></span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tanggal Akhir</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Calendar className="h-4 w-4" /></span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-[#0d1527] py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white gradient-btn flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2.5 rounded-xl border border-slate-800 bg-[#131b2e] hover:bg-[#1b253d] text-gray-300 hover:text-white transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Sales Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="glass-card p-5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Omzet Terfilter</span>
                <p className="text-2xl font-black mt-3 text-white">{formatCurrency(summary.totalSales)}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <TrendingUp className="h-3.5 w-3.5" /> <span>Total penjualan sukses</span>
                </div>
              </div>

              <div className="glass-card p-5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Volume Penjualan</span>
                <p className="text-2xl font-black mt-3 text-white">{summary.salesCount} Transaksi</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" /> <span>Jumlah struk belanja</span>
                </div>
              </div>

              <div className="glass-card p-5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Rata-rata Keranjang (Basket Size)</span>
                <p className="text-2xl font-black mt-3 text-white">{formatCurrency(summary.averageBasket)}</p>
                <div className="flex items-center gap-1 text-[10px] text-indigo-300 mt-1">
                  <DollarSign className="h-3.5 w-3.5 text-indigo-400" /> <span>Rerata nominal per belanja</span>
                </div>
              </div>
            </div>

            {/* Visual Breakdown & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* UMKM Comparison Charts */}
              <div className="glass-card p-6 lg:col-span-2 space-y-5">
                <div>
                  <h3 className="font-bold text-white text-lg">Peringkat Kinerja UMKM</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Pendapatan kotor relatif tiap merchant UMKM</p>
                </div>

                {byUmkm.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">Tidak ada data untuk filter ini.</p>
                ) : (
                  <div className="space-y-4">
                    {byUmkm.map((umkm, index) => {
                      const widthPercentage = Math.round((umkm.total / maxUmkmSales) * 100) || 1;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-gray-300 flex items-center gap-2">
                              <span className="h-5 w-5 bg-indigo-500/10 text-indigo-400 text-[10px] flex items-center justify-center font-bold rounded">
                                {index + 1}
                              </span>
                              {umkm.name}
                            </span>
                            <span className="text-white font-bold">{formatCurrency(umkm.total)} <span className="text-[10px] text-gray-400">({umkm.count} tx)</span></span>
                          </div>
                          <div className="h-3.5 w-full bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700/20">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 rounded-lg transition-all duration-1000" 
                              style={{ width: `${widthPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Share List */}
              <div className="glass-card p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Pembagian Kategori</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Penjualan per kelompok komoditas</p>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {byCategory.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">Tidak ada data.</p>
                  ) : (
                    byCategory.map((cat, index) => (
                      <div key={index} className="py-3.5 flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-semibold">{cat.name}</span>
                        <div className="text-right">
                          <span className="text-white font-bold block">{formatCurrency(cat.total)}</span>
                          <span className="text-[10px] text-indigo-400 font-medium">{cat.count} Transaksi</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Transaction List */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-white text-lg">Rincian Transaksi Penjualan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Daftar struk ledger penjualan UMKM yang terfilter (Maksimal 100 baris)</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0f1c]/40">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-gray-300">
                  <thead className="bg-[#0d1527] text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">ID Transaksi</th>
                      <th className="px-5 py-4">Waktu</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">UMKM</th>
                      <th className="px-5 py-4">Aplikasi Sumber</th>
                      <th className="px-5 py-4 text-right">Potongan Layanan</th>
                      <th className="px-5 py-4 text-right">Nominal Kotor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-8 text-center text-gray-500">Tidak ada data transaksi yang ditemukan.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.tx_id} className="hover:bg-[#131b2e]/30 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold">{tx.tx_id}</td>
                          <td className="px-5 py-3.5 text-gray-400">{tx.timestamp}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/40">
                              {tx.metadata?.category || 'Lainnya'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-white">{tx.metadata?.umkm_name || tx.to_user}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              tx.from_app === 'Marketplace' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' 
                                : 'bg-sky-950/40 text-sky-400 border-sky-900/40'
                            }`}>
                              {tx.from_app}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-purple-400">-{formatCurrency(tx.fee)}</td>
                          <td className="px-5 py-3.5 text-right font-black text-white">{formatCurrency(tx.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
