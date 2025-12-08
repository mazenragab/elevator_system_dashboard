import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import RTLWrapper from './components/common/RTLWrapper';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import RoleGuard from './components/common/RoleGuard';
import { NotificationProvider } from './hooks/useNotifications'; // تأكد أن المسار صحيح

// الصفحات
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/clients/Clients';
import Technicians from './pages/technicians/Technicians';
import Requests from './pages/requests/Requests';
import Contracts from './pages/contracts/Contracts';
import Elevators from './pages/elevators/Elevators';
import Reports from './pages/reports/Reports';
import Profile from './pages/Profile';
import NotificationsPage from './pages/notification/NotificationsPage';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <RTLWrapper>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider> {/* نقل Provider إلى هنا */}
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Private Routes - Manager Only */}
                  <Route path="/" element={
                    <PrivateRoute>
                      <RoleGuard allowedRoles={['MANAGER']}>
                        <Layout />
                      </RoleGuard>
                    </PrivateRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="elevators" element={<Elevators />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="technicians" element={<Technicians />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </RTLWrapper>
  );
}

export default App;