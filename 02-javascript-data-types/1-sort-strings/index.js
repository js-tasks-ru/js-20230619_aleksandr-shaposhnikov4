/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let arrToSort = [...arr];
  
  arrToSort.sort((a, b) => param === 'asc' ? compareFunc(a, b) : compareFunc(b, a));

  return arrToSort;
}

function compareFunc(a, b, param) {
  
  if (a.toLowerCase() === b.toLowerCase()) {
    return a.localeCompare(b, 'ru', {caseFirst: "upper"});
  } else {
    return a.localeCompare(b, 'ru', {sensitivity: 'base'});
  }
}