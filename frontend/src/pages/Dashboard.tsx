import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Tag,
  Building2,
  FolderTree,
  Container,
  ArrowLeftRight,
  Search,
  Plus,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { TRANSLATIONS } from '../utils/constants';
import { genericService } from '../services/genericService';
import { brandService } from '../services/brandService';
import { manufacturerService } from '../services/manufacturerService';
import { therapeuticClassService } from '../services/therapeuticClassService';
import { dosageFormService } from '../services/dosageFormService';

interface DashboardStats {
  generics: number;
  brands: number;
  manufacturers: number;
  therapeuticClasses: number;
  dosageForms: number;
  alternatives: number;
  isLoaded: {
    generics: boolean;
    brands: boolean;
    manufacturers: boolean;
    therapeuticClasses: boolean;
    dosageForms: boolean;
    alternatives: boolean;
  };
}

const statCards = [
  {
    key: 'generics' as const,
    label: TRANSLATIONS.generics,
    icon: Pill,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    path: '/generics',
    description: 'إجمالي الأدوية الجنيسة'
  },
  {
    key: 'brands' as const,
    label: TRANSLATIONS.brands,
    icon: Tag,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    path: '/brands',
    description: 'الأدوية التجارية'
  },
  {
    key: 'manufacturers' as const,
    label: TRANSLATIONS.manufacturers,
    icon: Building2,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    path: '/manufacturers',
    description: 'الشركات المصنعة'
  },
  {
    key: 'therapeuticClasses' as const,
    label: TRANSLATIONS.therapeuticClasses,
    icon: FolderTree,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    path: '/therapeutic-classes',
    description: 'التصنيفات العلاجية'
  },
  {
    key: 'dosageForms' as const,
    label: TRANSLATIONS.dosageForms,
    icon: Container,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    path: '/dosage-forms',
    description: 'أشكال الجرعات'
  },
  {
    key: 'alternatives' as const,
    label: TRANSLATIONS.alternatives,
    icon: ArrowLeftRight,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    path: '/alternatives',
    description: 'البدائل العلاجية'
  },
];

const quickActions = [
  { label: 'بحث عن دواء',       icon: Search, path: '/search' },
  { label: 'إضافة دواء جنيس',   icon: Plus,   path: '/generics/new' },
  { label: 'إضافة دواء تجاري',  icon: Plus,   path: '/brands/new' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    generics: 0,
    brands: 0,
    manufacturers: 0,
    therapeuticClasses: 0,
    dosageForms: 0,
    alternatives: 0,
    isLoaded: {
      generics: false,
      brands: false,
      manufacturers: false,
      therapeuticClasses: false,
      dosageForms: false,
      alternatives: false,
    }
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const fetchPromises = [
      genericService.list({ limit: 1 })
        .then(r => setStats(prev => ({
          ...prev,
          generics: r.total,
          isLoaded: { ...prev.isLoaded, generics: true }
        })))
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, generics: true } }))),

      brandService.list({ limit: 1 })
        .then(r => setStats(prev => ({
          ...prev,
          brands: r.total,
          isLoaded: { ...prev.isLoaded, brands: true }
        })))
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, brands: true } }))),

      manufacturerService.list({ limit: 1 })
        .then(r => setStats(prev => ({
          ...prev,
          manufacturers: r.total,
          isLoaded: { ...prev.isLoaded, manufacturers: true }
        })))
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, manufacturers: true } }))),

      therapeuticClassService.list({ limit: 1 })
        .then(r => setStats(prev => ({
          ...prev,
          therapeuticClasses: r.total,
          isLoaded: { ...prev.isLoaded, therapeuticClasses: true }
        })))
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, therapeuticClasses: true } }))),

      dosageFormService.list({ limit: 1 })
        .then(r => setStats(prev => ({
          ...prev,
          dosageForms: r.total,
          isLoaded: { ...prev.isLoaded, dosageForms: true }
        })))
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, dosageForms: true } }))),

      genericService.list({ limit: 1000 })
        .then(async (r) => {
          let alternativesCount = 0;
          for (const generic of r.items) {
            if (generic.id) {
              try {
                const alts = await genericService.getAlternatives(generic.id);
                alternativesCount += alts.length;
              } catch {}
            }
          }
          setStats(prev => ({
            ...prev,
            alternatives: alternativesCount,
            isLoaded: { ...prev.isLoaded, alternatives: true }
          }));
        })
        .catch(() => setStats(prev => ({ ...prev, isLoaded: { ...prev.isLoaded, alternatives: true } }))),
    ];

    await Promise.all(fetchPromises);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const hasErrors = Object.keys(errors).length > 0;

  const totalItems = stats.generics + stats.brands + stats.manufacturers +
                     stats.therapeuticClasses + stats.dosageForms + stats.alternatives;

  const loadedCount = Object.values(stats.isLoaded).filter(Boolean).length;
  const progress = (loadedCount / 6) * 100;

  return (
    <div className="space-y-8 animate-slide-up-premium">
      {/* Welcome Banner - Luxury Glass with Purple Glow */}
      <div className="glass-panel glow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--primary)/0.08)] rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[hsl(var(--primary-accent)/0.06)] rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '1s' }} />
        <div className="relative p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
                مرحباً، المسؤول
              </h1>
              <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasErrors ? 'bg-amber-400 animate-pulse-glow' : 'bg-emerald-500 animate-pulse-glow'} shadow-lg`} />
                <span className="font-medium">{hasErrors ? 'بعض البيانات غير متاحة' : 'جميع الأنظمة تعمل بشكل طبيعي'}</span>
                {lastUpdated && (
                  <>
                    <span className="text-[hsl(var(--border))]">·</span>
                    <span>آخر تحديث {lastUpdated.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-[hsl(var(--muted-foreground))] glass-panel px-4 py-2 rounded-full border-[hsl(var(--border-lux))]">
                {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="btn-luxury-primary inline-flex items-center gap-2"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
                تحديث البيانات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress - Luxury Glass */}
      {loading && (
        <div className="card-luxury">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">جاري تحميل الإحصائيات...</span>
              <span className="text-xs font-bold gradient-text">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-accent))] rounded-full transition-[width] duration-500 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Luxury Glass Cards */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--border-lux))] to-transparent" />
          <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em]">
            إجراءات سريعة
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--border-lux))] to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={`${action.path}-${index}`} to={action.path}>
                <div className="card-luxury group cursor-pointer">
                  <div className="p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-accent))] group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shrink-0 shadow-lg">
                      <Icon className="h-5.5 w-5.5 text-white" />
                    </div>
                    <span className="font-semibold text-[hsl(var(--foreground))] text-sm group-hover:gradient-text transition-colors duration-300">{action.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Cards - Asymmetric Bento Grid with Luxury Glass */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--border-lux))] to-transparent" />
          <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em]">
            نظرة عامة على النظام
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--border-lux))] to-transparent" />
        </div>
        <div className="bento-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const value = stats[card.key];
            const isLoaded = stats.isLoaded[card.key];
            const hasError = errors[card.key];

            // Asymmetric layout: first card spans 2 columns on desktop
            const isFeatured = index === 0;
            const gridClass = isFeatured ? 'bento-span-2' : '';

            return (
              <Link key={card.key} to={card.path} className={gridClass}>
                <div className="card-luxury group h-full cursor-pointer">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary-accent)/0.1)]`}>
                        <Icon className="h-7 w-7 text-[hsl(var(--primary))]" />
                      </div>
                      {hasError && <AlertCircle className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.15em] mb-4">{card.label}</p>
                      {!isLoaded ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-32 rounded-xl" />
                          <Skeleton className="h-4 w-40 rounded-lg" />
                        </div>
                      ) : (
                        <>
                          <p className="text-5xl font-bold gradient-text leading-none mb-3 group-hover:scale-105 transition-transform duration-300 origin-right">
                            {hasError ? '—' : value.toLocaleString('ar-IQ')}
                          </p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{card.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Total Summary Footer - Luxury Glass with Accent */}
      <div className="card-luxury border-t-2 border-t-[hsl(var(--primary))]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary-accent)/0.15)] flex items-center justify-center shadow-lg border border-[hsl(var(--border-lux))]">
                <TrendingUp className="h-7 w-7 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">إجمالي العناصر في النظام</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {loading ? 'جاري الحساب...' : <span className="gradient-text font-bold text-lg">{totalItems.toLocaleString('ar-IQ')} عنصر مسجل</span>}
                </p>
              </div>
            </div>
            {hasErrors && (
              <div className="inline-flex items-center gap-2.5 px-5 py-3 glass-panel border border-amber-500/30 rounded-xl text-sm text-amber-400 font-semibold">
                <AlertCircle className="h-4.5 w-4.5" />
                بعض البيانات غير متاحة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
