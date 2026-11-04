import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function NetworkSettingsView() {
  const [membershipFee, setMembershipFee] = useState('200');
  const [discoveryRadius, setDiscoveryRadius] = useState('15');
  const [studioSpacing, setStudioSpacing] = useState('5');
  const [supportEmail, setSupportEmail] = useState('support@alterationconnect.example');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Network settings
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Shared defaults for new studio applications and customer discovery.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>Network settings saved successfully.</span>
        </div>
      )}

      {/* Form Card matching Image 19 */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        
        {/* Form Grid 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default monthly studio membership ($) */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              Default monthly studio membership ($)
            </label>
            <input
              type="number"
              value={membershipFee}
              onChange={(e) => setMembershipFee(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900"
            />
          </div>

          {/* Default discovery radius (miles) */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              Default discovery radius (miles)
            </label>
            <input
              type="number"
              value={discoveryRadius}
              onChange={(e) => setDiscoveryRadius(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900"
            />
          </div>

          {/* Minimum studio spacing (miles) */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              Minimum studio spacing (miles)
            </label>
            <input
              type="number"
              value={studioSpacing}
              onChange={(e) => setStudioSpacing(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900"
            />
          </div>

          {/* Support email */}
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-2">
              Support email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900"
            />
          </div>
        </div>

        {/* Notice Card matching Image 19 */}
        <div className="p-4 rounded-xl bg-[#F6F8F7] border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
          The five-mile spacing rule is fixed for this demo. Membership price changes apply to <strong className="text-slate-800">new studio applications only</strong>; existing studio plans, quotes, and payments are not changed. Every listing still needs admin approval.
        </div>

        {/* Action Button matching Image 19 */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Save network settings</span>
            <Check className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </form>
    </div>
  );
}
