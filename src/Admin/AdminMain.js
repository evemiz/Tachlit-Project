import React, { useState, useEffect, useCallback } from "react";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import ListDisplay from '../ListDisplay';
import SignUpNewAdmin from './SignUpNewAdmin';
import Statistics from './Statistics';
import { readDocuments, addDocument, deleteDocument, updateDocument } from './AdminFunctions';
import { handleApproveVolunteer } from './handleApproveVolunteer';
import citiesInIsrael from "./db/Cities";
import languages from "./db/Languges";
import days from "./db/Days";
import volunteerings from "./db/Volunteerings";
import Select from 'react-select';
import '@fontsource/rubik';
import logo from '../images/logo.png';
import '../custom.css';
import '../navbar.css';
import { faSignOutAlt, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RequestForm from './RequestForm';
import VolunteerForm from './VolunteerForm';

Modal.setAppElement('#root');

const columnMapping = {
  firstName: 'שם פרטי ',
  lastName: ' שם משפחה ',
  phoneNumber: 'מספר טלפון ',
  langueges: 'שפות ',
  ID: 'ת.ז. ',
  city: 'עיר ',
  days: ' ימים',
  volunteering: 'התנדבויות ',
  mail: 'Email ',
  date: ' תאריך ',
  time: 'שעה ',
  comments: 'הערות ',
  emergency: 'חירום ',
  vehicle: 'רכב ',
  matches: 'התאמות ',
  volunteerMatch: 'מתנדב '
};

const fixedColumnOrder = ['firstName', 'lastName', 'ID', 'phoneNumber', 'mail', 'langueges', 'city', 'days', 'volunteering', 'date', 'time', 'comments', 'emergency', 'vehicle'];

const filterOptions = {
  city: citiesInIsrael,
  langueges: languages,
  days: days,
  volunteering: volunteerings
};

const columnDataTypes = {
  firstName: 'string',
  lastName: 'string',
  phoneNumber: 'string',
  langueges: 'array',
  city: 'string',
  days: 'array',
  volunteering: 'array',
  mail: 'string',
  date: 'date',
  time: 'string',
  comments: 'string',
  vehicle: 'boolean',
  emergency: 'boolean',
  ID: 'string',
  matches: 'array',
  volunteerMatch: 'string'
};

function AdminMain() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);
  const [statsModalIsOpen, setStatsModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [volunteersThisMonth, setVolunteersThisMonth] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [closedRequestsThisMonth, setClosedRequestsThisMonth] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [inProcessRequests, setInProcessRequests] = useState(0);
  const [selectedList, setSelectedList] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(() => {});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [status, setStatus] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState({});
  const [date, setDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [volunteerModalIsOpen, setVolunteerModalIsOpen] = useState(false);
  const [currentVolunteerDetails, setCurrentVolunteerDetails] = useState(null);
  const [matchesModalIsOpen, setMatchesModalIsOpen] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          setIsSuperAdmin(userDoc.data().superAdmin === true);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const volunteersData = await readDocuments('Volunteers');
        setVolunteers(volunteersData);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }
    };
    fetchVolunteers();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [collectionName, status]);

  const fetchDashboardData = async () => {
    try {
      const newVolunteersRef = collection(db, 'NewVolunteers');
      const newVolunteersSnapshot = await getDocs(newVolunteersRef);
      setVolunteersThisMonth(newVolunteersSnapshot.size);

      const totalVolunteersRef = collection(db, 'Volunteers');
      const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
      setTotalVolunteers(totalVolunteersSnapshot.size);

      const closedRequestsRef = collection(db, 'AidRequests');
      const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'));
      const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
      setClosedRequestsThisMonth(closedRequestsSnapshot.size);

      const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
      const openRequestsSnapshot = await getDocs(openRequestsQuery);
      setOpenRequests(openRequestsSnapshot.size);

      const inProcessRequestsQuery = query(closedRequestsRef, where('status', '==', 'in process'));
      const inProcessRequestsSnapshot = await getDocs(inProcessRequestsQuery);
      setInProcessRequests(inProcessRequestsSnapshot.size);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCollectionChange = (name) => {
    setCollectionName(name);
    setStatus("");
    setFilters({});
    setDocuments([]);
    fetchDocuments();
  };

  const handleCollectionChangeRequests = (name, status) => {
    setCollectionName(name);
    setStatus(status);
    setFilters({});
    setDocuments([]);
    fetchDocuments();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  };

  const fetchDocuments = useCallback(async () => {
    if (collectionName) {
      setLoading(true);
      setError(null);
      try {
        const docs = await readDocuments(collectionName, status);
        setDocuments(docs || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err.message);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
  }, [collectionName, status]);

  const confirmAction = (action, message) => {
    setModalAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };



  const handleAddRecord = async (e) => {
    e.preventDefault();



    const formattedRecord = {};
    for (const [key, value] of Object.entries(newRecord)) {
      if (columnDataTypes[key] === 'boolean') {
        formattedRecord[key] = value === true || value === 'true';
      } else if (columnDataTypes[key] === 'array') {
        formattedRecord[key] = Array.isArray(value) ? value.map(item => item.value || item) : [];
      } else if (columnDataTypes[key] === 'object' && key === 'city') {
        formattedRecord[key] = value ? value.label : '';
      } else if (columnDataTypes[key] === 'date') {
        formattedRecord[key] = value ? new Date(value).toISOString().split('T')[0] : null;
      } else {
        formattedRecord[key] = value || '';
      }
    }

    const cleanedRecord = Object.fromEntries(
      Object.entries(formattedRecord).filter(([_, v]) => v !== undefined)
    );

    try {
      if (editMode) {
        confirmAction(() => updateDocument(collectionName, currentEditId, cleanedRecord), '?האם אתה בטוח שברצונך לערוך רשומה זו');
      } else {
        if (collectionName === 'Volunteers' && cleanedRecord.ID) {
          confirmAction(async () => {
            await addDocument('Volunteers', cleanedRecord, cleanedRecord.ID);
            await handleApproveVolunteer(cleanedRecord.ID); // Create user like 'אשר מתנדב חדש'
            window.location.reload(); // Refresh the page to show the new record
          }, '?האם אתה בטוח שברצונך להוסיף רשומה זו');
        } else {
          confirmAction(async () => {
            await addDocument(collectionName, cleanedRecord);
            window.location.reload(); // Refresh the page to show the new record
          }, '?האם אתה בטוח שברצונך להוסיף רשומה זו');
        }
      }
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} document:`, err);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type } = event.target;
    const newValue = type === 'radio' ? value === 'true' : value;
    setNewRecord(prevRecord => ({
      ...prevRecord,
      [name]: newValue
    }));
  };

  const handleSelectChange = (selectedOption, name) => {
    setNewRecord(prevRecord => ({
      ...prevRecord,
      [name]: selectedOption
    }));
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

  const handleDeleteRecord = (id) => {
    if (collectionName) {
      confirmAction(() => deleteDocument(collectionName, id), '?האם אתה בטוח שברצונך למחוק רשומה זו');
    }
  };

  const handleApproveNewVolunteer = (id) => {
    confirmAction(() => handleApproveVolunteer(id), '? האם אתה בטוח שברצונך לאשר מתנדב חדש זה');
  };

  const handleEditRecord = (doc) => {
    const formattedDoc = { ...doc };

    for (const key in formattedDoc) {
      if (columnDataTypes[key] === 'array') {
        if (typeof formattedDoc[key] === 'string') {
          formattedDoc[key] = formattedDoc[key].split(',').map(item => ({ value: item.trim(), label: item.trim() }));
        } else if (Array.isArray(formattedDoc[key])) {
          formattedDoc[key] = formattedDoc[key].map(item => ({ value: item, label: item }));
        }
      } else if (columnDataTypes[key] === 'date' && formattedDoc[key] instanceof Object && 'seconds' in formattedDoc[key]) {
        formattedDoc[key] = new Date(formattedDoc[key].seconds * 1000).toISOString().split('T')[0];
      }
    }

    setNewRecord(formattedDoc);
    setEditMode(true);
    setCurrentEditId(doc.id);
    setShowAddForm(true);
  };

  const getVolunteerNameById = (id) => {
    const volunteer = volunteers.find(vol => vol.ID === id);
    return volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : id;
  };

  const getVolunteerDetailsById = (id) => {
    return volunteers.find(vol => vol.ID === id);
  };

  const getColumns = () => {
    if (documents.length === 0) return [];
    const docKeys = Object.keys(documents[0]).filter(key => key);
    const columns = fixedColumnOrder.filter(column => docKeys.includes(column));

    if (collectionName === 'AidRequests') {
      if (status === 'open') {
        columns.push('matches');
      } else {
        columns.push('volunteerMatch');
      }
    }

    return columns;
  };

  const getFilteredDocuments = () => {
    if (Object.keys(filters).length === 0) return documents;

    const filteredDocs = documents.filter(doc => {
      return Object.keys(filters).every(key => {
        if (!filters[key] || filters[key].length === 0) return true;

        const docValue = doc[key];
        if (Array.isArray(docValue)) {
          return filters[key].every(filterValue => docValue.includes(filterValue));
        } else if (typeof docValue === 'object' && docValue !== null) {
          return filters[key].some(filterValue => docValue.value === filterValue);
        } else if (typeof docValue === 'boolean') {
          return filters[key] === docValue;
        } else {
          return docValue.includes(filters[key]);
        }
      });
    });

    return filteredDocs;
  };

  const columns = getColumns();
  const filteredDocuments = getFilteredDocuments();

  const handleModalConfirm = async () => {
    await modalAction();
    setIsModalOpen(false);
    fetchDocuments();
    setSuccessMessage('!הפעולה בוצעה בהצלחה');
    setIsSuccessModalOpen(true);
    setNewRecord({});
    setEditMode(false);
    setCurrentEditId(null);
    setShowAddForm(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    window.location.reload();

  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("");
  };

  const openSignUpModal = () => {
    setSignUpModalIsOpen(true);
  };

  const openStatsModal = () => {
    setStatsModalIsOpen(true);
  };

  const closeStatsModal = () => {
    setStatsModalIsOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage(".הסיסמאות אינן תואמות");
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setMessage("הסיסמה שונתה בהצלחה");
              closeModal();
            })
            .catch((error) => {
              console.error("Error updating password:", error);
              setMessage("שגיאה בעדכון הסיסמה");
            });
        })
        .catch((error) => {
          console.error("Error reauthenticating user:", error);
          setMessage(".שגיאה באימות המשתמש. נא לבדוק את הסיסמה הישנה");
        });
    } else {
      setMessage("האימייל שהוזן אינו תואם את האימייל של המשתמש המחובר");
    }
  };

  const toggleFilterVisibility = (column) => {
    setFilterVisibility(prevState => ({
      ...prevState,
      [column]: !prevState[column]
    }));
  };

  const renderFilterForColumn = (column) => {
    const columnType = columnDataTypes[column];

    switch (columnType) {
      case 'boolean':
        return (
          <div className="filter-box">
            <label>
              <input
                type="radio"
                name={`filter-${column}`}
                value="true"
                onChange={() => handleFilterChange(column, true)}
                checked={filters[column] === true}
              />
              כן
            </label>
            <label>
              <input
                type="radio"
                name={`filter-${column}`}
                value="false"
                onChange={() => handleFilterChange(column, false)}
                checked={filters[column] === false}
              />
              לא
            </label>
            <label>
              <input
                type="radio"
                name={`filter-${column}`}
                value=""
                onChange={() => handleFilterChange(column, '')}
                checked={filters[column] === ''}
              />
              הכל
            </label>
          </div>
        );
      case 'array':
        return (
          filterOptions[column] ? (
            <Select
              options={filterOptions[column].map(item => ({ value: item, label: item }))}
              isMulti
              onChange={selectedOptions => handleFilterChange(column, selectedOptions.map(option => option.value))}
              value={(filters[column] || []).map(value => ({ value, label: value }))}
            />
          ) : null
        );
      case 'date':
        return (
          <input
            type="date"
            value={filters[column] || ''}
            onChange={(e) => handleFilterChange(column, e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            value={filters[column] || ''}
            onChange={(e) => handleFilterChange(column, e.target.value)}
          />
        );
    }
  };

  const handleViewStatistics = () => {
    openStatsModal();
  };

  const handleVolunteerClick = (id) => {
    const volunteerDetails = getVolunteerDetailsById(id);
    setCurrentVolunteerDetails(volunteerDetails);
    setVolunteerModalIsOpen(true);
  };

  const handleMatchesClick = (matches) => {
    const matchDetails = matches.map(matchId => getVolunteerDetailsById(matchId));
    setSelectedMatches(matchDetails);
    setMatchesModalIsOpen(true);
  };

  return (
    <div className="AdminMainPage">
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
          <button onClick={openModal} className="btn btn-custom">שנה סיסמה</button>

          {isSuperAdmin && (
            <button onClick={openSignUpModal} className="btn btn-custom">הוספת מנהל חדש</button>
          )}
          <button onClick={handleViewStatistics} className="btn btn-custom">צפייה בדוחות</button>
          <button onClick={handleLogout} className="btn-logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
      <div className="admin-container">
        <h1 className="text-center my-4"></h1>
        <div className="topBar"></div>

        {selectedList ? (
          <ListDisplay collectionName={selectedList.collectionName} status={selectedList.status} />
        ) : (
          <div className="dashboard">
            <div className="dashboard-item"
              onClick={() => handleCollectionChange('NewVolunteers')}
              style={{
                backgroundColor: collectionName === 'NewVolunteers' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'NewVolunteers' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>מתנדבים ממתינים לאישור</h3>
              <p>{volunteersThisMonth}</p>
            </div>
            <div className="dashboard-item"
              onClick={() => handleCollectionChange('Volunteers')}
              style={{
                backgroundColor: collectionName === 'Volunteers' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'Volunteers' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>סך כל המתנדבים</h3>
              <p>{totalVolunteers}</p>
            </div>
            <div className="dashboard-item"
              onClick={() => handleCollectionChangeRequests('AidRequests', 'open')}
              style={{
                backgroundColor: collectionName === 'AidRequests' && status === 'open' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'AidRequests' && status === 'open' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>בקשות פתוחות</h3>
              <p>{openRequests}</p>
            </div>
            <div className="dashboard-item"
              onClick={() => handleCollectionChangeRequests('AidRequests', 'in process')}
              style={{
                backgroundColor: collectionName === 'AidRequests' && status === 'in process' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'AidRequests' && status === 'in process' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>בקשות בטיפול</h3>
              <p>{inProcessRequests}</p>
            </div>
            <div className="dashboard-item"
              onClick={() => handleCollectionChangeRequests('AidRequests', 'close')}
              style={{
                backgroundColor: collectionName === 'AidRequests' && status === 'close' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'AidRequests' && status === 'close' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>בקשות שנסגרו</h3>
              <p>{closedRequestsThisMonth}</p>
            </div>
          </div>
        )}

        <div className={`content ${showFilters ? 'sidebar-open' : ''}`}>
          {showAddForm && (
            editMode ? (
              <div className="add-form">
                <form onSubmit={handleAddRecord}>
                  {columns.map((column) => (
                    column !== 'matches' && (
                      <div key={column}>
                        <label>{columnMapping[column]}:</label>
                        {columnDataTypes[column] === 'boolean' ? (
                          <>
                            <input
                              type="radio"
                              name={column}
                              value="true"
                              checked={newRecord[column] === true}
                              onChange={handleInputChange}
                            /> כן
                            <input
                              type="radio"
                              name={column}
                              value="false"
                              checked={newRecord[column] === false}
                              onChange={handleInputChange}
                            /> לא  <br />
                          </>
                        ) : columnDataTypes[column] === 'array' ? (
                          <Select
                            name={column}
                            options={filterOptions[column]?.map(item => ({ value: item, label: item })) || []}
                            isMulti
                            value={newRecord[column]}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, column)}
                            placeholder={``}
                          />
                        ) : columnDataTypes[column] === 'object' ? (
                          <Select
                            name={column}
                            options={filterOptions[column]?.map(item => ({ value: item, label: item })) || []}
                            value={newRecord[column]}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, column)}
                            placeholder={``}
                          />
                        ) : columnDataTypes[column] === 'date' ? (
                          <input
                            type="date"
                            name={column}
                            value={newRecord[column] || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <input
                            type="text"
                            name={column}
                            value={newRecord[column] || ''}
                            onChange={handleInputChange}
                            className={!validationErrors[column] ? '' : 'invalid'}
                          />
                        )}
                        {validationErrors[column] && <span className="error-message">{validationErrors[column]}</span>}
                      </div>
                    )
                  ))}

                  <button className="lists-button" type="submit">{editMode ? 'עדכן' : 'אשר'}</button>
                  <button type="button" className="lists-button" onClick={() => { setShowAddForm(false); setNewRecord({}); setEditMode(false); setCurrentEditId(null); }}>בטל</button>
                  {collectionName === 'NewVolunteers' && editMode && <button type="button" className="lists-button" onClick={() => handleApproveNewVolunteer(currentEditId)}>אשר מתנדב חדש</button>}
                </form>
              </div>
            ) : collectionName === 'AidRequests' ? (
              <RequestForm
                setIsSuccessModalOpen={setIsSuccessModalOpen}
                setSuccessMessage={setSuccessMessage}
                closeForm={() => setShowAddForm(false)}
              />
            ) : collectionName === 'Volunteers' ? (
              <VolunteerForm
                setIsSuccessModalOpen={setIsSuccessModalOpen}
                setSuccessMessage={setSuccessMessage}
                closeForm={() => setShowAddForm(false)}
              />
            ) : null
          )}
          {((collectionName === 'Volunteers')||((collectionName === 'AidRequests')&& status === 'open')) && (
            <button className="lists-button" onClick={() => setShowAddForm(true)}>הוסף רשומה חדשה</button>
          )}
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {filteredDocuments.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {columns.map((key) => (
                      <th key={key}>
                        {columnMapping[key]}
                        <span
                          className="filter-arrow"
                          onClick={() => toggleFilterVisibility(key)}
                        >
                          ▼
                        </span>
                        {filterVisibility[key] && renderFilterForColumn(key)}
                      </th>
                    ))}
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, index) => (
                    <tr key={doc.id || index}>
                      {columns.map((column) => (
                        <td key={`${doc.id}-${column}`}>
                          {column === 'volunteerMatch' ? (
                            <span onClick={() => handleVolunteerClick(doc[column])}>
                              {getVolunteerNameById(doc[column])}
                            </span>
                          ) : column === 'matches' ? (
                            <button className="buttons-inside-table" onClick={() => handleMatchesClick(doc[column])}>
                              הצג התאמות
                            </button>
                          ) : Array.isArray(doc[column])
                            ? doc[column].map((item, idx) => (
                              <span key={`${doc.id}-${column}-${idx}`}>
                                {typeof item === 'object' && item !== null && 'label' in item
                                  ? item.label
                                  : item}
                                {idx < doc[column].length - 1 ? ', ' : ''}
                              </span>
                            ))
                            : typeof doc[column] === 'boolean'
                              ? doc[column] ? '✓' : '✗'
                              : typeof doc[column] === 'object' && doc[column] !== null && 'label' in doc[column]
                                ? doc[column].label
                                : typeof doc[column] === 'object'
                                  ? JSON.stringify(doc[column])
                                  : doc[column]}
                        </td>
                      ))}
                      <td>
                        <button className="buttons-inside-table" onClick={() => handleEditRecord(doc)}>ערוך</button>
                        <button className="buttons-inside-table" onClick={() => handleDeleteRecord(doc.id)}>מחק</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && !editMode && (
              <div>
                <table className="table">
                  <thead>
                    <tr>
                      {columns.map((key) => (
                        <th key={key}>
                          {columnMapping[key]}
                          <span
                            className="filter-arrow"
                            onClick={() => toggleFilterVisibility(key)}
                          >
                            ▼
                          </span>
                          {filterVisibility[key] && renderFilterForColumn(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalCancel}
        contentLabel="Confirmation"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Confirm Action</h2>
        <p>{modalMessage}</p>
        <div className="modal-buttons">
          <button className="modal-button confirm" onClick={handleModalConfirm}>אשר</button>
          <button className="modal-button cancel" onClick={handleModalCancel}>בטל</button>
        </div>
      </Modal>
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={handleSuccessModalClose}
        contentLabel="Success"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2> אישור</h2>
        <p>{successMessage}</p>
        <div className="modal-buttons">
          <button className="modal-button confirm" onClick={handleSuccessModalClose}>סגור</button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Change Password Modal"
        className={"Modal"}
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
          <h1>שינוי סיסמה</h1>
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="סיסמה ישנה"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              dir="rtl"
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              dir="rtl"
            />
            <input
              type="password"
              placeholder="הקש שוב את סיסמתך"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              dir="rtl"
            />
            <button type="submit">שנה סיסמה</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </Modal>

      <Modal
        isOpen={statsModalIsOpen}
        onRequestClose={closeStatsModal}
        contentLabel="Statistics Modal"
        className="StatsModal"
        overlayClassName="Overlay"
      >
         <button
            onClick={closeStatsModal}
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

        <Statistics closeModal={closeStatsModal} />
      </Modal>

      <Modal
        isOpen={volunteerModalIsOpen}
        onRequestClose={() => setVolunteerModalIsOpen(false)}
        contentLabel="Volunteer Details Modal"
        className="VolunteerModal"
        overlayClassName="Overlay"
      >
        <div>
          <h2>פרטי מתנדב</h2>
          {currentVolunteerDetails ? (
            <div>
              <p><strong>שם:</strong> {currentVolunteerDetails.firstName} {currentVolunteerDetails.lastName}</p>
              <p><strong>טלפון:</strong> {currentVolunteerDetails.phoneNumber}</p>
              <p><strong>דוא"ל:</strong> {currentVolunteerDetails.mail}</p>
              <p><strong>ת.ז.:</strong> {currentVolunteerDetails.ID}</p>
            </div>
          ) : (
            <p>לא נמצאו פרטים</p>
          )}
           <button
            onClick={() => setVolunteerModalIsOpen(false)}
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
        </div>
      </Modal>

      <Modal

        isOpen={matchesModalIsOpen}
        onRequestClose={() => setMatchesModalIsOpen(false)}
        contentLabel="Matches Modal"
        className="MatchesModal"
        overlayClassName="Overlay"
      >
        <button
            onClick={() => setMatchesModalIsOpen(false)}
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
        <div>
          <h2>פרטי התאמות</h2>
          {selectedMatches.length > 0 ? (
            <table className="matchesTable">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>ת.ז.</th>
                  <th>דוא"ל</th>
                </tr>
              </thead>
              <tbody>
                {selectedMatches.map((match, index) => (
                  <tr key={index}>
                    <td>{match.firstName} {match.lastName}</td>
                    <td>{match.phoneNumber}</td>
                    <td>{match.ID}</td>
                    <td>{match.mail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>לא נמצאו פרטים</p>
          )}

        </div>
      </Modal>
    </div>
  );
}

export default AdminMain;
