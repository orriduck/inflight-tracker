export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface NearbyFlightsRequest {
  location: LocationData;
  radius_km: number;
  max_results?: number;
}

export interface NearbyFlightsResponse {
  callsigns: string[];
  request: NearbyFlightsRequest;
  requested_at: string;
  total_found: number;
}

export enum LocationError {
  InvalidCoordinates = "InvalidCoordinates",
  PermissionDenied = "PermissionDenied", 
  ServiceUnavailable = "ServiceUnavailable",
  Timeout = "Timeout",
  Unknown = "Unknown"
}
