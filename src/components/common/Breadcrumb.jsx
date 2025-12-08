import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // خريطة أسماء المسارات
  const routeNames = {
    'dashboard': 'لوحة التحكم',
    'contracts': 'العقود',
    'contracts/create': 'إنشاء عقد جديد',
    'technicians': 'الفنيين',
    'requests': 'طلبات الصيانة',
    'reports': 'التقارير',
    'settings': 'الإعدادات',
    'profile': 'الملف الشخصي',
    'elevators': 'المصاعد',
    'clients': 'العملاء',
    'notifications': 'الإشعارات',
  };

  return (
    <nav className="flex items-center gap-2 mb-6" aria-label="مسار التنقل">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home size={16} />
        <span className="text-sm">الرئيسية</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name.replace(/-/g, ' ');

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronLeft size={16} className="text-gray-400" />
            
            {isLast ? (
              <span className="text-sm font-medium text-gray-900">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;