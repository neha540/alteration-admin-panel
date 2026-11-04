import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

export default function AdminSignInScreen({ 
  onSignIn, 
  onForgotPassword, 
  onActivateAccount,
  onRequireTwoFactor,
  onAccessDenied,
  initialEmail = ''
}) {
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if simulating access denied
      if (email.toLowerCase().includes('denied') || email.toLowerCase().includes('unauthorized')) {
        setIsLoading(false);
        if (onAccessDenied) {
          onAccessDenied(email);
          return;
        }
      }

      const res = await adminAuthService.login(email, password);
      setIsLoading(false);

      if (res.requiresTwoFactor) {
        if (onRequireTwoFactor) {
          onRequireTwoFactor({
            email: res.email || email,
            name: res.user?.name || 'Admin Workspace Owner',
            role: res.user?.role || 'Admin',
            twoFactorToken: res.twoFactorToken
          });
        }
      } else if (onSignIn) {
        onSignIn(res.user || {
          email: email || 'admin@alterationconnect.com',
          name: 'Admin Workspace Owner',
          role: 'Admin'
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="max-w-[390px] w-full mx-auto">
      {/* Title & Subheading */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Welcome back.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          Sign in to your admin workspace.
        </p>
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
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

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
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
        <div className="text-center pt-0.5 pb-0.5">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

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
