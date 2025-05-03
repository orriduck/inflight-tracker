'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

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
    <div className="fixed top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
      {isConnected ? (
        <>
          <Wifi className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-700">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-500" />
          <span className="text-sm text-gray-700">Disconnected</span>
        </>
      )}
    </div>
  );
}
