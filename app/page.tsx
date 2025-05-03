'use client';

import { useEffect, useState } from 'react';
import FlightMetrics from "@/components/FlightMetrics";
import FlightChart from "@/components/FlightChart";
import BigBanner from "@/components/BigBanner";
import WifiIndicator from "@/components/WifiIndicator";
import { FlightData } from "@/types/flight";
import { config } from "@/config/app";

export default function Home() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.apiUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFlightData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch flight data:', error);
        setError('Failed to fetch flight data');
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling using the configured interval
    const intervalId = setInterval(fetchData, config.pollingInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <h1 className="text-2xl text-red-500">Unable to fetch flight data</h1>
        <p className="text-gray-600">Please check your connection and try again</p>
      </div>
    );
  }

  if (!flightData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <h1 className="text-2xl">Loading flight data...</h1>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <WifiIndicator />
      {/* Header section with centered title */}
      <div className="flex justify-center items-center h-[70vh]">
        <h1 className="text-7xl font-bold text-center">Inflight Tracker</h1>
      </div>
      
      {/* Content section */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 gap-12">
          {/* Banner with flight information */}
          <BigBanner 
            from={flightData.origin}
            to={flightData.destination}
            flightNumber={flightData.flightNumber}
            flightDuration={flightData.flightDuration}
            timeToGo={flightData.timeToGo}
          />
          
          {/* Metrics board */}
          <FlightMetrics data={flightData} />

          {/* Flight chart visualization */}
          <FlightChart data={[flightData]} />
        </div>
      </div>
    </div>
  );
}
