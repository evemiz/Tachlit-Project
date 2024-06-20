import '../style.css';
import citiesInIsrael from '../Cities';
import volunteerings from '../Volunteerings';
import { React, useState } from "react";
import Select from 'react-select';
import days from '../Days';
import langueges from '../Languges'
import {validateData, addDocument} from "./VolunteerFunctions.js"


function VolunteerForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [mail, setMail] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState("");
  const [volSelectedOptions, setVolSelectedOptions] = useState([]);
  const [daySelectedOptions, setDaySelectedOptions] = useState([]);
  const [langSelectedOptions, setLangSelectedOptions] = useState([]);
  const [available, setAvailable] = useState(Boolean);
  const [vehicle, setVehicle] = useState(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      firstName: firstName,
      lastName: lastName,
      id: id,
      phoneNumber: contact,
      mail: mail,
      city: citySelectedOption ? citySelectedOption.label : "",
      langueges: langSelectedOptions.map(option => option.value),
      days: daySelectedOptions.map(option => option.value),
      emergency: available,
      volunteering : volSelectedOptions.map(option => option.value), 
      vehicle: vehicle,
    };

    if(validateData(formData)){
      addDocument("NewVolunteers", formData);
    }

  };

  return (
    <div className="App">
      <h1>טופס רישום מתנדב חדש</h1>
      <fieldset>
        <form action="#" method="get">
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
                        onChange={(e) =>
                            setContact(e.target.value)
                        }
                        required
                    />

            <label htmlFor="mail">כתובת מייל</label>
                    <input
                        type="tel"
                        name="mail"
                        id="mail"
                        value={mail}
                        onChange={(e) =>
                            setMail(e.target.value)
                        }
                        required
                    />

          <label>עיר מגורים</label>
          <Select
            name="select"
            options={citiesInIsrael.map(city => ({ value: city, label: city}))}
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
            checked={available}
            onChange={(e) => setAvailable(true)}
          />
          כן
          <input
            type="radio"
            name="available"
            value="no"
            id="no"
            checked={!available}
            onChange={(e) => setAvailable(false)}
          />
          לא

          <label htmlFor="vehicle">רכב</label>
          <input
            type="radio"
            name="vehicle"
            value="yes"
            id="vehicleYes"
            checked={vehicle}
            onChange={(e) => setVehicle(true)}
          />
          כן
          <input
            type="radio"
            name="vehicle"
            value="no"
            id="vehicleNo"
            checked={!vehicle}
            onChange={(e) => setVehicle(false)}
          />
          לא

          <br></br>

          <button
            type="submit"
            value="Submit"
            onClick={(e) => handleSubmit(e)}
          >
            שלח
          </button>
        </form>
      </fieldset>
    </div>
  );
}

export default VolunteerForm;