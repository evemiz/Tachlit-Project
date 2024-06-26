import { db } from '../../firebaseConfig.js';
import { doc, addDoc, collection, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';

export function validateData(data) {
  const { firstName, lastName, phoneNumber, city, langueges, volunteering, date, time } = data;

  // Check required fields
  if (!firstName || !lastName || !phoneNumber || !city || !langueges || !volunteering || !date || !time) {
    alert('error');
    return false;
  }
  return true;
}



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