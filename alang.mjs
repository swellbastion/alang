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
};

const executeList = function(list)
{
  for (let i = 0; i < list.length; i++)
    if (Array.isArray(list[i]))
      list[i] = executeList(list[i]);
  const [first, ...others] = list;
  return builtins[first](others);
};

const sourceCode = await fs.readFile("source-code.alang", "utf-8");

const json = compileRegex(sourceCode);

// console.log(json);

console.log(executeList(json));