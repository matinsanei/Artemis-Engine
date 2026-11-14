import type { TransformPass } from '../types';
import * as t from '@babel/types';

// Standard React hooks supported in modern React runtimes
const REACT_HOOKS = new Set([
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'useLayoutEffect',
  'useId',
  'useTransition',
  'useDeferredValue',
  'useSyncExternalStore',
  'useInsertionEffect',
  'useImperativeHandle',
  'useOptimistic',
  'useActionState',
]);

/**
 * Injects destructuring for unbound React hooks (e.g., bare `useState` without explicit import).
 * Prepends: `const { useState, useMemo } = React;`
 */
export const reactHooksShimPass: TransformPass = {
  name: 'react-hooks-shim',
  visitor: {
    Program: {
      exit(programPath) {
        const missing = new Set<string>();
        programPath.traverse({
          Identifier(idPath) {
            const name = idPath.node.name;
            if (!REACT_HOOKS.has(name)) return;

            const parent = idPath.parentPath;
            if (parent.isMemberExpression() && parent.node.property === idPath.node && !parent.node.computed) return;
            if (parent.isObjectProperty() && !parent.node.computed && parent.node.key === idPath.node) return;
            if (parent.isJSXAttribute()) return;
            if (parent.isTypeAlias?.() || parent.isTSTypeReference?.()) return;
            if (idPath.scope.hasBinding(name)) return;

            missing.add(name);
          },
        });

        if (missing.size === 0) return;

        const names = [...missing].sort();
        const props = names.map((n) =>
          t.objectProperty(t.identifier(n), t.identifier(n), false, true)
        );

        programPath.node.body.unshift(
          t.variableDeclaration('const', [
            t.variableDeclarator(t.objectPattern(props), t.identifier('React')),
          ])
        );
      },
    },
  },
};
