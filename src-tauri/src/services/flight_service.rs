use reqwest::Client;
use serde_json::Value;
use std::time::Duration;

use crate::models::{
    FlightData, DataSource, ToFlightData,
    AAIntelsatFlightData, JetBlueFlightData,
    AdsbAircraftData, AdsbFlightData, AdsbApiResponse
};

#[derive(Debug, Clone)]
pub struct FlightService {
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum FlightServiceError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("Unsupported vendor: {0}")]
    UnsupportedVendor(String),
    #[error("No flight data available")]
    NoDataAvailable,
}

impl FlightService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self { client }
    }

    /// Fetch flight data from American Airlines Intelsat API
    pub async fn fetch_american_intelsat(&self) -> Result<FlightData, FlightServiceError> {
        let url = "https://www.aainflight.com/api/v1/connectivity/intelsat/system-status";
        
        let response = self.client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: AAIntelsatFlightData = response.json().await?;
        Ok(data.to_flight_data())
    }

    /// Fetch flight data from American Airlines ViaSat API
    pub async fn fetch_american_viasat(&self) -> Result<FlightData, FlightServiceError> {
        let url = "https://www.aainflight.com/api/v1/connectivity/viasat/system-status";
        
        let response = self.client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        // For now, assuming ViaSat returns similar structure to Intelsat
        // This can be updated when we have the actual ViaSat API response format
        let data: Value = response.json().await?;
        
        // Try to parse as Intelsat format first, fallback to direct FlightData
        if let Ok(intelsat_data) = serde_json::from_value::<AAIntelsatFlightData>(data.clone()) {
            Ok(intelsat_data.to_flight_data())
        } else if let Ok(flight_data) = serde_json::from_value::<FlightData>(data) {
            Ok(flight_data)
        } else {
            Err(FlightServiceError::JsonError(
                serde_json::from_str::<FlightData>("").unwrap_err()
            ))
        }
    }

    /// Fetch flight data from JetBlue API
    pub async fn fetch_jetblue(&self) -> Result<FlightData, FlightServiceError> {
        let url = "https://ifecondor-api.jetblue.com/";
        
        let response = self.client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: JetBlueFlightData = response.json().await?;
        Ok(data.to_flight_data())
    }

    /// Fetch flight data from ADSB.lol API by flight callsign
    pub async fn fetch_adsb_by_callsign(&self, callsign: &str) -> Result<FlightData, FlightServiceError> {
        let url = format!("https://api.adsb.lol/api/v1/flights?callsign={}", callsign);
        
        let response = self.client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let api_response: AdsbApiResponse<AdsbFlightData> = response.json().await?;
        
        if api_response.data.is_empty() {
            return Err(FlightServiceError::NoDataAvailable);
        }

        // Return the first matching flight
        Ok(api_response.data[0].to_flight_data())
    }

    /// Fetch flight data from ADSB.lol API by ICAO address
    pub async fn fetch_adsb_by_icao(&self, icao_address: &str) -> Result<FlightData, FlightServiceError> {
        let url = format!("https://api.adsb.lol/api/v1/aircraft/{}", icao_address);
        
        let response = self.client
            .get(&url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let aircraft_data: AdsbAircraftData = response.json().await?;
        Ok(aircraft_data.to_flight_data())
    }

    /// Fetch all current flights from ADSB.lol API
    pub async fn fetch_adsb_all_flights(&self) -> Result<Vec<FlightData>, FlightServiceError> {
        let url = "https://api.adsb.lol/api/v1/flights";
        
        let response = self.client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(FlightServiceError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let api_response: AdsbApiResponse<AdsbFlightData> = response.json().await?;
        
        Ok(api_response.data.into_iter().map(|flight| flight.to_flight_data()).collect())
    }

    /// Fetch flight data from a specific vendor
    pub async fn fetch_by_vendor(&self, vendor: &str) -> Result<FlightData, FlightServiceError> {
        match vendor {
            "american-intelsat" => self.fetch_american_intelsat().await,
            "american-viasat" => self.fetch_american_viasat().await,
            "jetblue" => self.fetch_jetblue().await,
            "adsb" => {
                // For ADSB, we'll try to fetch all flights and return the first one
                // In a real scenario, we'd need more specific parameters
                let flights = self.fetch_adsb_all_flights().await?;
                flights.into_iter().next().ok_or(FlightServiceError::NoDataAvailable)
            },
            _ => Err(FlightServiceError::UnsupportedVendor(vendor.to_string())),
        }
    }

    /// Test if a vendor endpoint is available
    pub async fn test_vendor(&self, vendor: &str) -> bool {
        // Test basic TCP connectivity to host
        let (host, port) = match vendor {
            "american-intelsat" | "american-viasat" => ("www.aainflight.com", 443),
            "jetblue" => ("ifecondor-api.jetblue.com", 443),
            "adsb" => ("api.adsb.lol", 80),
            _ => {
                log::warn!("Unknown vendor: {}", vendor);
                return false;
            }
        };

        use tokio::net::TcpStream;
        use std::time::Duration;
        
        let timeout = Duration::from_secs(5);
        match tokio::time::timeout(timeout, TcpStream::connect((host, port))).await {
            Ok(Ok(_)) => {
                log::info!("✓ Vendor {} TCP connection successful ({}:{})", vendor, host, port);
                true
            },
            Ok(Err(error)) => {
                log::error!("✗ Vendor {} TCP connection failed: {}", vendor, error);
                false
            },
            Err(_) => {
                log::error!("✗ Vendor {} TCP connection timeout ({}:{})", vendor, host, port);
                false
            }
        }
    }

    /// Get list of available vendors
    pub async fn get_available_vendors(&self) -> Vec<String> {
        log::info!("Starting vendor availability check...");
        let vendors = vec!["american-intelsat", "american-viasat", "jetblue", "adsb"];
        let mut available = Vec::new();

        for vendor in vendors {
            log::info!("Testing vendor: {}", vendor);
            if self.test_vendor(vendor).await {
                log::info!("✓ Vendor {} is available", vendor);
                available.push(vendor.to_string());
            } else {
                log::warn!("✗ Vendor {} is not available", vendor);
            }
        }

        log::info!("Available vendors: {:?}", available);
        available
    }

    /// Merge multiple flight data sources with priority
    pub fn merge_flight_data(&self, data_sources: Vec<(FlightData, DataSource)>) -> Option<FlightData> {
        if data_sources.is_empty() {
            return None;
        }

        // Sort by priority (highest first)
        let mut sorted_sources = data_sources;
        sorted_sources.sort_by(|a, b| b.1.priority().cmp(&a.1.priority()));

        // Start with the highest priority data
        let mut merged = sorted_sources[0].0.clone();
        let primary_source = sorted_sources[0].1;

        // Merge with lower priority sources
        for (data, source) in sorted_sources.iter().skip(1) {
            merged.merge_with_priority(data, *source, primary_source);
        }

        Some(merged)
    }
}

impl Default for FlightService {
    fn default() -> Self {
        Self::new()
    }
}
