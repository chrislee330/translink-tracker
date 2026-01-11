import fs from 'fs';
import Papa from 'papaparse';
import { AVAILABLE_ROUTES } from '../utils/constants.js';

// run npm process-gtfs

// Read and parse a GTFS file
function parseGTFSFile(filename) {
    const text = fs.readFileSync(`public/data/gtfs/${filename}`, 'utf-8');
    return new Promise((resolve) => {
        Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
        });
    });
}

/**
 * normalize to strings
 */
export function normalizeValues(value) {
    if (value === null || value === undefined) {
        return "";
    }

    // Convert anything to string
    let str = String(value);

    str = str.trim();

    return str;
}

async function processGTFS() {
    console.log('Processing GTFS data...');

    // Load all files
    const routesOriginal = await parseGTFSFile('routes.txt');
    const routes = routesOriginal.map(route => ({
        ...route,
        route_short_name: normalizeValues(route.route_short_name),
        route_color: normalizeValues(route.route_color),
    }));
    const stops = await parseGTFSFile('stops.txt');
    const trips = await parseGTFSFile('trips.txt');
    const shapes = await parseGTFSFile('shapes.txt');
    const stopTimes = await parseGTFSFile('stop_times.txt');

    // routes we care about
    const selectedRouteIds = routes
        .filter(r => AVAILABLE_ROUTES.includes(r.route_short_name))
        .map(r => r.route_id);

    // only selected routes
    const selectedTrips = trips.filter(t => selectedRouteIds.includes(t.route_id));
    const selectedTripIds = selectedTrips.map(t => t.trip_id);

    // only selected trips
    const shapeIds = new Set(selectedTrips.map(t => t.shape_id));
    const selectedShapes = shapes.filter(s => shapeIds.has(s.shape_id));

    // stop_times to only selected trips
    const selectedStopTimes = stopTimes.filter(st => selectedTripIds.includes(st.trip_id));

    // unique stop IDs from selected stop_times
    const stopIds = new Set(selectedStopTimes.map(st => st.stop_id));
    const selectedStops = stops.filter(s => stopIds.has(s.stop_id));

    const processed = {
        routes: routes.filter(r => selectedRouteIds.includes(r.route_id)),
        stops: selectedStops,
        trips: selectedTrips,
        shapes: selectedShapes,
        stopTimes: selectedStopTimes,
    };

    fs.writeFileSync(
        'public/data/gtfs-processed.json',
        JSON.stringify(processed)
    );

    console.log('Processed data saved!');
}

processGTFS();