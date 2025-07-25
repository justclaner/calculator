import React from 'react'
import {Routes, Route} from 'react-router-dom';
import Evaluator from "./components/Evaluator.jsx"

const App = () => {
  return (
    <Routes>
      <Route path='/evaluator' element={<Evaluator />} />
    </Routes>
  )
}

export default App