import {useState, useEffect} from 'react'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { isNumber, isOperator, higherOrSamePrecedence, isFunction } from '../logic';

const Arithmetic = () => {
    const [rawInput, setRawInput] = useState("")
    const [latex, setLatex] = useState("")
    const regex = /[a-zA-Z0-9()^*\/\-+!]/g
    const legalCharacters = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '^', '(', ')', '!', ' '])

    const handleInput = (e) => {
        setRawInput(e.target.value.match(regex).join(''));
    }

    const parseToLatex = (input) => {
        //detect parenthesis
        let code = ""
        let seenParenthesis = false;
        let firstParenthesis = -1;
        let parenCount = 0
        for (let i = 0; i < input.length; i++) {
            let c = input[i];
            switch (c) {
                case '(':
                    if (!seenParenthesis) {
                        firstParenthesis = i
                    }
                    seenParenthesis = true;
                    parenCount++;
                    break;
                case ')':
                    if (!seenParenthesis) {
                        //incorrect parenthesis
                        return ""
                    }
                    parenCount--
                    if (parenCount == 0) {
                        code += `${parseToLatex(input.slice(firstParenthesis + 1, i + 1))}`
                    }
            }
        }
    }

    const convertToRDN = (input) => {
        //filter out spaces
        input = [...input].filter(c => c != ' ').join("").toLowerCase();

        //tokenize first, numbers will be strings too
        let tokens = []
        let j = 0;
        let i = 0;
        let tokenType = 0;
        while (i < input.length) {
            let code = input.charCodeAt(i);
            if (code >= 97 && code <= 122) {
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
                while (i < input.length && isNumber(input[i])) {
                    i++;
                }
                tokens.push(input.slice(j, i));
                j = i
                continue;
            } else {
                if (i > 0 && input[i] == '(' && 
                    (isNumber(input[i - 1]) || input[i - 1] == ')')
                ) {
                    tokens.push('*');
                }

                tokens.push(input[i]);

                if (i < input.length - 1 && input[i] == ')' && (
                    isNumber(input[i + 1]) || 
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
        console.log("TOKENS", tokens)

        //shunting-yard algorithm
        let output = []
        let operators = []

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i]
            if (isNumber(token)) { //number
                output.push(parseFloat(token));
            } else if (token.charCodeAt(i) >= 97 && token.charCodeAt(i) <= 122) {//function?
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


        console.log(output);
        return output;
    }

    const parseInput = () => {
        
    }

    useEffect(() => {
        try {
            convertToRDN(rawInput)
        } catch(e) {
            console.log(e)
        }
        parseInput();
    }, [rawInput])

  return (
    <div className='flex flex-col items-center w-full'>
        <div className="text-5xl text-center mt-2">Arithmetic Calculator</div>
        <input type="text" 
        tabIndex={0}
            className="w-[80%] h-[60px] text-3xl border-2 border-black px-2 py-1" 
            value={rawInput} 
            placeholder='Type Here...'
            onChange={handleInput} />
    </div>
  )
}

export default Arithmetic