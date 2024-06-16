// import React, { useState, useEffect } from 'react';
// import { readDocuments } from './AdminFunctions'; // Adjust the import path as necessary
// import '../App.css'; // Adjust the import path as necessary

// const availableCollections = ['test', 'testRequests']; // Add your collection names here

// // Define the column name mapping function
// const getColumnDisplayName = (columnName) => {
//   const columnMapping = {
//     firstName: 'שם פרטי',
//     lastName: 'שם משפחה',
//     phoneNumber: 'מספר טלפון',
//     langueges: 'שפות',
//     city: 'עיר',
//     days: 'ימים',
//     volunteering: 'התנדבויות',
//     email: 'Email',
//     date: 'תאריך',
//     time: 'שעה',
//     comments: 'הערות',
//     status: 'סטטוס',
//     emergency: 'זמינות לחירום',
//     vehicle: 'רכב',

//     // Add more mappings as necessary
//   };
//   return columnMapping[columnName] || columnName;
// };


// // Define the fixed column order
// const fixedColumnOrder = ['firstName', 'lastName', 'phoneNumber', 'langueges', 'city', 'days', 'volunteering', 'email', 'date', 'time', 'comments', 'status','emergency','vehicle'];

// function Lists() {
//   const [collectionName, setCollectionName] = useState(availableCollections[0]);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleCollectionChange = (event) => {
//     setCollectionName(event.target.value);
//   };

//   const fetchDocuments = async () => {
//     if (collectionName) {
//       setLoading(true);
//       setError(null);
//       try {
//         const docs = await readDocuments(collectionName);
//         console.log('Fetched documents:', docs); // Debug log
//         setDocuments(docs || []); // Ensure docs is an array
//       } catch (err) {
//         console.error('Error fetching documents:', err);
//         setError(err.message);
//         setDocuments([]); // Reset documents on error
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchDocuments();
//   }, [collectionName]);

//   const getColumns = () => {
//     if (documents.length === 0) return [];
//     const docKeys = Object.keys(documents[0]).filter(key => key !== 'id');
//     // Ensure the columns appear in the fixed order if they exist in the data
//     return fixedColumnOrder.filter(column => docKeys.includes(column));
//   };

//   const columns = getColumns();

//   return (
//     <div dir="rtl">
//       <h1>צפייה ברשימות</h1>
//       <div>
//         <label>
//           :בחר רשימה
//           <select value={collectionName} onChange={handleCollectionChange}>
//             {availableCollections.map((collection) => (
//               <option key={collection} value={collection}>
//                 {collection}
//               </option>
//             ))}
//           </select>
//         </label>
//         <button onClick={fetchDocuments}>אישור</button>
//       </div>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
//       {documents.length > 0 ? (
//         <div className="table-container">
//           <table className="table">
//             <thead>
//               <tr>
//                 {columns.map((key) => (
//                   <th key={key}>{getColumnDisplayName(key)}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {documents.map((doc, index) => (
//                 <tr key={index}>
//                   {columns.map((column) => (
//                     <td key={column}>
//                       {Array.isArray(doc[column])
//                         ? doc[column].map(item =>
//                             typeof item === 'object' && item !== null && 'label' in item
//                               ? item.label
//                               : item
//                           ).join(', ')
//                         : typeof doc[column] === 'boolean'
//                         ? doc[column] ? '✓' : '✗'
//                         : typeof doc[column] === 'object' && doc[column] !== null && 'label' in doc[column]
//                         ? doc[column].label
//                         : typeof doc[column] === 'object'
//                         ? JSON.stringify(doc[column])
//                         : doc[column]}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         !loading && <p>No documents found</p>
//       )}
//     </div>
//   );
// }

// export default Lists;