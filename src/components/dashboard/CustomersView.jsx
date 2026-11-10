import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Users, Heart, CheckCircle2, RefreshCw } from 'lucide-react';
import CustomerDetailsModal from './CustomerDetailsModal';
import OrderDetailModal from './OrderDetailModal';
import StudioReviewModal from './StudioReviewModal';

export default function CustomersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);
  const [activeReviewStudio, setActiveReviewStudio] = useState(null);
  const [liveCustomers, setLiveCustomers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleReviewStudioFromOrder = async (order) => {
    const studioName = order?.studio || order?.studioName || '';
    const studioId = order?.studioId || '';

    let target = null;
    try {
      const studios = await adminDataService.getStudios();
      if (Array.isArray(studios)) {
        target = studios.find(s => 
          (studioId && s.id === studioId) || 
          (studioName && s.name && s.name.toLowerCase() === studioName.toLowerCase())
        );
      }
    } catch (err) {
      console.warn('Failed to fetch studio for review:', err);
    }

    if (!target) {
      target = {
        id: studioId || 'std_' + Date.now(),
        name: studioName || 'Specialist Tailoring Studio',
        owner: 'Studio Owner',
        city: 'Austin',
        zip: '78701',
        status: 'Approved',
        reviewStatus: 'Approved',
        startingPrice: '$25',
        turnaround: '2–3 days',
        hours: 'Mon–Sat 9:30 AM – 7:30 PM',
        specialties: ['Everyday'],
        bio: 'A neighborhood alteration and tailoring studio.'
      };
    }

    setSelectedOrderToView(null);
    setActiveReviewStudio(target);
  };



  const fetchCustomers = () => {
    adminDataService.getCustomers().then(data => {
      if (Array.isArray(data)) {
        setLiveCustomers(data);
      }
    }).catch(err => {
      console.warn('Failed to load customers:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentCustomers = Array.isArray(liveCustomers)
    ? liveCustomers.map(u => {
      const ordersList = Array.isArray(u.orders) ? u.orders : [];
      const count = typeof u.ordersCount === 'number' ? u.ordersCount : ordersList.length;
      return {
        id: u.id,
        name: u.fullName || u.name || 'Customer',
        email: u.email,
        initials: u.initials || (u.name || u.fullName || 'CU').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
        ordersCount: count,
        studiosVisited: u.studiosVisited !== undefined ? u.studiosVisited : (count > 0 ? 1 : 0),
        paidValue: u.paidValue || '$0',
        activeOrders: u.activeOrders !== undefined ? u.activeOrders : Math.max(0, count - (u.completedCount || 0)),
        completedCount: u.completedCount || 0,
        measurements: u.measurements,
        createdAt: u.createdAt,
        customerOrders: ordersList
      };
    })
    : [];

  const filteredCustomers = currentCustomers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate dynamic metrics
  const totalCustomers = currentCustomers.length;
  const repeatCustomers = currentCustomers.filter(c => c.ordersCount >= 2).length;
  const completedOrdersCount = currentCustomers.reduce((sum, c) => sum + (c.completedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Customers
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Open a customer to see their order history, saved measurements, and studio interactions.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCustomers}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Registered customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{totalCustomers}</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Live customer accounts in platform</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Repeat customers</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Heart className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{repeatCustomers}</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Two or more customer orders</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Completed orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{completedOrdersCount}</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Across every studio</span>
        </div>
      </div>

      {/* Customer Directory Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Card Header & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Customer directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Measurements remain private to authorized customer-studio relationships.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or email..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 mb-3 mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No customers found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try clearing your search query.' : 'New registered customer accounts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">CUSTOMER</th>
                  <th className="py-3.5 px-6">ORDERS</th>
                  <th className="py-3.5 px-6">STUDIOS VISITED</th>
                  <th className="py-3.5 px-6">PAID ORDER VALUE</th>
                  <th className="py-3.5 px-6">ACTIVE ORDERS</th>
                  <th className="py-3.5 px-6 text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${c.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                          {c.initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                            {c.name}
                          </span>
                          <span className="text-[11.5px] text-slate-400 block mt-0.5">
                            {c.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.ordersCount}
                    </td>

                    {/* Studios Visited */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.studiosVisited}
                    </td>

                    {/* Paid Order Value */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {c.paidValue}
                    </td>

                    {/* Active Orders */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.activeOrders}
                    </td>

                    {/* Details Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800 transition cursor-pointer text-xs shadow-2xs"
                      >
                        View customer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Account Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onViewOrder={(order) => {
            setSelectedOrderToView({
              ...order,
              customer: selectedCustomer.name,
              customerName: selectedCustomer.name,
              customerEmail: selectedCustomer.email,
              customerPhone: selectedCustomer.phone || (order && order.customerPhone) || ''
            });
          }}
        />
      )}

      {/* Cross-studio Order Detail Modal opened from Customer Orders */}
      {selectedOrderToView && (
        <OrderDetailModal
          order={selectedOrderToView}
          onClose={() => setSelectedOrderToView(null)}
          onReviewStudio={handleReviewStudioFromOrder}
        />
      )}

      {/* Studio Review Modal opened from Order View / Review Studio */}
      {activeReviewStudio && (
        <StudioReviewModal
          studio={activeReviewStudio}
          onClose={() => setActiveReviewStudio(null)}
          onApprove={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Approved');
            } catch (err) {
              console.warn('Failed to approve studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSuspend={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Suspended');
            } catch (err) {
              console.warn('Failed to suspend studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onGrantWaiver={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Approved');
            } catch (err) {
              console.warn('Failed to grant waiver:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSaveDetails={async (id, updates) => {
            try {
              await adminDataService.updateStudio(id, updates);
            } catch (err) {
              console.warn('Failed to update studio details:', err);
            }
            setActiveReviewStudio(null);
          }}
        />
      )}
    </div>
  );
}
