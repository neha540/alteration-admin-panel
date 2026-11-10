import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  RotateCw,
  ArrowRight
} from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import StudioReviewModal from './StudioReviewModal';

export default function OverviewView({ onNavigateTab }) {
  // Default mock fallback data matching initial Figma designs
  const initialStudios = [
    {
      id: 'round-rock',
      name: 'Round Rock Stitch',
      location: 'Round Rock, TX · 78664',
      city: 'Round Rock',
      state: 'TX',
      zip: '78664',
      status: 'In review',
      reviewStatus: 'In review',
      hasConflict: false,
      membership: 'Payment required'
    },
    {
      id: 'congress-clothing',
      name: 'Congress Clothing Care',
      location: 'South Congress, TX · 78704',
      city: 'South Congress',
      state: 'TX',
      zip: '78704',
      status: 'In review',
      reviewStatus: 'In review',
      hasConflict: true,
      membership: 'Payment required'
    },
    {
      id: 'modern-hem',
      name: 'The Modern Hem',
      city: 'Austin, TX',
      zip: '78701',
      status: 'Approved',
      reviewStatus: 'Approved',
      membership: 'Paid'
    },
    {
      id: 'northline',
      name: 'Northline Tailoring',
      city: 'North Austin, TX',
      zip: '78758',
      status: 'Approved',
      reviewStatus: 'Approved',
      membership: 'Paid'
    },
    {
      id: 'atelier-rose',
      name: 'Atelier Rose',
      city: 'Westlake, TX',
      zip: '78746',
      status: 'Approved',
      reviewStatus: 'Approved',
      membership: 'Paid'
    },
    {
      id: 'good-form',
      name: 'Good Form Studio',
      city: 'South Austin, TX',
      zip: '78745',
      status: 'Approved',
      reviewStatus: 'Approved',
      membership: 'Paid'
    }
  ];

  const [studios, setStudios] = useState(initialStudios);
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Alexandra Morgan' },
    { id: 2, name: 'Marcus Chen' },
    { id: 3, name: 'Sarah Jenkins' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewModalStudio, setReviewModalStudio] = useState(null);

  // Fetch all live data dynamically
  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studiosData, ticketsData, customersData] = await Promise.allSettled([
        adminDataService.getStudios(),
        adminDataService.getSupportTickets(),
        adminDataService.getCustomers()
      ]);

      if (studiosData.status === 'fulfilled' && Array.isArray(studiosData.value) && studiosData.value.length > 0) {
        setStudios(studiosData.value);
      }

      if (ticketsData.status === 'fulfilled' && Array.isArray(ticketsData.value)) {
        setTickets(ticketsData.value);
      }

      if (customersData.status === 'fulfilled' && Array.isArray(customersData.value) && customersData.value.length > 0) {
        setCustomers(customersData.value);
      }
    } catch (err) {
      console.warn('Error loading dynamic overview data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverviewData();

    // Listen for studio updates triggered by other views
    const handleStudiosUpdated = () => {
      loadOverviewData();
    };

    window.addEventListener('admin_studios_updated', handleStudiosUpdated);

    // Periodic live sync every 4 seconds
    const interval = setInterval(() => {
      loadOverviewData();
    }, 4000);

    return () => {
      window.removeEventListener('admin_studios_updated', handleStudiosUpdated);
      clearInterval(interval);
    };
  }, [loadOverviewData]);

  // Dynamic calculations
  const pendingStudios = studios.filter(s => 
    s.status === 'In review' || 
    s.reviewStatus === 'In review' || 
    s.status === 'Pending' ||
    s.status === 'in_review'
  );

  const liveStudios = studios.filter(s => 
    s.status === 'Approved' || 
    s.reviewStatus === 'Approved'
  );

  const conflictStudios = studios.filter(s => Boolean(s.hasConflict));
  const hasTerritoryConflict = conflictStudios.length > 0;

  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'open');

  // $200 per active live studio
  const monthlyRevenue = liveStudios.length * 200;
  const customersCount = customers.length;

  // Format helpers
  const getStudioLocation = (studio) => {
    if (studio.location) return studio.location;
    const parts = [studio.city, studio.state].filter(Boolean).join(', ');
    if (parts && studio.zip) return `${parts} · ${studio.zip}`;
    if (parts) return parts;
    if (studio.address) return studio.address;
    return 'Austin, TX';
  };

  const getStudioStatusText = (studio) => {
    const isConflict = Boolean(studio.hasConflict);
    const isPaid = studio.membership === 'Paid';
    const territoryText = isConflict ? 'Territory conflict' : 'Territory clear';
    const membershipText = isPaid ? 'Membership active' : 'Membership needed';
    return `${territoryText} · ${membershipText}`;
  };

  // Studio modal handlers
  const handleApproveStudio = async (studioId) => {
    try {
      await adminDataService.updateStudioStatus(studioId, 'Approved', false);
    } catch (err) {
      console.warn('Backend update failed, applying local state update:', err);
    }
    setStudios(prev => prev.map(s => s.id === studioId ? { ...s, status: 'Approved', reviewStatus: 'Approved', hasConflict: false } : s));
    setReviewModalStudio(null);
    window.dispatchEvent(new Event('admin_studios_updated'));
  };

  const handleGrantWaiver = async (studioId) => {
    try {
      await adminDataService.updateStudio(studioId, { membership: 'Paid', pilotWaiver: true });
    } catch (err) {
      console.warn('Waiver update failed, applying locally:', err);
    }
    setStudios(prev => prev.map(s => s.id === studioId ? { ...s, membership: 'Paid' } : s));
    window.dispatchEvent(new Event('admin_studios_updated'));
  };

  const handleSuspendStudio = async (studioId) => {
    try {
      await adminDataService.updateStudioStatus(studioId, 'Suspended', false);
    } catch (err) {
      console.warn('Suspend failed, applying locally:', err);
    }
    setStudios(prev => prev.map(s => s.id === studioId ? { ...s, status: 'Suspended', reviewStatus: 'Suspended' } : s));
    setReviewModalStudio(null);
    window.dispatchEvent(new Event('admin_studios_updated'));
  };

  return (
    <div className="space-y-6">
      {/* Title & Subheading matching Image 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Review applications and keep the network running.
          </p>
        </div>

        {/* Live sync pill badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live network sync</span>
          </div>

          <button
            type="button"
            onClick={loadOverviewData}
            title="Refresh network data"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Left Applications (approx 65%), Right Support & Spacing (approx 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Applications to review */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Applications to review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingStudios.length} {pendingStudios.length === 1 ? 'awaiting review' : 'awaiting review'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('studios')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>View all</span>
              <span>→</span>
            </button>
          </div>

          {/* Applications List */}
          {pendingStudios.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                All caught up
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                There are no studio applications waiting for review. All registered studios in the network have been reviewed.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('studios')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View studio directory
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingStudios.map((studio) => {
                const isConflict = Boolean(studio.hasConflict);
                return (
                  <div
                    key={studio.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                        <Briefcase className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          {studio.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {getStudioLocation(studio)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {getStudioStatusText(studio)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReviewModalStudio(studio)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                        !isConflict
                          ? 'bg-[#2361E9] hover:bg-[#1D4ED8] text-white shadow-2xs'
                          : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      Review application
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Support & Territory Spacing */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Support Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Support
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {openTickets.length} {openTickets.length === 1 ? 'open request' : 'open requests'}
            </p>

            {openTickets.length === 0 ? (
              <div className="my-5 flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <span>No requests waiting.</span>
              </div>
            ) : (
              <div className="my-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                  <span>{openTickets.length} customer request awaiting response.</span>
                </div>
                {openTickets[0]?.message && (
                  <p className="text-[11.5px] text-slate-500 line-clamp-1 italic pl-6">
                    "{openTickets[0].message}"
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('activity')}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Open support
            </button>
          </div>

          {/* Territory Spacing Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            {hasTerritoryConflict ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Territory alert</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Territory spacing</span>
              </span>
            )}

            <h3 className="text-lg font-bold text-slate-900 mt-3.5">
              5 miles minimum
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {hasTerritoryConflict
                ? `${conflictStudios[0]?.name || '1 studio applicant'} is within 2.1 miles of an existing studio.`
                : 'Live studios meet the current spacing rule.'}
            </p>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('territories')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer mt-4 inline-flex items-center gap-1"
            >
              <span>Check territories</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom 3-Metric Stats Row Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div 
          onClick={() => onNavigateTab && onNavigateTab('studios')}
          className="pb-4 md:pb-0 md:pr-6 cursor-pointer group hover:bg-slate-50/60 transition p-2 rounded-xl -m-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 block tracking-tight">
              {liveStudios.length}
            </span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Live studios
          </span>
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('subscriptions')}
          className="py-4 md:py-0 md:px-6 cursor-pointer group hover:bg-slate-50/60 transition p-2 rounded-xl -m-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 block tracking-tight">
              ${monthlyRevenue.toLocaleString()}
            </span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Monthly membership revenue
          </span>
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('customers')}
          className="pt-4 md:pt-0 md:pl-6 cursor-pointer group hover:bg-slate-50/60 transition p-2 rounded-xl -m-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 block tracking-tight">
              {customersCount}
            </span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">
            Registered customers
          </span>
        </div>
      </div>

      {/* Studio Review Modal */}
      {reviewModalStudio && (
        <StudioReviewModal
          studio={reviewModalStudio}
          onClose={() => setReviewModalStudio(null)}
          onApprove={() => handleApproveStudio(reviewModalStudio.id)}
          onGrantWaiver={() => handleGrantWaiver(reviewModalStudio.id)}
          onSuspend={() => handleSuspendStudio(reviewModalStudio.id)}
        />
      )}
    </div>
  );
}
