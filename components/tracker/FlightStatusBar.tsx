"use client";

import { FlightData } from "@/types/flight";
import GlassCard from "@/components/buouui/glass-card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface FlightStatusBarProps {
  from?: string;
  to?: string;
  flightNumber?: string;
  flightDuration?: number;
  timeToGo?: number;
  flightData: FlightData[];
}

function formatDuration(mins?: number) {
  if (typeof mins !== "number" || isNaN(mins)) return "N/A";
  mins = Math.max(0, mins);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h} hr ` : ""}${m} min`;
}

export default function FlightStatusBar({
  from,
  to,
  flightNumber,
  flightDuration,
  timeToGo,
}: FlightStatusBarProps) {
  const router = useRouter();
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

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <GlassCard className="p-4 mb-4">
      <div className="flex items-center gap-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* FROM */}
        <div className="flex flex-col items-start justify-center min-w-[70px]">
          <span className="text-2xl font-extrabold leading-none">
            {from || "N/A"}
          </span>
        </div>

        {/* Progress Bar Section */}
        <div className="flex-1 flex flex-col justify-center mx-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs opacity-80 font-mono">
              {flightNumber || "N/A"}
            </span>
            <span className="text-sm opacity-90 font-semibold">
              {formatDuration(flightDuration)}
            </span>
          </div>
          <div className="relative w-full h-3 mt-1 flex items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-foreground/20 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-foreground rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="opacity-70">
              {formatDuration(elapsed)} elapsed
            </span>
            <span className="opacity-70">
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
      </div>
    </GlassCard>
  );
}
