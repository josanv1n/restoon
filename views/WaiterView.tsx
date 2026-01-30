
import React from 'react';
import { Order, OrderStatus, OrderType } from '../types';
import { TABLES_COUNT } from '../constants';
import { Coffee, CheckCircle2, Clock, MapPin, Send } from 'lucide-react';

interface WaiterViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const WaiterView: React.FC<WaiterViewProps> = ({ orders, onUpdateStatus }) => {
  const tableStatus = Array.from({ length: TABLES_COUNT }, (_, i) => {
    const tableNum = i + 1;
    const activeOrder = orders.find(o => o.tableNumber === tableNum && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
    return {
      number: tableNum,
      activeOrder
    };
  });

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING || o.status === OrderStatus.SERVED);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold neon-text-cyan">Dashboard Pelayan</h2>
        <p className="text-slate-400">Monitor meja dan sajikan hidangan tepat waktu</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="text-pink-500" size={20} /> Status Meja
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {tableStatus.map((table) => (
              <div 
                key={table.number}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all ${
                  table.activeOrder 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 neon-border' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-lg font-bold">M{table.number}</span>
                <span className="text-[10px] uppercase font-bold">{table.activeOrder ? 'Berisi' : 'Kosong'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-cyan-500" size={20} /> Pesanan Aktif
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.length === 0 ? (
              <div className="col-span-2 glass p-10 rounded-3xl text-center text-slate-500 border-dashed border-2 border-slate-800">
                Belum ada pesanan yang masuk
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="glass p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          order.type === OrderType.DINE_IN ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {order.type === OrderType.DINE_IN ? `Meja ${order.tableNumber}` : 'Bawa Pulang'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          order.status === OrderStatus.PENDING ? 'bg-yellow-500/20 text-yellow-500' : 
                          order.status === OrderStatus.PREPARING ? 'bg-orange-500/20 text-orange-500' : 
                          'bg-green-500/20 text-green-500'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mt-2">Order #{order.id.slice(-4)}</h4>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 py-2 border-y border-slate-800/50">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-300"><span className="font-mono text-cyan-400">{item.quantity}x</span> {item.name}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2">
                    {order.status === OrderStatus.PENDING && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)}
                        className="flex-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 py-2 rounded-xl text-sm font-bold hover:bg-orange-500 hover:text-white transition-all"
                      >
                        Mulai Masak
                      </button>
                    )}
                    {order.status === OrderStatus.PREPARING && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.SERVED)}
                        className="flex-1 bg-green-500/10 text-green-400 border border-green-500/30 py-2 rounded-xl text-sm font-bold hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Send size={14} /> Sajikan
                      </button>
                    )}
                    {order.status === OrderStatus.SERVED && (
                      <div className="flex-1 bg-cyan-500/5 text-cyan-400/50 border border-cyan-500/10 py-2 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} /> Sudah Disajikan
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterView;
