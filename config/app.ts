export const config = {
  pollingInterval: 3000, // Polling interval in milliseconds
  flightInfoUri: {
    "american-viasat": "http://localhost:3000/api/flight/americans/viasat",
    "american-intelsat": "http://localhost:3000/api/flight/americans/intelsat",
  },
} as const;
