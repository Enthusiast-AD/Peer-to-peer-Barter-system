import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Video,
  Coins,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Settings,
  ChevronsUpDown,
  Inbox,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import api from '../../services/api';
import { subscribeNotifications } from '../../services/notificationsEvents';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) setUnread(res.data.data.count);
    } catch (e) { /* noop */ }
  }, []);

  useEffect(() => { loadUnread(); }, [loadUnread]);
  useEffect(() => {
    const interval = setInterval(loadUnread, 20000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  // Refresh the badge immediately whenever a notification is read/marked.
  useEffect(() => {
    const unsub = subscribeNotifications(loadUnread);
    return unsub;
  }, [loadUnread]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/inbox', icon: Inbox, label: 'Inbox', badge: unread },
    { path: '/dashboard/profile', icon: User, label: 'Skill Profile' },
    { path: '/dashboard/matching', icon: Users, label: 'Find Matches' },
    { path: '/dashboard/sessions', icon: Video, label: 'Sessions' },
    { path: '/dashboard/credits', icon: Coins, label: 'Credits' },
  ];

  const isAdmin = Boolean((user as any)?.isAdmin);

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const renderNavItem = (item: { path: string; icon: any; label: string; badge?: number }, mobile: boolean) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const base = mobile
      ? `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
          active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`
      : `flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          active
            ? 'bg-sidebar-accent text-foreground'
            : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60'
        }`;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        title={!mobile && collapsed ? item.label : undefined}
        className={`${base} ${mobile ? '' : 'relative'}`}
      >
        <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
        <span className="truncate">{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <span
            className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold shrink-0 ${
              !mobile && collapsed ? 'absolute -top-0.5 -right-0.5' : ''
            }`}
          >
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-sidebar-border ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          <Link to="/dashboard" className="flex items-center gap-2.5 group min-w-0">
            <Logo className="w-8 h-8 shrink-0" />
            {!collapsed && (
              <span className="text-[15px] font-semibold tracking-tight truncate">Peersy</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item, false))}
          {isAdmin && (
            <Link
              to="/dashboard/admin"
              title={collapsed ? 'Admin' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive('/dashboard/admin')
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60'
              }`}
            >
              <Shield className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
              {!collapsed && <span className="truncate">Admin</span>}
            </Link>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2.5 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60 w-full transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeft className="w-[17px] h-[17px]" strokeWidth={1.8} />
              : <PanelLeftClose className="w-[17px] h-[17px]" strokeWidth={1.8} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Menu -> dropdown with Settings + Logout */}
        <div className="relative p-2.5 border-t border-sidebar-border">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={collapsed ? 'User menu' : undefined}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent/60 transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-sm font-semibold text-accent shrink-0">
              {user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium truncate text-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.credits ?? 0} credits</p>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
              </>
            )}
          </button>
          {userMenuOpen && (
            <div
              ref={userMenuRef}
              className={`absolute z-50 bg-popover border border-border rounded-lg shadow-2xl p-1.5 ${
                collapsed ? 'left-full ml-1.5 bottom-0 w-52' : 'bottom-full left-2 right-2 mb-1.5'
              }`}
            >
              <div className="px-2.5 py-2 mb-1 border-b border-border">
                <p className="text-[13px] font-medium truncate text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-foreground hover:bg-sidebar-accent/60 transition-colors"
              >
                <Settings className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Logo className="w-7 h-7" />
              <span className="text-[17px] font-semibold tracking-tight">Peersy</span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-muted rounded-md"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="border-t border-border px-3 py-2 space-y-0.5 bg-background">
              {navItems.map((item) => renderNavItem(item, true))}
              {isAdmin && (
                <Link
                  to="/dashboard/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard/admin') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield className="w-[17px] h-[17px]" strokeWidth={1.8} />
                  <span>Admin</span>
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-sm font-semibold text-accent">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.credits ?? 0} credits</p>
                  </div>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-[17px] h-[17px]" strokeWidth={1.8} />
                  <span>Settings</span>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" strokeWidth={1.8} />
                  Log out
                </Button>
              </div>
            </div>
          )}
        </div>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
