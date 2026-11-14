import * as t from '@babel/types';

/**
 * Transforms an array of JSX children into an array of plain Babel expressions
 * suitable for React.createElement arguments.
 */
export function transformChildren(children: any[]): t.Expression[] {
  return children
    .map((child) => {
      if (t.isJSXText(child)) {
        const text = child.value.replace(/\s+/g, ' ').trim();
        return text ? t.stringLiteral(text) : t.nullLiteral();
      }
      if (t.isJSXExpressionContainer(child)) {
        const expr = child.expression;
        if (t.isJSXEmptyExpression(expr)) return t.nullLiteral();
        return expr as t.Expression;
      }
      if (t.isJSXElement(child) || t.isJSXFragment(child)) {
        return child as unknown as t.Expression;
      }
      if (t.isJSXSpreadChild(child)) return t.nullLiteral();
      if (t.isExpression(child)) return child;
      return t.nullLiteral();
    })
    .filter((e) => !t.isNullLiteral(e)) as t.Expression[];
}
