'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Receipt,
  RotateCcw,
  Filter,
  DollarSign
} from 'lucide-react';

export default function CashflowPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadCashflowData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await api.getCashflow(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat analisis arus kas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashflowData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadCashflowData();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      loadCashflowData();
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

  const summary = data?.summary || { totalInflow: 0, totalOutflow: 0, totalPlatformFee: 0, totalTaxDeductions: 0, netCashflow: 0 };
  const monthlyTrend = data?.monthlyTrend || [];
  const transactions = data?.transactions || [];

  // Monthly columns sizing math
  const maxMonthlyVal = Math.max(...monthlyTrend.map(m => Math.max(m.inflow, m.outflow))) || 1;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Analisis Cashflow</h1>
          <p className="text-gray-400 mt-1">Pemantauan arus kas masuk (penjualan) vs arus kas keluar (pembelian bahan baku supplier).</p>
        </div>

        {/* Date Filter */}
        <form onSubmit={handleApplyFilters} className="glass-card p-5 flex flex-col sm:flex-row gap-4 items-end max-w-3xl">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mulai Dari</label>
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
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sampai Dengan</label>
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-btn flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5" /> Terapkan
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
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Cash flow Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="glass-card p-5">
                <div className="flex justify-between items-center text-emerald-400 text-xs font-bold uppercase">
                  <span>Kas Masuk</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <p className="text-xl font-black mt-3 text-white">{formatCurrency(summary.totalInflow)}</p>
                <p className="text-[10px] text-gray-500 mt-1">POS & Marketplace</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex justify-between items-center text-red-400 text-xs font-bold uppercase">
                  <span>Kas Keluar</span>
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <p className="text-xl font-black mt-3 text-white">{formatCurrency(summary.totalOutflow)}</p>
                <p className="text-[10px] text-gray-500 mt-1">Pembelian bahan baku</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex justify-between items-center text-purple-400 text-xs font-bold uppercase">
                  <span>Potongan Layanan</span>
                  <Receipt className="h-4 w-4" />
                </div>
                <p className="text-xl font-black mt-3 text-white">{formatCurrency(summary.totalPlatformFee)}</p>
                <p className="text-[10px] text-gray-500 mt-1">Platform commissions</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex justify-between items-center text-sky-400 text-xs font-bold uppercase">
                  <span>Pajak (10%)</span>
                  <Percent className="h-4 w-4" />
                </div>
                <p className="text-xl font-black mt-3 text-white">{formatCurrency(summary.totalTaxDeductions)}</p>
                <p className="text-[10px] text-gray-500 mt-1">Dipotong otomatis</p>
              </div>

              <div className="glass-card p-5 border-emerald-500/20 bg-emerald-950/10">
                <div className="flex justify-between items-center text-emerald-400 text-xs font-bold uppercase">
                  <span>Aliran Bersih</span>
                  <DollarSign className="h-4 w-4" />
                </div>
                <p className="text-xl font-black mt-3 text-white">{formatCurrency(summary.netCashflow)}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Net profit bersih</p>
              </div>
            </div>

            {/* Monthly Inflow/Outflow Comparison (Bar Chart) */}
            <div className="glass-card p-6">
              <div>
                <h3 className="font-bold text-white text-lg">Perbandingan Kas Bulanan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Analisis arus masuk vs arus keluar per periode bulanan</p>
              </div>

              {monthlyTrend.length === 0 ? (
                <p className="text-sm text-gray-500 py-12 text-center">Belum ada agregasi bulanan untuk data ini.</p>
              ) : (
                <div className="mt-8 flex gap-8 items-end justify-center min-h-[160px] pb-4">
                  {monthlyTrend.map((m, index) => {
                    const inflowHeight = Math.round((m.inflow / maxMonthlyVal) * 140) || 5;
                    const outflowHeight = Math.round((m.outflow / maxMonthlyVal) * 140) || 5;
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-3">
                        <div className="flex gap-2.5 items-end">
                          {/* Inflow Bar */}
                          <div className="group relative">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 border border-zinc-700 text-white text-[9px] font-semibold py-1 px-1.5 rounded whitespace-nowrap shadow-xl">
                              Masuk: {formatCurrency(m.inflow)}
                            </div>
                            <div 
                              className="w-5 bg-emerald-500 rounded-t transition-all duration-1000" 
                              style={{ height: `${inflowHeight}px` }}
                            ></div>
                          </div>

                          {/* Outflow Bar */}
                          <div className="group relative">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 border border-zinc-700 text-white text-[9px] font-semibold py-1 px-1.5 rounded whitespace-nowrap shadow-xl">
                              Keluar: {formatCurrency(m.outflow)}
                            </div>
                            <div 
                              className="w-5 bg-red-500 rounded-t transition-all duration-1000" 
                              style={{ height: `${outflowHeight}px` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inflow Outflow Cashbook Table */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-white text-lg">Buku Kas (Arus Masuk & Keluar)</h3>
                <p className="text-xs text-gray-400 mt-0.5">Daftar mutasi rekening ledger lengkap beserta status potong</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0f1c]/40">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-gray-300">
                  <thead className="bg-[#0d1527] text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">ID Transaksi</th>
                      <th className="px-5 py-4">Waktu</th>
                      <th className="px-5 py-4">Pengirim</th>
                      <th className="px-5 py-4">Penerima</th>
                      <th className="px-5 py-4">Tipe Aliran</th>
                      <th className="px-5 py-4 text-right">Potongan & Pajak</th>
                      <th className="px-5 py-4 text-right">Nominal Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-8 text-center text-gray-500">Belum ada catatan mutasi kas.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const isOutflow = tx.from_app === 'SupplierHub';
                        const totalCut = (Number(tx.fee) || 0) + (Number(tx.tax) || 0);

                        return (
                          <tr key={tx.tx_id} className="hover:bg-[#131b2e]/30 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-indigo-400 font-semibold">{tx.tx_id}</td>
                            <td className="px-5 py-3.5 text-gray-400">{tx.timestamp}</td>
                            <td className="px-5 py-3.5 font-medium">{tx.from_user}</td>
                            <td className="px-5 py-3.5 font-medium">{tx.to_user}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isOutflow 
                                  ? 'bg-red-950/55 text-red-400 border border-red-900/40' 
                                  : 'bg-emerald-950/55 text-emerald-400 border border-emerald-900/40'
                              }`}>
                                {isOutflow ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                {isOutflow ? 'Kas Keluar (Supplies)' : 'Kas Masuk (Sales)'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-gray-400">
                              {totalCut > 0 ? `-${formatCurrency(totalCut)}` : 'Rp 0'}
                            </td>
                            <td className={`px-5 py-3.5 text-right font-black text-sm ${isOutflow ? 'text-red-400' : 'text-emerald-400'}`}>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
