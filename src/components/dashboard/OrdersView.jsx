import React, { useState } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';

export default function OrdersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [studioFilter, setStudioFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const ordersData = [
    {
      id: 'AC-1043',
      title: 'Jacket sleeve shortening',
      customer: 'Jordan Kim',
      studio: 'The Modern Hem',
      status: 'New request',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      amount: 'Pending',
      subStatus: ''
    },
    {
      id: 'AC-1042',
      title: 'Trouser hem & waist adjustment',
      customer: 'Alexandra Morgan',
      studio: 'The Modern Hem',
      status: 'Quote sent',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      amount: '$88',
      subStatus: ''
    },
    {
      id: 'AC-1040',
      title: 'Suit fitting',
      customer: 'Casey Wilson',
      studio: 'Northline Tailoring',
      status: 'Paid',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      amount: '$85',
      subStatus: ''
    },
    {
      id: 'AC-1041',
      title: 'Denim hemming',
      customer: 'Alexandra Morgan',
      studio: 'The Modern Hem',
      status: 'In progress',
      statusColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
      amount: '$36',
      subStatus: ''
    },
    {
      id: 'AC-1038',
      title: 'Silk dress adjustment',
      customer: 'Alexandra Morgan',
      studio: 'Atelier Rose',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      amount: '$96',
      subStatus: 'Collected'
    }
  ];

  const filteredOrders = ordersData.filter((o) => {
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

      {/* Top 3 Metric Cards matching Image 13 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total orders</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">5</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Active orders</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">4</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Completed</span>
          <span className="text-3xl font-bold text-slate-900 block mt-2">1</span>
        </div>
      </div>

      {/* Filters Bar matching Image 13 */}
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
            <option value="The Modern Hem">The Modern Hem</option>
            <option value="Northline Tailoring">Northline Tailoring</option>
            <option value="Atelier Rose">Atelier Rose</option>
          </select>

          <button
            type="button"
            className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Orders Table Card matching Image 13 */}
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
              {filteredOrders.map((order) => (
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
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {order.studio}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${order.statusColor}`}>
                        {order.status}
                      </span>
                      {order.subStatus && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {order.subStatus}
                        </span>
                      )}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer note matching Image 13 */}
        <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
          <span>5 orders · Measurement values are private to the customer and assigned studio.</span>
        </div>
      </div>

      {/* Cross-studio Order Detail Modal matching Image 25 */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onReviewStudio={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

