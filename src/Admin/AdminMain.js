import React, { useState, useEffect } from "react";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Modal from 'react-modal';
import '../custom.css';
import '../navbar.css'; // ייבוא CSS מותאם אישית
import { useNavigate } from "react-router-dom";
import Navbar from "./AdminNavigateBar"; // ייבוא הרכיב של הניווט
import ListDisplay from '../ListDisplay'; // ייבוא רכיב להצגת הרשימות
import SignUpNewAdmin from './SignUpNewAdmin'; // עדכון לשם נכון
import { readDocuments, addDocument, deleteDocument, updateDocument } from './AdminFunctions'; // Adjust the import path as necessary
import { handleApproveVolunteer } from './handleApproveVolunteer'; // Adjust the import path as necessary
import citiesInIsrael from '../Forms/Cities.js'; // Adjust the import path as necessary
import languages from '../Forms/Languges.js'; // Adjust the import path as necessary
import days from '../Forms/Days.js'; // Adjust the import path as necessary
import volunteering from '../Forms/Volunteerings.js'; // Adjust the import path as necessary
import FilterSidebar from './FilterSidebar'; // Import the new FilterSidebar component
import Select from 'react-select'; // Import react-select for dropdowns
import '@fontsource/rubik';


const getColumnDisplayName = (columnName) => {
  const columnMapping = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    langueges: 'שפות',
    id: 'ת.ז.',
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
const fixedColumnOrder = ['firstName', 'lastName', 'id', 'phoneNumber', 'langueges', 'city', 'days', 'volunteering', 'mail', 'date', 'time', 'comments', 'status', 'emergency', 'vehicle', 'matches']; // Added 'matches'

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
  id: 'string',
  matches: 'array' // Added 'matches'
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
  const [selectedList, setSelectedList] = useState(null); // סטייט להצגת הרשימה הנבחרת
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

  useEffect(() => {
    // Fetch all volunteers' data
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
    setDocuments([]); // Clear previous documents when collection changes
  };

  const handleCollectionChangeRequests = (name, status) => {
    setCollectionName(name);
    setStatus(status);
    setFilters({});
    setDocuments([]);
  };

  const handleFilterChange = (event, key) => {
    const { value, checked } = event.target;
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (!newFilters[key]) {
        newFilters[key] = {};
      }
      if (checked) {
        newFilters[key][value] = true;
      } else {
        delete newFilters[key][value];
        if (Object.keys(newFilters[key]).length === 0) {
          delete newFilters[key];
        }
      }
      console.log('Updated Filters:', newFilters);
      return newFilters;
    });
  };

  const fetchDocuments = async () => {
    if (collectionName) {
      setLoading(true);
      setError(null);
      try {
        const docs = await readDocuments(collectionName, status);
        console.log('Fetched documents:', docs); // Debug log
        setDocuments(docs || []); // Ensure docs is an array
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err.message);
        setDocuments([]); // Reset documents on error
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
      // Convert newRecord to match the expected data types
      const formattedRecord = {};
      for (const [key, value] of Object.entries(newRecord)) {
        if (columnDataTypes[key] === 'boolean') {
          formattedRecord[key] = value === true || value === 'true';
        } else if (columnDataTypes[key] === 'array') {
          formattedRecord[key] = value.map(item => item.value); // Ensure the value is an array of selected options
        } else if (columnDataTypes[key] === 'object') {
          formattedRecord[key] = value ? { value: value.value, label: value.label } : null;
        } else if (columnDataTypes[key] === 'date') {
          formattedRecord[key] = value ? new Date(value) : null;
        } else {
          formattedRecord[key] = value || null; // Handle undefined values
        }
      }
      // Filter out undefined values
      const cleanedRecord = Object.fromEntries(
        Object.entries(formattedRecord).filter(([_, v]) => v !== undefined)
      );
      try {
        if (editMode) {
          confirmAction(() => updateDocument(collectionName, currentEditId, cleanedRecord), '?האם אתה בטוח שברצונך לערוך רשומה זו');
        } else {
          confirmAction(() => addDocument(collectionName, cleanedRecord),  '?האם אתה בטוח שברצונך להוסיף רשומה זו');
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
    // Convert arrays back to the format expected by react-select
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
    // Ensure the columns appear in the fixed order if they exist in the data
    return fixedColumnOrder.filter(column => docKeys.includes(column));
  };

  const getFilteredDocuments = () => {
    if (Object.keys(filters).length === 0) return documents;

    return documents.filter(doc => {
      return Object.keys(filters).every(key => {
        if (!filters[key] || Object.keys(filters[key]).length === 0) return true;

        const docValue = doc[key];
        if (Array.isArray(docValue)) {
          return Object.keys(filters[key]).some(filterValue => filters[key][filterValue] && docValue.includes(filterValue));
        } else if (typeof docValue === 'object' && docValue !== null) {
          return Object.keys(filters[key]).some(filterValue => filters[key][filterValue] && docValue.value === filterValue);
        } else {
          return Object.keys(filters[key]).some(filterValue => filters[key][filterValue] && String(docValue) === filterValue);
        }
      });
    });
  };

  const columns = getColumns();
  const filteredDocuments = getFilteredDocuments();

  const handleModalConfirm = async () => {
    await modalAction();
    setIsModalOpen(false);
    fetchDocuments(); // Refresh documents after action
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
      // מתנדבים שנוספו החודש
      const newVolunteersRef = collection(db, 'NewVolunteers');
      const newVolunteersSnapshot = await getDocs(newVolunteersRef);
      setVolunteersThisMonth(newVolunteersSnapshot.size);
      console.log("New volunteers this month:", newVolunteersSnapshot.size);

      // סך כל המתנדבים
      const totalVolunteersRef = collection(db, 'Volunteers');
      const totalVolunteersSnapshot = await getDocs(totalVolunteersRef);
      setTotalVolunteers(totalVolunteersSnapshot.size);
      console.log("Total volunteers:", totalVolunteersSnapshot.size);

      // בקשות שנסגרו החודש
      const closedRequestsRef = collection(db, 'AidRequests');
      const closedRequestsQuery = query(closedRequestsRef, where('status', '==', 'close'));
      const closedRequestsSnapshot = await getDocs(closedRequestsQuery);
      setClosedRequestsThisMonth(closedRequestsSnapshot.size);
      console.log("Closed requests this month:", closedRequestsSnapshot.size);

      // בקשות פתוחות
      const openRequestsQuery = query(closedRequestsRef, where('status', '==', 'open'));
      const openRequestsSnapshot = await getDocs(openRequestsQuery);
      setOpenRequests(openRequestsSnapshot.size);
      console.log("Open requests:", openRequestsSnapshot.size);

      // בקשות בטיפול
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

  return (
    <div className="AdminMainPage">
      <div className="navbar-custom">
        <div className="navbar-logo">
          <a href="/AdminMain">
            <img src="/tachlitLOGO.png" alt="Logo" className="navbar-logo" />
          </a>
        </div>
        <div className="navbar-buttons">
          <button onClick={openModal} className="btn btn-custom">שנה סיסמא</button>
          <button onClick={handleLogout} className="btn btn-custom">התנתק</button>
          <button onClick={openSignUpModal} className="btn btn-custom">הוספת מנהל חדש</button>
        </div>
      </div>
      <div className="container">
        <h1 className="text-center my-4">ברוכים הבאים לדף מנהל</h1>
        <div className="topBar"></div>

        {selectedList ? (
          <ListDisplay collectionName={selectedList.collectionName} status={selectedList.status} />
        ) : (
          <div className="dashboard">
            <div className="dashboard-item" onClick={() => handleCollectionChange('NewVolunteers')}>
              <h3>מתנדבים ממתינים לאישור</h3>
              <p>{volunteersThisMonth}</p>
            </div>
            <div className="dashboard-item" onClick={() => handleCollectionChange('Volunteers')}>
              <h3>סך כל המתנדבים</h3>
              <p>{totalVolunteers}</p>
            </div>
            <div className="dashboard-item" onClick={() => handleCollectionChangeRequests('AidRequests', 'close')}>
              <h3>בקשות שנסגרו</h3>
              <p>{closedRequestsThisMonth}</p>
            </div>
            <div className="dashboard-item" onClick={() => handleCollectionChangeRequests('AidRequests', 'open')}>
              <h3>בקשות פתוחות</h3>
              <p>{openRequests}</p>
            </div>
            <div className="dashboard-item" onClick={() => handleCollectionChangeRequests('AidRequests', 'in process')}>
              <h3>בקשות בטיפול</h3>
              <p>{inProcessRequests}</p>
            </div>
          </div>
        )}

      {collectionName && (
        <div className="admin-lists-buttons-container">
          <button className="lists-button" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'הסתר סינון' : 'סנן'}
          </button>
          <button className="lists-button" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'הסתר טופס' : 'הוספת רשומה'}
          </button>
        </div>
      )}
      <div className={`content ${showFilters ? 'sidebar-open' : ''}`}>
        <FilterSidebar
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          showFilters={showFilters}
        />
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
                    <th key={key}>{getColumnDisplayName(key)}</th>
                  ))}
                  <th>פעולות</th> {/* Add column for actions */}
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <tr key={doc.id || index}> {/* Ensure each row has a unique key */}
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

        <div className='pageEnd'>
          <h2>חזרה לעמוד הבית</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminMain;
