import React from 'react';
import { ArrowLeft, X, Download } from 'lucide-react';

export default function StudioMembershipModal({ 
  studio, 
  onClose, 
  onReviewStudio 
}) {
  const currentStudio = studio || {
    name: 'The Modern Hem',
    location: 'Austin, TX 78701',
    membership: 'Paid',
    fee: '$200',
    approval: 'Approved',
    listing: 'Live',
    billingEmail: 'olivia@modernhem.example',
    paymentId: 'SP-1000',
    paymentDate: 'Oct 1, 9:00 AM · Paid',
    paymentAmount: '$200'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Image 23 */}
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
              Membership details
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
          {/* Studio Header */}
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {currentStudio.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStudio.location}
            </p>
          </div>

          {/* Details Rows matching Image 23 */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Membership</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentStudio.membership}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Monthly fee</span>
              <span className="font-bold text-slate-900">{currentStudio.fee}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Studio approval</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentStudio.approval}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Public listing</span>
              <span className="font-semibold text-emerald-600">{currentStudio.listing}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Billing email</span>
              <span className="font-medium text-slate-800">{currentStudio.billingEmail}</span>
            </div>
          </div>

          {/* Payments Recorded in This Preview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Payments recorded in this preview
            </h4>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {currentStudio.paymentId}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {currentStudio.paymentDate}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-xs text-slate-900">
                  {currentStudio.paymentAmount}
                </span>

                <button
                  type="button"
                  onClick={() => alert(`Receipt downloaded for ${currentStudio.paymentId}`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button matching Image 23 */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReviewStudio) onReviewStudio(currentStudio);
              }}
              className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              Review studio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

