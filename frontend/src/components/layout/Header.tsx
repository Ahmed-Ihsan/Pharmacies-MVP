import { Bell, Search, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - Menu toggle and Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors lg:hidden"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden md:flex items-center gap-2 bg-[hsl(var(--muted))] px-4 py-2 rounded-lg w-96">
          <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="بحث سريع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      {/* Right side - Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-[hsl(var(--primary))] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">المسؤول</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">admin@pharmacy.iq</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 text-right hover:bg-[hsl(var(--accent))] flex items-center gap-3 text-sm"
              >
                <User className="h-4 w-4" />
                الملف الشخصي
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full px-4 py-2 text-right hover:bg-[hsl(var(--accent))] flex items-center gap-3 text-sm"
              >
                <Settings className="h-4 w-4" />
                الإعدادات
              </button>
              <div className="border-t border-[hsl(var(--border))] my-2" />
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="w-full px-4 py-2 text-right hover:bg-[hsl(var(--accent))] flex items-center gap-3 text-sm text-red-600"
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
