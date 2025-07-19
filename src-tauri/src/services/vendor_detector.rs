use crate::services::FlightService;
use crate::models::DataSource;

#[derive(Debug, Clone)]
pub struct VendorDetector {
    flight_service: FlightService,
}

impl VendorDetector {
    pub fn new() -> Self {
        Self {
            flight_service: FlightService::new(),
        }
    }

    /// Detect which vendors are currently available
    pub async fn detect_available_vendors(&self) -> Vec<String> {
        let vendors = vec!["american-intelsat", "american-viasat", "jetblue", "adsb"];
        let mut available = Vec::new();

        for vendor in vendors {
            if self.flight_service.test_vendor(vendor).await {
                available.push(vendor.to_string());
            }
        }

        // Sort by priority (highest priority first)
        available.sort_by(|a, b| {
            let a_priority = self.get_vendor_priority(a);
            let b_priority = self.get_vendor_priority(b);
            b_priority.cmp(&a_priority)
        });

        available
    }

    /// Get the primary (highest priority) available vendor
    pub async fn get_primary_vendor(&self) -> Option<String> {
        let available = self.detect_available_vendors().await;
        available.first().cloned()
    }

    /// Validate if a cached vendor is still working
    pub async fn validate_vendor(&self, vendor: &str) -> bool {
        self.flight_service.test_vendor(vendor).await
    }

    /// Get priority for a vendor string
    fn get_vendor_priority(&self, vendor: &str) -> u8 {
        match vendor {
            "american-intelsat" => DataSource::AmericanIntelsat.priority(),
            "american-viasat" => DataSource::AmericanViasat.priority(),
            "jetblue" => DataSource::JetBlue.priority(),
            "adsb" => DataSource::AdsbLol.priority(),
            _ => 0,
        }
    }

    /// Get DataSource enum from vendor string
    pub fn vendor_to_data_source(&self, vendor: &str) -> Option<DataSource> {
        match vendor {
            "american-intelsat" => Some(DataSource::AmericanIntelsat),
            "american-viasat" => Some(DataSource::AmericanViasat),
            "jetblue" => Some(DataSource::JetBlue),
            "adsb" => Some(DataSource::AdsbLol),
            _ => None,
        }
    }
}

impl Default for VendorDetector {
    fn default() -> Self {
        Self::new()
    }
}
