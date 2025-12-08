import { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Key,
  Wrench,
  Shield,
  AlertCircle,
  Building,
  Navigation,
  Hash,
  CheckCircle
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Card from '../../components/ui/Card';

const AddTechnicianModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  success = false,
  error = null 
}) => {
  // حالة بيانات النموذج
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    currentLocationLat: '',
    currentLocationLng: ''
  });

  // حالة أخطاء التحقق
  const [errors, setErrors] = useState({});

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-2,5]\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    // التحقق من إحداثيات الموقع (اختياري)
    if (formData.currentLocationLat && !/^-?\d+(\.\d+)?$/.test(formData.currentLocationLat)) {
      newErrors.currentLocationLat = 'خط العرض غير صحيح';
    } else if (formData.currentLocationLat && (parseFloat(formData.currentLocationLat) < -90 || parseFloat(formData.currentLocationLat) > 90)) {
      newErrors.currentLocationLat = 'خط العرض يجب أن يكون بين -90 و 90';
    }

    if (formData.currentLocationLng && !/^-?\d+(\.\d+)?$/.test(formData.currentLocationLng)) {
      newErrors.currentLocationLng = 'خط الطول غير صحيح';
    } else if (formData.currentLocationLng && (parseFloat(formData.currentLocationLng) < -180 || parseFloat(formData.currentLocationLng) > 180)) {
      newErrors.currentLocationLng = 'خط الطول يجب أن يكون بين -180 و 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // تجهيز البيانات للإرسال
      const submitData = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        userType: 'TECHNICIAN', // ثابت لأننا نضيف فني
        currentLocationLat: formData.currentLocationLat || null,
        currentLocationLng: formData.currentLocationLng || null
      };
      
      // استدعاء onSubmit واستقبال النتيجة
      const result = await onSubmit(submitData);
      
      if (result) {
        // النجاح: تأخير إغلاق الـmodal لرؤية رسالة النجاح
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    }
  };

  // معالجة تغيير المدخلات
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // مسح خطأ الحقل عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // إعادة تعيين النموذج عند الإغلاق
  const handleClose = () => {
    setFormData({
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      currentLocationLat: '',
      currentLocationLng: ''
    });
    setErrors({});
    onClose();
  };

  // توليد كلمة مرور عشوائية
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    handleInputChange('password', password);
    handleInputChange('confirmPassword', password);
  };

  // تعيين الموقع الحالي
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleInputChange('currentLocationLat', latitude.toFixed(8));
          handleInputChange('currentLocationLng', longitude.toFixed(8));
        },
        (error) => {
          alert('تعذر الحصول على الموقع: ' + error.message);
        }
      );
    } else {
      alert('متصفحك لا يدعم خدمة تحديد الموقع');
    }
  };

  // اقتراح إحداثيات عشوائية (لتسهيل التعبئة)
  const suggestRandomLocation = () => {
    const lat = (Math.random() * 2 + 30).toFixed(6); // بين 30 و 32
    const lng = (Math.random() * 2 + 31).toFixed(6); // بين 31 و 33
    handleInputChange('currentLocationLat', lat);
    handleInputChange('currentLocationLng', lng);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "تم الإضافة بنجاح" : "إضافة فني جديد"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* عرض رسالة النجاح */}
        {success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">تمت الإضافة بنجاح!</h3>
            <p className="text-emerald-700">
              تم إضافة الفني <span className="font-bold">{formData.fullName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-4 animate-pulse">يتم تحديث القائمة...</p>
          </div>
        )}

        {/* عرض رسالة الخطأ */}
        {error && !success && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 p-4">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* إخفاء النموذج بعد النجاح */}
        {!success && (
          <>
            {/* معلومات الفني الأساسية */}
            <Card className="mb-6 border-0 shadow-sm">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  المعلومات الشخصية
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="الاسم الكامل"
                      placeholder="أدخل الاسم الكامل"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      error={errors.fullName}
                      required
                      leftIcon={<User size={18} />}
                    />
                    
                    <Input
                      label="البريد الإلكتروني"
                      type="email"
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      required
                      leftIcon={<Mail size={18} />}
                    />
                  </div>
                  
                  <Input
                    label="رقم الهاتف"
                    placeholder="مثال: 01234567890"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    error={errors.phoneNumber}
                    required
                    leftIcon={<Phone size={18} />}
                  />
                </div>
              </div>
            </Card>

            {/* معلومات الموقع */}
            <Card className="mb-6 border-0 shadow-sm">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-emerald-600" />
                  معلومات الموقع
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="خط العرض"
                      placeholder="مثال: 30.0444"
                      value={formData.currentLocationLat}
                      onChange={(e) => handleInputChange('currentLocationLat', e.target.value)}
                      error={errors.currentLocationLat}
                      leftIcon={<Hash size={18} />}
                      helperText="إحداثيات الموقع (اختياري)"
                    />
                    
                    <Input
                      label="خط الطول"
                      placeholder="مثال: 31.2357"
                      value={formData.currentLocationLng}
                      onChange={(e) => handleInputChange('currentLocationLng', e.target.value)}
                      error={errors.currentLocationLng}
                      leftIcon={<Hash size={18} />}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                      leftIcon={<Navigation size={16} />}
                    >
                      تحديد الموقع الحالي
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={suggestRandomLocation}
                      className="text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      اقتراح إحداثيات
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    • يمكن ترك حقل الموقع فارغاً وسيتم تحديثه لاحقاً
                    <br />
                    • سيكون الموقع الظاهر للعملاء لأقرب فني متاح
                  </p>
                </div>
              </div>
            </Card>

            {/* معلومات الحساب */}
            <Card className="mb-6 border-0 shadow-sm">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  معلومات الحساب
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="كلمة المرور"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={errors.password}
                      required
                      leftIcon={<Key size={18} />}
                    />
                    
                    <Input
                      label="تأكيد كلمة المرور"
                      type="password"
                      placeholder="أعد إدخال كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      error={errors.confirmPassword}
                      required
                      leftIcon={<Key size={18} />}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      توليد كلمة مرور آمنة
                    </Button>
                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200">
                            <div 
                              className={`h-full ${formData.password.length >= 12 ? 'bg-green-500' : 
                                formData.password.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, (formData.password.length / 12) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            formData.password.length >= 12 ? 'text-green-600' : 
                            formData.password.length >= 8 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formData.password.length >= 12 ? 'قوية' : 
                            formData.password.length >= 8 ? 'متوسطة' : 'ضعيفة'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          نوصي باستخدام 12 حرفًا على الأقل مع مزيج من الأحرف والأرقام والرموز
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* معلومات النظام */}
            <Card className="mb-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/50 rounded-lg">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-blue-900 text-sm">معلومات النظام</h4>
                    <ul className="mt-2 space-y-1 text-xs text-blue-700">
                      <li>• سيتم إنشاء حساب من نوع "TECHNICIAN" في النظام</li>
                      <li>• يمكن للفني تحديث موقعه وبياناته لاحقاً من تطبيق الفنيين</li>
                      <li>• سيظهر الفني في قائمة الفنيين المتاحين فور الإنشاء</li>
                      <li>• سيتم إرسال بيانات الدخول للفني عبر البريد الإلكتروني</li>
                      <li>• يمكن للفني استقبال طلبات الصيانة عبر التطبيق</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* أزرار الإجراءات */}
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
                  'إضافة الفني'
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddTechnicianModal;