import { ArrowRight, Download } from "lucide-react";
import FlightProgress from "./FlightProgress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { convertToGPX, downloadGPX } from "@/utils/gpx";
import { FlightData } from "@/types/flight";

interface BigBannerProps {
  from: string;
  to: string;
  flightNumber: string;
  flightDuration?: number;  // in minutes
  timeToGo?: number;        // in minutes
  flightData: FlightData[]; // Add flight data for export
}

export default function BigBanner({ 
  from = 'BOS', 
  to = 'LAX', 
  flightNumber = 'AA12',
  flightDuration = 360,
  timeToGo = 180,
  flightData = []
}: BigBannerProps) {
  const handleExport = () => {
    if (flightData.length === 0) return;
    const gpxContent = convertToGPX(flightData);
    downloadGPX(gpxContent, flightNumber);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flight Info</CardTitle>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={flightData.length === 0}
        >
          <Download size={16} />
          Export GPX
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-lg font-medium">From</p>
              <p className="text-xl font-bold">{from}</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-1">Flight {flightNumber}</p>
              <div className="w-32 flex items-center">
                <ArrowRight size={24} className="w-full" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium">To</p>
              <p className="text-xl font-bold">{to}</p>
            </div>
          </div>

          {/* Flight Progress */}
          <div className="w-full">
            <FlightProgress 
              flightDuration={flightDuration} 
              timeToGo={timeToGo} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}