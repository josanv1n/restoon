
import React from 'react';
import { Order, OrderStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, PieChart, Star, Zap } from 'lucide-react';

interface ManagementViewProps {
  orders: Order[];
}

const ManagementView: React.FC<ManagementViewProps> = ({ orders }) => {
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Mock data for chart
  const salesData = [
    { name: 'Mon', amount: 4500000 },
    { name: 'Tue', amount: 3800000 },
    { name: 'Wed', amount: 5200000 },
    { name: 'Thu', amount: 6100000 },
    { name: 'Fri', amount: 7500000 },
    { name: 'Sat', amount: 9200000 },
    { name: 'Sun', amount: 8800000 },
  ];

  const stats = [
    { label: 'Total Revenue', value: `Rp ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Orders Completed', value: paidOrders.length, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Basket', value: `Rp ${Math.round(avgOrderValue).toLocaleString()}`, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Customer Satisfaction', value: '98%', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold neon-text-pink font-mono">Performance Analytics</h2>
          <p className="text-slate-400">Pantau pertumbuhan bisnis dan performa menu</p>
        </div>
        <div className="glass px-4 py-2 rounded-xl text-xs font-bold border-pink-500/30 text-pink-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
          LIVE REPORTING
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-cyan-400" /> Revenue Growth</h3>
            <select className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs">
              <option>Weekly View</option>
              <option>Monthly View</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-800 flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><PieChart className="text-pink-400" /> Popular Categories</h3>
          <div className="flex-1 space-y-6">
            {[
              { label: 'Signature Dishes', val: 75, color: 'bg-cyan-500' },
              { label: 'Snacks & Sides', val: 45, color: 'bg-pink-500' },
              { label: 'Cooler Drinks', val: 88, color: 'bg-blue-500' },
              { label: 'Traditional Rice', val: 92, color: 'bg-orange-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="text-slate-500 font-bold">{item.val}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 glass rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
            Download Full PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagementView;
