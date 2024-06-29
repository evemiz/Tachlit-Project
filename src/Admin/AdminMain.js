import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Modal from 'react-modal';
import '../styles.css';

Modal.setAppElement('#root');

function AdminMain() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");

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

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage("הסיסמאות אינן תואמות.");
      return;
    }

    const user = auth.currentUser;

    if (user && user.email === email) {
      const credential = EmailAuthProvider.credential(email, oldPassword);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setMessage("הסיסמה שונתה בהצלחה");
              closeModal();
            })
            .catch((error) => {
              console.error("Error updating password:", error);
              setMessage("שגיאה בעדכון הסיסמה");
            });
        })
        .catch((error) => {
          console.error("Error reauthenticating user:", error);
          setMessage("שגיאה באימות המשתמש. נא לבדוק את הסיסמה הישנה.");
        });
    } else {
      setMessage("האימייל שהוזן אינו תואם את האימייל של המשתמש המחובר");
    }
  };

  return (
    <div className="AdminMAinPage">
      <h1> ברוכים הבאים לדף מנהל</h1>
      <adminMainButton>
        <Link to="/Lists">צפיה ברשימות</Link>
      </adminMainButton>
      <adminMainButton>
        <Link to="/SignUp">הוספת מנהל חדש</Link>
      </adminMainButton>
      <adminMainButton onClick={handleLogout}>התנתק</adminMainButton>
      <adminMainButton onClick={openModal}>שינוי סיסמה</adminMainButton>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Change Password Modal"
      >
        <h2>שינוי סיסמה</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="סיסמה ישנה"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="הקש שוב את סיסמתך"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            dir="rtl"
          />
          <button type="submit">שנה סיסמה</button>
        </form>
        {message && <p>{message}</p>}
        <button onClick={closeModal}>סגור</button>
      </Modal>
    </div>
  );
}

export default AdminMain;
