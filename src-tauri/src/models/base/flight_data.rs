use crate::models::base::vendor::DataSource;
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlightData {
    pub timestamp: String,
    pub eta: Option<String>,
    pub flight_duration: i32,
    pub flight_number: String,
    pub latitude: f64,
    pub longitude: f64,
    pub nose_id: String,
    pub pa_state: Option<String>,
    pub vehicle_id: String,
    pub destination: String,
    pub origin: String,
    pub flight_id: String,
    pub airspeed: Option<f64>,
    pub air_temperature: Option<f64>,
    pub altitude: i32,
    pub distance_to_go: Option<f64>,
    pub door_state: Option<String>,
    pub groundspeed: f64,
    pub heading: Option<f64>,
    pub time_to_go: i32,
    pub wheel_weight_state: String,
    pub gross_weight: Option<f64>,
    pub wind_speed: Option<f64>,
    pub wind_direction: Option<f64>,
    pub flight_phase: String,
}

impl FlightData {
    /// Creates a new FlightData with default values
    pub fn new() -> Self {
        Self {
            timestamp: Utc::now().to_rfc3339(),
            eta: None,
            flight_duration: 0,
            flight_number: "N/A".to_string(),
            latitude: 0.0,
            longitude: 0.0,
            nose_id: "N/A".to_string(),
            pa_state: None,
            vehicle_id: "N/A".to_string(),
            destination: "N/A".to_string(),
            origin: "N/A".to_string(),
            flight_id: "N/A".to_string(),
            airspeed: None,
            air_temperature: None,
            altitude: 0,
            distance_to_go: None,
            door_state: None,
            groundspeed: 0.0,
            heading: None,
            time_to_go: 0,
            wheel_weight_state: "N/A".to_string(),
            gross_weight: None,
            wind_speed: None,
            wind_direction: None,
            flight_phase: "N/A".to_string(),
        }
    }

    /// Merges two FlightData instances with priority-based field selection
    /// The `other` parameter's data source determines priority for conflicts
    pub fn merge_with_priority(
        &mut self,
        other: &FlightData,
        other_source: DataSource,
        self_source: DataSource,
    ) {
        let other_has_priority = other_source.priority() > self_source.priority();

        // Helper macro to merge optional fields
        macro_rules! merge_option {
            ($field:ident) => {
                match (&self.$field, &other.$field) {
                    (None, Some(_)) => self.$field = other.$field.clone(),
                    (Some(_), Some(_)) if other_has_priority => self.$field = other.$field.clone(),
                    _ => {} // Keep current value
                }
            };
        }

        // Helper macro to merge string fields (considering "N/A" as empty)
        macro_rules! merge_string {
            ($field:ident) => {
                if self.$field == "N/A" || (other_has_priority && other.$field != "N/A") {
                    self.$field = other.$field.clone();
                }
            };
        }

        // Helper macro to merge numeric fields (considering 0 as empty for some fields)
        macro_rules! merge_numeric_zero_int {
            ($field:ident) => {
                if self.$field == 0 || (other_has_priority && other.$field != 0) {
                    self.$field = other.$field;
                }
            };
        }

        // Helper macro to merge float fields (considering 0.0 as empty for some fields)
        macro_rules! merge_numeric_zero_float {
            ($field:ident) => {
                if self.$field == 0.0 || (other_has_priority && other.$field != 0.0) {
                    self.$field = other.$field;
                }
            };
        }

        // Merge fields based on priority and data availability
        if other_has_priority || self.timestamp < other.timestamp {
            self.timestamp = other.timestamp.clone();
        }

        merge_option!(eta);
        merge_numeric_zero_int!(flight_duration);
        merge_string!(flight_number);
        merge_numeric_zero_float!(latitude);
        merge_numeric_zero_float!(longitude);
        merge_string!(nose_id);
        merge_option!(pa_state);
        merge_string!(vehicle_id);
        merge_string!(destination);
        merge_string!(origin);
        merge_string!(flight_id);
        merge_option!(airspeed);
        merge_option!(air_temperature);
        merge_numeric_zero_int!(altitude);
        merge_option!(distance_to_go);
        merge_option!(door_state);
        merge_numeric_zero_float!(groundspeed);
        merge_option!(heading);
        merge_numeric_zero_int!(time_to_go);
        merge_string!(wheel_weight_state);
        merge_option!(gross_weight);
        merge_option!(wind_speed);
        merge_option!(wind_direction);
        merge_string!(flight_phase);
    }
}

impl Default for FlightData {
    fn default() -> Self {
        Self::new()
    }
}

/// Trait for converting service-specific data to FlightData
pub trait ToFlightData {
    fn to_flight_data(&self) -> FlightData;
    fn data_source() -> DataSource;
}
