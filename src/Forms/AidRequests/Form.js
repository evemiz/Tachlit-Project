import '../style.css';
import citiesInIsrael from '../Cities';
import volunteerings from '../Volunteerings';
import langues from '../Languges';
import { React, useState } from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import { addDocument, addFieldToDocument, addMatchToDocument } from "./RequestFunctions.js";
import days from '../Days.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';

Modal.setAppElement('#root'); // Ensure modal works correctly with screen readers

function RequestForm() {
  const navigate = useNavigate();

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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

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
  
          if (volunteerIds.length > 0) {
            // Function to add a field to a specific document
              try {
                for (const id of volunteerIds) {
                  await addMatchToDocument('Volunteers', id, docRef.id);
                }
              } catch (error) {
                console.error(`Error updating volunteer documents: ${error}`);
              }
          }
    
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
    navigate('/'); 
  };

  const openWhatsAppChat = () => {
    // Replace with the WhatsApp chat link (replace placeholders with actual phone number and message)
    const phoneNumber = "+972545559682";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const logoClick = () => {
    navigate('/');
  }

  return (
    <div className="page">

       <div className="navbar-custom-form">
        <div className="navbar-logo">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            style={{ cursor: 'pointer' }}
            onClick={logoClick}
          />
        </div>
        <a className='phone' href="tel:02-651-6325">*6031</a>
      </div>

    <div className="Form">
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
            options={langues.map(lang => ({ value: lang, label: lang }))}
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
          <div className='ruls'>
          <h2>תקנון הגשת בקשת סיוע</h2>
          <p>יש לשמור על פרטיות המתנדב ולא להקשות מעבר.</p>
          <p>אין לקחת מספרים ופרטים ולהתנהל מולם מלבד פלטפורמה זו,</p>
          <p>אלא אם כן, המתנדב אישר זאת גם אצלנו.</p>
          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={isTermsAccepted}
              onChange={() => setIsTermsAccepted(!isTermsAccepted)}
              required      
            />
            <label htmlFor="terms">אני מאשר את תנאי השימוש</label>
            </div>

          </div>


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

      <div className='pageEnd'>
      <h2>צור איתנו קשר ב - whatsapp </h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>

    </div>
  );
}

export default RequestForm;
