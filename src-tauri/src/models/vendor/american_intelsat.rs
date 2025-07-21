use serde::{Deserialize, Serialize};
use super::super::{FlightData, ToFlightData, DataSource};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AircraftInfo {
    pub tail_no: String,
    pub airline_code: String,
    pub aircraft_type: String,
    pub wap_type: String,
    pub wap_model: String,
    pub system_type: String,
    pub arinc_enabled: bool,
    pub cl_enabled: bool,
    pub sub_system_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareInfo {
    pub acpu_version: String,
    pub whitelist_version: String,
    pub acpu_uptime: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionalInfo {
    pub above_gnd_level_feet: String,
    pub latitude: String,
    pub longitude: String,
    pub horizontal_velocity_mph: String,
    pub vertical_velocity_mph: String,
    pub above_sea_level_feet: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlightInfo {
    pub flight_no: String,
    pub departure_airport_icao: String,
    pub arrival_airport_icao: String,
    pub scheduled_departure_time: String,
    pub departure_timezone_offset_hrs: String,
    pub departure_airport_iata: String,
    pub arrival_airport_iata: String,
    pub departure_time: String,
    pub arrival_time: String,
    pub scheduled_arrival_time: String,
    pub time_to_land_mins: String,
    pub arrival_timezone_offset_hrs: String,
    pub total_flight_duration_mins: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub flight_phase: String,
    pub link_state: String,
    pub tunnel_state: String,
    pub ifc_pax_service_state: String,
    pub pax_ssid_status: String,
    pub cas_ssid_status: String,
    pub country_code: String,
    pub airport_code: String,
    pub link_type: String,
    pub tunnel_type: String,
    pub ifc_cas_service_state: String,
    pub customer_portal_state: String,
    pub captive_portal_enabled: bool,
    pub current_link_status_code: String,
    pub current_link_status_description: String,
    pub expected_link_status_code: String,
    pub expected_link_status_description: String,
    pub expected_time_to_no_coverage_sec: String,
    pub expected_time_to_coverage_sec: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AAIntelsatFlightData {
    pub time_stamp: String,
    pub aircraft_info: AircraftInfo,
    pub software_info: SoftwareInfo,
    pub positional_info: PositionalInfo,
    pub flight_info: FlightInfo,
    pub service_info: ServiceInfo,
}

// Utility functions
fn l2_calculation(a: f64, b: f64) -> f64 {
    (a.powi(2) + b.powi(2)).sqrt()
}

fn mph_to_knot(mph_speed: f64) -> f64 {
    0.869 * mph_speed
}

fn parse_string_to_f64(s: &str) -> f64 {
    s.parse().unwrap_or(0.0)
}

fn parse_string_to_i32(s: &str) -> i32 {
    s.parse().unwrap_or(0)
}

impl ToFlightData for AAIntelsatFlightData {
    fn to_flight_data(&self) -> FlightData {
        let horizontal_velocity = parse_string_to_f64(&self.positional_info.horizontal_velocity_mph);
        let vertical_velocity = parse_string_to_f64(&self.positional_info.vertical_velocity_mph);
        let total_velocity = l2_calculation(horizontal_velocity, vertical_velocity);
        
        FlightData {
            timestamp: self.time_stamp.clone(),
            eta: None,
            flight_duration: std::cmp::max(
                parse_string_to_i32(&self.flight_info.total_flight_duration_mins),
                parse_string_to_i32(&self.flight_info.time_to_land_mins)
            ),
            flight_number: self.flight_info.flight_no.clone(),
            latitude: parse_string_to_f64(&self.positional_info.latitude),
            longitude: parse_string_to_f64(&self.positional_info.longitude),
            nose_id: "N/A".to_string(),
            pa_state: Some(self.service_info.flight_phase.clone()),
            vehicle_id: self.aircraft_info.tail_no.clone(),
            destination: self.flight_info.arrival_airport_icao.clone(),
            origin: self.flight_info.departure_airport_icao.clone(),
            flight_id: self.flight_info.flight_no.clone(),
            airspeed: None,
            air_temperature: Some(mph_to_knot(total_velocity)),
            altitude: parse_string_to_i32(&self.positional_info.above_gnd_level_feet),
            distance_to_go: None,
            door_state: None,
            groundspeed: mph_to_knot(horizontal_velocity),
            heading: None,
            time_to_go: parse_string_to_i32(&self.flight_info.time_to_land_mins),
            wheel_weight_state: "N/A".to_string(),
            gross_weight: None,
            wind_speed: None,
            wind_direction: None,
            flight_phase: self.service_info.flight_phase.clone(),
        }
    }

    fn data_source() -> DataSource {
        DataSource::AmericanIntelsat
    }
}
