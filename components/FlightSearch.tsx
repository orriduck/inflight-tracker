"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plane } from "lucide-react";
import { TauriFlightAPI } from "@/lib/tauri-api";
import { FlightData } from "@/types/flight";

interface FlightSearchProps {
  onFlightFound?: (flightData: FlightData) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function FlightSearch({ onFlightFound, onError, className }: FlightSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      // First try to search by callsign in ADSB
      const flightData = await TauriFlightAPI.getAdsbFlightByCallsign(searchQuery.trim().toUpperCase());
      onFlightFound?.(flightData);
    } catch (callsignError) {
      try {
        // If callsign search fails, try ICAO address
        const flightData = await TauriFlightAPI.getAdsbFlightByIcao(searchQuery.trim().toUpperCase());
        onFlightFound?.(flightData);
      } catch (icaoError) {
        onError?.(`No flight found for "${searchQuery}". Please check the flight number or ICAO address.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter flight number (e.g. AA1234) or ICAO (e.g. A4B2C1)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            disabled={isSearching}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchQuery.trim()}
          className="px-6"
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
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>💡 <strong>Search via OpenADSB Network:</strong> Find any flight worldwide using live ADS-B data</p>
      </div>
    </div>
  );
}
