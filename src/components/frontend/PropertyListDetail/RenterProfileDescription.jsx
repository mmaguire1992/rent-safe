'use client'

import { useState, useMemo } from "react";
import { getPreferredRenterIcon, preferredRenterTypeOptions } from "@/constant";

function RenterProfileDescription({
  description,
  preferredRenterTypes,
  requirements,
}) {
  const [readMore, setReadMore] = useState(false);
  const maxLength = 150;

  // Parse description to extract clean text and extract preferred type and requirements
  const { cleanDescription, extractedPreferredType, extractedRequirements } = useMemo(() => {
    if (!description) return { cleanDescription: '', extractedPreferredType: null, extractedRequirements: null };
    
    let clean = description;
    let preferredType = null;
    let requirements = null;
    
    // Extract "Preferred renter type:" value
    // Handle comma-separated list: "single-male, single-female, couple"
    const preferredTypeMatch = clean.match(/Preferred renter type:\s*([^.]+)/i);
    if (preferredTypeMatch) {
      const typesString = preferredTypeMatch[1].trim();
      // Split by comma and clean up each type
      const typesArray = typesString.split(',').map(t => t.trim()).filter(t => t);
      // Store as array for proper handling
      preferredType = typesArray.length > 0 ? typesArray : null;
      // Remove this part from description
      clean = clean.replace(/Preferred renter type:\s*[^.]+\.?/i, '').trim();
    }
    
    // Extract "Additional requirements:" value
    const additionalReqMatch = clean.match(/Additional requirements:\s*(.+)/i);
    if (additionalReqMatch) {
      requirements = additionalReqMatch[1].trim();
      // Remove this part from description
      clean = clean.replace(/Additional requirements:\s*.+/i, '').trim();
    }
    
    // Clean up any trailing dots or extra spaces
    clean = clean.replace(/\.\s*$/, '').trim();
    
    return { 
      cleanDescription: clean, 
      extractedPreferredType: preferredType,
      extractedRequirements: requirements 
    };
  }, [description]);

  // Format preferred renter type for display
  const formatPreferredRenterType = (type) => {
    if (!type) return null;
    
    // If it's already an object with label
    if (typeof type === 'object' && type.label) {
      return type;
    }
    
    // If it's a string, convert to object
    if (typeof type === 'string') {
      // Convert snake_case or kebab-case to Title Case
      const formatted = type
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return { label: formatted, value: type };
    }
    
    return null;
  };

  // Format all preferred renter types for display
  const formattedPreferredRenterTypes = useMemo(() => {
    // First try to use extracted type from description
    if (extractedPreferredType) {
      // If it's an array (comma-separated values from description)
      if (Array.isArray(extractedPreferredType)) {
        const formatted = extractedPreferredType
          .map(type => {
            const value = typeof type === 'string' ? type : (type.value || type.label);
            const option = preferredRenterTypeOptions.find(
              opt => opt.value === value || opt.label === value || 
              opt.value.toLowerCase() === value.toLowerCase() ||
              opt.label.toLowerCase() === value.toLowerCase()
            );
            return option ? { label: option.label, value: option.value } : null;
          })
          .filter(type => type !== null);
        return formatted;
      }
      // If it's a single string, try to split by comma
      if (typeof extractedPreferredType === 'string' && extractedPreferredType.includes(',')) {
        const typesArray = extractedPreferredType.split(',').map(t => t.trim()).filter(t => t);
        const formatted = typesArray
          .map(type => {
            const option = preferredRenterTypeOptions.find(
              opt => opt.value === type || opt.label === type ||
              opt.value.toLowerCase() === type.toLowerCase() ||
              opt.label.toLowerCase() === type.toLowerCase()
            );
            return option ? { label: option.label, value: option.value } : null;
          })
          .filter(type => type !== null);
        return formatted;
      }
      // Single value
      const formatted = formatPreferredRenterType(extractedPreferredType);
      return formatted ? [formatted] : [];
    }
    
    // Fall back to preferredRenterTypes prop
    if (preferredRenterTypes) {
      // If it's an array, filter to only show selected ones
      if (Array.isArray(preferredRenterTypes) && preferredRenterTypes.length > 0) {
        // Check if the array contains objects with 'checked' property (all options format)
        const hasCheckedProperty = preferredRenterTypes.some(
          type => typeof type === 'object' && 'checked' in type
        );
        
        if (hasCheckedProperty) {
          // Filter to only include items with checked: true
          const selectedTypes = preferredRenterTypes
            .filter(type => typeof type === 'object' && type.checked === true)
            .map(type => {
              // Find the matching option from preferredRenterTypeOptions
              const option = preferredRenterTypeOptions.find(
                opt => opt.value === type.value || opt.label === type.label
              );
              return option ? { label: option.label, value: option.value } : null;
            })
            .filter(type => type !== null);
          
          return selectedTypes;
        } else {
          // Array of strings/values - these are all selected
          // Map each value to its corresponding option from preferredRenterTypeOptions
          const selectedTypes = preferredRenterTypes
            .map(typeValue => {
              // Handle both string values and objects
              const value = typeof typeValue === 'string' ? typeValue : (typeValue.value || typeValue.label);
              const option = preferredRenterTypeOptions.find(
                opt => opt.value === value || opt.label === value
              );
              return option ? { label: option.label, value: option.value } : null;
            })
            .filter(type => type !== null);
          
          return selectedTypes;
        }
      }
      // If it's a single value
      const formatted = formatPreferredRenterType(preferredRenterTypes);
      return formatted ? [formatted] : [];
    }
    return [];
  }, [extractedPreferredType, preferredRenterTypes]);

  // Use extracted requirements from description, or fall back to prop
  const displayRequirements = useMemo(() => {
    // First try to use extracted requirements from description
    if (extractedRequirements) {
      return extractedRequirements;
    }
    
    // Fall back to requirements prop
    return requirements;
  }, [extractedRequirements, requirements]);

  // Only show sections that have content
  const hasDescription = cleanDescription && cleanDescription.trim().length > 0;
  const hasPreferredType = formattedPreferredRenterTypes.length > 0;
  // Show requirements section even if it says "no requirement"
  const hasRequirements = displayRequirements && displayRequirements.trim().length > 0;

  // Don't render if nothing to show
  if (!hasDescription && !hasPreferredType && !hasRequirements) {
    return null;
  }

  return (
    <>
    <div className="bg-white rounded-[20px] border border-lightGray p-4 sm:p-6">
      {/* Renter Profile Description Section */}
      {hasDescription && (
        <div className="">
          <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-2">
            Renter Profile Description
          </h2>
          <p className="text-sm sm:text-base font-normal font-nunito text-darkGray leading-relaxed">
            {readMore ? cleanDescription : `${cleanDescription?.substring(0, maxLength)}${cleanDescription?.length > maxLength ? '...' : ''}`}{" "}
            {cleanDescription?.length > maxLength && (
              <span
                onClick={() => setReadMore(!readMore)}
                className="text-[#6B4EFF] font-semibold mt-2 hover:underline cursor-pointer"
              >
                {readMore ? "Read less" : "Read more"}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Preferred Renter Type Section */}
      {hasPreferredType && (
        <div className="my-8">
          <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-2">
            Preferred Renter Type
          </h2>
          <div className="flex flex-col  lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
            {formattedPreferredRenterTypes.map((type, index) => {
              const Icon = getPreferredRenterIcon(type.label || type.value);
              return (
                <div key={index} className="flex items-center gap-2 py-1.5 sm:py-3 transition-colors">
                  {Icon && (
                    <span className="bg-[#FFDDEE] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0">
                      <Icon />
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-normal font-nunito text-darkGray whitespace-nowrap">
                    {type.label || type.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Requirements Section */}
      {hasRequirements && (
        <div className="">
          <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-4">
            Additional Requirements
          </h2>
          <p className="text-sm sm:text-base font-normal font-nunito text-darkGray leading-relaxed">
            {displayRequirements}
          </p>
        </div>
      )}
      </div>
    </>
  );
}

export default RenterProfileDescription;
