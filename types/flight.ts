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

export interface AAViaSatFlightData extends FlightData {}

export interface AAIntelsatFlightData {
  time_stamp: string;
  aircraft_info: {
    tail_no: string;
    airline_code: string;
    aircraft_type: string;
    wap_type: string;
    wap_model: string;
    system_type: string;
    arinc_enabled: boolean;
    cl_enabled: boolean;
    sub_system_type: string;
  };
  software_info: {
    acpu_version: string;
    whitelist_version: string;
    acpu_uptime: string;
  };
  positional_info: {
    above_gnd_level_feet: string;
    latitude: string;
    longitude: string;
    horizontal_velocity_mph: string;
    vertical_velocity_mph: string;
    above_sea_level_feet: string;
    source: string;
  };
  flight_info: {
    flight_no: string;
    departure_airport_icao: string;
    arrival_airport_icao: string;
    scheduled_departure_time: string;
    departure_timezone_offset_hrs: string;
    departure_airport_iata: string;
    arrival_airport_iata: string;
    departure_time: string;
    arrival_time: string;
    scheduled_arrival_time: string;
    time_to_land_mins: string;
    arrival_timezone_offset_hrs: string;
    total_flight_duration_mins: string;
  };
  service_info: {
    flight_phase: string;
    link_state: string;
    tunnel_state: string;
    ifc_pax_service_state: string;
    pax_ssid_status: string;
    cas_ssid_status: string;
    country_code: string;
    airport_code: string;
    link_type: string;
    tunnel_type: string;
    ifc_cas_service_state: string;
    customer_portal_state: string;
    captive_portal_enabled: boolean;
    current_link_status_code: string;
    current_link_status_description: string;
    expected_link_status_code: string;
    expected_link_status_description: string;
    expected_time_to_no_coverage_sec: string;
    expected_time_to_coverage_sec: string;
  };
}

export interface JetBlueFlightData {
  destinationIATA: string | null;
  eventType: string;
  flightETA: string | null;
  flightRunningStatus: number;
  flightStatusText: string | null;
  flightTotalDuration: number;
  markers: string | null;
  message: string;
  originIATA: string | null;
  promotionText: string | null;
  showWelcomeText: boolean;
  timeToArrival: string | null;
  welcomeText: string | null;
  altitude?: number | null;
  groundspeed?: number | null;
  terminal?: string | null;
  gate?: string | null;
  currentTemp?: string | null;
  todayWeather?: string | null;
  tomorrowWeather?: string | null;
  lastUpdated?: string | null;
  originCity?: string | null;
  destinationCity?: string | null;
}
