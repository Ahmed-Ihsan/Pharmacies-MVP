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
  Menu,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../utils/constants';

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

export default function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch justify-around h-14 px-2">
          {navigation.slice(0, 5).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 flex-1 transition-colors duration-100',
                  isActive
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-[hsl(var(--primary)/0.1)]" : ""
                  )}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9px] font-medium leading-none">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="relative group flex-1 flex">
            <button
              className="flex flex-col items-center justify-center gap-0.5 px-2 w-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <div className="p-1.5 rounded-lg">
                <Menu className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-medium leading-none">المزيد</span>
            </button>

            <div
              className="absolute bottom-full right-0 mb-2 w-52 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-[var(--shadow-lg)] py-1.5 hidden group-hover:block z-50 animate-scale-in"
            >
              {navigation.slice(5).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      isActive
                        ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                        : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
