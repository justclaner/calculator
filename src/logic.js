export const isNumber = (str) => {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code != 46 && (code < 48 || code > 57)) {
            return false;
        }
    }
    return true;
}

const operators = new Set(['^', '!', '*', '/', '-', '+'])

export const isOperator = (str) => {
    if (str.length > 1) {
        return false;
    }

    return operators.has(str);
}

const precedences = new Map([
  ['^', 4],
  ['!', 3],
  ['*', 2],
  ['/', 2],
  ['+', 1],
  ['-', 1]
])

/* true if operator o2 has a precedence than operator o1 
 * or they have the same precedence but o1 is left-associative
*/
export const higherOrSamePrecedence = (o1, o2) => {
    return precedences.get(o2) >= precedences.get(o1);
}

const functions = new Set([
    "sin", "cos", "tan", "csc", "sec", "cot",
    "arcsin", "arccos", "arccsc", "arcsec", "arccot",
    "sinh", "cosh", "tanh", "csch", "sech", "coth",
    "arcsinh", "arccosh", "arctanh", "arccsch", "arcsech", "arccoth",
    "ln", "log"
]);

export const isFunction = (str) => {
    if (isNumber(str) || isOperator(str)) {
        return false;
    }
    return functions.has(str);
}