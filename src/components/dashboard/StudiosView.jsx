import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Plus, Eye, Check } from 'lucide-react';
import StudioReviewModal from './StudioReviewModal';

export default function StudiosView() {
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [activeReviewStudio, setActiveReviewStudio] = useState(null);
  const [liveStudios, setLiveStudios] = useState(null);

  const fetchStudios = () => {
    adminDataService.getStudios().then(data => {
      if (data && data.length > 0) {
        setLiveStudios(data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  const studiosData = [
    {
      id: 1,
      name: 'The Modern Hem',
      owner: 'Olivia Bennett',
      initials: 'MH',
      avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
      city: 'Austin, TX',
      zip: '78701',
      reviewStatus: 'Approved',
      reviewColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      membership: 'Paid',
      membershipColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      listing: 'Live',
      listingColor: 'text-emerald-600',
      action: 'Manage'
    },
    {
      id: 2,
      name: 'Northline Tailoring',
      owner: 'James Parker',
      initials: 'NT',
      avatarBg: 'bg-slate-100 text-slate-700',
      city: 'North Austin, TX',
      zip: '78758',
      reviewStatus: 'Approved',
      reviewColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      membership: 'Paid',
      membershipColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      listing: 'Live',
      listingColor: 'text-emerald-600',
      action: 'Manage'
    },
    {
      id: 3,
      name: 'Atelier Rose',
      owner: 'Isabella Rose',
      initials: 'AR',
      avatarBg: 'bg-rose-50 text-rose-700',
      city: 'Westlake, TX',
      zip: '78746',
      reviewStatus: 'Approved',
      reviewColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      membership: 'Paid',
      membershipColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      listing: 'Live',
      listingColor: 'text-emerald-600',
      action: 'Manage'
    },
    {
      id: 4,
      name: 'Good Form Studio',
      owner: 'Avery Brooks',
      initials: 'GF',
      avatarBg: 'bg-teal-50 text-teal-700',
      city: 'South Austin, TX',
      zip: '78745',
      reviewStatus: 'Approved',
      reviewColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      membership: 'Paid',
      membershipColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      listing: 'Live',
      listingColor: 'text-emerald-600',
      action: 'Manage'
    },
    {
      id: 5,
      name: 'Round Rock Stitch',
      owner: 'Emma Hayes',
      initials: 'RS',
      avatarBg: 'bg-emerald-50 text-emerald-800',
      city: 'Round Rock, TX',
      zip: '78664',
      reviewStatus: 'In review',
      reviewColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      membership: 'Payment required',
      membershipColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      listing: 'Hidden',
      listingColor: 'text-slate-400',
      action: 'Review'
    },
    {
      id: 6,
      name: 'Congress Clothing Care',
      owner: 'Noah Ellis',
      initials: 'CC',
      avatarBg: 'bg-amber-50 text-amber-800',
      city: 'South Congress, TX',
      zip: '78704',
      reviewStatus: 'In review',
      reviewColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      membership: 'Payment required',
      membershipColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      listing: 'Hidden',
      listingColor: 'text-slate-400',
      action: 'Review'
    }
  ];

  const currentStudios = liveStudios ? liveStudios.map(s => ({
    id: s.id,
    name: s.name,
    owner: s.owner || 'Owner',
    initials: s.initials || 'ST',
    avatarBg: s.bgTeal ? 'bg-[#F5EFE6] text-[#78593C]' : 'bg-slate-100 text-slate-700',
    city: s.city,
    zip: (s.address && s.address.slice(-5)) || '78701',
    reviewStatus: s.status || 'Approved',
    reviewColor: s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80',
    membership: s.status === 'Approved' ? 'Paid' : 'Payment required',
    membershipColor: s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80',
    listing: s.status === 'Approved' ? 'Live' : 'Hidden',
    listingColor: s.status === 'Approved' ? 'text-emerald-600' : 'text-slate-400',
    action: s.status === 'Approved' ? 'Manage' : 'Review'
  })) : studiosData;

  const filteredStudios = currentStudios.filter((s) => {
    // Filter tab
    if (filterTab === 'awaiting' && s.reviewStatus !== 'In review') return false;
    if (filterTab === 'approved' && s.reviewStatus !== 'Approved') return false;
    if (filterTab === 'declined' && s.reviewStatus === 'Approved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.zip.includes(q)
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
          onClick={() => setRegisterModalOpen(true)}
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
              6 businesses in the network
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

        {/* Filter Tabs */}
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
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${filterTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
              6
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
            <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
              2
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
            <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
              4
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
            <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
              0
            </span>
          </button>
        </div>

        {/* Studios Table matching Image 12 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">STUDIO</th>
                <th className="py-3 px-6">LOCATION</th>
                <th className="py-3 px-6">REVIEW STATUS</th>
                <th className="py-3 px-6">MEMBERSHIP</th>
                <th className="py-3 px-6">LISTING</th>
                <th className="py-3 px-6 text-right">MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudios.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  {/* Studio name & owner */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${s.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {s.initials}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                          {s.name}
                        </span>
                        <span className="text-[11.5px] text-slate-400 block mt-0.5">
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer matching Image 12 */}
        <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredStudios.length} of {studiosData.length} studios</span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Approval + membership + territory</span>
          </div>
        </div>

      </div>

      {/* Modal to Register a studio */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Register a new studio
            </h3>
            <p className="text-xs text-slate-500">
              Enter business and owner details to start onboarding.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">Studio name</label>
                <input type="text" placeholder="e.g. Austin Tailor Studio" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">Owner full name</label>
                <input type="text" placeholder="e.g. Jane Doe" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">Location / ZIP</label>
                <input type="text" placeholder="e.g. Austin, TX 78701" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Studio registration invitation dispatched.");
                  setRegisterModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#2361E9] text-white rounded-lg hover:bg-blue-700"
              >
                Submit registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Review Modal matching Images 20 & 21 */}
      {activeReviewStudio && (
        <StudioReviewModal
          studio={activeReviewStudio}
          onClose={() => setActiveReviewStudio(null)}
          onApprove={(id) => {
            alert("Studio approved and published to network.");
          }}
          onSuspend={(id) => {
            alert("Studio listing suspended.");
          }}
          onGrantWaiver={(id) => {
            alert("Pilot waiver granted.");
          }}
        />
      )}
    </div>
  );
}

