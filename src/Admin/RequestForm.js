import React, { useState } from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import { addDocument, addFieldToDocument, addMatchToDocument } from "../Forms/AidRequests/RequestFunctions";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import citiesInIsrael from "./db/Cities";
import languages from "./db/Languges";
import days from "./db/Days";
import volunteerings from "./db/Volunteerings";

Modal.setAppElement('#root');

function RequestForm({ setIsSuccessModalOpen, setSuccessMessage,closeForm }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [id, setId] = useState("");
    const [idValid, setIdValid] = useState(true);
    const [contact, setContact] = useState("");
    const [contactValid, setContactValid] = useState(true);
    const [citySelectedOption, setCitySelectedOption] = useState("");
    const [volSelectedOptions, setVolSelectedOptions] = useState("");
    const [langSelectedOptions, setLangSelectedOptions] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [comments, setComments] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(contact)){
            setContactValid(false);
            isValid = false;
        } else {
            setContactValid(true);
        }

        const idRegex = /^\d{9}$/;
        if (!idRegex.test(id)){
            setIdValid(false);
            isValid = false;
        } else {
            setIdValid(true);
        }

        if (isValid) {
            const formData = {
                firstName: firstName,
                lastName: lastName,
                ID: id,
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

            if (contactValid && idValid) {
                try {
                    const docRef = await addDocument('AidRequests', formData);
                    const volunteersCollection = collection(db, 'Volunteers');

                    let qCity = query(volunteersCollection, where('city', '==', citySelectedOption.label));
                    const queryCitySnapshot = await getDocs(qCity);

                    let filteredDocs = queryCitySnapshot.docs;
                    if (langSelectedOptions.label) {
                        filteredDocs = filteredDocs.filter(doc => {
                            const data = doc.data();
                            return data.langueges && data.langueges.includes(langSelectedOptions.label);
                        });
                    }

                    if (volSelectedOptions.label) {
                        filteredDocs = filteredDocs.filter(doc => {
                            const data = doc.data();
                            return data.volunteering && data.volunteering.includes(volSelectedOptions.label);
                        });
                    }

                    if (volSelectedOptions.label) {
                        filteredDocs = filteredDocs.filter(doc => {
                            const data = doc.data();
                            return data.days && data.days.includes(dayOfWeek);
                        });
                    }

                    const volunteerIds = filteredDocs.map(doc => doc.id);
                    console.log('Volunteer IDs:', volunteerIds);

                    await addFieldToDocument('AidRequests', docRef.id, 'matches', volunteerIds);

                    if (volunteerIds.length > 0) {
                        try {
                            for (const id of volunteerIds) {
                                await addMatchToDocument('Volunteers', id, docRef.id);
                            }
                        } catch (error) {
                            console.error(`Error updating volunteer documents: ${error}`);
                        }
                    }

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
                    setSuccessMessage("הבקשה נשלחה בהצלחה!");
                    setIsSuccessModalOpen(true);
                } catch (error) {
                    console.error('Error during handleSubmit:', error);
                }
                window.location.reload(); // Refresh the page to show the new record

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

    return (
        <div className="Form" >
          <button
            onClick={closeForm}
            style={{
              position: 'relative',
              top: '-0.5rem',
              left: '-23rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        <h1>הגשת בקשת סיוע </h1>
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
        {!idValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>הקלד תעודת זהות חוקית</label>
        )}

        <label htmlFor="tel">מספר טלפון</label>
        <input
        type="tel"
        name="contact"
        id="contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        dir="rtl"
        />
        {!contactValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>הקלד מספר טלפון חוקי</label>
        )}

        <label>עיר מגורים</label>
        <Select
        name="select"
        id="select"
        options={citiesInIsrael.map(city => ({ value: city, label: city }))}
        value={citySelectedOption}
        onChange={setCitySelectedOption}
        placeholder="בחר עיר מגורים"
        required
        />

        <label>שפה מועדפת</label>
        <Select
        name="select"
        id="select"
        options={languages.map(lang => ({ value: lang, label: lang }))}
        value={langSelectedOptions}
        onChange={setLangSelectedOptions}
        placeholder="בחר שפה "
        required
        />

        <label>אופן הסיוע</label>
        <Select
        name="volunteerings"
        id="volunteerings"
        options={volunteerings.map(volunteer => ({ value: volunteer, label: volunteer }))}
        value={volSelectedOptions}
        onChange={setVolSelectedOptions}
        placeholder="בחר תחום לסיוע"
        required
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

        <button
        type="submit"
        value="Submit"
        >
        הגש בקשה
        </button>
        </form>
        </fieldset>
        </div>
    );
}

export default RequestForm;
