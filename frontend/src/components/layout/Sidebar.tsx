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
          "fixed lg:static inset-y-0 right-0 z-40 w-64 transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "bg-[hsl(var(--card))] border-l border-[hsl(var(--border))]",
          "flex flex-col",
          "shadow-[var(--shadow-md)]"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[hsl(var(--border))] shrink-0">
            <div className="h-9 w-9 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[hsl(var(--foreground))] truncate leading-tight">
                نظام إدارة الأدوية
              </p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-tight">
                Pharmacy Management
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                    'cursor-pointer select-none',
                    isActive
                      ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-semibold'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[hsl(var(--primary))] rounded-l-full" />
                    )}
                    <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-[hsl(var(--primary))]" : "")} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-[hsl(var(--border))] shrink-0">
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-center">
              © 2025 نظام إدارة الأدوية
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
