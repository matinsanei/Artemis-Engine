import type { Visitor } from '@babel/traverse';
import type * as t from '@babel/types';

/**
 * A transformation pass applied to the AST during compilation.
 */
export interface TransformPass {
  /** Unique pass name used for debugging and diagnostics */
  name: string;
  /** Babel visitor object passed to traverse() */
  visitor: Visitor;
}

/**
 * Contextual metadata provided during transformation.
 */
export interface TransformContext {
  moduleId: string;
  allModuleIds: string[];
  externalDeps?: string[];
  [key: string]: any;
}

/**
 * Parsed dependency information extracted from source code.
 */
export interface DependencyInfo {
  ast: t.File;
  external: {
    source: string;
    specifiers: t.ImportDeclaration['specifiers'];
  }[];
  local: string[];
}

/**
 * Options configuring compilation pipeline.
 */
export interface CompileOptions {
  /** Entry module identifier (defaults to './main') */
  entryId?: string;
  /** Whether to inject React hooks automatically if unbound */
  autoShimHooks?: boolean;
  /** Custom Babel transformation passes to append */
  customPasses?: TransformPass[];
}

/**
 * Result returned after compiling a plugin.
 */
export interface CompileResult {
  /** Self-contained executable JavaScript code */
  code: string;
  /** External dependencies referenced by the component */
  externalDeps: string[];
}
