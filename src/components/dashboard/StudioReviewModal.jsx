import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  CheckCircle2, 
  CreditCard, 
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
  const [membershipActive, setMembershipActive] = useState(!isPending);
  const [studioStatus, setStudioStatus] = useState(isPending ? 'In review' : 'Approved');

  let defaultDetails;

  if (isCongressCare) {
    // Screen 22: Application with territory conflict
    defaultDetails = {
      name: 'Congress Clothing Care',
      tagline: 'Local care for your wardrobe.',
      initials: 'CC',
      avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
      owner: 'Noah Ellis',
      email: 'noah@congresscare.example',
      phone: '(512) 555-0193',
      address: '16 Button Street',
      cityZip: 'South Congress, TX 78704',
      specialties: 'Everyday',
      about: 'A new applicant awaiting vetting and territory review.',
      hasConflict: true,
      territoryLabel: 'Territory conflict',
      territoryDistance: '2.10 miles to The Modern Hem'
    };
  } else if (isPending) {
    // Screen 21: Pending studio application (Round Rock Stitch)
    defaultDetails = {
      name: studio.name || 'Round Rock Stitch',
      tagline: 'A closer fit for Round Rock.',
      initials: studio.initials || 'RS',
      avatarBg: 'bg-[#EBF5ED] text-[#2D5A34]',
      owner: studio.owner || 'Emma Hayes',
      email: studio.email || 'emma@roundrockstitch.example',
      phone: '(512) 555-0189',
      address: '32 Needle Park',
      cityZip: 'Round Rock, TX 78664',
      specialties: 'Everyday, Repairs',
      about: 'A new neighborhood alteration studio applying to join the network.',
      hasConflict: false,
      territoryLabel: 'Territory check passed',
      territoryDistance: '8.18 miles to Northline Tailoring'
    };
  } else {
    // Screen 20: Active studio details (The Modern Hem)
    defaultDetails = {
      name: studio.name || 'The Modern Hem',
      tagline: 'Thoughtful tailoring. A beautiful fit.',
      initials: studio.initials || 'MH',
      avatarBg: studio.avatarBg || 'bg-[#F5EFE6] text-[#78593C]',
      owner: studio.owner || 'Olivia Bennett',
      email: studio.email || 'olivia@modernhem.example',
      phone: '(512) 555-0114',
      address: '125 Thread Lane, Suite 2',
      cityZip: studio.city ? `${studio.city} ${studio.zip || ''}` : 'Austin, TX 78701',
      specialties: 'Everyday, Suits, Designer',
      about: 'A neighborhood studio for the pieces you reach for every day. From a favorite pair of jeans to considered adjustments on your best jacket, our specialists help your wardrobe feel like you.',
      hasConflict: false,
      territoryLabel: 'Territory check passed',
      territoryDistance: '5.84 miles to Atelier Rose'
    };
  }

  const handleApprovePublish = () => {
    setStudioStatus('Approved');
    setMembershipActive(true);
    if (onApprove) {
      onApprove(studio.id);
    } else {
      setTimeout(() => onClose(), 400);
    }
  };

  const handleGrantPilotWaiver = () => {
    setMembershipActive(true);
    if (onGrantWaiver) onGrantWaiver(studio.id);
    alert("Pilot waiver granted: Membership requirement fulfilled for 90 days.");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar matching Images 20, 21, 22 */}
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
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Studio Profile Top Banner */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${defaultDetails.avatarBg} font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs`}>
              {defaultDetails.initials}
            </div>

            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {defaultDetails.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {defaultDetails.tagline}
              </p>

              {/* Status Badges */}
              <div className="flex items-center gap-2 mt-2">
                {studioStatus === 'Approved' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Approved
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    In review
                  </span>
                )}

                {membershipActive ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Payment required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Business Details & Publication Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left Column: Business Details */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Business details
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Owner</span>
                  <span className="font-semibold text-slate-900">{defaultDetails.owner}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800">{defaultDetails.email}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-800">{defaultDetails.phone}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Address</span>
                  <span className="font-medium text-slate-800 text-right leading-tight">
                    {defaultDetails.address}
                    <br />
                    <span className="text-slate-500">{defaultDetails.cityZip}</span>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Specialties</span>
                  <span className="font-semibold text-slate-900">{defaultDetails.specialties}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Publication Requirements matching Images 20, 21, 22 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Publication requirements
              </h4>

              <div className="space-y-3.5 text-xs">
                {/* 1. Territory Check */}
                {defaultDetails.hasConflict ? (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block">Territory conflict</span>
                      <span className="text-[11.5px] text-slate-500 block">{defaultDetails.territoryDistance}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Territory check passed</span>
                      <span className="text-[11.5px] text-slate-500 block">{defaultDetails.territoryDistance}</span>
                    </div>
                  </div>
                )}

                {/* 2. Membership Check */}
                {membershipActive ? (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Membership paid</span>
                      <span className="text-[11.5px] text-slate-500 block">$200 per month</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block">Membership is not active</span>
                      <span className="text-[11.5px] text-slate-500 block">$200 per month</span>
                    </div>
                  </div>
                )}

                {/* 3. Studio Approval Check */}
                {studioStatus === 'Approved' ? (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Studio approved</span>
                      <span className="text-[11.5px] text-slate-500 block">Confirm quality, identity and storefront details.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block">Business review required</span>
                      <span className="text-[11.5px] text-slate-500 block">Confirm quality, identity and storefront details.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* About the studio Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              About the studio
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {defaultDetails.about}
            </p>
          </div>

          {/* Info Banner matching screenshot */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Approval requires an active paid membership or pilot waiver and a clear 5-mile territory check.</span>
          </div>

        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => alert(`Previewing public studio profile for: ${defaultDetails.name}`)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              Preview profile
            </button>

            {isPending && (
              <button
                type="button"
                onClick={handleGrantPilotWaiver}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
              >
                Grant pilot waiver
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isPending ? (
              <button
                type="button"
                onClick={() => {
                  if (onSuspend) {
                    onSuspend(studio.id);
                  } else {
                    alert(`Studio listing suspended: ${defaultDetails.name}`);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Suspend listing
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    alert("Application declined.");
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Decline
                </button>

                <button
                  type="button"
                  onClick={handleApprovePublish}
                  className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Approve &amp; publish</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
