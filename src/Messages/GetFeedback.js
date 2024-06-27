import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig.js";

const GetFeedback = () => {
const [feedback, setFeedback] = useState("");
const navigate = useNavigate();

const handleSubmit = async () => {
    try {
        const docRef = doc(db, "testRequests", "GyoWFB4xGRqWYM5IYbDp");
        await setDoc(docRef, { seekerFeedback: feedback }, { merge: true });
        navigate('/ThanksFeedback');
    } catch (error) {
        console.error("Error updating status:", error);
    }
};

  return (
    <div className="App">
      <header className="App-header">
        <h1>? המתנדב סגר את הבקשה, תרצה למלא פידבק </h1>
      </header>
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
    </div>
  );
};

export default GetFeedback;