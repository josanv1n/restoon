
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentMethod, OrderType } from '../types';
import { CreditCard, Wallet, Banknote, Search, Wifi, LayoutGrid, ShoppingBag, Globe, Eye, CheckCircle2, Truck, User, X, MapPin, Phone, Send } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onProcessPayment: (orderId: string, method: PaymentMethod, extraData?: any) => void;
}

const CashierView: React.FC<CashierViewProps> = ({ orders, onProcessPayment }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'DINE_IN' | 'TAKEAWAY' | 'ONLINE'>('DINE_IN');
  
  // State khusus untuk approval flow online
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [courierNameInput, setCourierNameInput] = useState('');
  const [approvalStep, setApprovalStep] = useState<'REVIEW' | 'ASSIGN_COURIER'>('REVIEW');

  // Filter Orders Logic
  const filteredOrders = orders.filter(o => {
    // Basic Tab Filter
    if (activeTab === 'ONLINE') return o.origin === 'ONLINE';
    if (activeTab === 'TAKEAWAY') return o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE';
    return o.type === OrderType.DINE_IN && o.origin === 'OFFLINE';
  }).filter(o => {
     // Status Filter:
     if (activeTab === 'ONLINE') {
        // Tampilkan order online yang belum selesai (SERVED/CANCELLED)
        return o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED;
     }
     // Offline orders: tampilkan yang belum bayar
     return o.paymentStatus === 'UNPAID';
  });

  const finalDisplayOrders = filteredOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(searchLower) || 
      o.tableNumber?.toString().includes(searchLower) ||
      o.items.some(item => item.name.toLowerCase().includes(searchLower)) ||
      (o.customerId && o.customerId.toLowerCase().includes(searchLower))
    );
  });

  // Handle click pada list item
  const handleOrderClick = (order: Order) => {
      setSelectedOrder(order);
      if (order.origin === 'ONLINE') {
          setApprovalStep('REVIEW');
          setCourierNameInput('');
          setShowDetailModal(true); // Buka modal khusus online
      }
  };

  // Logic untuk Offline Payment
  const handleOfflinePay = () => {
    if (selectedOrder) {
      onProcessPayment(selectedOrder.id, paymentMethod, { status: OrderStatus.PREPARING }); 
      setSelectedOrder(null);
    }
  };

  // Logic untuk Online Approval
  const handleOnlineApproval = () => {
      if (!selectedOrder) return;
      if (approvalStep === 'REVIEW') {
          // Pindah ke step input kurir
          setApprovalStep('ASSIGN_COURIER');
      } else {
          // Final Submit
          if (!courierNameInput.trim()) {
              alert("Harap masukkan nama kurir/pengantar!");
              return;
          }
          // Update order: Payment PAID, Status ON_DELIVERY, Courier Name set
          onProcessPayment(selectedOrder.id, PaymentMethod.BCA, { 
              status: OrderStatus.ON_DELIVERY, 
              courierName: courierNameInput 
          });
          setShowDetailModal(false);
          setSelectedOrder(null);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
      
      {/* --- LEFT COLUMN: LIST ORDERS --- */}
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
            <button onClick={() => { setActiveTab('DINE_IN'); setSelectedOrder(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'DINE_IN' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>
              <LayoutGrid size={12} /> DINE-IN ({orders.filter(o => o.type === OrderType.DINE_IN && o.origin === 'OFFLINE' && o.paymentStatus === 'UNPAID').length})
            </button>
            <button onClick={() => { setActiveTab('TAKEAWAY'); setSelectedOrder(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'TAKEAWAY' ? 'bg-pink-500 text-white' : 'text-slate-500'}`}>
              <ShoppingBag size={12} /> TAKEAWAY ({orders.filter(o => o.type === OrderType.TAKEAWAY && o.origin === 'OFFLINE' && o.paymentStatus === 'UNPAID').length})
            </button>
            <button onClick={() => { setActiveTab('ONLINE'); setSelectedOrder(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${activeTab === 'ONLINE' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
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
                onClick={() => handleOrderClick(order)}
                className={`glass p-4 md:p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  selectedOrder?.id === order.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-600'
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
                          {/* Badge Status Online */}
                          {order.origin === 'ONLINE' ? (
                              order.paymentStatus === 'PAID' ? (
                                  <span className="text-[8px] px-2 py-0.5 rounded shrink-0 bg-blue-500/20 text-blue-400 font-bold uppercase">DIKIRIM</span>
                              ) : order.paymentProof ? (
                                  <span className="text-[8px] px-2 py-0.5 rounded shrink-0 bg-yellow-500/20 text-yellow-400 font-bold uppercase animate-pulse">VERIFIKASI</span>
                              ) : (
                                  <span className="text-[8px] px-2 py-0.5 rounded shrink-0 bg-slate-700 text-slate-400 font-bold uppercase">MENUNGGU BUKTI</span>
                              )
                          ) : (
                              <span className={`text-[8px] px-2 py-0.5 rounded shrink-0 ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{order.paymentStatus}</span>
                          )}
                       </div>
                       {order.origin === 'ONLINE' && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                             <User size={10} /> {order.customerId || 'Guest'}
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
                  <p className="text-base md:text-2xl font-bold font-mono text-cyan-400">Rp {order.total.toLocaleString('id-ID')}</p>
                  
                  {activeTab === 'ONLINE' && !order.paymentProof && order.paymentStatus === 'UNPAID' && (
                      <span className="text-[8px] text-slate-500 italic">Belum upload bukti</span>
                  )}

                  {activeTab === 'ONLINE' && (
                      <button className="flex items-center gap-1 text-[9px] text-blue-400 font-bold uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                          <Eye size={10} /> Lihat Detail
                      </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: CHECKOUT OFFLINE ONLY --- */}
      {/* Untuk Online, kita pakai Modal. Untuk Offline, tetap pakai Sidebar */}
      <div className="lg:col-span-1">
        {activeTab !== 'ONLINE' && (
            <div className={`glass rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-8 transition-all duration-300 ${selectedOrder ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
            <h3 className="text-center font-bold font-mono uppercase tracking-widest text-slate-400 mb-6 pb-4 border-b border-slate-800 text-xs">Checkout Bill</h3>
            
            {selectedOrder && (
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

                <button onClick={handleOfflinePay} className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 py-4 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl">
                    KONFIRMASI LUNAS
                </button>
                <button onClick={() => setSelectedOrder(null)} className="w-full text-slate-600 text-[9px] font-bold uppercase pt-4">Tutup</button>
                </div>
            )}
            </div>
        )}
      </div>

      {/* --- MODAL DETAIL ONLINE ORDER --- */}
      {showDetailModal && selectedOrder && activeTab === 'ONLINE' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowDetailModal(false)}></div>
              <div className="relative glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 custom-scrollbar">
                  
                  {/* Close Button */}
                  <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-900 rounded-full">
                      <X size={20} />
                  </button>

                  {/* Left Side: Order Details */}
                  <div className="flex-1 space-y-6">
                      <div>
                          <h3 className="text-xl font-bold neon-text-cyan font-mono tracking-tighter uppercase mb-1">Order #{selectedOrder.id.slice(-6)}</h3>
                          <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-2"><User size={12} /> {selectedOrder.customerId}</span>
                              <span className="flex items-center gap-2 font-mono text-cyan-500 font-bold text-lg">Rp {selectedOrder.total.toLocaleString()}</span>
                          </div>
                      </div>

                      {/* Item List */}
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 max-h-[150px] overflow-y-auto custom-scrollbar space-y-2">
                          {selectedOrder.items.map(item => (
                              <div key={item.id} className="flex justify-between text-xs text-slate-300 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span className="font-mono text-slate-500">Rp {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                          ))}
                      </div>

                      {/* Approval Action */}
                      {selectedOrder.status === OrderStatus.ON_DELIVERY ? (
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                              <p className="text-center text-blue-400 font-bold uppercase tracking-widest text-xs flex flex-col gap-2 items-center">
                                  <Truck size={24} /> Sedang Dikirim
                              </p>
                              <p className="text-center text-[10px] text-slate-400 mt-2">Kurir: {selectedOrder.courierName}</p>
                          </div>
                      ) : (
                          <div className="space-y-4 pt-4 border-t border-slate-800">
                              {approvalStep === 'REVIEW' ? (
                                  <button 
                                    onClick={handleOnlineApproval}
                                    disabled={!selectedOrder.paymentProof} // Disable jika belum ada bukti
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 ${
                                        selectedOrder.paymentProof 
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-[1.02]' 
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                      {selectedOrder.paymentProof ? 'APPROVE & KIRIM' : 'MENUNGGU BUKTI CUSTOMER'}
                                      <CheckCircle2 size={16} />
                                  </button>
                              ) : (
                                  <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl">
                                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Assign Delivery (Nama Kurir)</label>
                                          <div className="flex gap-2">
                                              <input 
                                                  autoFocus
                                                  value={courierNameInput}
                                                  onChange={e => setCourierNameInput(e.target.value)}
                                                  placeholder="JNE / Gojek / Nama Driver..."
                                                  className="flex-1 bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                                              />
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => setApprovalStep('REVIEW')} className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold uppercase text-[9px] rounded-xl hover:bg-slate-700">Kembali</button>
                                          <button onClick={handleOnlineApproval} className="flex-[2] py-3 bg-blue-600 text-white font-bold uppercase text-[9px] rounded-xl hover:bg-blue-500 shadow-lg flex items-center justify-center gap-2">
                                              <Send size={14} /> Submit & Kirim
                                          </button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Right Side: Payment Proof */}
                  <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-[300px] md:h-auto">
                      <div className="p-3 border-b border-slate-800 bg-slate-950/30">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Bukti Pembayaran</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950/80">
                          {selectedOrder.paymentProof ? (
                              <img src={selectedOrder.paymentProof} alt="Bukti Transfer" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                          ) : (
                              <div className="text-center space-y-2 opacity-30">
                                  <LayoutGrid size={40} className="mx-auto" />
                                  <p className="text-[10px] font-bold uppercase">Belum ada gambar</p>
                              </div>
                          )}
                      </div>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};

export default CashierView;
