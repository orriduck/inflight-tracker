import Foundation

struct FlightDataMapper {
    static func toPlaneInfo(from data: FlightData) -> PlaneInfo {
        PlaneInfo(
            flightNumber: data.flightNumber,
            origin: data.origin,
            destination: data.destination,
            elapsed: data.flightDuration - data.timeToGo,
            total: data.flightDuration
        )
    }

    static func toFlightMetrics(from data: FlightData) -> FlightMetrics {
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