import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AdminLogo from './AdminLogo';

export default function AdminAuthLayout({ 
  children, 
  onBack, 
  showBackButton = true,
  backText = "Back"
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-slate-800 antialiased font-['Arial',sans-serif] select-none">
      
      {/* ==================== LEFT DEEP NAVY PANEL (STICK TO LEFT) ==================== */}
      <aside 
        style={{ backgroundColor: '#172A45' }}
        className="w-full lg:w-[440px] xl:w-[480px] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none shrink-0 min-h-screen relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Brand Logo Container */}
        <div className="relative z-10">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-xs inline-flex items-center gap-2">
            <AdminLogo className="h-7" />
          </div>
        </div>

        {/* Center Headline & Content */}
        <div className="my-8 lg:my-0 space-y-3.5 relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.14] whitespace-pre-line">
            One network.{"\n"}Clear oversight.
          </h1>

          <p className="text-[13.5px] text-slate-300 font-normal leading-relaxed max-w-sm pt-1">
            Manage studio access, approvals and customer support in one secure workspace.
          </p>

          {/* Stepper Indicators matching design */}
          <div className="flex items-center gap-2 pt-4">
            <span className="h-[3.5px] w-6 rounded-full bg-[#14B8A6] transition-all duration-300" />
            <span className="h-[3.5px] w-5 rounded-full bg-[#1E3A4D] transition-all duration-300" />
            <span className="h-[3.5px] w-5 rounded-full bg-[#1E3A4D] transition-all duration-300" />
          </div>
        </div>

        {/* Bottom Wordmark */}
        <div className="relative z-10 hidden sm:block">
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 block">
            ALTERATION CONNECT
          </span>
        </div>
      </aside>

      {/* ==================== RIGHT WHITE FORM AREA ==================== */}
      <main className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4">
          {showBackButton ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span>{backText}</span>
            </button>
          ) : (
            <div />
          )}

          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            ADMIN ACCESS
          </span>
        </div>

        {/* Center Content Slot */}
        <div className="my-auto py-6 sm:py-8 flex items-center justify-center">
          {children}
        </div>

        {/* Bottom spacer for balance */}
        <div className="h-4" />
      </main>

    </div>
  );
}
