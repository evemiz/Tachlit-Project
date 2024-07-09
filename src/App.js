import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import VolunteerForm from './Forms/Volunteers/Form';
import RequestForm from './Forms/AidRequests/Form';
import AdminMain from './Admin/AdminMain';
import Lists from './Admin/Lists';
import Login from './Admin/login';
import SignUpNewAdmin from './Admin/SignUpNewAdmin';
import FinishSignUp from './Admin/finishSignUp';
import ViewRequest from './Messages/ViewRequest';
import ThankYouPage from './Messages/ThankYou';
import ThanksFeedback from './Messages/ThanksFeedback';
import RequestInProcessPage from './Messages/RequestInProcess';
import CloseRequest from './Messages/CloseRequest';
import WrongPage from './Messages/Wrong';
import GetFeedback from './Messages/GetFeedback';
import VolunteerFeedback from './Messages/VolunteerFeadback';
import VerificationPhone from './Messages/PhoneVerification';
import LoginVolunteer from './volunteer/VolunteerLogIn';
import VolunteerMain from './volunteer/VolunteerMain';
import SignUpVol from './Forms/Volunteers/SignUpNewVolunteer';
import '@fontsource/rubik';
import './App.css'; // ייבוא של קובץ ה-CSS
import './styles.css';
import logo from './images/logo.png';
import image1 from './images/image1.jpg'

const Home = () => (
  <div>
    <img
          src={image1}
          alt="image1"
          className="image1"
          style={{ cursor: 'pointer' }}
        />
  </div>
);

const Navigation = () => (
  <nav className='navbarVol'>
          <div className={'navbar-logo'}>
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="navbar-links">
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
        <Route path="/Lists" element={<Lists />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUpNewAdmin />} />
        <Route path="/finishSignUp" element={<FinishSignUp />} />
        <Route path="/ViewRequest" element={<ViewRequest />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        <Route path="/RequestInProcessPage" element={<RequestInProcessPage />} />
        <Route path="/CloseRequest" element={<CloseRequest />} />
        <Route path="/WrongPage" element={<WrongPage />} />
        <Route path="/GetFeedback" element={<GetFeedback />} />
        <Route path="/ThanksFeedback" element={<ThanksFeedback />} />
        <Route path="/VolunteerFeedback" element={<VolunteerFeedback />} />
        <Route path="/VerificationPhone" element={<VerificationPhone />} />
        <Route path="/LoginVolunteer" element={<LoginVolunteer />} />
        <Route path="/VolunteerMain" element={<VolunteerMain />} />
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