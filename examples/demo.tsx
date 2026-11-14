import React from 'react';
import { compile, ArtemisHost } from '../src';

// Example raw React/TSX component code (could come from AI, user input, or remote API)
const samplePluginCode = `
import React, { useState } from 'react';

interface WidgetProps {
  title?: string;
  initialValue?: number;
}

export default function InteractiveWidget({ title = 'Artemis Counter', initialValue = 0 }: WidgetProps) {
  const [count, setCount] = useState<number>(initialValue);

  return (
    <div style={{ padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #8b5cf6', background: '#18181b', color: '#fff' }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#c084fc' }}>{title}</h2>
      <p style={{ color: '#a1a1aa' }}>Compiled completely in-memory using Artemis Engine.</p>
      <button
        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', background: '#9333ea', color: '#fff', border: 'none', cursor: 'pointer' }}
        onClick={() => setCount((c) => c + 1)}
      >
        Increment: {count}
      </button>
    </div>
  );
}
`;

export function Demo() {
  // Step 1: Compile the TSX code in-memory (< 15ms)
  const { code, externalDeps } = compile(samplePluginCode);

  console.log('Compiled Bundle Code:', code);
  console.log('Detected External Dependencies:', externalDeps);

  // Step 2: Render dynamically with ArtemisHost
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Artemis Engine Demo</h1>
      <ArtemisHost
        code={code}
        props={{ title: 'Live AI Generated Widget', initialValue: 42 }}
        scope={{ React }}
        fallback={<div>Loading component...</div>}
      />
    </div>
  );
}
