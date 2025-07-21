export interface FlightData {
  timestamp: string;
  eta: string | null;
  flightDuration: number;
  flightNumber: string;
  latitude: number;
  longitude: number;
  noseId: string;
  paState: string | null;
  vehicleId: string;
  destination: string;
  origin: string;
  flightId: string;
  airspeed: number | null;
  airTemperature: number | null;
  altitude: number;
  distanceToGo: number | null;
  doorState: string | null;
  groundspeed: number;
  heading: number | null;
  timeToGo: number;
  wheelWeightState: string;
  grossWeight: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  flightPhase: string;
}
