use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationData {
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: Option<f64>,
    pub timestamp: String,
}

impl LocationData {
    /// Creates a new LocationData with specified coordinates
    pub fn new(latitude: f64, longitude: f64) -> Self {
        Self {
            latitude,
            longitude,
            accuracy: None,
            timestamp: Utc::now().to_rfc3339(),
        }
    }

    /// Creates a new LocationData with accuracy
    pub fn with_accuracy(latitude: f64, longitude: f64, accuracy: f64) -> Self {
        Self {
            latitude,
            longitude,
            accuracy: Some(accuracy),
            timestamp: Utc::now().to_rfc3339(),
        }
    }

    /// Creates a new LocationData with unix timestamp
    pub fn with_unix_timestamp(latitude: f64, longitude: f64, accuracy: Option<f64>) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_string();
            
        Self {
            latitude,
            longitude,
            accuracy,
            timestamp,
        }
    }

    /// Validates that coordinates are within valid ranges
    pub fn is_valid(&self) -> bool {
        self.latitude >= -90.0 && self.latitude <= 90.0 
            && self.longitude >= -180.0 && self.longitude <= 180.0
    }

    /// Calculates distance to another location in kilometers using Haversine formula
    pub fn distance_to(&self, other: &LocationData) -> f64 {
        let earth_radius = 6371.0; // Earth's radius in kilometers
        
        let lat1_rad = self.latitude.to_radians();
        let lat2_rad = other.latitude.to_radians();
        let delta_lat = (other.latitude - self.latitude).to_radians();
        let delta_lon = (other.longitude - self.longitude).to_radians();

        let a = (delta_lat / 2.0).sin().powi(2) 
            + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin().powi(2);
        let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

        earth_radius * c
    }
}

/// Error types for location operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LocationError {
    InvalidCoordinates,
    PermissionDenied,
    ServiceUnavailable,
    Timeout,
    Unknown(String),
}

impl std::fmt::Display for LocationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LocationError::InvalidCoordinates => write!(f, "Invalid coordinates provided"),
            LocationError::PermissionDenied => write!(f, "Location permission denied"),
            LocationError::ServiceUnavailable => write!(f, "Location service unavailable"),
            LocationError::Timeout => write!(f, "Location request timed out"),
            LocationError::Unknown(msg) => write!(f, "Unknown location error: {}", msg),
        }
    }
}

impl std::error::Error for LocationError {}
