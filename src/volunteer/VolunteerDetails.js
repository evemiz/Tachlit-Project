import citiesInIsrael from '../Forms/Cities.js';
import volunteerings from '../Forms/Volunteerings.js';
import { React, useState } from "react";
import Select from 'react-select';
import days from '../Forms/Days.js';
import langueges from '../Forms/Languges.js';
import Modal from 'react-modal';
import { db } from '../firebaseConfig.js';
import { validateData } from '../Forms/Volunteers/VolunteerFunctions.js';
import { doc, setDoc } from 'firebase/firestore';

Modal.setAppElement('#root'); 

const VolunteerDetails = ({ volunteer }) => {
    const [firstName, setFirstName] = useState(volunteer.firstName || "");
    const [lastName, setLastName] = useState(volunteer.lastName || "");
    const [citySelectedOption, setCitySelectedOption] = useState({
      value: volunteer.city,
      label: volunteer.city
    });
    const [volSelectedOptions, setVolSelectedOptions] = useState(
        volunteer.volunteering ? volunteer.volunteering.map(vol => ({ value: vol, label: vol })) : []
      );
      
      const [daySelectedOptions, setDaySelectedOptions] = useState(
        volunteer.days ? volunteer.days.map(day => ({ value: day, label: day })) : []
      );
      
      const [langSelectedOptions, setLangSelectedOptions] = useState(
        volunteer.langueges ? volunteer.langueges.map(lang => ({ value: lang, label: lang })) : []
      );
    
    const [available, setAvailable] = useState(volunteer.emergency || false);
    const [vehicle, setVehicle] = useState(volunteer.vehicle || false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const formData = {
        firstName: firstName,
        lastName: lastName,
        id: volunteer.id,
        phoneNumber: volunteer.phoneNumber,
        mail: volunteer.mail,
        city: citySelectedOption ? citySelectedOption.label : "",
        langueges: langSelectedOptions.map(option => option.value),
        days: daySelectedOptions.map(option => option.value),
        emergency: available,
        volunteering: volSelectedOptions.map(option => option.value),
        vehicle: vehicle,
      };
  
      if (validateData(formData)) {
        try {
            const docRef = doc(db, "Volunteers", volunteer.id);
            await setDoc(docRef, { firstName: firstName }, { merge: true });
            await setDoc(docRef, { lastName: lastName }, { merge: true });
            await setDoc(docRef, { city: citySelectedOption ? citySelectedOption.label : "" }, { merge: true });
            await setDoc(docRef, { langueges: langSelectedOptions.map(option => option.value) }, { merge: true });
            await setDoc(docRef, { days: daySelectedOptions.map(option => option.value) }, { merge: true });
            await setDoc(docRef, { emergency: available }, { merge: true });
            await setDoc(docRef, { volunteering: volSelectedOptions.map(option => option.value) }, { merge: true });
            await setDoc(docRef, { vehicle: vehicle }, { merge: true });
        } catch (error) {
            console.error("Error updating status:", error);
        }
      }
    };
  
    const handleSuccessModalClose = () => {
      setIsSuccessModalOpen(false);
    };
  
    return (
      <div className="App">
        <fieldset>
          <form action="#" method="get" onSubmit={handleSubmit}>
            <label htmlFor="firstname">שם פרטי</label>
            <input
              placeholder={volunteer.firstName}
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
              placeholder={volunteer.lastName}
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
  
            <button type="submit" value="Submit">
              אישור עריכה
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
            <button className="modal-button confirm" onClick={handleSuccessModalClose}>
              סגור
            </button>
          </div>
        </Modal>
      </div>
    );
  };
  
  export default VolunteerDetails;
  