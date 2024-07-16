import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { sendSignInLinkToEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import './SignUp.css'; // Ensure you import the CSS file

function SignUp() {
  const [email, setEmail] = useState("");
  const [superAdmin, setSuperAdmin] = useState(false);
  const [message, setMessage] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage("האימייל שהוזן אינו תקין");
      return;
    }

    const actionCodeSettings = {
      url: 'http://localhost:3000/finishSignUp', // Adjust the URL as needed
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);

      // Assign admin role in Firestore
      const userRef = doc(db, 'users', email);
      await setDoc(userRef, { role: 'admin', superAdmin: superAdmin });

      setMessage(".קישור להגדרת סיסמה נשלח לאימייל של המנהל החדש");
      setEmail("");
      setSuperAdmin(false);
    } catch (error) {
      const errorMessage = error.message;
      console.error("Error sending sign-in link:", error);
      setMessage(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="rtl"
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={superAdmin}
            onChange={(e) => setSuperAdmin(e.target.checked)}
            id="superAdmin"
          />
          <label htmlFor="superAdmin">סופר אדמין</label>
        </div>
        <button type="submit">הוספת מנהל חדש</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;


// import React, { useState } from "react";
// import { auth, db } from "../firebaseConfig";
// import { sendSignInLinkToEmail } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";

// function SignUpNewAdmin({ closeModal }) {
//   const [email, setEmail] = useState("");
//   const [superAdmin, setSuperAdmin] = useState(false);
//   const [message, setMessage] = useState("");

//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     if (!validateEmail(email)) {
//       setMessage("האימייל שהוזן אינו תקין");
//       return;
//     }

//     const actionCodeSettings = {
//       url: 'http://localhost:3000/finishSignUp', // Adjust the URL as needed
//       handleCodeInApp: true,
//     };

//     try {
//       await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//       window.localStorage.setItem('emailForSignIn', email);

//       // Assign admin role in Firestore
//       const userRef = doc(db, 'users', email);
//       await setDoc(userRef, { role: 'admin', superAdmin: superAdmin });

//       setMessage(".קישור להגדרת סיסמה נשלח לאימייל של המנהל החדש");
//       setEmail("");
//       setSuperAdmin(false);
//     } catch (error) {
//       const errorMessage = error.message;
//       console.error("Error sending sign-in link:", error);
//       setMessage(`Error: ${errorMessage}`);
//     }
//   };

//   return (
//     <div className="App">
//       <form onSubmit={handleSignUp}>
//         <input
//           type="email"
//           placeholder="אימייל"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           dir="rtl"
//         />
//         <div className="checkbox-container">
//           <input
//             type="checkbox"
//             checked={superAdmin}
//             onChange={(e) => setSuperAdmin(e.target.checked)}
//             id="superAdmin"
//           />
//           <label htmlFor="superAdmin">סופר אדמין</label>
//         </div>
//         <button type="submit">הוספת מנהל חדש</button>
//       </form>
//       {message && <p>{message}</p>}
//       <button onClick={closeModal} className="btn btn-secondary w-100">סגור</button>
//     </div>
//   );
// }

// export default SignUpNewAdmin;
