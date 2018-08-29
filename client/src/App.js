import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Interface from './Interface'

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Lexical Amplifier!</h1>
        </header>
        <p className="App-intro">
          Came across a word you don't know the meaning of? <b>Lexical Amplifier</b>, powered by Oxford Dictionaries, is here to help you amplify your lexicon! Get started by typing a word you want the definition of in the box below and press your "Enter" key.
        </p>
        <Interface />
      </div>
    );
  }
}

export default App;