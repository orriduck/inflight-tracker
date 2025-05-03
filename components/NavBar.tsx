import { Download, RefreshCw, Trash, MoreHorizontal } from "lucide-react";
import { convertToGPX, downloadGPX } from "@/utils/gpx";
import { FlightData } from "@/types/flight";
import WifiIndicator from "./WifiIndicator";
import { cn } from "@/lib/utils";
import { useFlightData } from "@/app/contexts/FlightDataContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  from?: string; // ICAO or IATA code
  to?: string; // ICAO or IATA code
  flightNumber?: string;
  flightDuration?: number; // in minutes
  timeToGo?: number; // in minutes
  flightData: FlightData[];
}

function formatDuration(mins?: number) {
  if (typeof mins !== "number" || isNaN(mins) || mins < 0) return "N/A";
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
  flightData = [],
}: NavBarProps) {
  const { resetData } = useFlightData();
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    if (flightData.length === 0) return;
    const gpxContent = convertToGPX(flightData);
    downloadGPX(gpxContent, flightNumber || "flight");
    setOpen(false);
  };

  const handleReset = () => {
    resetData();
    setOpen(false);
  };

  const elapsed =
    typeof flightDuration === "number" && typeof timeToGo === "number"
      ? flightDuration - timeToGo
      : undefined;
  const percent =
    typeof flightDuration === "number" &&
    typeof timeToGo === "number" &&
    flightDuration > 0
      ? Math.max(
          0,
          Math.min(100, ((flightDuration - timeToGo) / flightDuration) * 100),
        )
      : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center gap-6">
          {/* FROM */}
          <div className="flex flex-col items-start justify-center min-w-[70px]">
            <span className="text-2xl font-extrabold leading-none">
              {from || "N/A"}
            </span>
          </div>

          {/* Progress Bar Section */}
          <div className="flex-1 flex flex-col justify-center mx-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-primary-foreground/80 font-mono">
                {flightNumber || "N/A"}
              </span>
              <span className="text-sm text-primary-foreground/90 font-semibold">
                {formatDuration(flightDuration)}
              </span>
            </div>
            <div className="relative w-full h-3 mt-1 flex items-center">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-primary-foreground/20 rounded-full" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-foreground rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-primary-foreground/70">
                {formatDuration(elapsed)} elapsed
              </span>
              <span className="text-primary-foreground/70">
                {formatDuration(timeToGo)} to go
              </span>
            </div>
          </div>

          {/* TO */}
          <div className="flex flex-col items-end justify-center min-w-[70px]">
            <span className="text-2xl font-extrabold leading-none">
              {to || "N/A"}
            </span>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={handleExport}
                disabled={flightData.length === 0}
                className="cursor-pointer"
              >
                <Download />
                Export GPX
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleReset}
                variant="destructive"
                className="cursor-pointer"
              >
                <Trash />
                Reset Data
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5 flex items-center">
                <span className="mr-2 text-sm">Connection:</span>
                <WifiIndicator />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
