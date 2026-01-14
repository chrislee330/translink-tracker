import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const API_KEY = import.meta.env.VITE_TRANSLINK_API_KEY;
const VEHICLE_POSITIONS_URL = import.meta.env.VITE_GTFS_REALTIME_VEHICLE_POSITIONS;

/**
 *  fetch and parse GTFS realtime vehicle positions
 *  returns array of vehicle position objects
 */

export async function fetchVehiclePositions() {
    try {
        console.log('Fetching vehicle positions...');

        // protobuf data
        const response = await fetch(`${VEHICLE_POSITIONS_URL}?apikey=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`APi request failed: ${response.status} ${response.statusText}`);
        }

        // reponse as array buffer
        const buffer = await response.arrayBuffer();

        // parse protobuf
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        console.log(`Received ${feed.entity.length} vehicle positions`);
        console.log(feed);
        // Extract vehicle positions from feed
        const vehicles = feed.entity
            .filter(entity => entity.vehicle)  // Only entities with vehicle data
            .map(entity => {
                const vehicle = entity.vehicle;

                return {
                    id: entity.id,
                    vehicleId: vehicle.vehicle?.id,
                    routeId: vehicle.trip?.routeId,
                    tripId: vehicle.trip?.tripId,
                    directionId: vehicle.trip?.directionId,
                    latitude: vehicle.position?.latitude,
                    longitude: vehicle.position?.longitude,
                    bearing: vehicle.position?.bearing,  // Direction vehicle is facing
                    speed: vehicle.position?.speed,      // Speed in m/s
                    timestamp: vehicle.timestamp,
                    currentStatus: vehicle.currentStatus,  // STOPPED_AT, IN_TRANSIT_TO, etc.
                    stopId: vehicle.stopId,
                };
            })
            .filter(v => v.latitude && v.longitude);  // Only vehicles with valid positions
        console.log(vehicles);
        return vehicles;
    } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        throw error;
    }
}

/**
 * Filter vehicles to only those on selected routes
 * routeIds is in number, vehicles route_id is string
 */
export function filterVehiclesByRoutes(vehicles, routeIds) {
    const routeIdsString = routeIds.map(routeId => routeId.toString());
    return vehicles.filter(vehicle => routeIdsString.includes(vehicle.routeId));
}

/**
 * Get route ID from route object (for filtering)
 */
export function getRouteIdsFromRoutes(routes) {
    console.log(routes);
    return routes.map(route => route.route_id);
}

/**
 * Enrich vehicles with headsign/destination info from GTFS static data
 */
export function enrichVehiclesWithHeadsigns(vehicles, trips) {
  return vehicles.map(vehicle => {
    if (!vehicle.tripId) return vehicle;
    
    // Find the trip for this vehicle
    const trip = trips.find(t => t.trip_id.toString() === vehicle.tripId);
    
    return {
      ...vehicle,
      headsign: trip?.trip_headsign || null,
      directionId: trip?.direction_id ?? vehicle.directionId,
    };
  });
}

