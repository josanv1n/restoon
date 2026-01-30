
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod, OrderType } from '../types';
import { CreditCard, Wallet, Banknote, Search, Clock, Wifi, AlertCircle, LayoutGrid, ShoppingBag, Globe } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'DINE_IN' | 'TAKEAWAY' | 'ONLINE'>('DINE_IN');

  // Filter Utama: Hanya yang BELUM DIBAYAR
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'UNPAID');

  // Filter per Kategori
  const filteredByType = unpaidOrders.filter(o => {
    if (activeTab === 'ONLINE') return o.origin === 'ONLINE';
    if (activeTab === 'TAKEAWAY') return o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE';
    return o.type === OrderType.DINE_IN && o.origin === 'OFFLINE';
  });

  // Search Filter
  const finalDisplayOrders = filteredByType.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(searchLower) || 
      o.tableNumber?.toString().includes(searchTerm) ||
      o.items.some(item => item.name.toLowerCase().includes(searchLower))
    );
  });

  const handlePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Billing Terminal</h2>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                  <Wifi size={10} className="text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live Sync</span>
                </div>
              </div>
              <p className="text-slate-400">Ditemukan {unpaidOrders.length} total tagihan tertunda</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Cari ID / Meja / Menu..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-cyan-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Kategori Tab sesuai permintaan alur 3 sumber */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 gap-2">
            <button 
              onClick={() => setActiveTab('DINE_IN')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'DINE_IN' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid size={14} /> MAKAN DI TEMPAT ({unpaidOrders.filter(o => o.type === OrderType.DINE_IN && o.origin === 'OFFLINE').length})
            </button>
            <button 
              onClick={() => setActiveTab('TAKEAWAY')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'TAKEAWAY' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShoppingBag size={14} /> BAWA PULANG ({unpaidOrders.filter(o => o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE').length})
            </button>
            <button 
              onClick={() => setActiveTab('ONLINE')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'ONLINE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe size={14} /> ORDER ONLINE ({unpaidOrders.filter(o => o.origin === 'ONLINE').length})
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {finalDisplayOrders.length === 0 ? (
            <div className="glass p-16 rounded-3xl text-center border-dashed border-2 border-slate-800 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-700">
                <AlertCircle size={32} />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tidak ada tagihan aktif di kategori {activeTab}</p>
            </div>
          ) : (
            finalDisplayOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/5 shadow-2xl' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold border ${
                    activeTab === 'DINE_IN' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                    activeTab === 'TAKEAWAY' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    <span className="text-[8px] uppercase opacity-60">{activeTab === 'DINE_IN' ? 'Meja' : 'ID'}</span>
                    <span className="text-lg">{activeTab === 'DINE_IN' ? order.tableNumber : order.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono"><Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                       <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-tighter">{order.items.length} Menu</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-cyan-400">Rp {order.total.toLocaleString('id-ID')}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Menunggu Pembayaran</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-[2.5rem] border border-slate-800 p-8 sticky top-6 transition-all duration-500 ${selectedOrder ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 blur-[4px] pointer-events-none translate-y-4 scale-95'}`}>
          <h3 className="text-center font-bold font-mono uppercase tracking-widest text-slate-400 mb-8 pb-4 border-b border-slate-800">Checkout Bill</h3>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pilih Metode</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                    className={`flex flex-col items-center p-5 rounded-2xl border transition-all gap-2 ${paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}
                  >
                    <Wallet size={20} />
                    <span className="text-[10px] font-bold">TUNAI</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod(PaymentMethod.BCA)}
                    className={`flex flex-col items-center p-5 rounded-2xl border transition-all gap-2 ${paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}
                  >
                    <Banknote size={20} />
                    <span className="text-[10px] font-bold">BCA</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Bayar</span>
                    <span className="text-3xl font-bold font-mono text-cyan-400">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 py-5 rounded-2xl text-white font-bold shadow-xl shadow-cyan-500/30 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs"
              >
                KONFIRMASI LUNAS
              </button>
              
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase transition-colors"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierView;
