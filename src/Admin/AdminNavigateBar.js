import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import logo from '../images/logo.png';

function Navbar({ handleLogout, openPasswordReset }) {
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
    <nav className="navbarVol">
      <div className={`navbar-logo ${flash ? 'flash' : ''}`}>
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div className="navbar-links">
        <button onClick={openPasswordReset}>שנה סיסמא</button>
        <button onClick={handleLogout}>התנתק</button>
      </div>
    </nav>
  );
}

export default Navbar;
