// import React, { useState } from 'react';
// import { useLocation } from "react-router-dom";
// import logo from '../images/logo.png';

// function Navbar({ handleLogout, openEditUser, openPasswordReset }) {
//     const location = useLocation();
//     const [flash, setFlash] = useState(false);
  
//     const handleLogoClick = () => {
//       if (location.pathname === "/VolunteerMain") {
//         setFlash(true);
//         setTimeout(() => setFlash(false), 300);
        
//         // Force page reload
//         window.location.reload();
//       }
//     };

//   return (
//     <nav className="navbarVol">
//       <div className={`navbar-logo ${flash ? 'flash' : ''}`}>
//         <img
//           src={logo}
//           alt="Logo"
//           className="logo-image"
//           onClick={handleLogoClick}
//           style={{ cursor: 'pointer' }}
//         />
//       </div>

//       <div className="navbar-links">
//         <button onClick={openEditUser}>ערוך פרופיל</button>
//         <button onClick={openPasswordReset}>שנה סיסמא</button>
//         <button onClick={handleLogout}>התנתק</button>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import logo from '../images/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar({ handleLogout, openEditUser, openPasswordReset }) {
    const location = useLocation();
    const [flash, setFlash] = useState(false);
  
    const handleLogoClick = () => {
      if (location.pathname === "/VolunteerMain") {
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
        
        // Force page reload
        window.location.reload();
      }
    };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
      <div className={`navbar-brand ${flash ? 'flash' : ''}`}>
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer', maxHeight: '50px' }}
        />
      </div>

      <div className="collapse navbar-collapse">
        <div className="navbar-buttons ml-auto">
          <button className="btn btn-custom mx-2" onClick={openEditUser}>ערוך פרופיל</button>
          <button className="btn btn-custom mx-2" onClick={openPasswordReset}>שנה סיסמא</button>
          <button className="btn btn-custom mx-2" onClick={handleLogout}>התנתק</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

