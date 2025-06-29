import Foundation

struct RandomFlightData {
    static func randomFlightData() -> FlightData {
        FlightData(
            timestamp: ISO8601DateFormatter().string(from: Date()),
            eta: Bool.random() ? ISO8601DateFormatter().string(from: Date().addingTimeInterval(Double.random(in: 3600...14400))) : nil,
            flightDuration: Double.random(in: 3600...14400),
            flightNumber: ["AA123", "DL456", "UA789", "BA100", "AF222"].randomElement()!,
            latitude: Double.random(in: -90...90),
            longitude: Double.random(in: -180...180),
            noseId: UUID().uuidString.prefix(6).description,
            paState: Bool.random() ? ["ON", "OFF", "AUTO"].randomElement()! : nil,
            vehicleId: UUID().uuidString.prefix(8).description,
            destination: ["LHR", "CDG", "NRT", "DXB", "SYD", "JFK"].randomElement()!,
            origin: ["LAX", "JFK", "SFO", "ORD", "ATL", "DFW"].randomElement()!,
            flightId: UUID().uuidString,
            airspeed: Bool.random() ? Double.random(in: 300...600) : nil,
            airTemperature: Bool.random() ? Double.random(in: -60...30) : nil,
            altitude: Double.random(in: 20000...41000),
            distanceToGo: Bool.random() ? Double.random(in: 100...5000) : nil,
            doorState: Bool.random() ? ["OPEN", "CLOSED"].randomElement()! : nil,
            groundspeed: Double.random(in: 300...600),
            heading: Bool.random() ? Double.random(in: 0...359) : nil,
            timeToGo: Double.random(in: 600...14400),
            wheelWeightState: ["ON", "OFF"].randomElement()!,
            grossWeight: Bool.random() ? Double.random(in: 100000...400000) : nil,
            windSpeed: Bool.random() ? Double.random(in: 0...150) : nil,
            windDirection: Bool.random() ? Double.random(in: 0...359) : nil,
            flightPhase: ["CLIMB", "CRUISE", "DESCENT", "APPROACH", "LANDED"].randomElement()!
        )
    }
} 