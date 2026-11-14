import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * Transforms named export declarations (`export const foo = ...`, `export function bar() ...`)
 * into standard CommonJS assignments on `module.exports`.
 */
export const namedExportsPass: TransformPass = {
  name: 'named-exports',
  visitor: {
    Program(path) {
      const namedExportBindings: t.ObjectProperty[] = [];

      // Process all ExportNamedDeclaration nodes
      path.traverse({
        ExportNamedDeclaration(innerPath) {
          if (innerPath.node.declaration) {
            const decl = innerPath.node.declaration;
            if (t.isVariableDeclaration(decl)) {
              for (const declarator of decl.declarations) {
                if (t.isIdentifier(declarator.id)) {
                  const name = declarator.id.name;
                  namedExportBindings.push(
                    t.objectProperty(t.identifier(name), t.identifier(name), false, true)
                  );
                }
              }
              innerPath.replaceWith(decl);
            } else if (t.isFunctionDeclaration(decl) && decl.id) {
              namedExportBindings.push(
                t.objectProperty(
                  t.identifier(decl.id.name),
                  t.identifier(decl.id.name),
                  false,
                  true
                )
              );
              innerPath.replaceWith(decl);
            } else if (t.isClassDeclaration(decl) && decl.id) {
              namedExportBindings.push(
                t.objectProperty(
                  t.identifier(decl.id.name),
                  t.identifier(decl.id.name),
                  false,
                  true
                )
              );
              innerPath.replaceWith(decl);
            } else {
              innerPath.replaceWith(decl as any);
            }
          } else if (innerPath.node.specifiers.length > 0) {
            // Remove `export { X, Y }` statements since identifiers are already in scope
            innerPath.remove();
          }
        },
      });

      if (namedExportBindings.length === 0) return;

      // Check whether module.exports assignment already exists
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

      if (hasModuleExports) {
        // If module.exports exists, append individual property assignments
        namedExportBindings.forEach((binding) => {
          const propName = (binding.key as t.Identifier).name;
          path.node.body.push(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(
                  t.memberExpression(t.identifier('module'), t.identifier('exports')),
                  t.identifier(propName)
                ),
                t.identifier(propName)
              )
            )
          );
        });
        return;
      }

      // Create final assignment: module.exports = { name1, name2, ... }
      const exportStatement = t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('module'), t.identifier('exports')),
          t.objectExpression(namedExportBindings)
        )
      );

      path.node.body.push(exportStatement);
    },
  },
};
