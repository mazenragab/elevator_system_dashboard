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
  UserCog,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: <FileText size={20} />, label: 'العقود', path: '/contracts' },
    { icon: <Users size={20} />, label: 'العملاء', path: '/clients' },
    { icon: <UserCog size={20} />, label: 'الفنيين', path: '/technicians' },
    { icon: <ArrowUpDown size={20} />, label: 'المصاعد', path: '/elevators' },
    { icon: <Wrench size={20} />, label: 'طلبات الصيانة', path: '/requests' },
    { icon: <BarChart3 size={20} />, label: 'التقارير', path: '/reports' },
    // Removed Settings as requested
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Mobile toggle button
  const ToggleButton = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Overlay for mobile
  const MobileOverlay = () => (
    isMobile && isOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />
    )
  );

  return (
    <>
      <ToggleButton />
      <MobileOverlay />
      
      <div
        className={`fixed right-0 top-0 h-screen bg-gray-900 text-white flex flex-col z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
        } md:w-64 md:translate-x-0`}
      >
        {/* الشعار ومعلومات المستخدم */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
              <Wrench size={22} className="text-gray-300" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold">نظام المصاعد</h1>
              <p className="text-xs text-gray-400">لوحة تحكم المدير</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {user.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              <div className="text-right flex-1">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-400">
                  {user.userType === 'MANAGER' ? 'مدير النظام' : user.userType}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* القائمة الرئيسية */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right ${
                  isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="ml-2">{item.icon}</div>
              <span className="font-medium flex-1">{item.label}</span>
              <ChevronLeft size={16} className="text-gray-400" />
            </NavLink>
          ))}
        </nav>

        {/* القائمة السفلية - فقط الإشعارات وتسجيل الخروج */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-all text-right">
            <Bell size={20} />
            <span className="font-medium flex-1">الإشعارات</span>
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-auto">
              3
            </span>
          </button>
          
          {/* Removed Help button as requested */}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white w-full transition-all text-right hover:bg-opacity-20"
          >
            <LogOut size={20} />
            <span className="font-medium flex-1">تسجيل خروج</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;