import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  CheckCircle2,
  AlertCircle, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function StudioReviewModal({ 
  studio, 
  onClose, 
  onApprove, 
  onSuspend,
  onGrantWaiver
}) {
  if (!studio) return null;

  const isPending = studio.status === 'In review' || studio.reviewStatus === 'In review';
  const isCongressCare = studio.name?.includes('Congress') || studio.initials === 'CC' || studio.hasConflict;
  const isPaid = Boolean(studio.membershipPaid === true || studio.paymentStatus === 'paid' || studio.membership === 'Paid');
  const [membershipActive, setMembershipActive] = useState(isPaid);
  const [studioStatus, setStudioStatus] = useState(isPending ? 'In review' : (studio.status || 'Approved'));

  // Parse location
  const streetAddr = studio.address || '125 Thread Lane, Suite 2';
  const studioCity = studio.city || 'Austin';
  const studioState = studio.state || 'TX';
  const studioZip = studio.zip || '78701';

  const currentDetails = {
    name: studio.name || 'The Modern Hem',
    tagline: studio.tagline || (isPending ? 'A new studio applying to join the network.' : 'Thoughtful tailoring. A beautiful fit.'),
    initials: studio.initials || (studio.name ? studio.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MH'),
    avatarBg: studio.avatarBg || 'bg-[#F5EBE1] text-[#6E4B33]',
    owner: studio.owner || 'Olivia Bennett',
    email: studio.email || 'olivia@modernhem.example',
    phone: studio.phone || '(512) 555-0114',
    address: streetAddr,
    city: studioCity,
    state: studioState,
    zip: studioZip,
    specialties: Array.isArray(studio.specialties) && studio.specialties.length > 0 
      ? studio.specialties.join(', ') 
      : (studio.specialties || 'Everyday, Suits, Designer'),
    image: studio.image || '',
    about: studio.about || studio.bio || 'A neighborhood studio for the pieces you reach for every day. From a favorite pair of jeans to considered adjustments on your best jacket, our specialists help your wardrobe feel like you.',
    hasConflict: isCongressCare || Boolean(studio.hasConflict),
    territoryLabel: (isCongressCare || Boolean(studio.hasConflict)) ? 'Territory conflict' : 'Territory check passed',
    territoryDistance: studio.distance ? `${studio.distance} to nearest studio` : '5.84 miles to Atelier Rose'
  };

  const handleApprovePublish = () => {
    setStudioStatus('Approved');
    setMembershipActive(true);
    if (onApprove) {
      onApprove(studio.id);
    } else {
      setTimeout(() => onClose(), 400);
    }
  };

  const handlePreviewProfile = () => {
    const studioUrl = `http://localhost:5173/studio/${studio.id || ''}`;
    window.open(studioUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Inter',Arial,sans-serif]">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar matching Figma Image 23 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Studio review
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">

          {/* Studio Profile Top Header matching Figma */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${currentDetails.avatarBg} font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs overflow-hidden`}>
              {currentDetails.image ? (
                <img src={currentDetails.image} alt={currentDetails.name} className="w-full h-full object-cover" />
              ) : (
                currentDetails.initials
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {currentDetails.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-normal">
                {currentDetails.tagline}
              </p>

              {/* Status Badges matching Figma */}
              <div className="flex items-center gap-2 mt-2.5">
                {studioStatus === 'Approved' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E6F4EA] text-[#137333]">
                    Approved
                  </span>
                ) : studioStatus === 'Suspended' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Suspended
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    In review
                  </span>
                )}

                {membershipActive ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E6F4EA] text-[#137333]">
                    Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700">
                    Payment required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Business Details & Publication Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1 items-start">
            
            {/* Left Column: Business details (no edit, no portal login) */}
            <div className="md:col-span-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-900">
                Business details
              </h4>

              <div className="space-y-3.5 text-xs">
                {/* Owner */}
                <div className="flex justify-between items-baseline gap-4 border-b border-slate-50 pb-2.5">
                  <span className="text-slate-400 font-normal">Owner</span>
                  <span className="font-semibold text-slate-900 text-right">{currentDetails.owner}</span>
                </div>

                {/* Email */}
                <div className="flex justify-between items-baseline gap-4 border-b border-slate-50 pb-2.5">
                  <span className="text-slate-400 font-normal">Email</span>
                  <span className="font-normal text-slate-700 text-right">{currentDetails.email}</span>
                </div>

                {/* Phone */}
                <div className="flex justify-between items-baseline gap-4 border-b border-slate-50 pb-2.5">
                  <span className="text-slate-400 font-normal">Phone</span>
                  <span className="font-normal text-slate-700 text-right">{currentDetails.phone}</span>
                </div>

                {/* Address */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-2.5">
                  <span className="text-slate-400 font-normal shrink-0">Address</span>
                  <span className="font-normal text-slate-700 text-right leading-relaxed">
                    {currentDetails.address}
                    <br />
                    {[currentDetails.city, `${currentDetails.state} ${currentDetails.zip}`].filter(Boolean).join(', ')}
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex justify-between items-baseline gap-4 pb-1">
                  <span className="text-slate-400 font-normal shrink-0">Specialties</span>
                  <span className="font-normal text-slate-700 text-right">
                    {currentDetails.specialties}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Publication requirements Box */}
            <div className="md:col-span-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 mb-3">
                  Publication requirements
                </h4>

                <div className="space-y-4 text-xs">
                  {/* 1. Territory Check */}
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        {currentDetails.territoryLabel}
                      </span>
                      <span className="text-[11.5px] text-slate-400 block mt-0.5">
                        {currentDetails.territoryDistance}
                      </span>
                    </div>
                  </div>

                  {/* 2. Membership Check */}
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        Membership paid
                      </span>
                      <span className="text-[11.5px] text-slate-400 block mt-0.5">
                        ${studio.paidAmount || studio.membershipFee || 200} per month
                      </span>
                    </div>
                  </div>

                  {/* 3. Studio Approval Check */}
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        Studio approved
                      </span>
                      <span className="text-[11.5px] text-slate-400 block mt-0.5">
                        Confirm quality, identity and storefront details.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* About the studio Section matching Figma */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              About the studio
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {currentDetails.about}
            </p>
          </div>

          {/* Notice Callout Box matching Figma */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-2.5 text-xs text-slate-500 font-normal">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Approval requires an active paid membership or pilot waiver and a clear 5-mile territory check.</span>
          </div>

        </div>

        {/* Modal Bottom Actions Bar matching Figma Image 23 */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {/* Left Action: Preview profile */}
          <button
            type="button"
            onClick={handlePreviewProfile}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
          >
            Preview profile
          </button>

          {/* Right Action */}
          <div>
            {isPending ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert("Application declined.");
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleApprovePublish}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Approve &amp; publish</span>
                </button>
              </div>
            ) : studioStatus === 'Suspended' ? (
              <button
                type="button"
                onClick={() => {
                  setStudioStatus('Approved');
                  if (onApprove) onApprove(studio.id);
                }}
                className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reactivate listing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onSuspend) {
                    onSuspend(studio.id);
                  } else {
                    setStudioStatus('Suspended');
                    alert(`Studio listing suspended: ${currentDetails.name}`);
                    onClose();
                  }
                }}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Suspend listing
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
