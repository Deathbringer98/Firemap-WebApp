# 🔥 Firemap WebApp

A professional real-time wildfire tracking web application that displays active fire data on an interactive map with database persistence and user reporting capabilities.

## ✨ Features

- **Real-time fire data** from NASA's FIRMS (Fire Information for Resource Management System) and ESRI ArcGIS
- **Interactive map** powered by Leaflet.js with professional UI/UX
- **Global coverage** showing worldwide fire activity with detailed information
- **User reporting system** with geolocation and admin moderation
- **Database persistence** using MongoDB with production-grade security
- **Auto-refresh** updates fire data every 15 minutes
- **Responsive design** optimized for desktop and mobile devices
- **HTTPS security** with SSL certificates and secure headers
- **Rate limiting** and anti-abuse protection
- **Admin tools** for content moderation and analytics

## 🚀 Live Application

**Production Website:** [https://wildfiremap.app](https://wildfiremap.app)

The application is live and running on a secure HTTPS domain with full functionality.

## 📱 How to Use

1. Visit [wildfiremap.app](https://wildfiremap.app) in any modern web browser
2. Navigate the map by dragging, zooming, and clicking
3. Click on red fire markers to see detailed information:
   - Fire brightness and confidence levels
   - Detection date and time
   - Precise location coordinates
   - Satellite source information
4. Submit fire reports using the "Report Fire" button:
   - Select location on map or use current GPS
   - Provide description and severity level
   - Reports are stored in database for admin review

## 🛠️ Local Development

To run the application locally for development:

```bash
# Clone the repository
git clone https://github.com/Deathbringer98/Firemap-WebApp.git
cd Firemap-WebApp

# Start a local web server
python -m http.server 8000
# OR
npx serve .

# Open browser
open http://localhost:8000
```

For backend development:
```bash
cd api
npm install
npm start
```

## 📊 Data Sources

- **Primary Fire Data:** NASA FIRMS VIIRS Collection 2 (24-hour active fire detections)
- **Backup Fire Data:** ESRI ArcGIS MODIS Thermal Anomalies
- **Base Maps:** OpenStreetMap with multiple tile providers
- **User Reports:** MongoDB database with geospatial indexing

## 🏗️ Technologies Used

### Frontend
- HTML5 with semantic markup and SEO optimization
- CSS3 with responsive design and professional styling
- JavaScript (ES6+) with modern async/await patterns
- Leaflet.js for interactive mapping and geospatial features

### Backend
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- Production security (Helmet, CORS, Rate Limiting)
- PM2 process management

### Infrastructure
- Ubuntu 22.04 LTS server (Vultr VPS)
- Nginx web server with SSL/TLS
- Let's Encrypt SSL certificates
- Domain: wildfiremap.app (Namecheap)

## 🏛️ Architecture

```
Frontend (Static Files) → Nginx → API Backend → MongoDB
                     ↓
               SSL Certificates
                     ↓
            Rate Limiting & Security
```

## 📄 Copyright & License

**Copyright © 2025 Deathbringer98. All Rights Reserved.**

This software and its source code are proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without explicit written permission from the copyright holder.

### Restrictions:
- ❌ **No copying or redistribution** of source code
- ❌ **No modification or derivative works** without permission  
- ❌ **No commercial use** without explicit licensing agreement
- ❌ **No reverse engineering** or decompilation
- ❌ **No removal** of copyright notices or attribution

### Permitted Use:
- ✅ **Personal viewing** of the live application at [wildfiremap.app](https://wildfiremap.app)
- ✅ **Educational reference** with proper attribution (no copying)
- ✅ **Fair use** under applicable copyright law

### Contact:
For licensing inquiries, commercial use, or permission requests, please contact the copyright holder through GitHub.

---

**NOTICE:** This is **NOT** an MIT, GPL, or other open-source license. This is proprietary software protected by copyright law.

## 🏆 Author

**Created by:** [Deathbringer98](https://github.com/Deathbringer98)  
**Project:** Firemap WebApp  
**Year:** 2025  
**Status:** Production-Ready Live Application

