import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  DollarSign, 
  Tag, 
  Star, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Building2, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass,
  Sparkles,
  FileText
} from 'lucide-react';

export default function StudioProfilePreviewModal({ 
  isOpen = true, 
  studio, 
  onClose,
  onApprove,
  onDecline
}) {
  if (!isOpen || !studio) return null;

  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Safe dynamic data extraction
  const name = studio.name || studio.studioName || 'Alteration Studio';
  const headline = studio.headline || studio.tagline || (studio.status === 'In review' ? 'A new studio applying to join the network.' : 'Thoughtful tailoring. A beautiful fit.');
  const image = studio.image || studio.coverImage || studio.storefrontImage || '';
  const owner = studio.owner || studio.ownerName || '';
  const email = studio.email || '';
  const phone = studio.phone || '';
  const streetAddress = studio.address || studio.streetAddress || '';
  const city = studio.city || '';
  const state = (studio.state && studio.state !== 'TX') ? studio.state : '';
  const zip = studio.zip || studio.zipCode || studio.postalCode || '';

  const bannerLocation = useMemo(() => {
    const parts = [];
    const addr = streetAddress.trim();
    const c = city.trim();
    const st = state.trim();
    const z = zip.trim();

    if (addr) {
      parts.push(addr);
      if (c && !addr.toLowerCase().includes(c.toLowerCase())) {
        parts.push(c);
      }
    } else if (c) {
      parts.push(c);
    }

    if (st && !addr.toLowerCase().includes(st.toLowerCase())) {
      parts.push(st);
    }

    let result = parts.join(', ');
    if (!result) result = 'Local Studio';
    if (z) {
      result += ` · ${z}`;
    }
    return result;
  }, [streetAddress, city, state, zip]);

  const hours = studio.hours || studio.operatingHours || '';
  const turnaround = studio.turnaround || studio.turnaroundTime || '';
  // Services menu
  const servicesList = Array.isArray(studio.services) && studio.services.length > 0 
    ? studio.services.filter(s => s && (s.name || s.service))
    : [];

  const rawStarting = studio.startingPrice && String(studio.startingPrice).trim() !== '$25' && String(studio.startingPrice).trim() !== '25'
    ? studio.startingPrice
    : (servicesList.length > 0 ? studio.startingPrice : '');

  const startingPrice = rawStarting 
    ? (String(rawStarting).trim().startsWith('$') ? String(rawStarting).trim() : `$${String(rawStarting).trim()}`)
    : '';

  const about = studio.about || studio.bio || studio.description || '';
  
  // Specialties list
  const specialtiesList = Array.isArray(studio.specialties) 
    ? studio.specialties 
    : (studio.specialties 
        ? String(studio.specialties).split(',').map(s => s.trim()).filter(Boolean) 
        : (studio.primarySpecialty ? [studio.primarySpecialty] : []));

  // Ratings - only show if real reviews exist
  const hasReviews = Boolean(studio.rating && Number(studio.reviewsCount || studio.reviewCount || 0) > 0);
  const rating = hasReviews ? String(studio.rating) : null;
  const reviewsCount = hasReviews ? Number(studio.reviewsCount || studio.reviewCount) : 0;

  // Status flags
  const status = studio.status || studio.reviewStatus || 'In review';
  const isApproved = status === 'Approved';
  const isDeclined = status === 'Declined';
  const isSuspended = status === 'Suspended';
  const isPending = status === 'In review' || status === 'Pending';

  const isPaid = Boolean(studio.membershipPaid === true || studio.paymentStatus === 'paid' || studio.membership === 'Paid' || studio.waiverGranted);
  const paidAmount = studio.paidAmount || studio.membershipFee || studio.fee || '200';
  const studioId = studio.id || studio._id || '';
  const lat = studio.latitude !== undefined && studio.latitude !== null ? studio.latitude : null;
  const lng = studio.longitude !== undefined && studio.longitude !== null ? studio.longitude : null;

  const initials = studio.initials || (name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-['Inter',Arial,sans-serif]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Studio profile preview
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Directory View
                </span>
              </div>
              <p className="text-xs text-slate-400">
                This is how this studio profile appears to customers and directory visitors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isApproved ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live Studio</span>
              </span>
            ) : isDeclined ? (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Declined
              </span>
            ) : isSuspended ? (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Suspended
              </span>
            ) : (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Pending Review
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-50/40">

          {/* 1. Hero Cover Banner */}
          <div className="relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[260px] p-6 sm:p-8 flex flex-col justify-end text-white select-none shadow-sm bg-[#1E293B]">
            {image ? (
              <>
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/30" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E3A8A]">
                {/* Subtle initials watermark */}
                <span className="absolute right-6 -bottom-6 sm:right-10 sm:-bottom-8 text-white/10 font-bold text-[130px] sm:text-[180px] leading-none select-none pointer-events-none font-mono">
                  {initials}
                </span>
              </div>
            )}

            {/* Top Right Badges */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-xs text-white/90 text-[11px] font-medium tracking-wide border border-white/10">
                {image ? 'Storefront photo verified' : 'Partner Studio'}
              </span>
              {isPaid ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/90 backdrop-blur-xs text-white text-[11px] font-semibold border border-emerald-400/30">
                  Paid Partner
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/90 backdrop-blur-xs text-white text-[11px] font-semibold border border-amber-400/30">
                  Payment Required
                </span>
              )}
            </div>

            {/* Banner Content Details */}
            <div className="relative z-10 space-y-2 max-w-2xl">
              {specialtiesList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {specialtiesList.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-xs">
                {name}
              </h1>

              {headline && (
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed drop-shadow-xs">
                  {headline}
                </p>
              )}

              {(city || state || streetAddress) && (
                <p className="text-xs text-white/80 flex items-center gap-1.5 pt-1 font-normal">
                  <MapPin className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>
                    {bannerLocation}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* 2. Key Highlights Strip (Turnaround, Starting price, Rating, Hours) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Turnaround */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-500">Turnaround</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {turnaround || '2–3 business days'}
              </p>
            </div>

            {/* Starting Price */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium text-slate-500">Starting price</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {startingPrice || 'Quotes on request'}
              </p>
            </div>

            {/* Rating */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Star className={`w-3.5 h-3.5 ${hasReviews ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                <span className="font-medium text-slate-500">Reviews</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {hasReviews ? `${rating} (${reviewsCount})` : 'New studio · No reviews'}
              </p>
            </div>

            {/* Membership */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium text-slate-500">Membership</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {isPaid ? `Paid ($${paidAmount}/mo)` : 'Pay later'}
              </p>
            </div>
          </div>

          {/* 3. Main Split: Left Column (About & Services) & Right Column (Contact & Meta) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (8 cols): Bio & Services */}
            <div className="lg:col-span-7 space-y-6">

              {/* About The Studio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    About the studio
                  </h3>
                </div>
                
                {about ? (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                    {about}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No custom biography provided yet.
                  </p>
                )}

                {/* Specialties tags */}
                {specialtiesList.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Tailoring specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {specialtiesList.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Services & Itemized Pricing (if any) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Services &amp; Pricing
                    </h3>
                  </div>
                  {servicesList.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {servicesList.length} services listed
                    </span>
                  )}
                </div>

                {servicesList.length > 0 ? (
                  <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                    {servicesList.map((svc, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 font-mono w-5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">
                              {svc.name || svc.service}
                            </p>
                            {svc.category && (
                              <p className="text-[11px] text-slate-400">
                                {svc.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          {svc.price ? (String(svc.price).trim().startsWith('$') ? svc.price : `$${svc.price}`) : 'Quote on request'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                    <p className="font-medium text-slate-700">No itemized price list added yet</p>
                    <p className="text-slate-400 mt-0.5">
                      Studio provides custom quotations per customer order.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (5 cols): Contact & Verification Details */}
            <div className="lg:col-span-5 space-y-6">

              {/* Contact & Location Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Contact &amp; Location
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Owner */}
                  {owner && (
                    <div className="flex justify-between items-center gap-3 pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 font-normal flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Owner</span>
                      </span>
                      <span className="font-semibold text-slate-900 text-right">{owner}</span>
                    </div>
                  )}

                  {/* Email */}
                  {email && (
                    <div className="flex justify-between items-center gap-3 pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 font-normal flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a 
                          href={`mailto:${email}`} 
                          className="font-medium text-blue-600 hover:underline select-all"
                        >
                          {email}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(email, 'email')}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Copy email"
                        >
                          {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {phone && (
                    <div className="flex justify-between items-center gap-3 pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 font-normal flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Phone</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a 
                          href={`tel:${phone}`} 
                          className="font-medium text-slate-800 hover:text-blue-600"
                        >
                          {phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(phone, 'phone')}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Copy phone"
                        >
                          {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {(streetAddress || city || state || zip) && (
                    <div className="flex justify-between items-start gap-3 pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 font-normal shrink-0 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Address</span>
                      </span>
                      <div className="text-right">
                        {streetAddress && <p className="font-semibold text-slate-900">{streetAddress}</p>}
                        <p className="text-slate-600">
                          {[city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {hours && (
                    <div className="flex justify-between items-center gap-3 pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 font-normal flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hours</span>
                      </span>
                      <span className="font-medium text-slate-800 text-right">{hours}</span>
                    </div>
                  )}

                  {/* Coordinates (if geocoded) */}
                  {lat && lng && (
                    <div className="flex justify-between items-center gap-3 pb-1">
                      <span className="text-slate-400 font-normal flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Geo coordinates</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 text-right">
                        {Number(lat).toFixed(4)}°, {Number(lng).toFixed(4)}°
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Meta Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Platform Details
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {studioId && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Studio ID</span>
                      <span className="font-mono text-slate-900 select-all font-semibold">{studioId}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Listing status</span>
                    <span className={`font-semibold ${isApproved ? 'text-emerald-700' : isDeclined ? 'text-rose-700' : 'text-amber-700'}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Membership status</span>
                    <span className={`font-semibold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isPaid ? `Active ($${paidAmount}/mo)` : 'Payment pending'}
                    </span>
                  </div>

                  {studio.waiverGranted && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Pilot waiver</span>
                      <span className="font-semibold text-emerald-700">
                        {studio.waiverReason || 'Active 90-day waiver'}
                      </span>
                    </div>
                  )}

                  {studio.distance && studio.distance !== '2.5 mi' && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Distance to studio</span>
                      <span className="font-semibold text-slate-900">
                        {studio.distance}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Review</span>
          </button>

          <div className="flex items-center gap-2.5">
            {isPending && onDecline && (
              <button
                type="button"
                onClick={() => {
                  onDecline();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-[#966027] hover:text-rose-700 transition cursor-pointer"
              >
                Decline
              </button>
            )}

            {isPending && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove();
                  onClose();
                }}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Approve &amp; publish</span>
              </button>
            )}

            {!isPending && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
