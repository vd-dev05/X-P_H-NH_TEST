import { useState } from 'react'
import InputChoice from './components/input_choice'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div
      className='bg-gray-200   rounded-lg shadow-md h-screen flex items-center justify-center'
      >
     <InputChoice />

      </div>
    </>
  )
}

export default App
