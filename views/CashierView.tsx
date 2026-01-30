
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod } from '../types';
// Added Clock to the imported icons from lucide-react
import { CreditCard, Wallet, Banknote, Printer, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');

  // Include PENDING status in unpaid list so waiter-submitted orders show up immediately
  const pendingPayments = orders.filter(o => 
    (o.status === OrderStatus.SERVED || o.status === OrderStatus.PREPARING || o.status === OrderStatus.PENDING) && 
    o.paymentStatus === 'UNPAID'
  );

  const filteredOrders = pendingPayments.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.tableNumber?.toString().includes(searchTerm)
  );

  const handlePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod);
      setSelectedOrder(null);
      alert(`Pembayaran untuk ${selectedOrder.type === 'DINE_IN' ? `Meja ${selectedOrder.tableNumber}` : 'Takeaway'} Berhasil!`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Terminal Kasir</h2>
            <p className="text-slate-400">Verifikasi billing meja & offline orders</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari Meja / ID..." 
              className="bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-cyan-500 outline-none w-full md:w-48"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3">
          {filteredOrders.length === 0 ? (
            <div className="glass p-20 rounded-3xl text-center border-dashed border-2 border-slate-800 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-500" size={32} />
              </div>
              <div>
                <p className="text-slate-200 font-bold uppercase tracking-widest text-sm">Semua Transaksi Selesai</p>
                <p className="text-slate-500 text-xs mt-1">Belum ada billing baru yang dikirim oleh pelayan.</p>
              </div>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-6 rounded-[1.5rem] border transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/[0.03] shadow-lg shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${order.type === 'DINE_IN' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {order.type === 'DINE_IN' ? `MEJA ${order.tableNumber}` : 'TAKEAWAY'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">ID: #{order.id.slice(-6)}</span>
                  </div>
                  <div className="flex gap-4">
                    <p className="text-sm font-medium text-slate-300">{order.items.length} Menu Terdaftar</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-2xl font-bold font-mono text-cyan-400 tracking-tighter">Rp {order.total.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Klik untuk Closing</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-[2.5rem] border border-slate-800 overflow-hidden transition-all duration-500 shadow-2xl ${selectedOrder ? 'opacity-100 translate-y-0' : 'opacity-40 blur-[2px] grayscale pointer-events-none translate-y-4'}`}>
          <div className="bg-slate-900/80 p-8 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest"><CreditCard size={18} className="text-cyan-400" /> Rincian Billing</h3>
            {selectedOrder && <span className="font-mono text-[10px] text-slate-500">#{selectedOrder.id}</span>}
          </div>
          
          <div className="p-8 space-y-8">
            {selectedOrder && (
              <>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Metode Pembayaran</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 group ${
                        paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Wallet size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tunai</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.BCA)}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 group ${
                        paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Banknote size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tf BCA</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                   <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 mb-4 border-b border-slate-800 pb-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-slate-400"><span className="text-cyan-500 font-bold">{item.quantity}x</span> {item.name}</span>
                        <span className="font-mono text-slate-500">{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Tagihan</span>
                    <span className="text-3xl font-bold font-mono text-cyan-400 tracking-tighter">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 glass py-4 rounded-2xl text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all border border-slate-800 text-xs font-bold uppercase">
                    <Printer size={16} /> Struk
                  </button>
                  <button 
                    onClick={handlePay}
                    className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-700 py-5 rounded-2xl text-white font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                  >
                    Closing Billing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierView;
