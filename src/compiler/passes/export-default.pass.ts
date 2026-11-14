import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * Transforms `export default ...` into `module.exports = { default: ... }`.
 * Enables safe evaluation inside a function scope wrapper.
 */
export const exportDefaultPass: TransformPass = {
  name: 'export-default',
  visitor: {
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      let value: t.Expression;

      if (t.isFunctionDeclaration(decl) || t.isClassDeclaration(decl)) {
        value = t.isFunctionDeclaration(decl)
          ? t.functionExpression(null, decl.params, decl.body)
          : t.classExpression(null, decl.superClass, decl.body, decl.decorators || []);
      } else {
        value = decl as t.Expression;
      }

      path.replaceWith(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier('module'), t.identifier('exports')),
            t.objectExpression([t.objectProperty(t.identifier('default'), value)])
          )
        )
      );
    },
  },
};
