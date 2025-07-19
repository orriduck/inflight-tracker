"use client";

import { useState, useEffect } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import GlassCard from "@/components/buouui/glass-card";
import StatusBar from "@/components/ui/status-bar";
import { TauriFlightService } from "@/lib/tauri-api";
import { useRouter } from "next/navigation";

type VendorStatus = 'idle' | 'checking' | 'success' | 'error';

export default function Home() {
  const [flightNumber, setFlightNumber] = useState("");
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);
  const router = useRouter();

  const handleStartTracking = () => {
    if (flightNumber.trim()) {
      // Navigate to tracker with flight number
      router.push(`/tracker?flight=${flightNumber}`);
    }
  };

  const checkVendorAvailability = async () => {
    try {
      setVendorStatus('checking');
      setStatusMessage('Checking flight data providers...');
      
      // Start checking vendors
      const vendors = await TauriFlightService.detectAvailableVendors();
      
      if (vendors.length > 0) {
        setVendorStatus('success');
        setStatusMessage(`Connected to ${vendors.length} provider${vendors.length > 1 ? 's' : ''}`);
        setAvailableVendors(vendors.map(vendor => {
          // Format vendor names for display
          switch(vendor) {
            case 'american-intelsat': return 'American Airlines (Intelsat)';
            case 'american-viasat': return 'American Airlines (ViaSat)';
            case 'jetblue': return 'JetBlue';
            case 'adsb': return 'OpenADSB Network';
            default: return vendor;
          }
        }));
      } else {
        setVendorStatus('error');
        setStatusMessage('No flight data providers available');
        setAvailableVendors([]);
      }
    } catch (error) {
      console.error('Error checking vendors:', error);
      setVendorStatus('error');
      setStatusMessage('Failed to connect to flight data providers');
      setAvailableVendors([]);
    }
  };

  useEffect(() => {
    // Check vendor availability when page loads
    checkVendorAvailability();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-8">
          {/* Title */}
          <h1 className="text-6xl lg:text-7xl font-bold">
            Inflight Tracker
          </h1>

          {/* Input and Button */}
          <div className="flex items-center gap-4 justify-center">
            <GlassCard className="min-w-[300px] p-4">
              <input
                type="text"
                placeholder="Enter flight number (e.g. AA1234)"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleStartTracking()}
              />
            </GlassCard>

            <GlassCard 
              variant="button"
              className="p-4 font-semibold flex items-center gap-2"
              onClick={handleStartTracking}
            >
              <span>Start Tracker</span>
              <ArrowRight className="size-5" />
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="pb-8 flex justify-center items-center gap-4">
        <StatusBar 
          status={vendorStatus}
          message={statusMessage}
          vendors={availableVendors}
        />
        <GlassCard 
          variant="button"
          className="p-3 flex items-center rounded-full"
          onClick={checkVendorAvailability}
        >
          <RefreshCw className={`size-3 ${vendorStatus === 'checking' ? 'animate-spin' : ''}`} />
        </GlassCard>
      </div>
    </div>
  );
}
