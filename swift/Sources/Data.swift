import Foundation

struct Data {
	var dimension = 0
	var matrix = [Double]()
	var rnd = [Int]()
	var rndIdx = 0

	func getDistance(i: Int, j: Int) -> Double {
		return matrix[i*dimension + j]
	}

	mutating func rndCrnt() -> Int {
		let value = rnd[rndIdx]
		rndIdx += 1
		return value
	}
}

func readInstance() -> Data {
	let url = URL(fileURLWithPath: "../distance_matrix")
	let contents = (try? String(contentsOf: url))!
	
	let lines = contents.components(separatedBy: "\n")

	var data = Data()

	let dimension = Int(lines[0])!
	data.dimension = dimension
	data.matrix = Array(repeating: 0, count: (dimension*dimension))
	for i in 0...dimension-2 {


		data.matrix[i*dimension + i] = 0
		var j = i+1
		var values = lines[i+1].components(separatedBy: " ")
		values.removeLast()
		for value in values {

			let converted = Double(value)!
			data.matrix[i*dimension + j] = converted
			data.matrix[j*dimension + i] = converted
			j += 1
		}
	}

	let rndCount = Int(lines[dimension+3])!
	for i in 0...rndCount-1 {
		let linesIdx = dimension + 4 + i
		data.rnd.append(Int(lines[linesIdx])!)
	}

	return data
}
