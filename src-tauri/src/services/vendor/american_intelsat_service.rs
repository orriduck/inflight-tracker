use crate::models::{AAIntelsatFlightData, FlightData, ToFlightData};
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct AmericanIntelsatService {
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum AmericanIntelsatError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("No flight data available")]
    NoDataAvailable,
}

impl AmericanIntelsatService {
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
                    "American Intelsat TCP connection successful ({}:{})",
                    host,
                    port
                );
                true
            }
            Ok(Err(error)) => {
                log::error!("American Intelsat TCP connection failed: {}", error);
                false
            }
            Err(_) => {
                log::error!(
                    "American Intelsat TCP connection timeout ({}:{})",
                    host,
                    port
                );
                false
            }
        }
    }

    /// Get flight data (callsign parameter is ignored for in-flight vendors)
    pub async fn get_data(
        &self,
        _callsign: Option<&str>,
    ) -> Result<FlightData, AmericanIntelsatError> {
        log::info!("Fetching American Airlines Intelsat flight data");

        let url = "https://www.aainflight.com/api/v1/connectivity/intelsat/system-status";

        let response = self
            .client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!(
                "American Intelsat API returned status: {}",
                response.status()
            );
            return Err(AmericanIntelsatError::RequestError(reqwest::Error::from(
                response.error_for_status().unwrap_err(),
            )));
        }

        let data: AAIntelsatFlightData = response.json().await?;
        let flight_data = data.to_flight_data();

        log::info!(
            "Successfully fetched American Intelsat data for flight: {}",
            flight_data.flight_number
        );
        Ok(flight_data)
    }
}

impl Default for AmericanIntelsatService {
    fn default() -> Self {
        Self::new()
    }
}
