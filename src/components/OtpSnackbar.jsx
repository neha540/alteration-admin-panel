import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, Sparkles, X } from 'lucide-react';

export default function OtpSnackbar({ otp, onAutoFill }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (otp) setVisible(true);
  }, [otp]);

  if (!otp || !visible) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto min-w-[340px] max-w-[440px] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <KeyRound className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">Verification OTP</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xl font-extrabold text-blue-400 tracking-[0.2em] font-mono leading-tight mt-0.5">
              {otp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onAutoFill && (
            <button
              type="button"
              onClick={() => onAutoFill(otp)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Copy OTP"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
