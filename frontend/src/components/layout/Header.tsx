import { Bell, Search, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { preferences, updatePreferences } = useUserPreferences();

  const toggleTheme = () => {
    updatePreferences({ theme: preferences.theme === 'light' ? 'dark' : 'light' });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-5 sticky top-0 z-40 shrink-0">
      {/* Left side - Menu toggle and Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors lg:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden md:flex items-center gap-2.5 border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 h-9 rounded-lg w-64 focus-within:border-[hsl(var(--ring))] focus-within:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-all">
          <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            type="text"
            placeholder="بحث سريع... (Enter للبحث)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[hsl(var(--muted-foreground))] text-[hsl(var(--foreground))]"
          />
        </div>
      </div>

      {/* Right side - Theme Toggle, Notifications and User */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] group"
          aria-label="Toggle theme"
        >
          {preferences.theme === 'light' ? (
            <Moon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          ) : (
            <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[hsl(var(--primary))] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">م</span>
            </div>
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">المسؤول</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">admin@pharmacy.iq</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-xl shadow-[var(--shadow-lg)] py-1.5 z-50 animate-scale-in">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="w-full px-4 py-2.5 text-right hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
