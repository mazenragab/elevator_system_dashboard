import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: '/dashboard' },
    {icon: <FileText size={20} />, label: 'العقود', path: '/contracts' },
    { icon: <Users size={20} />, label: 'العملاء', path: '/clients' },
    { icon: <Users size={20} />, label: 'الفنيين', path: '/technicians' },
    { icon: <Wrench size={20} />, label: 'طلبات الصيانة', path: '/requests' },
    { icon: <BarChart3 size={20} />, label: 'التقارير', path: '/reports' },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed right-0 top-0 z-30">
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
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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

      {/* القائمة السفلية */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-all text-right">
          <Bell size={20} />
          <span className="font-medium flex-1">الإشعارات</span>
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-auto">
            3
          </span>
        </button>
        
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-all text-right">
          <HelpCircle size={20} />
          <span className="font-medium flex-1">المساعدة</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white w-full transition-all text-right hover:bg-opacity-20"
        >
          <LogOut size={20} />
          <span className="font-medium flex-1">تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;