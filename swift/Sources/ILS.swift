import Foundation

private let R = [0.00,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.10,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.20,0.21,0.22,0.23,0.24,0.25]
private let moves = [Move.swap, Move.twoOpt, Move.orOpt(1), Move.orOpt(2), Move.orOpt(3)]

enum Move {
	case swap
	case twoOpt
	case orOpt(Int)
}

func sort(arr: inout Array<Int>, r: Int, data: Data){
	quickSort(arr: &arr, left: 0, right: arr.count-1, data: data, r: r)
}

func quickSort(arr: inout Array<Int>, left: Int, right: Int, data: Data, r: Int) {

	if left >= right {
		return
	}

	let pivot = partition(arr: &arr, left: left, right: right, data: data, r: r)
	quickSort(arr: &arr, left: left, right: pivot-1, data: data, r: r)
	quickSort(arr: &arr, left: pivot+1, right: right, data: data, r: r)

}

func partition(arr: inout Array<Int>, left: Int, right: Int, data: Data, r: Int) -> Int {
	let pivot = arr[right]
	var i = left-1

	for j in left...right-1 {
		if data.getDistance(i: r, j: arr[j]) < data.getDistance(i: r, j: pivot) {
			i += 1
			arr.swapAt(i, j)
		}
	}

	arr.swapAt(i+1, right)
	return i + 1
}


func construction(data: inout Data) -> Solution {

	var s = Solution()
	s.sequence = [0]

	let _ = data.rndCrnt() // Mock alpha rnd choice
	var cl = Array(1...data.dimension-1)
	var r = 0
	while !cl.isEmpty {
		sort(arr: &cl, r: r, data: data)
		let index = data.rndCrnt()

		let c = cl[index]
		r = c
		s.sequence.append(c)
		cl.remove(at: index)
	}
	s.sequence.append(0)
	return s
}

func perturb(data: inout Data) -> Solution {
	var aStart = 1;
    var aEnd = 1;
    var bStart = 1;
    var bEnd = 1;

    while (aStart <= bStart &&  bStart <= aEnd) || (bStart <= aStart && aStart <= bEnd) {
        aStart = data.rndCrnt();
        aEnd = aStart + data.rndCrnt();

        bStart = data.rndCrnt();
        bEnd = bStart + data.rndCrnt();
    }

	return Solution()
}

func searchSwap(s: inout Solution, data: Data) -> Bool {
	return false
}

func searchTwoOpt(s: inout Solution, data: Data) -> Bool {
	return false
}

func searchOrOpt(s: inout Solution, blockSize: Int, data: Data) -> Bool {
	return false
}

func rvnd(s: inout Solution, data: inout Data) {
	
	var nl = moves

	while !nl.isEmpty {
		let index = data.rndCrnt()
		let move = nl[index]
		// var improved = false
		switch move {
			case .swap: improved = searchSwap(s: &s, data: data)
			case .twoOpt: improved = searchTwoOpt(s: &s, data: data)
			case .orOpt(let blockSize): improved = searchOrOpt(s: &s, blockSize: blockSize, data: data)
				
		}

		if improved {
			nl = moves
			continue
		}

		nl.remove(at: index)
	}
}

func gils_rvnd(iMax: Int, iIls: Int, data: inout Data) {
	var bestOfAll = Solution()

	for i in 0...iMax-1 {
		print("[+] Local Search", i);

		var localBest = construction(data: &data)
		var current = localBest

		print("\t[+] Constructing Initial Solution.. ");
		print("\t",current)

		print("\t[+] Looking for the best Neighbor..")
		var iterIls = 0
		while iterIls < iIls {
			//rvnd
			if current.cost < localBest.cost {
				localBest = current
				iterIls = 0
			}

			current = perturb(data: &data)
			iterIls += 1
		}

		if localBest.cost < bestOfAll.cost {
			bestOfAll = localBest
		}
		print("\tCurrent Best Cost", bestOfAll.cost)
	}

	print("COST:", bestOfAll.cost)
}
