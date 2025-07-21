use crate::models::{AAIntelsatFlightData, FlightData, ToFlightData};
use reqwest::Client;
use serde_json::Value;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct AmericanViasatService {
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum AmericanViasatError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("No flight data available")]
    NoDataAvailable,
}

impl AmericanViasatService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self { client }
    }

    /// Test if the vendor endpoint is available
    pub async fn ping_vendor(&self) -> bool {
        use std::time::Duration;
        use tokio::net::TcpStream;

        let host = "www.aainflight.com";
        let port = 443;
        let timeout = Duration::from_secs(5);

        match tokio::time::timeout(timeout, TcpStream::connect((host, port))).await {
            Ok(Ok(_)) => {
                log::info!(
                    "American ViaSat TCP connection successful ({}:{})",
                    host,
                    port
                );
                true
            }
            Ok(Err(error)) => {
                log::error!("American ViaSat TCP connection failed: {}", error);
                false
            }
            Err(_) => {
                log::error!("American ViaSat TCP connection timeout ({}:{})", host, port);
                false
            }
        }
    }

    /// Get flight data (callsign parameter is ignored for in-flight vendors)
    pub async fn get_data(
        &self,
        _callsign: Option<&str>,
    ) -> Result<FlightData, AmericanViasatError> {
        log::info!("Fetching American Airlines ViaSat flight data");

        let url = "https://www.aainflight.com/api/v1/connectivity/viasat/system-status";

        let response = self
            .client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!("American ViaSat API returned status: {}", response.status());
            return Err(AmericanViasatError::RequestError(reqwest::Error::from(
                response.error_for_status().unwrap_err(),
            )));
        }

        // For now, assuming ViaSat returns similar structure to Intelsat
        // This can be updated when we have the actual ViaSat API response format
        let data: Value = response.json().await?;

        // Try to parse as Intelsat format first, fallback to direct FlightData
        if let Ok(intelsat_data) = serde_json::from_value::<AAIntelsatFlightData>(data.clone()) {
            let flight_data = intelsat_data.to_flight_data();
            log::info!(
                "Successfully fetched ViaSat data (Intelsat format) for flight: {}",
                flight_data.flight_number
            );
            Ok(flight_data)
        } else if let Ok(flight_data) = serde_json::from_value::<FlightData>(data) {
            log::info!(
                "Successfully fetched ViaSat data (direct format) for flight: {}",
                flight_data.flight_number
            );
            Ok(flight_data)
        } else {
            log::error!("Failed to parse ViaSat response data");
            Err(AmericanViasatError::JsonError(
                serde_json::from_str::<FlightData>("").unwrap_err(),
            ))
        }
    }
}

impl Default for AmericanViasatService {
    fn default() -> Self {
        Self::new()
    }
}
