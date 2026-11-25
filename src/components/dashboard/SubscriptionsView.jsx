import React, { useState, useEffect } from 'react';
import { Search, CreditCard, Download } from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';
import StudioMembershipModal from './StudioMembershipModal';
import StudioReviewModal from './StudioReviewModal';
import { downloadCsvFile, ADMIN_SUBSCRIPTION_CSV_HEADERS, formatAdminSubscriptionForCsv } from '../../utils/csvExport';

export default function SubscriptionsView({ networkSettings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubStudio, setSelectedSubStudio] = useState(null);
  const [reviewingStudio, setReviewingStudio] = useState(null);
  const [liveStudios, setLiveStudios] = useState([]);
  const [liveSettings, setLiveSettings] = useState(networkSettings || null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudios = () => {
    adminDataService.getStudios()
      .then(data => {
        if (Array.isArray(data)) setLiveStudios(data);
      })
      .catch(err => console.warn('Failed to fetch studios for subscriptions:', err))
      .finally(() => setIsLoading(false));
  };

  const fetchSettings = () => {
    adminDataService.getSettings()
      .then(s => {
        if (s) setLiveSettings(s);
      })
      .catch(err => console.warn('Failed to fetch settings for subscriptions:', err));
  };

  useEffect(() => {
    fetchStudios();
    fetchSettings();
    const interval = setInterval(() => {
      fetchStudios();
      fetchSettings();
    }, 4000);

    const handleSettingsUpdated = (e) => {
      if (e?.detail) setLiveSettings(e.detail);
    };
    window.addEventListener('admin_settings_updated', handleSettingsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('admin_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const defaultFeeNum = String(
    liveSettings?.membershipFee ||
    networkSettings?.membershipFee ||
    (() => {
      try {
        const cached = localStorage.getItem('alteration_network_settings') || localStorage.getItem('alteration_admin_network_settings');
        if (cached) return JSON.parse(cached)?.membershipFee;
      } catch (e) {}
      return '300';
    })() || '300'
  ).replace(/^\$/, '');

  const subsData = (liveStudios || []).map(s => {
    const isApproved = s.status === 'Approved';
    const isPaid = s.membership === 'Paid' || (isApproved && s.membership !== 'Payment required');
    const rawStudioFee = s.paidAmount || s.membershipFee || s.subscriptionFee;
    const cleanStudioFee = rawStudioFee ? String(rawStudioFee).replace(/^\$/, '') : defaultFeeNum;
    const formattedFee = `$${cleanStudioFee || defaultFeeNum}`;

    return {
      id: s.id,
      name: s.name,
      listing: isApproved ? 'Listing live' : 'Listing not live',
      email: s.email || s.contactEmail || 'No email',
      fee: formattedFee,
      feePeriod: 'per month',
      status: isPaid ? 'Paid' : 'Payment required',
      statusColor: isPaid 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
        : 'bg-amber-50 text-amber-700 border-amber-200/80',
      rawStudio: {
        ...s,
        approval: s.status || s.reviewStatus || 'Approved',
        listing: isApproved ? 'Live' : 'Not live',
        billingEmail: s.email || s.contactEmail || '',
        fee: formattedFee,
        paymentAmount: formattedFee
      }
    };
  });

  const filteredSubs = subsData.filter((s) => {
    if (statusFilter !== 'all' && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportSubscriptions = () => {
    if (!subsData || subsData.length === 0) {
      alert('No subscription records available to export.');
      return;
    }
    const targetSubs = filteredSubs.length > 0 ? filteredSubs : subsData;
    const rows = targetSubs.map(s => formatAdminSubscriptionForCsv(s));
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCsvFile(`studio_subscriptions_${dateStr}.csv`, ADMIN_SUBSCRIPTION_CSV_HEADERS, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Subscriptions
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Monthly memberships and approved fee waivers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportSubscriptions}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 stroke-[2]" />
          <span>Export subscriptions</span>
        </button>
      </div>

      {/* Main Table Card matching Image 15 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search studio or membership"
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All memberships</option>
              <option value="paid">Paid</option>
              <option value="payment required">Payment required</option>
            </select>
          </div>
        </div>

        {/* Table matching Image 15 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">STUDIO</th>
                <th className="py-3.5 px-6">MONTHLY FEE</th>
                <th className="py-3.5 px-6">MEMBERSHIP</th>
                <th className="py-3.5 px-6 text-right">MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
                        <CreditCard className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No studio memberships found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        When studios register and join the network, their monthly membership status and fee waivers will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    {/* Studio */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                        {s.name}
                      </span>
                      <span className="text-[11.5px] text-slate-400 block mt-0.5">
                        {s.listing} � {s.email}
                      </span>
                    </td>

                    {/* Monthly Fee */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">{s.fee}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{s.feePeriod}</span>
                    </td>

                    {/* Membership Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${s.statusColor}`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Manage Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSubStudio({
                          ...(s.rawStudio || s),
                          ...s,
                          approval: s.status || s.rawStudio?.status || s.rawStudio?.reviewStatus || 'Approved',
                          listing: (s.listing === 'Listing live' || s.rawStudio?.status === 'Approved') ? 'Live' : 'Not live',
                          billingEmail: s.email || s.rawStudio?.email || s.rawStudio?.contactEmail || '',
                          fee: s.fee,
                          paymentAmount: s.fee
                        })}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Manage membership
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Studio Membership Modal */}
      {selectedSubStudio && (
        <StudioMembershipModal
          studio={selectedSubStudio}
          onClose={() => setSelectedSubStudio(null)}
          onReviewStudio={(studioToReview) => {
            setSelectedSubStudio(null);
            setReviewingStudio(studioToReview);
          }}
          onGrantWaiver={async (studioId) => {
            try {
              await adminDataService.updateStudio(studioId, { membership: 'Paid', pilotWaiver: true });
              fetchStudios();
            } catch (err) {
              console.warn('Waiver failed:', err);
            }
            setSelectedSubStudio(null);
          }}
          onMarkPaid={async (studioId) => {
            try {
              await adminDataService.updateStudio(studioId, { membership: 'Paid' });
              fetchStudios();
            } catch (err) {
              console.warn('Mark paid failed:', err);
            }
            setSelectedSubStudio(null);
          }}
        />
      )}

      {/* Studio Review Modal connected via Review studio button */}
      {reviewingStudio && (
        <StudioReviewModal
          studio={reviewingStudio}
          networkSettings={liveSettings || networkSettings}
          onClose={() => setReviewingStudio(null)}
          onApprove={async (id) => {
            try {
              await adminDataService.updateStudio(id, { status: 'Approved' });
              fetchStudios();
            } catch (e) {
              console.warn('Approve failed:', e);
            }
            setReviewingStudio(null);
          }}
          onDecline={async (id) => {
            try {
              await adminDataService.updateStudio(id, { status: 'Declined' });
              fetchStudios();
            } catch (e) {
              console.warn('Decline failed:', e);
            }
            setReviewingStudio(null);
          }}
          onGrantWaiver={async (id) => {
            try {
              await adminDataService.updateStudio(id, { membership: 'Paid', pilotWaiver: true });
              fetchStudios();
            } catch (e) {
              console.warn('Waiver failed:', e);
            }
            setReviewingStudio(null);
          }}
        />
      )}
    </div>
  );
}
