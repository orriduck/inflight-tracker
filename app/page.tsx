'use client';

import { useEffect, useState } from 'react';
import { config } from '@/config/app';
import { FlightData } from '@/types/flight';
import NavBar from '@/components/NavBar';
import FlightMetrics from '@/components/FlightMetrics';
import FlightChart from '@/components/FlightChart';
import MapBackground from '@/components/MapBackground';

export default function Home() {
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMapData, setHasMapData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        const data = await response.json();
        setFlightData(prevData => [...prevData, data]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, config.pollingInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const defaultData: FlightData = {
    timestamp: new Date().toISOString(),
    eta: null,
    flightDuration: 0,
    flightNumber: 'N/A',
    latitude: 0,
    longitude: 0,
    noseId: 'N/A',
    paState: null,
    vehicleId: 'N/A',
    destination: 'N/A',
    origin: 'N/A',
    flightId: 'N/A',
    airspeed: null,
    airTemperature: null,
    altitude: 0,
    distanceToGo: 0,
    doorState: 'N/A',
    groundspeed: 0,
    heading: 0,
    timeToGo: 0,
    wheelWeightState: 'N/A',
    grossWeight: null,
    windSpeed: null,
    windDirection: null,
    flightPhase: 'N/A'
  };

  const latestData = flightData[flightData.length - 1] || defaultData;

  // Check if there's location data in the latest flight data
  const hasLocationData = latestData.latitude !== 0 && latestData.longitude !== 0;

  return (
    <>
      <NavBar 
        from={latestData.origin}
        to={latestData.destination}
        flightNumber={latestData.flightNumber}
        flightDuration={latestData.flightDuration}
        timeToGo={latestData.timeToGo}
        flightData={flightData}
      />
      {hasLocationData && 
        <MapBackground 
          flightData={flightData} 
          hasMapData={hasMapData} 
          setHasMapData={setHasMapData} 
        />
      }
      <main className={`container mx-auto p-4 space-y-4 transition-all duration-700 ${hasMapData ? 'pt-[75vh]' : 'pt-24'}`}>
        <div className={`${hasMapData ? 'rounded-lg' : ''}`}>
          <div className="container mx-auto space-y-4 p-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
                Error: {error}
              </div>
            )}
            {loading && (
              <div className="text-muted-foreground px-4 py-2">
                Loading flight data...
              </div>
            )}
            {/* Flight Metrics */}
            <FlightMetrics data={latestData} loading={loading} />
            {/* Chart */}
            <FlightChart flightData={flightData} />
          </div>
        </div>
      </main>
    </>
  );
}
