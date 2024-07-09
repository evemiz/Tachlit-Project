import React, { useState, useEffect } from "react";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Modal from 'react-modal';
import '../styles.css';
import Lists from './Lists'; // ייבוא הרכיב להצגת הרשימות
import { useNavigate } from "react-router-dom";
import Navbar from "./AdminNavigateBar";

Modal.setAppElement('#root');

function AdminMain() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [volunteersThisMonth, setVolunteersThisMonth] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [closedRequestsThisMonth, setClosedRequestsThisMonth] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

  // const fetchDashboardData = async () => {
  //   const now = new Date();
  //   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  //   // מתנדבים שנוספו החודש
  //   const newVolunteersRef = collection(db, 'NewVolunteers');
  //   const newVolunteersQuery = query(newVolunteersRef, where('date', '>=', startOfMonth));
  //   const newVolunteersSnapshot = await getDocs(newVolunteersQuery);
  //   setVolunteersThisMonth(newVolunteersSnapshot.size);

  //   // סך כל המתנדבים
  //   const totalVolunteersRef = collection(db, 'Volunteers');
  //   const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
  //   setTotalVolunteers(totalVolunteersSnapshot.size);

  //   // בקשות שנסגרו החודש
  //   const closedRequestsRef = collection(db, 'AidRequests');
  //   const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'), where('date', '>=', startOfMonth));
  //   const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
  //   setClosedRequestsThisMonth(closedRequestsSnapshot.size);

  //   // בקשות פתוחות
  //   const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
  //   const openRequestsSnapshot = await getDocs(openRequestsQuery);
  //   setOpenRequests(openRequestsSnapshot.size);
  // };

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
      setMessage(".הסיסמאות אינן תואמות");
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
          setMessage(".שגיאה באימות המשתמש. נא לבדוק את הסיסמה הישנה");
        });
    } else {
      setMessage("האימייל שהוזן אינו תואם את האימייל של המשתמש המחובר");
    }
  };

  return (
    <div className="AdminMainPage">
      <Navbar handleLogout={handleLogout} openPasswordReset={openModal}/>
      <h1> ברוכים הבאים לדף מנהל</h1>
      <div className="topBar"></div>

      {/* <div className="dashboard">
        <div className="dashboard-item">
          <h3>מתנדבים ממתינים לאישור</h3>
          <p>{volunteersThisMonth}</p>
        </div>
        <div className="dashboard-item">
          <h3>סך כל המתנדבים</h3>
          <p>{totalVolunteers}</p>
        </div>
        <div className="dashboard-item">
          <h3>בקשות שנסגרו </h3>
          <p>{closedRequestsThisMonth}</p>
        </div>
        <div className="dashboard-item">
          <h3>בקשות פתוחות</h3>
          <p>{openRequests}</p>
        </div>
      </div> */}

      <Lists /> {/* הצגת רכיב הרשימות ישירות בדף */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Change Password Modal"
        className={"Modal"}
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
      <div className='pageEnd'>
        <h2> חזרה לעמוד הבית</h2>
    </div>
    </div>
  );
}

export default AdminMain;