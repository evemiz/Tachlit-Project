


// import React, { useState, useEffect } from "react";
// import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { db } from "../firebaseConfig";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import Modal from 'react-modal';
// import '../custom.css';
// import '../navbar.css'; // ייבוא CSS מותאם אישית
// import Lists from './Lists'; // ייבוא הרכיב להצגת הרשימות
// import { useNavigate } from "react-router-dom";
// import Navbar from "./AdminNavigateBar"; // ייבוא הרכיב של הניווט
// import ListDisplay from '../ListDisplay'; // ייבוא רכיב להצגת הרשימות
// import handleSignUp from './SignUpNewAdmin'

// Modal.setAppElement('#root');

// function AdminMain() {
//   const navigate = useNavigate();
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [volunteersThisMonth, setVolunteersThisMonth] = useState(0);
//   const [totalVolunteers, setTotalVolunteers] = useState(0);
//   const [closedRequestsThisMonth, setClosedRequestsThisMonth] = useState(0);
//   const [openRequests, setOpenRequests] = useState(0);
//   const [inProcessRequests, setInProcessRequests] = useState(0);
//   const [selectedList, setSelectedList] = useState(null); // סטייט להצגת הרשימה הנבחרת

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     console.log("Fetching data...");

//     try {
//       // מתנדבים שנוספו החודש
//       const newVolunteersRef = collection(db, 'NewVolunteers');
//       const newVolunteersSnapshot = await getDocs(newVolunteersRef);
//       setVolunteersThisMonth(newVolunteersSnapshot.size);
//       console.log("New volunteers this month:", newVolunteersSnapshot.size);

//       // סך כל המתנדבים
//       const totalVolunteersRef = collection(db, 'Volunteers');
//       const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
//       setTotalVolunteers(totalVolunteersSnapshot.size);
//       console.log("Total volunteers:", totalVolunteersSnapshot.size);

//       // בקשות שנסגרו החודש
//       const closedRequestsRef = collection(db, 'AidRequests');
//       const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'));
//       const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
//       setClosedRequestsThisMonth(closedRequestsSnapshot.size);
//       console.log("Closed requests this month:", closedRequestsSnapshot.size);

//       // בקשות פתוחות
//       const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
//       const openRequestsSnapshot = await getDocs(openRequestsQuery);
//       setOpenRequests(openRequestsSnapshot.size);
//       console.log("Open requests:", openRequestsSnapshot.size);

//       // בקשות בטיפול
//       const inProcessRequestsQuery = query(closedRequestsRef, where('status', '==', 'in process'));
//       const inProcessRequestsSnapshot = await getDocs(inProcessRequestsQuery);
//       setInProcessRequests(inProcessRequestsSnapshot.size);
//       console.log("In-process requests:", inProcessRequestsSnapshot.size);

//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     }
//   };

//   const handleLogout = () => {
//     signOut(auth)
//       .then(() => {
//         console.log("User logged out");
//         navigate("/login");
//       })
//       .catch((error) => {
//         console.error("Error logging out:", error);
//       });
//   };

//   const openModal = () => {
//     setModalIsOpen(true);
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setEmail("");
//     setOldPassword("");
//     setNewPassword("");
//     setConfirmNewPassword("");
//     setMessage("");
//   };

//   const handleChangePassword = (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmNewPassword) {
//       setMessage(".הסיסמאות אינן תואמות");
//       return;
//     }

//     const user = auth.currentUser;

//     if (user && user.email === email) {
//       const credential = EmailAuthProvider.credential(email, oldPassword);
//       reauthenticateWithCredential(user, credential)
//         .then(() => {
//           updatePassword(user, newPassword)
//             .then(() => {
//               setMessage("הסיסמה שונתה בהצלחה");
//               closeModal();
//             })
//             .catch((error) => {
//               console.error("Error updating password:", error);
//               setMessage("שגיאה בעדכון הסיסמה");
//             });
//         })
//         .catch((error) => {
//           console.error("Error reauthenticating user:", error);
//           setMessage(".שגיאה באימות המשתמש. נא לבדוק את הסיסמה הישנה");
//         });
//     } else {
//       setMessage("האימייל שהוזן אינו תואם את האימייל של המשתמש המחובר");
//     }
//   };

//   return (
//     <div className="AdminMainPage">
//       <div className="navbar-custom">
//       <div className="navbar-logo">
//           <a href="/AdminMain">
//             <img src="/tachlitLOGO.png" alt="Logo" className="navbar-logo" />
//           </a>
//         </div>
//         <div className="navbar-buttons">
//           <button onClick={openModal} className="btn btn-custom">שנה סיסמא</button>
//           <button onClick={handleLogout} className="btn btn-custom">התנתק</button>
//           <button onClick={handleSignUp} className="btn btn-custom">הוספת מנהל חדש</button>

//           {/* <button onClick={handleLogout} className="btn btn-custom">הוספת מנהל חדש</button> */}

//         </div>
        
//       </div>
//       <div className="container">
//         <h1 className="text-center my-4">ברוכים הבאים לדף מנהל</h1>
//         <div className="topBar"></div>

//         {selectedList ? (
//           <ListDisplay collectionName={selectedList.collectionName} status={selectedList.status} />
//         ) : (
//           <div className="dashboard">
//             <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'Volunteers' })}>
//               <h3>מתנדבים ממתינים לאישור</h3>
//               <p>{volunteersThisMonth}</p>
//             </div>
//             <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'Volunteers' })}>
//               <h3>סך כל המתנדבים</h3>
//               <p>{totalVolunteers}</p>
//             </div>
//             <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'close' })}>
//               <h3>בקשות שנסגרו</h3>
//               <p>{closedRequestsThisMonth}</p>
//             </div>
//             <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'open' })}>
//               <h3>בקשות פתוחות</h3>
//               <p>{openRequests}</p>
//             </div>
//             <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'in process' })}>
//               <h3>בקשות בטיפול</h3>
//               <p>{inProcessRequests}</p>
//             </div>
//           </div>
//         )}

//         <Lists /> הצגת רכיב הרשימות ישירות בדף

//         <Modal
//           isOpen={modalIsOpen}
//           onRequestClose={closeModal}
//           contentLabel="Change Password Modal"
//           className={"Modal"}
//         >
//           <h2>שינוי סיסמה</h2>
//           <form onSubmit={handleChangePassword}>
//             <input
//               type="email"
//               className="form-control mb-2"
//               placeholder="אימייל"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               dir="rtl"
//             />
//             <input
//               type="password"
//               className="form-control mb-2"
//               placeholder="סיסמה ישנה"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               dir="rtl"
//             />
//             <input
//               type="password"
//               className="form-control mb-2"
//               placeholder="סיסמה חדשה"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               dir="rtl"
//             />
//             <input
//               type="password"
//               className="form-control mb-2"
//               placeholder="הקש שוב את סיסמתך"
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               dir="rtl"
//             />
//             <button type="submit" className="btn btn-custom w-100 mb-2">שנה סיסמה</button>
//           </form>
//           {message && <p className="alert alert-custom">{message}</p>}
//           <button onClick={closeModal} className="btn btn-secondary w-100">סגור</button>
//         </Modal>
        
//         <div className='pageEnd'>
//           <h2>חזרה לעמוד הבית</h2>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminMain;


import React, { useState, useEffect } from "react";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Modal from 'react-modal';
import '../custom.css';
import '../navbar.css'; // ייבוא CSS מותאם אישית
import Lists from './Lists'; // ייבוא הרכיב להצגת הרשימות
import { useNavigate } from "react-router-dom";
import Navbar from "./AdminNavigateBar"; // ייבוא הרכיב של הניווט
import ListDisplay from '../ListDisplay'; // ייבוא רכיב להצגת הרשימות
import SignUpNewAdmin from './SignUpNewAdmin'; // עדכון לשם נכון

Modal.setAppElement('#root');

function AdminMain() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [volunteersThisMonth, setVolunteersThisMonth] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [closedRequestsThisMonth, setClosedRequestsThisMonth] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [inProcessRequests, setInProcessRequests] = useState(0);
  const [selectedList, setSelectedList] = useState(null); // סטייט להצגת הרשימה הנבחרת

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log("Fetching data...");

    try {
      // מתנדבים שנוספו החודש
      const newVolunteersRef = collection(db, 'NewVolunteers');
      const newVolunteersSnapshot = await getDocs(newVolunteersRef);
      setVolunteersThisMonth(newVolunteersSnapshot.size);
      console.log("New volunteers this month:", newVolunteersSnapshot.size);

      // סך כל המתנדבים
      const totalVolunteersRef = collection(db, 'Volunteers');
      const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
      setTotalVolunteers(totalVolunteersSnapshot.size);
      console.log("Total volunteers:", totalVolunteersSnapshot.size);

      // בקשות שנסגרו החודש
      const closedRequestsRef = collection(db, 'AidRequests');
      const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'));
      const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
      setClosedRequestsThisMonth(closedRequestsSnapshot.size);
      console.log("Closed requests this month:", closedRequestsSnapshot.size);

      // בקשות פתוחות
      const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
      const openRequestsSnapshot = await getDocs(openRequestsQuery);
      setOpenRequests(openRequestsSnapshot.size);
      console.log("Open requests:", openRequestsSnapshot.size);

      // בקשות בטיפול
      const inProcessRequestsQuery = query(closedRequestsRef, where('status', '==', 'in process'));
      const inProcessRequestsSnapshot = await getDocs(inProcessRequestsQuery);
      setInProcessRequests(inProcessRequestsSnapshot.size);
      console.log("In-process requests:", inProcessRequestsSnapshot.size);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

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

  const openSignUpModal = () => {
    setSignUpModalIsOpen(true);
  };

  const closeSignUpModal = () => {
    setSignUpModalIsOpen(false);
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
      <div className="navbar-custom">
        <div className="navbar-logo">
          <a href="/AdminMain">
            <img src="/tachlitLOGO.png" alt="Logo" className="navbar-logo" />
          </a>
        </div>
        <div className="navbar-buttons">
          <button onClick={openModal} className="btn btn-custom">שנה סיסמא</button>
          <button onClick={handleLogout} className="btn btn-custom">התנתק</button>
          <button onClick={openSignUpModal} className="btn btn-custom">הוספת מנהל חדש</button>
        </div>
      </div>
      <div className="container">
        <h1 className="text-center my-4">ברוכים הבאים לדף מנהל</h1>
        <div className="topBar"></div>

        {selectedList ? (
          <ListDisplay collectionName={selectedList.collectionName} status={selectedList.status} />
        ) : (
          <div className="dashboard">
            <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'Volunteers' })}>
              <h3>מתנדבים ממתינים לאישור</h3>
              <p>{volunteersThisMonth}</p>
            </div>
            <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'Volunteers' })}>
              <h3>סך כל המתנדבים</h3>
              <p>{totalVolunteers}</p>
            </div>
            <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'close' })}>
              <h3>בקשות שנסגרו</h3>
              <p>{closedRequestsThisMonth}</p>
            </div>
            <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'open' })}>
              <h3>בקשות פתוחות</h3>
              <p>{openRequests}</p>
            </div>
            <div className="dashboard-item" onClick={() => setSelectedList({ collectionName: 'AidRequests', status: 'in process' })}>
              <h3>בקשות בטיפול</h3>
              <p>{inProcessRequests}</p>
            </div>
          </div>
        )}

        {/* <Lists /> הצגת רכיב הרשימות ישירות בדף */}

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
              className="form-control mb-2"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="סיסמה ישנה"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              dir="rtl"
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              dir="rtl"
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="הקש שוב את סיסמתך"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              dir="rtl"
            />
            <button type="submit" className="btn btn-custom w-100 mb-2">שנה סיסמה</button>
          </form>
          {message && <p className="alert alert-custom">{message}</p>}
          <button onClick={closeModal} className="btn btn-secondary w-100">סגור</button>
        </Modal>
        
        <Modal
          isOpen={signUpModalIsOpen}
          onRequestClose={closeSignUpModal}
          contentLabel="Sign Up New Admin Modal"
          className={"Modal"}
        >
          <SignUpNewAdmin closeModal={closeSignUpModal} />
        </Modal>

        <div className='pageEnd'>
          <h2>חזרה לעמוד הבית</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminMain;
