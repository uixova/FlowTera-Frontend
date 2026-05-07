import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TeamProvider } from './context/TeamContext';

// Auth Sayfaları
import Landing from './features/auth/Landing';
import LoginPage from './features/auth/pages/Login/LoginPage'; 
import SignupPage from './features/auth/pages/Signup/SignupPage'; 
import PassPage from './features/auth/pages/Password/PassPage';

// Diğer Bileşenler
import NotFound from './features/error/NotFound';
import Navbar from './components/navigation/navbar/Navbar';
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

import './styles/GlobalFilter.css'; 

const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth(); 
    const location = useLocation();
    
    if (loading) return null;

    // CurrentUser yoksa ama bir şekilde girmeye çalışıyorsa login e atar ve state i temizler
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <Outlet />; 
};

const PublicRoute = () => {
    const { currentUser, loading } = useAuth();
    
    if (loading) return null;

    // Giriş yapmış kullanıcıyı home dışındaki tüm public rootlardan uzak tutar
    if (currentUser) {
        return <Navigate to="/home" replace />;
    }
    
    return <Outlet />; 
};

const AdminRoute = () => {
    const { isAdmin, currentUser } = useAuth();
    const selectedTeamId = localStorage.getItem('tm_selected_id');
    
    if (!currentUser) return <Navigate to="/login" replace />;
    if (!isAdmin(selectedTeamId)) return <Navigate to="/home" replace />;
    
    return <Outlet />; 
};

// URL ile direkt girişi engelleyen koruma 
const FlowGuard = ({ children, requiredKey }) => {
    const location = useLocation();
    const { currentUser } = useAuth();

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!location.state?.[requiredKey]) {
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

                {/* Login ve Register - Giriş yapanlar giremez */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<PassPage />} />
                </Route>

                {/* Korumalı Alanlar - Giriş yapmayanlar giremez */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/home" element={<Dashboard />} />
                        <Route path="/expense" element={<Expenses />} />
                        <Route path="/trips" element={<Trips />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/team" element={<TeamSelection />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/subscription" element={<Subscription />} /> 

                        {/* Sadece Adminlerin erişebileceği hassas alanlar */}
                        <Route element={<AdminRoute />}>
                            <Route path="/requests" element={<Requests />} /> 
                            <Route path="/archive" element={<Archive />} /> 
                        </Route>
                    </Route>
                </Route>
              
                {/* Erişilemez Alanlar */}
                <Route path="/payment" element={
                    <FlowGuard requiredKey="fromSubscription">
                        <PaymentPanel />
                    </FlowGuard>
                } />

                <Route path="/checkout" element={<Navigate to="/payment" replace />} />
                
                {/* 404 Sayfası */}
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