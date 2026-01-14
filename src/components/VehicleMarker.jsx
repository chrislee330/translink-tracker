import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// custom bus icon
const createBusIcon = (routeName, color, bearing = 0) => {
    return L.divIcon({
        className: 'route-square-marker',
        html: `
            <div style="
                transform: rotate(${bearing}deg);
                background: ${color};
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                color: white;
                font-weight: 700;
                font-size: 13px;
                box-shadow: 0 0 0 2px white, 0 2px 6px rgba(0,0,0,0.4);
            ">
                ${routeName}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
};

function VehicleMarker({ vehicle, route }) {
    const icon = createBusIcon(route.route_short_name, route.color, vehicle.bearing || 0);
    const destination = vehicle.headsign;
    console.log(vehicle, route, destination);
    return (
        <Marker
            position={[vehicle.latitude, vehicle.longitude]}
            icon={icon}
        >
            <Popup>
                <div className="text-center">
                    <p className="font-bold text-lg" style={{ color: route.color }}>
                        Route {route.route_short_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {route.route_long_name}
                        {/* To {getRouteTypeName(route.route_long_name, route.route_type)} */}
                    </p>
                    {destination && (
                        <div className="text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                            <p className="font-bold text-gray-800">{destination}</p>
                        </div>
                    )}
                    {vehicle.vehicleId && (
                        <p className="text-xs text-gray-500 mt-1">
                            Vehicle #{vehicle.vehicleId}
                        </p>
                    )}
                    {/* {vehicle.speed && (
                        <p className="text-xs text-gray-500">
                            Speed: {Math.round(vehicle.speed * 3.6)} km/h
                        </p>
                    )} */
                        // API not tracked???
                    }
                    {vehicle.route_long_name && (
                        <p className="text-xs text-gray-500">
                            ID: {vehicle.route_long_name}
                        </p>
                    )}

                    {vehicle.currentStatus && (
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">Status:</span> {formatVehicleStatus(vehicle.currentStatus)}
                        </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                        Last updated: {new Date(vehicle.timestamp * 1000).toLocaleTimeString()}
                        <br>
                        </br>
                        Time ago: {timeAgo(vehicle.timestamp)}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
}

// Helper function to format vehicle status
function formatVehicleStatus(status) {
    const statusMap = {
        0: 'Arriving',
        1: 'Stopped',
        2: 'In Transit',
    };
    return statusMap[status] || status;
}

function timeAgo(unixSeconds) {
    const now = Date.now();
    const then = unixSeconds * 1000;
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default VehicleMarker;