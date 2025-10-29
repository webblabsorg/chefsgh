import { FormProvider } from './contexts/FormContext';
import { RegistrationForm } from './components/RegistrationForm';
import { Toaster } from './components/ui/toaster';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './admin/pages/Login';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Registrations from './admin/pages/Registrations';
import RegistrationDetail from './admin/pages/RegistrationDetail';
import Users from './admin/pages/Users';
import UserDetail from './admin/pages/UserDetail';
import UserForm from './admin/pages/UserForm';
import Payments from './admin/pages/Payments';
import PaymentDetail from './admin/pages/PaymentDetail';
import MembershipTypes from './admin/pages/MembershipTypes';
import EmailLogs from './admin/pages/EmailLogs';
import EmailLogDetail from './admin/pages/EmailLogDetail';
import Renewals from './admin/pages/Renewals';
import Settings from './admin/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <FormProvider>
                <RegistrationForm />
                <Toaster />
              </FormProvider>
            }
          />

          <Route path="/admin/login" element={<Login />} />
          {/* Forgot/Reset password removed */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="registrations/:id" element={<RegistrationDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id/edit" element={<UserForm />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payments/:id" element={<PaymentDetail />} />
            <Route path="membership-types" element={<MembershipTypes />} />
            <Route path="email-logs" element={<EmailLogs />} />
            <Route path="email-logs/:id" element={<EmailLogDetail />} />
            <Route path="renewals" element={<Renewals />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
