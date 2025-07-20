"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { TauriFlightAPI } from "@/lib/tauri-api";
import { FlightData } from "@/types/flight";

interface VendorData {
  vendor: string;
  data: FlightData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date;
}

function VendorDebugCard({ vendorData }: { vendorData: VendorData }) {
  const statusColor = vendorData.error 
    ? "border-red-500 bg-red-500/10" 
    : vendorData.data 
      ? "border-green-500 bg-green-500/10" 
      : "border-yellow-500 bg-yellow-500/10";

  return (
    <div className={`border rounded-lg p-4 ${statusColor}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{vendorData.vendor}</h3>
        <div className="flex items-center gap-2">
          {vendorData.loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-xs text-gray-500">
            {vendorData.lastFetch.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {vendorData.error && (
        <div className="text-red-600 text-sm mb-2">
          Error: {vendorData.error}
        </div>
      )}

      {vendorData.data && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Flight:</strong> {vendorData.data.flightNumber}</div>
          <div><strong>Altitude:</strong> {vendorData.data.altitude}ft</div>
          <div><strong>Speed:</strong> {vendorData.data.groundspeed}kt</div>
          <div><strong>Heading:</strong> {vendorData.data.heading}°</div>
          <div><strong>Lat:</strong> {vendorData.data.latitude.toFixed(4)}</div>
          <div><strong>Lng:</strong> {vendorData.data.longitude.toFixed(4)}</div>
          <div><strong>Origin:</strong> {vendorData.data.origin}</div>
          <div><strong>Dest:</strong> {vendorData.data.destination}</div>
        </div>
      )}
    </div>
  );
}

function MergedDataCard({ mergedData }: { mergedData: FlightData | null }) {
  if (!mergedData) {
    return (
      <div className="border border-gray-500 bg-gray-500/10 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">Merged Data (Priority-based)</h3>
        <p className="text-gray-500">No merged data available</p>
      </div>
    );
  }

  return (
    <div className="border border-blue-500 bg-blue-500/10 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4">Merged Data (Priority-based)</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><strong>Flight Number:</strong> {mergedData.flightNumber}</div>
        <div><strong>Altitude:</strong> {mergedData.altitude} ft</div>
        <div><strong>Ground Speed:</strong> {mergedData.groundspeed} kt</div>
        <div><strong>Air Speed:</strong> {mergedData.airspeed || 'N/A'} kt</div>
        <div><strong>Heading:</strong> {mergedData.heading}°</div>
        <div><strong>Latitude:</strong> {mergedData.latitude.toFixed(6)}</div>
        <div><strong>Longitude:</strong> {mergedData.longitude.toFixed(6)}</div>
        <div><strong>Origin:</strong> {mergedData.origin}</div>
        <div><strong>Destination:</strong> {mergedData.destination}</div>
        <div><strong>Flight Phase:</strong> {mergedData.flightPhase}</div>
        <div><strong>Time to Go:</strong> {mergedData.timeToGo} min</div>
        <div><strong>Distance to Go:</strong> {mergedData.distanceToGo || 'N/A'} nm</div>
        <div><strong>Air Temperature:</strong> {mergedData.airTemperature || 'N/A'}°C</div>
        <div><strong>Wind Speed:</strong> {mergedData.windSpeed || 'N/A'} kt</div>
        <div><strong>Wind Direction:</strong> {mergedData.windDirection || 'N/A'}°</div>
        <div><strong>Gross Weight:</strong> {mergedData.grossWeight || 'N/A'} lbs</div>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Last Updated: {new Date(mergedData.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

export default function TrackerDebug() {
  const params = useParams();
  const router = useRouter();
  const flightNumber = params.flightNumber as string;
  const queryClient = useQueryClient();
  
  const [vendorDataList, setVendorDataList] = useState<VendorData[]>([]);

  // Query to detect available vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => TauriFlightAPI.detectVendors(),
    refetchInterval: (data) => {
      // If no vendors found, check every 10 seconds
      // If vendors found, check less frequently (30 seconds) to detect changes
      return !data || (Array.isArray(data) && data.length === 0) ? 10000 : 30000;
    },
  });

  // Query for merged data from all vendors
  const { data: mergedData, isLoading: isMergedDataLoading, error: mergedDataError } = useQuery({
    queryKey: ['mergedFlightData', flightNumber],
    queryFn: async () => {
      console.log(`🔄 Frontend: Calling getAllAvailableData for ${flightNumber}, vendors: ${vendors.join(', ')}`);
      try {
        const result = await TauriFlightAPI.getAllAvailableData(flightNumber);
        console.log(`✅ Frontend: Successfully got merged data for ${flightNumber}:`, result);
        return result;
      } catch (error) {
        console.error(`❌ Frontend: Failed to get merged data for ${flightNumber}:`, error);
        throw error;
      }
    },
    refetchInterval: vendors.length > 0 ? 1000 : false, // Update every second only when vendors available
    enabled: vendors.length > 0 && !!flightNumber,
    retry: 3,
  });

  // Query for ADSB data by callsign (fallback when no in-flight vendors)
  const { data: adsbData } = useQuery({
    queryKey: ['adsbFlightData', flightNumber],
    queryFn: () => TauriFlightAPI.getAdsbFlightByCallsign(flightNumber),
    refetchInterval: 1000,
    enabled: !!flightNumber && vendors.length === 0,
    retry: false,
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Flight Data Debug Console</h1>
          <p className="text-xl text-blue-200">
            Tracking: <span className="font-mono font-bold">{flightNumber}</span>
          </p>
          <p className="text-sm text-blue-300 mt-2">
            {vendors.length > 0 ? 'Real-time data from multiple vendors • Updates every second' : 'Searching for in-flight vendors • Checking every 10 seconds'}
          </p>
        </div>

        {/* Vendor Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
          <h2 className="text-xl font-semibold mb-3">Vendor Status</h2>
          <div className="flex flex-wrap gap-2">
            {vendors.length === 0 ? (
              <span className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm">
                No in-flight vendors detected - Using ADSB fallback
              </span>
            ) : (
              vendors.map((vendor) => (
                <span 
                  key={vendor}
                  className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm"
                >
                  {vendor}
                </span>
              ))
            )}
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Priority Order: American Intelsat (10) → American ViaSat (9) → JetBlue (8) → ADSB.lol (7)
          </p>
        </div>

        {/* Merged Data Section */}
        <div className="text-white">
          <h2 className="text-2xl font-semibold mb-4">Final Merged Data Output</h2>
          {isMergedDataLoading && vendors.length > 0 && (
            <div className="border border-blue-500 bg-blue-500/10 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Fetching real-time data from vendors...</span>
              </div>
            </div>
          )}
          {mergedDataError && vendors.length > 0 && (
            <div className="border border-red-500 bg-red-500/10 rounded-lg p-4 mb-4">
              <span className="text-red-300">Error fetching vendor data: {mergedDataError.message}</span>
            </div>
          )}
          <MergedDataCard mergedData={mergedData || adsbData || null} />
        </div>



        {/* ADSB Fallback */}
        {vendors.length === 0 && (
          <div className="text-white">
            <h2 className="text-2xl font-semibold mb-4">ADSB Fallback Data</h2>
            {adsbData ? (
              <VendorDebugCard 
                vendorData={{
                  vendor: "ADSB.lol (Fallback)",
                  data: adsbData,
                  loading: false,
                  error: null,
                  lastFetch: new Date()
                }}
              />
            ) : (
              <div className="border border-gray-500 bg-gray-500/10 rounded-lg p-4">
                <p className="text-gray-400">Loading ADSB data for {flightNumber}...</p>
              </div>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Available Vendors:</strong> {vendors.join(", ") || "None"}
            </div>
            <div>
              <strong>Data Updates:</strong> {vendors.length > 0 ? 'Every 1 second' : 'ADSB fallback active'}
            </div>
            <div>
              <strong>Vendor Scan Frequency:</strong> {vendors.length === 0 ? 'Every 10 seconds' : 'Every 30 seconds'}
            </div>
            <div>
              <strong>Merged Query Enabled:</strong> {vendors.length > 0 && !!flightNumber ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Merged Query Loading:</strong> {isMergedDataLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Flight Number:</strong> {flightNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
