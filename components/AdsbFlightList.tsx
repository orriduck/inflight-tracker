"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TauriFlightAPI } from "@/lib/tauri-api";
import { FlightData } from "@/types/flight";
import { Plane, RefreshCw, MapPin } from "lucide-react";

interface AdsbFlightListProps {
  onFlightSelect?: (flightData: FlightData) => void;
  className?: string;
}

export default function AdsbFlightList({ onFlightSelect, className }: AdsbFlightListProps) {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFlights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const flightData = await TauriFlightAPI.getAllAdsbFlights();
      setFlights(flightData.slice(0, 20)); // Show first 20 flights
    } catch (err) {
      setError("Failed to load flights from OpenADSB network");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const formatFlightNumber = (flightData: FlightData): string => {
    return flightData.flightNumber !== "N/A" ? flightData.flightNumber : flightData.vehicleId;
  };

  const formatLocation = (flightData: FlightData): string => {
    if (flightData.origin !== "N/A" && flightData.destination !== "N/A") {
      return `${flightData.origin} → ${flightData.destination}`;
    }
    if (flightData.latitude && flightData.longitude) {
      return `${flightData.latitude.toFixed(2)}, ${flightData.longitude.toFixed(2)}`;
    }
    return "Location unknown";
  };

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 p-4 rounded-lg ${className || ''}`}>
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadFlights}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plane className="w-5 h-5" />
          Live Flights (OpenADSB)
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadFlights}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {flights.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No flights currently available</p>
            </div>
          ) : (
            flights.map((flight, index) => (
              <div 
                key={`${flight.flightId}-${index}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => onFlightSelect?.(flight)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{formatFlightNumber(flight)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {formatLocation(flight)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{flight.altitude.toLocaleString()} ft</div>
                    <div className="text-gray-600 dark:text-gray-400">{flight.groundspeed.toFixed(0)} kts</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
