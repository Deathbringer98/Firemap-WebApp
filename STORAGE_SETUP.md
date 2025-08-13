# Storage Setup Instructions

The Fire Map now uses a simple JSON file-based storage system for sharing reports across all users.

## 🗂️ **Current Setup: JSON File Storage**

### **How It Works:**
- Reports are stored in `data.json` file on your server
- Backend API handles reading/writing to the file
- All users share the same data file in real-time
- Automatic cleanup of expired reports (>24 hours)

### **Files Included:**
- ✅ `data.json` - Main data storage file
- ✅ `api.php` - PHP backend API for read/write operations
- ✅ `server.py` - Python backend API (cross-platform alternative)
- ✅ JavaScript functions integrated in `reports.js`

## 🚀 **Quick Start Options**

### **Option 1: Python Server (Recommended - Works Everywhere)**

1. **Start the Server:**
   ```bash
   python server.py
   ```

2. **Open the App:**
   - Go to http://localhost:8080
   - The server automatically creates `data.json` if it doesn't exist

3. **Test Multi-User Sharing:**
   - Open the same URL in multiple browsers/devices
   - Submit reports on one browser - they appear instantly on others!

### **Option 2: PHP Server**

1. **Install PHP:**
   - Windows: Download from https://windows.php.net/download/
   - Mac: `brew install php`
   - Linux: `sudo apt install php`

2. **Start PHP Server:**
   ```bash
   php -S localhost:8080
   ```

3. **Requirements:**
- Web server with PHP support (most web hosts have this)
- Write permissions on the data.json file

### **For Local Testing:**
1. Install PHP: `php -S localhost:8080`
2. Or use XAMPP/WAMP for Windows
3. Make sure `data.json` is writable

### **For Web Hosting:**
1. Upload all files to your web server
2. Ensure PHP is enabled
3. Check file permissions on `data.json` (should be 644 or 666)

### **File Structure:**
```
firemap-webapp/
├── index.html
├── app.js
├── reports.js
├── style.css
├── data.json      ← Stores all reports
└── api.php        ← Handles data operations
```

### **Data Format:**
```json
{
  "reports": [
    {
      "id": 1723456789012,
      "type": "fire",
      "severity": "high",
      "description": "Large wildfire",
      "lat": 34.0522,
      "lng": -118.2437,
      "timestamp": "2025-08-12T15:30:00.000Z",
      "reporter": "Community User"
    }
  ],
  "lastUpdated": "2025-08-12T15:30:00.000Z",
  "metadata": {
    "version": "1.0",
    "totalReports": 1,
    "activeReports": 1
  }
}
```

### **Security Features:**
- Reports expire automatically after 24 hours
- Input validation on all fields
- Rate limiting (3 reports per day per device)
- Duplicate prevention within 200m radius

### **Troubleshooting:**
- **Reports not saving?** Check PHP error logs and file permissions
- **Data not loading?** Verify `api.php` is accessible via browser
- **File not found?** Ensure `data.json` exists and is readable

---

## 🔥 **Alternative: Firebase Setup** (Optional)

If you prefer cloud-based storage, you can still use Firebase:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "firemap-webapp"
4. Enable Realtime Database

### Step 2: Get Configuration
1. Go to Project Settings
2. Add web app
3. Copy the config object

### Step 3: Update Code
Replace the JSON API calls with Firebase calls in `reports.js`

**Current system works great for most use cases! 📁**
