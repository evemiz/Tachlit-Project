import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { readDocuments, deleteDocumentByHeb, addDocumentHebEn } from './EditFunctions';
import './EditModal.css';

Modal.setAppElement('#root');

const EditModal = ({ isOpen, onRequestClose }) => {
  const [collections] = useState([
    { value: 'Volunteerings', label: 'תחומי התנדבות' },
    { value: 'VolunteeringsRequest', label: 'תחומי בקשות סיוע' },
    { value: 'Languages', label: 'שפות' },
    { value: 'Cities', label: 'ערים' }
  ]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [hebValue, setHebValue] = useState('');
  const [enValue, setEnValue] = useState('');
  const [hebError, setHebError] = useState(false);
  const [enError, setEnError] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (selectedCollection) {
        const data = await readDocuments(selectedCollection.value);
        setItems(data.map(doc => ({ value: doc.heb, label: doc.heb })));
      }
    };

    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, selectedCollection]);

  useEffect(() => {
    // Reset fields when the selected collection changes
    setSelectedItem("");
    setHebValue('');
    setEnValue('');
  }, [selectedCollection]);

  const handleDelete = async () => {
    if (selectedItem) {
      await deleteDocumentByHeb(selectedCollection.value, selectedItem.label);
      setSelectedItem(""); // Clear selection after deletion
      const data = await readDocuments(selectedCollection.value); // Refresh the list
      setItems(data.map(doc => ({ value: doc.heb, label: doc.heb })));
    }
  };

  const handleAdd = async () => {
    let valid = true;

    if (!hebValue) {
      setHebError(true);
      valid = false;
    } else {
      setHebError(false);
    }

    if (!enValue) {
      setEnError(true);
      valid = false;
    } else {
      setEnError(false);
    }

    if (valid) {
      await addDocumentHebEn(selectedCollection.value, hebValue, enValue);
      setHebValue(''); // Clear input fields after addition
      setEnValue('');
      const data = await readDocuments(selectedCollection.value); // Refresh the list
      setItems(data.map(doc => ({ value: doc.heb, label: doc.heb })));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Admin Management Modal"
      className="Edit-Modal-M"
      overlayClassName="Management-Overlay"
    >
      <button
        onClick={onRequestClose}
        style={{
          position: 'absolute',
          top: '0',
          left: '20px',
          background: 'transparent',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color:'gray',
          width: '10px'
        }}
      >
        &times;
      </button>

      <label>בחר אוסף</label>
      <Select
        name="collections"
        className="basic-multi-select"
        classNamePrefix="select"
        value={selectedCollection}
        onChange={setSelectedCollection}
        options={collections}
        placeholder="בחר אוסף"
      />

      {selectedCollection && (
        <>
          <label>{selectedCollection.label}</label>
          <Select
            name="items"
            className="basic-multi-select"
            classNamePrefix="select"
            value={selectedItem}
            onChange={setSelectedItem}
            options={items}
            placeholder={selectedCollection.label}
          />
          {selectedItem && (
            <div className="button-container">
              <button className="delete" onClick={handleDelete}>
                מחק את <span style={{ fontWeight: 'bold' }}>{selectedItem.label}</span>
              </button>
            </div>
          )}

          <div className="button-container">
            <label>הוסף פריט חדש</label>
            <input
              type="text"
              placeholder="עברית"
              value={hebValue}
              onChange={(e) => setHebValue(e.target.value)}
              className={hebError ? 'input-error' : ''}
            />
            <input
              type="text"
              placeholder="אנגלית"
              value={enValue}
              onChange={(e) => setEnValue(e.target.value)}
              className={enError ? 'input-error' : ''}
            />
            <button onClick={handleAdd}>הוסף</button>

            {selectedCollection.value == "Volunteerings" && (
            <label style={{
              fontSize: '16px',
              color: '#333',
              backgroundColor: '#f9f9f9',
              padding: '10px 20px',
              margin: '10px 0',
              display: 'inline-block',
              fontFamily: 'Arial, sans-serif',
              color: 'gray'
              }}>
            תזכורת: ערוך בהתאם את תחומי בקשות הסיוע
        </label>
          )}
          {selectedCollection.value == "VolunteeringsRequest" && (
            <label style={{
              fontSize: '16px',
              color: '#333',
              backgroundColor: '#f9f9f9',
              padding: '10px 20px',
              margin: '10px 0',
              display: 'inline-block',
              fontFamily: 'Arial, sans-serif',
              color: 'gray'
              }}>
            תזכורת: ערוך בהתאם את תחומי ההתנדבות 
        </label>
          )}
          
          </div>
        </>
      )}
    </Modal>
  );
};

export default EditModal;
