import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Wrench,
  BarChart3,
  LogOut,
  Bell,
  ChevronLeft,
  ArrowUpDown,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={18} className="sm:w-5 sm:h-5" />, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: <FileText size={18} className="sm:w-5 sm:h-5" />, label: 'العقود', path: '/contracts' },
    { icon: <Users size={18} className="sm:w-5 sm:h-5" />, label: 'العملاء', path: '/clients' },
    { icon: <UserCog size={18} className="sm:w-5 sm:h-5" />, label: 'الفنيين', path: '/technicians' },
    { icon: <ArrowUpDown size={18} className="sm:w-5 sm:h-5" />, label: 'المصاعد', path: '/elevators' },
    { icon: <Wrench size={18} className="sm:w-5 sm:h-5" />, label: 'طلبات الصيانة', path: '/requests' },
    { icon: <BarChart3 size={18} className="sm:w-5 sm:h-5" />, label: 'التقارير', path: '/reports' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out
        ${isMobile 
          ? `right-0 z-50 ${isOpen ? 'translate-x-0 w-64' : 'translate-x-full w-64'}`
          : 'right-0 w-64 translate-x-0 z-40'
        }`}
      style={{ 
        transform: isMobile && !isOpen ? 'translateX(100%)' : 'translateX(0)',
        visibility: isMobile && !isOpen ? 'visible' : 'visible'
      }}
    >
      {/* الشعار ومعلومات المستخدم */}
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench size={18} className="sm:w-6 sm:h-6 text-gray-300" />
          </div>
          <div className="text-right min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate">نظام المصاعد</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">لوحة تحكم المدير</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white text-xs sm:text-sm">
                {user.fullName?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="text-right flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                {user.userType === 'MANAGER' ? 'مدير النظام' : user.userType}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* القائمة الرئيسية */}
      <nav className="flex-1 p-3 sm:p-4 space-y-0.5 sm:space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-all text-right ${
                isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className="font-medium flex-1 text-xs sm:text-sm truncate">{item.label}</span>
            <ChevronLeft size={14} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
          </NavLink>
        ))}
      </nav>

      {/* القائمة السفلية */}
      <div className="p-3 sm:p-4 border-t border-gray-800 space-y-0.5 sm:space-y-1">
        <button className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-all text-right">
          <Bell size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
          <span className="font-medium flex-1 text-xs sm:text-sm truncate">الإشعارات</span>
          <span className="bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
            3
          </span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white w-full transition-all text-right hover:bg-opacity-20"
        >
          <LogOut size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
          <span className="font-medium flex-1 text-xs sm:text-sm truncate">تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;