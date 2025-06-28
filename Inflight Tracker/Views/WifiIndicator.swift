import SwiftUI

struct WifiIndicator: View {
    var ssid: String = "ExampleWiFi"
    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: "wifi")
                .foregroundColor(.green)
                .font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text(ssid)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                Text(isInflightWifi(ssid: ssid) ? "In-Flight WiFi" : "Not In-Flight WiFi")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .background()
        .cornerRadius(10)
        .shadow(radius: 2)
    }
    // Placeholder util function
    func isInflightWifi(ssid: String) -> Bool {
        // TODO: Replace with real logic
        return ssid.lowercased().contains("inflight") || ssid.lowercased().contains("air")
    }
}

#Preview {
    WifiIndicator()
} 
