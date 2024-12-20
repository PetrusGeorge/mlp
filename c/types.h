#ifndef TYPES
#define TYPES

#include <string.h>
#include <float.h>
#include <stdlib.h>

typedef double Real;

typedef struct tData {
    Real ** cost;
    int dimen;
    int * rnd;
    int rnd_index;
} tData;

typedef enum {
    REINSERTION = 1,
    OR_OPT_2 = 2,
    OR_OPT_3 = 3,
    SWAP = 4,
    TWO_OPT = 5
} tNeighborhood;

typedef struct tSeqInfo {
    Real T, C, W;
} tSeqInfo;

typedef tSeqInfo tSeq;
typedef tSeq * tSeq_;
typedef tSeq_ * tSeq__;

typedef struct tSolution {
#ifdef MATRIX
    tSeq__ seq;
#elif defined(FLAT)
    tSeq_ seq;
#endif
    //Real *** seq;
    Real cost;
    int * s;
    int s_size;
    size_t size;
    float MBsize;
    //int s_size;
} tSolution;

#ifdef FLAT
static int to_1D(const int i, const int j, const int size);
#endif

/*==========================SET==========================*/

static void seq_set_C(tSolution * solut, int i, int j, Real value);
static void seq_set_T(tSolution * solut, int i, int j, Real value);
static void seq_set_W(tSolution * solut, int i, int j, Real value);

/*==========================GET==========================*/
static Real seq_get_C(const tSolution * solut, int i, int j);
static Real seq_get_T(const tSolution * solut, int i, int j);
static Real seq_get_W(const tSolution * solut, int i, int j);
tSolution Solution_init(tData data);
void      Solution_cpy(tSolution * src, tSolution * tgt, const tData * data);
void      Solution_free(tSolution * solut);

void tData_free(tData * data);

/*==========================inline==========================*/

#ifdef FLAT
inline
int to_1D(const int i, const int j, const int size) {
    return i * size + j;
}
#endif


inline
void seq_set_C(tSolution * solut, int i, int j, Real value) {
#ifdef MATRIX
    solut->seq[i][j].C = value;
#elif defined(FLAT)
    solut->seq[to_1D(i, j, solut->s_size)].C = value;
#endif
}

inline
void seq_set_T(tSolution * solut, int i, int j, Real value) {
#ifdef MATRIX
    solut->seq[i][j].T = value;
#elif defined(FLAT)
    solut->seq[to_1D(i, j, solut->s_size)].T = value;
#endif
}

inline
void seq_set_W(tSolution * solut, int i, int j, Real value) {
#ifdef MATRIX
    solut->seq[i][j].W = value;
#elif defined(FLAT)
    solut->seq[to_1D(i, j, solut->s_size)].W = value;
#endif
}


inline
Real seq_get_C(const tSolution * solut, int i, int j) {
#ifdef MATRIX
    return solut->seq[i][j].C;
#elif defined(FLAT)
    return solut->seq[to_1D(i, j, solut->s_size)].C;
#endif
}

inline
Real seq_get_T(const tSolution * solut, int i, int j) {
#ifdef MATRIX
    return solut->seq[i][j].T;
#elif defined(FLAT)
    return solut->seq[to_1D(i, j, solut->s_size)].T;
#endif
}

inline 
Real seq_get_W(const tSolution * solut, int i, int j) {
#ifdef MATRIX
    return solut->seq[i][j].W;
#elif defined(FLAT)
    return solut->seq[to_1D(i, j, solut->s_size)].W;
#endif
}

#endif
