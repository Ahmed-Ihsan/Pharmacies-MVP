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
          "fixed lg:static inset-y-0 right-0 z-40 w-64 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  نظام إدارة الأدوية
                </h1>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Pharmacy Management
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    'hover:bg-[hsl(var(--accent))] hover:shadow-sm',
                    isActive
                      ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/90 text-white shadow-md'
                      : 'text-[hsl(var(--muted-foreground))]'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[hsl(var(--border))]">
            <div className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted))]/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    الإصدار 1.0.0
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    جميع الحقوق محفوظة © 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
