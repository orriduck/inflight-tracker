struct AAViaSatFlightData: Codable, Equatable {
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

    static func toFlightData(_ data: AAViaSatFlightData) -> FlightData {
        FlightData(
            timestamp: data.timestamp,
            eta: data.eta,
            flightDuration: data.flightDuration,
            flightNumber: data.flightNumber,
            latitude: data.latitude,
            longitude: data.longitude,
            noseId: data.noseId,
            paState: data.paState,
            vehicleId: data.vehicleId,
            destination: data.destination,
            origin: data.origin,
            flightId: data.flightId,
            airspeed: data.airspeed,
            airTemperature: data.airTemperature,
            altitude: data.altitude,
            distanceToGo: data.distanceToGo,
            doorState: data.doorState,
            groundspeed: data.groundspeed,
            heading: data.heading,
            timeToGo: data.timeToGo,
            wheelWeightState: data.wheelWeightState,
            grossWeight: data.grossWeight,
            windSpeed: data.windSpeed,
            windDirection: data.windDirection,
            flightPhase: data.flightPhase
        )
    }
}