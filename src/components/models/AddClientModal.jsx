import { useState } from 'react';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Card from '../ui/Card';
import { useToast } from '../../hooks/useToast';

const AddClientModal = ({ isOpen, onClose, onSubmit, isLoading, success = false, error }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    password: 'password123',
    userType: 'CLIENT' // ثابت حسب الـ API
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (!formData.fullName) {
      errors.fullName = 'الاسم الكامل مطلوب';
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-9]{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقماً';
    }
    
    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.userType) {
      errors.userType = 'نوع المستخدم مطلوب';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
      return;
    }
    
    // إرسال البيانات كما يتوقعها الـ API (بدون user wrapper)
    const apiData = {
      email: formData.email,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      userType: formData.userType
    };
    
    console.log('Sending data to API:', apiData);
    const result = await onSubmit(apiData);
    
    if (result) {
      // النجاح: تأخير إغلاق الـmodal لرؤية رسالة النجاح
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      phoneNumber: '',
      password: 'password123',
      userType: 'CLIENT'
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // توليد بيانات نموذجية للاختبار
  const generateSampleData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    setFormData({
      email: `client${randomNum}@example.com`,
      fullName: `عميل تجريبي ${randomNum}`,
      phoneNumber: `01${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: 'password123',
      userType: 'CLIENT'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "تم الإضافة بنجاح" : "إضافة عميل جديد"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* عرض رسالة النجاح */}
        {success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">تمت الإضافة بنجاح!</h3>
            <p className="text-emerald-700">
              تم إضافة العميل <span className="font-bold">{formData.fullName}</span>
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
            {/* تنبيه مهم */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium mb-1">مهم!</p>
                  <p className="text-xs text-amber-600">
                    سيتم إنشاء مستخدم جديد يمكنه تسجيل الدخول إلى النظام فوراً
                  </p>
                </div>
              </div>
            </div>

            {/* معلومات الأساسية */}
            <div className="space-y-4">
              <Input
                label="البريد الإلكتروني *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={validationErrors.email}
                leftIcon={<Mail size={18} />}
                placeholder="client@example.com"
              />
              
              <Input
                label="الاسم الكامل *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                error={validationErrors.fullName}
                leftIcon={<User size={18} />}
                placeholder="الاسم الكامل للعميل"
              />
              
              <Input
                label="رقم الهاتف *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                error={validationErrors.phoneNumber}
                leftIcon={<Phone size={18} />}
                placeholder="01xxxxxxxxx"
              />
              
              <Input
                label="كلمة المرور *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                error={validationErrors.password}
                leftIcon={<Lock size={18} />}
                hint="كلمة المرور الافتراضية هي password123"
              />
              
              <input
                type="hidden"
                name="userType"
                value="CLIENT"
              />
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  نوع المستخدم: <span className="font-bold">عميل (CLIENT)</span>
                </p>
              </div>
            </div>

            {/* زر توليد بيانات نموذجية */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateSampleData}
                className="text-xs text-gray-600"
              >
                توليد بيانات نموذجية
              </Button>
            </div>

            {/* معلومات إضافية */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات مهمة:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• سيتم إنشاء حساب عميل جديد في النظام</li>
                <li>• يمكن للعميل تسجيل الدخول فوراً</li>
                <li>• يمكن إضافة المصاعد والعقود لاحقاً</li>
                <li>• كلمة المرور الافتراضية: password123</li>
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
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    جاري الإضافة...
                  </>
                ) : (
                  'إضافة العميل'
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddClientModal;