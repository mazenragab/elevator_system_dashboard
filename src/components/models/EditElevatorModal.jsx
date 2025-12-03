import { useState, useEffect } from 'react';
import { Home, Hash, MapPin, Navigation, Calendar, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import { useToast } from '../../hooks/useToast';

const EditElevatorModal = ({ isOpen, onClose, elevator, onSubmit, isLoading, clients }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    modelNumber: '',
    serialNumber: '',
    locationAddress: '',
    locationLat: '',
    locationLng: '',
    status: 'ACTIVE',
    lastMaintenanceDate: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (elevator) {
      // تنسيق التاريخ للـ input[type="date"]
      const lastMaintenanceDate = elevator.lastMaintenanceDate 
        ? new Date(elevator.lastMaintenanceDate).toISOString().split('T')[0]
        : '';
      
      setFormData({
        modelNumber: elevator.modelNumber || '',
        serialNumber: elevator.serialNumber || '',
        locationAddress: elevator.locationAddress || '',
        locationLat: elevator.locationLat?.toString() || '',
        locationLng: elevator.locationLng?.toString() || '',
        status: elevator.status || 'ACTIVE',
        lastMaintenanceDate: lastMaintenanceDate
      });
    }
  }, [elevator]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.modelNumber) {
      errors.modelNumber = 'رقم الموديل مطلوب';
    }
    
    if (!formData.serialNumber) {
      errors.serialNumber = 'الرقم التسلسلي مطلوب';
    }
    
    if (!formData.locationAddress) {
      errors.locationAddress = 'عنوان الموقع مطلوب';
    }
    
    if (!formData.status) {
      errors.status = 'حالة المصعد مطلوبة';
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
    
    // مسح خطأ الحقل عند التعديل
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
    
    const dataToSend = {
      modelNumber: formData.modelNumber,
      serialNumber: formData.serialNumber,
      locationAddress: formData.locationAddress,
      locationLat: formData.locationLat ? parseFloat(formData.locationLat) : null,
      locationLng: formData.locationLng ? parseFloat(formData.locationLng) : null,
      status: formData.status,
      lastMaintenanceDate: formData.lastMaintenanceDate || null
    };
    
    onSubmit(elevator.id, dataToSend);
  };

  if (!elevator) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات المصعد"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* معلومات المصعد الأساسية */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">معرف المصعد</label>
              <p className="text-gray-900 font-medium">{elevator.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">العميل</label>
              <p className="text-gray-900 font-medium">
                {elevator.client?.user?.fullName || 'غير معروف'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الإضافة</label>
              <p className="text-gray-900 font-medium">
                {new Date(elevator.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* حقول التعديل */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم الموديل *"
              name="modelNumber"
              value={formData.modelNumber}
              onChange={handleChange}
              required
              error={validationErrors.modelNumber}
              leftIcon={<Hash size={18} />}
              placeholder="MODEL-XXXXXX"
            />
            
            <Input
              label="الرقم التسلسلي *"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              error={validationErrors.serialNumber}
              leftIcon={<Hash size={18} />}
              placeholder="SN-XXXXXXXXXX"
            />
          </div>
          
          <Textarea
            label="عنوان الموقع *"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            required
            error={validationErrors.locationAddress}
            rows={2}
            placeholder="شارع، منطقة، مدينة"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="خط العرض (Latitude)"
              name="locationLat"
              value={formData.locationLat}
              onChange={handleChange}
              type="number"
              step="any"
              leftIcon={<Navigation size={18} />}
              placeholder="30.044420"
            />
            
            <Input
              label="خط الطول (Longitude)"
              name="locationLng"
              value={formData.locationLng}
              onChange={handleChange}
              type="number"
              step="any"
              leftIcon={<Navigation size={18} />}
              placeholder="31.235712"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="حالة المصعد *"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              error={validationErrors.status}
              options={[
                { value: 'ACTIVE', label: 'نشط' },
                { value: 'MAINTENANCE_SCHEDULED', label: 'مجدول للصيانة' },
                { value: 'OUT_OF_SERVICE', label: 'خارج الخدمة' },
              ]}
            />
            
            <Input
              label="تاريخ آخر صيانة"
              name="lastMaintenanceDate"
              value={formData.lastMaintenanceDate}
              onChange={handleChange}
              type="date"
              leftIcon={<Calendar size={18} />}
            />
          </div>
        </div>

        {/* معلومات المصعد الحالية */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات المصعد الحالية:</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-blue-600">{elevator._count?.maintenanceRequests || 0}</div>
              <div className="text-xs text-gray-500">طلبات الصيانة</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-emerald-600">{elevator._count?.contracts || 0}</div>
              <div className="text-xs text-gray-500">العقود</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-amber-600">{elevator._count?.reports || 0}</div>
              <div className="text-xs text-gray-500">التقارير</div>
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
              'تحديث البيانات'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditElevatorModal;