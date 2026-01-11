import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// custom icon for stops
const createStopIcon = (color) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background-color: white;
        border: 3px solid ${color};
        border-radius: 50%;
        width: 12px;
        height: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
};

function StopMarker({ stop, route }) {
  const icon = createStopIcon(route.color);

  return (
    <Marker 
      position={[stop.stop_lat, stop.stop_lon]} 
      icon={icon}
    >
      <Popup>
        <div className="text-center">
          <p className="font-bold text-sm">{stop.stop_name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Route {route.route_short_name}
          </p>
          {stop.stop_code && (
            <p className="text-xs text-gray-500">
              Stop #{stop.stop_code}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default StopMarker;