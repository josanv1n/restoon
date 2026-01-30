
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'STAFF' | 'CUSTOMER' | 'REGISTER'>('STAFF');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

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

  useEffect(() => {
    const initSystem = async () => {
      setLoading(true);
      try {
        await fetch('/api/setup');
        await fetchData(true);
      } catch (e) { fetchData(true); }
    };
    initSystem();
    const interval = setInterval(() => fetchData(), 7000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock Login Logic (Ideally call /api/auth)
      const res = await fetch('/api/setup'); // Quick ping to check if setup is run
      
      if (loginMode === 'STAFF') {
        // Staff validation logic usually goes to a real endpoint, but for this demo:
        // Admin: admin / admin123
        if (username === 'admin' && password === 'admin123') {
           setCurrentUser({ name: 'Super Admin', username: 'admin' });
           setActiveRole(UserRole.ADMIN);
        } else if (username === 'pelayan1' && password === '12345') {
           setCurrentUser({ name: 'Budi Waiter', username: 'pelayan1' });
           setActiveRole(UserRole.PELAYAN);
        } else if (username === 'kasir1' && password === '12345') {
           setCurrentUser({ name: 'Siti Cashier', username: 'kasir1' });
           setActiveRole(UserRole.KASIR);
        } else {
           alert("Username/Password Staff Salah!");
           setLoading(false);
           return;
        }
      } else {
        // Customer Login (Demo)
        setCurrentUser({ name: username || 'Customer', email: username });
        setActiveRole(UserRole.CUSTOMER);
      }
      
      setShowLogin(false);
      setUsername(''); setPassword('');
    } catch (err) { alert("Login Error"); }
    finally { setLoading(false); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Pendaftaran Berhasil! Silakan Login.");
    setLoginMode('CUSTOMER');
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    setLoading(true);
    try {
      const payload = { ...newOrder, customerId: currentUser?.email };
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
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><AdminView menu={menu} onMenuUpdate={() => fetchData(true)} settings={settings} /></Layout>;
      case UserRole.MANAGEMENT: 
        return <Layout activeRole={activeRole} onRoleChange={setActiveRole} onLogout={() => setActiveRole(UserRole.GUEST)}><ManagementView orders={orders} /></Layout>;
      default: return null;
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
           <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Processing RESTO-ON OS...</p>
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
                {loginMode === 'STAFF' ? 'Secure Terminal' : loginMode === 'REGISTER' ? 'Join Bagindo' : 'Welcome Back'}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {loginMode === 'STAFF' ? 'Authorized Personnel Only' : 'Order food online with special rewards'}
              </p>
            </div>

            <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => setLoginMode('STAFF')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${loginMode === 'STAFF' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500'}`}>STAFF LOGIN</button>
              <button onClick={() => setLoginMode('CUSTOMER')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${loginMode === 'CUSTOMER' || loginMode === 'REGISTER' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}>CUSTOMER</button>
            </div>

            <form onSubmit={loginMode === 'REGISTER' ? handleRegister : handleLogin} className="space-y-5">
              {loginMode === 'REGISTER' ? (
                <>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="text" required placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="email" required placeholder="Email Address" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                  </div>
                </>
              ) : (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input type="text" required placeholder={loginMode === 'STAFF' ? "Username" : "Email"} value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-cyan-500 transition-all text-sm" />
                </div>
              )}
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-cyan-500 transition-all text-sm" />
              </div>

              <button type="submit" className={`w-full py-5 rounded-2xl text-white font-bold shadow-xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 ${loginMode === 'STAFF' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-pink-600 to-rose-700 shadow-pink-500/20'}`}>
                {loginMode === 'REGISTER' ? 'Create Account' : 'Authenticate Session'}
                <ChevronRight size={18} />
              </button>
            </form>
            
            <div className="text-center pt-4">
              {loginMode === 'STAFF' ? (
                <div className="flex items-center gap-2 justify-center text-slate-600 text-[10px] font-bold italic">
                   <Info size={12} /> DEFAULT: admin / admin123
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  {loginMode === 'REGISTER' ? 'Sudah punya akun?' : 'Belum punya akun?'} 
                  <button 
                    onClick={() => setLoginMode(loginMode === 'REGISTER' ? 'CUSTOMER' : 'REGISTER')}
                    className="ml-2 text-pink-400 font-bold hover:underline"
                  >
                    {loginMode === 'REGISTER' ? 'Login Disini' : 'Daftar Sekarang'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
