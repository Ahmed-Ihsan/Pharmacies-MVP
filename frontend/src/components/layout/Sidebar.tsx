import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Tag,
  Building2,
  FolderTree,
  Container,
  ArrowLeftRight,
  DollarSign,
  Search,
  Activity,
} from 'lucide-react';
import { TRANSLATIONS } from '../../utils/constants';
import { cn } from '../../utils/cn';

const navigation = [
  { name: TRANSLATIONS.dashboard, href: '/', icon: LayoutDashboard },
  { name: TRANSLATIONS.generics, href: '/generics', icon: Pill },
  { name: TRANSLATIONS.brands, href: '/brands', icon: Tag },
  { name: TRANSLATIONS.manufacturers, href: '/manufacturers', icon: Building2 },
  { name: TRANSLATIONS.therapeuticClasses, href: '/therapeutic-classes', icon: FolderTree },
  { name: TRANSLATIONS.dosageForms, href: '/dosage-forms', icon: Container },
  { name: TRANSLATIONS.alternatives, href: '/alternatives', icon: ArrowLeftRight },
  { name: TRANSLATIONS.prices, href: '/prices', icon: DollarSign },
  { name: TRANSLATIONS.search, href: '/search', icon: Search },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed lg:static inset-y-0 right-0 z-40 w-64 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "glass-panel border-l border-[hsl(var(--border-lux))]",
          "flex flex-col"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Luxury Glass with Glow */}
          <div className="h-20 px-5 flex items-center gap-4 border-b border-[hsl(var(--border-lux))] shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-accent))] flex items-center justify-center shadow-lg animate-pulse-glow">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold gradient-text truncate leading-tight">
                نظام إدارة الأدوية
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-tight font-medium">
                Pharmacy Management
              </p>
            </div>
          </div>

          {/* Navigation - Premium Styling */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group',
                    'cursor-pointer select-none',
                    isActive
                      ? 'bg-gradient-to-r from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary-accent)/0.1)] text-[hsl(var(--primary))] font-semibold shadow-md'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] hover:shadow-sm'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary-accent))] rounded-l-full shadow-lg" />
                    )}
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "text-[hsl(var(--primary))]" : "group-hover:scale-110")} />
                    <span className="transition-colors duration-300">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer - Luxury Glass */}
          <div className="px-5 py-4 border-t border-[hsl(var(--border-lux))] shrink-0">
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center font-medium">
              © 2025 نظام إدارة الأدوية
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
