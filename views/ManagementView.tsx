
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
    { label: 'Revenue', value: `Rp ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Order', value: paidOrders.length, icon: Zap, color: 'text-cyan-400' },
    { label: 'Online', value: `${Math.round((onlineOrders / paidOrders.length || 0) * 100)}%`, icon: Globe, color: 'text-blue-400' },
    { label: 'Offline', value: `${Math.round((offlineOrders / paidOrders.length || 0) * 100)}%`, icon: MapPin, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold neon-text-pink font-mono uppercase tracking-tighter">Business BI</h2>
        <p className="text-xs text-slate-500">Analisis performa penjualan real-time</p>
      </header>

      {/* Stats Grid - Responsive Column Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900/50 ${stat.color} flex items-center justify-center mb-3 md:mb-4`}><stat.icon size={20} /></div>
            <p className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Revenue Flow Chart */}
        <div className="glass p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-800 h-[300px] md:h-[400px]">
          <h3 className="text-sm md:text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tighter"><TrendingUp size={18} className="text-cyan-400" /> Revenue Flow</h3>
          <div className="h-full max-h-[180px] md:max-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{n: 'D1', v: 400}, {n: 'D2', v: 700}, {n: 'D3', v: 600}, {n: 'D4', v: 800}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="n" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin Analysis Pie Chart */}
        <div className="glass p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-800 flex flex-col items-center">
          <h3 className="text-sm md:text-xl font-bold mb-6 self-start uppercase tracking-tighter">Order Distribution</h3>
          <div className="h-[200px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} md:innerRadius={60} md:outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 md:gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div><span className="text-[9px] text-slate-400 font-bold uppercase">Online</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span className="text-[9px] text-slate-400 font-bold uppercase">Offline</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementView;
