import '../style.css';
import { React, useState , useEffect} from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import {addDocument , doesDocumentExist} from "./VolunteerFunctions.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../LanguageSwitcher.js';
import { readDocuments , getHebValueByEn} from '../../Admin/EditFunctions.js'

Modal.setAppElement('#root');

function VolunteerForm() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en'; 
  const isRtl = i18n.language === 'he';
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
  const [userExist, setUserExist] = useState(false);
  const [contactValid, setContactValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

  const [dayOptions, setDayOptions] = useState([]); 
  const [cityOptions, setCityOptions] = useState([]); 
  const [langOptions, setLangOptions] = useState([]); 
  const [volOptions, setVolOptions] = useState([]); 

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const data = await readDocuments('Days'); 
        const field = isEnglish ? 'en' : 'heb';
        const formattedDays = data.map(doc => ({ value: doc[field], label: doc[field] }));
        setDayOptions(formattedDays);
      } catch (error) {
        console.error('Error fetching days:', error);
      }
    };

    fetchDays();
  }, [isEnglish]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await readDocuments('Cities'); 
        const field = isEnglish ? 'en' : 'heb';
        const formattedCities = data.map(doc => ({ value: doc[field], label: doc[field] }));
        setCityOptions(formattedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, [isEnglish]);

  useEffect(() => {
    const fetchLang = async () => {
      try {
        const data = await readDocuments('Languages'); 
        const field = isEnglish ? 'en' : 'heb';
        const formattedLang = data.map(doc => ({ value: doc[field], label: doc[field] }));
        setLangOptions(formattedLang);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLang();
  }, [isEnglish]);

  useEffect(() => {
    const fetchVol = async () => {
      try {
        const data = await readDocuments('Volunteerings'); 
        const field = isEnglish ? 'en' : 'heb';
        const formattedVol = data.map(doc => ({ value: doc[field], label: doc[field] }));
        setVolOptions(formattedVol);
      } catch (error) {
        console.error('Error fetching volunteerings:', error);
      }
    };

    fetchVol();
  }, [isEnglish]);

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

      const docExists1 = await doesDocumentExist("Volunteers", id);
      const docExists2 = await doesDocumentExist("NewVolunteers", id);
        if (docExists1 || docExists2) {
            console.log("The user exists");
            setUserExist(true);
            return;
        }
        else {
          setUserExist(false);
        }

    let translatedDay = daySelectedOptions.map(option => option.value);
    let translatedLang = langSelectedOptions.map(option => option.value);
    let translatedVol = volSelectedOptions.map(option => option.value);
    let translatedCity = citySelectedOption ? citySelectedOption.label : "";

    // Translate values to Hebrew if language is English
    if (isEnglish) {
      translatedCity = await getHebValueByEn('Cities', citySelectedOption.label);

      const translatedLangPromises = langSelectedOptions.map(option =>
        getHebValueByEn('Languages', option.label)
      );

      const translatedVolPromises = volSelectedOptions.map(option =>
        getHebValueByEn('Volunteerings', option.label)
      );

      const translatedDaysPromises = daySelectedOptions.map(option =>
        getHebValueByEn('Days', option.label)
      );

      const [translatedLangArray, translatedVolArray, translatedDaysArray] = await Promise.all([
        Promise.all(translatedLangPromises),
        Promise.all(translatedVolPromises),
        Promise.all(translatedDaysPromises),
      ]);

      translatedLang = translatedLangArray;
      translatedVol = translatedVolArray;
      translatedDay = translatedDaysArray;
    }

      const formData = {
        firstName: firstName,
        lastName: lastName,
        ID: id,
        phoneNumber: contact,
        mail: email,
        city: translatedCity,
        languages: translatedLang,
        days: translatedDay,
        emergency: available,
        volunteering: translatedVol,
        vehicle: vehicle,
      };

      await addDocument("NewVolunteers", formData, 'id');

      setSuccessMessage(t(`The request has been sent successfully`)); // Set success message
      setIsSuccessModalOpen(true); // Open success modal
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate("/TachlitHome");
  };

  const openWhatsAppChat = () => {
    // Replace with the WhatsApp chat link (replace placeholders with actual phone number and message)
    const phoneNumber = "+972527298294";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const logoClick = () => {
    navigate("/TachlitHome");
  }

  return (
    <div className="page">

    <div className="navbar-custom-form">
    <div className="navbar-buttons">
          <LanguageSwitcher />
        </div>
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

      <h1>{t('Registration for volunteering')}</h1>
      <fieldset>
        <form action="#" method="get" onSubmit={handleSubmit}>
        <div className='Fileds'>
          <label htmlFor="firstname">{t('first_name')}</label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            dir="rtl"
            required
          />
          <label htmlFor="lastname">{t('last_name')}</label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            dir="rtl"
            required
          />

          <label htmlFor="id">{t('id')}</label>
          <input
            type="text"
            name="id"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          {!idValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>{t('Enter a valid ID')}</label>
          )}

          <label htmlFor="tel">{t('phone_number')}</label>
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
            <label style={{ color: 'red', fontSize: '12px' }}>{t('Enter a valid Phone Number')}</label>
          )}

        <label htmlFor="mail">{t('mail')}</label>
          <input
            name="mail"
            type='text'
            id="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!emailValid && (
            <label style={{ color: 'red', fontSize: '12px' }}>{t('Enter a valid Email')}</label>
          )}

          <label>{t('city')}</label>
          <Select
            name="select"
            options={cityOptions}
            value={citySelectedOption}
            onChange={setCitySelectedOption}
            placeholder= {t('select_city')}
            required
          />

          <label>{t('volunteerings')}</label>
          <Select
            isMulti
            name="volunteerings"
            options={volOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={volSelectedOptions}
            onChange={setVolSelectedOptions}
            placeholder={t('volunteerings_select')}
            required
          />

          <label>{t('days_of_availability')}</label>
          <Select
            isMulti
            name="days"
            options={dayOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={daySelectedOptions}
            onChange={setDaySelectedOptions}
            placeholder={t('select_days_of_availability')}
            required
          />

          <label>{t('languages')}</label>
          <Select
            isMulti
            name="languages"
            options={langOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={langSelectedOptions}
            onChange={setLangSelectedOptions}
            placeholder={t('select_languages')}
            required
          />

          <label htmlFor="available">{t('emergency_availability')}</label>
          <input
            type="radio"
            name="available"
            value="yes"
            id="yes"
            checked={available === true}
            onChange={(e) => setAvailable(true)}
          />
          {t('yes')}
          <input
            type="radio"
            name="available"
            value="no"
            id="no"
            checked={available === false}
            onChange={(e) => setAvailable(false)}
          />
          {t('no')}

          <label htmlFor="vehicle">{t('vehicle')}</label>
          <input
            type="radio"
            name="vehicle"
            value="yes"
            id="vehicleYes"
            checked={vehicle === true}
            onChange={(e) => setVehicle(true)}
          />
          {t('yes')}
          <input
            type="radio"
            name="vehicle"
            value="no"
            id="vehicleNo"
            checked={vehicle === false}
            onChange={(e) => setVehicle(false)}
          />
          {t('no')}

          <br></br>
          </div>

          <div className='ruls'>
          <h2>{t('ruls_vol_title')}</h2>
          <p>{t('ruls_vol1')}</p>
          <p>{t('ruls_vol2')}</p>


          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={isTermsAccepted}
              onChange={() => setIsTermsAccepted(!isTermsAccepted)}
              required      
            />
            <label htmlFor="terms">{t('accept_terms')}</label>
          </div>

          </div>
          {userExist && (
            <label style={{ color: 'red', fontSize: '12px' }}>{t('User Exist')}</label>
          )}
          <button
            type="submit"
            value="Submit"
          >
            {t('submit')}
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
        <button
            onClick={handleSuccessModalClose}
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

        <h2>{t('done_successfully')}</h2>
        <p>{successMessage}</p>

      </Modal>
      </div>


      <div className='pageEnd'>
      <h2>{t('contact_whatsapp')} </h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>

    </div>
  );
}

export default VolunteerForm;
