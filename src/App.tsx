import { useState } from 'react';
import './register';
import { ExtensionSlot } from './packages/ExtensionSlot';
import './App.css'
import { getExtensionInternalStore } from './packages/store';


function App() {
  const [count, setCount ] = useState(42);
  const store = getExtensionInternalStore();
  console.log('store:', store?.getState()); 
  return (
    <div>
      <p>App</p>
      <header>
        <ExtensionSlot name="header-slot" moduleName="app" />
      </header>
      <main>
        <ExtensionSlot 
          name="content-slot" 
          moduleName="app" 
          state={{ count: count }}
        />
        <button className='border p-2' onClick={() => setCount((c) => c+1)}>Increase</button>
      </main>
    </div>
  );
}

export default App
