import type { TransformPass } from '../types';
import * as t from '@babel/types';
import { transformChildren } from '../helpers/transform-children';

const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Transforms JSX elements into standard React.createElement calls.
 * Handles element tags, member expressions, attributes, and children.
 */
export const jsxElementPass: TransformPass = {
  name: 'jsx-element',
  visitor: {
    JSXElement(path) {
      const opening = path.node.openingElement;
      const tagName = opening.name;

      let tagExpr: t.Expression;
      if (t.isJSXIdentifier(tagName)) {
        if (/^[a-z]/.test(tagName.name)) {
          tagExpr = t.stringLiteral(tagName.name);
        } else {
          tagExpr = t.identifier(tagName.name);
        }
      } else if (t.isJSXMemberExpression(tagName)) {
        const objName = (tagName.object as t.JSXIdentifier).name;
        const propName = (tagName.property as t.JSXIdentifier).name;
        tagExpr = t.memberExpression(t.identifier(objName), t.identifier(propName));
      } else {
        tagExpr = t.identifier('undefined');
      }

      const attrs = opening.attributes || [];
      const props: (t.ObjectProperty | t.SpreadElement)[] = [];

      attrs.forEach((attr) => {
        if (t.isJSXAttribute(attr)) {
          const name = (attr.name as t.JSXIdentifier).name;
          let value: t.Expression;
          if (attr.value === null) {
            value = t.booleanLiteral(true);
          } else if (t.isJSXExpressionContainer(attr.value)) {
            value = attr.value.expression as t.Expression;
          } else if (t.isStringLiteral(attr.value)) {
            const rawText = attr.value.value;
            const cleaned = rawText.replace(/\s+/g, ' ').trim();
            value = t.stringLiteral(cleaned);
          } else {
            value = t.nullLiteral();
          }

          const key = isValidIdentifier.test(name)
            ? t.identifier(name)
            : t.stringLiteral(name);
          props.push(t.objectProperty(key, value));
        } else if (t.isJSXSpreadAttribute(attr)) {
          props.push(t.spreadElement(attr.argument));
        }
      });

      const childElements = transformChildren(path.node.children);
      const callArgs: t.Expression[] = [tagExpr, t.objectExpression(props)];

      if (childElements.length > 0) {
        callArgs.push(...childElements);
      }

      path.replaceWith(
        t.callExpression(
          t.memberExpression(t.identifier('React'), t.identifier('createElement')),
          callArgs
        )
      );
    },
  },
};
