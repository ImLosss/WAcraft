const { startInterval, stopIntervals } = require('./test.js');

// Mulai interval
const int1 = startInterval();
const int2 = startInterval();
const int3 = startInterval();
const int4 = startInterval();
const int5 = startInterval();
const int6 = startInterval();
const int7 = startInterval();
const int8 = startInterval();
const int9 = startInterval();

setTimeout(() => {
    stopIntervals(int3)
}, 5000);