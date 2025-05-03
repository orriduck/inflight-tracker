"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { config } from "@/config/app";
import { FlightData } from "@/types/flight";
import { toast } from "sonner";

// Default flight data
const defaultData: FlightData = {
  timestamp: new Date().toISOString(),
  eta: null,
  flightDuration: 0,
  flightNumber: "N/A",
  latitude: 0,
  longitude: 0,
  noseId: "N/A",
  paState: null,
  vehicleId: "N/A",
  destination: "N/A",
  origin: "N/A",
  flightId: "N/A",
  airspeed: null,
  airTemperature: null,
  altitude: 0,
  distanceToGo: 0,
  doorState: "N/A",
  groundspeed: 0,
  heading: 0,
  timeToGo: 0,
  wheelWeightState: "N/A",
  grossWeight: null,
  windSpeed: null,
  windDirection: null,
  flightPhase: "N/A",
};

interface FlightDataContextType {
  flightData: FlightData[];
  latestData: FlightData;
  loading: boolean;
  error: string | null;
  hasLocationData: boolean;
  resetData: () => void;
}

const FlightDataContext = createContext<FlightDataContextType | undefined>(
  undefined,
);

// Helper to generate the localStorage key for a specific flight
const getFlightStorageKey = (flightNumber: string) =>
  `flightData-${flightNumber}`;

// Check if flight number is valid (just needs to be a non-empty string)
const isValidFlightNumber = (flightNumber?: string | null): boolean =>
  typeof flightNumber === "string" && flightNumber.trim() !== "";

export function FlightDataProvider({ children }: { children: ReactNode }) {
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFlightNumber, setCurrentFlightNumber] = useState<string | null>(
    null,
  );

  // Load saved data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // First fetch to determine the flight number
        const response = await fetch(config.apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch initial flight data");
        }

        const initialData = await response.json();
        const flightNumber = initialData.flightNumber;

        // Only proceed with localStorage if we have a valid flight number
        if (isValidFlightNumber(flightNumber)) {
          setCurrentFlightNumber(flightNumber);

          // Try to load saved data for this flight
          const storageKey = getFlightStorageKey(flightNumber);
          const savedData = localStorage.getItem(storageKey);

          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                setFlightData([...parsedData, initialData]);
                // Save the combined data back to localStorage
                localStorage.setItem(
                  storageKey,
                  JSON.stringify([...parsedData, initialData]),
                );
              } else {
                setFlightData([initialData]);
                localStorage.setItem(storageKey, JSON.stringify([initialData]));
              }
            } catch (err) {
              console.error("Error parsing saved flight data", err);
              setFlightData([initialData]);
              localStorage.setItem(storageKey, JSON.stringify([initialData]));
            }
          } else {
            // No saved data found, just use the initial fetch
            setFlightData([initialData]);
            localStorage.setItem(storageKey, JSON.stringify([initialData]));
          }
        } else {
          // No valid flight number, just use the initial data without localStorage
          console.log("No valid flight number found, not using localStorage");
          setFlightData([initialData]);
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Set up polling for ongoing data updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch flight data");
        }

        const data = await response.json();
        const flightNumber = data.flightNumber;

        // Only use localStorage if we have a valid flight number
        if (isValidFlightNumber(flightNumber)) {
          // If flight number changed, update the current flight number
          if (flightNumber !== currentFlightNumber) {
            setCurrentFlightNumber(flightNumber);
          }

          setFlightData((prevData) => {
            const newData = [...prevData, data];
            // Save to localStorage with flight-specific key
            const storageKey = getFlightStorageKey(flightNumber);
            localStorage.setItem(storageKey, JSON.stringify(newData));
            return newData;
          });
        } else {
          // Just update the state without localStorage
          setFlightData((prevData) => [...prevData, data]);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    // Set up polling
    const interval = setInterval(fetchData, config.pollingInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [currentFlightNumber]);

  const resetData = () => {
    if (currentFlightNumber && isValidFlightNumber(currentFlightNumber)) {
      const storageKey = getFlightStorageKey(currentFlightNumber);
      localStorage.removeItem(storageKey);
      toast.success(`Flight data for ${currentFlightNumber} has been reset`, {
        description: "Historical data has been cleared from your browser.",
        duration: 3000,
      });
    } else {
      toast.success("Flight data has been reset", {
        description: "All historical data has been cleared.",
        duration: 3000,
      });
    }
    setFlightData([]);
  };

  const latestData =
    flightData.length > 0 ? flightData[flightData.length - 1] : defaultData;
  const hasLocationData =
    latestData.latitude !== 0 && latestData.longitude !== 0;

  return (
    <FlightDataContext.Provider
      value={{
        flightData,
        latestData,
        loading,
        error,
        hasLocationData,
        resetData,
      }}
    >
      {children}
    </FlightDataContext.Provider>
  );
}

export function useFlightData() {
  const context = useContext(FlightDataContext);
  if (context === undefined) {
    throw new Error("useFlightData must be used within a FlightDataProvider");
  }
  return context;
}
