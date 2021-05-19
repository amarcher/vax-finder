/* eslint-disable react/prop-types */
import React from 'react';
import classNames from 'classnames';

import './Clinic.scss';

function Clinic({
  name,
  address,
  appointments,
  registrationHref,
  additionalInfo,
}) {
  return (
    <div
      className={classNames('clinic', {
        clinic__available: appointments && appointments !== '0',
      })}
    >
      <div className="clinic__name">{name}</div>
      <div className="clinic__address">{address}</div>
      <div className="clinic__appointments">
        {name?.substring(0, 3) === 'CVS' && appointments > 0
          ? 'Some'
          : appointments}
        <span> Appointment(s) Available</span>
      </div>
      <div className="clinic__additional_info">{additionalInfo}</div>
      {registrationHref && (
        <div>
          <a href={registrationHref}>Schedule Online</a>
        </div>
      )}
    </div>
  );
}

export default Clinic;
