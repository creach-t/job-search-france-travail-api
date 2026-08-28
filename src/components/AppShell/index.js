import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

// Shell applicatif glassmorphism : sidebar (desktop) + topbar + nav basse (mobile)
const AppShell = () => {
  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1 px-3 pb-24 pt-4 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppShell;
