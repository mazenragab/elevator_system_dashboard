

export const REQUEST_PRIORITY = {
  EMERGENCY: 'طارئ',
  URGENT: 'عاجل',
  NORMAL: 'عادي'
};

export const CONTRACT_TYPES = {
  FULL_MAINTENANCE: 'صيانة كاملة',
  PREVENTIVE_ONLY: 'صيانة وقائية فقط',
  ON_DEMAND: 'حسب الطلب'
};

export const TECHNICIAN_STATUS = {
  AVAILABLE: 'متاح',
  BUSY: 'مشغول',
  OFFLINE: 'غير متصل'
};

export const ELEVATOR_STATUS = {
  ACTIVE: 'نشط',
  MAINTENANCE_SCHEDULED: 'صيانة مجدولة',
  OUT_OF_SERVICE: 'خارج الخدمة'
};

export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const USER_ROLES = {
  MANAGER: 'MANAGER',
  TECHNICIAN: 'TECHNICIAN',
  CLIENT: 'CLIENT'
};

export const USER_ROLES_AR = {
  MANAGER: 'مدير',
  TECHNICIAN: 'فني',
  CLIENT: 'عميل'
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const REQUEST_STATUS_AR = {
  PENDING: 'معلق',
  ASSIGNED: 'معين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي'
};

// ... باقي الثوابت كما هي