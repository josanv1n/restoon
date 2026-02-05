
import React, { useState, useRef } from 'react';
import { MenuItem, OrderType, OrderStatus, OrderItem, Order, Customer } from '../types';
import { ShoppingCart, Plus, Minus, ChevronRight, LayoutGrid, CheckCircle2, Utensils, History, Upload, Truck, PackageCheck, AlertCircle } from 'lucide-react';

interface CustomerViewProps {
  menu: MenuItem[];
  onPlaceOrder: (order: any) => void;
  existingOrders: Order[];
  tablesCount: number;
  currentUser: any;
}

const CustomerView: React.FC<CustomerViewProps> = ({ menu, onPlaceOrder, existingOrders, tablesCount, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'MENU' | 'HISTORY'>('MENU');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.TAKEAWAY); // Default Takeaway/Delivery for online
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [category, setCategory] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const occupiedTables = existingOrders
    .filter(o => o.type === OrderType.DINE_IN && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
    .map(o => o.tableNumber);

  // Filter My Orders
  const myOrders = existingOrders.filter(o => 
    (o.customerId === currentUser?.email || o.customerId === currentUser?.username) &&
    o.origin === 'ONLINE'
  ).sort((a,b) => b.createdAt - a.createdAt);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === item.id);
      if (existing) {
        return prev.map(i => i.menuId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: Math.random().toString(), menuId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === menuId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.menuId === menuId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.menuId !== menuId);
    });
  };

  const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const filteredMenu = category === 'ALL' ? menu : menu.filter(m => m.category === category);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (orderType === OrderType.DINE_IN && selectedTable === null) {
      alert("Silakan pilih nomor meja terlebih dahulu.");
      return;
    }

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      type: orderType,
      tableNumber: orderType === OrderType.DINE_IN ? selectedTable : undefined,
      items: cart,
      total,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
      paymentStatus: 'UNPAID',
      origin: 'ONLINE', // Online Customer always ONLINE
      customerId: currentUser?.email
    };
    onPlaceOrder(newOrder);
    setCart([]);
    setSelectedTable(null);
    setActiveTab('HISTORY'); // Auto switch to history
  };

  const handleUploadProof = async (orderId: string, file: File) => {
    if (file.size > 1024 * 1024) { // 1MB Limit for this demo
      alert("Ukuran file terlalu besar (Max 1MB)");
      return;
    }

    // Convert to Base64 (Simulation for DB storage)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId, paymentProof: base64String })
        });
        if (res.ok) {
           alert("Bukti pembayaran berhasil diupload! Menunggu konfirmasi admin.");
           window.dispatchEvent(new CustomEvent('refreshData')); // Force refresh in App.tsx logic if needed or relying on interval
        }
      } catch (e) {
        alert("Gagal upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmReceived = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin pesanan sudah diterima dengan baik?")) return;
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, isReceived: true })
      });
      alert("Terima kasih! Pesanan selesai.");
    } catch (e) {
      alert("Gagal konfirmasi.");
    }
  };

  const isCheckoutDisabled = cart.length === 0 || (orderType === OrderType.DINE_IN && selectedTable === null);

  return (
    <div className="pb-10">
      {/* Mobile Tab Switcher */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 mb-6 lg:hidden">
        <button onClick={() => setActiveTab('MENU')} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest ${activeTab === 'MENU' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>Menu</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'HISTORY' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}>
          <History size={12} /> Pesanan Saya {myOrders.filter(o => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED).length > 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className={`lg:col-span-2 space-y-6 ${activeTab === 'HISTORY' ? 'hidden lg:block lg:opacity-50 lg:pointer-events-none' : ''}`}>
          <header className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan uppercase font-mono tracking-tighter">Halo, {currentUser?.name || 'Pelanggan'}</h2>
              <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Mau makan apa hari ini?</p>
            </div>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
              {['ALL', 'FOOD', 'DRINK'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
                    category === cat ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua' : cat === 'FOOD' ? 'Makanan' : 'Minuman'}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map((item) => {
              const inCart = cart.find(c => c.menuId === item.id);
              return (
                <div key={item.id} className="glass p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                  <div className="space-y-1 overflow-hidden pr-4">
                     <div className="flex items-center gap-2">
                       <Utensils size={12} className="text-cyan-500/50" />
                       <h3 className="text-sm md:text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{item.name}</h3>
                     </div>
                     <p className="text-base md:text-lg font-bold font-mono text-cyan-500">Rp {item.price.toLocaleString('id-ID')}</p>
                     <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{item.category}</p>
                  </div>
                  
                  <div className="shrink-0">
                    {inCart ? (
                      <div className="flex flex-col items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                        <button onClick={() => addToCart(item)} className="p-2 text-cyan-400 hover:text-white"><Plus size={14} /></button>
                        <span className="font-bold text-cyan-400 text-sm">{inCart.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-white"><Minus size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-400 transition-all active:scale-95">
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Cart (Desktop) / History (Tabbed) */}
        <div className={`lg:col-span-1 ${activeTab === 'MENU' ? 'hidden lg:block' : 'block'}`}>
          {/* CART VIEW */}
          {activeTab === 'MENU' && (
            <div className="glass rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl lg:sticky lg:top-10">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                <ShoppingCart className="text-cyan-400" size={20} />
                <h3 className="text-lg md:text-xl font-bold font-mono tracking-tighter uppercase">Keranjang</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => { setOrderType(OrderType.DINE_IN); setSelectedTable(null); }} 
                  className={`py-3 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${orderType === OrderType.DINE_IN ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Makan Sini
                </button>
                <button 
                  onClick={() => { setOrderType(OrderType.TAKEAWAY); setSelectedTable(null); }} 
                  className={`py-3 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${orderType === OrderType.TAKEAWAY ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  Kirim / Bawa
                </button>
              </div>

              {orderType === OrderType.DINE_IN && (
                <div className="space-y-4">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid size={12} /> Meja Tersedia
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {Array.from({ length: tablesCount }, (_, i) => {
                      const tableNum = i + 1;
                      const isOccupied = occupiedTables.includes(tableNum);
                      const isSelected = selectedTable === tableNum;
                      
                      return (
                        <button
                          key={tableNum}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(tableNum)}
                          className={`h-10 md:h-12 rounded-xl text-[10px] font-bold border transition-all ${
                            isSelected 
                              ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg' 
                              : isOccupied 
                                ? 'bg-red-500/10 border-red-500/20 text-red-500/30 cursor-not-allowed' 
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-cyan-500/50'
                          }`}
                        >
                          M{tableNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="max-h-[180px] lg:max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl opacity-40">
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em]">Belum Ada Pesanan</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-800/30">
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-xs text-slate-200 truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{item.quantity} x {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-mono font-bold text-xs text-cyan-400 shrink-0 ml-2">{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Total</span>
                  <span className="text-xl md:text-2xl font-bold font-mono text-white">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={isCheckoutDisabled} 
                  className={`w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[10px] ${
                    !isCheckoutDisabled 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/20' 
                      : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  {orderType === OrderType.DINE_IN && selectedTable 
                    ? `Kirim Meja M${selectedTable}` 
                    : 'Buat Pesanan'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* HISTORY VIEW (My Orders) */}
          {activeTab === 'HISTORY' && (
             <div className="glass rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl lg:sticky lg:top-10 min-h-[50vh]">
               <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                <History className="text-pink-500" size={20} />
                <h3 className="text-lg md:text-xl font-bold font-mono tracking-tighter uppercase">Pesanan Saya</h3>
              </div>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {myOrders.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Belum ada riwayat pesanan.</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{order.id.slice(-6)}</p>
                          <p className="text-xs font-bold text-slate-200 mt-1">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                          order.status === OrderStatus.PAID || order.status === OrderStatus.SERVED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === OrderStatus.ON_DELIVERY ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {order.status === OrderStatus.ON_DELIVERY ? 'DIKIRIM' : order.status}
                        </span>
                      </div>
                      
                      {/* Action Section based on Status */}
                      <div className="pt-4 border-t border-slate-800/50">
                        {order.paymentStatus === 'UNPAID' && !order.paymentProof && (
                           <div className="space-y-3">
                             <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-bold bg-yellow-500/5 p-2 rounded-lg border border-yellow-500/10">
                               <AlertCircle size={12} /> Menunggu Pembayaran
                             </div>
                             <p className="text-[10px] text-slate-400">Silakan transfer ke BCA 1234567890 a.n Bagindo Rajo, lalu upload bukti.</p>
                             <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={(e) => e.target.files && handleUploadProof(order.id, e.target.files[0])}
                             />
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-700 transition-all"
                             >
                               <Upload size={14} /> Upload Bukti Transfer
                             </button>
                           </div>
                        )}
                        
                        {order.paymentStatus === 'UNPAID' && order.paymentProof && (
                           <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10">
                              <CheckCircle2 size={12} /> Bukti Terkirim, Menunggu Verifikasi
                           </div>
                        )}

                        {order.status === OrderStatus.ON_DELIVERY && (
                           <div className="space-y-3">
                              <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                                 <Truck size={12} /> Sedang Dikirim oleh: {order.courierName}
                              </div>
                              <button 
                                onClick={() => handleConfirmReceived(order.id)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                              >
                                <PackageCheck size={14} /> Konfirmasi Diterima
                              </button>
                           </div>
                        )}

                         {order.status === OrderStatus.SERVED && (
                           <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                              <CheckCircle2 size={12} /> Pesanan Selesai
                           </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{order.items.length} Menu</span>
                         <span className="font-mono font-bold text-sm text-cyan-400">Rp {order.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
