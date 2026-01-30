
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Users, User, LogOut, ShoppingCart, Table as TableIcon, CreditCard, Settings, BarChart3, ChevronRight, UtensilsCrossed } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  loggedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRole, loggedRole, onRoleChange, onLogout }) => {
  const allSidebarItems = [
    { role: UserRole.CUSTOMER, label: 'Portal Online', icon: ShoppingCart },
    { role: UserRole.PELAYAN, label: 'Waiter System', icon: TableIcon },
    { role: UserRole.KASIR, label: 'Kasir / Billing', icon: CreditCard },
    { role: UserRole.ADMIN, label: 'System Admin', icon: Settings },
    { role: UserRole.MANAGEMENT, label: 'Management BI', icon: BarChart3 },
  ];

  const sidebarItems = allSidebarItems.filter(item => {
    if (loggedRole === UserRole.PELAYAN) return item.role === UserRole.PELAYAN || item.role === UserRole.CUSTOMER;
    if (loggedRole === UserRole.KASIR) return item.role === UserRole.KASIR || item.role === UserRole.PELAYAN || item.role === UserRole.CUSTOMER;
    if (loggedRole === UserRole.ADMIN) return item.role !== UserRole.MANAGEMENT;
    if (loggedRole === UserRole.MANAGEMENT) return true;
    return item.role === UserRole.CUSTOMER;
  });

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 selection:bg-cyan-500 overflow-x-hidden">
      <aside className="w-16 sm:w-20 md:w-64 glass border-r border-slate-800/50 flex flex-col z-50 sticky top-0 h-screen shrink-0 shadow-2xl">
        <div className="p-4 sm:p-6 flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border shadow-cyan-500/20 shrink-0">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <div className="hidden md:block overflow-hidden">
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-cyan font-mono tracking-tighter truncate uppercase">
              Bagindo Rajo
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">RM v3.0 PRO</p>
          </div>
        </div>

        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-8 space-y-2 sm:space-y-3">
          {sidebarItems.map((item) => (
            <button
              key={item.role}
              onClick={() => onRoleChange(item.role)}
              title={item.label}
              className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 sm:px-4 py-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 border ${
                activeRole === item.role
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] md:translate-x-1'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/50 hover:border-slate-800'
              }`}
            >
              <item.icon size={20} className={activeRole === item.role ? 'animate-pulse shrink-0' : 'shrink-0'} />
              <span className="hidden md:block font-bold text-[11px] uppercase tracking-wider truncate">{item.label}</span>
              {activeRole === item.role && <ChevronRight size={14} className="hidden md:block ml-auto text-cyan-500" />}
            </button>
          ))}
        </nav>

        <div className="p-3 sm:p-6 border-t border-slate-800/50">
          <div className="hidden md:flex items-center gap-4 px-4 py-4 mb-6 glass rounded-2xl border-slate-800/50 shadow-inner overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold truncate uppercase tracking-widest text-slate-200">{loggedRole}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[8px] text-slate-500 font-bold uppercase">Authorized</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center md:justify-start gap-4 px-3 sm:px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-xl sm:rounded-2xl transition-all group border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <span className="hidden md:block font-bold text-xs uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
        <div className="p-4 sm:p-6 md:p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
