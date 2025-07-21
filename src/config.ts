export const config = {
  pollingInterval: 3000, // Polling interval in milliseconds
  // Flight data is now handled by the Tauri Rust backend
  supportedVendors: ["american-viasat", "american-intelsat", "jetblue", "adsb"],
} as const;
