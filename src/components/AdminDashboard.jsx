import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Building2, 
  FileText, 
  Map, 
  CreditCard, 
  Users, 
  Star, 
  Clock, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink, 
  Bell, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import AdminLogo from './AdminLogo';
import OverviewView from './dashboard/OverviewView';
import StudiosView from './dashboard/StudiosView';
import OrdersView from './dashboard/OrdersView';
import TerritoriesView from './dashboard/TerritoriesView';
import SubscriptionsView from './dashboard/SubscriptionsView';
import CustomersView from './dashboard/CustomersView';
import ReviewsView from './dashboard/ReviewsView';
import ActivitySupportView from './dashboard/ActivitySupportView';
import NetworkSettingsView from './dashboard/NetworkSettingsView';

import StudioReviewModal from './dashboard/StudioReviewModal';
import StudioMembershipModal from './dashboard/StudioMembershipModal';
import CustomerDetailsModal from './dashboard/CustomerDetailsModal';
import OrderDetailModal from './dashboard/OrderDetailModal';
import SupportTicketModal from './dashboard/SupportTicketModal';
import OrderRequestDetailsModal from './dashboard/OrderRequestDetailsModal';
import OrderTimelineModal from './dashboard/OrderTimelineModal';
import StudioApprovedScreen from './dashboard/StudioApprovedScreen';
import SuspendStudioModal from './dashboard/SuspendStudioModal';
import SupportTicketResolvedScreen from './dashboard/SupportTicketResolvedScreen';

export default function AdminDashboard({ user, onSignOut, onBackToAuth, initialTab = 'overview', initialModal = null }) {
  const [activeNav, setActiveNav] = useState(initialTab);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(initialModal);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid, breadcrumb: 'Overview' },
    { key: 'studios', label: 'Studios', icon: Building2, badge: '2', breadcrumb: 'Studios' },
    { key: 'orders', label: 'All orders', icon: FileText, breadcrumb: 'All orders' },
    { key: 'territories', label: 'Territories', icon: Map, breadcrumb: 'Territories' },
    { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, breadcrumb: 'Subscriptions' },
    { key: 'customers', label: 'Customers', icon: Users, breadcrumb: 'Customers' },
    { key: 'reviews', label: 'Reviews', icon: Star, breadcrumb: 'Reviews' },
    { key: 'activity', label: 'Activity & support', icon: Clock, breadcrumb: 'Activity & support' },
    { key: 'settings', label: 'Network settings', icon: Settings, breadcrumb: 'Network settings' },
  ];

  const currentItem = navItems.find((n) => n.key === activeNav) || navItems[0];

  return (
    <div className="h-screen w-full flex bg-[#F8FAFC] text-slate-800 font-['Arial',sans-serif] antialiased select-none overflow-hidden">
      
      {/* ==================== LEFT DEEP NAVY SIDEBAR ==================== */}
      <aside 
        style={{ backgroundColor: '#172A45' }}
        className="w-64 xl:w-72 text-white shrink-0 flex flex-col justify-between p-5 select-none h-screen sticky top-0 overflow-y-auto no-scrollbar"
      >
        <div>
          {/* Brand Logo & Platform Admin Heading */}
          <div className="pb-5 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="bg-white rounded-lg p-1.5 inline-flex items-center justify-center">
                <AdminLogo className="h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight block leading-tight">
                  Alteration Connect
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 tracking-[0.16em] uppercase block mt-0.5">
                  PLATFORM ADMIN
                </span>
              </div>
            </div>

            {/* Operations Status indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
              <span className="font-medium text-[12px]">Network operations</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.key);
                    setActiveModal(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-white text-slate-900 font-bold text-[11px] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Box & Footer */}
        <div className="pt-6 mt-6 border-t border-slate-700/50 space-y-3.5">
          {/* Thoughtfully Local Box */}
          <div className="bg-[#0F1E32]/80 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
              <span>Thoughtfully local</span>
            </div>
            <div className="text-[11.5px] text-slate-300 mt-1.5 space-y-0.5 font-normal">
              <p>5-mile studio spacing</p>
              <p>$200 monthly membership</p>
            </div>
          </div>

          {/* Partner support link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              type="button"
              onClick={() => alert("Partner support: support@alterationconnect.com")}
              className="inline-flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Partner support</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              className="hover:text-red-400 transition cursor-pointer p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== RIGHT MAIN DASHBOARD CONTENT ==================== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden bg-white">
        {/* Top Bar Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0 px-6 sm:px-10 h-16 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>Platform console</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{currentItem.breadcrumb}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Interactive preview pill button */}
            <button
              type="button"
              onClick={onBackToAuth}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              Interactive preview
            </button>

            {/* Bell Notification */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-30 text-xs">
                  <div className="font-bold text-slate-900 mb-1">Notifications</div>
                  <div className="text-slate-500">2 studio applications are waiting for review.</div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                PA
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-bold text-xs text-slate-900 block">
                  Platform Admin
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Network management
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Content Slot */}
        <main className="flex-1 p-6 sm:p-10">
          {activeNav === 'overview' && <OverviewView onNavigateTab={setActiveNav} />}
          {activeNav === 'studios' && <StudiosView />}
          {activeNav === 'orders' && <OrdersView />}
          {activeNav === 'territories' && <TerritoriesView />}
          {activeNav === 'subscriptions' && <SubscriptionsView />}
          {activeNav === 'customers' && <CustomersView />}
          {activeNav === 'reviews' && <ReviewsView />}
          {activeNav === 'activity' && <ActivitySupportView />}
          {activeNav === 'settings' && <NetworkSettingsView />}
        </main>

        {/* Bottom Footer */}
        <footer className="px-6 sm:px-10 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <span className="font-medium text-slate-500">
            Alteration Connect
          </span>
          <div className="flex items-center gap-4">
            <span>Made for a better fit.</span>
            <span className="hover:text-slate-600 transition cursor-pointer">
              Need a hand?
            </span>
          </div>
        </footer>
      </div>

      {/* ==================== MODALS 20 TO 26 ==================== */}

      {/* Screen 20: Active studio details */}
      {activeModal === '20-active' && (
        <StudioReviewModal
          studio={{ name: 'The Modern Hem', status: 'Approved', initials: 'MH', reviewStatus: 'Approved' }}
          onClose={() => setActiveModal(null)}
          onSuspend={() => setActiveModal('30-suspend')}
        />
      )}

      {/* Screen 21: Pending studio application */}
      {activeModal === '21-pending' && (
        <StudioReviewModal
          studio={{ name: 'Round Rock Stitch', status: 'In review', initials: 'RS', reviewStatus: 'In review' }}
          onClose={() => setActiveModal(null)}
          onApprove={() => setActiveModal('29-approved')}
          onGrantWaiver={() => alert("Pilot waiver granted.")}
        />
      )}

      {/* Screen 22: Application with territory conflict */}
      {activeModal === '22-conflict' && (
        <StudioReviewModal
          studio={{ name: 'Congress Clothing Care', status: 'In review', initials: 'CC', hasConflict: true }}
          onClose={() => setActiveModal(null)}
          onApprove={() => setActiveModal('29-approved')}
          onGrantWaiver={() => alert("Pilot waiver granted.")}
        />
      )}

      {/* Screen 23: Studio membership details */}
      {activeModal === '23-membership' && (
        <StudioMembershipModal
          studio={{ name: 'The Modern Hem', location: 'Austin, TX 78701', membership: 'Paid', fee: '$200', approval: 'Approved', listing: 'Live', billingEmail: 'olivia@modernhem.example', paymentId: 'SP-1000', paymentDate: 'Oct 1, 9:00 AM · Paid', paymentAmount: '$200' }}
          onClose={() => setActiveModal(null)}
          onReviewStudio={() => setActiveModal('20-active')}
        />
      )}

      {/* Screen 24: Customer account details */}
      {activeModal === '24-customer' && (
        <CustomerDetailsModal
          customer={{ name: 'Alexandra Morgan', email: 'alexandra@example.com', initials: 'AM', ordersCount: 3, paidValue: '$132', completedCount: 1 }}
          onClose={() => setActiveModal(null)}
          onViewOrder={() => setActiveModal('25-order')}
        />
      )}

      {/* Screen 25: Cross-studio order detail */}
      {activeModal === '25-order' && (
        <OrderDetailModal
          order={{ id: 'AC-1041', title: 'Denim hemming', studio: 'The Modern Hem', amount: '$36', status: 'In progress', completionDate: 'Oct 28, 2026' }}
          onClose={() => setActiveModal(null)}
          onReviewStudio={() => setActiveModal('20-active')}
          onOpenRequestDetails={() => setActiveModal('27-request')}
          onOpenTimeline={() => setActiveModal('28-timeline')}
        />
      )}

      {/* Screen 26: Support ticket detail */}
      {activeModal === '26-support' && (
        <SupportTicketModal
          ticket={{ id: 'SUP-DEMO', from: 'Customer', email: 'alexandra@example.com', received: 'Oct 26, 4:01 PM', message: 'Please help me confirm my fitting time.', status: 'Open' }}
          onClose={() => setActiveModal(null)}
          onResolve={() => setActiveModal('31-resolved')}
        />
      )}

      {/* Screen 27: Cross-studio order detail / Request details */}
      {activeModal === '27-request' && (
        <OrderRequestDetailsModal
          order={{ 
            id: 'AC-1041', 
            requestNote: 'Keep the original hem on my straight-leg jeans.',
            measurementNote: 'No measurements shared with this order.',
            service: 'Original denim hem',
            qty: 1,
            amount: '$36',
            total: '$36'
          }}
          onClose={() => setActiveModal(null)}
          onBackToOrder={() => setActiveModal('25-order')}
        />
      )}

      {/* Screen 28: Cross-studio order detail / Order timeline */}
      {activeModal === '28-timeline' && (
        <OrderTimelineModal
          order={{ id: 'AC-1041' }}
          onClose={() => setActiveModal(null)}
          onBackToOrder={() => setActiveModal('25-order')}
        />
      )}

      {/* Screen 29: Studio approved confirmation */}
      {activeModal === '29-approved' && (
        <div className="fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto">
          <StudioApprovedScreen
            onClose={() => setActiveModal(null)}
            onViewStudios={() => {
              setActiveModal(null);
              setActiveNav('studios');
            }}
          />
        </div>
      )}

      {/* Screen 30: Suspend studio confirmation */}
      {activeModal === '30-suspend' && (
        <div className="fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto">
          <SuspendStudioModal
            onClose={() => setActiveModal(null)}
            onConfirmSuspension={() => {
              alert("Studio listing suspended.");
              setActiveModal(null);
              setActiveNav('studios');
            }}
            onKeepActive={() => setActiveModal('20-active')}
          />
        </div>
      )}

      {/* Screen 31: Support ticket resolved confirmation */}
      {activeModal === '31-resolved' && (
        <div className="fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto">
          <SupportTicketResolvedScreen
            onClose={() => setActiveModal(null)}
            onBackToSupport={() => {
              setActiveModal(null);
              setActiveNav('activity');
            }}
          />
        </div>
      )}

    </div>
  );
}
