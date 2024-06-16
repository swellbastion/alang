const fs = await import("node:fs/promises");
const { compileRegex } = await import("./compile-regex.mjs")

class CodeArray
{
  constructor(array)
  {
    this.array = array;
  }
}

// Functions that come built in to the language.
// More can be added at runtime.
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
    return args[0].apply(args[0], args.slice(1));
  },
  "defineFunction": function(args)
  {
    const argumentNames = arrayToCodeRecursive(args[0]);
    let expressions = args.slice(1);
    expressions = arrayToCodeRecursive(expressions);
    let doThingsExpression = ["doThings"].concat(expressions);
    // doThingsExpression = markFunctionArguments(doThingsExpression);
    const penguinRegex = /"🐧(.*)"/g;
    const doThingsExpressionString = JSON.stringify(doThingsExpression)
      .replaceAll(penguinRegex, "$1");
    let context = "[";
    for (let i = 0; i < argumentNames.length; i++)
    {
      context += `["${argumentNames[i]}", ${argumentNames[i]}]`;
    }
    context += "]";
    const body = `alangEval(${doThingsExpressionString}, ${context});`;
    return new Function(argumentNames, body);
  },
  "doThings": function(expressions, variables)
  {
    const codified = expressions.map(markDataAsCode);
    const evaluated = codified.map(expression => alangEval(expression, variables));
    return evaluated[evaluated.length - 1];
  },
  "enterDebugger": function(args, context)
  {
    debugger;
  },
  "getArgument": function(args, context)
  {
    return context.find((item) => item[0] === args[0])[1];
  },
  "setArgument": function(args)
  {
    const [key, value] = args;
    const item = context.find((item) => item[0] === key);
    item[1] = value;
  },
  "registerWord": function(args)
  {
    const [word, func] = args;
    builtins[word] = func;
  },
  "getWord": function(args)
  {
    return builtins[args[0]];
  },
  "set": function(args, variables)
  {
    const [settings, code] = args;
    const added = [];
    for (let i = 0; i < settings.length;) 
    {
      added.push(settings[i])
      variables.unshift({[settings[i]]: settings[i + 1]});
      i += 2;
    }

    const returnValue = builtins.doThings(code, variables);

    for (const name of added)
    {
      const index = variables.findIndex(v => Object.hasOwn(name));
      variables.splice(index, 1);
    }

    return returnValue;
  },
  "get": function(args, variables)
  {
    const name = args[0];
    return variables.find(v => Object.hasOwn(v, name))[name];
  },
};

// The eval function for the language. 
// The expression parameter is a javascript array. 
// It is on the global object so that it's accessible by 
// javascript which is parsed in the future.
global.alangEval = function(expression, variables)
{
  if (expression instanceof CodeArray)
  {
    expression.array = expression.array.map(v => alangEval(v, variables))
    const [builtinName, ...parameters] = expression.array;
    return builtins[builtinName](parameters, variables);
  }

  return expression;

};

function differentiateCodeAndData(expression)
{
  if (!Array.isArray(expression)) return expression;
  expression = expression.map(differentiateCodeAndData);
  if (expression[0] === "data") return expression.slice(1);
  else return new CodeArray(expression);
}

function markDataAsCode(data)
{
  return new CodeArray(data);
}

const sourceCode = await fs.readFile("source-code.alang", "utf-8");

const json = compileRegex(sourceCode);

const differentiated = differentiateCodeAndData(json);

console.log(alangEval(differentiated, []));