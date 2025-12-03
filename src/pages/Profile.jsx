import { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar, Edit, Save, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/forms/Input';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // هنا هتروح لـ API لتحديث البيانات
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
  };

  const roleLabels = {
    MANAGER: { label: 'مدير النظام', color: 'bg-purple-100 text-purple-800' },
    TECHNICIAN: { label: 'فني', color: 'bg-blue-100 text-blue-800' },
    CLIENT: { label: 'عميل', color: 'bg-green-100 text-green-800' },
  };

  const userRole = roleLabels[user?.userType] || { label: 'غير معروف', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة بيانات حسابك</p>
        </div>
        {!isEditing ? (
          <Button leftIcon={<Edit size={16} />} onClick={() => setIsEditing(true)}>
            تعديل البيانات
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<X size={16} />} onClick={handleCancel}>
              إلغاء
            </Button>
            <Button leftIcon={<Save size={16} />} onClick={handleSave}>
              حفظ التغييرات
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الشخصية */}
        <Card title="المعلومات الشخصية" className="lg:col-span-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="الاسم الكامل"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                disabled={!isEditing}
                leftIcon={<User size={18} className="text-gray-400" />}
              />
              
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={true} // البريد مش متغير عادةً
                leftIcon={<Mail size={18} className="text-gray-400" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="رقم الهاتف"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                disabled={!isEditing}
                leftIcon={<Phone size={18} className="text-gray-400" />}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  دور المستخدم
                </label>
                <div className={`px-4 py-2.5 rounded-lg border border-gray-300 ${userRole.color}`}>
                  <div className="flex items-center gap-2">
                    <Shield size={18} />
                    <span className="font-medium">{userRole.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ملخص الحساب */}
        <Card title="ملخص الحساب">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user?.fullName?.charAt(0) || 'م'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معرف المستخدم:</span>
                <span className="font-medium">#{user?.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">حالة الحساب:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  نشط
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">تاريخ الإنشاء:</span>
                <span className="font-medium">يناير 2024</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* أقسام إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="الأمان">
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              <span>تغيير كلمة المرور</span>
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>تحقق بخطوتين</span>
              <span className="text-gray-400">غير مفعل</span>
            </Button>
          </div>
        </Card>
        
        <Card title="جلسات النشاط">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">هذا الجهاز</p>
                <p className="text-sm text-gray-500">Chrome على Windows</p>
              </div>
              <Button variant="outline" size="sm">
                إنهاء الجلسة
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;