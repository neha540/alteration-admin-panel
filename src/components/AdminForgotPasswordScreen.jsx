import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminForgotPasswordScreen({ 
  onBackToSignIn, 
  onSendResetLink 
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSendResetLink) {
        onSendResetLink(email);
      }
    }, 600);
  };

  return (
    <div className="max-w-[390px] w-full mx-auto">
      {/* Title & Subheading - Centered matching screenshot */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Forgot your password?
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          Enter your email and we’ll send a password reset link.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900 transition shadow-2xs placeholder:text-slate-400 bg-white"
          />
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </button>
        </div>

        {/* Back to sign in link matching screenshot */}
        <div className="text-center pt-3">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
}
