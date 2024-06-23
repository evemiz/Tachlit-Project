// import React, { useState } from "react";
// import {auth} from "../firebaseConfig"
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// function SignUp () {
//     const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignUp = (e) => {
//     e.preventDefault();
//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         console.log("User registered:", user);
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         console.error("Error registering user:", errorCode, errorMessage);
//       });
//   };

//   return (
//     <div className="App">
//       <form onSubmit={handleSignUp}>
//         <input
//           type="email"
//           placeholder="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           dir = "rtl"
//         />
//         <input
//           type="password"
//           placeholder="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           dir = "rtl"
//         />
//         <button type="submit">הוספת מנהל חדש</button>
//       </form>
//     </div>
//   );
// }

// export default SignUp;


//---------------------------------------------------------------------------------

import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage("האימייל שהוזן אינו תקין");
      return;
    }
    if (password.length < 8) {
      setMessage("הסיסמה חייבת להיות לפחות 8 תווים");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("הסיסמאות אינן תואמות");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User registered:", user);
        setMessage("המנהל נרשם בהצלחה");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error registering user:", errorCode, errorMessage);
        if (errorCode === 'auth/email-already-in-use') {
          setMessage("משתמש זה כבר רשום במערכת");
        } else {
          setMessage(`Error: ${errorMessage}`);
        }
      });
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
        <input
          type="password"
          placeholder="סיסמה"
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
        <button type="submit">הוספת מנהל חדש</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;
