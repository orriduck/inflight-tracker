'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WifiIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(navigator.onLine);
    };

    // Initial check
    updateConnectionStatus();

    // Listen for online/offline events for immediate status changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Set up polling to check status every second
    const intervalId = setInterval(() => {
      updateConnectionStatus();
    }, 1000);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="inline-flex items-center justify-center" title={isConnected ? 'Connected' : 'Disconnected'}>
      {isConnected ? (
        <Wifi className={cn("w-5 h-5 text-green-500", "animate-glow-green")} aria-hidden="true" />
      ) : (
        <WifiOff className="w-5 h-5 text-red-500" aria-hidden="true" />
      )}
    </div>
  );
}


