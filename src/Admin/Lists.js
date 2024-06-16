import React, { useState, useEffect } from 'react';
import { readDocuments } from './AdminFunctions'; // Adjust the import path as necessary
import '../App.css'; // Adjust the import path as necessary
import citiesInIsrael from '../Forms/Cities.js'; // Adjust the import path as necessary
import languages from '../Forms/Languges.js'; // Adjust the import path as necessary
import days from '../Forms/Days.js'; // Adjust the import path as necessary

const availableCollections = ['test', 'testRequests']; // Add your collection names here

// Define the column name mapping function
const getColumnDisplayName = (columnName) => {
  const columnMapping = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    languages: 'שפות',
    city: 'עיר',
    days: 'ימים',
    volunteering: 'התנדבויות',
    email: 'Email',
    date: 'תאריך',
    time: 'שעה',
    comments: 'הערות',
    status: 'סטטוס'
    // Add more mappings as necessary
  };
  return columnMapping[columnName] || columnName;
};

// Define the fixed column order
const fixedColumnOrder = ['firstName', 'lastName', 'phoneNumber', 'languages', 'city', 'days', 'volunteering', 'email', 'date', 'time', 'comments', 'status'];

// Define predefined options for each filter (example)
const filterOptions = {
  city: citiesInIsrael,
  languages: languages,
  days: days
};

function Lists() {
  const [collectionName, setCollectionName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const handleCollectionChange = (event) => {
    setCollectionName(event.target.value);
    setFilters({});
    setShowFilters(false);
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

  useEffect(() => {
    if (collectionName) {
      fetchDocuments();
    }
  }, [collectionName]);

  const getColumns = () => {
    if (documents.length === 0) return [];
    const docKeys = Object.keys(documents[0]).filter(key => key !== 'id');
    // Ensure the columns appear in the fixed order if they exist in the data
    return fixedColumnOrder.filter(column => docKeys.includes(column));
  };

  const getFilteredDocuments = () => {
    if (Object.keys(filters).length === 0) return documents;
    return documents.filter(doc =>
      Object.keys(filters).every(key =>
        Object.keys(filters[key]).some(value =>
          filters[key][value] && (
            (typeof doc[key] === 'object' && doc[key] !== null && 'value' in doc[key] && doc[key].value === value) ||
            (Array.isArray(doc[key]) && doc[key].includes(value)) ||
            (typeof doc[key] === 'string' && doc[key] === value)
          )
        )
      )
    );
  };

  const columns = getColumns();
  const filteredDocuments = getFilteredDocuments();

  return (
    <div dir="rtl" className='App'>
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
        <button onClick={fetchDocuments} disabled={!collectionName}>אישור</button>
      </div>
      {collectionName && (
        <>
          <button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && (
            <div>
              {Object.keys(filterOptions).map((key) => (
                <div key={key}>
                  <label>{getColumnDisplayName(key)}:</label>
                  {filterOptions[key].map((value) => (
                    <div key={value}>
                      <input
                        type="checkbox"
                        value={value}
                        checked={filters[key]?.[value] || false}
                        onChange={(event) => handleFilterChange(event, key)}
                      />
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No documents found</p>
      )}
    </div>
  );
}

export default Lists;