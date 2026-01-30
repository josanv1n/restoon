
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, MenuItem, OrderItem } from '../types';
import { TABLES_COUNT } from '../constants';
import { Coffee, MapPin, Send, Plus, Minus, Search, ListPlus, Loader2 } from 'lucide-react';

interface WaiterViewProps {
  menu: MenuItem[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const WaiterView: React.FC<WaiterViewProps> = ({ menu, orders, onPlaceOrder }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
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
        // Gabungkan menu baru ke pesanan meja yang sudah ada
        const currentOrder = selectedTableData.activeOrder;
        const updatedItems = [...currentOrder.items, ...cart];
        const updatedTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        
        const res = await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentOrder.id, items: updatedItems, total: updatedTotal })
        });
        if (res.ok) {
          alert(`Berhasil menambahkan menu ke Meja ${selectedTable}`);
          setCart([]);
          setSelectedTable(null);
          window.dispatchEvent(new CustomEvent('refreshData'));
        }
      } else {
        // Buat billing baru untuk meja ini
        const newOrder: Order = {
          id: `ORD-${Date.now()}`,
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
      alert("Gagal mengirim pesanan ke kasir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Pelayan: Entry Pesanan</h2>
        <p className="text-slate-400">Pilih meja dan catat menu pesanan pelanggan</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Pilihan Meja */}
        <div className="xl:col-span-3 space-y-6">
          <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
            <MapPin size={14} className="text-cyan-500" /> Pilih Nomor Meja
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {tableStatus.map((table) => (
              <button 
                key={table.number}
                onClick={() => setSelectedTable(table.number)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all relative ${
                  selectedTable === table.number 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/40 z-10 scale-105'
                    : table.activeOrder 
                      ? 'bg-slate-900/80 border-cyan-500/40 text-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span className="text-xl font-bold font-mono">M{table.number}</span>
                <span className="text-[8px] uppercase font-bold mt-1 opacity-60">
                  {table.activeOrder ? 'Occupied' : 'Empty'}
                </span>
                {table.activeOrder && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Menu */}
        <div className="xl:col-span-6 space-y-6">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-slate-500">
              <Coffee size={14} className="text-cyan-500" /> Daftar Menu Bagindo
            </h3>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Cari masakan..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-cyan-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {menu.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
              const inCart = cart.find(c => c.menuId === item.id);
              return (
                <div key={item.id} className="glass p-4 rounded-2xl border-slate-800 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-[10px] text-cyan-500 font-mono">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => removeFromCart(item.id)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><Minus size={12} /></button>
                        <span className="font-bold text-xs w-4 text-center">{inCart.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400"><Plus size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-cyan-400"><Plus size={18} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Billing */}
        <div className="xl:col-span-3">
          <div className="glass rounded-[2rem] border border-slate-800 p-8 sticky top-6 space-y-6">
            <h3 className="font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-4">Draft Tagihan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Target Meja</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{selectedTable ? `MEJA ${selectedTable}` : '--'}</span>
              </div>
              
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs animate-in slide-in-from-right-2">
                    <p className="flex-1"><span className="text-cyan-500 font-bold mr-1">{item.quantity}x</span> {item.name}</p>
                    <p className="font-mono text-slate-400">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Input</span>
                <span className="text-xl font-bold font-mono text-white">
                  Rp {cart.reduce((a,c) => a + (c.price*c.quantity), 0).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={handleSubmitOrder}
                disabled={!selectedTable || cart.length === 0 || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  selectedTable && cart.length > 0 && !isSubmitting
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]'
                    : 'bg-slate-900 text-slate-700 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isAppending ? <ListPlus size={18} /> : <Send size={18} />)}
                {isSubmitting ? 'MENGIRIM...' : (isAppending ? `UPDATE MEJA ${selectedTable}` : `KIRIM KE KASIR`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterView;
