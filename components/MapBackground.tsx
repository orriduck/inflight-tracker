import { useEffect, useState, useRef } from 'react';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import type { Feature, LineString, Point } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { FlightData } from '@/types/flight';

interface MapBackgroundProps {
  flightData: FlightData[];
  hasMapData: boolean;
  setHasMapData: (value: boolean) => void;
}

interface ViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

const MapBackground = ({ flightData, hasMapData, setHasMapData }: MapBackgroundProps) => {
  const [viewport, setViewport] = useState<ViewportState>({
    latitude: 0,
    longitude: 0,
    zoom: 5
  });
  const mapRef = useRef<any>(null);

  // Check if OpenStreetMap tiles are available
  useEffect(() => {
    const checkMapTileAvailability = async () => {
    const testTileUrl = 'https://tile.openstreetmap.org/0/0/0.png';
    await fetch(testTileUrl, { method: 'HEAD' })
      .then(() => {
        setHasMapData(true);
      })
      .catch((error) => {
        setHasMapData(false);
      })
    }
    
    checkMapTileAvailability();
  }, []);

  useEffect(() => {
    if (flightData.length > 0) {
      const latestData = flightData[flightData.length - 1];
      if (latestData.latitude && latestData.longitude) {
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: [latestData.longitude, latestData.latitude],
            duration: 1000,
            easing: (t: number) => t * (2 - t) // ease-out-quad
          });
        }
        setViewport(prev => ({
          ...prev,
          latitude: latestData.latitude!,
          longitude: latestData.longitude!,
          zoom: 6,
          bearing: 0,
          pitch: 0
        }));
      }
    }
  }, [flightData]);

  const routeData: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: flightData
        .filter(data => data.longitude && data.latitude)
        .map(data => [data.longitude!, data.latitude!])
    }
  };

  const currentLocation: Feature<Point> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: flightData.length > 0 && flightData[flightData.length - 1].longitude && flightData[flightData.length - 1].latitude
        ? [flightData[flightData.length - 1].longitude!, flightData[flightData.length - 1].latitude!]
        : [0, 0]
    }
  };

  const mapStyle: StyleSpecification = {
    version: 8 as const,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
        paint: {
          'raster-saturation': -0.5,
          'raster-contrast': 0.6,
          'raster-brightness-min': 0.1,
          'raster-brightness-max': 0.9,
          'raster-opacity': 0.5
        }
      }
    ]
  };

  // Don't render the map if hasMapData is false
  if (!hasMapData) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 bg-background/50 backdrop-blur-sm">
      <div className="w-full h-full transition-all duration-1000 ease-out">
        <Map
          ref={mapRef}
          {...viewport}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
          interactive={false}
          dragPan={false}
          dragRotate={false}
          scrollZoom={false}
          doubleClickZoom={false}
          touchZoomRotate={false}
          keyboard={false}
          onError={() => setHasMapData(false)}
        >
          <Source type="geojson" data={routeData}>
            <Layer
              type="line"
              paint={{
                'line-color': '#666666',
                'line-width': 3,
                'line-opacity': 0.8
              }}
            />
          </Source>
          <Source type="geojson" data={currentLocation}>
            <Layer
              type="circle"
              paint={{
                'circle-radius': 8,
                'circle-color': '#000000',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }}
            />
          </Source>
        </Map>
      </div>
    </div>
  );
};

export default MapBackground; 