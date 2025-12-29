'use client'

import { useState, useEffect, useRef } from "react";
import { FiMapPin } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { addPropertyCityOptions, countyOptions } from "@/constant";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { loadGoogleMaps } from "@/utils/googleMaps";

function LocationStep({ formData, setFormData, errors, setErrors }) {
  const [touched, setTouched] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [postcodeWarning, setPostcodeWarning] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);
  const infoWindowRef = useRef(null);
  const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMaps();

  // Validate postcode format based on country
  const validatePostcodeFormat = (postcode, country) => {
    if (!postcode || !country) return "";
    
    const postcodeDigits = postcode.replace(/\D/g, ""); // Extract only digits
    const countryLower = country.toLowerCase();
    
    // Common postcode format validations by country
    if (countryLower.includes("india")) {
      // Indian PIN codes are 6 digits
      if (postcodeDigits.length !== 6) {
        return "Indian PIN codes must be 6 digits. Please verify the postcode.";
      }
    } else if (countryLower.includes("united kingdom") || countryLower.includes("uk")) {
      // UK postcodes are typically 5-7 characters (alphanumeric), but backend requires numeric only
      // So we'll just check if it's reasonable length (5-7 digits)
      if (postcodeDigits.length < 5 || postcodeDigits.length > 7) {
        return "UK postcodes are typically 5-7 characters. Please verify the postcode.";
      }
    } else if (countryLower.includes("united states") || countryLower.includes("usa") || countryLower.includes("us")) {
      // US ZIP codes are 5 digits (or 9 with ZIP+4)
      if (postcodeDigits.length !== 5 && postcodeDigits.length !== 9) {
        return "US ZIP codes are 5 digits (or 9 with ZIP+4). Please verify the postcode.";
      }
    } else if (countryLower.includes("canada")) {
      // Canadian postal codes are 6 characters (alphanumeric), but backend requires numeric only
      // So we'll check for reasonable length
      if (postcodeDigits.length < 5 || postcodeDigits.length > 6) {
        return "Canadian postal codes are typically 6 characters. Please verify the postcode.";
      }
    }
    
    return "";
  };

  // Validate fields
  const validateField = (fieldName, value) => {
    let error = "";
    
    switch (fieldName) {
      case "address":
        if (!value || !value.trim()) {
          error = "Address is required";
        }
        break;
      case "city":
        if (!value || !value.trim()) {
          error = "City is required";
        }
        break;
      case "postcode":
        if (!value || !value.trim()) {
          error = "Postcode is required";
        } else {
          // Check if postcode contains only digits (backend requirement)
          const digitsOnly = value.replace(/\D/g, "");
          if (digitsOnly.length === 0) {
            error = "Postcode must contain at least one digit";
          } else {
            // Validate format based on country
            const formatWarning = validatePostcodeFormat(value, formData.country);
            if (formatWarning) {
              setPostcodeWarning(formatWarning);
            } else {
              setPostcodeWarning("");
            }
          }
        }
        break;
      case "country":
        if (!value || !value.trim()) {
          error = "Country is required";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Extract address components from Google Places result
  // Based on Google Places API documentation: https://developers.google.com/maps/documentation/places/web-service/details
  const extractAddressComponents = (place) => {
    const addressComponents = {
      address: "",
      city: "",
      county: "",
      state: "",
      postcode: "",
      country: "",
    };

    if (!place.address_components || !Array.isArray(place.address_components)) {
      // Fallback to formatted address if no components
      addressComponents.address = place.formatted_address || place.name || "";
      return addressComponents;
    }

    // Helper function to find component by type(s) - more robust
    const findComponent = (types) => {
      if (!Array.isArray(types)) types = [types];
      const component = place.address_components.find((c) => {
        if (!c || !c.types || !Array.isArray(c.types)) return false;
        return c.types.some((type) => types.includes(type));
      });
      return component || null;
    };

    // Extract street address (more comprehensive)
    const streetNumber = findComponent("street_number")?.long_name;
    const route = findComponent("route")?.long_name;
    const subpremise = findComponent("subpremise")?.long_name;
    const premise = findComponent("premise")?.long_name;
    
    // Build full street address - prioritize street number + route
    const streetParts = [streetNumber, route, premise, subpremise].filter(Boolean);
    addressComponents.address = streetParts.length > 0
      ? streetParts.join(" ").trim()
      : place.formatted_address || place.name || "";

    // Extract city (try multiple types in order of preference)
    // Priority: locality > postal_town > administrative_area_level_3 > sublocality_level_1 > sublocality
    const cityComponent = 
      findComponent("locality") ||
      findComponent("postal_town") ||
      findComponent("administrative_area_level_3") ||
      findComponent("sublocality_level_1") ||
      findComponent("sublocality");
    addressComponents.city = cityComponent?.long_name || "";

    // Extract county (administrative_area_level_2)
    // This represents counties, districts, or second-level administrative divisions
    // For UK: Greater London, Greater Manchester, West Midlands, etc.
    // For US: Los Angeles County, Cook County, etc.
    const countyComponent = findComponent("administrative_area_level_2");
    if (countyComponent && countyComponent.long_name) {
      addressComponents.county = countyComponent.long_name;
    }

    // Extract state/province (administrative_area_level_1)
    // This represents states, provinces, or first-level administrative divisions
    // For UK: England, Scotland, Wales, Northern Ireland
    // For US: California, New York, Texas, etc.
    // For Canada: Ontario, Quebec, British Columbia, etc.
    const stateComponent = findComponent("administrative_area_level_1");
    if (stateComponent && stateComponent.long_name) {
      addressComponents.state = stateComponent.long_name;
    }

    // Extract postcode/postal code
    // Try multiple approaches for better coverage
    let postcode = "";
    
    // Approach 1: Try postal_code component (most common)
    const postcodeComponent = findComponent(["postal_code", "postal_code_prefix"]);
    if (postcodeComponent) {
      // Prefer long_name, fallback to short_name
      postcode = postcodeComponent.long_name || postcodeComponent.short_name || "";
    }
    
    // Approach 2: If not found, try to extract from formatted_address
    // This is especially useful for Indian addresses where postcode might be in formatted_address
    if (!postcode && place.formatted_address) {
      // Try to find postcode pattern in formatted address
      // Indian PIN codes: 6 digits (e.g., "560001", "560 001")
      // UK postcodes: alphanumeric (e.g., "SW1A 1AA", "M1 1AA")
      // US ZIP codes: 5 digits (e.g., "75230", "75230-1234")
      // Extract any sequence of digits (4-9 digits) that might be a postcode
      const postcodePatterns = [
        /\b\d{6}\b/,           // Indian PIN codes (6 digits)
        /\b\d{5}(?:-\d{4})?\b/, // US ZIP codes (5 digits or 5-4)
        /\b\d{5,7}\b/,         // UK postcodes (5-7 digits, though usually alphanumeric)
        /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i, // UK postcode format (alphanumeric)
      ];
      
      for (const pattern of postcodePatterns) {
        const match = place.formatted_address.match(pattern);
        if (match) {
          postcode = match[0];
          break;
        }
      }
    }
    
    // Clean postcode: remove spaces and non-numeric characters (keeping only digits)
    // This ensures compatibility with backend validation (numeric only)
    if (postcode) {
      const cleanedPostcode = postcode.replace(/\s+/g, '').replace(/[^\d]/g, '');
      if (cleanedPostcode && cleanedPostcode.length >= 4) {
        // Only accept if we have at least 4 digits (reasonable minimum)
        addressComponents.postcode = cleanedPostcode;
      }
    }

    // Extract country
    // This is the country name (e.g., "United Kingdom", "United States", "Canada")
    const countryComponent = findComponent("country");
    if (countryComponent && countryComponent.long_name) {
      addressComponents.country = countryComponent.long_name;
    }

    // Debug logging (only in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Extracted address components:', {
        address: addressComponents.address,
        city: addressComponents.city,
        county: addressComponents.county,
        state: addressComponents.state,
        postcode: addressComponents.postcode,
        country: addressComponents.country,
      });
      // Log raw postal_code component for debugging
      const rawPostcode = findComponent(["postal_code", "postal_code_prefix"]);
      if (rawPostcode) {
        console.log('📍 Raw postcode component:', {
          long_name: rawPostcode.long_name,
          short_name: rawPostcode.short_name,
          types: rawPostcode.types,
        });
      } else {
        console.warn('⚠️ No postcode component found in Google Places result');
        console.log('📍 Attempting to extract from formatted_address:', place.formatted_address);
        // Log all address components for debugging
        console.log('📍 All address components:', place.address_components?.map(c => ({
          types: c.types,
          long_name: c.long_name,
          short_name: c.short_name,
        })));
      }
    }

    return addressComponents;
  };

  // Geocode address using Google Maps API
  const geocodeAddress = async (addressToGeocode = null) => {
    const address = addressToGeocode || formData.address;
    
    if (!address) {
      return;
    }

    setIsGeocoding(true);
    setGeocodeError("");

    try {
      // Ensure Google Maps is loaded
      await loadGoogleMaps();

      // Use Google Geocoding API
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        throw new Error("Google Maps API not loaded");
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      // Build full address string
      const addressParts = [
        address,
        formData.city,
        formData.county,
        formData.postcode,
        formData.country || "United Kingdom"
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      geocoderRef.current.geocode(
        { address: fullAddress },
        (results, status) => {
          setIsGeocoding(false);
          
          if (status === "OK" && results && results.length > 0) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            // Store coordinates in formData (format: [longitude, latitude])
            setFormData({
              ...formData,
              coordinates: [lng, lat],
            });
            
            setGeocodeError("");
            updateMap(lat, lng, results[0].formatted_address);
          } else {
            setGeocodeError("Could not find location. Please verify the address.");
            console.error("Geocoding failed:", status);
          }
        }
      );
    } catch (error) {
      setIsGeocoding(false);
      setGeocodeError("Error verifying address. Please try again.");
      console.error("Geocoding error:", error);
    }
  };

  // Update map with new coordinates
  const updateMap = (lat, lng, addressText) => {
    if (!mapRef.current || typeof window === 'undefined' || !window.google || !mapInstanceRef.current) return;

    const position = { lat, lng };

    // Update map center
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        title: addressText || formData.address,
        animation: window.google.maps.Animation.DROP,
      });
    }

    // Update or create info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    infoWindowRef.current = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
            ${formData.address || "Property Location"}
          </h3>
          ${formData.city ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">City: ${formData.city}</p>` : ""}
          ${formData.postcode ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Postcode: ${formData.postcode}</p>` : ""}
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
            Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </p>
        </div>
      `,
    });

    // Remove existing listeners and add new one
    window.google.maps.event.clearListeners(markerRef.current, "click");
    markerRef.current.addListener("click", () => {
      infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
    });
  };

  // Initialize map and Places Autocomplete when Google Maps is loaded
  useEffect(() => {
    const initMapAndAutocomplete = async () => {
      if (!mapRef.current || typeof window === 'undefined') return;

      try {
        // Ensure Google Maps is loaded
        await loadGoogleMaps();

        if (!window.google || !window.google.maps) {
          setGeocodeError("Google Maps API not available");
          return;
        }

        // Default center (London, UK)
        const defaultCenter = { lat: 51.5074, lng: -0.1278 };

        const mapOptions = {
          center: formData.coordinates && formData.coordinates.length === 2
            ? { lat: formData.coordinates[1], lng: formData.coordinates[0] }
            : defaultCenter,
          zoom: formData.coordinates && formData.coordinates.length === 2 ? 15 : 6,
          mapTypeId: "roadmap",
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };

        // Initialize map (always show map)
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

        // If coordinates exist, show marker
        if (formData.coordinates && formData.coordinates.length === 2) {
          updateMap(formData.coordinates[1], formData.coordinates[0], formData.address);
        }

        // Initialize Places Autocomplete for address input
        if (addressInputRef.current && !autocompleteRef.current) {
          // Handle place selection function
          const handlePlaceSelection = async (place) => {
            if (!place.geometry) {
              setGeocodeError("Invalid address selected. Please try another.");
              return;
            }

            // For better postcode extraction, get place details if available
            // This ensures we have all address components including postcode
            let placeDetails = place;
            if (place.place_id && window.google.maps.places) {
              try {
                const service = new window.google.maps.places.PlacesService(document.createElement('div'));
                const request = {
                  placeId: place.place_id,
                  fields: ['address_components', 'formatted_address', 'geometry', 'name', 'postal_code']
                };
                
                await new Promise((resolve) => {
                  service.getDetails(request, (result, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
                      placeDetails = result;
                    }
                    resolve();
                  });
                });
              } catch (error) {
                console.warn('Could not fetch place details:', error);
                // Continue with original place object
              }
            }

            // Extract address components
            const addressComponents = extractAddressComponents(placeDetails);
            const location = placeDetails.geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            // Validate that we have at least an address
            if (!addressComponents.address && !place.formatted_address) {
              setGeocodeError("Could not extract address details. Please try again.");
              return;
            }

            // If postcode is still missing, try reverse geocoding as final fallback
            let finalPostcode = addressComponents.postcode;
            if (!finalPostcode && window.google && window.google.maps) {
              try {
                if (!geocoderRef.current) {
                  geocoderRef.current = new window.google.maps.Geocoder();
                }
                
                await new Promise((resolve) => {
                  geocoderRef.current.geocode(
                    { location: { lat, lng } },
                    (results, status) => {
                      if (status === 'OK' && results && results.length > 0) {
                        // Try to extract postcode from reverse geocoding results
                        const reverseGeocodeResult = results[0];
                        if (reverseGeocodeResult.address_components) {
                          const postalComponent = reverseGeocodeResult.address_components.find(
                            (c) => c.types && c.types.includes('postal_code')
                          );
                          if (postalComponent) {
                            const extractedPostcode = postalComponent.long_name || postalComponent.short_name;
                            if (extractedPostcode) {
                              const cleaned = extractedPostcode.replace(/\s+/g, '').replace(/[^\d]/g, '');
                              if (cleaned && cleaned.length >= 4) {
                                finalPostcode = cleaned;
                                addressComponents.postcode = cleaned;
                                if (process.env.NODE_ENV === 'development') {
                                  console.log('✅ Postcode found via reverse geocoding:', cleaned);
                                }
                              }
                            }
                          }
                        }
                      }
                      resolve();
                    }
                  );
                });
              } catch (error) {
                console.warn('Reverse geocoding failed:', error);
              }
            }

            // Update form data with extracted components
            // Priority: extracted components > formatted address > existing value
            const newCountry = addressComponents.country || formData.country || "United Kingdom";
            // Use extracted postcode, but keep existing if extraction failed
            const newPostcode = finalPostcode || formData.postcode;
            
            // Log if postcode extraction failed
            if (process.env.NODE_ENV === 'development' && !newPostcode) {
              console.warn('⚠️ Postcode extraction failed. Formatted address:', placeDetails.formatted_address);
              console.warn('⚠️ Coordinates:', lat, lng);
            }
            
            setFormData({
              ...formData,
              address: addressComponents.address || place.formatted_address || formData.address,
              city: addressComponents.city || formData.city,
              county: addressComponents.county || formData.county, // Still saved but not shown in UI
              state: addressComponents.state || formData.state,
              postcode: newPostcode,
              country: newCountry,
              coordinates: [lng, lat], // Save coordinates: [longitude, latitude]
            });

            // Validate postcode format after auto-fill
            if (newPostcode && newCountry) {
              const warning = validatePostcodeFormat(newPostcode, newCountry);
              setPostcodeWarning(warning);
            } else {
              setPostcodeWarning("");
            }

            // Mark fields as touched since they're auto-filled
            setTouched({
              ...touched,
              address: true,
              city: addressComponents.city ? true : touched.city,
              postcode: addressComponents.postcode ? true : touched.postcode,
              country: addressComponents.country ? true : touched.country,
            });

            // Clear errors
            setGeocodeError("");
            if (setErrors) {
              setErrors({
                ...errors,
                address: "",
                city: addressComponents.city ? "" : errors.city,
                postcode: addressComponents.postcode ? "" : errors.postcode,
                country: addressComponents.country ? "" : errors.country,
              });
            }

            // Update map
            updateMap(lat, lng, place.formatted_address || addressComponents.address);
          };

          // Use legacy Autocomplete API (still works, warning suppressed)
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              // No country restriction - allow global addresses
              fields: ["address_components", "geometry", "formatted_address", "name"],
              types: ["address"], // Focus on addresses, but allow any location
            }
          );

          // Listen for place selection
          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();
            handlePlaceSelection(place);
          });
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setGeocodeError("Failed to load Google Maps. Please check your API key.");
      }
    };

    if (isGoogleMapsLoaded) {
      initMapAndAutocomplete();
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGoogleMapsLoaded]);

  // Geocode when address fields are complete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address && formData.city && formData.postcode && 
          (!formData.coordinates || formData.coordinates.length === 0)) {
        geocodeAddress();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.address, formData.city, formData.postcode]);

  // Mark all fields as touched when errors are set from parent
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const allTouched = {
        address: true,
        city: true,
        postcode: true,
        country: true,
      };
      setTouched(allTouched);
    }
  }, [errors]);

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    const error = validateField(fieldName, formData[fieldName]);
    if (setErrors) {
      setErrors({ ...errors, [fieldName]: error });
    }
  };

  const handleChange = (fieldName, value) => {
    // Clear coordinates when address fields change
    if ((fieldName === "address" || fieldName === "city" || fieldName === "postcode") && 
        formData.coordinates && formData.coordinates.length > 0) {
      setFormData({ ...formData, [fieldName]: value, coordinates: [] });
      // Clear marker if it exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }
    // Clear error when user starts typing
    if (errors && errors[fieldName] && setErrors) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Location Details
        </h2>
        <p className="text-darkGray text-sm md:text-base font-normal font-nunito">
          Where is your property located?
        </p>
      </div>
      <div className="w-full">
        <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
          Address <span className="text-xs text-gray-500 font-normal">(Required - Start typing to search)</span>
        </label>
        <input
          ref={addressInputRef}
          type="text"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          onBlur={() => handleBlur("address")}
          placeholder="Search for an address (e.g., 123 Main St, London)..."
          className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-[#6B4EFF] ${
            touched.address && errors?.address
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-lightGray"
          }`}
        />
        {touched.address && errors?.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
        {!errors?.address && formData.address && (
          <p className="mt-1 text-xs text-green-600">✓ Address validated</p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              City <span className="text-xs text-gray-500 font-normal">(Required - Auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => {
                handleChange("city", e.target.value);
                setTouched({ ...touched, city: true });
              }}
              onBlur={() => handleBlur("city")}
              placeholder="City (auto-filled from address)"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-[#6B4EFF] ${
                touched.city && errors?.city
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-lightGray"
              }`}
            />
            {touched.city && errors?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
            {!errors?.city && formData.city && (
              <p className="mt-1 text-xs text-gray-500">Auto-filled from address. You can edit if needed.</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              State/Province <span className="text-xs text-gray-500 font-normal">(Auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="State/Province (auto-filled from address)"
              className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-[#6B4EFF]"
            />
            {formData.state && (
              <p className="mt-1 text-xs text-gray-500">Auto-filled from address. You can edit if needed.</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Postcode <span className="text-xs text-gray-500 font-normal">(Required - Auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => handleChange("postcode", e.target.value)}
              onBlur={() => handleBlur("postcode")}
              placeholder="Postcode (auto-filled from address)"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-[#6B4EFF] ${
                touched.postcode && errors?.postcode
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-lightGray"
              }`}
            />
            {touched.postcode && errors?.postcode && (
              <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
            )}
            {!errors?.postcode && postcodeWarning && (
              <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>{postcodeWarning}</span>
              </p>
            )}
            {!errors?.postcode && !postcodeWarning && formData.postcode && (
              <p className="mt-1 text-xs text-gray-500">You can override this if needed</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Country <span className="text-xs text-gray-500 font-normal">(Auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Country (auto-filled from address)"
              className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-[#6B4EFF]"
            />
            {formData.country && (
              <p className="mt-1 text-xs text-gray-500">Auto-filled from address. You can edit if needed.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-2">
            Map preview
          </label>
          <div className="w-full h-64 rounded-lg overflow-hidden border border-lightGray relative">
            {isGoogleMapsLoaded ? (
              <div 
                ref={mapRef} 
                className="w-full h-full"
                style={{ background: "#e5e3df" }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  {googleMapsError ? (
                    <>
                      <FiMapPin className="text-red-500 text-4xl mx-auto mb-2" />
                      <p className="text-red-600">
                        {googleMapsError?.message || "Failed to load Google Maps"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF] mx-auto mb-2"></div>
                      <p className="text-darkGray">Loading map...</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {isGeocoding && (
            <p className="mt-1 text-sm text-blue-600">Verifying location...</p>
          )}
          {geocodeError && !isGeocoding && (
            <p className="mt-1 text-sm text-yellow-600">{geocodeError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationStep;
