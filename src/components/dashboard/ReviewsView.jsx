import React from 'react';
import { Scissors } from 'lucide-react';

export default function ReviewsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Customer reviews
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Review feedback from completed orders.
        </p>
      </div>

      {/* Info Callout Banner matching Image 17 */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        Only completed orders can receive a review. Hidden reviews stay in the activity record but do not appear on the public studio page.
      </div>

      {/* Empty State Card matching Image 17 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-12 sm:p-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 mb-4">
          <Scissors className="w-5 h-5 -rotate-45" />
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          No new customer reviews yet
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          A customer can leave a review from a completed order. Reviews will appear here for moderation.
        </p>
      </div>
    </div>
  );
}
