// دالة لتحويل الإحداثيات إلى موقع
export const getLocationFromCoords = async (lat, lng) => {
  if (!lat || !lng) return 'غير متاح';
  
  try {
    // استخدام OpenStreetMap Nominatim API (مجاني ولا يحتاج إلى API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ElevatorMaintenanceSystem/1.0' // مطلوب من OpenStreetMap
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('فشل في جلب بيانات الموقع');
    }
    
    const data = await response.json();
    
    if (data.error) {
      return `${lat.slice(0, 6)}, ${lng.slice(0, 6)}`;
    }
    
    // استخراج اسم المكان
    const address = data.address;
    let locationParts = [];
    
    if (address.neighbourhood) locationParts.push(address.neighbourhood);
    if (address.suburb) locationParts.push(address.suburb);
    if (address.city_district) locationParts.push(address.city_district);
    if (address.city) locationParts.push(address.city);
    if (address.state) locationParts.push(address.state);
    
    if (locationParts.length > 0) {
      return locationParts.join('، ');
    }
    
    return `${lat.slice(0, 6)}, ${lng.slice(0, 6)}`;
    
  } catch (error) {
    console.error('Error fetching location:', error);
    return `${lat.slice(0, 6)}, ${lng.slice(0, 6)}`;
  }
};

// دالة محلية بسيطة كبديل (عندما لا يتوفر اتصال بالإنترنت)
export const getSimpleLocationText = (lat, lng) => {
  if (!lat || !lng) return 'غير متاح';
  
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  
  // تحديد المنطقة بناءً على الإحداثيات
  if (latNum >= 30.0 && latNum <= 31.5 && lngNum >= 31.0 && lngNum <= 32.5) {
    return 'منطقة القاهرة الكبرى';
  } else if (latNum >= 31.1 && latNum <= 31.3 && lngNum >= 29.9 && lngNum <= 30.0) {
    return 'الإسكندرية';
  } else if (latNum >= 30.0 && latNum <= 30.2 && lngNum >= 31.2 && lngNum <= 31.4) {
    return 'الجيزة';
  } else if (latNum >= 30.6 && latNum <= 30.8 && lngNum >= 31.0 && lngNum <= 31.2) {
    return 'الشرقية';
  } else if (latNum === 40.741895 && lngNum === -73.989308) {
    return 'نيويورك، الولايات المتحدة';
  }
  
  return `${lat.slice(0, 6)}, ${lng.slice(0, 6)}`;
};

// دالة تنسيق التاريخ الهجري
export const formatHijriDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  
  const date = new Date(dateString);
  
  // استخدام Intl.DateTimeFormat للتاريخ الهجري
  try {
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
    
    return hijriDate;
  } catch (error) {
    // في حالة الخطأ، نستخدم التاريخ الميلادي
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// export const getSimpleLocationText = (lat, lng) => {
//   if (!lat || !lng) return 'غير متاح';
//   return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
// };