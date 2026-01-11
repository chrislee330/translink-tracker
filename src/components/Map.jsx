import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { loadGTFSStaticData, getRoutesByShortNames, getShapeForRoute, getRouteColor, getMajorStopsForRoute } from '../services/gtfsStatic';
import StopMarker from './StopMarker';
import '../utils/leafletConfig';
import MapControls from './MapControls';

function ZoomAwareStops({ route, showStops }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const handleZoom = () => setZoom(map.getZoom());
        map.on('zoomend', handleZoom);
        return () => map.off('zoomend', handleZoom);
    }, [map]);

    // Only show stops when zoomed in past level 13
    if (!showStops || zoom < 13) return null;

    return (
        <>
            {route.stops.map((stop, index) => (
                <StopMarker
                    key={`${route.route_id}-${stop.stop_id}-${index}`}
                    stop={stop}
                    route={route}
                />
            ))}
        </>
    );
}

function Map({ selectedRouteNames }) {
    const [gtfsData, setGtfsData] = useState(null);
    const [displayRoutes, setDisplayRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStops, setShowStops] = useState(true);

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
            stops: getMajorStopsForRoute(route, gtfsData.trips, gtfsData.stopTimes, gtfsData.stops),
            color: getRouteColor(route),
        }));

        console.log('Routes with stops:', routesWithShapes.map(r => ({
            route: r.route_short_name,
            stops: r.stops.length
        })));

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
                    <div key={route.route_id}>
                        {route.shape.length > 0 && (
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
                        )}
                        {/* Add stops based off zoom */}
                        <ZoomAwareStops route={route} showStops={showStops} />
                    </div>
                ))}

                {/* Add map controls */}
                <MapControls
                    showStops={showStops}
                    onToggleStops={setShowStops}
                />

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