'use client'

import { useEffect, useRef, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

function LocationSection({ address, coordinates }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const [mapError, setMapError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMaps();

  // Build address string if address is an object
  const addressString = typeof address === 'string' 
    ? address 
    : address?.address 
      ? [address.address, address.city, address.county, address.postcode]
          .filter(Boolean)
          .join(', ')
      : 'Address not available';

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current) {
      return;
    }

    if (googleMapsError) {
      setMapError('Failed to load Google Maps');
      return;
    }

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      // Map will be recreated, no need to explicitly destroy
      mapInstanceRef.current = null;
    }

    const initializeMap = async () => {
      try {
        let lat = null;
        let lng = null;

        // Use coordinates if available
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
          [lng, lat] = coordinates; // Coordinates are [longitude, latitude]
        } else if (coordinates && coordinates.latitude && coordinates.longitude) {
          lat = coordinates.latitude;
          lng = coordinates.longitude;
        } else if (address && typeof address === 'object' && address.coordinates) {
          // Check if address object has coordinates
          if (Array.isArray(address.coordinates) && address.coordinates.length === 2) {
            [lng, lat] = address.coordinates;
          } else if (address.coordinates.latitude && address.coordinates.longitude) {
            lat = address.coordinates.latitude;
            lng = address.coordinates.longitude;
          }
        }

        // If we have coordinates, use them directly
        if (lat && lng) {
          const center = { lat, lng };

          // Initialize map
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // Add marker
          markerRef.current = new window.google.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: addressString,
            animation: window.google.maps.Animation.DROP,
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${addressString}</strong></div>`,
          });

          markerRef.current.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, markerRef.current);
          });

          setMapError("");
        } else if (addressString && addressString !== 'Address not available') {
          // Geocode address if coordinates not available
          setIsGeocoding(true);
          setMapError("");

          if (!geocoderRef.current) {
            geocoderRef.current = new window.google.maps.Geocoder();
          }

          geocoderRef.current.geocode(
            { address: addressString },
            (results, status) => {
              setIsGeocoding(false);

              if (status === 'OK' && results && results.length > 0) {
                const location = results[0].geometry.location;
                const center = {
                  lat: location.lat(),
                  lng: location.lng(),
                };

                // Initialize map
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                  center,
                  zoom: 15,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                  zoomControl: true,
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                });

                // Add marker
                markerRef.current = new window.google.maps.Marker({
                  position: center,
                  map: mapInstanceRef.current,
                  title: addressString,
                  animation: window.google.maps.Animation.DROP,
                });

                // Add info window
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `<div style="padding: 8px;"><strong>${addressString}</strong></div>`,
                });

                markerRef.current.addListener('click', () => {
                  infoWindow.open(mapInstanceRef.current, markerRef.current);
                });

                setMapError("");
              } else {
                setMapError('Could not find location on map');
              }
            }
          );
        } else {
          setMapError('Location information not available');
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [isGoogleMapsLoaded, googleMapsError, addressString, coordinates, address]);

  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-3">
        Location
      </h2>
      <div className="mb-4">
        <div className="flex items-start gap-2 text-darkGray mb-4">
          <BlueLocationIcon className="mt-0.5 shrink-0" />
          <span className="text-sm sm:text-base font-normal font-nunito text-secondary break-words">
            {addressString}
          </span>
        </div>
        <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-100 rounded-xl border border-lightGray relative overflow-hidden">
          {!isGoogleMapsLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent mb-2"></div>
                <p className="text-sm sm:text-base text-darkGray font-normal font-nunito">
                  Loading map...
                </p>
              </div>
            </div>
          )}
          {isGoogleMapsLoaded && isGeocoding && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent mb-2"></div>
                <p className="text-sm sm:text-base text-darkGray font-normal font-nunito">
                  Finding location...
                </p>
              </div>
            </div>
          )}
          {isGoogleMapsLoaded && mapError && !isGeocoding && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <FiMapPin className="text-[#6B4EFF] text-3xl sm:text-4xl mx-auto mb-2" />
                <p className="text-sm sm:text-base text-darkGray font-normal font-nunito">
                  {mapError}
                </p>
              </div>
            </div>
          )}
          {googleMapsError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <FiMapPin className="text-[#6B4EFF] text-3xl sm:text-4xl mx-auto mb-2" />
                <p className="text-sm sm:text-base text-darkGray font-normal font-nunito">
                  Map unavailable
                </p>
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ display: isGoogleMapsLoaded && !mapError && !isGeocoding ? 'block' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

export default LocationSection;
