import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminActivateAccountScreen({ 
  onBackToSignIn, 
  onActivated 
}) {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !workEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onActivated) {
        onActivated({
          name: fullName,
          email: workEmail,
          role: 'Admin'
        });
      }
    }, 600);
  };

  return (
    <div className="max-w-[390px] w-full mx-auto">
      {/* Title & Subheading - Left aligned matching screenshot */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
          Set up your admin account.
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-2 leading-relaxed">
          You have been invited to the Alteration Connect admin workspace.
        </p>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Activation Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Your name"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900 transition shadow-2xs placeholder:text-slate-400 bg-white"
          />
        </div>

        {/* Work Email */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1.5">
            Work email
          </label>
          <input
            type="email"
            value={workEmail}
            onChange={(e) => {
              setWorkEmail(e.target.value);
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
              placeholder="Create a password"
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
          {/* Helper note */}
          <p className="text-[11.5px] text-slate-500 mt-1.5">
            Use at least 12 characters. Avoid reusing a password.
          </p>
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
                <span>Activating account...</span>
              </>
            ) : (
              <span>Activate admin account</span>
            )}
          </button>
        </div>

        {/* Link matching screenshot */}
        <div className="text-center pt-3">
          <span className="text-xs sm:text-[13px] text-slate-600">
            Already registered?{' '}
          </span>
          <button
            type="button"
            onClick={onBackToSignIn}
            className="text-xs sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
