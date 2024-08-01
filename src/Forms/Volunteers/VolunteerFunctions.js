import { doc, addDoc, collection, deleteDoc, getDocs, getDoc ,setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

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
        try {
          const docId = data.ID;
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


// Function to check if a document with a specific ID exists in a collection
export const doesDocumentExist = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`Document with ID: ${docId} exists in collection: ${collectionName}`);
      return true;
    } else {
      console.log(`No document with ID: ${docId} found in collection: ${collectionName}`);
      return false;
    }
  } catch (error) {
    console.error("Error checking document existence: ", error);
    throw error;
  }
};