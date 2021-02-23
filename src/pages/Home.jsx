import React, { useState, useEffect } from 'react';
import { getVaxAppointments } from '../actions';

import './Home.scss';

function Home() {
  const [vaxAppointments, setVaxAppointments] = useState(null);

  useEffect(() => {
    getVaxAppointments(setVaxAppointments).then((vaxResults) => {
      if (vaxResults) {
        setVaxAppointments(JSON.stringify(vaxResults));
      }
    });
  }, []);

  return <div className="home">{vaxAppointments || 'Loading'}</div>;
}

export default Home;
