const assert = require('assert');
const { compile, extractComponent } = require('../dist/index.js');

console.log('🧪 Running Artemis Engine Test Suite...\n');

// Test 1: TypeScript and JSX compilation
console.log('Test 1: Compiling TypeScript + JSX with state and hooks...');
const tsxCode = `
import React, { useState } from 'react';

interface AlertProps {
  message: string;
  type?: 'success' | 'warning';
}

export default function AlertBox({ message, type = 'success' }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <div className={"alert alert-" + type}><span>{message}</span></div>;
}
`;

const result = compile(tsxCode);
assert(typeof result.code === 'string', 'Expected compiled code to be string');
assert(result.code.includes('React.createElement'), 'Expected JSX to be transformed to React.createElement');
assert(!result.code.includes('interface AlertProps'), 'Expected TypeScript types to be stripped');
console.log('✅ Test 1 Passed: Types stripped and JSX transformed.');

// Test 2: In-memory evaluation and execution
console.log('Test 2: Extracting component and executing in-memory...');
const fakeReact = {
  useState: (initial) => [initial, () => {}],
  createElement: (type, props, ...children) => ({ type, props, children: children.flat() }),
};

const Component = extractComponent(result.code, { React: fakeReact });
assert(typeof Component === 'function', 'Expected extracted component to be a function');

const vnode = Component({ message: 'Hello Artemis', type: 'success' });
assert.strictEqual(vnode.type, 'div');
assert.strictEqual(vnode.props.className, 'alert alert-success');
console.log('✅ Test 2 Passed: Component executed in isolated scope.');

// Test 3: Auto-shimming unbound hooks (AI-generated code scenario)
console.log('Test 3: Auto-shimming unbound React hooks...');
const aiGeneratedCode = `
export default function AiWidget() {
  const [val, setVal] = useState(100);
  const memoized = useMemo(() => val * 2, [val]);
  return <h1>Value: {memoized}</h1>;
}
`;

const aiResult = compile(aiGeneratedCode, { autoShimHooks: true });
assert(aiResult.code.includes('useMemo'), 'Expected useMemo to be preserved');
assert(aiResult.code.includes('useState'), 'Expected useState to be preserved');

const fakeReactWithMemo = {
  ...fakeReact,
  useMemo: (fn) => fn(),
};

const AiComponent = extractComponent(aiResult.code, { React: fakeReactWithMemo });
const aiNode = AiComponent({});
assert.strictEqual(aiNode.type, 'h1');
console.log('✅ Test 3 Passed: Auto-shimming of unbound hooks working.');

console.log('\n🎉 ALL TESTS PASSED! Artemis Engine is rock-solid!');
