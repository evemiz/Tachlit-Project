import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Modal from 'react-modal';
import { auth, db } from "../firebaseConfig"; 
import { query, where, collection, getDocs, getDoc, doc, setDoc, updateDoc, arrayRemove } from "firebase/firestore"; 
import Navbar from './VolunteerNavigateBar';
import citiesInIsrael from '../Forms/Cities.js';
import volunteerings from '../Forms/Volunteerings.js';
import Select from 'react-select';
import days from '../Forms/Days.js';
import langueges from '../Forms/Languges.js';

Modal.setAppElement('#root');

function VolunteerMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState(null);
  const [volSelectedOptions, setVolSelectedOptions] = useState([]);
  const [daySelectedOptions, setDaySelectedOptions] = useState([]);
  const [langSelectedOptions, setLangSelectedOptions] = useState([]);
  const [available, setAvailable] = useState(false);
  const [vehicle, setVehicle] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState([]);

  const [currents, setCurrents] = useState([]);
  const [currentsDetails, setCurrentsDetails] = useState([]);

  const [close, setClose] = useState([]);
  const [closeDetails, setCloseDetails] = useState([]);

  useEffect(() => {
    fetchVolRecord();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      fetchMatchDetails();
    }
  }, [matches]);

  useEffect(() => {
    if (currents.length > 0) {
      fetchCurrentsDetails();
    }
  }, [currents]);

  useEffect(() => {
    if (close.length > 0) {
      fetchCloseDetails();
    }
  }, [close]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const openEditUser = async () => {
    setModalIsOpen(true);
  };
  
  const closeModal = () => {
    fetchVolRecord();
    setModalIsOpen(false);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage("הסיסמאות אינן תואמות.");
      return;
    }
    

    const user = auth.currentUser;

    if (user && user.email === email) {
      const credential = EmailAuthProvider.credential(email, oldPassword);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setMessage("הסיסמה שונתה בהצלחה");
              setEmail("");
              setOldPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
            })
            .catch((error) => {
              console.error("Error updating password:", error);
              setMessage("שגיאה בעדכון הסיסמה");
            });
        })
        .catch((error) => {
          console.error("Error reauthenticating user:", error);
          setMessage("שגיאה באימות המשתמש. נא לבדוק את הסיסמה הישנה.");
        });
    } else {
      setMessage("האימייל שהוזן אינו תואם את האימייל של המשתמש המחובר");
    }
  };

  const fetchVolRecord = async () => {
    try {
      const q = query(collection(db, "Volunteers"), where("mail", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setDocumentId(doc.id);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setCitySelectedOption(data.city ? { value: data.city, label: data.city } : null);
        setVolSelectedOptions(data.volunteering ? data.volunteering.map(vol => ({ value: vol, label: vol })) : []);
        setDaySelectedOptions(data.days ? data.days.map(day => ({ value: day, label: day })) : []);
        setLangSelectedOptions(data.langueges ? data.langueges.map(lang => ({ value: lang, label: lang })) : []);
        setAvailable(data.emergency || false);
        setVehicle(data.vehicle || false);
        setMatches(data.matches || []);
        setCurrents(data.inProcessRequests || []);
        setClose(data.closeRequests || []);
      } else {
        console.log("No matching document found");
      }
    } catch (error) {
      console.error("Error fetching other record:", error);
    }
  };

  const fetchMatchDetails = async () => {
    try {
      // Fetch the details of all matches
      const matchDetailsPromises = matches.map(async (matchId) => {
        const matchDocRef = doc(db, "AidRequests", matchId);
        const matchDocSnap = await getDoc(matchDocRef);
        return matchDocSnap.exists() ? { id: matchId, ...matchDocSnap.data() } : null;
      });
  
      const matchDetailsResults = await Promise.all(matchDetailsPromises);
      const validMatches = matchDetailsResults.filter(detail => detail && detail.status === "open");
      const invalidMatches = matchDetailsResults
        .filter(detail => detail && detail.status !== "open")
        .map(detail => detail.id);
  
      // Remove invalid matches from the matches array in Firestore
      if (invalidMatches.length > 0) {
        const userDocRef = doc(db, "Volunteers", documentId);
        await updateDoc(userDocRef, {
          matches: arrayRemove(...invalidMatches)
        });
      }
  
      // Update the local state
      setMatches(validMatches.map(detail => detail.id));
      setMatchDetails(validMatches);
    } catch (error) {
      console.error("Error fetching match details:", error);
    }
  };


  const fetchCurrentsDetails = async () => {
    try {
      // Fetch the details
      const currentsDetailsPromises = currents.map(async (currentId) => {
        const currentDocRef = doc(db, "AidRequests", currentId);
        const currentDocSnap = await getDoc(currentDocRef);
        return currentDocSnap.exists() ? { id: currentId, ...currentDocSnap.data() } : null;
      });
  
      const currentDetailsResults = await Promise.all(currentsDetailsPromises);
      const validCurrents = currentDetailsResults.filter(detail => detail && detail.status === "in process");
      const invalidCurrents = currentDetailsResults
        .filter(detail => detail && detail.status !== "in process")
        .map(detail => detail.id);
  
      // Remove invalid matches from the matches array in Firestore
      if (invalidCurrents.length > 0) {
        const userDocRef = doc(db, "Volunteers", documentId);
        await updateDoc(userDocRef, {
          inProcessRequests: arrayRemove(...invalidCurrents)
        });
      }

      // Update the local state
      setCurrents(validCurrents.map(detail => detail.id));
      setCurrentsDetails(validCurrents);
    } catch (error) {
      console.error("Error fetching currents details:", error);
    }
  };

  const fetchCloseDetails = async () => {
    try {
      // Fetch the details
      const closeDetailsPromises = close.map(async (closeId) => {
        const closeDocRef = doc(db, "AidRequests", closeId);
        const closeDocSnap = await getDoc(closeDocRef);
        return closeDocSnap.exists() ? { id: closeId, ...closeDocSnap.data() } : null;
      });
  
      const closeDetailsResults = await Promise.all(closeDetailsPromises);

      // Update the local state
      setClose(closeDetailsResults.map(detail => detail.id));
      setCloseDetails(closeDetailsResults);
    } catch (error) {
      console.error("Error fetching closw details:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      firstName: firstName,
      lastName: lastName,
      city: citySelectedOption ? citySelectedOption.label : "",
      langueges: langSelectedOptions.map(option => option.value),
      days: daySelectedOptions.map(option => option.value),
      emergency: available,
      volunteering: volSelectedOptions.map(option => option.value),
      vehicle: vehicle,
    };

    try {
      const docRef = doc(db, "Volunteers", documentId);
      await setDoc(docRef, formData, { merge: true });
      setIsSuccessModalOpen(true);
      setSuccessMessage("עדכון בוצע בהצלחה");

    } catch (error) {
      console.error("Error updating volunteer:", error);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleApproveRequest = async (status, id) => {
    if (status === "open") {
        try {
            const docRef = doc(db, "AidRequests", id);
            await setDoc(docRef, { status: "in process" }, { merge: true });
            await setDoc(docRef, { volunteerMatch: documentId }, { merge: true });
            await updateDoc(docRef, {matches: null});

            const docRefVol = doc(db, "Volunteers", documentId);
            await updateDoc(docRefVol, { inProcessRequests: [id] }, { merge: true });

        } catch (error) {
            console.error("Error updating :", error);
        }
    }
    else {
      console.error("status != open");
    }
};

const handleCloseRequest = async (status, id) => {
  if (status === "in process") {
      try {
          const docRef = doc(db, "AidRequests", id);
          await setDoc(docRef, { status: "close" }, { merge: true });

          const docRefVol = doc(db, "Volunteers", documentId);
          await updateDoc(docRefVol, { closeRequests: [id] }, { merge: true });

      } catch (error) {
          console.error("Error updating :", error);
      }
  }
  else {
    console.error("status != open");
  }
};

  return (
    <div className='VolunteerMain'>
      <Navbar handleLogout={handleLogout} openEditUser={openEditUser}/>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit User Modal"
      >
        <h1>עריכת משתמש</h1>
        <div className='App'>
        <fieldset>
            <label htmlFor="firstname">שם פרטי</label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              dir="rtl"
              required
            />
            <label htmlFor="lastname">שם משפחה</label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              dir="rtl"
              required
            />

            <label>עיר מגורים</label>
            <Select
              name="select"
              options={citiesInIsrael.map(city => ({ value: city, label: city }))}
              value={citySelectedOption}
              onChange={setCitySelectedOption}
              placeholder="בחר עיר מגורים"
            />

            <label>תחומי התנדבות</label>
            <Select
              isMulti
              name="volunteerings"
              options={volunteerings.map(volunteer => ({ value: volunteer, label: volunteer }))}
              className="basic-multi-select"
              classNamePrefix="select"
              value={volSelectedOptions}
              onChange={setVolSelectedOptions}
              placeholder="בחר תחומי התנדבות"
            />

            <label>ימי זמינות</label>
            <Select
              isMulti
              name="days"
              options={days.map(day => ({ value: day, label: day }))}
              className="basic-multi-select"
              classNamePrefix="select"
              value={daySelectedOptions}
              onChange={setDaySelectedOptions}
              placeholder="בחר ימי זמינות"
            />

            <label>שפות</label>
            <Select
              isMulti
              name="langueges"
              options={langueges.map(lang => ({ value: lang, label: lang }))}
              className="basic-multi-select"
              classNamePrefix="select"
              value={langSelectedOptions}
              onChange={setLangSelectedOptions}
              placeholder="בחר שפות"
            />

            <label htmlFor="available">זמינות לחירום</label>
            <input
              type="radio"
              name="available"
              value="yes"
              id="yes"
              checked={available === true}
              onChange={(e) => setAvailable(true)}
            />
            כן
            <input
              type="radio"
              name="available"
              value="no"
              id="no"
              checked={available === false}
              onChange={(e) => setAvailable(false)}
            />
            לא

            <label htmlFor="vehicle">רכב</label>
            <input
              type="radio"
              name="vehicle"
              value="yes"
              id="vehicleYes"
              checked={vehicle === true}
              onChange={(e) => setVehicle(true)}
            />
            כן
            <input
              type="radio"
              name="vehicle"
              value="no"
              id="vehicleNo"
              checked={vehicle === false}
              onChange={(e) => setVehicle(false)}
            />
            לא

            <br />

        <div className='passwordVolUpdate'>

        <h1>שינוי סיסמה</h1>
        <form onSubmit={handleChangePassword}>
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="סיסמה ישנה"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            placeholder="הקש שוב את סיסמתך"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            dir="rtl"
          />
          <button type="submit">שנה סיסמה</button>
        </form>
        {message && <p>{message}</p>}

        </div>
        <button type="submit" value="Submit" onClick={handleSubmit}> 
              אישור עריכה
            </button>
        </fieldset>
        </div>
        <button onClick={closeModal}>סגור</button>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={handleSuccessModalClose}
        contentLabel="Success"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>פעולה הצליחה</h2>
        <p>{successMessage}</p>
        <div className="modal-buttons">
          <button className="modal-button confirm" onClick={handleSuccessModalClose}>
            סגור
          </button>
        </div>
      </Modal>

      <div className="App">
        <h2>התאמות שלך</h2>
        {matchDetails.length > 0 ? (
          matchDetails.map((match) => (
            <div key={match.id} className="match-container">
              <div className="Request">
                <h3>{match.firstName} {match.lastName}</h3>
                <p>{`${match.firstName + " " + match.lastName} מבקש/ת את עזרתך ב${match.volunteering} `}</p>
                <p>{`בתאריך: ${formatDate(match.date)} בשעה: ${match.time}`}</p>
                <button onClick={() => handleApproveRequest(match.status, match.id)}>אישור בקשה</button>
              </div>
            </div>
          ))
        ) : (
          <p>לא נמצאו התאמות.</p>
        )}
      </div>

      <div className="App">
        <h2>בקשות בטיפולך</h2>
        {currentsDetails.length > 0 ? (
          currentsDetails.map((cur) => (
            <div key={cur.id} className="current-container">
              <div className="Request">
                <h3>{cur.firstName} {cur.lastName}</h3>
                <p>{`${cur.firstName + " " + cur.lastName} מבקש/ת את עזרתך ב${cur.volunteering} `}</p>
                <p>{`בתאריך: ${formatDate(cur.date)} בשעה: ${cur.time}`}</p>
                <button onClick={() => handleCloseRequest(cur.status, cur.id)}>סגירת הבקשה</button>
              </div>
            </div>
          ))
        ) : (
          <p>אין בקשות בטיפול</p>
        )}
      </div>

      <div className="App">
        <h2>בקשות סגורות</h2>
        {closeDetails.length > 0 ? (
          closeDetails.map((cur) => (
            <div key={cur.id} className="close-container">
              <div className="Request">
                <h3>{cur.firstName} {cur.lastName}</h3>
                <p>{`${cur.firstName + " " + cur.lastName} מבקש/ת את עזרתך ב${cur.volunteering} `}</p>
                <p>{`בתאריך: ${formatDate(cur.date)} בשעה: ${cur.time}`}</p>
                <button onClick={() => handleCloseRequest(cur.status, cur.id)}>סגירת הבקשה</button>
              </div>
            </div>
          ))
        ) : (
          <p>אין בקשות בטיפול</p>
        )}
      </div>

    </div>
  );
}

export default VolunteerMain;
