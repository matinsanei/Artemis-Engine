import _traverse from '@babel/traverse';
import type * as t from '@babel/types';
import { parseCode } from './parser';
import { generateBundle } from './generator';
import type { TransformPass, CompileOptions, CompileResult } from './types';

import { externalImportsPass } from './passes/external-imports.pass';
import { reactHooksShimPass } from './passes/react-hooks-shim.pass';
import { extractExternalDepsPass } from './passes/extract-external-deps.pass';
import { localImportsPass } from './passes/local-imports.pass';
import { stripTypesPass } from './passes/strip-types.pass';
import { jsxElementPass } from './passes/jsx-element.pass';
import { jsxFragmentPass } from './passes/jsx-fragment.pass';
import { exportDefaultPass } from './passes/export-default.pass';
import { namedExportsPass } from './passes/named-exports.pass';
import { templateLiteralsPass } from './passes/template-literals.pass';
import { defaultExportShimPass } from './passes/default-export-shim.pass';

const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as typeof _traverse;

/**
 * Artemis AST Transformation Pipeline.
 * Orchestrates all passes in the strict deterministic order required for safe execution.
 */
export class TransformPipeline {
  private passes: TransformPass[];

  constructor(customPasses: TransformPass[] = [], autoShimHooks = true) {
    this.passes = [
      externalImportsPass,
      ...(autoShimHooks ? [reactHooksShimPass] : []),
      extractExternalDepsPass,
      localImportsPass,
      stripTypesPass,
      jsxElementPass,
      jsxFragmentPass,
      exportDefaultPass,
      namedExportsPass,
      templateLiteralsPass,
      defaultExportShimPass,
      ...customPasses,
    ];
  }

  public apply(ast: t.File, state: any = {}): t.File {
    for (const pass of this.passes) {
      traverse(ast, pass.visitor, undefined, state);
    }
    return ast;
  }
}

/**
 * Compiles raw React / TypeScript source code in-memory into a self-contained executable bundle.
 *
 * @param code - Raw JSX / TSX source code string
 * @param options - Optional compiler configuration
 * @returns Executable code string and detected external dependencies
 */
export function compile(code: string, options: CompileOptions = {}): CompileResult {
  const { entryId = './main', autoShimHooks = true, customPasses = [] } = options;

  const { ast } = parseCode(code, entryId);
  const pipeline = new TransformPipeline(customPasses, autoShimHooks);
  const transformState: { externalDeps: string[] } = { externalDeps: [] };

  const transformedAst = pipeline.apply(ast, transformState);

  const modules = new Map<string, { ast: t.File; id: string }>();
  modules.set(entryId, { ast: transformedAst, id: entryId });

  const finalCode = generateBundle(modules, entryId);

  return {
    code: finalCode,
    externalDeps: transformState.externalDeps,
  };
}

export const compilePlugin = compile;
