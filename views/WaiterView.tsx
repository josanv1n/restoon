
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, MenuItem, OrderItem } from '../types';
import { MapPin, Send, Plus, Minus, Search, ListPlus, Loader2, ShoppingBag, LayoutGrid, Utensils } from 'lucide-react';

interface WaiterViewProps {
  menu: MenuItem[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  tablesCount: number;
}

const WaiterView: React.FC<WaiterViewProps> = ({ menu, orders, onPlaceOrder, tablesCount }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableStatus = Array.from({ length: tablesCount }, (_, i) => {
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
          body: JSON.stringify({ id: currentOrder.id, items: updatedItems, total: updatedTotal })
        });
        if (res.ok) {
          setCart([]);
          setSelectedTable(null);
          window.dispatchEvent(new CustomEvent('refreshData'));
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
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Waiter System</h2>
          <p className="text-xs md:text-sm text-slate-500">Terminal input pesanan pelayan</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 shadow-xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => { setOrderType(OrderType.DINE_IN); setSelectedTable(null); }}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold transition-all tracking-widest whitespace-nowrap flex-1 ${orderType === OrderType.DINE_IN ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <LayoutGrid size={12} /> DINE-IN
          </button>
          <button 
            onClick={() => { setOrderType(OrderType.TAKEAWAY); setSelectedTable(null); }}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold transition-all tracking-widest whitespace-nowrap flex-1 ${orderType === OrderType.TAKEAWAY ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <ShoppingBag size={12} /> TAKEAWAY
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Table Selection */}
        <div className={`lg:col-span-3 space-y-4 ${orderType === OrderType.TAKEAWAY ? 'opacity-20 pointer-events-none' : ''}`}>
          <h3 className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
            <MapPin size={12} className="text-cyan-500" /> Pilih Meja
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2 md:gap-3">
            {tableStatus.map((table) => (
              <button 
                key={table.number}
                onClick={() => setSelectedTable(table.number)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl md:rounded-2xl border transition-all relative ${
                  selectedTable === table.number 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg'
                    : table.activeOrder 
                      ? 'bg-slate-900 border-cyan-500/40 text-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <span className="text-sm md:text-xl font-bold font-mono">M{table.number}</span>
                {table.activeOrder && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Selection - Menghapus max-h pada mobile agar mengikuti scroll halaman utama */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-cyan-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2 lg:max-h-[60vh] lg:overflow-y-auto pr-1 custom-scrollbar">
            {menu.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
              const inCart = cart.find(c => c.menuId === item.id);
              return (
                <div key={item.id} className="glass p-4 rounded-xl border-slate-800 flex justify-between items-center group">
                  <div className="overflow-hidden flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-700 shrink-0">
                      <Utensils size={14} />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold truncate text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-cyan-500 font-mono font-bold">Rp {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
                        <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-500"><Minus size={12} /></button>
                        <span className="font-bold text-xs w-4 text-center text-cyan-500">{inCart.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-slate-800 rounded text-cyan-400"><Plus size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-600 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl lg:sticky lg:top-10">
            <h3 className="font-bold text-[10px] tracking-widest uppercase border-b border-slate-800 pb-4 text-slate-500 flex items-center justify-between">
              Order Summary
              <span className={`px-2 py-0.5 rounded text-[8px] border ${orderType === OrderType.DINE_IN ? 'border-cyan-500/30 text-cyan-500' : 'border-pink-500/30 text-pink-500'}`}>
                {orderType}
              </span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Target</span>
                <span className="text-xs md:text-sm font-mono font-bold text-cyan-400">
                  {orderType === OrderType.DINE_IN ? (selectedTable ? `M${selectedTable}` : '---') : 'TAKEAWAY'}
                </span>
              </div>
              
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-[10px] border-b border-slate-800/30 pb-2">
                    <p className="flex-1 text-slate-300 truncate mr-2">
                      <span className="text-cyan-500 font-bold">{item.quantity}x</span> {item.name}
                    </p>
                    <p className="font-mono text-slate-500 shrink-0">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Total Bill</span>
                <span className="text-lg md:text-xl font-bold font-mono text-white">
                  Rp {cart.reduce((a,c) => a + (c.price*c.quantity), 0).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={handleSubmitOrder}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[10px] ${
                  canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white'
                    : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : (isAppending ? <ListPlus size={14} /> : <Send size={14} />)}
                {isSubmitting ? '...' : (isAppending ? `TAMBAH MENU M${selectedTable}` : `KIRIM KE KASIR`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterView;
