import React, { useState } from 'react';
import { Scissors, Clock, CheckCircle2, Ticket } from 'lucide-react';
import SupportTicketModal from './SupportTicketModal';

export default function ActivitySupportView() {
  const [activeTab, setActiveTab] = useState('support'); // 'support' | 'activity'
  const [inboxFilter, setInboxFilter] = useState('open'); // 'open' | 'resolved' | 'all'
  const [selectedTicket, setSelectedTicket] = useState(null);

  const activityLogs = [
    { id: 1, action: 'Studio application submitted', detail: 'Round Rock Stitch applied for Austin territory', time: 'Today, 10:24 AM' },
    { id: 2, action: 'Order quote accepted', detail: 'Trouser hem & waist adjustment by Alexandra Morgan', time: 'Yesterday, 3:45 PM' },
    { id: 3, action: 'Territory spacing audit passed', detail: '5.0-mile minimum rule verified for 4 live studios', time: 'Nov 02, 2026' },
    { id: 4, action: 'Membership fee recorded', detail: '$200 paid by The Modern Hem', time: 'Nov 01, 2026' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Support &amp; activity
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Review requests or inspect the activity log.
        </p>
      </div>

      {/* Segmented Pill Tabs matching Image 18 */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'support'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Support requests
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Activity log
        </button>
      </div>

      {activeTab === 'support' ? (
        /* Support Inbox Card matching Image 18 */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Support inbox
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer and studio requests, with a clear resolution history.
            </p>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="px-6 border-b border-slate-100 flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInboxFilter('open')}
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                inboxFilter === 'open'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Open</span>
              <span className="text-[11px] text-slate-400">0</span>
            </button>

            <button
              type="button"
              onClick={() => setInboxFilter('resolved')}
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                inboxFilter === 'resolved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Resolved</span>
              <span className="text-[11px] text-slate-400">0</span>
            </button>

            <button
              type="button"
              onClick={() => setInboxFilter('all')}
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                inboxFilter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All requests</span>
              <span className="text-[11px] text-slate-400">0</span>
            </button>
          </div>

          {/* Centered Empty State matching Image 18 */}
          <div className="p-12 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 mb-4">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              No open support requests
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              New customer and studio requests will appear here.
            </p>

            <button
              type="button"
              onClick={() => setSelectedTicket({ id: 'SUP-DEMO', from: 'Customer', email: 'alexandra@example.com', received: 'Oct 26, 4:01 PM', message: 'Please help me confirm my fitting time.', status: 'Open' })}
              className="mt-4 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11.5px] font-semibold text-slate-700 transition cursor-pointer"
            >
              Preview sample ticket (SUP-DEMO)
            </button>
          </div>
        </div>
      ) : (
        /* Activity Log List */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Recent network activity
          </h2>
          <div className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-slate-900 block">{log.action}</span>
                  <span className="text-xs text-slate-500 block mt-0.5">{log.detail}</span>
                </div>
                <span className="text-[11px] text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Request Detail Modal matching Image 26 */}
      {selectedTicket && (
        <SupportTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
