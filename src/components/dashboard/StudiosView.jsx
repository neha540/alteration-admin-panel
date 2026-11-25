import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Plus, Eye, Check, X, Building2 } from 'lucide-react';
import { formatStudioLocation } from '../../utils/locationHelper';
import StudioRegistrationModal from '../modals/StudioRegistrationModal';
import StudioReviewModal from './StudioReviewModal';
import StudioApprovedScreen from './StudioApprovedScreen';
import StudioProfilePreviewModal from './StudioProfilePreviewModal';

export default function StudiosView({ networkSettings }) {
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeReviewStudio, setActiveReviewStudio] = useState(null);
  const [activePreviewStudio, setActivePreviewStudio] = useState(null);
  const [approvedConfirmationData, setApprovedConfirmationData] = useState(null);
  const [liveStudios, setLiveStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchStudios = () => {
    adminDataService.getStudios().then(data => {
      if (Array.isArray(data)) {
        setLiveStudios(data);
        window.dispatchEvent(new Event('admin_studios_updated'));
      } else {
        setLiveStudios([]);
      }
    }).catch((err) => {
      console.warn('Failed to load studios:', err);
      setLiveStudios([]);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchStudios();
    const interval = setInterval(fetchStudios, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, searchQuery]);

  // Map live studios from backend into UI shape
  const currentStudios = (liveStudios || []).map(s => {
    const isApproved = s.status === 'Approved';
    const isSuspended = s.status === 'Suspended' || s.status === 'Declined';
    return {
      id: s.id,
      name: s.name,
      owner: s.owner || 'Owner',
      initials: s.initials || (s.name ? s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
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
      membership: Boolean(s.membershipPaid === true || s.paymentStatus === 'paid' || s.membership === 'Paid')
        ? `Paid (${s.paidAmount ? '$' + s.paidAmount : (s.membershipFee ? '$' + s.membershipFee : (networkSettings?.membershipFee ? '$' + networkSettings.membershipFee : '$300'))})`
        : 'Not paid',
      membershipColor: Boolean(s.membershipPaid === true || s.paymentStatus === 'paid' || s.membership === 'Paid')
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
        : 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold',
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
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${filterTab === 'all'
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
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${filterTab === 'awaiting'
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
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${filterTab === 'approved'
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
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${filterTab === 'declined'
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
              {isLoading && liveStudios.length === 0 ? (
                [1, 2, 3, 4].map((k) => (
                  <tr key={k} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 bg-slate-200 rounded w-36" />
                          <div className="h-3 bg-slate-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-28" />
                      <div className="h-3 bg-slate-100 rounded w-16" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 bg-slate-200 rounded-md w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 bg-slate-200 rounded-md w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 bg-slate-200 rounded-md w-16" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-7 bg-slate-100 rounded-lg w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredStudios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-400">
                        <Building2 className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-slate-800 font-bold text-sm">
                          {allCount === 0
                            ? 'No studios registered yet'
                            : `No studios found in "${filterTab === 'all' ? 'All studios' : filterTab === 'awaiting' ? 'Awaiting review' : filterTab === 'approved' ? 'Approved' : 'Paused / declined'}"`}
                        </p>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                          {allCount === 0
                            ? 'There are currently no tailoring or alteration studios registered in the network. You can register one directly or wait for businesses to apply.'
                            : (searchQuery ? `No studios match "${searchQuery}". Try clearing your search query.` : 'Try selecting another tab or clearing your filters.')}
                        </p>
                      </div>
                      {allCount === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterError('');
                            setRegisterModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer mt-1"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Register a studio</span>
                        </button>
                      ) : (
                        (searchQuery || filterTab !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setFilterTab('all');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer mt-1"
                          >
                            <span>Clear filters</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s) => (
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
                      {(() => {
                        const loc = formatStudioLocation(s);
                        return (
                          <>
                            <span className="block font-medium text-slate-800">{loc.primary}</span>
                            <span className="text-[11px] text-slate-400 block">{loc.secondary}</span>
                          </>
                        );
                      })()}
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
                          onClick={() => setActivePreviewStudio(s)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Preview profile"
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

        {/* Card Footer with Pagination */}
        <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {filteredStudios.length === 0
              ? 'Showing 0 studios (0 total)'
              : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredStudios.length)} of ${filteredStudios.length} studios (${allCount} total)`
            }
          </span>
          {filteredStudios.length > itemsPerPage && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-medium text-slate-700">
                {currentPage} / {Math.ceil(filteredStudios.length / itemsPerPage)}
              </span>
              <button
                type="button"
                disabled={currentPage >= Math.ceil(filteredStudios.length / itemsPerPage)}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStudios.length / itemsPerPage), p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Studio Registration Modal matching Web app ditto */}
      <StudioRegistrationModal
        isOpen={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          fetchStudios();
        }}
        membershipFee={networkSettings?.membershipFee || '300'}
        studioSpacing={networkSettings?.studioSpacing || '5'}
      />

      {/* Studio Review Modal connected to backend APIs */}
      {activeReviewStudio && (
        <StudioReviewModal
          studio={activeReviewStudio}
          allStudios={liveStudios}
          networkSettings={networkSettings}
          onClose={() => setActiveReviewStudio(null)}
          onApprove={async (id) => {
            try {
              const res = await adminDataService.updateStudioStatus(id, 'Approved');
              fetchStudios();
              setApprovedConfirmationData({
                studio: activeReviewStudio,
                credentials: res?.credentials || {
                  studioId: activeReviewStudio.id,
                  email: activeReviewStudio.email,
                  password: activeReviewStudio.defaultPassword || 'Studio@123',
                  portalUrl: 'https://altration-panel.alteration-connect.workers.dev'
                }
              });
            } catch (err) {
              console.warn('Failed to approve studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onDecline={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Declined');
              fetchStudios();
              setToastMessage(`Studio "${activeReviewStudio.name}" application declined.`);
              setTimeout(() => setToastMessage(''), 5000);
            } catch (err) {
              console.warn('Failed to decline studio:', err);
              alert('Failed to decline studio application.');
            }
            setActiveReviewStudio(null);
          }}
          onSuspend={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Suspended');
              fetchStudios();
              setToastMessage(`Studio "${activeReviewStudio.name}" has been suspended.`);
              setTimeout(() => setToastMessage(''), 5000);
            } catch (err) {
              console.warn('Failed to suspend studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onGrantWaiver={async (id) => {
            try {
              await adminDataService.updateStudio(id, {
                status: 'Approved',
                membership: 'Paid',
                membershipPaid: true,
                paymentStatus: 'paid',
                waiverGranted: true,
                waiverReason: 'Pilot waiver 90 days',
                waiverDate: new Date().toISOString()
              });
              setToastMessage('Pilot waiver granted for 90 days. Membership requirement fulfilled.');
              setTimeout(() => setToastMessage(''), 4000);
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

      {/* Studio Approved Confirmation Screen with Generated Credentials */}
      {approvedConfirmationData && (
        <div className="fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto">
          <StudioApprovedScreen
            studio={approvedConfirmationData.studio}
            credentials={approvedConfirmationData.credentials}
            onClose={() => setApprovedConfirmationData(null)}
            onViewStudios={() => {
              setApprovedConfirmationData(null);
              fetchStudios();
            }}
          />
        </div>
      )}

      {/* In-app Studio Profile Preview Modal */}
      {activePreviewStudio && (
        <StudioProfilePreviewModal
          isOpen={Boolean(activePreviewStudio)}
          studio={activePreviewStudio}
          onClose={() => setActivePreviewStudio(null)}
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
