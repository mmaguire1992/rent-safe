'use client'

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FiMenu, FiX } from "react-icons/fi";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Sticky */}
      <div
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 bg-mainBlue transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out h-screen`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto min-w-0 h-screen overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40 bg-white">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Page Content - Scrollable */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
