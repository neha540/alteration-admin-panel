import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

export default function OrderTimelineModal({ 
  order, 
  onClose,
  onBackToOrder 
}) {
  const currentOrder = order || {
    id: 'AC-1041'
  };

  const timelineEvents = [
    {
      title: 'Request received',
      timestamp: 'Oct 10, 2026 · 8:00 AM',
    },
    {
      title: 'Quote accepted',
      timestamp: 'Oct 10, 2026 · 9:00 AM',
    },
    {
      title: 'Demo payment received · $36',
      timestamp: 'Oct 10, 2026 · 10:00 AM',
    },
    {
      title: 'Alteration in progress',
      timestamp: 'Oct 11, 2026 · 10:00 AM',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Image 28 */}
        <div className="px-6 sm:px-7 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Order timeline
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

        {/* Content Body matching Image 28 */}
        <div className="p-6 sm:p-7 space-y-6">
          <div className="relative pl-6 py-2">
            {/* Continuous Vertical Connecting Line */}
            <div className="absolute left-[8px] top-3 bottom-5 w-[1.5px] bg-slate-200" />

            {/* Timeline Items */}
            <div className="space-y-6">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative flex items-start">
                  {/* Circle Dot */}
                  <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-[#0F766E] ring-4 ring-white shrink-0" />
                  
                  {/* Event Details */}
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-900">
                      {evt.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {evt.timestamp}
                    </p>
                  </div>
                </div>
              ))}
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

