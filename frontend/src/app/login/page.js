'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, Lock, LogIn, ArrowRight, Info } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali username dan password Anda.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            Masuk UMKM Insight
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Analisis data ledger SmartBank secara real-time dan andal
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
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
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="btn-login"
              className="group relative flex w-full justify-center rounded-xl py-3 px-4 text-sm font-semibold text-white gradient-btn focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#090d16] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Masuk Aplikasi <LogIn className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Belum punya akun? </span>
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-0.5">
              Daftar di sini <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
