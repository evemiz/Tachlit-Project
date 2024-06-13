import { db } from './firebaseConfig';
import { doc, addDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';

export const data = {
    name: '', 
    phoneNumber: '', 
    city: '',
    langueges: [true, false, false, false, false], //[hebrew, english, french, russian, spanish]
    days: [false, false, false, false, false, false, false],
    emergency: false,
    volunteering : [false, false, false, false, false, false], //[conveyance, Visiting the sick, Patient transportation, Office volunteering, Physical volunteering, food packaging]
    vehicle: false
};

const validateData = (data) => {
    // Check if all fields are present and have the correct types
    if (
      typeof data.name !== 'string' ||
      typeof data.phoneNumber !== 'string' ||
      typeof data.city !== 'string' ||
      !data.name.trim() || // Check if name is not empty after trimming whitespace
      !data.phoneNumber.trim() || // Check if phoneNumber is not empty after trimming whitespace
      !data.city.trim() || // Check if city is not empty after trimming whitespace
      !Array.isArray(data.langueges) ||
      data.langueges.length !== 5 || // Ensure exactly 5 elements
      !Array.isArray(data.days) ||
      data.days.length !== 7 || // Ensure exactly 7 elements
      typeof data.emergency !== 'boolean' ||
      !Array.isArray(data.volunteering) ||
      data.volunteering.length !== 6 || // Ensure exactly 6 elements
      typeof data.vehicle !== 'boolean'
    ) {
      return false; // Missing fields, incorrect types, or empty strings
    }
  
    // Check if the elements in 'langueges', 'days', and 'volunteering' arrays are boolean
    if (
      !data.langueges.every(item => typeof item === 'boolean') ||
      !data.days.every(item => typeof item === 'boolean') ||
      !data.volunteering.every(item => typeof item === 'boolean')
    ) {
      return false; // Arrays contain non-boolean elements
    }
  
    return true;
  };


// Function to read documents from a collection
export const readDocuments = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
};
  
  
// Function to add a document to a collection with a custom ID (if provided)
export const addDocument = async (collectionName, data) => {
    if(!validateData(data))
        console.error('Invalid data');
    else{
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            console.log("Document written with ID: ", docRef.id);
            return docRef;
          } catch (error) {
            console.error("Error adding document: ", error);
          }
    }
};


// Function to delete a document from a collection
export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    console.log("Document deleted with ID: ", id);
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false;
  }
};





// TODO: make it work
// Function to update a document in a collection
export const updateDocument = async (collection, docId, data) => {
    if(!validateData(data))
        console.error('Invalid data');
    else{
        try {
            await db.collection(collection).doc(docId).update(data);
            console.log("Document updated with ID: ", docId);
          } catch (error) {
            console.error("Error updating document: ", error);
          }
    }
};
