import OtpSnackbar from './OtpSnackbar';
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

export default function AdminTwoFactorScreen({
  onVerify,
  onUseDifferentEmail,
  onUseRecoveryCode,
  email = 'admin@alterationconnect.com',
  twoFactorToken = '',
  serverOtp = ''
}) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input box on mount
    if (!isRecoveryMode && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isRecoveryMode]);

  const handleInputChange = (index, value) => {
    // Take only numbers for standard 2FA
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = cleanVal;
    setCode(newCode);
    if (error) setError('');

    // Advance to next input if filled
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

    // Focus last filled or next input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullCode = isRecoveryMode ? recoveryCode.trim() : code.join('');

    if (isRecoveryMode) {
      if (!recoveryCode.trim()) {
        setError('Please enter your backup recovery code.');
        return;
      }
    } else {
      if (fullCode.length < 6) {
        setError('Please enter the full 6-digit verification code.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await adminAuthService.verifyTwoFactor(email, fullCode, twoFactorToken);
      setIsLoading(false);
      if (onVerify) {
        onVerify({
          code: fullCode,
          verified: true,
          user: res.user
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Invalid or expired 2FA code.');
    }
  };

    const handleAutoFillOtp = (otpVal) => {
    const digits = (otpVal || '123456').replace(/\D/g, '').slice(0, 6).split('');
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = digits[i] || '';
    }
    setCode(newCode);
    if (error) setError('');
    inputRefs.current[5]?.focus();
  };

  const handleAutoFillDemo = () => {
    setCode(['1', '2', '3', '4', '5', '6']);
    if (error) setError('');
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="max-w-[420px] w-full mx-auto">
      <OtpSnackbar otp={serverOtp} onAutoFill={handleAutoFillOtp} />
      {/* Title & Subheading - Centered to match Figma Screenshot */}
      <div className="mb-7 text-center">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          {isRecoveryMode ? 'Enter recovery code.' : "Verify it's you."}
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          {isRecoveryMode
            ? 'Enter one of your 8-character emergency backup recovery codes.'
            : `Enter the 6-digit security code sent to ${email}.`}
        </p>
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      {/* 2FA Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isRecoveryMode ? (
          <div>
            {/* 6 OTP Input Boxes */}
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

            {/* Microcopy matching screenshot */}
            <p className="text-[11.5px] text-slate-400 text-center mt-3.5 mb-1">
              Codes are for the clickable design demo; no messages are sent.{' '}
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                (Fill demo code)
              </button>
            </p>
          </div>
        ) : (
          <div>
            <div className="relative">
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCD-1234-EFGH"
                maxLength={16}
                className="w-full px-4 py-3 text-center tracking-widest font-mono text-sm sm:text-base text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>
            <p className="text-[11.5px] text-slate-400 text-center mt-2.5">
              Recovery codes were generated when you first set up two-factor authentication.
            </p>
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <span>Verify and continue</span>
            )}
          </button>
        </div>

        {/* Secondary Navigation Links matching screenshot */}
        <div className="space-y-3 pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              if (onUseRecoveryCode) {
                onUseRecoveryCode();
              } else {
                setIsRecoveryMode(!isRecoveryMode);
                setError('');
              }
            }}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer block w-full"
          >
            {isRecoveryMode ? 'Use authenticator app instead' : 'Use a recovery code'}
          </button>

          <button
            type="button"
            onClick={onUseDifferentEmail}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer block w-full"
          >
            Use a different email
          </button>
        </div>
      </form>
    </div>
  );
}

