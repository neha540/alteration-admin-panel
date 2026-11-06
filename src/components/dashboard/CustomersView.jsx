import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Search, Users, Heart, CheckCircle2 } from 'lucide-react';
import CustomerDetailsModal from './CustomerDetailsModal';

export default function CustomersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [liveCustomers, setLiveCustomers] = useState(null);

  useEffect(() => {
    adminDataService.getCustomers().then(data => {
      if (data && data.length > 0) {
        setLiveCustomers(data);
      }
    }).catch(() => {});
  }, []);

  const customersData = [
    {
      id: 1,
      name: 'Alexandra Morgan',
      email: 'alexandra@example.com',
      initials: 'AM',
      avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
      orders: 3,
      studiosVisited: 2,
      paidValue: '$132',
      activeOrders: 2
    },
    {
      id: 2,
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      initials: 'JK',
      avatarBg: 'bg-slate-100 text-slate-700',
      orders: 1,
      studiosVisited: 1,
      paidValue: '$0',
      activeOrders: 1
    },
    {
      id: 3,
      name: 'Casey Wilson',
      email: 'casey@example.com',
      initials: 'CW',
      avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
      orders: 1,
      studiosVisited: 1,
      paidValue: '$85',
      activeOrders: 1
    }
  ];

  const currentCustomers = liveCustomers ? liveCustomers.map(u => ({
    id: u.id,
    name: u.fullName || u.name,
    email: u.email,
    initials: u.initials || 'CU',
    avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
    orders: u.ordersCount || 1,
    studiosVisited: 1,
    paidValue: u.paidValue || '$68',
    activeOrders: 1
  })) : customersData;

  const filteredCustomers = currentCustomers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Customers
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Open a customer to see their order history.
        </p>
      </div>

      {/* Top 3 Metric Cards matching Image 16 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Registered customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">3</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Customers represented in this preview</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Repeat customers</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Heart className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">1</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Two or more customer orders</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Completed orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">1</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Across every studio</span>
        </div>
      </div>

      {/* Customer Directory Table Card matching Image 16 */}
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

        {/* Table */}
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
                    {c.orders}
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
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-800 transition cursor-pointer text-xs"
                    >
                      View customer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Account Details Modal matching Image 24 */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onViewOrder={(order) => {
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

