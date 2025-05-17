import { NextResponse } from "next/server";
import { AAViaSatFlightData, FlightData } from "@/types/flight";

const API_URL = "https://www.aainflight.com/api/v1/connectivity/viasat/flight";

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AAViaSatFlightData = await response.json();
    
    // Transform the ViaSat API response into our standardized FlightData format
    return NextResponse.json<FlightData>({
      timestamp: data.timestamp,
      eta: data.eta,
      flightDuration: data.flightDuration,
      flightNumber: data.flightNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      noseId: data.noseId,
      paState: data.paState,
      vehicleId: data.vehicleId,
      destination: data.destination,
      origin: data.origin,
      flightId: data.flightId,
      airspeed: data.airspeed,
      airTemperature: data.airTemperature,
      altitude: data.altitude,
      distanceToGo: data.distanceToGo,
      doorState: data.doorState,
      groundspeed: data.groundspeed,
      heading: data.heading,
      timeToGo: data.timeToGo,
      wheelWeightState: data.wheelWeightState,
      grossWeight: data.grossWeight,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      flightPhase: data.flightPhase,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight data" },
      { status: 500 },
    );
  }
}
