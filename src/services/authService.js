import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      // تحقق من بنية الرد
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // حفظ البيانات في localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          user,
          accessToken,
          refreshToken
        };
      } else if (response.data) {
        // إذا كان الرد مباشرة بدون success field
        const { user, accessToken, refreshToken } = response;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          user,
          accessToken,
          refreshToken
        };
      }
      
      throw new Error(response.message || 'فشل تسجيل الدخول');
    } catch (error) {
      throw new Error(error.message || 'حدث خطأ في الاتصال');
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // استدعاء API تسجيل الخروج
        await apiClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // حتى لو فشلت الـ API، نظل نعمل clear للـ local storage
    } finally {
      // مسح البيانات من localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      });

      if (response.data?.accessToken) {
        const newToken = response.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }

      throw new Error('فشل تجديد التوكن');
    } catch (error) {
      // إذا فشل refresh نعمل logout
      authService.logout();
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.data) {
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      throw new Error('فشل تحميل بيانات المستخدم');
    } catch (error) {
      throw error;
    }
  }
};