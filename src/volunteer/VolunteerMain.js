import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Modal from 'react-modal';
import { auth, db } from "../firebaseConfig";
import { arrayUnion, query, where, collection, getDocs, getDoc, doc, setDoc, updateDoc, arrayRemove } from "firebase/firestore";
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import logo from '../images/logo.png';
import {  faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher.js';
import { readDocuments , getHebValueByEn} from '../Admin/EditFunctions.js'

Modal.setAppElement('#root');

function VolunteerMain() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en'; 
  const isRtl = i18n.language === 'he';

  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPasswordIsOpen, setModalPasswordIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [citySelectedOption, setCitySelectedOption] = useState(null);
  const [volSelectedOptions, setVolSelectedOptions] = useState([]);
  const [daySelectedOptions, setDaySelectedOptions] = useState([]);
  const [langSelectedOptions, setLangSelectedOptions] = useState([]);
  const [available, setAvailable] = useState(false);
  const [vehicle, setVehicle] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState([]);
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsDetails, setMyRequestsDetails] = useState([]);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const isFetching = useRef(false);
  const [uid, setUid] = useState("");

  const [dayOptions, setDayOptions] = useState([]); 
  const [cityOptions, setCityOptions] = useState([]); 
  const [langOptions, setLangOptions] = useState([]); 
  const [volOptions, setVolOptions] = useState([]); 

  const [volunteerDict, setVolunteerDict] = useState({});

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
    const fetchVolList = async () => {
      try {
        const data = await readDocuments('Volunteerings'); 
        const field = isEnglish ? 'en' : 'heb';
        const formattedVol = data.map(doc => ({ value: doc[field], label: doc[field] }));
        setVolOptions(formattedVol);
      } catch (error) {
        console.error('Error fetching volunteerings:', error);
      }
    };

    fetchVolList();
  }, [isEnglish]);

  useEffect(() => {
    const fetchVol = async () => {
      try {
        const data = await readDocuments('Volunteerings'); 

        // Create dictionary with both Hebrew and English for each volunteering
        const volDict = data.reduce((acc, doc) => {
          acc[doc.heb] = { heb: doc.heb, en: doc.en };
          return acc;
        }, {});

        setVolunteerDict(volDict);

        // Log the dictionary
        console.log('Volunteer Dictionary:', volDict);
      } catch (error) {
        console.error('Error fetching volunteerings:', error);
      }
    };

    fetchVol();
  }, []); 

  const fetchVolRecord = useCallback(async () => {
    try {
      const q = query(collection(db, "Volunteers"), where("mail", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setDocumentId(doc.id);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setAvailable(data.emergency || false);
        setVehicle(data.vehicle || false);
        setUid(data.ID);
        setMatches(data.matches || []);
        setMyRequests(data.myRequests || []);
      } else {
        console.log("No matching document found");
      }
    } catch (error) {
      console.error("Error fetching volunteer record:", error);
    }
  }, [userId]);

  const fetchMatchDetails = useCallback(async () => {
    if (matches.length === 0 || isFetching.current) return;
    isFetching.current = true;

    try {
      const matchDetailsPromises = matches.map(async (matchId) => {
        const matchDocRef = doc(db, "AidRequests", matchId);
        const matchDocSnap = await getDoc(matchDocRef);
        return matchDocSnap.exists() ? { id: matchId, ...matchDocSnap.data() } : null;
      });

      const matchDetailsResults = await Promise.all(matchDetailsPromises);
      const validMatches = matchDetailsResults.filter(detail => detail && detail.status === "open");
      const invalidMatches = matchDetailsResults
        .filter(detail => detail && detail.status !== "open")
        .map(detail => detail.id);

      if (invalidMatches.length > 0) {
        const userDocRef = doc(db, "Volunteers", documentId);
        await updateDoc(userDocRef, {
          matches: arrayRemove(...invalidMatches)
        });
      }

      setMatches(validMatches.map(detail => detail.id));
      setMatchDetails(validMatches);
    } catch (error) {
      console.error("Error fetching match details:", error);
    } finally {
    }
  }, [matches, documentId]);

  const fetchMyRequestsDetails = useCallback(async () => {
    if (myRequests.length === 0) return;

    try {
      const myRequestsDetailsPromises = myRequests.map(async (myRequestsId) => {
        const myRequestsDocRef = doc(db, "AidRequests", myRequestsId);
        const myRequestsDocSnap = await getDoc(myRequestsDocRef);
        return myRequestsDocSnap.exists() ? { id: myRequestsId, ...myRequestsDocSnap.data() } : null;
      });

      const myRequestsDetailsResults = await Promise.all(myRequestsDetailsPromises);
      setMyRequestsDetails(myRequestsDetailsResults);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  }, [myRequests]);

  useEffect(() => {
    fetchVolRecord();
  }, [fetchVolRecord]);

  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    fetchMyRequestsDetails();
  }, [fetchMyRequestsDetails]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/TachlitHome");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  const openEditUser = async () => {
    setCitySelectedOption(null);
    setVolSelectedOptions([]);
    setDaySelectedOptions([]);
    setLangSelectedOptions([]);
    setModalIsOpen(true);
    setModalPasswordIsOpen(false);
  };

  const closeModal = async () => {
    setModalIsOpen(false);
    setModalPasswordIsOpen(false);
    setIsSuccessModalOpen(false);
  }

  const closeSignUpModal = () => {
    setSignUpModalIsOpen(false);
  };

  const openPasswordReset = async () => {
    setModalPasswordIsOpen(true);
    setModalIsOpen(false);
  }

  const handleChangePassword = (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage(t('password_requirements'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage(t('passwords_do_not_match'));
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setEmail("");
              setOldPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              setModalPasswordIsOpen(false);
              setPasswordChangeSuccess(true);
            })
            .catch((error) => {
              console.error("Error updating password:", error);
              setMessage(t('password_update_error'));
            });
        })
        .catch((error) => {
          console.error("Error reauthenticating user:", error);
          setMessage(t('reauthentication_error'));
        });
    } else {
      setMessage(t('email_mismatch'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      city: translatedCity,
      languages: translatedLang,
      days: translatedDay,
      emergency: available,
      volunteering: translatedVol,
      vehicle: vehicle,
    };

    try {
      const docRef = doc(db, "Volunteers", documentId);
      await setDoc(docRef, formData, { merge: true });
      setModalIsOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating volunteer:", error);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleApproveRequest = async (status, id) => {
    if (status === "open") {
      try {
        const docRef = doc(db, "AidRequests", id);
        await setDoc(docRef, { status: "in process" }, { merge: true });
        await setDoc(docRef, { volunteerMatch: documentId }, { merge: true });
        await updateDoc(docRef, { matches: null });

        const docRefVol = doc(db, "Volunteers", documentId);
        await updateDoc(docRefVol, { myRequests: arrayUnion(id) }, { merge: true });
        window.location.reload();
      } catch (error) {
        console.error("Error updating request:", error);
      }
    } else {
      console.error("status != open");
    }
  };

  const handleRemoveRequest = async (id) => {
    try {
      const volunteerDocRef = doc(db, "Volunteers", documentId);
      await updateDoc(volunteerDocRef, {
        matches: arrayRemove(id)
      });

      setMatches(matches.filter(matchId => matchId !== id));
      setMatchDetails(matchDetails.filter(match => match.id !== id));
    } catch (error) {
      console.error("Error removing request:", error);
    }
  };

  const closeRequest = async (id) => {
    try {
      const docRef = doc(db, 'AidRequests', id);
      await setDoc(docRef, { status: 'close' }, { merge: true });
      window.location.reload();
    } catch (error) {
      console.error('Error closing request:', error);
    }
  };

  const cancelRequest = async (id) => {
    try {
      const docRef = doc(db, 'AidRequests', id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        throw new Error('Request document does not exist');
      }
  
      const requestData = docSnap.data();
  
      await setDoc(docRef, { status: 'open' }, { merge: true });
      await setDoc(docRef, { volunteerMatch: null }, { merge: true });
  
      const volunteersCollection = collection(db, 'Volunteers');
  
      let qCity = query(volunteersCollection, where('city', '==', requestData.city));
      const queryCitySnapshot = await getDocs(qCity);
  
      let filteredDocs = queryCitySnapshot.docs;
      if (requestData.languages) {
        filteredDocs = filteredDocs.filter(doc => {
          const data = doc.data();
          return data.languages && data.languages.includes(requestData.languages);
        });
      }
  
      if (requestData.volunteering) {
        filteredDocs = filteredDocs.filter(doc => {
          const data = doc.data();
          return data.volunteering && data.volunteering.includes(requestData.volunteering);
        });
      }
  
      if (requestData.day) {
        filteredDocs = filteredDocs.filter(doc => {
          const data = doc.data();
          return data.days && data.days.includes(requestData.day);
        });
      }
  
      const volunteerIds = filteredDocs.map(doc => doc.id);
      console.log('Volunteer IDs:', volunteerIds);
  
      await setDoc(docRef, { matches: volunteerIds }, { merge: true });
  
      if (volunteerIds.length > 0) {
        try {
          for (const volunteerId of volunteerIds) {
            await addMatchToDocument('Volunteers', volunteerId, id);
          }
        } catch (error) {
          console.error(`Error updating volunteer documents: ${error}`);
        }
      }
  
      window.location.reload();
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };
  

  const addMatchToDocument = async (collectionName, documentId, fieldValue) => {
    try {
      const docRef = doc(db, collectionName, documentId);
  
      // Get the document to check if the 'matches' field exists
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData.matches) {
          // If the 'matches' field exists, add the value to the array
          await updateDoc(docRef, {
            matches: arrayUnion(fieldValue)
          });
        } else {
          // If the 'matches' field does not exist, create it and set the value
          await updateDoc(docRef, {
            matches: [fieldValue]
          });
        }
      } 
      return true;
    } catch (error) {
      console.error("Error adding field to document: ", error);
      return false;
    }
  };

  const sortedRequests = useMemo(() => {
    const inProcessRequests = myRequestsDetails.filter(cur => cur && cur.status === 'in process' && cur.volunteerMatch === uid);
    const closedRequests = myRequestsDetails.filter(cur => cur && cur.status === 'close' && cur.volunteerMatch === uid);
    return [...inProcessRequests, ...closedRequests];
  }, [myRequestsDetails]);


  const openWhatsAppChat = () => {
    const phoneNumber = "+972527298294";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };
  

  return (
    <div className='VolunteerMain'>
      {userId == null &&
      <div className="error">
        <h1>404 - Page Not Found</h1>
        <p>.The page you are looking for does not exist</p>
      </div>
      }
      {userId != null && 
      <div className='VolunteerMain'>
        <div className="navbar-custom">
        <div className="navbar-logo">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="navbar-buttons">
          <button className='btn' onClick={openEditUser}>{t('edit_profile')}</button>
          <button className='btn' onClick={openPasswordReset}>{t('change_password')}</button>
          <LanguageSwitcher />
          <button className='btn-logout' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>

      <div className={`modal-container ${isRtl ? 'rtl' : 'ltr'}`}>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit User Modal"
        >
          <button
            onClick={closeModal}
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
          <div className='volunteerApp'>
            <h1>{t('edit_user_details')}</h1>
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

              <label>{t('city')}</label>
              <Select
                name="select"
                options={cityOptions}
                value={citySelectedOption}
                onChange={setCitySelectedOption}
                placeholder={t('select_city')}
                className="basic-multi-select"
                classNamePrefix="select"
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

              <br />
              <button type="submit" value="Submit">
                {t('confirm_edit')}
              </button>
              </form>
          </div>
        </Modal>
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={handleSuccessModalClose}
          contentLabel="Success"
          className="Modal"
          overlayClassName="Overlay"
        >
        <button
            onClick={closeModal}
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

      <div className='modal-container'>
        <Modal
          isOpen={modalPasswordIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit User Modal"
        >
        <button
            onClick={closeModal}
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
          <div className='passwordVolUpdate'>
            <h1>{t('change_password')}</h1>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder={t('old_password')}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                dir="rtl"
              />
              <input
                type="password"
                placeholder={t('new_password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                dir="rtl"
              />
              <input
                type="password"
                placeholder={t('again_password')}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                dir="rtl"
              />
              <button type="submit">{t('confirm')}</button>
            </form>
            {message && <p>{message}</p>}
          </div>
        </Modal>

        <Modal
          isOpen={passwordChangeSuccess}
          onRequestClose={() => setPasswordChangeSuccess(false)}
          contentLabel="Password Change Success Modal"
        >
          <div className='message'>
            <button className='close-model-but' onClick={() => setPasswordChangeSuccess(false)}>X</button>
            <h1>{t('password_change_success')}</h1>
            <Modal closeModal={closeSignUpModal} />
          </div>
        </Modal>
      </div>




      <div className="boxes-container">
        <div className="box">
          <h2>{t('relevant_requests_title')}</h2>
          {matchDetails.length > 0 ? (
            matchDetails
            .filter((match) => new Date(match.date) >= new Date())
            .map((match) => (
              <div key={match.id} className="match-container">
                <div className="Request">
                <table className={`match-details-table ${isRtl ? 'rtl' : 'ltr'}`}>
                  <tbody>
                    <tr>
                      <td><strong>{t('assistance_requester')}</strong></td>
                      <td>{`${match.firstName + " " + match.lastName}`}</td>
                    </tr>
                    <tr>
                      <td><strong>{t('type_of_request')}</strong></td>
                      <td>
                          {isEnglish
                            ? volunteerDict[match.volunteering]?.en || t('not_available')
                            : volunteerDict[match.volunteering]?.heb || t('not_available')}
                        </td>
                    </tr>
                    <tr>
                      <td><strong>{t('date')}</strong></td>
                      <td>{` ${t(`he-days.${match.day}`)} ${formatDate(match.date)}`}</td>
                    </tr>
                    <tr>
                      <td><strong>{t('time')}</strong></td>
                      <td>{`${match.time}`}</td>
                    </tr>
                    {match.comments && 
                      <tr>
                        <td><strong>{t('comments')}</strong></td>
                        <td>{match.comments}</td>
                      </tr>
                    }
                  </tbody>
                </table>
                  <button onClick={() => handleApproveRequest(match.status, match.id)}>{t('approve_request')}</button>
                  <button onClick={() => handleRemoveRequest(match.id)}>{t('remove_request')}</button>
                </div>
              </div>
            ))
          ) : (
            <p>{t('no_matches_found')}</p>
          )}
        </div>

        <div className={`box ${isRtl ? 'rtl' : 'ltr'}`}>
      <h2>{t('my_requests')}</h2>
      {sortedRequests.length > 0 ? (
        sortedRequests.map((cur) => (
          <div key={cur.id} className="myRequests-container">
            <div className="Request">
              <table className={`match-details-table ${isRtl ? 'rtl' : 'ltr'}`}>
                <tbody>
                  <tr>
                    <td><strong>{t('assistance_requester')}</strong></td>
                    <td>{`${cur.firstName} ${cur.lastName}`}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('type_of_request')}</strong></td>
                    <td>
                          {isEnglish
                            ? volunteerDict[cur.volunteering]?.en || t('not_available')
                            : volunteerDict[cur.volunteering]?.heb || t('not_available')}
                        </td>
                  </tr>
                  <tr>
                    <td><strong>{t('date')}</strong></td>
                    <td>{`${t(`he-days.${cur.day}`)} ${formatDate(cur.date)}`}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('time')}</strong></td>
                    <td>{cur.time}</td>
                  </tr>
                  {cur.comments && 
                    <tr>
                      <td><strong>{t('comments')}</strong></td>
                      <td>{cur.comments}</td>
                    </tr>
                  }
                  <tr>
                    <td><strong>{t('phone_number')}</strong></td>
                    <td>{cur.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('status')}</strong></td>
                    <td>
                      {cur.status === 'in process' ? (
                        <strong>{<span style={{ color: '#009ba6', fontSize: '20px'}}>{t('in_process')}</span>}</strong>
                      ) : (
                        <strong><span style={{ color: '#dc3545', fontSize: '20px' }}>{t('done')}</span></strong>
                      )}
                    </td>
                  </tr>
                </tbody>  
              </table>

              {cur.status === 'in process' && (
                <div>
                  <button onClick={() => closeRequest(cur.id)}>{t('close_request')}</button>
                  <button onClick={() => cancelRequest(cur.id)}>{t('cancel')}</button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>{t('no_in_process_requests')}</p>
      )}
    </div>
      </div>

      <div className='pageEnd'>
        <h2>{t('contact_whatsapp')}</h2>
        <button className="whatsapp-button" onClick={openWhatsAppChat}>
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </button>
      </div>
      </div>
      }
      
    </div>
  );
}

export default VolunteerMain;
