import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Input from '../../components/forms/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('manager1@example.com'); // بيانات افتراضية للاختبار
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // الخطأ متعامل معه في الـ context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 bg-gray-900">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Lock size={24} className="text-gray-900" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">نظام المصاعد</h1>
              <p className="text-gray-300">تسجيل دخول المدير</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager1@example.com"
              required
              leftIcon={<Mail size={18} />}
            />

            <Input
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
                />
                <span className="text-sm text-gray-600">تذكرني</span>
              </label>
              
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              تسجيل الدخول
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                بيانات تجريبية:<br/>
                البريد: manager1@example.com<br/>
                كلمة المرور: password123
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2024 نظام إدارة المصاعد • الإصدار 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;