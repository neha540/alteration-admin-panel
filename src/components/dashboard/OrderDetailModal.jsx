import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Scissors,
  Check,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import OrderRequestDetailsModal from './OrderRequestDetailsModal';
import OrderTimelineModal from './OrderTimelineModal';

export default function OrderDetailModal({
  order,
  onClose,
  onReviewStudio,
  onOpenRequestDetails,
  onOpenTimeline,
  onUpdateStatus,
  onViewCustomer
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

  const [orderStatus, setOrderStatus] = useState(currentOrder.status || 'Quote requested');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setOrderStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(currentOrder.id, newStatus);
      }
    } catch (err) {
      console.warn('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'In progress':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'Quote ready':
      case 'Quote sent':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Ready for pickup':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
  };

  const isStep1Done = true;
  const isStep2Done = ['Quote ready', 'Quote sent', 'In progress', 'Paid', 'Ready for pickup', 'Completed'].includes(orderStatus);
  const isStep2Active = ['Quote ready', 'Quote sent'].includes(orderStatus);
  const isStep3Done = ['Ready for pickup', 'Completed'].includes(orderStatus);
  const isStep3Active = ['In progress', 'Paid'].includes(orderStatus);
  const isStep4Done = orderStatus === 'Completed';
  const isStep4Active = orderStatus === 'Ready for pickup';

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

          {/* Status Badge & Header matching Figma Image 25 */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusColor(orderStatus)}`}>
                <Scissors className="w-3.5 h-3.5 -rotate-45" />
                <span>{orderStatus}</span>
              </span>

              <h3 className="text-2xl font-bold text-slate-900 mt-2.5 leading-tight">
                {currentOrder.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentOrder.studio}
              </p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">
              {currentOrder.amount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {orderStatus === 'Completed' ? 'Completed order' : currentOrder.isPaid ? 'Paid in demo' : 'Quotation pending payment'}
            </span>
          </div>

          {/* Customer Details Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5EFE6] text-[#78593C] font-bold text-xs flex items-center justify-center shrink-0">
                {(currentOrder.customer || currentOrder.customerName || 'Customer')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">
                    {currentOrder.customer || currentOrder.customerName || 'Verified Customer'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                    Customer
                  </span>
                </div>
                <span className="text-[11.5px] text-slate-500 block truncate mt-0.5">
                  {currentOrder.customerEmail || 'No email provided'}
                  {currentOrder.customerPhone ? ` · 📞 ${currentOrder.customerPhone}` : ''}
                </span>
              </div>
            </div>

            {onViewCustomer && (
              <button
                type="button"
                onClick={() => onViewCustomer(currentOrder)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 transition cursor-pointer shadow-2xs"
              >
                View profile
              </button>
            )}
          </div>

          {/* Callout Card matching Image 25 */}
          <div className="p-5 rounded-2xl bg-[#F0F5FA] border border-slate-200/80 space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {orderStatus === 'Quote requested'
                ? 'Quotation request pending studio review.'
                : orderStatus === 'Quote sent' || orderStatus === 'Quote ready'
                  ? 'Itemized quote sent to customer.'
                  : orderStatus === 'Ready for pickup'
                    ? 'Alteration finished and ready for customer pickup.'
                    : orderStatus === 'Completed'
                      ? 'Alteration order completed successfully.'
                      : orderStatus === 'Cancelled'
                        ? 'This order has been cancelled.'
                        : 'Your alteration is in progress.'}
            </h4>
            <p className="text-xs text-slate-500">
              {orderStatus === 'Quote requested'
                ? 'The studio has received the garment details and photo to confirm pricing.'
                : orderStatus === 'Ready for pickup'
                  ? 'Customer notified to visit the studio for fitting & pickup.'
                  : 'Your studio will update you when it is ready.'}
            </p>
            <p className="text-[11.5px] text-slate-400 pt-2 font-medium">
              Target completion: {currentOrder.completionDate || 'Nov 12, 2026'}
            </p>
          </div>

          {/* 4-Step Horizontal Timeline Stepper matching Image 25 */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-6 right-6 top-3 h-[2px] bg-slate-200 z-0" />
              <div
                className="absolute left-6 top-3 h-[2] bg-emerald-500 z-0 transition-all duration-300"
                style={{
                  width: isStep4Done ? '100%' : isStep3Done ? '66%' : isStep2Done ? '33%' : '0%'
                }}
              />

              {/* Step 1: Request */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] text-slate-600 font-medium mt-1.5">Request</span>
              </div>

              {/* Step 2: Quote */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${isStep2Done
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : isStep2Active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                  {isStep2Done ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '2'}
                </div>
                <span className={`text-[11px] mt-1.5 ${isStep2Active ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                  Quote
                </span>
              </div>

              {/* Step 3: Payment / Work */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${isStep3Done
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : isStep3Active
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                  {isStep3Done ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '3'}
                </div>
                <span className={`text-[11px] mt-1.5 ${isStep3Active ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                  Payment
                </span>
              </div>


              {/* Step 4: Pickup */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isStep4Done
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : isStep4Active
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 font-bold'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                  {isStep4Done ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '4'}
                </div>
                <span className={`text-[11px] mt-1.5 ${isStep4Active || isStep4Done ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
                  Pickup
                </span>
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
                <span className="text-[11px] font-normal">View garments &amp; photos</span>
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
                <span className="text-[11px] font-normal">Audit events</span>
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
                if (onReviewStudio) onReviewStudio(currentOrder);
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
