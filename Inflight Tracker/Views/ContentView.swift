import SwiftUI
import MapKit

struct ContentView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var panelOffset: CGFloat = 0
    let collapsedHeight: CGFloat = 140 // Enough for handle + PlaneInfoCard
    let expandedHeight: CGFloat = 400  // Enough for all content

    var body: some View {
        ZStack(alignment: .topLeading) {
            Map(position: $locationManager.position) {
                // UserLocation will be shown automatically when position is set
            }
            .mapControls {
                MapUserLocationButton()
            }
            .mapStyle(.standard)
            .ignoresSafeArea()

            VStack(alignment: .leading) {
                WifiIndicator()
                Spacer()
            }
            .padding([.top, .leading], 16)

            // Pull-up panel
            BottomPanel(
                collapsedHeight: collapsedHeight,
                expandedHeight: expandedHeight,
                panelOffset: $panelOffset
            ) {
                PanelContent()
            }
        }
    }
}

struct BottomPanel<Content: View>: View {
    let collapsedHeight: CGFloat
    let expandedHeight: CGFloat
    @Binding var panelOffset: CGFloat
    let content: () -> Content

    @GestureState private var dragOffset: CGFloat = 0

    var body: some View {
        let totalOffset = max(panelOffset + dragOffset, 0)
        VStack {
            Spacer()
            content()
                .frame(maxWidth: .infinity)
                .frame(height: expandedHeight)
                .background(.ultraThinMaterial)
                .cornerRadius(16)
                .offset(y: totalOffset)
                .gesture(
                    DragGesture()
                        .updating($dragOffset) { value, state, _ in
                            state = value.translation.height
                        }
                        .onEnded { value in
                            let newOffset = panelOffset + value.translation.height
                            // Snap to collapsed or expanded
                            if newOffset > (expandedHeight - collapsedHeight) / 2 {
                                panelOffset = expandedHeight - collapsedHeight // collapsed
                            } else {
                                panelOffset = 0 // expanded
                            }
                        }
                )
                .animation(.spring(), value: totalOffset)
        }
        .ignoresSafeArea(edges: .bottom)
        .onAppear {
            // Start in collapsed state
            panelOffset = expandedHeight - collapsedHeight
        }
    }
}

#Preview {
    ContentView()
} 
