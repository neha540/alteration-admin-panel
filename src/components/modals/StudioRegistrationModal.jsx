import React, { useState, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { studioService } from '../../services/studioService';
import { paymentService } from '../../services/paymentService';
import { geocodeAddress } from '../../utils/locationHelper';
import ImageCropZoomModal from '../common/ImageCropZoomModal';
import CountryPhoneInput from '../common/CountryPhoneInput';
import {
  ArrowLeft,
  X,
  Briefcase,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2,
  Crop,
  Mail,
  Building2
} from 'lucide-react';

const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51Uekc1PB1fgpDTdlhPwLusMeXhshLVIrWln9BZx0jYEQKtl2ia8x5b0K4eQPPFkxjKEUiPm7INslO4UMvhoKZ3Gm00JIY0lYEN';

const getStripePromise = () => {
  if (typeof window !== 'undefined' && window.Stripe) {
    return Promise.resolve(window.Stripe(publishableKey));
  }
  return publishableKey ? loadStripe(publishableKey) : null;
};
const stripePromise = getStripePromise();

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1e293b',
      fontFamily: "'Helvetica', Arial, sans-serif",
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#94a3b8'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  },
  hidePostalCode: true
};

/**
 * Stripe Payment Step Component
 */
function StudioStripePaymentStep({
  formData,
  fee,
  spacing = '5',
  setStep,
  handleExecuteRegistration,
  isSubmitting,
  setIsSubmitting
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardName, setCardName] = useState(formData.ownerName || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestCardTip, setShowTestCardTip] = useState(false);

  const handleStripePay = async () => {
    setErrorMessage('');

    if (!stripe || !elements) {
      setErrorMessage('Payment system is loading, please wait...');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Card payment form not ready. Please refresh.');
      return;
    }

    setIsSubmitting(true);

    try {
      const numericFee = parseFloat(String(fee || '300').replace(/[^0-9.]/g, '')) || 300;

      // Create PaymentIntent via backend
      const intentRes = await paymentService.createPaymentIntent({
        amount: numericFee,
        customerEmail: formData.email,
        customerName: cardName || formData.ownerName || formData.studioName,
        orderId: 'membership_' + Date.now()
      });

      if (!intentRes?.clientSecret) {
        throw new Error('Unable to initialize payment with Stripe.');
      }

      // Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(intentRes.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName || formData.ownerName || 'Studio Owner',
            email: formData.email || undefined
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment was declined.');
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        await handleExecuteRegistration(true, result.paymentIntent.id);
      } else {
        throw new Error(`Unexpected payment status: ${result.paymentIntent?.status}`);
      }
    } catch (err) {
      console.error('Stripe studio payment error:', err);
      setErrorMessage(err.message || 'Payment failed. Please check your card information.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden font-['HelveticaCustom','Helvetica',Arial,sans-serif]">
      <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
        {/* Plan Pricing Summary Card */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                Studio Membership
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1">
                {formData.studioName || 'Your Alteration Studio'}
              </h3>
              <p className="text-xs text-slate-600">
                {formData.streetAddress
                  ? `${formData.streetAddress}, ZIP ${formData.zipCode}`
                  : 'Protected territory network listing'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${fee}</span>
              <span className="text-[11px] text-slate-500 block font-normal">/ month flat</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200/60 text-xs text-slate-700 space-y-1.5 font-normal">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dedicated neighborhood studio profile</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{spacing}-mile protected territory radius spacing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero commissions — keep 100% of order totals</span>
            </div>
          </div>
        </div>

        {/* Stripe Payment Card Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Pay with card</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Stripe 256-bit SSL</span>
            </div>
          </div>

          <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Cardholder name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                placeholder="e.g. Maria Gonzalez"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Card details
              </label>
              <div className="border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-lg p-3 bg-white transition shadow-2xs">
                <CardElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={(e) => {
                    if (e.error) {
                      setErrorMessage(e.error.message);
                    } else {
                      setErrorMessage('');
                    }
                  }}
                />
              </div>
            </div>

            {/* Test Card Quick Helper */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Stripe Test Mode
                </span>
                <button
                  type="button"
                  onClick={() => setShowTestCardTip(!showTestCardTip)}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  {showTestCardTip ? 'Hide test card' : 'View test card details'}
                </button>
              </div>
              {showTestCardTip && (
                <div className="pt-1.5 border-t border-slate-200/60 font-mono text-[10.5px] text-slate-600 space-y-0.5">
                  <p>
                    Card:{' '}
                    <strong className="text-slate-900 select-all">4242 4242 4242 4242</strong>
                  </p>
                  <p>
                    Expiry: <span className="text-slate-800">Any future date (e.g. 12/28)</span> · CVC:{' '}
                    <span className="text-slate-800">123</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-tight">{errorMessage}</p>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              If you pay now, your application is submitted with <strong>Paid (${fee})</strong>{' '}
              membership. If you prefer to pay later, you can select <strong>Pay later</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Pinned Sticky Footer */}
      <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setStep('details')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer self-start sm:self-center inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to details</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleExecuteRegistration(false)}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Skip payment (Pay later)'}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleStripePay}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 disabled:bg-emerald-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ${fee} & Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Studio Registration Modal Component
 */
export default function StudioRegistrationModal({
  isOpen,
  onClose,
  membershipFee = '300',
  studioSpacing = '5'
}) {
  const fileInputRef = useRef(null);

  const initialFormState = {
    studioName: '',
    ownerName: '',
    email: '',
    countryCode: '+1',
    countryIso: 'us',
    phone: '',
    streetAddress: '',
    zipCode: '',
    primarySpecialty: 'Everyday',
    about: '',
    image: '',
    latitude: null,
    longitude: null,
    agreed: false
  };

  const [fee, setFee] = useState(membershipFee || '300');
  const [spacing, setSpacing] = useState(studioSpacing || '5');
  const [step, setStep] = useState('details'); // 'details' | 'payment'
  const [formData, setFormData] = useState(initialFormState);
  const [imageError, setImageError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [submittedStudio, setSubmittedStudio] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crop / Zoom Modal state
  const [rawImageForCrop, setRawImageForCrop] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Auto-geocode address dynamically via Photon API when user fills address / zip
  const lookupCoordinates = async (address, zip) => {
    const fullQuery = [address, zip, 'India'].filter(Boolean).join(', ').trim();
    if (fullQuery.length < 3) return;
    try {
      const geo = await geocodeAddress(fullQuery) || await geocodeAddress([address, zip].filter(Boolean).join(', '));
      if (geo && geo.lat && geo.lng) {
        setFormData((prev) => ({
          ...prev,
          latitude: geo.lat,
          longitude: geo.lng
        }));
      }
    } catch {
      // silent fallback
    }
  };

  const resolveCityState = (address, zip) => {
    const text = [address, zip].filter(Boolean).join(' ').toLowerCase();

    const CITY_STATE_MAP = {
      'raigarh': { city: 'Raigarh', state: 'Chhattisgarh' },
      'raipur': { city: 'Raipur', state: 'Chhattisgarh' },
      'bilaspur': { city: 'Bilaspur', state: 'Chhattisgarh' },
      'bhilai': { city: 'Bhilai', state: 'Chhattisgarh' },
      'durg': { city: 'Durg', state: 'Chhattisgarh' },
      'korba': { city: 'Korba', state: 'Chhattisgarh' },
      'noida': { city: 'Noida', state: 'Uttar Pradesh' },
      'greater noida': { city: 'Greater Noida', state: 'Uttar Pradesh' },
      'delhi': { city: 'Delhi', state: 'Delhi' },
      'gurgaon': { city: 'Gurgaon', state: 'Haryana' },
      'gurugram': { city: 'Gurugram', state: 'Haryana' },
      'faridabad': { city: 'Faridabad', state: 'Haryana' },
      'ghaziabad': { city: 'Ghaziabad', state: 'Haryana' },
      'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
      'pune': { city: 'Pune', state: 'Maharashtra' },
      'bengaluru': { city: 'Bengaluru', state: 'Karnataka' },
      'bangalore': { city: 'Bengaluru', state: 'Karnataka' },
      'hyderabad': { city: 'Hyderabad', state: 'Telangana' },
      'chennai': { city: 'Chennai', state: 'Tamil Nadu' },
      'kolkata': { city: 'Kolkata', state: 'West Bengal' },
      'austin': { city: 'Austin', state: 'TX' }
    };

    for (const [key, mapping] of Object.entries(CITY_STATE_MAP)) {
      if (text.includes(key)) {
        return mapping;
      }
    }

    const digits = String(zip || '').replace(/\D/g, '');
    if (digits.startsWith('49')) return { city: 'Raigarh', state: 'Chhattisgarh' };
    if (digits.startsWith('201')) return { city: 'Noida', state: 'Uttar Pradesh' };
    if (digits.startsWith('110') || digits.startsWith('11')) return { city: 'Delhi', state: 'Delhi' };
    if (digits.startsWith('121') || digits.startsWith('122')) return { city: 'Gurgaon', state: 'Haryana' };
    if (digits.startsWith('400')) return { city: 'Mumbai', state: 'Maharashtra' };
    if (digits.startsWith('560')) return { city: 'Bengaluru', state: 'Karnataka' };

    const parts = (address || '').split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return { city: parts[parts.length - 1], state: '' };
    }
    return { city: address || 'Current Location', state: '' };
  };

  // Reset form whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setImageError('');
      setSubmittedStudio(null);
      setIsSubmitting(false);
      setStep('details');
      setRawImageForCrop('');
      setIsCropModalOpen(false);
      if (membershipFee) {
        setFee(String(membershipFee));
      }
      if (studioSpacing) {
        setSpacing(String(studioSpacing));
      }
      studioService.getSettings().then((s) => {
        if (s?.membershipFee) setFee(String(s.membershipFee));
        if (s?.studioSpacing) setSpacing(String(s.studioSpacing));
      });
    }
  }, [isOpen, membershipFee, studioSpacing]);

  if (!isOpen) return null;

  // Image file handling & open Crop/Zoom modal
  const handleImageFile = (file) => {
    if (!file) return;
    setImageError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageForCrop(e.target.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Proceed to payment step
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.agreed) return;

    // Validate required studio storefront image
    if (!formData.image || !formData.image.trim()) {
      setImageError('Studio image is required. Please upload a storefront or workshop photo.');
      return;
    }
    setImageError('');
    setStep('payment');
  };

  // Final Registration Execution
  const handleExecuteRegistration = async (isPaid = false, stripePaymentIntentId = null) => {
    setIsSubmitting(true);
    try {
      const { city: resolvedCity, state: resolvedState } = resolveCityState(formData.streetAddress, formData.zipCode);
      const rawPhone = (formData.phone || '').trim();
      const code = formData.countryCode || '+1';
      const formattedPhone = rawPhone
        ? (rawPhone.startsWith('+') ? rawPhone : `${code} ${rawPhone}`)
        : '';

      await studioService.registerStudio({
        name: formData.studioName.trim(),
        owner: formData.ownerName.trim() || 'Owner',
        email: formData.email.trim(),
        phone: formattedPhone,
        address: formData.streetAddress.trim(),
        zip: formData.zipCode.trim(),
        city: resolvedCity,
        state: resolvedState,
        specialties: [formData.primarySpecialty || 'Everyday'],
        services: [],
        startingPrice: '$25',
        turnaround: '2–3 business days',
        hours: 'Mon–Sat 9:30 AM – 7:30 PM',
        image: formData.image,
        bio: formData.about.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        membershipPaid: isPaid,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        membership: isPaid ? 'Paid' : 'Payment required',
        paidAmount: isPaid ? String(fee) : '0',
        stripePaymentIntentId: stripePaymentIntentId || null
      });

      window.dispatchEvent(new Event('studios_updated'));
      window.dispatchEvent(new Event('admin_studios_updated'));
      setSubmittedStudio({
        name: formData.studioName.trim(),
        owner: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formattedPhone,
        address: formData.streetAddress.trim(),
        zip: formData.zipCode.trim(),
        isPaid,
        fee
      });
      setStep('details');
    } catch (err) {
      console.warn('Studio registration error:', err.message);
      alert(err.message || 'Failed to submit application. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        style={{ fontFamily: "'Helvetica', 'HelveticaCustom', Arial, sans-serif" }}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <div
          className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar matching user's image */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight text-center px-2 truncate">
              Bring your craft to the neighborhood
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* =========================================================================
              SCREEN 1: SUBMITTED SUCCESS / CONFIRMATION SCREEN (PROFESSIONAL MESSAGE)
             ========================================================================= */}
          {submittedStudio ? (
            <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto max-h-[82vh]">
              {/* Success Badge & Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block ${
                    submittedStudio.isPaid
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  {submittedStudio.isPaid
                    ? `Membership Paid ($${submittedStudio.fee || fee}) · Sent to Admin for Review`
                    : 'Application Submitted · Sent to Admin for Review'}
                </span>

                <h3 className="font-bold text-xl sm:text-2xl text-slate-900 mt-3 tracking-tight">
                  Studio Request Sent for Review!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you, <strong className="text-slate-900">{submittedStudio.name}</strong>! Your
                  studio listing application has been successfully submitted to the{' '}
                  <strong>Alterations Connect</strong> administrative team.
                </p>
              </div>

              {/* Professional Notice Cards */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 max-w-md mx-auto text-xs">
                {/* 1. Admin Review & Email Notification */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">
                      Admin Verification & Confirmation Email
                    </h4>
                    <p className="text-slate-600 text-[11.5px] leading-relaxed">
                      Hamari admin team aapke storefront photo, craftsmanship details aur {spacing}-mile
                      exclusive territory ko verify karegi. Request <strong>accept hote hi</strong>,
                      aapko direct confirmation email prapt hoga:
                    </p>
                    <div className="font-mono font-semibold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] inline-block mt-0.5">
                      {submittedStudio.email}
                    </div>
                  </div>
                </div>

                {/* 2. Studio Panel Login Credentials */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-200/70">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">
                      Live Website Listing & Studio Panel Access
                    </h4>
                    <p className="text-slate-600 text-[11.5px] leading-relaxed">
                      Admin se approve hone ke baad aapka studio <strong>turant live website</strong>{' '}
                      par public directory me show hoga. Email me aapko <strong>Studio Panel</strong>{' '}
                      ka login ID aur password milega, jahan se aap baaki saare services, custom
                      rates aur portfolio pictures manage kar sakenge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
                >
                  Understood, Return to Home
                </button>
              </div>
            </div>
          ) : step === 'payment' ? (
            /* =========================================================================
                SCREEN 2: STRIPE MEMBERSHIP PAYMENT STEP
               ========================================================================= */
            <Elements stripe={stripePromise}>
              <StudioStripePaymentStep
                formData={formData}
                fee={fee}
                spacing={spacing}
                setStep={setStep}
                handleExecuteRegistration={handleExecuteRegistration}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            </Elements>
          ) : (
            /* =========================================================================
                SCREEN 3: MAIN REGISTRATION DETAILS FORM (MATCHING USER IMAGE + PHOTO)
               ========================================================================= */
            <form
              onSubmit={handleProceedToPayment}
              autoComplete="off"
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* 1. Membership Pricing Banner matching user image */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 text-xs text-[#1E3A8A] flex items-start gap-2.5 leading-relaxed">
                  <Briefcase className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">${fee}/month</span> for your studio
                    listing, quotes, chat, and order management. Your listing goes live after
                    approval, a clear territory, and an active membership.
                  </div>
                </div>

                {/* 2. Input Grid Row 1: Studio name | Owner / primary contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Studio name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studioName}
                      onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                      placeholder=""
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Owner / primary contact
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.\-']/g, '');
                        setFormData({ ...formData, ownerName: val });
                      }}
                      placeholder=""
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white"
                    />
                  </div>
                </div>

                {/* 3. Input Grid Row 2: Business email | Business phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder=""
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business phone
                    </label>
                    <CountryPhoneInput
                      phone={formData.phone}
                      countryCode={formData.countryCode}
                      countryIso={formData.countryIso}
                      required
                      onChange={({ phone, countryCode, countryIso }) => {
                        setFormData((prev) => ({
                          ...prev,
                          phone,
                          countryCode,
                          countryIso
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* 4. Input Grid Row 3: Street address | ZIP code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Street address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => {
                        setFormData({ ...formData, streetAddress: e.target.value });
                        lookupCoordinates(e.target.value, formData.zipCode);
                      }}
                      placeholder="e.g. 245 Lafayette St, SoHo, NY"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, zipCode: val });
                        lookupCoordinates(formData.streetAddress, val);
                      }}
                      placeholder="e.g. 10012 or 90210"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white"
                    />
                  </div>
                </div>

                {/* 5. Blue Territory Hint Box matching user image */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 text-xs text-[#1E3A8A] flex items-start gap-2.5 leading-relaxed">
                  <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    Choose a ZIP to check the sample territory. Try 78664 (Round Rock) for an
                    available area or 78704 for a territory conflict.
                  </div>
                </div>

                {/* 6. STUDIO IMAGE UPLOAD (WITH DRAG & DROP, EDIT, ZOOM IN/OUT) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Studio storefront photo <span className="text-rose-500 font-bold">*</span>
                    </label>
                    {formData.image && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    )}
                  </div>

                  {formData.image ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-900 group shadow-xs">
                      <img
                        src={formData.image}
                        alt="Studio preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRawImageForCrop(formData.image);
                            setIsCropModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit & Zoom</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: '' });
                            setImageError('Studio image is required.');
                          }}
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed ${
                        isDraggingOver
                          ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                          : imageError
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20'
                      } rounded-xl p-4 sm:p-5 text-center cursor-pointer transition flex flex-col items-center justify-center group`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${
                          imageError
                            ? 'bg-rose-100 text-rose-600'
                            : isDraggingOver
                            ? 'bg-blue-200 text-blue-700'
                            : 'bg-blue-50 group-hover:bg-blue-100 text-blue-600'
                        } flex items-center justify-center transition mb-2`}
                      >
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {isDraggingOver
                          ? 'Drop your photo here'
                          : 'Click to upload photo or drag & drop'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        JPG, PNG, WEBP (storefront, tailoring station) · Includes zoom & crop
                      </p>
                    </div>
                  )}

                  {imageError && !formData.image && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* 7. Primary specialty dropdown matching user image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary specialty
                  </label>
                  <select
                    value={formData.primarySpecialty}
                    onChange={(e) => setFormData({ ...formData, primarySpecialty: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition bg-white cursor-pointer"
                  >
                    <option value="Everyday">Everyday</option>
                    <option value="Suits">Suits</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Designer">Designer</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Leather">Leather</option>
                  </select>
                </div>

                {/* 8. Tell customers about your studio textarea matching user image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tell customers about your studio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Your craft, experience, and the garments you specialize in."
                    className="w-full border border-slate-200 rounded-lg p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition resize-none"
                  />
                </div>

                {/* 9. Agreement Checkbox matching user image */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="modal-terms-checkbox"
                    required
                    checked={formData.agreed}
                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor="modal-terms-checkbox"
                    className="text-xs text-slate-600 leading-tight cursor-pointer"
                  >
                    My business operates in the United States. I understand the {spacing}-mile minimum
                    spacing and the ${fee}/month membership.
                  </label>
                </div>
              </div>

              {/* 10. Sticky Footer Buttons matching user image */}
              <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-white text-slate-700 font-medium text-xs sm:text-sm rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!formData.agreed || isSubmitting}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-medium text-xs sm:text-sm rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Submit studio application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Crop / Zoom / Pan Modal */}
      <ImageCropZoomModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setIsCropModalOpen(false)}
        onSave={(croppedDataUrl) => {
          setFormData((prev) => ({ ...prev, image: croppedDataUrl }));
          setImageError('');
        }}
        aspectRatio={16 / 9}
      />
    </>
  );
}
