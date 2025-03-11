#! /usr/bin/node

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

function update_subseq_info_matrix(solut, info, data) {
    //console.log(info);
    for (var i = 0; i < data.dimension+1; i++) {
        var k = 1 - i - (i != 0 ? 0 : 1);

        solut.seq[i][i][info.T] = 0.0;
        solut.seq[i][i][info.C] = 0.0;
        solut.seq[i][i][info.W] = (i != 0 ? 1.0 : 0.0);

        for (var j = i+1; j < data.dimension+1; j++) {
            let j_prev = j-1;
            solut.seq[i][j][info.T] = data.c[solut.s[j_prev]][solut.s[j]] + solut.seq[i][j_prev][info.T];
            solut.seq[i][j][info.C] = solut.seq[i][j][info.T] + solut.seq[i][j_prev][info.C];
            solut.seq[i][j][info.W] = j + k;
        }
    }

    solut.cost = solut.seq[0][data.dimension][info.C];
}

function sort(arr, r, data) {
    quicksort(arr, 0, arr.length - 1, r, data);
}

function quicksort(arr, left, right, r, data) {
    if (left < right) {
        let pivotIndex = partition(arr, left, right, r, data);
        quicksort(arr, left, pivotIndex - 1, r, data);
        quicksort(arr, pivotIndex + 1, right, r, data);
    }
}

function partition(arr, left, right, r, data) {
    let pivotValue = arr[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        if (data.c[r][arr[j]] < data.c[r][pivotValue]) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}

function construction(alpha, data) {
    s = [0];
    var cList = Array.from({length: data.dimension-1}, (_, i) => i + 1)

    var r = 0;
    while (cList.length > 0) {
        sort(cList, r, data);
        var i = data.rnd[data.rnd_index++];
        var c = cList.splice(i, 1);
        c = c[0];
        s.push(c);
        r = c;
    }

    s[data.dimension] = 0;

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

function search_swap(solut, info, data) {
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;
    var cost_concat_3;
    var cost_concat_4;
    var I = -1;
    var J = -1;

    for (var i = 1; i < data.dimension-1; i++) {
        var i_prev = i - 1;
        var i_next = i + 1;

        // immediate nodes case

        cost_concat_1 =                 solut.seq[0][i_prev][info.T] + data.c[solut.s[i_prev]][solut.s[i_next]];
        cost_concat_2 = cost_concat_1 + solut.seq[i][i_next][info.T] + data.c[solut.s[i]][solut.s[i_next+1]];

        cost_new = solut.seq[0][i_prev][info.C]                                                            // 1st subseq 
            + solut.seq[i][i_next][info.W]           * (cost_concat_1) + data.c[solut.s[i_next]][solut.s[i]]              // concat 2nd subseq
            + solut.seq[i_next+1][data.dimension][info.W] * (cost_concat_2) + solut.seq[i_next+1][data.dimension][info.C];  // concat 3rd subseq

        if(cost_new < cost_best){
            cost_best = cost_new - Number.EPSILON;
            I = i;
            J = i_next;
        }

        for(var j = i_next+1; j < data.dimension; j++){
            var j_next = j+1;
            var j_prev = j-1;

            cost_concat_1 = solut.seq[0][i_prev][info.T] + data.c[solut.s[i_prev]][solut.s[j]];
            cost_concat_2 = cost_concat_1 + data.c[solut.s[j]][solut.s[i_next]];
            cost_concat_3 = cost_concat_2 + solut.seq[i_next][j_prev][info.T] + data.c[solut.s[j_prev]][solut.s[i]];
            cost_concat_4 = cost_concat_3 + data.c[solut.s[i]][solut.s[j_next]];

            cost_new = solut.seq[0][i_prev][info.C]                                                        /* first subseq */
                + cost_concat_1                                                             /* concatenate second subseq (single node) */
                + solut.seq[i_next][j_prev][info.W] * cost_concat_2 + solut.seq[i_next][j_prev][info.C]           /* concatenate third subseq */
                + cost_concat_3                                                             /* concatenate fourth subseq (single node) */
                + solut.seq[j_next][data.dimension][info.W] * cost_concat_4 + solut.seq[j_next][data.dimension][info.C];    /* concatenate fifth subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
            }

        }

    }


    if(cost_best < solut.cost - Number.EPSILON){
        swap(solut.s, I, J);
        /*
        console.log("swap");
        console.log(cost_best);
        */
        update_subseq_info_matrix(solut, info, data);
        /*
        console.log(seq[0][data.dimension][info.C]);
        console.log();
        */

        return true;
    }

    return false;
}

function search_two_opt(solut, info, data) {
    var I = -1;
    var J = -1;
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;

    for(var i = 1; i < data.dimension-1; i++){
        var i_prev = i -1;
        var rev_seq_cost = solut.seq[i][i+1][info.T];

        for(var j = i+2; j < data.dimension; j++){
            var j_next = j+1;
            var j_prev = j-1;

            rev_seq_cost += data.c[solut.s[j_prev]][solut.s[j]] * (solut.seq[i][j][info.W]-1);

            cost_concat_1 =                 solut.seq[0][i_prev][info.T] + data.c[solut.s[j]][solut.s[i_prev]];
            cost_concat_2 = cost_concat_1 + solut.seq[i][j][info.T] + data.c[solut.s[j_next]][solut.s[i]];

            cost_new = solut.seq[0][i_prev][info.C]                                                        /*        1st subseq */
                + solut.seq[i][j][info.W]              * cost_concat_1 + rev_seq_cost                  /* concat 2nd subseq (reversed seq) */
                + solut.seq[j_next][data.dimension][info.W] * cost_concat_2 + solut.seq[j_next][data.dimension][info.C];    /* concat 3rd subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
            }
        }
    }

    if(cost_best < solut.cost - Number.EPSILON){
        reverse(solut.s, I, J);
        /*
        console.log("two opt");
        console.log(cost_best);
        */
        update_subseq_info_matrix(solut, info, data);
        /*
        console.log(seq[0][data.dimension][info.C]);
        console.log();
        */

        return true;
    }
    return false;
}

function search_reinsertion(solut, info, data, opt) {
    var cost_best = Number.MAX_VALUE;
    var cost_new;
    var cost_concat_1;
    var cost_concat_2;
    var cost_concat_3;
    var I = -1;
    var J = -1;
    var POS = -1;

    for (var i = 1; i < data.dimension - opt + 1; i++) { 
        var j = opt + i - 1;
        var i_prev = i-1;
        var j_next = j+1;

        // k -> reinsertion places
        for (var k = 0; k < i_prev; k++) {
            var k_next = k+1;

            cost_concat_1 = solut.seq[0][k][info.T] + data.c[solut.s[k]][solut.s[i]];
            cost_concat_2 = cost_concat_1 + solut.seq[i][j][info.T] + data.c[solut.s[j]][solut.s[k_next]];
            cost_concat_3 = cost_concat_2 + solut.seq[k_next][i_prev][info.T] + data.c[solut.s[i_prev]][solut.s[j_next]];

            cost_new = solut.seq[0][k][info.C]                                                             /*        1st subseq */
                + solut.seq[i][j][info.W]              * cost_concat_1 + solut.seq[i][j][info.C]                  /* concat 2nd subseq (reinserted seq) */
                + solut.seq[k_next][i_prev][info.W]    * cost_concat_2 + solut.seq[k_next][i_prev][info.C]        /* concat 3rd subseq */
                + solut.seq[j_next][data.dimension][info.W] * cost_concat_3 + solut.seq[j_next][data.dimension][info.C];    /* concat 4th subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
                POS = k;
            }
        }

        for (var k = i+opt; k < data.dimension; k++) {
            var k_next = k+1;

            cost_concat_1 = solut.seq[0][i_prev][info.T] + data.c[solut.s[i_prev]][solut.s[j_next]];
            cost_concat_2 = cost_concat_1 + solut.seq[j_next][k][info.T] + data.c[solut.s[k]][solut.s[i]];
            cost_concat_3 = cost_concat_2 + solut.seq[i][j][info.T] + data.c[solut.s[j]][solut.s[k_next]];

            cost_new = solut.seq[0][i_prev][info.C]                                                        /*      1st subseq */
                + solut.seq[j_next][k][info.W]         * cost_concat_1 + solut.seq[j_next][k][info.C]             /* concat 2nd subseq */
                + solut.seq[i][j][info.W]              * cost_concat_2 + solut.seq[i][j][info.C]                  /* concat 3rd subseq (reinserted seq) */
                + solut.seq[k_next][data.dimension][info.W] * cost_concat_3 + solut.seq[k_next][data.dimension][info.C];    /* concat 4th subseq */

            if(cost_new < cost_best){
                cost_best = cost_new - Number.EPSILON;
                I = i;
                J = j;
                POS = k;
            }
        }
    }
    //console.log("cost best

    if(cost_best < solut.cost - Number.EPSILON){
        reinsert(solut.s, I, J, POS+1);
        /*
        console.log("reinsertion", I, POS+1, opt);
        //console.log(s);
        console.log(cost_best);
        */
        update_subseq_info_matrix(solut, info, data);
        /*
        console.log(seq[0][data.dimension][info.C]);
        //console.log(s);
        console.log();
        */

        return true;
    }

    return false;
}

function RVND(solut, info, data) {
    const SWAP        = 0;
    const REINSERTION = 1;
    const OR_OPT_2    = 2;
    const OR_OPT_3    = 3;
    const TWO_OPT     = 4;

    neighbd_list = [SWAP, TWO_OPT, REINSERTION, OR_OPT_2, OR_OPT_3];
    var improve = false;

    while (neighbd_list.length > 0) {
        let i = data.rnd[data.rnd_index++];
        let neighbd = neighbd_list[i];

        switch (neighbd) {
            case SWAP:
                improve = search_swap(solut, info, data);
                break;
            case REINSERTION:
                improve = search_reinsertion(solut, info, data, REINSERTION);
                break;
            case OR_OPT_2:
                improve = search_reinsertion(solut, info, data, OR_OPT_2);
                break;
            case OR_OPT_3:
                improve = search_reinsertion(solut, info, data, OR_OPT_3);
                break;
            case TWO_OPT:
                improve = search_two_opt(solut, info, data);
                break;
        }

        if (improve) {
            neighbd_list = [SWAP, TWO_OPT, REINSERTION, OR_OPT_2, OR_OPT_3];
        } else {
            neighbd_list.splice(i, 1);
        }
    }
}

function perturb(sl, data) {
    var s = [...sl];

    var A_start = 1, A_end = 1;
    var B_start = 1, B_end = 1;

    while ((A_start <= B_start && B_start <= A_end) || (B_start <= A_start && A_start <= B_end)) {
        A_start = data.rnd[data.rnd_index++];
        A_end = A_start + data.rnd[data.rnd_index++];

        B_start = data.rnd[data.rnd_index++];
        B_end = B_start + data.rnd[data.rnd_index++];
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

function GILS_RVND(Iils, Imax, R, info, data) {

    seq_a = subseq_fill(data.dimension);
    seq_b = subseq_fill(data.dimension);
    seq_c = subseq_fill(data.dimension);

    var solut_crnt = {
        seq : seq_a,
        s   : Array(data.dimension+1),
        cost : 0};

    var solut_partial = {
        seq : seq_b,
        s   : Array(data.dimension+1),
        cost : 0};

    var solut_best = {
        seq : seq_c,
        s   : Array(data.dimension+1),
        cost : Number.MAX_VALUE};

    for (var i = 0; i < Imax; i++) {
        var alpha = R[data.rnd[data.rnd_index++]];
        console.log("[+] Local Search ", i+1);
        console.log("\t[+] Constructing Inital Solution..");
        solut_crnt.s = construction(alpha, data);
        update_subseq_info_matrix(solut_crnt, info, data);

        solut_partial.s = [...solut_crnt.s];
        solut_partial.cost = solut_crnt.cost;
      
        console.log("Construction cost", solut_partial.cost);
        var iterILS = 0;

        console.log("\t[+] Looking for the best Neighbor..");
        while (iterILS < Iils) {
            RVND(solut_crnt, info, data);

            if (solut_crnt.cost < solut_partial.cost) {
                solut_partial.cost = solut_crnt.cost;// -  Number.EPSILON;
                solut_partial.s = [...solut_crnt.s];
                iterILS = 0;
            }

            solut_crnt.s = perturb(solut_partial.s, data);
            update_subseq_info_matrix(solut_crnt, info, data);
            iterILS++;
        }

        if (solut_partial.cost < solut_best.cost) {
            solut_best.s = [...solut_partial.s];
            solut_best.cost = solut_partial.cost;
        }

        console.log("\tcurrent best solution cost",  solut_best.cost);
        console.log();
    }

    console.log("COST: ", solut_best.cost);
}

function main() {
    var dimension;
    var c = [];
    var rnd = [];
    var Data = require("./Data"); 

    var t = Data.data_load(c);
    dimension = t.dimension;
    rnd = t.rnd;
    Iils = Math.min(dimension, 100);
    const Imax = 10;
    const R = [0.00, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20, 0.21,0.22, 0.23, 0.24, 0.25];

    var data = {
        c : c,
        rnd : rnd,
        dimension : dimension, 
        rnd_index : 0
    }

    //var info = Object.freeze({
    var info = {
        T : 0,
        C : 1, 
        W : 2, 
    };

    var start = new Date();
    GILS_RVND(Iils, Imax, R, info, data);
    var end = new Date();

    console.log("TIME: ", (end-start)/1000);
}

main();
