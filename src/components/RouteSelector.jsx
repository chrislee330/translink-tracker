import { useState, useEffect } from 'react';

function RouteSelector({ routes, selectedRoutes, onSelectionChange }) {
  const [localSelection, setLocalSelection] = useState(selectedRoutes);

  // ran first render, and when selectedRoutes is changed
  useEffect(() => {
    setLocalSelection(selectedRoutes);
  }, [selectedRoutes]);

  const handleToggle = (routeShortName) => {
    const newSelection = localSelection.includes(routeShortName)
      ? localSelection.filter(r => r !== routeShortName)
      : [...localSelection, routeShortName];
    
    setLocalSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allRoutes = routes.map(r => r.route_short_name);
    setLocalSelection(allRoutes);
    onSelectionChange(allRoutes);
  };

  const handleClearAll = () => {
    setLocalSelection([]);
    onSelectionChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Select Routes</h3>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {routes.map(route => {
          const isSelected = localSelection.includes(route.route_short_name);
          
          return (
            <button
              key={route.route_id}
              onClick={() => handleToggle(route.route_short_name)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: route.color }}
                  />
                  <span className="font-bold text-gray-800">
                    {route.route_short_name}
                  </span>
                </div>
                {isSelected && <span className="text-blue-600 text-sm">✓</span>
}
              </div>
              <p className="text-xs text-gray-600 mt-1 text-left truncate">
                {route.route_long_name}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-sm text-gray-600">
        {localSelection.length} route{localSelection.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}

export default RouteSelector;