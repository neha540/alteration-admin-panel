import React from 'react';

export default function AdminPasswordResetCompleteScreen({ onReturnToSignIn }) {
  return (
    <div className="max-w-[400px] w-full mx-auto text-center">
      {/* Title & Subheading - Centered matching Image 08 */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Password updated.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2.5 leading-relaxed max-w-[340px] mx-auto">
          You can now sign in using your new password.
        </p>
      </div>

      {/* Primary Action Button matching Image 08: "Back to sign in" */}
      <div>
        <button
          type="button"
          onClick={onReturnToSignIn}
          className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
