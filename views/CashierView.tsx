
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { CreditCard, Wallet, Banknote, Printer, CheckCircle2, Search, Clock } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');

  // Tampilkan semua order DINE-IN (Meja) yang belum dibayar
  const activeBills = orders.filter(o => o.paymentStatus === 'UNPAID');

  const filteredOrders = activeBills.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.tableNumber?.toString().includes(searchTerm)
  );

  const handlePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase">Billing Meja</h2>
            <p className="text-slate-400">Pilih tagihan meja yang akan dibayar</p>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari Meja..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-cyan-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3">
          {filteredOrders.length === 0 ? (
            <div className="glass p-20 rounded-3xl text-center border-dashed border-2 border-slate-800 opacity-50">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Tidak ada tagihan aktif</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${order.type === 'DINE_IN' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {order.type === 'DINE_IN' ? `M${order.tableNumber}` : 'TA'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">ID: {order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-mono text-cyan-400">Rp {order.total.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{order.items.length} Menu</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-[2rem] border border-slate-800 p-8 sticky top-6 transition-all ${selectedOrder ? 'opacity-100' : 'opacity-30 blur-[1px] pointer-events-none'}`}>
          <h3 className="font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2"><CreditCard size={18} className="text-cyan-400" /> Proses Pembayaran</h3>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all gap-2 ${paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                  <Wallet size={20} /> <span className="text-[10px] font-bold">TUNAI</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PaymentMethod.BCA)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all gap-2 ${paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                  <Banknote size={20} /> <span className="text-[10px] font-bold">TF BCA</span>
                </button>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                 <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 mb-2 border-b border-slate-800 pb-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-400">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500">TOTAL</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">Rp {selectedOrder.total.toLocaleString()}</span>
                  </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2"
              >
                CLOSING BILLING <CheckCircle2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierView;
