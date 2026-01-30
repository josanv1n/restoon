
import React, { useEffect, useState } from 'react';
import { MenuItem } from '../types';
import { ChefHat, MapPin, Phone, LogIn, ChevronRight, Star, Clock, ArrowLeft, Instagram, Twitter, Mail, Menu as MenuIcon, X, Plus } from 'lucide-react';

interface HomeViewProps {
  menu: MenuItem[];
  onLoginClick: () => void;
  onOrderOnline: () => void;
  activeSubPage: 'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT';
  onSetSubPage: (page: 'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ menu, onLoginClick, onOrderOnline, activeSubPage, onSetSubPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  }, [activeSubPage]);

  const navItems = [
    { label: 'Beranda', id: 'LANDING' as const },
    { label: 'Profil', id: 'PROFILE' as const },
    { label: 'Menu Favorit', id: 'FULL_MENU' as const },
    { label: 'Kontak', id: 'CONTACT' as const },
  ];

  const renderLanding = () => (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10"></div>
          {/* Hero background optimized to 800px width with 30% quality */}
          <img 
            src="https://images.unsplash.com/photo-1626074353765-517a681e40be?q=30&w=800&auto=format&fit=crop" 
            alt="Hero BG" 
            className="w-full h-full object-cover opacity-60 scale-105 will-change-transform"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              <Star size={12} className="fill-cyan-400" /> Authentic Minang
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter text-white">
              The Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 neon-text-cyan">Minang Cuisine.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
              Nikmati kelezatan <span className="text-cyan-400 font-bold">Rendang & Jengkol Balado</span> yang tersaji dengan estetika modern di <span className="text-white font-bold underline decoration-cyan-500">BAGINDO RAJO</span>.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onOrderOnline}
                className="px-8 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer group"
              >
                Pesan Sekarang <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase neon-text-cyan">Favorit Pelanggan</h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {menu.slice(0, 4).map((item) => (
              <div key={item.id} className="glass group p-0 rounded-[2.5rem] border-slate-800/50 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xl overflow-hidden" onClick={onOrderOnline}>
                <div className="relative h-48 overflow-hidden bg-slate-900">
                   <img 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={item.name} 
                    loading="lazy" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors leading-tight">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xl text-white">Rp {item.price.toLocaleString('id-ID')}</span>
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderFullMenu = () => (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => onSetSubPage('LANDING')} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shadow-lg">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-5xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Menu Digital</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menu.map((item) => (
          <div key={item.id} className="glass rounded-[2.5rem] border-slate-800/50 flex flex-col hover:bg-cyan-500/5 transition-all group shadow-xl overflow-hidden">
            <div className="relative h-56 overflow-hidden bg-slate-900">
               <img 
                src={item.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                alt={item.name} 
                loading="lazy"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
            </div>
            <div className="p-10 flex-1 flex flex-col justify-between">
              <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
              <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-800/50">
                <span className="text-3xl font-bold font-mono text-cyan-400">Rp {item.price.toLocaleString('id-ID')}</span>
                <button onClick={onOrderOnline} className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-[10px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer uppercase tracking-widest">
                  ORDER NOW
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="glass p-16 rounded-[4rem] border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
        <h2 className="text-7xl font-bold tracking-tighter neon-text-cyan uppercase font-mono text-center">Bagindo Rajo</h2>
        <p className="text-2xl text-slate-300 italic font-light text-center">"Penjaga warisan budaya Minangkabau."</p>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="glass p-12 rounded-[3.5rem] border-slate-800 space-y-10 shadow-2xl">
        <h2 className="text-5xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Hubungi Kami</h2>
        <div className="flex items-center gap-6 p-6 bg-slate-900/40 rounded-[1.8rem] border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group">
            <Mail className="text-cyan-400" size={24} />
            <div><p className="font-black text-xs uppercase tracking-widest text-slate-200">Email Support</p><p className="text-sm text-slate-500 font-bold">hello@bagindorajo.id</p></div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500 selection:text-white pb-20 overflow-hidden">
      <nav className="fixed top-0 w-full z-[100] glass border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer relative z-[101] group" onClick={() => onSetSubPage('LANDING')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
              <span className="font-bold text-2xl text-white">BR</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter neon-text-cyan font-mono uppercase">Bagindo Rajo</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] relative z-[101]">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onSetSubPage(item.id)} 
                className={`hover:text-cyan-400 transition-all cursor-pointer py-2 ${activeSubPage === item.id ? 'text-cyan-400' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button 
            onClick={onLoginClick}
            className="hidden sm:flex items-center gap-3 px-8 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer tracking-widest uppercase shadow-xl"
          >
            <LogIn size={14} /> CREW LOGIN
          </button>
          <button 
            className="md:hidden p-3 text-slate-400 hover:text-white glass rounded-xl cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </nav>

      <div className="animate-in fade-in duration-300 relative z-10">
        {activeSubPage === 'LANDING' && renderLanding()}
        {activeSubPage === 'FULL_MENU' && renderFullMenu()}
        {activeSubPage === 'PROFILE' && renderProfile()}
        {activeSubPage === 'CONTACT' && renderContact()}
      </div>

      <footer className="mt-32 py-16 border-t border-slate-800/50 px-6 relative z-10 opacity-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© 2025 Bagindo Rajo | Resto-On OS</p>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
