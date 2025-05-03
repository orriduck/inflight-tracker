## Inflight Tracker Web

![Node](https://img.shields.io/badge/Node-v22-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)

InFlight Tracker is a web application designed to display real-time flight information and metrics. The app provides a visual representation of flight data including position, speed, altitude, ETA, and other important metrics for in-flight monitoring. With the usage of inflight-Wifi (Now American Airlines Only but I am planning to add more airlines soon)

## Features
- Real-time flight tracking with map visualization using inflight-wifi
    - Map will be only available if the inflight-Wifi is actually able to reach internet
    - The app dynamically checks OpenStreetMap tile availability to determine if map can be displayed
    - UI adapts based on whether map data is accessible or not
- Flight metrics display (airspeed, altitude, temperature, etc.)
- Progress charts for flight parameters
- Navigation information (origin, destination, flight number)
- Responsive design for various devices
- Exporting the flight data as a GPX file which can be used to be imported in other apps like Fog Of World etc.

## Tech Stack
- **Framework**: Next.js 15
- **UI**: React 19, Tailwind CSS 4
- **Mapping**: Mapbox GL, MapLibre GL, React Map GL
- **Charts**: Recharts
- **Styling**: Tailwind CSS with custom animations
- **GPX Support**: Mapbox To GeoJSON

## Getting Started
1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Run the development server:
   ```
   pnpm dev
   ```

## Todo
- Kept storing and resume the data when refreshing
- Wrap up in docker or something to run
- Detect Inflight WIFI before running

## Screenshots
![image](https://github.com/user-attachments/assets/93456096-a840-4186-9c14-0fc2e0fe8375)
![image](https://github.com/user-attachments/assets/b3ab87f6-b526-4836-8d47-05404ae0ab2b)
