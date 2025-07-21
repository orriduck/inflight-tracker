import { Vendor } from "./vendor";

export interface FlightData {
  timestamp: string;
  eta?: string;
  flightDuration: number;
  flightNumber: string;
  latitude: number;
  longitude: number;
  noseId: string;
  paState?: string;
  vehicleId: string;
  destination: string;
  origin: string;
  flightId: string;
  airspeed?: number;
  airTemperature?: number;
  altitude: number;
  distanceToGo?: number;
  doorState?: string;
  groundspeed: number;
  heading?: number;
  timeToGo: number;
  wheelWeightState: string;
  grossWeight?: number;
  windSpeed?: number;
  windDirection?: number;
  flightPhase: string;
}

export interface FlightDataResponse {
  flightData?: FlightData;
  vendors: Vendor[];
  success: boolean;
  errors: string[];
}
