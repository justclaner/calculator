import React from 'react'
import {Routes, Route} from 'react-router-dom';
import Arithmetic from "./components/Arithmetic.jsx"

const App = () => {
  return (
    <Routes>
      <Route path='/arithmetic' element={<Arithmetic />} />
    </Routes>
  )
}

export default App