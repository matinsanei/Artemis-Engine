import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * strip-types: Comprehensive TypeScript erasure pass.
 * Removes all TypeScript annotations, interfaces, types, enums,
 * and assertions so the AST can be executed directly as JavaScript.
 */
export const stripTypesPass: TransformPass = {
  name: 'strip-types',
  visitor: {
    // Declarations and signatures to remove directly
    TSTypeAnnotation(path) { path.remove(); },
    TSPropertySignature(path) { path.remove(); },
    TSMethodSignature(path) { path.remove(); },
    TSDeclareFunction(path) { path.remove(); },
    TSInterfaceDeclaration(path) { path.remove(); },
    TSTypeAliasDeclaration(path) { path.remove(); },
    TSEnumDeclaration(path) { path.remove(); },
    TSModuleDeclaration(path) { path.remove(); },
    TSImportEqualsDeclaration(path) { path.remove(); },
    TSTypeParameterDeclaration(path) { path.remove(); },
    TSTypeParameterInstantiation(path) { path.remove(); },
    TSExportAssignment(path) { path.remove(); },

    // Expression unwrapping
    TSAsExpression(path) {
      path.replaceWith(path.node.expression);
    },
    TSTypeAssertion(path) {
      path.replaceWith(path.node.expression);
    },
    TSNonNullExpression(path) {
      path.replaceWith(path.node.expression);
    },
    TSInstantiationExpression(path) {
      path.replaceWith(path.node.expression);
    },

    // Function parameter normalization
    Function(path) {
      path.node.params.forEach((param) => {
        if (t.isIdentifier(param) && param.optional) {
          param.optional = false;
        }
        if (t.isAssignmentPattern(param) && t.isIdentifier(param.left) && param.left.optional) {
          param.left.optional = false;
        }
      });
      if (path.node.returnType) {
        path.node.returnType = null as any;
      }
      if (path.node.typeParameters) {
        path.node.typeParameters = null as any;
      }
    },

    // Class member normalization
    ClassProperty(path) {
      if (path.node.typeAnnotation) {
        path.node.typeAnnotation = null as any;
      }
    },
    ClassMethod(path) {
      if (path.node.returnType) {
        path.node.returnType = null as any;
      }
    },
  },
};
