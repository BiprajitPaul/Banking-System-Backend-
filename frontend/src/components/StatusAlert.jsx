import React from 'react';
import './StatusAlert.css';

function StatusAlert({ type = 'error', message }) {
  if (!message) {
    return null;
  }

  return <div className={`alert ${type}`}>{message}</div>;
}

export default StatusAlert;