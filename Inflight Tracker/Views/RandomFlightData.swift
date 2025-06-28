import Foundation

struct RandomFlightData {
    static func randomPlaneInfo() -> PlaneInfo {
        PlaneInfo(
            flightNumber: ["AA123", "DL456", "UA789", "BA100", "AF222"].randomElement()!,
            origin: ["LAX", "JFK", "SFO", "ORD", "ATL", "DFW"].randomElement()!,
            destination: ["LHR", "CDG", "NRT", "DXB", "SYD", "JFK"].randomElement()!,
            elapsed: Double(Int.random(in: 0...400)),
            total: Double(Int.random(in: 200...500))
        )
    }

    static func randomMetrics() -> FlightMetrics {
        FlightMetrics(
            groundspeed: Double.random(in: 300...600),
            altitude: Double.random(in: 20000...41000),
            heading: Double.random(in: 0...359),
            distanceToGo: Double.random(in: 100...5000),
            longitude: Double.random(in: -180...180),
            latitude: Double.random(in: -90...90)
        )
    }
} 