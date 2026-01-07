import React from 'react';
import { FileQuestion, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  // Use window.location.origin to reset completely to the root path without hash or extra paths
  const goHome = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="text-center space-y-6 max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <FileQuestion className="w-16 h-16 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Page Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The page or resource you are looking for does not exist or has been moved.
          </p>
          <p className="text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 break-all">
             {window.location.pathname}
          </p>
        </div>

        <button 
          onClick={goHome}
          className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;