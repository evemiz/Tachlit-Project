import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import './List.css';
import './SignUpNewAdmin';

Modal.setAppElement('#root');

const AdminManagementModal = ({ isOpen, onRequestClose, openSignUpModal }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminsSnapshot = await getDocs(q);
        const adminsList = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen]);

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteDoc(doc(db, 'users', adminId));
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminId));
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Admin Management Modal"
      className="Management-Modal"
      overlayClassName="Management-Overlay"
    >
      <button
        onClick={onRequestClose}
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
      <h2>ניהול מנהלים</h2>
      <button onClick={openSignUpModal} className="btn btn-custom">הוסף מנהל חדש</button>
      {loading ? (
        <p>טוען...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>שגיאה: {error}</p>
      ) : (
        <div className="Management-table-responsive">
          <table className="Management-table">
            <thead className="management">
              <tr className="management">
                <th className="management">אימייל</th>
                <th className="management">סופר אדמין</th>
                <th className="management">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="management">{admin.id}</td>
                  <td className="management">{admin.superAdmin ? 'כן' : 'לא'}</td>
                  <td className="management">
                    <button className="buttons-inside-table" onClick={() => handleDeleteAdmin(admin.id)}>מחק</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default AdminManagementModal;
