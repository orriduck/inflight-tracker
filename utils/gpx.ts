import { FlightData } from '@/types/flight';

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * @param lat1 - Latitude of the first point in degrees
 * @param lon1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lon2 - Longitude of the second point in degrees
 * @returns Distance between points in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Performs linear interpolation between two numeric values.
 * @param start - Starting value
 * @param end - Ending value
 * @param fraction - Interpolation fraction (0 to 1)
 * @returns Interpolated value between start and end
 */
function interpolate(start: number, end: number, fraction: number): number {
  return start + (end - start) * fraction;
}

/**
 * Interpolates between two ISO timestamp strings.
 * @param start - Starting timestamp in ISO format
 * @param end - Ending timestamp in ISO format
 * @param fraction - Interpolation fraction (0 to 1)
 * @returns Interpolated timestamp in ISO format
 */
function interpolateTimestamp(start: string, end: string, fraction: number): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const interpolatedTime = startTime + (endTime - startTime) * fraction;
  return new Date(interpolatedTime).toISOString();
}

/**
 * Interpolates between two flight data points, handling all properties appropriately.
 * Numeric values are linearly interpolated, nullable values are interpolated only if both values exist,
 * and string values are copied from the start point.
 * @param start - Starting flight data point
 * @param end - Ending flight data point
 * @param fraction - Interpolation fraction (0 to 1)
 * @returns A new FlightData object with interpolated values
 */
function interpolateFlightData(start: FlightData, end: FlightData, fraction: number): FlightData {
  // For numeric values that can be interpolated
  const interpolatedNumeric = {
    latitude: interpolate(start.latitude, end.latitude, fraction),
    longitude: interpolate(start.longitude, end.longitude, fraction),
    altitude: interpolate(start.altitude, end.altitude, fraction),
    groundspeed: interpolate(start.groundspeed, end.groundspeed, fraction),
    heading: interpolate(start.heading, end.heading, fraction),
    flightDuration: interpolate(start.flightDuration, end.flightDuration, fraction),
    distanceToGo: interpolate(start.distanceToGo, end.distanceToGo, fraction),
    timeToGo: interpolate(start.timeToGo, end.timeToGo, fraction),
  };

  // For numeric values that might be null
  const interpolatedNullableNumeric = {
    airspeed: start.airspeed !== null && end.airspeed !== null 
      ? interpolate(start.airspeed, end.airspeed, fraction)
      : null,
    airTemperature: start.airTemperature !== null && end.airTemperature !== null
      ? interpolate(start.airTemperature, end.airTemperature, fraction)
      : null,
    grossWeight: start.grossWeight !== null && end.grossWeight !== null
      ? interpolate(start.grossWeight, end.grossWeight, fraction)
      : null,
    windSpeed: start.windSpeed !== null && end.windSpeed !== null
      ? interpolate(start.windSpeed, end.windSpeed, fraction)
      : null,
    windDirection: start.windDirection !== null && end.windDirection !== null
      ? interpolate(start.windDirection, end.windDirection, fraction)
      : null,
  };

  // For string values that should be copied from the start point
  const copiedStrings = {
    flightNumber: start.flightNumber,
    noseId: start.noseId,
    vehicleId: start.vehicleId,
    destination: start.destination,
    origin: start.origin,
    flightId: start.flightId,
    doorState: start.doorState,
    wheelWeightState: start.wheelWeightState,
    flightPhase: start.flightPhase,
  };

  // For nullable string values
  const copiedNullableStrings = {
    paState: start.paState,
    eta: start.eta,
  };

  return {
    ...interpolatedNumeric,
    ...interpolatedNullableNumeric,
    ...copiedStrings,
    ...copiedNullableStrings,
    timestamp: interpolateTimestamp(start.timestamp, end.timestamp, fraction),
  };
}

/**
 * Applies a moving average smoothing to a single value within an array of values.
 * @param values - Array of numeric values to smooth
 * @param index - Index of the value to smooth
 * @param windowSize - Size of the smoothing window (default: 3)
 * @returns Smoothed value
 */
function smoothValue(values: number[], index: number, windowSize: number = 3): number {
  const start = Math.max(0, index - Math.floor(windowSize / 2));
  const end = Math.min(values.length, index + Math.floor(windowSize / 2) + 1);
  const window = values.slice(start, end);
  return window.reduce((sum, val) => sum + val, 0) / window.length;
}

/**
 * Processes flight data to ensure points are within 1km of each other and applies smoothing.
 * This function performs two passes:
 * 1. Interpolates additional points between any two points that are more than 1km apart
 * 2. Applies a moving average smoothing to reduce noise in the track
 * @param flightData - Array of flight data points to process
 * @returns Processed array of flight data points with interpolated and smoothed values
 */
export function processFlightData(flightData: FlightData[]): FlightData[] {
  if (flightData.length < 2) return flightData;

  const MAX_DISTANCE = 1000; // 1km in meters
  const processedData: FlightData[] = [];
  
  // First pass: Interpolate points that are too far apart
  for (let i = 0; i < flightData.length - 1; i++) {
    const current = flightData[i];
    const next = flightData[i + 1];
    processedData.push(current);

    const distance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );

    if (distance > MAX_DISTANCE) {
      const numPoints = Math.ceil(distance / MAX_DISTANCE);
      for (let j = 1; j < numPoints; j++) {
        const fraction = j / numPoints;
        processedData.push(interpolateFlightData(current, next, fraction));
      }
    }
  }
  processedData.push(flightData[flightData.length - 1]);

  // Second pass: Smooth the data
  const smoothedData: FlightData[] = [];
  for (let i = 0; i < processedData.length; i++) {
    const current = processedData[i];
    const latitudes = processedData.map(d => d.latitude);
    const longitudes = processedData.map(d => d.longitude);
    const altitudes = processedData.map(d => d.altitude);
    const speeds = processedData.map(d => d.groundspeed);
    const headings = processedData.map(d => d.heading);

    smoothedData.push({
      ...current,
      latitude: smoothValue(latitudes, i),
      longitude: smoothValue(longitudes, i),
      altitude: smoothValue(altitudes, i),
      groundspeed: smoothValue(speeds, i),
      heading: smoothValue(headings, i)
    });
  }

  return smoothedData;
}

/**
 * Converts an array of flight data points into a GPX (GPS Exchange Format) string.
 * The function first processes the data to ensure smooth tracks with points no more than 1km apart,
 * then generates a valid GPX 1.1 document with track points including position, elevation,
 * timestamp, and additional flight data in the extensions.
 * @param flightData - Array of flight data points to convert
 * @returns GPX document as a string
 */
export function convertToGPX(flightData: FlightData[]): string {
  const processedData = processFlightData(flightData);
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Inflight Tracker"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Flight Track</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Flight Path</name>
    <trkseg>`;

  const points = processedData.map(data => `
      <trkpt lat="${data.latitude}" lon="${data.longitude}">
        <ele>${data.altitude}</ele>
        <time>${data.timestamp}</time>
        <extensions>
          <speed>${data.groundspeed}</speed>
          <heading>${data.heading}</heading>
        </extensions>
      </trkpt>`).join('');

  const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

  return gpxHeader + points + gpxFooter;
}

/**
 * Creates and triggers a download of a GPX file containing the flight track data.
 * The file is named using the flight number and current timestamp.
 * @param gpxContent - GPX document content as a string
 * @param flightNumber - Flight number to include in the filename
 */
export function downloadGPX(gpxContent: string, flightNumber: string) {
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flight-${flightNumber}-${new Date().toISOString()}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} 