import { invoke } from '@tauri-apps/api/core';
import { FlightData } from '@/types/flight';

export interface TauriFlightData {
  timestamp: string;
  eta: string | null;
  flight_duration: number;
  flight_number: string;
  latitude: number;
  longitude: number;
  nose_id: string;
  pa_state: string | null;
  vehicle_id: string;
  destination: string;
  origin: string;
  flight_id: string;
  airspeed: number | null;
  air_temperature: number | null;
  altitude: number;
  distance_to_go: number | null;
  door_state: string | null;
  groundspeed: number;
  heading: number | null;
  time_to_go: number;
  wheel_weight_state: string;
  gross_weight: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  flight_phase: string;
}

// Convert Rust snake_case to TypeScript camelCase
function convertTauriFlightData(data: TauriFlightData): FlightData {
  return {
    timestamp: data.timestamp,
    eta: data.eta,
    flightDuration: data.flight_duration,
    flightNumber: data.flight_number,
    latitude: data.latitude,
    longitude: data.longitude,
    noseId: data.nose_id,
    paState: data.pa_state,
    vehicleId: data.vehicle_id,
    destination: data.destination,
    origin: data.origin,
    flightId: data.flight_id,
    airspeed: data.airspeed,
    airTemperature: data.air_temperature,
    altitude: data.altitude,
    distanceToGo: data.distance_to_go,
    doorState: data.door_state,
    groundspeed: data.groundspeed,
    heading: data.heading,
    timeToGo: data.time_to_go,
    wheelWeightState: data.wheel_weight_state,
    grossWeight: data.gross_weight,
    windSpeed: data.wind_speed,
    windDirection: data.wind_direction,
    flightPhase: data.flight_phase,
  };
}

// Convert TypeScript camelCase to Rust snake_case
function convertToTauriFlightData(data: FlightData): TauriFlightData {
  return {
    timestamp: data.timestamp,
    eta: data.eta,
    flight_duration: data.flightDuration,
    flight_number: data.flightNumber,
    latitude: data.latitude,
    longitude: data.longitude,
    nose_id: data.noseId,
    pa_state: data.paState,
    vehicle_id: data.vehicleId,
    destination: data.destination,
    origin: data.origin,
    flight_id: data.flightId,
    airspeed: data.airspeed,
    air_temperature: data.airTemperature,
    altitude: data.altitude,
    distance_to_go: data.distanceToGo,
    door_state: data.doorState,
    groundspeed: data.groundspeed,
    heading: data.heading,
    time_to_go: data.timeToGo,
    wheel_weight_state: data.wheelWeightState,
    gross_weight: data.grossWeight,
    wind_speed: data.windSpeed,
    wind_direction: data.windDirection,
    flight_phase: data.flightPhase,
  };
}

export class TauriFlightAPI {
  
  /**
   * Get flight data from a specific vendor
   */
  static async getFlightData(vendor: string): Promise<FlightData> {
    const result = await invoke<TauriFlightData>('get_flight_data', { vendor });
    return convertTauriFlightData(result);
  }

  /**
   * Get flight data from a specific vendor with callsign (for ADSB)
   */
  static async getFlightDataWithCallsign(vendor: string, callsign: string): Promise<FlightData> {
    const result = await invoke<TauriFlightData>('get_flight_data_with_callsign', { vendor, callsign });
    return convertTauriFlightData(result);
  }

  /**
   * Detect all available vendors
   */
  static async detectVendors(): Promise<string[]> {
    return await invoke<string[]>('detect_vendors');
  }

  /**
   * Get the primary (highest priority) available vendor
   */
  static async getPrimaryVendor(): Promise<string | null> {
    return await invoke<string | null>('get_primary_vendor');
  }

  /**
   * Validate if a cached vendor is still working
   */
  static async validateVendor(vendor: string): Promise<boolean> {
    return await invoke<boolean>('validate_vendor', { vendor });
  }

  /**
   * Test if a vendor endpoint is available
   */
  static async testVendorEndpoint(vendor: string): Promise<boolean> {
    return await invoke<boolean>('test_vendor_endpoint', { vendor });
  }

  /**
   * Merge multiple flight data sources with priority
   */
  static async mergeFlightData(dataList: Array<[FlightData, string]>): Promise<FlightData | null> {
    const convertedDataList = dataList.map(([data, vendor]) => [
      convertToTauriFlightData(data),
      vendor
    ]);
    
    const result = await invoke<TauriFlightData | null>('merge_flight_data', { 
      dataList: convertedDataList 
    });
    
    return result ? convertTauriFlightData(result) : null;
  }

  /**
   * Get merged flight data from all available sources
   */
  static async getAllAvailableData(flightNumber?: string): Promise<FlightData | null> {
    const result = await invoke<TauriFlightData | null>('get_all_available_data_with_callsign', { 
      callsign: flightNumber || ''
    });
    return result ? convertTauriFlightData(result) : null;
  }

  /**
   * Get ADSB flight data by callsign
   */
  static async getAdsbFlightByCallsign(callsign: string): Promise<FlightData> {
    const result = await invoke<TauriFlightData>('get_adsb_flight_by_callsign', { callsign });
    return convertTauriFlightData(result);
  }

  /**
   * Get ADSB flight data by ICAO address
   */
  static async getAdsbFlightByIcao(icaoAddress: string): Promise<FlightData> {
    const result = await invoke<TauriFlightData>('get_adsb_flight_by_icao', { icaoAddress });
    return convertTauriFlightData(result);
  }

  /**
   * Get all current ADSB flights
   */
  static async getAllAdsbFlights(): Promise<FlightData[]> {
    const result = await invoke<TauriFlightData[]>('get_all_adsb_flights');
    return result.map(convertTauriFlightData);
  }

  /**
   * Get nearby ADSB flight callsigns by location
   */
  static async getNearbyAdsbCallsigns(latitude: number, longitude: number, distance: number = 250): Promise<string[]> {
    return await invoke<string[]>('get_nearby_adsb_callsigns', { latitude, longitude, distance });
  }
}

// Legacy compatibility - update existing fetch calls to use Tauri backend
export const TauriFlightService = {
  async fetchFlightData(vendor: string): Promise<FlightData> {
    return TauriFlightAPI.getFlightData(vendor);
  },

  async detectAvailableVendors(): Promise<string[]> {
    return TauriFlightAPI.detectVendors();
  },

  async validateVendor(vendor: string): Promise<boolean> {
    return TauriFlightAPI.validateVendor(vendor);
  },

  async getPrimaryVendor(): Promise<string | null> {
    return TauriFlightAPI.getPrimaryVendor();
  },

  async getMergedData(): Promise<FlightData | null> {
    return TauriFlightAPI.getAllAvailableData();
  }
};
