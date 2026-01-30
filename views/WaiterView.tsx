
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, MenuItem, OrderItem } from '../types';
import { TABLES_COUNT } from '../constants';
import { Coffee, MapPin, Send, Plus, Minus, Search, ListPlus, Loader2, ShoppingBag, LayoutGrid } from 'lucide-react';

interface WaiterViewProps {
  menu: MenuItem[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const WaiterView: React.FC<WaiterViewProps> = ({ menu, orders, onPlaceOrder }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Identifikasi meja yang sudah ada pesanan aktif (belum bayar)
  const tableStatus = Array.from({ length: TABLES_COUNT }, (_, i) => {
    const tableNum = i + 1;
    const activeOrder = orders.find(o => 
      o.tableNumber === tableNum && 
      o.paymentStatus === 'UNPAID' && 
      o.status !== OrderStatus.CANCELLED
    );
    return { number: tableNum, activeOrder };
  });

  const selectedTableData = selectedTable ? tableStatus.find(t => t.number === selectedTable) : null;
  const isAppending = orderType === OrderType.DINE_IN && !!selectedTableData?.activeOrder;

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === item.id);
      if (existing) {
        return prev.map(i => i.menuId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, menuId: item.id, name: item.name, price: item.price, quantity: 1 }];
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (orderType === OrderType.DINE_IN && !selectedTable) {
        alert("Silakan pilih meja terlebih dahulu!");
        return;
    }

    setIsSubmitting(true);

    try {
      if (isAppending && selectedTableData?.activeOrder) {
        const currentOrder = selectedTableData.activeOrder;
        const updatedItems = [...currentOrder.items, ...cart];
        const updatedTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        
        const res = await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: currentOrder.id, 
            items: updatedItems, 
            total: updatedTotal 
          })
        });
        
        if (res.ok) {
          setCart([]);
          setSelectedTable(null);
          window.dispatchEvent(new CustomEvent('refreshData'));
        } else {
            throw new Error("Gagal memperbarui meja");
        }
      } else {
        const newOrder: Order = {
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          type: orderType,
          tableNumber: orderType === OrderType.DINE_IN ? selectedTable || undefined : undefined,
          items: cart,
          total: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
          status: OrderStatus.PENDING,
          createdAt: Date.now(),
          paymentStatus: 'UNPAID',
          origin: 'OFFLINE'
        };
        await onPlaceOrder(newOrder);
        setCart([]);
        setSelectedTable(null);
      }
    } catch (err: any) {
      alert("ERROR: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = cart.length > 0 && (orderType === OrderType.TAKEAWAY || selectedTable !== null);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Point of Order</h2>
          <p className="text-slate-400">Terminal input pesanan oleh Pelayan (Resto-On OS)</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          <button 
            onClick={() => { setOrderType(OrderType.DINE_IN); setSelectedTable(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all tracking-widest ${orderType === OrderType.DINE_IN ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid size={14} /> MAKAN DI TEMPAT
          </button>
          <button 
            onClick={() => { setOrderType(OrderType.TAKEAWAY); setSelectedTable(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all tracking-widest ${orderType === OrderType.TAKEAWAY ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ShoppingBag size={14} /> BAWA PULANG
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Table Selection (Only for Dine-in) */}
        <div className={`xl:col-span-3 space-y-6 transition-all duration-500 ${orderType === OrderType.TAKEAWAY ? 'opacity-30 pointer-events-none blur-[2px] grayscale' : 'opacity-100'}`}>
          <h3 className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
            <MapPin size={12} className="text-cyan-500" /> Pilih Nomor Meja
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {tableStatus.map((table) => (
              <button 
                key={table.number}
                disabled={orderType === OrderType.TAKEAWAY}
                onClick={() => setSelectedTable(table.number)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all relative ${
                  selectedTable === table.number 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/40 z-10 scale-105'
                    : table.activeOrder 
                      ? 'bg-slate-900 border-cyan-500/40 text-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span className="text-xl font-bold font-mono">M{table.number}</span>
                {table.activeOrder && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Menu Selection */}
        <div className="xl:col-span-6 space-y-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari menu makanan/minuman..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-cyan-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {menu.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
              const inCart = cart.find(c => c.menuId === item.id);
              return (
                <div key={item.id} className="glass p-4 rounded-2xl border-slate-800 flex justify-between items-center hover:border-slate-700 transition-all group">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold group-hover:text-cyan-400 transition-colors">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><Minus size={12} /></button>
                        <span className="font-bold text-xs w-4 text-center text-cyan-500">{inCart.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400"><Plus size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout Sidebar */}
        <div className="xl:col-span-3">
          <div className="glass rounded-[2rem] border border-slate-800 p-8 sticky top-6 space-y-6 shadow-2xl">
            <h3 className="font-bold text-[10px] tracking-widest uppercase border-b border-slate-800 pb-4 text-slate-500 flex items-center justify-between">
              Order Summary
              <span className={`px-2 py-0.5 rounded text-[8px] border ${orderType === OrderType.DINE_IN ? 'border-cyan-500/30 text-cyan-500' : 'border-pink-500/30 text-pink-500'}`}>
                {orderType}
              </span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Target</span>
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {orderType === OrderType.DINE_IN 
                    ? (selectedTable ? `MEJA ${selectedTable}` : 'PILIH MEJA') 
                    : 'BAWA PULANG'}
                </span>
              </div>
              
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 && (
                   <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl opacity-40">
                      <p className="text-[10px] uppercase font-bold tracking-widest">Keranjang Kosong</p>
                   </div>
                )}
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-[11px] animate-in slide-in-from-right-2 border-b border-slate-800/30 pb-2">
                    <p className="flex-1 text-slate-300">
                      <span className="text-cyan-500 font-bold mr-1">{item.quantity}x</span> {item.name}
                    </p>
                    <p className="font-mono text-slate-500">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Total Bill</span>
                <span className="text-xl font-bold font-mono text-white">
                  Rp {cart.reduce((a,c) => a + (c.price*c.quantity), 0).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={handleSubmitOrder}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[10px] ${
                  canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/30 hover:scale-[1.02]'
                    : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  isAppending ? <ListPlus size={16} /> : <Send size={16} />
                )}
                {isSubmitting ? 'MEMPROSES...' : (isAppending ? `TAMBAH MENU M${selectedTable}` : `KIRIM KE KASIR`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterView;
