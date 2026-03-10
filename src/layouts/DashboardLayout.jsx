import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';

const DashboardLayout = () => {
  return (
    <div className="app-main-wrapper">
      <Navbar />
      <div className="layout-body" style={{ display: 'flex' }}>
        <main className="app-container" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;