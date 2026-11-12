import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Download, ChevronDown, PackageOpen } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import StudioReviewModal from './StudioReviewModal';
import CustomerDetailsModal from './CustomerDetailsModal';

export default function OrdersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [studioFilter, setStudioFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [activeReviewStudio, setActiveReviewStudio] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [allStudios, setAllStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = () => {
    adminDataService.getOrders()
      .then(data => {
        setLiveOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    adminDataService.getStudios()
      .then(sData => {
        if (Array.isArray(sData)) setAllStudios(sData);
      })
      .catch(() => {});
  };

  const handleReviewStudioFromOrder = async (order) => {
    const studioName = order?.studio || order?.raw?.studioName || '';
    const studioId = order?.raw?.studioId || order?.studioId || '';

    let target = allStudios.find(s => 
      (studioId && s.id === studioId) || 
      (studioName && s.name && s.name.toLowerCase() === studioName.toLowerCase())
    );

    if (!target) {
      try {
        const fresh = await adminDataService.getStudios();
        if (Array.isArray(fresh)) {
          setAllStudios(fresh);
          target = fresh.find(s => 
            (studioId && s.id === studioId) || 
            (studioName && s.name && s.name.toLowerCase() === studioName.toLowerCase())
          );
        }
      } catch {}
    }

    if (!target) {
      target = {
        id: studioId || 'std_' + Date.now(),
        name: studioName || 'Alteration Studio',
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

    setSelectedOrder(null);
    setActiveReviewStudio(target);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    const handleUpdate = () => fetchOrders();
    window.addEventListener('admin_orders_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin_orders_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, studioFilter, searchQuery]);

  const currentOrders = (liveOrders || []).map(o => {
    const rawStatus = o.status || 'Quote requested';
    const displayStatus = 
      rawStatus === 'Quote requested' ? 'New request' :
      rawStatus === 'Quote ready' ? 'Quote sent' :
      rawStatus;

    const statusColor = 
      (rawStatus === 'Completed' || rawStatus === 'Paid') ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
      rawStatus === 'In progress' ? 'bg-sky-50 text-sky-700 border-sky-200/80' :
      (rawStatus === 'Quote ready' || rawStatus === 'Quote sent') ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
      'bg-amber-50 text-amber-700 border-amber-200/80';

    return {
      id: o.id || 'AC-1000',
      title: o.title || (o.garment && o.alterationType ? `${o.garment} - ${o.alterationType}` : (o.garment || 'Garment Alteration Request')),
      customer: o.customerName || 'Customer',
      customerEmail: o.customerEmail || '',
      customerPhone: o.customerPhone || '',
      studio: o.studioName || 'The Modern Hem',
      status: rawStatus,
      displayStatus: displayStatus,
      statusColor: statusColor,
      amount: o.price ? ('$' + o.price) : 'Pending',
      subStatus: o.isPaid ? 'Paid' : (o.fittingDate ? `Fitting: ${o.fittingDate}` : ''),
      raw: {
        ...o,
        amount: o.price ? ('$' + o.price) : 'Pending quote',
        total: o.price ? ('$' + o.price) : 'Pending quote',
        requestNote: o.description || o.notes || 'Garment alteration quote requested.',
        measurementNote: o.customerPhone ? `Contact: ${o.customerPhone} • Email: ${o.customerEmail || 'N/A'}` : 'No phone provided.',
        service: o.title || (o.garment && o.alterationType ? `${o.garment} - ${o.alterationType}` : 'Garment Alteration'),
        qty: 1
      }
    };
  });

  // Dynamic Metrics
  const totalOrdersCount = currentOrders.length;
  const activeOrdersCount = currentOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const completedOrdersCount = currentOrders.filter(o => o.status === 'Completed').length;

  // Dynamic Studio Filter Options
  const availableStudios = Array.from(new Set(currentOrders.map(o => o.studio).filter(Boolean)));

  const filteredOrders = currentOrders.filter((o) => {
    if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (studioFilter !== 'all' && o.studio !== studioFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.studio.toLowerCase().includes(q)
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
            All orders
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            A network-wide view of requests, payments, and fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Orders exported as CSV.")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 stroke-[2]" />
          <span>Export orders</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total orders</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{totalOrdersCount}</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Active orders</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{activeOrdersCount}</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Completed</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{completedOrdersCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Order, customer, or studio"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="new request">New request</option>
            <option value="quote requested">Quote requested</option>
            <option value="quote ready">Quote ready</option>
            <option value="quote sent">Quote sent</option>
            <option value="paid">Paid</option>
            <option value="in progress">In progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={studioFilter}
            onChange={(e) => setStudioFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
          >
            <option value="all">All studios</option>
            {availableStudios.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <button
            type="button"
            className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">ORDER &amp; CUSTOMER</th>
                <th className="py-3.5 px-6">STUDIO</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
                        <PackageOpen className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No orders found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {loading 
                          ? 'Checking for network orders...' 
                          : searchQuery || statusFilter !== 'all' || studioFilter !== 'all'
                            ? 'No orders match your filter criteria. Try resetting filters.'
                            : 'When a customer requests a quote or books an alteration on the web store, it will appear here in real time.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    {/* Order & Customer */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                        {order.title}
                      </span>
                      <span className="text-[11.5px] text-slate-400 block mt-0.5">
                        {order.customer} · {order.id}
                      </span>
                    </td>

                    {/* Studio */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleReviewStudioFromOrder(order)}
                        title={`Review ${order.studio} details`}
                        className="text-left font-medium text-slate-700 hover:text-blue-600 transition cursor-pointer underline-offset-2 hover:underline"
                      >
                        {order.studio}
                      </button>
                    </td>

                    {/* Status matching Figma Screen 18 */}
                    <td className="py-4 px-6">
                      <div className="inline-flex flex-col items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${order.statusColor}`}>
                          {order.displayStatus}
                        </span>
                        {order.status === 'Completed' ? (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Collected
                          </span>
                        ) : order.subStatus ? (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {order.subStatus}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {order.amount}
                    </td>

                    {/* Details Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800 transition cursor-pointer text-xs"
                      >
                        View order
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer with Pagination */}
        <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} · Measurement values are private to the customer and assigned studio.</span>
          {filteredOrders.length > itemsPerPage && (
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
                {currentPage} / {Math.ceil(filteredOrders.length / itemsPerPage)}
              </span>
              <button
                type="button"
                disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / itemsPerPage), p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cross-studio Order Detail Modal matching Image 25 */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onReviewStudio={handleReviewStudioFromOrder}
          onViewCustomer={(ord) => {
            const customerOrders = liveOrders
              .filter(o => o.customerEmail && ord.customerEmail && o.customerEmail.toLowerCase() === ord.customerEmail.toLowerCase())
              .map(o => ({
                id: o.id,
                title: o.title || 'Alteration service',
                studio: o.studio || 'Specialist Studio',
                amount: o.amount || '$0',
                status: o.status,
                statusColor: o.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-blue-50 text-blue-700 border-blue-200/80'
              }));

            setSelectedCustomerModal({
              name: ord.customer || ord.customerName || 'Customer',
              email: ord.customerEmail || '',
              initials: (ord.customer || ord.customerName || 'CU').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
              avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
              ordersCount: customerOrders.length || 1,
              paidValue: ord.amount || '$0',
              completedCount: customerOrders.filter(o => o.status === 'Completed').length,
              customerOrders: customerOrders
            });
          }}
          onUpdateStatus={async (id, newStatus) => {
            try {
              await adminDataService.updateOrderStatus(id, newStatus);
              fetchOrders();
            } catch (err) {
              console.warn('Failed to update order status:', err);
            }
          }}
        />
      )}

      {/* Customer Account Details Modal opened from Order View */}
      {selectedCustomerModal && (
        <CustomerDetailsModal
          customer={selectedCustomerModal}
          onClose={() => setSelectedCustomerModal(null)}
          onViewOrder={(ord) => {
            setSelectedCustomerModal(null);
            const found = liveOrders.find(o => o.id === ord.id);
            if (found) setSelectedOrder(found);
          }}
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
              fetchOrders();
            } catch (err) {
              console.warn('Failed to approve studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSuspend={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Suspended');
              fetchOrders();
            } catch (err) {
              console.warn('Failed to suspend studio:', err);
            }
            setActiveReviewStudio(null);
          }}
          onGrantWaiver={async (id) => {
            try {
              await adminDataService.updateStudioStatus(id, 'Approved');
              fetchOrders();
            } catch (err) {
              console.warn('Failed to grant waiver:', err);
            }
            setActiveReviewStudio(null);
          }}
          onSaveDetails={async (id, updates) => {
            try {
              await adminDataService.updateStudio(id, updates);
              fetchOrders();
            } catch (err) {
              console.warn('Failed to update studio details:', err);
            }
          }}
        />
      )}
    </div>
  );
}
