"use client";

import NavBar from "@/components/NavBar";
import FlightMetrics from "@/components/FlightMetrics";
import FlightChart from "@/components/FlightChart";
import MapBackground from "@/components/MapBackground";
import WifiIndicator from "@/components/WifiIndicator";
import RotatingText from "@/components/ui/rorating-text";
import {
  FlightDataProvider,
  useFlightData,
} from "@/app/contexts/FlightDataContext";
import { useState } from "react";

function HomePage() {
  const { flightData, latestData, loading, error, hasLocationData, vendor } =
    useFlightData();
  const [hasMapData, setHasMapData] = useState(false);

  const airlines = [
    "American Airlines",
    "*Delta Air Lines",
    "*United Airlines",
    "*Southwest Airlines",
    "*JetBlue Airways",
    "*Alaska Airlines",
    "*Spirit Airlines",
    "*China Eastern Airlines",
    "*China Southern Airlines",
    "*Air China",
  ];

  return (
    <>
      <NavBar
        from={latestData.origin}
        to={latestData.destination}
        flightNumber={latestData.flightNumber}
        flightDuration={latestData.flightDuration}
        timeToGo={latestData.timeToGo}
        flightData={flightData}
        rightElement={<WifiIndicator />}
      />
      {!vendor ? (
        <div className="fixed inset-x-0 top-[64px] bottom-0 bg-background/95 backdrop-blur-sm z-40">
          <div className="h-full w-full flex flex-col items-center justify-center px-4">
            <div className="w-full text-center space-y-4">
              <h1 className="text-6xl inline-flex items-center justify-center gap-2">
                Connect to{" "}
                <RotatingText
                  texts={airlines}
                  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                />
                In-Flight WiFi
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                to continue tracking your flight in real-time
              </p>
              <p className="text-muted-foreground text-sm">
                * is the airline that will be supported in the future.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {hasLocationData && (
            <MapBackground
              flightData={flightData}
              hasMapData={hasMapData}
              setHasMapData={setHasMapData}
            />
          )}
          <main
            className={`container mx-auto p-4 space-y-4 transition-all duration-700 ${hasMapData ? "pt-[70vh]" : "pt-24"} overflow-x-hidden`}
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
      )}
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
