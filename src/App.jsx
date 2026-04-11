// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Bunu ekliyoruz

import Navbar from './components/navigation/Navbar';
import Dashboard from './features/dashboard/Dashboard';
import Expenses from './features/expenses/Expenses';
import Trips from './features/trips/Trips';
import Analysis from './features/analysis/Analysis';
import History from './features/history/History';
import Requests from './features/requests/Requests';
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider> 
          <div className="app-wrapper">
            <Navbar />
            
            <main className="app-container">
              <Routes>
                {/* Herkese Açık Rotalar (Gelecekteki Vitrin/Login buraya gelecek) */}
                <Route path="/" element={<div>Vitrin Sayfası (Yakında)</div>} />

                {/* Korumalı Rotalar */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/expense" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} /> 
                <Route path="/team" element={<ProtectedRoute><TeamSelection /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* 404 Sayfası */}
                <Route path="*" element={<h2>404 - Sayfa Bulunamadı!</h2>} />
              </Routes>
            </main>
          </div>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;