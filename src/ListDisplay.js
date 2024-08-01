import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Admin/List.css';

const ListDisplay = ({ collectionName, status }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let q;
      if (status) {
        q = query(collection(db, collectionName), where('status', '==', status));
      } else {
        q = query(collection(db, collectionName));
      }
      const querySnapshot = await getDocs(q);
      const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(dataList);
    };
    fetchData();
  }, [collectionName, status]);

  const renderTableHeader = () => {
    if (items.length === 0) return null;
    const headers = Object.keys(items[0]);
    return (
      <tr>
        {headers.map((key, index) => (
          <th key={index}>{getColumnDisplayName(key)}</th>
        ))}
      </tr>
    );
  };

  const renderTableBody = () => {
    return items.map((item, index) => (
      <tr key={index}>
        {Object.values(item).map((value, index) => (
          <td key={index}>
            {Array.isArray(value)
              ? value.join(', ')
              : typeof value === 'boolean'
              ? value ? '✓' : '✗'
              : value}
          </td>
        ))}
      </tr>
    ));
  };

  const getColumnDisplayName = (columnName) => {
    const columnMapping = {
      firstName: 'שם פרטי',
      lastName: 'שם משפחה',
      phoneNumber: 'מספר טלפון',
      languages: 'שפות',
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
    };
    return columnMapping[columnName] || columnName;
  };

  return (
    <div className="List">
      <div className="table-container">
        <h3 className="mb-4">רשימת {collectionName}</h3>
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            {renderTableHeader()}
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListDisplay;
