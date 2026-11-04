import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

export default function OrderRequestDetailsModal({ 
  order, 
  onClose,
  onBackToOrder 
}) {
  const currentOrder = order || {
    id: 'AC-1041',
    requestNote: 'Keep the original hem on my straight-leg jeans.',
    measurementNote: 'No measurements shared with this order.',
    service: 'Original denim hem',
    qty: 1,
    amount: '$36',
    total: '$36'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Image 27 */}
        <div className="px-6 sm:px-7 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Request details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Order {currentOrder.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Content Body matching Image 27 */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Request Notes */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {currentOrder.requestNote || 'Keep the original hem on my straight-leg jeans.'}
            </p>
            <p className="text-xs text-slate-400 font-normal">
              {currentOrder.measurementNote || 'No measurements shared with this order.'}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
              Price breakdown
            </h3>

            {/* Table */}
            <div className="space-y-2.5">
              {/* Header row */}
              <div className="grid grid-cols-12 text-xs text-slate-400 pb-1 border-b border-slate-100">
                <span className="col-span-8">Service</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>

              {/* Line item row */}
              <div className="grid grid-cols-12 text-xs text-slate-700 py-1.5 items-center">
                <span className="col-span-8 font-normal">{currentOrder.service || 'Original denim hem'}</span>
                <span className="col-span-2 text-center font-normal">{currentOrder.qty || 1}</span>
                <span className="col-span-2 text-right font-normal">{currentOrder.amount || '$36'}</span>
              </div>

              {/* Total row */}
              <div className="grid grid-cols-12 text-xs font-bold text-slate-900 pt-3 border-t border-slate-100 items-center">
                <span className="col-span-8">Total</span>
                <span className="col-span-2 text-center"></span>
                <span className="col-span-2 text-right">{currentOrder.total || '$36'}</span>
              </div>
            </div>
          </div>

          {/* Back Action button */}
          {onBackToOrder && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToOrder}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to order</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

