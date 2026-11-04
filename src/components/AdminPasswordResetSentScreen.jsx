import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminPasswordResetSentScreen({ 
  email = 'you@example.com',
  onContinueToReset,
  onResendLink
}) {
  const [resending, setResending] = useState(false);
  const [resentToast, setResentToast] = useState(false);

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResentToast(true);
      if (onResendLink) onResendLink();
      setTimeout(() => setResentToast(false), 3500);
    }, 600);
  };

  return (
    <div className="max-w-[420px] w-full mx-auto">
      {/* Title & Subheading - Centered matching screenshot */}
      <div className="mb-7 text-center">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Check your inbox.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          A password reset link is on its way. Follow it to choose a new password.
        </p>
      </div>

      {resentToast && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center">
          A new reset link has been resent to <span className="font-semibold">{email}</span>.
        </div>
      )}

      {/* Blue Callout Box matching screenshot */}
      <div className="mb-6 p-4 sm:p-4.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-start gap-3.5 text-left">
        <div className="mt-0.5 shrink-0 text-blue-600">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
            Check your spam folder too.
          </h4>
          <p className="text-[12px] sm:text-[12.5px] text-slate-600 mt-1 leading-relaxed">
            The link opens the new-password screen. For this prototype, continue below.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onContinueToReset}
          className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2"
        >
          <span>Continue to reset password</span>
        </button>

        {/* Resend Link matching screenshot */}
        <div className="text-center">
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resending...</span>
              </>
            ) : (
              <span>Resend link</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

