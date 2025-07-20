use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::models::FlightData;
use crate::services::{FlightService, VendorDetector};

pub struct AppState {
    pub flight_service: Arc<Mutex<FlightService>>,
    pub vendor_detector: Arc<Mutex<VendorDetector>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            flight_service: Arc::new(Mutex::new(FlightService::new())),
            vendor_detector: Arc::new(Mutex::new(VendorDetector::new())),
        }
    }
}

#[tauri::command]
pub async fn get_flight_data(
    vendor: String,
    state: State<'_, AppState>,
) -> Result<FlightData, String> {
    log::info!("🔄 get_flight_data called for vendor: {}", vendor);
    let service = state.flight_service.lock().await;
    
    let result = service
        .fetch_by_vendor(&vendor)
        .await
        .map_err(|e| format!("Failed to fetch flight data: {}", e));
    
    match &result {
        Ok(_) => log::info!("✅ get_flight_data successful for vendor: {}", vendor),
        Err(e) => log::error!("❌ get_flight_data failed for vendor {}: {}", vendor, e),
    }
    
    result
}

#[tauri::command]
pub async fn get_flight_data_with_callsign(
    vendor: String,
    callsign: String,
    state: State<'_, AppState>,
) -> Result<FlightData, String> {
    log::info!("🔄 get_flight_data_with_callsign called for vendor: {}, callsign: {}", vendor, callsign);
    let service = state.flight_service.lock().await;
    
    let result = service
        .fetch_by_vendor_with_callsign(&vendor, &callsign)
        .await
        .map_err(|e| format!("Failed to fetch flight data: {}", e));
    
    match &result {
        Ok(_) => log::info!("✅ get_flight_data_with_callsign successful for vendor: {}, callsign: {}", vendor, callsign),
        Err(e) => log::error!("❌ get_flight_data_with_callsign failed for vendor {}, callsign {}: {}", vendor, callsign, e),
    }
    
    result
}

#[tauri::command]
pub async fn detect_vendors(
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    log::info!("🔍 detect_vendors called");
    let detector = state.vendor_detector.lock().await;
    
    let vendors = detector.detect_available_vendors().await;
    log::info!("🔍 detect_vendors found: {:?}", vendors);
    
    Ok(vendors)
}

#[tauri::command]
pub async fn get_primary_vendor(
    state: State<'_, AppState>,
) -> Result<Option<String>, String> {
    let detector = state.vendor_detector.lock().await;
    
    Ok(detector.get_primary_vendor().await)
}

#[tauri::command]
pub async fn validate_vendor(
    vendor: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let detector = state.vendor_detector.lock().await;
    
    Ok(detector.validate_vendor(&vendor).await)
}

#[tauri::command]
pub async fn merge_flight_data(
    data_list: Vec<(FlightData, String)>,
    state: State<'_, AppState>,
) -> Result<Option<FlightData>, String> {
    let service = state.flight_service.lock().await;
    let detector = state.vendor_detector.lock().await;
    
    // Convert vendor strings to DataSource enums
    let mut data_sources = Vec::new();
    for (data, vendor) in data_list {
        if let Some(data_source) = detector.vendor_to_data_source(&vendor) {
            data_sources.push((data, data_source));
        }
    }
    
    Ok(service.merge_flight_data(data_sources))
}

#[tauri::command]
pub async fn test_vendor_endpoint(
    vendor: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let service = state.flight_service.lock().await;
    
    Ok(service.test_vendor(&vendor).await)
}

#[tauri::command]
pub async fn get_available_vendors(
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let service = state.flight_service.lock().await;
    
    Ok(service.get_available_vendors().await)
}

#[tauri::command]
pub async fn get_all_available_data(
    callsign: Option<String>,
    state: State<'_, AppState>,
) -> Result<Option<FlightData>, String> {
    log::info!("📊 get_all_available_data called with callsign: {:?}", callsign);
    let service = state.flight_service.lock().await;
    let detector = state.vendor_detector.lock().await;
    
    let available_vendors = detector.detect_available_vendors().await;
    log::info!("📊 Available vendors for merged data: {:?}", available_vendors);
    
    if available_vendors.is_empty() {
        log::info!("📊 No vendors available, returning None");
        return Ok(None);
    }
    
    let mut data_sources = Vec::new();
    
    // Fetch data from all available vendors
    for vendor in &available_vendors {
        log::info!("📊 Fetching data from vendor: {}", vendor);
        let result = if vendor == "adsb" {
            if let Some(ref cs) = callsign {
                service.fetch_by_vendor_with_callsign(vendor, cs).await
            } else {
                log::warn!("📊 ADSB vendor detected but no callsign provided, skipping");
                continue;
            }
        } else {
            service.fetch_by_vendor(vendor).await
        };
        
        match result {
            Ok(data) => {
                log::info!("📊 Successfully fetched data from vendor: {}", vendor);
                if let Some(data_source) = detector.vendor_to_data_source(vendor) {
                    data_sources.push((data, data_source));
                }
            }
            Err(e) => {
                log::error!("📊 Failed to fetch data from vendor {}: {}", vendor, e);
            }
        }
    }
    
    let merged_result = service.merge_flight_data(data_sources);
    log::info!("📊 Merged data result: {}", if merged_result.is_some() { "Success" } else { "None" });
    
    Ok(merged_result)
}

#[tauri::command]
pub async fn get_adsb_flight_by_callsign(
    callsign: String,
    state: State<'_, AppState>,
) -> Result<FlightData, String> {
    let service = state.flight_service.lock().await;
    
    service
        .fetch_adsb_by_callsign(&callsign)
        .await
        .map_err(|e| format!("Failed to fetch ADSB flight data by callsign: {}", e))
}

#[tauri::command]
pub async fn get_adsb_flight_by_icao(
    icao_address: String,
    state: State<'_, AppState>,
) -> Result<FlightData, String> {
    let service = state.flight_service.lock().await;
    
    service
        .fetch_adsb_by_icao(&icao_address)
        .await
        .map_err(|e| format!("Failed to fetch ADSB flight data by ICAO: {}", e))
}

#[tauri::command]
pub async fn get_all_adsb_flights(
    state: State<'_, AppState>,
) -> Result<Vec<FlightData>, String> {
    let service = state.flight_service.lock().await;
    
    service
        .fetch_adsb_all_flights()
        .await
        .map_err(|e| format!("Failed to fetch all ADSB flights: {}", e))
}

#[tauri::command]
pub async fn get_nearby_adsb_callsigns(
    latitude: f64,
    longitude: f64,
    distance: u32,
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let service = state.flight_service.lock().await;
    
    service
        .fetch_adsb_nearby_callsigns(latitude, longitude, distance)
        .await
        .map_err(|e| format!("Failed to fetch nearby ADSB flights: {}", e))
}
