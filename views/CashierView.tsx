
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { CreditCard, Wallet, Banknote, Printer, CheckCircle2, XCircle } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const pendingPayments = orders.filter(o => (o.status === OrderStatus.SERVED || o.status === OrderStatus.PREPARING) && o.paymentStatus === 'UNPAID');

  const handlePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod);
      setSelectedOrder(null);
      alert("Pembayaran berhasil diproses!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <header>
          <h2 className="text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Terminal Kasir</h2>
          <p className="text-slate-400">Verifikasi pembayaran dan cetak struk pelanggan</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {pendingPayments.length === 0 ? (
            <div className="glass p-20 rounded-3xl text-center border-dashed border-2 border-slate-800">
              <CheckCircle2 className="mx-auto text-cyan-500 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest">Semua transaksi selesai</p>
            </div>
          ) : (
            pendingPayments.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">#{order.id.slice(-6)}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 uppercase font-bold">
                      {order.type === 'DINE_IN' ? `Meja ${order.tableNumber}` : 'Takeaway'}
                    </span>
                  </div>
                  <p className="font-medium">{order.items.length} item dipesan</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-mono text-white">Rp {order.total.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-slate-500 group-hover:text-cyan-400">Klik untuk proses →</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-3xl border border-slate-800 overflow-hidden transition-all duration-500 ${selectedOrder ? 'opacity-100 translate-y-0' : 'opacity-50 blur-sm pointer-events-none'}`}>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700">
            <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} /> Rincian Transaksi</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {selectedOrder && (
              <>
                <div className="space-y-2">
                  <p className="text-xs uppercase font-bold text-slate-500 tracking-widest">Metode Pembayaran</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${
                        paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Wallet size={24} />
                      <span className="text-xs font-bold uppercase">Tunai</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.BCA)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${
                        paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Banknote size={24} />
                      <span className="text-xs font-bold uppercase">BCA (Tf)</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === PaymentMethod.BCA && (
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 text-sm space-y-1">
                    <p className="text-blue-400 font-bold">Transfer BCA</p>
                    <p className="text-slate-300">Rek: <span className="font-mono text-white">8801234567</span></p>
                    <p className="text-slate-300">A/N: <span className="text-white">Resto-On Jakarta</span></p>
                  </div>
                )}

                <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Pajak (0%)</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
                    <span className="text-xs uppercase font-bold text-slate-500">Total Tagihan</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 glass py-4 rounded-2xl text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all border border-slate-700">
                    <Printer size={18} /> Struk
                  </button>
                  <button 
                    onClick={handlePay}
                    className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-700 py-4 rounded-2xl text-white font-bold shadow-lg shadow-green-500/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                  >
                    Bayar Sekarang
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
