import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import VolunteerForm from './Forms/Volunteers/Form';
import RequestForm from './Forms/AidRequests/Form';
import AdminMain from './Admin/AdminMain';
import Login from './Admin/login';
import SignUpNewAdmin from './Admin/SignUpNewAdmin';
import FinishSignUp from './Admin/finishSignUp';
import LoginVolunteer from './volunteer/VolunteerLogIn';
import VolunteerMain from './volunteer/VolunteerMain';
import Statistics from './Admin/Statistics';
import '@fontsource/rubik';
import './styles.css';
import logo from './images/logo.png';

const Home = () => (
  <div>
    {/* Your home page content */}
  </div>
);

const Navigation = () => (
  <nav className='navMain'>
    <div className='mainPageNav'>
      <div className="navbar-buttons">
        <button>
          <Link to="/VolunteerForm">טופס התנדבות</Link>
        </button>

        <button>
          <Link to="/RequestForm">טופס בקשת סיוע</Link>
        </button>

        <button>
          <Link to="/Login">התחבר כמנהל</Link>
        </button>

        <button>
          <Link to="/LoginVolunteer">התחבר כמתנדב</Link>
        </button>
      </div>
      <div className='navbar-logo'>
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          style={{ cursor: 'pointer', marginLeft: 'auto' }}
        />
      </div>
    </div>
  </nav>
);

const App = () => {
  const location = useLocation();

  return (
    <div>
      {location.pathname === '/' && <Navigation />}
      <Routes>
        <Route path="/VolunteerForm" element={<VolunteerForm />} />
        <Route path="/RequestForm" element={<RequestForm />} />
        <Route path="/AdminMain" element={<AdminMain />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUpNewAdmin />} />
        <Route path="/finishSignUp" element={<FinishSignUp />} />
        <Route path="/LoginVolunteer" element={<LoginVolunteer />} />
        <Route path="/VolunteerMain" element={<VolunteerMain />} />
        <Route path="/Statistics" element={<Statistics />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;