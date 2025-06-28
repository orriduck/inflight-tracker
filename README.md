# Flight Tracker iOS App

A native iOS application for real-time flight tracking using in-flight WiFi systems.

## Features

- **Real-time Flight Data**: Connect to in-flight WiFi systems to get live flight information
- **Interactive Map**: View your flight path and current position on a map
- **Flight Metrics**: Monitor altitude, speed, time remaining, and other key metrics
- **Live Charts**: Visualize altitude and speed data over time
- **WiFi Status**: Real-time WiFi connection indicator
- **Data Persistence**: Automatically saves flight data for offline viewing

## Supported Airlines

Currently supports:
- American Airlines (ViaSat and Intelsat systems)

Future support planned for:
- Delta Air Lines
- United Airlines
- Southwest Airlines
- JetBlue Airways
- Alaska Airlines
- Spirit Airlines
- China Eastern Airlines
- China Southern Airlines
- Air China

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Installation

1. Open `FlightTracker.xcodeproj` in Xcode
2. Select your target device or simulator
3. Build and run the project (⌘+R)

## Usage

1. **Connect to In-Flight WiFi**: The app will automatically detect available flight data vendors when connected to in-flight WiFi
2. **View Flight Information**: Once connected, you'll see real-time flight data including:
   - Current position and altitude
   - Ground speed and air speed
   - Time remaining to destination
   - Estimated arrival time
   - Wind conditions
   - Flight phase

3. **Interactive Features**:
   - Tap on the map to see detailed position information
   - View historical data in the charts
   - Monitor WiFi connection status

## Architecture

The app is built using SwiftUI and follows the MVVM pattern:

- **Models**: `FlightData`, `AAIntelsatFlightData` and related structures
- **ViewModels**: `FlightDataManager` handles data fetching and persistence
- **Views**: Modular SwiftUI views for each component

### Key Components

- `FlightDataManager`: Handles API calls, data polling, and persistence
- `ContentView`: Main app interface orchestrator
- `NavBarView`: Flight route and time information
- `FlightMetricsView`: Key flight metrics in card format
- `FlightChartView`: Altitude and speed charts using Swift Charts
- `MapView`: Interactive map with flight path and position
- `WifiIndicatorView`: Real-time WiFi connection status

## API Integration

The app connects to the same API endpoints as the web version:
- `http://localhost:3000/api/flight/americans/viasat`
- `http://localhost:3000/api/flight/americans/intelsat`

## Data Persistence

Flight data is automatically saved to UserDefaults and persists between app launches. Data is organized by flight number for easy retrieval.

## Privacy

The app only stores flight data locally on your device and does not transmit any personal information to external servers.

## Contributing

This is a companion app to the web-based flight tracker. The iOS version provides a native experience optimized for mobile devices while maintaining feature parity with the web version.

## License

This project is part of the Flight Tracker suite and follows the same licensing terms as the main project. 