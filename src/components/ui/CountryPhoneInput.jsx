import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, AlertCircle } from 'lucide-react';
import {
  COUNTRY_DIAL_CODES,
  getRequiredPhoneLength,
  getCountryByDialCode,
  cleanNumericPhone
} from '../../data/countryCodes.js';

/**
 * CountryPhoneInput
 * Enforces numerical-only input with dynamic character limit based on selected country dial code.
 */
const CountryPhoneInput = ({
  phone = '',
  setPhone,
  countryCode = '+91',
  setCountryCode,
  label = 'Your Contact Phone',
  required = true,
  error = '',
  setError,
  placeholder,
  id = 'country-phone-input',
  disabled = false,
  showCounter = true,
  theme = 'gold', // 'gold' | 'emerald' | 'blue'
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCountry = getCountryByDialCode(countryCode);
  const maxDigits = getRequiredPhoneLength(countryCode);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filter countries by search term
  const filteredCountries = COUNTRY_DIAL_CODES.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.country.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  // Handle Country Selection
  const handleCountrySelect = (code) => {
    if (setCountryCode) setCountryCode(code);
    const newMax = getRequiredPhoneLength(code);
    // If current phone exceeds new country limit, truncate it
    if (phone && phone.length > newMax) {
      const truncated = phone.slice(0, newMax);
      setPhone(truncated);
      if (setError) {
        setError('');
      }
    } else if (setError && phone && phone.length < newMax) {
      setError(`Must be exactly ${newMax} digits for ${code} (${phone.length}/${newMax})`);
    } else if (setError) {
      setError('');
    }
    setIsOpen(false);
    setSearch('');
    if (inputRef.current) inputRef.current.focus();
  };

  // Block non-numerical keys (e.g. alphabets, symbols, spaces)
  const handleKeyDown = (e) => {
    // Allowed control keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    // Allowed shortcuts: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Cmd+A, etc.
    if (
      allowedKeys.includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    // Only allow 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle strictly numerical text change
  const handleChange = (e) => {
    const rawValue = e.target.value;
    // Strip everything except numerical digits (0-9)
    const numericOnly = cleanNumericPhone(rawValue, maxDigits);

    setPhone(numericOnly);

    if (setError) {
      if (!numericOnly && required) {
        setError('Phone number is required *');
      } else if (numericOnly.length < maxDigits) {
        setError(`Must be exactly ${maxDigits} digits for ${countryCode} (${numericOnly.length}/${maxDigits})`);
      } else {
        setError('');
      }
    }
  };

  // Handle Paste event: sanitize to numbers only & clamp to maxDigits
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteText = (e.clipboardData || window.clipboardData).getData('text') || '';
    const cleaned = cleanNumericPhone(pasteText, maxDigits);
    setPhone(cleaned);
    if (setError) {
      if (cleaned.length < maxDigits) {
        setError(`Must be exactly ${maxDigits} digits for ${countryCode} (${cleaned.length}/${maxDigits})`);
      } else {
        setError('');
      }
    }
  };

  const isComplete = phone && phone.length === maxDigits;
  const isPartiallyFilled = phone && phone.length > 0 && phone.length < maxDigits;

  // Theme borders & focus ring
  const borderFocusClasses =
    theme === 'emerald'
      ? 'focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
      : theme === 'blue'
      ? 'focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
      : 'focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-amber-200';

  const defaultPlaceholder = `e.g. ${maxDigits === 10 ? '9876543210' : maxDigits === 9 ? '501234567' : '91234567'}`;

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      {/* Label and Character Counter Header */}
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="font-bold text-slate-700 block text-xs">
            {label} {required && <span className="text-amber-600">*</span>}
          </label>
        )}

        {showCounter && (
          <div className="flex items-center gap-1.5 text-[10px]">
            {isComplete ? (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Check size={11} className="stroke-[3]" /> {maxDigits}/{maxDigits} digits
              </span>
            ) : (
              <span
                className={`font-semibold px-1.5 py-0.5 rounded ${
                  isPartiallyFilled ? 'text-amber-700 bg-amber-50' : 'text-slate-400 bg-slate-100'
                }`}
              >
                {phone.length}/{maxDigits} digits ({selectedCountry.country})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Input Group: Country Picker Prefix + Numerical Phone Input */}
      <div
        className={`relative flex items-center bg-white border ${
          error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
        } rounded-xl shadow-sm transition-all overflow-visible ${borderFocusClasses}`}
      >
        {/* Country Picker Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-l-xl border-r border-slate-200 flex items-center gap-1.5 cursor-pointer transition select-none shrink-0"
          title={`Selected: ${selectedCountry.country} (${selectedCountry.code}, max ${maxDigits} digits)`}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-bold text-slate-800 tracking-tight">{selectedCountry.code}</span>
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Numerical Only Phone Input */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={maxDigits}
          value={phone}
          disabled={disabled}
          placeholder={placeholder || defaultPlaceholder}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onPaste={handlePaste}
          required={required}
          className="flex-1 px-3 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none tracking-wide"
        />

        {/* Validation Status Indicator */}
        <div className="pr-3 flex items-center pointer-events-none">
          {isComplete && (
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check size={12} className="stroke-[3]" />
            </div>
          )}
          {error && !isComplete && (
            <div className="text-rose-500" title={error}>
              <AlertCircle size={15} />
            </div>
          )}
        </div>

        {/* Country Selector Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Search Header */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c, idx) => {
                  const isSelected = c.code === countryCode && c.iso === selectedCountry.iso;
                  return (
                    <button
                      key={`${c.iso}-${c.code}-${idx}`}
                      type="button"
                      onClick={() => handleCountrySelect(c.code)}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-amber-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="truncate">{c.country}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-400 font-semibold">{c.digits} digits</span>
                        <span className="font-mono font-bold text-slate-600 text-xs">{c.code}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">No countries found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error or Hint Text */}
      {error ? (
        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      ) : isPartiallyFilled ? (
        <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
          <span>{selectedCountry.country} phone number requires {maxDigits} numerical digits ({phone.length}/{maxDigits})</span>
        </p>
      ) : null}
    </div>
  );
};

export default CountryPhoneInput;

