use super::super::{DataSource, FlightData, ToFlightData};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JetBlueFlightData {
    #[serde(rename = "destinationIATA")]
    pub destination_iata: Option<String>,
    #[serde(rename = "eventType")]
    pub event_type: String,
    #[serde(rename = "flightETA")]
    pub flight_eta: Option<String>,
    #[serde(rename = "flightRunningStatus")]
    pub flight_running_status: i32,
    #[serde(rename = "flightStatusText")]
    pub flight_status_text: Option<String>,
    #[serde(rename = "flightTotalDuration")]
    pub flight_total_duration: i32,
    pub markers: Option<String>,
    pub message: String,
    #[serde(rename = "originIATA")]
    pub origin_iata: Option<String>,
    #[serde(rename = "promotionText")]
    pub promotion_text: Option<String>,
    #[serde(rename = "showWelcomeText")]
    pub show_welcome_text: bool,
    #[serde(rename = "timeToArrival")]
    pub time_to_arrival: Option<String>,
    #[serde(rename = "welcomeText")]
    pub welcome_text: Option<String>,
    pub altitude: Option<f64>,
    pub groundspeed: Option<f64>,
    pub terminal: Option<String>,
    pub gate: Option<String>,
    #[serde(rename = "currentTemp")]
    pub current_temp: Option<String>,
    #[serde(rename = "todayWeather")]
    pub today_weather: Option<String>,
    #[serde(rename = "tomorrowWeather")]
    pub tomorrow_weather: Option<String>,
    #[serde(rename = "lastUpdated")]
    pub last_updated: Option<String>,
    #[serde(rename = "originCity")]
    pub origin_city: Option<String>,
    #[serde(rename = "destinationCity")]
    pub destination_city: Option<String>,
}

fn parse_time_to_minutes(time_str: &str) -> i32 {
    // Parse time strings like "1h 30m" or "45m" to minutes
    let mut total_minutes = 0;

    if let Some(hours_pos) = time_str.find('h') {
        if let Ok(hours) = time_str[..hours_pos].trim().parse::<i32>() {
            total_minutes += hours * 60;
        }
    }

    if let Some(minutes_pos) = time_str.find('m') {
        let start = if let Some(h_pos) = time_str.find('h') {
            h_pos + 1
        } else {
            0
        };
        if let Ok(minutes) = time_str[start..minutes_pos].trim().parse::<i32>() {
            total_minutes += minutes;
        }
    }

    total_minutes
}

impl ToFlightData for JetBlueFlightData {
    fn to_flight_data(&self) -> FlightData {
        let time_to_go = self
            .time_to_arrival
            .as_ref()
            .map(|t| parse_time_to_minutes(t))
            .unwrap_or(0);

        FlightData {
            timestamp: self
                .last_updated
                .clone()
                .unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
            eta: self.flight_eta.clone(),
            flight_duration: self.flight_total_duration,
            flight_number: "N/A".to_string(), // JetBlue doesn't seem to provide flight number in this data
            latitude: 0.0,                    // JetBlue doesn't provide lat/lon in this format
            longitude: 0.0,
            nose_id: "N/A".to_string(),
            pa_state: self.flight_status_text.clone(),
            vehicle_id: "N/A".to_string(),
            destination: self
                .destination_iata
                .clone()
                .unwrap_or_else(|| "N/A".to_string()),
            origin: self
                .origin_iata
                .clone()
                .unwrap_or_else(|| "N/A".to_string()),
            flight_id: "N/A".to_string(),
            airspeed: None,
            air_temperature: self.current_temp.as_ref().and_then(|t| t.parse().ok()),
            altitude: self.altitude.map(|a| a as i32).unwrap_or(0),
            distance_to_go: None,
            door_state: None,
            groundspeed: self.groundspeed.unwrap_or(0.0),
            heading: None,
            time_to_go,
            wheel_weight_state: "N/A".to_string(),
            gross_weight: None,
            wind_speed: None,
            wind_direction: None,
            flight_phase: self.event_type.clone(),
        }
    }

    fn data_source() -> DataSource {
        DataSource::JetBlue
    }
}
