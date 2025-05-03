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

    // Listen for online/offline events
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90'
      )}
      title={isConnected ? 'Connected' : 'Disconnected'}
      tabIndex={0}
    >
      {isConnected ? (
        <Wifi className={cn("w-5 h-5 text-green-500", "animate-glow-green")} />
      ) : (
        <WifiOff className="w-5 h-5 text-red-500" />
      )}
    </button>
  );
}

// Add this to your global CSS (e.g., app/globals.css):
// .animate-glow-green {
//   animation: wifi-glow 1.2s infinite alternate;
// }
// @keyframes wifi-glow {
//   0% { filter: drop-shadow(0 0 0px #22c55e); }
//   100% { filter: drop-shadow(0 0 8px #22c55e); }
// }
