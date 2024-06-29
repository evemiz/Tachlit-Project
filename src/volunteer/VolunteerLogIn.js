import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from 'react-router-dom';

function LoginVolunteer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user role from Firestore
      const userDoc = await getDoc(doc(db, "users",email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
         if (userData.role === "volunteer") {
          navigate('/VolunteerMain');
        } else {
          setMessage("!הנך בכניסת מתנדב");
        }
      } else {
        setMessage("לא נמצא משתמש");
      }
    } catch (error) {
      console.error("Error logging in user:", error.code, error.message);
      setMessage("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="LogInModel">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="שם משתמש"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="rtl"
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="rtl"
        />
        <button type="submit">התחבר</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginVolunteer;
