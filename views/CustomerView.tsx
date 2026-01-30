
import React, { useState } from 'react';
import { MenuItem, OrderType, OrderStatus, OrderItem, Order } from '../types';
import { ShoppingCart, Plus, Minus, ChevronRight, LayoutGrid, CheckCircle2, Utensils } from 'lucide-react';

interface CustomerViewProps {
  menu: MenuItem[];
  onPlaceOrder: (order: any) => void;
  existingOrders: Order[];
  tablesCount: number;
}

const CustomerView: React.FC<CustomerViewProps> = ({ menu, onPlaceOrder, existingOrders, tablesCount }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [category, setCategory] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');

  const occupiedTables = existingOrders
    .filter(o => o.type === OrderType.DINE_IN && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
    .map(o => o.tableNumber);

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

  const filteredMenu = category === 'ALL' 
    ? menu 
    : menu.filter(m => m.category === category);

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
      origin: 'OFFLINE'
    };
    onPlaceOrder(newOrder);
    setCart([]);
    setSelectedTable(null);
  };

  const isCheckoutDisabled = cart.length === 0 || (orderType === OrderType.DINE_IN && selectedTable === null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan uppercase font-mono tracking-tighter">Pilih Menu</h2>
            <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Portal Pemesanan Mandiri</p>
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

        {/* Daftar Menu: Tanpa batasan tinggi di mobile agar mengikuti scroll utama */}
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

      <div className="lg:col-span-1">
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
              Bawa Pulang
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
                : 'Proses Pesanan'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
