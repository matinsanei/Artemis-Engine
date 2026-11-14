import type { TransformPass } from '../types';
import * as t from '@babel/types';

/**
 * Transforms ES6 template literals into standard binary string concatenations (`+`).
 * This prevents syntax issues when executing in older or restricted JS runtimes.
 */
export const templateLiteralsPass: TransformPass = {
  name: 'template-literals',
  visitor: {
    TemplateLiteral(path) {
      // Skip tagged template expressions like styled.div`...`
      if (t.isTaggedTemplateExpression(path.parent)) {
        return;
      }

      const quasis = path.node.quasis;
      const expressions = path.node.expressions;

      if (expressions.length === 0) {
        path.replaceWith(t.stringLiteral(quasis[0].value.raw));
        return;
      }

      let result: t.Expression = t.stringLiteral(quasis[0].value.raw);
      for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        result = t.binaryExpression('+', result, expr as t.Expression);
        if (i + 1 < quasis.length) {
          result = t.binaryExpression(
            '+',
            result,
            t.stringLiteral(quasis[i + 1].value.raw)
          );
        }
      }
      path.replaceWith(result);
    },
  },
};
