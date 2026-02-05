
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Order, OrderStatus, PaymentMethod, MenuItem, AppSettings, UserAccount, Customer } from './types';
import { INITIAL_MENU, LOGO_URL } from './constants';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CustomerView from './views/CustomerView';
import WaiterView from './views/WaiterView';
import CashierView from './views/CashierView';
import AdminView from './views/AdminView';
import ManagementView from './views/ManagementView';
// FIX: Added 'LogIn' to the lucide-react imports to resolve the reference error in the registration view.
import { Loader2, X, ChevronRight, User as UserIcon, Lock, Key, Mail, Phone, Info, UserPlus, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.GUEST);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [homeSubPage, setHomeSubPage] = useState<'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT'>('LANDING');
  
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
  const [regPhone, setRegPhone] = useState('');

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
      setTimeout(() => setSyncing(false), 800);
      isFetchingRef.current = false;
    }
  }, [menu.length]);

  useEffect(() => {
    fetchData(true);
    const runSetup = async () => {
      try { await fetch('/api/setup'); } catch (e) {}
    };
    runSetup();
    const interval = setInterval(() => fetchData(), 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, type: loginMode === 'STAFF' ? 'STAFF' : 'CUSTOMER' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = { ...data.user, role: data.user.role || UserRole.CUSTOMER };
        setCurrentUser(user);
        setActiveRole(user.role);
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: password,
          phone: regPhone
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Pendaftaran Berhasil! Silakan Login.");
        setLoginMode('CUSTOMER');
        setUsername(regEmail);
      } else {
        alert("REGISTRASI GAGAL: " + data.error);
      }
    } catch (err) { 
      alert("Registrasi Gagal: Kesalahan jaringan."); 
    } finally { 
      setLoading(false); 
    }
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

  const tablesCount = Number(settings?.tablesCount) || 12;

  const renderRoleView = () => {
    if (activeRole === UserRole.GUEST) {
      return <HomeView menu={menu} onLoginClick={() => { setLoginMode('STAFF'); setShowLogin(true); }} onOrderOnline={() => { setLoginMode('CUSTOMER'); setShowLogin(true); }} activeSubPage={homeSubPage} onSetSubPage={setHomeSubPage} />;
    }

    return (
      <Layout 
        activeRole={activeRole} 
        loggedRole={currentUser?.role || UserRole.CUSTOMER}
        onRoleChange={setActiveRole} 
        onLogout={() => { setActiveRole(UserRole.GUEST); setCurrentUser(null); }}
      >
        {activeRole === UserRole.CUSTOMER && <CustomerView menu={menu} onPlaceOrder={handlePlaceOrder} existingOrders={orders} tablesCount={tablesCount} />}
        {activeRole === UserRole.PELAYAN && <WaiterView menu={menu} orders={orders} onPlaceOrder={handlePlaceOrder} onUpdateStatus={() => {}} tablesCount={tablesCount} />}
        {activeRole === UserRole.KASIR && <CashierView orders={orders} onProcessPayment={handleProcessPayment} />}
        {activeRole === UserRole.ADMIN && <AdminView menu={menu} onMenuUpdate={() => fetchData()} settings={settings} />}
        {activeRole === UserRole.MANAGEMENT && <ManagementView orders={orders} />}
      </Layout>
    );
  };

  return (
    <div className="relative min-h-screen">
      {syncing && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/20 flex items-center gap-2 text-cyan-400 text-[8px] font-bold shadow-lg animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div> SYNCING
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-950">
           <Loader2 size={40} className="animate-spin text-cyan-500" />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Resto-On System Booting...</p>
        </div>
      ) : renderRoleView()}

      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setShowLogin(false)}></div>
          <div className="relative glass w-full max-w-lg p-12 rounded-[3rem] border border-slate-800 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setShowLogin(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2"><X size={24} /></button>
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-cyan-500/5 rounded-3xl flex items-center justify-center mx-auto border border-cyan-500/10 shadow-2xl mb-2 overflow-hidden bg-slate-900">
                 <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
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
              {loginMode === 'REGISTER' && (
                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" required placeholder="Nama Lengkap" value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="tel" placeholder="Nomor Telepon (Opsional)" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 transition-all text-sm" />
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type={loginMode === 'REGISTER' ? "email" : "text"} 
                  required 
                  placeholder={loginMode === 'STAFF' ? "Username" : "Email Address"} 
                  value={loginMode === 'REGISTER' ? regEmail : username} 
                  onChange={e => loginMode === 'REGISTER' ? setRegEmail(e.target.value) : setUsername(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none transition-all text-sm ${loginMode === 'STAFF' ? 'focus:border-cyan-500' : 'focus:border-pink-500'}`} 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  required 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none transition-all text-sm ${loginMode === 'STAFF' ? 'focus:border-cyan-500' : 'focus:border-pink-500'}`} 
                />
              </div>

              <button type="submit" className={`w-full py-5 rounded-2xl text-white font-bold shadow-xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 ${loginMode === 'STAFF' ? 'bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-pink-600 to-rose-700 shadow-pink-500/20'}`}>
                {loginMode === 'REGISTER' ? 'DAFTAR AKUN BARU' : 'LOGIN (Masuk)'}
                <ChevronRight size={18} />
              </button>
            </form>
            
            {/* Link Registrasi Baru */}
            {loginMode === 'CUSTOMER' && (
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Belum punya akun?</p>
                <button 
                  onClick={() => setLoginMode('REGISTER')}
                  className="flex items-center gap-2 mx-auto text-pink-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                >
                  <UserPlus size={14} /> Daftar Sekarang
                </button>
              </div>
            )}

            {loginMode === 'REGISTER' && (
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Sudah punya akun?</p>
                <button 
                  onClick={() => setLoginMode('CUSTOMER')}
                  className="flex items-center gap-2 mx-auto text-cyan-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                >
                  <LogIn size={14} /> Kembali ke Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
