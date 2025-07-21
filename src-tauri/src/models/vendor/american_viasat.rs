use super::super::{DataSource, FlightData, ToFlightData};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AAViaSatFlightData {
    // For now, assuming it's the same as FlightData
    // This can be updated when we have the actual structure
    #[serde(flatten)]
    pub data: FlightData,
}

impl ToFlightData for AAViaSatFlightData {
    fn to_flight_data(&self) -> FlightData {
        self.data.clone()
    }

    fn data_source() -> DataSource {
        DataSource::AmericanViasat
    }
}
