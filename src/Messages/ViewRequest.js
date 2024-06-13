import { db } from "/Users/evem/Desktop/a/src/firebaseConfig.js";
import { readDocument } from "./Functions";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';


function ViewRequest() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [volunteering, setVolunteering] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [comments, setComments] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRequest() {
            try {
                const requestData = await readDocument("testRequests", "GyoWFB4xGRqWYM5IYbDp");
                if (requestData && requestData.firstName) {
                    setFirstName(requestData.firstName);
                    setLastName(requestData.lastName);
                    setVolunteering(requestData.volunteering);
                    setDate(requestData.date);
                    setTime(requestData.time);
                    setComments(requestData.comments);
                    setStatus(requestData.status);
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        }

        fetchRequest();
    }, []);

 
    const handleApprove = async () => {
        if (status === "open") {
            try {
                const docRef = doc(db, "testRequests", "GyoWFB4xGRqWYM5IYbDp");
                await setDoc(docRef, { status: "in process" }, { merge: true });
                setStatus("in process");
                navigate('/thankyou');
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
        else {
            navigate('/RequestInProcessPage');
        }
    };

      const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
      };

    return (
        <div className="App">
          <header className="App-header">
            <h1>בקשת סיוע</h1>
            <p>{`${firstName + " " + lastName} מבקש/ת את עזרתך ב${volunteering.label} `}</p>
            <p>{`בתאריך: ${formatDate(date)} בשעה: ${time}`}</p>
            {comments && <p>{`הערות: ${comments}`}</p>}
            <p>? האם תוכל לסייע</p>
            <button onClick={handleApprove}>אישור הבקשה</button>
          </header>
        </div>
      );
}

export default ViewRequest;
