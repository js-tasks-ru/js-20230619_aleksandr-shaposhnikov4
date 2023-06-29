/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrToSort = [...arr];
  
  arrToSort.sort(param === 'asc' ? compareFuncAsc : compareFuncDesc);

  return arrToSort;
}

function compareFuncAsc(a, b) {
  return a.localeCompare(b, 'ru', {caseFirst: "upper"});
}

function compareFuncDesc(a, b) {
  return b.localeCompare(a, 'ru', {caseFirst: "upper"});
}