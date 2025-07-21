use serde::{Deserialize, Serialize};
use super::super::{FlightData, ToFlightData, DataSource};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdsbAircraftData {
    pub icao_address: String,
    pub hex_ident: String,
    pub callsign: Option<String>,
    pub airline: Option<String>,
    pub origin: Option<String>,
    pub destination: Option<String>,
    pub altitude: Option<f64>,
    pub speed: Option<f64>,
    pub heading: Option<f64>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub squawk: Option<String>,
    pub vertical_rate: Option<f64>,
    pub timestamp: i64,
    pub flight_id: String,
    pub aircraft_type: Option<String>,
    pub registration: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdsbFlightData {
    pub flight_id: String,
    pub icao_address: String,
    pub callsign: Option<String>,
    pub origin: Option<String>,
    pub destination: Option<String>,
    pub altitude: Option<f64>,
    pub speed: Option<f64>,
    pub heading: Option<f64>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub squawk: Option<String>,
    pub vertical_rate: Option<f64>,
    pub timestamp: i64,
    pub aircraft_type: Option<String>,
    pub registration: Option<String>,
    pub airline: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdsbApiResponse<T> {
    pub data: Vec<T>,
    pub count: Option<i32>,
    pub status: String,
}

impl ToFlightData for AdsbAircraftData {
    fn to_flight_data(&self) -> FlightData {
        FlightData {
            timestamp: chrono::DateTime::from_timestamp(self.timestamp, 0)
                .unwrap_or_else(|| chrono::Utc::now())
                .to_rfc3339(),
            eta: None,
            flight_duration: 0,
            flight_number: self.callsign.clone().unwrap_or_else(|| "N/A".to_string()),
            latitude: self.latitude.unwrap_or(0.0),
            longitude: self.longitude.unwrap_or(0.0),
            nose_id: self.registration.clone().unwrap_or_else(|| "N/A".to_string()),
            pa_state: None,
            vehicle_id: self.icao_address.clone(),
            destination: self.destination.clone().unwrap_or_else(|| "N/A".to_string()),
            origin: self.origin.clone().unwrap_or_else(|| "N/A".to_string()),
            flight_id: self.flight_id.clone(),
            airspeed: self.speed,
            air_temperature: None,
            altitude: self.altitude.unwrap_or(0.0) as i32,
            distance_to_go: None,
            door_state: None,
            groundspeed: self.speed.unwrap_or(0.0),
            heading: self.heading,
            time_to_go: 0,
            wheel_weight_state: "N/A".to_string(),
            gross_weight: None,
            wind_speed: None,
            wind_direction: None,
            flight_phase: if self.altitude.unwrap_or(0.0) > 1000.0 { 
                "Cruise".to_string() 
            } else { 
                "Ground".to_string() 
            },
        }
    }

    fn data_source() -> DataSource {
        DataSource::AdsbLol
    }
}
