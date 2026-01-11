
export const AVAILABLE_ROUTES = [
    '99',   // 99 B-Line
    'R4',   // 41st Ave RapidBus
    '20',   // Victoria
    '9',    // Boundary  
    '10',  // Granville
    '3',  // Main St
    '4',  // Powell
    '7',  // Nanaimo Station
    '14',  // Hastings
    '25',  // Brentwood Station
];

// Default selected routes (shown on initial load)
export const DEFAULT_SELECTED_ROUTES = ['99', 'R4', '20'];

// Route display colors (fallback if GTFS doesn't provide)
export const ROUTE_COLORS = {
    '99': '#0761A5',
    'R4': '#CE1126',
    '20': '#00A84F',
    '9': '#FDB913',
    '10': '#8E6BA4',
    '3': '#F7931E',
    '4': '#00B5E2',
    '7': '#ED1C24',
    '14': '#76232F',
    '25': '#8CC63F',
};

export const DEFAULT_COLOR = "#F527B4";