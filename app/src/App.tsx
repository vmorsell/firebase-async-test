import React from 'react';
import logo from './logo.svg';
import { Image } from './image';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
      </header>
      <main>
        <div className="form">
          <input type="text" placeholder="Image URL" />
          <input type="button" value="Add" />
        </div>
        <div className="images"></div>
      </main>
    </div>
  );
}

export default App;
