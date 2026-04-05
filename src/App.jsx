// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/navigation/Navbar';
import Dashboard from './features/dashboard/Dashboard';
import Expenses from './features/expenses/Expenses'
import Trips from './features/trips/Trips'
import Analysis from './features/analysis/Analysis'
import History from './features/history/History'
import Requests from './features/requests/Requests'
import TeamSelection from './features/teams/Teams'
import Settings from './features/settings/Settings'
import './components/components.css/GlobalFilter.css'; 

function App() {
  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-container">
          <Routes>
            {/* Ana sayfa yolu */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/expense" element={<Expenses />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/requests" element={<Requests />} /> 
            <Route path="/team" element={<TeamSelection />} />
            <Route path="/settings" element={<Settings />} />
          
            {/* 404 Sayfası */}
            <Route path="*" element={<h2>404 - Sayfa Bulunamadı!</h2>} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;