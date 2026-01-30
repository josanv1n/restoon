
import React, { useState, useEffect } from 'react';
import { UserRole, Order, OrderStatus, PaymentMethod, MenuItem, AppSettings } from './types';
import { INITIAL_MENU } from './constants';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CustomerView from './views/CustomerView';
import WaiterView from './views/WaiterView';
import CashierView from './views/CashierView';
import AdminView from './views/AdminView';
import ManagementView from './views/ManagementView';
import { Loader2, Megaphone, X, ChevronRight } from 'lucide-react';

type GuestView = 'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.GUEST);
  const [guestView, setGuestView] = useState<GuestView>('LANDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [orderRes, menuRes, settingsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu'),
        fetch('/api/settings')
      ]);
      
      if (orderRes.ok) setOrders(await orderRes.json());
      if (menuRes.ok) {
        const remoteMenu = await menuRes.json();
        if (remoteMenu && remoteMenu.length > 0) {
          setMenu(remoteMenu);
        }
      }
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    setLoading(true);
    try {
      const origin = activeRole === UserRole.CUSTOMER ? 'ONLINE' : 'OFFLINE';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOrder, origin })
      });
      if (res.ok) {
        setOrders(prev => [newOrder, ...prev]);
        fetchInitialData(); 
      }
    } catch (err) {
      alert("Gagal mengirim pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleProcessPayment = async (orderId: string, method: PaymentMethod) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: orderId, 
          status: OrderStatus.PAID, 
          paymentStatus: 'PAID', 
          paymentMethod: method 
        })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          paymentStatus: 'PAID', 
          status: OrderStatus.PAID,
          paymentMethod: method 
        } : o));
      }
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const handleLogin = (role: UserRole) => {
    setActiveRole(role);
    setShowLogin(false);
    setGuestView('LANDING'); // Reset guest view
  };

  const renderActiveView = () => {
    switch (activeRole) {
      case UserRole.CUSTOMER:
        return <CustomerView menu={menu} onPlaceOrder={handlePlaceOrder} existingOrders={orders} />;
      case UserRole.PELAYAN:
        return <WaiterView menu={menu} orders={orders} onPlaceOrder={handlePlaceOrder} onUpdateStatus={handleUpdateOrderStatus} />;
      case UserRole.KASIR:
        return <CashierView orders={orders} onProcessPayment={handleProcessPayment} />;
      case UserRole.ADMIN:
        return <AdminView menu={menu} onMenuUpdate={fetchInitialData} settings={settings} />;
      case UserRole.MANAGEMENT:
        return <ManagementView orders={orders} />;
      default:
        return null;
    }
  };

  if (activeRole === UserRole.GUEST) {
    return (
      <>
        <HomeView 
          menu={menu} 
          onLoginClick={() => setShowLogin(true)} 
          onOrderOnline={() => handleLogin(UserRole.CUSTOMER)}
          activeSubPage={guestView}
          onSetSubPage={setGuestView}
        />
        
        {showLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowLogin(false)}></div>
            <div className="relative glass w-full max-w-md p-10 rounded-[2.5rem] border border-slate-800 space-y-8 animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border mx-auto mb-6 shadow-cyan-500/20">
                  <span className="font-bold text-3xl text-white">R</span>
                </div>
                <h2 className="text-2xl font-bold neon-text-cyan">Resto-On System</h2>
                <p className="text-slate-500 text-sm">Otentikasi Akses BAGINDO RAJO</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { role: UserRole.PELAYAN, label: 'Crew: Waiter / Pelayan', color: 'border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5' },
                  { role: UserRole.KASIR, label: 'Crew: Kasir', color: 'border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5' },
                  { role: UserRole.ADMIN, label: 'Manager: Administrator', color: 'border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/5' },
                  { role: UserRole.MANAGEMENT, label: 'Owner: Management', color: 'border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5' },
                ].map((btn) => (
                  <button 
                    key={btn.role}
                    onClick={() => handleLogin(btn.role)}
                    className={`w-full py-4 px-6 rounded-2xl border ${btn.color} text-left font-bold transition-all group flex items-center justify-between`}
                  >
                    <span className="text-slate-300 group-hover:text-white transition-colors">{btn.label}</span>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}>
      <div className="relative">
        {settings?.promoText && activeRole === UserRole.CUSTOMER && (
          <div className="mb-8 glass bg-cyan-500/10 border-cyan-500/20 p-4 rounded-2xl flex items-center gap-4 text-cyan-400 animate-pulse">
            <Megaphone size={24} />
            <p className="font-bold uppercase tracking-widest text-sm">{settings.promoText}</p>
          </div>
        )}

        {loading && (
          <div className="fixed top-6 right-6 z-[100] glass px-4 py-2 rounded-full border border-cyan-500/30 flex items-center gap-2 text-cyan-400 text-xs font-bold animate-pulse">
            <Loader2 size={14} className="animate-spin" /> LIVE SYNC ACTIVE...
          </div>
        )}
        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
          {renderActiveView()}
        </div>
      </div>
    </Layout>
  );
};

export default App;
