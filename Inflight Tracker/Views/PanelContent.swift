import SwiftUI

protocol PanelContentDataSource {
    var metrics: FlightMetrics { get }
    var planeInfo: PlaneInfo { get }
}

struct PlaneInfo {
    var flightNumber: String
    var origin: String
    var destination: String
    var elapsed: Double // minutes
    var total: Double   // minutes
}

struct FlightMetrics {
    var groundspeed: Double? // knots
    var altitude: Double?    // feet
    var heading: Double?     // degrees
    var distanceToGo: Double? // nautical miles
    var longitude: Double?
    var latitude: Double?
}

struct PanelContent: View {
    @State private var metrics: FlightMetrics = .mock
    @State private var planeInfo: PlaneInfo = .mock
    @Namespace private var animation

    private var metricItems: [(label: String, value: Double?, unit: String, key: String)] {
        [
            ("Groundspeed", metrics.groundspeed, "kt", "groundspeed"),
            ("Altitude", metrics.altitude, "ft", "altitude"),
            ("Heading", metrics.heading, "°", "heading"),
            ("Distance to Go", metrics.distanceToGo, "nm", "distanceToGo"),
            ("Longitude", metrics.longitude, "", "longitude"),
            ("Latitude", metrics.latitude, "", "latitude")
        ]
    }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(spacing: 12) {
            Capsule()
                .frame(width: 40, height: 6)
                .foregroundColor(.gray.opacity(0.4))
                .padding(.top, 8)

            PlaneInfoCard(planeInfo: planeInfo)
                .padding(.horizontal)

            Button("Randomize Flight Data") {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0.5)) {
                    metrics = .random
                    planeInfo = .random
                }
            }
            .padding(.bottom, 4)

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(Array(metricItems.enumerated()), id: \._.offset) { idx, item in
                    MetricCard(label: item.label, value: item.value, unit: item.unit, idKey: item.key, animation: animation)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
    }
}

struct PlaneInfoCard: View {
    let planeInfo: PlaneInfo

    var progress: Double {
        guard planeInfo.total > 0 else { return 0 }
        return min(planeInfo.elapsed / planeInfo.total, 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Flight \(planeInfo.flightNumber)")
                .font(.title3)
                .fontWeight(.bold)
            HStack {
                Text(planeInfo.origin)
                    .font(.headline)
                    .fontWeight(.bold)
                Image(systemName: "arrow.right")
                Text(planeInfo.destination)
                    .font(.headline)
                    .fontWeight(.bold)
            }
            ProgressView(value: progress)
                .progressViewStyle(.linear)
            HStack {
                Text("Elapsed: \(Int(planeInfo.elapsed)) min")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("Remaining: \(Int(planeInfo.total - planeInfo.elapsed)) min")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(14)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct MetricCard: View {
    let label: String
    let value: Double?
    let unit: String
    let idKey: String
    var animation: Namespace.ID

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            ZStack {
                if let value = value {
                    Text(String(format: "%.2f", value) + (unit.isEmpty ? "" : " \(unit)"))
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                        .id("value-\(idKey)-\(value)")
                        .transition(.move(edge: .bottom))
                        .matchedGeometryEffect(id: "value-\(idKey)", in: animation)
                } else {
                    Text("N/A")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.secondary)
                        .id("value-\(idKey)-na")
                        .transition(.move(edge: .bottom))
                        .matchedGeometryEffect(id: "value-\(idKey)", in: animation)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

// Mock & random data for preview/testing
extension PlaneInfo {
    static let mock = PlaneInfo(
        flightNumber: "AA123",
        origin: "LAX",
        destination: "JFK",
        elapsed: 120,
        total: 300
    )
    static let random: PlaneInfo = PlaneInfo(
        flightNumber: ["AA123", "DL456", "UA789", "BA100", "AF222"].randomElement()!,
        origin: ["LAX", "JFK", "SFO", "ORD", "ATL", "DFW"].randomElement()!,
        destination: ["LHR", "CDG", "NRT", "DXB", "SYD", "JFK"].randomElement()!,
        elapsed: Double(Int.random(in: 0...400)),
        total: Double(Int.random(in: 200...500))
    )
}

extension FlightMetrics {
    static let mock = FlightMetrics(
        groundspeed: 480,
        altitude: 35000,
        heading: 90,
        distanceToGo: 1200,
        longitude: -122.4194,
        latitude: 37.7749
    )
    static let random = FlightMetrics(
        groundspeed: Double.random(in: 300...600),
        altitude: Double.random(in: 20000...41000),
        heading: Double.random(in: 0...359),
        distanceToGo: Double.random(in: 100...5000),
        longitude: Double.random(in: -180...180),
        latitude: Double.random(in: -90...90)
    )
}

#Preview {
    PanelContent()
} 