
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Zap, Globe, MapPin, Calendar, List, Download, ArrowRight, Clock, CreditCard } from 'lucide-react';

interface ManagementViewProps {
  orders: Order[];
}

const ManagementView: React.FC<ManagementViewProps> = ({ orders }) => {
  // Utility untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD (Local Time)
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();
  
  // Mengubah default startDate dari awal bulan menjadi hari ini
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // 2. Filter Orders berdasarkan Rentang Tanggal yang dipilih
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Hanya tampilkan yang sudah lunas (PAID)
      if (o.paymentStatus !== 'PAID') return false;
      
      const orderDateObj = new Date(o.createdAt);
      const year = orderDateObj.getFullYear();
      const month = String(orderDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(orderDateObj.getDate()).padStart(2, '0');
      const orderDateStr = `${year}-${month}-${day}`;
      
      return orderDateStr >= startDate && orderDateStr <= endDate;
    });
  }, [orders, startDate, endDate]);

  // 3. Agregasi Data Harian untuk Chart dan Ringkasan
  const dailyStats = useMemo(() => {
    const map = new Map<string, { date: string, total: number, count: number }>();
    
    // Inisialisasi range agar chart tidak ada gap (meskipun hanya 1 hari)
    let curr = new Date(startDate);
    const end = new Date(endDate);
    
    // Safety break untuk mencegah infinite loop jika ada kesalahan input tanggal
    let limit = 0;
    while (curr <= end && limit < 366) {
      const d = curr.toISOString().split('T')[0];
      map.set(d, { date: d, total: 0, count: 0 });
      curr.setDate(curr.getDate() + 1);
      limit++;
    }

    filteredOrders.forEach(o => {
      const orderDateObj = new Date(o.createdAt);
      const d = `${orderDateObj.getFullYear()}-${String(orderDateObj.getMonth() + 1).padStart(2, '0')}-${String(orderDateObj.getDate()).padStart(2, '0')}`;
      const existing = map.get(d) || { date: d, total: 0, count: 0 };
      map.set(d, {
        date: d,
        total: existing.total + o.total,
        count: existing.count + 1
      });
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders, startDate, endDate]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const onlineOrders = filteredOrders.filter(o => o.origin === 'ONLINE').length;
  const offlineOrders = filteredOrders.filter(o => o.origin === 'OFFLINE').length;

  const pieData = [
    { name: 'Online', value: onlineOrders },
    { name: 'Offline', value: offlineOrders },
  ];
  const COLORS = ['#06b6d4', '#ec4899'];

  const stats = [
    { label: 'Revenue Periode', value: `Rp ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Order', value: filteredOrders.length, icon: Zap, color: 'text-cyan-400' },
    { label: 'Online Flow', value: `${onlineOrders} Trx`, icon: Globe, color: 'text-blue-400' },
    { label: 'Offline Flow', value: `${offlineOrders} Trx`, icon: MapPin, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-2xl md:text-3xl font-bold neon-text-pink font-mono uppercase tracking-tighter">Business BI</h2>
             <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded text-[8px] font-bold text-pink-500 uppercase tracking-widest">Live Engine</span>
          </div>
          <p className="text-xs text-slate-500">Performa keuangan per tanggal {startDate === endDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'periode pilihan'}</p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 glass p-2 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
            <Calendar size={14} className="text-slate-500" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-200 outline-none"
            />
          </div>
          <ArrowRight size={12} className="text-slate-700" />
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
            <Calendar size={14} className="text-slate-500" />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-200 outline-none"
            />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-5 md:p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900/50 ${stat.color} flex items-center justify-center mb-4`}><stat.icon size={20} /></div>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Flow Chart */}
        <div className="lg:col-span-2 glass p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col">
          <h3 className="text-sm font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-slate-400">
            <TrendingUp size={16} className="text-cyan-400" /> {startDate === endDate ? 'Analisis Pendapatan Hari Ini' : 'Grafik Pendapatan Periode'}
          </h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
                  }}
                />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px' }}
                  itemStyle={{ color: '#06b6d4' }}
                  formatter={(val: any) => [`Rp ${val.toLocaleString()}`, 'Total Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution */}
        <div className="lg:col-span-1 glass p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold mb-6 self-start uppercase tracking-widest text-slate-400">Metode Pesanan</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Online</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Offline</span></div>
          </div>
        </div>
      </div>

      {/* Daily Summary Table */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 pl-2">
          <List size={14} className="text-pink-500" /> Ringkasan Total Per Tanggal
        </h3>
        <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Tanggal</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Jumlah Transaksi</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Total Nominal</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {dailyStats.filter(s => s.count > 0).reverse().map((stat, idx) => (
                  <tr key={idx} className="hover:bg-pink-500/5 transition-all group">
                    <td className="px-8 py-5 font-bold text-slate-200 font-mono text-sm">
                      {new Date(stat.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400">{stat.count} Pesanan</td>
                    <td className="px-8 py-5 font-mono font-bold text-cyan-400 text-sm">Rp {stat.total.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase">Settled</span>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center">
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Tidak ada data transaksi hari ini</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Transaction List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
            <Clock size={14} className="text-cyan-500" /> Rincian Transaksi Detail
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-all">
             <Download size={12} /> EXPORT DATA
          </button>
        </div>
        
        <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">ID Order</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Waktu</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Metode</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Tipe</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredOrders.sort((a,b) => b.createdAt - a.createdAt).map((order) => (
                  <tr key={order.id} className="hover:bg-cyan-500/5 transition-all">
                    <td className="px-8 py-4 font-mono text-xs text-slate-200">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs text-slate-300 font-bold">{new Date(order.createdAt).toLocaleTimeString('id-ID')}</span>
                          <span className="text-[9px] text-slate-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                       </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <CreditCard size={12} className="text-blue-500" />
                        {order.paymentMethod || 'TUNAI'}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                       <span className={`text-[8px] px-2 py-0.5 rounded border ${order.origin === 'ONLINE' ? 'border-blue-500/30 text-blue-500' : 'border-pink-500/30 text-pink-500'} font-black uppercase tracking-widest`}>
                        {order.origin}
                       </span>
                    </td>
                    <td className="px-8 py-4 text-right font-mono font-bold text-emerald-400 text-sm">Rp {order.total.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Belum ada rincian data</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementView;
