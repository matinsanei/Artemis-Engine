const assert = require('assert');
const { compile, extractComponent } = require('../dist/index.js');

console.log('--- Suite 4: AI-Generated Code Resilience (Self-Healing) ---');

// 1. Unbound hooks (AI omitted `import { useState } from "react"`)
{
  const code = `
  export default function GeneratedWidget({ start = 5 }) {
    const [count, setCount] = useState(start);
    const doubled = useMemo(() => count * 2, [count]);
    useEffect(() => {
      console.log('Mounted with count:', count);
    }, []);
    return <div>Count: {count}, Doubled: {doubled}</div>;
  }
  `;
  const { code: output } = compile(code, { autoShimHooks: true });
  assert(output.includes('useEffect'), 'Expected useEffect in injected hooks');
  assert(output.includes('useMemo'), 'Expected useMemo in injected hooks');
  assert(output.includes('useState'), 'Expected useState in injected hooks');

  // Verify it runs in memory without ReferenceError: useState is not defined
  const fakeReact = {
    useState: (v) => [v, () => {}],
    useMemo: (fn) => fn(),
    useEffect: () => {},
    createElement: (tag, props, ...children) => ({ tag, props, children }),
  };

  const Component = extractComponent(output, { React: fakeReact });
  const result = Component({ start: 10 });
  assert.strictEqual(result.tag, 'div');
  console.log('  ✔ Automatically shims unbound React hooks for AI-generated code');
}

// 2. Template literals conversion
{
  const code = `
  export default function TemplateTest({ name }) {
    const greeting = \`Hello \${name}, welcome back!\`;
    return <div>{greeting}</div>;
  }
  `;
  const { code: output } = compile(code);
  assert(output.includes('"Hello " + name + ", welcome back!"'), 'Expected string concatenation');
  console.log('  ✔ Normalizes ES6 template literals to safe string concatenation');
}
