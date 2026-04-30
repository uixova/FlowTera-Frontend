import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TeamProvider } from './context/TeamContext';

// Auth Sayfaları
import Landing from './features/auth/Landing';
import LoginPage from './features/auth/pages/LoginPage'; 
import SignupPage from './features/auth/pages/SignupPage'; 
import PassPage from './features/auth/pages/PassPage';

// Diğer Bileşenler
import NotFound from './features/error/NotFound';
import Navbar from './components/navigation/Navbar';
import Dashboard from './features/dashboard/Dashboard';
import Expenses from './features/expenses/Expenses';
import Trips from './features/trips/Trips';
import Analysis from './features/analysis/Analysis';
import History from './features/history/History';
import Requests from './features/requests/Requests';
import Archive from './features/archive/Archive';
import TeamSelection from './features/teams/Teams';
import Settings from './features/settings/Settings';
import Subscription from './features/subscription/Subscription';
import PaymentPanel from './features/payment/PaymentPanel';

import './components/components.css/GlobalFilter.css'; 

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth(); 
    
    if (loading) return null;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

const PublicRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    
    if (loading) return null;

    if (currentUser) {
        return <Navigate to="/home" replace />;
    }
    
    return children;
};

const AppLayout = () => (
    <div className="app-wrapper">
        <Navbar />
        <main className="app-container">
            <Outlet />
        </main>
    </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeamProvider>
          <SubscriptionProvider> 
            <CurrencyProvider> 
              <Routes>
                {/* Landing - Herkese açık */}
                <Route path="/" element={<Landing />} />

                {/* Login ve Register (Giriş yapanlar giremez) */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/signup" element={
                    <PublicRoute>
                        <SignupPage />
                    </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <PassPage />
                    </PublicRoute>
                } />

                {/* Korumalı Alanlar (Giriş yapmayanlar giremez) */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/expense" element={<Expenses />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/requests" element={<Requests />} /> 
                    <Route path="/archive" element={<Archive />} /> 
                    <Route path="/team" element={<TeamSelection />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/subscription" element={<Subscription />} /> 
                </Route>
              
                <Route path="/payment" element={<PaymentPanel />} />
                <Route path="/checkout" element={<Navigate to="/payment" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CurrencyProvider>
          </SubscriptionProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;