import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export const COUNTRIES = [
  { name: 'United States', code: '+1', iso: 'us', format: '(555) 000-0000' },
  { name: 'Canada', code: '+1', iso: 'ca', format: '(555) 000-0000' },
  { name: 'India', code: '+91', iso: 'in', format: '98765 43210' },
  { name: 'United Kingdom', code: '+44', iso: 'gb', format: '7911 123456' },
  { name: 'Australia', code: '+61', iso: 'au', format: '412 345 678' },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae', format: '50 123 4567' },
  { name: 'Saudi Arabia', code: '+966', iso: 'sa', format: '50 123 4567' },
  { name: 'Germany', code: '+49', iso: 'de', format: '151 1234567' },
  { name: 'France', code: '+33', iso: 'fr', format: '6 12 34 56 78' },
  { name: 'Singapore', code: '+65', iso: 'sg', format: '8123 4567' },
  { name: 'Italy', code: '+39', iso: 'it', format: '312 345 6789' },
  { name: 'Spain', code: '+34', iso: 'es', format: '612 34 56 78' },
  { name: 'Netherlands', code: '+31', iso: 'nl', format: '6 12345678' },
  { name: 'Switzerland', code: '+41', iso: 'ch', format: '78 123 45 67' },
  { name: 'Sweden', code: '+46', iso: 'se', format: '70 123 45 67' },
  { name: 'Norway', code: '+47', iso: 'no', format: '412 34 567' },
  { name: 'Denmark', code: '+45', iso: 'dk', format: '20 12 34 56' },
  { name: 'Ireland', code: '+353', iso: 'ie', format: '85 123 4567' },
  { name: 'New Zealand', code: '+64', iso: 'nz', format: '21 123 456' },
  { name: 'Japan', code: '+81', iso: 'jp', format: '90 1234 5678' },
  { name: 'South Korea', code: '+82', iso: 'kr', format: '10 1234 5678' },
  { name: 'China', code: '+86', iso: 'cn', format: '138 0013 8000' },
  { name: 'Malaysia', code: '+60', iso: 'my', format: '12 345 6789' },
  { name: 'Indonesia', code: '+62', iso: 'id', format: '812 3456 7890' },
  { name: 'Philippines', code: '+63', iso: 'ph', format: '917 123 4567' },
  { name: 'Thailand', code: '+66', iso: 'th', format: '81 234 5678' },
  { name: 'Vietnam', code: '+84', iso: 'vn', format: '91 234 5678' },
  { name: 'South Africa', code: '+27', iso: 'za', format: '71 123 4567' },
  { name: 'Brazil', code: '+55', iso: 'br', format: '11 91234-5678' },
  { name: 'Mexico', code: '+52', iso: 'mx', format: '55 1234 5678' },
  { name: 'Pakistan', code: '+92', iso: 'pk', format: '300 1234567' },
  { name: 'Bangladesh', code: '+880', iso: 'bd', format: '1712 345678' },
  { name: 'Nepal', code: '+977', iso: 'np', format: '984 1234567' },
  { name: 'Sri Lanka', code: '+94', iso: 'lk', format: '71 234 5678' }
];

export default function CountryPhoneInput({
  phone = '',
  countryCode = '+1',
  countryIso = 'us',
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find active country or fallback to first
  const activeCountry = useMemo(() => {
    return COUNTRIES.find(c => c.iso.toLowerCase() === (countryIso || '').toLowerCase()) ||
           COUNTRIES.find(c => c.code === countryCode) ||
           COUNTRIES[0];
  }, [countryIso, countryCode]);

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle phone input changes & paste
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.trim().startsWith('+')) {
      const trimmed = val.trim();
      const matched = COUNTRIES.find(c => trimmed.startsWith(c.code));
      if (matched) {
        const rest = trimmed.slice(matched.code.length).trim().replace(/[^0-9\s-]/g, '');
        onChange?.({
          phone: rest,
          countryCode: matched.code,
          countryIso: matched.iso
        });
        return;
      }
    }
    const clean = val.replace(/[^0-9\s-]/g, '');
    onChange?.({
      phone: clean,
      countryCode: activeCountry.code,
      countryIso: activeCountry.iso
    });
  };

  const handleSelectCountry = (country) => {
    onChange?.({
      phone,
      countryCode: country.code,
      countryIso: country.iso
    });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex rounded-lg border border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden bg-white transition shadow-2xs">
        {/* Country Picker Trigger Button with Flag */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 transition cursor-pointer shrink-0 select-none text-slate-700 outline-none"
          title={`Select country (Current: ${activeCountry.name} ${activeCountry.code})`}
        >
          {/* Flag Image */}
          <span className="w-5 h-3.5 relative flex items-center justify-center shrink-0 rounded-[2px] overflow-hidden border border-slate-300/80 bg-slate-100 shadow-2xs">
            <img
              src={`https://flagcdn.com/w40/${activeCountry.iso}.png`}
              srcSet={`https://flagcdn.com/w80/${activeCountry.iso}.png 2x`}
              alt={activeCountry.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">
            {activeCountry.code}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Phone Input Field */}
        <input
          type="tel"
          required={required}
          disabled={disabled}
          value={phone}
          onChange={handleInputChange}
          placeholder={placeholder || activeCountry.format || 'Phone number'}
          className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Country Dropdown Flyout */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search box inside dropdown */}
          <div className="px-2.5 pb-2 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.iso === activeCountry.iso;
                return (
                  <button
                    key={`${c.iso}-${c.code}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer hover:bg-blue-50/60 ${
                      isSelected ? 'bg-blue-50/90 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {/* Flag */}
                    <span className="w-5 h-3.5 relative shrink-0 rounded-[2px] overflow-hidden border border-slate-300/80 bg-slate-100 shadow-2xs">
                      <img
                        src={`https://flagcdn.com/w40/${c.iso}.png`}
                        srcSet={`https://flagcdn.com/w80/${c.iso}.png 2x`}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    {/* Name */}
                    <span className="text-xs flex-1 truncate">{c.name}</span>
                    {/* Dial code */}
                    <span className="text-xs font-mono text-slate-400 font-medium shrink-0">
                      {c.code}
                    </span>
                    {/* Check if selected */}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No countries found for "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
