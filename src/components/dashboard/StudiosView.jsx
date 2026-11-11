import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Plus, Eye, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
import StudioReviewModal from './StudioReviewModal';

export default function StudiosView() {
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [activeReviewStudio, setActiveReviewStudio] = useState(null);
  const [liveStudios, setLiveStudios] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newStudioForm, setNewStudioForm] = useState({
    studioName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialties: ['Everyday'],
    startingPrice: '$25',
    turnaround: '2–3 days',
    hours: 'Mon–Sat 9:30 AM – 7:30 PM',
    image: '',
    bio: ''
  });

  const availableSpecialties = [
    'Everyday',
    'Suiting & Formalwear',
    'Denim & Casual',
    'Bridal & Delicate',
    'Leather & Outerwear',
    'Repairs & Restorations'
  ];

  const handleToggleSpecialty = (spec) => {
    setNewStudioForm(prev => {
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
        setNewStudioForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchStudios = () => {
    adminDataService.getStudios().then(data => {
      if (data && Array.isArray(data)) {
        setLiveStudios(data);
        window.dispatchEvent(new Event('admin_studios_updated'));
      }
    }).catch((err) => {
      console.warn('Failed to load studios:', err);
    });
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  // Handle Admin registration directly to backend
  const handleAdminRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    if (!newStudioForm.studioName.trim()) {
      setRegisterError('Studio name is required.');
      return;
    }
    if (!newStudioForm.image || !newStudioForm.image.trim()) {
      setRegisterError('Studio storefront or workspace photo is required. Please upload an image or provide an image URL.');
      return;
    }
    setIsRegistering(true);
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const apiBase = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : 'https://alterations-connect-backend.onrender.com/api');
      
      const cityState = [newStudioForm.city.trim(), newStudioForm.state.trim()].filter(Boolean).join(', ');
      const res = await fetch(`${apiBase}/studios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudioForm.studioName.trim(),
          owner: newStudioForm.ownerName.trim() || 'Owner',
          email: newStudioForm.email.trim() || `${newStudioForm.studioName.toLowerCase().replace(/[^a-z0-9]/g, '')}@studio.example`,
          phone: newStudioForm.phone.trim() || '+1 (512) 555-0100',
          address: newStudioForm.address.trim() || cityState || 'Austin, TX',
          city: newStudioForm.city.trim() || 'Austin',
          state: newStudioForm.state.trim() || 'TX',
          zip: newStudioForm.zip.trim() || '78701',
          specialties: newStudioForm.specialties,
          startingPrice: newStudioForm.startingPrice.trim() || '$25',
          turnaround: newStudioForm.turnaround.trim() || '2–3 days',
          hours: newStudioForm.hours.trim() || 'Mon–Sat 9:30 AM – 7:30 PM',
          image: newStudioForm.image.trim(),
          bio: newStudioForm.bio.trim() || ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.message || 'Failed to register studio. Please check details.');
        return;
      }
      setRegisterModalOpen(false);
      setToastMessage(`Studio "${newStudioForm.studioName.trim()}" registered successfully!`);
      setTimeout(() => setToastMessage(''), 5000);
      setNewStudioForm({
        studioName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        specialties: ['Everyday'],
        startingPrice: '$25',
        turnaround: '2–3 days',
        hours: 'Mon–Sat 9:30 AM – 7:30 PM',
        image: '',
        bio: ''
      });
      fetchStudios();
    } catch (err) {
      console.warn('Error registering studio:', err);
      setRegisterError(err.message || 'Failed to register studio.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Map live studios from backend into UI shape
  const currentStudios = (liveStudios || []).map(s => {
    const isApproved = s.status === 'Approved';
    const isSuspended = s.status === 'Suspended' || s.status === 'Declined';
    return {
      id: s.id,
      name: s.name,
      owner: s.owner || 'Owner',
      initials: s.initials || (s.name ? s.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
      avatarBg: s.bgTeal ? 'bg-[#F5EFE6] text-[#78593C]' : 'bg-slate-100 text-slate-700',
      city: s.city || '',
      zip: s.zip || ((s.address && s.address.match(/\b\d{5,6}\b/)) ? s.address.match(/\b\d{5,6}\b/)[0] : (s.city && s.city.match(/\b\d{5,6}\b/) ? s.city.match(/\b\d{5,6}\b/)[0] : '')),
      startingPrice: s.startingPrice,
      turnaround: s.turnaround,
      hours: s.hours,
      image: s.image,
      reviewStatus: s.status || 'In review',
      reviewColor: isApproved 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
        : isSuspended
        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
        : 'bg-amber-50 text-amber-700 border-amber-200/80',
      membership: isApproved ? 'Paid' : 'Payment required',
      membershipColor: isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80',
      listing: isApproved ? 'Live' : 'Hidden',
      listingColor: isApproved ? 'text-emerald-600' : 'text-slate-400',
      action: isApproved ? 'Manage' : 'Review',
      phone: s.phone,
      email: s.email,
      address: s.address,
      bio: s.bio,
      specialties: s.specialties,
      hasConflict: Boolean(s.hasConflict),
      ...s
    };
  });

  // Dynamic badge counts based on live data
  const allCount = currentStudios.length;
  const awaitingCount = currentStudios.filter(s => s.reviewStatus === 'In review').length;
  const approvedCount = currentStudios.filter(s => s.reviewStatus === 'Approved').length;
  const declinedCount = currentStudios.filter(s => s.reviewStatus === 'Declined' || s.reviewStatus === 'Suspended').length;

  // Filter based on active tab and search query
  const filteredStudios = currentStudios.filter((s) => {
    // 1. Tab filter
    if (filterTab === 'awaiting' && s.reviewStatus !== 'In review') return false;
    if (filterTab === 'approved' && s.reviewStatus !== 'Approved') return false;
    if (filterTab === 'declined' && s.reviewStatus !== 'Declined' && s.reviewStatus !== 'Suspended') return false;

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.zip && s.zip.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Studios
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Review applicants and manage listed businesses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRegisterError('');
            setRegisterModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Register a studio</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        
        {/* Card Header & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registered studios
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {allCount} {allCount === 1 ? 'business' : 'businesses'} in the network
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search studio, owner or ZIP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dynamic Filter Tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All studios</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${filterTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
              {allCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('awaiting')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === 'awaiting'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Awaiting review</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${filterTab === 'awaiting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              {awaitingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('approved')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === 'approved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Approved</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${filterTab === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('declined')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === 'declined'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Paused / declined</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${filterTab === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
              {declinedCount}
            </span>
          </button>
        </div>

        {/* Studios Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-6">Studio</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Review status</th>
                <th className="py-3 px-6">Membership</th>
                <th className="py-3 px-6">Listing</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-slate-700 font-semibold text-sm">
                        {allCount === 0 
                          ? 'No studios registered yet' 
                          : `No studios found in "${filterTab === 'all' ? 'All studios' : filterTab === 'awaiting' ? 'Awaiting review' : filterTab === 'approved' ? 'Approved' : 'Paused / declined'}"`}
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {allCount === 0
                          ? 'When a tailor or business submits a registration on the customer site, it will show up here under "Awaiting review" for your approval.'
                          : 'Try selecting another tab or clearing your search query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudios.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition group">
                    {/* Studio Name + Owner */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${s.avatarBg}`}>
                            {s.initials}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {s.owner}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-slate-700">
                      <span className="block font-medium">{s.city}</span>
                      <span className="text-[11px] text-slate-400 block">{s.zip}</span>
                    </td>

                    {/* Review Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${s.reviewColor}`}>
                        {s.reviewStatus}
                      </span>
                    </td>

                    {/* Membership */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${s.membershipColor}`}>
                        {s.membership}
                      </span>
                    </td>

                    {/* Listing */}
                    <td className="py-4 px-6 font-semibold">
                      <span className={s.listingColor}>
                        {s.listing}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReviewStudio(s)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800 transition cursor-pointer text-xs"
                        >
                          {s.action}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReviewStudio(s)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer */}
        <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredStudios.length} of {allCount} studios</span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Approval + membership + territory</span>
          </div>
        </div>

      </div>

      {/* Modal to Register a studio from Admin with full details */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleAdminRegisterSubmit}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Register a new alteration studio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter complete business, owner, location, and service details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {registerError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-medium">
                  {registerError}
                </div>
              )}

              {/* Studio & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Studio name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudioForm.studioName}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, studioName: e.target.value })}
                    placeholder="e.g. Austin Tailor Studio"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Owner full name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudioForm.ownerName}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, ownerName: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={newStudioForm.email}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, email: e.target.value })}
                    placeholder="contact@austinstudio.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={newStudioForm.phone}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, phone: e.target.value })}
                    placeholder="+1 (512) 555-0199"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Street address
                </label>
                <input
                  type="text"
                  value={newStudioForm.address}
                  onChange={(e) => setNewStudioForm({ ...newStudioForm, address: e.target.value })}
                  placeholder="e.g. 1024 Congress Avenue, Suite 300"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.city}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, city: e.target.value })}
                    placeholder="e.g. Austin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.state}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, state: e.target.value })}
                    placeholder="e.g. TX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Postal / ZIP code
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.zip}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, zip: e.target.value })}
                    placeholder="e.g. 78701"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Specialties (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map((spec) => {
                    const isSelected = newStudioForm.specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleToggleSpecialty(spec)}
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
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Starting price
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.startingPrice}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, startingPrice: e.target.value })}
                    placeholder="$25"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Turnaround time
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.turnaround}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, turnaround: e.target.value })}
                    placeholder="2–3 days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Operating hours
                  </label>
                  <input
                    type="text"
                    value={newStudioForm.hours}
                    onChange={(e) => setNewStudioForm({ ...newStudioForm, hours: e.target.value })}
                    placeholder="Mon–Sat 9:30 AM – 7:30 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Studio storefront image <span className="text-rose-500 font-bold">* (Required)</span>
                </label>
                <div className="flex items-center gap-3">
                  {newStudioForm.image ? (
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={newStudioForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewStudioForm({ ...newStudioForm, image: '' })}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className={`w-20 h-14 rounded-lg bg-slate-50 border border-dashed ${registerError && !newStudioForm.image ? 'border-rose-400 bg-rose-50/40 text-rose-500' : 'border-slate-300 text-slate-400'} flex items-center justify-center shrink-0`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image file</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          setRegisterError('');
                          handleImageUpload(e);
                        }} 
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="text"
                      value={newStudioForm.image.startsWith('data:') ? '' : newStudioForm.image}
                      onChange={(e) => {
                        setRegisterError('');
                        setNewStudioForm({ ...newStudioForm, image: e.target.value });
                      }}
                      placeholder="Or enter image URL..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  About the studio / biography
                </label>
                <textarea
                  rows={3}
                  value={newStudioForm.bio}
                  onChange={(e) => setNewStudioForm({ ...newStudioForm, bio: e.target.value })}
                  placeholder="Tell clients about your master tailoring craftsmanship, bespoke fittings, and alteration guarantees..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering}
                className="px-5 py-2 text-xs font-semibold bg-[#2361E9] hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isRegistering ? 'Registering...' : 'Register studio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Studio Review Modal connected to backend APIs */}
      {activeReviewStudio && (
        <StudioReviewModal
          studio={activeReviewStudio}
          onClose={() => setActiveReviewStudio(null)}
          onApprove={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Approved');
              fetchStudios();
              const stName = activeReviewStudio.name || 'Studio';
              const stEmail = activeReviewStudio.email || 'studio email';
              setToastMessage(`Studio "${stName}" approved! Login credentials and live portal link (https://altration-panel.alteration-connect.workers.dev) have been dispatched to ${stEmail}.`);
              setTimeout(() => setToastMessage(''), 7000);
            } catch (err) {
              console.warn('Failed to approve studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSuspend={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Suspended');
              fetchStudios();
            } catch (err) {
              console.warn('Failed to suspend studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onGrantWaiver={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Approved');
              fetchStudios();
            } catch (err) {
              console.warn('Failed to grant waiver:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSaveDetails={async (id, updates) => {
            try {
              await adminDataService.updateStudio(id, updates);
              fetchStudios();
            } catch (err) {
              console.warn('Failed to update studio details:', err);
            }
          }}
        />
      )}

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
