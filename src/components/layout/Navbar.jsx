import { Search, Menu, ChevronDown, Bell, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    { icon: <User size={16} />, label: 'الملف الشخصي', onClick: () => navigate('/profile') },
    { icon: <Settings size={16} />, label: 'الإعدادات', onClick: () => navigate('/settings') },
    { icon: <LogOut size={16} />, label: 'تسجيل خروج', onClick: handleLogout, danger: true },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* الجزء الأيسر */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>
          
          {/* شريط البحث */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
            <Search size={18} className="text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="بحث في النظام..."
              className="bg-transparent border-none outline-none px-3 w-full text-gray-700 placeholder-gray-400 text-right"
              dir="rtl"
            />
          </div>
        </div>

        {/* الجزء الأيمن */}
        <div className="flex items-center gap-6">
          {/* زر الإشعارات */}
          <button className="relative text-gray-600 hover:text-gray-900">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* ملف المستخدم مع Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center gap-3"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-700">
                  {user?.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900">{user?.fullName || 'مدير النظام'}</p>
                <p className="text-xs text-gray-500">
                  {user?.userType === 'MANAGER' ? 'مدير النظام' : 
                   user?.userType === 'TECHNICIAN' ? 'فني' : 
                   user?.userType === 'CLIENT' ? 'عميل' : 'مستخدم'}
                </p>
              </div>
              
              <ChevronDown size={18} className="text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setShowDropdown(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-right hover:bg-gray-50 transition-colors ${
                          item.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="ml-2">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;