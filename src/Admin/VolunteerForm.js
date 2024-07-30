import React, { useState } from "react";
import Select from 'react-select';
import citiesInIsrael from "./db/Cities";
import languages from "./db/Languges";
import days from "./db/Days";
import volunteerings from "./db/Volunteerings";
import Modal from 'react-modal';
import { addDocument } from "./AdminFunctions";
import { handleApproveVolunteer } from './handleApproveVolunteer';

Modal.setAppElement('#root');

function VolunteerForm({ setIsSuccessModalOpen, setSuccessMessage, closeForm }) {
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
        langueges: langSelectedOptions.map(option => option.value),
        days: daySelectedOptions.map(option => option.value),
        emergency: available,
        volunteering: volSelectedOptions.map(option => option.value),
        vehicle: vehicle,
      };

      await addDocument("NewVolunteers", formData, id);
      await handleApproveVolunteer(id);

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
      closeForm(); // Close the form
      // window.location.reload(); // Refresh the page to show the new record

    }

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

      <h1>רישום מתנדב חדש</h1>
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
              options={languages.map(lang => ({ value: lang, label: lang }))}
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

          <button
            type="submit"
            value="Submit"
          >
            שלח
          </button>
        </form>
      </fieldset>
    </div>
  );
}

export default VolunteerForm;
