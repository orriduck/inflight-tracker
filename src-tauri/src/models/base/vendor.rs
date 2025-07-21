use serde::{Deserialize, Serialize};

/// Unified vendor/data source enum for flight tracking services
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Vendor {
    #[serde(rename = "adsb")]
    AdsbLol,
    #[serde(rename = "american_intelsat")]
    AmericanIntelsat,
    #[serde(rename = "american_viasat")]
    AmericanViasat,
    #[serde(rename = "jetblue")]
    JetBlue,
}

impl Vendor {
    /// Returns the priority level for this vendor (higher number = higher priority)
    /// In-flight WiFi vendors have higher priority than ground-based ADSB
    pub fn priority(&self) -> u8 {
        match self {
            Vendor::AmericanIntelsat => 10,
            Vendor::AmericanViasat => 10,
            Vendor::JetBlue => 10,
            Vendor::AdsbLol => 5,
        }
    }

    /// Get all vendor variants
    pub fn all_variants() -> Vec<Vendor> {
        vec![
            Vendor::AdsbLol,
            Vendor::AmericanIntelsat,
            Vendor::AmericanViasat,
            Vendor::JetBlue,
        ]
    }
}

// Type alias for backward compatibility
pub type DataSource = Vendor;