// تنسيق التواريخ
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

// تنسيق الأرقام
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ar-EG').format(num);
};

export const formatCurrency = (amount, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// توليد أرقام مرجعية
export const generateReferenceNumber = (prefix = 'REF') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
};

// التحقق من الصلاحيات
export const hasPermission = (userRole, requiredPermission) => {
  const permissions = {
    MANAGER: ['dashboard', 'contracts', 'technicians', 'requests', 'reports', 'settings'],
    TECHNICIAN: ['dashboard', 'requests'],
    CLIENT: ['dashboard', 'requests']
  };
  
  return permissions[userRole]?.includes(requiredPermission) || false;
};