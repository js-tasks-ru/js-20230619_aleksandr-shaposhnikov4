/**limit
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial stringing
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new stringing without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }

  if (size === undefined) {
    return string;
  }
    
  let result = '';
  let count = 0;
  let prevChar = '';
  
  for (const char of string) {
    
    if (char !== prevChar) {
      count = 1;
      result += char;
    } else {
      count++;
      if (count <= size) {
        result += char;
      }
    }
  
    prevChar = char;
  }
  
  return result;
}