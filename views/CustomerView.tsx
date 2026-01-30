
import React, { useState } from 'react';
import { MenuItem, OrderType, OrderStatus, OrderItem, Order } from '../types';
import { TABLES_COUNT } from '../constants';
import { ShoppingCart, Plus, Minus, ChevronRight, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface CustomerViewProps {
  menu: MenuItem[];
  onPlaceOrder: (order: any) => void;
  existingOrders: Order[];
}

const CustomerView: React.FC<CustomerViewProps> = ({ menu, onPlaceOrder, existingOrders }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [category, setCategory] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');

  // Identify occupied tables: Tables that have orders NOT in 'PAID' or 'CANCELLED' status
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold neon-text-cyan">Pilih Menu</h2>
            <p className="text-slate-400 mt-1">Sistem Pemesanan Resto-On v2.5</p>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            {['ALL', 'FOOD', 'DRINK'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
              <div key={item.id} className="glass p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                    <p className="text-xl font-bold font-mono text-cyan-500">Rp {item.price.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">Kategori: {item.category}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {inCart ? (
                      <div className="flex items-center bg-slate-800 rounded-full border border-slate-700">
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-white"><Minus size={14} /></button>
                        <span className="w-8 text-center font-bold text-cyan-400">{inCart.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-2 text-slate-400 hover:text-white"><Plus size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-all">
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="glass rounded-3xl border border-slate-800 p-6 sticky top-6 space-y-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-cyan-400" size={24} />
            <h3 className="text-xl font-bold">Billing Meja</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setOrderType(OrderType.DINE_IN); setSelectedTable(null); }} 
              className={`py-2 rounded-lg text-sm font-medium transition-all ${orderType === OrderType.DINE_IN ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500'}`}
            >
              Makan Sini
            </button>
            <button 
              onClick={() => { setOrderType(OrderType.TAKEAWAY); setSelectedTable(null); }} 
              className={`py-2 rounded-lg text-sm font-medium transition-all ${orderType === OrderType.TAKEAWAY ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500'}`}
            >
              Bawa Pulang
            </button>
          </div>

          {orderType === OrderType.DINE_IN && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid size={12} /> Pilih Nomor Meja
                </p>
                {selectedTable && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                    MEJA {selectedTable} TERPILIH
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: TABLES_COUNT }, (_, i) => {
                  const tableNum = i + 1;
                  const isOccupied = occupiedTables.includes(tableNum);
                  const isSelected = selectedTable === tableNum;
                  
                  return (
                    <button
                      key={tableNum}
                      disabled={isOccupied}
                      onClick={() => setSelectedTable(tableNum)}
                      className={`h-12 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected 
                          ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/40 scale-105 z-10' 
                          : isOccupied 
                            ? 'bg-red-500/10 border-red-500/30 text-red-500/50 cursor-not-allowed grayscale' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'
                      }`}
                    >
                      <span>M{tableNum}</span>
                      {isOccupied && <span className="text-[8px] opacity-60">Locked</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-600 italic">
                * Meja merah sedang digunakan dan belum closing (pembayaran).
              </p>
            </div>
          )}

          <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs uppercase font-bold tracking-widest">Keranjang Kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-mono font-bold text-sm">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-sm uppercase tracking-tighter text-slate-400">Total Tagihan</span>
              <span className="text-cyan-500 font-mono">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={isCheckoutDisabled} 
              className={`w-full py-4 mt-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                !isCheckoutDisabled 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {orderType === OrderType.DINE_IN && selectedTable 
                ? `Pesan Meja ${selectedTable}` 
                : orderType === OrderType.TAKEAWAY 
                  ? 'Pesan Bawa Pulang' 
                  : 'Pilih Meja'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
