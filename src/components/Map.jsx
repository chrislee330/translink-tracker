import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { loadGTFSStaticData, getRoutesByShortNames, getShapeForRoute, getRouteColor } from '../services/gtfsStatic';
import { SELECTED_ROUTES } from '../utils/constants';
import '../utils/leafletConfig';

function Map() {
  const [gtfsData, setGtfsData] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
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

        // Get selected routes
        const routes = getRoutesByShortNames(data.routes, SELECTED_ROUTES);
        
        // Get shapes for each route
        const routesWithShapes = routes.map(route => ({
          ...route,
          shape: getShapeForRoute(route, data.trips, data.shapes),
          color: getRouteColor(route),
        }));

        setSelectedRoutes(routesWithShapes);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GTFS data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transit routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ height: '600px' }}>
        <p className="text-red-800">Error loading GTFS data: {error}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure GTFS files are in public/data/gtfs/
        </p>
      </div>
    );
  }

//   console.log(
//     selectedRoutes.map(route => ({
//         id: route.route_id,
//         hasShape: !!route.shape,
//         hasColor: route.color,
//         shapeLength: route.shape?.length,
//     }))
//     );

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {/* Draw route shapes */}
        {selectedRoutes.map(route => (
          <Polyline
              key={route.route_id}
              positions={route.shape}
              pathOptions={{
                color: route.color,
                weight: 4,
                opacity: 0.5,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold">{route.route_short_name}</p>
                  <p className="text-sm">{route.route_long_name}</p>
                </div>
              </Popup>
            </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;