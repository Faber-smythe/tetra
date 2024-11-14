import React from 'react';
import logo from './logo.svg';
import './reset.css'
import './App.css';
import GameController from './components/GameController'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="./" element={<GameController debug />} />
      </Routes>
    </Router>

  );
}

export default App;
