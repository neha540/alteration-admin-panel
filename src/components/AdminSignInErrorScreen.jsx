import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminSignInErrorScreen({ 
  onSignIn, 
  onForgotPassword, 
  onActivateAccount,
  initialEmail = 'you@example.com'
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email && password && onSignIn) {
        onSignIn({
          email,
          name: 'Admin Workspace Owner',
          role: 'Super Admin'
        });
      }
    }, 600);
  };

  return (
    <div className="max-w-[390px] w-full mx-auto">
      {/* Title & Subheading matching Image 09 */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Let's try that again.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          Your email or password wasn't recognized. Check both and try again.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900 transition shadow-2xs placeholder:text-slate-400 bg-white"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900 transition shadow-2xs placeholder:text-slate-400 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 stroke-[1.8]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[1.8]" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot password? link centered */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Error Notification matching Image 09 */}
        {hasSubmitted && (
          <div className="text-center text-[12px] sm:text-[12.5px] text-slate-500 py-0.5">
            Email or password is incorrect. Please try again.
          </div>
        )}

        {/* Sign in Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </div>

        {/* Invitation only notice text */}
        <div className="text-center pt-2 px-2">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Admin accounts are invitation-only. Contact your platform owner for access.
          </p>
        </div>

        {/* Have an invitation? Activate account */}
        <div className="text-center pt-1">
          <span className="text-xs sm:text-[13px] text-slate-600">
            Have an invitation?{' '}
          </span>
          <button
            type="button"
            onClick={onActivateAccount}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Activate account
          </button>
        </div>
      </form>
    </div>
  );
}

