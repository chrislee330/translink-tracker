import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import { loadGTFSStaticData, getRoutesByShortNames, getShapeForRoute, getRouteColor } from '../services/gtfsStatic';
import '../utils/leafletConfig';

function Map({ selectedRouteNames }) {
  const [gtfsData, setGtfsData] = useState(null);
  const [displayRoutes, setDisplayRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const center = [49.2827, -123.1207];
  const zoom = 12;

  // Load GTFS data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadGTFSStaticData();
        setGtfsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GTFS data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update displayed routes when selection changes
  useEffect(() => {
    if (!gtfsData || selectedRouteNames.length === 0) {
      setDisplayRoutes([]);
      return;
    }

    // Get selected routes
    const routes = getRoutesByShortNames(gtfsData.routes, selectedRouteNames);
    
    // Get shapes for each route
    const routesWithShapes = routes.map(route => ({
      ...route,
      shape: getShapeForRoute(route, gtfsData.trips, gtfsData.shapes),
      color: getRouteColor(route),
    }));

    setDisplayRoutes(routesWithShapes);
  }, [gtfsData, selectedRouteNames]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transit data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ height: '600px' }}>
        <p className="text-red-800 font-semibold">Error loading GTFS data</p>
        <p className="text-sm text-red-600 mt-2">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure GTFS files are in public/data/gtfs/
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw route shapes */}
        {displayRoutes.map(route => (
          route.shape.length > 0 && (
            <Polyline
              key={route.route_id}
              positions={route.shape}
              pathOptions={{
                color: route.color,
                weight: 4,
                opacity: 0.7,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-lg">{route.route_short_name}</p>
                  <p className="text-sm text-gray-600">{route.route_long_name}</p>
                </div>
              </Popup>
            </Polyline>
          )
        ))}

        {/* Show message if no routes selected */}
        {displayRoutes.length === 0 && !loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-[1000]">
            <p className="text-gray-600">No routes selected. Please select routes above.</p>
          </div>
        )}
      </MapContainer>
    </div>
  );
}

export default Map;