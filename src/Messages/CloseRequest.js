import { db } from "../firebaseConfig.js";
import { readDocument } from "./Functions";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

function CloseRequest () {
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRequest() {
            try {
                const requestData = await readDocument("testRequests", "GyoWFB4xGRqWYM5IYbDp");
                if (requestData && requestData.status) {
                    setStatus(requestData.status);
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        }

        fetchRequest();
    }, []);

    const handleApprove = async () => {
        if (status === "in process") {
            try {
                const docRef = doc(db, "testRequests", "GyoWFB4xGRqWYM5IYbDp");
                await setDoc(docRef, { status: "close" }, { merge: true });
                setStatus("close");
                navigate('/VolunteerFeedback');
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
        else{
            navigate('/WrongPage');
        }
    };

    const openWhatsAppChat = () => {
        // Replace with the WhatsApp chat link (replace placeholders with actual phone number and message)
        const phoneNumber = "+972545559682";
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, "_blank");
    };


    return (
        <div className="App">
          <header className="App-header">
            <h2>:לסגירת הבקשה</h2>
            <button onClick={handleApprove}>סגירת הבקשה</button>
            <h2>צור איתנו קשר בווצאפ</h2>
            <button className="whatsapp-button" onClick={openWhatsAppChat}>
                <FontAwesomeIcon icon={faWhatsapp} size="2x" />
            </button>          
          </header>
        </div>
      );
}

export default CloseRequest;