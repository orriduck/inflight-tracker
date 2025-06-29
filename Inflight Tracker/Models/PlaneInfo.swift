import Foundation

struct PlaneInfo {
    var flightNumber: String
    var origin: String
    var destination: String
    var elapsed: Double // minutes
    var total: Double   // minutes

    static func fromFlightData(_ data: FlightData) -> PlaneInfo {
        PlaneInfo(
            flightNumber: data.flightNumber,
            origin: data.origin,
            destination: data.destination,
            elapsed: data.flightDuration - data.timeToGo,
            total: data.flightDuration
        )
    }
}