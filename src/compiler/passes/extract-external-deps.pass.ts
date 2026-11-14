import * as t from '@babel/types';
import type { TransformPass } from '../types';

const KNOWN_HOST_GLOBALS = new Set(['react', 'react-dom']);

/**
 * Extracts external dependencies and maps them to the runtime `__artemis_deps__` object.
 * Example: `import { motion } from 'framer-motion'` -> `const { motion } = __artemis_deps__["framer-motion"];`
 */
export const extractExternalDepsPass: TransformPass = {
  name: 'extract-external-deps',
  visitor: {
    ImportDeclaration(path, state: any) {
      const source = path.node.source.value;

      // Skip local imports and host globals
      if (source.startsWith('.') || source.startsWith('/') || KNOWN_HOST_GLOBALS.has(source)) {
        return;
      }

      if (!state.externalDeps) {
        state.externalDeps = [];
      }
      if (!state.externalDeps.includes(source)) {
        state.externalDeps.push(source);
      }

      // Handle CSS side-effect imports: `import 'swiper/css';`
      if (path.node.specifiers.length === 0 && source.endsWith('.css')) {
        path.remove();
        return;
      }

      const declarations: t.VariableDeclarator[] = [];
      const depsObject = t.memberExpression(
        t.identifier('__artemis_deps__'),
        t.stringLiteral(source),
        true
      );

      let hasNamespace = false;
      let namespaceId: t.Identifier | null = null;
      let hasDefault = false;
      let defaultId: t.Identifier | null = null;
      const namedImports: t.ObjectProperty[] = [];

      path.node.specifiers.forEach((specifier) => {
        if (t.isImportNamespaceSpecifier(specifier)) {
          hasNamespace = true;
          namespaceId = specifier.local;
        } else if (t.isImportDefaultSpecifier(specifier)) {
          hasDefault = true;
          defaultId = specifier.local;
        } else if (t.isImportSpecifier(specifier)) {
          const importedName = t.isIdentifier(specifier.imported)
            ? specifier.imported.name
            : specifier.imported.value;
          namedImports.push(
            t.objectProperty(
              t.identifier(importedName),
              specifier.local,
              false,
              specifier.local.name === importedName
            )
          );
        }
      });

      if (hasNamespace && namespaceId) {
        declarations.push(t.variableDeclarator(namespaceId, depsObject));
      } else {
        if (hasDefault && defaultId) {
          declarations.push(
            t.variableDeclarator(
              defaultId,
              t.logicalExpression(
                '||',
                t.memberExpression(depsObject, t.identifier('default')),
                depsObject
              )
            )
          );
        }
        if (namedImports.length > 0) {
          declarations.push(
            t.variableDeclarator(t.objectPattern(namedImports), depsObject)
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
