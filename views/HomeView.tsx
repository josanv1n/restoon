
import React, { useEffect, useState } from 'react';
import { MenuItem } from '../types';
import { ChefHat, MapPin, Phone, LogIn, ChevronRight, Star, Clock, ArrowLeft, Instagram, Twitter, Mail, Menu as MenuIcon, X, Plus, UtensilsCrossed, Utensils } from 'lucide-react';

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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: 'Beranda', id: 'LANDING' as const },
    { label: 'Profil', id: 'PROFILE' as const },
    { label: 'Menu Favorit', id: 'FULL_MENU' as const },
    { label: 'Kontak', id: 'CONTACT' as const },
  ];

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-900');
      // Sisipkan ikon placeholder jika gambar gagal
      const icon = document.createElement('div');
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700"><path d="M11 20A7 7 0 0 1 11 6a7 7 0 0 1 0 14Z"/><path d="M20 20l-4.5-4.5"/></svg>`;
      parent.appendChild(icon);
    }
  };

  const renderLanding = () => (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1626074353765-517a681e40be?q=30&w=800&auto=format&fit=crop" 
            alt="Hero BG" 
            className="w-full h-full object-cover opacity-60 scale-105"
            loading="eager"
            onError={handleImgError}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              <Star size={12} className="fill-cyan-400" /> Future Dining System
            </div>
            <h1 className="text-5xl md:text-8xl font-bold leading-tight tracking-tighter text-white">
              The Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 neon-text-cyan">Culinary Order.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
              Akses menu favorit Anda dengan kecepatan cahaya di <span className="text-white font-bold underline decoration-cyan-500">Resto-On</span>. Rasakan revolusi digital dalam setiap suapan.
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

      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter uppercase neon-text-cyan">Favorit Pelanggan</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menu.filter(m => m.imageUrl).slice(0, 4).map((item) => (
              <div key={item.id} className="glass group p-0 rounded-[2rem] border-slate-800/50 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xl overflow-hidden" onClick={onOrderOnline}>
                <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
                   <img 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={item.name} 
                    loading="eager" 
                    onError={handleImgError}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-white">Rp {item.price.toLocaleString('id-ID')}</span>
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg">
                      <Plus size={18} />
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
      <div className="flex items-center gap-6 mb-12">
        <button onClick={() => onSetSubPage('LANDING')} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 transition-all cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-4xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Menu Digital</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((item) => (
          <div key={item.id} className="glass rounded-[2rem] border-slate-800/50 flex flex-col hover:bg-cyan-500/5 transition-all group shadow-xl overflow-hidden">
            <div className="relative h-52 overflow-hidden bg-slate-900 flex items-center justify-center">
               <img 
                src={item.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                alt={item.name} 
                loading="lazy"
                onError={handleImgError}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/50">
                <span className="text-2xl font-bold font-mono text-cyan-400">Rp {item.price.toLocaleString('id-ID')}</span>
                <button onClick={onOrderOnline} className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[9px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all uppercase tracking-widest">
                  ORDER
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
      <div className="glass p-12 rounded-[3rem] border-slate-800 space-y-8 shadow-2xl relative overflow-hidden text-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter neon-text-cyan uppercase font-mono">Resto-On</h2>
        <p className="text-xl text-slate-300 italic font-light">"Digital Dining Experience, Personalized."</p>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="pt-32 pb-20 px-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="glass p-10 rounded-[2.5rem] border-slate-800 space-y-8 shadow-2xl">
        <h2 className="text-4xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Hubungi Kami</h2>
        <div className="flex items-center gap-5 p-6 bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group">
            <Mail className="text-cyan-400" size={20} />
            <div>
              <p className="font-black text-[10px] uppercase tracking-widest text-slate-200">Email Support</p>
              <p className="text-sm text-slate-400 font-bold">support@restoon.app</p>
            </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500 selection:text-white pb-20 overflow-hidden">
      <nav className="fixed top-0 w-full z-[100] glass border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer relative z-[101] group" onClick={() => onSetSubPage('LANDING')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
              <UtensilsCrossed size={24} className="text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tighter neon-text-cyan font-mono uppercase">Resto-On</span>
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
            className="hidden lg:flex items-center gap-3 px-6 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer tracking-widest uppercase shadow-xl"
          >
            <LogIn size={14} /> CREW LOGIN
          </button>

          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white glass rounded-lg cursor-pointer relative z-[110]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[105] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        <div className={`absolute right-0 top-0 h-full w-[80%] max-w-xs glass border-l border-slate-800 p-8 flex flex-col justify-center gap-8 transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="space-y-6">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Navigasi Utama</p>
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    onSetSubPage(item.id);
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`w-full text-left text-2xl font-bold tracking-tight uppercase transition-all ${activeSubPage === item.id ? 'text-cyan-400 neon-text-cyan' : 'text-slate-400 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
           </div>
           
           <div className="pt-8 border-t border-slate-800 space-y-4">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <LogIn size={16} /> Crew Login
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOrderOnline();
                }}
                className="w-full py-4 bg-cyan-600 rounded-2xl text-[10px] font-black text-white flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg shadow-cyan-500/20"
              >
                Pesan Sekarang
              </button>
           </div>
        </div>
      </div>

      <div className="animate-in fade-in duration-300 relative z-10">
        {activeSubPage === 'LANDING' && renderLanding()}
        {activeSubPage === 'FULL_MENU' && renderFullMenu()}
        {activeSubPage === 'PROFILE' && renderProfile()}
        {activeSubPage === 'CONTACT' && renderContact()}
      </div>

      <footer className="mt-20 py-10 border-t border-slate-800/50 px-6 relative z-10 opacity-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© 2025 Resto-On | Online OS</p>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
