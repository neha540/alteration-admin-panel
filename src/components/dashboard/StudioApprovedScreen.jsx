import React, { useState } from 'react';
import { Check, X, Copy, Mail, ExternalLink } from 'lucide-react';
import AdminLogo from '../AdminLogo';

export default function StudioApprovedScreen({ 
  studio,
  credentials,
  onClose, 
  onViewStudios 
}) {
  const [copied, setCopied] = useState(false);

  const studioName = studio?.name || 'Studio';
  const studioId = credentials?.studioId || studio?.id || '—';
  const loginEmail = credentials?.email || studio?.email || '—';
  const tempPassword = credentials?.password || studio?.defaultPassword || 'Studio@123';
  const portalUrl = credentials?.portalUrl || 'https://altration-panel.alteration-connect.workers.dev';

  const handleCopy = () => {
    const text = `Alteration Connect - Studio Login Credentials\nStudio: ${studioName}\nStudio ID: ${studioId}\nLogin Email: ${loginEmail}\nPassword: ${tempPassword}\nPanel URL: ${portalUrl}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex items-center justify-center p-4 sm:p-6 select-none font-['Arial',sans-serif]">
      {/* Main Full-Size Card */}
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/70 overflow-hidden flex flex-col">
        {/* Top Navbar with Logo & Close Button */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AdminLogo className="h-7" />
          </div>

          <button
            type="button"
            onClick={onClose || onViewStudios}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Content Area with Credentials Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Credentials Display Box */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Studio Partner Credentials
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Studio ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 select-all">{studioId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Login Email / ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 select-all">{loginEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Temporary Password:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded border border-slate-200 select-all">{tempPassword}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Studio Portal:</span>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Open panel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              {copied ? 'Credentials copied' : 'Copy credentials'}
            </button>
            <button
              type="button"
              onClick={onViewStudios || onClose}
              className="px-6 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              View studio directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
