import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const API_KEY = import.meta.env.VITE_TRANSLINK_API_KEY;
const VEHICLE_POSITIONS_URL = import.meta.env.VITE_GTFS_REALTIME_VEHICLE_POSITIONS;
const TRIP_UPDATES_URL = import.meta.env.VITE_GTFS_REALTIME_TRIP_UPDATES;

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
        //console.log(vehicles);
        return vehicles;
    } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        throw error;
    }
}

/**
 * Fetch and parse GTFS Realtime trip updates for arrival predictions
 * Returns array of trip updates with stop time predictions
 */
export async function fetchTripUpdates() {
    try {
        console.log('Fetching trip updates...');

        const response = await fetch(`${TRIP_UPDATES_URL}?apikey=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        console.log(`Received ${feed.entity.length} trip updates`);
        console.log(feed);
        // Extract stop time updates
        const tripUpdates = feed.entity
            .filter(entity => entity.tripUpdate)
            .map(entity => {
                const tripUpdate = entity.tripUpdate;

                return {
                    id: entity.id,
                    tripId: tripUpdate.trip?.tripId,
                    routeId: tripUpdate.trip?.routeId,
                    directionId: tripUpdate.trip?.directionId,
                    scheduleRelationship: tripUpdate.trip?.scheduleRelationship,
                    vehicleId: tripUpdate.vehicle?.id,
                    timestamp: tripUpdate.timestamp,
                    stopTimeUpdates: tripUpdate.stopTimeUpdate?.map(stu => ({
                        stopId: stu.stopId,
                        stopSequence: stu.stopSequence,
                        arrival: stu.arrival ? {
                            delay: stu.arrival.delay,  // Delay in seconds
                            time: stu.arrival.time,    // Predicted arrival time (Unix timestamp)
                        } : null,
                        departure: stu.departure ? {
                            delay: stu.departure.delay,
                            time: stu.departure.time,
                        } : null,
                        scheduleRelationship: stu.scheduleRelationship,
                    })) || [],
                };
            });

        return tripUpdates;
    } catch (error) {
        console.error('Error fetching trip updates:', error);
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
    //console.log(routes);
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

/**
 * Normalize stop ID (remove/add leading zeros)
 */
function normalizeStopId(stopId) {
    if (!stopId) return stopId;
    // Convert to string and remove leading zeros
    return String(stopId).replace(/^0+/, '') || '0';
}


/**
 * Get arrival predictions for a specific stop
 * Returns array of upcoming arrivals sorted by time
 */
export function getStopArrivals(stopId, tripUpdates, trips, routes) {
    const normalizedStopId = normalizeStopId(stopId);
    const arrivals = [];

    tripUpdates.forEach(tripUpdate => {
        // Find stop time update for this stop
        const stopTimeUpdate = tripUpdate.stopTimeUpdates.find(
            stu => stu.stopId === normalizedStopId
        );

        if (!stopTimeUpdate || !stopTimeUpdate.arrival) return;

        // Get trip and route info
        const trip = trips.find(t => t.trip_id.toString() === tripUpdate.tripId);
        const route = routes.find(r => r.route_id.toString() === tripUpdate.routeId);

        if (!trip || !route) return;

        arrivals.push({
            routeShortName: route.route_short_name,
            routeLongName: route.route_long_name,
            routeColor: route.route_color,
            headsign: trip.trip_headsign,
            arrivalTime: stopTimeUpdate.arrival.time,
            delay: stopTimeUpdate.arrival.delay || 0,
            vehicleId: tripUpdate.vehicleId,
            tripId: tripUpdate.tripId,
        });
    });

    // Sort by arrival time
    return arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
}

/**
 * Format delay in human-readable format
 */
export function formatDelay(delaySeconds) {
    if (!delaySeconds || Math.abs(delaySeconds) < 60) {
        return 'On time';
    }

    const minutes = Math.round(delaySeconds / 60);

    if (minutes > 0) {
        return `${minutes} min late`;
    } else {
        return `${Math.abs(minutes)} min early`;
    }
}

/**
 * Format time until arrival
 */
export function formatTimeUntil(arrivalTime) {
    const now = Math.floor(Date.now() / 1000);
    const secondsUntil = arrivalTime - now;

    if (secondsUntil < 0) {
        return 'Arrived';
    }

    const minutes = Math.floor(secondsUntil / 60);

    if (minutes < 1) {
        return 'Due';
    } else if (minutes === 1) {
        return '1 min';
    } else {
        return `${minutes} min`;
    }
}


