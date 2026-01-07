
function RouteLegend({ routes }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Active Routes</h3>
            <div className="space-y-2">
                {routes.map(route => (
                    <div key={route.route_id} className="flex items-center">
                        <div
                            className="w-4 h-4 rounded mr-3"
                            style={{ backgroundColor: route.color }}
                        />
                        <span className="font-medium text-gray-700 mr-2">
                            {route.route_short_name}
                        </span>
                        <span className="text-sm text-gray-500">
                            {route.route_long_name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RouteLegend;