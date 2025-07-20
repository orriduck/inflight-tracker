"use client";

import { useState, useEffect } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import GlassCard from "@/components/buouui/glass-card";
import StatusBar from "@/components/ui/status-bar";
import FlightSearch from "@/components/FlightSearch";
import { TauriFlightService } from "@/lib/tauri-api";
import { FlightData } from "@/types/flight";
import { useRouter } from "next/navigation";

type VendorStatus = "idle" | "checking" | "success" | "error";

export default function Home() {
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();

  const handleFlightFound = (flightData: FlightData) => {
    // Extract flight number from flightNumber or flightId
    const flightId = flightData.flightNumber || flightData.flightId || 'unknown';
    router.push(`/tracker/${flightId}`);
  };

  const handleSearchError = (error: string) => {
    setSearchError(error);
    // Clear error after 5 seconds
    setTimeout(() => setSearchError(null), 5000);
  };

  const checkVendorAvailability = async () => {
    try {
      setVendorStatus("checking");
      setStatusMessage("Checking flight data providers...");

      // Start checking vendors
      const vendors = await TauriFlightService.detectAvailableVendors();

      if (vendors.length > 0) {
        setVendorStatus("success");
        setStatusMessage(
          `Connected to ${vendors.length} provider${vendors.length > 1 ? "s" : ""}`,
        );
        setAvailableVendors(
          vendors.map((vendor) => {
            // Format vendor names for display
            switch (vendor) {
              case "american-intelsat":
                return "American Airlines (Intelsat)";
              case "american-viasat":
                return "American Airlines (ViaSat)";
              case "jetblue":
                return "JetBlue";
              case "adsb":
                return "OpenADSB Network";
              default:
                return vendor;
            }
          }),
        );
      } else {
        setVendorStatus("error");
        setStatusMessage("No flight data providers available");
        setAvailableVendors([]);
      }
    } catch (error) {
      console.error("Error checking vendors:", error);
      setVendorStatus("error");
      setStatusMessage("Failed to connect to flight data providers");
      setAvailableVendors([]);
    }
  };

  useEffect(() => {
    // Check vendor availability when page loads
    checkVendorAvailability();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-8">
          {/* Title */}
          <h1 className="text-6xl lg:text-7xl font-bold">Inflight Tracker</h1>

          {/* Enhanced Flight Search with Autocomplete */}
          <div className="w-full max-w-2xl mx-auto">
            <GlassCard className="p-6">
              <FlightSearch
                onFlightFound={handleFlightFound}
                onError={handleSearchError}
                className="w-full"
              />
            </GlassCard>
            
            {/* Search Error Display */}
            {searchError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {searchError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="pb-8 flex justify-center items-center gap-4">
        <StatusBar
          status={vendorStatus}
          message={statusMessage}
          vendors={availableVendors}
        />
        <GlassCard
          variant="button"
          className="p-3 flex items-center rounded-full hover:bg-accent/50"
          onClick={checkVendorAvailability}
        >
          <RefreshCw
            className={`size-3 ${vendorStatus === "checking" ? "animate-spin" : ""}`}
          />
        </GlassCard>
      </div>
    </div>
  );
}
