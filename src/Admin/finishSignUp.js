import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function FinishSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromURL = urlParams.get('email');
      console.log('Email from URL:', emailFromURL);

      if (!storedEmail && emailFromURL) {
        storedEmail = emailFromURL;
      }

      if (!storedEmail) {
        storedEmail = window.prompt('אנא הזן את האימייל שלך להשלמת ההרשמה');
      }

      console.log('Stored email before setting state:', storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    console.log('Email loaded in component state:', email);
  }, [email]);

  const handleFinishSignUp = (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if(!passwordRegex.test(password)){
      setMessage("הסיסמה חייבת להיות באורך של לפחות 8 תווים ולכלול אותיות ומספרים.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("הסיסמאות אינן תואמות.");
      return;
    }

    signInWithEmailLink(auth, email, window.location.href)
      .then((result) => {
        const user = result.user;
        updatePassword(user, password)
          .then(() => {
            setMessage("הסיסמה הוגדרה בהצלחה.");

            navigate('/');
          })
          .catch((error) => {
            console.error("Error setting password:", error);
            setMessage("שגיאה בהגדרת הסיסמה.");
          });
      })
      .catch((error) => {
        console.error("Error signing in with email link:", error);
        setMessage("שגיאה בהשלמת ההרשמה. המשתמש כבר קיים במערכת.");
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleFinishSignUp}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="rtl"
          disabled
        />
        <input
          type="password"
          placeholder="סיסמה חדשה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="rtl"
        />
        <input
          type="password"
          placeholder="הקש שוב את סיסמתך"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          dir="rtl"
        />
        <button type="submit">הגדר סיסמה</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default FinishSignUp;
