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
import { Card, CardContent } from '../components/ui/card';
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner with Subtle Gradient Accent */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.05)] via-[hsl(var(--card))] to-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-[var(--shadow-sm)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary)/0.03)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[hsl(var(--primary)/0.02)] rounded-full blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                مرحباً، المسؤول
              </h1>
              <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                <div className={`w-2 h-2 rounded-full shrink-0 ${hasErrors ? 'bg-amber-400' : 'bg-emerald-500'} shadow-sm`} />
                <span>{hasErrors ? 'بعض البيانات غير متاحة' : 'جميع الأنظمة تعمل بشكل طبيعي'}</span>
                {lastUpdated && (
                  <>
                    <span className="text-[hsl(var(--border))]">·</span>
                    <span>آخر تحديث {lastUpdated.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-3 py-1.5 rounded-lg">
                {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(217_88%_44%)] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث البيانات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress with Gradient */}
      {loading && (
        <Card className="border-[hsl(var(--border))] shadow-[var(--shadow-sm)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">جاري تحميل الإحصائيات...</span>
              <span className="text-xs font-semibold text-[hsl(var(--primary))]">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(217_88%_60%)] rounded-full transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Compact Design */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
          <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
            إجراءات سريعة
          </h2>
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={`${action.path}-${index}`} to={action.path}>
                <Card className="group border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[hsl(var(--primary))] group-hover:bg-[hsl(217_88%_48%)] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="font-semibold text-[hsl(var(--foreground))] text-sm group-hover:text-[hsl(var(--primary))] transition-colors">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Cards - Larger Numbers & Icon Containers */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
          <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
            نظرة عامة على النظام
          </h2>
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key];
            const isLoaded = stats.isLoaded[card.key];
            const hasError = errors[card.key];

            return (
              <Link key={card.key} to={card.path}>
                <Card className="group border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer shadow-[var(--shadow-sm)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${card.iconBg} p-4 rounded-xl group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      {hasError && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">{card.label}</p>
                      {!isLoaded ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-28 rounded-lg" />
                          <Skeleton className="h-3 w-32 rounded" />
                        </div>
                      ) : (
                        <>
                          <p className="text-4xl font-bold text-[hsl(var(--foreground))] leading-none mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                            {hasError ? '—' : value.toLocaleString('ar-IQ')}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{card.description}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Total Summary Footer with Accent Border */}
      <Card className="border-[hsl(var(--border))] border-t-[hsl(var(--primary)/0.3)] shadow-[var(--shadow-sm)]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">إجمالي العناصر في النظام</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {loading ? 'جاري الحساب...' : `${totalItems.toLocaleString('ar-IQ')} عنصر مسجل`}
                </p>
              </div>
            </div>
            {hasErrors && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
                <AlertCircle className="h-4 w-4" />
                بعض البيانات غير متاحة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
