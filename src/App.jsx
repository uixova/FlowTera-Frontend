// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

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

import './components/components.css/GlobalFilter.css'; 

// Korumalı Rota Bileşeni: Giriş yapmamış kullanıcıyı dışarı atar
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    
    // Eğer hala kullanıcı bilgisi yükleniyorsa hiçbir şey yapma 
    if (loading) return null;

    // Kullanıcı yoksa şimdilik sadece "/" sayfasına yönlendirir
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

// Uygulama Ana Düzeni: Navbar ve Container yapısını tek yerden yönetir
const AppLayout = () => (
    <div className="app-wrapper">
        <Navbar />
        <main className="app-container">
            <Outlet /> {/* Alt rotalar buraya render edilir */}
        </main>
    </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider> 
          <Routes>
            {/* Herkese Açık Rotalar (Gelecekteki Vitrin/Login buraya gelecek) */}
            <Route path="/" element={<div>Vitrin Sayfası (Yakında)</div>} />

            {/* Korumalı Rotalar Grubu */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/home" element={<Dashboard />} />
                <Route path="/expense" element={<Expenses />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/history" element={<History />} />
                <Route path="/requests" element={<Requests />} /> 
                <Route path="/archive" element={<Archive />} /> 
                <Route path="/team" element={<TeamSelection />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* 404 Sayfası - Layout dışında olduğu için full-screen açılır */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;