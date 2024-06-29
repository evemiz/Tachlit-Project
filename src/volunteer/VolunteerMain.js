import React from 'react';
import CloseRequest from '../Messages/CloseRequest';
import { Link, useNavigate } from "react-router-dom";



function VolunteerMain() {
  return (
    <div>
      <h1>דף ראשי מתנדב</h1>
      <button>
        <Link to="/CloseRequest">Go to CloseRequest</Link>
      </button>
      <button>
        <Link to="/GetFeedback">Go to GetFeedback</Link>
      </button>
      <button>
        <Link to="/ViewRequest">Go to ViewRequest</Link>
      </button>
    </div>
  );
}

export default VolunteerMain;
