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
      <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border-slate-800 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-3">
          <h2 className="text-4xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Hubungi Kami</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Layanan Pelanggan Hub Johan.jkt999</p>
        </div>

        <div className="grid gap-4 md:gap-6">
          {/* Email / ID Card */}
          <div className="flex items-center gap-6 p-6 bg-slate-900/40 rounded-3xl border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-lg">
                <Mail size={28} />
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Official ID</p>
                <p className="text-lg text-slate-200 font-bold">Johan.jkt999@gmail.com</p>
              </div>
          </div>

          {/* WhatsApp Card */}
          <a 
            href="https://wa.me/6281341300100" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-6 p-6 bg-slate-900/40 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group no-underline shadow-xl hover:bg-emerald-500/5"
          >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.626 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">WhatsApp Hotline</p>
                <p className="text-lg text-slate-200 font-bold">+62 813 41 300 100</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </a>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activeSubPage) {
      case 'FULL_MENU': return renderFullMenu();
      case 'PROFILE': return renderProfile();
      case 'CONTACT': return renderContact();
      default: return renderLanding();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500 selection:text-white pb-20 overflow-hidden">
      <nav className="fixed top-0 w-full z-[100] glass border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSetSubPage('LANDING')}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tighter text-white neon-text-cyan">Resto-On</h1>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Future Dining</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onSetSubPage(item.id)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-cyan-400 cursor-pointer ${activeSubPage === item.id ? 'text-cyan-400' : 'text-slate-400'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-8 w-px bg-slate-800"></div>
            <button 
              onClick={onLoginClick}
              className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-cyan-500/50 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-xl"
            >
              <LogIn size={14} className="text-cyan-500" /> Staff Login
            </button>
          </div>

          <button className="lg:hidden p-3 bg-slate-900 border border-slate-800 rounded-xl text-cyan-500" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-xl transition-all duration-500 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button className="absolute top-8 right-8 p-4 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={32} />
        </button>
        <div className="flex flex-col items-center justify-center h-full space-y-10">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onSetSubPage(item.id)}
              className="text-3xl font-bold font-mono tracking-tighter uppercase text-slate-200 hover:text-cyan-400"
            >
              {item.label}
            </button>
          ))}
          <button onClick={onLoginClick} className="px-10 py-5 bg-cyan-600 rounded-2xl text-white font-bold uppercase tracking-widest text-xs">Staff Terminal</button>
        </div>
      </div>

      <main>
        {renderContent()}
      </main>

      <footer className="py-20 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <UtensilsCrossed size={24} className="text-cyan-500" />
               <h3 className="text-2xl font-bold font-mono tracking-tighter uppercase">Resto-On</h3>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">
               Mendefinisikan ulang cara Anda bersantap melalui teknologi pesanan digital masa depan yang cepat dan efisien.
             </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-8">Navigasi</h4>
            <ul className="space-y-4">
              {navItems.map(n => (
                <li key={n.id}><button onClick={() => onSetSubPage(n.id)} className="text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-widest text-[11px] font-bold">{n.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-8">Jam Operasional</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li className="flex justify-between"><span>Senin - Kamis</span> <span className="text-white">10:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Jumat - Minggu</span> <span className="text-white">10:00 - 23:00</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-8">Social Connect</h4>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-500/50 transition-all shadow-lg"><Instagram size={20} /></button>
              <button className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400/50 transition-all shadow-lg"><Twitter size={20} /></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2025 Resto-On OS. All Rights Reserved.</p>
           <div className="flex gap-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
              <a href="#" className="hover:text-cyan-500">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-500">Terms of Service</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;