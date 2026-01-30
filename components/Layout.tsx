
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Users, User, LogOut, ShoppingCart, Table as TableIcon, CreditCard, Settings, BarChart3, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRole, onRoleChange, onLogout }) => {
  const sidebarItems = [
    { role: UserRole.CUSTOMER, label: 'Portal Online', icon: ShoppingCart },
    { role: UserRole.PELAYAN, label: 'Waiter System', icon: TableIcon },
    { role: UserRole.KASIR, label: 'Kasir / Billing', icon: CreditCard },
    { role: UserRole.ADMIN, label: 'System Admin', icon: Settings },
    { role: UserRole.MANAGEMENT, label: 'Management BI', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 selection:bg-cyan-500">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 glass border-r border-slate-800/50 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/20">
            <span className="font-bold text-xl text-white">R</span>
          </div>
          <div className="hidden md:block">
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-cyan font-mono tracking-tighter">
              Resto-On
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">OS v2.7 PRO</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3">
          {sidebarItems.map((item) => (
            <button
              key={item.role}
              onClick={() => onRoleChange(item.role)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 border ${
                activeRole === item.role
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] translate-x-1'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/50 hover:border-slate-800'
              }`}
            >
              <item.icon size={20} className={activeRole === item.role ? 'animate-pulse' : ''} />
              <span className="hidden md:block font-bold text-sm uppercase tracking-wider">{item.label}</span>
              {activeRole === item.role && <ChevronRight size={14} className="hidden md:block ml-auto text-cyan-500" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="flex items-center gap-4 px-4 py-4 mb-6 glass rounded-2xl border-slate-800/50 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg">
              <User size={18} />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-bold truncate uppercase tracking-widest text-slate-200">{activeRole}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Authorized Access</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block font-bold text-xs uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
