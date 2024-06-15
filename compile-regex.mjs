// This function takes the alang format source code it converts it to valid JSON.
// Then it parses the JSON and returns it.
export function compileRegex(string)
{
  let output;

  // Transform opening square brackets into [ "data",
  const openingBracketRegex = /\[/g;
  output = string.replaceAll(openingBracketRegex, "[ data ");

  // get rid of parentheses
  const openingParenthesesRegex = /\(/g;
  output = output.replaceAll(openingParenthesesRegex, "[");
  const closingParenthesesRegex = /\)/g;
  output = output.replaceAll(closingParenthesesRegex, "]");

  // Wrap words in double quotes.
  const wordRegex = /([^\s_\[\],]+)/g;
  output = output.replaceAll(wordRegex, "\"$1\",");

  // Add commas after ending brackets.
  const endingBracketRegex = /\]/g;
  output = output.replaceAll(endingBracketRegex, "],");

  // Remove some ending commas that JSON doesn't like.
  const endingCommaRegex = /,(\s*[\]])/g;
  output = output.replaceAll(endingCommaRegex, "$1");

  // Remove quotes around words that start with an underscore (to allow for numbers).
  const underscoreWords = /_"([^\s_\[\],]+)"/g;
  output = output.replaceAll(underscoreWords, "$1");

  // Remove the comma at the end of the string.
  output = output.slice(0, -1);

  // Wrap all the datas in a doThings expression so that the programmer doesn't have to do it.
  output = `["doThings",${output}]`;

  return JSON.parse(output);
}