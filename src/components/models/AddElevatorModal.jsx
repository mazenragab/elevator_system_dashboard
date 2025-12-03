import { useState, useEffect } from 'react';
import { 
  Home, 
  Hash, 
  MapPin, 
  Navigation, 
  Calendar, 
  AlertCircle,
  Locate,
  Loader2,
  Map
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import { useToast } from '../../hooks/useToast';

const AddElevatorModal = ({ isOpen, onClose, onSubmit, isLoading, error, clients }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    clientId: '',
    modelNumber: '',
    serialNumber: '',
    locationAddress: '',
    locationLat: '',
    locationLng: '',
    status: 'ACTIVE',
    lastMaintenanceDate: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null); // 'granted', 'denied', 'prompt'

  useEffect(() => {
    // توليد قيم عشوائية للاختبار
    if (clients.length > 0 && !formData.clientId) {
      const randomClient = clients[0];
      setFormData(prev => ({
        ...prev,
        clientId: randomClient.id.toString(),
        modelNumber: `MODEL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        serialNumber: `SN-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        locationAddress: 'شارع التجربة، القاهرة',
        // إزالة القيم الافتراضية للإحداثيات
      }));
    }

    // التحقق من صلاحية الموقع عند تحميل المكون
    checkLocationPermission();
  }, [clients]);

  // التحقق من صلاحية الموقع
  const checkLocationPermission = () => {
    if (!navigator.permissions) {
      setLocationPermission('prompt');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' })
      .then((permissionStatus) => {
        setLocationPermission(permissionStatus.state);
        
        // الاستماع لتغييرات الصلاحية
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };
      })
      .catch(() => {
        setLocationPermission('prompt');
      });
  };

  // دالة طلب صلاحية الموقع
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      showToast('المتصفح لا يدعم تحديد الموقع', 'error');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    // طلب صلاحية الموقع مع خيارات
    const options = {
      enableHighAccuracy: true, // استخدام دقة عالية
      timeout: 15000, // 15 ثانية كحد أقصى
      maximumAge: 0 // عدم استخدام المواقع المخزنة مؤقتاً
    };

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // تحديث الحقول بالإحداثيات
        setFormData(prev => ({
          ...prev,
          locationLat: latitude.toFixed(8),
          locationLng: longitude.toFixed(8)
        }));
        
        setIsGettingLocation(false);
        
        // رسالة بناءً على الدقة
        let accuracyMessage = '';
        if (accuracy < 10) {
          accuracyMessage = 'بدقة عالية جداً';
        } else if (accuracy < 50) {
          accuracyMessage = 'بدقة عالية';
        } else if (accuracy < 200) {
          accuracyMessage = 'بدقة متوسطة';
        } else {
          accuracyMessage = 'بدقة منخفضة';
        }
        
        showToast(`تم تحديد موقعك بنجاح ${accuracyMessage}`, 'success');
        
        // محاولة الحصول على اسم الموقع من إحداثيات GPS
        getLocationName(latitude, longitude);
      },
      // Error callback
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'فشل في تحديد الموقع';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض طلب صلاحية الموقع. يرجى السماح بالوصول إلى الموقع في إعدادات المتصفح.';
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متاحة. تأكد من تفعيل خدمة الموقع على جهازك.';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع. حاول مرة أخرى.';
            break;
          default:
            errorMessage = 'حدث خطأ غير معروف أثناء تحديد الموقع.';
        }
        
        setLocationError(errorMessage);
        showToast(errorMessage, 'error');
      },
      options
    );
  };

  // دالة للحصول على اسم الموقع من الإحداثيات
  const getLocationName = async (lat, lng) => {
    try {
      // استخدام OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          const address = data.address || {};
          let displayName = '';
          
          // بناء الاسم المعروض من مكونات العنوان
          if (address.road) displayName += address.road + '، ';
          if (address.suburb) displayName += address.suburb + '، ';
          if (address.city) displayName += address.city + '، ';
          if (address.state) displayName += address.state;
          
          // تحديث حقل العنوان إذا كان فارغاً أو قصيراً
          if (!formData.locationAddress || formData.locationAddress.length < 10) {
            setFormData(prev => ({
              ...prev,
              locationAddress: displayName || data.display_name
            }));
          }
        }
      }
    } catch (err) {
      console.log('لا يمكن الحصول على اسم الموقع:', err);
      // لا تظهر رسالة خطأ للمستخدم
    }
  };

  // دالة لاقتراح موقع في مصر (لتسهيل التعبئة)
  const suggestEgyptLocation = () => {
    const locations = [
      { lat: 30.044420, lng: 31.235712, address: 'ميدان التحرير، القاهرة' },
      { lat: 30.062630, lng: 31.249670, address: 'المقطم، القاهرة' },
      { lat: 30.033333, lng: 31.233334, address: 'مدينة نصر، القاهرة' },
      { lat: 31.200092, lng: 29.918739, address: 'الإسكندرية' },
      { lat: 30.802500, lng: 31.001389, address: 'المنصورة، الدقهلية' },
      { lat: 31.041369, lng: 31.359262, address: 'المحلة الكبرى، الغربية' }
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    setFormData(prev => ({
      ...prev,
      locationLat: randomLocation.lat.toFixed(6),
      locationLng: randomLocation.lng.toFixed(6),
      locationAddress: prev.locationAddress || randomLocation.address
    }));
    
    showToast('تم اقتراح موقع عشوائي في مصر', 'info');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.clientId) {
      errors.clientId = 'العميل مطلوب';
    }
    
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
    
    // التحقق من صحة الإحداثيات إذا كانت مملوءة
    if (formData.locationLat && !/^-?\d+(\.\d+)?$/.test(formData.locationLat)) {
      errors.locationLat = 'خط العرض غير صحيح';
    } else if (formData.locationLat && (parseFloat(formData.locationLat) < -90 || parseFloat(formData.locationLat) > 90)) {
      errors.locationLat = 'خط العرض يجب أن يكون بين -90 و 90';
    }

    if (formData.locationLng && !/^-?\d+(\.\d+)?$/.test(formData.locationLng)) {
      errors.locationLng = 'خط الطول غير صحيح';
    } else if (formData.locationLng && (parseFloat(formData.locationLng) < -180 || parseFloat(formData.locationLng) > 180)) {
      errors.locationLng = 'خط الطول يجب أن يكون بين -180 و 180';
    }

    // التحقق من أن كلا الإحداثيين مملوئان أو فارغان
    if ((formData.locationLat && !formData.locationLng) || (!formData.locationLat && formData.locationLng)) {
      errors.location = 'يرجى ملء كلا الإحداثيين أو تركها فارغة';
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
    
    // تحويل clientId إلى رقم
    const dataToSend = {
      ...formData,
      clientId: parseInt(formData.clientId),
      locationLat: formData.locationLat ? parseFloat(formData.locationLat) : null,
      locationLng: formData.locationLng ? parseFloat(formData.locationLng) : null,
      lastMaintenanceDate: formData.lastMaintenanceDate || null
    };
    
    onSubmit(dataToSend);
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      modelNumber: '',
      serialNumber: '',
      locationAddress: '',
      locationLat: '',
      locationLng: '',
      status: 'ACTIVE',
      lastMaintenanceDate: ''
    });
    setValidationErrors({});
    setLocationError(null);
    setIsGettingLocation(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // دالة لحذف الإحداثيات
  const clearLocation = () => {
    setFormData(prev => ({
      ...prev,
      locationLat: '',
      locationLng: ''
    }));
    showToast('تم حذف الإحداثيات', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة مصعد جديد"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* معلومات العميل */}
        <div className="space-y-4">
          <Select
            label="العميل *"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
            error={validationErrors.clientId}
            options={clients.map(client => ({
              value: client.id.toString(),
              label: `${client.user?.fullName} (${client.user?.email})`
            }))}
            placeholder="اختر العميل"
          />
          
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
              hint="مثل: MODEL-123ABC"
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
              hint="مثل: SN-ABC123DEF456"
            />
          </div>
        </div>

        {/* معلومات الموقع */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} />
              معلومات الموقع
            </h4>
            
           
          </div>
          
          {/* رسالة حالة صلاحية الموقع */}
          {locationPermission === 'denied' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">تم رفض صلاحية الموقع</p>
                  <p className="text-xs text-red-600 mt-1">
                    يرجى السماح بالوصول إلى الموقع في إعدادات المتصفح لاستخدام هذه الميزة
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Textarea
            label="عنوان الموقع *"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            required
            error={validationErrors.locationAddress}
            rows={2}
            placeholder="شارع، منطقة، مدينة"
            hint="أدخل العنوان التفصيلي للموقع"
          />
          
          {/* رسالة حول تحديد الموقع */}
          {locationError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{locationError}</p>
            </div>
          )}
          
          {/* معلومات الإحداثيات */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-700 text-sm flex items-center gap-1">
                <Map size={16} />
                إحداثيات الموقع
              </h5>
              
              {(formData.locationLat || formData.locationLng) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearLocation}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  حذف الإحداثيات
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="خط العرض"
                name="locationLat"
                value={formData.locationLat}
                onChange={handleChange}
                type="number"
                step="any"
                leftIcon={<Navigation size={18} />}
                placeholder="30.044420"
                disabled={isGettingLocation}
                error={validationErrors.locationLat}
                helperText="يتم ملؤها تلقائياً عند تحديد الموقع"
              />
              
              <Input
                label="خط الطول"
                name="locationLng"
                value={formData.locationLng}
                onChange={handleChange}
                type="number"
                step="any"
                leftIcon={<Navigation size={18} />}
                placeholder="31.235712"
                disabled={isGettingLocation}
                error={validationErrors.locationLng}
              />
            </div>
             <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className={`flex items-center gap-2 ${
                  locationPermission === 'granted' 
                    ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' 
                    : locationPermission === 'denied'
                    ? 'text-red-600 border-red-200 hover:bg-red-50'
                    : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                }`}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري تحديد الموقع...
                  </>
                ) : (
                  <>
                    <Locate size={16} />
                    تحديد الموقع الحالي
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={suggestEgyptLocation}
                className="text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                اقتراح موقع
              </Button>
            </div>
            {validationErrors.location && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
            )}
            
            {/* عرض الإحداثيات الحالية */}
            {(formData.locationLat || formData.locationLng) && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-700">
                    الإحداثيات: {formData.locationLat}, {formData.locationLng}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${formData.locationLat},${formData.locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                >
                  <Map size={12} />
                  عرض على خرائط Google
                </a>
              </div>
            )}
            
            {/* تنبيه حول الإحداثيات */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium mb-1">معلومات مهمة:</p>
                  <ul className="text-xs text-amber-600 space-y-1">
                    <li>• الإحداثيات تساعد الفنيين على الوصول للموقع بسرعة ودقة</li>
                    <li>• انقر على "تحديد الموقع الحالي" لملء الإحداثيات تلقائياً من GPS</li>
                    <li>• يمكن ترك الإحداثيات فارغة إذا لم تكن متوفرة</li>
                    <li>• العنوان التفصيلي مطلوب في جميع الحالات</li>
                    <li>• الإحداثيات ستساعد في توجيه أقرب فني للصيانة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الحالة */}
        <div className="border-t pt-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            معلومات الحالة
          </h4>
          
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
              label="تاريخ آخر صيانة (اختياري)"
              name="lastMaintenanceDate"
              value={formData.lastMaintenanceDate}
              onChange={handleChange}
              type="date"
              leftIcon={<Calendar size={18} />}
            />
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات مهمة:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• المصعد الجديد سيكون متاحاً للعملاء فوراً</li>
            <li>• يمكن ربط المصعد بعقد صيانة لاحقاً</li>
            <li>• تحديد الموقع يسهل الوصول للصيانة الطارئة</li>
            <li>• الإحداثيات تمكن الفني من الوصول بدقة عالية</li>
            <li>• * الحقول المطلوبة</li>
            <li>• الحالة الافتراضية: نشط (ACTIVE)</li>
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
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                جاري الإضافة...
              </>
            ) : (
              'إضافة المصعد'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddElevatorModal;