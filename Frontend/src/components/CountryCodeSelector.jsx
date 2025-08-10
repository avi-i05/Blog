import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

const CountryCodeSelector = ({ 
  selectedCountryCode, 
  onCountryCodeChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/country-codes');
        const data = await response.json();
        if (data.success) {
          setCountryCodes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch country codes:', error);
        // Fallback to default country codes
        setCountryCodes([
          { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
          { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
          { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
          { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
          { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
          { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
          { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
          { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
          { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
          { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryCodes();
  }, []);

  const selectedCountry = countryCodes.find(country => country.code === selectedCountryCode) || countryCodes[0];

  const handleCountrySelect = (country) => {
    onCountryCodeChange(country.code);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 ${className}`}>
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-16 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <span className="text-lg">{selectedCountry?.flag}</span>
        <span className="text-sm font-medium">{selectedCountry?.code}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedCountryCode === country.code ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {country.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {country.code}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector; 