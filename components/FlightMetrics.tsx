"use client";

import { FlightData } from "@/types/flight-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket, Ruler, Clock, Wind, Thermometer, PlaneLanding } from "lucide-react";
import { useEffect, useState } from "react";

interface FlightMetricsProps {
  data: FlightData;
}

export default function FlightMetrics({ data }: FlightMetricsProps) {
  const [columns, setColumns] = useState(3);
  
  // Update columns based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 768) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const metrics = [
    {
      title: "Ground Speed",
      value: data.groundspeed,
      unit: "mph",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: "Altitude",
      value: data.altitude,
      unit: "ft",
      icon: <PlaneLanding className="h-5 w-5" />,
    },
    {
      title: "Flight Time",
      value: Math.round(data.flightDuration / 60),
      unit: "h",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Distance To Go",
      value: data.distanceToGo,
      unit: "mi",
      icon: <Ruler className="h-5 w-5" />,
    },
  ];

  // Only add temperature if available
  if (data.airTemperature) {
    metrics.push({
      title: "Air Temperature",
      value: data.airTemperature,
      unit: "°C",
      icon: <Thermometer className="h-5 w-5" />,
    });
  }

  // Only add wind if available
  if (data.windSpeed && data.windDirection) {
    metrics.push({
      title: "Wind",
      value: data.windSpeed,
      unit: `mph ${data.windDirection}°`,
      icon: <Wind className="h-5 w-5" />,
    });
  }

  // Helper function to determine if a border should be applied
  const shouldHaveBorderRight = (index: number) => {
    return (index + 1) % columns !== 0 && index !== metrics.length - 1;
  };

  const shouldHaveBorderBottom = (index: number) => {
    return index < metrics.length - columns;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flight Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
          {metrics.map((metric, index) => (
            <div 
              key={metric.title} 
              className={`p-4 ${shouldHaveBorderRight(index) ? "border-r" : ""} ${shouldHaveBorderBottom(index) ? "border-b" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {metric.icon}
                <h3 className="font-medium">{metric.title}</h3>
              </div>
              <div className="text-2xl font-bold">
                {metric.value}
                <span className="text-sm font-normal ml-1">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 