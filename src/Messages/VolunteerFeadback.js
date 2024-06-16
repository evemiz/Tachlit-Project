import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig.js";

const VolunteerFeedback = () => {

    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const docRef = doc(db, "testRequests", "GyoWFB4xGRqWYM5IYbDp");
            await setDoc(docRef, { volunteerFeedback: feedback }, { merge: true });
            navigate('/thankyou');
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

  return (
    <div className="App">
      <header className="App-header">
        <h1>? תרצה למלא פידבק </h1>
      <textarea
            name="feedback"
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            dir="rtl"
          />
        <button
            type="submit"
            value="Submit"
            onClick={(e) => handleSubmit(e)}
          >
            שלח
          </button>
      </header>
    </div>
  );
};

export default VolunteerFeedback;
