import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert feet to meters
export function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3048)
}

// Convert knots to km/h
export function knotsToKmh(knots: number): number {
  return Math.round(knots * 1.852)
}

// Get compass direction from heading
export function getCompassDirection(heading: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(((heading %= 360) < 0 ? heading + 360 : heading) / 45) % 8
  return directions[index]
}
