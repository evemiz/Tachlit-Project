import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import logo from '../images/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar({ handleLogout, openPasswordReset, openAddAdmin }) {
    const location = useLocation();
    const [flash, setFlash] = useState(false);

    const handleLogoClick = () => {
      if (location.pathname === "/AdminMain") {
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
        
        // Force page reload
        window.location.reload();
      }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className={`navbar-brand ${flash ? 'flash' : ''}`}>
                <img
                    src={logo}
                    alt="Logo"
                    className="logo-image"
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer', maxHeight: '50px' }}
                />
            </div>

            <div className="collapse navbar-collapse justify-content-end">
                <div className="navbar-buttons ml-auto">
                    <button className="btn btn-custom mx-2" onClick={openPasswordReset}>שנה סיסמא</button>
                    <button className="btn btn-custom mx-2" onClick={openAddAdmin}>הוסף מנהל חדש</button>
                    <button className="btn btn-custom mx-2" onClick={handleLogout}>התנתק</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
