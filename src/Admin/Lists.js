import React, { useState, useEffect } from 'react';
import { readDocuments, addDocument, deleteDocument } from './AdminFunctions'; // Adjust the import path as necessary
import './List.css'; // Adjust the import path as necessary
import citiesInIsrael from '../Forms/Cities.js'; // Adjust the import path as necessary
import languages from '../Forms/Languges.js'; // Adjust the import path as necessary
import days from '../Forms/Days.js'; // Adjust the import path as necessary
import volunteering from '../Forms/Volunteerings.js'; // Adjust the import path as necessary

import FilterSidebar from './FilterSidebar'; // Import the new FilterSidebar component
import Select from 'react-select'; // Import react-select for dropdowns

const availableCollections = ['test', 'testRequests']; // Add your collection names here

const getColumnDisplayName = (columnName) => {
  const columnMapping = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    langueges: 'שפות',
    city: 'עיר',
    days: 'ימים',
    volunteering: 'התנדבויות',
    email: 'Email',
    date: 'תאריך',
    time: 'שעה',
    comments: 'הערות',
    status: 'סטטוס',
    emergency: 'חירום',
    vehicle: 'רכב'
    // Add more mappings as necessary
  };
  return columnMapping[columnName] || columnName;
};

// Define the fixed column order
const fixedColumnOrder = ['firstName', 'lastName', 'phoneNumber', 'langueges', 'city', 'days', 'volunteering', 'email', 'date', 'time', 'comments', 'status', 'emergency', 'vehicle'];

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
  city: 'object',
  days: 'array',
  volunteering: 'array',
  email: 'string',
  date: 'date',
  time: 'string',
  comments: 'string',
  status: 'string',
  vehicle: 'boolean',
  emergency: 'boolean'
};

function Lists() {
  const [collectionName, setCollectionName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({});

  const handleCollectionChange = (event) => {
    setCollectionName(event.target.value);
    setFilters({});
    setDocuments([]); // Clear previous documents when collection changes
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
        const docs = await readDocuments(collectionName);
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

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (collectionName) {
      // Convert newRecord to match the expected data types
      const formattedRecord = {};
      for (const [key, value] of Object.entries(newRecord)) {
        if (columnDataTypes[key] === 'boolean') {
          formattedRecord[key] = value === 'true';
        } else if (columnDataTypes[key] === 'array') {
          formattedRecord[key] = value.map(item => item.value); // Ensure the value is an array of selected options
        } else if (columnDataTypes[key] === 'object') {
          formattedRecord[key] = { value: value.value, label: value.label };
        } else if (columnDataTypes[key] === 'date') {
          formattedRecord[key] = new Date(value);
        } else {
          formattedRecord[key] = value;
        }
      }
      try {
        const result = await addDocument(collectionName, formattedRecord);
        if (result) {
          setNewRecord({});
          fetchDocuments(); // Refresh the document list
          setShowAddForm(false); // Hide the form after adding the record
        }
      } catch (err) {
        console.error('Error adding document:', err);
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

  const handleDeleteRecord = async (id) => {
    if (collectionName) {
      const confirmDelete = window.confirm('Are you sure you want to delete this record?');
      if (confirmDelete) {
        try {
          await deleteDocument(collectionName, id);
          fetchDocuments(); // Refresh the document list after deletion
        } catch (err) {
          console.error('Error deleting document:', err);
        }
      }
    }
  };

  const getColumns = () => {
    if (documents.length === 0) return [];
    const docKeys = Object.keys(documents[0]).filter(key => key !== 'id');
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

  return (
    <div dir="rtl" className='List'>
      <h1>צפייה ברשימות</h1>
      <div>
        <label>
          :בחר רשימה
          <select value={collectionName} onChange={handleCollectionChange}>
            <option value=""> </option>
            {availableCollections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </label>
        <button className="lists-button" onClick={fetchDocuments} disabled={!collectionName}>אישור</button>
      </div>
      {collectionName && (
        <>
          <button className="lists-button" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'הסתר סינון' : 'סנן'}
          </button>
          <button className="lists-button" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'הסתר טופס' : 'הוסף'}
          </button>
        </>
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
                        checked={newRecord[column] === 'true'}
                        onChange={handleInputChange}
                      /> כן
                      <input
                        type="radio"
                        name={column}
                        value="false"
                        checked={newRecord[column] === 'false'}
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
              <button className="lists-button" type="submit">אשר</button>
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
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column}>
                        {Array.isArray(doc[column])
                          ? doc[column].map(item =>
                              typeof item === 'object' && item !== null && 'label' in item
                                ? item.label
                                : item
                            ).join(', ')
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
                      <button onClick={() => handleDeleteRecord(doc.id)}>מחק</button>
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
  );
}

export default Lists;
