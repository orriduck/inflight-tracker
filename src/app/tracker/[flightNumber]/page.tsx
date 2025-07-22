"use client";

import { Button } from "@/src/components/ui/button";
import { Home, Wifi } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function FlightTrackerPage() {
  const router = useRouter();
  const params = useParams();
  const flightNumber = params.flightNumber;
  return (
    <div className="space-y-8">
      <div className="w-full h-12 flex items-center gap-2">
        <div className="bg-accent rounded-lg w-fit h-full flex gap-2 px-2">
          <Button
            onClick={() => router.push(`/`)}
            size="icon"
            className="h-full"
            variant="ghost"
          >
            <Home />
          </Button>
          <Button
            onClick={() => {}}
            size="icon"
            className="h-full"
            variant="ghost"
          >
            <Wifi />
          </Button>
        </div>
        <div className="bg-accent rounded-lg w-full h-full">
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-bold">{flightNumber}</h1>
      </div>
    </div>
  )
}