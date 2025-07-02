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
  vendor: string | null | undefined;
  resetData: () => void;
  isFlightNumberMissing: boolean;
}

const FlightDataContext = createContext<FlightDataContextType | undefined>(
  undefined,
);

// Helper to generate the localStorage key for a specific flight
const getFlightStorageKey = (flightNumber: string) =>
  `flightData-${flightNumber}`;

// Helper to generate the localStorage key for cached vendor
const getVendorStorageKey = () => `cachedVendor`;

// Check if flight number is valid (just needs to be a non-empty string)
const isValidFlightNumber = (flightNumber?: string | null): boolean =>
  typeof flightNumber === "string" && flightNumber.trim() !== "";

// Helper to detect available vendor
const detectVendor = async (): Promise<string | null> => {
  const uris = Object.entries(config.flightInfoUri);

  for (const [vendor, uri] of uris) {
    try {
      const response = await fetch(uri);
      if (response.ok) {
        return vendor;
      }
    } catch (err) {
      console.warn(`Failed to connect to ${vendor} endpoint:`, err);
    }
  }
  return null;
};

// Helper to validate if a cached vendor is still working
const validateVendor = async (vendor: string): Promise<boolean> => {
  try {
    const uri = config.flightInfoUri[vendor as keyof typeof config.flightInfoUri];
    if (!uri) return false;
    
    const response = await fetch(uri);
    return response.ok;
  } catch (err) {
    console.warn(`Cached vendor ${vendor} is no longer working:`, err);
    return false;
  }
};

// Helper to get cached vendor or detect new one
const getOrDetectVendor = async (): Promise<string | null> => {
  // Try to get cached vendor first
  const cachedVendor = localStorage.getItem(getVendorStorageKey());
  
  if (cachedVendor) {
    // Validate if cached vendor is still working
    const isValid = await validateVendor(cachedVendor);
    if (isValid) {
      console.log(`Using cached vendor: ${cachedVendor}`);
      return cachedVendor;
    } else {
      console.log(`Cached vendor ${cachedVendor} is no longer working, detecting new vendor...`);
      localStorage.removeItem(getVendorStorageKey());
    }
  }
  
  // Detect new vendor
  const newVendor = await detectVendor();
  if (newVendor) {
    console.log(`Detected new vendor: ${newVendor}`);
    localStorage.setItem(getVendorStorageKey(), newVendor);
  }
  
  return newVendor;
};

export function FlightDataProvider({ children }: { children: ReactNode }) {
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFlightNumber, setCurrentFlightNumber] = useState<string | null>(
    null,
  );
  const [vendor, setVendor] = useState<string | null | undefined>(undefined);
  const [isFlightNumberMissing, setIsFlightNumberMissing] = useState(false);

  // Lazy vendor detection on component mount
  useEffect(() => {
    const initializeVendor = async () => {
      const detectedVendor = await getOrDetectVendor();
      setVendor(detectedVendor);
    };
    initializeVendor();
  }, []);

  // Load saved data when component mounts and vendor is detected
  useEffect(() => {
    if (vendor === undefined) return; // Wait for vendor detection

    const fetchInitialData = async () => {
      try {
        if (!vendor) {
          throw new Error("No available flight data vendors");
        }

        // Fetch using detected vendor
        const response = await fetch(
          config.flightInfoUri[vendor as keyof typeof config.flightInfoUri],
        );
        if (!response.ok) {
          throw new Error("Failed to fetch initial flight data");
        }

        const initialData = await response.json();
        const flightNumber = initialData.flightNumber;

        // Only proceed with localStorage if we have a valid flight number
        if (isValidFlightNumber(flightNumber)) {
          setCurrentFlightNumber(flightNumber);
          setIsFlightNumberMissing(false);

          // Try to load saved data for this flight
          const storageKey = getFlightStorageKey(flightNumber);
          const savedData = localStorage.getItem(storageKey);

          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                setFlightData([...parsedData, initialData]);
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
            setFlightData([initialData]);
            localStorage.setItem(storageKey, JSON.stringify([initialData]));
          }
        } else {
          console.log("No valid flight number found, not using localStorage");
          setFlightData([initialData]);
          setIsFlightNumberMissing(true);
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [vendor]);

  // Set up polling for ongoing data updates
  useEffect(() => {
    if (!vendor) return; // Don't poll if no vendor is available

    const fetchData = async () => {
      try {
        const response = await fetch(
          config.flightInfoUri[vendor as keyof typeof config.flightInfoUri],
        );
        if (!response.ok) {
          throw new Error("Failed to fetch flight data");
        }

        const data = await response.json();
        const flightNumber = data.flightNumber;

        // Only use localStorage if we have a valid flight number
        if (isValidFlightNumber(flightNumber)) {
          if (flightNumber !== currentFlightNumber) {
            setCurrentFlightNumber(flightNumber);
          }
          setIsFlightNumberMissing(false);

          setFlightData((prevData) => {
            const newData = [...prevData, data];
            const storageKey = getFlightStorageKey(flightNumber);
            localStorage.setItem(storageKey, JSON.stringify(newData));
            return newData;
          });
        } else {
          setFlightData((prevData) => [...prevData, data]);
          setIsFlightNumberMissing(true);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        
        // If vendor fails, try to detect a new one
        console.log("Vendor failed, attempting to detect new vendor...");
        const newVendor = await getOrDetectVendor();
        if (newVendor && newVendor !== vendor) {
          setVendor(newVendor);
        }
      }
    };

    const interval = setInterval(fetchData, config.pollingInterval);
    return () => clearInterval(interval);
  }, [vendor, currentFlightNumber]);

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
        vendor,
        resetData,
        isFlightNumberMissing,
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
