import React, { useState, useRef, useEffect } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

export default function AdminPasswordResetSentScreen({ 
  email = 'you@example.com',
  onContinueToReset,
  onResendLink,
  serverOtp = ''
}) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resentToast, setResentToast] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = cleanVal;
    setCode(newCode);
    if (error) setError('');

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setCode(newCode);
    if (error) setError('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit reset code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      await adminAuthService.verifyResetCode(email, fullCode);
      setIsLoading(false);
      if (onContinueToReset) {
        onContinueToReset({ email, code: fullCode });
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Invalid or incorrect verification code. Please check your email and try again.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (onResendLink) {
        await onResendLink();
      } else {
        await adminAuthService.forgotPassword(email);
      }
      setResending(false);
      setResentToast(true);
      setTimeout(() => setResentToast(false), 4000);
    } catch {
      setResending(false);
      setResentToast(true);
      setTimeout(() => setResentToast(false), 4000);
    }
  };

  return (
    <div className="max-w-[420px] w-full mx-auto animate-in fade-in duration-200">
      {/* Title & Subheading */}
      <div className="mb-7 text-center">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Enter reset code.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          We sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>.
        </p>
      </div>

      {/* Resent confirmation alert */}
      {resentToast && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center flex items-center justify-center gap-2">
          <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>A fresh 6-digit verification code has been sent to your email.</span>
        </div>
      )}

      {/* Error Message if any */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      {/* 6-Digit OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {code.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                />
                {!digit && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-300 text-lg font-normal">
                    —
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11.5px] text-slate-400 text-center mt-3.5 mb-1">
            Check your spam folder if not received.
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <span>Verify code & set new password</span>
            )}
          </button>
        </div>

        {/* Resend Link */}
        <div className="text-center pt-1">
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
              <span>Resend code</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
