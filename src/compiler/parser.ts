import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { DependencyInfo } from './types';

const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as typeof _traverse;

const HOST_GLOBALS = new Set(['react', 'react-dom']);

/**
 * Parses React TypeScript/JavaScript source code into an AST and collects dependency metadata.
 */
export function parseCode(code: string, filePath?: string): DependencyInfo {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const external: DependencyInfo['external'] = [];
    const local: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (HOST_GLOBALS.has(source) || (!source.startsWith('.') && !source.startsWith('/'))) {
          external.push({
            source,
            specifiers: path.node.specifiers,
          });
        } else if (source.startsWith('./') || source.startsWith('../')) {
          local.push(source);
        }
      },
    });

    return { ast, external, local };
  } catch (err: any) {
    throw new Error(`Parsing failed for ${filePath || 'code'}: ${err.message}`);
  }
}
