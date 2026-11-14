const assert = require('assert');
const { compile } = require('../dist/index.js');

console.log('--- Suite 3: Module Resolution & Import/Export Pipeline ---');

// 1. Host globals (react, react-dom) mapping
{
  const code = `
  import React, { useState, useEffect } from 'react';
  import ReactDOM from 'react-dom';
  export default function App() { return <div>App</div>; }
  `;
  const { code: output, externalDeps } = compile(code);
  assert(output.includes('useState') && output.includes('useEffect') && output.includes('React'), 'Expected destructured React hooks');
  assert(!output.includes('require("react")'), 'Should NOT contain require("react")');
  assert.strictEqual(externalDeps.length, 0, 'react and react-dom should not be listed as 3rd party externalDeps');
  console.log('  ✔ Maps "react" and "react-dom" directly to host variables without require()');
}

// 2. Third-party packages mapped to __artemis_deps__
{
  const code = `
  import { motion, AnimatePresence } from 'framer-motion';
  import * as Lucide from 'lucide-react';
  import SwiperDefault from 'swiper';
  export default function Dynamic() { return <div>Dynamic</div>; }
  `;
  const { code: output, externalDeps } = compile(code);
  assert(output.includes('__artemis_deps__["framer-motion"]'), 'Expected framer-motion in __artemis_deps__');
  assert(output.includes('__artemis_deps__["lucide-react"]'), 'Expected lucide-react in __artemis_deps__');
  assert(output.includes('__artemis_deps__["swiper"]'), 'Expected swiper in __artemis_deps__');
  assert(externalDeps.includes('framer-motion'), 'Expected framer-motion in externalDeps');
  assert(externalDeps.includes('lucide-react'), 'Expected lucide-react in externalDeps');
  assert(externalDeps.includes('swiper'), 'Expected swiper in externalDeps');
  console.log('  ✔ Maps external 3rd-party dependencies to __artemis_deps__ registry');
}

// 3. Named exports and default exports
{
  const code = `
  export const helper = (x) => x * 2;
  export function util() { return true; }
  export default function Main() { return <div>Main</div>; }
  `;
  const { code: output } = compile(code);
  assert(output.includes('module.exports') && output.includes('default:') && output.includes('module.exports.helper = helper'), 'Expected default and named export assignments');
  console.log('  ✔ Correctly formats default and named exports into CommonJS module structure');
}
