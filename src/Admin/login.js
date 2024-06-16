import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate('/AdminMain');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error logging in user:", errorCode, errorMessage);
        setMessage("Login failed. Please check your credentials and try again.");
      });

  };

  return (
    <div className="App">
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

export default Login;
