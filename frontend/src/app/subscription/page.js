'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, 
  CheckCircle, 
  CreditCard, 
  Info,
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function SubscriptionPage() {
  const { user, refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Checkout tracking states for simulation
  const [currentOrder, setCurrentOrder] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Contact backend to create payment session
      const res = await api.createSubscription();
      setCurrentOrder(res);

      // 2. Check if this is a real Midtrans payment or a mock payment
      if (res.isMockPayment) {
        setSuccess('Pembayaran MOCK diaktifkan. Gunakan widget simulator di bawah untuk menyetujui transaksi.');
        setLoading(false);
      } else {
        // Render official Midtrans Snap popup
        if (window.snap) {
          window.snap.pay(res.snapToken, {
            onSuccess: async (result) => {
              console.log('Midtrans payment success:', result);
              setSuccess('Pembayaran berhasil diproses! Mengaktifkan premium...');
              await refreshPremiumStatus();
              setCurrentOrder(null);
              setLoading(false);
            },
            onPending: (result) => {
              console.log('Midtrans payment pending:', result);
              setSuccess('Pembayaran Anda tertunda. Silakan selesaikan pembayaran.');
              setLoading(false);
            },
            onError: (result) => {
              console.error('Midtrans payment error:', result);
              setError('Terjadi kesalahan selama pembayaran. Silakan coba lagi.');
              setLoading(false);
            },
            onClose: () => {
              console.log('Customer closed the snap popup without finishing the payment');
              setError('Pembayaran dibatalkan oleh pengguna.');
              setLoading(false);
            }
          });
        } else {
          setError('Gagal memuat pustaka pembayaran Midtrans Snap. Mengaktifkan simulator...');
          // Auto-fallback to simulator panel
          setCurrentOrder({
            ...res,
            isMockPayment: true
          });
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal melakukan checkout.');
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (approve) => {
    if (!currentOrder) return;
    setSimulating(true);
    setError('');
    setSuccess('');

    try {
      // Call backend to trigger fake webhook notification
      const result = await api.simulatePayment(currentOrder.orderId, approve);
      
      if (approve) {
        setSuccess('SIMULASI SUKSES: Pembayaran disetujui (settlement)! Status Premium Anda aktif.');
        await refreshPremiumStatus();
      } else {
        setError('SIMULASI PEMBATALAN: Transaksi dibatalkan (cancel/deny).');
      }
      
      setCurrentOrder(null);
    } catch (err) {
      setError(err.message || 'Simulasi pembayaran gagal.');
    } finally {
      setSimulating(false);
    }
  };

  const getRemainingDays = () => {
    if (!user?.premium_until) return 0;
    const diff = new Date(user.premium_until) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Langganan Premium</h1>
          <p className="text-gray-400 mt-1">Dapatkan visualisasi penuh dan filter audit keuangan UMKM terintegrasi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left panel: Info status & Simulator */}
          <div className="md:col-span-2 space-y-6">
            {/* Status Panel */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">Status Langganan Anda</h3>
              
              {user?.role === 'lecturer' || user?.role === 'admin' ? (
                <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/25 p-5 text-sm text-indigo-300">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Lisensi Dosen/Admin Aktif</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Akun evaluasi dengan peran <strong>{user?.role}</strong> dibebaskan dari penagihan dan otomatis memiliki seluruh akses analitis tanpa perlu berlangganan.
                  </p>
                </div>
              ) : user?.is_premium ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-5 text-sm text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    <span>Paket Premium Aktif</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Masa berlaku premium Anda menyisakan kurang lebih <strong>{getRemainingDays()} hari lagi</strong> (aktif sampai {user.premium_until}).
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/35 p-5 text-sm text-gray-300">
                  <div className="flex items-center gap-2 font-bold text-white mb-1">
                    <AlertCircle className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Paket Dasar (Free)</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Anda saat ini menggunakan akses gratis. Halaman Laporan Lanjutan tersembunyi sampai Anda mengaktifkan premium.
                  </p>
                </div>
              )}
            </div>

            {/* Visual webhook simulator panel */}
            {currentOrder?.isMockPayment && (
              <div className="glass-card p-6 border-amber-500/30 bg-amber-500/5 space-y-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Simulator Pembayaran Midtrans Sandbox</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Karena server menggunakan kunci mockup, sistem mendeteksi simulasi transaksi offline. Anda dapat menyelesaikan proses pembayaran secara instan di sini untuk melihat aliran webhook.
                    </p>
                  </div>
                </div>

                <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>ID Transaksi:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{currentOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Nominal:</span>
                    <span className="font-bold text-white">Rp 10.000</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Token Snap:</span>
                    <span className="font-mono text-gray-400 truncate max-w-[200px]">{currentOrder.snapToken}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSimulatePayment(true)}
                    disabled={simulating}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {simulating ? 'Memproses...' : 'Setujui Pembayaran (Settlement)'}
                  </button>
                  <button
                    onClick={() => handleSimulatePayment(false)}
                    disabled={simulating}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold text-xs rounded-xl transition-all border border-zinc-700 cursor-pointer disabled:opacity-50"
                  >
                    Gagalkan
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
                {success}
              </div>
            )}
          </div>

          {/* Right panel: Pricing card */}
          <div className="glass-card p-6 border-indigo-500/30 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-transparent">
            {/* Ribbon */}
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest">
              Populer
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Paket Akses</span>
                <h3 className="text-2xl font-black text-white mt-1">Premium Analytics</h3>
              </div>

              <div className="flex items-baseline gap-1 py-2">
                <span className="text-3xl font-extrabold text-white">Rp 10.000</span>
                <span className="text-xs text-gray-400 font-semibold">/ minggu</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Tingkatkan visualisasi keuangan Anda untuk mendapatkan wawasan bisnis yang lebih mendalam dan ekspor file audit.
              </p>

              {/* Feature checkmarks */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Grafik Tren Cashflow Lanjutan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Peringkat Kontribusi UMKM Lengkap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Filter Multi-Aplikasi (POS & Marketplace)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Ekspor Buku Ledger Laporan ke CSV</span>
                </li>
              </ul>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={loading || user?.role === 'lecturer' || user?.role === 'admin'}
                className="w-full mt-6 py-3 rounded-xl text-xs font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CreditCard className="h-4 w-4" /> 
                {loading ? 'Menghubungkan Midtrans...' : 'Langganan via Midtrans'}
              </button>
              
              <div className="text-[10px] text-gray-500 text-center leading-relaxed">
                Pembayaran tetap dicatat dan divalidasi oleh gerbang terintegrasi SmartBank.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
