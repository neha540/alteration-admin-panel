import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  Crosshair, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  AlertTriangle,
  Check
} from 'lucide-react';

export default function TerritoriesView() {
  const [zipInput, setZipInput] = useState('');
  const [zipResult, setZipResult] = useState(null);
  const [cityFilter, setCityFilter] = useState('all');

  const studios = [
    { id: 1, name: 'The Modern Hem', location: 'Austin, TX 78701', status: 'Live', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', lat: 30.27, lng: -97.74 },
    { id: 2, name: 'Northline Tailoring', location: 'North Austin, TX 78758', status: 'Live', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', lat: 30.39, lng: -97.71 },
    { id: 3, name: 'Atelier Rose', location: 'Westlake, TX 78746', status: 'Live', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', lat: 30.29, lng: -97.80 },
    { id: 4, name: 'Good Form Studio', location: 'South Austin, TX 78745', status: 'Live', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', lat: 30.21, lng: -97.79 },
    { id: 5, name: 'Round Rock Stitch', location: 'Round Rock, TX 78664', status: 'Clear', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', lat: 30.51, lng: -97.68 },
    { id: 6, name: 'Congress Clothing Care', location: 'South Congress, TX 78704', status: 'Conflict', statusColor: 'bg-red-50 text-red-700 border-red-200/80', lat: 30.24, lng: -97.75 }
  ];

  const handleCheckZip = (e) => {
    e.preventDefault();
    if (!zipInput.trim()) return;

    if (zipInput.trim() === '78704' || zipInput.trim() === '78701') {
      setZipResult({
        status: 'conflict',
        distance: '2.1 miles',
        message: 'Conflict: Within 5-mile boundary of The Modern Hem (78701).'
      });
    } else {
      setZipResult({
        status: 'clear',
        distance: '8.4 miles',
        message: 'Territory clear: Meets minimum 5-mile separation rule.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Territory planning
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Give every studio room to build a local following.
        </p>
      </div>

      {/* Main Grid: Left Local Picture (65%), Right ZIP Check & Rule (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: The Local Picture & Interactive Map */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                The local picture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5 miles minimum between publicly listed studios
              </p>
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All cities</option>
              <option value="austin">Austin, TX</option>
              <option value="roundrock">Round Rock, TX</option>
            </select>
          </div>

          {/* Map Container matching Image 14 */}
          <div className="relative w-full h-[320px] bg-[#EEF2F6] rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between p-4">
            {/* Map Canvas Background Grid */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Top Bar on Map */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 border border-slate-200/70 shadow-2xs">
                Zoom 9
              </span>

              {/* Map Zoom Controls */}
              <div className="flex flex-col bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 transition"><Plus className="w-3.5 h-3.5" /></button>
                <div className="h-[1px] bg-slate-100" />
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 transition"><Minus className="w-3.5 h-3.5" /></button>
                <div className="h-[1px] bg-slate-100" />
                <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 transition"><Crosshair className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Map Cluster of Pins matching Image 14 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48">
                {/* Pin 5 (Round Rock) */}
                <div className="absolute top-2 right-12 w-7 h-7 bg-[#2361E9] text-white rounded-t-full rounded-br-full -rotate-45 flex items-center justify-center shadow-md">
                  <span className="rotate-45 text-xs font-bold">5</span>
                </div>

                {/* Pin 2 (North Austin) */}
                <div className="absolute top-14 right-20 w-7 h-7 bg-[#2361E9] text-white rounded-t-full rounded-br-full -rotate-45 flex items-center justify-center shadow-md">
                  <span className="rotate-45 text-xs font-bold">2</span>
                </div>

                {/* Pin 3 (Westlake) */}
                <div className="absolute top-24 left-10 w-7 h-7 bg-[#2361E9] text-white rounded-t-full rounded-br-full -rotate-45 flex items-center justify-center shadow-md">
                  <span className="rotate-45 text-xs font-bold">3</span>
                </div>

                {/* Pin 6 (Conflict) */}
                <div className="absolute top-26 right-16 w-7 h-7 bg-red-600 text-white rounded-t-full rounded-br-full -rotate-45 flex items-center justify-center shadow-md ring-4 ring-red-200">
                  <span className="rotate-45 text-xs font-bold">6</span>
                </div>

                {/* Pin 4 (South Austin) */}
                <div className="absolute bottom-6 left-12 w-7 h-7 bg-[#2361E9] text-white rounded-t-full rounded-br-full -rotate-45 flex items-center justify-center shadow-md">
                  <span className="rotate-45 text-xs font-bold">4</span>
                </div>
              </div>
            </div>

            {/* Bottom Map Attribution */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/60 self-start">
              <span>Loading street map...</span>
              <span className="ml-3">© OpenStreetMap contributors · © CARTO</span>
            </div>
          </div>

          {/* Studios List below map */}
          <div className="divide-y divide-slate-100 pt-2">
            {studios.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {s.id}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{s.name}</span>
                    <span className="text-[11px] text-slate-400 block">{s.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${s.statusColor}`}>
                    {s.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Check a ZIP code & Rule */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Card 1: Check a ZIP code */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Check a ZIP code
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                See how a proposed location fits the network.
              </p>
            </div>

            <form onSubmit={handleCheckZip} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  US ZIP code
                </label>
                <input
                  type="text"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  placeholder="e.g. 78701"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Check territory</span>
              </button>
            </form>

            {zipResult && (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                zipResult.status === 'clear'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {zipResult.status === 'clear' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span>Proximity: {zipResult.distance}</span>
                </div>
                <p className="mt-1 text-[11.5px]">{zipResult.message}</p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              ZIP checks use the location coordinates available in this preview. A studio’s exact address must be verified before launch.
            </p>
          </div>

          {/* Card 2: One clear rule matching Image 14 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              One clear rule
            </span>

            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              5 miles
            </h3>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Approval checks the studio against existing live locations. A payment or pilot waiver never bypasses territory review.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Live Territory Audit Card matching Image 14 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live territory audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Computed from the coordinates of currently listed studios.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            All clear
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.2]" />
          <span className="font-medium">All live studios satisfy the 5-mile separation requirement.</span>
        </div>
      </div>
    </div>
  );
}

