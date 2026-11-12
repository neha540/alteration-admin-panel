import React, { useState } from 'react';
import { Check, X, Copy, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col justify-between p-3 sm:p-6 lg:p-10 select-none font-['Arial',sans-serif]">
      {/* Top Figma Frame Label */}
      <div className="w-full max-w-[1080px] mx-auto mb-2 px-2 sm:px-3">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900 tracking-tight">
          <span>04</span>
          <span className="text-slate-400 font-normal">/</span>
          <span className="tracking-wide">EMPTY, ERROR &amp; CONFIRMATION STATES</span>
        </div>
        <div className="text-[12px] font-medium text-slate-400 mt-0.5">
          29 · Studio approved &amp; credentials generated.
        </div>
      </div>

      {/* Main Full-Size Card */}
      <div className="w-full max-w-[1080px] mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/70 overflow-hidden flex flex-col min-h-[640px]">
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AdminLogo className="h-6" />
          </div>

          <button
            type="button"
            onClick={onClose || onViewStudios}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center my-auto max-w-xl mx-auto w-full">
          {/* Green Check Box */}
          <div className="w-12 h-12 rounded-xl bg-[#EAF7EE] text-[#16A34A] flex items-center justify-center shadow-2xs">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-4 tracking-tight">
            {studioName} Approved!
          </h1>

          {/* Subtitle with Nodemailer notification */}
          <p className="text-xs sm:text-[13px] text-slate-500 mt-2 leading-relaxed font-normal">
            The studio application is verified and activated. Login credentials have been automatically dispatched to <strong>{loginEmail}</strong> via Gmail SMTP (Nodemailer).
          </p>

          {/* Credentials Display Box */}
          <div className="w-full mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Studio Partner Credentials (Sent via Mail)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Studio ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{studioId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Login Email / ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{loginEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Temporary Password:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">{tempPassword}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
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

          {/* Action CTA Button */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Copy credentials
            </button>
            <button
              type="button"
              onClick={onViewStudios}
              className="px-6 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              View studio directory
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-[1080px] mx-auto mt-4 px-3 flex items-center justify-between text-xs text-slate-400">
        <span>Alteration Connect</span>
        <span>Platform Admin Console</span>
      </div>
    </div>
  );
}

