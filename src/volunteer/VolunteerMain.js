import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Modal from 'react-modal';
import { auth, db } from "../firebaseConfig";
import { arrayUnion, query, where, collection, getDocs, getDoc, doc, setDoc, updateDoc, arrayRemove } from "firebase/firestore";
import citiesInIsrael from '../Forms/Cities.js';
import volunteerings from '../Forms/Volunteerings.js';
import Select from 'react-select';
import days from '../Forms/Days.js';
import langueges from '../Forms/Languges.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import logo from '../images/logo.png';
import {  faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

Modal.setAppElement('#root');

function VolunteerMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPasswordIsOpen, setModalPasswordIsOpen] = useState(false);
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
  const [documentId, setDocumentId] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState([]);
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsDetails, setMyRequestsDetails] = useState([]);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [historyModal, setIsHistoryModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [datePass, setDatePass] = useState(false);
  const isFetching = useRef(false);

  const fetchVolRecord = useCallback(async () => {
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
        setMyRequests(data.myRequests || []);
      } else {
        console.log("No matching document found");
      }
    } catch (error) {
      console.error("Error fetching volunteer record:", error);
    }
  }, [userId]);

  const fetchMatchDetails = useCallback(async () => {
    if (matches.length === 0 || isFetching.current) return;
    isFetching.current = true;

    try {
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

      if (invalidMatches.length > 0) {
        const userDocRef = doc(db, "Volunteers", documentId);
        await updateDoc(userDocRef, {
          matches: arrayRemove(...invalidMatches)
        });
      }

      setMatches(validMatches.map(detail => detail.id));
      setMatchDetails(validMatches);
    } catch (error) {
      console.error("Error fetching match details:", error);
    } finally {
      // isFetching.current = false;
    }
  }, [matches, documentId]);

  const fetchMyRequestsDetails = useCallback(async () => {
    if (myRequests.length === 0) return;

    try {
      const myRequestsDetailsPromises = myRequests.map(async (myRequestsId) => {
        const myRequestsDocRef = doc(db, "AidRequests", myRequestsId);
        const myRequestsDocSnap = await getDoc(myRequestsDocRef);
        return myRequestsDocSnap.exists() ? { id: myRequestsId, ...myRequestsDocSnap.data() } : null;
      });

      const myRequestsDetailsResults = await Promise.all(myRequestsDetailsPromises);
      setMyRequestsDetails(myRequestsDetailsResults);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  }, [myRequests]);

  useEffect(() => {
    fetchVolRecord();
  }, [fetchVolRecord]);

  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    fetchMyRequestsDetails();
  }, [fetchMyRequestsDetails]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  const openEditUser = async () => {
    setModalIsOpen(true);
  };

  const openHistory = async () => {
    setIsHistoryModal(true);
  };

  const closeModal = async () => {
    setModalIsOpen(false);
    setModalPasswordIsOpen(false);
    setIsHistoryModal(false);
  }

  const closeSignUpModal = () => {
    setSignUpModalIsOpen(false);
  };

  const openPasswordReset = async () => {
    setModalPasswordIsOpen(true);
  }

  const handleChangePassword = (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage("הסיסמה חייבת להיות באורך של לפחות 8 תווים ולכלול אותיות ומספרים.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("הסיסמאות אינן תואמות.");
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setMessage("הסיסמה שונתה בהצלחה");
              setEmail("");
              setOldPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              setModalPasswordIsOpen(false);
              setPasswordChangeSuccess(true);
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
      setModalIsOpen(false);
      setIsSuccessModalOpen(true);
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
        await updateDoc(docRef, { matches: null });

        const docRefVol = doc(db, "Volunteers", documentId);
        await updateDoc(docRefVol, { myRequests: arrayUnion(id) }, { merge: true });
        window.location.reload();
      } catch (error) {
        console.error("Error updating request:", error);
      }
    } else {
      console.error("status != open");
    }
  };

  const handleRemoveRequest = async (id) => {
    try {
      const volunteerDocRef = doc(db, "Volunteers", documentId);
      await updateDoc(volunteerDocRef, {
        matches: arrayRemove(id)
      });

      setMatches(matches.filter(matchId => matchId !== id));
      setMatchDetails(matchDetails.filter(match => match.id !== id));
    } catch (error) {
      console.error("Error removing request:", error);
    }
  };

  const closeRequest = async (id) => {
    try {
      const docRef = doc(db, 'AidRequests', id);
      await setDoc(docRef, { status: 'close' }, { merge: true });
      window.location.reload();
    } catch (error) {
      console.error('Error closing request:', error);
    }
  };

  const sortedRequests = useMemo(() => {
    return myRequestsDetails.filter((request) => request.status === "in process");
  }, [myRequestsDetails]);

  const sortedCloseRequests = useMemo(() => {
    return myRequestsDetails.filter((request) => request.status === "close");
  }, [myRequestsDetails]);

  const openWhatsAppChat = () => {
    const phoneNumber = "+972545559682";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const isDatePassed = (dateString) => {
    const inputDate = new Date(dateString);
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    setDatePass(inputDate < today);  
  }

  return (
    <div className='VolunteerMain'>
      <div className="navbar-custom">
        <div className="navbar-logo">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="navbar-buttons">
          <button className='btn' onClick={openHistory}>בקשות סגורות</button>
          <button className='btn' onClick={openEditUser}>ערוך פרופיל</button>
          <button className='btn' onClick={openPasswordReset}>שנה סיסמה</button>
          <button className='btn-logout' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>

      <div className='modal-container'>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit User Modal"
        >
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
          <div className='volunteerApp'>
            <h1>עריכת פרטי משתמש</h1>
            <form action="#" method="get" onSubmit={handleSubmit}>
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
                className="basic-multi-select"
                classNamePrefix="select"
                required
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
                required
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
                required
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
                required
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
              <button type="submit" value="Submit">
                אישור עריכה
              </button>
              </form>
          </div>
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
            <button className="modal-button confirm" onClick={handleSuccessModalClose}>סגור</button>
          </div>
        </Modal>
      </div>

      <div className='modal-container'>
        <Modal
          isOpen={modalPasswordIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit User Modal"
        >
        <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
          <div className='passwordVolUpdate'>
            <h1>שינוי סיסמה</h1>
            <form onSubmit={handleChangePassword}>
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
          </div>
        </Modal>

        <Modal
          isOpen={passwordChangeSuccess}
          onRequestClose={() => setPasswordChangeSuccess(false)}
          contentLabel="Password Change Success Modal"
        >
          <div className='message'>
            <button className='close-model-but' onClick={() => setPasswordChangeSuccess(false)}>X</button>
            <h1>הסיסמה שונתה בהצלחה</h1>
            <Modal closeModal={closeSignUpModal} />
          </div>
        </Modal>
      </div>


      <div className='modal-container'>
        <Modal
          isOpen={historyModal}
          onRequestClose={closeModal}
          contentLabel="History Modal"
          style={{
            content: {
              width: 'auto',
              maxWidth: 'fit-content',
              margin: 'auto',
              padding: '20px',
            },
          }}
        >
        <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
          <div className='volunteerApp'>
            <h1>היסטוריית התנדבויות</h1>
          {sortedCloseRequests.length > 0 ? (
            <ul>
              {sortedCloseRequests.map((match) => (
                <li key={match.id} 
                className="match-container-history"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: '#f9f9f9',
                  padding: '10px',
                  marginBottom: '15px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  fontSize: '18px'
                }}
                >
                  <div className="Request">
                    {`סיוע ב${match.volunteering} ל${match.firstName + " " + match.lastName}`}
                    {`, ביום: ${match.day} ${formatDate(match.date)} בשעה: ${match.time}`}
                  </div>
                </li>
            ))}
            </ul>
            
          ) : (
            <p>לא נמצאו בקשות סגורות</p>
          )}
          </div>
        </Modal>
      </div>




      <div className="boxes-container">
        <div className="box">
          <h2>בקשות סיוע רלוונטיות עבורך</h2>
          {matchDetails.length > 0 ? (
            matchDetails
            .filter((match) => new Date(match.date) >= new Date())
            .map((match) => (
              <div key={match.id} className="match-container">
                <div className="Request">
                  <p>{`${match.firstName + " " + match.lastName} מבקש/ת את עזרתך ב${match.volunteering} `}</p>
                  <p>{`ביום: ${match.day} ${formatDate(match.date)} בשעה: ${match.time}`}</p>
                  <p>{match.comments && <p>הערות: {match.comments}</p>}</p>
                  <button onClick={() => handleApproveRequest(match.status, match.id)}>אישור בקשה</button>
                  <button onClick={() => handleRemoveRequest(match.id)}>מחק בקשה</button>
                </div>
              </div>
            ))
          ) : (
            <p>לא נמצאו התאמות</p>
          )}
        </div>

        <div className="box">
          <h2>הבקשות שלי</h2>
          {sortedRequests.length > 0 ? (
            sortedRequests.map((cur) => (
              <div key={cur.id} className="myRequests-container">
                <div className="Request">
                  <p>{`סיוע ל${cur.firstName + " " + cur.lastName} ב${cur.volunteering}`}</p>
                  <p>{`בתאריך: ${formatDate(cur.date)} בשעה: ${cur.time}`}</p>
                  <p>
                    סטטוס:
                    {cur.status === 'in process' ? (
                      <>
                        <span style={{ color: '#009ba6' }}> בתהליך</span>
                        <p>{`מספר טלפון: ${cur.phoneNumber}`}</p>
                      </>
                    ) : (
                      ' טופל'
                    )}
                  </p>
                  {cur.status === 'in process' && (
                    <button onClick={() => closeRequest(cur.id)}>סגור בקשה</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>אין בקשות בטיפול</p>
          )}
        </div>
      </div>

      <div className='pageEnd'>
        <h2>צור איתנו קשר ב - whatsapp </h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>
    </div>
  );
}

export default VolunteerMain;
