import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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

      <div className="navbar-buttons">
        <button className='btn' onClick={openEditUser}>ערוך פרופיל</button>
        <button className='btn' onClick={openPasswordReset}>שנה סיסמא</button>
        <button className='btn-logout' onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
        </div>
    </nav>
  );
}

export default Navbar;
