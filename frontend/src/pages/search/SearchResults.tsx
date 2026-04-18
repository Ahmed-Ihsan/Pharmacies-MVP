import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ScanBarcode, Pill, Tag, X, Loader2, AlertCircle } from 'lucide-react';
import { useLookup } from '../../hooks/useLookup';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { TRANSLATIONS } from '../../utils/constants';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [ndcNumber, setNdcNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'ndc' | 'barcode'>('general');

  const { results, loading, error, search, lookupByNdc, lookupByBarcode } = useLookup();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      search(q);
    }
  }, []);

  const handleSearch = () => {
    if (query.trim()) search(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleNdcLookup = () => {
    if (ndcNumber.trim()) lookupByNdc(ndcNumber);
  };

  const handleBarcodeLookup = () => {
    if (barcode.trim()) lookupByBarcode(barcode);
  };

  const totalResults = results.generics.length + results.brands.length;
  const hasResults = totalResults > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <Search className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">
            {TRANSLATIONS.search}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
            ابحث عن الأدوية باسمها أو بالباركود أو رقم NDC
          </p>
        </div>
      </div>

      {/* Search Tabs */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
        {/* Tab Nav */}
        <div className="flex border-b border-[hsl(var(--border))]">
          {[
            { key: 'general', label: 'بحث عام', icon: Search },
            { key: 'ndc', label: 'رقم NDC', icon: ScanBarcode },
            { key: 'barcode', label: 'الباركود', icon: ScanBarcode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ابحث بالاسم العلمي أو التجاري..."
                  className="w-full h-12 pr-12 pl-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                loading={loading}
                className="bg-gradient-to-l from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-6 rounded-xl shadow-md"
              >
                <Search className="h-4 w-4" />
                {TRANSLATIONS.search_action}
              </Button>
            </div>
          )}

          {activeTab === 'ndc' && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <ScanBarcode className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={ndcNumber}
                  onChange={(e) => setNdcNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNdcLookup()}
                  placeholder="أدخل رقم NDC..."
                  dir="ltr"
                  className="w-full h-12 pr-12 pl-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all font-mono"
                />
              </div>
              <Button
                onClick={handleNdcLookup}
                loading={loading}
                className="bg-gradient-to-l from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-6 rounded-xl shadow-md"
              >
                <Search className="h-4 w-4" />
                بحث NDC
              </Button>
            </div>
          )}

          {activeTab === 'barcode' && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <ScanBarcode className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup()}
                  placeholder="امسح أو أدخل رقم الباركود..."
                  dir="ltr"
                  className="w-full h-12 pr-12 pl-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all font-mono"
                />
              </div>
              <Button
                onClick={handleBarcodeLookup}
                loading={loading}
                className="bg-gradient-to-l from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-6 rounded-xl shadow-md"
              >
                <ScanBarcode className="h-4 w-4" />
                بحث بالباركود
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-[hsl(var(--muted-foreground))]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>جاري البحث...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Summary */}
      {hasResults && !loading && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            تم العثور على
          </span>
          <span className="text-sm font-bold text-[hsl(var(--foreground))]">
            {totalResults.toLocaleString('ar-IQ')} نتيجة
          </span>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-6">
          {/* Generics Results */}
          {results.generics.length > 0 && (
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(var(--border))] bg-blue-50/50">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  الأدوية الجنيسة
                </h3>
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {results.generics.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {results.generics.map((generic) => {
                  const genericId = generic.generic_id ?? generic.id;
                  const genericName = generic.generic_name ?? generic.scientific_name ?? '';
                  return (
                    <Link
                      key={genericId}
                      to={`/generics/${genericId}`}
                      className="group block p-4 bg-[hsl(var(--muted))]/40 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Pill className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[hsl(var(--foreground))] truncate">{genericName}</p>
                          {generic.chemical_name && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">
                              {generic.chemical_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brands Results */}
          {results.brands.length > 0 && (
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(var(--border))] bg-green-50/50">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  الأدوية التجارية
                </h3>
                <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {results.brands.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {results.brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brands/${brand.id}`}
                    className="group block p-4 bg-[hsl(var(--muted))]/40 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 group-hover:bg-green-600 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Tag className="h-4 w-4 text-green-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[hsl(var(--foreground))] truncate">{brand.name}</p>
                        {brand.generic_name && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">
                            {brand.generic_name}
                          </p>
                        )}
                        {brand.manufacturer_name && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {brand.manufacturer_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasResults && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center mb-5">
            <Search className="h-10 w-10 text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">ابدأ البحث</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
            أدخل اسم الدواء أو رقم NDC أو الباركود للعثور على النتائج
          </p>
        </div>
      )}
    </div>
  );
}
