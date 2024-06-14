// This function takes the alang format source code it converts it to valid JSON.
// Then it parses the JSON and returns it.
export function compileRegex(string)
{
  let output;

  // Wrap words in double quotes.
  const wordRegex = /([^\s_\[\],]+)/g;
  output = string.replaceAll(wordRegex, "\"$1\",");

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

  // Wrap all the arrays in a doThings expression so that the programmer doesn't have to do it.
  output = `["doThings",${output}]`;

  return JSON.parse(output);
}