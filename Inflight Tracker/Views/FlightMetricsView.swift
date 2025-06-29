import SwiftUI

struct FlightMetricsView: View {
    let flightData: FlightData
    
    @Namespace private var animation
    @State private var randomizer: Int = 0 // Used to force view update
    
    private var metrics: FlightMetrics {
        FlightMetrics.fromFlightData(flightData)
    }
    
    private var planeInfo: PlaneInfo {
        PlaneInfo.fromFlightData(flightData)
    }

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
        VStack(spacing: 8) {
            Capsule()
                .frame(width: 48, height: 8)
                .foregroundColor(Color(.systemGray3))
                .padding(.top, 16)
                .shadow(color: .black.opacity(0.08), radius: 2, x: 0, y: 1)

            PlaneInfoCard(planeInfo: planeInfo)
                .padding(.horizontal)

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(Array(metricItems.enumerated()), id: \.offset) { _, item in
                    MetricCard(label: item.label, value: item.value, unit: item.unit, idKey: item.key, animation: animation, randomizer: randomizer)
                }
            }
            .padding(.horizontal)
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
        VStack(alignment: .leading) {
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
                .animation(.easeOut, value: progress)
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
    var randomizer: Int // Used to force transition

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            AnimatedNumberText(
                value: value,
                unit: unit,
                idKey: idKey,
                randomizer: randomizer
            )
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

#Preview {
    FlightMetricsView(
        flightData: RandomFlightData.randomFlightData()
    )
} 
