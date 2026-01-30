
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
        setOrders(Array.isArray(data) ? data : []);
      }
      if (menuRes.ok) {
        const remoteMenu = await menuRes.json();
        if (remoteMenu && Array.isArray(remoteMenu)) setMenu(remoteMenu);
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

  // Initialize System
  useEffect(() => {
    const initSystem = async () => {
      setLoading(true);
      try {
        await fetch('/api/setup'); // Auto-heal database
        await fetchData(true);
      } catch (e) {
        console.error("Init failed");
        fetchData(true);
      }
    };
    
    initSystem();

    const interval = setInterval(() => fetchData(), 3000); 
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save order");
      }
      await fetchData();
    } catch (err: any) {
      alert("ERROR SISTEM: " + err.message);
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

  const renderRoleView = () => {
    switch (activeRole) {
      case UserRole.GUEST: 
        return <HomeView menu={menu} onLoginClick={() => setShowLogin(true)} onOrderOnline={() => setActiveRole(UserRole.CUSTOMER)} activeSubPage={homeSubPage} onSetSubPage={setHomeSubPage} />;
      case UserRole.CUSTOMER: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><CustomerView menu={menu} onPlaceOrder={handlePlaceOrder} existingOrders={orders} /></Layout>;
      case UserRole.PELAYAN: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><WaiterView menu={menu} orders={orders} onPlaceOrder={handlePlaceOrder} onUpdateStatus={() => {}} /></Layout>;
      case UserRole.KASIR: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><CashierView orders={orders} onProcessPayment={handleProcessPayment} /></Layout>;
      case UserRole.ADMIN: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><AdminView menu={menu} onMenuUpdate={() => fetchData(true)} settings={settings} /></Layout>;
      case UserRole.MANAGEMENT: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><ManagementView orders={orders} /></Layout>;
      default: 
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {syncing && (
        <div className="fixed top-6 right-6 z-[100] glass px-3 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2 text-cyan-400 text-[9px] font-bold animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> LIVE SYNC
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-950">
           <Loader2 size={48} className="animate-spin text-cyan-500" />
           <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Syncing with Neon DB...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">{renderRoleView()}</div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowLogin(false)}></div>
          <div className="relative glass w-full max-w-md p-10 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2"><X size={24} /></button>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold neon-text-cyan">Crew Access</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Authorized Personnel Only</p>
            </div>
            <div className="grid gap-3 pt-4">
              {[UserRole.PELAYAN, UserRole.KASIR, UserRole.ADMIN, UserRole.MANAGEMENT].map(role => (
                <button 
                  key={role} 
                  onClick={() => { setActiveRole(role); setShowLogin(false); }} 
                  className="w-full py-4 px-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-left font-bold transition-all flex justify-between items-center group"
                >
                  <span className="text-slate-400 group-hover:text-white uppercase text-xs tracking-widest">{role} System</span>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
