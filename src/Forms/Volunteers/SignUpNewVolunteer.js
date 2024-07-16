import React, { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDocument, deleteDocument, readDocument, setDocumentWithId } from "./VolunteerFunctions";

const SignUpVol = () => {
  const [password, setPassword] = useState("");
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const data = await readDocument("NewVolunteers", "SDfA8Wi3h8Dw5Z5zdsjE");
        setRequestData(data);
      } catch (error) {
        console.error("Error fetching request data:", error);
      }
    };

    fetchRequestData();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!requestData) {
      console.error("Request data not available");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, requestData.mail, password);
      const user = userCredential.user;
      const userId = user.uid;
      alert("User registered:", user);

      const formData = {
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        id: requestData.id,
        phoneNumber: requestData.phoneNumber,
        mail: requestData.mail,
        city: requestData.city,
        langueges: requestData.langueges,
        days: requestData.days,
        emergency: requestData.emergency,
        volunteering: requestData.volunteering,
        vehicle: requestData.vehicle,
      };

      console.log(formData);
  
      await setDocumentWithId("Volunteers", userId,  formData);
      await deleteDocument("NewVolunteers", "SDfA8Wi3h8Dw5Z5zdsjE");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error registering user:", errorCode, errorMessage);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSignUp}>
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="rtl"
        />
        <button type="submit" disabled={!requestData}>הוספת מתנדב חדש</button>
      </form>
    </div>
  );
};

export default SignUpVol;
