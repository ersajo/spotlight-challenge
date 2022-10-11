import { Waveform } from '@uiball/loaders'
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <h1 className="text-3xl font-bold underline text-red-500">
          Hello world!
        </h1>
        <Waveform color='white' speed={2}/>
      </header>
    </div>
  );
}

export default App;
