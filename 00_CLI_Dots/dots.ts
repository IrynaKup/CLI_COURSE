// @ts-check

/** 
 * @param {string} str
 * @returns {string[]}
*/
function pointsBinaryFunction(str) {
     if (str.length <= 1) return [str];
    
    const combinations = 2 ** (str.length - 1);
    const result = [];
    
    for (let i = 0; i < combinations; i++) {
        const mask = i.toString(2).padStart(str.length - 1, '0');
        let current = '';
        
        for (let j = 0; j < str.length; j++) {
            current += str[j];
            if (j < str.length - 1 && mask[j] === '1') {
                current += '.';
            }
        }
        result.push(current);
    }
    
    return result;
}

console.log(pointsBinaryFunction('abc'));
console.log(pointsBinaryFunction('abcd'));