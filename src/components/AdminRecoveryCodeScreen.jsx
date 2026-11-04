import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminRecoveryCodeScreen({ 
  onVerify, 
  onUseAuthenticator 
}) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCode = (val) => {
    // Strip everything except letters/digits and dashes
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    // Format as XXXX-XXXX-XXXX
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join('–');
  };

  const handleChange = (e) => {
    setCode(formatCode(e.target.value));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a recovery code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onVerify) {
        onVerify({ code, method: 'recovery_code' });
      }
    }, 600);
  };

  return (
    <div className="max-w-[390px] w-full mx-auto">
      {/* Title & Subheading matching Image 10 */}
      <div className="mb-7 text-center">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Use a recovery code.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          Enter one unused code from your saved recovery codes.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      {/* Recovery Code Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Recovery code
          </label>
          <input
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="XXXX–XXXX–XXXX"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900 tracking-wider font-mono transition shadow-2xs placeholder:text-slate-400 bg-white"
          />
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying recovery code...</span>
              </>
            ) : (
              <span>Verify recovery code</span>
            )}
          </button>
        </div>

        {/* Link matching Image 10: "Use authenticator instead" */}
        <div className="text-center pt-3">
          <button
            type="button"
            onClick={onUseAuthenticator}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Use authenticator instead
          </button>
        </div>
      </form>
    </div>
  );
}

