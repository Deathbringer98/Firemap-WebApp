/**
 * Real-Time Wildfire Map - Core Application
 * Copyright (c) 2025 Matthew Menchinton
 * Licensed under the Apache License, Version 2.0
 * https://wildfiremap.app
 */

// Fire Map JavaScript
// Global variables
let map;
let fireLayer;
let heatLayer;
let userReports = [];
let userReportLayer;
let isReportingMode = false;
let tempMarker = null;
let lastDataTime = null;
let dataSourceUsed = 'Unknown';

// Data source URLs
const CORS_PROXY_1 = 'https://corsproxy.io/?';
const CORS_PROXY_2 = 'https://api.allorigins.win/raw?url=';
const FIRMS_URL = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs/geojson/Global_VIIRS_C2_24h.geojson';
const ALTERNATIVE_URL_1 = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const ALTERNATIVE_URL_2 = 'https://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/Fires/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';

// Initialize map
function initializeMap() {
    map = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

// Load fire data from multiple sources
async function loadFireData() {
    try {
        console.log('Fetching fire data...');
        updateDataStatus('loading', 'Fetching latest fire data...');
        
        let res, data, source;
        
        // Try primary ESRI ArcGIS service first
        try {
            res = await fetch(ALTERNATIVE_URL_1);
            if (res.ok) {
                data = await res.json();
                source = 'ESRI ArcGIS MODIS';
            } else throw new Error('Primary source failed');
        } catch (err) {
            console.log('Primary source failed, trying backup...');
            
            // Try backup ESRI service
            try {
                res = await fetch(ALTERNATIVE_URL_2);
                if (res.ok) {
                    data = await res.json();
                    source = 'ESRI ArcGIS Backup';
                } else throw new Error('Backup source failed');
            } catch (err2) {
                console.log('Backup failed, trying NASA FIRMS with proxy...');
                
                // Try NASA FIRMS with CORS proxy as last resort
                const PROXIED_URL = CORS_PROXY_1 + encodeURIComponent(FIRMS_URL);
                res = await fetch(PROXIED_URL);
                if (!res.ok) throw new Error(`All sources failed! HTTP error! status: ${res.status}`);
                data = await res.json();
                source = 'NASA FIRMS (Proxied)';
            }
        }

        // Remove existing layers
        if (fireLayer) map.removeLayer(fireLayer);
        if (heatLayer) map.removeLayer(heatLayer);

        console.log(`Found ${data.features.length} fire detections from ${source}`);

        // Check data freshness
        const now = new Date();
        lastDataTime = now;
        dataSourceUsed = source;

        // Create heat map and fire layers
        createFireVisualization(data, source);

        updateDataStatus('fresh', `✅ Data updated successfully (${data.features.length} fires)`);
        console.log(`Fire data updated: ${new Date().toLocaleTimeString()}`);

    } catch (err) {
        console.error('Failed to load fire data:', err);
        updateDataStatus('error', '⚠️ Data update failed - showing cached data');
    }
}

// Create fire visualization layers
function createFireVisualization(data, source) {
    // Prepare data for heat map
    const heatData = [];

    data.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const brightness = feature.properties.brightness || feature.properties.BRIGHTNESS || 300;
        
        // Normalize brightness for heat intensity (0-1 scale)
        const intensity = Math.min(brightness / 400, 1);
        
        heatData.push([coords[1], coords[0], intensity]);
    });

    // Create NASA-style heat map layer
    heatLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        max: 1.0,
        gradient: {
            0.0: 'transparent',
            0.2: '#330000',
            0.4: '#660000',
            0.6: '#CC0000',
            0.7: '#FF3300',
            0.8: '#FF6600',
            0.9: '#FFAA00',
            1.0: '#FFFF00'
        }
    }).addTo(map);

    // Create fire perimeter circles
    fireLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            const brightness = feature.properties.brightness || feature.properties.BRIGHTNESS || 300;
            const radius = Math.max(brightness / 50, 100);
            
            return L.circle(latlng, {
                radius: radius,
                fillColor: getFireColor(brightness),
                color: '#8B0000',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.4
            });
        },
        onEachFeature: function (feature, layer) {
            const brightness = feature.properties.brightness || feature.properties.BRIGHTNESS || 'N/A';
            const confidence = feature.properties.confidence || feature.properties.CONFIDENCE || 'N/A';
            const acqDate = feature.properties.acq_date || feature.properties.ACQ_DATE || 'N/A';
            const acqTime = feature.properties.acq_time || feature.properties.ACQ_TIME || 'N/A';
            
            let info = `<div style="font-family: Arial, sans-serif;">
                        <strong style="color: #8B0000;">🔥 ACTIVE FIRE DETECTION</strong><br>
                        <strong>Brightness Temperature:</strong> ${brightness}K<br>
                        <strong>Confidence:</strong> ${confidence}%<br>
                        <strong>Detection Date:</strong> ${acqDate}<br>
                        <strong>Detection Time:</strong> ${acqTime} UTC<br>
                        <strong>Fire Intensity:</strong> ${getFireIntensity(brightness)}<br>
                        <small style="color: #666;">Source: ${source}</small>
                        </div>`;
            layer.bindPopup(info);
        }
    }).addTo(map);
}

// Utility functions for fire data
function getFireColor(brightness) {
    if (brightness >= 400) return '#FFFF00';
    if (brightness >= 350) return '#FF6600';
    if (brightness >= 320) return '#FF3300';
    if (brightness >= 300) return '#CC0000';
    return '#660000';
}

function getFireIntensity(brightness) {
    if (brightness >= 400) return 'Very High';
    if (brightness >= 350) return 'High';
    if (brightness >= 320) return 'Moderate';
    if (brightness >= 300) return 'Low';
    return 'Very Low';
}

// Data status management
function updateDataStatus(status, message) {
    const statusElement = document.getElementById('dataStatus');
    const statusText = document.getElementById('statusText');
    const lastUpdate = document.getElementById('lastUpdate');
    
    statusElement.classList.remove('status-fresh', 'status-stale', 'status-error');
    statusElement.classList.add(`status-${status}`);
    
    statusText.textContent = message;
    lastUpdate.textContent = `Last update: ${new Date().toLocaleTimeString()} (${dataSourceUsed})`;
}

// Visitor counter - improved accuracy
function updateVisitorCount() {
    // Check if this is a new session
    const sessionVisited = sessionStorage.getItem('firemap_session_visited');
    
    if (!sessionVisited) {
        // New session - increment counter
        let visitorCount = localStorage.getItem('firemap_visitors');
        
        if (!visitorCount) {
            visitorCount = 1;
        } else {
            visitorCount = parseInt(visitorCount) + 1;
        }
        
        localStorage.setItem('firemap_visitors', visitorCount);
        sessionStorage.setItem('firemap_session_visited', 'true');
        
        // Add timestamp for better tracking
        const lastVisit = new Date().toISOString();
        localStorage.setItem('firemap_last_visit', lastVisit);
        
        document.getElementById('visitorCount').textContent = visitorCount;
    } else {
        // Existing session - just display current count
        let visitorCount = localStorage.getItem('firemap_visitors') || 1;
        document.getElementById('visitorCount').textContent = visitorCount;
    }
    
    // Display browser and session info in console for debugging
    console.log('🔢 Visitor tracking:', {
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome/Chromium' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
        domain: window.location.hostname,
        sessionNew: !sessionVisited,
        currentCount: localStorage.getItem('firemap_visitors')
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Fire Map application...');
    
    initializeMap();
    loadFireData();
    updateVisitorCount();
    
    // Load user reports after a short delay to ensure map is ready
    setTimeout(() => {
        if (typeof loadUserReports === 'function') {
            loadUserReports();
        } else {
            console.warn('⚠️ loadUserReports function not found - reports.js may not be loaded');
        }
    }, 1000);
    
    // Auto-refresh every 15 minutes
    setInterval(loadFireData, 900000);
});
