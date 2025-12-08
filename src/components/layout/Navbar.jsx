import { Search, Menu, ChevronDown, Bell, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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
    { icon: <LogOut size={16} />, label: 'تسجيل خروج', onClick: handleLogout, danger: true },
  ];

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleMenuItemClick = (item) => {
    setShowDropdown(false);
    item.onClick();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* الجزء الأيسر */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
          {/* Mobile menu button */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
          
        </div>

        {/* الجزء الأيمن */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* زر الإشعارات */}
          <button 
            className="relative text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            aria-label="الإشعارات"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
              3
            </span>
          </button>

          {/* ملف المستخدم مع Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button 
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-1.5 transition-colors"
              onClick={handleProfileClick}
              aria-label="قائمة المستخدم"
              type="button"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-gray-700 text-xs sm:text-sm">
                  {user?.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              
              {/* User info - hidden on small mobile */}
              <div className="hidden sm:block text-right">
                <p className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                  {user?.fullName || 'مدير النظام'}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">
                  {user?.userType === 'MANAGER' ? 'مدير النظام' : 
                   user?.userType === 'TECHNICIAN' ? 'فني' : 
                   user?.userType === 'CLIENT' ? 'عميل' : 'مستخدم'}
                </p>
              </div>
              
              <ChevronDown 
                size={14} 
                className={`text-gray-500 hidden sm:block flex-shrink-0 md:w-4 md:h-4 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-0 top-[60px] sm:top-auto sm:mt-2 w-full sm:w-52 bg-white rounded-lg sm:rounded-lg shadow-lg border border-gray-200 z-50 mx-auto sm:mx-0 max-w-[95vw] sm:max-w-none sm:max-h-[90vh] overflow-y-auto"
                style={{ 
                  animation: 'slideDown 0.2s ease-out',
                }}
              >
                {/* User info for mobile */}
                <div className="sm:hidden p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900 text-base truncate">{user?.fullName}</p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                
                {/* Desktop user info */}
                <div className="hidden sm:block p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900 text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleMenuItemClick(item)}
                      type="button"
                      className={`flex items-center justify-end gap-2 sm:gap-3 w-full px-4 sm:px-4 py-3 sm:py-2.5 text-right hover:bg-gray-50 transition-colors ${
                        item.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex-1 text-sm sm:text-sm text-right">{item.label}</span>
                      <span className="flex-shrink-0">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* For mobile full-screen dropdown */
        @media (max-width: 640px) {
          .dropdown-container {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            z-index: 50;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;