import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen bg-[hsl(var(--background))]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col min-w-0 overflow-hidden relative">
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
