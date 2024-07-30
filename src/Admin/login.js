import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Import db from firebaseConfig
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from 'react-router-dom';
import heart from '../images/heart.jpg'

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user document from Firestore
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          navigate('/AdminMain');
        } else {
          setMessage("הנך בכניסת מנהל ");
        }
      } else {
        setMessage("ההתחברות נכשלה. אנא בדוק את פרטי ההתחברות שלך ונסה שוב.");
      }
    } catch (error) {
      setMessage("שם משתמש או סיסמה שגויים ");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setResetMessage("אנא הכנס את כתובת הדוא\"ל שלך כדי לאפס את הסיסמה.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("אימייל לאיפוס סיסמה נשלח. אנא בדוק את תיבת הדואר הנכנס שלך.");
    } catch (error) {
      setResetMessage("שליחת אימייל לאיפוס סיסמה נכשלה. אנא נסה שוב.");
    }
  };

  return (
    <div className="login">
        <div className="container mt-5">
        <div className="row justify-content-center align-items-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="text-center mb-4">התחברות</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">שם משתמש</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder='הכנס את כתובת הדוא"ל שלך'
                value={email}
                autoComplete="email"

                onChange={(e) => setEmail(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">סיסמה</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder='הכנס את הסיסמה שלך'
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="rtl"
              />
            </div>
            <button type="submit" className="btn btn-custom w-100 mb-3">התחבר</button>
          </form>
          {message && <div className="alert alert-custom">{message}</div>}
          <button onClick={handleResetPassword} className="btn btn-secondary w-100 forget-password-btn">שכחת סיסמה?</button>
          {resetMessage && <div className="alert alert-info mt-3">{resetMessage}</div>}
        </div>
        <div className="col-md-6 col-lg-4 text-center">
        <div className="image-container">
        <img src={heart} alt="heart" className="heart-image" />
          <div className="overlay">
                <div className="overlay-text">
                  <h1>התכלית שלנו</h1>
                  החזון שלנו הוא להמשיך להרחיב את פעילותינו ולתת מענה לכל מי
                   שיזדקק לדבר בסיסי וטריוויאלי כל כך כמו מזון.
                </div>
              </div>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;
