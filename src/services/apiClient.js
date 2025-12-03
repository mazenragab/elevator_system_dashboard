import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://elevator-system-mu.vercel.app/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// طباعة الطلبات
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// طباعة الردود
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 RESPONSE:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'
    });
    
    return response.data;
  },
  async (error) => {
    console.log('❌ RESPONSE ERROR:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    // Refresh token logic هنا
    // ... (المنطق السابق)
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'حدث خطأ ما';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;