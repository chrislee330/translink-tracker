/**
 * Map control features
 * - toggle stops on/off
 * - 
 */
function MapControls({ showStops, onToggleStops }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-blue-500 rounded-lg shadow-md p-2">
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
    </div>
  );
}

export default MapControls;