'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, ArrowRight, UserPlus, Info } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.length < 3) {
      return setError('Username must be at least 3 characters');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setSubmitting(true);
    try {
      await register(username, password, role);
      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            Gabung UMKM Insight
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Mulai memantau kinerja keuangan UMKM secara cerdas
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-sm text-emerald-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800/80 bg-[#0d1527] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800/80 bg-[#0d1527] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Masukkan password (min 6 karakter)"
                />
              </div>
            </div>

            {/* Role Dropdown */}
            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Pilih Peran Pengguna
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-xl border border-slate-800/80 bg-[#0d1527] py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="user">Mahasiswa / Pemilik UMKM</option>
                <option value="lecturer">Dosen Penilai (Auto-Unlock Premium)</option>
                <option value="admin">Administrator (Bypass)</option>
              </select>
              <p className="mt-1.5 text-[11px] text-gray-400 flex items-start gap-1">
                <Info className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                <span>Akun Dosen secara otomatis memiliki akses gratis ke seluruh fitur Laporan Premium.</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              id="btn-register"
              className="group relative flex w-full justify-center rounded-xl py-3 px-4 text-sm font-semibold text-white gradient-btn focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#090d16] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Daftar Sekarang <UserPlus className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Sudah punya akun? </span>
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-0.5">
              Masuk di sini <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
