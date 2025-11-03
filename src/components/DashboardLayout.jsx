import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-row-reverse relative min-w-[320px]"> {/* Add min-width */}
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area - FIXED: Remove fixed padding and use responsive */}
      <div className="flex-1 min-h-screen bg-gray-100 pt-16 md:pr-64 transition-all duration-300 w-full overflow-hidden">
        <Navbar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-6 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;