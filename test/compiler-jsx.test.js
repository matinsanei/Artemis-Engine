const assert = require('assert');
const { compile } = require('../dist/index.js');

console.log('--- Suite 1: JSX Transformation & Attribute Edge Cases ---');

// 1. Lowercase tags vs Uppercase components
{
  const code = `export default function App() { return <div><MyComponent prop="val" /></div>; }`;
  const { code: output } = compile(code);
  assert(output.includes('React.createElement("div"'), 'Expected lowercase tag to be string literal');
  assert(output.includes('React.createElement(MyComponent'), 'Expected uppercase component to be identifier');
  console.log('  ✔ Correctly distinguishes native HTML tags from React Component identifiers');
}

// 2. Member expression components (e.g. <motion.div>)
{
  const code = `export default function Animated() { return <motion.div className="box">Content</motion.div>; }`;
  const { code: output } = compile(code);
  assert(output.includes('React.createElement(motion.div'), 'Expected JSX member expression to be preserved');
  console.log('  ✔ Correctly transforms JSX member expressions (e.g., <motion.div>)');
}

// 3. React Fragments (<>...</> and <React.Fragment>)
{
  const code = `export default function Frag() { return <><span>1</span><span>2</span></>; }`;
  const { code: output } = compile(code);
  assert(output.includes('React.Fragment'), 'Expected <> to transform to React.Fragment');
  console.log('  ✔ Correctly transforms empty JSX fragments to React.createElement(React.Fragment)');
}

// 4. Spread attributes ({...props}) and special attributes (aria-*, data-*)
{
  const code = `export default function PropsTest(props) {
    return <button {...props} aria-label="Submit" data-id="123" disabled>Click</button>;
  }`;
  const { code: output } = compile(code);
  assert(output.includes('...props'), 'Expected spread attributes to be preserved');
  assert(output.includes('"aria-label": "Submit"'), 'Expected aria-label to be quoted key');
  assert(output.includes('"data-id": "123"'), 'Expected data-id to be quoted key');
  assert(output.includes('disabled: true'), 'Expected boolean attribute to be true literal');
  console.log('  ✔ Properly quotes non-identifier JSX attributes (aria-*, data-*) and spreads');
}

// 5. Nested children with mixed expressions and text
{
  const code = `export default function Nested({ name, count }) {
    return (
      <div className="container">
        <h1>Welcome, {name}!</h1>
        {count > 0 && <p>Items: {count}</p>}
      </div>
    );
  }`;
  const { code: output } = compile(code);
  assert(output.includes('React.createElement("h1"'), 'Expected nested h1 element');
  assert(output.includes('count > 0 && React.createElement'), 'Expected conditional expression child');
  console.log('  ✔ Transforms complex nested children and conditional expressions seamlessly');
}
