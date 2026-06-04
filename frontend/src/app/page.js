'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#090d16] text-gray-400">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm font-medium tracking-wide">Mempersiapkan Lingkungan Analytics...</p>
      </div>
    </div>
  );
}
