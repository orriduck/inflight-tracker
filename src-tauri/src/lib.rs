mod models;
mod services;
mod commands;

use commands::{AppState, get_flight_data, detect_vendors, get_primary_vendor, validate_vendor, merge_flight_data, test_vendor_endpoint, get_available_vendors, get_all_available_data, get_adsb_flight_by_callsign, get_adsb_flight_by_icao, get_all_adsb_flights};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .invoke_handler(tauri::generate_handler![
      get_flight_data,
      detect_vendors,
      get_primary_vendor,
      validate_vendor,
      merge_flight_data,
      test_vendor_endpoint,
      get_available_vendors,
      get_all_available_data,
      get_adsb_flight_by_callsign,
      get_adsb_flight_by_icao,
      get_all_adsb_flights
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
