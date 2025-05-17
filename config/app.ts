export const config = {
  pollingInterval: 3000, // Polling interval in milliseconds
  flightInfoUri: {
    american: 'http://localhost:3000/api/flight/americans',
  },
} as const; 