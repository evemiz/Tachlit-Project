import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import logo from '../images/logo.png'

function Navbar({ handleLogout, openEditUser, openChangePasswordModal }) {
    const location = useLocation();
    const [flash, setFlash] = useState(false);
  
    const handleLogoClick = () => {
      if (location.pathname === "/VolunteerMain") {
        setFlash(true);
        setTimeout(() => setFlash(false), 300); 
      }
    };

  return (
    <nav className="navbarVol">

    <div className={`navbar-logo ${flash ? 'flash' : ''}`}>
        <Link to="/VolunteerMain" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>
    </div>

      <div className="navbar-links">
      <button onClick={openEditUser}>עריכת פרופיל</button>
        <button onClick={openChangePasswordModal}>שינוי סיסמה</button>
        <button onClick={handleLogout}>התנתק</button>
      </div>
    </nav>
  );
}

export default Navbar;
