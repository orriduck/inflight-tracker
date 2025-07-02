import { NextResponse } from "next/server";
import { FlightData, AAIntelsatFlightData } from "@/types/flight";

const API_URL =
  "https://www.aainflight.com/api/v1/connectivity/intelsat/system-status";

function L2Calculation(a: number, b: number) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function mph2Knot(mphSpeed: number) {
  return 0.869 * mphSpeed;
}

/**
 * Maps Intelsat flight data to the universal FlightData format
 */
function mapIntelsatToFlightData(data: AAIntelsatFlightData): FlightData {
  return {
    timestamp: data.time_stamp,
    eta: null,
    flightDuration: Math.max(parseInt(data.flight_info.total_flight_duration_mins), parseInt(data.flight_info.time_to_land_mins)),
    flightNumber: data.flight_info.flight_no,
    latitude: parseFloat(data.positional_info.latitude),
    longitude: parseFloat(data.positional_info.longitude),
    noseId: "N/A",
    paState: data.service_info.flight_phase,
    vehicleId: data.aircraft_info.tail_no,
    destination: data.flight_info.arrival_airport_icao,
    origin: data.flight_info.departure_airport_icao,
    flightId: data.flight_info.flight_no,
    airspeed: null,
    airTemperature: mph2Knot(
      L2Calculation(
        parseFloat(data.positional_info.horizontal_velocity_mph),
        parseFloat(data.positional_info.vertical_velocity_mph),
      ),
    ),
    altitude: parseInt(data.positional_info.above_gnd_level_feet),
    distanceToGo: null,
    doorState: null,
    groundspeed: mph2Knot(parseFloat(data.positional_info.horizontal_velocity_mph)),
    heading: null,
    timeToGo: parseInt(data.flight_info.time_to_land_mins),
    wheelWeightState: "N/A",
    grossWeight: null,
    windSpeed: null,
    windDirection: null,
    flightPhase: data.service_info.flight_phase,
  };
}

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Disable caching to always get fresh data from external API
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AAIntelsatFlightData = await response.json();
    
    // Transform the Intelsat API response into our standardized FlightData format
    const flightData = mapIntelsatToFlightData(data);
    
    return NextResponse.json<FlightData>(flightData);
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight data" },
      { status: 500 },
    );
  }
}

// Example Data
// {
//   "time_stamp": "2025-05-17T22:59:58.386Z",
//   "aircraft_info": {
//       "tail_no": "N839AW",
//       "airline_code": "AAL",
//       "aircraft_type": "A319",
//       "wap_type": "ACWAP",
//       "wap_model": "ACWAP_301_NON_PINSTRAPPED",
//       "system_type": "2KU",
//       "arinc_enabled": true,
//       "cl_enabled": true,
//       "sub_system_type": "FM_KANDU_FM_CAPRICORN"
//   },
//   "software_info": {
//       "acpu_version": "4.1.5",
//       "whitelist_version": "3.D.0",
//       "acpu_uptime": "00d;17h;02m"
//   },
//   "positional_info": {
//       "above_gnd_level_feet": "469.589",
//       "latitude": "42.3559",
//       "longitude": "-71.0264",
//       "horizontal_velocity_mph": "0.0",
//       "vertical_velocity_mph": "0.011363637",
//       "above_sea_level_feet": "475.0",
//       "source": "ARINC_DIRECT"
//   },
//   "flight_info": {
//       "flight_no": "AAL2166",
//       "departure_airport_icao": "KBOS",
//       "arrival_airport_icao": "KPHL",
//       "scheduled_departure_time": "2025-05-17T23:31:00.00Z",
//       "departure_timezone_offset_hrs": "-4.0",
//       "departure_airport_iata": "BOS",
//       "arrival_airport_iata": "PHL",
//       "departure_time": "2025-05-17T23:31:00.00Z",
//       "arrival_time": "2025-05-18T00:32:00.00Z",
//       "scheduled_arrival_time": "2025-05-18T00:32:00.00Z",
//       "time_to_land_mins": "95",
//       "arrival_timezone_offset_hrs": "-4.0",
//       "total_flight_duration_mins": "61"
//   },
//   "service_info": {
//       "flight_phase": "GATE",
//       "link_state": "UP",
//       "tunnel_state": "UP",
//       "ifc_pax_service_state": "UP",
//       "pax_ssid_status": "UP",
//       "cas_ssid_status": "UP",
//       "country_code": "US",
//       "airport_code": "KBOS",
//       "link_type": "2KU",
//       "tunnel_type": "VTP",
//       "ifc_cas_service_state": "UP",
//       "customer_portal_state": "UNKNOWN",
//       "captive_portal_enabled": true,
//       "current_link_status_code": "3001",
//       "current_link_status_description": "NORMAL_OPERATION",
//       "expected_link_status_code": "3000",
//       "expected_link_status_description": "NOT_AVAILABLE",
//       "expected_time_to_no_coverage_sec": "NA",
//       "expected_time_to_coverage_sec": "NA"
//   }
// }
