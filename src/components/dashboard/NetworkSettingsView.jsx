import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { adminDataService } from '../../services/adminDataService';

export default function NetworkSettingsView() {
  const [membershipFee, setMembershipFee] = useState('');
  const [discoveryRadius, setDiscoveryRadius] = useState('');
  const [studioSpacing, setStudioSpacing] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Network settings saved successfully.');
  const [saveError, setSaveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await adminDataService.getSettings();
        if (mounted && settings) {
          if (settings.membershipFee !== undefined) setMembershipFee(String(settings.membershipFee));
          if (settings.discoveryRadius !== undefined) setDiscoveryRadius(String(settings.discoveryRadius));
          if (settings.studioSpacing !== undefined) setStudioSpacing(String(settings.studioSpacing));
          if (settings.supportEmail !== undefined) setSupportEmail(String(settings.supportEmail));
        }
      } catch (err) {
        console.warn('Failed to load network settings:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = {
        membershipFee: String(membershipFee),
        discoveryRadius: String(discoveryRadius),
        studioSpacing: String(studioSpacing),
        supportEmail: String(supportEmail)
      };
      try {
        localStorage.setItem('alteration_network_settings', JSON.stringify(payload));
        localStorage.setItem('alteration_admin_network_settings', JSON.stringify(payload));
      } catch (e) {}

      const updated = await adminDataService.updateSettings(payload);
      window.dispatchEvent(new CustomEvent('admin_settings_updated', { detail: updated || payload }));
      setSaveMessage(updated?._offlineSaved ? 'Network settings saved locally in your browser.' : 'Network settings saved successfully.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveError(err.message || 'Failed to save network settings');
    } finally {
      setIsSaving(false);
    }
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
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>{saveMessage}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Card or Loading State */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 sm:p-14 shadow-2xs flex flex-col items-center justify-center min-h-[380px] text-center space-y-4 animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Loading network settings...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Fetching current studio spacing, discovery radius, and membership rules from database.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-200">
        
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
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900 disabled:bg-slate-50"
            />
          </div>

          {/* Default discovery radius (km) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800 block">
                Default discovery radius (km)
              </label>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                Website & Map Limit
              </span>
            </div>
            <input
              type="number"
              value={discoveryRadius}
              onChange={(e) => setDiscoveryRadius(e.target.value)}
              required
              disabled={isSaving}
              placeholder="e.g. 15, 25, 50"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900 disabled:bg-slate-50"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Studios will only be visible on the website (home, search) and live map if they are within this distance of the customer's current location.
            </p>
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
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900 disabled:bg-slate-50"
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
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs text-slate-900 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Notice Card */}
        <div className="p-4 rounded-xl bg-[#F6F8F7] border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-1">
          <p>
            • <strong>Customer Discovery Limit:</strong> Studios will only appear on the customer website and map if they are within <strong>{discoveryRadius || 15} km</strong> of the user's current location.
          </p>
          <p>
            • <strong>Studio Spacing:</strong> The <strong>{studioSpacing || 5}-mile</strong> studio spacing rule is active across the network. Membership price changes apply to <strong className="text-slate-800">new studio applications only</strong>. Every listing still needs admin approval.
          </p>
        </div>

        {/* Action Button matching Image 19 */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#2361E9] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 stroke-[2.2] animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save network settings</span>
                <Check className="w-4 h-4 stroke-[2.2]" />
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
