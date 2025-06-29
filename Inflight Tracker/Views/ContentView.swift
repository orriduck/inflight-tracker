import SwiftUI
import MapKit

struct FlightAnnotation: Identifiable {
    let id = UUID()
    let coordinate: CLLocationCoordinate2D
}

struct ContentView: View {
    @State private var panelOffset: CGFloat = 0
    @State private var flightData: FlightData
    @State private var mapCameraPosition: MapCameraPosition
    let collapsedHeight: CGFloat = 160 // Enough for handle + PlaneInfoCard
    let expandedHeight: CGFloat = 400  // Enough for all content
    
    @GestureState private var dragOffset: CGFloat = 0
    
    init() {
        let initialFlight = RandomFlightData.randomFlightData()
        _flightData = State(initialValue: initialFlight)
        let initialRegion = MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: initialFlight.latitude, longitude: initialFlight.longitude),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
        _mapCameraPosition = State(initialValue: .region(initialRegion))
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            Map(position: $mapCameraPosition) {
                Annotation(flightData.flightNumber, coordinate: CLLocationCoordinate2D(latitude: flightData.latitude, longitude: flightData.longitude)) {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 16, height: 16)
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                        .shadow(radius: 4)
                }
            }
            .ignoresSafeArea()
            .onChange(of: flightData) { newFlightData in
                let newRegion = MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: newFlightData.latitude, longitude: newFlightData.longitude),
                    span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                )
                mapCameraPosition = .region(newRegion)
            }

            VStack(alignment: .leading) {
                WifiIndicator()
                Spacer()
            }
            .padding([.top, .leading], 12)

            // Floating panel with integrated location button
            VStack {
                Spacer()
                
                // Container for both button and panel that moves together
                VStack(spacing: 0) {
                    // Custom buttons positioned above the panel
                    HStack {
                        // Randomize button on the left
                        Button(action: {
                            withAnimation(.spring(response: 0.45, dampingFraction: 0.65, blendDuration: 0.5)) {
                                let newFlight = RandomFlightData.randomFlightData()
                                flightData = newFlight
                                let newRegion = MKCoordinateRegion(
                                    center: CLLocationCoordinate2D(latitude: newFlight.latitude, longitude: newFlight.longitude),
                                    span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                                )
                                mapCameraPosition = .region(newRegion)
                            }
                        }) {
                            Image(systemName: "dice")
                                .foregroundColor(.white)
                                .font(.system(size: 16, weight: .medium))
                                .frame(width: 40, height: 40)
                                .background(Color.orange)
                                .clipShape(Circle())
                                .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 2)
                        }
                        .padding(.leading, 16)
                        .padding(.bottom, 16)
                        
                        Spacer()
                        
                        // Center on flight location button (target style, crosshair icon)
                        Button(action: {
                            let newRegion = MKCoordinateRegion(
                                center: CLLocationCoordinate2D(latitude: flightData.latitude, longitude: flightData.longitude),
                                span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                            )
                            mapCameraPosition = .region(newRegion)
                        }) {
                            Image(systemName: "scope")
                                .foregroundColor(.blue)
                                .font(.system(size: 16, weight: .medium))
                                .frame(width: 40, height: 40)
                                .background(Color.white)
                                .clipShape(Circle())
                                .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 2)
                                .overlay(
                                    Circle().stroke(Color.blue, lineWidth: 2)
                                )
                        }
                        .padding(.trailing, 16)
                        .padding(.bottom, 16)
                    }
                    
                    // Bottom panel
                    FlightMetricsView(flightData: flightData)
                        .frame(maxWidth: .infinity)
                        .frame(height: expandedHeight)
                        .background(.ultraThinMaterial)
                        .cornerRadius(24)
                }
                .offset(y: max(panelOffset + dragOffset, 0))
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
                .animation(.spring(), value: max(panelOffset + dragOffset, 0))
            }
            .ignoresSafeArea(edges: .bottom)
            .onAppear {
                // Start in collapsed state
                panelOffset = expandedHeight - collapsedHeight
            }
        }
    }
}

#Preview {
    ContentView()
} 
