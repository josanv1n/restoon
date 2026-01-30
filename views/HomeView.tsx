
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
      {/* Hero Section with Luxury Rendang & Jengkol Image Background */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Rendang & Jengkol Balado" 
            className="w-full h-full object-cover opacity-60 scale-110 animate-[ken-burns_20s_ease_infinite]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Star size={14} className="fill-cyan-400" /> Citarasa Autentik Minang
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter text-white">
              The Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 neon-text-cyan">Minang Cuisine.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
              Nikmati kelezatan <span className="text-cyan-400 font-bold">Rendang & Jengkol Balado</span> legendaris yang tersaji dengan estetika modern di Rumah Makan <span className="text-white font-bold underline decoration-cyan-500 decoration-2">BAGINDO RAJO</span>.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onOrderOnline}
                className="px-8 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white font-bold shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer group"
              >
                Pesan Online Sekarang <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onSetSubPage('FULL_MENU')}
                className="px-8 py-5 glass rounded-2xl font-bold border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer text-slate-200"
              >
                Lihat Menu Lengkap
              </button>
            </div>
          </div>

          <div className="relative group lg:block hidden">
            <div className="absolute -inset-10 bg-cyan-500/20 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative aspect-square rounded-[3.5rem] border border-slate-800/50 overflow-hidden glass p-4 group-hover:border-cyan-500/30 transition-all duration-700">
               <div className="w-full h-full rounded-[3rem] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-center p-12 space-y-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="w-28 h-28 rounded-3xl bg-cyan-500/10 flex items-center justify-center neon-border mb-4 shadow-inner">
                    <ChefHat size={56} className="text-cyan-400" />
                  </div>
                  <h3 className="text-5xl font-bold tracking-tighter">Premium.<br/><span className="text-cyan-500">Authentic.</span></h3>
                  <p className="text-slate-400 text-sm font-medium">Resep rahasia keluarga yang diwariskan dari generasi ke generasi, kini lebih mewah.</p>
                  <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-xl">
                      <p className="text-cyan-400 text-2xl font-bold">100%</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Premium Herbs</p>
                    </div>
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-xl">
                      <p className="text-pink-400 text-2xl font-bold">Luxury</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Presentation</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Menu Preview */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase neon-text-cyan">Favorit Pelanggan</h2>
              <p className="text-slate-500 max-w-md">Menu pilihan yang paling sering dipesan oleh para raja dan ratu pelanggan kami.</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            </div>
            <button 
              onClick={() => onSetSubPage('FULL_MENU')}
              className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-cyan-400 text-xs font-bold flex items-center gap-2 hover:border-cyan-500/50 transition-all cursor-pointer uppercase tracking-widest"
            >
              LIHAT SEMUA MENU <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {menu.slice(0, 4).map((item) => (
              <div key={item.id} className="glass group p-0 rounded-[2.5rem] border-slate-800/50 hover:border-cyan-500/40 hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-xl overflow-hidden" onClick={onOrderOnline}>
                <div className="relative h-48 overflow-hidden">
                   <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                   <span className="absolute top-4 left-4 text-[9px] font-black text-cyan-500 bg-slate-950/80 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border border-cyan-500/20">{item.category}</span>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors leading-tight">{item.name}</h3>
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  </div>
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
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => onSetSubPage('LANDING')} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-5xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Menu Digital</h2>
          <p className="text-slate-500 mt-1">Daftar hidangan lengkap BAGINDO RAJO</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menu.map((item) => (
          <div key={item.id} className="glass rounded-[2.5rem] border-slate-800/50 flex flex-col hover:bg-cyan-500/5 transition-all group shadow-xl overflow-hidden">
            <div className="relative h-56 overflow-hidden">
               <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
               <span className="absolute top-4 left-4 text-[10px] bg-slate-950/80 px-4 py-1.5 rounded-full text-slate-200 font-bold uppercase tracking-[0.2em] border border-slate-700">{item.category}</span>
            </div>
            <div className="p-10 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                   <Star className="text-yellow-500" size={16} fill="currentColor" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Sajian istimewa bumbu Minang asli yang diolah dengan resep rahasia keluarga selama puluhan tahun.</p>
              </div>
              <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-800/50">
                <span className="text-3xl font-bold font-mono text-cyan-400">Rp {item.price.toLocaleString('id-ID')}</span>
                <button onClick={onOrderOnline} className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-[10px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer uppercase tracking-widest shadow-lg active:scale-95">
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
    <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass p-16 rounded-[4rem] border-slate-800 space-y-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
        <div className="space-y-8 text-center relative z-10">
          <button onClick={() => onSetSubPage('LANDING')} className="mx-auto block text-slate-500 hover:text-cyan-400 transition-colors mb-6 flex items-center gap-2 justify-center font-bold text-[10px] uppercase tracking-widest cursor-pointer group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> KEMBALI KE BERANDA
          </button>
          <h2 className="text-7xl font-bold tracking-tighter neon-text-cyan uppercase font-mono">Bagindo Rajo</h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto rounded-full"></div>
          <p className="text-2xl text-slate-300 leading-relaxed italic font-light serif">
            "Kami bukan sekadar rumah makan. Kami adalah penjaga warisan budaya Minangkabau yang dituangkan dalam piring-piring porselen mewah."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 text-slate-400 leading-relaxed relative z-10">
          <div className="space-y-6">
            <h4 className="text-cyan-400 font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-xs">
              <span className="w-12 h-px bg-cyan-500"></span> Sejarah Kami
            </h4>
            <p className="font-medium">Berdiri sejak tahun 1995 di pusat kota Padang, <span className="text-white">BAGINDO RAJO</span> memulai perjalanannya sebagai kedai kecil yang mengutamakan kualitas bahan terbaik.</p>
            <p className="font-medium">Kini, dengan dukungan sistem operasi <span className="text-cyan-400">Resto-On OS</span>, kami bertransformasi menjadi restoran masa depan.</p>
          </div>
          <div className="space-y-6">
            <h4 className="text-pink-400 font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-xs">
              <span className="w-12 h-px bg-pink-500"></span> Visi & Misi
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start"><ChevronRight className="text-pink-400 shrink-0 mt-1" size={18} /> <span className="font-medium">Menyajikan hidangan Minang dengan standard kualitas gourmet internasional.</span></li>
              <li className="flex gap-4 items-start"><ChevronRight className="text-pink-400 shrink-0 mt-1" size={18} /> <span className="font-medium">Menjadi pemimpin digitalisasi industri kuliner tradisional Indonesia.</span></li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-800/50 relative z-10">
          {[
            { icon: MapPin, title: 'Headquarters', desc: 'Techno City, Future Blvd 101' },
            { icon: Clock, title: 'Opening Hours', desc: 'Daily: 08:00 - 22:00 WIB' },
            { icon: Phone, title: 'Fast Response', desc: 'Hotline: 021-555-RAJO' }
          ].map((item, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-500"><item.icon className="text-cyan-400" size={24} /></div>
              <p className="font-bold text-white text-sm uppercase tracking-widest">{item.title}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-bold">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="glass p-12 rounded-[3.5rem] border-slate-800 space-y-10 shadow-2xl">
          <h2 className="text-5xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Hubungi Kami</h2>
          <p className="text-slate-400 leading-relaxed font-medium">Tim concierge kami siap melayani kebutuhan Anda, baik reservasi meja VIP maupun pemesanan katering korporat.</p>
          
          <div className="space-y-6">
            {[
              { icon: Instagram, label: 'Instagram', value: '@bagindorajo.official', color: 'text-pink-500' },
              { icon: Twitter, label: 'X / Twitter', value: '@bagindorajo_tech', color: 'text-blue-400' },
              { icon: Mail, label: 'Email Support', value: 'hello@bagindorajo.id', color: 'text-cyan-400' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 p-6 bg-slate-900/40 rounded-[1.8rem] border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-lg">
                <div className={`w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}><item.icon size={24} /></div>
                <div><p className="font-black text-xs uppercase tracking-widest text-slate-200">{item.label}</p><p className="text-sm text-slate-500 font-bold">{item.value}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-12 rounded-[3.5rem] border-slate-800 flex flex-col justify-center space-y-8 text-center shadow-2xl">
          <div className="w-24 h-24 bg-cyan-500/10 border border-cyan-500/30 rounded-[2rem] flex items-center justify-center mx-auto mb-2 neon-border shadow-cyan-500/10">
             <MapPin size={48} className="text-cyan-400 animate-bounce" />
          </div>
          <h3 className="text-3xl font-bold tracking-tighter">Kunjungi Outlet Utama</h3>
          <p className="text-slate-400 font-medium">Jl. Future No. 101, Techno City District, Level 5, Jakarta Selatan 12345.</p>
          <div className="aspect-video bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center group overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
            <p className="relative z-10 font-black text-slate-700 uppercase tracking-[0.3em] text-[10px]">Interactive Map Protocol Online</p>
          </div>
          <button onClick={() => onSetSubPage('LANDING')} className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer">KEMBALI KE BERANDA</button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500 selection:text-white pb-20 overflow-hidden">
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1.1); }
          50% { transform: scale(1.2) translate(1%, 1%); }
          100% { transform: scale(1.1); }
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] glass border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer relative z-[101] group" onClick={() => onSetSubPage('LANDING')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
              <span className="font-bold text-2xl text-white">BR</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter neon-text-cyan font-mono uppercase">Bagindo Rajo</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] relative z-[101]">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onSetSubPage(item.id)} 
                className={`hover:text-cyan-400 transition-all cursor-pointer relative py-2 ${activeSubPage === item.id ? 'text-cyan-400' : ''}`}
              >
                {item.label}
                {activeSubPage === item.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_8px_cyan]"></div>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 relative z-[101]">
            <button 
              onClick={onLoginClick}
              className="hidden sm:flex items-center gap-3 px-8 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all group cursor-pointer tracking-widest uppercase shadow-xl"
            >
              <LogIn size={14} className="group-hover:translate-x-1 transition-transform" /> CREW LOGIN
            </button>
            
            <button 
              className="md:hidden p-3 text-slate-400 hover:text-white glass rounded-xl cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full glass border-b border-slate-800 animate-in slide-in-from-top-5 duration-500 z-[99] shadow-2xl">
            <div className="flex flex-col p-8 space-y-6">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onSetSubPage(item.id)} 
                  className={`text-left text-xs font-black uppercase tracking-[0.3em] py-4 transition-all cursor-pointer ${activeSubPage === item.id ? 'text-cyan-400 pl-4 border-l-4 border-cyan-400 bg-cyan-500/5' : 'text-slate-500'}`}
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={onLoginClick}
                className="flex items-center justify-center gap-3 px-8 py-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-[10px] font-black text-cyan-400 cursor-pointer tracking-widest uppercase"
              >
                <LogIn size={16} /> CREW LOGIN
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Dynamic View Content */}
      <div className="animate-in fade-in duration-700 relative z-10">
        {activeSubPage === 'LANDING' && renderLanding()}
        {activeSubPage === 'FULL_MENU' && renderFullMenu()}
        {activeSubPage === 'PROFILE' && renderProfile()}
        {activeSubPage === 'CONTACT' && renderContact()}
      </div>

      {/* Shared Footer */}
      <footer className="mt-32 py-16 border-t border-slate-800/50 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex flex-col md:flex-row items-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-white">BR</div>
               <p>© 2025 Bagindo Rajo</p>
            </div>
            <div className="hidden md:block w-px h-4 bg-slate-800"></div>
            <p>Powered by Resto-On OS v2.7 PRO EDITION</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-slate-500">
            <button onClick={() => onSetSubPage('PROFILE')} className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Protocol</button>
            <button onClick={() => onSetSubPage('CONTACT')} className="hover:text-cyan-400 transition-colors cursor-pointer">Service Terms</button>
            <button onClick={() => onSetSubPage('PROFILE')} className="hover:text-cyan-400 transition-colors cursor-pointer">Sitemap</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
