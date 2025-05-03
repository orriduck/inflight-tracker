import { Download } from "lucide-react";
import { convertToGPX, downloadGPX } from "@/utils/gpx";
import { FlightData } from "@/types/flight";
import WifiIndicator from "./WifiIndicator";
import { cn } from "@/lib/utils";

interface NavBarProps {
  from?: string; // ICAO or IATA code
  to?: string;   // ICAO or IATA code
  flightNumber?: string;
  flightDuration?: number;  // in minutes
  timeToGo?: number;        // in minutes
  flightData: FlightData[];
}

function formatDuration(mins?: number) {
  if (typeof mins !== 'number' || isNaN(mins) || mins < 0) return "N/A";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h} hr ` : ""}${m} min`;
}

export default function NavBar({
  from,
  to,
  flightNumber,
  flightDuration,
  timeToGo,
  flightData = []
}: NavBarProps) {
  const handleExport = () => {
    if (flightData.length === 0) return;
    const gpxContent = convertToGPX(flightData);
    downloadGPX(gpxContent, flightNumber || 'flight');
  };

  const elapsed = (typeof flightDuration === 'number' && typeof timeToGo === 'number') ? flightDuration - timeToGo : undefined;
  const percent = (typeof flightDuration === 'number' && typeof timeToGo === 'number' && flightDuration > 0)
    ? Math.max(0, Math.min(100, ((flightDuration - timeToGo) / flightDuration) * 100))
    : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center gap-6">
          {/* FROM */}
          <div className="flex flex-col items-start justify-center min-w-[70px]">
            <span className="text-2xl font-extrabold leading-none">{from || 'N/A'}</span>
            <span className="text-xs text-primary-foreground/70 -mt-1">{}</span>
          </div>

          {/* Progress Bar Section */}
          <div className="flex-1 flex flex-col justify-center mx-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-primary-foreground/80 font-mono">{flightNumber || 'N/A'}</span>
              <span className="text-sm text-primary-foreground/90 font-semibold">{formatDuration(flightDuration)}</span>
              <span className="text-xs text-primary-foreground/80">{}</span>
            </div>
            <div className="relative w-full h-3 mt-1 flex items-center">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-primary-foreground/20 rounded-full" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-foreground rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-primary-foreground/70">{formatDuration(elapsed)} elapsed</span>
              <span className="text-primary-foreground/70">{formatDuration(timeToGo)} to go</span>
            </div>
          </div>

          {/* TO */}
          <div className="flex flex-col items-end justify-center min-w-[70px]">
            <span className="text-2xl font-extrabold leading-none">{to || 'N/A'}</span>
            <span className="text-xs text-primary-foreground/70 -mt-1">{}</span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className={cn(
              "ml-6 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
              "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
              "focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={flightData.length === 0}
          >
            <Download size={16} />
            Export GPX
          </button>

          {/* Wifi Indicator */}
          <div className="ml-4">
            <WifiIndicator />
          </div>
        </div>
      </div>
    </nav>
  );
} 