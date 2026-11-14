# 🏹 Artemis Engine

> **In-memory React/TSX compiler & runtime for dynamic plugins, AI-generated components, and zero-build microfrontends.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-cyan.svg)](https://react.dev/)

---

## ⚡ The Problem: Why Traditional Bundlers Fail at Runtime

Traditional JavaScript bundlers (**esbuild**, **Rollup**, **Webpack**) were designed for **build-time compilation** of static applications. When developing dynamic plugin architectures (such as running user-submitted or AI-generated React/TSX code on-the-fly via `new Function` in the browser or on Edge servers), standard bundlers break down:

- ❌ **The `require()` Trap in esbuild:**  
  When marking dependencies (like `react`) as external, `esbuild` preserves CommonJS `require()` calls or delegates to internal shims. In browser runtimes or ESM contexts, this immediately crashes with:
  ```text
  ReferenceError: require is not defined
  // or
  Error: Dynamic require of "..." is not supported
  ```
- ❌ **The IIFE Wrapper Dilemma in Rollup:**  
  `Rollup` supports global mappings (`output.globals`), but wraps outputs into rigid IIFE formats (`var NAME = (function (...) { ... })(...)`). Attempting to strip these wrappers via regular expressions to produce raw component factories leads to unbalanced parentheses and syntax errors.
- ❌ **Performance Overhead:**  
  Spawning full bundlers in-memory consumes excessive memory and takes hundreds of milliseconds per plugin.

---

## 💡 The Solution: Artemis Engine

**Artemis Engine** solves this by abandoning build-time bundlers in favor of an **in-memory, AST-level transformation pipeline** (powered by Babel):

1. **Direct AST Transformations:** Strips TypeScript annotations and converts JSX to `React.createElement` in a single pass (< 15ms).
2. **Deterministic Dependency Injection:** Rewrites static/dynamic imports into injected host arguments (`__artemis_deps__`) without relying on global scope pollution or runtime `require`.
3. **Safe Execution Boundary:** Wraps components in isolated closures with built-in React Error Boundaries and prop forwarding.

---

## 🚀 Features

- ⚛️ **Modern React/TSX Support:** Native JSX, TypeScript type erasure, and React Fragment handling.
- 🔗 **Zero `require()` Dependency:** Resolves dependencies deterministically without triggering module resolution errors.
- ⚡ **Blazing Fast (< 15ms):** Fully in-memory AST manipulation with zero disk I/O.
- 🛡️ **Safe Scope Execution:** Safely executes components with isolated state and error containment.
- 🤖 **AI-Ready:** Automatically injects missing React hook destructuring for AI-generated code (e.g., bare `useState` without explicit imports).

---

## 📦 Installation

```bash
npm install artemis-engine
# or
pnpm add artemis-engine
```

---

## 💻 Quick Start

### 1. Compile in Memory

```typescript
import { compile } from 'artemis-engine';

const rawPluginCode = `
import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export default function CounterWidget({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  return (
    <div className="p-4 border border-purple-500 rounded-lg">
      <h3>Live Counter</h3>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
`;

// Compile in-memory (< 15ms)
const { code, externalDeps } = compile(rawPluginCode);
```

### 2. Render on Client

```tsx
import React from 'react';
import { ArtemisHost } from 'artemis-engine';

export function App() {
  return (
    <ArtemisHost
      code={code}
      props={{ initialCount: 10 }}
      scope={{ React }}
      fallback={<div>Loading dynamic widget...</div>}
      onError={(err) => console.error('Failed to render:', err)}
    />
  );
}
```

---

## 🛠️ Architecture

```
[Raw TSX / JSX Plugin Code]
            │
            ▼
[TransformPipeline (AST Passes)]
  ├── Strip TypeScript Annotations
  ├── Rewrite External Imports -> Host Arguments
  ├── Transform JSX -> React.createElement
  ├── Auto-shim Unbound React Hooks
  └── Normalize Export Default -> CommonJS Factory
            │
            ▼
[Self-contained JavaScript Factory]
            │
            ▼
[<ArtemisHost /> Execution Environment]
  └── Renders safely within React Error Boundary
```

---

## 📄 License

MIT © [Matin Sanei](https://github.com/matinsanei)
