
import React, { useState, useEffect } from 'react';
import { UserRole, Order, OrderStatus, PaymentMethod } from './types';
import Layout from './components/Layout';
import CustomerView from './views/CustomerView';
import WaiterView from './views/WaiterView';
import CashierView from './views/CashierView';
import AdminView from './views/AdminView';
import ManagementView from './views/ManagementView';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simplified for demo

  // Persistent mock data
  useEffect(() => {
    const savedOrders = localStorage.getItem('restoon_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restoon_orders', JSON.stringify(orders));
  }, [orders]);

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleProcessPayment = (orderId: string, method: PaymentMethod) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      paymentStatus: 'PAID', 
      status: OrderStatus.PAID,
      paymentMethod: method 
    } : o));
  };

  const renderActiveView = () => {
    switch (activeRole) {
      case UserRole.CUSTOMER:
        return <CustomerView onPlaceOrder={handlePlaceOrder} />;
      case UserRole.PELAYAN:
        return <WaiterView orders={orders} onUpdateStatus={handleUpdateOrderStatus} />;
      case UserRole.KASIR:
        return <CashierView orders={orders} onProcessPayment={handleProcessPayment} />;
      case UserRole.ADMIN:
        return <AdminView />;
      case UserRole.MANAGEMENT:
        return <ManagementView orders={orders} />;
      default:
        return <CustomerView onPlaceOrder={handlePlaceOrder} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass max-w-md w-full p-10 rounded-[2.5rem] border border-slate-800 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border mx-auto mb-6">
              <span className="font-bold text-3xl text-white">R</span>
            </div>
            <h1 className="text-3xl font-bold neon-text-cyan">Resto-On</h1>
            <p className="text-slate-500">Futuristic Restaurant OS</p>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Username" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
            <input type="password" placeholder="Password" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" />
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 py-4 rounded-2xl text-white font-bold shadow-xl shadow-cyan-500/20 hover:translate-y-[-2px] transition-all"
            >
              System Access
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-700 uppercase tracking-widest font-bold">Secure Environment v2.0.4</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeRole={activeRole} 
      onRoleChange={setActiveRole} 
      onLogout={() => setIsLoggedIn(false)}
    >
      <div className="animate-in fade-in slide-in-from-right-10 duration-500">
        {renderActiveView()}
      </div>
    </Layout>
  );
};

export default App;
