
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { CreditCard, Wallet, Banknote, Search, Clock, Wifi, AlertCircle } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');

  // Tampilkan semua order yang belum dibayar
  const activeBills = orders.filter(o => o.paymentStatus === 'UNPAID');

  // Perbaikan Filter: Menghindari crash saat tableNumber null
  const filteredOrders = activeBills.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const idMatches = o.id.toLowerCase().includes(searchLower);
    const tableMatches = o.tableNumber?.toString().includes(searchTerm) || false;
    const typeMatches = o.type.toLowerCase().includes(searchLower);
    return idMatches || tableMatches || typeMatches;
  });

  const handlePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Billing Kasir</h2>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                <Wifi size={10} className="text-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">System Integrated</span>
              </div>
            </div>
            <p className="text-slate-400">Total {activeBills.length} tagihan meja aktif ditemukan</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari Meja atau ID..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-cyan-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredOrders.length === 0 ? (
            <div className="glass p-16 rounded-3xl text-center border-dashed border-2 border-slate-800 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-700">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tidak ada tagihan aktif</p>
                <p className="text-[10px] text-slate-600 mt-1">Menunggu input pesanan dari Pelayan...</p>
              </div>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.1)]' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold border transition-colors ${
                    order.type === 'DINE_IN' 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-500/20' 
                      : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                  }`}>
                    <span className="text-xs uppercase opacity-60 font-medium">{order.type === 'DINE_IN' ? 'Meja' : 'Bawa'}</span>
                    <span className="text-xl tracking-tighter">{order.type === 'DINE_IN' ? `${order.tableNumber}` : 'PULANG'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">ID: {order.id.slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono"><Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                       <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">{order.items.length} MENU</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-cyan-400">Rp {order.total.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Klik untuk bayar</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-[2.5rem] border border-slate-800 p-8 sticky top-6 transition-all duration-500 ${selectedOrder ? 'opacity-100 translate-y-0 scale-100' : 'opacity-30 blur-[2px] pointer-events-none translate-y-4 scale-95'}`}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <CreditCard size={28} />
            </div>
            <h3 className="text-xl font-bold font-mono uppercase tracking-widest">Checkout Terminal</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Bagindo Rajo Billing System</p>
          </div>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                    className={`flex flex-col items-center p-5 rounded-2xl border transition-all gap-2 group ${paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <Wallet size={24} className={paymentMethod === PaymentMethod.CASH ? 'animate-bounce' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">TUNAI</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod(PaymentMethod.BCA)}
                    className={`flex flex-col items-center p-5 rounded-2xl border transition-all gap-2 group ${paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <Banknote size={24} className={paymentMethod === PaymentMethod.BCA ? 'animate-bounce' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">TF BCA</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 space-y-4">
                 <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 mb-4 border-b border-slate-800 pb-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-slate-400"><span className="text-cyan-500 font-bold">{item.quantity}x</span> {item.name}</span>
                        <span className="font-mono text-slate-300">{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-bold font-mono text-cyan-400">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 py-5 rounded-2xl text-white font-bold shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                KONFIRMASI LUNAS <CreditCard size={20} />
              </button>
              
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2 text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Batalkan Pilihan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierView;
