'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Edit3, Trash2, Save, X, Info, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (user && user.role === 'admin') {
      loadTransactions();
    }
  }, [user, router]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      setTransactions(res.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tx) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      let sourceApp = tx.from_app.toLowerCase();
      if (sourceApp === 'supplierhub') sourceApp = 'supplier';
      await api.deleteTransaction(sourceApp, tx.tx_id);
      setTransactions(transactions.filter(t => t.tx_id !== tx.tx_id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus transaksi');
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.tx_id);
    setEditForm({
      amount: tx.amount,
      fee: tx.fee || 0,
      tax: tx.tax || 0,
      status: tx.status
    });
  };

  const handleSave = async (tx) => {
    try {
      let sourceApp = tx.from_app.toLowerCase();
      if (sourceApp === 'supplierhub') sourceApp = 'supplier';
      await api.updateTransaction(sourceApp, tx.tx_id, editForm);
      setEditingId(null);
      loadTransactions();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan transaksi');
    }
  };

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

  if (user?.role !== 'admin') {
    return null; // Redirects handled in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="text-red-500" /> Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Kelola dan edit data transaksi secara langsung (Admin Only).</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 text-red-400 flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error Memuat Data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0d1527] text-xs uppercase text-gray-400 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Transaksi</th>
                  <th className="px-6 py-4 font-semibold">Tipe</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Fee</th>
                  <th className="px-6 py-4 font-semibold">Tax</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.tx_id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white truncate max-w-[150px]" title={tx.tx_id}>{tx.tx_id}</td>
                    <td className="px-6 py-4">{tx.from_app}</td>
                    
                    {editingId === tx.tx_id ? (
                      <>
                        <td className="px-6 py-4">
                          <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} className="w-24 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" value={editForm.fee} onChange={e => setEditForm({...editForm, fee: Number(e.target.value)})} className="w-20 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" value={editForm.tax} onChange={e => setEditForm({...editForm, tax: Number(e.target.value)})} className="w-20 bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600" />
                        </td>
                        <td className="px-6 py-4">
                          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-slate-800 text-white rounded px-2 py-1 text-sm border border-slate-600">
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleSave(tx)} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"><Save size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20"><X size={16} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-emerald-400 font-semibold">{formatCurrency(tx.amount)}</td>
                        <td className="px-6 py-4">{formatCurrency(tx.fee)}</td>
                        <td className="px-6 py-4">{formatCurrency(tx.tax)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(tx)} className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20" title="Edit"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(tx)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20" title="Hapus"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
