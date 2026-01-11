import { useState, useEffect } from 'react';
import Map from './components/Map';
import RouteSelector from './components/RouteSelector';
import RouteLegend from './components/RouteLegend';
import { loadGTFSStaticData, getRoutesByShortNames, getRouteColor } from './services/gtfsStatic';
import { AVAILABLE_ROUTES, DEFAULT_SELECTED_ROUTES } from './utils/constants';
import { saveSelectedRoutes, loadSelectedRoutes } from './utils/storage';

function App() {
    //     // list of routes, starting empty
    //   const [routes, setRoutes] = useState([]);
    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRouteNames, setSelectedRouteNames] = useState(() =>
        loadSelectedRoutes(DEFAULT_SELECTED_ROUTES)
    );
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRoutes() {
            try {
                setLoading(true);
                const data = await loadGTFSStaticData();
                const routes = getRoutesByShortNames(data.routes, AVAILABLE_ROUTES);
                const routesWithColors = routes.map(route => ({
                    ...route,
                    color: getRouteColor(route),
                }));
                setAllRoutes(routesWithColors);
                setLoading(false);
            } catch (err) {
                console.error('Error loading routes:', err);
                setLoading(false);
            }
        }
        loadRoutes();
    }, []);

    // Update selected routes when selection changes
    useEffect(() => {
        const selected = allRoutes.filter(route =>
            selectedRouteNames.includes(route.route_short_name)
        );
        setSelectedRoutes(selected);
    }, [selectedRouteNames, allRoutes]);

    // Handle route selection changes
    const handleSelectionChange = (newSelection) => {
        setSelectedRouteNames(newSelection);
        saveSelectedRoutes(newSelection);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading TransLink data...</p>
                </div>
            </div>
        );
    }

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
                {/* Route Selector */}
                <RouteSelector
                    routes={allRoutes}
                    selectedRoutes={selectedRouteNames}
                    onSelectionChange={handleSelectionChange}
                />

                {/* Route Legend */}
                {selectedRoutes.length > 0 && <RouteLegend routes={selectedRoutes} />}

                {/* Map */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Live Transit Map
                    </h2>
                    <Map selectedRouteNames={selectedRouteNames} />
                </div>
            </main>
        </div>
    );
}

export default App;