import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Palette, Globe, Database, Shield, Check, ChevronDown } from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pr-4 pl-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-sm text-[hsl(var(--foreground))] appearance-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
      </div>
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    system: true,
    inventory: false,
  });
  const [theme, setTheme] = useState('فاتح');
  const [language, setLanguage] = useState('العربية');
  const [timezone, setTimezone] = useState('بغداد (GMT+3)');
  const [currency, setCurrency] = useState('دينار عراقي (IQD)');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'الإشعارات',
      description: 'إدارة إشعارات النظام والتنبيهات',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      content: (
        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'إشعارات البريد الإلكتروني', desc: 'تلقي إشعارات عبر البريد' },
            { key: 'system' as const, label: 'إشعارات النظام', desc: 'إشعارات داخل التطبيق' },
            { key: 'inventory' as const, label: 'تنبيهات المخزون', desc: 'عند نفاد المخزون' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--muted))]/40 hover:bg-[hsl(var(--accent))]/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                checked={notifications[item.key]}
                onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'appearance',
      icon: Palette,
      title: 'المظهر',
      description: 'تخصيص مظهر التطبيق',
      color: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      content: (
        <div className="space-y-4">
          <SelectField
            label="وضع العرض"
            value={theme}
            options={['فاتح', 'داكن', 'تلقائي']}
            onChange={setTheme}
          />
          <SelectField
            label="اللغة"
            value={language}
            options={['العربية', 'English']}
            onChange={setLanguage}
          />
        </div>
      ),
    },
    {
      id: 'regional',
      icon: Globe,
      title: 'الإقليمي',
      description: 'المنطقة الزمنية والعملة',
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      content: (
        <div className="space-y-4">
          <SelectField
            label="المنطقة الزمنية"
            value={timezone}
            options={['بغداد (GMT+3)', 'الرياض (GMT+3)', 'القاهرة (GMT+2)', 'دبي (GMT+4)']}
            onChange={setTimezone}
          />
          <SelectField
            label="العملة"
            value={currency}
            options={['دينار عراقي (IQD)', 'دولار أمريكي (USD)', 'يورو (EUR)']}
            onChange={setCurrency}
          />
        </div>
      ),
    },
    {
      id: 'data',
      icon: Database,
      title: 'البيانات',
      description: 'إدارة البيانات والنسخ الاحتياطي',
      color: 'from-sky-500 to-sky-600',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[hsl(var(--muted))]/40 text-center">
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">متصل</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">حالة قاعدة البيانات</p>
            </div>
            <div className="p-4 rounded-xl bg-[hsl(var(--muted))]/40 text-center">
              <p className="text-2xl font-bold text-emerald-600">اليوم</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">آخر نسخة احتياطية</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            <Database className="h-4 w-4" />
            إنشاء نسخة احتياطية الآن
          </button>
        </div>
      ),
    },
    {
      id: 'security',
      icon: Shield,
      title: 'الأمان',
      description: 'إعدادات الأمان وكلمة المرور',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'تغيير كلمة المرور', desc: 'تحديث كلمة المرور الخاصة بك بشكل دوري', color: 'hover:border-amber-300 hover:bg-amber-50' },
            { title: 'المصادقة الثنائية', desc: 'إضافة طبقة حماية إضافية لحسابك', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
            { title: 'سجل النشاط', desc: 'عرض سجل دخولك وعملياتك الأخيرة', color: 'hover:border-blue-300 hover:bg-blue-50' },
            { title: 'الجلسات النشطة', desc: 'إدارة الأجهزة المسجل دخولها', color: 'hover:border-violet-300 hover:bg-violet-50' },
          ].map((item) => (
            <button
              key={item.title}
              className={`p-4 border border-[hsl(var(--border))] rounded-xl text-right transition-all ${item.color}`}
            >
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">الإعدادات</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">تخصيص تجربة استخدام النظام</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-600/25'
              : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white shadow-[hsl(var(--primary))]/25'
          }`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              تم الحفظ
            </>
          ) : (
            <>
              <SettingsIcon className="h-4 w-4" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-5 border-b border-[hsl(var(--border))]">
                <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${section.iconColor}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-[hsl(var(--foreground))] text-sm">{section.title}</h2>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{section.description}</p>
                </div>
              </div>
              {/* Section Content */}
              <div className="p-5">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
