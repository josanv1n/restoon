
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Order, OrderStatus, PaymentMethod, MenuItem, AppSettings } from './types';
import { INITIAL_MENU } from './constants';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CustomerView from './views/CustomerView';
import WaiterView from './views/WaiterView';
import CashierView from './views/CashierView';
import AdminView from './views/AdminView';
import ManagementView from './views/ManagementView';
import { Loader2, X, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.GUEST);
  const [homeSubPage, setHomeSubPage] = useState<'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT'>('LANDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (isFullLoad = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isFullLoad) setLoading(true);
    else setSyncing(true);
    
    try {
      const [orderRes, menuRes, settingsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu'),
        fetch('/api/settings')
      ]);
      
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(data);
      }
      if (menuRes.ok) {
        const remoteMenu = await menuRes.json();
        if (remoteMenu && remoteMenu.length > 0) setMenu(remoteMenu);
      }
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData();
    }, 15000); 

    const handleRefresh = () => fetchData();
    window.addEventListener('refreshData', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshData', handleRefresh);
    };
  }, [fetchData]);

  const handlePlaceOrder = async (newOrder: Order) => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) await fetchData();
    } catch (err) {
      alert("Gagal mengirim pesanan.");
    } finally {
      setLoading(false);
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
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const renderActiveView = () => {
    switch (activeRole) {
      case UserRole.CUSTOMER: return <CustomerView menu={menu} onPlaceOrder={handlePlaceOrder} existingOrders={orders} />;
      case UserRole.PELAYAN: return <WaiterView menu={menu} orders={orders} onPlaceOrder={handlePlaceOrder} onUpdateStatus={() => {}} />;
      case UserRole.KASIR: return <CashierView orders={orders} onProcessPayment={handleProcessPayment} />;
      case UserRole.ADMIN: return <AdminView menu={menu} onMenuUpdate={() => fetchData(true)} settings={settings} />;
      case UserRole.MANAGEMENT: return <ManagementView orders={orders} />;
      default: return null;
    }
  };

  if (activeRole === UserRole.GUEST) {
    return (
      <HomeView 
        menu={menu} 
        onLoginClick={() => setShowLogin(true)} 
        onOrderOnline={() => setActiveRole(UserRole.CUSTOMER)}
        activeSubPage={homeSubPage}
        onSetSubPage={setHomeSubPage}
      />
    );
  }

  return (
    <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => { setActiveRole(UserRole.GUEST); setHomeSubPage('LANDING'); }}>
      <div className="relative">
        {syncing && (
          <div className="fixed top-6 right-6 z-[100] glass px-4 py-2 rounded-full border border-cyan-500/30 flex items-center gap-2 text-cyan-400 text-[10px] font-bold animate-pulse">
            <Loader2 size={12} className="animate-spin" /> SYNCING...
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
             <Loader2 size={48} className="animate-spin text-cyan-500" />
             <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Initializing System...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {renderActiveView()}
          </div>
        )}

        {showLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowLogin(false)}></div>
            <div className="relative glass w-full max-w-md p-10 rounded-[2.5rem] border border-slate-800 space-y-6">
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-slate-500"><X size={24} /></button>
              <h2 className="text-2xl font-bold neon-text-cyan text-center">Resto-On Login</h2>
              <div className="grid gap-3">
                {[UserRole.PELAYAN, UserRole.KASIR, UserRole.ADMIN, UserRole.MANAGEMENT].map(role => (
                  <button key={role} onClick={() => { setActiveRole(role); setShowLogin(false); }} className="w-full py-4 px-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 text-left font-bold transition-all flex justify-between items-center group">
                    <span className="text-slate-300 group-hover:text-white uppercase text-xs tracking-widest">{role}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
