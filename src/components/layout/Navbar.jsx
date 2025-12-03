import { Search, Menu, ChevronDown, Bell, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Updated menu items - removed "الإعدادات"
  const userMenuItems = [
    { icon: <User size={16} />, label: 'الملف الشخصي', onClick: () => navigate('/profile') },
    { icon: <LogOut size={16} />, label: 'تسجيل خروج', onClick: handleLogout, danger: true },
  ];

  // Function to handle mobile menu toggle (for sidebar)
  const handleMobileMenuToggle = () => {
    // You can pass this function from parent or use a context/state management
    // For now, we'll dispatch a custom event that can be listened to
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* الجزء الأيسر - البحث */}
        <div className="flex items-center gap-4 flex-1 md:flex-none">
          {/* Mobile menu button */}
          <button 
            onClick={handleMobileMenuToggle}
            className="md:hidden text-gray-600 hover:text-gray-900 p-1"
          >
            <Menu size={24} />
          </button>
          
          {/* شريط البحث */}
          <div className="flex-1 md:flex-none">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 md:px-4 py-2 md:w-96">
              <Search size={18} className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="بحث في النظام..."
                className="bg-transparent border-none outline-none px-2 md:px-3 w-full text-gray-700 placeholder-gray-400 text-right text-sm md:text-base"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* الجزء الأيمن */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* زر الإشعارات */}
          <button className="relative text-gray-600 hover:text-gray-900 p-1 md:p-0">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
              3
            </span>
          </button>

          {/* ملف المستخدم مع Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center gap-2 md:gap-3 p-1 md:p-0"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-700 text-sm md:text-base">
                  {user?.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              
              {/* User info - hidden on mobile, shown on desktop */}
              <div className="hidden md:block text-right">
                <p className="font-medium text-gray-900 text-sm">{user?.fullName || 'مدير النظام'}</p>
                <p className="text-xs text-gray-500">
                  {user?.userType === 'MANAGER' ? 'مدير النظام' : 
                   user?.userType === 'TECHNICIAN' ? 'فني' : 
                   user?.userType === 'CLIENT' ? 'عميل' : 'مستخدم'}
                </p>
              </div>
              
              <ChevronDown size={16} className="text-gray-500 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
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
                      <span className="flex-1 text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;