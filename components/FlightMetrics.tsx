"use client";

import { FlightData } from "@/types/flight";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket, Ruler, Clock, Wind, Thermometer, PlaneLanding, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { feetToMeters, knotsToKmh, getCompassDirection } from "@/lib/utils";

interface FlightMetricsProps {
  data: FlightData;
  loading: boolean;
}

export default function FlightMetrics({ data, loading }: FlightMetricsProps) {
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
      unit: "knots",
      secondaryValue: knotsToKmh(data.groundspeed),
      secondaryUnit: "km/h",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: "Altitude",
      value: data.altitude,
      unit: "ft",
      secondaryValue: feetToMeters(data.altitude),
      secondaryUnit: "m",
      icon: <PlaneLanding className="h-5 w-5" />,
    },
    {
      title: "Heading",
      value: data.heading,
      unit: "°",
      secondaryValue: getCompassDirection(data.heading),
      secondaryUnit: "",
      icon: <Compass className="h-5 w-5" />,
    },
    {
      title: "Longitude",
      value: data.longitude.toFixed(3),
      unit: "",
      icon: <Ruler className="h-5 w-5" />,
    },
    {
      title: "Latitude",
      value: data.latitude.toFixed(3),
      unit: "",
      icon: <Ruler className="h-5 w-5" />,
    },
    {
      title: "Distance To Go",
      value: data.distanceToGo,
      unit: "mi",
      secondaryValue: (data.distanceToGo * 1.60934).toFixed(0),
      secondaryUnit: "km",
      icon: <Ruler className="h-5 w-5" />,
    },
  ];

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
              className="p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {metric.icon}
                <h3 className="font-medium">{metric.title}</h3>
              </div>
              <div className="text-2xl font-bold">
                {metric.value}
                <span className="text-sm font-normal ml-1">{metric.unit}</span>
                {!loading && metric.secondaryValue && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    ({metric.secondaryValue}{metric.secondaryUnit})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 