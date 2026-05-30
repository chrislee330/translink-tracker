/**
 * Map control features
 * - toggle stops on/off
 * - vehicleCount indicator
 * - refresh feature and add departure expefcted times
 * - live tracking toggle
 */
function MapControls({ showStops, onToggleStops, vehicleCount, onRefreshVehicles, isRefreshing, isTracking, onToggleTracking}) {
    return (
        <div className="absolute top-4 right-4 z-[1000] bg-blue-500 rounded-lg shadow-md p-2">

            {/* Live tracking toggle */}
            <button
                onClick={onToggleTracking}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors
                    ${isTracking
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }
                `}
            >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isTracking ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`} />
                {isTracking ? 'Tracking Live' : 'Tracking Paused'}
            </button>

            {/* Stop toggle */}
            <label className="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={showStops}
                    onChange={(e) => onToggleStops(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-white">
                    Show Stops
                </span>
            </label>
            {/* Vehicle count indicator */}
            {vehicleCount > 0 && (
                <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs text-gray-600">
                            {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''} live
                        </span> 
                    </div>
                </div>
            )}

            {/* Refresh button */}
          <button
            onClick={onRefreshVehicles}
            disabled={isRefreshing || !isTracking}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2 
              text-xs font-medium rounded-md transition-colors
              ${isRefreshing || !isTracking
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            <svg 
              className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
    );
}

export default MapControls;