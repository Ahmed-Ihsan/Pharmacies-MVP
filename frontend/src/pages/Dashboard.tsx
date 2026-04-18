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
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
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
    gradient: 'from-slate-600 to-slate-800',
    hoverBorder: 'hover:border-slate-500',
    path: '/generics',
    description: 'إجمالي الأدوية الجنيسة'
  },
  {
    key: 'brands' as const,
    label: TRANSLATIONS.brands,
    icon: Tag,
    gradient: 'from-sky-600 to-sky-800',
    hoverBorder: 'hover:border-sky-500',
    path: '/brands',
    description: 'الأدوية التجارية'
  },
  {
    key: 'manufacturers' as const,
    label: TRANSLATIONS.manufacturers,
    icon: Building2,
    gradient: 'from-violet-600 to-violet-800',
    hoverBorder: 'hover:border-violet-500',
    path: '/manufacturers',
    description: 'الشركات المصنعة'
  },
  {
    key: 'therapeuticClasses' as const,
    label: TRANSLATIONS.therapeuticClasses,
    icon: FolderTree,
    gradient: 'from-amber-600 to-amber-800',
    hoverBorder: 'hover:border-amber-500',
    path: '/therapeutic-classes',
    description: 'التصنيفات العلاجية'
  },
  {
    key: 'dosageForms' as const,
    label: TRANSLATIONS.dosageForms,
    icon: Container,
    gradient: 'from-rose-600 to-rose-800',
    hoverBorder: 'hover:border-rose-500',
    path: '/dosage-forms',
    description: 'أشكال الجرعات'
  },
  {
    key: 'alternatives' as const,
    label: TRANSLATIONS.alternatives,
    icon: ArrowLeftRight,
    gradient: 'from-emerald-600 to-emerald-800',
    hoverBorder: 'hover:border-emerald-500',
    path: '/alternatives',
    description: 'البدائل العلاجية'
  },
];

const quickActions = [
  {
    label: 'بحث عن دواء',
    icon: Search,
    path: '/search',
    gradient: 'from-slate-700 to-slate-900',
    iconBg: 'bg-slate-600'
  },
  {
    label: 'إضافة دواء جنيس',
    icon: Plus,
    path: '/generics/new',
    gradient: 'from-sky-700 to-sky-900',
    iconBg: 'bg-sky-600'
  },
  {
    label: 'إضافة دواء تجاري',
    icon: Plus,
    path: '/brands/new',
    gradient: 'from-emerald-700 to-emerald-900',
    iconBg: 'bg-emerald-600'
  },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 animate-fade-in rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Welcome Section */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-2xl shadow-slate-500/20 overflow-hidden relative backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 backdrop-blur-sm" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full blur-3xl" />
          <CardContent className="p-10 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-lg shadow-white/10 drop-shadow-2xl drop-shadow-blue-500/20">
                    <Activity className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">مرحباً بك في النظام</h1>
                    <p className="text-white/80 text-lg font-medium">نظام إدارة الصيدليات المتطور</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3 text-white/90">
                    <div className={`w-3 h-3 rounded-full ${hasErrors ? 'bg-amber-400 animate-pulse shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'} shadow-lg`} />
                    <span className="font-medium">{hasErrors ? 'بعض البيانات غير متاحة' : 'جميع الأنظمة تعمل بشكل مثالي'}</span>
                  </div>
                  {lastUpdated && (
                    <div className="flex items-center gap-3 text-white/70">
                      <RefreshCw className="h-4 w-4" />
                      <span className="font-medium">آخر تحديث: {lastUpdated.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl shadow-white/10 border border-white/20">
                  <p className="text-xs text-white/70 mb-2 font-medium">التاريخ</p>
                  <p className="font-bold text-white text-lg">
                    {new Date().toLocaleDateString('ar-IQ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 rounded-xl text-white font-medium shadow-lg shadow-white/10 border border-white/20 hover:shadow-xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>تحديث البيانات</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Progress */}
        {loading && (
          <Card className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md border-[hsl(var(--border))] shadow-xl shadow-slate-500/10 hover:shadow-2xl hover:shadow-slate-500/20 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-[hsl(var(--foreground))]">جاري تحميل الإحصائيات...</span>
                <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] bg-slate-100 px-3 py-1 rounded-full">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full shadow-lg shadow-blue-500/30" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.path}>
                  <Card className={`bg-gradient-to-br ${action.gradient} border-0 shadow-xl shadow-slate-500/20 hover:shadow-2xl hover:shadow-slate-500/30 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:border-primary/50 rounded-2xl overflow-hidden relative backdrop-blur-md`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 flex items-center gap-5 relative">
                      <div className={`${action.iconBg} p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black/20 drop-shadow-2xl drop-shadow-blue-500/20`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="font-semibold text-white text-base group-hover:text-white/90 transition-colors">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Overview - Premium KPI Cards */}
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full shadow-lg shadow-emerald-500/30" />
            نظرة عامة على النظام
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              const value = stats[card.key];
              const isLoaded = stats.isLoaded[card.key];
              const hasError = errors[card.key];

              return (
                <Link key={card.key} to={card.path}>
                  <Card className={`bg-gradient-to-br from-white to-gray-50 backdrop-blur-md border-[hsl(var(--border))] shadow-xl shadow-slate-500/10 hover:shadow-2xl hover:shadow-slate-500/20 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden relative group hover:-translate-y-1 rounded-2xl`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl" />
                    <CardContent className="p-8 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`bg-gradient-to-br ${card.gradient} p-4 rounded-2xl shadow-xl shadow-black/20 group-hover:shadow-2xl group-hover:shadow-black/30 transition-all duration-300 group-hover:scale-105 drop-shadow-2xl drop-shadow-blue-500/20`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isLoaded && !hasError && (
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                          {hasError && (
                            <AlertCircle className="h-6 w-6 text-amber-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{card.label}</p>
                        {!isLoaded ? (
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-24 rounded-lg" />
                            <Skeleton className="h-4 w-32 rounded" />
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--foreground))]/90 transition-colors">
                              {hasError ? '-' : value.toLocaleString('ar-IQ')}
                            </p>
                            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{card.description}</p>
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

        {/* System Summary */}
        <Card className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md border-[hsl(var(--border))] shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-5 rounded-3xl shadow-xl shadow-emerald-500/30 drop-shadow-2xl drop-shadow-blue-500/20">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[hsl(var(--foreground))] text-2xl mb-2">إجمالي العناصر في النظام</h3>
                  <p className="text-[hsl(var(--muted-foreground))] font-medium text-lg">
                    {loading ? 'جاري الحساب...' : `${totalItems.toLocaleString('ar-IQ')} عنصر مسجل`}
                  </p>
                </div>
              </div>
              {hasErrors && (
                <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-lg shadow-amber-500/10 backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <span className="text-amber-700 font-semibold">بعض البيانات غير متاحة</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
