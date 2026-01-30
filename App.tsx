
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Order, OrderStatus, PaymentMethod, MenuItem, AppSettings, UserAccount, Customer } from './types';
import { INITIAL_MENU } from './constants';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CustomerView from './views/CustomerView';
import WaiterView from './views/WaiterView';
import CashierView from './views/CashierView';
import AdminView from './views/AdminView';
import ManagementView from './views/ManagementView';
import { Loader2, X, ChevronRight, User as UserIcon, Lock, Key, Mail, Phone, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.GUEST);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [homeSubPage, setHomeSubPage] = useState<'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT'>('LANDING');
  
  // Cache-First State: Load from localStorage if available
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restoon_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restoon_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });
  const [settings, setSettings] = useState<AppSettings | null>(() => {
    const saved = localStorage.getItem('restoon_settings');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'STAFF' | 'CUSTOMER' | 'REGISTER'>('STAFF');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isInitial && menu.length === 0) setLoading(true);
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
        localStorage.setItem('restoon_orders', JSON.stringify(data));
      }
      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenu(data);
        localStorage.setItem('restoon_menu', JSON.stringify(data));
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        localStorage.setItem('restoon_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
      isFetchingRef.current = false;
    }
  }, [menu.length]);

  useEffect(() => {
    // 1. Jalankan sinkronisasi data segera
    fetchData(true);

    // 2. Jalankan setup secara background (Non-blocking)
    // Hanya jika aplikasi belum pernah dijalankan sebelumnya (opsional)
    const runSetup = async () => {
      try { await fetch('/api/setup'); } catch (e) {}
    };
    runSetup();

    // 3. Polling interval lebih lama (15 detik) untuk mengurangi beban server
    const interval = setInterval(() => fetchData(), 15000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, type: loginMode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setActiveRole(data.user.role || UserRole.CUSTOMER);
        setShowLogin(false);
        setUsername('');
        setPassword('');
      } else {
        alert("LOGIN GAGAL: " + (data.error || "Kredensial tidak sesuai."));
      }
    } catch (err) {
      alert("Error Sistem: Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      alert("Pendaftaran Berhasil! Silakan Login.");
      setLoginMode('CUSTOMER');
    } catch (err) { alert("Registrasi Gagal"); }
    finally { setLoading(false); }
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    setLoading(true);
    try {
      const payload = { ...newOrder, customerId: currentUser?.email || currentUser?.username };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      await fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleProcessPayment = async (orderId: string, method: PaymentMethod) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, paymentStatus: 'PAID', paymentMethod: method })
      });
      if (res.ok) await fetchData();
    } catch (err) { console.error(err); }
  };

  const renderRoleView = () => {
    switch (activeRole) {
      case UserRole.GUEST: 
        return <HomeView menu={menu} onLoginClick={() => { setLoginMode('STAFF'); setShowLogin(true); }} onOrderOnline={() => { setLoginMode('CUSTOMER'); setShowLogin(true); }} activeSubPage={homeSubPage} onSetSubPage={setHomeSubPage} />;
      case UserRole.CUSTOMER: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><CustomerView menu={menu} onPlaceOrder={handlePlaceOrder} existingOrders={orders} /></Layout>;
      case UserRole.PELAYAN: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><WaiterView menu={menu} orders={orders} onPlaceOrder={handlePlaceOrder} onUpdateStatus={() => {}} /></Layout>;
      case UserRole.KASIR: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><CashierView orders={orders} onProcessPayment={handleProcessPayment} /></Layout>;
      case UserRole.ADMIN: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><AdminView menu={menu} onMenuUpdate={() => fetchData()} settings={settings} /></Layout>;
      case UserRole.MANAGEMENT: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><ManagementView orders={orders} /></Layout>;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {syncing && (
        <div className="fixed top-6 right-6 z-[100] glass px-3 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2 text-cyan-400 text-[9px] font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> LIVE SYNC
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-950">
           <Loader2 size={48} className="animate-spin text-cyan-500" />
           <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Initializing Protocol...</p>
        </div>
      ) : renderRoleView()}

      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setShowLogin(false)}></div>
          <div className="relative glass w-full max-w-lg p-12 rounded-[3rem] border border-slate-800 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowLogin(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2"><X size={24} /></button>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto border border-cyan-500/30 text-cyan-400 mb-2">
                 {loginMode === 'STAFF' ? <Key size={32} /> : <UserIcon size={32} />}
              </div>
              <h2 className="text-3xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">
                {loginMode === 'STAFF' ? 'Secure Terminal' : loginMode === 'REGISTER' ? 'Join Resto-On' : 'Auth Protocol'}
              </h2>
            </div>
            <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => setLoginMode('STAFF')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${loginMode === 'STAFF' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>STAFF</button>
              <button onClick={() => setLoginMode('CUSTOMER')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${loginMode === 'CUSTOMER' || loginMode === 'REGISTER' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}>CUSTOMER</button>
            </div>
            <form onSubmit={loginMode === 'REGISTER' ? handleRegister : handleLogin} className="space-y-5">
              {loginMode === 'REGISTER' ? (
                <>
                  <input type="text" required placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                  <input type="email" required placeholder="Email Address" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                </>
              ) : (
                <input type="text" required placeholder={loginMode === 'STAFF' ? "Username" : "Email"} value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-4 py-4 outline-none focus:border-cyan-500 transition-all text-sm" />
              )}
              <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-4 py-4 outline-none focus:border-cyan-500 transition-all text-sm" />
              <button type="submit" className={`w-full py-5 rounded-2xl text-white font-bold shadow-xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 ${loginMode === 'STAFF' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-pink-600 to-rose-700 shadow-pink-500/20'}`}>
                {loginMode === 'REGISTER' ? 'Register Now' : 'Initialize Session'}
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
