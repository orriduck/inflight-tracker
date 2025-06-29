import Foundation

struct AAIntelsatFlightData: Codable, Equatable {
    let timeStamp: String
    let aircraftInfo: AircraftInfo
    let softwareInfo: SoftwareInfo
    let positionalInfo: PositionalInfo
    let flightInfo: FlightInfo
    let serviceInfo: ServiceInfo

    struct AircraftInfo: Codable, Equatable {
        let tailNo: String
        let airlineCode: String
        let aircraftType: String
        let wapType: String
        let wapModel: String
        let systemType: String
        let arincEnabled: Bool
        let clEnabled: Bool
        let subSystemType: String
    }

    struct SoftwareInfo: Codable, Equatable {
        let acpuVersion: String
        let whitelistVersion: String
        let acpuUptime: String
    }

    struct PositionalInfo: Codable, Equatable {
        let aboveGndLevelFeet: String
        let latitude: String
        let longitude: String
        let horizontalVelocityMph: String
        let verticalVelocityMph: String
        let aboveSeaLevelFeet: String
        let source: String
    }

    struct FlightInfo: Codable, Equatable {
        let flightNo: String
        let departureAirportIcao: String
        let arrivalAirportIcao: String
        let scheduledDepartureTime: String
        let departureTimezoneOffsetHrs: String
        let departureAirportIata: String
        let arrivalAirportIata: String
        let departureTime: String
        let arrivalTime: String
        let scheduledArrivalTime: String
        let timeToLandMins: String
        let arrivalTimezoneOffsetHrs: String
        let totalFlightDurationMins: String
    }

    struct ServiceInfo: Codable, Equatable {
        let flightPhase: String
        let linkState: String
        let tunnelState: String
        let ifcPaxServiceState: String
        let paxSsidStatus: String
        let casSsidStatus: String
        let countryCode: String
        let airportCode: String
        let linkType: String
        let tunnelType: String
        let ifcCasServiceState: String
        let customerPortalState: String
        let captivePortalEnabled: Bool
        let currentLinkStatusCode: String
        let currentLinkStatusDescription: String
        let expectedLinkStatusCode: String
        let expectedLinkStatusDescription: String
        let expectedTimeToNoCoverageSec: String
        let expectedTimeToCoverageSec: String
    }

    static func toFlightData(_ data: AAIntelsatFlightData) -> FlightData {
        FlightData(
            timestamp: data.timeStamp,
            eta: data.flightInfo.scheduledArrivalTime,
            flightDuration: Double(data.flightInfo.totalFlightDurationMins) ?? 0,
            flightNumber: data.flightInfo.flightNo,
            latitude: Double(data.positionalInfo.latitude) ?? 0,
            longitude: Double(data.positionalInfo.longitude) ?? 0,
            noseId: data.aircraftInfo.tailNo,
            paState: nil,
            vehicleId: "",
            destination: data.flightInfo.arrivalAirportIata,
            origin: data.flightInfo.departureAirportIata,
            flightId: data.flightInfo.flightNo,
            airspeed: Double(data.positionalInfo.horizontalVelocityMph),
            airTemperature: nil,
            altitude: Double(data.positionalInfo.aboveSeaLevelFeet) ?? 0,
            distanceToGo: nil,
            doorState: nil,
            groundspeed: Double(data.positionalInfo.horizontalVelocityMph) ?? 0,
            heading: nil,
            timeToGo: Double(data.flightInfo.timeToLandMins),
            wheelWeightState: "",
            grossWeight: nil,
            windSpeed: nil,
            windDirection: nil,
            flightPhase: data.serviceInfo.flightPhase
        )
    }
}