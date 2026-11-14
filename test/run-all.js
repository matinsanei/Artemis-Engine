console.log('====================================================');
console.log('ARTEMIS ENGINE PRODUCTION VERIFICATION SUITE');
console.log('====================================================\n');

const start = performance.now();

require('./compiler-jsx.test.js');
console.log('');
require('./compiler-typescript.test.js');
console.log('');
require('./compiler-modules.test.js');
console.log('');
require('./ai-resilience.test.js');
console.log('');
require('./real-world-plugins.test.js');
console.log('');
require('./deep-nested-stress.test.js');
console.log('');
require('./engine.test.js');

const elapsed = (performance.now() - start).toFixed(2);

console.log('\n====================================================');
console.log(`ALL TEST SUITES PASSED in ${elapsed} ms.`);
console.log('====================================================');
