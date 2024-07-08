import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Modal from 'react-modal';
import { auth, db } from "../firebaseConfig"; 
import { query, where, collection, getDocs } from "firebase/firestore"; 
import Navbar from './VolunteerNavigateBar';
import citiesInIsrael from '../Forms/Cities.js';
import volunteerings from '../Forms/Volunteerings.js';
import Select from 'react-select';
import days from '../Forms/Days.js';
import langueges from '../Forms/Languges.js';
import { doc, setDoc } from 'firebase/firestore';

Modal.setAppElement('#root');

function VolunteerMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen2, setModalIsOpen2] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [volRecord, setVolRecord] = useState(null); 
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

  useEffect(() => {
    fetchVolRecord();
  }, []);

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

  const openChangePasswordModal = () => {
    setModalIsOpen(true);
  };

  const openEditUser = async () => {
    setModalIsOpen2(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("");
  };
  
  const closeModal2 = () => {
    setModalIsOpen2(false);
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
              closeModal();
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
        setVolRecord(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setCitySelectedOption(data.city ? { value: data.city, label: data.city } : null);
        setVolSelectedOptions(data.volunteering ? data.volunteering.map(vol => ({ value: vol, label: vol })) : []);
        setDaySelectedOptions(data.days ? data.days.map(day => ({ value: day, label: day })) : []);
        setLangSelectedOptions(data.langueges ? data.langueges.map(lang => ({ value: lang, label: lang })) : []);
        setAvailable(data.emergency || false);
        setVehicle(data.vehicle || false);
      } else {
        setVolRecord(null);
        console.log("No matching document found");
      }
    } catch (error) {
      console.error("Error fetching other record:", error);
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

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className='VolunteerMain'>
      <Navbar handleLogout={handleLogout} openEditUser={openEditUser} openChangePasswordModal={openChangePasswordModal} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Change Password Modal"
      >
        <h2>שינוי סיסמה</h2>
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
        <button onClick={closeModal}>סגור</button>
      </Modal>

      <Modal
        isOpen={modalIsOpen2}
        onRequestClose={closeModal2}
        contentLabel="Edit User Modal"
      >
        <h1>עריכת משתמש</h1>
        <div className='App'>
        <fieldset>
            <label htmlFor="firstname">שם פרטי</label>
            <input
              placeholder={volRecord ? volRecord.firstName : ""}
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
              placeholder={volRecord ? volRecord.lastName : ""}
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

            <button type="submit" value="Submit" onClick={handleSubmit}> 
              אישור עריכה
            </button>
        </fieldset>
        </div>
        <button onClick={closeModal2}>סגור</button>
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

      <Link to="/CloseRequest">סגירת בקשה</Link>
      <Link to="/GetFeedback">הזנת משוב</Link>
      <Link to="/ViewRequest">צפייה בבקשות סיוע</Link>
    </div>
  );
}

export default VolunteerMain;
