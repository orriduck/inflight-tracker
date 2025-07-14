"use client";

import { FlightData } from "@/types/flight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Ruler, PlaneLanding, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { feetToMeters, knotsToKmh, getCompassDirection } from "@/lib/utils";

// Define interfaces for our metrics
interface BaseMetric {
  title: string;
  icon: React.ReactNode;
  unit: string;
  secondaryValue?: string | number | null;
  secondaryUnit?: string;
}

interface StandardMetric extends BaseMetric {
  value: number | null;
  isCoordinate?: false;
}

interface CoordinateMetric extends BaseMetric {
  wholeValue: number;
  decimalValue: number;
  isCoordinate: true;
}

type Metric = StandardMetric | CoordinateMetric;

interface FlightMetricsProps {
  data: FlightData;
  loading: boolean;
}

export default function FlightMetrics({ data, loading }: FlightMetricsProps) {
  const [, setColumns] = useState(3);
  const distanceToGo = (data.distanceToGo !== null && data.distanceToGo !== undefined) 
    ? Math.floor(data.distanceToGo) 
    : null

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const metrics: Metric[] = [
    {
      title: "Ground Speed",
      value: Math.floor(data.groundspeed),
      unit: "knots",
      secondaryValue: knotsToKmh(data.groundspeed),
      secondaryUnit: "km/h",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: "Altitude",
      value: Math.floor(data.altitude),
      unit: "ft",
      secondaryValue: feetToMeters(data.altitude),
      secondaryUnit: "m",
      icon: <PlaneLanding className="h-5 w-5" />,
    },
    {
      title: "Heading",
      value: data.heading ? Math.abs(Math.floor(data.heading)) : null,
      unit: "°",
      secondaryValue: data.heading ? getCompassDirection(data.heading) : null,
      secondaryUnit: "",
      icon: <Compass className="h-5 w-5" />,
    },
    {
      title: "Distance To Go",
      value: distanceToGo,
      unit: "nm",
      secondaryValue: distanceToGo
        ? (distanceToGo * 1.852).toFixed(0)
        : null,
      secondaryUnit: "km",
      icon: <Ruler className="h-5 w-5" />,
    },
    {
      title: "Latitude",
      wholeValue: Math.floor(Math.abs(data.latitude)),
      decimalValue: Math.floor((Math.abs(data.latitude) % 1) * 1000),
      unit: data.latitude >= 0 ? "°N" : "°S",
      icon: <Ruler className="h-5 w-5" />,
      isCoordinate: true,
    },
    {
      title: "Longitude",
      wholeValue: Math.floor(Math.abs(data.longitude)),
      decimalValue: Math.floor((Math.abs(data.longitude) % 1) * 1000),
      unit: data.longitude >= 0 ? "°E" : "°W",
      icon: <Ruler className="h-5 w-5" />,
      isCoordinate: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle>Flight Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
          {metrics.map((metric) => (
            <div key={metric.title} className="rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {metric.icon}
                <h3 className="font-medium">{metric.title}</h3>
              </div>
              <div className="font-bold text-2xl">
                {metric.isCoordinate ? (
                  <div className="flex items-baseline">
                    <div key={`${metric.title}-whole-${metric.wholeValue}`} className="animate-slide-in">
                      {metric.wholeValue}
                    </div>
                    <span className="text-xl">.</span>
                    <div key={`${metric.title}-decimal-${metric.decimalValue}`} className="animate-slide-in">
                      {metric.decimalValue.toString().padStart(3, '0')}
                    </div>
                    <span className="text-sm ml-1 font-normal">
                      {metric.unit}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <div key={`${metric.title}-${metric.value}`} className="animate-slide-in">
                      {metric.value !== undefined && metric.value !== null ? (
                        <>
                          {metric.value}
                          <span className="text-sm ml-1 font-normal">
                            {metric.unit}
                          </span>
                        </>
                      ) : (
                        <>Not Available</>
                      )}
                    </div>
                  </div>
                )}
                {!loading && !!metric.secondaryValue && (
                  <div key={`${metric.title}-secondary-${metric.secondaryValue}`} className="text-sm font-normal text-muted-foreground mt-1 animate-slide-in">
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
