
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Users, User, LogOut, ShoppingCart, Table as TableIcon, CreditCard, Settings, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRole, onRoleChange, onLogout }) => {
  const sidebarItems = [
    { role: UserRole.CUSTOMER, label: 'Order', icon: ShoppingCart },
    { role: UserRole.PELAYAN, label: 'Waiter Area', icon: TableIcon },
    { role: UserRole.KASIR, label: 'Cashier', icon: CreditCard },
    { role: UserRole.ADMIN, label: 'Admin Panel', icon: Settings },
    { role: UserRole.MANAGEMENT, label: 'Management', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 glass border-r border-slate-800 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-border">
            <span className="font-bold text-xl text-white">R</span>
          </div>
          <h1 className="hidden md:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-cyan">
            Resto-On
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.role}
              onClick={() => onRoleChange(item.role)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeRole === item.role
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 glass rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-semibold truncate">{activeRole}</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto p-6 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
