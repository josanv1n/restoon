
import React, { useState } from 'react';
import { MenuItem, AppSettings } from '../types';
import { Plus, Edit2, Trash2, Search, Save, X, Settings as SettingsIcon, Package, Image as ImageIcon } from 'lucide-react';

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
      imageUrl: (form.elements.namedItem('imageUrl') as HTMLInputElement).value,
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
          <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Control Panel</h2>
          <p className="text-slate-400">Pusat Konfigurasi Sistem Resto-On</p>
        </div>
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 gap-2">
          <button onClick={() => setActiveTab('MENU')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MENU' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>Menu & Stock</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>System Settings</button>
        </div>
      </header>

      {activeTab === 'MENU' ? (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-cyan-500 transition-all text-sm" />
            </div>
            <button onClick={() => { setEditingItem(null); setIsAdding(true); }} className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"><Plus size={16} /> ENTRI BARU</button>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-800 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em]"><th className="px-6 py-6">Visual</th><th className="px-6 py-6">Menu</th><th className="px-6 py-6">Kategori</th><th className="px-6 py-6">Harga</th><th className="px-6 py-6">Stok</th><th className="px-6 py-6">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors group">
                    <td className="px-6 py-4">
                       <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shadow-lg" alt="" />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">{item.name}</td>
                    <td className="px-6 py-4"><span className="text-[9px] font-black bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-500 uppercase tracking-widest">{item.category}</span></td>
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">Rp {item.price.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={`font-mono font-bold ${item.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{item.stock}</span></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => { setEditingItem(item); setIsAdding(true); }} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass p-12 rounded-[3.5rem] border border-slate-800 max-w-2xl space-y-8 shadow-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3 font-mono tracking-tighter uppercase"><SettingsIcon className="text-pink-500" /> Global Protocol</h3>
          <div className="space-y-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identitas Restoran</label><input value={restName} onChange={(e) => setRestName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-pink-500 transition-all" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Broadcast Promo</label><textarea value={promoForm} onChange={(e) => setPromoForm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 h-32 outline-none focus:border-pink-500 transition-all" /></div>
          </div>
          <button onClick={saveSettings} className="w-full bg-gradient-to-r from-pink-600 to-rose-700 py-5 rounded-2xl font-bold text-white uppercase tracking-widest text-xs shadow-xl shadow-pink-500/20 hover:scale-[1.02] transition-all">Update System Environment</button>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form onSubmit={saveMenuItem} className="glass w-full max-w-xl rounded-[3rem] border border-slate-700 p-12 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">{editingItem ? 'Update Configuration' : 'New Dish Protocol'}</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Konfigurasi Data Menu Digital</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Nama Menu</label>
                <input name="name" defaultValue={editingItem?.name} required placeholder="Contoh: Rendang Premium" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Sektor</label>
                  <select name="category" defaultValue={editingItem?.category || 'FOOD'} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all"><option>FOOD</option><option>DRINK</option></select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Price (Rp)</label>
                  <input name="price" type="number" defaultValue={editingItem?.price} required placeholder="25000" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Inventory Stock</label>
                  <input name="stock" type="number" defaultValue={editingItem?.stock || 100} required placeholder="100" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Image Resource (URL)</label>
                  <input name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-5 glass rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-all">Aborting</button>
              <button type="submit" className="flex-1 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all">Commit Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminView;
