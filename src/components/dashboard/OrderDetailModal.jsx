import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Scissors, 
  Check, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import OrderRequestDetailsModal from './OrderRequestDetailsModal';
import OrderTimelineModal from './OrderTimelineModal';

export default function OrderDetailModal({ 
  order, 
  onClose, 
  onReviewStudio,
  onOpenRequestDetails,
  onOpenTimeline
}) {
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const currentOrder = order || {
    id: 'AC-1041',
    title: 'Denim hemming',
    studio: 'The Modern Hem',
    amount: '$36',
    status: 'In progress',
    completionDate: 'Oct 28, 2026'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Image 25 */}
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
              Order {currentOrder.id}
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
          {/* Status Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
              <Scissors className="w-3.5 h-3.5 -rotate-45" />
              <span>{currentOrder.status}</span>
            </span>

            <h3 className="text-2xl font-bold text-slate-900 mt-2.5 leading-tight">
              {currentOrder.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentOrder.studio}
            </p>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">
              {currentOrder.amount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Paid in demo
            </span>
          </div>

          {/* Callout Card matching Image 25 */}
          <div className="p-5 rounded-2xl bg-[#F0F5FA] border border-slate-200/80 space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Your alteration is in progress.
            </h4>
            <p className="text-xs text-slate-500">
              Your studio will update you when it's ready.
            </p>
            <p className="text-[11.5px] text-slate-400 pt-2 font-medium">
              Target completion: {currentOrder.completionDate || 'Oct 28, 2026'}
            </p>
          </div>

          {/* 4-Step Horizontal Timeline Stepper matching Image 25 */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-6 right-6 top-3 h-[2px] bg-emerald-200/80 z-0" />

              {/* Step 1: Request */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] text-slate-600 font-medium mt-1.5">Request</span>
              </div>

              {/* Step 2: Quote */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] text-slate-600 font-medium mt-1.5">Quote</span>
              </div>

              {/* Step 3: Payment (Active) */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs ring-4 ring-emerald-100">
                  3
                </div>
                <span className="text-[11px] text-slate-900 font-bold mt-1.5">Payment</span>
              </div>

              {/* Step 4: Pickup */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-1.5">Pickup</span>
              </div>
            </div>
          </div>

          {/* Details & Timeline links matching Images 25, 27, 28 */}
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            {/* Request details (Screen 27) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenRequestDetails) {
                  onOpenRequestDetails();
                } else {
                  setShowRequestDetails(true);
                }
              }}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>Request details</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-normal">View 27</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Order timeline (Screen 28) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenTimeline) {
                  onOpenTimeline();
                } else {
                  setShowTimeline(true);
                }
              }}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>Order timeline</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-normal">4 events</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Action Button matching Image 25 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReviewStudio) onReviewStudio({ name: currentOrder.studio });
              }}
              className="w-full py-3 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer text-center"
            >
              Review studio
            </button>
          </div>
        </div>

      </div>

      {/* Sub-modal: Request details (Screen 27) */}
      {showRequestDetails && (
        <OrderRequestDetailsModal
          order={currentOrder}
          onClose={() => setShowRequestDetails(false)}
          onBackToOrder={() => setShowRequestDetails(false)}
        />
      )}

      {/* Sub-modal: Order timeline (Screen 28) */}
      {showTimeline && (
        <OrderTimelineModal
          order={currentOrder}
          onClose={() => setShowTimeline(false)}
          onBackToOrder={() => setShowTimeline(false)}
        />
      )}
    </div>
  );
}
