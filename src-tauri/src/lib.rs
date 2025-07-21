mod models;
mod services;
mod commands;

use commands::{ping_vendors, get_nearby_flights_recommendation, get_data, get_current_location};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_geolocation::init())
    .invoke_handler(tauri::generate_handler![
      ping_vendors,
      get_nearby_flights_recommendation,
      get_data,
      get_current_location
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
