'use client';

import { Wifi, WifiOff, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightData } from '@/app/contexts/FlightDataContext';

export default function WifiIndicator() {
  const { vendor } = useFlightData();

  const getStatusInfo = () => {
    if (vendor === undefined) {
      return {
        icon: HelpCircle,
        className: "text-yellow-500",
        title: "Checking connection...",
        showGlow: false
      };
    }
    if (vendor === null) {
      return {
        icon: WifiOff,
        className: "text-red-500",
        title: "No flight data connection available",
        showGlow: false
      };
    }
    return {
      icon: Wifi,
      className: "text-green-500",
      title: `Connected to ${vendor} flight data`,
      showGlow: true
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className="inline-flex items-center justify-center" title={status.title}>
      <Icon 
        className={cn(
          "w-5 h-5",
          status.className,
          status.showGlow && "animate-glow-green"
        )} 
        aria-hidden="true" 
      />
    </div>
  );
}


