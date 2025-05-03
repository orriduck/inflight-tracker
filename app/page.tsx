"use client";

import NavBar from "@/components/NavBar";
import FlightMetrics from "@/components/FlightMetrics";
import FlightChart from "@/components/FlightChart";
import MapBackground from "@/components/MapBackground";
import {
  FlightDataProvider,
  useFlightData,
} from "@/app/contexts/FlightDataContext";
import { useState } from "react";

function HomePage() {
  const { flightData, latestData, loading, error, hasLocationData } =
    useFlightData();
  const [hasMapData, setHasMapData] = useState(false);

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
      {hasLocationData && (
        <MapBackground
          flightData={flightData}
          hasMapData={hasMapData}
          setHasMapData={setHasMapData}
        />
      )}
      <main
        className={`container mx-auto p-4 space-y-4 transition-all duration-700 ${hasMapData ? "pt-[75vh]" : "pt-24"}`}
      >
        <div className={`${hasMapData ? "rounded-lg" : ""}`}>
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

export default function Home() {
  return (
    <FlightDataProvider>
      <HomePage />
    </FlightDataProvider>
  );
}
