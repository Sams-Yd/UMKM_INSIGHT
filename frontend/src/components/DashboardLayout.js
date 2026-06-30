'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CreditCard, 
  LogOut, 
  User as UserIcon,
  Shield,
  Award,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090d16]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const baseMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analisis Penjualan', path: '/sales', icon: TrendingUp },
    { name: 'Analisis Cashflow', path: '/cashflow', icon: DollarSign },
    { name: 'Laporan Lanjutan', path: '/reports', icon: FileText },
    { name: 'Langganan Premium', path: '/subscription', icon: CreditCard },
  ];

  const menuItems = user?.role === 'admin' 
    ? [{ name: 'Admin Dashboard', path: '/admin', icon: Shield }, ...baseMenuItems]
    : baseMenuItems;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-900/50"><Shield className="h-3 w-3" /> Admin</span>;
      case 'lecturer':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-900/50"><Award className="h-3 w-3" /> Dosen</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-900/50"><UserIcon className="h-3 w-3" /> Mahasiswa</span>;
    }
  };

  const getPremiumBadge = () => {
    if (user.role === 'lecturer' || user.role === 'admin') {
      return (
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm border border-indigo-400/30">
          Akses Dosen (Premium)
        </span>
      );
    }
    
    if (user.is_premium) {
      return (
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black px-2.5 py-0.5 rounded shadow-sm">
          PREMIUM
        </span>
      );
    }

    return (
      <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded border border-zinc-700">
        Free
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#090d16] text-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0d1527] border-r border-slate-800/80">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center px-6 h-12">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              UMKM Insight
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border-l-4 border-indigo-500 pl-3'
                      : 'text-gray-400 hover:bg-[#131b2e] hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="flex-shrink-0 flex border-t border-slate-800/80 p-4 bg-[#0a0f1c]">
          <div className="flex items-center w-full">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <div className="flex flex-col gap-1.5 mt-1">
                <div>{getRoleBadge(user.role)}</div>
                <div>{getPremiumBadge()}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-1.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
              title="Logout"
              id="btn-logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-[#0d1527] border-b border-slate-800/80 px-4 py-4 fixed top-0 left-0 right-0 z-30">
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          UMKM Insight
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-gray-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 flex">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-filter backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#0d1527] border-r border-slate-800 pt-16">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border-l-4 border-indigo-500 pl-3'
                        : 'text-gray-400 hover:bg-[#131b2e] hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 p-4 bg-[#0a0f1c]">
              <div className="flex items-center w-full">
                <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold text-white">{user.username}</p>
                  <p className="text-[10px] text-gray-400">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1 rounded text-gray-400 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 w-full min-h-screen pt-[72px] md:pt-0">
        <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
