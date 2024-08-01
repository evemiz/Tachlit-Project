import '../style.css';
import { React, useState , useEffect} from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import { addDocument, addFieldToDocument, addMatchToDocument } from "./RequestFunctions.js";
import days from './Days.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../LanguageSwitcher.js';
import { readDocuments , getHebValueByEn} from '../../Admin/EditFunctions.js'

Modal.setAppElement('#root'); // Ensure modal works correctly with screen readers

function RequestForm() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en'; 
  const isRtl = i18n.language === 'he';
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

  const [cityOptions, setCityOptions] = useState([]); 
  const [langOptions, setLangOptions] = useState([]); 
  const [volOptions, setVolOptions] = useState([]); 

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
        const data = await readDocuments('VolunteeringsRequest'); 
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
  
    if (!firstName || !lastName || !id || !contact || !citySelectedOption || !volSelectedOptions || !langSelectedOptions || !date || !time) {
      isValid = false;
    }
  
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(contact)) {
      setContactValid(false);
      isValid = false;
    } else {
      setContactValid(true);
    }
  
    const idRegex = /^\d{9}$/;
    if (!idRegex.test(id)) {
      setIdValid(false);
      isValid = false;
    } else {
      setIdValid(true);
    }
  
    if (isValid) {
      let translatedLang = langSelectedOptions ? langSelectedOptions.label : "";
      let translatedVol = volSelectedOptions ? volSelectedOptions.label : "";
      let translatedCity = citySelectedOption ? citySelectedOption.label : "";
  
      // Translate values to Hebrew if language is English
      if (isEnglish) {
        translatedLang = await getHebValueByEn('Languages', langSelectedOptions.label);
        translatedVol = await getHebValueByEn('Volunteerings', volSelectedOptions.label);
        translatedCity = await getHebValueByEn('Cities', citySelectedOption.label);
      }
  
      console.log (translatedLang);
      const formData = {
        firstName: firstName,
        lastName: lastName,
        ID: id,
        phoneNumber: contact,
        city: translatedCity,
        languages: translatedLang,
        volunteering: translatedVol,
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
          let qCity = query(volunteersCollection, where('city', '==', translatedCity));
          const queryCitySnapshot = await getDocs(qCity);
  
          // Filter city results further by language
          let filteredDocs = queryCitySnapshot.docs;
          if (translatedLang) {
            filteredDocs = filteredDocs.filter(doc => {
              const data = doc.data();
              return data.languages && data.languages.includes(translatedLang);
            });
          }
  
          // Filter city and language results further by volunteering
          if (translatedVol) {
            filteredDocs = filteredDocs.filter(doc => {
              const data = doc.data();
              return data.volunteering && data.volunteering.includes(translatedVol);
            });
          }
  
          // Filter city, language and volunteering results further by day
          if (translatedVol) {
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
            try {
              for (const id of volunteerIds) {
                await addMatchToDocument('Volunteers', id, docRef.id);
              }
            } catch (error) {
              console.error(`Error updating volunteer documents: ${error}`);
            }
          }
  
          setSuccessMessage(t(`The request has been sent successfully`)); // Set success message
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
        <h1>{t('Sending a request for assistance')}</h1>
        <fieldset>
          <form action="#" method="get" onSubmit={handleSubmit}>
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
              required
              dir="rtl"
            />
            {!contactValid && (
              <label style={{ color: 'red', fontSize: '12px' }}>{t('Enter a valid Phone Number')}</label>
            )}

            <label htmlFor="city">{t('city')}</label>
            <Select
              name="city"
              id="city"
              options={cityOptions}
              value={citySelectedOption}
              onChange={setCitySelectedOption}
              placeholder={t('select_city')}
              required
            />

            <label htmlFor="volunteerings">{t('vol')}</label>
            <Select
              options={volOptions}
              value={volSelectedOptions}
              onChange={setVolSelectedOptions}
              placeholder={t('volunteering_select')}
              dir={isRtl ? 'rtl' : 'ltr'}
              required
            />

            <label htmlFor="languages">{t('language')}</label>
            <Select
              options={langOptions}
              value={langSelectedOptions}
              onChange={setLangSelectedOptions}
              placeholder={t('select_language')}
              dir={isRtl ? 'rtl' : 'ltr'}
              required
            />

            <label htmlFor="date">{t('date')}</label>
            <input
              type="date"
              name="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              required
              dir="rtl"
            />

            <label htmlFor="time">{t('time')}</label>
            <input
              type="time"
              name="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              dir="rtl"
            />

          <label>{t('comments')}</label>
            <textarea
              name="comments"
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              dir="rtl"
            />

          <div className='ruls'>
            <h2>{t('ruls_request_title')}</h2>
            <p>{t('ruls_request1')}</p>
            <p>{t('ruls_request2')}</p>
            <p>{t('ruls_request3')}</p>
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

          <button
            type="submit"
            value="Submit"
          >
            {t('submit')}
          </button>
         </form>
        </fieldset>
      </div>

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

      <div className='pageEnd'>
      <h2>{t('contact_whatsapp')}</h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
            <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>

    </div>
  );
}

export default RequestForm;
