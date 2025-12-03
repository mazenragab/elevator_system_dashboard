// أدوات مساعدة للـ RTL

// تحويل الأرقام الهندية إلى عربية
export const toArabicNumbers = (num) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
};

// تنسيق التاريخ العربي
export const formatArabicDate = (date) => {
  const d = new Date(date);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return d.toLocaleDateString('ar-EG', options);
};

// تنسيق الوقت العربي
export const formatArabicTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// تنسيق الأرقام بالآلاف العربية
export const formatArabicNumber = (num) => {
  return new Intl.NumberFormat('ar-EG').format(num);
};

// تنسيق العملة العربية
export const formatArabicCurrency = (amount, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  }).format(amount);
};

// تنسيق النص العربي (إضافة الـ Kashida)
export const justifyArabicText = (text) => {
  return text.replace(/(\s)/g, '‌$1');
};