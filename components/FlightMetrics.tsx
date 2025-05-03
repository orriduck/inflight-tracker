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
import Counter from "@/components/ui/counter";

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
      value: Math.floor(data.groundspeed),
      unit: "knots",
      secondaryValue: knotsToKmh(data.groundspeed),
      secondaryUnit: "km/h",
      icon: <Rocket className="h-5 w-5" />,
      places: [1000, 100, 10, 1],
    },
    {
      title: "Altitude",
      value: Math.floor(data.altitude),
      unit: "ft",
      secondaryValue: feetToMeters(data.altitude),
      secondaryUnit: "m",
      icon: <PlaneLanding className="h-5 w-5" />,
      places: [10000, 1000, 100, 10],
    },
    {
      title: "Heading",
      value: Math.floor(data.heading),
      unit: "°",
      secondaryValue: getCompassDirection(data.heading),
      secondaryUnit: "",
      icon: <Compass className="h-5 w-5" />,
      places: [100, 10, 1],
    },
    {
      title: "Distance To Go",
      value: Math.floor(data.distanceToGo),
      unit: "mi",
      secondaryValue: (data.distanceToGo * 1.60934).toFixed(0),
      secondaryUnit: "km",
      icon: <Ruler className="h-5 w-5" />,
      places: [10000, 1000, 100, 10, 1],
    },
    {
      title: "Latitude",
      value: Math.floor(Math.abs(data.latitude)),
      decimal: (Math.abs(data.latitude) % 1).toFixed(3).substring(2),
      unit: data.latitude >= 0 ? "°N" : "°S",
      icon: <Ruler className="h-5 w-5" />,
      places: [100, 10, 1],
      showDecimal: true,
    },
    {
      title: "Longitude",
      value: Math.floor(Math.abs(data.longitude)),
      decimal: (Math.abs(data.longitude) % 1).toFixed(3).substring(2),
      unit: data.longitude >= 0 ? "°E" : "°W",
      icon: <Ruler className="h-5 w-5" />,
      places: [100, 10, 1],
      showDecimal: true,
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
              className="p-4 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-black/10 rounded-full">
                  {metric.icon}
                </div>
                <h3 className="font-medium">{metric.title}</h3>
              </div>
              <div className="font-bold">
                <div className="flex items-baseline">
                  <div>
                    <Counter
                      value={metric.value}
                      fontSize={28}
                      places={metric.places}
                      gap={2}
                      borderRadius={4}
                      textColor="inherit"
                      fontWeight="bold"
                      gradientHeight={10}
                      gradientFrom="rgba(0,0,0,0.4)"
                      gradientTo="transparent"
                      counterStyle={{
                        background: "transparent",
                        padding: "0.25rem",
                      }}
                    />
                  </div>
                  {metric.showDecimal && (
                    <>
                      <span className="text-xl mx-0.5">.</span>
                      <span className="text-xl">{metric.decimal}</span>
                    </>
                  )}
                  <span className="text-sm ml-1 font-normal">{metric.unit}</span>
                </div>
                {!loading && metric.secondaryValue && (
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    ({metric.secondaryValue} {metric.secondaryUnit})
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