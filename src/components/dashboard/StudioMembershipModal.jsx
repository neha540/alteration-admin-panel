import React from 'react';
import { ArrowLeft, X, Download } from 'lucide-react';
import { downloadReceipt } from '../../utils/receipt';

export default function StudioMembershipModal({ 
  studio, 
  onClose, 
  onReviewStudio 
}) {
  const fallbackFee = (() => {
    try {
      const cached = localStorage.getItem('alteration_network_settings') || localStorage.getItem('alteration_admin_network_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.membershipFee) return `$${parsed.membershipFee}`;
      }
    } catch (e) {}
    return '$300';
  })();

  const currentStudio = studio || {
    name: 'The Modern Hem',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    membership: 'Paid',
    fee: fallbackFee,
    status: 'Approved',
    approval: 'Approved',
    listing: 'Live',
    billingEmail: 'olivia@modernhem.example',
    paymentId: 'SP-1000',
    paymentDate: 'Oct 1, 9:00 AM · Paid',
    paymentAmount: fallbackFee
  };

  // 1. DYNAMIC LOCATION RESOLUTION
  const locationText = (() => {
    if (currentStudio.location) return currentStudio.location;
    const parts = [];
    if (currentStudio.address) parts.push(currentStudio.address);
    const cityStateZip = [
      currentStudio.city,
      [currentStudio.state || (currentStudio.city ? 'TX' : ''), currentStudio.zip].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ');

    if (cityStateZip && (!currentStudio.address || !currentStudio.address.toLowerCase().includes((currentStudio.city || '').toLowerCase()))) {
      parts.push(cityStateZip);
    }
    return parts.join(', ') || [currentStudio.city, currentStudio.state, currentStudio.zip].filter(Boolean).join(', ') || 'Austin, TX 78701';
  })();

  // 2. DYNAMIC FEE RESOLUTION
  const rawDisplayFee = currentStudio.fee || (currentStudio.paidAmount ? `$${currentStudio.paidAmount}` : (currentStudio.membershipFee ? `$${currentStudio.membershipFee}` : fallbackFee));
  const dynamicFee = String(rawDisplayFee).startsWith('$') ? String(rawDisplayFee) : `$${rawDisplayFee}`;

  // 3. DYNAMIC APPROVAL RESOLUTION
  const approvalStatus = currentStudio.approval || currentStudio.status || currentStudio.reviewStatus || 'Approved';
  const isApproved = approvalStatus === 'Approved';
  const approvalBadgeClass = isApproved
    ? 'bg-[#E6F4EA] text-[#137333] border-emerald-200/80'
    : (approvalStatus === 'In review'
      ? 'bg-amber-50 text-amber-700 border-amber-200/80'
      : 'bg-rose-50 text-rose-700 border-rose-200/80');

  // 4. DYNAMIC MEMBERSHIP RESOLUTION
  const isPaid = Boolean(
    currentStudio.membership === 'Paid' ||
    currentStudio.membershipPaid === true ||
    currentStudio.paymentStatus === 'paid' ||
    (isApproved && currentStudio.membership !== 'Payment required')
  );
  const membershipStatus = isPaid ? 'Paid' : (currentStudio.membership || 'Payment required');
  const membershipBadgeClass = isPaid
    ? 'bg-[#E6F4EA] text-[#137333] border-emerald-200/80'
    : 'bg-amber-50 text-amber-700 border-amber-200/80';

  // 5. DYNAMIC PUBLIC LISTING
  const rawListing = currentStudio.listing;
  const listingText = (rawListing === 'Listing live' || rawListing === 'Live' || (!rawListing && isApproved))
    ? 'Live'
    : (rawListing === 'Listing not live' || rawListing === 'Hidden' || rawListing === 'Not live')
      ? 'Not live'
      : (isApproved ? 'Live' : 'Not live');
  const isListingLive = listingText === 'Live';

  // 6. DYNAMIC BILLING EMAIL
  const billingEmail = currentStudio.billingEmail || currentStudio.email || currentStudio.contactEmail || 'No email recorded';

  // 7. DYNAMIC PAYMENT & RECEIPT DETAILS
  const receiptId = currentStudio.paymentId || (currentStudio.id ? `MEM-${String(currentStudio.id).replace(/\W+/g, '')}` : 'SP-1000');
  const receiptAmount = currentStudio.paymentAmount || (currentStudio.paidAmount ? `$${currentStudio.paidAmount}` : dynamicFee);
  
  const formatReceiptDate = (dateVal) => {
    let baseStr = '';
    if (!dateVal) {
      const d = new Date();
      baseStr = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        baseStr = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        baseStr = String(dateVal);
      }
    }
    if (!baseStr.includes('·')) {
      baseStr = `${baseStr} · ${isPaid ? 'Paid' : 'Pending'}`;
    }
    return baseStr;
  };

  const receiptDate = currentStudio.paymentDate
    ? (currentStudio.paymentDate.includes('·') ? currentStudio.paymentDate : `${currentStudio.paymentDate} · ${isPaid ? 'Paid' : 'Pending'}`)
    : formatReceiptDate(currentStudio.paidAt);

  const handleDownloadReceipt = () => {
    downloadReceipt({
      title: 'Studio Membership Receipt',
      receiptNumber: receiptId,
      status: membershipStatus,
      amount: receiptAmount,
      rows: [
        ['Studio', currentStudio.name || 'Studio Partner'],
        ['Location', locationText],
        ['Billing email', billingEmail],
        ['Plan', 'Studio Partner membership'],
        ['Monthly fee', dynamicFee],
        ['Payment date', receiptDate]
      ],
      note: 'Issued by Alteration Connect for the studio membership fee.'
    });
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
              {locationText}
            </p>
          </div>

          {/* Details Rows matching Image 23 / Figma */}
          <div className="space-y-3.5 text-xs">
            {/* Membership */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Membership</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${membershipBadgeClass}`}>
                {membershipStatus}
              </span>
            </div>

            {/* Monthly Fee */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Monthly fee</span>
              <span className="font-bold text-slate-900">{dynamicFee}</span>
            </div>

            {/* Studio approval */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Studio approval</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${approvalBadgeClass}`}>
                {approvalStatus}
              </span>
            </div>

            {/* Public listing */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Public listing</span>
              <span className={`font-semibold ${isListingLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {listingText}
              </span>
            </div>

            {/* Billing email */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Billing email</span>
              <span className="font-medium text-slate-800 break-all">{billingEmail}</span>
            </div>
          </div>

          {/* Payments Recorded in This Preview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Payments recorded in this preview
            </h4>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block font-mono">
                  {receiptId}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {receiptDate}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-xs text-slate-900">
                  {receiptAmount}
                </span>

                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button matching Image 23 / Figma */}
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
