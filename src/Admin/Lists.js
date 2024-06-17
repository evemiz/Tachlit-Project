import React, { useState, useEffect } from 'react';
import { readDocuments } from './AdminFunctions'; // Adjust the import path as necessary
import './List.css'; // Adjust the import path as necessary
import citiesInIsrael from '../Forms/Cities.js'; // Adjust the import path as necessary
import languages from '../Forms/Languges.js'; // Adjust the import path as necessary
import days from '../Forms/Days.js'; // Adjust the import path as necessary
import FilterSidebar from './FilterSidebar'; // Import the new FilterSidebar component

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
    status: 'סטטוס'
    // Add more mappings as necessary
  };
  return columnMapping[columnName] || columnName;
};

// Define the fixed column order
const fixedColumnOrder = ['firstName', 'lastName', 'phoneNumber', 'langueges', 'city', 'days', 'volunteering', 'email', 'date', 'time', 'comments', 'status'];

// Define predefined options for each filter (example)
const filterOptions = {
  city: citiesInIsrael,
  langueges: languages,
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

  console.log('Filtered Documents:', filteredDocuments);

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
        <button className="lists-button" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'הסתר סינון' : 'סנן'}
        </button>
      )}
      <div className={`content ${showFilters ? 'sidebar-open' : ''}`}>
        <FilterSidebar
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          showFilters={showFilters}
        />
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
    </div>
  );
}

export default Lists;