import Foundation

struct FlightMetrics {
    var groundspeed: Double? // knots
    var altitude: Double?    // feet
    var heading: Double?     // degrees
    var distanceToGo: Double? // nautical miles
    var longitude: Double?
    var latitude: Double?

    static func fromFlightData(_ data: FlightData) -> FlightMetrics {
        FlightMetrics(
            groundspeed: data.groundspeed,
            altitude: data.altitude,
            heading: data.heading,
            distanceToGo: data.distanceToGo,
            longitude: data.longitude,
            latitude: data.latitude
        )
    }
}
