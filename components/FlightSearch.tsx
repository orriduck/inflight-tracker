"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plane, MapPin, Navigation } from "lucide-react";
import { TauriFlightAPI } from "@/lib/tauri-api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getCurrentPosition, requestPermissions, Position } from "@tauri-apps/plugin-geolocation";

interface FlightSearchProps {
  className?: string;
}
  
export default function FlightSearch({ className }: FlightSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [nearbyCallsigns, setNearbyCallsigns] = useState<string[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number}>({ lat: 51.89508, lon: 2.79437});
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load nearby flights automatically with hardcoded coordinates
  useEffect(() => {
    const loadNearbyFlights = async () => {
      setIsLoadingNearby(true);
      try {
        const callsigns = await TauriFlightAPI.getNearbyAdsbCallsigns(userLocation.lat, userLocation.lon, 250);
        setNearbyCallsigns(callsigns.slice(0, 6));
      } catch (error) {
        console.error('Error fetching nearby flights:', error);
        setLocationError("Failed to fetch nearby flights");
      } finally {
        setIsLoadingNearby(false);
      }
    };

    loadNearbyFlights();
  }, [userLocation.lat, userLocation.lon]);

  const routeToTrackerPage = () => {
    router.push(`/tracker/${searchQuery}`);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        routeToTrackerPage();
    }
    return;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Get user's current location using Tauri geolocation plugin
  const getCurrentLocation = async () => {
    setIsLoadingNearby(true);
    setLocationError(null);
    setShowLocationPrompt(false);

    try {
      // Request permissions first
      await requestPermissions(['location']);
      
      // Get current position
      const position: Position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lon: longitude });
      
      try {
        // Fetch nearby flight callsigns within 250km radius
        const callsigns = await TauriFlightAPI.getNearbyAdsbCallsigns(latitude, longitude, 250);
        setNearbyCallsigns(callsigns.slice(0, 6)); // Limit to 6 recommendations
      } catch (error) {
        setLocationError("Failed to fetch nearby flights");
        console.error('Error fetching nearby flights:', error);
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      // Handle different types of errors
      if (error.message?.includes('permission')) {
        setLocationError("Location permission denied. Please allow location access in your system settings.");
      } else if (error.message?.includes('timeout')) {
        setLocationError("Location request timed out. Please try again.");
      } else if (error.message?.includes('unavailable')) {
        setLocationError("Location service unavailable. Please check your system settings.");
      } else {
        setLocationError("Unable to get location. Please check your system settings.");
      }
    } finally {
      setIsLoadingNearby(false);
    }
  };

  // Handle clicking on a nearby flight recommendation
  const handleNearbyCallsignClick = (callsign: string) => {
    router.push(`/tracker/${callsign}`);
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter flight number (e.g. AA1234) or ICAO (e.g. A4B2C1)"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSearching}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          {/* Loading indicator for suggestions */}
          {isLoadingSuggestions && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {suggestions.map((callsign, index) => (
                <div
                  key={`${callsign}-${index}`}
                  className={cn(
                    "px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    selectedIndex === index && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => setSearchQuery(callsign)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {callsign}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          onClick={() => routeToTrackerPage()} 
          disabled={isSearching || !searchQuery.trim()}
          className="p-6 hover:shadow"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Track Flight
            </div>
          )}
        </Button>
      </div>


      {/* Nearby Flights Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Nearby Flights
            {userLocation && (
              <span className="text-sm text-gray-500 ml-2">
                (within 250km)
              </span>
            )}
          </h3>
          {isLoadingNearby && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>

        {/* Location Permission Prompt */}
        {showLocationPrompt && !userLocation && !locationError && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Enable Location for Nearby Flights
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Allow location access to see flights near you and get personalized recommendations.
                </p>
                <button
                  onClick={getCurrentLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
            <div className="flex items-start gap-2">
              <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Location Required</p>
                <p>{locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Flight Callsigns */}
        {!isLoadingNearby && !locationError && nearbyCallsigns.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {nearbyCallsigns.map((callsign, index) => (
              <button
                key={`${callsign}-${index}`}
                className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-center"
                onClick={() => handleNearbyCallsignClick(callsign)}
              >
                <div className="flex flex-col items-center gap-1">
                  <Plane className="w-4 h-4 text-gray-400" />
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {callsign}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Flights Found */}
        {!isLoadingNearby && !locationError && nearbyCallsigns.length === 0 && userLocation && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-600 dark:text-gray-400">
            <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p>No flights found in your current location</p>
            <p className="text-sm">Try searching for a specific flight above</p>
          </div>
        )}
      </div>
    </div>
  );
}
