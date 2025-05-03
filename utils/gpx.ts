import { FlightData } from '@/types/flight';

export function convertToGPX(flightData: FlightData[]): string {
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

  const points = flightData.map(data => `
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