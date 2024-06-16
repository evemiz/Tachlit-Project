// AdminMain.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

function AdminMain() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="App">
      <h1>דף מנהל</h1>
      <button>
        <Link to="/Lists">Go to Lists</Link>
      </button>
      <button>
        <Link to="/SignUp">Go to SignUp</Link>
      </button>
      <button onClick={handleLogout}>התנתקות</button>
    </div>
  );
}

export default AdminMain;
