
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod, OrderType } from '../types';
import { CreditCard, Wallet, Banknote, Search, Clock, Wifi, AlertCircle, LayoutGrid, ShoppingBag, Globe, Eye, CheckCircle2, Truck, User } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod, extraData?: any) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'DINE_IN' | 'TAKEAWAY' | 'ONLINE'>('DINE_IN');
  const [courierName, setCourierName] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);

  // Filter Orders Logic
  const filteredOrders = orders.filter(o => {
    // Basic Tab Filter
    if (activeTab === 'ONLINE') return o.origin === 'ONLINE';
    if (activeTab === 'TAKEAWAY') return o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE';
    return o.type === OrderType.DINE_IN && o.origin === 'OFFLINE';
  }).filter(o => {
     // Status Filter: Show Unpaid OR Online orders that are paid but not yet delivered
     if (activeTab === 'ONLINE') {
        return o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED;
     }
     return o.paymentStatus === 'UNPAID';
  });

  const finalDisplayOrders = filteredOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(searchLower) || 
      o.tableNumber?.toString().includes(searchTerm) ||
      o.items.some(item => item.name.toLowerCase().includes(searchLower)) ||
      (o.customerId && o.customerId.toLowerCase().includes(searchLower))
    );
  });

  const handlePay = () => {
    if (selectedOrder) {
      // Approve Payment -> Status PAID + PREPARING (Kitchen)
      onProcessPayment(selectedOrder.id, paymentMethod, { status: OrderStatus.PREPARING }); 
      setSelectedOrder(null);
    }
  };

  const handleSetDelivery = () => {
     if (selectedOrder && courierName) {
        onProcessPayment(selectedOrder.id, PaymentMethod.BCA, { courierName });
        setSelectedOrder(null);
        setCourierName('');
     } else {
        alert("Masukkan nama kurir");
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Kasir System</h2>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                  <Wifi size={10} className="text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">{filteredOrders.length} antrian aktif</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Cari ID / Meja / Customer..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-cyan-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('DINE_IN')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'DINE_IN' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>
              <LayoutGrid size={12} /> DINE-IN ({orders.filter(o => o.type === OrderType.DINE_IN && o.origin === 'OFFLINE' && o.paymentStatus === 'UNPAID').length})
            </button>
            <button onClick={() => setActiveTab('TAKEAWAY')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'TAKEAWAY' ? 'bg-pink-500 text-white' : 'text-slate-500'}`}>
              <ShoppingBag size={12} /> TAKEAWAY ({orders.filter(o => o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE' && o.paymentStatus === 'UNPAID').length})
            </button>
            <button onClick={() => setActiveTab('ONLINE')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'ONLINE' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
              <Globe size={12} /> ONLINE ({orders.filter(o => o.origin === 'ONLINE' && o.status !== OrderStatus.SERVED).length})
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {finalDisplayOrders.length === 0 ? (
            <div className="glass p-12 rounded-2xl text-center border-dashed border-2 border-slate-800">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Tidak ada pesanan aktif</p>
            </div>
          ) : (
            finalDisplayOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass p-4 md:p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center font-bold border shrink-0 ${
                    activeTab === 'ONLINE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    activeTab === 'DINE_IN' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    <span className="text-[7px] md:text-[8px] uppercase opacity-60">{activeTab === 'DINE_IN' ? 'Meja' : 'ID'}</span>
                    <span className="text-sm md:text-lg">{activeTab === 'DINE_IN' ? order.tableNumber : order.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-100 text-sm md:text-base truncate">#{order.id.slice(-6).toUpperCase()}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                       <div className="flex items-center gap-2">
                          <span className="text-[8px] md:text-[10px] text-slate-500 font-mono truncate">{new Date(order.createdAt).toLocaleTimeString()}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded shrink-0 ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{order.paymentStatus}</span>
                       </div>
                       {order.origin === 'ONLINE' && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                             <User size={10} /> {order.customerId || 'Guest'}
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-base md:text-2xl font-bold font-mono text-cyan-400">Rp {order.total.toLocaleString('id-ID')}</p>
                  {order.origin === 'ONLINE' && order.paymentProof && order.paymentStatus === 'UNPAID' && (
                     <div className="text-[9px] text-emerald-400 flex items-center justify-end gap-1 mt-1 font-bold animate-pulse"><CheckCircle2 size={10} /> Bukti Uploaded</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className={`glass rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-8 transition-all duration-300 ${selectedOrder ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <h3 className="text-center font-bold font-mono uppercase tracking-widest text-slate-400 mb-6 pb-4 border-b border-slate-800 text-xs">Checkout Bill</h3>
          
          {selectedOrder && (
            <div className="space-y-6">
              
              {/* Payment Proof Section for ONLINE */}
              {selectedOrder.origin === 'ONLINE' && selectedOrder.paymentProof && (
                 <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bukti Pembayaran</p>
                    <button 
                      onClick={() => setShowProofModal(!showProofModal)}
                      className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-blue-400 hover:text-white flex items-center justify-center gap-2"
                    >
                       <Eye size={14} /> {showProofModal ? 'Tutup Gambar' : 'Lihat Screenshot'}
                    </button>
                    {showProofModal && (
                       <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
                          <img src={selectedOrder.paymentProof} alt="Proof" className="w-full object-contain" />
                       </div>
                    )}
                 </div>
              )}

              {/* Status Actions */}
              {selectedOrder.paymentStatus === 'UNPAID' ? (
                <div className="space-y-6">
                   <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Metode Pembayaran</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`flex flex-col items-center p-4 rounded-xl border transition-all gap-1 ${paymentMethod === PaymentMethod.CASH ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                        <Wallet size={16} /> <span className="text-[8px] font-bold">TUNAI</span>
                      </button>
                      <button onClick={() => setPaymentMethod(PaymentMethod.BCA)} className={`flex flex-col items-center p-4 rounded-xl border transition-all gap-1 ${paymentMethod === PaymentMethod.BCA ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                        <Banknote size={16} /> <span className="text-[8px] font-bold">BCA</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-slate-500">Total</span>
                        <span className="text-xl md:text-2xl font-bold font-mono text-cyan-400">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                      </div>
                  </div>

                  <button onClick={handlePay} className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 py-4 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl">
                    {selectedOrder.origin === 'ONLINE' ? 'APPROVE & PROSES' : 'KONFIRMASI LUNAS'}
                  </button>
                </div>
              ) : (
                // Paid Orders Actions (Delivery)
                selectedOrder.origin === 'ONLINE' && selectedOrder.status !== OrderStatus.ON_DELIVERY && (
                   <div className="space-y-4">
                      <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
                         <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">PEMBAYARAN LUNAS</p>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Assign Delivery</label>
                         <div className="flex gap-2">
                            <div className="relative flex-1">
                               <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                               <input 
                                  value={courierName} 
                                  onChange={(e) => setCourierName(e.target.value)} 
                                  placeholder="Nama Kurir / Ojol..." 
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs outline-none focus:border-cyan-500" 
                                />
                            </div>
                            <button onClick={handleSetDelivery} className="bg-blue-600 text-white px-4 rounded-xl font-bold text-[9px] uppercase">Kirim</button>
                         </div>
                      </div>
                   </div>
                )
              )}

              {/* Delivery Status Info */}
              {selectedOrder.status === OrderStatus.ON_DELIVERY && (
                 <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center space-y-1">
                    <Truck className="mx-auto text-blue-400 mb-2" size={24} />
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">SEDANG DIKIRIM</p>
                    <p className="text-xs text-slate-300">Kurir: {selectedOrder.courierName}</p>
                 </div>
              )}

              <button onClick={() => setSelectedOrder(null)} className="w-full text-slate-600 text-[9px] font-bold uppercase pt-4">Tutup</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierView;
