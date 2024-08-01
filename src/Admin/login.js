import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { useNavigate } from 'react-router-dom';
import heart from '../images/heart.jpg';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher.js';

function Login() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en'; 
  const isRtl = i18n.language === 'he';
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
  
      const userDoc = await getDoc(doc(db, "users", user.email));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "volunteer") {
          navigate('/VolunteerMain', { state: { userId: user.email } });
        } else if (userData.role === "admin") {
          navigate('/AdminMain', { state: { userId: String(user.superAdmin) } });
        } else {
          setMessage(t("loginVolunteer.loginFailed")); 
        }
      } else {
        setMessage(t("loginVolunteer.loginFailed")); 
      }
    } catch (error) {
      setMessage(t("loginVolunteer.loginFailed")); 
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setResetMessage(t("loginVolunteer.enterEmail")); 
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(t("loginVolunteer.resetEmailSent")); 
    } catch (error) {
      setResetMessage(t("loginVolunteer.resetEmailFailed")); 
    }
  };

  return (
    <div className="login">
      <LanguageSwitcher />
      <div className="container mt-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-6 col-lg-4">
            <h2 className="text-center mb-4">{t("loginVolunteer.title")}</h2> 
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">{t("loginVolunteer.emailLabel")}</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder={t("loginVolunteer.emailPlaceholder")} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">{t("loginVolunteer.passwordLabel")}</label> 
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder={t("loginVolunteer.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <button type="submit" className="btn btn-custom w-100 mb-3">{t("loginVolunteer.loginButton")}</button> 
            </form>
            {message && <div className="alert alert-custom">{message}</div>}
            <button onClick={handleResetPassword} className="btn btn-secondary w-100 forget-password-btn">{t("loginVolunteer.forgotPassword")}</button> 
            {resetMessage && <div className="alert alert-info mt-3">{resetMessage}</div>}
          </div>
          <div className="col-md-6 col-lg-4 text-center">
            <div className="image-container">
              <img src={heart} alt={t("loginVolunteer.heartImageAlt")} className="heart-image" /> 
              <div className="overlay">
                <div className="overlay-text">
                  <h1>{t("loginVolunteer.visionTitle")}</h1> 
                  {t("loginVolunteer.visionText")}
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
