import { useState, useEffect } from 'react';
import { Mail, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Card from '../ui/Card';
import { useToast } from '../../hooks/useToast';

const EditClientModal = ({ isOpen, onClose, client, onSubmit, isLoading }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        email: client.user?.email || '',
        fullName: client.user?.fullName || '',
        phoneNumber: client.user?.phoneNumber || ''
      });
      setSuccess(false); // إعادة تعيين عند فتح الـmodal
    }
  }, [client]);

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
    
    // إرسال البيانات بشكل مباشر
    const apiData = {
      email: formData.email,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber
      // لا نرسل userType لأننا نعدل مستخدم موجود
    };
    
    const result = await onSubmit(client.id, apiData);
    
    if (result) {
      setSuccess(true);
      // تأخير إغلاق الـmodal لرؤية رسالة النجاح
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (!client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={success ? "تم التحديث بنجاح" : "تعديل بيانات العميل"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* عرض رسالة النجاح */}
        {success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">تم التحديث بنجاح!</h3>
            <p className="text-emerald-700">
              تم تحديث بيانات العميل <span className="font-bold">{formData.fullName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-4 animate-pulse">يتم تحديث القائمة...</p>
          </div>
        )}

        {/* إخفاء النموذج بعد النجاح */}
        {!success && (
          <>
            {/* معلومات العميل الأساسية */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">معرف العميل</label>
                  <p className="text-gray-900 font-medium">{client.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">معرف المستخدم</label>
                  <p className="text-gray-900 font-medium">{client.userId}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ التسجيل</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(client.user?.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* تحذير */}
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                عند تغيير البريد الإلكتروني، سيحتاج العميل استخدام البريد الجديد لتسجيل الدخول
              </p>
            </div>

            {/* حقول التعديل */}
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
            </div>

            {/* معلومات المصاعد والطلبات */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-sm text-gray-700 mb-2">معلومات العميل الحالية:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-lg font-bold text-blue-600">{client._count?.elevators || 0}</div>
                  <div className="text-xs text-gray-500">المصاعد</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-lg font-bold text-amber-600">{client._count?.maintenanceRequests || 0}</div>
                  <div className="text-xs text-gray-500">طلبات الصيانة</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-lg font-bold text-emerald-600">{client._count?.contracts || 0}</div>
                  <div className="text-xs text-gray-500">العقود</div>
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
          </>
        )}
      </form>
    </Modal>
  );
};

export default EditClientModal;