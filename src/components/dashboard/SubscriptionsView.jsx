import React, { useState } from 'react';
import { Search } from 'lucide-react';
import StudioMembershipModal from './StudioMembershipModal';

export default function SubscriptionsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubStudio, setSelectedSubStudio] = useState(null);

  const subsData = [
    {
      id: 1,
      name: 'The Modern Hem',
      listing: 'Listing live',
      email: 'olivia@modernhem.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Paid',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      id: 2,
      name: 'Northline Tailoring',
      listing: 'Listing live',
      email: 'james@northline.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Paid',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      id: 3,
      name: 'Atelier Rose',
      listing: 'Listing live',
      email: 'isabella@atelierrose.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Paid',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      id: 4,
      name: 'Good Form Studio',
      listing: 'Listing live',
      email: 'avery@goodform.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Paid',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      id: 5,
      name: 'Round Rock Stitch',
      listing: 'Listing not live',
      email: 'emma@roundrockstitch.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Payment required',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200/80'
    },
    {
      id: 6,
      name: 'Congress Clothing Care',
      listing: 'Listing not live',
      email: 'noah@congresscare.example',
      fee: '$200',
      feePeriod: 'per month',
      status: 'Payment required',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
  ];

  const filteredSubs = subsData.filter((s) => {
    if (statusFilter !== 'all' && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Subscriptions
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Monthly memberships and approved fee waivers.
        </p>
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
              {filteredSubs.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  {/* Studio */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                      {s.name}
                    </span>
                    <span className="text-[11.5px] text-slate-400 block mt-0.5">
                      {s.listing} · {s.email}
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
                      onClick={() => setSelectedSubStudio(s)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800 transition cursor-pointer text-xs"
                    >
                      Manage membership
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
          <span>6 memberships · Customer order payments are separate</span>
        </div>
      </div>

      {/* Bottom 3 Metrics matching Image 15 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="pb-4 md:pb-0 md:pr-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">4</span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">Paid memberships</span>
        </div>

        <div className="py-4 md:py-0 md:px-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">$800</span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">Monthly paid plan value</span>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6">
          <span className="text-3xl font-bold text-slate-900 block tracking-tight">0</span>
          <span className="text-xs text-slate-500 block mt-1.5 font-medium">Approved pilot waivers</span>
        </div>
      </div>

      {/* Studio Membership Details Modal matching Image 23 */}
      {selectedSubStudio && (
        <StudioMembershipModal
          studio={selectedSubStudio}
          onClose={() => setSelectedSubStudio(null)}
          onReviewStudio={() => setSelectedSubStudio(null)}
        />
      )}
    </div>
  );
}

