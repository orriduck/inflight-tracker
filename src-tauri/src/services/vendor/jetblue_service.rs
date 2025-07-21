use reqwest::Client;
use std::time::Duration;
use crate::models::{FlightData, JetBlueFlightData, ToFlightData};

#[derive(Debug, Clone)]
pub struct JetBlueService {
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum JetBlueError {
    #[error("HTTP request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("No flight data available")]
    NoDataAvailable,
}

impl JetBlueService {
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
        
        let host = "ifecondor-api.jetblue.com";
        let port = 443;
        let timeout = Duration::from_secs(5);
        
        match tokio::time::timeout(timeout, TcpStream::connect((host, port))).await {
            Ok(Ok(_)) => {
                log::info!("JetBlue TCP connection successful ({}:{})", host, port);
                true
            },
            Ok(Err(error)) => {
                log::error!("JetBlue TCP connection failed: {}", error);
                false
            },
            Err(_) => {
                log::error!("JetBlue TCP connection timeout ({}:{})", host, port);
                false
            }
        }
    }

    /// Get flight data (callsign parameter is ignored for in-flight vendors)
    pub async fn get_data(&self, _callsign: Option<&str>) -> Result<FlightData, JetBlueError> {
        log::info!("Fetching JetBlue flight data");
        
        let url = "https://ifecondor-api.jetblue.com/";
        
        let response = self.client
            .get(url)
            .header("Accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            log::error!("JetBlue API returned status: {}", response.status());
            return Err(JetBlueError::RequestError(
                reqwest::Error::from(response.error_for_status().unwrap_err())
            ));
        }

        let data: JetBlueFlightData = response.json().await?;
        let flight_data = data.to_flight_data();
        
        log::info!("Successfully fetched JetBlue data for flight: {}", flight_data.flight_number);
        Ok(flight_data)
    }
}

impl Default for JetBlueService {
    fn default() -> Self {
        Self::new()
    }
}
