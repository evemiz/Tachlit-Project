import { doc, addDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { query, where } from "firebase/firestore";


export const deleteDocumentByHeb = async (collectionName, hebValue) => {
    try {
      const q = query(collection(db, collectionName), where("heb", "==", hebValue));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, collectionName, document.id));
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
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

// Function to add a document with 'heb' and 'en' fields
export const addDocumentHebEn = async (collectionName, hebValue, enValue) => {
    try {
      await addDoc(collection(db, collectionName), {
        heb: hebValue,
        en: enValue
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  export const getHebValueByEn = async (collectionName, enValue) => {
    try {
      const q = query(collection(db, collectionName), where("en", "==", enValue));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Assuming there's only one matching document, you can adjust if needed
        const document = querySnapshot.docs[0].data();
        return document.heb || enValue; // Return the Hebrew value if it exists, otherwise an empty string
      } else {
        console.warn(`No document found with English value: ${enValue}`);
        return enValue; // Return an empty string if no document is found
      }
    } catch (error) {
      console.error("Error getting Hebrew value: ", error);
      return ''; // Return an empty string in case of error
    }
  };

  export const getEnValueByHeb = async (collectionName, hebValue) => {
    console.log(collectionName);
    console.log(hebValue);
    try {
      const q = query(collection(db, collectionName), where("heb", "==", hebValue));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0].data();
        return document.en || hebValue; // Return the Hebrew value if it exists, otherwise an empty string
      } else {
        console.warn(`No document found with Hebrew value: ${hebValue}`);
        return hebValue; // Return an empty string if no document is found
      }
    } catch (error) {
      console.error("Error getting Hebrew value: ", error);
      return ''; // Return an empty string in case of error
    }
  };

  export const getDocumentByHeb = (collectionName, hebValue) => {
    try {
        const q = query(collection(db, collectionName), where('heb', '==', hebValue));
        const querySnapshot = getDocs(q);
        if (querySnapshot.empty) {
            return hebValue;
        }
        // Assuming only one document should be returned
        const doc = querySnapshot.docs[0].data();
        console.log(doc.en);
        return doc.en;
    } catch (error) {
        console.error(`Error fetching document from ${collectionName}:`, error);
        return hebValue;; // Or handle the error as needed
    }
};