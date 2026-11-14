const assert = require('assert');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { compile, extractComponent } = require('../dist/index.js');

console.log('--- Suite 5: Real-World Production Plugins (Zero Mocks, Real React 19 SSR) ---');

// 1. Production HeroSection (200+ LOC complex interactive section)
{
  const fixturePath = path.join(__dirname, 'fixtures', 'HeroSection.tsx');
  const heroCode = fs.readFileSync(fixturePath, 'utf-8');

  console.log('  Testing 200+ LOC HeroSection plugin fixture...');
  const start = performance.now();
  const { code: compiledCode, externalDeps } = compile(heroCode);
  const compileTime = (performance.now() - start).toFixed(2);

  assert(compiledCode.length > 0, 'Compiled bundle should not be empty');
  assert(!compiledCode.includes('require('), 'Compiled bundle must not leak require() calls');

  // Extract component in memory
  const HeroComponent = extractComponent(compiledCode, { React });
  assert.strictEqual(typeof HeroComponent, 'function', 'Extracted component must be a valid React component');

  // Render to static HTML using official ReactDOMServer (NOT A MOCK!)
  const html = ReactDOMServer.renderToString(
    React.createElement(HeroComponent, {
      title: 'Enterprise Live Test',
      subtitle: 'Verified by ReactDOMServer',
      ctaText: 'Get Started Now',
    })
  );

  assert(html.includes('Enterprise Live Test'), 'Rendered HTML must contain title prop');
  assert(html.includes('Verified by ReactDOMServer'), 'Rendered HTML must contain subtitle prop');
  assert(html.includes('Get Started Now'), 'Rendered HTML must contain CTA button text');
  assert(html.includes('99.9%'), 'Rendered HTML must contain metrics bar elements');
  assert(html.includes('<button'), 'Rendered HTML must contain button elements');

  console.log(`  ✔ HeroSection: Compiled in ${compileTime}ms and rendered ${html.length} bytes of valid HTML via React 19 SSR`);
}

// 2. Production PixelButton fixture
{
  const fixturePath = path.join(__dirname, 'fixtures', 'PixelButton.tsx');
  const buttonCode = fs.readFileSync(fixturePath, 'utf-8');

  console.log('  Testing PixelButton plugin fixture...');
  const { code: compiledCode } = compile(buttonCode);
  const ButtonComponent = extractComponent(compiledCode, { React });

  const html = ReactDOMServer.renderToString(
    React.createElement(ButtonComponent, {
      label: 'Purchase License',
      variant: 'primary',
      size: 'lg',
      fullWidth: true,
    })
  );

  assert(html.includes('Purchase License'), 'Rendered HTML must contain label prop');
  assert(html.includes('w-full'), 'Rendered HTML must contain fullWidth class');
  assert(html.includes('bg-indigo-600'), 'Rendered HTML must contain primary variant class');

  console.log(`  ✔ PixelButton: Successfully rendered strictly controlled design system component`);
}
