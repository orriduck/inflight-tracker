import SwiftUI
import MapKit

struct FloatingPanel<Content: View>: View {
    let collapsedHeight: CGFloat
    let expandedHeight: CGFloat
    @Binding var panelOffset: CGFloat
    let locationManager: LocationManager
    let hasMapBeenInteracted: Bool
    let onLocationButtonTapped: () -> Void
    let content: () -> Content

    @GestureState private var dragOffset: CGFloat = 0

    var body: some View {
        let totalOffset = max(panelOffset + dragOffset, 0)
        
        VStack {
            Spacer()
            
            // Container for both button and panel that moves together
            VStack(spacing: 0) {
                // Custom location button positioned above the panel
                HStack {
                    Spacer()
                    Button(action: {
                        locationManager.centerOnUser()
                        onLocationButtonTapped()
                    }) {
                        Image(systemName: hasMapBeenInteracted ? "location" : "location.fill")
                            .foregroundColor(hasMapBeenInteracted ? .blue : .white)
                            .font(.system(size: 16, weight: .medium))
                            .frame(width: 40, height: 40)
                            .background(hasMapBeenInteracted ? Color.white : Color.blue)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 2)
                            .overlay(
                                Circle().stroke(Color.blue, lineWidth: hasMapBeenInteracted ? 2 : 0)
                            )
                    }
                    .padding(.trailing, 16)
                    .padding(.bottom, 16)
                }
                
                // Bottom panel
                content()
                    .frame(maxWidth: .infinity)
                    .frame(height: expandedHeight)
                    .background(.ultraThinMaterial)
                    .cornerRadius(16)
            }
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