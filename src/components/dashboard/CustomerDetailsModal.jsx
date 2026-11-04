import React from 'react';
import { ArrowLeft, X, Lock } from 'lucide-react';

export default function CustomerDetailsModal({ 
  customer, 
  onClose, 
  onViewOrder 
}) {
  const currentCustomer = customer || {
    name: 'Alexandra Morgan',
    email: 'alexandra@example.com',
    initials: 'AM',
    avatarBg: 'bg-[#F5EFE6] text-[#78593C]',
    ordersCount: 3,
    paidValue: '$132',
    completedCount: 1
  };

  const customerOrders = [
    {
      id: 'AC-1042',
      title: 'Trouser hem & waist adjustment',
      studio: 'The Modern Hem',
      status: 'Quote sent',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200/80'
    },
    {
      id: 'AC-1041',
      title: 'Denim hemming',
      studio: 'The Modern Hem',
      status: 'In progress',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200/80'
    },
    {
      id: 'AC-1038',
      title: 'Silk dress adjustment',
      studio: 'Atelier Rose',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto select-none font-['Arial',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar matching Image 24 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Customer details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer Profile Header */}
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-full ${currentCustomer.avatarBg} font-bold text-sm flex items-center justify-center shrink-0`}>
              {currentCustomer.initials}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                {currentCustomer.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCustomer.email}
              </p>
            </div>
          </div>

          {/* 3 Metric Cards Row matching Image 24 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs grid grid-cols-3 divide-x divide-slate-100">
            <div className="pr-4">
              <span className="text-2xl font-bold text-slate-900 block">
                {currentCustomer.ordersCount || 3}
              </span>
              <span className="text-[11.5px] text-slate-500 block mt-1">
                Orders
              </span>
            </div>

            <div className="px-4">
              <span className="text-2xl font-bold text-slate-900 block">
                {currentCustomer.paidValue || '$132'}
              </span>
              <span className="text-[11.5px] text-slate-500 block mt-1">
                Paid order value
              </span>
            </div>

            <div className="pl-4">
              <span className="text-2xl font-bold text-slate-900 block">
                {currentCustomer.completedCount || 1}
              </span>
              <span className="text-[11.5px] text-slate-500 block mt-1">
                Completed
              </span>
            </div>
          </div>

          {/* Privacy Notice Banner matching Image 24 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Personal measurements are available only in the customer's authorized studio relationship.</span>
          </div>

          {/* Customer Orders List matching Image 24 */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Customer orders
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
              {customerOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                  <div>
                    <span className="font-bold text-xs sm:text-[13px] text-slate-900 block">
                      {order.title}
                    </span>
                    <span className="text-[11.5px] text-slate-400 block mt-0.5">
                      {order.studio} · {order.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${order.statusColor}`}>
                      {order.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onViewOrder) onViewOrder(order);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

