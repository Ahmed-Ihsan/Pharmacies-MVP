import { User, Mail, Shield, Calendar, Edit2, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">الملف الشخصي</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">إدارة معلومات حسابك الشخصي</p>
      </div>

      {/* Profile Hero Card */}
      <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] to-indigo-700 rounded-2xl p-8 text-white overflow-hidden shadow-xl shadow-[hsl(var(--primary))]/20">
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/2 translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
              <User className="h-12 w-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-[hsl(var(--primary))] hover:scale-110 transition-transform">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">المسؤول</h2>
            <p className="text-white/80 text-sm mt-1">admin@pharmacy.iq</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                <Shield className="h-3 w-3" />
                مسؤول النظام
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/20 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-200 border border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                نشط
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6">
          <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--primary))]" />
            المعلومات الشخصية
          </h3>
          <div className="space-y-4">
            {[
              { icon: User, label: 'الاسم', value: 'المسؤول' },
              { icon: Mail, label: 'البريد الإلكتروني', value: 'admin@pharmacy.iq' },
              { icon: Shield, label: 'الدور', value: 'مسؤول النظام' },
              { icon: Calendar, label: 'تاريخ الإنشاء', value: 'يناير 2024' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--muted))]/40 hover:bg-[hsl(var(--accent))]/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Actions */}
        <div className="space-y-4">
          {/* Account Security */}
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
              أمان الحساب
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">آخر تسجيل دخول</span>
                <span className="font-medium text-[hsl(var(--foreground))]">اليوم</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">المصادقة الثنائية</span>
                <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-full">غير مفعلة</span>
              </div>
              <div className="h-px bg-[hsl(var(--border))]" />
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/60 transition-colors text-right">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">تغيير كلمة المرور</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">تحديث كلمة المرور الخاصة بك</p>
                </div>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              إجراءات الحساب
            </h3>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
