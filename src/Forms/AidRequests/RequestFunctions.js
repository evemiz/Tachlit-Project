import { db } from '../../firebaseConfig.js';
import { doc, addDoc, collection, deleteDoc, getDocs, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

// Function to read documents from a collection
export const readDocuments = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => doc.dataV());
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
};


// Function to add a document to a collection with a custom ID (if provided)
export const addDocument = async (collectionName, data) => {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
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

// Function to add a field to a specific document in a collection
export const addFieldToDocument = async (collectionName, documentId, fieldName, fieldValue) => {
  try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
          [fieldName]: fieldValue
      });
      console.log(`Field '${fieldName}' added to document '${documentId}' in collection '${collectionName}'`);
      return true;
  } catch (error) {
      console.error("Error adding field to document: ", error);
      return false;
  }
};

export const addMatchToDocument = async (collectionName, documentId, fieldValue) => {
  try {
    const docRef = doc(db, collectionName, documentId);

    // Get the document to check if the 'matches' field exists
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      if (docData.matches) {
        // If the 'matches' field exists, add the value to the array
        await updateDoc(docRef, {
          matches: arrayUnion(fieldValue)
        });
      } else {
        // If the 'matches' field does not exist, create it and set the value
        await updateDoc(docRef, {
          matches: [fieldValue]
        });
      }
    } 
    return true;
  } catch (error) {
    console.error("Error adding field to document: ", error);
    return false;
  }
};

