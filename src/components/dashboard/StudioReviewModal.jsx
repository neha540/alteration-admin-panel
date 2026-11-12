import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  CreditCard, 
  AlertCircle, 
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Mail,
  User,
  Scissors,
  Lock
} from 'lucide-react';

export default function StudioReviewModal({ 
  studio, 
  onClose, 
  onApprove, 
  onSuspend,
  onGrantWaiver,
  onSaveDetails
}) {
  if (!studio) return null;

  const isPending = studio.status === 'In review' || studio.reviewStatus === 'In review';
  const isCongressCare = studio.name?.includes('Congress') || studio.initials === 'CC' || studio.hasConflict;
  const isPaid = Boolean(studio.membershipPaid === true || studio.paymentStatus === 'paid' || studio.membership === 'Paid');
  const [membershipActive, setMembershipActive] = useState(isPaid);
  const [studioStatus, setStudioStatus] = useState(isPending ? 'In review' : (studio.status || 'Approved'));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse location
  const streetAddr = studio.address || '';
  const studioCity = studio.city || '';
  const studioState = studio.state || '';
  const studioZip = studio.zip || ((streetAddr && streetAddr.match(/\b\d{5,6}\b/)) ? streetAddr.match(/\b\d{5,6}\b/)[0] : '');

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: studio.name || '',
    owner: studio.owner || '',
    email: studio.email || '',
    phone: studio.phone || '',
    address: streetAddr,
    city: studioCity,
    state: studioState,
    zip: studioZip,
    specialties: Array.isArray(studio.specialties) && studio.specialties.length > 0 
      ? studio.specialties 
      : ['Everyday'],
    startingPrice: studio.startingPrice || '$25',
    turnaround: studio.turnaround || '2–3 days',
    hours: studio.hours || 'Mon–Sat 9:30 AM – 7:30 PM',
    bio: studio.bio || studio.about || 'A neighborhood alteration and tailoring studio.',
    image: studio.image || '',
    status: studio.status || (isPending ? 'In review' : 'Approved'),
    membership: isPaid ? 'Paid' : 'Payment required'
  });

  const availableSpecialties = [
    'Everyday',
    'Suits',
    'Bridal',
    'Designer',
    'Repairs',
    'Leather & Heavy Outerwear'
  ];

  const toggleSpecialty = (spec) => {
    setEditForm(prev => {
      const exists = prev.specialties.includes(spec);
      const next = exists 
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec];
      return { ...prev, specialties: next.length > 0 ? next : ['Everyday'] };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      if (onSaveDetails) {
        await onSaveDetails(studio.id, editForm);
      }
      setStudioStatus(editForm.status);
      setMembershipActive(editForm.membership === 'Paid');
      setIsEditing(false);
    } catch (err) {
      console.warn('Failed to save studio edits:', err);
    } finally {
      setIsSaving(false);
    }
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

  const handleGrantPilotWaiver = () => {
    setMembershipActive(true);
    if (onGrantWaiver) onGrantWaiver(studio.id);
    alert("Pilot waiver granted: Membership requirement fulfilled for 90 days.");
  };

  const currentDetails = {
    name: editForm.name || studio.name || 'Alteration Studio',
    tagline: isPending ? 'A new studio applying to join the network.' : 'Thoughtful tailoring. A beautiful fit.',
    initials: studio.initials || (editForm.name ? editForm.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
    avatarBg: isPending ? 'bg-[#EBF5ED] text-[#2D5A34]' : 'bg-[#F5EFE6] text-[#78593C]',
    owner: editForm.owner || studio.owner || 'Studio Owner',
    email: editForm.email || studio.email || 'studio@example.com',
    phone: editForm.phone || studio.phone || '(512) 555-0199',
    address: editForm.address || studio.address || '',
    city: editForm.city || studio.city || '',
    state: editForm.state || studio.state || '',
    zip: editForm.zip || studio.zip || '',
    specialties: editForm.specialties || (Array.isArray(studio.specialties) ? studio.specialties : ['Everyday']),
    startingPrice: editForm.startingPrice || studio.startingPrice || '$25',
    turnaround: editForm.turnaround || studio.turnaround || '2–3 days',
    hours: editForm.hours || studio.hours || 'Mon–Sat 9:30 AM – 7:30 PM',
    image: editForm.image || studio.image || '',
    about: editForm.bio || studio.bio || studio.about || 'A neighborhood alteration and tailoring studio.',
    hasConflict: isCongressCare || Boolean(studio.hasConflict),
    territoryLabel: (isCongressCare || Boolean(studio.hasConflict)) ? 'Territory conflict' : 'Territory check passed',
    territoryDistance: studio.distance ? `${studio.distance} to nearest studio` : '5.84 miles to Atelier Rose'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Studio Details' : 'Studio Review & Details'}
              </h2>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Manage business profile, territory verification, and status
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer inline-flex items-center gap-1.5 ${
                isEditing 
                  ? 'bg-slate-100 text-slate-700 border-slate-300' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">

          {isEditing ? (
            /* ==================== EDIT FORM MODE ==================== */
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Update any business details submitted during studio registration. Changes will immediately sync to web and customer discovery.</span>
              </div>

              {/* Studio & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Studio Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="Studio name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="Owner name"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="studio@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="+1 (512) 555-0199"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. 1024 Congress Avenue, Suite 300"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Austin"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. TX"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    value={editForm.zip}
                    onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. 78701"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Specialties (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map((spec) => {
                    const isSelected = editForm.specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing, Turnaround, Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Starting Price Guide</label>
                  <input
                    type="text"
                    value={editForm.startingPrice}
                    onChange={(e) => setEditForm({ ...editForm, startingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                    placeholder="$25"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Typical Turnaround</label>
                  <input
                    type="text"
                    value={editForm.turnaround}
                    onChange={(e) => setEditForm({ ...editForm, turnaround: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                    placeholder="2–3 days"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={editForm.hours}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                    placeholder="Mon–Sat 9:30 AM – 7:30 PM"
                  />
                </div>
              </div>

              {/* Status and Membership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Listing / Review Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="In review">In review</option>
                    <option value="Approved">Approved</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Membership Plan</label>
                  <select
                    value={editForm.membership}
                    onChange={(e) => setEditForm({ ...editForm, membership: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Paid">Paid (${studio.paidAmount || studio.membershipFee || 200}/mo)</option>
                    <option value="Payment required">Not Paid (Payment required)</option>
                  </select>
                </div>
              </div>

              {/* Storefront Image */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Storefront / Workshop Photo</label>
                <div className="flex items-center gap-3">
                  {editForm.image ? (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image: '' })}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image file</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={editForm.image.startsWith('data:') ? '' : editForm.image}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                      placeholder="Or enter image URL..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">About the studio / Biography</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Master tailoring craftsmanship, bespoke fittings..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-[#2361E9] hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving changes...' : 'Save studio changes'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* ==================== VIEW / AUDIT MODE ==================== */
            <div className="space-y-6">
              
              {/* Uploaded Storefront Image Banner */}
              {currentDetails.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[16/7] w-full bg-slate-100 shadow-xs relative">
                  <img
                    src={currentDetails.image}
                    alt={currentDetails.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                    Uploaded Studio Storefront Photo
                  </span>
                </div>
              )}

              {/* Studio Profile Top Banner */}
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${currentDetails.avatarBg} font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs overflow-hidden`}>
                  {currentDetails.image ? (
                    <img src={currentDetails.image} alt={currentDetails.name} className="w-full h-full object-cover" />
                  ) : (
                    currentDetails.initials
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      {currentDetails.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentDetails.tagline}
                  </p>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    {studioStatus === 'Approved' ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Approved &amp; Live
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
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Membership Paid (${studio.paidAmount || studio.membershipFee || 200}/mo)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Not Paid (${studio.membershipFee || 200}/mo)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Two-Column Grid: Business Details & Publication Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Left Column: Complete Business Details */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Registration Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Owner</span>
                      <span className="font-semibold text-slate-900">{currentDetails.owner}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                      <span className="font-medium text-slate-800">{currentDetails.email}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
                      <span className="font-medium text-slate-800">{currentDetails.phone}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-blue-100 pb-2 bg-blue-50/70 -mx-4 px-4 py-1.5 rounded-lg">
                      <span className="text-blue-900 font-semibold flex items-center gap-1.5 text-[11px]">
                        <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Portal Login
                      </span>
                      <span className="font-mono font-bold text-blue-700 text-[10.5px]">
                        ID: {currentDetails.email} | Pass: {currentDetails.defaultPassword || 'Studio@123'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</span>
                      <span className="font-medium text-slate-800 text-right leading-tight max-w-[65%]">
                        {currentDetails.address}
                        {(currentDetails.city || currentDetails.zip) && (
                          <span className="text-slate-500 block text-[11px] mt-0.5">
                            {[currentDetails.city, currentDetails.state, currentDetails.zip].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5" /> Specialties</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {Array.isArray(currentDetails.specialties) ? currentDetails.specialties.join(', ') : currentDetails.specialties}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Starting price</span>
                      <span className="font-semibold text-slate-900">{currentDetails.startingPrice}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Turnaround</span>
                      <span className="font-medium text-slate-800">{currentDetails.turnaround}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Business hours</span>
                      <span className="font-medium text-slate-800">{currentDetails.hours}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Publication Requirements */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Publication requirements
                  </h4>

                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 text-xs">
                    {/* 1. Territory Check */}
                    {currentDetails.hasConflict ? (
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 block">Territory conflict</span>
                          <span className="text-[11.5px] text-slate-500 block">{currentDetails.territoryDistance}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">Territory check passed</span>
                          <span className="text-[11.5px] text-slate-500 block">{currentDetails.territoryDistance}</span>
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
                          <span className="text-[11.5px] text-slate-500 block">
                            ${studio.paidAmount || studio.membershipFee || 200} per month · Paid
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        </div>
                        <div>
                          <span className="font-bold text-rose-800 block">Not Paid</span>
                          <span className="text-[11.5px] text-slate-500 block">
                            Membership fee (${studio.membershipFee || 200}/mo) has not been paid yet.
                          </span>
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
                          <span className="text-[11.5px] text-slate-500 block">Identity, storefront, and service parameters verified.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 block">Business review required</span>
                          <span className="text-[11.5px] text-slate-500 block">Confirm identity and storefront details before activating.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* About the studio Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  About the studio / Craftsmanship Bio
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {currentDetails.about}
                </p>
              </div>

              {/* Info Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Approval requires an active paid membership or pilot waiver and a clear 5-mile territory check.</span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Left Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'View details' : 'Edit details'}</span>
            </button>

            {isPending && !isEditing && (
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
            {isEditing ? (
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
              </button>
            ) : !isPending ? (
              <button
                type="button"
                onClick={() => {
                  if (onSuspend) {
                    onSuspend(studio.id);
                  } else {
                    alert(`Studio listing suspended: ${currentDetails.name}`);
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
