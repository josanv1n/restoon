
import React, { useState } from 'react';
import { MenuItem, AppSettings } from '../types';
import { Plus, Edit2, Trash2, Search, Save, X, Settings as SettingsIcon, Package, Utensils } from 'lucide-react';

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
      // Per request: Kita tidak mengelola image URL di sub menu ini
      imageUrl: editingItem?.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=40&w=320&auto=format` 
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-10">
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">System Admin</h2>
          <p className="text-xs text-slate-500">Konfigurasi Database Menu & Sistem</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('MENU')} className={`flex-1 py-3 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'MENU' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>Menu & Stock</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 py-3 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'SETTINGS' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>Settings</button>
        </div>
      </header>

      {activeTab === 'MENU' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-cyan-500 transition-all text-sm" />
            </div>
            <button onClick={() => { setEditingItem(null); setIsAdding(true); }} className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"><Plus size={14} /> BARU</button>
          </div>

          <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left border-b border-slate-800 text-slate-500 text-[8px] uppercase font-black tracking-[0.2em]">
                    <th className="px-6 py-5">Nama Menu</th>
                    <th className="px-6 py-5">Kategori</th>
                    <th className="px-6 py-5">Harga</th>
                    <th className="px-6 py-5">Stok</th>
                    <th className="px-6 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-200 text-sm">
                        <div className="flex items-center gap-3">
                          <Utensils size={14} className="text-slate-700" />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-cyan-400 font-bold text-sm">Rp {item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-sm">{item.stock}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setIsAdding(true); }} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-cyan-400"><Edit2 size={14} /></button>
                        <button onClick={() => deleteMenuItem(item.id)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-800 max-w-2xl space-y-6 shadow-2xl">
          <h3 className="text-xl font-bold flex items-center gap-3 font-mono tracking-tighter uppercase"><SettingsIcon size={20} className="text-pink-500" /> Settings</h3>
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-[8px] font-black text-slate-600 uppercase tracking-widest pl-2">Nama Restoran</label><input value={restName} onChange={(e) => setRestName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-pink-500 text-sm text-slate-200" /></div>
            <div className="space-y-1"><label className="text-[8px] font-black text-slate-600 uppercase tracking-widest pl-2">Broadcast Promo</label><textarea value={promoForm} onChange={(e) => setPromoForm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 h-24 outline-none focus:border-pink-500 text-sm text-slate-200" /></div>
          </div>
          <button onClick={saveSettings} className="w-full bg-pink-600 py-4 rounded-xl font-bold text-white uppercase tracking-widest text-[10px] shadow-lg shadow-pink-500/20">SIMPAN KONFIGURASI</button>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveMenuItem} className="glass w-full max-w-md rounded-[2rem] border border-slate-700 p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold font-mono tracking-tighter uppercase text-center">{editingItem ? 'Update Menu' : 'Menu Baru'}</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] pl-2">Nama Menu</label>
                <input name="name" defaultValue={editingItem?.name} required placeholder="Contoh: Rendang Daging" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] pl-2">Kategori</label>
                  <select name="category" defaultValue={editingItem?.category || 'FOOD'} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"><option value="FOOD">MAKANAN</option><option value="DRINK">MINUMAN</option></select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] pl-2">Harga (Rp)</label>
                  <input name="price" type="number" defaultValue={editingItem?.price} required placeholder="25000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] pl-2">Stok Harian</label>
                <input name="stock" type="number" defaultValue={editingItem?.stock} required placeholder="100" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-900 rounded-xl font-bold text-[9px] uppercase border border-slate-800 text-slate-500">Batal</button>
              <button type="submit" className="flex-1 py-4 bg-cyan-600 rounded-xl text-white font-bold text-[9px] uppercase shadow-lg shadow-cyan-500/20">Simpan Menu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminView;
