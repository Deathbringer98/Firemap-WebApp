// User Reporting System

// Anti-abuse configuration
const REPORT_TTL_MS = 24 * 60 * 60 * 1000;       // Expire reports after 24h (client-side)
const REPORT_COOLDOWN_MS = 30 * 60 * 1000;       // 30 minutes between submissions per device
const RATE_LIMIT_PER_DAY = 3;                     // Max 3 reports per day per device
const DEDUPE_RADIUS_M = 200;                      // Prevent duplicates within 200m
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;         // within last 1 hour

// Mode - bypasses all restrictions
let isAdminMode = localStorage.getItem('firemap_admin_mode') === 'true';

// Obfuscated functions
const _0x4a8b = ['admin', 'true', 'false', 'ENABLED', 'DISABLED', 'All restrictions bypassed', 'Normal restrictions active'];
const _0x1f3c = (function() {
    let _0x2d4e = true;
    return function(_0x3f5a, _0x6b7c) {
        const _0x8d9e = _0x2d4e ? function() {
            if (_0x6b7c) {
                const _0x1a2b = _0x6b7c.apply(_0x3f5a, arguments);
                _0x6b7c = null;
                return _0x1a2b;
            }
        } : function() {};
        _0x2d4e = false;
        return _0x8d9e;
    };
})();

// Decoy functions to confuse inspection
const debugMode = false;
const testMode = false;
window.enableDebugMode = function() { console.log('Debug mode is disabled in production'); };
window.enableTestMode = function() { console.log('Test mode is disabled in production'); };
window.adminAccess = function() { console.log('Access denied: Invalid credentials'); };
window.deleteReport = function() { console.log('Function not implemented'); };

// Toggle function
const _0xa7f2 = function() {
    const _0xc4d5 = 'firemap_' + _0x4a8b[0] + '_mode';
    isAdminMode = !isAdminMode;
    localStorage.setItem(_0xc4d5, isAdminMode.toString());
    console.log(`${_0x4a8b[0].charAt(0).toUpperCase() + _0x4a8b[0].slice(1)} mode ${isAdminMode ? _0x4a8b[3] : _0x4a8b[4]} - ${isAdminMode ? _0x4a8b[5] : _0x4a8b[6]}`);
    updateAdminIndicator();
    // Refresh map to show/hide buttons
    if (userReportLayer) {
        userReportLayer.clearLayers();
        userReports.forEach(report => addUserReportToMap(report));
    }
    return isAdminMode;
};

// Function with obfuscation
window[('tog' + 'gle' + 'Adm' + 'in' + 'Mo' + 'de')] = _0xa7f2;

// Delete function
const _0xb8g3 = function(reportId) {
    const _0xe9f0 = localStorage.getItem('firemap_' + _0x4a8b[0] + '_mode') === _0x4a8b[1];
    if (!_0xe9f0) {
        console.log('❌ Insufficient privileges for this operation');
        return false;
    }
    
    const reportIndex = userReports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
        alert('Report not found');
        return false;
    }
    
    const _0xg1h2 = userReports[reportIndex];
    if (confirm(`🔧 Permanently delete ${_0xg1h2.type} report from ${new Date(_0xg1h2.timestamp).toLocaleString()}?`)) {
        userReports.splice(reportIndex, 1);
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        
        // Refresh map markers
        if (userReportLayer) {
            userReportLayer.clearLayers();
            userReports.forEach(report => addUserReportToMap(report));
        }
        
        console.log(`🔧 Deletion successful: Report ID ${reportId}`);
        alert('Report permanently deleted');
        return true;
    }
    return false;
};

// Expose function with obfuscated name
window[String.fromCharCode(95, 97, 100, 109, 105, 110, 68, 101, 108, 101, 116, 101)] = _0xb8g3;

// Show status
function updateAdminIndicator() {
    let indicator = document.getElementById('adminIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'adminIndicator';
        indicator.style.cssText = `
            position: fixed; top: 10px; right: 120px; background: #ff4444; 
            color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;
            z-index: 1500; font-family: Arial, sans-serif; font-weight: bold;
            display: none;
        `;
        indicator.innerHTML = '🔧 MODE';
        document.body.appendChild(indicator);
    }
    indicator.style.display = isAdminMode ? 'block' : 'none';
}

// Keyboard handler
const _0xk3y5 = function(e) {
    const _0x7h8i = e.ctrlKey && e.shiftKey && e.key === 'A';
    if (_0x7h8i) {
        e.preventDefault();
        window[('tog' + 'gle' + 'Adm' + 'in' + 'Mo' + 'de')]();
    }
};
document.addEventListener('keydown', _0xk3y5);

// Click handler
const _0x9j0k = (function() {
    let clickCount = 0;
    return function() {
        clickCount++;
        if (clickCount === 3) {
            const adminBtn = document.getElementById(('adm' + 'in' + 'Tog' + 'gle' + 'Btn'));
            if (adminBtn) {
                adminBtn.style.display = 'block';
                console.log('🔧 Button revealed!');
            }
            clickCount = 0;
        }
        setTimeout(() => { clickCount = 0; }, 1000);
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    const visitorCounter = document.getElementById('visitorCounter');
    if (visitorCounter) {
        visitorCounter.addEventListener('click', _0x9j0k);
    }
});

// Meta state persisted per device
function loadReportMeta() {
    const json = localStorage.getItem('firemap_report_meta');
    if (!json) return { dateKey: todayKey(), count: 0, lastTime: 0 };
    try {
        const meta = JSON.parse(json);
        // Reset daily counter if day changed
        if (meta.dateKey !== todayKey()) {
            return { dateKey: todayKey(), count: 0, lastTime: 0 };
        }
        return meta;
    } catch {
        return { dateKey: todayKey(), count: 0, lastTime: 0 };
    }
}

function saveReportMeta(meta) {
    localStorage.setItem('firemap_report_meta', JSON.stringify(meta));
}

function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

// Haversine distance in meters
function distanceMeters(lat1, lon1, lat2, lon2) {
    const toRad = x => x * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function pruneExpiredReportsInMemory() {
    const now = Date.now();
    let changed = false;
    
    userReports = userReports.filter(report => {
        let shouldKeep = true;
        
        // Check if report should expire based on status
        if (!report.isActive) {
            // If marked as "no longer active", expire after 1 hour from last update
            const timeSinceUpdate = now - new Date(report.lastUpdated).getTime();
            if (timeSinceUpdate > 60 * 60 * 1000) { // 1 hour
                shouldKeep = false;
            }
        } else {
            // If still active, expire after 24 hours from original timestamp
            const timeSinceOriginal = now - new Date(report.originalTimestamp || report.timestamp).getTime();
            if (timeSinceOriginal > REPORT_TTL_MS) {
                shouldKeep = false;
            }
        }
        
        if (!shouldKeep) changed = true;
        return shouldKeep;
    });
    
    if (changed) {
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        // Refresh map markers
        if (userReportLayer) {
            userReportLayer.clearLayers();
            userReports.forEach(report => addUserReportToMap(report));
        }
    }
}

function canSubmitReportAt(lat, lng) {
    // Mode bypasses all restrictions
    if (isAdminMode) {
        console.log('🔧 Bypassing all submission restrictions');
        return { ok: true, message: 'Admin submission allowed' };
    }
    
    const meta = loadReportMeta();
    const now = Date.now();
    // Cooldown
    if (meta.lastTime && (now - meta.lastTime) < REPORT_COOLDOWN_MS) {
        const remaining = Math.ceil((REPORT_COOLDOWN_MS - (now - meta.lastTime)) / 600000);
        return { ok: false, message: `Please wait ${remaining} more minute(s) before submitting another report.` };
    }
    // Daily rate limit
    if (meta.count >= RATE_LIMIT_PER_DAY) {
        return { ok: false, message: `Daily limit reached. You can submit up to ${RATE_LIMIT_PER_DAY} reports per day.` };
    }
    // Dedupe check against recent local reports
    const cutoff = now - DEDUPE_WINDOW_MS;
    const nearRecent = userReports.some(r => {
        const t = new Date(r.timestamp).getTime();
        if (t < cutoff) return false;
        return distanceMeters(lat, lng, r.lat, r.lng) <= DEDUPE_RADIUS_M;
    });
    if (nearRecent) {
        return { ok: false, message: `A report already exists within ${DEDUPE_RADIUS_M}m in the last hour. Please avoid duplicate reports.` };
    }
    return { ok: true };
}

function markReportSubmitted() {
    const meta = loadReportMeta();
    const now = Date.now();
    const updated = { dateKey: todayKey(), count: (meta.count || 0) + 1, lastTime: now };
    saveReportMeta(updated);
}

// User Reporting Functions
function openReportForm() {
    document.getElementById('formOverlay').style.display = 'block';
    document.getElementById('reportForm').style.display = 'block';
    const overlay = document.getElementById('formOverlay');
    if (overlay) overlay.style.pointerEvents = 'auto';
    // keep a global flag for inline handler safeguard
    window.isReportingMode = isReportingMode;
}

function activateLocationSelection(btn) {
    isReportingMode = true;
    window.isReportingMode = true;
    map.getContainer().style.cursor = 'crosshair';
    
    // Update button text to show it's active
    if (btn) {
        btn.textContent = '📍 Click on Map';
        btn.style.background = '#ff6b35';
    }
    // Prevent overlay from catching map clicks while selecting
    const overlay = document.getElementById('formOverlay');
    if (overlay) overlay.style.pointerEvents = 'none';
    
    // Add click handler for location selection
    map.on('click', selectReportLocation);
    
    // Update location field placeholder
    document.getElementById('location').placeholder = 'Click anywhere on the map to set location...';
}

function selectReportLocation(e) {
    if (!isReportingMode) return;
    
    // Remove previous temp marker
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    
    // Add temp marker
    tempMarker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: 'temp-marker',
            html: '📍',
            iconSize: [20, 20]
        })
    }).addTo(map);
    
    // Update location field
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    document.getElementById('location').value = `${lat}, ${lng}`;
    document.getElementById('location').placeholder = 'Location selected!';
    
    // Reset button appearance
    const button = document.getElementById('locationSelectBtn');
    if (button) {
        button.textContent = '✅ Location Set';
        button.style.background = '#28a745';
    }
    
    // Disable reporting mode but keep the marker
    isReportingMode = false;
    window.isReportingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', selectReportLocation);
    // Re-enable overlay interactions
    const overlay = document.getElementById('formOverlay');
    if (overlay) overlay.style.pointerEvents = '';
}

function closeReportForm() {
    document.getElementById('formOverlay').style.display = 'none';
    document.getElementById('reportForm').style.display = 'none';
    isReportingMode = false;
    window.isReportingMode = false;
    map.getContainer().style.cursor = '';
    
    // Remove click handler and temp marker
    map.off('click', selectReportLocation);
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
    
    // Reset button
    const button = document.getElementById('locationSelectBtn');
    if (button) {
        button.textContent = '📍 Select on Map';
        button.style.background = '#6a0dad';
    }
    // Re-enable overlay interactions
    const overlay = document.getElementById('formOverlay');
    if (overlay) overlay.style.pointerEvents = '';
    
    // Clear form
    document.getElementById('description').value = '';
    document.getElementById('location').value = '';
    document.getElementById('location').placeholder = 'Click \'Select on Map\' to choose location';
    document.getElementById('contactInfo').value = '';
    document.getElementById('reportType').selectedIndex = 0;
    document.getElementById('severity').selectedIndex = 0;
}

function submitReport() {
    const reportType = document.getElementById('reportType').value;
    const severity = document.getElementById('severity').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const contactInfo = document.getElementById('contactInfo').value;
    
    if (!description.trim()) {
        alert('Please provide a description of the incident.');
        return;
    }
    
    if (!location.trim()) {
        alert('Please click on the map to select a location.');
        return;
    }
    
    // Parse location
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    if (isNaN(lat) || isNaN(lng)) {
        alert('Invalid location selected. Please pick a point on the map again.');
        return;
    }

    // Basic content check
    if (description.trim().length < 10) {
        alert('Please provide a bit more detail in the description (at least 10 characters).');
        return;
    }

    // Expire old local reports and enforce rate limits
    pruneExpiredReportsInMemory();
    const guard = canSubmitReportAt(lat, lng);
    if (!guard.ok) {
        alert(guard.message);
        return;
    }
    
    // Create user report
    const report = {
        id: Date.now(),
        type: reportType,
        severity: severity,
        description: description,
        lat: lat,
        lng: lng,
        contactInfo: contactInfo,
        timestamp: new Date().toISOString(),
        originalTimestamp: new Date().toISOString(), // Track original time for 24h expiration
        reporter: 'Community User',
        isActive: true, // Track if fire is still active
        lastUpdated: new Date().toISOString()
    };
    
    // Add to reports array
    userReports.push(report);
    
    // Save to localStorage
    localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
    markReportSubmitted();
    
    // Add to map
    addUserReportToMap(report);
    
    // Close form
    closeReportForm();
    
    alert('Thank you! Your report has been submitted and will be reviewed. (Unverified community report)');
    
    // Initialize admin indicator on page load
    if (typeof updateAdminIndicator === 'function') {
        updateAdminIndicator();
    }
}

function severityToRadiusMeters(severity) {
    switch (severity) {
        case 'low': return 120;       // ~120 m
        case 'moderate': return 250;  // ~250 m
        case 'high': return 500;      // ~500 m
        case 'extreme': return 800;   // ~800 m
        default: return 200;
    }
}

function addUserReportToMap(report) {
    // Use L.circle (meters) so size scales naturally with zoom like official fire perimeters
    const radius = severityToRadiusMeters(report.severity);
    const marker = L.circle([report.lat, report.lng], {
        radius: radius,
        fillColor: '#6a0dad',
        color: '#4b0082',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.35
    });
    
    // Create popup content
    const icon = getReportIcon(report.type);
    const statusText = report.isActive ? 'ACTIVE' : 'NO LONGER ACTIVE';
    const statusColor = report.isActive ? '#6a0dad' : '#888';
    const updateButton = `<button onclick="openUpdateForm(${report.id})" style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin-top: 5px;">Update Report</button>`;
    
    // Delete button (obfuscated)
    const adminDeleteBtn = isAdminMode ? 
        `<button onclick="window[String.fromCharCode(95,97,100,109,105,110,68,101,108,101,116,101)](${report.id})" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin-top: 5px; margin-left: 5px;">🗑️ Delete</button>` : '';
    
    const popupContent = `
        <div style="font-family: Arial, sans-serif;">
            <strong style="color: ${statusColor};">${icon} USER REPORT - ${statusText}</strong><br>
            <strong>Type:</strong> ${report.type.replace('_', ' ').toUpperCase()}<br>
            <strong>Severity:</strong> ${report.severity.toUpperCase()}<br>
            <strong>Description:</strong> ${report.description}<br>
            <strong>Reported:</strong> ${new Date(report.timestamp).toLocaleString()}<br>
            ${report.lastUpdated !== report.timestamp ? `<strong>Last Updated:</strong> ${new Date(report.lastUpdated).toLocaleString()}<br>` : ''}
            <strong>Reporter:</strong> ${report.reporter}<br>
            ${getEvacuationInfo(report.severity, report.type)}
            <small style="color: #666;">Community-reported data</small><br>
            ${updateButton}${adminDeleteBtn}
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Add to user report layer
    if (!userReportLayer) {
        userReportLayer = L.layerGroup().addTo(map);
    }
    
    userReportLayer.addLayer(marker);
    
    // Store reference for updates
    marker.reportId = report.id;
}

function getSeverityColor(severity) {
    switch(severity) {
        case 'low': return '#90EE90';
        case 'moderate': return '#FFD700';
        case 'high': return '#FF6347';
        case 'extreme': return '#FF0000';
        default: return '#6a0dad';
    }
}

function getReportIcon(type) {
    switch(type) {
        case 'fire': return '🔥';
        case 'smoke': return '💨';
        case 'evacuation': return '🚨';
        case 'road_closure': return '🚧';
        default: return '⚠️';
    }
}

function getEvacuationInfo(severity, type) {
    if (type === 'evacuation' || severity === 'extreme') {
        return `
            <div style="background: #ffebee; padding: 8px; margin: 5px 0; border-left: 4px solid #f44336;">
                <strong style="color: #d32f2f;">⚠️ EVACUATION INFORMATION:</strong><br>
                • Move to designated evacuation centers<br>
                • Follow local emergency services guidance<br>
                • Monitor emergency radio/alerts<br>
                • Emergency Hotline: 911
            </div>
        `;
    } else if (severity === 'high') {
        return `
            <div style="background: #fff3e0; padding: 8px; margin: 5px 0; border-left: 4px solid #ff9800;">
                <strong style="color: #f57c00;">🚨 SAFETY ADVISORY:</strong><br>
                • Stay alert and prepared to evacuate<br>
                • Keep emergency kit ready<br>
                • Monitor local news and alerts
            </div>
        `;
    }
    return '';
}

// Load saved user reports on startup
function loadUserReports() {
    const savedReports = localStorage.getItem('firemap_user_reports');
    if (savedReports) {
        userReports = JSON.parse(savedReports);
        // Ensure backward compatibility with existing reports
        userReports.forEach(report => {
            if (!report.originalTimestamp) report.originalTimestamp = report.timestamp;
            if (!report.lastUpdated) report.lastUpdated = report.timestamp;
            if (report.isActive === undefined) report.isActive = true;
        });
        userReports.forEach(report => addUserReportToMap(report));
    }
    
    // Initialize mode indicator
    updateAdminIndicator();
}

// Update report functionality
function openUpdateForm(reportId) {
    const report = userReports.find(r => r.id === reportId);
    if (!report) {
        alert('Report not found.');
        return;
    }
    
    // Create update form overlay
    const updateOverlay = document.createElement('div');
    updateOverlay.id = 'updateOverlay';
    updateOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.7); display: flex; justify-content: center; 
        align-items: center; z-index: 2000;
    `;
    
    const updateForm = document.createElement('div');
    updateForm.style.cssText = `
        background: white; padding: 20px; border-radius: 10px; max-width: 500px; 
        width: 90%; max-height: 80vh; overflow-y: auto;
    `;
    
    updateForm.innerHTML = `
        <h3 style="margin-top: 0; color: #6a0dad;">Update Report</h3>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Report Type:</label>
            <select id="updateReportType" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="fire" ${report.type === 'fire' ? 'selected' : ''}>Fire</option>
                <option value="smoke" ${report.type === 'smoke' ? 'selected' : ''}>Smoke</option>
                <option value="evacuation" ${report.type === 'evacuation' ? 'selected' : ''}>Evacuation Notice</option>
                <option value="road_closure" ${report.type === 'road_closure' ? 'selected' : ''}>Road Closure</option>
            </select>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Severity:</label>
            <select id="updateSeverity" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="low" ${report.severity === 'low' ? 'selected' : ''}>Low</option>
                <option value="moderate" ${report.severity === 'moderate' ? 'selected' : ''}>Moderate</option>
                <option value="high" ${report.severity === 'high' ? 'selected' : ''}>High</option>
                <option value="extreme" ${report.severity === 'extreme' ? 'selected' : ''}>Extreme</option>
            </select>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description:</label>
            <textarea id="updateDescription" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${report.description}</textarea>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; font-weight: bold;">
                <input type="checkbox" id="updateIsActive" ${report.isActive ? 'checked' : ''} style="margin-right: 8px;">
                Fire/Incident is still active
            </label>
            <small style="color: #666; margin-left: 24px;">Uncheck if the fire is no longer active (report will expire in 1 hour)</small>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="closeUpdateForm()" style="padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="submitUpdate(${reportId})" style="padding: 10px 20px; background: #6a0dad; color: white; border: none; border-radius: 5px; cursor: pointer;">Update Report</button>
        </div>
    `;
    
    updateOverlay.appendChild(updateForm);
    document.body.appendChild(updateOverlay);
}

function closeUpdateForm() {
    const overlay = document.getElementById('updateOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function submitUpdate(reportId) {
    const report = userReports.find(r => r.id === reportId);
    if (!report) {
        alert('Report not found.');
        return;
    }
    
    const newType = document.getElementById('updateReportType').value;
    const newSeverity = document.getElementById('updateSeverity').value;
    const newDescription = document.getElementById('updateDescription').value;
    const isActive = document.getElementById('updateIsActive').checked;
    
    if (!newDescription.trim() || newDescription.trim().length < 10) {
        alert('Please provide a detailed description (at least 10 characters).');
        return;
    }
    
    // Update the report
    report.type = newType;
    report.severity = newSeverity;
    report.description = newDescription;
    report.isActive = isActive;
    report.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
    
    // Refresh map markers
    if (userReportLayer) {
        userReportLayer.clearLayers();
        userReports.forEach(r => addUserReportToMap(r));
    }
    
    closeUpdateForm();
    
    const statusMessage = isActive ? 
        'Report updated successfully!' : 
        'Report updated - marked as no longer active (will expire in 1 hour).';
    alert(statusMessage);
}
