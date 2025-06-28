import SwiftUI

struct AnimatedNumberText: View {
    let value: Double?
    let unit: String
    let idKey: String
    let randomizer: Int
    let digitAnimationOffset: CGFloat = 14
    let digitAnimationDuration: Double = 0.32
    let digitAnimationDelay: Double = 0.04

    var digits: [String] {
        if let value = value {
            let formatted = String(format: "%.2f", value)
            return Array(formatted).map { String($0) }
        } else {
            return ["N", "/", "A"]
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(digits.enumerated()), id: \.0) { idx, char in
                AnimatedDigit(
                    char: char,
                    index: idx,
                    idKey: idKey,
                    randomizer: randomizer,
                    offset: digitAnimationOffset,
                    duration: digitAnimationDuration,
                    delay: digitAnimationDelay * Double(idx)
                )
            }
            Text(" " + unit)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.primary)
        }
    }
}

struct AnimatedDigit: View {
    let char: String
    let index: Int
    let idKey: String
    let randomizer: Int
    let offset: CGFloat
    let duration: Double
    let delay: Double

    @State private var yOffset: CGFloat = 0
    @State private var opacity: Double = 0

    var body: some View {
        Text(char)
            .font(.title3)
            .fontWeight(.bold)
            .foregroundColor(.primary)
            .id("digit-\(idKey)-\(index)-\(char)-\(randomizer)")
            .offset(y: yOffset)
            .opacity(opacity)
            .onAppear {
                withAnimation(
                    .interpolatingSpring(stiffness: 350, damping: 18)
                    .delay(delay)
                ) {
                    yOffset = 0
                    opacity = 1
                }
            }
            .onChange(of: randomizer) { _ in
                yOffset = offset
                opacity = 0
                withAnimation(
                    .interpolatingSpring(stiffness: 350, damping: 18)
                    .delay(delay)
                ) {
                    yOffset = 0
                    opacity = 1
                }
            }
    }
} 