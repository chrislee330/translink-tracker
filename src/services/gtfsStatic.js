import { ROUTE_COLORS } from '../utils/constants';

/**
 * Load all necessary GTFS Static data
 */
export async function loadGTFSStaticData() {
    console.log('Loading GTFS Static data');

    try {
        const response = await fetch('/data/gtfs-processed.json');
        const data = await response.json();

        console.log('GTFS data loaded:', {
            routes: data.routes.length,
            stops: data.stops.length,
            shapes: data.shapes.length,
            trips: data.trips.length,
            stopTimes: data.stopTimes.length,
        });

        return data;
    } catch (error) {
        console.error('Failed to load GTFS data:', error);
        throw error;
    }
}

/**
 * Get routes by their short names
 */
export function getRoutesByShortNames(routes, shortNames) {
    // console.log(shortNames.map(x => typeof x));
    // console.log(routes.map(route => typeof route.route_short_name));
    return routes.filter(route =>
        shortNames.includes(route.route_short_name)
    );
}

/**
 * Get shape points for a specific route
 * Returns array of [lat, lng] coordinates
 */
export function getShapeForRoute(route, trips, shapes) {
    // Find a trip for this route
    const trip = trips.find(t => t.route_id === route.route_id);

    if (!trip || !trip.shape_id) {
        console.warn(`No shape found for route ${route.route_short_name}`);
        return [];
    }

    // Get all shape points for this shape_id [ [lat, lng], ...]
    const shapePoints = shapes
        .filter(s => s.shape_id === trip.shape_id)
        .sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
        .map(s => [s.shape_pt_lat, s.shape_pt_lon]);

    return shapePoints;
}

/**
 * Get stops for a specific route
 * Return array of stop objects with coordinates
 */
export function getStopsForRoute(route, trips, stopTimes, stops) {
    // Find all trips for this route
    const routeTrips = trips.filter(t => t.route_id === route.route_id);

    if (routeTrips.length === 0) return [];

    // Get stop IDs from one trip
    const tripId = routeTrips[0].trip_id;
    const tripStopTimes = stopTimes
        .filter(st => st.trip_id === tripId)
        .sort((a, b) => a.stop_sequence - b.stop_sequence);

    // Match with stop details
    const routeStops = tripStopTimes
        .map(st => stops.find(s => s.stop_id === st.stop_id))
        .filter(Boolean); // Remove undefined

    return routeStops;
}

/**
 * Convert route color from GTFS format to hex
 */
export function getRouteColor(route) {
    let color = route?.route_color;

    // Remove # if present 
    // Pad leading zeros to ensure 6 digits
    color = color.replace("#", "").toUpperCase();
    color = color.padStart(6, "0");

    const isValidHex = /^[0-9A-F]{1,6}$/.test(color);
    // console.log(isValidHex, color);
    // Must be valid hex, if no route_color
    if (!isValidHex || color == "000000") {
        if (ROUTE_COLORS[route.route_short_name]) {
            // console.log(route.route_short_name);
            return ROUTE_COLORS[route.route_short_name];
        }
        return DEFAULT_COLOR;
    }

    return `#${color}`;
}

/**
 * Gets major stops only for avoiding clutter on the map
 * (Simpler names)
 */
export function getMajorStopsForRoute(route, trips, stopTimes, stops) {
    const allStops = getStopsForRoute(route, trips, stopTimes, stops);

    const majorStops = allStops.filter((stop, index) => {
        // every 3rd stop, or "STATION" or "SKYTRAIN" in name
        return index % 3 === 0 ||
            stop.stop_name?.toUpperCase().includes('STATION') ||
            stop.stop_name?.toUpperCase().includes('SKYTRAIN');
    });

    return majorStops;
}
