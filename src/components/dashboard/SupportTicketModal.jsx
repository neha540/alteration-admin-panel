import React, { useState } from 'react';
import { ArrowLeft, X, Check } from 'lucide-react';

export default function SupportTicketModal({ 
  ticket, 
  onClose, 
  onResolve 
}) {
  const currentTicket = ticket || {
    id: 'SUP-DEMO',
    from: 'Customer',
    email: 'alexandra@example.com',
    received: 'Oct 26, 4:01 PM',
    message: 'Please help me confirm my fitting time.',
    status: 'Open'
  };

  const isResolved = (currentTicket.status || '').toLowerCase() === 'resolved';

  const [resolutionText, setResolutionText] = useState(
    currentTicket.resolution || 'Your request has been reviewed and marked resolved. If you need more help, please submit a follow-up request.'
  );

  const handleResolve = () => {
    if (onResolve) {
      onResolve(currentTicket.id, resolutionText);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Inter',Arial,sans-serif]">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar matching Image 26 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Support request
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Support Request Details */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Support request
              </h3>
              {isResolved ? (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E6F4EA] text-[#137333] border border-emerald-200">
                  Resolved
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {currentTicket.status || 'Open'}
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">From</span>
                <span className="font-semibold text-slate-900">{currentTicket.from}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{currentTicket.email}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Received</span>
                <span className="text-slate-700">{currentTicket.received}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-slate-700">{currentTicket.id}</span>
              </div>
            </div>

            {/* Message */}
            <div className="pt-2">
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                {currentTicket.message}
              </p>
            </div>
          </div>

          {/* Resolution Message Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Resolution message
            </h4>

            {isResolved ? (
              <div className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-normal">
                {currentTicket.resolution || resolutionText}
              </div>
            ) : (
              <textarea
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs leading-relaxed"
              />
            )}

            <p className="text-[11.5px] text-slate-400">
              {isResolved 
                ? 'This request has been marked as resolved.'
                : 'This updates the request history in the preview.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: If Resolved show Close only, if Open show Keep open & Resolve */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          {isResolved ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Request resolved</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
              >
                Keep open
              </button>

              <button
                type="button"
                onClick={handleResolve}
                className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Resolve request</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
