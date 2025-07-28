struct SubseqInfo {
	var t: Float
	var c: Float
	var w: Float
}

struct Solution {
	var sequence = [Int]()
	var cost = 0.0

	// Subseq matrix
	var seq = [SubseqInfo]()
	var dimension = 0

	// This will copy the subseq info
	// possible variations would be implementing CoW for SubseqInfo
	// or making it a class, benchmark is needed
	func getSeq(i: Int, j: Int) -> SubseqInfo {
		return seq[i * dimension + j]
	}

}
