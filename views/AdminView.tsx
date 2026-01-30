
import React, { useState } from 'react';
import { MenuItem, AppSettings } from '../types';
import { Plus, Edit2, Trash2, Search, Save, X, Settings as SettingsIcon, Package } from 'lucide-react';

interface AdminViewProps {
  menu: MenuItem[];
  settings: AppSettings | null;
  onMenuUpdate: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ menu, settings, onMenuUpdate }) => {
  const [activeTab, setActiveTab] = useState<'MENU' | 'SETTINGS'>('MENU');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  // Form State for Settings
  const [promoForm, setPromoForm] = useState(settings?.promoText || '');
  const [restName, setRestName] = useState(settings?.restaurantName || '');

  const filteredItems = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
      stock: Number((form.elements.namedItem('stock') as HTMLInputElement).value),
    };

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      setIsAdding(false);
      setEditingItem(null);
      onMenuUpdate();
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm("Hapus menu ini?")) return;
    const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    if (res.ok) onMenuUpdate();
  };

  const saveSettings = async () => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoText: promoForm,
        restaurantName: restName
      })
    });
    if (res.ok) {
      alert("Pengaturan disimpan!");
      onMenuUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase">Control Panel</h2>
          <p className="text-slate-400">Pusat Konfigurasi Sistem Resto-On</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl">
          <button onClick={() => setActiveTab('MENU')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'MENU' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>Menu & Stock</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'SETTINGS' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>System Settings</button>
        </div>
      </header>

      {activeTab === 'MENU' ? (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-cyan-500" />
            </div>
            <button onClick={() => { setEditingItem(null); setIsAdding(true); }} className="bg-cyan-500 text-white px-6 rounded-2xl font-bold flex items-center gap-2"><Plus size={20} /> Baru</button>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-800 text-slate-500 text-xs uppercase font-bold"><th className="px-6 py-4">Menu</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Harga</th><th className="px-6 py-4">Stok</th><th className="px-6 py-4">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                    <td className="px-6 py-4"><span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded">{item.category}</span></td>
                    <td className="px-6 py-4 font-mono text-cyan-400">Rp {item.price.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={`font-bold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>{item.stock}</span></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => { setEditingItem(item); setIsAdding(true); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass p-8 rounded-3xl border border-slate-800 max-w-2xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><SettingsIcon className="text-pink-500" /> Global Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Nama Restoran</label><input value={restName} onChange={(e) => setRestName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3" /></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Teks Promosi Beranda</label><textarea value={promoForm} onChange={(e) => setPromoForm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 h-24" /></div>
          </div>
          <button onClick={saveSettings} className="w-full bg-cyan-500 py-4 rounded-2xl font-bold shadow-lg">Simpan Pengaturan</button>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <form onSubmit={saveMenuItem} className="glass w-full max-w-lg rounded-3xl border border-slate-700 p-8 space-y-6">
            <h3 className="text-2xl font-bold neon-text-cyan">{editingItem ? 'Edit' : 'Tambah'} Menu</h3>
            <div className="space-y-4">
              <input name="name" defaultValue={editingItem?.name} required placeholder="Nama Menu" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3" />
              <div className="grid grid-cols-2 gap-4">
                <select name="category" defaultValue={editingItem?.category || 'FOOD'} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"><option>FOOD</option><option>DRINK</option></select>
                <input name="price" type="number" defaultValue={editingItem?.price} required placeholder="Harga (Rp)" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3" />
              </div>
              <input name="stock" type="number" defaultValue={editingItem?.stock || 100} required placeholder="Stok" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 glass rounded-2xl font-bold">Batal</button>
              <button type="submit" className="flex-1 py-4 bg-cyan-500 rounded-2xl text-white font-bold shadow-lg">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminView;
