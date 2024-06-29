import '../style.css';
import citiesInIsrael from '../Cities';
import volunteerings from '../Volunteerings';
import langues from '../Languges';
import { React, useState } from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import { validateData, addDocument, addFieldToDocument } from "./RequestFunctions.js";
import days from '../Days.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

Modal.setAppElement('#root'); // Ensure modal works correctly with screen readers

function RequestForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState("");
  const [volSelectedOptions, setVolSelectedOptions] = useState("");
  const [langSelectedOptions, setLangSelectedOptions] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [comments, setComments] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      firstName: firstName,
      lastName: lastName,
      id: id,
      phoneNumber: contact,
      city: citySelectedOption ? citySelectedOption.label : "",
      langueges: langSelectedOptions ? langSelectedOptions.label : "",
      volunteering: volSelectedOptions ? volSelectedOptions.label : "",
      date: date,
      day: dayOfWeek,
      time: time,
      comments: comments,
      status: "open",
      volunteerFeedback: "",
      seekerFeedback: "",
    };

    if (validateData(formData)) {
      try {
        const docRef = await addDocument('AidRequests', formData);

        const volunteersCollection = collection(db, 'Volunteers');

        // First query: Filter by city
        let qCity = query(volunteersCollection, where('city', '==', citySelectedOption.label));
        const queryCitySnapshot = await getDocs(qCity);

        // Filter city results further by language
        let filteredDocs = queryCitySnapshot.docs;
        if (langSelectedOptions.label) {
          filteredDocs = filteredDocs.filter(doc => {
            const data = doc.data();
            return data.langueges && data.langueges.includes(langSelectedOptions.label);
          });
        }

        // Filter city and language results further by volunteering
        if (volSelectedOptions.label) {
          filteredDocs = filteredDocs.filter(doc => {
            const data = doc.data();
            return data.volunteering && data.volunteering.includes(volSelectedOptions.label);
          });
        }

        // Filter city, language and volunteering results further by day
        if (volSelectedOptions.label) {
          filteredDocs = filteredDocs.filter(doc => {
            const data = doc.data();
            return data.days && data.days.includes(dayOfWeek);
          });
        }

        // Extract IDs of matching volunteers
        const volunteerIds = filteredDocs.map(doc => doc.id);
        console.log('Volunteer IDs:', volunteerIds);

        // Add matching volunteer IDs to the aid request document
        await addFieldToDocument('AidRequests', docRef.id, 'matches', volunteerIds);

        // Reset the form
        setFirstName("");
        setLastName("");
        setId("");
        setContact("");
        setCitySelectedOption("");
        setVolSelectedOptions("");
        setLangSelectedOptions("");
        setDate("");
        setTime("");
        setComments("");
        setDayOfWeek("");
        setSuccessMessage("הבקשה נשלחה בהצלחה!"); // Set success message
        setIsSuccessModalOpen(true); // Open success modal
      } catch (error) {
        console.error('Error during handleSubmit:', error);
      }
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    const dateObj = new Date(selectedDate);
    setDayOfWeek(getDayName(dateObj.getDay()));
  };

  const getDayName = (dayIndex) => {
    return days[dayIndex];
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="App">
      <h1>טופס בקשת סיוע חדשה</h1>
      <fieldset>
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

          <label htmlFor="id">מספר תעדות זהות</label>
          <input
            type="text"
            name="id"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />

          <label htmlFor="tel">מספר טלפון</label>
          <input
            type="tel"
            name="contact"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />

          <label>עיר מגורים</label>
          <Select
            name="select"
            id="select"
            options={citiesInIsrael.map(city => ({ value: city, label: city }))}
            value={citySelectedOption}
            onChange={setCitySelectedOption}
            placeholder="בחר עיר מגורים"
          />

          <label>שפה מועדפת</label>
          <Select
            name="select"
            id="select"
            options={langues.map(lang => ({ value: lang, label: lang }))}
            value={langSelectedOptions}
            onChange={setLangSelectedOptions}
            placeholder="בחר שפה "
          />

          <label>אופן הסיוע</label>
          <Select
            name="volunteerings"
            id="volunteerings"
            options={volunteerings.map(volunteer => ({ value: volunteer, label: volunteer }))}
            value={volSelectedOptions}
            onChange={setVolSelectedOptions}
            placeholder="בחר תחום לסיוע"
          />

          <label>תאריך</label>
          <input
            type="date"
            name="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            required
          />

          <label>שעה</label>
          <input
            type="time"
            name="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label>הערות</label>
          <textarea
            name="comments"
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            dir="rtl"
          />

          <br />

          <button
            type="submit"
            value="Submit"
          >
            הגש בקשה
          </button>
        </form>
      </fieldset>
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
  );
}

export default RequestForm;
