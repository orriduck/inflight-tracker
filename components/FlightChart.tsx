"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { FlightData } from "@/types/flight"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FlightChartProps {
  flightData: FlightData[]
}

export default function FlightChart({ flightData }: FlightChartProps) {
  // Format data for chart
  const chartData = flightData.map((entry) => ({
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
        <CardTitle>Altitude & Ground Speed Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#666666" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#666666" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={Math.ceil(chartData.length / 4) - 1} // Show fewer ticks
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 'dataMax + 500']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 'dataMax + 500']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="altitude"
                name="Altitude (ft)"
                stroke="#666666"
                activeDot={<CustomDot />}
                fillOpacity={0.3}
                fill="#666666"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="groundspeed"
                name="Ground Speed (kts)"
                stroke="#fb923c"
                fillOpacity={0.3}
                fill="#fb923c"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 