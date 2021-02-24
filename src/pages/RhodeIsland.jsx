import React, { useState, useEffect } from 'react';
import { getVaxAppointments } from '../actions';
import Clinic from '../components/Clinic';

import './Home.scss';

function RhodeIsland() {
  const [vaxAppointments, setVaxAppointments] = useState(null);

  useEffect(() => {
    getVaxAppointments('ri').then((vaxResults) => {
      if (vaxResults) {
        setVaxAppointments(vaxResults);
      }
    });
  }, []);

  let clinics = null;

  if (vaxAppointments) {
    clinics = vaxAppointments.map((clinic, index) => (
      <Clinic {...clinic} key={clinic.name || index} />
    ));
  }

  return <div className="home">{clinics || 'Loading'}</div>;
}

export default RhodeIsland;
