import React from 'react'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const App = () => {
  return (
    <div>
      <div className="text-3xl">
        <InlineMath math="\frac{2}{3}x^2"/>
      </div>
    </div>
  )
}

export default App