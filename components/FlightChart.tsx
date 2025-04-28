"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FlightData } from "@/types/flight-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FlightChartProps {
  data: FlightData[]
}

export default function FlightChart({ data }: FlightChartProps) {
  // Format data for chart
  const chartData = data.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    altitude: entry.altitude,
    groundspeed: entry.groundspeed,
    heading: entry.heading,
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { altitude, groundspeed, heading } = payload[0].payload
      
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Altitude: {altitude} ft</p>
          <p className="text-sm">Ground Speed: {groundspeed} kts</p>
          <p className="text-sm">Heading: {heading}°</p>
          <div className="flex justify-center mt-1">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="6" fill="hsl(var(--chart-1))" />
              <line
                x1="10"
                y1="10"
                x2="10"
                y2="4"
                stroke="white"
                strokeWidth="1.5"
                transform={`rotate(${Math.abs(heading)} 10 10)`}
              />
            </svg>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom dot with directional indicator
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props
    if (index % 2 !== 0) return null // Only show every other dot for cleaner look
    
    return (
      <g>
        <circle cx={cx} cy={cy} r="4" fill="hsl(var(--chart-1))" />
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - 6}
          stroke="hsl(var(--chart-1))"
          strokeWidth="1.5"
          transform={`rotate(${Math.abs(payload.heading)} ${cx} ${cy})`}
        />
      </g>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Metrics</CardTitle>
        <CardDescription>
          Altitude and Ground Speed with Directional Indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="altitude"
                stroke="hsl(var(--chart-1))"
                fillOpacity={0.3}
                fill="url(#colorAlt)"
                activeDot={<CustomDot />}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="groundspeed"
                stroke="hsl(var(--chart-2))"
                fillOpacity={0.3}
                fill="url(#colorSpeed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid gap-1 text-sm">
          <div className="font-medium">Flight AAL2408</div>
          <div className="text-muted-foreground">KPHL → KLAX</div>
        </div>
      </CardFooter>
    </Card>
  )
} 