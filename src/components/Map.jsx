import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletConfig';

function Map() {
  const center = [49.2827, -123.1207];
  const zoom = 12;

  // Test markers for key Vancouver locations
  const testLocations = [
    { id: 1, name: 'Downtown Vancouver', position: [49.2827, -123.1207] },
    { id: 2, name: 'UBC', position: [49.2606, -123.2460] },
    { id: 3, name: 'Metrotown', position: [49.2266, -123.0030] },
    { id: 4, name: 'Commercial-Broadway', position: [49.2625, -123.0689] },
  ];

  return (
    <div className="h-[600px] w-full rounded-lg shadow-lg overflow-hidden"
         style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {testLocations.map((location) => (
          <Marker key={location.id} position={location.position}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{location.name}</p>
                <p className="text-xs text-gray-600">Test Location</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;