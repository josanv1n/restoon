
import React from 'react';
import { Order } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Zap, Globe, MapPin } from 'lucide-react';

interface ManagementViewProps {
  orders: Order[];
}

const ManagementView: React.FC<ManagementViewProps> = ({ orders }) => {
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  
  const onlineOrders = paidOrders.filter(o => o.origin === 'ONLINE').length;
  const offlineOrders = paidOrders.filter(o => o.origin === 'OFFLINE').length;

  const pieData = [
    { name: 'Online', value: onlineOrders },
    { name: 'Offline', value: offlineOrders },
  ];
  const COLORS = ['#06b6d4', '#ec4899'];

  const stats = [
    { label: 'Total Omset', value: `Rp ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Order', value: paidOrders.length, icon: Zap, color: 'text-cyan-400' },
    { label: 'Online Share', value: `${Math.round((onlineOrders / paidOrders.length || 0) * 100)}%`, icon: Globe, color: 'text-blue-400' },
    { label: 'Offline Share', value: `${Math.round((offlineOrders / paidOrders.length || 0) * 100)}%`, icon: MapPin, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold neon-text-pink font-mono">Business Intelligence</h2>
        <p className="text-slate-400">Analisis performa penjualan Resto-On</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-slate-800">
            <div className={`w-12 h-12 rounded-2xl bg-slate-900/50 ${stat.color} flex items-center justify-center mb-4`}><stat.icon size={24} /></div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-800 h-[400px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-cyan-400" /> Revenue Flow</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={[{n: 'Day 1', v: 400}, {n: 'Day 2', v: 700}, {n: 'Day 3', v: 600}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="n" hide />
              <YAxis hide />
              <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-800 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 self-start">Origin Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div><span className="text-xs text-slate-400 font-bold uppercase">Online ({onlineOrders})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span className="text-xs text-slate-400 font-bold uppercase">Offline ({offlineOrders})</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementView;
