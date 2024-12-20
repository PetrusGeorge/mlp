#! /usr/bin/node

var dimension;
var c = [];
var T = 0;
var C = 1;
var W = 2; 

function subseq_fill(dimension) {
    seq = [];
    for (var i = 0; i < dimension+1; i++) {
        seq[i] = Array(dimension+1);
        for (var j = 0; j < dimension+1; j++) {
            seq[i][j] = Array(3);
        }
    }

    return seq;
}

function update_subseq_info_matrix(s, seq) {
    for (var i = 0; i < dimension+1; i++) {
        var k = 1 - i - (i != 0 ? 0 : 1);

        seq[i][i][T] = 0.0;
        seq[i][i][C] = 0.0;
        seq[i][i][W] = (i != 0 ? 1.0 : 0.0);

        for (var j = i+1; j < dimension+1; j++) {
            let j_prev = j-1;
            seq[i][j][T] = c[s[j_prev]][s[j]] + seq[i][j_prev][T];
            seq[i][j][C] = seq[i][j][T] + seq[i][j_prev][C];
            seq[i][j][W] = j + k;
        }
    }
}

function sort(arr, r) {
    quicksort(arr, 0, arr.length - 1, r);
}

function quicksort(arr, left, right, r) {
    if (left < right) {
        let pivotIndex = partition(arr, left, right, r);
        quicksort(arr, left, pivotIndex - 1, r);
        quicksort(arr, pivotIndex + 1, right, r);
    }
}

function partition(arr, left, right, r) {
    let pivotValue = arr[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        if (c[r][arr[j]] < c[r][pivotValue]) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}

function construction(alpha, rnd) {
    s = [0];
    var cList = Array.from({length: dimension-1}, (_, i) => i + 1)

    var r = 0;
    while (cList.length > 0) {
        sort(cList, r);

        var i = rnd.rnd[rnd.rnd_index++];
        var c = cList.splice(i, 1);
        c = c[0];
        s.push(c);
        r = c;
    }

    s[dimension] = 0;

    return s;
}

function swap(s, i, j) {
    [s[i], s[j]] = [s[j], s[i]];
}

function reverse(s, i, j) {
    for (var f = i, b = j; f <= (i+j)/2; f++, b--) {
        swap(s, f, b);
    }
}

function reinsert(s, i, j, pos) {
    var sz = j - i + 1;
    if (i < pos) {
        let sub = s.splice(i, sz);
        s.splice(pos - sz, 0, ...sub);
    } else {
        let sub = s.splice(i, sz);
        s.splice(pos, 0, ...sub);
    }
}

function search_swap(s, seq) {
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;
    var cost_concat_3;
    var cost_concat_4;
    var I = -1;
    var J = -1;

    for (var i = 1; i < dimension-1; i++) {
        var i_prev = i - 1;
        var i_next = i + 1;

        // immediate nodes case

        cost_concat_1 =                 seq[0][i_prev][T] + c[s[i_prev]][s[i_next]];
        cost_concat_2 = cost_concat_1 + seq[i][i_next][T] + c[s[i]][s[i_next+1]];

        cost_new = seq[0][i_prev][C]                                                            // 1st subseq 
            + seq[i][i_next][W]           * (cost_concat_1) + c[s[i_next]][s[i]]              // concat 2nd subseq
            + seq[i_next+1][dimension][W] * (cost_concat_2) + seq[i_next+1][dimension][C];  // concat 3rd subseq

        if(cost_new < cost_best){
            cost_best = cost_new - Number.EPSILON;
            I = i;
            J = i_next;
        }

        for(var j = i_next+1; j < dimension; j++){
            var j_next = j+1;
            var j_prev = j-1;

            cost_concat_1 = seq[0][i_prev][T] + c[s[i_prev]][s[j]];
            cost_concat_2 = cost_concat_1 + c[s[j]][s[i_next]];
            cost_concat_3 = cost_concat_2 + seq[i_next][j_prev][T] + c[s[j_prev]][s[i]];
            cost_concat_4 = cost_concat_3 + c[s[i]][s[j_next]];

            cost_new = seq[0][i_prev][C]                                                        /* first subseq */
                + cost_concat_1                                                             /* concatenate second subseq (single node) */
                + seq[i_next][j_prev][W] * cost_concat_2 + seq[i_next][j_prev][C]           /* concatenate third subseq */
                + cost_concat_3                                                             /* concatenate fourth subseq (single node) */
                + seq[j_next][dimension][W] * cost_concat_4 + seq[j_next][dimension][C];    /* concatenate fifth subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
            }

        }

    }


    if(cost_best < seq[0][dimension][C] - Number.EPSILON){
        swap(s, I, J);
        update_subseq_info_matrix(s, seq);

        return true;
    }

    return false;
}

function search_two_opt(s, seq) {
    var I = -1;
    var J = -1;
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;

    for(var i = 1; i < dimension-1; i++){
        var i_prev = i -1;
        var rev_seq_cost = seq[i][i+1][T];

        for(var j = i+2; j < dimension; j++){
            var j_next = j+1;
            var j_prev = j-1;

            rev_seq_cost += c[s[j_prev]][s[j]] * (seq[i][j][W]-1);

            cost_concat_1 =                 seq[0][i_prev][T] + c[s[j]][s[i_prev]];
            cost_concat_2 = cost_concat_1 + seq[i][j][T] + c[s[j_next]][s[i]];

            cost_new = seq[0][i_prev][C]                                                        /*        1st subseq */
                + seq[i][j][W]              * cost_concat_1 + rev_seq_cost                  /* concat 2nd subseq (reversed seq) */
                + seq[j_next][dimension][W] * cost_concat_2 + seq[j_next][dimension][C];    /* concat 3rd subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
            }
        }
    }

    if(cost_best < seq[0][dimension][C] - Number.EPSILON){
        reverse(s, I, J);
        update_subseq_info_matrix(s, seq);

        return true;
    }
    return false;
}

function search_reinsertion(s, seq, opt) {
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;
    var cost_concat_3;
    var I = -1;
    var J = -1;
    var POS = -1;

    for (var i = 1; i < dimension - opt + 1; i++) { 
        var j = opt + i - 1;
        var i_prev = i-1;
        var j_next = j+1;

        // k -> reinsertion places
        for (var k = 0; k < i_prev; k++) {
            var k_next = k+1;

            cost_concat_1 = seq[0][k][T] + c[s[k]][s[i]];
            cost_concat_2 = cost_concat_1 + seq[i][j][T] + c[s[j]][s[k_next]];
            cost_concat_3 = cost_concat_2 + seq[k_next][i_prev][T] + c[s[i_prev]][s[j_next]];

            cost_new = seq[0][k][C]                                                             /*        1st subseq */
                + seq[i][j][W]              * cost_concat_1 + seq[i][j][C]                  /* concat 2nd subseq (reinserted seq) */
                + seq[k_next][i_prev][W]    * cost_concat_2 + seq[k_next][i_prev][C]        /* concat 3rd subseq */
                + seq[j_next][dimension][W] * cost_concat_3 + seq[j_next][dimension][C];    /* concat 4th subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
                POS = k;
            }
        }

        for (var k = i+opt; k < dimension ; k++) {
            var k_next = k+1;

            cost_concat_1 = seq[0][i_prev][T] + c[s[i_prev]][s[j_next]];
            cost_concat_2 = cost_concat_1 + seq[j_next][k][T] + c[s[k]][s[i]];
            cost_concat_3 = cost_concat_2 + seq[i][j][T] + c[s[j]][s[k_next]];

            cost_new = seq[0][i_prev][C]                                                        /*      1st subseq */
                + seq[j_next][k][W]         * cost_concat_1 + seq[j_next][k][C]             /* concat 2nd subseq */
                + seq[i][j][W]              * cost_concat_2 + seq[i][j][C]                  /* concat 3rd subseq (reinserted seq) */
                + seq[k_next][dimension][W] * cost_concat_3 + seq[k_next][dimension][C];    /* concat 4th subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
                POS = k;
            }
        }
    }

    if(cost_best < seq[0][dimension][C] - Number.EPSILON){
        reinsert(s, I, J, POS+1);
        update_subseq_info_matrix(s, seq);

        return true;
    }

    return false;
}

function RVND(s, subseq, rnd) {
    const SWAP        = 0;
    const REINSERTION = 1;
    const OR_OPT_2    = 2;
    const OR_OPT_3    = 3;
    const TWO_OPT     = 4;

    neighbd_list = [SWAP, TWO_OPT, REINSERTION, OR_OPT_2, OR_OPT_3];
    var improve = false;

    while (neighbd_list.length > 0) {
        let i = rnd.rnd[rnd.rnd_index++];
        let neighbd = neighbd_list[i];

        switch (neighbd) {
            case SWAP:
                improve = search_swap(s, subseq);
                break;
            case REINSERTION:
                improve = search_reinsertion(s, subseq, REINSERTION);
                break;
            case OR_OPT_2:
                improve = search_reinsertion(s, subseq, OR_OPT_2);
                break;
            case OR_OPT_3:
                improve = search_reinsertion(s, subseq, OR_OPT_3);
                break;
            case TWO_OPT:
                improve = search_two_opt(s, subseq );
                break;
        }

        if (improve) {
            neighbd_list = [SWAP, TWO_OPT, REINSERTION, OR_OPT_2, OR_OPT_3];
        } else {
            neighbd_list.splice(i, 1);
        }
    }
}

function perturb(sl, rnd) {
    var s = [...sl];

    var A_start = 1, A_end = 1;
    var B_start = 1, B_end = 1;

    while ((A_start <= B_start && B_start <= A_end) || (B_start <= A_start && A_start <= B_end)) {

        A_start = rnd.rnd[rnd.rnd_index++];
        A_end = A_start + rnd.rnd[rnd.rnd_index++];

        B_start = rnd.rnd[rnd.rnd_index++];
        B_end = B_start + rnd.rnd[rnd.rnd_index++];
    }

    if(A_start < B_start){
        reinsert(s, B_start, B_end-1, A_end);
        reinsert(s, A_start, A_end-1, B_end);
    }else{
        reinsert(s, A_start, A_end-1, B_end);
        reinsert(s, B_start, B_end-1, A_end);
    }

    return s;
}

function GILS_RVND(Iils, Imax, R, rnd) {

    var solut_best = [];
    var solut_partial = [];
    var solut_crnt = [];

    var cost_best = Number.MAX_VALUE;
    var cost_partial;
    var cost_crnt;

    var seq = subseq_fill(dimension);

    for (var i = 0; i < Imax; i++) {
        var alpha = R[rnd.rnd[rnd.rnd_index++]];

        console.log("[+] Local Search ", i+1);
        console.log("\t[+] Constructing Inital Solution..");

        solut_crnt = construction(alpha, rnd);
        solut_partial = [...solut_crnt];

        update_subseq_info_matrix(solut_crnt, seq);
        var cost_crnt = seq[0][dimension][C] - Number.EPSILON;
        var cost_partial = cost_crnt;
        console.log("Construction cost", cost_crnt);
        var iterILS = 0;

        console.log("\t[+] Looking for the best Neighbor..");
        while (iterILS < Iils) {
            RVND(solut_crnt, seq, rnd);

            cost_crnt = seq[0][dimension][C] - Number.EPSILON;
            if (cost_crnt < cost_partial) {
                cost_partial = cost_crnt;// -  Number.EPSILON;
                solut_partial = [...solut_crnt];
                iterILS = 0;
            }

            solut_crnt = perturb(solut_partial, rnd);
            update_subseq_info_matrix(solut_crnt, seq);
            iterILS++;
        }

        if (cost_partial < cost_best) {
            solut_best = [...solut_partial];
            cost_best = cost_partial;
        }
        console.log("\tcurrent best solution cost",  cost_best);
        console.log();
    }

    console.log("COST: ", cost_best);
}

function main() {
    var rnd = [];
    var Data = require("./Data"); 

    var t = Data.info_load(c);
    dimension = t.dimension;
    rnd = t.rnd;
    Iils = Math.min(dimension, 100);
    const Imax = 10;
    const R = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.21,0.22, 0.23, 0.24, 0.25];

    var tRnd = {
        rnd : rnd,
        rnd_index : 0
    };

    var start = new Date();
    GILS_RVND(Iils, Imax, R, tRnd);
    var end = new Date();

    console.log("TIME: ", (end-start)/1000);
}

main();
