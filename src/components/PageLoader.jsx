import React from 'react';

const PageLoader = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-primary text-xs font-serif font-bold">
          🐾
        </div>
      </div>
      <div className="mt-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
        Loading Pawora...
      </div>
    </div>
  );
};

export default PageLoader;
