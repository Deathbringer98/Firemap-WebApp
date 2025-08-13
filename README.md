# Firemap WebApp

A real-time wildfire tracking web application that displays active fire data on an interactive map.

## Features

- **Real-time fire data** from NASA's FIRMS (Fire Information for Resource Management System)
- **Interactive map** powered by Leaflet.js
- **Global coverage** showing worldwide fire activity
- **Auto-refresh** updates fire data every 15 minutes
- **Responsive design** works on desktop and mobile devices

## How to Use

1. Open `index.html` in a web browser
2. Navigate the map by dragging and zooming
3. Click on red fire markers to see details including:
   - Fire brightness
   - Detection date and time
   - Location coordinates

## Running Locally

To run the application locally:

1. Clone this repository
2. Start a local web server in the project directory:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and go to `http://localhost:8000`

## Data Sources

- Fire data: NASA FIRMS VIIRS Collection 2 (24-hour active fire detections)
- Backup data: ESRI ArcGIS MODIS Thermal data
- Base map: OpenStreetMap

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js for mapping
- NASA FIRMS API for fire data

## License

MIT License - Feel free to use and modify as needed.
