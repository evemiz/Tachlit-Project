import '../style.css';
import citiesInIsrael from '../Cities';
import volunteerings from '../Volunteerings';
import langueges from '../Languges'
import { React, useState } from "react";
import Select from 'react-select';
import {validateData, addDocument} from "./RequestFunctions.js"

function RequestForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState("");
  const [volSelectedOptions, setVolSelectedOptions] = useState("");
  const [langSelectedOptions, setLangSelectedOptions] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: contact,
      city: citySelectedOption,
      langueges: langSelectedOptions,
      volunteering : volSelectedOptions, 
      date : date,
      time : time,
      comments : comments,
      status: "open"
    };

    if(validateData(formData)){
      addDocument("testRequests", formData);
    }
  };

  return (
    <div className="App">
      <h1>טופס בקשת סיוע חדשה</h1>
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

          <label htmlFor="tel">מספר טלפון</label>
          <input
            type="tel"
            name="contact"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="xxx-xxxxxxx"
            required
          />

          <label>עיר מגורים</label>
          <Select
            name="select"
            id="select"
            options={citiesInIsrael.map(city => ({ value: city, label: city}))}
            value={citySelectedOption}
            onChange={setCitySelectedOption}
            placeholder="בחר עיר מגורים"
          />

        <label>שפה מועדפת</label>
          <Select
            name="select"
            id="select"
            options={langueges.map(lang => ({ value: lang, label: lang}))}
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
            onChange={(e) => setDate(e.target.value)}
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
            onClick={(e) => handleSubmit(e)}
          >
            הגש בקשה
          </button>
        </form>
      </fieldset>
    </div>
  );
}

export default RequestForm;
