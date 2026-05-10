import { useState, useEffect } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import { alternativeService } from '../../services/alternativeService';
import type { GenericAlternativeWithNames } from '../../types/alternative';
import Loading from '../../components/common/Loading';

export default function AlternativesList() {
  const [alternatives, setAlternatives] = useState<GenericAlternativeWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlternatives();
  }, []);

  const fetchAlternatives = async () => {
    setLoading(true);
    try {
      const data = await alternativeService.list();
      setAlternatives(data.items);
    } catch (err) {
      console.error('Failed to fetch alternatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlternatives = alternatives.filter(alt =>
    alt.primary_generic?.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alt.alternative_generic?.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading text="جاري تحميل البدائل..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <ArrowLeftRight className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            البدائل الجنيسية
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">الأدوية البديلة لنفس المادة الفعالة</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="بحث باسم الدواء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      {/* List */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]">
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الدواء الأساسي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">البديل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlternatives.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <ArrowLeftRight className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <p className="text-lg font-semibold text-[hsl(var(--foreground))]">لا توجد بدائل</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">يمكنك إضافة بدائل من صفحة تفاصيل الأدوية الجنيسة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlternatives.map(alt => (
                  <tr key={alt.alternative_id} className="border-t border-[hsl(var(--border-lux))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[hsl(var(--foreground))]">
                      {alt.primary_generic?.generic_name || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-[hsl(var(--primary))]">
                      {alt.alternative_generic?.generic_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {alt.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
