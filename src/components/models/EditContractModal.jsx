import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Loading from '../ui/Loading';
import { Check, X, AlertTriangle } from 'lucide-react';

const EditContractForm = ({ contract, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    contractNumber: '',
    contractType: '',
    startDate: '',
    endDate: '',
    slaResponseTimeHours: '',
    slaResolutionTimeHours: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with contract data
  useEffect(() => {
    if (contract) {
      setFormData({
        contractNumber: contract.contractNumber || '',
        contractType: contract.contractType || 'FULL_MAINTENANCE',
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        slaResponseTimeHours: contract.slaResponseTimeHours || 24,
        slaResolutionTimeHours: contract.slaResolutionTimeHours || '',
        isActive: contract.isActive || true
      });
    }
  }, [contract]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges) {
      onCancel();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate dates
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) {
          throw new Error('تاريخ الإنتهاء يجب أن يكون بعد تاريخ البدء');
        }
      }

      await onSubmit(contract.id, {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        slaResolutionTimeHours: formData.slaResolutionTimeHours || null
      });
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث العقد');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      contractNumber: contract.contractNumber || '',
      contractType: contract.contractType || 'FULL_MAINTENANCE',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      slaResponseTimeHours: contract.slaResponseTimeHours || 24,
      slaResolutionTimeHours: contract.slaResolutionTimeHours || '',
      isActive: contract.isActive || true
    });
    setHasChanges(false);
    setError(null);
  };

  if (!contract) {
    return (
      <div className="text-center py-8">
        <Loading size="lg" />
        <p className="text-gray-500 mt-4">جاري تحميل بيانات العقد...</p>
      </div>
    );
  }

  const daysRemaining = Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* معلومات العقد الحالية */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-800">عقد #{contract.contractNumber}</h4>
            <p className="text-sm text-blue-600">
              العميل: {contract.client?.user?.fullName || 'غير محدد'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">
              {contract._count?.contractElevators || 0} مصاعد
            </p>
            <p className={`text-sm font-medium ${daysRemaining <= 30 ? 'text-red-600' : 'text-green-600'}`}>
              {daysRemaining} يوم متبقي
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* رقم العقد */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم العقد
          </label>
          <Input
            name="contractNumber"
            value={formData.contractNumber}
            onChange={handleInputChange}
            placeholder="رقم العقد"
          />
          <p className="text-xs text-gray-500 mt-1">
            يجب أن يكون فريداً
          </p>
        </div>

        {/* نوع العقد */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع العقد
          </label>
          <Select
            name="contractType"
            value={formData.contractType}
            onChange={handleInputChange}
            options={[
              { value: 'FULL_MAINTENANCE', label: 'صيانة كاملة' },
              { value: 'PREVENTIVE_ONLY', label: 'صيانة وقائية' },
              { value: 'ON_DEMAND', label: 'حسب الطلب' }
            ]}
          />
        </div>

        {/* تاريخ البدء */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ البدء
          </label>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* تاريخ الإنتهاء */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الإنتهاء
          </label>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            min={formData.startDate}
          />
          {formData.endDate && formData.startDate && (
            <p className="text-xs text-gray-500 mt-1">
              مدة العقد: {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 30))} شهر
            </p>
          )}
        </div>

        {/* وقت الاستجابة SLA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وقت الاستجابة (ساعة)
          </label>
          <Select
            name="slaResponseTimeHours"
            value={formData.slaResponseTimeHours}
            onChange={handleInputChange}
            options={[
              { value: 1, label: '1 ساعة' },
              { value: 2, label: '2 ساعة' },
              { value: 4, label: '4 ساعات' },
              { value: 8, label: '8 ساعات' },
              { value: 24, label: '24 ساعة' },
              { value: 48, label: '48 ساعة' }
            ]}
          />
        </div>

        {/* وقت الحل SLA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وقت الحل (ساعة)
          </label>
          <Select
            name="slaResolutionTimeHours"
            value={formData.slaResolutionTimeHours}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'غير محدد' },
              { value: 24, label: '24 ساعة' },
              { value: 48, label: '48 ساعة' },
              { value: 72, label: '72 ساعة' },
              { value: 168, label: 'أسبوع (168 ساعة)' }
            ]}
          />
        </div>
      </div>

      {/* الحالة */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <div>
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            حالة العقد
          </label>
          <p className="text-xs text-gray-500">
            {formData.isActive ? 'العقد نشط وقابل للاستخدام' : 'العقد غير نشط'}
          </p>
        </div>
      </div>

      {/* معلومات المصاعد */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-amber-800">المصاعد المشمولة</h4>
            <p className="text-sm text-amber-600">
              {contract._count?.contractElevators || 0} مصاعد مرتبطة بالعقد
            </p>
          </div>
          <div className="text-sm text-amber-600">
            {contract._count?.maintenanceRequests || 0} طلبات صيانة
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          ملاحظة: لا يمكن تعديل المصاعد من هنا. استخدم قسم "المصاعد" لإضافة أو إزالة مصاعد.
        </p>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 justify-between pt-6 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || loading}
          >
            إعادة تعيين
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={18} className="mr-2" />
            إلغاء
          </Button>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={!hasChanges || loading}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري التحديث...
            </>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>

      {/* تحذيرات */}
      {hasChanges && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={18} />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">تحذير</h4>
              <p className="text-xs text-yellow-600 mt-1">
                أي تغييرات في تاريخ العقد قد تؤثر على الصلاحية والتغطية
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default EditContractForm;