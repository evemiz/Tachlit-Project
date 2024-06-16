import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import VolunteerForm from './Forms/Volunteers/Form';
import RequestForm from './Forms/AidRequests/Form';
import AdminMain from './Admin/AdminMain';
import Lists from './Admin/Lists';
import Login from './Admin/login';
import SignUp from './Admin/SignUpNewAdmin';
import ViewRequest from './Messages/ViewRequest';
import ThankYouPage from './Messages/ThankYou';
import ThanksFeedback from './Messages/ThanksFeedback';
import RequestInProcessPage from './Messages/RequestInProcess';
import CloseRequest from './Messages/CloseRequest';
import WrongPage from './Messages/Wrong';
import GetFeedback from './Messages/GetFeedback';
import VolunteerFeedback from './Messages/VolunteerFeadback';
import VerificationPhone from './Messages/PhoneVerification';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <button>
            <Link to="/VolunteerForm">Go to Volunteer Form</Link>
          </button>
          <button>
            <Link to="/RequestForm">Go to Aid Request Form</Link>
          </button>
          <button>
            <Link to="/AdminMain">Go to AdminMain</Link>
          </button>
          <button>
            <Link to="/Lists">Go to Lists</Link>
          </button>
          <button>
            <Link to="/Login">Go to Login</Link>
          </button>
          <button>
            <Link to="/SignUp">Go to SignUp</Link>
          </button>
          <button>
            <Link to="/ViewRequest">Go to ViewRequest</Link>
          </button>
          <button>
            <Link to="/CloseRequest">Go to CloseRequest</Link>
          </button>
          <button>
            <Link to="/GetFeedback">Go to GetFeedback</Link>
          </button>
        </nav>
        <Routes>
          <Route path="/VolunteerForm" element={<VolunteerForm />} />
          <Route path="/RequestForm" element={<RequestForm />} />
          <Route path="/AdminMain" element={<AdminMain />} />
          <Route path="/Lists" element={<Lists />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/ViewRequest" element={<ViewRequest />} />
          <Route path="/thankyou" element={<ThankYouPage />} />
          <Route path="/RequestInProcessPage" element={<RequestInProcessPage />} />
          <Route path="/CloseRequest" element={<CloseRequest />} />
          <Route path="/WrongPage" element={<WrongPage />} />
          <Route path="/GetFeedback" element={<GetFeedback />} />
          <Route path="/ThanksFeedback" element={<ThanksFeedback />} />
          <Route path="/VolunteerFeedback" element={<VolunteerFeedback />} />
          <Route path="/VerificationPhone" element={<VerificationPhone />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

const Home = () => (
  <div>
    <h1>Welcome to the App</h1>
    <p>Select an option from above to navigate</p>
  </div>
);

export default App;
