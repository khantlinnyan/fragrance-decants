import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressDetails {
  address_line1: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressDetails) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  onAddressSelect,
  placeholder,
  required = false,
  className = '',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock address suggestions for demo purposes
  const mockSuggestions: AddressSuggestion[] = [
    {
      place_id: '1',
      description: '123 Main Street, New York, NY 10001, USA',
      structured_formatting: {
        main_text: '123 Main Street',
        secondary_text: 'New York, NY 10001, USA'
      }
    },
    {
      place_id: '2', 
      description: '456 Oak Avenue, Los Angeles, CA 90210, USA',
      structured_formatting: {
        main_text: '456 Oak Avenue',
        secondary_text: 'Los Angeles, CA 90210, USA'
      }
    },
    {
      place_id: '3',
      description: '789 Pine Road, Chicago, IL 60601, USA',
      structured_formatting: {
        main_text: '789 Pine Road',
        secondary_text: 'Chicago, IL 60601, USA'
      }
    }
  ];

  const mockAddressDetails: Record<string, AddressDetails> = {
    '1': {
      address_line1: '123 Main Street',
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country: 'United States'
    },
    '2': {
      address_line1: '456 Oak Avenue',
      city: 'Los Angeles',
      state_province: 'CA',
      postal_code: '90210',
      country: 'United States'
    },
    '3': {
      address_line1: '789 Pine Road',
      city: 'Chicago',
      state_province: 'IL',
      postal_code: '60601',
      country: 'United States'
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const searchAddresses = async (query: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise<void>(resolve => setTimeout(resolve, 200));
      
      // Filter mock suggestions based on query
      const filteredSuggestions = mockSuggestions.filter(suggestion =>
        suggestion.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } catch (error) {
      console.error('Address search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const addressDetails = mockAddressDetails[suggestion.place_id];
    
    if (addressDetails) {
      onChange(addressDetails.address_line1);
      onAddressSelect(addressDetails);
    }
    
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && '*'}
        </Label>
        <Input
          ref={inputRef}
          id="address"
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
          className="h-12 text-base"
          placeholder={placeholder}
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <Card className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                Searching addresses...
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}