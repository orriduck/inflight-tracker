use crate::models::base::vendor::Vendor;
use crate::models::FlightData;
use crate::services::vendor::{
    AdsbService, AmericanIntelsatService, AmericanViasatService, JetBlueService,
};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Helper function to ping a specific vendor
async fn ping_vendor(vendor: &Vendor) -> bool {
    match vendor {
        Vendor::AdsbLol => AdsbService::new().ping_vendor().await,
        Vendor::AmericanIntelsat => AmericanIntelsatService::new().ping_vendor().await,
        Vendor::AmericanViasat => AmericanViasatService::new().ping_vendor().await,
        Vendor::JetBlue => JetBlueService::new().ping_vendor().await,
    }
}

/// Helper function to get flight data from a specific vendor
async fn get_vendor_data(vendor: &Vendor, callsign: Option<&str>) -> Result<FlightData, String> {
    match vendor {
        Vendor::AdsbLol => AdsbService::new()
            .get_data(callsign)
            .await
            .map_err(|e| e.to_string()),
        Vendor::AmericanIntelsat => AmericanIntelsatService::new()
            .get_data(callsign)
            .await
            .map_err(|e| e.to_string()),
        Vendor::AmericanViasat => AmericanViasatService::new()
            .get_data(callsign)
            .await
            .map_err(|e| e.to_string()),
        Vendor::JetBlue => JetBlueService::new()
            .get_data(callsign)
            .await
            .map_err(|e| e.to_string()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VendorStatus {
    pub vendor: Vendor,
    pub available: bool,
    pub last_checked: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FlightDataResponse {
    pub flight_data: Option<FlightData>,
    pub vendors: Vec<Vendor>,
    pub success: bool,
    pub errors: Vec<String>,
}

/// Ping all vendors to check availability
#[tauri::command]
pub async fn ping_vendors() -> Result<Vec<VendorStatus>, String> {
    log::info!("Pinging all vendors for availability");

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string();

    let vendors = Vendor::all_variants();
    let mut vendor_statuses = Vec::new();

    // Test all vendors using map operation
    for vendor in vendors {
        let available = ping_vendor(&vendor).await;
        vendor_statuses.push(VendorStatus {
            vendor,
            available,
            last_checked: timestamp.clone(),
        });
    }

    log::info!(
        "Vendor ping results: {} vendors checked",
        vendor_statuses.len()
    );
    Ok(vendor_statuses)
}

/// Get nearby flights recommendation from ADSB
#[tauri::command]
pub async fn get_flights_recommendation(
    squawk: Option<u32>,
) -> Result<Vec<String>, String> {
    let squawk_code = squawk.unwrap_or(1200);
    log::info!(
        "Getting callsign recommendation with squawk: {}",
        squawk_code
    ); 

    let adsb_service = AdsbService::new();

    match adsb_service
        .get_recommend_callsigns(Some(squawk_code))
        .await
    {
        Ok(callsigns) => {
            log::info!("Found {} nearby flights", callsigns.len());
            Ok(callsigns)
        }
        Err(e) => {
            log::error!("Failed to get nearby flights: {}", e);
            // Return empty list on error as requested
            Ok(vec![])
        }
    }
}

/// Get merged flight data from specified vendors
#[tauri::command]
pub async fn get_data(
    callsign: Option<String>,
    vendors: Vec<Vendor>,
) -> Result<FlightDataResponse, String> {
    log::info!(
        "Getting flight data for callsign: {:?} from vendors: {:?}",
        callsign,
        vendors
    );

    let mut merged_data: Option<FlightData> = None;
    let mut successful_vendors = Vec::new();
    let mut errors = Vec::new();

    // If no vendors provided, raise exception
    if vendors.is_empty() {
        return Err("No vendors provided".to_string());
    }

    for vendor in &vendors {
        let result = get_vendor_data(vendor, callsign.as_deref()).await;

        match result {
            Ok(flight_data) => {
                log::info!("Successfully got data from vendor: {:?}", vendor);
                successful_vendors.push(vendor.clone());

                // Merge data using priority-based merging
                if merged_data.is_none() {
                    merged_data = Some(flight_data);
                } else if let Some(ref mut base_data) = merged_data {
                    let current_source = successful_vendors
                        .first()
                        .copied()
                        .unwrap_or(Vendor::AdsbLol);
                    base_data.merge_with_priority(&flight_data, *vendor, current_source);
                }
            }
            Err(e) => {
                log::error!("Failed to get data from vendor {:?}: {}", vendor, e);
                errors.push(format!("{:?}: {}", vendor, e));
            }
        }
    }

    let success = merged_data.is_some();

    Ok(FlightDataResponse {
        flight_data: merged_data,
        vendors: successful_vendors,
        success,
        errors,
    })
}
