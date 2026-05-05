import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';

export interface WizardField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  ltr?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  validate?: (v: string) => string | null;
  disabled?: boolean;
}

export interface WizardStep {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  fields: WizardField[];
  accentColor?: string; // tailwind gradient classes e.g. 'from-violet-500 to-violet-700'
}

interface QuickInputWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  steps: WizardStep[];
  initialValues?: Record<string, string>;
  title: string;
  submitLabel?: string;
  isEdit?: boolean;
}

/* ────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────── */
export default function QuickInputWizard({
  onSubmit,
  onCancel,
  steps,
  initialValues = {},
  title,
  submitLabel = 'حفظ',
  isEdit = false,
}: QuickInputWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  /* auto-focus first field on step change */
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [currentStep]);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const accentColor = step.accentColor || 'from-blue-500 to-blue-700';

  /* ── validation ── */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    step.fields.forEach((f) => {
      const val = (values[f.key] || '').trim();
      if (f.required && !val) {
        newErrors[f.key] = `${f.label} مطلوب`;
      } else if (f.validate) {
        const msg = f.validate(val);
        if (msg) newErrors[f.key] = msg;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── navigation ── */
  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((p) => p + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((p) => p - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
      setCompleted(true);
      setTimeout(() => onCancel?.(), 1200);
    } catch {
      /* errors surfaced by parent toast */
    } finally {
      setSubmitting(false);
    }
  };

  /* ── field change ── */
  const set = (key: string, val: string) => {
    setValues((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
  };

  /* ── keyboard nav ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel?.();
    if (e.key === 'Enter' && e.ctrlKey) {
      isLastStep ? handleSubmit() : handleNext();
    }
  };

  /* ────────────────────────────────────────────────────
     Render helpers
  ──────────────────────────────────────────────────── */
  let refAssigned = false;
  const getRef = () => {
    if (!refAssigned) {
      refAssigned = true;
      return (el: any) => { firstInputRef.current = el; };
    }
    return undefined;
  };

  const renderField = (field: WizardField) => {
    const val = values[field.key] || '';
    const err = errors[field.key];
    const baseClass = cn(
      'w-full h-12 px-4 rounded-xl border text-sm transition-all duration-200 outline-none',
      'bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))]',
      'placeholder:text-[hsl(var(--muted-foreground))]',
      err
        ? 'border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400'
        : 'border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]',
      field.disabled && 'opacity-50 cursor-not-allowed',
    );

    if (field.type === 'select') {
      return (
        <select
          ref={getRef() as any}
          value={val}
          onChange={(e) => set(field.key, e.target.value)}
          disabled={field.disabled}
          className={cn(baseClass, 'cursor-pointer')}
          aria-label={field.label}
        >
          <option value="">-- {field.placeholder || `اختر ${field.label}`} --</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          ref={getRef() as any}
          value={val}
          onChange={(e) => set(field.key, e.target.value)}
          placeholder={field.placeholder || field.label}
          dir={field.ltr ? 'ltr' : 'rtl'}
          rows={4}
          className={cn(baseClass, 'h-auto py-3 resize-none')}
          aria-label={field.label}
        />
      );
    }

    return (
      <input
        ref={getRef() as any}
        type={field.type}
        value={val}
        onChange={(e) => set(field.key, e.target.value)}
        placeholder={field.placeholder || field.label}
        dir={field.ltr ? 'ltr' : 'rtl'}
        disabled={field.disabled}
        className={baseClass}
        aria-label={field.label}
      />
    );
  };

  /* ── success state ── */
  if (completed) {
    return (
      <div className="w-full bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-[2rem] p-12 flex flex-col items-center gap-6 animate-bounce-in">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl animate-pulse-glow" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Check className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تم التحديث بنجاح!' : 'تمت الإضافة بنجاح!'}
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            تم حفظ البيانات بنجاح
          </p>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────
     Main render
  ──────────────────────────────────────────────────── */
  return (
    <div
      className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden border border-[hsl(var(--border))] animate-scale-in"
      onKeyDown={handleKeyDown}
      role="form"
      aria-label={title}
    >
      {/* ── gradient header ── */}
      <div className={`relative bg-gradient-to-l ${accentColor} p-8 text-white overflow-hidden`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex items-center gap-4 mb-6">
          {step.icon && (
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg ring-1 ring-white/30">
              {step.icon}
            </div>
          )}
          <div>
            <p className="text-xs text-white/90 font-semibold tracking-wider uppercase mb-1">
              الخطوة {currentStep + 1} من {totalSteps}
            </p>
            <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
            {step.subtitle && <p className="text-sm text-white/90 font-medium">{step.subtitle}</p>}
          </div>
        </div>

        {/* Professional progress bar with glow */}
        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Numbered step indicators */}
        <div className="flex items-center gap-3 mt-6 justify-center">
          {steps.map((_, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            const isFuture = i > currentStep;
            
            return (
              <div key={i} className="flex items-center gap-2">
                {/* Step circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-white text-emerald-600 shadow-lg scale-110',
                    isCurrent && 'bg-white text-white shadow-xl scale-110 ring-4 ring-white/30',
                    isFuture && 'bg-white/20 text-white/85'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {/* Connector line (not for last step) */}
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-8 h-0.5 rounded-full transition-all duration-300',
                      isCompleted ? 'bg-white/60' : 'bg-white/20'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── fields with better spacing ── */}
      <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto">
        {step.fields.map((field, idx) => (
          <div 
            key={field.key} 
            className="animate-fade-in space-y-2"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
              {field.label}
              {field.required && (
                <span className="text-red-500 text-xs font-bold">*</span>
              )}
            </label>

            {renderField(field)}

            {field.hint && !errors[field.key] && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                <Sparkles className="h-3 w-3" />
                <span>{field.hint}</span>
              </div>
            )}
            {errors[field.key] && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500 font-medium animate-fade-in bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <X className="h-3 w-3" />
                <span>{errors[field.key]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── footer nav with glass effect ── */}
      <div className="px-8 pb-8 flex items-center justify-between gap-4 border-t border-[hsl(var(--border))]/50 pt-6 bg-gradient-to-b from-transparent to-[hsl(var(--muted))]/20">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/50 px-3 py-2 rounded-lg">
          <span className="font-mono">⌘</span>
          <span>+</span>
          <span className="font-mono">Enter</span>
          <span className="mr-1">للمتابعة</span>
        </div>
        
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--primary))] transition-all duration-200 active:scale-[0.98]"
            >
              <ArrowRight className="h-4 w-4" />
              السابق
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-l ${accentColor} hover:shadow-xl hover:shadow-${accentColor.split(' ')[1]}/30 transition-all duration-200 active:scale-[0.98]`}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-l ${accentColor} hover:shadow-xl hover:shadow-${accentColor.split(' ')[1]}/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {submitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />}
              {submitting ? 'جاري الحفظ...' : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
