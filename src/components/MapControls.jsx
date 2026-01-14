/**
 * Map control features
 * - toggle stops on/off
 * - vehicleCount indicator
 */
function MapControls({ showStops, onToggleStops, vehicleCount }) {
    return (
        <div className="absolute top-4 right-4 z-[1000] bg-blue-500 rounded-lg shadow-md p-2">
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
        </div>
    );
}

export default MapControls;