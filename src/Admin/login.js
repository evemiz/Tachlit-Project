// import React, { useState } from "react";
// import { auth, db } from "../firebaseConfig"; // Import db from firebaseConfig
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
// import { useNavigate } from 'react-router-dom';

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [resetMessage, setResetMessage] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Fetch the user document from Firestore
//       const userDoc = await getDoc(doc(db, "users", email));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         if (userData.role === "admin") {
//           navigate('/AdminMain');
//         } else {
//           setMessage("הנך בכניסת מנהל ");
//         }
//       } else {
//         setMessage("No user data found. Please contact support.");
//       }
//     } catch (error) {
//       console.error("Error logging in user:", error.code, error.message);
//       setMessage("שם משתמש או סיסמה שגויים ");
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!email) {
//       setResetMessage("Please enter your email to reset password.");
//       return;
//     }
//     try {
//       await sendPasswordResetEmail(auth, email);
//       setResetMessage("Password reset email sent. Please check your inbox.");
//     } catch (error) {
//       console.error("Error sending password reset email:", error.code, error.message);
//       setResetMessage("Failed to send password reset email. Please try again.");
//     }
//   };

//   return (
//     <div className="LogInModel">
//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="שם משתמש"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           dir="rtl"
//         />
//         <input
//           type="password"
//           placeholder="סיסמה"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           dir="rtl"
//         />
//         <button type="submit">התחבר</button>
//       </form>
//       {message && <p>{message}</p>}
//       <button onClick={handleResetPassword}>שכחת סיסמה?</button>
//       {resetMessage && <p>{resetMessage}</p>}
//     </div>
//   );
// }

// export default Login;









// import React, { useState } from "react";
// import { auth, db } from "../firebaseConfig"; // Import db from firebaseConfig
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
// import { useNavigate } from 'react-router-dom';

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [resetMessage, setResetMessage] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Fetch the user document from Firestore
//       const userDoc = await getDoc(doc(db, "users", email));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         if (userData.role === "admin") {
//           navigate('/AdminMain');
//         } else {
//           setMessage("הנך בכניסת מנהל ");
//         }
//       } else {
//         setMessage("No user data found. Please contact support.");
//       }
//     } catch (error) {
//       console.error("Error logging in user:", error.code, error.message);
//       setMessage("שם משתמש או סיסמה שגויים ");
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!email) {
//       setResetMessage("Please enter your email to reset password.");
//       return;
//     }
//     try {
//       await sendPasswordResetEmail(auth, email);
//       setResetMessage("Password reset email sent. Please check your inbox.");
//     } catch (error) {
//       console.error("Error sending password reset email:", error.code, error.message);
//       setResetMessage("Failed to send password reset email. Please try again.");
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6 col-lg-4">
//           <h2 className="text-center mb-4">התחברות</h2>
//           <form onSubmit={handleLogin}>
//             <div className="mb-3">
//               <label htmlFor="email" className="form-label">שם משתמש</label>
//               <input
//                 type="email"
//                 className="form-control"
//                 id="email"
//                 placeholder='הכנס את כתובת הדוא"ל שלך'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 dir="rtl"
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="password" className="form-label">סיסמה</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 id="password"
//                 placeholder='הכנס את הסיסמה שלך'
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 dir="rtl"
//               />
//             </div>
//             <button type="submit" className="btn btn-primary w-100 mb-3">התחבר</button>
//           </form>
//           {message && <div className="alert alert-info">{message}</div>}
//           <button onClick={handleResetPassword} className="btn btn-secondary w-100">שכחת סיסמה?</button>
//           {resetMessage && <div className="alert alert-info mt-3">{resetMessage}</div>}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Import db from firebaseConfig
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from 'react-router-dom';

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
        setMessage("No user data found. Please contact support.");
      }
    } catch (error) {
      console.error("Error logging in user:", error.code, error.message);
      setMessage("שם משתמש או סיסמה שגויים ");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setResetMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error.code, error.message);
      setResetMessage("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="rtl"
              />
            </div>
            <button type="submit" className="btn btn-custom w-100 mb-3">התחבר</button>
          </form>
          {message && <div className="alert alert-custom">{message}</div>}
          <button onClick={handleResetPassword} className="btn btn-secondary w-100">שכחת סיסמה?</button>
          {resetMessage && <div className="alert alert-info mt-3">{resetMessage}</div>}
        </div>
      </div>
    </div>
  );
}

export default Login;
