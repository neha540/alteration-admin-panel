import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  CheckCircle2, 
  CreditCard,
  Eye,
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  getStudioCoordinates, 
  resolveStudioCoordinates,
  calculateDistanceMiles,
  formatStudioLocation
} from '../../utils/locationHelper';
import { adminDataService } from '../../services/adminDataService';
import StudioProfilePreviewModal from './StudioProfilePreviewModal';

export default function StudioReviewModal({ 
  studio, 
  allStudios = [],
  networkSettings,
  onClose, 
  onApprove, 
  onDecline,
  onSuspend,
  onGrantWaiver
}) {
  if (!studio) return null;

  const [studiosList, setStudiosList] = useState(Array.isArray(allStudios) && allStudios.length > 0 ? allStudios : []);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isGrantingWaiver, setIsGrantingWaiver] = useState(false);
  const [waiverActive, setWaiverActive] = useState(Boolean(studio.waiverGranted));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync or fetch live studios list for real-time territory evaluation
  useEffect(() => {
    if (Array.isArray(allStudios) && allStudios.length > 0) {
      setStudiosList(allStudios);
    } else {
      adminDataService.getStudios().then(data => {
        if (Array.isArray(data)) setStudiosList(data);
      }).catch(() => {});
    }
  }, [allStudios]);

  useEffect(() => {
    if (studio.waiverGranted !== undefined) {
      setWaiverActive(Boolean(studio.waiverGranted));
    }
  }, [studio.waiverGranted]);

  const activeSpacing = parseFloat(networkSettings?.studioSpacing || '5') || 5;

  const isPending = studio.status === 'In review' || studio.reviewStatus === 'In review';
  const isPaid = Boolean(studio.membershipPaid === true || studio.paymentStatus === 'paid' || studio.membership === 'Paid' || waiverActive);
  const [membershipActive, setMembershipActive] = useState(isPaid);
  const [studioStatus, setStudioStatus] = useState(studio.status || (isPending ? 'In review' : 'Approved'));

  useEffect(() => {
    setMembershipActive(Boolean(studio.membershipPaid === true || studio.paymentStatus === 'paid' || studio.membership === 'Paid' || waiverActive));
  }, [studio.membershipPaid, studio.paymentStatus, studio.membership, waiverActive]);

  const [resolvedCoords, setResolvedCoords] = useState({});

  // Asynchronously resolve real coordinates for all studios
  useEffect(() => {
    let mounted = true;
    const all = [studio, ...(studiosList || [])].filter(Boolean);
    all.forEach(async (st) => {
      if (!st || !st.id) return;
      const coords = await resolveStudioCoordinates(st);
      if (coords && mounted) {
        setResolvedCoords(prev => {
          if (prev[st.id]?.lat === coords.lat && prev[st.id]?.lng === coords.lng) return prev;
          return { ...prev, [st.id]: coords };
        });
      }
    });
    return () => { mounted = false; };
  }, [studio, studiosList]);

  // Parse location cleanly from address & PIN
  const loc = formatStudioLocation(studio);
  const streetAddr = studio.address || studio.streetAddress || loc.primary;
  const studioCity = loc.primary;
  const studioState = (studio.state && studio.state !== 'TX') ? studio.state : '';
  const studioZip = studio.zip || studio.postalCode || '';

  // 1. DYNAMIC TERRITORY CHECK CALCULATION AGAINST NETWORK STUDIOS
  const territoryInfo = useMemo(() => {
    const hasWaiver = Boolean(waiverActive || studio.waiverGranted);
    const studioCoords = resolvedCoords[studio.id] || getStudioCoordinates(studio);
    let nearestStudio = null;
    let minDistance = null;

    studiosList.forEach((other) => {
      if (!other) return;
      if (other.id === studio.id || other.name === studio.name) return;
      const otherCoords = resolvedCoords[other.id] || getStudioCoordinates(other);

      // GUARD: If both studios share the un-geocoded default fallback center, do NOT falsely treat as 0.00
      const isBothDefault = Math.abs(studioCoords.lat - 21.8974) < 0.001 &&
                            Math.abs(studioCoords.lng - 83.3950) < 0.001 &&
                            Math.abs(otherCoords.lat - 21.8974) < 0.001 &&
                            Math.abs(otherCoords.lng - 83.3950) < 0.001 &&
                            (studio.address || studio.id) !== (other.address || other.id);

      if (isBothDefault && !resolvedCoords[studio.id] && !resolvedCoords[other.id]) {
        return;
      }

      const dist = calculateDistanceMiles(
        studioCoords.lat, 
        studioCoords.lng, 
        otherCoords.lat, 
        otherCoords.lng
      );
      if (dist !== null) {
        if (minDistance === null || dist < minDistance) {
          minDistance = dist;
          nearestStudio = other;
        }
      }
    });

    const hasConflict = !hasWaiver && (minDistance !== null && minDistance < activeSpacing);

    let territoryLabel = 'Territory check passed';
    let territoryDistance = '';

    if (hasWaiver) {
      territoryLabel = 'Territory waiver granted';
      territoryDistance = nearestStudio && minDistance !== null
        ? `Pilot waiver active · ${minDistance.toFixed(2)} miles to ${nearestStudio.name}`
        : 'Pilot waiver active · Territory exemption granted';
    } else if (hasConflict) {
      territoryLabel = 'Territory conflict';
      territoryDistance = nearestStudio && minDistance !== null
        ? `${minDistance.toFixed(2)} miles to ${nearestStudio.name}`
        : `Territory conflict within ${activeSpacing} miles`;
    } else if (nearestStudio && minDistance !== null) {
      territoryLabel = 'Territory check passed';
      territoryDistance = `${minDistance.toFixed(2)} miles to ${nearestStudio.name}`;
    } else {
      territoryLabel = 'Territory check passed';
      territoryDistance = `No competing studios within ${activeSpacing} miles`;
    }

    return {
      hasConflict,
      hasWaiver,
      nearestStudio,
      minDistance,
      territoryLabel,
      territoryDistance,
      isPassed: hasWaiver || !hasConflict
    };
  }, [studio, studiosList, activeSpacing, waiverActive, resolvedCoords]);

  // 2. DYNAMIC MEMBERSHIP CHECK CALCULATION
  const membershipFee = studio.paidAmount || studio.membershipFee || networkSettings?.membershipFee || '300';

  // 3. DYNAMIC STUDIO APPROVAL STATUS
  const isApproved = studioStatus === 'Approved';
  const isDeclined = studioStatus === 'Declined';
  const isSuspended = studioStatus === 'Suspended';

  const currentDetails = {
    name: studio.name || 'Tailoring Studio',
    tagline: studio.tagline || (isPending ? 'A new studio applying to join the network.' : 'Thoughtful tailoring. A beautiful fit.'),
    initials: studio.initials || (studio.name ? studio.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
    avatarBg: studio.avatarBg || 'bg-[#F5EFE6] text-[#78593C]',
    owner: studio.owner || 'Owner',
    email: studio.email || 'studio@example.com',
    phone: studio.phone || '(512) 555-0100',
    address: streetAddr,
    city: studioCity,
    state: studioState,
    zip: studioZip,
    specialties: Array.isArray(studio.specialties) && studio.specialties.length > 0 
      ? studio.specialties.join(', ') 
      : (studio.specialties || 'Everyday'),
    image: studio.image || '',
    about: studio.about || studio.bio || 'A new neighborhood alteration studio applying to join the network.'
  };

  const handleApprovePublish = async () => {
    setIsApproving(true);
    try {
      setStudioStatus('Approved');
      setMembershipActive(true);
      if (onApprove) {
        await onApprove(studio.id);
      } else {
        await adminDataService.updateStudioStatus(studio.id, 'Approved');
        window.dispatchEvent(new Event('admin_studios_updated'));
        onClose();
      }
    } catch (err) {
      console.warn('Approve studio error:', err);
      alert(err.message || 'Failed to approve studio.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      setStudioStatus('Declined');
      if (onDecline) {
        await onDecline(studio.id);
      } else {
        await adminDataService.updateStudioStatus(studio.id, 'Declined');
        window.dispatchEvent(new Event('admin_studios_updated'));
        onClose();
      }
    } catch (err) {
      console.warn('Decline studio error:', err);
      alert(err.message || 'Failed to decline studio application.');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleGrantPilotWaiver = async () => {
    setIsGrantingWaiver(true);
    try {
      if (onGrantWaiver) {
        await onGrantWaiver(studio.id);
      } else {
        await adminDataService.updateStudio(studio.id, {
          waiverGranted: true,
          waiverReason: 'Pilot waiver 90 days',
          waiverDate: new Date().toISOString()
        });
        window.dispatchEvent(new Event('admin_studios_updated'));
      }
      setWaiverActive(true);
      setMembershipActive(true);
    } catch (err) {
      console.warn('Grant pilot waiver error:', err);
      alert(err.message || 'Failed to grant pilot waiver.');
    } finally {
      setIsGrantingWaiver(false);
    }
  };

  const handlePreviewProfile = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Inter',Arial,sans-serif]">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar matching Figma Image 21 & 22 */}
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

          {/* Studio Profile Top Header matching Figma Image 21 & 22 */}
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

              {/* Status Badges matching Figma Image 21 & 22 */}
              <div className="flex items-center gap-2 mt-2.5">
                {isApproved ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E6F4EA] text-[#137333] border border-emerald-200">
                    Approved
                  </span>
                ) : isDeclined ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Declined
                  </span>
                ) : isSuspended ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Suspended
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    In review
                  </span>
                )}

                {membershipActive ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E6F4EA] text-[#137333] border border-emerald-200">
                    Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    Payment required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Business Details & Publication Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1 items-start">
            
            {/* Left Column: Business details */}
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
                  <span className="font-normal text-slate-700 text-right select-all">{currentDetails.email}</span>
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
                    {currentDetails.address || currentDetails.city}
                    {currentDetails.zip && (
                      <span className="block text-slate-500 text-[11px] mt-0.5">
                        PIN {currentDetails.zip}
                      </span>
                    )}
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

            {/* Right Column: Publication Requirements Box matching Figma Image 21 & 22 */}
            <div className="md:col-span-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 mb-1">
                  Publication requirements
                </h4>

                <div className="space-y-4 text-xs">
                  {/* 1. DYNAMIC TERRITORY CHECK */}
                  <div className="flex items-start gap-3">
                    {territoryInfo.hasConflict ? (
                      <ShieldAlert className="w-5 h-5 text-[#966027] shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" strokeWidth={1.75} />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`font-semibold block leading-tight ${territoryInfo.hasConflict ? 'text-[#966027]' : 'text-[#137333]'}`}>
                        {territoryInfo.territoryLabel}
                      </span>
                      <span className="text-[11.5px] text-slate-500 block mt-0.5 leading-relaxed">
                        {territoryInfo.territoryDistance}
                      </span>
                    </div>
                  </div>

                  {/* 2. DYNAMIC MEMBERSHIP CHECK */}
                  <div className="flex items-start gap-3">
                    {membershipActive ? (
                      <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : (
                      <CreditCard className="w-5 h-5 text-[#966027] shrink-0 mt-0.5" strokeWidth={1.75} />
                    )}
                    <div>
                      <span className={`font-semibold block leading-tight ${membershipActive ? 'text-[#137333]' : 'text-[#966027]'}`}>
                        {membershipActive ? 'Membership paid' : 'Membership is not active'}
                      </span>
                      <span className="text-[11.5px] text-slate-500 block mt-0.5">
                        ${membershipFee} per month
                      </span>
                    </div>
                  </div>

                  {/* 3. DYNAMIC STUDIO APPROVAL CHECK */}
                  <div className="flex items-start gap-3">
                    {isApproved ? (
                      <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : isDeclined ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-5 h-5 text-[#966027] shrink-0 mt-0.5" strokeWidth={1.75} />
                    )}
                    <div>
                      <span className={`font-semibold block leading-tight ${
                        isApproved ? 'text-[#137333]' : isDeclined ? 'text-rose-700' : 'text-[#966027]'
                      }`}>
                        {isApproved 
                          ? 'Studio approved' 
                          : isDeclined 
                            ? 'Studio declined' 
                            : 'Business review required'}
                      </span>
                      <span className="text-[11.5px] text-slate-500 block mt-0.5">
                        Confirm quality, identity and storefront details.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* About the studio Section matching Figma Image 21 & 22 */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              About the studio
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {currentDetails.about}
            </p>
          </div>

          {/* Notice Callout Box matching Figma Image 21 & 22 */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-2.5 text-xs text-slate-500 font-normal">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Approval requires an active paid membership or pilot waiver and a clear {activeSpacing}-mile territory check.</span>
          </div>

        </div>

        {/* Modal Bottom Actions Bar matching Figma Image 21 & 22 */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {/* Left Action Buttons: Preview profile & Grant pilot waiver */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreviewProfile}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
            >
              Preview profile
            </button>

            <button
              type="button"
              disabled={isGrantingWaiver}
              onClick={handleGrantPilotWaiver}
              className={`px-4 py-2 border text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5 ${
                waiverActive 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              {isGrantingWaiver ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span>Granting...</span>
                </>
              ) : waiverActive ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Pilot waiver active</span>
                </>
              ) : (
                <span>Grant pilot waiver</span>
              )}
            </button>
          </div>

          {/* Right Action Buttons: Decline & Approve & publish */}
          <div>
            {isPending ? (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={isDeclining || isApproving}
                  onClick={handleDecline}
                  className="text-xs font-semibold text-[#966027] hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
                >
                  {isDeclining ? 'Declining...' : 'Decline'}
                </button>
                <button
                  type="button"
                  disabled={isApproving || isDeclining}
                  onClick={handleApprovePublish}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Approve &amp; publish</span>
                    </>
                  )}
                </button>
              </div>
            ) : isDeclined ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-rose-600 font-semibold">
                  Application declined
                </span>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={handleApprovePublish}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Reconsider &amp; Approve</span>
                    </>
                  )}
                </button>
              </div>
            ) : isSuspended ? (
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

      {/* In-app Studio Profile Preview Popup */}
      {isPreviewOpen && (
        <StudioProfilePreviewModal
          isOpen={isPreviewOpen}
          studio={studio}
          onClose={() => setIsPreviewOpen(false)}
          onApprove={isPending ? handleApprovePublish : undefined}
          onDecline={isPending ? handleDecline : undefined}
        />
      )}
    </div>
  );
}
