
// import React, { useState } from "react";
// import { auth } from "../firebaseConfig";
// import { sendSignInLinkToEmail } from "firebase/auth";

// function SignUp() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   const handleSignUp = (e) => {
//     e.preventDefault();
//     if (!validateEmail(email)) {
//       setMessage("האימייל שהוזן אינו תקין");
//       return;
//     }

//     const actionCodeSettings = {
//       url: 'http://localhost:3000/finishSignUp', // כתובת ה-URL שתחזיר את המשתמש לאחר ההגדרה
//       handleCodeInApp: true,
//     };

//     sendSignInLinkToEmail(auth, email, actionCodeSettings)
//       .then(() => {
//         window.localStorage.setItem('emailForSignIn', email);
//         setMessage("קישור להגדרת סיסמה נשלח לאימייל של המנהל החדש.");
//         setEmail("");
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         console.error("Error sending sign-in link:", errorCode, errorMessage);
//         setMessage(`Error: ${errorMessage}`);
//       });
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
//         <button type="submit">הוספת מנהל חדש</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// export default SignUp;


import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { sendSignInLinkToEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function SignUp() {
  const [email, setEmail] = useState("");
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
      await setDoc(userRef, { role: 'admin' });

      setMessage(".קישור להגדרת סיסמה נשלח לאימייל של המנהל החדש");
      setEmail("");
    } catch (error) {
      const errorMessage = error.message;
      console.error("Error sending sign-in link:", error);
      setMessage('Error: ${errorMessage}');
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
        <button type="submit">הוספת מנהל חדש</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;