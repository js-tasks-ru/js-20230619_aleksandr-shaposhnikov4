/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const clone = {};
  
  for (let key in obj) {
    if (!fields.includes(key)) {
      clone[key] = obj[key];
    }
  }
     
  return clone; 
};
