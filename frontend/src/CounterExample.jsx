import React from 'react'
import { useCounterStore } from './store'

export default function CounterExample() {
  const { count, increment, decrement, reset } = useCounterStore()
  return (
    <div style={{ textAlign: 'center', margin: 24 }}>
      <h2>Ejemplo Zustand: Contador Global</h2>
      <p style={{ fontSize: 32 }}>{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement} style={{ margin: '0 8px' }}>-1</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
