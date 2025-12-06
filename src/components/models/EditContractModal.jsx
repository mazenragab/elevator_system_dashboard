// src/components/modals/EditContractModal.jsx
import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import { useToast } from '../../hooks/useToast';

const EditContractModal = ({ isOpen, onClose, contract, onSubmit, isLoading }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    contractNumber: '',
    contractType: '',
    startDate: '',
    endDate: '',
    slaResponseTimeHours: '',
    slaResolutionTimeHours: '',
    isActive: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (contract) {
      const startDate = contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '';
      const endDate = contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '';
      
      setFormData({
        contractNumber: contract.contractNumber || '',
        contractType: contract.contractType || '',
        startDate: startDate,
        endDate: endDate,
        slaResponseTimeHours: contract.slaResponseTimeHours?.toString() || '24',
        slaResolutionTimeHours: contract.slaResolutionTimeHours?.toString() || '72',
        isActive: contract.isActive?.toString() || 'true'
      });
    }
  }, [contract]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.contractNumber) {
      errors.contractNumber = 'رقم العقد مطلوب';
    }
    
    if (!formData.contractType) {
      errors.contractType = 'نوع العقد مطلوب';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'تاريخ البدء مطلوب';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'تاريخ الانتهاء مطلوب';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
    }
    
    if (!formData.slaResponseTimeHours) {
      errors.slaResponseTimeHours = 'وقت الاستجابة مطلوب';
    } else if (parseInt(formData.slaResponseTimeHours) <= 0) {
      errors.slaResponseTimeHours = 'وقت الاستجابة يجب أن يكون أكبر من صفر';
    }
    
    if (!formData.slaResolutionTimeHours) {
      errors.slaResolutionTimeHours = 'وقت الحل مطلوب';
    } else if (parseInt(formData.slaResolutionTimeHours) <= 0) {
      errors.slaResolutionTimeHours = 'وقت الحل يجب أن يكون أكبر من صفر';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
      return;
    }
    
    const apiData = {
      contractNumber: formData.contractNumber,
      contractType: formData.contractType,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      slaResponseTimeHours: parseInt(formData.slaResponseTimeHours),
      slaResolutionTimeHours: parseInt(formData.slaResolutionTimeHours),
      isActive: formData.isActive === 'true'
    };
    
    onSubmit(contract.id, apiData);
  };

  const formatContractType = (type) => {
    const types = {
      'FULL_MAINTENANCE': 'صيانة كاملة',
      'PREVENTIVE_ONLY': 'صيانة وقائية',
      'ON_DEMAND': 'حسب الطلب'
    };
    return types[type] || type;
  };

  if (!contract) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات العقد"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* معلومات العقد الأساسية */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">معرف العقد</label>
              <p className="text-gray-900 font-medium">{contract.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">العميل</label>
              <p className="text-gray-900 font-medium">{contract.client?.user?.fullName || 'غير محدد'}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">نوع العقد الحالي</label>
              <p className="text-gray-900 font-medium">{formatContractType(contract.contractType)}</p>
            </div>
          </div>
        </div>

        {/* تحذير */}
        <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            تغيير تواريخ العقد قد يؤثر على العقود والمصاعد المرتبطة
          </p>
        </div>

        {/* حقول التعديل */}
        <div className="space-y-4">
          <Input
            label="رقم العقد *"
            name="contractNumber"
            value={formData.contractNumber}
            onChange={handleChange}
            required
            error={validationErrors.contractNumber}
            leftIcon={<FileText size={18} />}
            placeholder="CTR-2024-XXXX"
          />
          
          <Select
            label="نوع العقد *"
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            required
            error={validationErrors.contractType}
            options={[
              { value: '', label: 'اختر نوع العقد' },
              { value: 'FULL_MAINTENANCE', label: 'صيانة كاملة' },
              { value: 'PREVENTIVE_ONLY', label: 'صيانة وقائية' },
              { value: 'ON_DEMAND', label: 'حسب الطلب' }
            ]}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="تاريخ البدء *"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              error={validationErrors.startDate}
              leftIcon={<Calendar size={18} />}
            />
            
            <Input
              label="تاريخ الانتهاء *"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              error={validationErrors.endDate}
              leftIcon={<Calendar size={18} />}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="وقت الاستجابة (ساعة) *"
              name="slaResponseTimeHours"
              type="number"
              min="1"
              value={formData.slaResponseTimeHours}
              onChange={handleChange}
              required
              error={validationErrors.slaResponseTimeHours}
              leftIcon={<Clock size={18} />}
            />
            
            <Input
              label="وقت الحل (ساعة) *"
              name="slaResolutionTimeHours"
              type="number"
              min="1"
              value={formData.slaResolutionTimeHours}
              onChange={handleChange}
              required
              error={validationErrors.slaResolutionTimeHours}
              leftIcon={<Clock size={18} />}
            />
          </div>
          
          <Select
            label="حالة العقد"
            name="isActive"
            value={formData.isActive}
            onChange={handleChange}
            options={[
              { value: 'true', label: 'نشط' },
              { value: 'false', label: 'غير نشط' }
            ]}
          />
        </div>

        {/* معلومات إضافية */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات العقد الحالية:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">المصاعد المشمولة</label>
              <p className="text-sm font-medium">{contract._count?.contractElevators || 0}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">طلبات الصيانة</label>
              <p className="text-sm font-medium">{contract._count?.maintenanceRequests || 0}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">المستندات</label>
              <p className="text-sm font-medium">{contract._count?.contractDocuments || 0}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">تاريخ الإنشاء</label>
              <p className="text-sm font-medium">
                {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                جاري التحديث...
              </>
            ) : (
              'تحديث بيانات العقد'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditContractModal;