import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import { useAdminAuth } from "../AdminAuth.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/analytics", label: "Business Analytics", icon: "chart" },
  { to: "/admin/offers", label: "Offers", icon: "tag" },
  { to: "/admin/smartphones", label: "Smartphones", icon: "smartphone" },
  { to: "/admin/brands", label: "Brands", icon: "sparkle" },
  { to: "/admin/repairs", label: "Repairs", icon: "wrench" },
  { to: "/admin/accessories", label: "Accessories", icon: "headphones" },
  { to: "/admin/gallery", label: "Gallery", icon: "image" },
  { to: "/admin/business-info", label: "Business Info", icon: "mapPin" },
  { to: "/admin/homepage", label: "Homepage Content", icon: "store" },
];

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.9375rem] font-medium transition-colors ${
          isActive
            ? "bg-accent-600 text-white"
            : "text-ink-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon name={item.icon} size={18} className="shrink-0" />
      {item.label}
    </NavLink>
  );
}

function SidebarContent({ user, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent-600 text-white">
          <Icon name="store" size={18} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[0.9375rem] font-bold text-white">SmartphoneCafe</p>
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">Admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        {user ? (
          <p className="truncate px-3 pb-2 text-[0.75rem] text-ink-400" title={user.email}>
            {user.email}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.9375rem] font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Icon name="logout" size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-ink-950 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
        >
          <Icon name="menu" size={20} />
        </button>
        <span className="font-display text-[0.9375rem] font-bold text-white">SmartphoneCafe Admin</span>
        <span className="w-9" />
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-950 shadow-[var(--shadow-deep)]">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-300 hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" size={18} />
            </button>
            <SidebarContent user={user} onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
