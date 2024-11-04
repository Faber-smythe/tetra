import React from 'react';
import logo from './logo.svg';
import './reset.css'
import './App.css';
import GameController from './components/GameController'

function App() {
  return (
    <div className="App">
      <GameController debug />
    </div>
  );
}

export default App;
