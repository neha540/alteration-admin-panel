import React from 'react';
import { Info, X } from 'lucide-react';
import AdminLogo from '../AdminLogo';

export default function SuspendStudioModal({ 
  onClose, 
  onConfirmSuspension, 
  onKeepActive 
}) {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col justify-between p-3 sm:p-6 lg:p-10 select-none font-['Arial',sans-serif]">
      {/* Top Figma Frame Label */}
      <div className="w-full max-w-[1080px] mx-auto mb-2 px-2 sm:px-3">
        <div className="text-[13px] font-semibold text-slate-400 tracking-tight">
          30 · Suspend this studio?
        </div>
      </div>

      {/* Main Full-Size Card matching Image 30 */}
      <div className="w-full max-w-[1080px] mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/70 overflow-hidden flex flex-col min-h-[640px]">
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AdminLogo className="h-6" />
          </div>

          <button
            type="button"
            onClick={onClose || onKeepActive}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
          {/* Amber Info Icon Circle */}
          <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-2xs">
            <Info className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-5 tracking-tight">
            Suspend this studio?
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] text-slate-500 max-w-sm mt-2.5 leading-relaxed font-normal">
            The studio will no longer appear in customer discovery. Existing order records remain available for support.
          </p>

          {/* Action CTAs (Stacked) */}
          <div className="mt-6 w-full max-w-xs flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirmSuspension}
              className="w-full py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              Confirm suspension
            </button>

            <button
              type="button"
              onClick={onKeepActive || onClose}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              Keep studio active
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-[1080px] mx-auto mt-4 px-3 flex items-center justify-between text-xs text-slate-400">
        <span>Alteration Connect</span>
        <span>Platform Admin Console</span>
      </div>
    </div>
  );
}

