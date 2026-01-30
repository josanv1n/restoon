
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, MenuItem, OrderItem } from '../types';
import { TABLES_COUNT } from '../constants';
import { Coffee, CheckCircle2, Clock, MapPin, Send, Plus, Minus, Search, ListPlus, Loader2 } from 'lucide-react';

interface WaiterViewProps {
  menu: MenuItem[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const WaiterView: React.FC<WaiterViewProps> = ({ menu, orders, onPlaceOrder, onUpdateStatus }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active orders (unpaid) to determine table occupancy
  const tableStatus = Array.from({ length: TABLES_COUNT }, (_, i) => {
    const tableNum = i + 1;
    const activeOrder = orders.find(o => 
      o.tableNumber === tableNum && 
      o.paymentStatus === 'UNPAID' && 
      (o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING || o.status === OrderStatus.SERVED)
    );
    return {
      number: tableNum,
      activeOrder
    };
  });

  const selectedTableData = selectedTable ? tableStatus.find(t => t.number === selectedTable) : null;
  const isAppending = !!selectedTableData?.activeOrder;

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

  const handleSubmitOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
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
          alert(`Pesanan Meja ${selectedTable} Berhasil Ditambahkan.`);
          setCart([]);
          setSelectedTable(null);
          // Instead of reload, trigger a global refresh via status change or similar mechanism if needed
          // For now, we rely on the parent's recurring sync or manual refresh
          window.dispatchEvent(new CustomEvent('refreshData'));
        }
      } else {
        const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9),
          type: OrderType.DINE_IN,
          tableNumber: selectedTable,
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
    } catch (err) {
      alert("Gagal memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Pelayan: Command Center</h2>
          <p className="text-slate-400">Catat pesanan meja & Sinkronisasi billing kasir</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl tracking-widest text-emerald-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            CONNECTED TO KASIR
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
            <MapPin size={14} className="text-cyan-500" /> Status Meja
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {tableStatus.map((table) => (
              <button 
                key={table.number}
                disabled={isSubmitting}
                onClick={() => setSelectedTable(table.number)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all relative overflow-hidden group ${
                  selectedTable === table.number 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/40 z-10 scale-105'
                    : table.activeOrder 
                      ? 'bg-slate-900/80 border-cyan-500/40 text-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span className="text-xl font-bold font-mono">M{table.number}</span>
                <span className="text-[8px] uppercase font-bold tracking-tighter mt-1 opacity-60">
                  {table.activeOrder ? 'Occupied' : 'Available'}
                </span>
                {table.activeOrder && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
              <Coffee size={14} className="text-cyan-500" /> Input Menu
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Cari menu Bagindo..." 
                className="w-full md:w-64 bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-cyan-500 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
            {menu.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
              const inCart = cart.find(c => c.menuId === item.id);
              return (
                <div key={item.id} className="glass p-4 rounded-2xl border-slate-800 flex justify-between items-center group hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.02]">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold group-hover:text-cyan-400 transition-colors">{item.name}</p>
                    <p className="text-[10px] text-cyan-500/80 font-mono tracking-tighter">Rp {item.price.toLocaleString()}</p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><Minus size={12} /></button>
                      <span className="font-bold text-xs w-5 text-center">{inCart.quantity}</span>
                      <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400"><Plus size={12} /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-inner"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="glass rounded-[2.5rem] border border-slate-800 p-8 sticky top-6 space-y-6 shadow-2xl shadow-cyan-500/5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-sm tracking-widest uppercase">Billing Entry</h3>
              {selectedTable && (
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${isAppending ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isAppending ? 'Appending' : 'New Order'}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Target Meja</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{selectedTable ? `MEJA ${selectedTable}` : 'SELECT TABLE'}</span>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border-b border-slate-800/50 pb-4">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-xs animate-in slide-in-from-right-2">
                      <p className="flex-1"><span className="text-cyan-500 font-mono font-bold mr-1">{item.quantity}x</span> {item.name}</p>
                      <p className="font-mono text-slate-400">Rp {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Subtotal Entry</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tighter">
                  Rp {cart.reduce((a,c) => a + (c.price*c.quantity), 0).toLocaleString()}
                </span>
              </div>
              
              <button 
                onClick={handleSubmitOrder}
                disabled={!selectedTable || cart.length === 0 || isSubmitting}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                  selectedTable && cart.length > 0 && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02]'
                    : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isAppending ? <ListPlus size={18} /> : <Send size={18} />)}
                {isSubmitting ? 'SENDING...' : (isAppending ? `UPDATE MEJA ${selectedTable}` : `KIRIM KE KASIR`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterView;
