import React, { useState, useEffect, useMemo } from 'react';
import { PET_BREEDS_BY_CATEGORY, normalizePetCategory } from '../../data/petBreedsData.js';

/**
 * PetBreedDropdown
 * Renders a dropdown of breeds dynamically filtered based on the animal/pet type.
 * Includes fallback to "Other / Custom Breed" with custom text input.
 */
const PetBreedDropdown = ({
  petType = 'All',
  value = '',
  onChange,
  placeholder = 'Select Pet Breed *',
  required = false,
  className = '',
  id,
  name,
  disabled = false,
  allowedCategories = ['dogs', 'cats', 'birds']
}) => {
  const normalizedCategory = useMemo(() => normalizePetCategory(petType), [petType]);

  // Determine standard list for current category
  const currentBreeds = useMemo(() => {
    if (normalizedCategory === 'all') {
      return allowedCategories.reduce((acc, cat) => {
        if (PET_BREEDS_BY_CATEGORY[cat]) {
          acc.push(...PET_BREEDS_BY_CATEGORY[cat]);
        }
        return acc;
      }, []);
    }
    return PET_BREEDS_BY_CATEGORY[normalizedCategory] || PET_BREEDS_BY_CATEGORY.dogs;
  }, [normalizedCategory, allowedCategories]);

  // Check if current value is in the standard list
  const isKnownBreed = useMemo(() => {
    if (!value) return false;
    return currentBreeds.includes(value);
  }, [value, currentBreeds]);

  // Custom breed state
  const [isCustom, setIsCustom] = useState(Boolean(value && !isKnownBreed));
  const [customValue, setCustomValue] = useState(isKnownBreed ? '' : value);

  // Sync when value prop changes externally
  useEffect(() => {
    if (!value) {
      setIsCustom(false);
      setCustomValue('');
    } else if (!currentBreeds.includes(value)) {
      setIsCustom(true);
      setCustomValue(value);
    } else {
      setIsCustom(false);
      setCustomValue('');
    }
  }, [value, currentBreeds]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setIsCustom(true);
      onChange?.(customValue || '');
    } else {
      setIsCustom(false);
      onChange?.(selected);
    }
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange?.(val);
  };

  const selectValue = isCustom ? '__custom__' : (isKnownBreed ? value : '');

  return (
    <div className="space-y-1.5 w-full">
      <select
        id={id}
        name={name}
        required={required && !isCustom}
        disabled={disabled}
        value={selectValue}
        onChange={handleSelectChange}
        className={className || 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary'}
      >
        <option value="">{placeholder}</option>

        {normalizedCategory === 'all' ? (
          <>
            {allowedCategories.includes('dogs') && (
              <optgroup label="🐶 Dog Breeds">
                {PET_BREEDS_BY_CATEGORY.dogs.map((breed) => (
                  <option key={`dog-${breed}`} value={breed}>
                    {breed}
                  </option>
                ))}
              </optgroup>
            )}
            {allowedCategories.includes('cats') && (
              <optgroup label="🐱 Cat Breeds">
                {PET_BREEDS_BY_CATEGORY.cats.map((breed) => (
                  <option key={`cat-${breed}`} value={breed}>
                    {breed}
                  </option>
                ))}
              </optgroup>
            )}
            {allowedCategories.includes('birds') && (
              <optgroup label="🦜 Bird Breeds">
                {PET_BREEDS_BY_CATEGORY.birds.map((breed) => (
                  <option key={`bird-${breed}`} value={breed}>
                    {breed}
                  </option>
                ))}
              </optgroup>
            )}
          </>
        ) : (
          currentBreeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))
        )}

        <option value="__custom__">➕ Other / Custom Breed (Type below)</option>
      </select>

      {isCustom && (
        <input
          type="text"
          required={required}
          placeholder="Type your pet's breed name..."
          value={customValue}
          onChange={handleCustomInputChange}
          autoFocus
          className={`${className || 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary'} ring-1 ring-amber-400/40`}
        />
      )}
    </div>
  );
};

export default PetBreedDropdown;
