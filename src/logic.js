export const isNumber = (str) => {
    for (let i = 0; i < str.length; i++) {
        if (i == 0 && str[0] == '-' && str.length > 1) {
            continue;
        }
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
    "ln", "log", "sqrt", "cbrt", "round", "floor", "ceil", "max", "min", "deg", "rad"
]);

export const isFunction = (str) => {
    return functions.has(str);
}

const constants = new Set([
    "π", "e",
    "\\pi",
])

export const isConstant = (char) => {
    return constants.has(char);
}

//num is assumed to not be a negative integer
export const factorial = (num) => {
    //raminujan's approximation
    let a = Math.sqrt(Math.PI);
    let b = Math.pow(num / Math.E, num);
    let c = Math.pow(
        (8 * Math.pow(num, 3) + 4 * Math.pow(num, 2) + num + 1 / 30),
        1 / 6
    )
    let d = a * b * c;
    return Number.isInteger(num) ? Math.floor(d) : d;
}

export const convertToRPN = (input) => {
    if (input == "") {
        return []
    }
    //filter out spaces
    input = [...input].filter(c => c != ' ').join("").toLowerCase();
    //tokenize first, numbers will be strings too
    let tokens = []
    let j = 0;
    let i = 0;
    while (i < input.length) {
        let code = input.charCodeAt(i);
        if (isConstant(input[i])) {
            if (i > 0 && 
                (input[i - 1] == ')' || isNumber(input[i - 1]) || isConstant(input[i - 1]))
            ) {
                tokens.push('*');
            }
            tokens.push(input[i]);
            j++;
            i++;
        } else if (code >= 97 && code <= 122) {
            //coefficient multiplication operation must be pushed
            if (i > 0 && isNumber(input[i - 1])) {
                tokens.push('*');
            }
            while (i < input.length && input.charCodeAt(i) >= 97 && input.charCodeAt(i) <= 122) {
                i++;
            }
            tokens.push(input.slice(j, i));
            j = i;
            continue;
        } else if (isNumber(input[i])) {
            //check right parenthesis
            if (i > 0 && (input[i - 1] == ')' || isConstant(input[i - 1]))) {
                tokens.push('*');
            }
            while (i < input.length && isNumber(input[i])) {
                i++;
            }
            tokens.push(input.slice(j, i));
            j = i
            continue;
        } else {
            //negative sign either at the start of parenthesis, after operator/function, or at start of entire expression
            if (
                (  
                    (i > 0 && (input[i - 1] == '(' || isOperator(input[i - 1]) || (input.charCodeAt(i - 1) >= 97 && input.charCodeAt(i - 1) <= 122))
                ) || i == 0 //(start of expression)
                ) &&
                i < input.length - 1 && input[i] == '-' && (isNumber(input[i + 1]) || isConstant(input[i + 1]))
            ) {
                i++;
                while (i < input.length && isNumber(input[i])) {
                    i++;
                }
                tokens.push(input.slice(j, i));
                j = i;
                continue;
            }
            //left parenthesis preceded by right parenthesis
            else if (i > 0 && input[i] == '(' && 
                (isNumber(input[i - 1]) || input[i - 1] == ')')
            ) {
                tokens.push('*');
            }

            tokens.push(input[i]);

            //right parenthesis followed by number/constant/function
            if (i < input.length - 1 && input[i] == ')' && (
                isNumber(input[i + 1]) || isConstant(input[i + 1]) || 
                (input.charCodeAt(i + 1) >= 97 && input.charCodeAt(i + 1) <= 122)
            )) {
                tokens.push('*');
            }
            j++;
            i++;
        }
    }
    if (i != j) {
        tokens.push(input.slice(j));
    }

    //shunting-yard algorithm
    let output = []
    let operators = []

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        if (isConstant(token)) {
            switch (token) {
                case 'π':
                    output.push(Math.PI);
                    break;
                case 'e':
                    output.push(Math.E);
                    break;
                default:
                    break;
            }
        } else if (isNumber(token)) { //number
            output.push(parseFloat(token));
        } else if (isFunction(token)) {//function?
            if (isFunction(token)) {
                operators.push(token);
            } else {
                throw Error("NOT A RECOGNIZED FUNCTION!")
            }
        } else if (isOperator(token)) {
            while (operators[operators.length - 1] != '(' && higherOrSamePrecedence(token, operators[operators.length - 1])) {
                output.push(operators.pop());
            }
            operators.push(token);
        } else if (token == ',') {
            while (operators[operators.length - 1] != '(') {
                output.push(operators.pop());
            }
        } else if (token == '(') {
            operators.push(token);
        } else if (token == ')') {
            //starting stack is empty
            if (operators.length == 0) {
                throw Error("Mismatched Parenthesis")
            }
            while (operators[operators.length - 1] != '(')  {
                output.push(operators.pop());
                //stack becomes empty without finding left parenthesis
                if (operators.length == 0) {
                    throw Error("Mismatched Parenthesis")
                }
            }

            //top of stack should have left parenthesis now
            operators.pop()

            //pop function
            if (isFunction(operators[operators.length - 1])) {
                output.push(operators.pop());
            }
        } else {
            throw new Error("Nothing matched token!");
        }
    }

    //pop remaining operators into output stack
    while (operators.length > 0) {
        let operator = operators.pop();
        if (operator == '(') {
            throw Error("Mismatched Parenthesis");
        }
        output.push(operator);
    }

    return output;
}


export const evaluateRPN = (tokens) => {
    let output = []
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (typeof token == "number") {
            output.push(token);
        } else if (isOperator(token)) {
            if (token != '!' && output.length < 2) {
                throw new Error("Not enough number tokens for operations!");
            } else if (output.length < 1) {
                throw new Error("Empty number tokens, can not evaluate factorial!");
            }
            let b = output.pop();
            switch (token) {
                case '^': //exponent
                    output.push(Math.pow(output.pop(), b));
                    break;
                case '!': //factorial
                    if (b < 0) {
                        throw new Error("Can not evaluate a negative factorial (not supported for negative reals)!");
                    }
                    output.push(factorial(b));
                    break;
                case '*':
                    output.push(output.pop() * b);
                    break;
                case '/':
                    output.push(output.pop() / b);
                    break;
                case '+':
                    output.push(output.pop() + b);
                    break;
                case '-':
                    output.push(output.pop() - b);
                    break;
                default:
                    throw new Error("Somehow detected an operator token, but such a token is not recognized as an operation.");
            }
        } else if (isFunction(token)) {
            let num = output.pop();
            switch (token) {
                case 'ln':
                    output.push(Math.log(num));
                    break;
                case 'log':
                    output.push(Math.log10(num));
                    break;
                case 'sqrt':
                    output.push(Math.sqrt(num));
                    break;
                case 'cbrt':
                    output.push(Math.cbrt(num));
                    break;
                case 'round':
                    output.push(Math.floor(num));
                    break;
                case 'floor':
                    output.push(Math.floor(num));
                    break;
                case 'ceil':
                    output.push(Math.ceil(num));
                    break;
                case 'max':
                    output.push(Math.max(output.pop(), num));
                    break;
                case 'min':
                    output.push(Math.min(output.pop(), num));
                    break;
                case 'deg':
                    output.push(num * 180 / Math.PI);
                    break;
                case 'rad':
                    output.push(num * Math.PI / 180);

                //TRIGONOMETRIC FUNCTIONS
                case 'sin':
                    output.push(Math.sin(num));
                    break;
                case 'cos':
                    output.push(Math.cos(num));
                    break;
                case 'tan':
                    output.push(Math.tan(num));
                    break;
                case 'csc':
                    output.push(1 / Math.sin(num));
                    break;
                case 'sec':
                    output.push(1 / Math.cos(num));
                    break;
                case 'cot':
                    output.push(1 / Math.tan(num));
                    break;
                
                //INVERSE TRIGONOMETRIC FUNCTIONS
                case 'arcsin':
                    output.push(Math.asin(num));
                    break;
                case 'arccos':
                    output.push(Math.acos(num));
                    break;
                case 'arctan':
                    output.push(Math.atan(num));
                    break;
                case 'arccsc':
                    output.push(Math.asin(1 / num));
                    break;
                case 'arcsec':
                    output.push(Math.acos(1 / num));
                    break;
                case 'arccot':
                    output.push(Math.atan(1 / num));
                    break;
                
                //HYPERBOLIC TRIGONOMETRIC FUNCTIONS
                case 'sinh':
                    output.push(Math.sinh(num));
                    break;
                case 'cosh':
                    output.push(Math.cosh(num));
                    break;
                case 'tanh':
                    output.push(Math.tanh(num));
                    break;
                case 'csch':
                    output.push(1 / Math.sinh(num));
                    break;
                case 'sech':
                    output.push(1 / Math.cosh(num));
                    break;
                case 'coth':
                    output.push(1 / Math.tanh(num));
                    break;
                
                //INVERSE HYPERBOLIC TRIGONOMETRIC FUNCTIONS
                case 'arcsinh':
                    output.push(Math.asinh(num));
                    break;
                case 'arccosh':
                    output.push(Math.acosh(num));
                    break;
                case 'arctanh':
                    output.push(Math.atanh(num));
                    break;
                case 'arccsch':
                    output.push(Math.asinh(1 / num));
                    break;
                case 'arcsech':
                    output.push(Math.acosh(1 / num));
                    break;
                case 'arccoth':
                    output.push(Math.atanh(1 / num));
                    break;
                default:
                    throw new Error("Somehow detected a function token, but such a token is unrecognized as a function!");
            }
        } else {
            throw new Error("Unrecognized token!");
        }
    }

    if (output.length != 1) {
        throw new Error("Something wen't wrong while evaluating the RPN")
    }
    return output[0];
}

export const parenRequired = (token, operator) => {
    if (typeof token == "number" || isConstant(token)) {
        return false;
    } else if (typeof token == "string") {
        if (token.length > 2 && token[0] == '(' && token[token.length - 1] == ')') {
            return true;
        }
        if (operator == '!' || operator == '^') {
            return true;
        } else if (operator == '*') {
            //only add extra parenthesis if there is addition/subtraction at the outermost level
            let parenCount = 0;
            for (let i = 0; i < token.length; i++) {
                if (token[i] == '(') {
                    parenCount++;
                } else if (token[i] == ')') {
                    parenCount--;
                } else if (parenCount == 0 && (token[i] == '+' || token[i] == '-')) {
                    return true;
                }
            }
        } else {
            //division, addition or subtraction never needs extra parenthesis
            return true;
        }
    }
    return false;
}

export const postfixToLatex = (tokens) => {
    //quick check if it is singleton array with number element
    if (tokens.length == 1) {
        return tokens[0].toString();
    }

    let i = 0;
    while (i < tokens.length) {
        let token = tokens[i];
        //OPERATOR
        if (isOperator(token)) {
            if (token == '!') {
                if (i == 0) {
                    throw new Error("Not enough tokens for factorial!");
                }
                let num = tokens[i - 1];
                //factorial of an expression
                if (parenRequired(num, "!")) {
                    num = "\\left(" + num + "\\right)";
                }
                tokens.splice(i - 1, 2, `${num}!`);
                i--;
            } else {
                if (i < 2) {
                    throw new Error("Not enough tokens for operations!");
                }
                let newExpression = "";
                switch (token) {
                    case '^':
                        let base = tokens[i - 2];
                        let exponent = tokens[i - 1];

                        if (parenRequired(base, "^")) {
                            base = "\\left(" + base + "\\right)";
                        }
                        newExpression = `${base}^{${exponent}}`;
                        //tokens.splice(i - 2, 3, `${base}^{${exponent}}`);
                        break;
                    case '*':
                        let factor1 = tokens[i - 2];
                        let factor2 = tokens[i - 1];
                        let cdotRequired = true;
                        if (parenRequired(factor1, "*")) {
                            factor1 = "\\left(" + factor1 + "\\right)"
                            cdotRequired = false;
                        }
                        if (parenRequired(factor2, "*")) {
                            factor2 = "\\left(" + factor2 + "\\right)";
                            cdotRequired = false;
                        }
                        //check if either factor1 or factor2 is constant/function
                        if (isConstant(factor2) 
                            || factor2.slice(0, 5) == '\\text' 
                            || factor2.slice(0, 5) == '\\sqrt' 
                            || factor2.slice(0, 7) == '\\lfloor'
                            || factor2.slice(0, 6) == '\\lceil'
                        ) {
                            cdotRequired = false;
                        }

                        newExpression = `${factor1}${cdotRequired ? `\\cdot` : ``}${factor2}`;
                        //tokens.splice(i - 2, 3, `${factor1}${cdotRequired ? `\\cdot` : ``}${factor2}`);
                        break;
                    case '/':
                        let numerator = tokens[i - 2];
                        let denominator = tokens[i - 1];
                        newExpression = `\\frac{${numerator}}{${denominator}}`;
                        //tokens.splice(i - 2, 3, `\\frac{${numerator}}{${denominator}}`);
                        break;
                    case '+':
                        let addend1 = tokens[i - 2];
                        let addend2 = tokens[i - 1];
                        newExpression = `${addend1}+${addend2}`;
                        //tokens.splice(i - 2, 3, `${addend1}+${addend2}`);
                        break;
                    case '-':
                        let minuend = tokens[i - 2];
                        let subtrahend = tokens[i - 1];
                        newExpression = `${minuend}-${subtrahend}`;
                        //tokens.splice(i - 2, 3, `${minuend}-${subtrahend}`);
                        break;
                    default:
                        throw new Error("Detected operation, but no such operation exists???");
                }
                //i is initially at operation
                //[token1, token2, operation, ...] --> [token, (something new), (where operation used to exist), ...]
                //index must be shifted back by 2 before being increased
                tokens.splice(i - 2, 3, newExpression);
                i-= 2;
            }
        } else if (isFunction(token)) {
            if (i == 0) {
                throw new Error("Not enough tokens for a function!")
            }
            //multi-argument functions
            if (token == 'max' || token == 'min') {
                if (i < 2) {
                    throw new Error("Not enough tokens for the min/max function (2 required)!");
                }
                let arg1 = tokens[i - 2];
                let arg2 = tokens[i - 1];
                tokens.splice(i - 2, 3, `\\${token}\\left(${arg1},${arg2}\\right)`);
                i-= 2;    //decrease index
            } else {
                //index not required to be decremented
                //one argument functions
                let arg = tokens[i - 1];
                let newExpression = "";
                switch (token) {
                    //functions that have special formatting
                    case 'sqrt':
                        newExpression = `\\sqrt{${arg}}`;
                        break;
                    case 'cbrt':
                        newExpression = `\\sqrt[3]{${arg}}`;
                        break;
                    case 'floor':
                        newExpression = `\\lfloor${arg}\\rfloor`;
                        break;
                    case 'ceil':
                        newExpression = `\\lceil${arg}\\rceil`;
                        break;
                    default:    //simple function formatting
                        if (token.slice(0, 3) == 'arc') {
                            newExpression = `\\text{${token.slice(3)}}^{-1}\\mathopen{}\\left(${arg}\\right)`;
                        } else {
                            newExpression = `\\text{${token}}\\mathopen{}\\left(${arg}\\right)`;
                        }
                }
                tokens.splice(i - 1, 2, newExpression);
                i--;
            }

        } else if (typeof token == "number" || isNumber(token)) {
            if (Math.abs(Math.PI - token) < 0.0000001) {
                tokens[i] = '\\pi';
            } else if (Math.abs(Math.E - token) < 0.0000001) {
                tokens[i] = 'e';
            }
        }
        i++;
    }
    if (tokens.length != 1) {
        throw new Error("Something went wrong while converting from postfix to infix");
    }
    return tokens[0];
}