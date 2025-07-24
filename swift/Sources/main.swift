let data = readInstance()

let clock = ContinuousClock()

// Call function solve and measure it's time
let time = clock.measure(solve)
let timeInSeconds = Double(time.components.seconds) + Double(time.components.attoseconds) / 1e18

print("Time:", String(format: "%.6f", timeInSeconds))
