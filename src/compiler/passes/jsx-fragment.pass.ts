import type { TransformPass } from '../types';
import * as t from '@babel/types';
import { transformChildren } from '../helpers/transform-children';

/**
 * Transforms `<>...</>` JSX Fragments into `React.createElement(React.Fragment, null, ...)`.
 */
export const jsxFragmentPass: TransformPass = {
  name: 'jsx-fragment',
  visitor: {
    JSXFragment(path) {
      const childElements = transformChildren(path.node.children);
      path.replaceWith(
        t.callExpression(
          t.memberExpression(t.identifier('React'), t.identifier('createElement')),
          [
            t.memberExpression(t.identifier('React'), t.identifier('Fragment')),
            t.nullLiteral(),
            ...childElements,
          ]
        )
      );
    },
  },
};
