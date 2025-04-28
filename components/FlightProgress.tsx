import { Clock, Plane } from "lucide-react"
import { Progress } from "./ui/progress"

interface FlightProgressProps {
  flightDuration?: number  // in minutes
  timeToGo?: number        // in minutes
  className?: string
}

export default function FlightProgress({ 
  flightDuration = 360, 
  timeToGo = 180,
  className = "" 
}: FlightProgressProps) {
  // Calculate progress percentage
  const elapsedTime = flightDuration - timeToGo
  const progressPercentage = Math.min(Math.max(Math.round((elapsedTime / flightDuration) * 100), 0), 100)
  
  // Format time display (hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Elapsed: {formatTime(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Remaining: {formatTime(timeToGo)}</span>
          <Clock size={14} />
        </div>
      </div>
      
      <div className="relative pt-2 pb-4">
        <Progress value={progressPercentage} className="h-1.5" />
        
        {/* Airplane marker */}
        <div 
          className="absolute top-0 -translate-x-1/2 transition-all"
          style={{ left: `${progressPercentage}%` }}
        >
          <Plane 
            size={20} 
            className="text-primary fill-primary rotate-90 -translate-y-1/2" 
          />
        </div>
        
        {/* Progress percentage text */}
        <div 
          className="absolute text-xs font-medium text-muted-foreground pt-1 -translate-x-1/2"
          style={{ left: `${progressPercentage}%` }}
        >
          {progressPercentage}%
        </div>
      </div>
    </div>
  )
} 