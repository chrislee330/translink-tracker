function RouteLegend({ routes }) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="font-semibold text-gray-800 mb-3">
        Active Routes ({routes.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {routes.map(route => (
          <div key={route.route_id} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: route.color }}
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-gray-800 mr-2">
                {route.route_short_name}
              </span>
              <span className="text-sm text-gray-500 truncate">
                {route.route_long_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteLegend;