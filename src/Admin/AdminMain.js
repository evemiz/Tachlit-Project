import React, { useState, useEffect } from "react";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import Modal from 'react-modal';
import '../custom.css';
import '../navbar.css';
import { useNavigate } from "react-router-dom";
import ListDisplay from '../ListDisplay';
import SignUpNewAdmin from './SignUpNewAdmin';
import { readDocuments, addDocument, deleteDocument, updateDocument } from './AdminFunctions';
import { handleApproveVolunteer } from './handleApproveVolunteer';
import citiesInIsrael from '../Forms/Cities.js';
import languages from '../Forms/Languges.js';
import days from '../Forms/Days.js';
import volunteering from '../Forms/Volunteerings.js';
import Select from 'react-select';
import '@fontsource/rubik';
import logo from '../images/logo.png';

const getColumnDisplayName = (columnName) => {
  const columnMapping = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    langueges: 'שפות',
    ID: 'ת.ז.',
    city: 'עיר',
    days: 'ימים',
    volunteering: 'התנדבויות',
    mail: 'Email',
    date: 'תאריך',
    time: 'שעה',
    comments: 'הערות',
    status: 'סטטוס',
    emergency: 'חירום',
    vehicle: 'רכב',
    matches: 'התאמות',
    // Add more mappings as necessary
  };
  return columnMapping[columnName] || columnName;
};

// Define the fixed column order
const fixedColumnOrder = ['firstName', 'lastName', 'ID', 'phoneNumber', 'langueges', 'city', 'days', 'volunteering', 'mail', 'date', 'time', 'comments', 'status', 'emergency', 'vehicle', 'matches'];

// Define predefined options for each filter (example)
const filterOptions = {
  city: citiesInIsrael,
  langueges: languages,
  days: days,
  volunteering: volunteering
};

// Define the data types for each column
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
  status: 'string',
  vehicle: 'boolean',
  emergency: 'boolean',
  ID: 'string',
  matches: 'array'
};


Modal.setAppElement('#root');

function AdminMain() {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);
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

  const handleCollectionChange = (name) => {
    setCollectionName(name);
    setStatus("");
    setFilters({});
    setDocuments([]);
  };

  const handleCollectionChangeRequests = (name, status) => {
    setCollectionName(name);
    setStatus(status);
    setFilters({});
    setDocuments([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  };

  const fetchDocuments = async () => {
    if (collectionName) {
      setLoading(true);
      setError(null);
      try {
        const docs = await readDocuments(collectionName, status);
        console.log('Fetched documents:', docs);
        setDocuments(docs || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err.message);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmAction = (action, message) => {
    setModalAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (collectionName) {
      const formattedRecord = {};
      for (const [key, value] of Object.entries(newRecord)) {
        if (columnDataTypes[key] === 'boolean') {
          formattedRecord[key] = value === true || value === 'true';
        } else if (columnDataTypes[key] === 'array') {
          formattedRecord[key] = value.map(item => item.value);
        } else if (columnDataTypes[key] === 'object') {
          formattedRecord[key] = value ? { value: value.value, label: value.label } : null;
        } else if (columnDataTypes[key] === 'date') {
          formattedRecord[key] = value ? new Date(value) : null;
        } else {
          formattedRecord[key] = value || null;
        }
      }
      const cleanedRecord = Object.fromEntries(
        Object.entries(formattedRecord).filter(([_, v]) => v !== undefined)
      );
      try {
        if (editMode) {
          confirmAction(() => updateDocument(collectionName, currentEditId, cleanedRecord), '?האם אתה בטוח שברצונך לערוך רשומה זו');
        } else {
          confirmAction(() => addDocument(collectionName, cleanedRecord), '?האם אתה בטוח שברצונך להוסיף רשומה זו');
        }
      } catch (err) {
        console.error(`Error ${editMode ? 'updating' : 'adding'} document:`, err);
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRecord(prevRecord => ({
      ...prevRecord,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOption, name) => {
    setNewRecord(prevRecord => ({
      ...prevRecord,
      [name]: selectedOption
    }));
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
      if (columnDataTypes[key] === 'array' && Array.isArray(formattedDoc[key])) {
        formattedDoc[key] = formattedDoc[key].map(item => ({ value: item, label: item }));
      }
    }
    setNewRecord(formattedDoc);
    setEditMode(true);
    setCurrentEditId(doc.id);
    setShowAddForm(true);
  };

  const getVolunteerNameById = (id) => {
    const volunteer = volunteers.find(vol => vol.id === id);
    return volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : id;
  };

  const getColumns = () => {
    if (documents.length === 0) return [];
    const docKeys = Object.keys(documents[0]).filter(key => key);
    return fixedColumnOrder.filter(column => docKeys.includes(column));
  };

  const getFilteredDocuments = () => {
    if (Object.keys(filters).length === 0) return documents;

    return documents.filter(doc => {
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log("Fetching data...");

    try {
      const newVolunteersRef = collection(db, 'NewVolunteers');
      const newVolunteersSnapshot = await getDocs(newVolunteersRef);
      setVolunteersThisMonth(newVolunteersSnapshot.size);
      console.log("New volunteers this month:", newVolunteersSnapshot.size);

      const totalVolunteersRef = collection(db, 'Volunteers');
      const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
      setTotalVolunteers(totalVolunteersSnapshot.size);
      console.log("Total volunteers:", totalVolunteersSnapshot.size);

      const closedRequestsRef = collection(db, 'AidRequests');
      const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'));
      const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
      setClosedRequestsThisMonth(closedRequestsSnapshot.size);
      console.log("Closed requests this month:", closedRequestsSnapshot.size);

      const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
      const openRequestsSnapshot = await getDocs(openRequestsQuery);
      setOpenRequests(openRequestsSnapshot.size);
      console.log("Open requests:", openRequestsSnapshot.size);

      const inProcessRequestsQuery = query(closedRequestsRef, where('status', '==', 'in process'));
      const inProcessRequestsSnapshot = await getDocs(inProcessRequestsQuery);
      setInProcessRequests(inProcessRequestsSnapshot.size);
      console.log("In-process requests:", inProcessRequestsSnapshot.size);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/login");
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

  const closeSignUpModal = () => {
    setSignUpModalIsOpen(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage(".הסיסמאות אינן תואמות");
      return;
    }

    const user = auth.currentUser;

    if (user && user.email === email) {
      const credential = EmailAuthProvider.credential(email, oldPassword);
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
          <Select
            options={filterOptions[column].map(item => ({ value: item, label: item }))}
            isMulti
            onChange={selectedOptions => handleFilterChange(column, selectedOptions.map(option => option.value))}
            value={(filters[column] || []).map(value => ({ value, label: value }))}
          />
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
          <button onClick={handleLogout} className="btn btn-custom">התנתק</button>
          {isSuperAdmin && (
            <button onClick={openSignUpModal} className="btn btn-custom">הוספת מנהל חדש</button>
          )}
        </div>
      </div>
      <div className="admin-container">
        <h1 className="text-center my-4">ברוכים הבאים לדף מנהל</h1>
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
              onClick={() => handleCollectionChangeRequests('AidRequests', 'close')}
              style={{
                backgroundColor: collectionName === 'AidRequests' && status === 'close' ? '#acacacba' : '#d3d3d3ba',
                color: collectionName === 'AidRequests' && status === 'close' ? '#3a3a3a' : 'black',
              }}
            >
              <h3>בקשות שנסגרו</h3>
              <p>{closedRequestsThisMonth}</p>
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
          </div>
        )}

        {collectionName && (
          <div className="admin-lists-buttons-container">
            <button className="lists-button" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'הסתר טופס' : 'הוספת רשומה'}
            </button>
          </div>
        )}
        <div className={`content ${showFilters ? 'sidebar-open' : ''}`}>
          {showAddForm && (
            <div className="add-form">
              <form onSubmit={handleAddRecord}>
                {columns.map((column) => (
                  <div key={column}>
                    <label>{getColumnDisplayName(column)}:</label>
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
                        /> לא
                      </>
                    ) : columnDataTypes[column] === 'array' ? (
                      <Select
                        name={column}
                        options={filterOptions[column].map(item => ({ value: item, label: item }))}
                        isMulti
                        value={newRecord[column] || []}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, column)}
                        placeholder={`Select ${getColumnDisplayName(column)}`}
                      />
                    ) : columnDataTypes[column] === 'object' ? (
                      <Select
                        name={column}
                        options={filterOptions[column].map(item => ({ value: item, label: item }))}
                        value={newRecord[column] || null}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, column)}
                        placeholder={`Select ${getColumnDisplayName(column)}`}
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
                      />
                    )}
                  </div>
                ))}
                <button className="lists-button" type="submit">{editMode ? 'עדכן' : 'אשר'}</button>
                {collectionName === 'NewVolunteers' && editMode && <button type="button" onClick={() => handleApproveNewVolunteer(currentEditId)}>אשר מתנדב חדש</button>}
              </form>
            </div>
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
                        {getColumnDisplayName(key)}
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
                          {Array.isArray(doc[column])
                            ? doc[column].map((item, idx) => (
                              <span key={`${doc.id}-${column}-${idx}`}>
                                {column === 'matches'
                                  ? getVolunteerNameById(item)
                                  : typeof item === 'object' && item !== null && 'label' in item
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
            !loading && <p>No documents found</p>
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
        <h2>פעולה הצליחה</h2>
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
        <h2>שינוי סיסמה</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="email"
            className="form-control mb-2"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="סיסמה ישנה"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            dir="rtl"
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="הקש שוב את סיסמתך"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            dir="rtl"
          />
          <button type="submit" className="btn btn-custom w-100 mb-2">שנה סיסמה</button>
        </form>
        {message && <p className="alert alert-custom">{message}</p>}
        <button onClick={closeModal} className="btn btn-secondary w-100">סגור</button>
      </Modal>

      <Modal
        isOpen={signUpModalIsOpen}
        onRequestClose={closeSignUpModal}
        contentLabel="Sign Up New Admin Modal"
        className={"Modal"}
      >
        <SignUpNewAdmin closeModal={closeSignUpModal} />
      </Modal>

    </div>
  );
}

export default AdminMain;
