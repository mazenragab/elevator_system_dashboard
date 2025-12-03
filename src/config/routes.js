export const routes = {
  public: [
    { path: '/login', name: 'تسجيل الدخول', component: 'Login' }
  ],
  private: [
    { path: '/', name: 'الرئيسية', component: 'Dashboard', icon: 'Home' },
    { path: '/dashboard', name: 'لوحة التحكم', component: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/contracts', name: 'العقود', component: 'Contracts', icon: 'FileText' },
    { path: '/clients', name: 'العملاء', component: 'Clients', icon: 'Users' },
    { path: '/contracts/create', name: 'إنشاء عقد', component: 'CreateContract' },
    { path: '/contracts/:id', name: 'تفاصيل العقد', component: 'ContractDetails' },
    { path: '/technicians', name: 'الفنيين', component: 'Technicians', icon: 'Users' },
    { path: '/technicians/:id', name: 'تفاصيل الفني', component: 'TechnicianDetails' },
    { path: '/requests', name: 'طلبات الصيانة', component: 'Requests', icon: 'Wrench' },
    { path: '/requests/:id', name: 'تفاصيل الطلب', component: 'RequestDetails' },
    { path: '/reports', name: 'التقارير', component: 'Reports', icon: 'BarChart3' },
    { path: '/settings', name: 'الإعدادات', component: 'Settings', icon: 'Settings' },
  ]
};

export const rolePermissions = {
  MANAGER: ['dashboard', 'contracts', 'technicians', 'requests', 'reports', 'settings', 'clients'],
  TECHNICIAN: ['dashboard', 'requests'],
  CLIENT: ['dashboard', 'requests']
};