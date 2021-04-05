import React, { useState, useEffect } from 'react';
import { getVaxAppointments } from '../actions';
import Clinic from '../components/Clinic';

import './Home.scss';

function RhodeIsland() {
  const [vaxAppointments, setVaxAppointments] = useState(null);

  useEffect(() => {
    getVaxAppointments('ri').then((vaxResults) => {
      if (vaxResults) {
        setVaxAppointments(vaxResults.filter(Boolean));
      }
    });
  }, []);

  let clinics = 'Loading';

  if (vaxAppointments && vaxAppointments.length) {
    clinics = vaxAppointments.map((clinic, index) => (
      <Clinic {...clinic} key={(clinic && clinic.name) || index} />
    ));
  } else if (vaxAppointments) {
    clinics = 'No appointments found';
  }

  return <div className="home">{clinics}</div>;
}

export default RhodeIsland;
