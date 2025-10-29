import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { LayoutDashboard, Users, FileText, CreditCard, Layers, Mail, CalendarClock, Settings, LogOut } from 'lucide-react';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/membership-types', label: 'Membership Types', icon: Layers },
  { to: '/admin/email-logs', label: 'Email Logs', icon: Mail },
  { to: '/admin/renewals', label: 'Renewals', icon: CalendarClock },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-slate-50 text-slate-800">
      <aside className="bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="mb-6">
          <div className="text-teal-600 font-bold text-lg">CAG Admin</div>
          <div className="text-xs text-slate-500">{admin?.email}</div>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end as boolean | undefined}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-100 ${
                  isActive ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-700'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
