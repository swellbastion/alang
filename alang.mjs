const fs = await import("node:fs/promises");
const { compileRegex } = await import("./compile-regex.mjs")

const builtins =
{
  "globalObject": function()
  {
    return global;
  },
  "getProperty": function(args)
  {
    let thing = args[0];
    for (let i = 1; i < args.length; i++)
      thing = thing[args[i]];
    return thing;
  },
  "setProperty": function(args)
  {
    let path = args.slice(0, -1);
    let value = args[args.length - 1];
    let thing = path[0];
    for (let i = 1; i < path.length - 1; i++)
      thing = thing[path[i]];
    thing[path[path.length - 1]] = value;
  },
  "callFunction": function(args)
  {
    return args[0].apply(null, args.slice(1));
  },
  "defineFunction": function(args)
  {
    let expressions = args.slice(1);
    expressions = arrayToCodeRecursive(expressions);
    let doThingsExpression = ["doThings"].concat(expressions);
    doThingsExpression = markFunctionArguments(doThingsExpression);
    const penguinRegex = /"🐧(.*)"/g;
    const doThingsExpressionString = JSON.stringify(doThingsExpression)
      .replaceAll(penguinRegex, "$1");
    const body = `ALangEval(${doThingsExpressionString})`;
    return new Function(arrayToCodeRecursive(args[0]), body);
  },
  "doThings": function(args)
  {
    for (const array of args)
    {
      ALangEval(array);
    }
  },
  "enterDebugger": function()
  {
    debugger;
  }
};

global.ALangEval = function(expression)
{
  if (!Array.isArray(expression)) return expression;

  for (let i = 0; i < expression.length; i++)
  {
    const listItem = expression[i];
    if (Array.isArray(listItem))
    {
      if (listItem[0] === "array")
      {
        for (const subArrayItem of listItem)
          if (Array.isArray(subArrayItem)) 
            ALangEval(subArrayItem);
      }
      else
      {
        expression[i] = ALangEval(listItem);
      }
    }
  }

  const [first, ...others] = expression;
  if (first === "array") return expression;
  else return builtins[first](others);

};

function arrayToCodeRecursive(value)
{
  let returnValue = value;
  if (Array.isArray(returnValue))
  {
    if (returnValue[0] === "array")
      returnValue = returnValue.slice(1);
    returnValue = returnValue.map(arrayToCodeRecursive);
  }
  return returnValue;
}

function markFunctionArguments(expression)
{
  const penguinEmoji = "🐧";
  let returnValue = expression;
  if (Array.isArray(returnValue))
  {
    if (returnValue[0] === "argument")
    {
      returnValue = returnValue.slice(1);
      returnValue = penguinEmoji + returnValue[0];
      return returnValue;
    }
    returnValue = returnValue.map(markFunctionArguments);
  }
  return returnValue;
}

const sourceCode = await fs.readFile("source-code.alang", "utf-8");

const json = compileRegex(sourceCode);

ALangEval(json);