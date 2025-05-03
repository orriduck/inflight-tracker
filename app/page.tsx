'use client';

import { useEffect, useState } from 'react';
import { config } from '@/config/app';
import { FlightData } from '@/types/flight';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <main className="container mx-auto p-4 space-y-4 pt-20">
        {/* Flight Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Altitude</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestData?.altitude || 0} ft</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ground Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestData?.groundspeed || 0} knots</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Heading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latestData?.heading || 0}°</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Altitude Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="altitude" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
