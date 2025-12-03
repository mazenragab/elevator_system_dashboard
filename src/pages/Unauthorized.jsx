import { Shield, Home, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8 border-b border-gray-200 bg-red-50">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">غير مصرح بالدخول</h1>
              <p className="text-red-600 mt-1">صلاحيات غير كافية</p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-700">
                المستخدم: <span className="font-semibold">{user?.fullName}</span>
              </p>
              <p className="text-sm text-gray-700 mt-1">
                الصلاحية: <span className="font-semibold">{user?.userType}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              leftIcon={<Home size={16} />}
              className="w-full"
            >
              العودة للرئيسية
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              تسجيل الخروج والدخول بحساب آخر
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              تحتاج إلى صلاحية <span className="font-semibold">مدير النظام</span> للوصول إلى هذه الصفحة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;