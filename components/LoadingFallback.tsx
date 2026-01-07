import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-4 space-y-4 animate-in fade-in duration-300">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Loading AquaSmart...</p>
    </div>
  );
};

export default LoadingFallback;