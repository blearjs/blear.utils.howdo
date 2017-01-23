/**
 * 文件描述
 * @author ydr.me
 * @create 2017-01-23 17:05
 * @update 2017-01-23 17:05
 */


'use strict';

var plan = require('../../src/index');

var Promise = function (fn) {
    this.fn = fn;
};
Promise.prototype.then = function (resolved, rejected) {
    this.fn(function (result) {
        resolved(result);
    }, function (err) {
        rejected(err);
    });
};

describe('parallel', function () {
    it('.taskPromise x 1 resolve', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    resolve(1);
                });
            })
            .parallel()
            .try(function (result) {
                expect(result).toBe(1);
                done();
            });
    });

    it('.taskPromise x 1 reject', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve, reject) {
                    reject(new Error('1'));
                });
            })
            .parallel()
            .catch(function (err) {
                expect(err.message).toBe('1');
                done();
            });
    });

    it('.taskPromise x 3 resolve', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 1
                    resolve(1);
                });
            })
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 2
                    resolve(2);
                });
            })
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 3
                    resolve(3);
                });
            })
            .parallel()
            .try(function (ret1, ret2, ret3) {
                expect(ret1).toBe(1);
                expect(ret2).toBe(2);
                expect(ret3).toBe(3);
                done();
            });
    });

    it('.taskPromise x 3 reject', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve, reject) {
                    resolve(1);
                });
            })
            .taskPromise(function () {
                return new Promise(function (resolve, reject) {
                    resolve(2);
                });
            })
            .taskPromise(function () {
                return new Promise(function (resolve, reject) {
                    reject(new Error('3'));
                });
            })
            .parallel()
            .catch(function (err) {
                expect(err.message).toBe('3');
                done();
            });
    });

    it('.taskPromise + .task', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 1
                    resolve(1);
                });
            })
            .task(function (next) {
                // 2
                next(null, 2);
            })
            .parallel()
            .try(function (ret1, ret2) {
                expect(ret1).toBe(1);
                expect(ret2).toBe(2);
                done();
            });
    });

    it('.taskPromise + .task + .taskSync', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 1
                    resolve(1);
                });
            })
            .task(function (next) {
                // 2
                next(null, 2);
            })
            .taskSync(function () {
                // 3
                return 3;
            })
            .parallel()
            .try(function (ret1, ret2, ret3) {
                expect(ret1).toBe(1);
                expect(ret2).toBe(2);
                expect(ret3).toBe(3);
                done();
            });
    });

    it('.taskPromise + .task + .taskSync + .each', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 1
                    resolve(1);
                });
            })
            .task(function (next) {
                // 2
                next(null, 2);
            })
            .taskSync(function () {
                // 3
                return 3;
            })
            .each([4, 5], function (index, val, next, prev) {
                // 第 1 次：4
                // 第 2 次：5
                next(null, val);
            })
            .parallel()
            .try(function (ret1, ret2, ret3, ret4, ret5) {
                expect(ret1).toBe(1);
                expect(ret2).toBe(2);
                expect(ret3).toBe(3);
                expect(ret4).toBe(4);
                expect(ret5).toBe(5);
                done();
            });
    });

    it('.taskPromise + .task + .taskSync + .each + .eachSync', function (done) {
        plan
            .taskPromise(function () {
                return new Promise(function (resolve) {
                    // 1
                    resolve(1);
                });
            })
            .task(function (next, prev) {
                // 2 + 1
                next(null, 2 + prev);
            })
            .taskSync(function (prev) {
                // 3 + 3
                return 3 + prev;
            })
            .each([4, 5], function (index, val, next, prev) {
                // 第 1 次：4 + 6
                // 第 2 次：5 + 10
                next(null, val + prev);
            })
            .eachSync([6, 7], function (index, val, prev) {
                // 第 1 次：6 + 15
                // 第 2 次：7 + 21
                return val + prev;
            })
            .serial()
            .try(function (result) {
                expect(result).toBe(28);
                done();
            });
    });

// it('.taskPromise + .task + .taskSync + .each + .eachSync + .eachPromise', function (done) {
//     plan
//         .taskPromise(function () {
//             return new Promise(function (resolve) {
//                 // 1
//                 resolve(1);
//             });
//         })
//         .task(function (next, prev) {
//             // 2 + 1
//             next(null, 2 + prev);
//         })
//         .taskSync(function (prev) {
//             // 3 + 3
//             return 3 + prev;
//         })
//         .each([4, 5], function (index, val, next, prev) {
//             // 第 1 次：4 + 6
//             // 第 2 次：5 + 10
//             next(null, val + prev);
//         })
//         .eachSync([6, 7], function (index, val, prev) {
//             // 第 1 次：6 + 15
//             // 第 2 次：7 + 21
//             return val + prev;
//         })
//         .eachPromise([8, 9], function (index, val, prev) {
//             return new Promise(function (resolve) {
//                 // 第 1 次：8 + 28
//                 // 第 2 次：9 + 36
//                 resolve(val + prev);
//             });
//         })
//         .serial()
//         .try(function (result) {
//             expect(result).toBe(45);
//             done();
//         });
// });


});