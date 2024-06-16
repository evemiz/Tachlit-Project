import React, { useState, useEffect } from 'react';
import { readDocuments } from './AdminFunctions'; // Adjust the import path as necessary
import '../App.css'; // Adjust the import path as necessary

const availableCollections = ['test', 'testRequests']; // Add your collection names here
const columnOrder1 = ['firstName', 'lastName', 'phoneNumber', 'langueges','city','days','volunteering','email',];
const columnOrder2 = ['firstName', 'lastName', 'phoneNumber', 'langueges','city','date','volunteering','time','comments','status'];
const columnMapping1 = {
  firstName: 'שם פרטי',
  lastName: 'שם משפחה',
  phoneNumber: 'מספר טלפון',
  langueges: 'שפות',
  city: 'עיר',
  days: 'ימים',
  volunteering: 'התנדבויות'
  };

  const columnMapping2 = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    langueges: 'שפות',
    city: 'עיר',
    date: 'תאריך',
    volunteering: 'סוג ההתנדבות',
    time: 'שעה',
    comments: 'הערות',
    status: 'סטטוס'

    };

  function Lists() {
    const [collectionName, setCollectionName] = useState(availableCollections[0]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCollectionChange = (event) => {
      setCollectionName(event.target.value);
    };
    if(collectionName === 'testRequests'){
      var columnMapping = columnMapping2;
      var columnOrder = columnOrder2;
    }
    else{var columnMapping = columnMapping1;
         var columnOrder = columnOrder1;
    }

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
      fetchDocuments();
    }, [collectionName]);

    const getColumns = () => {
      if (documents.length === 0) return [];
      const docKeys = Object.keys(documents[0]).filter(key => key !== 'id');
      return columnOrder.filter(column => docKeys.includes(column));
    };

    const columns = getColumns();

    return (
      <div dir="rtl">
        <h1>Firestore Collections</h1>
        <div>
          <label>
            Select collection:
            <select value={collectionName} onChange={handleCollectionChange}>
              {availableCollections.map((collection) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </label>
          <button onClick={fetchDocuments}>Fetch Documents</button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {documents.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                {columns.map((key) => (
                  <th key={key}>{columnMapping[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column}>
                      {Array.isArray(doc[column])
                        ? doc[column].map(item =>
                            typeof item === 'object' && item !== null && 'label' in item
                              ? item.label
                              : item
                          ).join(', ')
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
        ) : (
          !loading && <p>No documents found</p>
        )}
      </div>
    );
  }

  export default Lists;