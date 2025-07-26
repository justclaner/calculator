import {useState, useEffect, useRef} from 'react'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { isNumber, isOperator, higherOrSamePrecedence, isFunction, isConstant, convertToRPN, evaluateRPN } from '../logic';

const Evaluator = () => {
    const [rawInput, setRawInput] = useState("")
    const [latex, setLatex] = useState("")
    const [result, setResult] = useState(null);
    const regex = /[a-zA-Z0-9()^*\/\-+!π.,]/g
    const inputRef = useRef(null)

    const handleInput = (e) => {
        console.log(e.target.value);
        const str = e.target.value.match(regex)?.join('');
        if (str == null) {
            setRawInput("");
            return;
        }
        //check for pi
        let filteredStr = "";

        const cursorPos = e.target.selectionStart;
        let piFoundBeforeCursor = 0;
        
        for (let i = 0; i < str.length; i++) {
            if (i < str.length - 1 && str[i] == 'p' && str[i + 1] == 'i') {
                filteredStr += "π"
                if (i + 1 < cursorPos) {
                    piFoundBeforeCursor += 1;
                }
                i++;
            } else {
                filteredStr += str[i];
            }
        }
        setRawInput(filteredStr);

        setTimeout(() => {
            if (inputRef.current) {
                const newPos = cursorPos - piFoundBeforeCursor;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
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

    useEffect(() => {
        if (rawInput == "") {
            setResult(null);
            return;
        }

        try {
            const tokenList = convertToRPN(rawInput)
            setResult(evaluateRPN(tokenList))
        } catch(e) {
            console.log(e)
            setResult(null);
        }
    }, [rawInput])

  return (
    <div className='flex flex-col gap-2 items-center w-full'>
        <div className="text-5xl text-center mt-2">Expression Evaluator</div>
        <input type="text" 
        tabIndex={0}
            ref={inputRef}
            className="w-[80%] h-[60px] text-3xl border-2 border-black px-2 py-1" 
            value={rawInput} 
            placeholder='Type Here...'
            onChange={handleInput} />
        <div className="text-3xl">{result}</div>
    </div>
  )
}

export default Evaluator