import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [tests, setTests] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // TODO: remove this
  useEffect(() => {
    fetch(`${API_URL}/test`)
      .then(res => res.json())
      .then(data => setTests(data));
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold underline">Todo</h1>
      {/* TODO remove this */}
      {tests.map(test => (
        <div key={test.id}>{test.name}</div>
      ))}
    </>
  )
}

export default App;
