
import React from 'react';
import { MenuItem } from '../types';
import { ChefHat, MapPin, Phone, LogIn, ChevronRight, Star, Clock, ArrowLeft, Instagram, Twitter, Mail } from 'lucide-react';

interface HomeViewProps {
  menu: MenuItem[];
  onLoginClick: () => void;
  onOrderOnline: () => void;
  activeSubPage: 'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT';
  onSetSubPage: (page: 'LANDING' | 'FULL_MENU' | 'PROFILE' | 'CONTACT') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ menu, onLoginClick, onOrderOnline, activeSubPage, onSetSubPage }) => {
  const renderLanding = () => (
    <>
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,_#0e7490_0%,_transparent_70%)] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest">
              <Star size={14} className="fill-cyan-400" /> Citarasa Autentik Minang
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter">
              The Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Minang Cuisine.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Rumah Makan <span className="text-white font-bold">BAGINDO RAJO</span> menghadirkan kelezatan legendaris Nasi Padang dengan sentuhan teknologi modern.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onOrderOnline}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white font-bold shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-3"
              >
                Pesan Online Sekarang <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => onSetSubPage('FULL_MENU')}
                className="px-8 py-4 glass rounded-2xl font-bold border-slate-800 hover:border-slate-700 transition-all"
              >
                Lihat Menu Lengkap
              </button>
            </div>
          </div>
          <div className="relative group lg:block hidden">
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative aspect-square rounded-[3rem] border border-slate-800 overflow-hidden glass p-4">
               <div className="w-full h-full rounded-[2.5rem] bg-slate-900/50 flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 flex items-center justify-center neon-border mb-4">
                    <ChefHat size={48} className="text-cyan-400" />
                  </div>
                  <h3 className="text-4xl font-bold">Citarasa Raja.</h3>
                  <p className="text-slate-500">Setiap suapan adalah perjalanan rasa melintasi samudera bumbu rempah nusantara.</p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                      <p className="text-cyan-400 text-2xl font-bold">100%</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Halal & Higienis</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                      <p className="text-pink-400 text-2xl font-bold">Legend</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Resep Turun Temurun</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Menu Preview */}
      <section className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold font-mono tracking-tighter uppercase">Favorit Pelanggan</h2>
              <div className="w-20 h-1 bg-cyan-500 rounded-full"></div>
            </div>
            <button 
              onClick={() => onSetSubPage('FULL_MENU')}
              className="text-cyan-400 text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4"
            >
              LIHAT SEMUA MENU <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menu.slice(0, 4).map((item) => (
              <div key={item.id} className="glass p-6 rounded-3xl border-slate-800/50 hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={onOrderOnline}>
                <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">{item.category}</p>
                <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors mb-4">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xl">Rp {item.price.toLocaleString('id-ID')}</span>
                  <div className="p-2 bg-slate-900 rounded-xl text-slate-500 group-hover:text-cyan-400">
                    <ChevronRight size={16} />
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
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => onSetSubPage('LANDING')} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-4xl font-bold neon-text-cyan font-mono tracking-tighter uppercase">Menu Digital</h2>
          <p className="text-slate-500">Daftar hidangan lengkap BAGINDO RAJO</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((item) => (
          <div key={item.id} className="glass p-8 rounded-[2rem] border-slate-800/50 flex flex-col justify-between hover:bg-cyan-500/5 transition-all">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-widest">{item.category}</span>
                <Star className="text-yellow-500/50" size={14} />
              </div>
              <h3 className="text-xl font-bold text-slate-200">{item.name}</h3>
              <p className="text-sm text-slate-500">Sajian istimewa bumbu Minang asli yang diolah dengan resep rahasia keluarga.</p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/50">
              <span className="text-2xl font-bold font-mono text-cyan-400">Rp {item.price.toLocaleString('id-ID')}</span>
              <button onClick={onOrderOnline} className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all">
                PESAN ONLINE
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass p-12 rounded-[3rem] border-slate-800 space-y-12">
        <div className="space-y-6 text-center">
          <button onClick={() => onSetSubPage('LANDING')} className="mx-auto block text-slate-500 hover:text-cyan-400 transition-colors mb-4 flex items-center gap-2 justify-center font-bold text-xs">
            <ArrowLeft size={14} /> KEMBALI KE BERANDA
          </button>
          <h2 className="text-6xl font-bold tracking-tighter neon-text-cyan uppercase font-mono">Bagindo Rajo</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto"></div>
          <p className="text-xl text-slate-400 leading-relaxed italic">
            "Kami bukan sekadar rumah makan. Kami adalah penjaga warisan budaya Minangkabau yang dituangkan dalam piring-piring porselen."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 text-slate-300 leading-relaxed">
          <div className="space-y-4">
            <h4 className="text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-cyan-500"></span> Sejarah Kami
            </h4>
            <p>Berdiri sejak tahun 1995 di pusat kota Padang, BAGINDO RAJO memulai perjalanannya sebagai kedai kecil yang mengutamakan kualitas bahan dan keaslian bumbu rempah.</p>
            <p>Kini, dengan dukungan sistem digital Resto-On, kami bertransformasi menjadi restoran modern tanpa meninggalkan akar budaya kami yang kental.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-pink-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-pink-500"></span> Visi & Misi
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-3"><ChevronRight className="text-pink-400 shrink-0" size={16} /> <span>Menyajikan hidangan Minang dengan standard kualitas hotel bintang lima.</span></li>
              <li className="flex gap-3"><ChevronRight className="text-pink-400 shrink-0" size={16} /> <span>Menjadi pionir digitalisasi restoran tradisional di Indonesia.</span></li>
              <li className="flex gap-3"><ChevronRight className="text-pink-400 shrink-0" size={16} /> <span>Mengutamakan kepuasan pelanggan lewat layanan yang presisi.</span></li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-800">
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-lg shadow-cyan-500/10"><MapPin className="text-cyan-400" /></div>
            <p className="font-bold">Headquarters</p>
            <p className="text-xs text-slate-500">Techno City, Future Blvd 101</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-lg shadow-cyan-500/10"><Clock className="text-cyan-400" /></div>
            <p className="font-bold">Opening Hours</p>
            <p className="text-xs text-slate-500">Daily: 08:00 - 22:00 WIB</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-lg shadow-cyan-500/10"><Phone className="text-cyan-400" /></div>
            <p className="font-bold">Fast Response</p>
            <p className="text-xs text-slate-500">Hotline: 021-555-RAJO</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[2.5rem] border-slate-800 space-y-8">
          <h2 className="text-4xl font-bold neon-text-cyan font-mono uppercase tracking-tighter">Hubungi Kami</h2>
          <p className="text-slate-400 leading-relaxed">Punya pertanyaan, kritik, atau saran? Tim kami siap melayani Anda 24/7 melalui jalur komunikasi digital kami.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Instagram /></div>
              <div><p className="font-bold">Instagram</p><p className="text-sm text-slate-500">@bagindorajo.official</p></div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Twitter /></div>
              <div><p className="font-bold">X / Twitter</p><p className="text-sm text-slate-500">@bagindorajo_tech</p></div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Mail /></div>
              <div><p className="font-bold">Email Support</p><p className="text-sm text-slate-500">hello@bagindorajo.id</p></div>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border-slate-800 flex flex-col justify-center space-y-6 text-center">
          <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4 neon-border">
             <MapPin size={40} className="text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold">Kunjungi Outlet Kami</h3>
          <p className="text-slate-400">Jl. Future No. 101, Techno City District, Level 5, Jakarta Selatan 12345.</p>
          <div className="aspect-video bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center group overflow-hidden relative">
            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
            <p className="relative z-10 font-bold text-slate-600 uppercase tracking-widest text-xs">Interactive Map Loading...</p>
          </div>
          <button onClick={() => onSetSubPage('LANDING')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">KEMBALI KE BERANDA</button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500 selection:text-white pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] glass border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSetSubPage('LANDING')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/20">
              <span className="font-bold text-xl text-white">BR</span>
            </div>
            <span className="text-xl font-bold tracking-tighter neon-text-cyan font-mono uppercase">Bagindo Rajo</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <button onClick={() => onSetSubPage('LANDING')} className={`hover:text-cyan-400 transition-colors ${activeSubPage === 'LANDING' ? 'text-cyan-400' : ''}`}>Beranda</button>
            <button onClick={() => onSetSubPage('PROFILE')} className={`hover:text-cyan-400 transition-colors ${activeSubPage === 'PROFILE' ? 'text-cyan-400' : ''}`}>Profil</button>
            <button onClick={() => onSetSubPage('FULL_MENU')} className={`hover:text-cyan-400 transition-colors ${activeSubPage === 'FULL_MENU' ? 'text-cyan-400' : ''}`}>Menu Favorit</button>
            <button onClick={() => onSetSubPage('CONTACT')} className={`hover:text-cyan-400 transition-colors ${activeSubPage === 'CONTACT' ? 'text-cyan-400' : ''}`}>Kontak</button>
          </div>
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold hover:border-cyan-500/50 hover:text-cyan-400 transition-all group"
          >
            <LogIn size={14} className="group-hover:translate-x-1 transition-transform" /> CREW LOGIN
          </button>
        </div>
      </nav>

      {/* Dynamic View Content */}
      <div className="animate-in fade-in duration-500">
        {activeSubPage === 'LANDING' && renderLanding()}
        {activeSubPage === 'FULL_MENU' && renderFullMenu()}
        {activeSubPage === 'PROFILE' && renderProfile()}
        {activeSubPage === 'CONTACT' && renderContact()}
      </div>

      {/* Shared Footer */}
      <footer className="mt-24 py-12 border-t border-slate-800/50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-4 opacity-40">
            <p>© 2025 Bagindo Rajo - Powered by Resto-On OS v2.7</p>
          </div>
          <div className="flex gap-10 font-bold uppercase tracking-widest text-[10px] text-slate-500">
            <button onClick={() => onSetSubPage('PROFILE')} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
            <button onClick={() => onSetSubPage('CONTACT')} className="hover:text-cyan-400 transition-colors">Terms of Service</button>
            <button onClick={() => onSetSubPage('PROFILE')} className="hover:text-cyan-400 transition-colors">Sitemap</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
