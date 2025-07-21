import { invoke } from "@tauri-apps/api/core";
import { FlightDataResponse } from "@/src/lib/types/flight_data";
import { Vendor } from "@/src/lib/types/vendor";
import { LocationData } from "@/src/lib/types/location_data";
// Using browser native geolocation instead of Tauri plugin due to permission issues

/**
 * Ping all vendors to check availability
 */
export async function pingVendors(): Promise<Vendor[]> {
  return await invoke<Vendor[]>("ping_vendors");
}

/**
 * Get nearby flights recommendation from ADSB
 */
export async function getFlightsRecommendation(
  squawk: number = 1200,
): Promise<string[]> {
  return await invoke<string[]>("get_flights_recommendation", {
    squawk,
  });
}

/**
 * Get merged flight data from specified vendors
 */
export async function getFlightData(
  callsign: string,
  vendors: Vendor[] = [],
): Promise<FlightDataResponse> {
  return await invoke<FlightDataResponse>("get_data", {
    callsign: callsign,
    vendors,
  });
}
