import { useState, useEffect } from 'react';
import Map from './components/Map';
import RouteLegend from './components/RouteLegend';
import { loadGTFSStaticData, getRoutesByShortNames, getRouteColor, normalizeValues } from './services/gtfsStatic';
import { SELECTED_ROUTES } from './utils/constants';

function App() {
    // list of routes, starting empty
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function loadRoutes() {
      try {
        const data = await loadGTFSStaticData();
        const selectedRoutes = getRoutesByShortNames(data.routes, SELECTED_ROUTES);
        const routesWithColors = selectedRoutes.map(route => ({
          ...route, //copies
          color: normalizeValues(getRouteColor(route)),
        }));
        setRoutes(routesWithColors);
      } catch (err) {
        console.error('Error loading routes:', err);
      }
    }
    loadRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TransLink Live Tracker</h1>
          <p className="text-blue-100 text-sm mt-1">
            Real-time transit tracking for Metro Vancouver
          </p>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {routes.length > 0 && <RouteLegend routes={routes} />}
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Transit Routes Map
          </h2>
          <Map />
        </div>
      </main>
    </div>
  );
}

export default App;