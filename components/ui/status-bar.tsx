"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle, Wifi } from "lucide-react";

interface StatusBarProps {
  status: 'idle' | 'checking' | 'success' | 'error';
  message: string;
  vendors?: string[];
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ status, message, vendors = [], className }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-blue-600/30 border-blue-400/40 shadow-lg shadow-blue-500/20';
      case 'success':
        return 'bg-gradient-to-br from-green-500/30 via-green-400/20 to-green-600/30 border-green-400/40 shadow-lg shadow-green-500/20';
      case 'error':
        return 'bg-gradient-to-br from-red-500/30 via-red-400/20 to-red-600/30 border-red-400/40 shadow-lg shadow-red-500/20';
      default:
        return 'bg-gradient-to-br from-white/20 via-white/10 to-white/30 border-white/30 shadow-lg shadow-black/10';
    }
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ 
        width: "auto", 
        opacity: 1,
        scale: status === 'checking' ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut",
        scale: {
          duration: 2,
          repeat: status === 'checking' ? Infinity : 0,
          ease: "easeInOut"
        }
      }}
      className={cn(
        "backdrop-blur-2xl border rounded-full",
        "px-4 py-2 flex items-center gap-2",
        "transition-all duration-300",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:via-transparent before:to-white/5 before:rounded-full",
        "hover:scale-105 hover:shadow-xl",
        getStatusColor(),
        className
      )}
    >
      <div className="relative z-10 flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium whitespace-nowrap">
          {message}
        </span>
      </div>
      {vendors.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 flex items-center gap-1"
        >
          <span className="text-xs opacity-70">•</span>
          <span className="text-xs opacity-70">
            {vendors.join(", ")}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusBar;
