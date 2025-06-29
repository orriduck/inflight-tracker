import SwiftUI
import MapKit

struct ContentView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var panelOffset: CGFloat = 0
    @State private var hasMapBeenInteracted: Bool = false
    let collapsedHeight: CGFloat = 140 // Enough for handle + PlaneInfoCard
    let expandedHeight: CGFloat = 400  // Enough for all content

    var body: some View {
        ZStack(alignment: .topLeading) {
            Map(coordinateRegion: locationManager.binding, showsUserLocation: true)
                .ignoresSafeArea()
                .onAppear {
                    locationManager.requestLocationPermission()
                }
                .simultaneousGesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in
                            if !hasMapBeenInteracted {
                                hasMapBeenInteracted = true
                            }
                        }
                )

            VStack(alignment: .leading) {
                WifiIndicator()
                Spacer()
            }
            .padding([.top, .leading], 16)

            // Floating panel with integrated location button
            FloatingPanel(
                collapsedHeight: collapsedHeight,
                expandedHeight: expandedHeight,
                panelOffset: $panelOffset,
                locationManager: locationManager,
                hasMapBeenInteracted: hasMapBeenInteracted,
                onLocationButtonTapped: {
                    hasMapBeenInteracted = false
                }
            ) {
                PanelContent()
            }
        }
    }
}

#Preview {
    ContentView()
} 
