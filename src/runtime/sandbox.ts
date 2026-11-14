import type { ComponentType } from 'react';

/**
 * Extracts a React component from compiled bundle code by executing it in an isolated function scope.
 *
 * @param code - Compiled JavaScript bundle produced by Artemis compile()
 * @param scope - Runtime variables provided to the component (e.g. React instance, external libraries)
 * @returns Executable React component
 */
export function extractComponent(
  code: string,
  scope: Record<string, any> = {}
): ComponentType<any> {
  const ReactInstance = scope.React || (typeof window !== 'undefined' ? (window as any).React : undefined);
  if (!ReactInstance) {
    throw new Error(
      '[Artemis Runtime] React instance not found in scope. Pass { scope: { React } } to ArtemisHost.'
    );
  }

  const deps = scope.__artemis_deps__ || scope.deps || {};

  // Method 1: Artemis / Challenger module runtime
  if (code.includes('__artemis_require__') || code.includes('__modules__') || code.includes('defaultExport')) {
    const wrapper = new Function('React', '__artemis_deps__', `
      var module = { exports: {} };
      var exports = module.exports;
      var defaultExport;
      ${code}
      return defaultExport || (module.exports && module.exports.default) || module.exports;
    `);

    const result = wrapper(ReactInstance, deps);
    if (typeof result === 'function' || (result && typeof result === 'object')) {
      return result;
    }
  }

  // Method 2: Standard CommonJS fallback
  const cjsWrapper = new Function('React', 'exports', 'module', '__artemis_deps__', `
    ${code}
    return (module.exports && module.exports.default) || module.exports;
  `);

  const mod = { exports: {} };
  const res = cjsWrapper(ReactInstance, mod.exports, mod, deps);
  return res;
}
