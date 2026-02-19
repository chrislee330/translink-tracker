import { useState, useEffect } from 'react';
import { fetchTripUpdates, getStopArrivals, formatDelay, formatTimeUntil } from '../services/gtfsRealtime';
// import { getRouteColor, normalizeHeadsign } from '../services/gtfsStatic';

function StopArrivalsPanel({ stop, gtfsData, onClose }) {
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchArrivals = async () => {
        if (!stop || !gtfsData) return;

        try {
            setLoading(true);
            setError(null);
            console.log('=== Fetching arrivals for stop ===');
            console.log('Stop object:', stop);
            console.log('Stop ID:', stop.stop_id);
            console.log('Stop name:', stop.stop_name);

            const tripUpdates = await fetchTripUpdates();
            console.log('Received trip updates:', tripUpdates.length);
            
            const stopArrivals = getStopArrivals(
                stop.stop_id,
                tripUpdates,
                gtfsData.trips,
                gtfsData.routes
            );

            // Only show next 5 arrivals
            setArrivals(stopArrivals.slice(0, 5));
            setLastUpdate(new Date());
            setLoading(false);
        } catch (err) {
            console.error('Error fetching arrivals:', err);
            setError('Failed to load arrivals');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArrivals();

        // Refresh every 30 seconds
        const interval = setInterval(fetchArrivals, 30000);
        return () => clearInterval(interval);
    }, [stop, gtfsData]);

    // Update countdown every second
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!stop) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{stop.stop_name}</h2>
                        {stop.stop_code && (
                            <p className="text-blue-100 text-sm mt-1">Stop #{stop.stop_code}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors ml-4"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading && !arrivals.length && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                <p className="text-gray-600">Loading arrivals...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-800">{error}</p>
                            <button
                                onClick={fetchArrivals}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && arrivals.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 font-medium">No upcoming arrivals</p>
                            <p className="text-gray-500 text-sm mt-1">Check back later or try another stop</p>
                        </div>
                    )}

                    {arrivals.length > 0 && (
                        <div className="space-y-3">
                            {arrivals.map((arrival, index) => (
                                <ArrivalCard key={`${arrival.tripId}-${index}`} arrival={arrival} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {lastUpdate && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            <span>Live updates</span>
                        </div>
                        <button
                            onClick={fetchArrivals}
                            disabled={loading}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ArrivalCard({ arrival }) {
    const timeUntil = formatTimeUntil(arrival.arrivalTime);
    const delay = formatDelay(arrival.delay);
    const isDelayed = arrival.delay > 60;
    const isEarly = arrival.delay < -60;
    const arrivalDate = new Date(arrival.arrivalTime * 1000);
    const routeColor = arrival.routeColor ? `#${arrival.routeColor}` : '#0078D7';

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                {/* Route and destination */}
                <div className="flex items-start gap-3 flex-1">
                    {/* Route badge */}
                    <div
                        className="w-12 h-12 rounded flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: routeColor }}
                    >
                        {arrival.routeShortName}
                    </div>

                    {/* Destination and route name */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                            {/* <p className="font-bold text-gray-800 truncate">
                                {arrival.headsign ? normalizeHeadsign(arrival.headsign) : 'Unknown'}
                            </p> */}
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-0.5">
                            {arrival.routeLongName}
                        </p>
                    </div>
                </div>

                {/* Time until arrival */}
                <div className="text-right ml-4 flex-shrink-0">
                    <div className={`
            text-2xl font-bold
            ${timeUntil === 'Due' || timeUntil === 'Arrived' ? 'text-green-600' : 'text-gray-800'}
          `}>
                        {timeUntil}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Delay indicator */}
            {(isDelayed || isEarly) && (
                <div className={`
          mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs
          ${isDelayed ? 'text-orange-700' : 'text-blue-700'}
        `}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{delay}</span>
                </div>
            )}

            {delay === 'On time' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-green-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">On time</span>
                </div>
            )}
        </div>
    );
}

export default StopArrivalsPanel;