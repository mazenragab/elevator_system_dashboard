// src/components/modals/AddContractModal.jsx
import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import { useToast } from '../../hooks/useToast';
import { clientService } from '../../services/clientService';

const AddContractModal = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    contractNumber: '',
    clientId: '',
    contractType: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    slaResponseTimeHours: '24',
    slaResolutionTimeHours: '72',
    isActive: true
  });

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientService.getAllClients({ limit: 100 });
      setClients(response.data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.contractNumber) {
      errors.contractNumber = 'رقم العقد مطلوب';
    }
    
    if (!formData.clientId) {
      errors.clientId = 'العميل مطلوب';
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
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      slaResponseTimeHours: parseInt(formData.slaResponseTimeHours),
      slaResolutionTimeHours: parseInt(formData.slaResolutionTimeHours),
      isActive: formData.isActive === 'true'
    };
    
    console.log('Sending contract data to API:', apiData);
    onSubmit(apiData);
  };

  const resetForm = () => {
    setFormData({
      contractNumber: '',
      clientId: '',
      contractType: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      slaResponseTimeHours: '24',
      slaResolutionTimeHours: '72',
      isActive: true
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateSampleData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const clientsList = clients;
    if (clientsList.length > 0) {
      setFormData({
        contractNumber: `CTR-${new Date().getFullYear()}-${randomNum.toString().padStart(4, '0')}`,
        clientId: clientsList[0].id,
        contractType: 'FULL_MAINTENANCE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        slaResponseTimeHours: '24',
        slaResolutionTimeHours: '72',
        isActive: true
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة عقد جديد"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* تنبيه مهم */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 font-medium mb-1">مهم!</p>
              <p className="text-xs text-amber-600">
                العقود تُنشأ للعملاء الموجودين في النظام فقط
              </p>
            </div>
          </div>
        </div>

        {/* معلومات العقد الأساسية */}
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
            hint="يجب أن يكون رقم العقد فريداً"
          />
          
          {loadingClients ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">جاري تحميل قائمة العملاء...</p>
            </div>
          ) : (
            <Select
              label="العميل *"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              error={validationErrors.clientId}
              options={[
                { value: '', label: 'اختر عميلاً' },
                ...clients.map(client => ({
                  value: client.id,
                  label: `${client.user?.fullName || 'عميل'} (${client.id})`
                }))
              ]}
              leftIcon={<User size={18} />}
            />
          )}
          
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

        {/* زر توليد بيانات نموذجية */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSampleData}
            className="text-xs text-gray-600"
            disabled={clients.length === 0}
          >
            توليد بيانات نموذجية
          </Button>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات مهمة:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• يجب أن يكون العميل مسجلاً في النظام أولاً</li>
            <li>• يمكن إضافة المصاعد للعقد بعد إنشائه</li>
            <li>• وقت الاستجابة: الفترة الزمنية للرد على البلاغ</li>
            <li>• وقت الحل: الفترة الزمنية لحل المشكلة</li>
            <li>• * الحقول المطلوبة</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || loadingClients}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                جاري الإنشاء...
              </>
            ) : (
              'إنشاء العقد'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContractModal;