import { doc, addDoc, collection, deleteDoc, getDocs,setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

export function validateData(data) {
  return true;
  //...
}



// Function to read documents from a collection
export const readDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents: ", error);
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



// Function to update a document in a collection
export const updateDocument = async (collection, docId, data) => {
    //...
};