import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * Transforms local relative imports (`./foo`, `../bar`) into `__artemis_require__` calls.
 */
export const localImportsPass: TransformPass = {
  name: 'local-imports',
  visitor: {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      // Skip type-only imports
      if (path.node.importKind === 'type' || path.node.importKind === 'typeof') {
        path.remove();
        return;
      }

      if (!source.startsWith('./') && !source.startsWith('../')) return;

      const requireCall = t.callExpression(t.identifier('__artemis_require__'), [
        t.stringLiteral(source),
      ]);

      const specifiers = path.node.specifiers;
      if (specifiers.length === 0) {
        path.replaceWith(t.expressionStatement(requireCall));
        return;
      }

      const defaultSpec = specifiers.find((s) => t.isImportDefaultSpecifier(s)) as
        | t.ImportDefaultSpecifier
        | undefined;
      const nsSpec = specifiers.find((s) => t.isImportNamespaceSpecifier(s)) as
        | t.ImportNamespaceSpecifier
        | undefined;
      const namedSpecs = specifiers.filter((s) => t.isImportSpecifier(s)) as t.ImportSpecifier[];

      if (nsSpec) {
        path.replaceWith(
          t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(nsSpec.local.name), requireCall),
          ])
        );
      } else {
        const declarations: t.VariableDeclarator[] = [];
        if (defaultSpec) {
          const memberExpr = t.memberExpression(requireCall, t.identifier('default'));
          declarations.push(
            t.variableDeclarator(t.identifier(defaultSpec.local.name), memberExpr)
          );
        }
        if (namedSpecs.length > 0) {
          const props = namedSpecs.map((s) => {
            const importedName = t.isIdentifier(s.imported) ? s.imported.name : s.imported.value;
            return t.objectProperty(
              t.identifier(importedName),
              t.identifier(s.local.name),
              false,
              true
            );
          });
          declarations.push(t.variableDeclarator(t.objectPattern(props), requireCall));
        }
        path.replaceWith(t.variableDeclaration('const', declarations));
      }
    },
  },
};
