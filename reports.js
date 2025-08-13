// User Reporting System with Firebase Realtime Database (Simplified)

// Global variables for Firebase
let database = null;
let isFirebaseReady = false;
let userReports = JSON.parse(localStorage.getItem('firemap_user_reports') || '[]');
let reportIndex = 0;

// Anti-abuse configuration
const REPORT_TTL_MS = 24 * 60 * 60 * 1000;       // Expire reports after 24h
const REPORT_COOLDOWN_MS = 30 * 60 * 1000;       // 30 minutes between submissions per device
const RATE_LIMIT_PER_DAY = 3;                     // Max 3 reports per day per device
const DEDUPE_RADIUS_M = 200;                      // Prevent duplicates within 200m
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;         // within last 1 hour

console.log('🔥 Firebase integration ready - waiting for module initialization');

// Initialize Firebase reporting system using global Firebase objects
async function initializeReporting() {
    console.log('🚀 Initializing Firebase reporting system...');
    
    try {
        // Wait longer for Firebase to load (since CDN might be slow)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔍 Checking Firebase availability after 2 second wait...');
        console.log('🔍 firebaseReady:', window.firebaseReady);
        console.log('🔍 firebaseDatabase:', !!window.firebaseDatabase);
        console.log('🔍 firebaseRef:', typeof window.firebaseRef);
        
        // Check if Firebase is ready (simple check)
        if (window.firebaseReady && window.firebaseDatabase && window.firebaseRef) {
            database = window.firebaseDatabase;
            isFirebaseReady = true;
            
            console.log('🎯 Firebase reporting system connected!');
            console.log('🎯 Database object:', database);
            
            // Load existing reports from Firebase
            await loadReportsFromFirebase();
            
            // Set up real-time listeners
            setupRealtimeListeners();
            
        } else {
            console.log('⚠️ Firebase not ready yet. Checking what we have:');
            console.log('   firebaseReady:', !!window.firebaseReady);
            console.log('   firebaseDatabase:', !!window.firebaseDatabase);
            console.log('   firebaseRef:', !!window.firebaseRef);
            throw new Error('Firebase not fully initialized');
        }
        
    } catch (error) {
        console.error('❌ Firebase reporting initialization failed:', error);
        isFirebaseReady = false;
        
        // Fallback to localStorage only
        userReports = JSON.parse(localStorage.getItem('firemap_user_reports') || '[]');
        loadLocalReportsToMap();
    }
}

// Set up real-time listeners for instant updates
function setupRealtimeListeners() {
    if (!database || !window.firebaseOnValue || !window.firebaseRef) {
        console.log('⚠️ Firebase not ready for real-time listeners');
        return;
    }
    
    const reportsRef = window.firebaseRef(database, 'reports');
    
    // Listen for all changes to reports (v8 syntax)
    window.firebaseOnValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log('📡 Reports updated from Firebase');
            
            // Clear existing markers
            if (window.userReportLayer) {
                window.userReportLayer.clearLayers();
            }
            
            // Filter and add valid reports
            const now = Date.now();
            const validReports = [];
            
            Object.values(data).forEach(report => {
                if (isReportValid(report)) {
                    validReports.push(report);
                    try {
                        addUserReportToMap(report);
                    } catch (error) {
                        console.error('❌ Failed to add report to map:', error);
                    }
                }
            });
            
            userReports = validReports;
            console.log(`📊 Synced ${validReports.length} active reports`);
        } else {
            console.log('� No reports in Firebase');
            userReports = [];
            if (window.userReportLayer) {
                window.userReportLayer.clearLayers();
            }
        }
    }, (error) => {
        console.error('❌ Firebase listener error:', error);
    });
    
    console.log('👂 Real-time listeners active - reports will sync instantly!');
}

// Check if report is valid and not expired
function isReportValid(report) {
    if (!report || !report.timestamp) return false;
    
    const now = Date.now();
    const reportTime = new Date(report.timestamp).getTime();
    return (now - reportTime) < REPORT_TTL_MS;
}

// Global variables for tracking
// userReports already declared above
// Anti-abuse constants already declared above

// Mobile detection
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Cancel location selection (for mobile)
function cancelLocationSelection() {
    isReportingMode = false;
    window.isReportingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', selectReportLocation);
    
    // Remove location indicator
    const indicator = document.getElementById('locationIndicator');
    if (indicator) indicator.remove();
    
    // Show form again
    const overlay = document.getElementById('formOverlay');
    const form = document.getElementById('reportForm');
    if (overlay && form) {
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.pointerEvents = '';
        form.style.display = 'block';
    }
    
    // Reset button
    const button = document.getElementById('locationSelectBtn');
    if (button) {
        button.textContent = '📍 Select on Map';
        button.style.background = 'linear-gradient(135deg, #6a0dad, #8a2be2)';
    }
}

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

// Reset visitor counter (admin only)
const _0xv1s1t = function() {
    const _0xe9f0 = localStorage.getItem('firemap_' + _0x4a8b[0] + '_mode') === _0x4a8b[1];
    if (!_0xe9f0) {
        console.log('❌ Insufficient privileges for this operation');
        return false;
    }
    
    if (confirm('🔧 Reset visitor counter to 0?')) {
        localStorage.removeItem('firemap_visitors');
        localStorage.removeItem('firemap_last_visit');
        sessionStorage.removeItem('firemap_session_visited');
        
        // Update display
        document.getElementById('visitorCount').textContent = '0';
        console.log('🔧 Visitor counter reset successful');
        alert('Visitor counter reset to 0');
        return true;
    }
    return false;
};

window[String.fromCharCode(95, 114, 101, 115, 101, 116, 86, 105, 115, 105, 116, 111, 114, 115)] = _0xv1s1t;

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

// =============== FIREBASE CLOUD STORAGE FUNCTIONS ===============

// Save report to Firebase for instant sharing (simplified)
async function saveReportToCloud(report) {
    console.log('🚀 Attempting to save report to Firebase:', report);
    console.log('Firebase ready status:', isFirebaseReady);
    console.log('Database available:', !!database);
    console.log('Firebase functions available:', {
        firebaseSet: !!window.firebaseSet,
        firebaseRef: !!window.firebaseRef
    });
    
    if (!isFirebaseReady || !database || !window.firebaseSet || !window.firebaseRef) {
        console.log('⚠️ Firebase not ready, saving locally only');
        
        // Save to localStorage as fallback
        userReports.push(report);
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        return false;
    }
    
    try {
        console.log('💾 Saving to Firebase path: reports/' + report.id);
        
        // Save to Firebase with auto-expiring timestamp (v8 syntax)
        const reportRef = window.firebaseRef(database, `reports/${report.id}`);
        const reportData = {
            ...report,
            expiresAt: Date.now() + REPORT_TTL_MS // Auto-cleanup after 24h
        };
        
        console.log('📦 Report data to save:', reportData);
        
        await window.firebaseSet(reportRef, reportData);
        
        console.log('☁️ Report saved to Firebase - visible to all users instantly!');
        
        // Also save locally for offline access
        userReports.push(report);
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        
        return true;
        
    } catch (error) {
        console.error('❌ Failed to save to Firebase:', error);
        
        // Fallback to localStorage
        userReports.push(report);
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        return false;
    }
}

// Load reports from Firebase
async function loadReportsFromFirebase() {
    if (!database || !window.firebaseGet || !window.firebaseRef) {
        console.log('⚠️ Firebase not ready for loading reports');
        return [];
    }
    
    try {
        const reportsRef = window.firebaseRef(database, 'reports');
        const snapshot = await window.firebaseGet(reportsRef);
        const data = snapshot.val();
        
        if (!data) {
            console.log('📭 No reports found in Firebase');
            return [];
        }
        
        console.log('📥 Loaded reports from Firebase:', data);
        
        // Convert object to array and filter expired reports
        const now = Date.now();
        const reports = Object.values(data).filter(report => {
            // Remove expired reports
            if (report.expiresAt && report.expiresAt < now) {
                const expiredRef = window.firebaseRef(database, `reports/${report.id}`);
                window.firebaseRemove(expiredRef); // Auto-cleanup
                return false;
            }
            return true;
        });
        
        console.log(`� Loaded ${reports.length} active reports from Firebase`);
        
        // Update userReports and add to map
        userReports = reports;
        reports.forEach(report => {
            try {
                addUserReportToMap(report);
            } catch (error) {
                console.error('❌ Failed to add report to map:', error);
            }
        });
        
        return reports;
        
    } catch (error) {
        console.error('❌ Failed to load from Firebase:', error);
        return [];
    }
}

// Load local reports if Firebase fails
function loadLocalReportsToMap() {
    console.log('💾 Loading local reports only');
    userReports.forEach(report => {
        try {
            addUserReportToMap(report);
        } catch (error) {
            console.error('❌ Failed to add local report to map:', error);
        }
    });
}

// Update report on map (for real-time updates)
function updateReportOnMap(updatedReport) {
    // Find and update the report in userReports
    const index = userReports.findIndex(r => r.id === updatedReport.id);
    if (index !== -1) {
        userReports[index] = updatedReport;
    }
    
    // Remove old marker and add updated one
    removeReportFromMap(updatedReport.id);
    addUserReportToMap(updatedReport);
}

// Remove report from map
function removeReportFromMap(reportId) {
    if (!userReportLayer) return;
    
    userReportLayer.eachLayer(layer => {
        if (layer.reportId === reportId) {
            userReportLayer.removeLayer(layer);
        }
    });
    
    // Also remove from userReports array
    userReports = userReports.filter(r => r.id !== reportId);
}

// Main function used by app.js to load reports
async function loadReportsFromCloud() {
    if (isFirebaseReady) {
        return await loadReportsFromFirebase();
    } else {
        // Use localStorage if Firebase not available
        const localReports = JSON.parse(localStorage.getItem('firemap_user_reports') || '[]');
        
        // Filter expired reports
        const now = Date.now();
        const activeReports = localReports.filter(report => {
            if (!report.timestamp) return false;
            const reportTime = new Date(report.timestamp).getTime();
            return (now - reportTime) < REPORT_TTL_MS;
        });
        
        console.log(`💾 Loaded ${activeReports.length} local reports`);
        userReports = activeReports;
        return activeReports;
    }
}

// Initialize Firebase and load reports when page loads
async function initializeReporting() {
    console.log('� Initializing reporting system...');
    await initializeFirebase();
}
// Check if Firebase is available
async function checkCloudStorageAvailability() {
    return isFirebaseReady && database;
}

// =============== END CLOUD STORAGE FUNCTIONS ===============

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
    
    // On mobile, minimize the form during location selection
    if (isMobileDevice()) {
        const overlay = document.getElementById('formOverlay');
        const form = document.getElementById('reportForm');
        if (overlay && form) {
            // Hide the form but keep overlay visible with a small indicator
            form.style.display = 'none';
            overlay.style.background = 'rgba(0,0,0,0.3)';
            
            // Add location selection indicator
            const indicator = document.createElement('div');
            indicator.id = 'locationIndicator';
            indicator.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
                    z-index: 1001;
                    text-align: center;
                    animation: pulse 2s infinite;
                ">
                    📍 Tap anywhere on the map to set location
                    <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">
                        Tap to cancel: 
                        <span onclick="cancelLocationSelection()" style="
                            background: rgba(255,255,255,0.2);
                            padding: 4px 8px;
                            border-radius: 12px;
                            cursor: pointer;
                            margin-left: 5px;
                        ">✕ Cancel</span>
                    </div>
                </div>
            `;
            document.body.appendChild(indicator);
        }
        // Prevent overlay from catching map clicks while selecting
        overlay.style.pointerEvents = 'none';
    } else {
        // Desktop behavior - just prevent overlay from catching map clicks
        const overlay = document.getElementById('formOverlay');
        if (overlay) overlay.style.pointerEvents = 'none';
    }
    
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
    
    // Disable reporting mode
    isReportingMode = false;
    window.isReportingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', selectReportLocation);
    
    // Handle mobile vs desktop differently
    if (isMobileDevice()) {
        // Remove location indicator
        const indicator = document.getElementById('locationIndicator');
        if (indicator) indicator.remove();
        
        // Show confirmation dialog for mobile
        showMobileLocationConfirmation(lat, lng);
    } else {
        // Desktop: just re-enable overlay interactions
        const overlay = document.getElementById('formOverlay');
        if (overlay) overlay.style.pointerEvents = '';
    }
}

function showMobileLocationConfirmation(lat, lng) {
    // Create confirmation overlay
    const confirmOverlay = document.createElement('div');
    confirmOverlay.id = 'locationConfirmOverlay';
    confirmOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 1002;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    confirmOverlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 25px;
            max-width: 350px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        ">
            <div style="font-size: 48px; margin-bottom: 15px;">📍</div>
            <h3 style="margin: 0 0 15px 0; color: #333;">Location Selected!</h3>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.4;">
                Coordinates: <strong>${lat}, ${lng}</strong><br>
                Would you like to submit your report at this location?
            </p>
            <div style="display: flex; gap: 12px;">
                <button onclick="cancelMobileLocationConfirm()" style="
                    flex: 1;
                    padding: 12px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                ">Choose Different Location</button>
                <button onclick="confirmMobileLocation()" style="
                    flex: 1;
                    padding: 12px;
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                ">Continue with Report</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmOverlay);
}

function cancelMobileLocationConfirm() {
    // Remove confirmation overlay
    const confirmOverlay = document.getElementById('locationConfirmOverlay');
    if (confirmOverlay) confirmOverlay.remove();
    
    // Remove temp marker
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
    
    // Reset location field and button
    document.getElementById('location').value = '';
    document.getElementById('location').placeholder = 'Click \'Select on Map\' to choose location';
    const button = document.getElementById('locationSelectBtn');
    if (button) {
        button.textContent = '📍 Select on Map';
        button.style.background = 'linear-gradient(135deg, #6a0dad, #8a2be2)';
    }
    
    // Reactivate location selection
    activateLocationSelection();
}

function confirmMobileLocation() {
    // Remove confirmation overlay
    const confirmOverlay = document.getElementById('locationConfirmOverlay');
    if (confirmOverlay) confirmOverlay.remove();
    
    // Show the report form again
    const overlay = document.getElementById('formOverlay');
    const form = document.getElementById('reportForm');
    if (overlay && form) {
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.pointerEvents = '';
        form.style.display = 'block';
    }
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
    
    // Clean up mobile indicators
    const locationIndicator = document.getElementById('locationIndicator');
    if (locationIndicator) locationIndicator.remove();
    
    const confirmOverlay = document.getElementById('locationConfirmOverlay');
    if (confirmOverlay) confirmOverlay.remove();
    
    // Reset button
    const button = document.getElementById('locationSelectBtn');
    if (button) {
        button.textContent = '📍 Select on Map';
        button.style.background = 'linear-gradient(135deg, #6a0dad, #8a2be2)';
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
    
    console.log('📍 Submitting report:', report);
    
    // Add to reports array
    userReports.push(report);
    console.log('📊 Total reports now:', userReports.length);
    
    // Save to localStorage for offline fallback
    try {
        localStorage.setItem('firemap_user_reports', JSON.stringify(userReports));
        console.log('💾 Report saved to localStorage successfully');
    } catch (error) {
        console.error('❌ Failed to save report to localStorage:', error);
        alert('Error saving report. Please try again.');
        return;
    }
    
    // Save to cloud storage for global sharing
    saveReportToCloud(report).then(success => {
        if (success) {
            console.log('☁️ Report synced to cloud storage successfully');
        } else {
            console.warn('⚠️ Report saved locally only (cloud sync failed)');
        }
    });
    
    markReportSubmitted();
    
    // Add to map
    try {
        addUserReportToMap(report);
        console.log('🗺️ Report added to map successfully');
    } catch (error) {
        console.error('❌ Failed to add report to map:', error);
    }
    
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
async function loadUserReports() {
    console.log('🔄 Loading user reports...');
    
    // First, try to load from cloud storage (global reports)
    const cloudReports = await loadReportsFromCloud();
    
    // Then load from localStorage (local fallback/offline reports)
    const savedReports = localStorage.getItem('firemap_user_reports');
    let localReports = [];
    
    if (savedReports) {
        try {
            localReports = JSON.parse(savedReports);
            console.log(`💾 Found ${localReports.length} local reports`);
        } catch (error) {
            console.error('❌ Failed to parse local reports:', error);
            localReports = [];
        }
    }
    
    // Merge cloud and local reports, avoiding duplicates
    const allReports = [...cloudReports];
    localReports.forEach(localReport => {
        if (!allReports.find(r => r.id === localReport.id)) {
            allReports.push(localReport);
        }
    });
    
    // Filter out expired reports
    const now = Date.now();
    userReports = allReports.filter(report => {
        if (!report.timestamp) return false;
        const reportTime = new Date(report.timestamp).getTime();
        return (now - reportTime) < REPORT_TTL_MS;
    });
    
    console.log(`📊 Total active reports: ${userReports.length} (${cloudReports.length} from cloud storage, ${localReports.length} local)`);
    
    // Ensure backward compatibility with existing reports
    userReports.forEach(report => {
        if (!report.originalTimestamp) report.originalTimestamp = report.timestamp;
        if (!report.lastUpdated) report.lastUpdated = report.timestamp;
        if (report.isActive === undefined) report.isActive = true;
    });
    
    // Add each report to map
    userReports.forEach((report, index) => {
        try {
            addUserReportToMap(report);
            console.log(`✅ Added report ${index + 1} to map: ${report.type} at ${report.lat}, ${report.lng}`);
        } catch (error) {
            console.error(`❌ Failed to add report ${index + 1} to map:`, error);
        }
    });
    
    console.log('🗺️ All user reports loaded successfully');
    
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
