/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const clone = {};
  
  for (let key in obj) {
    if (fields.includes(key)) {
      clone[key] = obj[key];
    }
  }
   
  return clone; 
};
