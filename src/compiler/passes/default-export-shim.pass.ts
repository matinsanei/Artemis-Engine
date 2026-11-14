import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * Ensures compatibility with legacy components that assign to `defaultExport = ...`.
 * Converts `defaultExport = X` to `module.exports = { default: X }`.
 */
export const defaultExportShimPass: TransformPass = {
  name: 'default-export-shim',
  visitor: {
    Program: {
      exit(path) {
        let hasModuleExports = false;

        path.traverse({
          ExpressionStatement(innerPath) {
            const expr = innerPath.node.expression;
            if (
              t.isAssignmentExpression(expr) &&
              t.isMemberExpression(expr.left) &&
              t.isIdentifier(expr.left.object, { name: 'module' }) &&
              t.isIdentifier(expr.left.property, { name: 'exports' })
            ) {
              hasModuleExports = true;
              innerPath.stop();
            }
          },
        });

        if (hasModuleExports) return;

        path.traverse({
          ExpressionStatement(innerPath) {
            const expr = innerPath.node.expression;
            if (
              t.isAssignmentExpression(expr) &&
              t.isIdentifier(expr.left, { name: 'defaultExport' })
            ) {
              innerPath.replaceWith(
                t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(t.identifier('module'), t.identifier('exports')),
                    t.objectExpression([
                      t.objectProperty(t.identifier('default'), expr.right),
                    ])
                  )
                )
              );
              innerPath.skip();
            }
          },
        });
      },
    },
  },
};
