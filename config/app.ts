export const config = {
  pollingInterval: 3000, // Polling interval in milliseconds
  flightInfoUri: {
    "american-viasat": "https://www.aainflight.com/api/v1/connectivity/viasat/system-status",
    "american-intelsat": "https://www.aainflight.com/api/v1/connectivity/intelsat/system-status",
    "jetblue": "https://ifecondor-api.jetblue.com/",
  },
} as const;
