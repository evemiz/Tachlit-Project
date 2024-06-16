import React, { useState } from "react";
import {auth} from "../firebaseConfig"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function SignUp () {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User registered:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error registering user:", errorCode, errorMessage);
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="שם משתמש"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir = "rtl"
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir = "rtl"
        />
        <button type="submit">הוספת מנהל חדש</button>
      </form>
    </div>
  );
}

export default SignUp;
