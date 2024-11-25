import React from 'react';
import logo from './logo.svg';
import './reset.css'
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import GameController from './components/GameController'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameController debug />} />
      </Routes>
    </Router>

  );
}

export default App;
