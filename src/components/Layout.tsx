import { Outlet, NavLink } from 'react-router-dom';
import { Activity, Zap, Brain, FileText, Menu, X, MessageCircle, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GeminiIcon from './GeminiIcon';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Network Monitor', href: '/network', icon: Activity },
    { name: 'Attack Simulator', href: '/simulator', icon: Zap },
    { name: 'Threat Analysis', href: '/threats', icon: Brain },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'AI Chat - Roma', href: '/chat', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-r border-indigo-200 dark:border-gray-700 shadow-xl lg:bg-white/80 dark:lg:bg-gray-900/50`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-8 px-3">
            <GeminiIcon size={32} />
            <span className="ml-3 text-xl font-bold bg-[#ff6b6b] bg-clip-text text-transparent">
              Roma Security
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Theme Toggle and Status Section */}
          <div className="absolute bottom-4 left-0 right-0 px-6 space-y-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:bg-gray-800/60 text-indigo-700 dark:text-indigo-400 hover:from-indigo-200 hover:to-purple-200 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 group shadow-md"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {/* Status Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:bg-gray-800/60 rounded-lg p-3 border border-green-200 dark:border-gray-700/50 transition-colors duration-300 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">System Status</span>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 dark:text-green-500 font-semibold">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] rounded-xl text-white shadow-lg hover:scale-105 transition-transform active:scale-95"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Header Bar for Mobile */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-indigo-200 dark:border-gray-700 z-20 lg:hidden flex items-center justify-center shadow-md">
        <div className="flex items-center gap-2">
          <GeminiIcon size={24} />
          <span className="text-lg font-bold text-[#ff6b6b]">Roma Security</span>
        </div>
        {/* Theme Toggle Button for Mobile */}
        <button
          onClick={toggleTheme}
          className="absolute right-16 p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:bg-gray-800/60 text-indigo-700 dark:text-indigo-400 hover:from-indigo-200 hover:to-purple-200 dark:hover:bg-gray-800/80 transition-all duration-300 shadow-md"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <main className={`transition-all ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} p-4 lg:p-8 pt-20 lg:pt-8`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
