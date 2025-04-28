import FlightMetrics from "@/components/FlightMetrics";
import FlightChart from "@/components/FlightChart";
import { mockFlightData } from "@/data/mockFlightData";
import BigBanner from "@/components/BigBanner";

export default function Home() {
  // Use the first data point for current metrics
  const currentData = mockFlightData[0];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header section with centered title */}
      <div className="flex justify-center items-center h-[70vh]">
        <h1 className="text-7xl font-bold text-center">Inflight Tracker</h1>
      </div>
      
      {/* Content section */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 gap-12">
          {/* Banner with flight information */}
          <BigBanner 
            from={currentData.origin}
            to={currentData.destination}
            flightNumber={currentData.flightNumber}
            flightDuration={currentData.flightDuration}
            timeToGo={currentData.timeToGo}
          />
          
          {/* Metrics board */}
          <FlightMetrics data={currentData} />

          {/* Flight chart visualization */}
          <FlightChart data={mockFlightData} />
        </div>
      </div>
    </div>
  );
}
