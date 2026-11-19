import React, { useState } from 'react';

export default function AdminLogo({ className = "h-9" }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#38BDF8" strokeWidth="1.6" />
            <path d="M9 23L23 9M23 9L18 8L16 13M23 9L24 14L19 16" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14C10 16 10 19 13 21C16 23 19 22 20 20" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-bold text-sky-400 tracking-tight">Alteration</span>
          <span className="text-[13px] font-bold text-blue-400 tracking-tight">Connect</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src="/assets/icons/logo.png" 
      alt="Alteration Connect" 
      onError={() => setImageError(true)}
      className={`${className} w-auto object-contain select-none`}
    />
  );
}
