import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // جلب بيانات المستخدم من localStorage أولاً
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Optionally: جلب بيانات حديثة من الـ API
          // const freshUser = await authService.getProfile();
          // setUser(freshUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUserProfile = async () => {
    try {
      const freshUser = await authService.getProfile();
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    refreshUserProfile,
    isAuthenticated: authService.isAuthenticated(),
    isManager: user?.userType === 'MANAGER',
    isTechnician: user?.userType === 'TECHNICIAN',
    isClient: user?.userType === 'CLIENT',
    loading,
    error,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};