export function compileRegex(string)
{
  const wordRegex = /([^\s_\[\],]+)/g;
  const endingBracketRegex = /\]/g;
  const endingCommaRegex = /,(\s*[\]])/g;
  const underscoreWords = /_"([^\s_\[\],]+)"/g;
  let output = string.replaceAll(wordRegex, "\"$1\",");
  output = output.replaceAll(endingBracketRegex, "],");
  output = output.replaceAll(endingCommaRegex, "$1");
  output = output.replaceAll(underscoreWords, "$1");
  output = output.slice(0, -1);
  output = `["doThings",${output}]`;
  // console.log(output);
  output = JSON.parse(output);
  // console.log(output);
  return output;
}