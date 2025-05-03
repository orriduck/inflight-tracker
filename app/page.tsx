'use client';

import { useEffect, useState } from 'react';
import { config } from '@/config/app';
import { FlightData } from '@/types/flight';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FlightMetrics from '@/components/FlightMetrics';
import FlightChart from '@/components/FlightChart';

export default function Home() {
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-4">Loading flight data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const latestData = flightData[flightData.length - 1];

  return (
    <>
      <NavBar 
        from={latestData?.origin}
        to={latestData?.destination}
        flightNumber={latestData?.flightNumber}
        flightDuration={latestData?.flightDuration}
        timeToGo={latestData?.timeToGo}
        flightData={flightData}
      />
      <main className="container mx-auto p-4 space-y-4 pt-24">
        {/* Flight Metrics */}
        <FlightMetrics data={latestData} />
        {/* Chart */}
        <FlightChart flightData={flightData} />
      </main>
    </>
  );
}
