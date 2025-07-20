import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Unit conversion utilities
export function feetToMeters(feet: number): number {
  if (typeof feet !== "number" || isNaN(feet)) return 0;
  return Math.round(feet * 0.3048);
}

export function knotsToKmh(knots: number): number {
  if (typeof knots !== "number" || isNaN(knots)) return 0;
  return Math.round(knots * 1.852);
}

// Compass direction utility
export function getCompassDirection(heading: number): string {
  if (typeof heading !== "number" || isNaN(heading)) return "N/A";
  
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE", 
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];
  
  const normalizedHeading = ((heading % 360) + 360) % 360;
  const index = Math.round(normalizedHeading / 22.5) % 16;
  return directions[index];
}
