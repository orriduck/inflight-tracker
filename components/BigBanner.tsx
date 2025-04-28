import { ArrowRight } from "lucide-react";
import FlightProgress from "./FlightProgress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BigBannerProps {
  from: string;
  to: string;
  flightNumber: string;
  flightDuration?: number;  // in minutes
  timeToGo?: number;        // in minutes
}

export default function BigBanner({ 
  from = 'BOS', 
  to = 'LAX', 
  flightNumber = 'AA12',
  flightDuration = 360,
  timeToGo = 180
}: BigBannerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flight Info</CardTitle>
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