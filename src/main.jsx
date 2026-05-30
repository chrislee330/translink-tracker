import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { inject } from "@vercel/analytics"
import { injectSpeedInsights } from '@vercel/speed-insights'

// vercel analytics and speed 
inject()
injectSpeedInsights()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)