import Foundation

struct FlightData: Codable, Equatable {
    let timestamp: String
    let eta: String?
    let flightDuration: Double
    let flightNumber: String
    let latitude: Double
    let longitude: Double
    let noseId: String
    let paState: String?
    let vehicleId: String
    let destination: String
    let origin: String
    let flightId: String
    let airspeed: Double?
    let airTemperature: Double?
    let altitude: Double
    let distanceToGo: Double?
    let doorState: String?
    let groundspeed: Double
    let heading: Double?
    let timeToGo: Double
    let wheelWeightState: String
    let grossWeight: Double?
    let windSpeed: Double?
    let windDirection: Double?
    let flightPhase: String
}