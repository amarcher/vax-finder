import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import RhodeIsland from './pages/RhodeIsland';
import Disclaimer from './pages/Disclaimer';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <main>
          <Route exact path="/" component={Home} />
          <Route exact path="/rhode-island" component={RhodeIsland} />
          <Route path="/disclaimer" component={Disclaimer} />
        </main>
      </div>
    </Router>
  );
}

export default App;
