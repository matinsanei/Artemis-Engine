/**
 * Artemis Engine
 * In-memory React/TSX compiler & runtime for dynamic plugins, AI-generated components,
 * and zero-build microfrontends.
 */

// Compiler API
export { compile, compilePlugin, TransformPipeline } from './compiler/pipeline';
export { parseCode } from './compiler/parser';
export { generateBundle } from './compiler/generator';
export type {
  TransformPass,
  TransformContext,
  DependencyInfo,
  CompileOptions,
  CompileResult,
} from './compiler/types';

// Runtime API
export { ArtemisHost, type ArtemisHostProps, extractComponent } from './runtime';
