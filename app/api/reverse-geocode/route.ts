import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (!lat || !lon) {
    return NextResponse.json({ location: '' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!res.ok) return NextResponse.json({ location: '' }, { status: 200 });
    const data = await res.json();
    if (data.address && (data.address.city || data.address.town || data.address.village)) {
      const city = data.address.city || data.address.town || data.address.village;
      const state = data.address.state || data.address.region || '';
      return NextResponse.json({ location: `${city}${state ? ', ' + state : ''}` });
    }
    return NextResponse.json({ location: '' }, { status: 200 });
  } catch {
    return NextResponse.json({ location: '' }, { status: 200 });
  }
} 