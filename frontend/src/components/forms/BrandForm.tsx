import { useState, useEffect } from 'react';
import { Package, Save, X, Pill, Building2, Beaker, Barcode, Hash, Box, Scale, FileText, AlertCircle, RefreshCw, Info } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { TRANSLATIONS } from '../../utils/constants';
import { genericService } from '../../services/genericService';
import { manufacturerService } from '../../services/manufacturerService';
import { CodeGenerator } from '../../utils/codeGenerator';

interface BrandFormProps {
  initialData?: {
    brand_name?: string;
    generic_id?: number;
    manufacturer_id?: number;
    dosage_form_id?: number;
    strength_value?: number;
    strength_unit?: string;
    package_size?: string;
    ndc_number?: string;
    barcode?: string;
    atc_code?: string;
    prescription_required?: boolean;
    storage_conditions?: string;
    route_of_administration?: string;
    status?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface SelectOption {
  id: number;
  name: string;
}

export default function BrandForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isEdit = false 
}: BrandFormProps) {
  const [brandName, setBrandName] = useState(initialData?.brand_name || '');
  const [genericId, setGenericId] = useState(initialData?.generic_id?.toString() || '');
  const [manufacturerId, setManufacturerId] = useState(initialData?.manufacturer_id?.toString() || '');
  const [dosageFormId, setDosageFormId] = useState(initialData?.dosage_form_id?.toString() || '');
  const [strengthValue, setStrengthValue] = useState(initialData?.strength_value?.toString() || '');
  const [strengthUnit, setStrengthUnit] = useState(initialData?.strength_unit || '');
  const [packageSize, setPackageSize] = useState(initialData?.package_size || '');
  const [ndcNumber, setNdcNumber] = useState(initialData?.ndc_number || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [atcCode, setAtcCode] = useState(initialData?.atc_code || '');
  const [prescriptionRequired, setPrescriptionRequired] = useState(initialData?.prescription_required ?? true);
  const [storageConditions, setStorageConditions] = useState(initialData?.storage_conditions || 'room_temperature');
  const [routeOfAdministration, setRouteOfAdministration] = useState(initialData?.route_of_administration || '');
  const [status, setStatus] = useState(initialData?.status || 'active');

  // Dropdown data
  const [generics, setGenerics] = useState<SelectOption[]>([]);
  const [manufacturers, setManufacturers] = useState<SelectOption[]>([]);
  const [dosageForms, setDosageForms] = useState<SelectOption[]>([
    { id: 1, name: 'Tablet' },
    { id: 2, name: 'Capsule' },
    { id: 3, name: 'Syrup' },
    { id: 4, name: 'Injection' },
    { id: 5, name: 'Cream' },
    { id: 6, name: 'Ointment' },
    { id: 7, name: 'Drops' },
    { id: 8, name: 'Inhaler' },
  ]);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [genericsResponse, manufacturersResponse] = await Promise.all([
          genericService.list({ limit: 100 }),
          manufacturerService.list({ limit: 100 }),
        ]);
        
        setGenerics(genericsResponse.items.map(g => ({
          id: g.generic_id || g.id || 0,
          name: g.generic_name || g.scientific_name || 'Unknown'
        })));
        
        setManufacturers(manufacturersResponse.items.map(m => ({
          id: m.manufacturer_id || m.id || 0,
          name: m.manufacturer_name || m.name || 'Unknown'
        })));
      } catch (err) {
        console.error('Failed to load dropdown data', err);
      } finally {
        setDropdownLoading(false);
      }
    };
    
    loadDropdownData();
  }, []);

  // Auto-generate codes on mount for new records
  useEffect(() => {
    if (!isEdit) {
      if (!ndcNumber) setNdcNumber(CodeGenerator.generateNdcNumber());
      if (!barcode) setBarcode(CodeGenerator.generateBarcode());
    }
  }, [isEdit]);

  const handleRegenerateNdc = () => setNdcNumber(CodeGenerator.generateNdcNumber());
  const handleRegenerateBarcode = () => setBarcode(CodeGenerator.generateBarcode());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      brand_name: brandName,
      generic_id: parseInt(genericId, 10),
    };

    if (manufacturerId) data.manufacturer_id = parseInt(manufacturerId, 10);
    if (dosageFormId) data.dosage_form_id = parseInt(dosageFormId, 10);
    if (strengthValue) data.strength_value = parseFloat(strengthValue);
    if (strengthUnit) data.strength_unit = strengthUnit;
    if (packageSize) data.package_size = packageSize;
    if (ndcNumber) data.ndc_number = ndcNumber;
    if (barcode) data.barcode = barcode;
    if (atcCode) data.atc_code = atcCode;
    if (prescriptionRequired !== undefined) data.prescription_required = prescriptionRequired;
    if (storageConditions) data.storage_conditions = storageConditions;
    if (routeOfAdministration) data.route_of_administration = routeOfAdministration;
    if (status) data.status = status;

    await onSubmit(data);
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: SelectOption[],
    icon: React.ReactNode,
    required = false,
    placeholder = 'اختر...'
  ) => (
    <div>
      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading || dropdownLoading}
          required={required}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 shadow-[var(--shadow-sm)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[hsl(var(--border))]">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل دواء تجاري' : 'إضافة دواء تجاري جديد'}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            أدخل بيانات الدواء التجاري بشكل صحيح
          </p>
        </div>
      </div>

      {dropdownLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <span className="text-blue-700">جاري تحميل البيانات...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields Section */}
        <div className="bg-purple-50/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">معلومات أساسية</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              الاسم التجاري (Brand Name) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="أدخل الاسم التجاري للدواء"
                required
                disabled={isLoading}
                className="pr-10"
              />
            </div>
          </div>

          {renderSelect(
            'الدواء الجنيس (Generic Drug)',
            genericId,
            setGenericId,
            generics,
            <Pill className="h-4 w-4" />,
            true,
            'اختر الدواء الجنيس...'
          )}
        </div>

        {/* Additional Info Section */}
        <div className="bg-gray-50/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect(
              'الشركة المصنعة',
              manufacturerId,
              setManufacturerId,
              manufacturers,
              <Building2 className="h-4 w-4" />,
              false,
              'اختر الشركة المصنعة...'
            )}

            {renderSelect(
              'شكل الجرعة',
              dosageFormId,
              setDosageFormId,
              dosageForms,
              <Beaker className="h-4 w-4" />,
              false,
              'اختر شكل الجرعة...'
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                قوة الجرعة
              </label>
              <div className="relative">
                <Scale className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="number"
                  step="0.01"
                  value={strengthValue}
                  onChange={(e) => setStrengthValue(e.target.value)}
                  placeholder="مثال: 10"
                  disabled={isLoading}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                وحدة القوة
              </label>
              <select
                value={strengthUnit}
                onChange={(e) => setStrengthUnit(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50"
              >
                <option value="">اختر الوحدة</option>
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
                <option value="g">g</option>
                <option value="mL">mL</option>
                <option value="IU">IU</option>
                <option value="units">units</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              حجم العبوة
            </label>
            <div className="relative">
              <Box className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="text"
                value={packageSize}
                onChange={(e) => setPackageSize(e.target.value)}
                placeholder="مثال: 30 tablets, 100 mL"
                disabled={isLoading}
                className="pr-10"
              />
            </div>
          </div>
        </div>

        {/* Codes Section */}
        <div className="bg-blue-50/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            الأكواد والأرقام
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                رقم NDC
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    type="text"
                    value={ndcNumber}
                    onChange={(e) => setNdcNumber(e.target.value)}
                    placeholder="XXXXX-XXXX-XX"
                    disabled={isLoading}
                    className="pr-10"
                  />
                </div>
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateNdc}
                    disabled={isLoading}
                    className="px-3"
                    title="توليد رقم جديد"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Info className="h-3.5 w-3.5" />
                <span>النمط: {CodeGenerator.getPatternDescription('ndc_number')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                الباركود
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="13 رقم"
                    disabled={isLoading}
                    className="pr-10"
                  />
                </div>
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateBarcode}
                    disabled={isLoading}
                    className="px-3"
                    title="توليد رقم جديد"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Info className="h-3.5 w-3.5" />
                <span>النمط: {CodeGenerator.getPatternDescription('barcode')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                رمز ATC
              </label>
              <div className="relative">
                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="text"
                  value={atcCode}
                  onChange={(e) => setAtcCode(e.target.value)}
                  placeholder="مثال: A01AA01"
                  disabled={isLoading}
                  className="pr-10"
                />
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Info className="h-3.5 w-3.5" />
                <span>النمط: {CodeGenerator.getPatternDescription('atc_code')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-green-50/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-green-900 mb-4">الإعدادات</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                ظروف التخزين
              </label>
              <select
                value={storageConditions}
                onChange={(e) => setStorageConditions(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50"
              >
                <option value="room_temperature">درجة حرارة الغرفة</option>
                <option value="refrigerated">مبرد (2-8°C)</option>
                <option value="frozen">مجمد (-20°C)</option>
                <option value="protected_from_light">محمي من الضوء</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                طريقة الإعطاء
              </label>
              <select
                value={routeOfAdministration}
                onChange={(e) => setRouteOfAdministration(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50"
              >
                <option value="">اختر...</option>
                <option value="oral">فموي</option>
                <option value="intravenous">وريدي</option>
                <option value="intramuscular">عضلي</option>
                <option value="subcutaneous">تحت الجلد</option>
                <option value="topical">موضعي</option>
                <option value="inhalation">استنشاق</option>
                <option value="rectal">مستقيمي</option>
                <option value="ophthalmic">عيني</option>
                <option value="otic">أذني</option>
                <option value="nasal">أنفي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                الحالة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50"
              >
                <option value="active">نشط</option>
                <option value="discontinued">متوقف</option>
                <option value="recalled">مسحوب</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={prescriptionRequired}
                onChange={(e) => setPrescriptionRequired(e.target.checked)}
                disabled={isLoading}
                className="w-5 h-5 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                يتطلب وصفة طبية (Rx)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-[hsl(var(--border))]">
          <Button
            type="submit"
            disabled={isLoading || !brandName || !genericId}
            className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-600 hover:shadow-lg transition-shadow px-8"
          >
            <Save className="h-4 w-4 ml-2" />
            {isLoading ? 'جاري الحفظ...' : TRANSLATIONS.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="px-8"
          >
            <X className="h-4 w-4 ml-2" />
            {TRANSLATIONS.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
