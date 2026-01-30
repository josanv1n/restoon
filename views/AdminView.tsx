
import React, { useState } from 'react';
import { MenuItem } from '../types';
import { INITIAL_MENU } from '../constants';
import { Plus, Edit2, Trash2, Search, Save, X } from 'lucide-react';

const AdminView: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase">Menu Configuration</h2>
          <p className="text-slate-400">Atur ketersediaan menu dan harga pasar</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} /> Tambah Menu Baru
        </button>
      </header>

      <div className="glass p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Cari menu berdasarkan nama..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:border-cyan-500 outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Menu Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price (IDR)</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      item.category === 'FOOD' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-cyan-500">
                    Rp {item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="glass w-full max-w-lg rounded-3xl border border-slate-700 p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold neon-text-cyan">Add New Menu</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Hidangan</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500" placeholder="e.g. Nasi Rendang Special" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500">
                    <option>FOOD</option>
                    <option>DRINK</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga (Rp)</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 glass rounded-2xl font-bold hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-cyan-500 rounded-2xl text-white font-bold shadow-lg shadow-cyan-500/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
