import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Public pages
import LandingPage from './pages/LandingPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import BusinessAuthPage from './pages/BusinessAuthPage';

// Dashboard pages
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import CustomersPage from './pages/dashboard/CustomersPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import PortfolioPage from './pages/dashboard/PortfolioPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/business/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/vendors" element={<VendorsPage />} />
    <Route path="/vendors/:id" element={<VendorDetailPage />} />
    <Route path="/book/:vendorId" element={<BookAppointmentPage />} />
    <Route path="/confirmation" element={<ConfirmationPage />} />
    <Route path="/my-appointments" element={<MyAppointmentsPage />} />
    <Route path="/business/login" element={<BusinessAuthPage />} />

    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index element={<DashboardHome />} />
      <Route path="appointments" element={<AppointmentsPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="portfolio" element={<PortfolioPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster position="top-center" />  
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
