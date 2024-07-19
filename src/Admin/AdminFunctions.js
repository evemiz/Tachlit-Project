import { doc, addDoc, collection, deleteDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { doc as doc1, getDoc as getDoc1 } from 'firebase/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig.js'; // Adjust the import path as necessary

export function validateData(data) {
  return true;
  //...
}

// Function to read documents from a collection
export const readDocuments = async (collectionName, status) => {
  try {
    let collectionRef = collection(db, collectionName);

    if (status !== "") {
      collectionRef = query(collectionRef, where("status", "==", status));
    }

    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
};

// Function to add a document to a collection
export const addDocument = async (collectionName, data, customId = null) => {
  if (!validateData(data)) {
    console.error('Invalid data');
  } else {
    try {
      let docRef;
      if (customId) {
        // Create a document reference with the custom ID
        docRef = doc(collection(db, collectionName), customId);
        await setDoc(docRef, data);
      } else {
        // Use addDoc to let Firestore generate a unique ID
        docRef = await addDoc(collection(db, collectionName), data);
      }
      console.log("Document written with ID: ", docRef.id);
      return docRef;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
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
export const updateDocument = async (collectionName, docId, data) => {
  if (!validateData(data)) {
    console.error('Invalid data');
  } else {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      console.log("Document updated with ID: ", docId);
      return docRef;
    } catch (error) {
      console.error("Error updating document: ", error);
      throw error;
    }
  }
};

// Function to move a document from one collection to another
export const MoveDoc = async (docId) => {
  try {
    const docRef = doc1(db, 'NewVolunteers', docId);
    const docSnap = await getDoc1(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();

      // Add the document to the Volunteers collection
      await addDocument('Volunteers', { ...docData, id: docId });

      // Delete the document from the NewVolunteers collection
      await deleteDocument('NewVolunteers', docId);

      console.log("Document moved from NewVolunteers to Volunteers with ID: ", docId);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error moving document: ", error);
  }
};

// Function to send approval email
export const sendApprovalEmail = async (email, volunteerId) => {
  const actionCodeSettings = {
    url: `https://your-app-url.com/VolunteerRegister/${volunteerId}`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    console.log("קישור להגדרת סיסמה נשלח לאימייל של המתנדב החדש.");
  } catch (error) {
    console.error("Error sending sign-in link:", error.code, error.message);
    throw error;
  }
};
