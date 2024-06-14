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
  "function": function(args)
  {
    const body = `executeArray(${JSON.stringify(args[1])})`;
    return new Function(args[0], body);
  },
  "doThings": function(args)
  {
    for (const array of args)
    {
      executeArray(array);
    }
  }
};

function executeArray(array)
{
  if (!Array.isArray(array)) return array;
  for (let i = 0; i < array.length; i++)
  {
    const item = array[i];
    if (Array.isArray(item))
    {
      if (item[0] === "array")
      {
        item.shift();
        for (const subArrayItem of item)
          if (Array.isArray(subArrayItem)) 
            executeArray(subArrayItem);
      }
      else
      {
        array[i] = executeArray(item);
      }
    }
  }

  const [first, ...others] = array;
  if (first === "array") return array;
  else return builtins[first](others);

};

const sourceCode = await fs.readFile("source-code.alang", "utf-8");

const json = compileRegex(sourceCode);

executeArray(json);