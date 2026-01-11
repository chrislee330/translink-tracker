const STORAGE_KEY = 'translink-selected-routes';

/**
 * Save selected routes to localStorage
 */
export function saveSelectedRoutes(routes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load selected routes from localStorage
 */
export function loadSelectedRoutes(defaultRoutes) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultRoutes;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultRoutes;
  }
}

/**
 * Clear saved routes
 */
export function clearSelectedRoutes() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}