import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, Fish, Sun, Moon, LogIn, LogOut, Lock } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoadingFallback from './components/LoadingFallback';

// Lazy Load Pages to reduce initial bundle size
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const NotFound = lazy(() => import('./components/NotFound'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const { isAuthenticated, logout, openLoginModal } = useAuth();
  const [isPathError, setIsPathError] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const path = window.location.pathname;
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    
    if (normalizedPath !== '/' && normalizedPath !== '/index.html') {
      setIsPathError(true);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (isPathError) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-cyan-500 selection:text-white pb-20 md:pb-0 transition-colors duration-300">
        
        <Suspense fallback={null}>
          <LoginModal />
        </Suspense>

        {/* Top Navbar for Desktop */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                  <Fish className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Aqua<span className="text-cyan-600 dark:text-cyan-400">Smart</span></span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex space-x-2" role="navigation" aria-label="Desktop Navigation">
                  <NavLink 
                    to="/" 
                    end
                    className={({ isActive }) => 
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/settings" 
                    className={({ isActive }) => 
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <SettingsIcon className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </NavLink>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" aria-hidden="true"></div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={isAuthenticated ? logout : openLoginModal}
                    aria-label={isAuthenticated ? "Logout" : "Admin Login"}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isAuthenticated 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' 
                      : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
                    }`}
                  >
                    {isAuthenticated ? (
                      <>
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Logout</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Admin</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors duration-300" role="navigation" aria-label="Mobile Navigation">
          <div className="grid grid-cols-2 h-16">
             <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
              Dashboard
            </NavLink>
             <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              <SettingsIcon className="w-6 h-6" aria-hidden="true" />
              Settings
            </NavLink>
          </div>
        </nav>

        {/* Main Content with Suspense */}
        <main className="pt-20 md:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard isDark={isDark} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

      </div>
    </HashRouter>
  );
};

export default App;