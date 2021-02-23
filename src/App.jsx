import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Other from './pages/Other';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <main>
          <Route exact path="/" component={Home} />
          <Route path="/other" component={Other} />
        </main>
      </div>
    </Router>
  );
}

export default App;
