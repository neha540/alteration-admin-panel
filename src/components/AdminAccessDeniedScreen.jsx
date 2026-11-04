import React, { useState } from 'react';

export default function AdminAccessDeniedScreen({ 
  onReturnToSignIn,
  userEmail = 'user@example.com'
}) {
  const [supportMessageSent, setSupportMessageSent] = useState(false);

  const handleContactSupport = () => {
    setSupportMessageSent(true);
    setTimeout(() => {
      setSupportMessageSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-[400px] w-full mx-auto text-center">
      {/* Title & Subheading - Centered matching screenshot */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Access not available.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-3 leading-relaxed max-w-[340px] mx-auto">
          This account does not have administrator access. Contact your platform owner.
        </p>
      </div>

      {supportMessageSent && (
        <div className="mb-5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs">
          Support request logged for <span className="font-semibold">{userEmail}</span>. Our team has been notified.
        </div>
      )}

      {/* Primary Action Button */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onReturnToSignIn}
          className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center"
        >
          Return to sign in
        </button>

        {/* Secondary Link matching screenshot */}
        <div>
          <button
            type="button"
            onClick={handleContactSupport}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Contact platform support
          </button>
        </div>
      </div>
    </div>
  );
}

