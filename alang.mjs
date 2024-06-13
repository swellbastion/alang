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
    for (let i = 1; i < path.length; i++)
      thing = thing[path[i]];
    thing = value;
  },
  "call": function(args)
  {
    args[0].apply(null, args.slice(1));
  },
  "function": function(args)
  {
    const body = `executeList(${JSON.stringify(args[1])})`;
    return new Function(args[0], body);
  },
  "doThings": function(args)
  {
    for (const list of args[0]) executeList(list);
  }
};

function executeList(list)
{
  for (let i = 0; i < list.length; i++)
  {
    if (Array.isArray(list[i]))
    {
      if (list[i][0] === "list")
      {
        list[i] = list[i].slice(1);
      }
      else
      {
        list[i] = executeList(list[i]);
      }
    }
  }
  const [first, ...others] = list;
  return builtins[first](others);
};

const sourceCode = await fs.readFile("source-code.alang", "utf-8");

const json = compileRegex(sourceCode);

executeList(json);