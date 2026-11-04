import React, { useState } from 'react';

export default function AdminLogo({ className = "h-8" }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#0D9488" strokeWidth="1.5" />
            <path d="M9 23L23 9M23 9L18 8L16 13M23 9L24 14L19 16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14C10 16 10 19 13 21C16 23 19 22 20 20" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-bold text-slate-800 tracking-tight">Alteration</span>
          <span className="text-[12px] font-semibold text-blue-600 tracking-tight">Connect</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src="/assets/icons/logo.png" 
      alt="Alteration Connect" 
      onError={() => setImageError(true)}
      className={`${className} w-auto object-contain`}
    />
  );
}
