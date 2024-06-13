export function compileRegex(string)
{
  const wordRegex = /([^\s\[\],]+)/g;
  const endingBracketRegex = /\]/g;
  const endingCommaRegex = /,(\s*[\]])/g;
  let output = string.replaceAll(wordRegex, "\"$1\",");
  output = output.replaceAll(endingBracketRegex, "],");
  output = output.replaceAll(endingCommaRegex, "$1");
  output = output.slice(0, -1);
  return JSON.parse(output);
}