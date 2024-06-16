import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig.js";

const VerificationPhone = () => {
const [contact, setContact] = useState("");
const navigate = useNavigate();

const handleSubmit = async () => {
    // try {
    //     const docRef = doc(db, "testRequests", "GyoWFB4xGRqWYM5IYbDp");
    //     await setDoc(docRef, { seekerFeedback: feedback }, { merge: true });
    //     navigate('/ThanksFeedback');
    // } catch (error) {
    //     console.error("Error updating status:", error);
    // }  
    alert("a");
};

  return (
    <div className="App">
      <label htmlFor="tel">מספר טלפון</label>
        <input
            type="tel"
            name="contact"
            id="contact"
            value={contact}
            onChange={(e) =>
            setContact(e.target.value)
            }
            required
        />
        <button
            type="submit"
            value="Submit"
            onClick={(e) => handleSubmit(e)}
          >
            שלח
          </button>
    </div>
  );
};

export default VerificationPhone;