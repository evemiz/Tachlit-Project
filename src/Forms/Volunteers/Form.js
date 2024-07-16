import '../style.css';
import citiesInIsrael from '../Cities';
import volunteerings from '../Volunteerings';
import { React, useState } from "react";
import Select from 'react-select';
import days from '../Days';
import langues from '../Languges';
import Modal from 'react-modal';
import {addDocument } from "./VolunteerFunctions.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { useNavigate } from "react-router-dom";

Modal.setAppElement('#root'); // Ensure modal works correctly with screen readers

function VolunteerForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState("");
  const [volSelectedOptions, setVolSelectedOptions] = useState([]);
  const [daySelectedOptions, setDaySelectedOptions] = useState([]);
  const [langSelectedOptions, setLangSelectedOptions] = useState([]);
  const [available, setAvailable] = useState(Boolean);
  const [vehicle, setVehicle] = useState(Boolean);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [idValid, setIdValid] = useState(true);
  const [contactValid, setContactValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValid(false);
      isValid = false;
    } else {
      setEmailValid(true);
    }

    if (isValid) {
      const formData = {
        firstName: firstName,
        lastName: lastName,
        ID: id,
        phoneNumber: contact,
        mail: email,
        city: citySelectedOption ? citySelectedOption.label : "",
        languages: langSelectedOptions.map(option => option.value),
        days: daySelectedOptions.map(option => option.value),
        emergency: available,
        volunteering: volSelectedOptions.map(option => option.value),
        vehicle: vehicle,
      };

      await addDocument("NewVolunteers", formData, 'id');

      // Reset the form
      setFirstName("");
      setLastName("");
      setId("");
      setContact("");
      setEmail("");
      setCitySelectedOption("");
      setVolSelectedOptions([]);
      setDaySelectedOptions([]);
      setLangSelectedOptions([]);
      setAvailable(Boolean);
      setVehicle(Boolean);
      setSuccessMessage("הטופס נשלח בהצלחה!"); // Set success message
      setIsSuccessModalOpen(true); // Open success modal
    }
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

  return (
    <div className="page">
    <div className="Form">

      <h1>הרשמה להתנדבות בתכלית</h1>
      <fieldset>
        <form action="#" method="get" onSubmit={handleSubmit}>
        <div className='Fileds'>
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
            dir="rtl"
            required
          />
          {!contactValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>הקלד מספר טלפון חוקי</label>
          )}

        <label htmlFor="mail">כתבות דוא״ל</label>
          <input
            name="mail"
            type='text'
            id="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!emailValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>הקלד דוא״ל חוקי</label>
          )}

          <label>עיר מגורים</label>
          <Select
            name="select"
            options={citiesInIsrael.map(city => ({ value: city, label: city }))}
            value={citySelectedOption}
            onChange={setCitySelectedOption}
            placeholder="בחר עיר מגורים"
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
            name="languages"
            options={langues.map(lang => ({ value: lang, label: lang }))}
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

          <br></br>
          </div>

          <div className='ruls'>
          <h2>תקנון למתנדב חדש</h2>
          <p>יש לשמור על אנונימיות של מבקש הסיוע ולנהוג</p>
          <p>בסובלנות ובחמלה כלפי מבקש הסיוע.</p>


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


      <div className='footer'>
      <h2>צור איתנו קשר ב - whatsapp </h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>




    </div>
  );
}

export default VolunteerForm;
