import {useState, useEffect, useRef} from 'react'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { convertToRPN, evaluateRPN, postfixToLatex } from '../logic';

const Evaluator = () => {
    const [rawInput, setRawInput] = useState("")
    const [latex, setLatex] = useState("")
    const [result, setResult] = useState(null);
    const regex = /[a-zA-Z0-9()^*\/\-+!π., ]/g
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

    useEffect(() => {
        if (rawInput == "") {
            setResult(null);
            setLatex("");
            return;
        }

        try {
            const tokenList = convertToRPN(rawInput);
            setResult(evaluateRPN(tokenList));
            setLatex(postfixToLatex(tokenList));
        } catch(e) {
            console.log(e)
            setResult(NaN);
            setLatex("");
        }
    }, [rawInput])

    useEffect(() => {
        console.log(result)
        console.log(isNaN(result))
    }, [result])

  return (
    <div className='flex flex-col gap-3 items-center w-full'>
        <div className="text-5xl text-center my-2">Expression Evaluator</div>
        <input type="text" 
        tabIndex={0}
            ref={inputRef}
            className="w-[80%] h-[60px] text-3xl border-2 border-black px-2 py-1" 
            value={rawInput} 
            placeholder='Type Here...'
            onChange={handleInput} />
        <div className="text-3xl min-h-[48px] w-fit border-2 border-black px-2 py-1"
        style={{borderWidth: latex ? `2px` : `0px`}}>
            <InlineMath math={latex}/>
        </div>
        <div className="text-3xl">{isNaN(result) ? `undefined` : result}</div>
    </div>
  )
}

export default Evaluator