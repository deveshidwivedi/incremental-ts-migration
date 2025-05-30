type EvalResult = {
  result: any;
  error: boolean;
};

function __makeEvaluateExpression(
  evalInClosure: (expr: string) => EvalResult
): (expr: string) => EvalResult {
  return (expr: string) => evalInClosure(`${expr}`);
}

function evaluateExpression(): (expr: string) => EvalResult {
  return __makeEvaluateExpression((expr: string) => {
    let newExpr = expr;
    let result: any = null;
    let error = false;
    try {
      try {
        const wrapped = `(${expr})`;
        // eslint-disable-next-line no-new-func
        const validate = new Function(wrapped);
        newExpr = wrapped;
      } catch (e) {
        // We shouldn't wrap the expression
      }
      // eslint-disable-next-line no-eval
      result = (0, eval)(newExpr);
    } catch (e: any) {
      result = `${e.name}: ${e.message}`;
      error = true;
    }
    return { result, error };
  });
}

export default evaluateExpression();
