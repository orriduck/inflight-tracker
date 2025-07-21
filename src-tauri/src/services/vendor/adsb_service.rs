use reqwest::Client;
use serde_json::Value;
use std::time::Duration;
use crate::models::FlightData;

#[derive(Debug, Clone)]
pub struct AdsbService {
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum AdsbError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("No flight data available")]
    NoDataAvailable,
    #[error("Callsign required for ADSB")]
    CallsignRequired,
}

impl AdsbService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self { client }
    }

    /// Test if the vendor endpoint is available
    pub async fn ping_vendor(&self) -> bool {
        use tokio::net::TcpStream;
        use std::time::Duration;
        
        let host = "api.adsb.lol";
        let port = 80;
        let timeout = Duration::from_secs(5);
        
        match tokio::time::timeout(timeout, TcpStream::connect((host, port))).await {
            Ok(Ok(_)) => {
                log::info!("ADSB TCP connection successful ({}:{})", host, port);
                true
            },
            Ok(Err(error)) => {
                log::error!("ADSB TCP connection failed: {}", error);
                false
            },
            Err(_) => {
                log::error!("ADSB TCP connection timeout ({}:{})", host, port);
                false
            }
        }
    }

    /// Get flight data by callsign (callsign is required for ADSB)
    pub async fn get_data(&self, callsign: Option<&str>) -> Result<FlightData, AdsbError> {
        let callsign = callsign.ok_or(AdsbError::CallsignRequired)?;
        
        log::info!("Fetching ADSB flight data for callsign: {}", callsign);
        
        let url = format!("https://api.adsb.lol/v2/callsign/{}", callsign);
        
        let response = self.client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!("ADSB API returned status: {} for callsign: {}", response.status(), callsign);
            return Err(AdsbError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: Value = response.json().await?;
        
        // V2 endpoint returns different structure, need to handle the response
        if let Some(aircraft_array) = data.get("ac").and_then(|v| v.as_array()) {
            if aircraft_array.is_empty() {
                log::warn!("No ADSB data found for callsign: {}", callsign);
                return Err(AdsbError::NoDataAvailable);
            }
            
            // Convert first aircraft to FlightData
            let aircraft = &aircraft_array[0];
            let flight_data = self.convert_v2_aircraft_to_flight_data(aircraft, callsign)?;
            
            log::info!("Successfully fetched ADSB data for callsign: {}", callsign);
            Ok(flight_data)
        } else {
            log::error!("Invalid ADSB response format for callsign: {}", callsign);
            Err(AdsbError::NoDataAvailable)
        }
    }

    /// Get nearby flights by location (ADSB-specific functionality)
    pub async fn get_nearby_flights(&self, latitude: f64, longitude: f64, distance: u32) -> Result<Vec<FlightData>, AdsbError> {
        log::info!("Fetching nearby ADSB flights at ({}, {}) within {}km", latitude, longitude, distance);
        
        let url = format!("https://api.adsb.lol/v2/lat/{}/lon/{}/dist/{}", latitude, longitude, distance);
        
        let response = self.client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!("ADSB nearby flights API returned status: {}", response.status());
            return Err(AdsbError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: Value = response.json().await?;
        let mut flights = Vec::new();
        
        if let Some(aircraft_array) = data.get("ac").and_then(|v| v.as_array()) {
            for aircraft in aircraft_array {
                if let Some(flight) = aircraft.get("flight").and_then(|v| v.as_str()) {
                    if !flight.trim().is_empty() {
                        if let Ok(flight_data) = self.convert_v2_aircraft_to_flight_data(aircraft, flight.trim()) {
                            flights.push(flight_data);
                        }
                    }
                }
            }
        }
        
        log::info!("Found {} nearby ADSB flights", flights.len());
        Ok(flights)
    }

    /// Helper method to get nearby flight callsigns only
    pub async fn get_nearby_callsigns(&self, latitude: f64, longitude: f64, distance: u32) -> Result<Vec<String>, AdsbError> {
        log::info!("Fetching nearby ADSB callsigns at ({}, {}) within {}km", latitude, longitude, distance);
        
        let url = format!("https://api.adsb.lol/v2/lat/{}/lon/{}/dist/{}", latitude, longitude, distance);
        
        let response = self.client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!("ADSB nearby callsigns API returned status: {}", response.status());
            return Err(AdsbError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: Value = response.json().await?;
        let mut callsigns = Vec::new();
        
        if let Some(aircraft_array) = data.get("ac").and_then(|v| v.as_array()) {
            for aircraft in aircraft_array {
                if let Some(flight) = aircraft.get("flight").and_then(|v| v.as_str()) {
                    if !flight.trim().is_empty() {
                        callsigns.push(flight.trim().to_string());
                    }
                }
            }
        }
        
        log::info!("Found {} nearby ADSB callsigns", callsigns.len());
        Ok(callsigns)
    }

    /// Convert v2 API aircraft response to FlightData
    fn convert_v2_aircraft_to_flight_data(&self, aircraft: &Value, callsign: &str) -> Result<FlightData, AdsbError> {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_string();

        Ok(FlightData {
            timestamp,
            eta: None,
            flight_duration: 0,
            flight_number: callsign.to_string(),
            latitude: aircraft.get("lat").and_then(|v| v.as_f64()).unwrap_or(0.0),
            longitude: aircraft.get("lon").and_then(|v| v.as_f64()).unwrap_or(0.0),
            nose_id: aircraft.get("hex").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            pa_state: None,
            vehicle_id: aircraft.get("hex").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            destination: aircraft.get("to").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            origin: aircraft.get("from").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            flight_id: aircraft.get("hex").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            airspeed: aircraft.get("ias").and_then(|v| v.as_f64()),
            air_temperature: None,
            altitude: aircraft.get("alt_baro").and_then(|v| v.as_f64()).unwrap_or(0.0) as i32,
            distance_to_go: None,
            door_state: None,
            groundspeed: aircraft.get("gs").and_then(|v| v.as_f64()).unwrap_or(0.0),
            heading: aircraft.get("track").and_then(|v| v.as_f64()),
            time_to_go: 0,
            wheel_weight_state: "unknown".to_string(),
            gross_weight: None,
            wind_speed: None,
            wind_direction: None,
            flight_phase: "cruise".to_string(),
        })
    }
}

impl Default for AdsbService {
    fn default() -> Self {
        Self::new()
    }
}
