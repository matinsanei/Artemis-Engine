import type { TransformPass } from '../types';
import * as t from '@babel/types';

const HOST_GLOBALS: Record<string, string> = {
  'react': 'React',
  'react-dom': 'ReactDOM',
};

/**
 * Maps host imports like 'react' and 'react-dom' directly to host variables.
 * For example: `import { useState } from 'react'` becomes `const { useState } = React;`
 */
export const externalImportsPass: TransformPass = {
  name: 'external-imports',
  visitor: {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (!(source in HOST_GLOBALS)) return;

      const globalName = HOST_GLOBALS[source];
      const specifiers = path.node.specifiers;

      if (specifiers.length === 0) {
        path.remove();
        return;
      }

      const declarations: t.VariableDeclarator[] = [];

      const nsSpec = specifiers.find((s) => t.isImportNamespaceSpecifier(s)) as
        | t.ImportNamespaceSpecifier
        | undefined;

      if (nsSpec) {
        const localName = nsSpec.local.name;
        if (localName !== globalName) {
          declarations.push(
            t.variableDeclarator(t.identifier(localName), t.identifier(globalName))
          );
        }
      } else {
        const defaultSpec = specifiers.find((s) => t.isImportDefaultSpecifier(s)) as
          | t.ImportDefaultSpecifier
          | undefined;
        const namedSpecs = specifiers.filter((s) => t.isImportSpecifier(s)) as t.ImportSpecifier[];

        if (defaultSpec) {
          const localName = defaultSpec.local.name;
          if (localName !== globalName) {
            declarations.push(
              t.variableDeclarator(t.identifier(localName), t.identifier(globalName))
            );
          }
        }

        if (namedSpecs.length > 0) {
          const properties = namedSpecs.map((spec) => {
            const importedName = t.isIdentifier(spec.imported)
              ? spec.imported.name
              : spec.imported.value;
            const localName = spec.local.name;
            return t.objectProperty(
              t.identifier(importedName),
              t.identifier(localName),
              false,
              importedName === localName
            );
          });
          declarations.push(
            t.variableDeclarator(t.objectPattern(properties), t.identifier(globalName))
          );
        }
      }

      if (declarations.length > 0) {
        path.replaceWith(t.variableDeclaration('const', declarations));
      } else {
        path.remove();
      }
    },
  },
};
