import React, { useState } from 'react';
import { 
  Briefcase, 
  Check, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import StudioReviewModal from './StudioReviewModal';

export default function OverviewView({ onNavigateTab }) {
  const [studios, setStudios] = useState([
    {
      id: 1,
      name: 'Round Rock Stitch',
      location: 'Round Rock, TX · 78664',
      status: 'Territory clear · Membership needed',
      actionType: 'primary',
      actionLabel: 'Review application'
    },
    {
      id: 2,
      name: 'Congress Clothing Care',
      location: 'South Congress, TX · 78704',
      status: 'Territory conflict · Membership needed',
      actionType: 'secondary',
      actionLabel: 'Review application'
    }
  ]);

  const [reviewModalStudio, setReviewModalStudio] = useState(null);

  return (
    <div className="space-y-6">
      {/* Title & Subheading matching Image 11 */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Overview
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Review applications and keep the network running.
        </p>
      </div>

      {/* Grid: Left Applications (approx 65%), Right Support & Spacing (approx 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Applications to review */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Applications to review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                2 awaiting review
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('studios')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>View all</span>
              <span>→</span>
            </button>
          </div>

          {/* Applications List */}
          <div className="divide-y divide-slate-100">
            {studios.map((studio) => (
              <div
                key={studio.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    <Briefcase className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {studio.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {studio.location}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {studio.status}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewModalStudio(studio)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    studio.actionType === 'primary'
                      ? 'bg-[#2361E9] hover:bg-[#1D4ED8] text-white shadow-2xs'
                      : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {studio.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support & Territory Spacing */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Support Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Support
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              0 open requests
            </p>

            <div className="my-5 flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              <span>No requests waiting.</span>
            </div>

            <button
              type="button"
              onClick={() => alert("Support console: All partner tickets resolved.")}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Open support
            </button>
          </div>

          {/* Territory Spacing Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Territory spacing</span>
            </span>

            <h3 className="text-lg font-bold text-slate-900 mt-3.5">
              5 miles minimum
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Live studios meet the current spacing rule.
            </p>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('territories')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer mt-4 inline-flex items-center gap-1"
            >
              <span>Check territories</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom 3-Metric Stats Row Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="pb-4 md:pb-0 md:pr-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">
            4
          </span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Live studios
          </span>
        </div>

        <div className="py-4 md:py-0 md:px-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">
            $800
          </span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Monthly membership revenue
          </span>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">
            3
          </span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Registered customers
          </span>
        </div>
      </div>

      {/* Studio Review Modal matching Image 21 */}
      {reviewModalStudio && (
        <StudioReviewModal
          studio={reviewModalStudio}
          onClose={() => setReviewModalStudio(null)}
          onApprove={() => {
            setStudios(prev => prev.filter(s => s.id !== reviewModalStudio.id));
            setReviewModalStudio(null);
          }}
          onGrantWaiver={() => {
            alert("Pilot waiver granted.");
          }}
        />
      )}
    </div>
  );
}

