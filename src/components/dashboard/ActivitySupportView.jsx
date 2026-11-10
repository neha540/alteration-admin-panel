import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Scissors, Clock, CheckCircle2, Ticket, Mail, User, AlertCircle, RefreshCw } from 'lucide-react';
import SupportTicketModal from './SupportTicketModal';

export default function ActivitySupportView() {
  const [activeTab, setActiveTab] = useState('support'); // 'support' | 'activity'
  const [inboxFilter, setInboxFilter] = useState('open'); // 'open' | 'resolved' | 'all'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [liveTickets, setLiveTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = () => {
    adminDataService.getSupportTickets().then(data => {
      if (Array.isArray(data)) {
        setLiveTickets(data);
      }
    }).catch(err => {
      console.warn('Failed to load tickets:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 3500);
    return () => clearInterval(interval);
  }, []);

  const openTickets = liveTickets.filter(t => t.status === 'Open');
  const resolvedTickets = liveTickets.filter(t => t.status === 'Resolved');

  const filteredTickets = liveTickets.filter(t => {
    if (inboxFilter === 'open') return t.status === 'Open';
    if (inboxFilter === 'resolved') return t.status === 'Resolved';
    return true;
  });

  const handleResolveTicket = async (ticketId) => {
    try {
      await adminDataService.resolveTicket(ticketId);
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.warn('Error resolving ticket:', err);
      setSelectedTicket(null);
    }
  };

  const activityLogs = [
    { id: 1, action: 'Studio application submitted', detail: 'Round Rock Stitch applied for Austin territory', time: 'Today, 10:24 AM' },
    { id: 2, action: 'Order quote accepted', detail: 'Trouser hem & waist adjustment by Alexandra Morgan', time: 'Yesterday, 3:45 PM' },
    { id: 3, action: 'Territory spacing audit passed', detail: '5.0-mile minimum rule verified for 4 live studios', time: 'Nov 02, 2026' },
    { id: 4, action: 'Membership fee recorded', detail: '$200 paid by The Modern Hem', time: 'Nov 01, 2026' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Support &amp; activity
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Review live customer requests or inspect the network activity log.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTickets}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'support'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Support requests</span>
          {openTickets.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
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
        /* Support Inbox Card */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Support inbox
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer and studio inquiries submitted through the Help Center.
              </p>
            </div>
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
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                inboxFilter === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {openTickets.length}
              </span>
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
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                inboxFilter === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {resolvedTickets.length}
              </span>
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
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                inboxFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {liveTickets.length}
              </span>
            </button>
          </div>

          {/* Ticket List or Empty State */}
          {filteredTickets.length === 0 ? (
            <div className="p-12 sm:p-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 mb-4">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {inboxFilter === 'open' ? 'No open support requests' : inboxFilter === 'resolved' ? 'No resolved requests yet' : 'No support requests found'}
              </h3>

              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                When customers submit requests via the Web Help Center or order detail modal, tickets will appear here for review and resolution.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => {
                const isOpen = ticket.status === 'Open';
                const createdTime = ticket.createdAt 
                  ? new Date(ticket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : 'Recent';

                return (
                  <div
                    key={ticket.id}
                    className="p-5 sm:px-6 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {ticket.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isOpen
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {createdTime}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {ticket.subject || 'Support Inquiry'}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl font-normal">
                        {ticket.message}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{ticket.customerName || 'Customer'}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{ticket.customerEmail}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicket({
                        id: ticket.id,
                        from: ticket.customerName || 'Customer',
                        email: ticket.customerEmail,
                        received: createdTime,
                        message: ticket.message,
                        status: ticket.status
                      })}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                    >
                      {isOpen ? 'Review & resolve' : 'View ticket'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* Support Request Detail Modal */}
      {selectedTicket && (
        <SupportTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={handleResolveTicket}
        />
      )}
    </div>
  );
}
