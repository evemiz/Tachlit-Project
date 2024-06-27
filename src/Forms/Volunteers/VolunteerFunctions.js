import { doc, addDoc, collection, deleteDoc, getDocs, getDoc ,setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

export function validateData(data) {
  const { firstName, lastName, phoneNumber, city, langueges, days, volunteering } = data;

  // Check required fields
  if (!firstName || !lastName || !phoneNumber || !city) {
    return false;
  }

  // Check if at least one language is selected
  if (!langueges.some(lang => lang)) {
    return false;
  }

  // Check if at least one day is selected
  if (!days.some(day => day)) {
    return false;
  }

  // Check if volunteering options are selected
  if (!volunteering.some(option => option)) {
    return false;
  }

  return true;
}

// Function to add or update a document with a specific ID
export const setDocumentWithId = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
    console.log("Document written with ID: ", docId);
  } catch (error) {
    console.error("Error adding/updating document: ", error);
  }
};


// Function to read documents from a collection
export const readDocuments = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => doc.dataV());
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
};

export const readDocument = async (collectionName, documentId) => {
  try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
          return docSnap.data();
      } else {
          console.log("No such document!");
          return null;
      }
  } catch (error) {
      console.error("Error getting document:", error);
      throw error;
  }
};


// Function to add a document to a collection with a custom ID (if provided)
export const addDocument = async (collectionName, data) => {
    if(!validateData(data))
        console.error('Invalid data');
    else{
        try {
          const docId = data.id;
          if (!docId) {
              console.error('Document ID is missing in the data');
              return null;
          }

          // Create a document reference with the custom ID
          const docRef = doc(collection(db, collectionName), docId);

          // Use setDoc to create the document with the specified ID and data
          await setDoc(docRef, data);
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

// Function to fetch a specific document from a collection
export const getDocumentById = async (collectionName, docId) => {
  try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
          // Return the document data
          return { id: docSnap.id, ...docSnap.data() };
      } else {
          console.log("No such document!");
          return null;
      }
  } catch (error) {
      console.error("Error getting document:", error);
      throw error; // Optionally re-throw the error for higher-level handling
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