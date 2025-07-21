export enum Vendor {
  AdsbLol = 'adsb',
  AmericanIntelsat = 'american_intelsat', 
  AmericanViasat = 'american_viasat',
  JetBlue = 'jetblue'
}

export interface VendorStatus {
  vendor: Vendor;
  available: boolean;
  lastChecked: string;
}

export interface NearbyFlightsRecommendation {
  callsigns: string[];
  latitude: number;
  longitude: number;
  distance: number;
  requestedAt: string;
}

export interface FlightDataResponse {
  flightData: any; // Will use the existing FlightData type
  vendors: Vendor[];
  success: boolean;
}
