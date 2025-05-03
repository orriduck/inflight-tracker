import { NextResponse } from 'next/server';
import { FlightData } from '@/types/flight';

const API_URL = 'https://www.aainflight.com/api/v1/connectivity/viasat/flight';

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store' // Disable caching to always get fresh data from external API
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data as FlightData);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
} 