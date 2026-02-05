
import React, { useState, useRef } from 'react';
import { MenuItem, OrderType, OrderStatus, OrderItem, Order } from '../types';
import { ShoppingCart, Plus, Minus, ChevronRight, LayoutGrid, CheckCircle2, Utensils, History, Upload, Truck, PackageCheck, AlertCircle, Clock, MapPin } from 'lucide-react';

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
  const [orderType, setOrderType] = useState<OrderType>(OrderType.TAKEAWAY); 
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [category, setCategory] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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

    // Alamat wajib untuk order online
    if (!currentUser?.address && !currentUser?.phone) {
        alert("Mohon lengkapi profil (Alamat & Telepon) sebelum memesan delivery.");
        return;
    }

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: orderType,
      tableNumber: orderType === OrderType.DINE_IN ? selectedTable : undefined,
      items: cart,
      total,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
      paymentStatus: 'UNPAID',
      origin: 'ONLINE', 
      customerId: currentUser?.email
    };
    onPlaceOrder(newOrder);
    setCart([]);
    setSelectedTable(null);
    setActiveTab('HISTORY'); 
  };

  const handleUploadClick = (orderId: string) => {
    setUploadingId(orderId);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadingId) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { 
            alert("Ukuran file terlalu besar (Max 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
                const res = await fetch('/api/orders', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: uploadingId, paymentProof: base64String })
                });
                if (res.ok) {
                    alert("Bukti pembayaran berhasil diupload! Mohon tunggu verifikasi kasir.");
                    window.dispatchEvent(new CustomEvent('refreshData'));
                }
            } catch (error) {
                alert("Gagal mengupload gambar.");
            } finally {
                setUploadingId(null);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    if (!confirm("Konfirmasi pesanan sudah diterima?")) return;
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, isReceived: true })
      });
      window.dispatchEvent(new CustomEvent('refreshData'));
    } catch (e) {
      alert("Gagal konfirmasi.");
    }
  };

  const isCheckoutDisabled = cart.length === 0 || (orderType === OrderType.DINE_IN && selectedTable === null);

  return (
    <div className="pb-24">
      {/* Hidden File Input Global */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />

      {/* Mobile Tab Switcher */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 mb-6 lg:hidden sticky top-0 z-40 backdrop-blur-md">
        <button onClick={() => setActiveTab('MENU')} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest ${activeTab === 'MENU' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>Menu</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'HISTORY' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}>
          <History size={12} /> Pesanan Saya {myOrders.filter(o => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED).length > 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Content (Menu) */}
        <div className={`lg:col-span-2 space-y-6 ${activeTab === 'HISTORY' ? 'hidden lg:block lg:opacity-50 lg:pointer-events-none' : ''}`}>
          <header className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan uppercase font-mono tracking-tighter">Halo, {currentUser?.name?.split(' ')[0] || 'Kak'}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                 <MapPin size={12} className="text-pink-500" /> {currentUser?.address || 'Alamat belum diset'}
              </div>
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
                <div key={item.id} className="glass p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4 overflow-hidden pr-2">
                     <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-1 overflow-hidden">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{item.name}</h3>
                        <p className="text-sm font-bold font-mono text-cyan-500">Rp {item.price.toLocaleString('id-ID')}</p>
                     </div>
                  </div>
                  
                  <div className="shrink-0">
                    {inCart ? (
                      <div className="flex flex-col items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                        <button onClick={() => addToCart(item)} className="p-2 text-cyan-400 hover:text-white"><Plus size={14} /></button>
                        <span className="font-bold text-cyan-400 text-sm">{inCart.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-white"><Minus size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-400 transition-all active:scale-95 shadow-lg">
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Cart & History */}
        <div className={`lg:col-span-1 ${activeTab === 'MENU' ? 'hidden lg:block' : 'block'}`}>
          
          {/* CART MODE */}
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
                  Delivery
                </button>
              </div>

              {orderType === OrderType.DINE_IN ? (
                <div className="space-y-4">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid size={12} /> Meja Tersedia
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {Array.from({ length: tablesCount }, (_, i) => {
                      const tableNum = i + 1;
                      const isOccupied = occupiedTables.includes(tableNum);
                      return (
                        <button
                          key={tableNum}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(tableNum)}
                          className={`h-10 rounded-xl text-[10px] font-bold border transition-all ${
                            selectedTable === tableNum 
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
              ) : (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-2">
                   <p className="font-bold uppercase tracking-widest flex items-center gap-2 text-pink-500"><MapPin size={12} /> Alamat Pengiriman:</p>
                   <p className="text-slate-200">{currentUser?.address || 'Harap isi alamat di profil.'}</p>
                </div>
              )}

              <div className="max-h-[180px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl opacity-40">
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em]">Keranjang Kosong</p>
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
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02]' 
                      : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  {orderType === OrderType.DINE_IN && selectedTable 
                    ? `Pesan ke Meja M${selectedTable}` 
                    : 'Checkout Delivery'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* HISTORY MODE */}
          {activeTab === 'HISTORY' && (
             <div className="glass rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl lg:sticky lg:top-10 min-h-[50vh]">
               <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                <History className="text-pink-500" size={20} />
                <h3 className="text-lg md:text-xl font-bold font-mono tracking-tighter uppercase">Status Pesanan</h3>
              </div>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {myOrders.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Belum ada pesanan aktif.</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4 hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ORDER #{order.id.slice(-6)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        {order.status === OrderStatus.SERVED ? (
                            <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SELESAI</span>
                        ) : order.status === OrderStatus.ON_DELIVERY ? (
                            <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Truck size={8} /> DIKIRIM</span>
                        ) : order.status === OrderStatus.CANCELLED ? (
                            <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">BATAL</span>
                        ) : (
                             <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">PROSES</span>
                        )}
                      </div>

                      {/* Timeline / Action Section */}
                      <div className="pt-2 border-t border-slate-800/50 space-y-3">
                        
                        {/* STEP 1: PAYMENT */}
                        {order.paymentStatus === 'UNPAID' && !order.paymentProof && (
                           <div className="space-y-3 animate-in fade-in">
                             <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                               <p className="text-[10px] text-yellow-200 font-bold mb-1 flex items-center gap-2"><AlertCircle size={12} /> Menunggu Pembayaran</p>
                               <p className="text-[9px] text-slate-400 leading-relaxed">Total: <span className="text-white font-bold">Rp {order.total.toLocaleString()}</span>. Transfer ke BCA <span className="font-mono text-white">123-456-7890</span> a.n Bagindo Rajo.</p>
                             </div>
                             <button 
                                onClick={() => handleUploadClick(order.id)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-600 transition-all shadow-lg"
                             >
                               <Upload size={14} /> Upload Bukti Transfer
                             </button>
                           </div>
                        )}
                        
                        {/* STEP 2: WAITING VERIFICATION */}
                        {order.paymentStatus === 'UNPAID' && order.paymentProof && (
                           <div className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                              <Clock size={16} className="text-cyan-400 animate-pulse" />
                              <div>
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Verifikasi Pembayaran</p>
                                  <p className="text-[9px] text-slate-400">Kasir sedang mengecek bukti transfer Anda.</p>
                              </div>
                           </div>
                        )}

                        {/* STEP 3: ON DELIVERY */}
                        {order.status === OrderStatus.ON_DELIVERY && (
                           <div className="space-y-3 animate-in slide-in-from-top-2">
                              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                                 <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                                    <Truck size={14} /> Pesanan Sedang Diantar
                                 </div>
                                 <div className="bg-slate-950/50 p-2 rounded-lg">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Kurir (Delivery By)</p>
                                    <p className="text-sm font-bold text-white">{order.courierName || 'Kurir Toko'}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => handleConfirmReceived(order.id)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                              >
                                <PackageCheck size={14} /> Pesanan Diterima
                              </button>
                           </div>
                        )}

                         {/* STEP 4: SERVED/DONE */}
                         {order.status === OrderStatus.SERVED && (
                           <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 justify-center">
                              <CheckCircle2 size={12} /> Transaksi Selesai
                           </div>
                        )}
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
