import _generate from '@babel/generator';
import type * as t from '@babel/types';

const generate = (typeof _generate === 'function' ? _generate : (_generate as any).default) as typeof _generate;

/**
 * Generates self-contained executable JavaScript bundle from AST modules.
 * Includes a lightweight in-memory module registry (`__artemis_require__`).
 */
export function generateBundle(
  modules: Map<string, { ast: t.File; id: string }>,
  entryId = './main'
): string {
  const runtime = `
var __modules__ = {};
var __module_cache__ = {};
var __artemis_require__ = function(path) {
  if (__module_cache__[path]) return __module_cache__[path].exports;
  var mod = { exports: {} };
  __module_cache__[path] = mod;
  if (!__modules__[path]) {
    throw new Error("Module not defined: " + path);
  }
  __modules__[path](mod, mod.exports, __artemis_require__);
  return mod.exports;
};
  `.trim();

  const moduleFactories: string[] = [];
  modules.forEach((mod, id) => {
    const { code } = generate(mod.ast);
    moduleFactories.push(
      `__modules__[${JSON.stringify(id)}] = function(module, exports, __artemis_require__) {\n${code}\n};`
    );
  });

  const mainExecution = `
var __entry_exports__ = __artemis_require__(${JSON.stringify(entryId)});
defaultExport = (__entry_exports__ && __entry_exports__.default) || __entry_exports__;
  `.trim();

  return `
${runtime}

${moduleFactories.join('\n\n')}

${mainExecution}
  `.trim();
}
